/**
 * The shop floor. A cutaway record store in three.js: crates of new releases, a listening booth,
 * an awards wall, a notice board and the counter. Every object is a way into the portfolio; the
 * camera walks to whatever you pick. Vanilla three.js on GSAP's ticker, one rAF for the page.
 * The page always scrolls: the scene never listens to the wheel.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import gsap from "gsap";
import { DISC, bandAt, bands, fontsReady, grooves, label, sleeve, fontFamily, type Band } from "../store/press";

export type Station = "floor" | "crates" | "booth" | "wall" | "board" | "counter";

export type RecordSpec = {
  id: string;
  title: string;
  cat: string;
  sleeve: string;
  ink: string;
  label: string;
  labelInk: string;
  runout: string;
  img?: string;
  line?: string;
  bars?: number[];
  weights: number[];
  intensity: number[];
};

export type ShopEvents = {
  /** Something under the pointer: a station name or a record, with a short caption. */
  onHover: (caption: string | null, x: number, y: number) => void;
  onStation: (s: Station, detail?: number) => void;
  /** The record on the platter changed (index into records; 0 is the house record). */
  onPlatter: (i: number) => void;
  onTrack: (t: number) => void;
};

type Pressed = { root: THREE.Group; spin: THREE.Group; disc: THREE.Mesh; bands: Band[]; dispose: () => void };

const VIEWS: Record<Station, { pos: [number, number, number]; look: [number, number, number] }> = {
  floor: { pos: [11.8, 9.8, 13.8], look: [0.7, 1.3, -1.0] },
  crates: { pos: [-0.6, 5.2, 7.4], look: [-0.9, 1.4, 0.0] },
  booth: { pos: [3.7, 2.9, 1.2], look: [2.4, 1.15, -2.3] },
  wall: { pos: [-1.3, 3.1, 2.2], look: [-1.3, 2.9, -4.4] },
  board: { pos: [-2.2, 2.6, -1.2], look: [-6, 2.4, -1.2] },
  counter: { pos: [5.4, 2.6, 2.0], look: [4.6, 1.2, -2.2] },
};

const CAPTIONS: Record<Exclude<Station, "floor">, string> = {
  crates: "New releases: pull a record",
  booth: "Listening booth: drop the needle",
  wall: "Awards wall",
  board: "Notice board: what's on now",
  counter: "The counter: request a record",
};

// Deck-local constants (the deck is built at full size, then scaled onto the counter).
const DECK_SCALE = 0.42;
const DECK_POS = new THREE.Vector3(2.45, 1.12, -2.35);
const PLATTER = new THREE.Vector3(-0.42, 0, 0.05);
const DECK_Y = 0.36;
const RECORD_Y = DECK_Y + 0.11;
const PIVOT = new THREE.Vector3(1.42, DECK_Y + 0.3, -1.02);
const ARM = 2.02;
const RPM = (33.333 / 60) * Math.PI * 2;

const METALS = {
  gold: { color: "#e5b54a", rough: 0.22 },
  platinum: { color: "#e6e9ee", rough: 0.18 },
  silver: { color: "#b9bec6", rough: 0.26 },
} as const;

function canvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

export class Shop {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  private look = new THREE.Vector3(...VIEWS.floor.look);
  private yaw = 0; // drag-to-look offset
  /** Frame shift as a fraction of the viewport: the room steps aside for the words. */
  private shift = { x: 0.15, y: 0 };
  private pmrem: THREE.PMREMGenerator;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(2, 2);
  private lastX = 0;
  private lastY = 0;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private running = false;
  private disposers: (() => void)[] = [];
  private hits: THREE.Object3D[] = [];
  private hovered: THREE.Object3D | null = null;
  private station: Station = "floor";
  private camTween?: gsap.core.Timeline;

  private deck = new THREE.Group();
  private armYaw = new THREE.Group();
  private armLift = new THREE.Group();
  private armTween?: gsap.core.Timeline;
  private swap?: gsap.core.Timeline;
  private pressed = new Map<number, Pressed>();
  private pending = new Map<number, Promise<Pressed>>();
  private onPlatter = -1;
  private landed = false;
  private sleeves: THREE.Mesh[] = [];
  private plinthMat!: THREE.MeshStandardMaterial;
  private wallMats: THREE.MeshStandardMaterial[] = [];
  private lamp!: THREE.PointLight;
  private tick = (_t: number, dt: number) => this.frame(dt / 1000);

