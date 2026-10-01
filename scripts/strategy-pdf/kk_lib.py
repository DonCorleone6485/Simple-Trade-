# Kurulum el kitabı: yardımcılar ve stil
import html, json, re, subprocess
esc=html.escape
PK="/Users/DonCorleone_1/Desktop/STJ-PDF/Dagitim-Sistemi-Kurulum-Paketi"
CSS="""
@page{size:A4;margin:16mm 15mm 17mm 15mm;@bottom-center{content:counter(page);font-size:8pt;color:#999}}
@page:first{margin:0;@bottom-center{content:""}}
*{box-sizing:border-box}
body{font-family:Inter,-apple-system,"Helvetica Neue",Arial,sans-serif;color:#1d2330;font-size:10pt;line-height:1.5;margin:0}
.cover{height:297mm;width:210mm;background:#08080c;color:#f4f2ec;padding:30mm 22mm;position:relative;page-break-after:always}
.cover .brand{font-size:8.5pt;letter-spacing:.14em;color:#999;text-transform:uppercase}
.cover h1{font-family:Newsreader,Georgia,serif;font-weight:400;font-size:40pt;line-height:1.05;margin:112mm 0 6mm}
.cover h1 em{color:#f0b429}
.cover p{font-size:12pt;color:#cfcdc6;max-width:140mm;line-height:1.5}
.cover .foot{position:absolute;left:22mm;bottom:20mm;font-size:8.5pt;color:#888}
h2.sec{font-family:Newsreader,Georgia,serif;font-weight:400;font-size:21pt;margin:0 0 6pt;padding-top:7pt;border-top:3px solid #f0b429;page-break-before:always;break-after:avoid}
h2.sec.nb{page-break-before:avoid;margin-top:16pt}
h3{font-size:12pt;margin:15pt 0 4pt;break-after:avoid;color:#14161c}
h4{font-size:10pt;margin:10pt 0 3pt;color:#8a5a06;text-transform:uppercase;letter-spacing:.05em;break-after:avoid}
p{margin:4pt 0 6pt}
ul,ol{margin:3pt 0 7pt 17pt;padding:0} li{margin:2pt 0}
table{border-collapse:collapse;width:100%;margin:6pt 0 10pt;font-size:8.8pt}
tr{break-inside:avoid}
th{background:#f3f1ea;text-align:left;padding:4pt 6pt;border-bottom:1.5px solid #d9d5c7;font-weight:600}
td{padding:4pt 6pt;border-bottom:1px solid #e6e3d8;vertical-align:top}
td.k{font-weight:600;white-space:nowrap}
code,.m{font-family:"JetBrains Mono",Menlo,monospace;font-size:8.3pt;background:#f3f1ea;padding:0 3pt;border-radius:2pt}
pre{font-family:"JetBrains Mono",Menlo,monospace;font-size:7.6pt;line-height:1.4;background:#14161c;color:#e8e6df;padding:7pt 9pt;border-radius:4pt;white-space:pre-wrap;word-break:break-word;margin:5pt 0 9pt;break-inside:avoid}
pre.long{break-inside:auto}
.box{border:1px solid #e0dccd;border-left:4px solid #f0b429;background:#fffaf0;padding:7pt 10pt;margin:8pt 0;break-inside:avoid;border-radius:0 4pt 4pt 0}
.box.warn{border-left-color:#c0392b;background:#fdf1ef}
.box.ok{border-left-color:#2e8b57;background:#eff8f2}
.box.info{border-left-color:#4a5fc1;background:#f0f2fb}
.box b.t{display:block;margin-bottom:2pt}
.card{border:1px solid #e0dccd;border-radius:6pt;padding:8pt 11pt;margin:9pt 0;break-inside:avoid}
.card h3{margin:0 0 4pt}
.pill{display:inline-block;font-size:7.8pt;padding:1pt 6pt;border-radius:8pt;background:#eee;margin-right:3pt}
.g{background:#e3f4e8;color:#1a6b34}.y{background:#fdf0dc;color:#8a5a00}.r{background:#fbe3e0;color:#9b2c20}.b{background:#e6e8fa;color:#3a45a0}
.flow{display:flex;gap:3pt;margin:9pt 0;break-inside:avoid}
.st{flex:1;border:1px solid #d9d5c7;border-radius:5pt;padding:5pt 3pt;text-align:center;font-size:8pt;background:#faf9f4}
.st b{display:block;font-size:8.8pt;margin-bottom:1pt;color:#8a5a06}
.ar{align-self:center;color:#aaa}
.arch{display:grid;grid-template-columns:repeat(3,1fr);gap:6pt;margin:8pt 0;break-inside:avoid}
.arch div{border:1px solid #d9d5c7;border-radius:5pt;padding:6pt 8pt;font-size:8.5pt;background:#faf9f4}
.arch div b{display:block;color:#8a5a06;margin-bottom:2pt}
table.mx{font-size:7.4pt} table.mx td.c,table.mx th.c{text-align:center;padding:3pt 2pt}
td.A{background:#fdf0dc;color:#8a5a00;font-weight:700} td.B{background:#e3f4e8;color:#1a6b34} td.L{background:#e6e8fa;color:#3a45a0}
.toc td{border:none;padding:2pt 6pt} .toc td.n{width:22pt;color:#8a5a06;font-weight:600}
small,.s{color:#6b6b6b;font-size:8.5pt}
.ex{border:1px dashed #bbb;padding:5pt 8pt;margin:4pt 0;font-size:9pt;background:#fafafa;white-space:pre-wrap}
"""
def T(head,rows,widths=None,cls=""):
    th="".join(f"<th>{h}</th>" for h in head)
    out=f"<table class='{cls}'><tr>{th}</tr>"
    for r in rows:
        out+="<tr>"+"".join(f"<td{' class=k' if i==0 and cls=='keyed' else ''}>{c}</td>" for i,c in enumerate(r))+"</tr>"
    return out+"</table>"
def box(kind,title,body): return f"<div class='box {kind}'><b class='t'>{title}</b>{body}</div>"
def pre(s,long=False): return f"<pre{' class=long' if long else ''}>{esc(s)}</pre>"
def sec(n,title,nb=False):
    lab=f"{n}" if str(n).startswith("Ek") else f"Bölüm {n}"
    return f"<h2 class='sec{' nb' if nb else ''}'>{lab}: {title}</h2>"
def ul(items): return "<ul>"+"".join(f"<li>{i}</li>" for i in items)+"</ul>"
def ol(items): return "<ol>"+"".join(f"<li>{i}</li>" for i in items)+"</ol>"
def run_engine(profile):
    code="import {decide} from '"+PK+"/reference/decide.mjs'; console.log(JSON.stringify(decide("+json.dumps(profile)+")))"
    r=subprocess.run(["node","--input-type=module","-e",code],capture_output=True,text=True,cwd=PK)
    assert r.returncode==0,r.stderr
    return json.loads(r.stdout)
