# -*- coding: utf-8 -*-
import re, os, shutil, zipfile, sys

SRC = 'tp/ppt/slides'

def load(n):
    return open(f'{SRC}/slide{n}.xml', encoding='utf-8').read()

def save(n, s):
    open(f'{SRC}/slide{n}.xml', 'w', encoding='utf-8').write(s)

def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def rep(s, old, new, n=1, ctx=None):
    """Replace <a:t>old</a:t> with <a:t>new</a:t>."""
    a, b = f'<a:t>{esc(old)}</a:t>', f'<a:t>{esc(new)}</a:t>'
    region = s if ctx is None else None
    if ctx is not None:
        i = s.find(ctx)
        assert i >= 0, f'ctx not found: {ctx[:60]}'
        j = s.find(a, i)
        assert j >= 0, f'NOT FOUND (ctx): {old[:70]!r}'
        return s[:j] + b + s[j+len(a):]
    cnt = s.count(a)
    assert cnt == n, f'expected {n} of {old[:70]!r}, found {cnt}'
    return s.replace(a, b)

def find_elem(s, tag, cnvpr_id):
    """Return (start, end) span of the <tag> element whose child cNvPr has the given id."""
    m = re.search(r'<p:cNvPr id="%d"' % cnvpr_id, s)
    assert m, f'cNvPr id={cnvpr_id} not found'
    start = s.rfind('<%s>' % tag, 0, m.start())
    assert start >= 0
    depth, i = 0, start
    open_t, close_t = '<%s>' % tag, '</%s>' % tag
    while True:
        no = s.find(open_t, i)
        nc = s.find(close_t, i)
        assert nc >= 0
        if no >= 0 and no < nc:
            depth += 1; i = no + len(open_t)
        else:
            depth -= 1; i = nc + len(close_t)
            if depth == 0:
                return start, i

# ============================================================
# Slides 1-13: brand + month replacements
# ============================================================
s = load(1)
s = rep(s, 'Full Month Performance Report (July 1 – July 31)',
           'Full Month Performance Report (October 1 – October 31)')
save(1, s)

s = load(3)
s = rep(s, 'Every environment above is purchased through the Microsoft or Google engines at publisher cost — the same inventory national advertisers buy, without a reseller standing between Tri Peaks and the impression.',
           'Every environment above is purchased through the Microsoft or Google engines at publisher cost — the same inventory national advertisers buy, without a reseller standing between Lowry Home Services and the impression.')
s = rep(s, 'CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · ',
           'CAMP Digital · Premium Streaming Media Plan · Lowry Home Services · ')
save(3, s)

s = load(5)
s = rep(s, 'Our July campaign successfully positioned Happy Camper Home Services as the dominant local plumbing brand on big-screen TVs across the Harrisburg-Lancaster-Lebanon-York DMA.',
           'Our October campaign successfully positioned Happy Camper Home Services as the dominant local plumbing brand on big-screen TVs across the Harrisburg-Lancaster-Lebanon-York DMA.')
s = rep(s, 'July achieved our primary objective of establishing a high-volume, cost-efficient local streaming baseline, securing over 1.1 million views at an efficient $8.89 CPM, demonstrating local saturation while preserving budget room to bid up for higher-tier premium placements in August.',
           'October achieved our primary objective of establishing a high-volume, cost-efficient local streaming baseline, securing over 1.1 million views at an efficient $8.89 CPM, demonstrating local saturation while preserving budget room to bid up for higher-tier premium placements in August.')
save(5, s)

s = load(6)
s = rep(s, 'Happy Camper Home Services (July Final)', 'Happy Camper Home Services (October Final)')
save(6, s)

s = load(12)
s = rep(s, 'July Wins', 'October Wins')
s = rep(s, "July's results established a strong baseline. August builds on that foundation by trading CPM headroom for better placements and deeper household reach.",
           "October's results established a strong baseline. August builds on that foundation by trading CPM headroom for better placements and deeper household reach.")
save(12, s)

s = load(13)
s = rep(s, 'Tri Peaks ', 'Lowry ')     # followed by run 'Home Services'
save(13, s)

