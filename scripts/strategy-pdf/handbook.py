import ast, html, re, sys, subprocess
sys.path.insert(0, ".")
esc = html.escape

# 1) tablo ile bölümler uyuşuyor mu?
r = subprocess.run([sys.executable, "check.py"], capture_output=True, text=True)
if "uyuşmazlık: 0" not in r.stdout:
    print(r.stdout); sys.exit("Tablo ile platform bölümleri uyuşmuyor; PDF üretilmedi.")

# 2) build.py içinden sabitleri oku (kodu çalıştırmadan)
tree = ast.parse(open("build.py").read())
def grab(name):
    for n in tree.body:
        if isinstance(n, ast.Assign) and getattr(n.targets[0], "id", None) == name:
            return ast.literal_eval(n.value)
TEAM, RHYTHM, SUGG, MX, PLAT, PNAME = (grab(x) for x in ["TEAM", "RHYTHM", "SUGG", "MX", "PLAT", "PNAME"])
from plat import P
from hb_intro import PRODUCT, GLOSSARY, RULES, TOOLS, WORKFLOW, PRE_PUBLISH
from hb_types import T
from hb_platforms import PG

def e(s): return esc(str(s))
def ul(items, cls=""): return f"<ul class='{cls}'>" + "".join(f"<li>{e(i)}</li>" for i in items) + "</ul>"
def ol(items): return "<ol>" + "".join(f"<li>{e(i)}</li>" for i in items) + "</ol>"
def chk(items): return "<ul class='chk'>" + "".join(f"<li>{e(i)}</li>" for i in items) + "</ul>"

# ---- Bölümler ----
def sec_product():
    o = "<h2>Bölüm 1: Önce bunu oku</h2><p class='lead'>Bu belge, içerik ekibine yeni katılan birinin <b>kimseye sormadan</b> işe başlayabilmesi için yazıldı. Her şey basit anlatıldı; bilmediğin bir kelime olursa Bölüm 2'deki sözlüğe bak.</p>"
    for t, d in PRODUCT: o += f"<div class='qa'><b>{e(t)}</b><p>{e(d)}</p></div>"
    o += "<h3>Ekipte kim ne yapar?</h3><table class='t'><tr><th>Rol</th><th>Ne yapar</th></tr>" + "".join(f"<tr><td><b>{e(a)}</b></td><td>{e(b)}</td></tr>" for a, b in TEAM) + "</table>"
    ch = [("Web sitesi","simpletradejournal.io","Açık"),("Instagram","@simpletradejournal","Açık"),("X","@SimpleTradeJrnl","Açık"),("YouTube","@simpletradejournal","Açılacak (11 Ekim'den sonra)"),("TikTok","(ad 30 Ekim'den sonra düzelecek)","Açık"),("Telegram","t.me/simpletradejournal","Açık"),("Facebook","facebook.com/simpletradejournalapp","Açık"),("LinkedIn","linkedin.com/company/simpletradejournal","Açık"),("Reddit","u/simpletradejournal","Açık"),("Discord","discord.gg/yUJ5NXyJHg","Açık")]
    o += "<h3>10 kanalımız</h3><table class='t'><tr><th>Kanal</th><th>Adres</th><th>Durum</th></tr>" + "".join(f"<tr><td><b>{e(a)}</b></td><td>{e(b)}</td><td>{e(c)}</td></tr>" for a, b, c in ch) + "</table>"
    o += "<p class='note'>Hesapların şifrelerini ve doğrulama kodlarını yönetici tutar. Hiçbir zaman şifre isteme, paylaşma ya da kaydetme.</p>"
    o += "<p class='note'><b>Sürüm notu (2. sürüm, 1 Ekim 2026):</b> plan ve fiyat bilgisi, site adresleri ve yayındaki yazı ve araçlar sitenin kendisiyle karşılaştırıldı; X ve YouTube adımları düzeltildi.</p>"
    return o

