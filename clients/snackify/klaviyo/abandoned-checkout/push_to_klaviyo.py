"""Upload the images and create the abandoned checkout template in Snackify's Klaviyo.

    KLAVIYO_API_KEY=pk_... python3 push_to_klaviyo.py [--dry-run]

Needs a private API key with Images (write) and Templates (write) scopes.
It only creates a new template; it does not touch the live flow. Swap the
template into the Abandoned Checkout flow email in Klaviyo once it's reviewed.
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
TEMPLATE_NAME = "Snackify - Abandoned Checkout - 2026 Refresh"

IMAGES = {
    "__HERO_URL__": ("images/hero.png", "snackify-abandoned-checkout-hero"),
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

    html = (HERE / "abandoned-checkout.html").read_text()
    for token, (rel_path, name) in IMAGES.items():
        url = f"https://example.invalid/{name}.png" if dry_run else upload_image(key, rel_path, name)
        print(f"{rel_path} -> {url}")
        html = html.replace(token, url)
    assert not any(token in html for token in IMAGES), "unreplaced image token"

    if dry_run:
        print("Dry run: template not created.")
        return

    payload = {"data": {"type": "template", "attributes": {
        "name": TEMPLATE_NAME, "editor_type": "CODE", "html": html,
    }}}
    res = request("POST", "/templates", key, json.dumps(payload).encode())
    print(f"Created template {res['data']['id']}: {TEMPLATE_NAME}")


if __name__ == "__main__":
    main()
