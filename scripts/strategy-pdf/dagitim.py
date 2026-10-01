# Akıllı içerik dağıtım sistemi tasarım belgesi (Simple Trading Journal).
# Matris ve tür adları build.py'deki gerçek veriden okunur: tek kaynak.
import re, html
from kk_diagram import sema
esc=html.escape
src=open("build.py",encoding="utf-8").read()
MX={int(n):s.split() for n,s in re.findall(r'^(\d+):"([^"]+)",\s*$',src,re.M) if len(s.split())==10}
NAMES={int(n):t for n,t in re.findall(r'^\((\d+),"([^"]+)"',src,re.M)}
assert len(MX)==23 and len(NAMES)==23,(len(MX),len(NAMES))
PL=["Web sitesi","Instagram","X","YouTube","TikTok","Telegram","Facebook","LinkedIn","Reddit","Discord"]
MANUEL={"Reddit"}   # otomatik atılmaz
GOREV={21}   # yardım yorumları: yayın değil, insan yazar; ✓ = yorum yapılacak kanal
def karar(sym,pl,no=0):
    if no in GOREV and sym!="-": return ("y","GÖREV (insan yazar)")
    if pl in MANUEL and sym!="-": return ("g","GÖREV KARTI")
    return {"●":("g","GİDER (ana)"),"✓":("g","GİDER"),"↗":("y","DÖNÜŞTÜR"),"-":("r","GİTMEZ")}[sym]
def ornek(no,baslik,girdi):
    rows=""
    for pl,sym in zip(PL,MX[no]):
        c,t=karar(sym,pl,no)
        rows+=f"<tr><td>{pl}</td><td class='{c}'>{t}</td></tr>"
    return f"<div class='ex'><b>Gelen: {esc(baslik)}</b> <small>(tür {no}: {esc(NAMES[no])})</small><br><small>{esc(girdi)}</small><table class='mini'>{rows}</table></div>"
def matris():
    th="".join(f"<th class='c'>{p}</th>" for p in PL)
    out=f"<table class='mx'><tr><th>#</th><th>İçerik türü</th>{th}</tr>"
    for n in range(1,24):
        tds="".join(f"<td class='c {'a' if c=='●' else 'b' if c=='✓' else 'l' if c=='↗' else ''}'>{c if c!='-' else ''}</td>" for c in MX[n])
        out+=f"<tr><td>{n}</td><td>{esc(NAMES[n])}</td>{tds}</tr>"
    return out+"</table>"

