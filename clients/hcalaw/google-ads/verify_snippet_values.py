"""Check structured snippet values: 25-char limit, 3-10 per header, no collision with callouts."""
import csv, collections, sys

LIMIT = 25
callouts = {r["Callout text"].lower() for r in csv.DictReader(open("callouts.csv"))}
rows = list(csv.DictReader(open("structured-snippets.csv")))
by_header = collections.defaultdict(list)
for r in rows:
    by_header[r["Header"]].append(r["Value"])

ok = True
for header, values in by_header.items():
    print(f"\n== {header} == ({len(values)} values)")
    if not 3 <= len(values) <= 10:
        print("  !! value count outside Google's 3-10 range"); ok = False
    if len(set(v.lower() for v in values)) != len(values):
        print("  !! duplicate value in header"); ok = False
    for v in values:
        n, flags = len(v), []
        if n > LIMIT:
            flags.append("OVER LIMIT"); ok = False
        if v.lower() in callouts:
            flags.append("EXACT CALLOUT DUPE"); ok = False
        for c in callouts:
            if v.lower() != c and (v.lower() in c or c in v.lower()):
                flags.append(f"near callout '{c}'")
        print(f"  {n:>2}/{LIMIT}  {v}" + ("   <-- " + "; ".join(flags) if flags else ""))

print("\nALL CLEAN" if ok else "\nISSUES FOUND")
sys.exit(0 if ok else 1)
