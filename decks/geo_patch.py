# -*- coding: utf-8 -*-
"""Slide 15 (GEOGRAPHIC TARGETING) -> Monarch's five California cities."""
import re

def esc(t): return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def find_elem(s, tag, cid):
    m = re.search(r'<p:cNvPr id="%d"' % cid, s); assert m
    start = s.rfind('<%s>' % tag, 0, m.start()); assert start >= 0
    depth, i = 0, start
    o, c = '<%s>' % tag, '</%s>' % tag
    while True:
        no, nc = s.find(o, i), s.find(c, i)
        assert nc >= 0
        if 0 <= no < nc: depth += 1; i = no + len(o)
        else:
            depth -= 1; i = nc + len(c)
            if depth == 0: return start, i

CITIES = [
    ('Bakersfield, CA',     'Bakersfield DMA'),
    ('Visalia, CA',         'Fresno–Visalia DMA'),
    ('Fresno, CA',          'Fresno–Visalia DMA'),
    ('Paso Robles, CA',     'Santa Barbara–SLO DMA'),
    ('San Luis Obispo, CA', 'Santa Barbara–SLO DMA'),
]

AREA_W, AREA_H = 4457850, 2019300     # unchanged inner grid extent of the Tri Peaks card
GAP = 91440
ROW_H = (AREA_H - (len(CITIES) - 1) * GAP) // len(CITIES)
PITCH = ROW_H + GAP
ADJ = round(57150 / min(AREA_W, ROW_H) * 100000)
INSET = 137160
SPLIT = 2200000

FONT = ('<a:latin typeface="Arial"/><a:ea typeface="Arial"/>'
        '<a:cs typeface="Arial"/><a:sym typeface="Arial"/>')

def textbox(cid, x, w, h, algn, bold, sz, color, txt):
    rpr = '<a:rPr%s lang="en" sz="%d"><a:solidFill><a:srgbClr val="%s"/></a:solidFill>%s</a:rPr>' % (
        ' b="1"' if bold else '', sz, color, FONT)
    epr = '<a:endParaRPr%s sz="%d"><a:solidFill><a:srgbClr val="%s"/></a:solidFill>%s</a:endParaRPr>' % (
        ' b="1"' if bold else '', sz, color, FONT)
    return (
      '<p:sp><p:nvSpPr><p:cNvPr id="%d" name="Google Shape;%d;p28"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
      '<p:spPr><a:xfrm><a:off x="%d" y="0"/><a:ext cx="%d" cy="%d"/></a:xfrm>'
      '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>'
      '<p:txBody><a:bodyPr anchorCtr="0" anchor="ctr" bIns="0" lIns="0" spcFirstLastPara="1" rIns="0" '
      'wrap="square" tIns="0"><a:noAutofit/></a:bodyPr><a:lstStyle/>'
      '<a:p><a:pPr indent="0" lvl="0" marL="0" rtl="0" algn="%s"><a:spcBef><a:spcPts val="0"/></a:spcBef>'
      '<a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr>'
      '<a:r>%s<a:t>%s</a:t></a:r>%s</a:p></p:txBody></p:sp>'
    ) % (cid, cid, x, w, h, algn, rpr, esc(txt), epr)

def row(nid, y, city, dma):
    plate = (
      '<p:sp><p:nvSpPr><p:cNvPr id="%d" name="Google Shape;%d;p28"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
      '<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/></a:xfrm>'
      '<a:prstGeom prst="roundRect"><a:avLst><a:gd fmla="val %d" name="adj"/></a:avLst></a:prstGeom>'
      '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
      '<a:ln cap="flat" cmpd="sng" w="9525"><a:solidFill><a:srgbClr val="A7C142"/></a:solidFill>'
      '<a:prstDash val="solid"/><a:round/><a:headEnd len="sm" w="sm" type="none"/>'
      '<a:tailEnd len="sm" w="sm" type="none"/></a:ln></p:spPr>'
      '<p:txBody><a:bodyPr anchorCtr="0" anchor="ctr" bIns="0" lIns="0" spcFirstLastPara="1" rIns="0" '
      'wrap="square" tIns="0"><a:noAutofit/></a:bodyPr><a:lstStyle/><a:p><a:pPr indent="0" lvl="0" marL="0" '
      'rtl="0" algn="l"><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft>'
      '<a:buNone/></a:pPr><a:r><a:t></a:t></a:r><a:endParaRPr/></a:p></p:txBody></p:sp>'
    ) % (nid + 1, nid + 1, AREA_W, ROW_H, ADJ)
    return (
      '<p:grpSp><p:nvGrpSpPr><p:cNvPr id="%d" name="Google Shape;%d;p28"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
      '<p:grpSpPr><a:xfrm><a:off x="0" y="%d"/><a:ext cx="%d" cy="%d"/><a:chOff x="0" y="0"/>'
      '<a:chExt cx="%d" cy="%d"/></a:xfrm></p:grpSpPr>%s%s%s</p:grpSp>'
    ) % (nid, nid, y, AREA_W, ROW_H, AREA_W, ROW_H, plate,
         textbox(nid + 2, INSET, SPLIT, ROW_H, 'l', True, 1100, '00331E', city),
         textbox(nid + 3, SPLIT, AREA_W - SPLIT - INSET, ROW_H, 'r', False, 850, '777777', dma))

def apply(s):
    rows, nid = [], 523
    for k, (city, dma) in enumerate(CITIES):
        rows.append(row(nid, k * PITCH, city, dma))
        nid += 4
    a, b = find_elem(s, 'p:grpSp', 522)
    old = s[a:b]
    head = old.index('</p:grpSpPr>') + len('</p:grpSpPr>')
    return s[:a] + old[:head] + ''.join(rows) + '</p:grpSp>' + s[b:]
