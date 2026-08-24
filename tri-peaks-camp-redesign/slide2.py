# -*- coding: utf-8 -*-
"""Native rebuild of slide 2 in the CAMP design language.

The source slide carried its cycle diagram as a flat JPEG; every label below is
the text that was baked into that image or already lived on the slide. No copy
is added, removed or reworded.
"""
from lxml import etree

A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
EMU = 914400

LIME, FOREST, GREEN, GRAY, MUTED = 'A7C142', '003726', '00823D', '666666', '888888'

def E(v):
    return int(round(v * EMU))

def esc(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))

def runs_xml(runs, align='l', bullet=None, space_after=0, line_pct=None):
    """runs: list of dicts {t, b, i, sz, c}"""
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

def shape(sid, x, y, w, h, geom='rect', fill=None, line=None, lw=9525,
          paras='', anchor='t', adj=None, rot=None, pad=0):
    av = ('<a:avLst><a:gd fmla="val %d" name="adj"/></a:avLst>' % adj) if adj is not None else '<a:avLst/>'
    fillx = ('<a:solidFill><a:srgbClr val="%s"/></a:solidFill>' % fill) if fill else '<a:noFill/>'
    if line:
        linex = ('<a:ln cap="flat" cmpd="sng" w="%d"><a:solidFill><a:srgbClr val="%s"/>'
                 '</a:solidFill><a:prstDash val="solid"/><a:round/>'
                 '<a:headEnd len="sm" w="sm" type="none"/>'
                 '<a:tailEnd len="sm" w="sm" type="none"/></a:ln>' % (lw, line))
    else:
        linex = '<a:ln><a:noFill/></a:ln>'
    rotx = ' rot="%d"' % rot if rot else ''
    return ('<p:sp><p:nvSpPr><p:cNvPr id="%d" name="Google Shape;%d;p16"/>'
            '<p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            '<p:spPr><a:xfrm%s><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm>'
            '<a:prstGeom prst="%s">%s</a:prstGeom>%s%s</p:spPr>'
            '<p:txBody><a:bodyPr anchorCtr="0" anchor="%s" bIns="%d" lIns="%d" '
            'spcFirstLastPara="1" rIns="%d" wrap="square" tIns="%d"><a:noAutofit/></a:bodyPr>'
            '<a:lstStyle/>%s</p:txBody></p:sp>'
            % (sid, sid, rotx, E(x), E(y), E(w), E(h), geom, av, fillx, linex,
               anchor, pad, pad, pad, pad,
               paras or runs_xml([{'t': '', 'sz': 900}])))

# ---------------------------------------------------------------- layout ----
STAGES = [
    ('CTV Awareness',
     '(top-of-mind brand trust on living room screens)'),
    ('Branded Searches',
     '(homeowners search your name directly)'),
    ('Lower CPL and Higher PPC Conversion Rates',
     '(higher CTR, lower acquisition cost)'),
]

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

    # three stage cards
    cy, ch, cw, gap = 1.02, 1.52, 2.82, 0.30
    xs = [0.47, 0.47 + cw + gap, 0.47 + 2 * (cw + gap)]
    for i, (head, cap) in enumerate(STAGES):
        x = xs[i]
        out.append(shape(nid(), x, cy, cw, ch, geom='roundRect', adj=2799,
                         fill='FFFFFF', line=LIME))
        out.append(shape(nid(), x + cw / 2 - 0.09, cy + 0.26, 0.18, 0.18,
                         geom='ellipse', fill=LIME))
        out.append(shape(nid(), x + 0.16, cy + 0.50, cw - 0.32, 0.44, anchor='b',
                         paras=runs_xml([{'t': head, 'b': 1, 'sz': 1100, 'c': FOREST}],
                                        align='ctr', line_pct=100000)))
        out.append(shape(nid(), x + 0.16, cy + 0.97, cw - 0.32, 0.46, anchor='t',
                         paras=runs_xml([{'t': cap, 'sz': 800, 'c': GRAY}],
                                        align='ctr', line_pct=100000)))
        if i < 2:
            out.append(shape(nid(), x + cw + 0.06, cy + ch / 2 - 0.10, 0.18, 0.20,
                             geom='triangle', fill=LIME, rot=5400000))

    # the loop closes: return arrow from the last stage back to the first
    out.append(shape(nid(), 1.88, 2.72, 6.24, 0.13, geom='leftArrow', fill=LIME))

    # lime takeaway banner
    out.append(shape(nid(), 0.47, 3.08, 9.06, 0.70, geom='roundRect', adj=2799, fill=LIME))
    out.append(shape(nid(), 0.72, 3.20, 8.56, 0.18, anchor='ctr',
                     paras=runs_xml([{'t': 'Search & TV Working Together',
                                      'b': 1, 'sz': 900, 'c': FOREST}])))
    out.append(shape(nid(), 0.72, 3.41, 8.56, 0.22, anchor='ctr',
                     paras=runs_xml([{'t': 'CTV creates top-of-mind trust. Search PPC captures the '
                                           'appointment when the repair is needed. Together, they '
                                           'compound your results.', 'sz': 800, 'c': FOREST}])))

    # retargeting card
    out.append(shape(nid(), 0.47, 3.96, 9.06, 1.00, geom='roundRect', adj=2799,
                     fill='FFFFFF', line=LIME))
    out.append(shape(nid(), 0.72, 4.10, 8.56, 0.18, anchor='ctr',
                     paras=runs_xml([{'t': 'Cross-Channel Retargeting',
                                      'b': 1, 'sz': 900, 'c': FOREST}])))
    bullets = runs_xml([{'t': 'Microsoft IMBR:', 'b': 1, 'sz': 800, 'c': FOREST},
                        {'t': ' Retarget TV viewers with follow-up Search, Native, or Display ads',
                         'sz': 800, 'c': GRAY}], bullet=GREEN, space_after=400)
    bullets += runs_xml([{'t': 'Google Demand Gen:', 'b': 1, 'sz': 800, 'c': FOREST},
                         {'t': ' Re-engage warm streaming audiences across YouTube Shorts, '
                               'Gmail, and Discover', 'sz': 800, 'c': GRAY}], bullet=GREEN)
    out.append(shape(nid(), 0.72, 4.36, 8.56, 0.50, anchor='t', paras=bullets))

    xml = ('<root xmlns:a="%s" xmlns:p="%s">%s</root>' % (A, P, ''.join(out)))
    return list(etree.fromstring(xml.encode()))
