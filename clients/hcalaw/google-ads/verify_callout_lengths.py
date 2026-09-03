groups = {
"Core (Account Level)": [
 "Serving NC Since 1982","40+ Years Defending NC","AV Preeminent Rated","Top 100 Trial Lawyers",
 "Free Case Consultation","Downtown Wilmington","Walk-Ins Welcome","Partner-Led Defense",
 "Trial-Tested Defense","Direct Attorney Access"],
"DWI / DUI": [
 "2,000+ DWI Cases Handled","DWI Defense Since 1982","First-Offense DWI Help","Protect Your License",
 "Breath Test Challenges","Felony DWI Defense","Underage DWI Defense"],
"DMV Hearings / License": [
 "DMV Hearing Defense","License Restoration Help","Revoked License Hearings","DWLR Charge Defense",
 "DMV Medical Hearings","Limited Driving Privilege"],
"Drug Charges": [
 "Drug Charge Defense","Drug Trafficking Defense","Felony Drug Cases","Search & Seizure Defense",
 "Possession Charge Defense"],
"Traffic / Tickets": [
 "Speeding Ticket Defense","Reckless Driving Defense","Avoid License Points","Out-of-State Drivers OK",
 "CDL Driver Defense"],
"Felony / Serious Charges": [
 "Felony Defense Attorneys","Federal Court Defense","Sex Crime Defense","Assault Charge Defense",
 "State & Federal Trials"],
"Local / Geo Trust": [
 "New Hanover County Courts","Steps From the Courthouse","Local Wilmington Firm","Known in Local Courts",
 "Pender & Brunswick Co."],
}
bad=0; total=0
for g,items in groups.items():
    print(f"\n== {g} ==")
    for c in items:
        n=len(c); total+=1
        flag="  <-- OVER LIMIT" if n>25 else ""
        if n>25: bad+=1
        print(f"  {n:>2}/25  {c}{flag}")
print(f"\nTOTAL: {total} callouts, {bad} over limit")