  constructor(
    private canvasEl: HTMLCanvasElement,
    private records: RecordSpec[],
    private extra: { honors: string[]; now: { verb: string; what: string }[] },
    private events: ShopEvents,
  ) {
    const coarse = matchMedia("(pointer: coarse)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.3 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.55;
    this.disposers.push(() => env.dispose());

    this.camera.position.set(...VIEWS.floor.pos);
    this.camera.lookAt(this.look);

    this.buildRoom();
    this.buildCounter();
    this.buildDeck();
    this.buildArm();
    void this.furnish();
    this.applyTheme();
    this.resize();
    this.listen();
  }

  /* ================================================================ materials */

  private wood(tint = "#5b3920") {
    const [c, w] = canvas(1024, 512);
    w.fillStyle = tint;
    w.fillRect(0, 0, 1024, 512);
    for (let y = 0; y < 512; y += 2) {
      const k = Math.sin(y * 0.045) * 0.5 + Math.sin(y * 0.013 + 1.7) * 0.5;
      w.fillStyle = `rgba(${k > 0 ? "40,22,10" : "120,78,44"},${0.08 + Math.abs(k) * 0.16})`;
      w.fillRect(0, y, 1024, 2);
    }
    for (let i = 0; i < 26; i++) {
      w.strokeStyle = `rgba(30,16,6,${0.12 + (i % 4) * 0.04})`;
      w.lineWidth = 1 + (i % 3);
      w.beginPath();
      const y0 = (i * 97) % 512;
      w.moveTo(0, y0);
      for (let x = 0; x <= 1024; x += 32) w.lineTo(x, y0 + Math.sin(x * 0.006 + i) * 14);
      w.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    this.disposers.push(() => t.dispose());
    return t;
  }

  private canvasTex(c: HTMLCanvasElement) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    this.disposers.push(() => t.dispose());
    return t;
  }

  /** Mark an object as something you can click, with where it takes you. */
  private interactive(o: THREE.Object3D, data: { station: Station; record?: number; caption: string }) {
    o.userData = { ...o.userData, ...data };
    o.traverse((c) => {
      c.userData = { ...c.userData, ...data, owner: o };
    });
    this.hits.push(o);
  }

  /* ================================================================ the room */

  private buildRoom() {
    const key = new THREE.DirectionalLight("#fff3df", 2.2);
    key.position.set(6, 11, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
    key.shadow.radius = 10;
    key.shadow.blurSamples = 16;
    key.shadow.bias = -0.0005;
    this.scene.add(key);
    this.scene.add(new THREE.HemisphereLight("#fff5e6", "#6b4a2e", 0.65));
    this.lamp = new THREE.PointLight("#ffb35c", 14, 12, 1.6);
    this.lamp.position.set(-0.5, 4.4, -0.5);
    this.scene.add(this.lamp);

    // Checkerboard lino, cream and oxblood, the floor of every shop that sold records in 1974.
    const [fc, f] = canvas(512);
    const n = 8;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        f.fillStyle = (x + y) % 2 ? "#7d2015" : "#efe2c6";
        f.fillRect((x * 512) / n, (y * 512) / n, 512 / n, 512 / n);
      }
    const floorTex = this.canvasTex(fc);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(3, 2.25);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Two painted walls, cut away like a dollhouse: mustard at the back, teal on the left.
    const back = new THREE.MeshStandardMaterial({ color: "#e3a72f", roughness: 0.9 });
    const left = new THREE.MeshStandardMaterial({ color: "#1f6f6a", roughness: 0.9 });
    this.wallMats = [back, left];
    const bw = new THREE.Mesh(new THREE.BoxGeometry(12, 5.2, 0.2), back);
    bw.position.set(0, 2.6, -4.6);
    bw.receiveShadow = true;
    const lw = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.2, 9.2), left);
    lw.position.set(-6.1, 2.6, 0);
    lw.receiveShadow = true;
    this.scene.add(bw, lw);

