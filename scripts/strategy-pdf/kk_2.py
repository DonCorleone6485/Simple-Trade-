from kk_lib import *
import csv
SP=json.load(open(PK+"/channel-specs.json",encoding="utf-8"))
CH=["web","instagram","x","youtube","tiktok","telegram","facebook","linkedin","reddit","discord"]
def rules():
    R={}
    for l in open(PK+"/04-type-channel-rules.csv",encoding="utf-8").read().strip().split("\n")[1:]:
        t,c,s=l.split(","); R.setdefault(int(t),{})[c]=s
    return R
def types():
    T_={}
    for l in open(PK+"/03-content-types.csv",encoding="utf-8").read().strip().split("\n")[1:]:
        p=l.split(";"); T_[int(p[0])]=dict(name=p[1],grp=p[2],mode=p[3],desc=p[4],ex=p[5])
    return T_

def b5():
    h=sec(5,"Sistem bir bakışta")
    h+="<h3>Parçalar</h3><p>Sistem şu parçalardan oluşur. Her birini ilerleyen bölümlerde ayrı ayrı kuracaksın.</p>"
    h+="""<div class="arch">
<div><b>Yönetici sayfası</b>İnsanların kullandığı web sayfası: içerik yükle, karara bak, onayla, izle. (Bölüm 15)</div>
<div><b>Sunucu (API)</b>Sayfanın ve diğer parçaların konuştuğu yer. Girişi kontrol eder, işleri yönlendirir.</div>
<div><b>Veritabanı + depolama</b>Tüm kayıtlar ve dosyalar (Supabase). (Bölüm 8)</div>
<div><b>Kural motoru</b>Hangi içerik hangi kanala gider kararını <b>kodla</b> verir. (Bölüm 10)</div>
<div><b>Yapay zekâ</b>İçerik türünü anlar, kanala özel metin yazar, kuralları denetler. (Bölüm 9, 12)</div>
<div><b>Video işleyici</b>Dikeye çevirme, kesit, kapak kare, altyazı: ffmpeg. (Bölüm 11)</div>
<div><b>Yayın adaptörleri</b>Her kanala gönderen küçük parçalar ve kuyruk. (Bölüm 14)</div>
<div><b>Bildirim</b>\"Onayını bekliyor\", \"hata var\" mesajları Telegram'dan.</div>
<div><b>Rapor</b>Haftalık özet: ne yayınlandı, hangi kanal ne kadar iş yaptı.</div></div>"""
    h+="<h3>Kim neye karar verir?</h3>"+T(["İş","Kim yapar","Neden"],[
    ["Hangi kanala gider / gitmez","<span class='pill g'>Kural motoru (kod)</span>","Süre, yön, boyut, karakter sınırı kesin kuraldır. Kod her seferinde aynı sonucu verir, nedenini yazar ve testle doğrulanır. Yapay zekâ bazen yanlış karar verir."],
    ["İçeriğin 23 türden hangisi olduğu","<span class='pill y'>Kod + yapay zekâ</span>","Biçim, yön, süre dosyadan okunur. \"Bu bir hata analizi videosu\" gibi anlamı yapay zekâ çıkarır. Emin değilse sorar."],
    ["Her kanal için metin","<span class='pill y'>Yapay zekâ</span>","Ton, uzunluk, hashtag, çağrı. Yazmak onun güçlü olduğu iştir."],
    ["Metin kurallara uyuyor mu","<span class='pill g'>Kod + ikinci kontrol</span>","Karakter sınırı ve yasak kelime listesi kodla sayılır. Riskli cümleleri ikinci bir yapay zekâ turu yakalar."],
    ["Bilgi doğru mu, uyum var mı","<span class='pill r'>Trader danışman</span>","Rakam, formül, kural bilgisi."],
    ["Yayın","<span class='pill r'>Yönetici</span>","Onay olmadan hiçbir şey yayınlanmaz."]])
    h+=box("ok","Tek cümlelik ilke","<p><b>Karar kodla, yazı yapay zekâyla, yayın izinle.</b> Bir kural değişince (örneğin bir platformun süre sınırı) yalnız bir tablo satırı güncellenir; sistem yeniden yazılmaz.</p>")
    h+="<h3>Durumlar: bir içerik hangi aşamalardan geçer?</h3><p>Her içeriğin <code>status</code> alanı vardır:</p>"
    h+=T(["Durum","Anlamı"],[["draft","Yüklendi, henüz analiz başlamadı."],["analyzing","Sistem biçimi okuyor, türü anlıyor."],["needs_input","Sistem bir şey sormak istiyor (tür belirsiz, bağlantı eksik, kapak lazım...)."],["preparing","Kararlar verildi; kesit, kapak, metin hazırlanıyor."],["pending_advisor","Danışmanın onayını bekliyor."],["pending_owner","Yöneticinin onayını bekliyor."],["scheduled","Onaylandı, kuyrukta, yayın saatini bekliyor."],["publishing","Kanallara gönderiliyor."],["done","Hepsi sonuçlandı (yayınlandı, atlandı ya da görev yapıldı)."],["cancelled","İptal edildi."]])
    h+="<p>Her kanalın kendi durumu da vardır (<code>outputs.status</code>): <code>draft, needs_input, ready, approved_advisor, approved_owner, rejected, queued, publishing, published, failed, skipped</code>. Böylece bir kanal hata verse bile diğerleri yoluna devam eder.</p>"
    return h

