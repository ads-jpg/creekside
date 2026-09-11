# -*- coding: utf-8 -*-
"""Keyword plan for the two-vertical criminal defense account.

Restructured to match the RSAs in rsa-ad-copy.md. Each ad group names the RSA that serves
it, so keyword intent and ad copy stay in step - a keyword whose ad group runs the wrong
RSA is a Quality Score problem no bid adjustment fixes.

{city} is a placeholder - substitute the market before upload.
Match types: [exact] and "phrase" only. No broad match without conversion data.
"""

CAMPAIGNS = [
("Drunk Driving Defense", "RSA 2 - Drunk Driving Defense", [
  ("Drunk Driving", [
    "[drunk driving lawyer]","[drunk driving attorney]","\"drunk driving defense attorney\"",
    "\"drunk driving defense lawyer\"","\"drunk driving lawyer near me\"",
    "\"drunk driving charge attorney\"","\"arrested for drunk driving lawyer\"",
    "\"drunk driving lawyer {city}\""]),
  ("DWI Attorney", [
    "[dwi lawyer]","[dwi attorney]","[dwi lawyer near me]","[dwi attorney near me]",
    "[dwi lawyer {city}]","[dwi attorney {city}]","\"dwi defense lawyer\"",
    "\"dwi defense attorney\"","\"hire a dwi lawyer\""]),
  ("DUI Attorney", [
    "[dui lawyer]","[dui attorney]","[dui lawyer near me]","[dui attorney near me]",
    "[dui lawyer {city}]","\"dui defense attorney\"","\"dui defense lawyer\""]),
  ("First Offense", [
    "\"first offense dwi lawyer\"","\"first offense dui lawyer\"","\"first dwi attorney\"",
    "\"first time dwi lawyer\"","\"first time dui attorney\""]),
  ("Repeat & Felony DWI", [
    "\"second dwi lawyer\"","\"second offense dwi attorney\"","\"third dwi lawyer\"",
    "\"felony dwi lawyer\"","\"felony dwi attorney\"","\"habitual dwi lawyer\"",
    "\"repeat dwi attorney\""]),
  ("DMV Hearings & License", [
    "\"dmv hearing lawyer\"","\"dmv hearing attorney\"","\"license restoration lawyer\"",
    "\"license restoration attorney\"","\"revoked license attorney\"",
    "\"get my license back lawyer\"","\"driving while license revoked lawyer\"",
    "\"dwlr attorney\""]),
]),
("Felony Criminal Defense", "RSA 1 - Felony Criminal Defense", [
  ("Felony Defense", [
    "[felony lawyer]","[felony attorney]","[felony lawyer near me]","[felony attorney {city}]",
    "\"felony defense lawyer\"","\"felony defense attorney\"","\"felony charge attorney\"",
    "\"felony criminal defense attorney\"","\"felony criminal lawyer\"",
    "\"habitual felon lawyer\""]),
  ("Criminal Defense", [
    "[criminal defense attorney]","[criminal defense lawyer]","[criminal lawyer near me]",
    "[criminal defense attorney {city}]","[criminal lawyer {city}]",
    "\"criminal defense law firm\"","\"hire a criminal defense lawyer\""]),
  ("Drug Charges", [
    "\"drug charge lawyer\"","\"drug charge attorney\"","\"drug possession lawyer\"",
    "\"drug possession attorney\"","\"possession charge lawyer\"","\"drug crime lawyer\""]),
  ("Assault & Violent", [
    "\"assault charge lawyer\"","\"assault charge attorney\"","\"assault defense lawyer\"",
    "\"assault attorney near me\"","\"violent crime attorney\""]),
  ("Federal Defense (phase 2)", [
    "\"federal criminal defense attorney\"","\"federal criminal lawyer\"",
    "\"federal defense attorney\"","\"federal charges lawyer\""]),
]),
("General Criminal Defense (optional third)", "RSA 3 - General Criminal Defense", [
  ("General Criminal", [
    "[criminal attorney near me]","\"criminal law firm {city}\"",
    "\"defense attorney for criminal charges\"","\"criminal defense representation\""]),
  ("Misdemeanor Defense", [
    "\"misdemeanor lawyer\"","\"misdemeanor attorney\"","\"misdemeanor defense lawyer\"",
    "\"misdemeanor charge attorney\""]),
]),
]

