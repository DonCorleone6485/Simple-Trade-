import html, sys
sys.path.insert(0, ".")
import subprocess as _sp
_r=_sp.run([sys.executable,"check.py"],capture_output=True,text=True)
if "uyuşmazlık: 0" not in _r.stdout:
    print(_r.stdout); sys.exit("Tablo ile platform bölümleri uyuşmuyor; PDF üretilmedi.")

esc=html.escape

TEAM=[("Video yapımcısı / kurgucu","Ekran kaydı, kısa ve uzun video, altyazı, kurgu"),
("Grafik tasarımcı","Kartlar, karuseller, infografikler, thumbnail, kapaklar, şablon PDF'leri"),
("Yazar","Blog, karşılaştırma, bülten, thread, sözlük, yardım metinleri"),
("Sosyal medya ve topluluk yöneticisi","Paylaşım takvimi, yayınlama, yorum ve topluluk yanıtları, Discord/Reddit"),
("Trader danışman (yarı zamanlı)","Her içeriğin doğruluğunu ve uyumunu yayından önce kontrol eder")]

# (no, başlık, açıklama, örnek, üretici)
TYPES=[
("A","Video içerikleri (video yapımcısı)",[
(1,"Uzun eğitim videoları (8-15 dk)","Journal tutma, R-multiple, beklenti, risk yönetimi. Bir kez çekilir, uzun süre izlenir; kısa kesitleri diğer kanallara bölünür.","\"Trading journal nasıl tutulur? 10 dakikada adım adım\""),
(2,"Kurulum ve ürün turu videoları","Ekran kaydıyla MetaTrader senkronu, dosya içe aktarma ve özelliklerin gezdirilmesi.","\"MT5'ten otomatik senkron: kurulum 5 adımda\""),
(3,"Kısa ipucu videoları (15-60 sn)","Tek fikir, ilk 3 saniyede konu. Altyazılı, dikey (9:16).","\"R-multiple 30 saniyede\""),
(4,"Hata analizi videoları","Örnek (demo) veriyle bir işlem hatasını gösterir: \"Bu işlemde hatayı bul\".","\"Aşırı işlemin 3 işareti\""),
(5,"Prop firma kural rehberleri (video)","Günlük ve toplam kayıp limiti, drawdown kuralları ve takip yöntemi.","\"Günlük kayıp limitini nasıl takip edersin?\""),
(6,"Canlı yayın ve soru-cevap (ayda 1)","Topluluğun sorularını canlı cevaplar; kayıt, kısa videolara bölünür.","\"Ayın soru-cevap yayını\"")]),
("B","Tasarım içerikleri (grafik tasarımcı)",[
(7,"Karusel (5-7 kart)","Bir konuyu adım adım anlatan kaydırmalı kartlar. LinkedIn'de PDF karusel olarak da kullanılır.","\"Pozisyon büyüklüğü 5 adımda\""),
(8,"Kural ve alıntı kartları","Tek görsel, tek kural. En hızlı üretilen ve en çok yeniden kullanılan içerik.","\"Kayıptan sonra ilk işlemi yazmadan açma\""),
(9,"İnfografik ve metrik şemaları","Formüller ve kavramlar görsel olarak: R-multiple, beklenti, kâr faktörü.","\"Beklenti formülü tek görselde\""),
(10,"Ürün güncelleme görselleri","Yeni özelliğin ekran görüntüsü ve kısa açıklaması.","\"Yeni: prop firma limit göstergesi\""),
(11,"Kapak ve thumbnail tasarımları","YouTube kapakları, blog kapakları, hesap kapakları ve profil görselleri.","\"Her video için dikkat çeken kapak\""),
(12,"İndirilebilir şablonlar (PDF)","İşlem öncesi kontrol listesi, haftalık gözden geçirme sayfası. E-posta toplamak için kullanılabilir.","\"İşlem öncesi kontrol listesi PDF\"")]),
("C","Yazı içerikleri (yazar)",[
(13,"Blog yazıları (haftalık)","Journal, metrikler, psikoloji, risk, prop firma kümeleri. Sitede yayınlanır, diğer kanallara bağlantı verilir.","\"R-multiple nedir ve nasıl hesaplanır?\""),
(14,"Karşılaştırma yazıları","\"X alternatifi\" yazıları; satın almaya yakın aramalar.","\"Tradezella alternatifi\""),
(15,"Prop firma ve broker sayfaları","Her firma ve broker için kural özeti ve takip rehberi.","\"FTMO kuralları takip aracı\""),
(16,"Kısa metinler ve thread","Günlük ipucu, ürün duyurusu, kısa thread.","\"Bir intikam işleminin anatomisi\" (thread)"),
(17,"Haftalık bülten","Haftanın yazıları, yeni araçlar ve güncellemeler.","\"Haftalık özet\""),
(18,"Sözlük, SSS ve yardım içerikleri","Terimler, kurulum soruları, sık sorulan sorular.","\"Trading terimleri sözlüğü\"")]),
("D","Araç ve topluluk içerikleri (yazılım + topluluk yöneticisi)",[
(19,"Ücretsiz hesap makineleri","Pozisyon büyüklüğü, risk/ödül, prop firma kaybı; sonra beklenti ve başabaş oranı. Aranır, paylaşılır, siteye trafik getirir.","\"Pozisyon büyüklüğü hesap makinesi\""),
(20,"Topluluk içerikleri","Haftalık soru, anket, \"journal inceleme\" (kullanıcı kendi işlemini paylaşır, geri bildirim alır).","\"Bu hafta en büyük hatan neydi?\""),
(21,"Yardım yorumları (bağlantısız)","Reddit, Quora, X ve Discord'da başkalarının sorularına gerçek yardım. Bağlantı yok ya da çok az.","\"Pozisyon büyüklüğünü nasıl hesaplarım?\" sorusuna cevap"),
(22,"Vaka çalışmaları (gerçek kullanıcıdan, izinle)","Bir kullanıcının journal ile neyi fark ettiği. İlk gerçek kullanıcılardan sonra başlar; uydurma yok.","\"Kullanıcı hikâyesi: intikam işlemlerini nasıl azalttı?\""),
(23,"Perde arkası ve yapım süreci","Ne yaptık, ne öğrendik, hangi özellik geliyor. Markaya insani yüz katar.","\"Bu hafta ürüne neler ekledik\"")]),
]