CH_INFO={
"web":("Web sitesi","simpletradejournal.io","Açık","Tüm trafiğin toplandığı merkez. Blog yazıları, ücretsiz araçlar, prop firma ve broker sayfaları, sözlük, yardım sayfası burada yaşar. Google'dan gelen trafik buraya düşer. Site <b>9 dilde</b> yayınlanır.","<b>Otomatik yayın YOK.</b> Site geliştirici tarafından güncellenir. Sistem, siteye eklenecek içerik için geliştiriciye bir <b>iş kartı</b> üretir. Sayfa yayınlanınca adresi (canonical_url) içeriğe yazılır; diğer kanallardaki bağlantılar buradan alınır."),
"instagram":("Instagram","@simpletradejournal","Açık","Görsel vitrin. Kaydırmalı kartlar (karusel), Reels (dikey kısa video), story. Metindeki bağlantı tıklanmaz; bağlantı biyografidedir.","Planlayıcı servisi üzerinden. Dikey kapak ister (Reels). Metinde bağlantı yazma, \"link in bio\" de."),
"x":("X","@SimpleTradeJrnl","Açık","Trader topluluğunun hızlı tartışma yeri. Günlük kısa ipucu, thread, ürün duyurusu, yardım yanıtları. Hesap adı 15 karakter sınırı yüzünden kısa.","Planlayıcı servisi üzerinden (X'in kendi API'si ücretli). 280 karakter; uzun yazı thread olur."),
"youtube":("YouTube","@simpletradejournal","<b>KAPALI</b> (kanal 11 Ekim 2026'dan sonra açılacak)","Eğitim ve kurulum videolarının evi. Uzun videolar ve Shorts. Arama motorunda da çıkar.","Kanal açılana kadar sistemde <code>enabled=false</code>. Açılınca <code>true</code> yap; başka bir şey değişmez. Uzun videoda 1280×720 thumbnail zorunlu."),
"tiktok":("TikTok","(kullanıcı adı 30 Ekim 2026'dan sonra düzeltilecek)","Açık","Kısa, enerjik dikey videolar. Metinde bağlantı yok.","Planlayıcı servisi üzerinden. Dikey video ya da foto karusel."),
"telegram":("Telegram","t.me/simpletradejournal","Açık","Topluluk kanalı. Her tür içerik. Metin İngilizce; istenirse Türkçe ve Farsça da eklenir.","<b>Doğrudan</b> Telegram Bot API ile (planlayıcı gerekmez). Bot token'ı sahibi verir."),
"facebook":("Facebook","facebook.com/simpletradejournalapp","Açık","Sayfa. En esnek kanal: video, görsel, yazı, bağlantı. Instagram ile aynı hesap ailesinde.","Planlayıcı servisi üzerinden."),
"linkedin":("LinkedIn","linkedin.com/company/simpletradejournal","Açık","Profesyonel ton, daha uzun metin, PDF karusel (belge gönderisi).","Planlayıcı servisi üzerinden. Görsel set tek PDF olarak yüklenir."),
"reddit":("Reddit","u/simpletradejournal","Açık","Topluluk forumu. Reklam kabul etmez, <b>yardım</b> bekler. İlk haftalar bağlantı yok.","<b>Otomatik atılmaz.</b> Sistem \"görev kartı\" üretir: hazır metin, dosya, kopyala düğmesi. İnsan Reddit'e kendisi yapıştırır."),
"discord":("Discord","discord.gg/yUJ5NXyJHg","Açık","Topluluk sunucusu. Kanallar: welcome, announcements, general, support, feedback. Türkçe ve Farsça dil kanalları var.","<b>Doğrudan</b> webhook ile (planlayıcı gerekmez). Dosya sınırı küçük (~10 MB): video bağlantıyla paylaşılır.")}
def b6():
    h=sec(6,"On kanal: tek tek")
    h+="<p>Şirketin 10 yayın yeri var. Her biri için: ne olduğu, nasıl yayınlanacağı ve sistem için ne anlama geldiği.</p>"
    for c in CH:
        n,a,s,d,m=CH_INFO[c]
        h+=f"<div class='card'><h3>{n} <span class='s'>· {a}</span></h3><p><span class='pill {'r' if 'KAPALI' in s else 'g'}'>{s}</span> <span class='pill b'>{SP['channels'][c]['mode']}</span></p><p>{d}</p><p><b>Sistem için:</b> {m}</p></div>"
    h+="<h3>Kanal sınırları (kısa tablo)</h3>"
    def lim(c):
        s=SP["channels"][c]; o=[]
        for k,l in [("caption_max","Metin"),("text_max","Metin"),("title_max","Başlık"),("description_max","Açıklama")]:
            if k in s: o.append(f"{l} ≤ {s[k]}")
        if s.get("clickable_link") is False: o.append("metinde link tıklanmaz")
        if s.get("max_attachment_mb"): o.append(f"dosya ≤ {s['max_attachment_mb']} MB")
        return ", ".join(o) or "—"
    h+=T(["Kanal","Yayın biçimi","Diller","Sınırlar"],[[SP['channels'][c]['name'],SP['channels'][c]['mode'],"/".join(SP['channels'][c]['language']),lim(c)] for c in CH])
    h+=box("warn","Bu sayıları doğrula","<p>Bu tablodaki sınırlar <b>başlangıç değerleridir</b>, genel bilgiyle yazıldı. Platformlar bunları sık değiştirir. Aşama 0'da her platformun <b>güncel resmi sayfasından</b> kontrol et (Ek B'deki liste) ve değişeni <code>channel-specs.json</code> içinde düzelt. Düzelttiğin her değeri sahibine yaz.</p>")
    h+=box("info","Yayın biçimleri ne demek?","<p><code>scheduler</code>: bir yayın servisi (Ayrshare gibi) üzerinden gönderilir. <code>direct_bot</code>: Telegram'a bot ile doğrudan. <code>webhook</code>: Discord'a webhook ile. <code>manual_task</code>: insan yapar (görev kartı). <code>site_task</code>: siteye geliştirici ekler (iş kartı).</p>")
    return h

