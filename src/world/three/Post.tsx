"use client";
/**
 * The grade. A small post chain on three's own EffectComposer: MSAA render target, a restrained
 * bloom that only catches things brighter than white (sign bulbs, screens, the lamp), and one
 * final pass for a warm vignette and a whisper of film grain. Off on low-power devices and under
 * reduced motion the grain holds still.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { sim } from "../runtime";
import { world } from "../state";

const GRADE = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uNight: { value: 0 }, uAspect: { value: 1 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uNight; uniform float uAspect;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      // Lift the shadows toward plum, warm the highlights: a printed-poster grade, not a filter.
      vec3 shadowTint = mix(vec3(0.06, 0.03, 0.10), vec3(0.03, 0.02, 0.09), uNight);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb += shadowTint * (1.0 - smoothstep(0.0, 0.45, l)) * 0.3;
      // A gentle S-curve and a touch more saturation: candy colours, not pastel mush.
      c.rgb = mix(vec3(l), c.rgb, 1.1);
      c.rgb = (c.rgb - 0.5) * 1.07 + 0.5;
      c.rgb *= mix(vec3(1.02, 1.0, 0.97), vec3(0.94, 0.95, 1.06), uNight);
      // Vignette, elliptical to the frame.
      vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);
      float v = smoothstep(1.05, 0.35, length(q));
      c.rgb *= mix(0.78, 1.0, v);
      // Grain, very fine.
      float g = hash(vUv * 1000.0 + uTime) - 0.5;
      c.rgb += g * 0.018;
      gl_FragColor = c;
    }`,
};

export function Post() {
  const { gl, scene, camera, size } = useThree();
  const { composer, grade, bloomPass } = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, target);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.5, 1.2);
    composer.addPass(bloomPass);
    const grade = new ShaderPass(GRADE);
    composer.addPass(grade);
    composer.addPass(new OutputPass());
    return { composer, grade, bloomPass };
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
    grade.uniforms.uAspect.value = size.width / Math.max(1, size.height);
  }, [composer, grade, gl, size]);

  useEffect(() => () => composer.dispose(), [composer]);
  const ratio = useRef(0);

  // Priority 1 takes over rendering from R3F.
  useFrame((_, dt) => {
    if (!sim.calm) grade.uniforms.uTime.value = (grade.uniforms.uTime.value + dt) % 100;
    const night = world.get().lights ? 0 : 1;
    grade.uniforms.uNight.value += (night - grade.uniforms.uNight.value) * (1 - Math.exp(-3 * dt));
    bloomPass.enabled = sim.quality > 0;
    bloomPass.strength = 0.28 + grade.uniforms.uNight.value * 0.35;
    // The governor may change DPR; only resize targets when it actually does.
    const pr = gl.getPixelRatio();
    if (pr !== ratio.current) {
      ratio.current = pr;
      composer.setPixelRatio(pr);
      composer.setSize(size.width, size.height);
    }
    composer.render(dt);
  }, 1);

  return null;
}