PLAT=["Web","IG","X","YT","TT","TG","FB","LI","RD","DC"]
PNAME={"Web":"Web sitesi","IG":"Instagram","X":"X","YT":"YouTube","TT":"TikTok","TG":"Telegram","FB":"Facebook","LI":"LinkedIn","RD":"Reddit","DC":"Discord"}
# ● ana kanal (içeriğin evi / özel üretilir), ○ uyarlama veya yeniden kullanım, boş = yok
M={
1:"o . o ● . o o o . o",   # fill below properly
}
def row(s): return s.split()
MX={
1:"✓ ↗ ↗ ● ↗ ↗ ↗ ↗ - ↗",
2:"● ✓ ✓ ● ✓ ✓ ✓ ✓ - ✓",
3:"- ● ✓ ● ● ✓ ✓ ✓ - ✓",
4:"- ● ✓ ● ● ✓ ✓ ✓ - ✓",
5:"✓ ✓ ✓ ● ✓ ✓ ✓ ● - ✓",
6:"- ● ↗ ● - ↗ ↗ ↗ - ●",
7:"- ● ✓ - - ✓ ✓ ● - ✓",
8:"- ● ● - - ● ✓ ✓ - ✓",
9:"● ✓ ✓ - - ✓ ✓ ✓ ✓ ✓",
10:"● ✓ ● - - ● ✓ ● - ●",
11:"● ✓ - ● - - - - - -",
12:"● ↗ ↗ ↗ - ● - ✓ - ●",
13:"● ↗ ↗ - - ↗ ↗ ✓ ✓ ↗",
14:"● - ↗ - - ↗ - ↗ - -",
15:"● - ↗ - - ↗ - ✓ - ↗",
16:"- - ● - - ✓ ✓ ✓ - -",
17:"● - ↗ - - ✓ - ↗ - -",
18:"● - ↗ - - - - - - ↗",
19:"● ✓ ● ✓ ✓ ● ✓ ✓ ✓ ✓",
20:"- ● ● - - ● ✓ ✓ ✓ ●",
21:"- ✓ ✓ ✓ ✓ - - - ● ●",
22:"● ✓ ✓ ✓ - ✓ - ● - ✓",
23:"✓ ✓ ● ✓ ✓ ✓ - ● - ✓",
}
# YT col for 20 etc already fixed. map
def mat_html():
    th="".join(f"<th class='c'>{esc(PNAME[p])}</th>" for p in PLAT)
    out=f"<table class='mx'><tr><th class='n'>#</th><th>İçerik türü</th>{th}</tr>"
    for grp,gname,items in TYPES:
        out+=f"<tr><td class='grp' colspan='{2+len(PLAT)}'>{esc(gname)}</td></tr>"
        for no,t,d,e in items:
            cells=row(MX[no]); assert len(cells)==len(PLAT),(no,len(cells))
            tds="".join(f"<td class='c {'a' if c=='●' else ('b' if c=='✓' else ('l' if c=='↗' else 'z'))}'>{c if c!='-' else ''}</td>" for c in cells)
            out+=f"<tr><td class='n'>{no}</td><td>{esc(t)}</td>{tds}</tr>"
    return out+"</table>"