def matris():
    R=rules(); Ty=types()
    th="".join(f"<th class='c'>{SP['channels'][c]['name']}</th>" for c in CH)
    o=f"<table class='mx'><tr><th>#</th><th>İçerik türü</th>{th}</tr>"
    for n in range(1,24):
        tds="".join(f"<td class='c {'A' if R[n][c]=='●' else 'B' if R[n][c]=='✓' else 'L' if R[n][c]=='↗' else ''}'>{R[n][c] if R[n][c]!='-' else ''}</td>" for c in CH)
        o+=f"<tr><td>{n}</td><td>{esc(Ty[n]['name'])}</td>{tds}</tr>"
    return o+"</table>"
def b7():
    Ty=types()
    h=sec(7,"23 içerik türü ve karar tablosu")
    h+="<p>Şirket ürettiği her içeriği 23 türden birine sokar. Tür, içeriğin <b>nerede yayınlanacağını</b> belirler. Aşağıdaki liste ve tablo şirketin kendi belgesinden alındı; <code>03-content-types.csv</code> ve <code>04-type-channel-rules.csv</code> dosyalarında da var.</p>"
    cur=None
    rows=[]
    for n in range(1,24):
        t=Ty[n]
        mode={"asset":" <span class='pill y'>varlık</span>","task":" <span class='pill y'>görev</span>","announce":" <span class='pill y'>duyuru</span>"}.get(t["mode"],"")
        rows.append([f"<b>{n}</b>",f"<b>{esc(t['name'])}</b>{mode}<br><span class='s'>{esc(t['grp'])}</span>",esc(t["desc"]),esc(t["ex"])])
    h+=T(["#","Tür","Ne olduğu","Örnek"],rows)
    h+="<h3>Karar tablosu: 23 tür × 10 kanal</h3>"+matris()
    h+=T(["İşaret","Anlamı","Sistem kararı"],[["<b style='color:#8a5a06'>●</b>","Ana kanal: içerik burada özel üretilir ya da evi burasıdır.","<b>GİDER</b>"],["<b style='color:#1a6b34'>✓</b>","Aynı içerik doğrudan paylaşılır (uygun metinle).","<b>GİDER</b>"],["<b style='color:#3a45a0'>↗</b>","Kesit ya da bağlantıyla duyurulur.","<b>DÖNÜŞTÜR</b>"],["(boş)","Bu kanalda yok.","<b>GİTMEZ</b>"]])
    h+="<h3>Üç özel tür</h3>"+T(["Tür","Neden özel","Sistem ne yapar"],[
    ["<b>6 · Canlı yayın ve soru-cevap</b>","Canlı yayının kendisi sistemden değil, platformdan yapılır.","Sistem yalnız <b>duyuru metnini</b> işler. Yayından sonra kayıt yüklenirse yeni içerik olarak tür 1 ya da 3 ile girilir."],
    ["<b>11 · Kapak ve thumbnail</b>","Yayınlanan içerik değil, başka içeriklerin görselidir.","Sistem bunu <b>varlık</b> (ASSET) olarak saklar; kimseye göndermez."],
    ["<b>21 · Yardım yorumları</b>","Reddit/X/Discord'da başkalarının sorusuna cevap. İnsan yazar.","Sistem yayınlamaz. Fırsatı <b>görev</b> olarak listeler."]])
    h+=box("info","Tür nasıl anlaşılır? (ipuçları)","<p>Sistem türü şu işaretlerle bulur (kural değil, yapay zekâya verilen ipuçlarıdır):</p>"+T(["Gördüğü","Büyük ihtimalle tür"],[["Ekran kaydı, MetaTrader ya da program arayüzü, 3+ dakika, adım adım","2 (kurulum/ürün turu) ya da 1 (uzun eğitim)"],["Dikey, ≤ 60 sn, tek fikir, ilk saniyede konu","3 (kısa ipucu)"],["\"Bu işlemde hatayı bul\" tarzı, demo işlem","4 (hata analizi)"],["Prop firma adı + kural (günlük kayıp, drawdown)","5 (video) ya da 15 (sayfa)"],["Birden çok görsel, sıralı kartlar","7 (karusel)"],["Tek görsel, tek cümlelik kural","8 (kural kartı)"],["Formül ya da şema görseli","9 (infografik)"],["Ürün ekran görüntüsü + \"yeni\"","10 (ürün güncelleme)"],["PDF, kontrol listesi","12 (şablon)"],["Uzun yazı, başlık, alt başlıklar","13 (blog) ya da 14 (karşılaştırma)"],["Tek-iki cümle, bağlantılı","16 (kısa metin)"],["Gerçek kullanıcı hikâyesi","22 (vaka) — yazılı izin şart"]],cls="")+"<p>Güven <b>0.75'in altındaysa</b> sistem tahmin yürütmez, çalışana sorar.</p>")
    return h