def sec_gloss():
    return "<h2 class='brk'>Bölüm 2: Sözlük (bilmediğin kelimeler)</h2><p>Her kelime sade anlatıldı ve bir örnek verildi.</p><table class='t'><tr><th style='width:30mm'>Kelime</th><th>Ne demek?</th><th style='width:52mm'>Örnek</th></tr>" + "".join(f"<tr><td><b>{e(a)}</b></td><td>{e(b)}</td><td class='dim'>{e(c)}</td></tr>" for a, b, c in GLOSSARY) + "</table>"

def sec_rules():
    o = "<h2 class='brk'>Bölüm 3: Altın kurallar</h2><p>Bu kuralları ezberle. Bunlardan birini bozan içerik yayınlanmaz. Her kuralın yanında bir <b>yanlış</b> ve bir <b>doğru</b> örnek var.</p>"
    for t, d, bad, good in RULES:
        o += f"<div class='rule'><h4>{e(t)}</h4><p>{e(d)}</p><div class='bg'><div class='bad'><b>YAPMA</b>{e(bad)}</div><div class='good'><b>YAP</b>{e(good)}</div></div></div>"
    return o

def sec_flow():
    o = "<h2 class='brk'>Bölüm 4: Nasıl çalışırız?</h2><h3>Bir içeriğin yolculuğu</h3><table class='t'><tr><th style='width:34mm'>Adım</th><th>Ne yaparsın</th></tr>" + "".join(f"<tr><td><b>{e(a)}</b></td><td>{e(b)}</td></tr>" for a, b in WORKFLOW) + "</table>"
    o += "<h3>Yayından önce: kendini kontrol et</h3><p>Hepsini işaretlemeden yayınlama.</p>" + chk(PRE_PUBLISH)
    o += "<h3>Kullanacağın araçlar</h3><table class='t'><tr><th style='width:48mm'>Araç</th><th>Ne için</th></tr>" + "".join(f"<tr><td><b>{e(a)}</b></td><td>{e(b)}</td></tr>" for a, b in TOOLS) + "</table>"
    o += "<h3>Haftalık düzen</h3><table class='t'><tr><th style='width:26mm'>Gün</th><th>İş</th></tr>" + "".join(f"<tr><td><b>{e(a)}</b></td><td>{e(b)}</td></tr>" for a, b in RHYTHM) + "</table>"
    return o

def card(c):
    o = f"<section class='card'><h3><span class='no'>{c['no']}</span> {e(c['ad'])}</h3>"
    o += f"<p class='what'>{e(c['nedir'])}</p>"
    o += f"<table class='t kv'><tr><th>Kim yapar</th><td>{e(c['kim'])}</td></tr><tr><th>Ne sıklıkla</th><td>{e(c['siklik'])}</td></tr><tr><th>Ne lazım</th><td>{e(c['hazirlik'])}</td></tr></table>"
    o += "<h4>Adım adım</h4>" + ol(c["adimlar"])
    o += "<h4>Hazır örnek</h4><pre class='ex'>" + e(c["ornek"]) + "</pre>"
    o += "<h4>Yapma</h4>" + ul(c["yapma"], "nolist")
    return o + "</section>"

def sec_types():
    o = "<h2 class='brk'>Bölüm 5: 23 içerik türü: her biri nasıl yapılır?</h2><p>Her türün kartında: ne olduğu, kim yaptığı, adım adım yapılışı, hazır bir örnek ve yapılmayacaklar var. İçeriği hazırlarken kartı yanında aç ve sırayla ilerle.</p>"
    return o + "".join(card(c) for c in T)

def sec_matrix():
    th = "".join(f"<th class='c'>{e(PNAME[p])}</th>" for p in PLAT)
    o = f"<div class='wide'><h2>Bölüm 6: Hangi içerik hangi kanalda?</h2><p class='legend'><b style='color:#8a5a06'>●</b> ana kanal: içerik burada özel hazırlanır ya da evi burasıdır &nbsp;·&nbsp; <b style='color:#1d6b34'>✓</b> aynı içerik doğrudan paylaşılır (araçlarda: aracı tanıtan içerik) &nbsp;·&nbsp; <b style='color:#3a45a0'>↗</b> kesit ya da bağlantıyla duyurulur &nbsp;·&nbsp; boş: bu kanalda yok. Prensip: uygun içerik mümkün olduğu kadar çok kanalda paylaşılır.</p><table class='mx'><tr><th class='n'>#</th><th>İçerik türü</th>{th}</tr>"
    for c in T:
        cells = MX[c["no"]].split()
        tds = "".join(f"<td class='c {'a' if x=='●' else ('b' if x=='✓' else ('l' if x=='↗' else 'z'))}'>{x if x!='-' else ''}</td>" for x in cells)
        o += f"<tr><td class='n'>{c['no']}</td><td>{e(c['ad'])}</td>{tds}</tr>"
    return o + "</table></div>"