PLATFORMS=[
("Web sitesi","simpletradejournal.io","Tüm trafiğin toplandığı merkez. Diğer kanallar buraya yönlendirir; Google'dan gelen organik trafik de buraya düşer.",
 "Açık",
 [("Ne için kullanılacak","Yazılar, karşılaştırmalar, prop firma ve broker sayfaları, ücretsiz araçlar, sözlük ve yardım. Diğer her kanalın bağlantı verdiği yer."),
  ("İçerik türleri","2, 5, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 22 (ana); 1, 23 (gömme ve değişiklik günlüğü)."),
  ("Hedef","Haftada 1 yeni yazı, ayda 1 yeni araç ya da sayfa kümesi, değişiklik günlüğü her yayında."),
  ("Dikkat","Yeni her sayfa 9 dilde yayınlanır, Search Console ve IndexNow'a bildirilir. Kâr vaadi yok; örnekler 'örnek hesaptır' notuyla.")]),
("Instagram","@simpletradejournal","Görsel ve kısa video vitrini. Kaydırmalı kartlar ve Reels ile tanınırlık, story ile günlük temas. Threads otomatik gelir.",
 "Açık",
 [("Feed","Karusel (7), kural kartları (8), infografik (9), ürün güncelleme görselleri (10)."),
  ("Reels","Kısa ipucu (3), hata analizi (4), ürün turu kesitleri (2), prop firma kesitleri (5)."),
  ("Story","Anket ve soru kutusu (20), yeni yazı bağlantısı (13), araç duyurusu (19), perde arkası (23)."),
  ("Öne çıkanlar","Kurulum, Araçlar, SSS, Güncellemeler."),
  ("Hedef","Haftada 2 karusel, 3 Reels, günlük story. Hepsi aynı marka kitinde (koyu zemin, altın vurgu)."),
  ("Dikkat","Gönderi içine bağlantı konmaz; bağlantı biyografide ve story'de. Facebook'a otomatik yansır.")]),
("X","@SimpleTradeJrnl","Trader topluluğunun tartışma yeri. Hızlı ipuçları, ürün duyuruları ve yardım yanıtları.",
 "Açık",
 [("İçerik türleri","16 (günlük ipucu ve thread), 8, 10, 19, 20, 21, 23; 13/14/15 için bağlantı paylaşımı."),
  ("Hedef","Günde 1-2 paylaşım; haftada 1 görselli; haftada 1 thread."),
  ("Reklam","Verilmeyecek; organik büyüme."),
  ("Dikkat","Hesap 15 karakter sınırı yüzünden @SimpleTradeJrnl. Sinyal ve fiyat tahmini paylaşılmaz.")]),
("YouTube","@simpletradejournal (hedef)","Eğitim ve kurulum videolarının evi; Google'da da çıkar, bir kez yüklenen video uzun süre izlenir.",
 "Henüz açılmadı: admin@ hesabı 30 günlük olunca (11 Ekim sonrası)",
 [("Kanal yapısı","Marka hesabı, ad Simple Trading Journal; kapak, logo, açıklamada site bağlantısı."),
  ("Uzun videolar","1, 2, 5, 6 (canlı kayıt). Her video için anahtar kelimeli başlık, ayrıntılı açıklama, altyazı."),
  ("Shorts","3 ve 4; her uzun videodan 1-3 kısa kesit."),
  ("Oynatma listeleri","Başlangıç, Risk, Psikoloji, MetaTrader Kurulumu, Prop Firma Kuralları."),
  ("Hedef","Haftada 1 uzun video, 2-3 Shorts."),
  ("Dikkat","Thumbnail (11) tasarımı tıklanma oranını belirler; her videoda site bağlantısı açıklamada.")]),
("TikTok","kullanıcı adı otomatik verildi; 30 Ekim'den sonra simpletradejournal","Kısa ve hızlı keşif kanalı. Genç trader'lara ulaşmak için.",
 "Açık (adı bekliyor)",
 [("İçerik türleri","3, 4 (ana); 2, 5, 19, 21, 23 uyarlanır."),
  ("Format","Dikey 9:16, 15-60 sn, altyazı şart, ilk 3 saniye konu."),
  ("Hedef","Haftada 3 video; Reels ve Shorts ile aynı çekim."),
  ("Dikkat","İş hesabı olarak ayarlı (istatistik için). Kâr gösteren ekran görüntüsü paylaşılmaz.")]),
("Telegram","t.me/simpletradejournal","Duyuru kanalı: yeni yazı, araç, kural ve güncelleme. Doğrudan ve düzenli temas.",
 "Açık",
 [("İçerik türleri","8 (günlük kural), 10, 12, 13, 19, 20 (anket); diğer kanalların özetleri."),
  ("Hedef","Günde 1 paylaşım; haftada 1 özet."),
  ("Dikkat","Sabitlenmiş mesajda site bağlantısı ve kısa tanıtım. Kanal herkese açık.")]),
("Facebook","facebook.com/simpletradejournalapp","Meta reklam hesabı ve Pixel için gerekli sayfa; ek efor harcanmaz.",
 "Açık",
 [("Nasıl çalışır","Instagram paylaşımları otomatik yansır. Ayrı içerik üretilmez."),
  ("İçerik türleri","7, 8, 13 (otomatik yansıyanlar); 6 için etkinlik duyurusu."),
  ("Dikkat","Sayfa kapatılmaz. İkinci yönetici ve Meta Business portföyü kurulacak.")]),
("LinkedIn","linkedin.com/company/simpletradejournal","Profesyonel trader'lar, prop firma ve broker ortakları, kurumsal imaj.",
 "Açık",
 [("İçerik türleri","7 (PDF karusel), 5, 10, 13, 14, 15, 22, 23."),
  ("Hedef","Haftada 2 gönderi. Kalite miktardan önemli."),
  ("Ek","Kurucunun kişisel profilinden paylaşım, şirket sayfasından daha çok görünür."),
  ("Dikkat","Duygusal değil, veri ve disiplin odaklı dil. Ortaklık duyuruları ilk bağlantıdan sonra.")]),
("Reddit","u/simpletradejournal","Reklam değil, yardım. Topluluk güveniyle yavaş büyür.",
 "Açık (paylaşım yok)",
 [("İlk dönem","İlk 1-2 ay yalnız okuma ve yorum; topluluk kurallarını öğren."),
  ("İçerik türleri","21 (yardım yorumları); uygun olduğunda 13 tarzı uzun yazılar."),
  ("Hedef","Haftada 3 yorum."),
  ("Dikkat","Yeni hesapla bağlantı koymak spam sayılır. Bağlantı yok ya da yalnız profilden. Subreddit kuralları her zaman önce.")]),
("Discord","discord.gg/yUJ5NXyJHg","Kullanıcı topluluğu, destek ve geri bildirim.",
 "Açık",
 [("Kanallar","welcome, announcements, general, support, feedback; LANGUAGES: turkish, persian."),
  ("İçerik türleri","20 (haftalık soru, journal inceleme), 6 (aylık ses odası), 10, 12, 21."),
  ("Hedef","Haftada 1 duyuru, 1 tartışma sorusu."),
  ("Dikkat","Sunucu canlı tutulmalı; boş sunucu kötü görünür. Davet bağlantısı süresiz.")]),
]
SUGG=[
("TradingView","Trader'ların zaman geçirdiği yer. Profil ve fikir paylaşımı. Reddit gibi önce yardım; sinyal paylaşılmaz.","16, 21"),
("Quora","Soru-cevap; iyi cevaplar Google'da çıkar. 'How to keep a trading journal?' gibi sorulara %90 bilgi, %10 bağlantı.","21, 13"),
("Medium","Blog yazılarının kısa versiyonları; sitedeki yazıya bağlantı (orijinal olarak işaretlenir).","13"),
("Product Hunt ve dizinler","Lansman ve geri bağlantı: AlternativeTo, SaaSHub. Metinler docs/listings.md'de hazır.","10, 19"),
]

