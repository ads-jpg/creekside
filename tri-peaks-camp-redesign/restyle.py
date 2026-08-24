import re, glob, os, shutil, copy
from lxml import etree

A='http://schemas.openxmlformats.org/drawingml/2006/main'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
NS={'a':A,'p':P}
def q(t): return '{%s}%s'%(A,t) if not t.startswith('p:') else '{%s}%s'%(P,t[2:])

EMU=914400

# ---------------- CAMP palette ----------------
LIME   = 'A7C142'
FOREST = '003726'
GREEN  = '00823D'
MIDGRN = '006A49'
GRAY   = '666666'
MUTED  = '888888'
TINT   = 'E5F7F2'
TINT2  = 'B2E5D5'
WHITE  = 'FFFFFF'

# Shape / cell background fills
FILL = {
 'F8FAFC': WHITE,      # neutral card -> white card
 'EFF4FE': TINT,       # blue-tint card -> green tint
 'ECFDF5': TINT,
 'E2E8F0': TINT,
 'DCE5F5': TINT,
 '0F172A': FOREST,     # dark panel / dark slide bg
 '1B2942': MIDGRN,     # inner panel on dark
 '2E4266': MIDGRN,
 '475569': FOREST,     # table header
 '2563EB': LIME,       # blue CTA / highlight block
 '1D4ED8': GREEN,
 '93B4FB': LIME,
 'D6E2FE': TINT,
 'C9D9FC': TINT,
 'C7D3E6': TINT2,
 'A7E3CA': TINT2,
 '059669': GREEN,
 '64748B': MUTED,
 '94A3B8': MUTED,
}

# Outline / border colours
LINE = {
 'B2E5D5': LIME,
 'E2E8F0': LIME,
 'C9D9FC': LIME,
 'D6E2FE': LIME,
 'DCE5F5': LIME,
 'C7D3E6': MIDGRN,
 '2E4266': MIDGRN,
 '0F172A': FOREST,
 '475569': GRAY,
 '2563EB': LIME,
 '1D4ED8': GREEN,
 '93B4FB': LIME,
 '94A3B8': MUTED,
 '64748B': MUTED,
 'A7E3CA': LIME,
 '059669': GREEN,
 'F8FAFC': WHITE,
 'EFF4FE': TINT,
 'ECFDF5': TINT,
 '1B2942': MIDGRN,
}

# Text / bullet colours (context aware for 0F172A)
TEXT = {
 '475569': GRAY,
 '64748B': MUTED,
 '94A3B8': MUTED,
 '2563EB': GREEN,
 '1D4ED8': GREEN,
 '93B4FB': LIME,
 'DCE5F5': TINT2,
 'C9D9FC': TINT2,
 'D6E2FE': TINT2,
 'C7D3E6': TINT2,
 'A7E3CA': LIME,
 '059669': GREEN,
 'E2E8F0': TINT2,
 'F8FAFC': WHITE,
 'EFF4FE': WHITE,
 'ECFDF5': WHITE,
 '1B2942': FOREST,
 '2E4266': FOREST,
}

def map_text_color(val, bold, sz, on_dark):
    if val == '0F172A':
        if on_dark: return WHITE
        if bold and sz and int(sz) >= 1400: return GRAY   # slide titles / big stats
        if bold: return FOREST                             # card headings
        return GRAY                                        # body copy
    if on_dark and val in ('475569','64748B','94A3B8','666666','888888'):
        return TINT2
    return TEXT.get(val, val)

# ---------------- geometry helpers ----------------
def xfrm_of(el):
    x = el.find('.//'+q('xfrm'))
    return x

def abs_box(sp, ctx):
    """ctx = (offx, offy, sx, sy, chx, chy)"""
    spPr = sp.find(q('p:spPr')) if sp.tag==q('p:sp') else None
    x = sp.find('.//'+q('xfrm'))
    if x is None: return None
    off = x.find(q('off')); ext = x.find(q('ext'))
    if off is None or ext is None: return None
    ox,oy = int(off.get('x')), int(off.get('y'))
    cx,cy = int(ext.get('cx')), int(ext.get('cy'))
    dx,dy,sx,sy,chx,chy = ctx
    X = dx + (ox-chx)*sx; Y = dy + (oy-chy)*sy
    return (X, Y, cx*sx, cy*sy)