# ============================================================
# Slide 14 -- PRICING MODEL
# ============================================================
s = load(14)
s = rep(s, "TRI PEAKS' MONTHLY MEDIA", "LOWRY'S MONTHLY MEDIA")
s = rep(s, '850,000', '733,000')

# Append the standard Tri Peaks footer group (copied from slide 15) so the
# Lowry footer line is carried over in the deck's own footer styling.
s15 = load(15)
a, b = find_elem(s15, 'p:grpSp', 572)
footer = s15[a:b]
footer = footer.replace('id="572" name="Google Shape;572;p28"', 'id="511" name="Google Shape;511;p27"')
footer = footer.replace('id="573" name="Google Shape;573;p28"', 'id="512" name="Google Shape;512;p27"')
footer = footer.replace('id="574" name="Google Shape;574;p28"', 'id="513" name="Google Shape;513;p27"')
footer = footer.replace('<a:t>CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · </a:t>',
                        '<a:t>CAMP Digital · Premium Streaming Media Plan · Lowry Services · </a:t>')
footer = footer.replace('<a:t>September</a:t>', '<a:t>October</a:t>')
footer = footer.replace('<a:t>12</a:t>', '<a:t>6</a:t>')
assert '<a:t>6</a:t>' in footer and 'Lowry Services' in footer and '<a:t>October</a:t>' in footer
i = s.rindex('</p:spTree>')
s = s[:i] + footer + s[i:]
save(14, s)

# ============================================================
# Slide 15 -- GEOGRAPHIC TARGETING
# ============================================================
s = load(15)
s = rep(s, '12 Communities. Zero Wasted Impressions.', '35 Communities. Zero Wasted Impressions.')
s = rep(s, 'Delivery is confined to the Front Range communities Tri Peaks actively services — bought by name, one city at a time, rather than as a Denver DMA broadcast buy.',
           'Delivery is confined to the suburban Philadelphia communities Lowry actively services — Montgomery, Bucks, Chester and Delaware county towns bought by name rather than by DMA.')
s = rep(s, 'A Denver DMA broadcast buy scatters impressions across the whole metro, most of them in front of households Tri Peaks cannot profitably serve. City-level CTV targeting spends the same dollars only where the trucks already run.',
           'A Philadelphia DMA broadcast buy would put roughly nine in ten impressions in front of households Lowry cannot profitably serve. City-level CTV targeting spends the same dollars only where the trucks already run.')
s = rep(s, 'Sept ', 'October ')
# stat "12" (inside the COMMUNITIES TARGETED card, shape 562) -> "35"
s = rep(s, '12', '35', ctx='COMMUNITIES TARGETED')
s = rep(s, 'CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · ',
           'CAMP Digital · Premium Streaming Media Plan · Lowry Services · ')
s = rep(s, 'September', 'October')

# ---- rebuild the community chip grid: 12 chips (3x4) -> 35 chips (5x7) ----
CITIES = [
    'Gladwyne', 'Bryn Mawr', 'Haverford', 'Bala Cynwyd', 'Blue Bell',
    'Villanova', 'Doylestown', 'Newtown', 'New Hope', 'Fort Washington',
    'Gwynedd Valley', 'Chester Springs', 'Malvern', 'Paoli', 'Devon',
    'King of Prussia', 'Ambler', 'Harleysville', 'Collegeville', 'Phoenixville',
    'Lansdale', 'Montgomeryville', 'Chalfont', 'Richboro', 'Yardley',
    'Washington Crossing', 'Kennett Square', 'Glen Mills', 'Media', 'West Chester',
    'Conshohocken', 'Plymouth Meeting', 'Lafayette Hill', 'Spring House', 'Dresher',
]
assert len(CITIES) == 35

AREA_W, AREA_H = 4457850, 2019300      # inner grid extent, unchanged
COLS, ROWS = 5, 7
GAP_X, GAP_Y = 68580, 45720
CHIP_W = (AREA_W - (COLS - 1) * GAP_X) // COLS
CHIP_H = (AREA_H - (ROWS - 1) * GAP_Y) // ROWS
PITCH_X, PITCH_Y = CHIP_W + GAP_X, CHIP_H + GAP_Y
ADJ = round(57150 / min(CHIP_W, CHIP_H) * 100000)   # keep the 0.0625" corner radius
FSZ = 700

