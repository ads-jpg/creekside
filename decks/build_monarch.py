# -*- coding: utf-8 -*-
import re

SRC = 'mo/ppt/slides'
def load(n): return open(f'{SRC}/slide{n}.xml', encoding='utf-8').read()
def save(n, s): open(f'{SRC}/slide{n}.xml', 'w', encoding='utf-8').write(s)
def esc(t): return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def rep(s, old, new, ctx=None):
    a, b = f'<a:t>{esc(old)}</a:t>', f'<a:t>{esc(new)}</a:t>'
    if ctx is not None:
        i = s.find(ctx); assert i >= 0, f'ctx missing: {ctx[:50]}'
        j = s.find(a, i); assert j >= 0, f'NOT FOUND (ctx) {old[:60]!r}'
        return s[:j] + b + s[j+len(a):]
    cnt = s.count(a); assert cnt == 1, f'expected 1 of {old[:60]!r}, found {cnt}'
    return s.replace(a, b)

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

FOOT = 'CAMP Digital · Premium Streaming Media Plan · Monarch Home Services · '

# ---------------- slide 14 : PRICING MODEL ----------------
s = load(14)
s = rep(s, "TRI PEAKS' MONTHLY MEDIA", "MONARCH’S MONTHLY MEDIA")
s = rep(s, '$10,000', '$20,000')
s = rep(s, '850,000', '1,900,000')

# borrow the deck's standard footer group from the proposal slide
s16 = load(16)
a, b = find_elem(s16, 'p:grpSp', 631)
footer = s16[a:b]
for old_id, new_id in ((631, 511), (632, 512), (633, 513)):
    footer = footer.replace('id="%d" name="Google Shape;%d;p29"' % (old_id, old_id),
                            'id="%d" name="Google Shape;%d;p27"' % (new_id, new_id))
footer = footer.replace('<a:t>CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · </a:t>',
                        '<a:t>%s</a:t>' % FOOT)
footer = footer.replace('<a:t>September </a:t>', '<a:t>August </a:t>')
footer = footer.replace('<a:t>13</a:t>', '<a:t>6</a:t>')
assert FOOT in footer and '<a:t>August </a:t>' in footer and '<a:t>6</a:t>' in footer
i = s.rindex('</p:spTree>')
save(14, s[:i] + footer + s[i:])

# ---------------- slide 15 : GEOGRAPHIC TARGETING ----------------
import geo_patch
s = load(15)
s = rep(s, '12 Communities. Zero Wasted Impressions.', 'Five Cities. Three DMAs. Zero Wasted Impressions.')
s = rep(s, 'Delivery is confined to the Front Range communities Tri Peaks actively services — bought by name, one city at a time, rather than as a Denver DMA broadcast buy.',
           'Delivery is confined to the California cities Monarch actively services — bought by name, one city at a time, rather than as a Fresno–Visalia or Bakersfield DMA broadcast buy.')
s = rep(s, 'A Denver DMA broadcast buy scatters impressions across the whole metro, most of them in front of households Tri Peaks cannot profitably serve. City-level CTV targeting spends the same dollars only where the trucks already run.',
           'A DMA broadcast buy would scatter impressions across three separate California markets, most of them in front of households Monarch cannot profitably serve. City-level CTV targeting spends the same dollars only where the trucks already run.')
s = rep(s, 'Sept ', 'August ')
s = rep(s, '12', '5', ctx='COMMUNITIES TARGETED')
s = rep(s, 'CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · ', FOOT)
s = rep(s, 'September', 'August')
s = geo_patch.apply(s)
save(15, s)

# ---------------- slide 18 title: 24pt overflows at this length ----------------

# ---------------- slide 16 : THE PROPOSAL ----------------
s = load(16)
s = rep(s, 'The Tri Peaks Air Premium Streaming Plan', 'The Monarch Home Services Premium Streaming Plan')
s = rep(s, 'Home & Garden + Building Construction', 'Home & Garden + Building Construction & Maintenance')
s = rep(s, '800,000', '1,800,000')
s = rep(s, '$9,000', '$18,000')
s = rep(s, '$11.25', '$10.00')
s = rep(s, '50,000', '100,000')
s = rep(s, '$1,000', '$2,000')
s = rep(s, '850,000', '1,900,000')
s = rep(s, '$10,000', '$20,000')
s = rep(s, '$11.76', '$10.53')
s = rep(s, '800,000 in-market impressions build the brand across 12 Front Range communities; 50,000 remarketing impressions keep Tri Peaks in front of households that have already visited the site. Every dollar of the $10,000 is working media.',
           '1,800,000 in-market impressions build the brand across five California cities; 100,000 remarketing impressions keep Monarch in front of households that have already visited the site. Every dollar of the $20,000 is working media.')