def platform(pg, row):
    name, addr, status, why, items, rest = row
    o = f"<section class='pl'><h3>{e(pg['ad'])}</h3><p class='meta'>{e(addr)} · <span class='st'>{e(status)}</span></p>"
    o += f"<p class='what'>{e(pg['ne'])}</p><div class='box'><b>Giriş:</b> {e(pg['giris'])}</div>"
    o += "<h4>Nasıl yüklenir? (adım adım)</h4>" + ol(pg["adimlar"])
    o += "<h4>Hazır örnek metinler</h4>"
    for b, m, tr in pg["ornekler"]:
        o += f"<div class='smp'><b>{e(b)}</b><pre class='ex'>{e(m)}</pre><p class='tr'>{e(tr)}</p></div>"
    o += "<h4>Bu kanalda yapma</h4>" + ul(pg["yapma"], "nolist")
    o += "<h4>Haftalık görev listesi</h4>" + chk(pg["haftalik"])
    o += "<h4>Bu kanalda hangi içerik türleri paylaşılır?</h4>"
    for tn, t, d, ex in items:
        exh = "".join(f"<li>{e(x)}</li>" for x in ex)
        o += f"<div class='it'><div class='tb'>Tür {e(tn)}</div><div class='bd'><b>{e(t)}</b><p>{e(d)}</p>{('<ul class=exl>'+exh+'</ul>') if ex else ''}</div></div>"
    o += "<table class='t kv'>" + "".join(f"<tr><th>{e(k)}</th><td>{e(v)}</td></tr>" for k, v in rest) + "</table></section>"
    return o

def sec_platforms():
    byname = {r[0]: r for r in P}
    pairs = list(zip(PG, P))
    o = "<h2 class='brk'>Bölüm 7: Kanal kanal rehber</h2><p>Her kanal için: ne işe yaradığı, nasıl yüklendiği (hangi butona basılır), hazır örnek metinler, yapılmayacaklar ve haftalık görev listesi. Altta o kanalda hangi içerik türlerinin paylaşıldığı yazıyor.</p>"
    o += "<div class='box'><b>Menü yolları hakkında önemli not.</b> Uygulamalar arayüzlerini sık değiştirir; düğme adları ya da yerleri değişmiş olabilir. Bu bölümdeki adımlar 1 Ekim 2026'da kontrol edildi: YouTube adımları resmi yardım sayfasından, X ve Instagram adımları yayımlanmış kaynaklardan doğrulandı. TikTok, Facebook, LinkedIn, Telegram, Reddit ve Discord adımları yaygın bilinen akışa göre yazıldı ve henüz uygulamada tek tek denenmedi. Bir düğmeyi bulamazsan ya da adı farklıysa tahmin etme: ekran görüntüsüyle yöneticiye göster, birlikte belgeyi güncelleriz.</div>"
    return o + "".join(platform(pg, row) for pg, row in pairs)