def b8():
    h=sec(8,"Veri modeli")
    h+="<p>Tüm bilgi bir PostgreSQL veritabanında (Supabase) durur. Şema <code>01-schema.sql</code> dosyasında; gerçek bir Postgres'te denendi, hatasız kuruluyor ve tohum verileri (10 kanal, 23 tür, 230 kural) yükleniyor. Aşağıdaki tablo, hangi tablonun ne işe yaradığını sade anlatır.</p>"
    h+=T(["Tablo","Ne tutar","Önemli noktalar"],[
    ["<code>channels</code>","10 kanal: ad, adres, açık mı, yayın biçimi, diller.","<code>enabled</code> false ise o kanal hiç seçilmez. YouTube başlangıçta false."],
    ["<code>content_types</code>","23 tür.","<code>publish_mode</code>: normal / asset / task / announce."],
    ["<code>type_channel_rules</code>","Karar tablosu: tür × kanal → ● ✓ ↗ -","230 satır. Kural değişince buradan güncellenir."],
    ["<code>app_users</code>","Yönetici sayfasına girebilen kişiler ve rolleri (owner / advisor / editor).","Listede olmayan giremez."],
    ["<code>contents</code>","Yüklenen her içerik: biçim, yön, süre, boyut, tür, not, durum.","<code>type_no</code> boşsa tür belirsizdir."],
    ["<code>outputs</code>","<b>İçerik × kanal × dil</b> başına bir satır: karar, dönüşümler, eksikler, metin, durum, yayın adresi.","Aynı içerik+kanal+dil iki kez eklenemez. <code>idempotency_key</code> benzersiz."],
    ["<code>assets</code>","Dosyalar: orijinal, kapak, thumbnail, altyazı, kart, kesit, dikey sürüm, pdf.","Sistemin ürettiği varlığı insan onaylar (<code>approved</code>)."],
    ["<code>approvals</code>","Kim, ne zaman, hangi aşamada (danışman/yönetici), ne dedi.","Silinmez: kayıt tutulur."],
    ["<code>tasks</code>","Elle yapılacaklar: Reddit paylaşımı, site sayfası, yardım yorumu.","Tamamlanınca yayın adresi yazılır."],
    ["<code>publish_log</code>","Her yayın olayı: kuyruğa girdi, başladı, tamam, hata, tekrar.","Sorun çıkınca ilk baktığın yer."]])
    h+=box("warn","Güvenlik: tablolar kapalı","<p>Tüm tablolarda <b>RLS açık ve politika yok</b>. Bu, tarayıcıdan hiç kimsenin tablolara doğrudan erişemeyeceği anlamına gelir. Yalnızca <b>sunucu</b> (özel service-role anahtarıyla) okuyup yazar. Yönetici sayfası sunucunun uç noktalarına konuşur; sunucu, girişi yapanın <code>app_users</code> listesinde olup olmadığına bakar. Bu kuralı değiştirme.</p>")
    h+="<h3>Kurulum (Aşama 1'de yapacağın)</h3>"+ol(["Yeni bir Supabase projesi oluştur (şirketin canlı projesini <b>kullanma</b>).","<code>01-schema.sql</code> dosyasını çalıştır.","<code>02-channels.csv</code>, <code>03-content-types.csv</code>, <code>04-type-channel-rules.csv</code> dosyalarını ilgili tablolara yükle. (Sütun sırası dosyalardaki gibi; 03 dosyası ayırıcı olarak <b>noktalı virgül</b> kullanır.)","<code>app_users</code> tablosuna sahibin ve danışmanın e-postasını ekle (sahibi sana verir).","Kontrol: <code>select count(*) from type_channel_rules</code> → 230."])
    return h