def child_ctx(grp, ctx):
    x = grp.find(q('p:grpSpPr')+'/'+q('xfrm'))
    if x is None: return ctx
    off=x.find(q('off')); ext=x.find(q('ext'))
    chOff=x.find(q('chOff')); chExt=x.find(q('chExt'))
    dx,dy,sx,sy,chx,chy = ctx
    ox,oy=int(off.get('x')),int(off.get('y')); cx,cy=int(ext.get('cx')),int(ext.get('cy'))
    kx,ky=int(chOff.get('x')),int(chOff.get('y')); ex,ey=int(chExt.get('cx')),int(chExt.get('cy'))
    X = dx + (ox-chx)*sx; Y = dy + (oy-chy)*sy
    nsx = sx*(cx/ex if ex else 1); nsy = sy*(cy/ey if ey else 1)
    return (X, Y, nsx, nsy, kx, ky)

def iter_shapes(tree_root, ctx=(0,0,1.0,1.0,0,0)):
    for el in tree_root:
        if el.tag == q('p:grpSp'):
            nc = child_ctx(el, ctx)
            yield el, ctx
            yield from iter_shapes(el, nc)
        elif el.tag in (q('p:sp'), q('p:pic'), q('p:graphicFrame'), q('p:cxnSp')):
            yield el, ctx

def txt_of(sp):
    return ''.join(t.text or '' for t in sp.iter(q('t')))

# ---------------- pill builder ----------------
PILL_XML = '''<p:grpSp xmlns:a="{A}" xmlns:p="{P}">
<p:nvGrpSpPr><p:cNvPr id="{id0}" name="Google Shape;{id0};pill"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="182925"/><a:chOff x="0" y="0"/><a:chExt cx="{cx}" cy="182925"/></a:xfrm></p:grpSpPr>
<p:sp><p:nvSpPr><p:cNvPr id="{id1}" name="Google Shape;{id1};pill"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="182925"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd fmla="val 22640" name="adj"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="A7C142"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>
<p:txBody><a:bodyPr anchorCtr="0" anchor="ctr" bIns="0" lIns="0" spcFirstLastPara="1" rIns="0" wrap="square" tIns="0"><a:noAutofit/></a:bodyPr><a:lstStyle/><a:p><a:pPr indent="0" lvl="0" marL="0" rtl="0" algn="l"><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr><a:endParaRPr/></a:p></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="{id2}" name="Google Shape;{id2};pill"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="182925"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>
<p:txBody><a:bodyPr anchorCtr="0" anchor="ctr" bIns="0" lIns="0" spcFirstLastPara="1" rIns="0" wrap="none" tIns="0"><a:noAutofit/></a:bodyPr><a:lstStyle/><a:p><a:pPr indent="0" lvl="0" marL="0" rtl="0" algn="ctr"><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr><a:r><a:rPr b="1" lang="en" sz="700"><a:solidFill><a:schemeClr val="lt1"/></a:solidFill></a:rPr><a:t>{text}</a:t></a:r><a:endParaRPr b="1" sz="700"><a:solidFill><a:schemeClr val="lt1"/></a:solidFill></a:endParaRPr></a:p></p:txBody></p:sp>
</p:grpSp>'''