def sec_faq():
    qa = [("Yanlış bir şey yayınladım, ne yapayım?","Gönderiyi hemen sil ya da gizle, sonra yöneticiye haber ver. Saklamak durumu kötüleştirir."),
    ("Biri yorumda 'hangi parite alayım?' diye sordu.","Nazikçe: 'Teşekkürler! Biz sinyal ya da tavsiye vermiyoruz; kendi işlemlerini kaydedip incelemene yardım ediyoruz.' Başka bir şey yazma."),
    ("Biri hakaret etti ya da kızgın yazdı.","Cevap verme, tartışma. Gerekirse yorumu gizle ve yöneticiye ekran görüntüsüyle bildir."),
    ("Birisi 'hesabıma girilmiyor / işlemlerim gelmiyor' dedi.","Çözmeye çalışma. 'Destek ekibimize yazın: support@simpletradejournal.io, sitedeki iletişim formu ya da Discord'daki support kanalı' de ve yöneticiye bildir. Sitenin çalışıp çalışmadığına status.simpletradejournal.io sayfasından bakılır."),
    ("Bir rakip ya da firma bizim hakkımızda kötü yazdı.","Cevap verme. Yöneticiye bildir."),
    ("Hesaba giriş istedim ama yönetici yok.","Bekle. Şifre isteme, başkasından alma, tahmin etme."),
    ("Videomda yanlış bir bilgi söyledim, yayınladım.","Videoyu gizle (silme), yöneticiye haber ver, doğrusunu çek."),
    ("Bir müşteri 'ekran görüntümü paylaşın' dedi.","İzni yazılı al (e-posta). Kişisel bilgi (e-posta, hesap numarası) kapat. Yönetici onayı olmadan paylaşma."),
    ("Bu belgede olmayan bir durumla karşılaştım.","Yapma, yöneticiye sor. Emin olmadığında yayınlamamak her zaman daha iyi.")]
    return "<h2 class='brk'>Bölüm 8: Takılırsan</h2><p>Sık karşılaşılan durumlar ve ne yapılacağı.</p>" + "".join(f"<div class='qa'><b>{e(q)}</b><p>{e(a)}</p></div>" for q, a in qa)

def sec_more():
    o = "<h2 class='brk'>Bölüm 9: Sonra eklenebilecek kanallar</h2><p>Şimdilik açılmaz; ekip oturunca eklenir.</p><table class='t'><tr><th>Kanal</th><th>Ne için</th><th>Tür #</th></tr>"
    return o + "".join(f"<tr><td><b>{e(n)}</b></td><td>{e(w)}</td><td>{e(t)}</td></tr>" for n, w, t in SUGG) + "</table>"