# Held, not deleted. No RSA serves these under the two-vertical structure.
HELD = [
("Traffic & License", [
  ("Traffic Tickets", [
    "[traffic ticket lawyer]","[traffic ticket attorney]","[traffic lawyer near me]",
    "[traffic attorney {city}]","\"fight a traffic ticket lawyer\"","\"traffic violation attorney\""]),
  ("Speeding Tickets", [
    "\"speeding ticket lawyer\"","\"speeding ticket attorney\"",
    "\"speeding ticket lawyer near me\"","\"speeding citation attorney\""]),
  ("Reckless Driving", [
    "\"reckless driving lawyer\"","\"reckless driving attorney\"",
    "\"reckless driving ticket lawyer\"","\"careless driving attorney\""]),
]),
]

# Negatives are the actual policy control: a phrase-match keyword can still MATCH a
# sensitive search even when the keyword itself is clean.
NEGATIVES = {
"Policy - sensitive category": [
  "sex","sexual","rape","molest","indecent","solicitation","prostitution",
  "child","minor","statutory","registry","sex offender",
  "gun","guns","firearm","weapon","weapons","concealed carry",
  "cocaine","meth","methamphetamine","heroin","fentanyl","opioid","opiate",
  "marijuana","cannabis","narcotics","trafficking","distribution",
  "bail","bond","bonds","bondsman","bail bonds"],
"Waste - won't pay": [
  "free","pro bono","public defender","legal aid","cheap","low cost","court appointed",
  "payment plan","no money","cant afford"],
"Waste - research intent": [
  "how to","what is","what happens","definition","meaning","penalty","penalties",
  "sentence","sentencing","statute","laws","law school","reddit","forum","wiki"],
"Waste - wrong job": [
  "jobs","job","salary","career","internship","become a","hiring","resume"],
"Waste - records & lookup": [
  "inmate","jail","mugshot","mugshots","arrest records","court records","case lookup",
  "warrant search","docket","expunge my own","who is in jail"],
"Waste - other practice areas": [
  "divorce","custody","child support","family law","personal injury","car accident",
  "injury","malpractice","bankruptcy","immigration","workers comp","estate","will",
  "probate","disability","real estate","landlord"],
}

def all_keywords(include_held=False):
    for camp, rsa, groups in CAMPAIGNS:
        for ag, kws in groups:
            for k in kws:
                yield camp, ag, k
    if include_held:
        for camp, groups in HELD:
            for ag, kws in groups:
                for k in kws:
                    yield camp, ag, k

def bare(k):
    return k.strip('[]"').lower()

def check():
    ok = True
    active = list(all_keywords())
    everything = list(all_keywords(include_held=True))

    seen = {}
    for camp, ag, k in everything:
        b = bare(k)
        if b in seen:
            print(f"  !! duplicate keyword {k!r} in {ag} (also in {seen[b]})"); ok = False
        seen[b] = ag

    negs = [n.lower() for group in NEGATIVES.values() for n in group]
    if len(negs) != len(set(negs)):
        dupes = {n for n in negs if negs.count(n) > 1}
        print(f"  !! duplicate negatives: {sorted(dupes)}"); ok = False

    print("-- ad group -> RSA coverage --")
    for camp, rsa, groups in CAMPAIGNS:
        n = sum(len(k) for _, k in groups)
        print(f"  {camp}  ({n} keywords)  ->  {rsa}")
        for ag, kws in groups:
            print(f"     {ag:<28} {len(kws):>2}")
    for camp, groups in HELD:
        n = sum(len(k) for _, k in groups)
        print(f"  {camp}  ({n} keywords)  ->  HELD, no RSA serves these")

    print("\n-- negative/keyword conflicts --")
    conflicts = 0
    for camp, ag, k in everything:
        b = bare(k)
        for n in negs:
            if n in b.split() or (" " in n and n in b):
                print(f"  !! NEGATIVE {n!r} would block {k!r} ({ag})")
                conflicts += 1; ok = False
    if not conflicts:
        print("  none - no negative blocks a keyword in the plan")

    held_n = sum(len(k) for _, groups in HELD for _, k in groups)
    print(f"\n{len(active)} active keywords across "
          f"{sum(len(g) for _, _, g in CAMPAIGNS)} ad groups in {len(CAMPAIGNS)} campaigns")
    print(f"{held_n} held (Traffic & License)")
    print(f"{len(negs)} negatives in {len(NEGATIVES)} lists")
    print("\nALL CLEAN" if ok else "\nISSUES FOUND")
    return ok

if __name__ == "__main__":
    import sys
    sys.exit(0 if check() else 1)