    // Oxblood skirting and the 70s stripe running round the walls.
    const stripe = (w: number, color: string) => new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.03), new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
    ["#e3a72f", "#d0661f", "#9b2316"].forEach((c, k) => {
      const y = 1.62 - k * 0.12;
      const s1 = stripe(12, c);
      s1.position.set(0, y, -4.49);
      const s2 = stripe(9, c);
      s2.rotation.y = Math.PI / 2;
      s2.position.set(-5.99, y, 0);
      this.scene.add(s1, s2);
    });
    const skirt = new THREE.MeshStandardMaterial({ color: "#3b2416", roughness: 0.6 });
    const sb = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 0.06), skirt);
    sb.position.set(0, 0.15, -4.47);
    const sl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 9), skirt);
    sl.position.set(-5.97, 0.15, 0);
    this.scene.add(sb, sl);

    // A ceiling lamp, a cone shade over the crates.
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.5, 32, 1, true), new THREE.MeshStandardMaterial({ color: "#9b2316", roughness: 0.5, side: THREE.DoubleSide }));
    shade.position.set(-0.5, 4.7, -0.5);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffe2a8" }));
    bulb.position.set(-0.5, 4.48, -0.5);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2), new THREE.MeshBasicMaterial({ color: "#1d1712" }));
    cord.position.set(-0.5, 5.5, -0.5);
    this.scene.add(shade, bulb, cord);
  }

  /* ================================================================ counter + till */

  private buildCounter() {
    const g = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ map: this.wood("#6a4426"), roughness: 0.5 });
    const top = new THREE.MeshStandardMaterial({ color: "#1d1712", roughness: 0.35 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(4.6, 1.05, 1.5, 4, 0.04), wood);
    body.position.set(3.6, 0.53, -2.3);
    body.castShadow = body.receiveShadow = true;
    const slab = new THREE.Mesh(new RoundedBoxGeometry(4.8, 0.08, 1.7, 4, 0.03), top);
    slab.position.set(3.6, 1.09, -2.3);
    slab.castShadow = slab.receiveShadow = true;
    g.add(body, slab);

    // The till: a cream box with an oxblood key bank and a little screen that says what to do.
    const till = new THREE.Group();
    const tb = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.42, 0.7, 4, 0.06), new THREE.MeshStandardMaterial({ color: "#efe2c6", roughness: 0.45 }));
    tb.position.y = 0.21;
    tb.castShadow = true;
    const keys = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.06, 0.32, 3, 0.02), new THREE.MeshStandardMaterial({ color: "#9b2316", roughness: 0.4 }));
    keys.position.set(0, 0.44, 0.12);
    keys.rotation.x = -0.25;
    const [sc, s] = canvas(512, 256);
    s.fillStyle = "#1a2a12";
    s.fillRect(0, 0, 512, 256);
    s.fillStyle = "#9cff7a";
    s.font = `800 64px ${fontFamily("display")}`;
    s.fillText("REQUEST A", 30, 110);
    s.fillText("RECORD →", 30, 190);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), new THREE.MeshBasicMaterial({ map: this.canvasTex(sc) }));
    const screenBox = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.4, 0.08, 3, 0.02), new THREE.MeshStandardMaterial({ color: "#1d1712" }));
    screenBox.position.set(0, 0.68, -0.2);
    screenBox.rotation.x = -0.2;
    screen.position.set(0, 0.68, -0.155);
    screen.rotation.x = -0.2;
    till.add(tb, keys, screenBox, screen);
    till.position.set(4.75, 1.13, -2.35);
    g.add(till);
    this.interactive(till, { station: "counter", caption: CAPTIONS.counter });
    this.interactive(body, { station: "counter", caption: CAPTIONS.counter });
    this.scene.add(g);
  }

  /* ================================================================ the deck */

  private buildDeck() {
    const d = this.deck;
    this.plinthMat = new THREE.MeshStandardMaterial({ map: this.wood(), roughness: 0.42 });
    const plinth = new THREE.Mesh(new RoundedBoxGeometry(4.5, DECK_Y, 3.4, 6, 0.08), this.plinthMat);
    plinth.position.y = DECK_Y / 2;
    plinth.castShadow = plinth.receiveShadow = true;
    d.add(plinth);
    const metal = new THREE.MeshStandardMaterial({ color: "#c3c6cc", metalness: 1, roughness: 0.22 });
    const dark = new THREE.MeshStandardMaterial({ color: "#16171a", metalness: 0.3, roughness: 0.5 });
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.09, 96), metal);
    platter.position.set(PLATTER.x, DECK_Y + 0.045, PLATTER.z);
    platter.castShadow = platter.receiveShadow = true;
    const mat = new THREE.Mesh(new THREE.CylinderGeometry(1.54, 1.54, 0.012, 96), new THREE.MeshStandardMaterial({ color: "#1c1c1f", roughness: 1 }));
    mat.position.set(PLATTER.x, DECK_Y + 0.096, PLATTER.z);
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 16), metal);
    spindle.position.set(PLATTER.x, DECK_Y + 0.15, PLATTER.z);
    const start = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.05, 0.3, 3, 0.02), dark);
    start.position.set(-1.85, DECK_Y + 0.02, 1.38);
    const slot = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.02, 1.0, 3, 0.01), dark);
    slot.position.set(1.85, DECK_Y + 0.003, 0.6);
    const fader = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.07, 0.12, 3, 0.02), metal);
    fader.position.set(1.85, DECK_Y + 0.04, 0.6);
    d.add(platter, mat, spindle, start, slot, fader);
    d.scale.setScalar(DECK_SCALE);
    d.position.copy(DECK_POS);
    this.scene.add(d);
    this.interactive(plinth, { station: "booth", caption: CAPTIONS.booth });
    this.interactive(platter, { station: "booth", caption: CAPTIONS.booth });

    // Two speakers either side of the deck on the counter.
    const cab = new THREE.MeshStandardMaterial({ map: this.wood("#4a2d18"), roughness: 0.5 });
    const cone = new THREE.MeshStandardMaterial({ color: "#1b1b1e", roughness: 0.8 });
    [1.35, -0.1].forEach((x) => {
      const sp = new THREE.Group();
      const box = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.85, 0.5, 3, 0.03), cab);
      box.position.y = 0.43;
      box.castShadow = true;
      const woofer = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 32), cone);
      woofer.rotation.x = Math.PI / 2;
      woofer.position.set(0, 0.32, 0.26);
      const tweet = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24), cone);
      tweet.rotation.x = Math.PI / 2;
      tweet.position.set(0, 0.64, 0.26);
      sp.add(box, woofer, tweet);
      sp.position.set(x + (x > 1 ? 0 : 0), 1.13, -2.55);
      sp.userData.speaker = true;
      this.scene.add(sp);
      this.speakers.push(woofer);
    });
  }

  private speakers: THREE.Mesh[] = [];

  private buildArm() {
    const metal = new THREE.MeshStandardMaterial({ color: "#d2d5da", metalness: 1, roughness: 0.18 });
    const dark = new THREE.MeshStandardMaterial({ color: "#121316", metalness: 0.4, roughness: 0.4 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.1, 48), metal);
    base.position.set(PIVOT.x, DECK_Y + 0.05, PIVOT.z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 24), dark);
    post.position.set(PIVOT.x, DECK_Y + 0.15, PIVOT.z);
    this.deck.add(base, post);
    this.armYaw.position.copy(PIVOT);
    this.armYaw.add(this.armLift);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, ARM, 16), metal);
    tube.rotation.x = Math.PI / 2;
    tube.position.z = ARM / 2 - 0.1;
    tube.castShadow = true;
    const weight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 32), dark);
    weight.rotation.x = Math.PI / 2;
    weight.position.z = -0.42;
    const head = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.05, 0.34, 3, 0.015), dark);
    head.position.set(0, -0.03, ARM - 0.02);
    head.rotation.y = 0.32;
    this.armLift.add(tube, weight, head);
    const rest = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 12), dark);
    rest.position.set(PIVOT.x + 0.05, DECK_Y + 0.11, PIVOT.z + 1.7);
    this.deck.add(rest);
    this.armYaw.rotation.y = -0.02;
    this.armLift.rotation.x = -0.06;
    this.deck.add(this.armYaw);
  }

  /** Everything with lettering on it waits for the shop's typefaces, or it prints in a fallback. */
  private async furnish() {
    await fontsReady();
    try {
      const sign = getComputedStyle(document.documentElement).getPropertyValue("--font-sign").trim();
      if (sign) await document.fonts.load(`400 100px ${sign}`);
    } catch {
      /* the fallback serif will do */
    }
    this.buildWall();
    this.buildBoard();
    this.buildNeon();
    await this.buildCrates();
  }

  /* ================================================================ awards wall */

  private buildWall() {
    const frameMat = new THREE.MeshStandardMaterial({ color: "#1d1712", roughness: 0.4 });
    const matBoard = new THREE.MeshStandardMaterial({ color: "#f3ead8", roughness: 0.9 });
    const kinds: (keyof typeof METALS)[] = ["gold", "platinum", "silver", "silver"];
    this.extra.honors.forEach((title, k) => {
      const g = new THREE.Group();
      const big = k === 0;
      const size = big ? 1.5 : 1.05;
      const frame = new THREE.Mesh(new RoundedBoxGeometry(size, size * 1.22, 0.09, 3, 0.02), frameMat);
      frame.castShadow = true;
      const mount = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.86, size * 1.08), matBoard);
      mount.position.z = 0.047;
      const m = METALS[kinds[k] ?? "silver"];
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(size * 0.34, size * 0.34, 0.02, 64),
        new THREE.MeshPhysicalMaterial({ color: m.color, metalness: 1, roughness: m.rough, clearcoat: 0.6, envMapIntensity: 2.2 }),
      );
      disc.rotation.x = Math.PI / 2;
      disc.position.set(0, size * 0.12, 0.06);
      const [lc, l] = canvas(256);
      l.fillStyle = "#1d1712";
      l.beginPath();
      l.arc(128, 128, 128, 0, Math.PI * 2);
      l.fill();
      const lab = new THREE.Mesh(new THREE.CircleGeometry(size * 0.11, 32), new THREE.MeshBasicMaterial({ map: this.canvasTex(lc) }));
      lab.position.set(0, size * 0.12, 0.072);
      // The plate under the disc, engraved with the award.
      const [pc, p] = canvas(512, 128);
      p.fillStyle = "#c9a46a";
      p.fillRect(0, 0, 512, 128);
      p.fillStyle = "#1d1712";
      p.textAlign = "center";
      p.textBaseline = "middle";
      let fs = 54;
      p.font = `900 ${fs}px ${fontFamily("display")}`;
      while (p.measureText(title.toUpperCase()).width > 480 && fs > 20) p.font = `900 ${(fs -= 2)}px ${fontFamily("display")}`;
      p.fillText(title.toUpperCase(), 256, 66);
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.7, size * 0.17), new THREE.MeshStandardMaterial({ map: this.canvasTex(pc), metalness: 0.6, roughness: 0.35 }));
      plate.position.set(0, -size * 0.36, 0.05);
      g.add(frame, mount, disc, lab, plate);
      const x = big ? -3.6 : -2.3 + (k - 1) * 1.3;
      g.position.set(x + (big ? 0 : 0.35), big ? 3.05 : 3.05, -4.45);
      this.scene.add(g);
      this.interactive(g, { station: "wall", record: k, caption: title });
    });
  }

  /* ================================================================ notice board */

  private buildBoard() {
    const g = new THREE.Group();
    const [cc, c] = canvas(1024, 720);
    c.fillStyle = "#b5895a";
    c.fillRect(0, 0, 1024, 720);
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = `rgba(${Math.random() > 0.5 ? "90,60,30" : "220,180,130"},${Math.random() * 0.35})`;
      c.fillRect(Math.random() * 1024, Math.random() * 720, 2, 2);
    }
    // Index cards, one per thing that's on now, pinned at slight angles.
    const tints = ["#f3ead8", "#ffe6a3", "#f3ead8", "#d8ece9"];
    this.extra.now.forEach((n, k) => {
      const x = 70 + (k % 2) * 470;
      const y = 60 + Math.floor(k / 2) * 320;
      c.save();
      c.translate(x + 200, y + 130);
      c.rotate(((k % 3) - 1) * 0.035);
      c.fillStyle = "rgba(0,0,0,0.25)";
      c.fillRect(-196, -122, 408, 262);
      c.fillStyle = tints[k % tints.length];
      c.fillRect(-200, -130, 400, 260);
      c.fillStyle = "#9b2316";
      c.fillRect(-200, -86, 400, 4);
      c.fillStyle = "#5f5244";
      c.font = `700 30px ${fontFamily("display")}`;
      c.fillText(n.verb.toUpperCase(), -176, -100);
      c.fillStyle = "#1d1712";
      let fs = 70;
      c.font = `900 ${fs}px ${fontFamily("display")}`;
      while (c.measureText(n.what.toUpperCase()).width > 350 && fs > 28) c.font = `900 ${(fs -= 3)}px ${fontFamily("display")}`;
      c.fillText(n.what.toUpperCase(), -176, 10);
      c.fillStyle = "#d0661f";
      c.beginPath();
      c.arc(0, -112, 14, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
    const tex = this.canvasTex(cc);
    const frame = new THREE.Mesh(new RoundedBoxGeometry(2.9, 2.1, 0.1, 3, 0.03), new THREE.MeshStandardMaterial({ map: this.wood("#6a4426"), roughness: 0.5 }));
    const cork = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.9), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    cork.position.z = 0.052;
    frame.castShadow = true;
    g.add(frame, cork);
    g.rotation.y = Math.PI / 2;
    g.position.set(-5.94, 2.6, -1.2);
    this.scene.add(g);
    this.interactive(g, { station: "board", caption: CAPTIONS.board });

    // Two framed sleeves further along the teal wall: decoration that still links somewhere.
    void (async () => {
      await fontsReady();
      for (const [k, idx] of [1, 6].entries()) {
        const r = this.records[idx];
        if (!r) continue;
        const art = this.canvasTex(await sleeve({ title: r.title, cat: r.cat, bg: r.sleeve, ink: r.ink, img: r.img, line: r.line }));
        const poster = new THREE.Group();
        const fr = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1.4, 0.06, 3, 0.02), new THREE.MeshStandardMaterial({ color: "#1d1712" }));
        const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 1.26), new THREE.MeshStandardMaterial({ map: art, roughness: 0.6 }));
        pic.position.z = 0.032;
        fr.castShadow = true;
        poster.add(fr, pic);
        poster.rotation.y = Math.PI / 2;
        poster.position.set(-5.95, 2.9, 1.25 + k * 1.75);
        this.scene.add(poster);
        this.interactive(poster, { station: "crates", record: idx, caption: `${r.title}: play it` });
      }
    })();
  }

  /* ================================================================ neon */

  private buildNeon() {
    const [nc, n] = canvas(1024, 256);
    n.clearRect(0, 0, 1024, 256);
    n.textAlign = "center";
    n.textBaseline = "middle";
    const signFont = getComputedStyle(document.documentElement).getPropertyValue("--font-sign").trim() || "Georgia";
    let fs = 170;
    n.font = `400 ${fs}px ${signFont}, Georgia, serif`;
    while (n.measureText("Ved Records").width > 940 && fs > 60) n.font = `400 ${(fs -= 6)}px ${signFont}, Georgia, serif`;
    n.shadowColor = "#ff7a2f";
    n.shadowBlur = 30;
    n.fillStyle = "#ffd9a3";
    n.fillText("Ved Records", 512, 128);
    n.shadowBlur = 10;
    n.fillText("Ved Records", 512, 128);
    const tex = this.canvasTex(nc);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    sign.position.set(3.3, 3.75, -4.48);
    this.scene.add(sign);
    this.neon = sign;
    const glow = new THREE.PointLight("#ff8a3d", 5, 5, 2);
    glow.position.set(3.3, 3.7, -3.8);
    this.scene.add(glow);
  }

  private neon?: THREE.Mesh;

  /* ================================================================ crates */

  private async buildCrates() {
    const table = new THREE.Mesh(new RoundedBoxGeometry(3.8, 0.9, 1.9, 4, 0.04), new THREE.MeshStandardMaterial({ map: this.wood("#3b2416"), roughness: 0.55 }));
    table.position.set(-0.9, 0.45, 0.25);
    table.castShadow = table.receiveShadow = true;
    this.scene.add(table);
    const crateWood = new THREE.MeshStandardMaterial({ map: this.wood("#a8743e"), roughness: 0.6 });
    const crate = (x: number) => {
      const g = new THREE.Group();
      const side = (w: number, h: number, d: number, px: number, py: number, pz: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), crateWood);
        m.position.set(px, py, pz);
        m.castShadow = m.receiveShadow = true;
        g.add(m);
      };
      side(1.6, 0.06, 1.6, 0, 0.03, 0);
      side(1.6, 0.55, 0.06, 0, 0.3, 0.77);
      side(1.6, 0.75, 0.06, 0, 0.4, -0.77);
      side(0.06, 0.65, 1.6, 0.77, 0.35, 0);
      side(0.06, 0.65, 1.6, -0.77, 0.35, 0);
      g.position.set(x, 0.9, 0.25);
      this.scene.add(g);
      return g;
    };
    crate(-1.85);
    crate(0.05);

    await fontsReady();
    const featured = this.records.slice(1);
    for (let k = 0; k < featured.length; k++) {
      const r = featured[k];
      const tex = this.canvasTex(await sleeve({ title: r.title, cat: r.cat, bg: r.sleeve, ink: r.ink, img: r.img, line: r.line }));
      const card = new THREE.MeshStandardMaterial({ color: r.sleeve, roughness: 0.75 });
      const front = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.42, 1.42, 0.03), [card, card, card, card, front, card]);
      m.castShadow = true;
      const inCrate = k % 3;
      const cx = k < 3 ? -1.85 : 0.05;
      // Front of the crate first, each one behind leaning back a little further.
      m.position.set(cx, 0.9 + 0.74, 0.25 + 0.5 - inCrate * 0.42);
      m.rotation.x = -0.22 - inCrate * 0.06;
      m.userData.home = { pos: m.position.clone(), rot: m.rotation.clone() };
      this.scene.add(m);
      this.sleeves[k] = m;
      this.interactive(m, { station: "crates", record: k + 1, caption: `${r.cat}  ${r.title}` });
    }
  }

  /* ================================================================ records on the platter */

  private press(i: number): Promise<Pressed> {
    const have = this.pressed.get(i);
    if (have) return Promise.resolve(have);
    let job = this.pending.get(i);
    if (!job) {
      job = this.pressNow(i).finally(() => this.pending.delete(i));
      this.pending.set(i, job);
    }
    return job;
  }

  private async pressNow(i: number): Promise<Pressed> {
    const s = this.records[i];
    await fontsReady();
    const list = bands(s.weights);
    const g = grooves(list, s.intensity);
    const colorTex = new THREE.CanvasTexture(g.color);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    const roughTex = new THREE.CanvasTexture(g.rough);
    colorTex.anisotropy = roughTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const vinyl = new THREE.MeshPhysicalMaterial({
      map: colorTex,
      roughnessMap: roughTex,
      roughness: 0.75,
      clearcoat: 0.5,
      clearcoatRoughness: 0.28,
      envMapIntensity: 0.18,
    });
    const edge = new THREE.MeshStandardMaterial({ color: "#0b0b0d", roughness: 0.35 });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(DISC.r, DISC.r, 0.022, 128, 1), [edge, vinyl, vinyl]);
    disc.castShadow = true;
    const labelTex = new THREE.CanvasTexture(label({ title: s.title, cat: s.cat, bg: s.label, ink: s.labelInk, runout: s.runout, side: "A" }));
    labelTex.colorSpace = THREE.SRGBColorSpace;
    const labelMesh = new THREE.Mesh(new THREE.CircleGeometry(DISC.label, 64), new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.7 }));
    labelMesh.rotation.x = -Math.PI / 2;
    labelMesh.position.y = 0.0115;
    const spin = new THREE.Group();
    spin.add(disc, labelMesh);
    const root = new THREE.Group();
    root.add(spin);
    const p: Pressed = {
      root,
      spin,
      disc,
      bands: list,
      dispose: () => {
        [colorTex, roughTex, labelTex].forEach((t) => t.dispose());
        [vinyl, edge, labelMesh.material as THREE.Material].forEach((m) => m.dispose());
        disc.geometry.dispose();
        labelMesh.geometry.dispose();
      },
    };
    this.pressed.set(i, p);
    return p;
  }

  /**
   * Put record `i` on the platter. From the crates it's a real move: the sleeve lifts out of
   * the crate, the record slides out of it and flies to the deck, the arm drops.
   */
  async play(i: number) {
    if (!this.records[i]) return;
    if (i === this.onPlatter && this.landed) {
      this.setTrack(0);
      return;
    }
    const prev = this.pressed.get(this.onPlatter);
    this.onPlatter = i;
    const next = await this.press(i);
    if (this.onPlatter !== i) return;
    this.events.onPlatter(i);
    this.swap?.kill();
    this.armTween?.kill();
    this.landed = false;
    const t = this.reduced ? 0 : 1;

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    this.swap = tl;
    tl.to(this.armLift.rotation, { x: -0.16, duration: 0.18 * t }, 0);
    tl.to(this.armYaw.rotation, { y: -0.02, duration: 0.4 * t }, 0);
    if (prev && prev !== next) {
      tl.to(prev.root.position, { y: RECORD_Y + 6, duration: 0.5 * t, ease: "power2.in" }, 0.1 * t);
      tl.call(() => this.deck.remove(prev.root), undefined, 0.6 * t);
    }

    // Where the record starts: inside its sleeve in the crate, or just above the deck.
    const sl = this.sleeves[i - 1];
    this.deck.add(next.root);
    if (sl) {
      const home = sl.userData.home as { pos: THREE.Vector3; rot: THREE.Euler };
      tl.to(sl.position, { y: home.pos.y + 0.9, duration: 0.45 * t, ease: "power2.out" }, 0.1 * t);
      const start = this.deck.worldToLocal(home.pos.clone().add(new THREE.Vector3(0, 0.9, -0.04)));
      next.root.position.copy(start);
      next.root.rotation.set(Math.PI / 2 + home.rot.x, 0, 0);
      next.root.scale.setScalar(1);
      tl.to(next.root.position, { x: start.x + 3.6, duration: 0.45 * t }, 0.55 * t);
      tl.to(sl.position, { y: home.pos.y, duration: 0.5 * t, ease: "power2.inOut" }, 0.95 * t);
    } else {
      next.root.position.set(PLATTER.x, RECORD_Y + 5, PLATTER.z);
      next.root.rotation.set(0, 0, 0);
    }
    tl.to(next.root.rotation, { x: 0, duration: 0.7 * t }, 1.0 * t);
    tl.to(next.root.position, { x: PLATTER.x, z: PLATTER.z, y: RECORD_Y + 0.9, duration: 0.9 * t }, 1.0 * t);
    tl.to(next.root.position, { y: RECORD_Y, duration: 0.3 * t, ease: "power2.in" }, 1.9 * t);
    tl.call(() => {
      this.landed = true;
      this.setTrack(0);
    });
  }

  private stylus(yaw: number) {
    return new THREE.Vector2(PIVOT.x + ARM * Math.sin(yaw), PIVOT.z + ARM * Math.cos(yaw));
  }

  private yawFor(r: number) {
    let lo = -1.0;
    let hi = -0.02;
    const c = new THREE.Vector2(PLATTER.x, PLATTER.z);
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      if (this.stylus(mid).distanceTo(c) > r) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  }

  setTrack(t: number) {
    const p = this.pressed.get(this.onPlatter);
    if (!p || !p.bands[t] || !this.landed) return;
    const b = p.bands[t];
    this.armTween?.kill();
    const r = this.reduced ? 0 : 1;
    const tl = gsap.timeline();
    tl.to(this.armLift.rotation, { x: -0.16, duration: 0.15 * r, ease: "power2.out" });
    tl.to(this.armYaw.rotation, { y: this.yawFor(b.outer - 0.012), duration: 0.5 * r, ease: "power3.inOut" });
    tl.to(this.armLift.rotation, { x: 0, duration: 0.25 * r, ease: "power2.in" });
    if (!this.reduced) tl.to(this.armYaw.rotation, { y: this.yawFor(b.inner + 0.006), duration: 40, ease: "none" });
    this.armTween = tl;
    this.events.onTrack(t);
  }

  /* ================================================================ camera */

  goto(s: Station) {
    this.station = s;
    this.yaw = 0;
    const v = VIEWS[s];
    const pos = this.fitted(v);
    this.camTween?.kill();
    const d = this.reduced ? 0 : 1.15;
    const tl = gsap.timeline({ defaults: { duration: d, ease: "power3.inOut" } });
    tl.to(this.camera.position, { x: pos.x, y: pos.y, z: pos.z }, 0);
    tl.to(this.look, { x: v.look[0], y: v.look[1], z: v.look[2] }, 0);
    tl.to(this.shift, { ...this.shiftFor(s), onUpdate: () => this.applyShift() }, 0);
    this.camTween = tl;
  }

  /** Wide screens: the room sits right of the intro, left of a station panel. Narrow: above the sheet. */
  private shiftFor(s: Station) {
    const narrow = (this.camera.aspect || 1.6) < 1.1;
    if (narrow) return { x: 0, y: s === "floor" ? 0.2 : -0.18 };
    return { x: s === "floor" ? 0.15 : -0.16, y: 0 };
  }

  private applyShift() {
    const w = this.canvasEl.clientWidth;
    const h = this.canvasEl.clientHeight;
    if (!w || !h) return;
    this.camera.setViewOffset(w, h, -w * this.shift.x, -h * this.shift.y, w, h);
    this.camera.updateProjectionMatrix();
  }

  /** On a tall screen, step back along the view so the subject still fits. */
  private fitted(v: { pos: [number, number, number]; look: [number, number, number] }) {
    const pos = new THREE.Vector3(...v.pos);
    const look = new THREE.Vector3(...v.look);
    const a = this.camera.aspect || 1.6;
    const k = a < 1.2 ? 1 + (1.2 - a) * 0.9 : 1;
    return look.clone().add(pos.sub(look).multiplyScalar(k));
  }

  /* ================================================================ frame + input */

  private frame(dt: number) {
    if (!this.running) return;
    const p = this.pressed.get(this.onPlatter);
    if (p && this.landed && !this.reduced) p.spin.rotation.y -= RPM * Math.min(dt, 0.05);
    // Drag-to-look: orbit the current view a little around its target.
    if (this.yaw) {
      const off = this.camera.position.clone().sub(this.look);
      off.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.camera.position.copy(this.look).add(off);
      this.yaw = 0;
    }
    this.camera.lookAt(this.look);
    if (!this.reduced) {
      const t = performance.now() / 1000;
      // A neon tube that hums: the faintest flicker, never a strobe.
      if (this.neon) (this.neon.material as THREE.MeshBasicMaterial).opacity = 0.93 + Math.sin(t * 7.3) * 0.03 + Math.sin(t * 1.7) * 0.03;
      const lvl = this.level?.() ?? 0;
      this.speakers.forEach((s) => s.scale.setScalar(1 + lvl * 0.12));
    }
    this.hitTest();
    this.renderer.render(this.scene, this.camera);
  }

  /** Optional audio level (0..1) so the speaker cones move with Our Song. */
  level?: () => number;

  private pick(): { obj: THREE.Object3D | null; point?: THREE.Vector3 } {
    if (this.pointer.x > 1) return { obj: null };
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = [...this.hits];
    const p = this.pressed.get(this.onPlatter);
    if (p && this.landed) targets.push(p.disc);
    const hit = this.raycaster.intersectObjects(targets, true)[0];
    if (!hit) return { obj: null };
    return { obj: hit.object, point: hit.point };
  }

  private discTrack(point: THREE.Vector3) {
    const p = this.pressed.get(this.onPlatter);
    if (!p) return -1;
    const local = p.root.worldToLocal(point.clone());
    return bandAt(p.bands, Math.hypot(local.x, local.z));
  }

  private trackCaption?: (record: number, t: number) => string;
  setTrackCaption(fn: (record: number, t: number) => string) {
    this.trackCaption = fn;
  }

  private hitTest() {
    const { obj, point } = this.pick();
    const p = this.pressed.get(this.onPlatter);
    let caption: string | null = null;
    let owner: THREE.Object3D | null = null;
    if (obj && p && obj === p.disc && point) {
      const t = this.discTrack(point);
      if (t >= 0) caption = this.trackCaption?.(this.onPlatter, t) ?? null;
      owner = obj;
    } else if (obj) {
      owner = (obj.userData.owner as THREE.Object3D) ?? obj;
      caption = (owner.userData.caption as string) ?? null;
    }
    if (owner !== this.hovered) {
      this.lift(this.hovered, false);
      this.lift(owner, true);
      this.hovered = owner;
      this.canvasEl.style.cursor = owner ? "pointer" : "";
    }
    this.events.onHover(caption, this.lastX, this.lastY);
  }

  /** Hover feedback: sleeves rise a little out of the crate; frames tip toward you. */
  private lift(o: THREE.Object3D | null, on: boolean) {
    if (!o || this.reduced) return;
    const home = o.userData.home as { pos: THREE.Vector3 } | undefined;
    if (home) gsap.to(o.position, { y: home.pos.y + (on ? 0.22 : 0), duration: 0.3, ease: "power2.out", overwrite: "auto" });
    else if (o.userData.station === "wall") gsap.to(o.rotation, { x: on ? -0.06 : 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
  }

  private click() {
    const { obj, point } = this.pick();
    if (!obj) return;
    const p = this.pressed.get(this.onPlatter);
    if (p && obj === p.disc && point) {
      const t = this.discTrack(point);
      if (t >= 0) this.setTrack(t);
      return;
    }
    const owner = (obj.userData.owner as THREE.Object3D) ?? obj;
    const station = owner.userData.station as Station;
    const record = owner.userData.record as number | undefined;
    if (station === "crates" && record !== undefined) {
      this.goto("booth");
      void this.play(record);
      this.events.onStation("booth", record);
      return;
    }
    if (station === "booth") {
      this.goto("booth");
      if (this.onPlatter < 0) void this.play(0);
      this.events.onStation("booth", this.onPlatter < 0 ? 0 : this.onPlatter);
      return;
    }
    this.goto(station);
    this.events.onStation(station, record);
  }

  private listen() {
    let down: { x: number; y: number; id: number } | null = null;
    let dragged = false;
    const move = (e: PointerEvent) => {
      const r = this.canvasEl.getBoundingClientRect();
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (down && e.pointerId === down.id) {
        const dx = e.clientX - down.x;
        if (Math.abs(dx) > 4) dragged = true;
        if (dragged) {
          this.yaw += -(dx / r.width) * 1.2;
          down.x = e.clientX;
        }
      }
    };
    const pdown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragged = false;
    };
    const up = () => {
      if (down && !dragged) this.click();
      down = null;
    };
    const leave = () => {
      this.pointer.set(2, 2);
      down = null;
    };
    const c = this.canvasEl;
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerdown", pdown);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointerleave", leave);
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(c);
    const theme = () => this.applyTheme();
    window.addEventListener("ved:theme", theme);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", theme);
    this.disposers.push(() => {
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerdown", pdown);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointerleave", leave);
      ro.disconnect();
      window.removeEventListener("ved:theme", theme);
      mq.removeEventListener("change", theme);
    });
  }

  private resize() {
    const w = this.canvasEl.clientWidth;
    const h = this.canvasEl.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 1 ? 48 : 34;
    if (!this.camTween?.isActive()) Object.assign(this.shift, this.shiftFor(this.station));
    this.applyShift();
    const pos = this.fitted(VIEWS[this.station]);
    if (!this.camTween?.isActive()) this.camera.position.copy(pos);
  }

  /** Lights down: the shop after hours, lit by the lamp and the neon. */
  private applyTheme() {
    const t = document.documentElement.dataset.theme;
    const dark = t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    this.renderer.toneMappingExposure = dark ? 0.62 : 1.0;
    this.lamp.intensity = dark ? 30 : 14;
    this.wallMats[0].color.set(dark ? "#b07f22" : "#e3a72f");
    this.wallMats[1].color.set(dark ? "#164f4b" : "#1f6f6a");
  }

  setRunning(on: boolean) {
    if (on === this.running) return;
    this.running = on;
    if (on) gsap.ticker.add(this.tick);
    else gsap.ticker.remove(this.tick);
  }

  dispose() {
    this.setRunning(false);
    this.camTween?.kill();
    this.swap?.kill();
    this.armTween?.kill();
    this.disposers.forEach((d) => d());
    for (const p of this.pressed.values()) p.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry?.dispose();
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => {
          (x as THREE.MeshStandardMaterial | undefined)?.map?.dispose();
          x?.dispose();
        });
      }
    });
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