CSS = """
@page{size:A4;margin:16mm 15mm 18mm}@page wide{size:A4 landscape;margin:8mm 10mm}@page cover{size:A4;margin:0}
*{box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;font-size:10.2pt;line-height:1.55;color:#17171d;margin:0}
h1,h2{font-family:Newsreader,Georgia,serif;font-weight:400;margin:0}
.cover{page:cover;background:#08080c;color:#F4F2EC;width:210mm;height:297mm;padding:30mm 20mm 24mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always}
.cover h1{font-size:42pt;line-height:1.05;letter-spacing:-.01em}.cover h1 em{color:#f0b429}.cover p{color:rgba(244,242,236,.75);font-size:12.5pt;max-width:135mm;margin:8mm 0 0}.cover small{color:rgba(244,242,236,.5);letter-spacing:.05em}
h2{font-size:20pt;border-top:2px solid #f0b429;padding-top:4mm;margin:0 0 4mm}.brk{page-break-before:always}
h3{font-size:13pt;font-weight:600;margin:6mm 0 2mm}h4{font-size:9.6pt;font-weight:600;margin:4mm 0 1mm;color:#5a4a14;text-transform:uppercase;letter-spacing:.04em}
p{margin:0 0 2.2mm}.lead{font-size:11pt}.note,.dim{color:#5e5e6b;font-size:9.3pt}.what{font-size:10.5pt}
table.t{border-collapse:collapse;width:100%;margin:2mm 0 3mm}table.t th,table.t td{text-align:left;padding:1.8mm 2.4mm;border-bottom:1px solid #e3e3ea;vertical-align:top;font-size:9.5pt}table.t th{background:#f6f5f1;font-weight:600}
table.kv th{width:27mm;font-size:9pt}
.qa{margin:0 0 3mm;break-inside:avoid}.qa p{margin:.4mm 0 0}
.rule{border:1px solid #e3e3ea;border-radius:2mm;padding:3mm 4mm;margin:0 0 3mm;break-inside:avoid}.rule h4{margin:0 0 1mm;color:#17171d;text-transform:none;font-size:11pt}
.bg{display:flex;gap:3mm;margin-top:1.5mm}.bad,.good{flex:1;padding:2mm 3mm;border-radius:1.5mm;font-size:9.3pt}.bad{background:#fdecec;color:#7a1c1c}.good{background:#e6f4ea;color:#1d5a30}.bad b,.good b{display:block;font-size:8pt;letter-spacing:.06em;margin-bottom:.5mm}
ul,ol{margin:1mm 0 2.5mm;padding-left:6mm}li{margin:.9mm 0}ul.nolist{list-style:none;padding-left:1mm}ul.nolist li:before{content:'✕ ';color:#b02a2a;font-weight:700}ul.chk{list-style:none;padding-left:1mm}ul.chk li:before{content:'☐ ';font-size:11pt}
.card{break-inside:auto;margin-bottom:8mm;padding-bottom:5mm;border-bottom:1px solid #e3e3ea}
.card h3{margin-top:0;font-family:Newsreader,serif;font-size:15pt;display:flex;gap:3mm;align-items:center}.no{background:#f0b429;color:#08080c;border-radius:50%;width:8mm;height:8mm;display:inline-flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-size:10pt;font-weight:600;flex:0 0 8mm}
pre.ex{white-space:pre-wrap;background:#f6f5f1;border-left:3px solid #f0b429;padding:3mm 4mm;font-family:Inter,system-ui,sans-serif;font-size:9.2pt;line-height:1.5;margin:1mm 0 2mm}
.box{background:#fff3cf;padding:2.5mm 3.5mm;border-radius:1.5mm;font-size:9.3pt;margin:2mm 0}.smp{margin:0 0 3mm;break-inside:avoid}.tr{color:#5e5e6b;font-size:9pt;margin:0}
.pl{page-break-before:always}.pl h3{font-family:Newsreader,serif;font-size:18pt;margin:0;border-bottom:2px solid #f0b429;padding-bottom:1mm}.meta{color:#5e5e6b;font-size:9pt;margin:1.5mm 0 3mm}.st{color:#8a5a06;font-weight:600}
.it{display:flex;gap:3mm;margin:0 0 2.5mm;break-inside:avoid}.tb{flex:0 0 17mm;font-size:7.8pt;font-weight:600;color:#5a4a14;background:#fff3cf;border-radius:1.5mm;padding:1mm 1.2mm;text-align:center;align-self:flex-start;line-height:1.25}.bd p{margin:.5mm 0 1mm;font-size:9.5pt}.exl{margin:0 0 1mm;padding-left:4.5mm;color:#4a4a56;font-size:9pt}
.wide{page:wide;page-break-before:always}.wide h2{font-size:15pt;padding-top:2mm;margin-bottom:2mm}.legend{font-size:8.5pt;margin:1mm 0 2mm;line-height:1.35}
table.mx{border-collapse:collapse;width:100%}table.mx th,table.mx td{border:1px solid #dcdce3;padding:.45mm 1.4mm;font-size:8pt;line-height:1.25}table.mx th{background:#08080c;color:#F4F2EC}table.mx th.c,table.mx td.c{text-align:center;width:15.5mm}table.mx th.n,table.mx td.n{width:7mm;text-align:center}
td.a{background:#fff3cf;color:#8a5a06;font-size:9.5pt;font-weight:700}td.b{background:#e6f4ea;color:#1d6b34;font-size:9.5pt;font-weight:700}td.l{background:#eef0fb;color:#3a45a0;font-size:9.5pt;font-weight:700}
"""
HTML = f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Simple Trading Journal — İçerik Ekibi El Kitabı</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>
<div class="cover"><div><small>SIMPLE TRADING JOURNAL</small></div><div><h1>İçerik ekibi<br><em>el kitabı</em></h1><p>Yeni başlayan bir çalışan için: ne yapılır, nasıl yapılır, hangi kanalda ne paylaşılır. Her adım örnekle anlatıldı.</p></div><small>1 Ekim 2026 · simpletradejournal.io</small></div>
{sec_product()}{sec_gloss()}{sec_rules()}{sec_flow()}{sec_types()}{sec_matrix()}{sec_platforms()}{sec_faq()}{sec_more()}
</body></html>"""
open("handbook.html", "w").write(HTML)
print("ok", len(T), "kart", len(PG), "kanal")