RHYTHM=[("Pazartesi","Yazar: haftanın blog yazısı. Danışman: önceki haftanın içeriğini gözden geçirir."),
("Salı","Video yapımcısı: haftanın uzun videosunu çeker. Tasarımcı: kartları hazırlar."),
("Çarşamba","Video yapımcısı: kurgu, altyazı. Sosyal medya yöneticisi: blog yazısını ve kartları yayınlar."),
("Perşembe","Video yapımcısı: uzun videodan 3-5 kısa kesit. Danışman: tüm taslakları onaylar."),
("Cuma","Sosyal medya yöneticisi: uzun video ve kesitleri yayınlar; haftalık bülten. Topluluk sorusu."),
("Cumartesi","Haftalık özet e-postası otomatik. Sosyal medya yöneticisi: yorum ve topluluk yanıtları."),
("Pazar","Dinlenme; sosyal medya yöneticisi yalnız yanıtlara bakar.")]

RULES=["Kâr vaadi, 'garanti', sinyal, fiyat tahmini ve yatırım tavsiyesi hiçbir içerikte yok.",
"Örnek işlem ve rakamlar 'demo/örnek veri' diye açıkça yazılır; gerçek bir kullanıcının hesabı izin olmadan gösterilmez.",
"Vaka çalışması ve yorumlar yalnız gerçek kullanıcıdan, yazılı izinle; karşılıklı ödül varsa belirtilir.",
"Her içerik yayından önce trader danışmandan geçer: doğruluk, uyum, abartı.",
"Her sayfada ve uygun gönderilerde 'Yatırım tavsiyesi değildir; trading risk taşır' notu.",
"Kullanıcı verisi (e-posta, kimlik, işlem) hiçbir kanalda ve raporda yayınlanmaz.",
"Tek içerikten çok kanal: bir uzun içerik (video ya da yazı) üretilir, ekip onu kartlara, kısa videolara, thread'e ve bültene böler.",
"Video bir kez çekilir, her kanala yüklenir: Reels, TikTok, YouTube Shorts, X, Telegram, Facebook ve LinkedIn aynı çekimi kullanır. Başka platformun filigranı olmayan orijinal dosya yüklenir; başlık, açıklama ve altyazı her kanal için ayrıca yazılır.",
"Marka kiti: koyu zemin #08080c, yazı #F4F2EC, altın #f0b429 yalnız vurgu; başlıklar Newsreader, metin Inter. Logo: STJ işareti, altın yalnız J'de."]

