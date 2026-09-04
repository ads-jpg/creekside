# -*- coding: utf-8 -*-
H_LIM, D_LIM, P_LIM = 30, 90, 15

RSAS = [
{
 "name":"RSA 1 - Criminal Defense (general)",
 "paths":["Criminal","Defense"],
 "headlines":[
  "Criminal Defense Attorney","Criminal Defense Lawyer","Facing Criminal Charges?",
  "Charged With a Crime?","Felony & Misdemeanor Defense","State & Federal Court",
  "Free Case Evaluation","Confidential Consultation","Speak With an Attorney",
  "Local Courtroom Experience","Trial-Tested Representation","Know Your Legal Options",
  "Protect Your Rights","Court Date Approaching?","Get Answers About Your Case"],
 "descriptions":[
  "Facing charges? Speak with a defense attorney about your case and the options ahead.",
  "Representation in state and federal court. Confidential consultation, no obligation.",
  "Every case is different. Get a clear explanation of the process and what comes next.",
  "Local attorneys with real courtroom experience. Call today to discuss your situation."],
},
{
 "name":"RSA 2 - DWI / DUI",
 "paths":["DWI-Defense","Free-Consult"],
 "headlines":[
  "DWI Defense Attorney","DUI Defense Lawyer","Charged With DWI?",
  "Arrested for DUI?","First-Offense DWI Defense","Repeat DWI Charges",
  "Free Case Evaluation","Speak With a DWI Attorney","Protect Your License",
  "DMV Hearing Representation","Local DWI Court Experience","Know Your Legal Options",
  "Court Date Approaching?","Understand Your Charge","Get Answers About Your DWI"],
 "descriptions":[
  "Charged with DWI? Speak with an attorney about your case and the road ahead.",
  "License at risk? We handle DMV hearings alongside the criminal charge.",
  "Breath and blood tests can be challenged. Learn what applies to your case.",
  "Local attorneys who appear in these courts regularly. Call for a consultation."],
},
{
 "name":"RSA 3 - Traffic & License",
 "paths":["Traffic-Defense","Free-Consult"],
 "headlines":[
  "Traffic Ticket Attorney","Traffic Defense Lawyer","Got a Traffic Ticket?",
  "Speeding Ticket Defense","Reckless Driving Defense","License Revoked?",
  "DMV Hearing Representation","License Restoration Help","Points & Insurance Impact",
  "Free Case Evaluation","Out-of-State Drivers Welcome","Protect Your Driving Record",
  "Court Date Approaching?","Speak With an Attorney","Know Your Legal Options"],
 "descriptions":[
  "A ticket can mean points, higher insurance, and a suspended license. Know your options.",
  "We handle traffic matters and DMV hearings across the local courts. Call to discuss.",
  "Out-of-state driver? We may be able to appear on your behalf. Ask about your case.",
  "Speak with an attorney about your citation and what it could mean for your license."],
},
]

def check():
    ok = True
    for r in RSAS:
        print("\n" + "="*62); print(r["name"]); print("="*62)
        hs, ds, ps = r["headlines"], r["descriptions"], r["paths"]
        if not 3 <= len(hs) <= 15: print(f"  !! {len(hs)} headlines (need 3-15)"); ok=False
        if not 2 <= len(ds) <= 4:  print(f"  !! {len(ds)} descriptions (need 2-4)"); ok=False
        if len(set(h.lower() for h in hs)) != len(hs): print("  !! duplicate headline"); ok=False
        print(f"\n  HEADLINES ({len(hs)}/15, limit {H_LIM})")
        for i,h in enumerate(hs,1):
            n=len(h); bad = n>H_LIM
            if bad: ok=False
            print(f"   {i:>2}. {n:>2}/{H_LIM}  {h}" + ("   <-- OVER" if bad else ""))
        print(f"\n  DESCRIPTIONS ({len(ds)}/4, limit {D_LIM})")
        for i,d in enumerate(ds,1):
            n=len(d); bad = n>D_LIM
            if bad: ok=False
            print(f"   {i:>2}. {n:>2}/{D_LIM}  {d}" + ("   <-- OVER" if bad else ""))
        print(f"\n  PATHS (limit {P_LIM} each)")
        for p in ps:
            n=len(p); bad = n>P_LIM
            if bad: ok=False
            print(f"       {n:>2}/{P_LIM}  /{p}" + ("   <-- OVER" if bad else ""))
    print("\n" + ("ALL WITHIN LIMITS" if ok else "ISSUES FOUND"))
    return ok

if __name__ == "__main__":
    import sys
    sys.exit(0 if check() else 1)
