"""Check callout assets against Google's 25-character limit.

Reads callouts.csv so the check cannot drift from the asset list itself.
"""
import csv, collections, sys

LIMIT = 25
rows = list(csv.DictReader(open("callouts.csv")))
by_group = collections.OrderedDict()
for r in rows:
    by_group.setdefault(r["Ad Group"], []).append(r["Callout text"])

ok, total = True, 0
for group, items in by_group.items():
    print(f"\n== {group} == ({len(items)})")
    if len(items) > 20:
        print("  !! more than 20 callouts — Google's per-level maximum"); ok = False
    if len(set(i.lower() for i in items)) != len(items):
        print("  !! duplicate callout in group"); ok = False
    for c in items:
        n = len(c); total += 1
        over = n > LIMIT
        if over: ok = False
        print(f"  {n:>2}/{LIMIT}  {c}" + ("   <-- OVER LIMIT" if over else ""))

print(f"\nTOTAL: {total} callouts across {len(by_group)} groups")
print("ALL CLEAN" if ok else "ISSUES FOUND")
sys.exit(0 if ok else 1)