H=f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
@page{{size:A4;margin:15mm 14mm}}
body{{font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;color:#222;font-size:10pt;line-height:1.42}}
h1{{font-size:22pt;margin:0 0 2pt;color:#111}} .sub{{color:#8a5a06;font-size:12.5pt;font-weight:600}}
.it{{color:#777;font-style:italic;border-bottom:2px solid #e8b53a;padding-bottom:6pt;margin:3pt 0 9pt}}
h2{{background:#14161c;color:#f2c14e;font-size:11.5pt;padding:4pt 8pt;margin:15pt 0 6pt;break-after:avoid}}
h3{{color:#8a5a06;font-size:10.8pt;margin:10pt 0 3pt;break-after:avoid}}
table{{border-collapse:collapse;width:100%;margin:5pt 0;font-size:8.8pt}} tr{{break-inside:avoid}}
th{{background:#14161c;color:#fff;text-align:left;padding:3.5pt 5pt}}
td{{border:1px solid #ddd;padding:3.5pt 5pt;vertical-align:top}} tr:nth-child(even) td{{background:#fafafa}}
.g{{background:#e3f4e8!important;color:#1a6b34;font-weight:700}} .y{{background:#fdf0dc!important;color:#8a5a00;font-weight:700}} .r{{background:#fbe3e0!important;color:#9b2c20;font-weight:700}}
.box{{border:1px solid #ddd;border-left:4px solid #e8b53a;background:#fffaf0;padding:6pt 9pt;margin:6pt 0;break-inside:avoid}}
.warn{{border-left-color:#c0392b;background:#fdecea}} .ok{{border-left-color:#1a6b34;background:#eaf6ee}}
.flow{{display:flex;gap:4pt;margin:8pt 0;break-inside:avoid}}
.st{{flex:1;border-radius:6pt;padding:5pt 4pt;text-align:center;font-size:8.3pt;border:1px solid #ddd;background:#f6f6f8}} .st b{{display:block;font-size:9pt;margin-bottom:2pt}}
.ar{{align-self:center;color:#888}}
table.mx{{font-size:7.6pt}} table.mx td.c{{text-align:center;width:6.2%}} .a{{color:#8a5a06;font-weight:700;background:#fdf0dc!important}} .b{{color:#1d6b34;background:#e3f4e8!important}} .l{{color:#3a45a0;background:#e6e8fa!important}}
.exs{{display:grid;grid-template-columns:1fr 1fr;gap:7pt}} .ex{{border:1px solid #ddd;padding:5pt 6pt;break-inside:avoid}} table.mini{{font-size:8pt;margin:3pt 0}} table.mini td{{padding:1.5pt 4pt}}
small{{color:#666}} ul{{margin:3pt 0 3pt 15pt;padding:0}} li{{margin:1.5pt 0}}
</style></head><body>
<h1>Akıllı İçerik Dağıtım Sistemi</h1>
<div class="sub">Simple Trading Journal · Ne atarsan at, sistem anlar, karar verir, eksiğini ister, yazar, onayla yayınlar</div>
<div class="it">Tasarım v7 · 1 Ekim 2026 · 23 içerik türü × 10 kanal · kaynak: İçerik Ekibi El Kitabı tablosu</div>

<div class="box"><b>Tek cümle:</b> İçeriği tek bir yere bırakırsın (dosya ya da yazı + kısa not). Sistem önce <b>ne olduğunu anlar</b> (yazı mı, dikey mi yatay mı video, kaç dakika, 23 türden hangisi), tabloya bakıp <b>hangi kanallara gideceğine karar verir</b>, gidecek her kanal için <b>eksikleri ister ya da üretir</b> (kapak, altyazı, görsel), <b>her kanala özel metni yazar</b>, hepsini tek ekranda gösterir; danışman ve senin onayından sonra <b>yayınlar</b>.</div>

<h2>1. Kim neye karar verir?</h2>
<table><tr><th style="width:27%">İş</th><th style="width:20%">Kim yapar</th><th>Neden</th></tr>
<tr><td>Hangi kanala gider / gitmez</td><td class="g">Kural motoru (kod)</td><td>Süre, yön, boyut, karakter sınırı kesin kuraldır. Kod her seferinde aynı sonucu verir, nedenini yazar ve testle doğrulanır. Yapay zekâ bazen yanlış karar verir.</td></tr>
<tr><td>İçeriğin hangi tür olduğu</td><td class="y">Kod + yapay zekâ</td><td>Biçim, yön, süre dosyadan okunur. "Bu bir hata analizi videosu" gibi anlamı Claude çıkarır. Emin değilse sorar, tahmin yürütmez.</td></tr>
<tr><td>Her kanal için metin</td><td class="y">Claude</td><td>Ton, uzunluk, hashtag, çağrı. Yazmak yapay zekânın işi.</td></tr>
<tr><td>Metin kurallara uyuyor mu</td><td class="g">Kod + ikinci kontrol</td><td>Karakter sınırı ve yasak kelime listesi kodla; riskli cümleleri ikinci bir Claude turu yakalar.</td></tr>
<tr><td>Doğruluk ve uyum</td><td class="r">Trader danışman</td><td>Rakam, formül, kural bilgisi. Kâr vaadi ya da sinyal var mı?</td></tr>
<tr><td>Yayın</td><td class="r">Sen (yönetici)</td><td>Onay olmadan hiçbir şey yayınlanmaz.</td></tr></table>
<p><b>Kural: karar kodla, yazı yapay zekâyla, yayın izinle.</b> Kanal kuralları (sınırlar, yön, süre) ve 23 türlü tablo veri olarak durur; bir kural değişince tek satır güncellenir, sistem yeniden yazılmaz.</p>

<h2>2. Akış</h2>
<div class="flow">
<div class="st"><b>1 · Bırak</b>Dosya / yazı + not</div><div class="ar">→</div>
<div class="st"><b>2 · Tanı</b>Biçim, yön, süre, tür</div><div class="ar">→</div>
<div class="st"><b>3 · Karar</b>Hangi kanallara gider</div><div class="ar">→</div>
<div class="st"><b>4 · Eksik</b>Kapak, altyazı, görsel</div><div class="ar">→</div>
<div class="st"><b>5 · Yaz</b>Kanala özel metin</div><div class="ar">→</div>
<div class="st"><b>6 · Onay</b>Danışman, sonra sen</div><div class="ar">→</div>
<div class="st"><b>7 · Yayın</b>Aralıklı + takip</div></div>

<h3>Adım 1 · Bırak</h3>
<ul><li><b>İçerik:</b> video, görsel(ler), PDF ya da yazı.</li><li><b>Kısa not:</b> "Bu ne anlatıyor?" (1-2 cümle).</li>
<li><b>İsteğe bağlı:</b> tür (23'ten biri), bağlantı, "şu kanala gitmesin", yayın zamanı. Boş bırakılırsa sistem kendi bulur. İçerik takvimde (<i>docs/content-calendar.md</i>) varsa o günün konusuyla eşleşir.</li></ul>
<p><small>Dosya büyük olabileceğinden (video) giriş, Telegram botu yerine kendi yükleme sayfamızdır (Telegram botu büyük dosya indiremez). Telegram yalnız bildirim ve onay içindir.</small></p>

<h3>Adım 2 · Tanı</h3>
<table><tr><th>Ne okunur</th><th>Nasıl</th><th>Neden önemli</th></tr>
<tr><td>Biçim: yazı / tek görsel / çok görsel / PDF / video</td><td>Dosya türü (kod)</td><td>Hangi kanalların kabul ettiğini belirler</td></tr>
<tr><td>Yön: dikey 9:16, kare, yatay 16:9</td><td>Çözünürlük (kod)</td><td>Reels, Shorts, TikTok dikey ister; YouTube uzun video yatay</td></tr>
<tr><td>Süre, boyut, ses var mı</td><td>Video bilgisi (kod)</td><td>Üst süre ve dosya boyutu kanaldan kanala farklı</td></tr>
<tr><td>Altyazı gömülü mü</td><td>Kare kontrolü + ses çözümü</td><td>Çoğu kişi sessiz izler; el kitabı altyazıyı şart koşuyor</td></tr>
<tr><td>Yazı uzunluğu, dil</td><td>Kod + Claude</td><td>280 karaktere sığar mı, thread mi, makale mi?</td></tr>
<tr><td>23 türden hangisi</td><td>Claude (içerik + not)</td><td>Karar tablosunun hangi satırının kullanılacağını belirler</td></tr></table>

<h3>Adım 3 · Karar: iki katman</h3>
<p><b>Katman A · Tür tablosu (editoryal).</b> El kitabındaki 23 tür × 10 kanal tablosu aynen kural olur. <b style="color:#8a5a06">●</b> ana kanal (içerik burada özel üretilir) ve <b style="color:#1d6b34">✓</b> doğrudan paylaşılır → <b>GİDER</b>. <b style="color:#3a45a0">↗</b> kesit ya da bağlantıyla duyurulur → <b>DÖNÜŞTÜR</b>. Boş → <b>GİTMEZ</b>.</p>
{matris()}
<p><small>● ana kanal · ✓ doğrudan · ↗ kesit/bağlantı · boş: yok. Bu tablo <i>scripts/strategy-pdf/build.py</i> ile aynı kaynaktan okunur; ikisi ayrılamaz.</small></p>

<p><b>Katman B · Teknik kurallar.</b> Aynı tür bile içerik biçimine göre farklı sonuç verir. Örneğin tür 1 (uzun eğitim videosu) Instagram'da ↗: yatay video doğrudan gitmez, sistem dikey kesit çıkarır. Sınırlar tek bir tabloda durur (değerler <i>başlangıç değeridir</i>; kurulumda her platformun güncel sayfasından doğrulanır):</p>
<table><tr><th>Kanal</th><th>Kabul eder</th><th>Yön / süre</th><th>Metin</th><th>Link</th><th>İstediği kapak</th></tr>
<tr><td>Web sitesi</td><td>Yazı, görsel, gömülü video</td><td>–</td><td>Sınırsız</td><td>–</td><td>Blog kapağı</td></tr>
<tr><td>Instagram</td><td>Reels, karusel, görsel, story</td><td>Dikey 9:16 · Reels ~3 dk · story ~60 sn</td><td>~2200 kr., 5-8 hashtag</td><td>Metinde tıklanmaz</td><td>Dikey kapak (Reels), ilk kart (karusel)</td></tr>
<tr><td>X</td><td>Yazı, görsel, video</td><td>Her yön · video ~2:20</td><td>280 kr. / thread</td><td>Tıklanır</td><td>Yok</td></tr>
<tr><td>YouTube</td><td>Uzun video, Shorts</td><td>Yatay 16:9 · Shorts dikey ≤ ~3 dk</td><td>Başlık ~100 · açıklama 5000</td><td>Açıklamada</td><td><b>1280×720 thumbnail</b> (uzun video)</td></tr>
<tr><td>TikTok</td><td>Video, foto karusel</td><td>Dikey 9:16</td><td>Kısa, 3-5 hashtag</td><td>Metinde yok</td><td>Kare seçilir</td></tr>
<tr><td>Telegram</td><td>Her biçim</td><td>Her yön · bot ~50 MB</td><td>Zengin metin</td><td>Tıklanır</td><td>Yok</td></tr>
<tr><td>Facebook</td><td>Video, görsel, yazı</td><td>Her yön</td><td>Uzun olabilir</td><td>Tıklanır</td><td>İsteğe bağlı</td></tr>
<tr><td>LinkedIn</td><td>Yazı, görsel, PDF karusel, video</td><td>Her yön</td><td>~3000 kr.</td><td>Tıklanır</td><td>PDF karusel için kapak kartı</td></tr>
<tr><td>Reddit</td><td>Yazı odaklı</td><td>–</td><td>Uzun, yardımcı</td><td>Dikkatli</td><td>Otomatik atılmaz → görev kartı</td></tr>
<tr><td>Discord</td><td>Yazı, bağlantı, görsel</td><td>Dosya sınırı küçük (~10 MB); video bağlantıyla</td><td>~2000 kr.</td><td>Tıklanır</td><td>Yok</td></tr></table>

<p><b>Üç sonuç:</b> <span class="g" style="padding:1pt 4pt">GİDER</span> olduğu gibi uygun · <span class="y" style="padding:1pt 4pt">DÖNÜŞTÜR</span> küçük bir işlemle uygun (yatay→dikey kırp, uzun videodan kesit, uzun yazıdan thread ya da görsel kart) · <span class="r" style="padding:1pt 4pt">GİTMEZ</span> nedeniyle yazılı. Üç tür dağıtılmayan içerik de var: <b>kapak/thumbnail</b> (tür 11, başka içeriklerin varlığı), <b>canlı yayın</b> (tür 6, önce duyuru, sonra kayıt kesitleri) ve <b>yardım yorumları</b> (tür 21, insan yazar; sistem yalnız fırsat bulup hatırlatır). Bunlar "yayın" değil <b>görev</b> olarak işlenir.</p>

<h3>Adım 4 · Eksik varlıklar: ister ya da üretir</h3>
<p>Karar çıkınca sistem gidecek her kanal için <b>eksik listesi</b> çıkarır ve tek mesajla bildirir. Her eksik için iki yol: <b>"Ben yükleyeyim"</b> ya da <b>"Sistem üretsin"</b>.</p>
<table><tr><th>Eksik</th><th>Kim ister</th><th>Sistem üretirse</th></tr>
<tr><td>Dikey kapak (9:16)</td><td>Reels, TikTok, Shorts</td><td>Videodan en net kare + marka şablonu (koyu zemin, altın vurgu, Newsreader başlık). Mevcut kart üretici <i>scripts/brand/post.sh</i> kullanılır.</td></tr>
<tr><td>YouTube thumbnail (1280×720)</td><td>YouTube uzun video</td><td>Aynı şablon, yatay</td></tr>
<tr><td>Altyazı</td><td>Tüm videolar</td><td>Konuşma yazıya çevrilir (Groq'un Whisper'ı; zaten Groq hesabımız var), sana kontrol için gösterilir</td></tr>
<tr><td>Dikey sürüm</td><td>Yatay videoyu Reels/TikTok'a taşımak</td><td>ffmpeg ile yeniden kadraj; sonucu görüp onaylarsın</td></tr>
<tr><td>Kısa kesit(ler)</td><td>Uzun videodan Reels/Shorts/X</td><td>Yapay zekâ 2-3 an önerir; sen seçersin</td></tr>
<tr><td>Görsel kart</td><td>Yazıyı Instagram/X'e görsel olarak taşımak</td><td>Kural kartı şablonu (tür 8)</td></tr>
<tr><td>PDF karusel</td><td>LinkedIn (karuselden)</td><td>Karusel kartları tek PDF'e birleştirilir</td></tr></table>
<div class="box ok"><b>Sorma disiplini:</b> sistem eksik varsa <b>durup sorar</b>, uydurmaz. Altyazı ve kırpma gibi otomatik üretilenler de onay ekranında görünür. Emin olmadığı bir karar (tür, bir kanalın uygunluğu) "bekliyor" kalır; kalan kanalların hazırlığı sürer.</div>

<h3>Adım 5 · Kanala özel metin</h3>
<p>Claude her kanal için ayrı çağrılır. Komutta: içeriğin özeti, kanalın profili (ton, uzunluk, hashtag, link kuralı, dil), <b>marka kuralları</b> ve türe özel yönerge. Çıktı sabit düzende gelir (başlık, metin, hashtag, çağrı). Kanalın dili hesap başına tabloda tanımlıdır (Discord'da Türkçe ve Farsça kanallar var); yeni dil eklemek tabloya satır eklemektir.</p>
<table><tr><th>Kanal</th><th>Ton ve biçim</th></tr>
<tr><td>Instagram</td><td>Kısa, ilk satır dikkat çeker, 5-8 hashtag; "bağlantı biyografide" çağrısı</td></tr>
<tr><td>TikTok</td><td>Çok kısa, enerjik; link yok</td></tr>
<tr><td>YouTube</td><td>Anahtar kelimeli başlık; açıklamada site bağlantısı ve bölüm zamanları</td></tr>
<tr><td>X</td><td>Tek net cümle ya da thread; 280 sınırı kodla sayılır, aşarsa yeniden yazdırılır</td></tr>
<tr><td>LinkedIn</td><td>Profesyonel, 3-4 kısa paragraf, sonda soru</td></tr>
<tr><td>Facebook · Telegram</td><td>Daha anlatımlı; bağlantı doğrudan; Telegram'da zengin metin</td></tr>
<tr><td>Reddit</td><td>Yardım odaklı uzun yazı; reklam dili yok (görev kartı)</td></tr>
<tr><td>Discord</td><td>Duyuru tonu, kısa, bağlantılı</td></tr></table>
<div class="box warn"><b>Marka kuralları (kod ve ikinci kontrolle zorlanır):</b> kâr vaadi, "garanti", "kesin", "kolay para", "zengin ol" yok · sinyal, fiyat tahmini, "şunu al sat" yok · her rakam <b>örnek hesap</b> diye işaretli (<i>"Örnektir, tavsiye değildir."</i>) · gerçek kullanıcı verisi, adı, yüzü, ekran görüntüsü yok (yazılı izin yoksa) · rakipleri kötüleme yok, bilgi güncel · her şey demo veriyle. Bir kural çiğnenirse metin yeniden yazdırılır; üç denemede olmazsa insana işaretlenir.</div>

<h3>Adım 6 · Onay: tek ekran</h3>
<table><tr><th>Kanal</th><th>Karar</th><th>Metin</th><th>Kapak</th><th>Zaman</th><th>Karar notu</th></tr>
<tr><td>Instagram (Reels)</td><td class="g">GİDER (ana)</td><td>önizleme</td><td>üretildi</td><td>Sal 18:00</td><td>Tür 3: ana kanal</td></tr>
<tr><td>YouTube</td><td class="y">DÖNÜŞTÜR</td><td>önizleme</td><td>yükleme bekliyor</td><td>Sal 18:20</td><td>Shorts olarak (dikey, kısa)</td></tr>
<tr><td>Reddit</td><td class="g">GÖREV KARTI</td><td>hazır metin</td><td>–</td><td>elle</td><td>Yardım odaklı; sen yapıştırırsın</td></tr>
<tr><td>Web sitesi</td><td class="r">GİTMEZ</td><td>–</td><td>–</td><td>–</td><td>Tablo: tür 3 siteye gitmez</td></tr></table>
<ul><li><b>İki kapı:</b> önce trader danışman (bilgi ve uyum), sonra yönetici. İkisi de onaylamadan yayın kuyruğuna girmez.</li>
<li>Platform platform onay, "tümünü onayla", "düzelt" (yazarsın, metin yeniden yazılır) ya da "çıkar".</li>
<li>Onay bildirimi Telegram'dan, ekran kendi yönetici sayfamızda gelir.</li></ul>

<h3>Adım 7 · Yayın ve takip</h3>
<ul><li>Kanallar arasında 10-30 dakika aralık; aynı anda hepsine atmak spam gibi görünür. Orijinal dosya yüklenir (filigranlı indirilmiş kopya değil).</li>
<li>Her kanal ayrı durum tutar: bekliyor · yükleniyor · yayında · hata. Hata olursa yalnız o kanal tekrar denenir; her yayına benzersiz kayıt anahtarı verilir, böylece aynı gönderi iki kez gitmez.</li>
<li>Reddit ve diğer elle kanallar için görev kartı: hazır metin ve dosya + kopyala düğmesi.</li>
<li>Yayın bağlantısı kaydedilir. Haftalık rapor: hangi tür hangi kanalda iş yaptı. Bu rapor büyüme/veri analizi ajanına girdi olur; kural tablosu bu verilerle <b>önerilerle</b> (insan onayıyla) güncellenir.</li></ul>

<h2>3. Sekiz örnek: sistem ne karar verir?</h2>
<p><small>Aşağıdaki sonuçlar kural tablosundan otomatik üretildi (belgeyle sistem aynı kaynaktan okur). Teknik katman ek kararlar ekler.</small></p>
<div class="exs">
{ornek(3,"45 saniyelik dikey video","R-multiple 30 saniyede. 9:16, altyazılı.")}
{ornek(1,"12 dakikalık yatay video","Trading journal nasıl tutulur? Teknik katman: Instagram/TikTok için dikey kesit gerekir, sistem 2-3 kesit önerir; YouTube için thumbnail ister.")}
{ornek(13,"800 kelimelik blog yazısı","R-multiple nedir? Teknik katman: LinkedIn'e özet + bağlantı, X'e thread, Telegram/Facebook/Discord'a bağlantılı duyuru.")}
{ornek(7,"6 kartlık görsel set","Pozisyon büyüklüğü 5 adımda. Teknik katman: LinkedIn için kartlar tek PDF karusele çevrilir.")}
{ornek(16,"Tek cümlelik ipucu","Günlük kayıp limitin dolunca günün işlemi biter. Teknik katman: Instagram/YouTube/TikTok'a gitmez; istenirse kural kartına (tür 8) dönüştürülür.")}
{ornek(8,"Tek görsel kural kartı","Kayıptan sonra ilk işlemi yazmadan açma.")}
{ornek(19,"Yeni hesap makinesi","Beklenti hesaplayıcı yayında. Teknik katman: site sayfası zaten yayında; sosyal kanallara tanıtım içeriği (ekran görüntüsü + kısa video).")}
{ornek(21,"Reddit'te soru gördün","Pozisyon büyüklüğünü nasıl hesaplarım? Teknik katman: sistem yayın yapmaz, fırsatı görev olarak listeler, cevabı insan yazar.")}
</div>

<h2>4. Nasıl kurulur? (bizim mevcut yığınımızla)</h2>
<table><tr><th style="width:27%">Parça</th><th>Çözüm</th><th style="width:14%">Aylık (tahmini)</th></tr>
<tr><td>Tablolar: içerikler, kanal kuralları, 23 tür tablosu, kanal çıktıları, marka kuralları, günlük</td><td>Supabase (var). Yeni tablolar RLS açık, <i>contact_messages</i> gibi politikasız (yalnız sunucu yazar)</td><td>0 $</td></tr>
<tr><td><b>Beyin:</b> tanı + kural motoru</td><td>Repo'da TypeScript, <b>testli</b> (npm test). 23 türün her biri için test: doğru kanallar çıkıyor mu?</td><td>0 $</td></tr>
<tr><td>Giriş ve onay ekranı</td><td>Yönetici sayfası (Clerk ile girişli, yalnız sen). Bildirim: Telegram botu</td><td>0 $</td></tr>
<tr><td>Metin yazımı ve kontrol</td><td>Claude API (Groq da hızlı ve ucuz sınıflama için seçenek)</td><td>~5-25 $</td></tr>
<tr><td>Video işleme (kırpma, kesit)</td><td>ffmpeg; Vercel'de çalışmaz, bu Mac'te ya da bir GitHub Actions işinde (kurulumda doğrulanır)</td><td>0 $</td></tr>
<tr><td>Altyazı</td><td>Groq Whisper (güncel fiyat doğrulanacak)</td><td>~0-5 $</td></tr>
<tr><td>Kapak / kart</td><td>Mevcut <i>scripts/brand/post.sh</i> ve marka kiti</td><td>0 $</td></tr>
<tr><td>Kanallara yayın</td><td>İlk aşamada hazır planlayıcı (Metricool, Publer, Buffer ya da Ayrshare): API onaylarını bekleme. Telegram ve Discord kendi botu/webhook ile doğrudan. Sonra istersen doğrudan API'ye geçilir</td><td>15-50 $</td></tr>
<tr><td><b>Toplam</b></td><td></td><td><b>~20-80 $</b></td></tr></table>
<small>Fiyatlar tahmini; kurulumdan önce güncel sayfalardan teyit edilir. Planlayıcıya hesapları <b>sen</b> bağlarsın (yetki izni sende); ben şifre ya da giriş yapmam.</small>

<h2>5. Kurulum sırası</h2>
<table><tr><th style="width:8%">Aşama</th><th>Ne yapılır</th><th style="width:15%">Süre</th></tr>
<tr><td>1</td><td>Kanal ve 23 tür tabloları + kural motoru + testler. Çıktı: bir içerik tarif edince hangi kanallara gittiğini yazar.</td><td>2-3 gün</td></tr>
<tr><td>2</td><td>Giriş sayfası + tanı (biçim, yön, süre, tür tahmini)</td><td>2-3 gün</td></tr>
<tr><td>3</td><td>Metin yazımı, otomatik kontrol, onay ekranı (danışman + yönetici). Yayın hâlâ planlayıcıya elle girilir.</td><td>3-4 gün</td></tr>
<tr><td>4</td><td>Eksik varlık akışı: kapak, altyazı, dikey sürüm, kesit önerisi</td><td>3-5 gün</td></tr>
<tr><td>5</td><td>Planlayıcı / Telegram / Discord'a otomatik gönderim, hata ve tekrar deneme, durum takibi</td><td>2-3 gün</td></tr>
<tr><td>6</td><td>Reddit görev kartları, haftalık rapor, kural tablosunu veriyle düzeltme</td><td>Sürekli</td></tr></table>

<h2>6. Riskler</h2>
<table><tr><th style="width:27%">Risk</th><th>Önlem</th></tr>
<tr><td>Yanlış kanala karar</td><td>Karar kodla, nedeni yazılı, onay ekranında; emin değilse sorar; her tür testli.</td></tr>
<tr><td>Yapay zekâ riskli ya da yanlış cümle yazar</td><td>Marka kuralları + ikinci kontrol + danışman + yönetici onayı. Kâr vaadi ve sinyal metne hiç girmez.</td></tr>
<tr><td>Platform kuralı ya da API değişir</td><td>Kurallar tabloda; hata verince bildirim; üç ayda bir tablo gözden geçirilir.</td></tr>
<tr><td>API onay süreleri</td><td>İlk aşamada hazır planlayıcı; onaylar paralel yürütülür.</td></tr>
<tr><td>Aynı içeriği aynı anda her yere atmak</td><td>Aralıklı yayın, kanala özel metin, Reddit'e otomatik atılmaz.</td></tr>
<tr><td>Hesap güvenliği</td><td>Hesaplar 2 adımlı doğrulamalı. Bağlantı yetkileri ve anahtarlar şifre yöneticisinde ve Vercel env'de; repoya asla.</td></tr>
<tr><td>Araç kapanır ya da fiyatı artar</td><td>İçerik, kurallar, metinler kendi tablolarımızda durur; planlayıcı değişse veri kaybolmaz.</td></tr></table>

<h2 style="page-break-before:always">7. Sistem şeması: tek bakışta</h2>
<p>Yukarıdan aşağı okunur. Rozetler kimin karar verdiğini gösterir: KOD kesin kural, YZ yapay zekâ, İNSAN insan.</p>
{sema()}
</body></html>"""
open("dagitim.html","w",encoding="utf-8").write(H)
print("ok",len(H))
