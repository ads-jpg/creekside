"""Snackify BFCM 2026 – emails styled after Snackify's past Klaviyo campaigns."""
import os

OUT = "/home/user/creekside/snackify-bfcm"
CODE = "SNACKFRIDAY"
SITE = "https://www.snackify.co"
SHOP = "https://cdn.shopify.com/s/files/1/2616/9618/files/"
KCF = "https://d3k81ch9hvuctc.cloudfront.net/company/Lxwg3D/images/"
KCDN = "https://cdn.klaviyomail.com/company/Lxwg3D/images/"
LOGO = KCF + "b46cbdfb-d600-4ea6-9316-3a839137abfd.png"

SERIF = "Bitter,'Roboto Slab',Rockwell,Georgia,serif"
SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"

# Palette sampled from Snackify's past emails + product photography
GREEN = "#199A7B"     # Snackify logo / hero green
DEEP = "#0A6B52"      # deep green
TEAL = "#4DD0BA"
LIME = "#AED545"
RED = "#FF003C"       # matches the Holiday Celebration Box photo background
CRIMSON = "#D92F56"
CORAL = "#FF8173"
MINT = "#74D3A9"
MUSTARD = "#F4B041"
CREAM = "#F4F4F2"
NIGHT = "#0F0F10"
CARD = "#1C1C1E"
INK = "#1D2B26"
MUTED = "#5E6B66"
YELLOW = "#FFD21F"

BOX = f"{SITE}/collections/snack-boxes/products/celebration-box?variant=41809859149911"
BOXES = f"{SITE}/collections/snack-boxes"


def shop(file, w=1200):
    return f"{SHOP}{file}?width={w}"


IMG = {
    "box": shop("Holiday_2.png"),
    "box_doodle": shop("Holiday_Hover_1.png"),
    "office": shop("OfficeBox_3.png", 600),
    "family": shop("FamilyBox.png", 600),
    "gfv": shop("GlutenFreeVegan.png", 600),
    "minis": shop("1_a19f8fd7-3260-4a11-8624-0d38125c4ea8.png", 600),
    "bars": shop("Hormbles_bar_Product.png", 900),
    "salted": shop("hormbles-chormbles-salted-fudge-2400.jpg", 400),
    "milk": shop("hormbles-chormbles-milk-chocolate-2400.jpg", 400),
    "pb": shop("hormbles-chormbles-peanut-butter-2400.jpg", 400),
    "pcn": shop("hc-pdp-sup-peanut-caramel-nougat-EDITED.jpg", 400),
}
URL = {
    "office": f"{BOXES}/products/office-snacks-box",
    "family": f"{SITE}/products/family-care-package",
    "gfv": f"{BOXES}/products/gluten-free-and-vegan-box",
    "minis": f"{SITE}/products/hormbles-chormbles-protein-candy-minis",
    "bars": f"{SITE}/products/hormble-chormbles-protein-candy-bars",
    "salted": f"{SITE}/products/salted-fudge",
    "milk": f"{SITE}/products/milk-chocolate",
    "pb": f"{SITE}/products/peanut-butter",
    "pcn": f"{SITE}/products/peanut-caramel-nougat-minis",
    "giftcard": f"{SITE}/products/gift-card-pro",
}


# ------------------------------------------------------------------ shell
def page(title, preview, body, dark=False):
    outer = "#F5F5F7"
    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@700;800&display=swap" rel="stylesheet">
