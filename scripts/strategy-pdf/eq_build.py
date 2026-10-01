import eq_1,eq_2,eq_3,eq_4
from kk_lib import CSS
body=eq_1.cover()+eq_1.toc()+eq_1.b1()+eq_1.b2()+eq_1.b3()+eq_2.b4()+eq_2.b5()+eq_3.b6()+eq_3.b7()+eq_3.b8()+eq_3.b9()+eq_4.b10()+eq_4.b11()+eq_4.b12()+eq_4.b13()+eq_4.b14()+eq_4.bEk()
html=f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Ekip kurulumu ve çalışma düzeni</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{body}</body></html>"""
open("ekip.html","w",encoding="utf-8").write(html); print("html",len(html))