def types_html():
    o=""
    for grp,gname,items in TYPES:
        o+=f"<h3>{esc(gname)}</h3>"
        for no,t,d,e in items:
            o+=f"<div class='ty'><div class='tn'>{no}</div><div><b>{esc(t)}</b><p>{esc(d)}</p><p class='ex'>Örnek: {esc(e)}</p></div></div>"
    return o

def plat_html():
    from plat import P
    o=""
    for i,(n,addr,status,why,items,rest) in enumerate(P,1):
        o+=f"<section class='pl'><h3>{i}. {esc(n)}</h3><p class='meta'>{esc(addr)} · <span class='st'>{esc(status)}</span></p><p>{esc(why)}</p><h4>Paylaşılacak içerikler</h4>"
        for tn,t,d,ex in items:
            exh="".join(f"<li>{esc(x)}</li>" for x in ex)
            exb=f"<ul class='exl'>{exh}</ul>" if ex else ""
            o+=f"<div class='it'><div class='tb'>Tür {esc(tn)}</div><div class='bd'><b>{esc(t)}</b><p>{esc(d)}</p>{exb}</div></div>"
        o+="<table class='t kv'>"+"".join(f"<tr><th>{esc(k)}</th><td>{esc(v)}</td></tr>" for k,v in rest)+"</table></section>"
    return o