def text_width_in(text, pt):
    """approx Arial Bold width in inches"""
    from PIL import ImageFont
    for cand in ['/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
                 '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(cand):
            f = ImageFont.truetype(cand, 400)
            return f.getlength(text)/400.0*pt/72.0
    return len(text)*0.62*pt/72.0

def make_pill(text, x, y, next_id):
    tw = text_width_in(text, 7)          # pill label renders at 7pt
    w  = max(tw + 0.34, 1.05)            # CAMP-style horizontal padding
    cx = int(round(w*EMU))
    xml = PILL_XML.format(A=A, P=P, id0=next_id, id1=next_id+1, id2=next_id+2,
                          x=int(x), y=int(y), cx=cx,
                          text=text.replace('&','&amp;').replace('<','&lt;'))
    return etree.fromstring(xml.encode())

# ---------------- main ----------------
def restyle(path, dark_slide=False):
    tree = etree.parse(path)
    root = tree.getroot()
    spTree = root.find(q('p:cSld')+'/'+q('p:spTree'))

    # slide background
    bg = root.find(q('p:cSld')+'/'+q('p:bg'))
    slide_dark = False
    if bg is not None:
        for c in bg.iter(q('srgbClr')):
            if c.get('val') in FILL and c.get('val') in ('0F172A','1B2942'):
                slide_dark = True
            c.set('val', FILL.get(c.get('val'), c.get('val')))

    # ---- pass 1: collect geometry, find dark regions & banners ----
    shapes = list(iter_shapes(spTree))
    dark_boxes = []
    banner_boxes = []
    for sp, ctx in shapes:
        if sp.tag != q('p:sp'): continue
        spPr = sp.find(q('p:spPr'))
        if spPr is None: continue
        sf = spPr.find(q('solidFill'))
        if sf is None: continue
        c = sf.find(q('srgbClr'))
        if c is None: continue
        box = abs_box(sp, ctx)
        if box is None: continue
        if c.get('val') in ('0F172A','1B2942'):
            dark_boxes.append(box)
        if c.get('val') in ('EFF4FE','ECFDF5') and box[2] > 7.5*EMU:
            banner_boxes.append(box)
        if FILL.get(c.get('val')) == LIME:
            banner_boxes.append(box)
    if slide_dark:
        dark_boxes.append((0,0,10*EMU,5.625*EMU))

    def inside(box, boxes, tol=0.06*EMU):
        if box is None: return False
        x,y,w,h = box
        cx_, cy_ = x+w/2, y+h/2
        for X,Y,W,H in boxes:
            if X-tol <= cx_ <= X+W+tol and Y-tol <= cy_ <= Y+H+tol:
                return True
        return False

    # ---- pass 2: recolour ----
    for sp, ctx in shapes:
        box = abs_box(sp, ctx)
        on_dark = inside(box, dark_boxes) and not inside(box, banner_boxes)
        on_banner = inside(box, banner_boxes)

        # -- fills & outlines on spPr / tcPr --
        for holder in list(sp.iter(q('p:spPr'))) + list(sp.iter(q('tcPr'))) + list(sp.iter(q('p:grpSpPr'))):
            for sf in holder.findall(q('solidFill')):
                c = sf.find(q('srgbClr'))
                if c is not None:
                    c.set('val', FILL.get(c.get('val'), c.get('val')))
            for lname in ('ln','lnL','lnR','lnT','lnB'):
                for ln in holder.findall(q(lname)):
                    for c in ln.iter(q('srgbClr')):
                        c.set('val', LINE.get(c.get('val'), c.get('val')))
            # gradient / other nested fills inside spPr but outside ln
            for gf in holder.findall(q('gradFill')):
                for c in gf.iter(q('srgbClr')):
                    c.set('val', FILL.get(c.get('val'), c.get('val')))

        # -- text colours --
        txBody = sp.find(q('p:txBody'))
        holders = list(sp.iter(q('rPr'))) + list(sp.iter(q('endParaRPr'))) + \
                  list(sp.iter(q('defRPr'))) + list(sp.iter(q('buClr')))
        for h in holders:
            bold = h.get('b') == '1'
            sz = h.get('sz')
            if h.tag == q('buClr'):
                for c in h.findall(q('srgbClr')):
                    v = c.get('val')
                    c.set('val', map_text_color(v, True, sz, on_dark) if not on_banner else FOREST)
                continue
            for sf in h.findall(q('solidFill')):
                c = sf.find(q('srgbClr'))
                if c is None: continue
                v = c.get('val')
                if on_banner:
                    c.set('val', FOREST if v != 'FFFFFF' else FOREST)
                else:
                    c.set('val', map_text_color(v, bold, sz, on_dark))
        # font swap
        for tf in sp.iter():
            tp = tf.get('typeface') if hasattr(tf,'get') else None
            if tp == 'Calibri':
                tf.set('typeface','Arial')

    # banner shape fills -> lime
    for sp, ctx in shapes:
        if sp.tag != q('p:sp'): continue
        box = abs_box(sp, ctx)
        if box is None: continue
        spPr = sp.find(q('p:spPr'))
        if spPr is None: continue
        sf = spPr.find(q('solidFill'))
        if sf is None: continue
        c = sf.find(q('srgbClr'))
        if c is None: continue
        for X,Y,W,H in banner_boxes:
            if abs(box[0]-X) < 1000 and abs(box[1]-Y) < 1000 and abs(box[2]-W) < 1000:
                c.set('val', LIME)
                ln = spPr.find(q('ln'))
                if ln is not None:
                    for cc in ln.iter(q('srgbClr')):
                        cc.set('val', LIME)
    return tree, spTree, shapes
