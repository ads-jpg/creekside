import os, shutil, glob, re, zipfile
from lxml import etree
import restyle as R
q=R.q; EMU=R.EMU

SRC='trix'; OUT='outx'
if os.path.exists(OUT): shutil.rmtree(OUT)
shutil.copytree(SRC, OUT)

for path in sorted(glob.glob(OUT+'/ppt/slides/slide*.xml'), key=lambda p:int(re.search(r'(\d+)\.xml',p).group(1))):
    n=int(re.search(r'(\d+)\.xml',path).group(1))
    tree, spTree, shapes = R.restyle(path)

    # max id
    maxid=0
    for c in tree.getroot().iter(q('p:cNvPr')):
        try: maxid=max(maxid,int(c.get('id')))
        except: pass

    # ---- eyebrow -> lime pill ----
    made=[]
    for sp in list(spTree):
        if sp.tag != q('p:sp'): continue
        x=sp.find('.//'+q('xfrm'))
        if x is None: continue
        off=x.find(q('off')); ext=x.find(q('ext'))
        if off is None or ext is None: continue
        ox,oy=int(off.get('x')),int(off.get('y')); cy=int(ext.get('cy'))
        if oy > int(0.46*EMU) or ox > int(0.75*EMU): continue
        txt=R.txt_of(sp).strip()
        if not txt or txt != txt.upper() or len(txt) > 42: continue
        szs=[int(r.get('sz')) for r in sp.iter(q('rPr')) if r.get('sz')]
        if not szs or max(szs) > 800: continue
        maxid+=1; a=maxid; maxid+=1; b=maxid; maxid+=1; c2=maxid
        pill = R.make_pill(txt, ox, oy + (cy - int(0.20*EMU))//2, a)
        idx=list(spTree).index(sp)
        spTree.remove(sp)
        spTree.insert(idx, pill)
        made.append((n,txt))
    if made: print('pill:',made)

    # slide 1: promote gray card headings to CAMP forest green
    if n == 1:
        for r in tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr'):
            sz = r.get('sz')
            if r.get('b') == '1' and sz and 1000 <= int(sz) <= 1300:
                for c in r.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr'):
                    if c.get('val') == '666666':
                        c.set('val', '003726')

    tree.write(path, xml_declaration=True, encoding='UTF-8', standalone=True)

# repack
out='Tri_Peaks_Pitch_Test_CAMP_Design.pptx'
if os.path.exists(out): os.remove(out)
zf=zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED)
for root_,d,files in os.walk(OUT):
    for f in files:
        p=os.path.join(root_,f)
        zf.write(p, os.path.relpath(p,OUT))
zf.close()
print('wrote',out)
