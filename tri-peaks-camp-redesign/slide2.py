# -*- coding: utf-8 -*-
"""Native rebuild of slide 2 in the CAMP design language.

Keeps the circular cycle diagram of the original slide, but redrawn as real
PowerPoint shapes in the CAMP palette instead of a flat JPEG. Every label is
the wording that was already on the slide or baked into that image.
"""
import math
from lxml import etree

A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
EMU = 914400

LIME, FOREST, GREEN, GRAY, MINT = 'A7C142', '003726', '00823D', '666666', 'B2E5D5'


def E(v):
    return int(round(v * EMU))


def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def runs_xml(runs, align='l', bullet=None, space_after=0, line_pct=None):
    if bullet:
        ppr_extra = ('<a:buClr><a:srgbClr val="%s"/></a:buClr><a:buSzPts val="700"/>'
                     '<a:buFont typeface="Arial"/><a:buChar char="%s"/>' % (bullet, '●'))
        marl, ind = 152400, -152400
    else:
        ppr_extra = '<a:buNone/>'
        marl, ind = 0, 0
    lnspc = '<a:lnSpc><a:spcPct val="%d"/></a:lnSpc>' % line_pct if line_pct else ''
    out = ['<a:p><a:pPr indent="%d" lvl="0" marL="%d" marR="0" rtl="0" algn="%s">%s'
           '<a:spcBef><a:spcPts val="0"/></a:spcBef>'
           '<a:spcAft><a:spcPts val="%d"/></a:spcAft>%s</a:pPr>'
           % (ind, marl, align, lnspc, space_after, ppr_extra)]
    for r in runs:
        out.append('<a:r><a:rPr b="%d" i="%d" lang="en" sz="%d"><a:solidFill>'
                   '<a:srgbClr val="%s"/></a:solidFill><a:latin typeface="Arial"/>'
                   '<a:ea typeface="Arial"/><a:cs typeface="Arial"/><a:sym typeface="Arial"/>'
                   '</a:rPr><a:t>%s</a:t></a:r>'
                   % (1 if r.get('b') else 0, 1 if r.get('i') else 0, r['sz'],
                      r.get('c', GRAY), esc(r['t'])))
    out.append('<a:endParaRPr sz="%d"/></a:p>' % (runs[0]['sz'] if runs else 900))
    return ''.join(out)


def shape(sid, x, y, w, h, geom='rect', fill=None, line=None, lw=9525, dash='solid',
          paras='', anchor='t', gd=None, arrow=False):
    if gd:
        av = '<a:avLst>%s</a:avLst>' % ''.join(
            '<a:gd fmla="val %d" name="%s"/>' % (v, k) for k, v in gd)
    else:
        av = '<a:avLst/>'
    fillx = ('<a:solidFill><a:srgbClr val="%s"/></a:solidFill>' % fill) if fill else '<a:noFill/>'
    if line:
        tail = ('<a:tailEnd len="med" w="med" type="triangle"/>' if arrow
                else '<a:tailEnd len="sm" w="sm" type="none"/>')
        linex = ('<a:ln cap="flat" cmpd="sng" w="%d"><a:solidFill><a:srgbClr val="%s"/>'
                 '</a:solidFill><a:prstDash val="%s"/><a:round/>'
                 '<a:headEnd len="sm" w="sm" type="none"/>%s</a:ln>' % (lw, line, dash, tail))
    else:
        linex = '<a:ln><a:noFill/></a:ln>'
    return ('<p:sp><p:nvSpPr><p:cNvPr id="%d" name="Google Shape;%d;p16"/>'
            '<p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            '<p:spPr><a:xfrm><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm>'
            '<a:prstGeom prst="%s">%s</a:prstGeom>%s%s</p:spPr>'
            '<p:txBody><a:bodyPr anchorCtr="0" anchor="%s" bIns="0" lIns="0" '
            'spcFirstLastPara="1" rIns="0" wrap="square" tIns="0"><a:noAutofit/></a:bodyPr>'
            '<a:lstStyle/>%s</p:txBody></p:sp>'
            % (sid, sid, E(x), E(y), E(w), E(h), geom, av, fillx, linex, anchor,
               paras or runs_xml([{'t': '', 'sz': 900}])))


# ------------------------------------------------------------------ cycle ----
# node angle (deg, clockwise from 3 o'clock), heading, caption, icon
NODES = [
    (270, 'CTV Awareness',
     '(top-of-mind brand trust on living room screens)', 'diamond'),
    (30, 'Branded Searches',
     '(homeowners search your name directly)', 'hexagon'),
    (150, 'Lower CPL and Higher PPC Conversion Rates',
     '(higher CTR, lower acquisition cost)', 'triangle'),
]

R = 1.48          # radius of the ring the nodes sit on
RING = 0.90       # dotted outer ring radius
INNER = 0.80      # solid node circle radius
GAP = 38          # degrees of clear space either side of a node
DOTS = [GREEN, LIME, FOREST]