CHIP = (
 '<p:grpSp><p:nvGrpSpPr><p:cNvPr id="{gid}" name="Google Shape;{gid};p28"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
 '<p:grpSpPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/><a:chOff x="0" y="0"/><a:chExt cx="{w}" cy="{h}"/></a:xfrm></p:grpSpPr>'
 '<p:sp><p:nvSpPr><p:cNvPr id="{rid}" name="Google Shape;{rid};p28"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
 '<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{w}" cy="{h}"/></a:xfrm>'
 '<a:prstGeom prst="roundRect"><a:avLst><a:gd fmla="val {adj}" name="adj"/></a:avLst></a:prstGeom>'
 '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
 '<a:ln cap="flat" cmpd="sng" w="9525"><a:solidFill><a:srgbClr val="A7C142"/></a:solidFill><a:prstDash val="solid"/><a:round/>'
 '<a:headEnd len="sm" w="sm" type="none"/><a:tailEnd len="sm" w="sm" type="none"/></a:ln></p:spPr>'
 '<p:txBody><a:bodyPr anchorCtr="0" anchor="ctr" bIns="0" lIns="0" spcFirstLastPara="1" rIns="0" wrap="square" tIns="0"><a:noAutofit/></a:bodyPr>'
 '<a:lstStyle/><a:p><a:pPr indent="0" lvl="0" marL="0" rtl="0" algn="l"><a:spcBef><a:spcPts val="0"/></a:spcBef>'
 '<a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr><a:r><a:t></a:t></a:r><a:endParaRPr/></a:p></p:txBody></p:sp>'
 '<p:sp><p:nvSpPr><p:cNvPr id="{tid}" name="Google Shape;{tid};p28"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
 '<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{w}" cy="{h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
 '<a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>'
 '<p:txBody><a:bodyPr anchorCtr="0" anchor="ctr" bIns="0" lIns="0" spcFirstLastPara="1" rIns="0" wrap="square" tIns="0"><a:noAutofit/></a:bodyPr>'
 '<a:lstStyle/><a:p><a:pPr indent="0" lvl="0" marL="0" rtl="0" algn="ctr"><a:spcBef><a:spcPts val="0"/></a:spcBef>'
 '<a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr>'
 '<a:r><a:rPr b="1" lang="en" sz="{sz}"><a:solidFill><a:srgbClr val="00331E"/></a:solidFill>'
 '<a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/><a:sym typeface="Arial"/></a:rPr><a:t>{txt}</a:t></a:r>'
 '<a:endParaRPr b="1" sz="{sz}"><a:solidFill><a:srgbClr val="00331E"/></a:solidFill>'
 '<a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/><a:sym typeface="Arial"/></a:endParaRPr></a:p></p:txBody></p:sp></p:grpSp>'
)

chips = []
nid = 523
for k, city in enumerate(CITIES):
    r, c = divmod(k, COLS)
    chips.append(CHIP.format(gid=nid, rid=nid + 1, tid=nid + 2,
                             x=c * PITCH_X, y=r * PITCH_Y, w=CHIP_W, h=CHIP_H,
                             adj=ADJ, sz=FSZ, txt=esc(city)))
    nid += 3

a, b = find_elem(s, 'p:grpSp', 522)
old = s[a:b]
head_end = old.index('</p:grpSpPr>') + len('</p:grpSpPr>')
new = old[:head_end] + ''.join(chips) + '</p:grpSp>'
s = s[:a] + new + s[b:]
save(15, s)

