"""Render both flow emails with sample Started Checkout data -> preview.html, preview-reminder.html.

Klaviyo's template language is Django-style; this translates the handful of
tags/filters the template uses into Jinja2 so we can preview locally.
Run from anywhere: python3 source/build_preview.py
"""
import re
from pathlib import Path

from jinja2 import ChainableUndefined, Environment

ROOT = Path(__file__).resolve().parent.parent

SAMPLE = {
    "person": {"first_name": "Jamie"},
    "organization": {
        "name": "Snackify",
        "url": "#",
        "full_address": "123 Snack Street, Austin, TX 78701",
    },
    "event": {
        "$value": 41.97,
        "extra": {
            "responsive_checkout_url": "#checkout",
            "line_items": [
                {
                    "title": "Sea Salt Veggie Crisps",
                    "variant_title": "Family Size",
                    "quantity": 2.0,
                    "line_price": 17.98,
                    "product": {"title": "Sea Salt Veggie Crisps", "images": [{"src": "source/sample/crisps.png"}]},
                },
                {
                    "title": "Peanut Butter Protein Bars (12 pk)",
                    "variant_title": "Default Title",
                    "quantity": 1.0,
                    "line_price": 15.99,
                    "product": {"title": "Peanut Butter Protein Bars (12 pk)", "images": [{"src": "source/sample/bars.png"}]},
                },
                {
                    "title": "Mystery Snack Pack",
                    "variant_title": "",
                    "quantity": 1.0,
                    "line_price": 8.00,
                    "product": {"title": "Mystery Snack Pack", "images": []},
                },
            ],
        },
    },
}

LOCAL_IMAGES = {
    "__HERO_URL__": "images/hero.png",
    "__HERO_REMINDER_URL__": "images/hero-reminder.png",
    "__LOGO_GREEN_URL__": "images/logo-green.png",
    "__LOGO_WHITE_URL__": "images/logo-white.png",
    "__PRODUCT_FALLBACK_URL__": "images/product-fallback.png",
}


def to_jinja(src: str) -> str:
    src = re.sub(r"\{%\s*currency_format\s+(.+?)\s*%\}", r"{{ (\1)|currency }}", src)
    src = src.replace("{% unsubscribe_url %}", "#unsubscribe")
    src = src.replace("forloop.first", "loop.first")
    src = re.sub(r"\.(\d+)\.", r"[\1].", src)
    src = re.sub(r"\|(default|floatformat|lookup):('[^']*'|[\w.\[\]]+)", r"|k\1(\2)", src)
    return src


def kdefault(value, fallback):
    return value if value else fallback


def kfloatformat(value, places):
    return f"{float(value):.{int(places)}f}"


def klookup(obj, key):
    return obj.get(key, "")


env = Environment(autoescape=False, undefined=ChainableUndefined)  # Klaviyo renders missing values as empty
env.filters.update(kdefault=kdefault, kfloatformat=kfloatformat, klookup=klookup,
                   currency=lambda v: f"${float(v):,.2f}")

EMAILS = {
    "abandoned-checkout.html": "preview.html",
    "abandoned-checkout-reminder.html": "preview-reminder.html",
}

for template, preview in EMAILS.items():
    html = (ROOT / template).read_text()
    for token, path in LOCAL_IMAGES.items():
        html = html.replace(token, path)
    out = env.from_string(to_jinja(html)).render(**SAMPLE)
    # Load the free stand-in fonts locally so the preview matches what Gmail/Apple Mail users see.
    out = out.replace("</head>", '<link rel="stylesheet" href="source/fonts.css">\n</head>', 1)
    (ROOT / preview).write_text(out)
    print("wrote", ROOT / preview)
