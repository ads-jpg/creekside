"""Upload the images and create both abandoned checkout flow templates in Snackify's Klaviyo.

    KLAVIYO_API_KEY=pk_... python3 push_to_klaviyo.py [--dry-run]

Needs a private API key with Images (write) and Templates (write) scopes.
It only creates templates; it does not create or change any flow. Build the
flow from FLOW.md and pick these templates for its two emails.
Standard library only.
"""
import json
import os
import sys
import uuid
import urllib.request
from pathlib import Path

API = "https://a.klaviyo.com/api"
REVISION = "2024-10-15"
HERE = Path(__file__).resolve().parent
TEMPLATES = {
    "abandoned-checkout.html": "Snackify - Abandoned Checkout 1 - Your snacks are waiting",
    "abandoned-checkout-reminder.html": "Snackify - Abandoned Checkout 2 - Reminder",
}

IMAGES = {
    "__HERO_URL__": ("images/hero.png", "snackify-abandoned-checkout-hero"),
    "__HERO_REMINDER_URL__": ("images/hero-reminder.png", "snackify-abandoned-checkout-reminder-hero"),
    "__LOGO_GREEN_URL__": ("images/logo-green.png", "snackify-logo-green"),
    "__LOGO_WHITE_URL__": ("images/logo-white.png", "snackify-logo-white"),
    "__PRODUCT_FALLBACK_URL__": ("images/product-fallback.png", "snackify-product-fallback"),
}


def request(method, path, key, body=None, content_type="application/vnd.api+json"):
    req = urllib.request.Request(
        f"{API}{path}",
        data=body,
        method=method,
        headers={
            "Authorization": f"Klaviyo-API-Key {key}",
            "revision": REVISION,
            "accept": "application/vnd.api+json",
            "content-type": content_type,
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path} failed: {e.code} {e.read().decode()}")


def upload_image(key, rel_path, name):
    boundary = uuid.uuid4().hex
    data = (HERE / rel_path).read_bytes()
    body = b"".join([
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\n{name}\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{Path(rel_path).name}\"\r\n"
        f"Content-Type: image/png\r\n\r\n".encode(),
        data,
        f"\r\n--{boundary}--\r\n".encode(),
    ])
    res = request("POST", "/image-upload", key, body, f"multipart/form-data; boundary={boundary}")
    return res["data"]["attributes"]["image_url"]


def main():
    dry_run = "--dry-run" in sys.argv
    key = os.environ.get("KLAVIYO_API_KEY")
    if not key and not dry_run:
        sys.exit("Set KLAVIYO_API_KEY (Snackify private key).")

    urls = {}
    for token, (rel_path, name) in IMAGES.items():
        urls[token] = f"https://example.invalid/{name}.png" if dry_run else upload_image(key, rel_path, name)
        print(f"{rel_path} -> {urls[token]}")

    for filename, template_name in TEMPLATES.items():
        html = (HERE / filename).read_text()
        for token, url in urls.items():
            html = html.replace(token, url)
        assert not any(token in html for token in IMAGES), f"unreplaced image token in {filename}"
        if dry_run:
            print(f"Dry run: would create template {template_name!r}")
            continue
        payload = {"data": {"type": "template", "attributes": {
            "name": template_name, "editor_type": "CODE", "html": html,
        }}}
        res = request("POST", "/templates", key, json.dumps(payload).encode())
        print(f"Created template {res['data']['id']}: {template_name}")

if __name__ == "__main__":
    main()