def sugg_html():
    o="<table class='t'><tr><th>Platform</th><th>Ne için</th><th>Tür #</th></tr>"
    for n,w,t in SUGG: o+=f"<tr><td><b>{esc(n)}</b></td><td>{esc(w)}</td><td>{esc(t)}</td></tr>"
    return o+"</table>"

team="".join(f"<tr><td><b>{esc(a)}</b></td><td>{esc(b)}</td></tr>" for a,b in TEAM)
rhythm="".join(f"<tr><td><b>{esc(a)}</b></td><td>{esc(b)}</td></tr>" for a,b in RHYTHM)
rules="".join(f"<li>{esc(r)}</li>" for r in RULES)
tot=sum(len(i[2]) for i in TYPES)

HTML=f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Simple Trading Journal — İçerik ve Platform Stratejisi</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
@page{{size:A4;margin:16mm 15mm 18mm}}
@page wide{{size:A4 landscape;margin:8mm 10mm}}
@page cover{{size:A4;margin:0}}
*{{box-sizing:border-box}}
body{{font-family:Inter,system-ui,sans-serif;font-size:10pt;line-height:1.5;color:#17171d;margin:0}}
h1,h2{{font-family:Newsreader,Georgia,serif;font-weight:400;margin:0}}
.cover{{page:cover;background:#08080c;color:#F4F2EC;margin:0;padding:30mm 20mm 24mm;width:210mm;height:297mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always}}
.cover h1{{font-size:44pt;line-height:1.05;letter-spacing:-.01em}}.cover h1 em{{color:#f0b429}}
.cover p{{color:rgba(244,242,236,.72);font-size:12.5pt;max-width:130mm;margin:8mm 0 0}}
.cover small{{color:rgba(244,242,236,.5);letter-spacing:.05em}}
h2{{font-size:19pt;border-top:2px solid #f0b429;padding-top:4mm;margin:0 0 4mm}}
h3{{font-size:12pt;font-weight:600;margin:5mm 0 2mm}}
h4{{font-size:9.5pt;font-weight:600;margin:3mm 0 .5mm;color:#5a4a14;text-transform:uppercase;letter-spacing:.04em}}
p{{margin:0 0 2mm}}
.sec{{page-break-before:always}}
table.t,table.mx{{border-collapse:collapse;width:100%}}
table.t th,table.t td{{text-align:left;padding:1.8mm 2.4mm;border-bottom:1px solid #e3e3ea;vertical-align:top;font-size:9.5pt}}
table.t th{{background:#f6f5f1;font-weight:600}}
.ty{{display:flex;gap:3mm;margin:0 0 3mm;break-inside:avoid}}
.tn{{flex:0 0 7mm;height:7mm;border-radius:50%;background:#f0b429;color:#08080c;font-weight:600;font-size:9pt;display:flex;align-items:center;justify-content:center;margin-top:.6mm}}
.ty p{{margin:0}}.ex{{color:#5e5e6b;font-size:9pt;font-style:italic}}
.wide{{page:wide;page-break-before:always}}.wide h2{{font-size:15pt;padding-top:2mm;margin-bottom:2mm}}
table.mx th,table.mx td{{border:1px solid #dcdce3;padding:.45mm 1.4mm;font-size:8pt;line-height:1.25}}
table.mx th{{background:#08080c;color:#F4F2EC;font-weight:600}}table.mx th.c,table.mx td.c{{text-align:center;width:15.5mm}}
table.mx th.n,table.mx td.n{{width:7mm;text-align:center}}
td.grp{{background:#f6f5f1;font-weight:600;font-size:8.6pt}}
td.a{{background:#fff3cf;color:#8a5a06;font-size:9.5pt;font-weight:700}}td.b{{background:#e6f4ea;color:#1d6b34;font-size:9.5pt;font-weight:700}}td.l{{background:#eef0fb;color:#3a45a0;font-size:9.5pt;font-weight:700}}
.legend{{font-size:8.5pt;margin:1mm 0 2mm;line-height:1.35}}
.pl{{break-inside:avoid-page;margin-bottom:6mm}}.pl h3{{font-family:Newsreader,serif;font-size:15pt;font-weight:600;margin-top:0;border-bottom:1px solid #e3e3ea;padding-bottom:1mm}}
.meta{{color:#5e5e6b;font-size:9pt}}.st{{color:#8a5a06;font-weight:600}}
ul{{margin:1mm 0 2mm;padding-left:5mm}}li{{margin:1mm 0}}
.it{{display:flex;gap:3mm;margin:0 0 3mm;break-inside:avoid}}.tb{{flex:0 0 17mm;font-size:7.8pt;font-weight:600;color:#5a4a14;background:#fff3cf;border-radius:1.5mm;padding:1mm 1.2mm;text-align:center;align-self:flex-start;line-height:1.25}}.bd p{{margin:.5mm 0 1mm}}.exl{{margin:0 0 1mm;padding-left:4.5mm;color:#4a4a56;font-size:9pt}}.exl li{{margin:.2mm 0}}table.kv th{{width:24mm;background:#f6f5f1;font-size:9pt}}table.kv td{{font-size:9pt}}.pl{{break-inside:auto;page-break-before:always}}.pl:first-of-type{{page-break-before:avoid}}.foot{{color:#8a8a96;font-size:8.5pt;margin-top:6mm}}
</style></head><body>
<div class="cover"><div><small>SIMPLE TRADING JOURNAL</small></div>
<div><h1>İçerik ve<br><em>platform stratejisi</em></h1><p>{tot} içerik türü, 10 kanal, bir içerik ekibi: kim ne üretir, hangi kanalda nasıl paylaşılır.</p></div>
<small>Ekip referans belgesi · 1 Ekim 2026 · simpletradejournal.io</small></div>

<h2>Bölüm 1: Ekip</h2>
<p>Küçük bir ekip, 10 kanalı yürütebilir; çünkü her hafta bir uzun içerik üretilir ve tüm kanallara bölünür. 4 kişi ve yarı zamanlı bir danışman yeter.</p>
<table class="t"><tr><th>Rol</th><th>Ne yapar</th></tr>{team}</table>
<h3>Ortak kurallar (her içerik ve her kanal için)</h3><ul>{rules}</ul>

<div class="sec"><h2>Bölüm 2: İçerik türleri ({tot} tür)</h2>
<p>Her tür bir kez tanımlanır, sonra Bölüm 3'teki tabloda hangi kanallarda kullanıldığı gösterilir.</p>{types_html()}</div>

<div class="wide"><h2>Bölüm 3: İçerik × platform tablosu</h2>
<p class="legend"><b style="color:#8a5a06">●</b> ana kanal: içerik burada özel üretilir ya da evi burasıdır &nbsp;·&nbsp; <b style="color:#1d6b34">✓</b> aynı içerik doğrudan paylaşılır (uygun metinle); araçlarda aracı tanıtan içerik &nbsp;·&nbsp; <b style="color:#3a45a0">↗</b> kesit ya da bağlantıyla duyurulur &nbsp;·&nbsp; boş: bu kanalda yok. &nbsp; Kısaltmalar: IG Instagram, YT YouTube, TT TikTok, TG Telegram, FB Facebook, LI LinkedIn, RD Reddit, DC Discord. Prensip: uygun içerik mümkün olduğu kadar çok kanalda paylaşılır.</p>
{mat_html()}</div>

<div class="sec"><h2>Bölüm 4: Platform platform neler yapılacak</h2>
<p>Her kanal için: amacı, durumu, paylaşılacak her içerik türü (ne olduğu, nasıl üretileceği, örnek başlıklar), hedef, reklam, dikkat edilecekler ve ölçüm. Sıklıklar hedeftir; ekip kapasitesine göre ayarlanır. Reklam şimdilik verilmez (şirket kurulunca ve Pixel eklenince değerlendirilir).</p>{plat_html()}</div>

<div class="sec"><h2>Bölüm 5: Önerilen ek platformlar</h2><p>Hesap sayısını artırmak yerine geri bağlantı ve görünürlük sağlayanlar. Şimdilik açılmaz; ekip oturunca eklenir.</p>{sugg_html()}
<h2 style="margin-top:9mm">Bölüm 6: Haftalık üretim akışı</h2>
<table class="t"><tr><th>Gün</th><th>İş</th></tr>{rhythm}</table>
<p class="foot">Bu belge, ürün ve kanal durumlarını 1 Ekim 2026'daki hâliyle anlatır. İçerik takvimi: docs/content-calendar.md · Marka kiti: docs/brand-kit.md.</p></div>
</body></html>"""
open("stj-strateji.html","w").write(HTML)
print("tot",tot)
