import math
T = math.tan(math.radians(75))  # V arms sit at exactly 75deg
k = 1/T
def f(v): return f"{v:.2f}".rstrip("0").rstrip(".")

def vpath(x0, y0, H, w, vy):
    """V with cap height H, horizontal arm width w, inner vertex vy above base. Returns path + bbox."""
    cx = x0 + (w + (H - vy) * k) + 0  # placeholder, recomputed below
    # outer top-left at x0; inner top-left at x0+w; inner edge hits centre at depth (H - vy)
    itl = x0 + w
    cx = itl + (H - vy) * k
    obl = x0 + H * k
    obr = 2 * cx - obl
    otr = 2 * cx - x0
    itr = 2 * cx - itl
    pts = [(x0, y0), (itl, y0), (cx, y0 + H - vy), (itr, y0), (otr, y0), (obr, y0 + H), (obl, y0 + H)]
    d = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + " Z"
    return d, obr, otr

INK, COBALT, PAPER = "#0e1116", "#2f3bff", "#eef0f1"

# ---- symbol (256 canvas). H=182, w=56, inner vertex 30 above base
def symbol(ink=INK, dot=COBALT, bg=None, pad_scale=1.0, dy=0):
    H, w, vy, s, gap = 182, 56, 30, 46, 14
    # measure total width first
    d0, obr, otr = vpath(0, 0, H, w, vy)
    dotx = obr + (s) * k + gap  # clear of the arm at the dot's top edge
    total = dotx + s
    sc = pad_scale
    x0 = (256 - total * sc) / 2
    y0 = (256 - H * sc) / 2 - 3 * sc + dy  # optical lift
    d, _, _ = vpath(0, 0, H, w, vy)
    g = f'<g transform="translate({f(x0)} {f(y0)}) scale({f(sc)})"><path d="{d}" fill="{ink}"/><rect x="{f(dotx)}" y="{H - s}" width="{s}" height="{s}" fill="{dot}"/></g>'
    b = f'<rect width="256" height="256" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">{b}{g}</svg>\n'

# ---- wordmark VED.EXE, cap height 100, constructed paths
def wordmark(ink=INK, dot=COBALT, pad=0):
    H = 100; sc = H / 182
    parts = []; x = pad
    dv, obr, otr = vpath(x, pad, H, 56 * sc, 30 * sc)
    parts.append(dv); x = otr + 6
    st, bar, mid = 26, 22, 20
    def E(x):
        return [f"M{f(x)} {pad} H{f(x+64)} V{pad+bar} H{f(x+st)} V{pad+39} H{f(x+56)} V{pad+39+mid} H{f(x+st)} V{pad+H-bar} H{f(x+65)} V{pad+H} H{f(x)} Z"], x + 65
    p, x = E(x); parts += p; x += 10
    # D: square-cornered with 45deg chamfers on the right (drafting)
    c, ci = 30, 18
    D = (f"M{f(x)} {pad} H{f(x+50)} L{f(x+50+c)} {pad+c} V{pad+H-c} L{f(x+50)} {pad+H} H{f(x)} Z "
         f"M{f(x+st)} {pad+bar} V{pad+H-bar} H{f(x+44)} L{f(x+44+ci)} {pad+H-bar-ci} V{pad+bar+ci} L{f(x+44)} {pad+bar} Z")
    parts.append(D); x += 50 + c + 9
    s = 26
    dotr = f'<rect x="{f(x)}" y="{pad+H-s}" width="{s}" height="{s}" fill="{dot}"/>'; x += s + 9
    p, x = E(x); parts += p; x += 4
    # X: two arms, 30 wide horizontally, symmetric
    a = 30; wX = a + H / math.tan(math.radians(60))
    parts.append(f"M{f(x)} {pad} H{f(x+a)} L{f(x+wX)} {pad+H} H{f(x+wX-a)} Z M{f(x+wX-a)} {pad} H{f(x+wX)} L{f(x+a)} {pad+H} H{f(x)} Z")
    x += wX + 4
    p, x = E(x); parts += p
    W = x + pad
    d = " ".join(parts)
    return W, H + 2 * pad, f'<path d="{d}" fill="{ink}" fill-rule="nonzero"/>{dotr}'

def wm_svg(**kw):
    W, Hh, body = wordmark(**kw)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(W)} {Hh}">{body}</svg>\n'

out = {
  "ved-symbol.svg": symbol(),
  "ved-symbol-black.svg": symbol(INK, INK),
  "ved-symbol-white.svg": symbol("#ffffff", "#ffffff"),
  "ved-symbol-dark.svg": symbol("#e7e9ec", "#8b94ff"),
  "ved-symbol-blueprint.svg": symbol("#f2f5ff", "#ffd66b"),
  "ved-app-icon.svg": symbol(bg=PAPER, pad_scale=0.72),
  "ved-app-icon-dark.svg": symbol("#e7e9ec", "#8b94ff", bg="#0f1114", pad_scale=0.72),
  "ved-maskable.svg": symbol(bg=PAPER, pad_scale=0.58),
  "ved-favicon.svg": symbol(bg=PAPER, pad_scale=0.86),
  "ved-wordmark.svg": wm_svg(),
  "ved-wordmark-black.svg": wm_svg(ink=INK, dot=INK),
  "ved-wordmark-white.svg": wm_svg(ink="#ffffff", dot="#ffffff"),
  "ved-wordmark-dark.svg": wm_svg(ink="#e7e9ec", dot="#8b94ff"),
}
for n, s in out.items(): open(n, "w").write(s)
print(wordmark()[0])
