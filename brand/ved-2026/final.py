"""Final 'Open seal' mark for Ved Chauhan. A ring left open by exactly 60 degrees (the C),
a V inside drawn with the ring's own stroke on a 70 degree arm, and one vermilion point in
the opening: the work going out. Edit numbers here, never the SVGs."""
import math

INK, RED, PAPER, NIGHT = "#0a0a0a", "#D94B2B", "#fcfcfa", "#f5f5f5"
CX = CY = 128

def ring(R, T, gap):
    p = lambda r, a: (CX + r * math.cos(math.radians(a)), CY - r * math.sin(math.radians(a)))
    a0, a1 = gap / 2, 360 - gap / 2
    p0, p1, p2, p3 = p(R, a0), p(R, a1), p(R - T, a1), p(R - T, a0)
    f = lambda q: f"{q[0]:.2f} {q[1]:.2f}"
    return f"M{f(p0)} A{R} {R} 0 1 0 {f(p1)} L{f(p2)} A{R - T} {R - T} 0 1 1 {f(p3)} Z"

def vee(T, top, bottom, angle=70, foot=None):
    foot = T if foot is None else foot
    h = T / math.sin(math.radians(angle))            # horizontal width of an arm of stroke T
    run = (bottom - top) / math.tan(math.radians(angle))
    ol = CX - foot / 2 - run; il = ol + h
    apex = top + (CX - il) * math.tan(math.radians(angle))
    pts = [(ol, top), (il, top), (CX, apex), (2 * CX - il, top), (2 * CX - ol, top), (CX + foot / 2, bottom), (CX - foot / 2, bottom)]
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + " Z"

def mark(R=104, T=22, gap=60, dot=12, ink=INK, accent=RED, vtop=79, vbot=177, title="Ved Chauhan"):
    d = f'<path fill="{ink}" d="{ring(R, T, gap)}"/><path fill="{ink}" d="{vee(T, vtop, vbot)}"/>'
    if dot:
        d += f'<circle fill="{accent}" cx="{CX + R - T / 2:.2f}" cy="{CY}" r="{dot}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><title>{title}</title>{d}</svg>\n'

files = {
    "ved-mark.svg": mark(),
    "ved-mark-small.svg": mark(R=108, T=32, gap=60, dot=16, vtop=84, vbot=172),
    "ved-mark-black.svg": mark(accent=INK),
    "ved-mark-white.svg": mark(ink="#ffffff", accent="#ffffff"),
    "ved-mark-dark.svg": mark(ink=NIGHT, accent="#E8664A"),
}
for name, body in files.items():
    open(f"final/{name}", "w").write(body)
print("\n".join(files))