<style>
  body{{margin:0;padding:0;background:{outer};}}
  table{{border-collapse:collapse;}}
  img{{border:0;display:block;max-width:100%;height:auto;}}
  a{{text-decoration:none;}}
  @media only screen and (max-width:620px){{
    .container{{width:100%!important;}}
    .px{{padding-left:20px!important;padding-right:20px!important;}}
    .stack{{display:block!important;width:100%!important;box-sizing:border-box;}}
    .hide-m{{display:none!important;}}
    .h1{{font-size:40px!important;line-height:44px!important;}}
    .h2{{font-size:30px!important;line-height:34px!important;}}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{outer};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{preview}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{outer};">
<tr><td align="center" style="padding:24px 0 20px;">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;">
{header(dark)}
{body}
{footer(dark)}
</table>
</td></tr>
</table>
</body>
</html>
"""


def header(dark=False):
    bg = "#F4F4F4" if dark else "#FFFFFF"
    return f"""<tr><td align="center" style="background:{bg};padding:30px 20px 18px;">
  <a href="{SITE}"><img src="{LOGO}" width="160" alt="Snackify" style="width:160px;"></a>
</td></tr>"""


def footer(dark=False):
    bg = "#FFFFFF" if dark else "#90C01D"
    txt = "#000000" if dark else "#FFFFFF"
    return f"""<tr><td class="px" align="center" style="background:{bg};padding:14px 18px 6px;">
  <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <td style="padding-right:10px;"><a href="https://www.linkedin.com/company/snackifycollective/home/"><img src="{KCDN}5497051a-d222-4dde-9577-5f516d3402cd.png" width="32" alt="LinkedIn" style="width:32px;"></a></td>
    <td><a href="https://www.instagram.com/snackifycollective/"><img src="{KCF}1bd4a4e9-592c-4cbb-ad69-d59342c288fc.png" width="32" alt="Instagram" style="width:32px;"></a></td>
  </tr></table>
</td></tr>
<tr><td class="px" align="center" style="background:{bg};padding:8px 18px 16px;font-family:{SANS};font-size:10px;line-height:14px;color:{txt};">
  No longer want to receive these emails? {{% unsubscribe %}}.<br>{{{{ organization.name }}}} {{{{ organization.full_address }}}}
</td></tr>"""


# ------------------------------------------------------------------ atoms
def h(text, size=44, color=INK, mb=12, cls="h1", align="center"):
    return f'<h1 class="{cls}" style="margin:0 0 {mb}px;font-family:{SERIF};font-size:{size}px;line-height:{int(size*1.1)}px;font-weight:800;color:{color};text-align:{align};">{text}</h1>'


def eyebrow(text, color, mb=10, align="center"):
    return f'<p style="margin:0 0 {mb}px;font-family:{SANS};font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:{color};text-align:{align};">{text}</p>'


def p(text, color=INK, size=17, mb=0, align="center", font=SANS):
    return f'<p style="margin:0 0 {mb}px;font-family:{font};font-size:{size}px;line-height:{int(size*1.5)}px;color:{color};text-align:{align};">{text}</p>'


def pill(label, href, bg, fg="#FFFFFF", align="center", size=16):
    return f"""<table role="presentation" cellpadding="0" cellspacing="0" align="{align}"><tr>
  <td align="center" bgcolor="{bg}" style="background:{bg};border-radius:999px;">
    <a href="{href}" style="display:inline-block;padding:15px 34px;font-family:{SANS};font-size:{size}px;font-weight:800;letter-spacing:0.5px;color:{fg};border-radius:999px;">{label} &rarr;</a>
  </td></tr></table>"""


def sparkles(color, items=("☆", "✦", "◦", "✧")):
    cells = "".join(f'<div style="font-family:{SANS};font-size:22px;line-height:22px;color:{color};padding:14px 0;">{i}</div>' for i in items)
    return f'<td class="hide-m" width="56" valign="top" align="center" style="padding-top:6px;">{cells}</td>'


def hero(bg, eyebrow_txt, eyebrow_c, title, title_c, sub, sub_c, deco_c, deco=("☆", "✦", "◦", "✧"), deco_r=("✧", "☆", "✦", "◦")):
    return f"""<tr><td style="background:{bg};padding:40px 14px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    {sparkles(deco_c, deco)}
    <td align="center" valign="top" style="padding:0 8px;">
      {eyebrow(eyebrow_txt, eyebrow_c)}
      {h(title, 50, title_c, 14)}
      {p(sub, sub_c, 19, 8, font=SERIF)}
    </td>
    {sparkles(deco_c, deco_r)}
  </tr></table>
</td></tr>"""


def full_img(src, href, alt, bg, pad="0", radius=0, w=600):
    return f"""<tr><td align="center" style="background:{bg};padding:{pad};">
  <a href="{href}"><img src="{src}" width="{w}" alt="{alt}" style="width:100%;max-width:{w}px;border-radius:{radius}px;"></a>
</td></tr>"""


def code_box(dark=False, label="Use code at checkout", note="30% off every box"):
    c = LIME if dark else GREEN
    t = "#FFFFFF" if dark else INK
    s = "#BBBBBB" if dark else MUTED
    bg = "#161617" if dark else "#FFFFFF"
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td align="center" style="background:{bg};border:2px dashed {c};border-radius:14px;padding:20px 16px;font-family:{SANS};">
    <div style="font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:{t};">{label}</div>
    <div style="font-family:{SERIF};font-size:44px;line-height:54px;font-weight:800;letter-spacing:4px;color:{c};">{CODE}</div>
    <div style="font-size:14px;color:{s};">{note}</div>
  </td></tr></table>"""


def tiles(items, bg_cell, title_c, body_c, icon_c, border=None):
    """Three Freaky-Friday style tiles. items = [(icon, title, body)]."""
    b = f"border:1px solid {border};" if border else ""
    cells = "".join(f"""<td class="stack" width="33%" valign="top" style="padding:6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{bg_cell};border-radius:14px;{b}"><tr>
    <td align="center" style="padding:22px 12px 24px;font-family:{SANS};">
      <div style="font-size:26px;line-height:28px;color:{icon_c};">{i}</div>
      <div style="font-family:{SERIF};font-size:19px;line-height:23px;font-weight:800;color:{title_c};margin:12px 0 6px;">{t}</div>
      <div style="font-size:14px;line-height:20px;color:{body_c};">{bd}</div>
    </td></tr></table></td>""" for i, t, bd in items)
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{cells}</tr></table>'


def feature_card(img, href, img_bg, eb, eb_c, title, desc, btn, btn_bg, card_bg, title_c, desc_c, price=True, strike_c="#999999"):
    price_html = f"""<div style="margin:2px 0 10px;"><span style="font-family:{SERIF};font-size:34px;font-weight:800;color:{btn_bg};">30% off</span>
      <br><span style="font-family:{SANS};font-size:13px;font-weight:800;letter-spacing:1.5px;color:{desc_c};">WITH CODE {CODE}</span></div>""" if price else ""
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{card_bg};border-radius:18px;"><tr>
  <td class="stack" width="46%" valign="middle" style="padding:16px;">
    <a href="{href}"><img src="{img}" width="240" alt="{title}" style="width:100%;border-radius:14px;background:{img_bg};"></a>
  </td>
  <td class="stack" width="54%" valign="middle" style="padding:16px 22px 22px 6px;">
    {eyebrow(eb, eb_c, 6, "left")}
    <div style="font-family:{SERIF};font-size:26px;line-height:30px;font-weight:800;color:{title_c};margin-bottom:6px;"><a href="{href}" style="color:{title_c};">{title}</a></div>
    {price_html}
    {p(desc, desc_c, 15, 16, "left")}
    {pill(btn, href, btn_bg, align="left", size=14)}
  </td></tr></table>"""


def color_tile(img, href, bg, title, line, btn, btn_bg, fg="#FFFFFF", btn_fg="#FFFFFF", width="50%"):
    """Last-year 'It's Crunch Time' style tile."""
    return f"""<td class="stack" width="{width}" valign="top" align="center" style="background:{bg};padding:26px 18px 30px;">
  <a href="{href}"><img src="{img}" width="210" alt="{title}" style="width:210px;max-width:100%;margin:0 auto;border-radius:12px;"></a>
  <div style="font-family:{SERIF};font-size:21px;line-height:25px;font-weight:800;color:{fg};margin:16px 0 6px;"><a href="{href}" style="color:{fg};">{title}</a></div>
  <div style="font-family:{SERIF};font-size:15px;line-height:21px;color:{fg};margin-bottom:16px;">{line}</div>
  {pill(btn, href, btn_bg, btn_fg, size=13)}
</td>"""


def stat(big, small, bg, fg):
    return f"""<td class="stack" width="50%" valign="top" style="padding:6px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{bg};border-radius:12px;"><tr>
  <td align="center" style="padding:18px 10px;font-family:{SANS};">
    <div style="font-size:36px;line-height:40px;font-weight:900;color:{fg};">{big}</div>
    <div style="font-size:14px;font-weight:700;color:{fg};">{small}</div>
  </td></tr></table></td>"""


def terms(dark=False, ship=False):
    bg = NIGHT if dark else "#FFFFFF"
    c = "#8A8A8A" if dark else MUTED
    extra = " Free shipping valid 11/30/2026 only. [Free shipping limits, if any.]" if ship else ""
    return f"""<tr><td class="px" align="center" style="background:{bg};padding:6px 40px 24px;font-family:{SANS};font-size:12px;line-height:18px;color:{c};">
  30% off with code {CODE} through 11/30/2026 at 11:59 PM ET.{extra} [Exclusions.]
</td></tr>"""


def crunch_grid(heading="It&rsquo;s Crunch Time", sub="More boxes, same 30% off."):
    return f"""<tr><td class="px" align="center" style="background:{CREAM};padding:40px 30px 26px;">
  {h(heading, 36, GREEN, 6, "h2")}
  {p(sub, MUTED, 16, 0, font=SERIF)}
</td></tr>
<tr><td style="padding:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      {color_tile(IMG['office'], URL['office'], CORAL, "The Office Snacks Box", "100% meeting fuel.", "Get Desk Power", MINT)}
      {color_tile(IMG['family'], URL['family'], MINT, "Family Care Package", "The one thing everyone agrees on.", "Yum for All", CORAL)}
    </tr>
    <tr>
      {color_tile(IMG['gfv'], URL['gfv'], MUSTARD, "Gluten Free &amp; Vegan Box", "All yummy. No angry tummy.", "Plant-Powered Munchies", DEEP)}
      {color_tile(IMG['minis'], URL['minis'], TEAL, "Hormbles Chormbles Minis", "The candy bar that went to the gym.", "Grab a Bag", DEEP)}
    </tr>
  </table>
</td></tr>"""


# ================================================================== EMAIL 1
e1 = f"""
{hero(RED, "Early access &middot; Thanksgiving Day", "#FFE3EA", "Snack Friday<br>Starts Now", "#FFFFFF",
      "You&rsquo;re in before the rush: <b>30% off every box.</b>", "#FFFFFF", "#FFFFFF")}
{full_img(IMG['box'], BOX, "Holiday Celebration Box", RED)}
<tr><td align="center" style="background:{RED};padding:4px 40px 40px;">
  {pill("Shop the Celebration Box", BOX, "#FFFFFF", RED)}
</td></tr>
<tr><td class="px" align="center" style="background:#FFFFFF;padding:44px 34px 10px;">
  {eyebrow("The star of the season", RED)}
  {h("Meet the Holiday Celebration Box", 34, INK, 10, "h2")}
  {p("Premium snacks from emerging brands, packed to turn team wins, thank-yous and holiday parties into moments people remember. Thoughtful, not generic.", MUTED, 16, 22)}
</td></tr>
<tr><td style="background:#FFFFFF;padding:0 24px 10px;">
  {tiles([("🎁", "11&ndash;13 snacks", "Premium picks from emerging brands"),
          ("🎄", "13&ndash;16 servings", "Enough to share (or not)"),
          ("✦", "30% off", f"With code {CODE}")],
         "#FFF0F3", INK, MUTED, RED)}
</td></tr>
<tr><td class="px" style="background:#FFFFFF;padding:20px 40px 44px;">
  {code_box(note="30% off every box &middot; through Cyber Monday")}
</td></tr>
{crunch_grid()}
{terms()}
"""

# ================================================================== EMAIL 2
e2 = f"""
{hero(GREEN, "Black Friday &middot; 30% off", LIME, "Black Friday?<br>It&rsquo;s Snack Friday!", "#FFFFFF",
      f"Every box is 30% off with code <b style='background:#FFFFFF;color:{GREEN};padding:0 6px;'>{CODE}</b>", "#FFFFFF", "#FFFFFF")}
<tr><td style="background:{GREEN};padding:14px 40px 10px;">
  <a href="{BOX}"><img src="{IMG['box_doodle']}" width="520" alt="Holiday Celebration Box" style="width:100%;border-radius:18px;"></a>
</td></tr>
<tr><td align="center" style="background:{GREEN};padding:22px 40px 44px;">
  {pill("Get 30% Off", BOX, LIME, "#FFFFFF")}
</td></tr>
<tr><td class="px" style="background:{CREAM};padding:40px 30px;">
  {feature_card(IMG['box'], BOX, RED, "Black Friday pick", RED, "Holiday Celebration Box",
                "Festive bites from emerging brands. No elf required.", "Get 30% Off", RED, "#FFFFFF", INK, MUTED)}
</td></tr>
<tr><td class="px" align="center" style="background:{TEAL};padding:44px 40px 18px;">
  {eyebrow("Also 30% off", DEEP)}
  {h("Meet the Candy Bar That Went to the Gym", 34, DEEP, 10, "h2")}
  {p("Say hello to <b>Hormbles Chormbles.</b>", DEEP, 18, 0, font=SERIF)}
</td></tr>
<tr><td style="background:{TEAL};padding:16px 40px 6px;">
  <a href="{URL['bars']}"><img src="{IMG['bars']}" width="520" alt="Hormbles Chormbles Protein Candy Bars" style="width:100%;border-radius:18px;background:#FFFFFF;"></a>
</td></tr>
<tr><td style="background:{TEAL};padding:16px 34px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{DEEP};border-radius:18px;"><tr><td style="padding:26px 18px 22px;">
    <div style="text-align:center;font-family:{SERIF};font-size:26px;line-height:30px;font-weight:800;color:#FFFFFF;">Tastes like candy.<br><span style="color:{LIME};">Built like a snack.</span></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;"><tr>
      {stat("10g", "protein per bar", LIME, DEEP)}
      {stat("0g", "sugar", YELLOW, "#3B2A12")}
    </tr></table>
    {p("Rich chocolate packed with crispy protein pieces, from the co-founder of RXBAR. <span style='color:" + LIME + ";font-weight:700;'>Just chocolate.</span>", "#FFFFFF", 15, 0)}
  </td></tr></table>
</td></tr>
<tr><td align="center" style="background:{TEAL};padding:24px 40px 44px;">
  {pill("Shop Hormbles", URL['bars'], DEEP)}
</td></tr>
<tr><td class="px" style="background:#FFFFFF;padding:40px 40px 20px;">
  {code_box(note="30% off every box &amp; snack &middot; through Cyber Monday")}
</td></tr>
{terms()}
"""

# ================================================================== EMAIL 3
e3 = f"""
{hero(CRIMSON, "30% off every gift", "#FFE0E8", "The Snackify<br>Gift Guide", "#FFFFFF",
      "Gifts they&rsquo;ll actually eat.", "#FFFFFF", "#FFFFFF", ("❄", "✦", "◦", "☆"), ("☆", "◦", "❄", "✦"))}
<tr><td class="px" style="background:{CRIMSON};padding:20px 34px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:20px;"><tr><td style="padding:14px;">
    <a href="{BOX}"><img src="{IMG['box_doodle']}" width="500" alt="Holiday Celebration Box" style="width:100%;border-radius:14px;"></a>
    <div style="padding:18px 10px 8px;text-align:center;">
      {eyebrow("Our #1 holiday gift", RED, 6)}
      <div style="font-family:{SERIF};font-size:30px;line-height:34px;font-weight:800;color:{INK};margin-bottom:6px;">Holiday Celebration Box</div>
      <div style="margin:0 0 10px;"><span style="font-family:{SERIF};font-size:32px;font-weight:800;color:{RED};">30% off</span><br><span style="font-family:{SANS};font-size:13px;font-weight:800;letter-spacing:1.5px;color:{MUTED};">WITH CODE {CODE}</span></div>
      {p("11&ndash;13 premium snacks for team wins, thank-yous and holiday parties.", MUTED, 15, 18)}
      {pill("Jingle All the Snacks", BOX, RED)}
    </div>
  </td></tr></table>
</td></tr>
<tr><td class="px" align="center" style="background:{CREAM};padding:40px 30px 26px;">
  {h("A Box for Everyone", 36, GREEN, 6, "h2")}
  {p("Check off the whole list at 30% off.", MUTED, 16, 0, font=SERIF)}
</td></tr>
<tr><td style="padding:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      {color_tile(IMG['office'], URL['office'], CORAL, "For the Office", "The Office Snacks Box: 100% meeting fuel.", "Gift the Team", DEEP)}
      {color_tile(IMG['family'], URL['family'], MINT, "For Remote Teams &amp; Families", "Family Care Package: snacks for home.", "Send Some Love", CRIMSON)}
    </tr>
    <tr>
      {color_tile(IMG['gfv'], URL['gfv'], MUSTARD, "For the Plant-Based", "Gluten Free &amp; Vegan Box.", "Plant-Powered Munchies", DEEP)}
      {color_tile(IMG['minis'], URL['minis'], TEAL, "Stocking Stuffer", "Hormbles Minis. 3 Minis = 10g protein.", "Stuff a Stocking", CRIMSON)}
    </tr>
  </table>
</td></tr>
<tr><td class="px" style="background:#FFFFFF;padding:36px 34px 10px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{CREAM};border-radius:18px;"><tr>
    <td class="stack" valign="middle" style="padding:24px 26px;">
      <div style="font-family:{SERIF};font-size:24px;line-height:28px;font-weight:800;color:{INK};">Can&rsquo;t pick? Send a gift card.</div>
      {p("Let them build their own snack stash.", MUTED, 15, 0, "left")}
    </td>
    <td class="stack" valign="middle" align="right" style="padding:0 26px 24px;">
      {pill("Shop Gift Cards", URL['giftcard'], GREEN, size=14)}
    </td>
  </tr></table>
</td></tr>
<tr><td class="px" style="background:#FFFFFF;padding:24px 40px 20px;">
  {code_box()}
</td></tr>
<tr><td align="center" style="background:#FFFFFF;padding:0 40px 18px;">
  {p("[Order by DATE for delivery before the holidays.]", MUTED, 14)}
</td></tr>
{terms()}
"""

# ================================================================== EMAIL 4 (dark, Freaky Friday style)
def flavor(img, href, name):
    return f"""<td width="50%" valign="top" style="padding:6px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{CARD};border:1px solid #2E2E30;border-radius:14px;"><tr><td align="center" style="padding:10px 10px 14px;">
    <a href="{href}"><img src="{img}" width="160" alt="{name}" style="width:100%;border-radius:10px;"></a>
    <div style="font-family:{SERIF};font-size:15px;line-height:19px;font-weight:800;color:#FFFFFF;margin-top:10px;"><a href="{href}" style="color:#FFFFFF;">{name}</a></div>
  </td></tr></table></td>"""

e4 = f"""
{hero(NIGHT, "One day only &middot; Cyber Monday", LIME, "Cyber Monday", "#FFFFFF",
      "30% off every box <b>plus free shipping</b>. Today only, and it all ends at midnight.", "#D8D8D8", LIME, ("❄", "✦", "☆", "✧"), ("☆", "✧", "❄", "✦"))}
<tr><td class="px" style="background:{NIGHT};padding:24px 44px 10px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{RED};border-radius:22px;"><tr><td>
    <a href="{BOX}"><img src="{IMG['box']}" width="512" alt="Holiday Celebration Box" style="width:100%;border-radius:22px;"></a>
  </td></tr></table>
</td></tr>
<tr><td class="px" align="center" style="background:{NIGHT};padding:34px 30px 8px;">
  {h("Two deals. One day.", 32, "#FFFFFF", 6, "h2")}
</td></tr>
<tr><td style="background:{NIGHT};padding:10px 24px 10px;">
  {tiles([("✂", "30% off", f"Every box with code {CODE}"),
          ("🚚", "Free shipping", "On every order, today only"),
          ("⏰", "Ends tonight", "Midnight ET, then it&rsquo;s gone")],
         CARD, "#FFFFFF", "#BBBBBB", LIME, "#2E2E30")}
</td></tr>
<tr><td class="px" style="background:{NIGHT};padding:26px 34px 44px;">
  {code_box(dark=True, label="Cyber Monday code", note="30% off + free shipping &middot; ends at midnight")}
</td></tr>
<tr><td class="px" style="background:#161617;padding:40px 30px;">
  {feature_card(IMG['box'], BOX, RED, "Cyber Monday pick", LIME, "Holiday Celebration Box",
                "Festive, premium snacks from emerging brands. Ships free today.", "Get 30% Off", RED, CARD, "#FFFFFF", "#CCCCCC", strike_c="#777777")}
</td></tr>
<tr><td class="px" align="center" style="background:{NIGHT};padding:42px 30px 10px;">
  {eyebrow("Hormbles Chormbles", LIME, 6)}
  {h("Which flavor are you?", 32, "#FFFFFF", 6, "h2")}
  {p("Protein candy with real candy-bar crunch. 30% off today.", "#BBBBBB", 15, 0)}
</td></tr>
<tr><td style="background:{NIGHT};padding:16px 24px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    {flavor(IMG['salted'], URL['salted'], "Salted Fudge")}
    {flavor(IMG['milk'], URL['milk'], "Milk Chocolate")}
  </tr><tr>
    {flavor(IMG['pb'], URL['pb'], "Peanut Butter")}
    {flavor(IMG['pcn'], URL['pcn'], "Peanut Caramel Nougat")}
  </tr></table>
</td></tr>
<tr><td class="px" align="center" style="background:{NIGHT};padding:40px 40px 34px;">
  {h("Gone by midnight.", 32, "#FFFFFF", 8, "h2")}
  {p("Stock the office, send a holiday thank-you, or treat yourself.", "#D8D8D8", 16, 22)}
  {pill("Shop All Boxes", BOXES, LIME, NIGHT)}
</td></tr>
{terms(dark=True, ship=True)}
"""

# ================================================================== EMAIL 5
def tick(n, label):
    return f"""<td align="center" style="padding:0 5px;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;"><tr><td align="center" style="width:80px;padding:12px 0;font-family:{SANS};">
    <div style="font-family:{SERIF};font-size:34px;line-height:38px;font-weight:800;color:{RED};">{n}</div>
    <div style="font-size:10px;font-weight:800;letter-spacing:1.5px;color:{MUTED};">{label}</div>
  </td></tr></table></td>"""

e5 = f"""
{hero(RED, "⏰ Final hours", "#FFE3EA", "Gone by<br>Midnight.", "#FFFFFF",
      "30% off every box <b>and</b> free shipping both end tonight.", "#FFFFFF", "#FFFFFF")}
<tr><td align="center" style="background:{RED};padding:14px 20px 6px;">
  <!-- Swap for a live countdown GIF (e.g. Sendtric) ending 11/30 11:59 PM ET -->
  <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    {tick("00", "DAYS")}{tick("05", "HRS")}{tick("59", "MIN")}
  </tr></table>
</td></tr>
{full_img(IMG['box_doodle'], BOX, "Holiday Celebration Box", RED, "18px 0 0")}
<tr><td align="center" style="background:{RED};padding:6px 40px 42px;">
  {pill("Grab the Box for 30% Off", BOX, "#FFFFFF", RED)}
</td></tr>
<tr><td class="px" style="background:#FFFFFF;padding:40px 34px 10px;">
  {code_box(label="Last chance code", note="30% off + free shipping &middot; ends at 11:59 PM ET")}
</td></tr>
<tr><td class="px" align="center" style="background:#FFFFFF;padding:36px 30px 18px;">
  {h("Last-Minute Picks", 32, GREEN, 0, "h2")}
</td></tr>
<tr><td style="padding:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    {color_tile(IMG['office'], URL['office'], CORAL, "Office Snacks Box", "100% meeting fuel.", "Shop", DEEP, width="33%")}
    {color_tile(IMG['minis'], URL['minis'], TEAL, "Hormbles Minis", "Candy, but make it protein.", "Shop", CRIMSON, width="33%")}
    {color_tile(IMG['family'], URL['family'], MINT, "Family Care Package", "Yum for all.", "Shop", DEEP, width="33%")}
  </tr></table>
</td></tr>
<tr><td class="px" align="center" style="background:{CREAM};padding:28px 44px;">
  {p("<b>P.S.</b> This is the last time we&rsquo;ll offer 30% off this year. Don&rsquo;t say we didn&rsquo;t warn you. 😉", INK, 15, 0, font=SERIF)}
</td></tr>
{terms(ship=True)}
"""

EMAILS = [
    ("01-early-access.html", "Snack Friday starts now (you're early)", "30% off every box with code SNACKFRIDAY. Shop before the rush.", e1, False),
    ("02-black-friday-hormbles.html", "Black Friday? It's Snack Friday! 30% Off", "Every box is 30% off with SNACKFRIDAY, plus meet Hormbles Chormbles.", e2, False),
    ("03-gift-guide.html", "Gifts they'll actually eat (30% off) 🎁", "The Holiday Celebration Box and more, all 30% off.", e3, False),
    ("04-cyber-monday-hormbles-flavors.html", "Cyber Monday: 30% Off + FREE Shipping 🚚", "Two deals, one day. Ends at midnight.", e4, True),
    ("05-last-call.html", "Gone by midnight: 30% off + free shipping", "Your last chance for SNACKFRIDAY savings.", e5, False),
]

if __name__ == "__main__":
    for fn, title, preview, body, dark in EMAILS:
        with open(os.path.join(OUT, fn), "w") as f:
            f.write(page(title, preview, body, dark))
    print("ok")
