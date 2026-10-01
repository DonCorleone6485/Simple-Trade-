import kk_1,kk_2,kk_3,kk_4,kk_5
from kk_lib import CSS,PK
body=kk_1.cover()+kk_1.toc()+kk_1.b1()+kk_1.b2()+kk_1.b3()+kk_1.b4()+kk_2.b5()+kk_2.b6()+kk_2.b7()+kk_2.b8()+kk_3.b9()+kk_3.b10()+kk_3.b11()+kk_4.b12()+kk_4.b13()+kk_4.b14()+kk_5.b15()+kk_5.b16()+kk_5.b17()+kk_5.b18()+kk_5.b19()+kk_5.b20()+kk_5.bEk()+kk_5.bSema()
html=f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>İçerik dağıtım sistemi: kurulum el kitabı</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{body}</body></html>"""
open("kurulum_kitabi.html","w",encoding="utf-8").write(html)
print("html",len(html))
