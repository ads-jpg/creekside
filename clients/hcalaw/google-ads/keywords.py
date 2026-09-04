# -*- coding: utf-8 -*-
"""Keyword plan for a criminal defense account, built to avoid Google policy exposure.

{city} is a placeholder - substitute the market before upload.
Match types: [exact] and "phrase" only. No broad match without conversion data.
"""

CAMPAIGNS = [
("DWI / DUI", [
  ("DWI Attorney", [
    "[dwi lawyer]","[dwi attorney]","[dwi lawyer near me]","[dwi attorney near me]",
    "[dwi lawyer {city}]","[dwi attorney {city}]","\"dwi defense lawyer\"",
    "\"dwi defense attorney\"","\"dwi defense law firm\"","\"hire a dwi lawyer\""]),
  ("DUI Attorney", [
    "[dui lawyer]","[dui attorney]","[dui lawyer near me]","[dui attorney near me]",
    "[dui lawyer {city}]","\"dui defense attorney\"","\"dui defense lawyer\"",
    "\"drunk driving lawyer\"","\"drunk driving attorney\""]),
  ("First Offense", [
    "\"first offense dwi lawyer\"","\"first offense dui lawyer\"","\"first dwi attorney\"",
    "\"first time dwi lawyer\"","\"first time dui attorney\""]),
  ("Repeat & Felony DWI", [
    "\"second dwi lawyer\"","\"second offense dwi attorney\"","\"third dwi lawyer\"",
    "\"felony dwi lawyer\"","\"felony dwi attorney\"","\"habitual dwi lawyer\"",
    "\"repeat dwi attorney\""]),
  ("Underage DWI", [
    "\"underage dwi lawyer\"","\"underage dui attorney\"","\"underage drinking driving lawyer\"",
    "\"provisional license dwi lawyer\""]),
]),
("Criminal Defense", [
  ("Criminal Defense", [
    "[criminal defense attorney]","[criminal defense lawyer]","[criminal lawyer near me]",
    "[criminal attorney near me]","[criminal defense attorney {city}]","[criminal lawyer {city}]",
    "\"criminal defense law firm\"","\"criminal defense representation\"",
    "\"hire a criminal defense lawyer\"","\"defense attorney for criminal charges\""]),
  ("Drug Charges", [
    "\"drug charge lawyer\"","\"drug charge attorney\"","\"drug possession lawyer\"",
    "\"drug possession attorney\"","\"possession charge lawyer\"",
    "\"drug charges defense attorney\"","\"drug crime lawyer\""]),
  ("Felony Defense", [
    "\"felony lawyer\"","\"felony attorney\"","\"felony attorney near me\"",
    "\"felony defense lawyer\"","\"felony charge attorney\"","\"felony defense attorney {city}\""]),
  ("Misdemeanor Defense", [
    "\"misdemeanor lawyer\"","\"misdemeanor attorney\"","\"misdemeanor defense lawyer\"",
    "\"misdemeanor charge attorney\""]),
  ("Assault Charges", [
    "\"assault charge lawyer\"","\"assault charge attorney\"","\"assault defense lawyer\"",
    "\"simple assault lawyer\"","\"assault attorney near me\""]),
  ("Federal Defense (phase 2)", [
    "\"federal criminal defense attorney\"","\"federal criminal lawyer\"",
    "\"federal defense attorney\"","\"federal charges lawyer\""]),
]),
("Traffic & License", [
  ("Traffic Tickets", [
    "[traffic ticket lawyer]","[traffic ticket attorney]","[traffic lawyer near me]",
    "[traffic attorney {city}]","\"traffic ticket lawyer {city}\"","\"fight a traffic ticket lawyer\"",
    "\"traffic violation attorney\""]),
  ("Speeding Tickets", [
    "\"speeding ticket lawyer\"","\"speeding ticket attorney\"","\"speeding ticket lawyer near me\"",
    "\"speeding citation attorney\""]),
  ("DWLR & Suspended License", [
    "\"driving while license revoked lawyer\"","\"dwlr attorney\"","\"dwlr lawyer\"",
    "\"suspended license lawyer\"","\"revoked license attorney\"","\"driving on suspended license lawyer\""]),
  ("DMV Hearings", [
    "\"dmv hearing lawyer\"","\"dmv hearing attorney\"","\"license restoration lawyer\"",
    "\"license restoration attorney\"","\"get my license back lawyer\"","\"dmv hearing representation\""]),
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

def all_keywords():
    for camp, groups in CAMPAIGNS:
        for ag, kws in groups:
            for k in kws:
                yield camp, ag, k

def bare(k):
    return k.strip('[]"').lower()

def check():
    ok = True
    kws = list(all_keywords())
    seen = {}
    for camp, ag, k in kws:
        b = bare(k)
        if b in seen:
            print(f"  !! duplicate keyword {k!r} in {ag} (also in {seen[b]})"); ok = False
        seen[b] = ag

    negs = [n.lower() for group in NEGATIVES.values() for n in group]
    if len(negs) != len(set(negs)):
        dupes = {n for n in negs if negs.count(n) > 1}
        print(f"  !! duplicate negatives: {sorted(dupes)}"); ok = False

    # The check that matters: does any negative block a keyword we are paying for?
    print("\n-- negative/keyword conflicts --")
    conflicts = 0
    for camp, ag, k in kws:
        b = bare(k)
        for n in negs:
            if n in b.split() or (" " in n and n in b):
                print(f"  !! NEGATIVE {n!r} would block {k!r} ({ag})")
                conflicts += 1; ok = False
    if not conflicts:
        print("  none - no negative blocks a keyword in the plan")

    print(f"\n{len(kws)} keywords across "
          f"{sum(len(g) for _, g in CAMPAIGNS)} ad groups in {len(CAMPAIGNS)} campaigns")
    print(f"{len(negs)} negatives in {len(NEGATIVES)} lists")
    print("\nALL CLEAN" if ok else "\nISSUES FOUND")
    return ok

if __name__ == "__main__":
    import sys
    sys.exit(0 if check() else 1)