# ============================================================
# Slide 16 -- THE PROPOSAL
# ============================================================
s = load(16)
s = rep(s, 'The Tri Peaks Air Premium Streaming Plan', 'The Lowry Services Premium Streaming Plan')
s = rep(s, 'CPCV · $0.03 est. bid', 'CPCV · $0.02 est. bid')
s = rep(s, 'Home & Garden + Building Construction', 'Home & Garden in-market audience')
s = rep(s, '800,000', '550,000')
s = rep(s, '$9,000', '$8,000')
s = rep(s, '$11.25', '$14.55')
s = rep(s, 'Remarketing — Site Visitors', 'Retargeting — All Visitors')
s = rep(s, 'Remarketing list — prior site visitors', 'Remarketing list — all site visitors')
s = rep(s, '50,000', '183,000*')
s = rep(s, '$1,000', '$2,000')
s = rep(s, '$20.00', '$10.93')
s = rep(s, '850,000', '733,000')
s = rep(s, '$11.76', '$13.64')
s = rep(s, '800,000 in-market impressions build the brand across 12 Front Range communities; 50,000 remarketing impressions keep Tri Peaks in front of households that have already visited the site. Every dollar of the $10,000 is working media.',
           '550,000 in-market impressions build the brand across 35 communities; 183,000 retargeting impressions keep Lowry in front of households that have already visited the site. Every dollar of the $10,000 is working media.')
s = rep(s, 'All impressions are estimates and are not guaranteed; pricing is dynamic based on market demand. All dollars are NET USD. Implied CPM is derived from monthly investment + estimated impressions.',
           '*Retargeting impressions estimated at an average frequency of 3. All impressions are estimates and are not guaranteed; pricing is dynamic based on market demand. All dollars are NET USD. Implied CPM is derived from monthly investment ÷ estimated impressions.')
s = rep(s, 'CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · ',
           'CAMP Digital · Premium Streaming Media Plan · Lowry Services · ')
s = rep(s, 'September ', 'October ')
save(16, s)

# ============================================================
# Slide 17 -- INCLUDED AT NO ADDITIONAL COST
# ============================================================
s = load(17)
s = rep(s, 'Two Assets Tri Peaks Keeps Beyond the Impressions', 'Two Assets Lowry Keeps Beyond the Impressions')
s = rep(s, "Every household exposed to Tri Peaks' streaming ad is assembled into a remarketing list — usable across Search, Performance Max, Display, Native and Online Video.",
           "Every household exposed to Lowry's streaming ad is assembled into a remarketing list — usable across Search, Performance Max, Display, Native and Online Video.")
s = rep(s, 'The audience built by the TV campaign becomes a targeting asset for every other channel Tri Peaks runs.',
           'The audience built by the TV campaign becomes a targeting asset for every other channel Lowry runs.')
s = rep(s, 'The July plan delivers an estimated 850,000 impressions. The study requires roughly 1.5M in a 30-day window, so it becomes available as the program scales — worth revisiting once the first flight establishes a delivery and completion baseline.',
           'The October plan delivers an estimated 733,000 impressions. The study requires roughly 1.5M in a 30-day window, so it becomes available as the program scales — worth revisiting once the first flight establishes a delivery and completion baseline.')
s = rep(s, 'JULY PLAN', 'OCTOBER PLAN')
s = rep(s, '850K', '733K')
s = rep(s, 'CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · July 2026',
           'CAMP Digital · Premium Streaming Media Plan · Lowry Services · October 2026')
save(17, s)

# ============================================================
# Slide 18 -- THE RECOMMENDATION
# ============================================================
s = load(18)
s = rep(s, 'What Tri Peaks Air Receives for $10,000 a Month', 'What Lowry Services Receives for $10,000 a Month')
s = rep(s, '850,000 estimated premium CTV/OTT impressions over a 30-day flight',
           '733,000 estimated premium CTV/OTT impressions over a 30-day flight')
s = rep(s, 'Delivery confined to 12 named Front Range communities',
           'Delivery confined to 35 named suburban Philadelphia communities')
s = rep(s, 'Two in-market audience pools plus prior-site-visitor retargeting',
           'In-market Home & Garden targeting plus all-visitor retargeting')
s = rep(s, "A real-time inventory forecast across Tri Peaks' 12 communities, confirming the streaming audience supports a sustained television presence — before a dollar is committed.",
           "A real-time inventory forecast across Lowry's 35 communities, confirming the streaming audience supports a sustained television presence — before a dollar is committed.")
save(18, s)

print('chip:', CHIP_W, 'x', CHIP_H, 'adj', ADJ)
print('OK')
