# -*- coding: utf-8 -*-
"""Sitelink assets for a criminal defense account.

Limits: text 25 chars, each description line 35 chars.
Every sitelink in a set must resolve to a DIFFERENT page - duplicate
destinations are the most common cause of sitelink disapproval.

url_status: "confirmed" = page verified to exist; "assumed" = slug proposed,
must be confirmed or built before upload.
"""
T_LIM, D_LIM = 25, 35

SETS = [
("Account level", "Inherited by every campaign", [
 ("About the Firm","Defending clients since 1982.","Local courts, local experience.","/about/","assumed"),
 ("Our Attorneys","Meet the attorney who will","handle your case personally.","/james-l-allard-jr-buddy/","confirmed"),
 ("Practice Areas","See the charges we defend in","state and federal court.","/practice-areas/","assumed"),
 ("Free Case Review","Talk through your charge with","an attorney. No obligation.","/contact/","assumed"),
 ("Client Reviews","Read what past clients say","about working with the firm.","/reviews/","assumed"),
 ("Office & Directions","Downtown location near the","courthouse. Parking on site.","/location/","assumed"),
]),
("DWI / DUI", "Campaign level", [
 ("DWI Defense","Breath tests, blood tests, and","license consequences.","/dwi-defense/","assumed"),
 ("First-Offense DWI","What to expect if this is","your first charge.","/dwi-defense/first-offense/","assumed"),
 ("DMV Hearings","Your license case is separate","from the criminal charge.","/dmv-hearings/","confirmed"),
 ("License Restoration","Steps to get your driving","privileges back.","/license-restoration/","assumed"),
]),
("Criminal Defense", "Campaign level", [
 ("Criminal Defense","Felony and misdemeanor","representation in local courts.","/criminal-defense/","assumed"),
 ("Felony Charges","What a felony charge means","and what comes next.","/felony-defense/","assumed"),
 ("Drug Charges","Possession and related","charges in state court.","/drug-charges/","assumed"),
 ("Federal Court Cases","Admitted to practice in","federal district court.","/federal-defense/","assumed"),
]),
("Traffic & License", "Campaign level", [
 ("Traffic Tickets","A ticket can cost more than","the fine. Know your options.","/traffic-tickets/","assumed"),
 ("Reckless Driving","A misdemeanor in NC, not a","simple traffic citation.","/reckless-driving/","assumed"),
 ("Speeding Citations","Points, insurance, and your","driving record.","/speeding-tickets/","assumed"),
 ("DMV Hearings","Revoked license? You can","request a hearing.","/dmv-hearings/","confirmed"),
]),
]

# Terms that flagged this account; sitelink text and descriptions must stay clear of them.
FLAGGED = ["sex","sexual","rape","gun","firearm","weapon","cocaine","meth","heroin",
           "marijuana","cannabis","trafficking","bail","bond","guarantee","guaranteed",
           "best","dropped","win","beat","avoid jail"]

# Buildable today from pages verified to exist. Sitelinks need 2 to serve, 4 to serve well.
MINIMUM_SET = ["Our Attorneys", "DMV Hearings", "Free Case Review", "About the Firm"]

def check():
    ok = True
    for name, level, links in SETS:
        print(f"\n== {name} == ({level}, {len(links)} sitelinks)")
        if len(links) < 2:
            print("  !! fewer than 2 - sitelinks will not serve"); ok = False
        if len(links) > 20:
            print("  !! more than 20 per level"); ok = False

        urls = [l[3] for l in links]
        if len(set(urls)) != len(urls):
            dupes = {u for u in urls if urls.count(u) > 1}
            print(f"  !! DUPLICATE DESTINATION in set: {sorted(dupes)} - will be disapproved"); ok = False
        texts = [l[0].lower() for l in links]
        if len(set(texts)) != len(texts):
            print("  !! duplicate sitelink text in set"); ok = False

        for text, d1, d2, url, status in links:
            issues = []
            if len(text) > T_LIM: issues.append(f"TEXT {len(text)}>{T_LIM}")
            if len(d1) > D_LIM: issues.append(f"DESC1 {len(d1)}>{D_LIM}")
            if len(d2) > D_LIM: issues.append(f"DESC2 {len(d2)}>{D_LIM}")
            blob = f"{text} {d1} {d2}".lower()
            for f in FLAGGED:
                if f in blob.split() or (" " in f and f in blob):
                    issues.append(f"FLAGGED TERM {f!r}")
            if issues: ok = False
            mark = "*" if status == "confirmed" else " "
            print(f"  {mark} {len(text):>2}/{T_LIM}  {text}")
            print(f"       {len(d1):>2}/{D_LIM}  {d1}")
            print(f"       {len(d2):>2}/{D_LIM}  {d2}")
            print(f"       -> {url}  [{status}]" + ("   <-- " + "; ".join(issues) if issues else ""))

    print("\n== Launch-today set ==")
    print("  Only these rely on pages already verified or near-certain:")
    for t in MINIMUM_SET:
        hit = [l for _, _, links in SETS for l in links if l[0] == t]
        if not hit:
            print(f"  !! {t!r} not found in any set"); ok = False; continue
        text, d1, d2, url, status = hit[0]
        print(f"     {text:<20} -> {url}  [{status}]")
    if len(set(MINIMUM_SET)) < 2:
        print("  !! fewer than 2 - would not serve"); ok = False

    total = sum(len(l) for _, _, l in SETS)
    conf = sum(1 for _, _, links in SETS for l in links if l[4] == "confirmed")
    print(f"\n{total} sitelinks in {len(SETS)} sets")
    print(f"URLs: {conf} confirmed, {total - conf} assumed (confirm or build before upload)")
    print("\nALL CLEAN" if ok else "\nISSUES FOUND")
    return ok

if __name__ == "__main__":
    import sys
    sys.exit(0 if check() else 1)
