# -*- coding: utf-8 -*-
"""Criminal defense RSA copy - restructured to two verticals per client feedback.

Emulates the competitor's credential-forward pattern (service + experience number in
headlines; credential, geography, then short Title Case fragments in descriptions) while
substituting claims this firm can actually substantiate.

Limits: headline 30, description 90, path 15. Max 15 headlines, 4 descriptions.
"""
H_LIM, D_LIM, P_LIM = 30, 90, 15

# Claims the competitor makes that we must NOT copy without proof of our own.
DO_NOT_COPY = {
 "NC State Bar certified": "NC Rule 7.4 - specialist claim, requires NC State Bar Board of "
                           "Legal Specialization certification. No evidence HCA holds it.",
 "NHTSA certification":    "A specific SFST credential. Do not claim unless the attorney holds it.",
}

RSAS = [
{
 "name":"RSA 1 - Felony Criminal Defense",
 "paths":["Felony-Defense","Wilmington-NC"],
 "headlines":[
  "Felony Criminal Defense","Felony Defense Attorney","40+ Years Criminal Defense",
  "40+ Years Defending Felonies","AV Preeminent Rated Firm","200+ Positive Reviews",
  "Wilmington Felony Lawyer","Complex Felony Cases","Defending NC Felony Charges",
  "Charged With a Felony?","State & Federal Felonies","Focused On Criminal Law",
  "Four Decades in NC Courts","Free Case Evaluation","Speak With an Attorney"],
 "descriptions":[
  "AV Preeminent rated felony defense with 40+ years in NC criminal courts.",
  "Defending felony charges in Wilmington, NC courts since 1982. 200+ positive reviews.",
  "Complex felony cases, state and federal. Focused On Criminal Law. Trial-Tested Defense.",
  "Four decades defending serious charges in New Hanover County. Free Case Evaluation."],
},
{
 "name":"RSA 2 - Drunk Driving Defense",
 "paths":["Drunk-Driving","DWI-Defense"],
 "headlines":[
  "Drunk Driving Defense","Drunk Driving Attorney","40+ Years DWI Defense",
  "2,000+ DWI Cases Handled","AV Preeminent Rated Firm","200+ Positive Reviews",
  "Wilmington DWI Lawyer","Charged With Drunk Driving?","DWI & DUI Defense",
  "Protect Your License","DMV Hearing Representation","Focused On Criminal Law",
  "Four Decades in NC Courts","First-Offense DWI Defense","Free Case Evaluation"],
 "descriptions":[
  "AV Preeminent rated drunk driving defense with 40+ years in NC criminal courts.",
  "Defending drunk driving charges in Wilmington, NC courts since 1982. 2,000+ DWI cases.",
  "Breath and blood evidence can be challenged. Focused On Criminal Law. Free Evaluation.",
  "200+ positive client reviews. Four decades handling complex DWI cases in New Hanover."],
},
{
 "name":"RSA 3 - General Criminal Defense (optional third)",
 "paths":["Criminal-Law","Wilmington-NC"],
 "headlines":[
  "Criminal Defense Attorney","Criminal Defense Lawyer","40+ Years Criminal Defense",
  "AV Preeminent Rated Firm","200+ Positive Reviews","Wilmington Criminal Lawyer",
  "Facing Criminal Charges?","Felony & Misdemeanor Defense","State & Federal Court",
  "Complex Case Experience","Focused On Criminal Law","Four Decades in NC Courts",
  "Free Case Evaluation","Speak With an Attorney","Know Your Legal Options"],
 "descriptions":[
  "AV Preeminent rated criminal defense with 40+ years in Wilmington, NC courts.",
  "Defending criminal charges in New Hanover County since 1982. 200+ positive reviews.",
  "Complex cases, state and federal. Focused On Criminal Law. Comprehensive Defense.",
  "Four decades of courtroom experience in NC. Free Case Evaluation, no obligation."],
},
]

# Terms that flagged this account earlier - ad copy must stay clear of them.
FLAGGED = ["sex","sexual","rape","gun","firearm","weapon","cocaine","meth","heroin",
           "marijuana","cannabis","trafficking","bail","bondsman","guaranteed",
           "best","dropped","beat","avoid jail"]

def check():
    ok = True
    for r in RSAS:
        print("\n" + "="*64); print(r["name"]); print("="*64)
        hs, ds, ps = r["headlines"], r["descriptions"], r["paths"]
        if not 3 <= len(hs) <= 15: print(f"  !! {len(hs)} headlines (need 3-15)"); ok=False
        if not 2 <= len(ds) <= 4:  print(f"  !! {len(ds)} descriptions (need 2-4)"); ok=False
        if len(set(h.lower() for h in hs)) != len(hs): print("  !! duplicate headline"); ok=False
        if len(set(d.lower() for d in ds)) != len(ds): print("  !! duplicate description"); ok=False

        print(f"\n  HEADLINES ({len(hs)}/15, limit {H_LIM})")
        for i,h in enumerate(hs,1):
            n=len(h); bad=[]
            if n>H_LIM: bad.append("OVER"); ok=False
            for f in FLAGGED:
                if f in h.lower().split() or (" " in f and f in h.lower()):
                    bad.append(f"FLAGGED {f!r}"); ok=False
            print(f"   {i:>2}. {n:>2}/{H_LIM}  {h}" + ("   <-- "+"; ".join(bad) if bad else ""))

        print(f"\n  DESCRIPTIONS ({len(ds)}/4, limit {D_LIM})")
        for i,d in enumerate(ds,1):
            n=len(d); bad=[]
            if n>D_LIM: bad.append("OVER"); ok=False
            for f in FLAGGED:
                if f in d.lower().split() or (" " in f and f in d.lower()):
                    bad.append(f"FLAGGED {f!r}"); ok=False
            print(f"   {i:>2}. {n:>2}/{D_LIM}  {d}" + ("   <-- "+"; ".join(bad) if bad else ""))

        print(f"\n  PATHS (limit {P_LIM})")
        for p in ps:
            n=len(p)
            if n>P_LIM: ok=False
            print(f"       {n:>2}/{P_LIM}  /{p}" + ("   <-- OVER" if n>P_LIM else ""))

    print("\n  COMPETITOR CLAIMS WE DO NOT COPY")
    for claim, why in DO_NOT_COPY.items():
        print(f"   x  {claim}\n        {why}")
        blob = " ".join(h.lower() for r in RSAS for h in r["headlines"] + r["descriptions"])
        for frag in ["state bar certified", "nhtsa"]:
            if frag in blob:
                print(f"        !! {frag!r} APPEARS IN OUR COPY"); ok = False

    print("\nALL WITHIN LIMITS" if ok else "\nISSUES FOUND")
    return ok

if __name__ == "__main__":
    import sys
    sys.exit(0 if check() else 1)