def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def build(next_id):
    sid = next_id

    def nid():
        nonlocal sid
        sid += 1
        return sid

    out = []

    # title
    out.append(shape(nid(), 0.47, 0.30, 9.06, 0.44, anchor='ctr',
                     paras=runs_xml([{'t': 'Building Brand Demand to Lower Your PPC Cost-Per-Lead.',
                                      'b': 1, 'sz': 2000, 'c': GRAY}])))

    cx, cy = 0.60 + R * math.cos(math.radians(30)) + RING, 0.96 + R + RING

    # connecting arcs, drawn first so the nodes sit on top of them
    for i in range(3):
        a0 = NODES[i][0] + GAP
        a1 = NODES[(i + 1) % 3][0] - GAP
        if a1 < a0:
            a1 += 360
        out.append(shape(nid(), cx - R, cy - R, 2 * R, 2 * R, geom='arc',
                         line=FOREST, lw=14300, arrow=True,
                         gd=[('adj1', int(a0 * 60000)), ('adj2', int(a1 % 360 * 60000))]))
        # accent dot riding the arc
        mx, my = polar(cx, cy, R, (a0 + a1) / 2.0)
        out.append(shape(nid(), mx - 0.055, my - 0.055, 0.11, 0.11,
                         geom='ellipse', fill=DOTS[i]))

    # nodes
    for i, (ang, head, cap, icon) in enumerate(NODES):
        nx, ny = polar(cx, cy, R, ang)
        out.append(shape(nid(), nx - RING, ny - RING, 2 * RING, 2 * RING,
                         geom='ellipse', line=LIME, lw=9525, dash='sysDot'))
        out.append(shape(nid(), nx - INNER, ny - INNER, 2 * INNER, 2 * INNER,
                         geom='ellipse', fill='FFFFFF', line=LIME, lw=9525))
        out.append(shape(nid(), nx - 0.055, ny - RING - 0.055, 0.11, 0.11,
                         geom='ellipse', fill=DOTS[(i + 1) % 3]))
        out.append(shape(nid(), nx - 0.15, ny - 0.62, 0.30, 0.30,
                         geom=icon, line=FOREST, lw=9525))
        out.append(shape(nid(), nx - 0.71, ny - 0.30, 1.42, 0.46, anchor='b',
                         paras=runs_xml([{'t': head, 'b': 1, 'sz': 800, 'c': FOREST}],
                                        align='ctr', line_pct=100000)))
        out.append(shape(nid(), nx - 0.63, ny + 0.18, 1.26, 0.38, anchor='t',
                         paras=runs_xml([{'t': cap, 'sz': 700, 'c': GRAY}],
                                        align='ctr', line_pct=100000)))

    # ------------------------------------------------------------ right rail --
    rx, rw = 5.28, 4.25

    out.append(shape(nid(), rx, 1.55, rw, 1.00, geom='roundRect',
                     gd=[('adj', 2799)], fill=LIME))
    out.append(shape(nid(), rx + 0.22, 1.73, rw - 0.44, 0.18, anchor='ctr',
                     paras=runs_xml([{'t': 'Search & TV Working Together',
                                      'b': 1, 'sz': 900, 'c': FOREST}])))
    out.append(shape(nid(), rx + 0.22, 1.99, rw - 0.44, 0.46, anchor='t',
                     paras=runs_xml([{'t': 'CTV creates top-of-mind trust. Search PPC captures the '
                                           'appointment when the repair is needed. Together, they '
                                           'compound your results.', 'sz': 800, 'c': FOREST}],
                                    line_pct=115000)))

    out.append(shape(nid(), rx, 2.90, rw, 1.45, geom='roundRect',
                     gd=[('adj', 2799)], fill='FFFFFF', line=LIME))
    out.append(shape(nid(), rx + 0.22, 3.08, rw - 0.44, 0.18, anchor='ctr',
                     paras=runs_xml([{'t': 'Cross-Channel Retargeting',
                                      'b': 1, 'sz': 900, 'c': FOREST}])))
    bullets = runs_xml([{'t': 'Microsoft IMBR:', 'b': 1, 'sz': 800, 'c': FOREST},
                        {'t': ' Retarget TV viewers with follow-up Search, Native, or Display ads',
                         'sz': 800, 'c': GRAY}], bullet=GREEN, space_after=700, line_pct=115000)
    bullets += runs_xml([{'t': 'Google Demand Gen:', 'b': 1, 'sz': 800, 'c': FOREST},
                         {'t': ' Re-engage warm streaming audiences across YouTube Shorts, '
                               'Gmail, and Discover', 'sz': 800, 'c': GRAY}],
                        bullet=GREEN, line_pct=115000)
    out.append(shape(nid(), rx + 0.22, 3.36, rw - 0.44, 0.90, anchor='t', paras=bullets))

    xml = '<root xmlns:a="%s" xmlns:p="%s">%s</root>' % (A, P, ''.join(out))
    return list(etree.fromstring(xml.encode()))
