"""Builds the three concept marks and their lockups. Letterforms are outlined from the
site's own fonts (Instrument Serif Italic and Geist, both SIL OFL), so nothing depends on
live text. Run: python build.py"""
import math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont

INK, RED = "#0a0a0a", "#D94B2B"
SERIF = TTFont("../../.next/static/media/7ebf22b5a21034f8-s.p.3j3877k49yy0l.woff2")
GEIST = instantiateVariableFont(TTFont("../../.next/static/media/caa3a2e1cccd8315-s.p.0wgildi0cnwt9.woff2"), {"wght": 500})

def glyph_path(font, ch, scale, x, y):
    gs = font.getGlyphSet(); name = font.getBestCmap()[ord(ch)]
    pen = SVGPathPen(gs)
    gs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, y)))
    return pen.getCommands(), gs[name].width * scale

def text_path(font, s, size, x, y, tracking=0.0):
    upm = font["head"].unitsPerEm; k = size / upm; out = []
    for ch in s:
        d, adv = glyph_path(font, ch, k, x, y); out.append(d); x += adv + tracking * size
    return " ".join(out), x

def svg(body, w=256, h=256):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{body}</svg>\n'

# A — Held point: a V that holds one point. Same input, same result: the result sits inside.
A = (f'<path fill="{INK}" d="M34 46 H84 L128 160 L172 46 H222 L152 214 H104 Z"/>'
     f'<circle fill="{RED}" cx="128" cy="92" r="17"/>')

# B — v, with a footnote: Instrument Serif italic v, the site's own voice, and its asterisk.
from fontTools.pens.boundsPen import BoundsPen
def bounds(font, ch):
    gs = font.getGlyphSet(); b = BoundsPen(gs); gs[font.getBestCmap()[ord(ch)]].draw(b); return b.bounds
vx0, vy0, vx1, vy1 = bounds(SERIF, "v"); ax0, ay0, ax1, ay1 = bounds(SERIF, "*")
vs = 150 / (vy1 - vy0)                      # v stands 150 units tall
ascale = vs * 0.62                          # footnote mark at a superscript size
vw = (vx1 - vx0) * vs; aw = (ax1 - ax0) * ascale
gap = 6; total = vw + gap + aw
left = (256 - total) / 2
vx = left - vx0 * vs; vbase = 128 + 75     # optical centre a touch above geometric
vd, _ = glyph_path(SERIF, "v", vs, vx, vbase)
ah = (ay1 - ay0) * ascale
ax = left + vw + gap - ax0 * ascale; abase = (vbase - 150) + ah + ay0 * ascale  # top of mark = top of v
ad, _ = glyph_path(SERIF, "*", ascale, ax, abase)
B = f'<path fill="{INK}" d="{vd}"/><path fill="{RED}" d="{ad}"/>'

# C — Open seal: a ring left open (the C) around a V; the gap is where the work goes out.
R, T, cx, cy, gap = 104, 22, 128, 128, 64
def arc(r0, r1, a0, a1):
    p = lambda r, a: (cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a)))
    p0, p1, p2, p3 = p(r1, a0), p(r1, a1), p(r0, a1), p(r0, a0)
    return (f"M{p0[0]:.2f} {p0[1]:.2f} A{r1} {r1} 0 1 0 {p1[0]:.2f} {p1[1]:.2f} "
            f"L{p2[0]:.2f} {p2[1]:.2f} A{r0} {r0} 0 1 1 {p3[0]:.2f} {p3[1]:.2f} Z")
C = (f'<path fill="{INK}" d="{arc(R - T, R, gap / 2, 360 - gap / 2)}"/>'
     f'<path fill="{INK}" d="M74 78 H104 L128 142 L152 78 H182 L142 180 H114 Z"/>'
     f'<circle fill="{RED}" cx="{cx + R - T / 2:.1f}" cy="{cy}" r="12"/>')

for k, body in {"a": A, "b": B, "c": C}.items():
    open(f"{k}-symbol.svg", "w").write(svg(body))
    name, end = text_path(GEIST, "Ved Chauhan", 84, 300, 160, tracking=-0.03)
    open(f"{k}-lockup.svg", "w").write(svg(body + f'<path fill="{INK}" d="{name}"/>', int(end + 24), 256))
print("built")
