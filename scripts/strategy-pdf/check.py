"""Tablo (build.py MX) ile platform bölümleri (plat.py P) tutarlı mı? Uyuşmazlıkları listeler."""
import re, sys
sys.path.insert(0, '.')
from plat import P
src = open('build.py').read()
ns = {}
exec(re.search(r"MX=\{.*?\n\}\n", src, flags=re.S).group(0), ns)
MX = ns['MX']
PLAT = ["Web","IG","X","YT","TT","TG","FB","LI","RD","DC"]
bad = 0
for ci, (name, *_rest) in enumerate(P):
    items = _rest[3]
    covered = set()
    for tn, *_ in items:
        covered |= {int(n) for n in re.findall(r"\d+", tn)}
    for t in range(1, 24):
        mark = MX[t].split()[ci]
        if mark != '-' and t not in covered:
            print(f"EKSİK BLOK  : tablo tür {t} x {name} = {mark}, ama {name} bölümünde bu tür yok"); bad += 1
        if mark == '-' and t in covered:
            print(f"EKSİK İŞARET: {name} bölümünde tür {t} var, ama tabloda boş"); bad += 1
print("uyuşmazlık:", bad)