s = rep(s, 'All impressions are estimates and are not guaranteed; pricing is dynamic based on market demand. All dollars are NET USD. Implied CPM is derived from monthly investment + estimated impressions.',
           'All impressions are estimates and are not guaranteed; pricing is dynamic based on market demand. All dollars are NET USD. Implied CPM is derived from monthly investment ÷ estimated impressions.')
s = rep(s, 'CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · ', FOOT)
s = rep(s, 'September ', 'August ')
save(16, s)

# ---------------- slide 17 : INCLUDED AT NO ADDITIONAL COST ----------------
s = load(17)
s = rep(s, 'Two Assets Tri Peaks Keeps Beyond the Impressions',
           'Two Assets Monarch Keeps — Both Unlocked at Launch')
s = rep(s, 'The plan includes added-value components that most CTV vendors either charge for or simply do not offer.',
           'The plan includes added-value components that most CTV vendors either charge for or simply do not offer. At 1.9M impressions, Monarch qualifies for both from day one.')
s = rep(s, "Every household exposed to Tri Peaks' streaming ad is assembled into a remarketing list — usable across Search, Performance Max, Display, Native and Online Video.",
           "Every household exposed to Monarch’s streaming ad is assembled into a remarketing list — usable across Search, Performance Max, Display, Native and Online Video.")
s = rep(s, 'The audience built by the TV campaign becomes a targeting asset for every other channel Tri Peaks runs.',
           'The audience built by the TV campaign becomes a targeting asset for every other channel Monarch runs.')
s = rep(s, 'Requires approximately 1.5M impressions within a 30-day period to run.',
           'Requires approximately 1.5M impressions in a 30-day period — this plan delivers an estimated 1.9M.')
s = rep(s, 'THE SCALE PATH', 'THRESHOLD CLEARED')
s = rep(s, 'Unlocking the brand lift study', 'The brand lift study is unlocked at launch')
s = rep(s, 'The July plan delivers an estimated 850,000 impressions. The study requires roughly 1.5M in a 30-day window, so it becomes available as the program scales — worth revisiting once the first flight establishes a delivery and completion baseline.',
           'The August plan delivers an estimated 1,900,000 impressions in a 30-day window — above the roughly 1.5M the Ad Effectiveness Study requires. Monarch qualifies for formal search-lift and multi-touch attribution measurement from the very first flight, at no additional cost.')
s = rep(s, 'JULY PLAN', 'AUGUST PLAN')
s = rep(s, '850K', '1.9M')
s = rep(s, 'CAMP Digital · Premium Streaming Media Plan · Tri Peaks Air · July 2026', FOOT + 'August 2026')
save(17, s)

# ---------------- slide 18 : THE RECOMMENDATION ----------------
s = load(18)
s = rep(s, 'What Tri Peaks Air Receives for $10,000 a Month',
           'What Monarch Home Services Receives for $20,000 a Month')
s = rep(s, '850,000 estimated premium CTV/OTT impressions over a 30-day flight',
           '1,900,000 estimated premium CTV/OTT impressions over a 30-day flight')
s = rep(s, 'Delivery confined to 12 named Front Range communities',
           'Delivery confined to five named California cities across three DMAs')
s = rep(s, 'Impression-Based Remarketing audience, included at no extra cost',
           'Impression-Based Remarketing and the Ad Effectiveness Study, both included')
s = rep(s, '$10,000', '$20,000')
s = rep(s, "A real-time inventory forecast across Tri Peaks' 12 communities, confirming the streaming audience supports a sustained television presence — before a dollar is committed.",
           "A real-time inventory forecast across Monarch’s five California cities, confirming the streaming audience supports a sustained television presence — before a dollar is committed.")
save(18, s)

# ---------------- speaker notes carried over ----------------
NOTES = {
 16: 'Source: Monarch Home - Media Plan worksheet. In-market line: 1,800,000 impressions / $18,000 (row 6). Remarketing line: 100,000 impressions / $2,000 (row 9). Workbook TOTAL cell M18 reads $20,000, which agrees with the sum of both line items. Implied CPMs are derived, not quoted in the workbook.',
 17: 'Key change vs. a smaller plan: at an estimated 1.9M impressions in a 30-day window the campaign clears the ~1.5M threshold the Ad Effectiveness Study requires, so both added-value components are available from the first flight rather than at a later scale step.',
}
for n, note in NOTES.items():
    p = f'mo/ppt/notesSlides/notesSlide{n}.xml'
    t = open(p, encoding='utf-8').read()
    assert t.count('<a:t></a:t>') == 1
    open(p, 'w', encoding='utf-8').write(t.replace('<a:t></a:t>', '<a:t>%s</a:t>' % esc(note)))

p18 = f'{SRC}/slide18.xml'
t = open(p18, encoding='utf-8').read()
i, j = t.find('Google Shape;668'), t.find('Google Shape;669')
assert t[i:j].count('sz="2400"') == 2
open(p18, 'w', encoding='utf-8').write(t[:i] + t[i:j].replace('sz="2400"', 'sz="2100"') + t[j:])

print('OK')
