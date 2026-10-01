import ai_1,ai_2,ai_3
from kk_lib import CSS
body=(ai_1.cover()+ai_1.toc()+ai_1.b1()+ai_1.b2()+ai_1.b3()+ai_1.b4()+ai_1.b5()
      +ai_2.b6()+ai_2.b7()+ai_2.b8()+ai_2.b9()+ai_2.b10()+ai_2.b11()+ai_2.b12()+ai_2.b13()
      +ai_3.b14()+ai_3.b15())
html=f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Yapay zekâ ekibi el kitabı</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{body}</body></html>"""
html=html.replace("class='sec'","class='sec nb'")
open("ai_ekip.html","w",encoding="utf-8").write(html); print("html",len(html))
