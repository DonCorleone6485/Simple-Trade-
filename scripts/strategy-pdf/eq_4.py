from kk_lib import *
from eq_diagram import org, akis

def b10():
    h=sec(10,"Fikir havuzu ve içerik havuzu")
    h+="<p>İki ayrı \"havuz\" var. Karıştırma:</p>"+T(["","Fikir havuzu","İçerik havuzu"],[["Nedir?","Henüz yapılmamış <b>fikirlerin</b> listesi.","Onaylanmış, <b>yayına hazır içeriklerin</b> tek yeri."],["Kim ekler?","Herkes (en çok topluluk yöneticisi).","İçeriği üreten kişi (editör ya da video+görsel üreticisi), iki onaydan sonra."],["Kim kullanır?","Editör: pazartesi toplantısında seçer.","Topluluk yöneticisi: oradan alıp yayınlar."],["Biçimi","Google Sheets tablosu.","Paylaşımlı Drive klasörü + bir tablo."],["Aşama","0 ve 1","7 ve 8"]],cls="")
    h+="<h3>1. Fikir havuzu</h3><p>Tek bir tablo. Her fikir bir satır (fikir kartı, Bölüm 12). Sütunlar:</p>"+T(["Sütun","Ne yazılır"],[["No / Tarih","Sıra no ve eklenme tarihi."],["Başlık","Kısa ve net: \"R-multiple 30 saniyede\"."],["Kaynak","Topluluk sorusu · Google araması · destek e-postası · yeni özellik · firma kural değişikliği · geçen haftanın devamı · diğer."],["Kaynak bağlantısı","Fikrin geldiği yer (Reddit gönderisi, arama sorgusu...)."],["Tür (1-23)","İçerik Ekibi El Kitabı'ndaki türlerden biri."],["Kanallar","Nerede paylaşılacak (tablodan bak)."],["Neden şimdi","Bir cümle: neden bu hafta?"],["Danışman gerekir mi","Evet (rakam, kural, formül var) / Hayır."],["Ekleyen","Kim ekledi."],["Durum","yeni · seçildi · yapıldı · reddedildi (nedeniyle)."]])
    h+=ul(["Hedef: haftada <b>en az 5 yeni kart</b> (çoğu topluluk yöneticisinden).","Her pazartesi toplantıda <b>eski fikirler</b> gözden geçirilir: işe yaramayacak olanlar \"reddedildi\" olur.","Fikirler ham halde de eklenir, ama toplantıda seçilmeden önce kart tamamlanır."])
    h+="<h3>2. İçerik havuzu</h3><p>Onaylı içeriğin tek yeri. İki parçası var: <b>klasör</b> (dosyalar) ve <b>tablo</b> (kayıt). Şirketin Google Workspace hesabındaki Drive kullanılır. Videolar büyüktür; Drive alanı sınırlıdır, yönetici ayda bir kullanımı kontrol eder.</p>"
    h+="<h4>Klasör yapısı</h4>"+pre('''Havuz/
  2026-10/
    2026-10-08_r-multiple-30sn/            ← tarih_konu (küçük harf, kısa, tire)
      r-multiple-30sn_dikey.mp4            ← asıl dosya(lar)
      r-multiple-30sn_kapak.png            ← kapak / thumbnail
      metinler.docx                        ← her kanal için açıklama/metin
      brief.docx                           ← brief (senaryo dahil)
      onay-raporu.pdf                      ← danışman + yönetici işaretli rapor
    2026-10-09_basabas-win-rate-blog/
      ...''')
    h+="<h4>Havuz tablosu (Google Sheets)</h4>"+T(["Sütun","Ne yazılır"],[["Tarih","Havuza girdiği tarih."],["Klasör adı","Yukarıdaki ad (tam)."],["Başlık","İçeriğin adı."],["Tür (1-23)","Örnek: 3."],["Kanallar","Örnek: IG, YT, TT, X, TG, FB, LI, DC."],["Bağlantı","Sitede yayınlanmışsa adresi (blog, araç)."],["Üreten","Kim koydu."],["Danışman ✓ / Yönetici ✓","İki ayrı onay işareti ve tarih."],["Durum","taslak · danışmanda · yönetici onayında · <b>hazır</b> · yayında · bitti."],["Yayın kaydı","Kanal + saat + adres (yayınlanınca topluluk yöneticisi yazar)."]])
    h+=box("warn","Havuzun üç kuralı","<ol><li><b>Yalnızca iki onaylı içerik</b> \"hazır\" olabilir. Onaysız içerik \"taslak\" klasöründe kalır.</li><li>Topluluk yöneticisi <b>yalnızca \"hazır\"</b> içeriği yayınlar.</li><li>Onaydan sonra içerikte <b>değişiklik yapılırsa</b> durum \"danışmanda\"ya döner (onaylar sıfırlanır).</li></ol>")
    h+="<h3>Yayın sistemi kurulunca ne değişir?</h3><p>Ayrı bir belgede (<b>Dağıtım Sistemi Kurulum El Kitabı</b>) anlatılan <b>akıllı dağıtım sistemi</b> kurulunca, havuz yerine sistemin <b>\"Yeni içerik\" formu</b> geçer: çalışan dosyayı yükler, sistem içeriğin ne olduğunu anlar, hangi kanallara gideceğine karar verir, her kanala özel metin yazar, danışman ve yönetici onaylar ve sistem yayınlar. <b>Bu belgedeki aşamalar aynı kalır</b>; yalnızca Aşama 7 (havuza koy) ve Aşama 8 (yayın) sisteme geçer. Reddit gibi elle kalan kanallar için sistem \"görev kartı\" verir.</p>"
    return h

def b11():
    h=sec(11,"Rapor vermek: danışmana ve yöneticiye")
    h+="<p>Yönetici işin içinde değil; ekip <b>ona rapor verir</b>. Üç tür rapor var:</p>"+T(["Rapor","Kim yazar","Ne zaman","Kime","Uzunluk"],[["<b>Günlük not</b>","Her çalışan","Her gün sonu","Yöneticiye","3 satır"],["<b>Onay raporu</b>","İçeriği üreten","Her içerik için, Aşama 5'te","Danışmana, sonra yöneticiye","1 sayfa"],["<b>Haftalık rapor</b>","Herkes kendi bölümünü; editör birleştirir","Cuma","Yöneticiye","1-2 sayfa"]],cls="")
    h+="<h3>1. Günlük not (3 satır)</h3>"+pre("Bugün: R-multiple videosunu kurguladım, altyazı bitti.\nYarın: kapak yapacağım, danışmana göndereceğim.\nEngel: yok. (Varsa: ne, kim çözebilir?)")
    h+="<h3>2. Onay raporu (her içerik için)</h3><p>Danışmana ve yöneticiye <b>aynı rapor</b> gider; ikisi de kendi bölümünü işaretler. Üreten kişi üst bölümü doldurur.</p>"
    h+=pre('''ONAY RAPORU
İçerik:        R-multiple 30 saniyede
Tür:           3 (kısa ipucu videosu)         Üreten: Ayşe        Tarih: 2026-10-07
Kanallar:      Instagram, YouTube Shorts, TikTok, X, Telegram, Facebook, LinkedIn, Discord
Dosyalar:      Havuz/2026-10/2026-10-08_r-multiple-30sn/
Ana mesaj:     R-multiple, kazancı riske bölerek farklı işlemleri aynı ölçüyle karşılaştırır.

ÜRETEN: kendi kontrolü (hepsi ✓ olmadan gönderme)
 ☑ Kazanç vaadi, "garanti", "kesin" yok          ☑ Alım satım tavsiyesi / fiyat tahmini yok
 ☑ Rakamlar "örnek" diye işaretli                ☑ Gerçek kişi adı/yüzü/ekran görüntüsü yok
 ☑ Yazım hatası yok (sesli okudum)               ☑ Altyazı var ve doğru
 ☑ Marka renkleri/yazı tipi doğru                ☑ Bağlantılar çalışıyor
 ☑ Başka uygulamanın filigranı yok               ☑ İkinci göz: Mehmet (2026-10-07)

Bilgi gerektiren yerler (danışman bunlara bak):
 • "100 dolar risk, 200 dolar kazanç = +2R" örneği doğru mu?
 • "Örnektir, tavsiye değildir" notu altyazıda var.

Kaynaklar: R-multiple tanımı: <sitedeki yazı> / İçerik Ekibi El Kitabı sözlüğü

DANIŞMAN KONTROLÜ  (bilgi ve uyum)
 Karar:  ☑ Onay   ☐ Düzeltme iste   ☐ Reddet
 Notlar: (düzeltme varsa madde madde)
 İmza/tarih: ...........   (24 saat içinde)

YÖNETİCİ ONAYI  (yayın kararı)
 Karar:  ☑ Yayınla   ☐ Düzeltme iste   ☐ Reddet
 Zamanlama: Per 18:00
 İmza/tarih: ...........''')
    h+=box("info","Danışman ve yönetici aynı kişiyse","<p>İki bölümü <b>ayrı ayrı</b> doldur ve tarihlerini ayrı yaz. Danışman kısmını bilgi ve uyum gözüyle, yönetici kısmını marka ve karar gözüyle yap. Bilmediğin bir bilgi varsa (\"+2R doğru mu?\") <b>kaynağına bak</b>; emin değilsen onaylama.</p>")
    h+="<h3>3. Haftalık rapor</h3><p>Her çalışan kendi bölümünü doldurur. Editör bir belgede birleştirir. Cuma günü yönetici okur.</p>"
    h+=pre('''HAFTALIK RAPOR · Hafta: 2026-10-05 → 10-11

1) PLAN: ne planlandı, ne bitti?  (planlanan 9 içerik / yayınlanan 8)
2) YAYINLANANLAR (kanal bazında)
   Instagram: 2 karusel, 3 reels, story her gün
   X: 9 paylaşım, 1 thread, 1 anket        YouTube: 1 uzun video, 2 shorts  ...
3) EN İYİ 3 İÇERİK ve neden:  1) R-multiple videosu (çok kaydedildi) ...
4) EN KÖTÜ 1 İÇERİK ve neden:  TikTok'ta "aşırı işlem" videosu (ilk 3 saniye zayıf)
5) ÖĞRENDİKLERİM (kişi başı 1-2 madde)
6) KURAL İHLALİ / HATA: yok  (varsa ne oldu, ne yaptık)
7) DANIŞMAN: bu hafta kaç içerik kontrol edildi, ortalama cevap süresi
8) GELECEK HAFTA İÇİN FİKİRLER (3-5)
9) ENGELLER ve İHTİYAÇLAR (kimden ne lazım?)''')
    h+="<h3>Yönetici raporu nasıl okur? (5 soru)</h3>"+ol(["Planın yüzde kaçı bitti? (hedef: %90)","Kural ihlali ya da hata var mı? (hedef: sıfır; varsa nasıl yakalandı)","Danışman cevap süresi 24 saat içinde mi?","Neyi öğrendik? Aynı hatayı iki kez yapmıyor muyuz?","Kimin neye ihtiyacı var? (araç, bilgi, zaman, karar)"])
    h+=box("warn","Kırmızı bayraklar: yöneticiye hemen haber verilecekler","<ul><li>Yanlış ya da kural dışı bir içerik yayınlandı.</li><li>Hesap sorunu, ciddi şikayet, hukuki tehdit, basın ya da rakip saldırısı.</li><li>Birisi şifre ya da giriş istedi.</li><li>Bir içerik danışman onayı olmadan yayına gitmek üzere.</li></ul>")
    return h

def b12():
    h=sec(12,"Şablonlar")
    h+="<h3>Fikir kartı</h3>"+pre('''FİKİR KARTI
Başlık:            R-multiple 30 saniyede
Kaynak:            Reddit sorusu ("$50 trade ile $500 trade nasıl kıyaslanır?") + bağlantı
Kim istiyor:       Yeni başlayan trader
Tür (1-23):        3 (kısa ipucu videosu)
Kanallar:          Instagram, YouTube Shorts, TikTok, X, Telegram, Facebook, LinkedIn, Discord
Neden şimdi:       Haftalık yazı R-multiple, video destekler
Danışman gerekir:  Evet (R formülü)
Ekleyen / tarih:   Ali / 2026-10-04''')
    h+="<h3>Brief (bir sayfa)</h3>"+pre('''BRIEF
İçerik / tür:      R-multiple 30 saniyede / tür 3
Kim için:          Yeni trader; tek fikri hızlı öğrenmek istiyor
Ana mesaj (1 cümle): R, kazanç ya da kaybı riske bölerek bulunur; farklı büyüklükteki işlemleri kıyaslar.
Ton:               sade, doğrudan, vaat yok
Kanallar ve format: dikey 9:16, 30 sn, altyazılı; kanal başına ayrı açıklama
Bilgi kaynakları:  sitedeki "R-multiple nedir" yazısı; danışman teyidi gerekli
Yasaklar:          kâr vaadi, tavsiye; her rakam "örnek"
CTA:               Ücretsiz hesap makineleri (bağlantı biyografide)
Teslim günü:       Çarşamba     Kim yapıyor: Video üreticisi (video), Editör (metinler)''')
    h+="<h3>Video senaryosu</h3>"+pre('''SENARYO · R-multiple 30 saniyede (örnek senaryo)
0:00  [Ekran: "100$ risk, 200$ kazanç"]  SÖZ: "Bir işlemde 100 dolar riske ettin. 200 dolar kazandın. Bu kaç R?"
0:05  [Ekran: "= +2R"]                   SÖZ: "İki. Artı iki R."
0:08  SÖZ: "R, kazancını ya da kaybını riske bölerek bulursun."
0:15  SÖZ: "Kaybettiysen, 100 dolar kaybettin: eksi bir R."
0:22  SÖZ: "Böylece küçük işlemle büyük işlemi aynı ölçüyle kıyaslarsın."
0:28  [Ekran: ücretsiz hesap makinesi]   SÖZ: "Ücretsiz hesap makinesi bağlantıda."
Altyazı: evet · Not: "Örnektir, tavsiye değildir."''')
    h+="<h3>Blog taslağı iskeleti</h3>"+pre('''BAŞLIK: (soru biçiminde, anahtar kelimeli)
GİRİŞ: 3 cümle. Okuyucu ne öğrenecek?
ADIM ADIM: kısa başlıklarla anlatım
ÖRNEK HESAP: (örnek diye işaretli)
JOURNAL'DA NASIL GÖRÜRSÜN: ürünle bağ
SIK SORULAN 3 SORU
SON SATIR: ücretsiz hesap çağrısı
İLGİLİ BAĞLANTILAR: en az 2 (araç + başka yazı)
Uzunluk: 1000-1500 kelime''')
    h+="<h3>Haftalık plan tablosu</h3>"+T(["İçerik","Tür","Kanallar","Kim","Teslim günü","Durum"],[["R-multiple 30 sn","3","IG, YT, TT, X, TG, FB, LI, DC","Video üreticisi + editör","Çarşamba","senaryo hazır"],["Başabaş win rate (blog)","13","Web, X, LI, TG, Reddit (görev)","Editör","Salı","taslakta"],["Pozisyon büyüklüğü (karusel)","7","IG, LI, X, TG, FB, DC","Üretici + editör","Çarşamba","fikir seçildi"]])
    h+="<h3>Yayın kaydı (havuz tablosunda)</h3>"+pre("Kanal: Instagram · Saat: Per 18:00 · Adres: https://instagram.com/p/... · Yayınlayan: Selin · Durum: yayınlandı")
    return h

def b13():
    h=sec(13,"İşe alım: ilan, deneme görevi, ilk 30 gün")
    h+="<h3>Süreç (her rol için aynı)</h3>"+ol(["<b>İlan:</b> aşağıdaki kısa metinler.","<b>Deneme görevi:</b> adayın gerçek işini görmek için 2-3 saatlik, ücretli ya da ücretsiz (yönetici karar verir) küçük bir görev.","<b>Kısa görüşme:</b> 30 dakika (aşağıdaki sorular).","<b>Deneme dönemi:</b> ilk 30 gün; sonunda yönetici ile değerlendirme."])
    h+="<h3>İlan metinleri (kısa)</h3>"
    h+="<div class='ex'><b>İçerik Editörü (tam zamanlı)</b>\nSimple Trading Journal, trader'lara işlem günlüğü yazılımı yapan küçük bir ekip. Fikirden yayına kadar yazılı içeriğin (blog, thread, bülten, video senaryosu) sorumlusunu arıyoruz. Haftalık takvimi sen yönetirsin, yapay zekâ araçlarıyla çalışırsın. Aradığımız: İngilizce ve Türkçe temiz, sade yazım; trader dünyasına merak; düzenli çalışma. Yatırım tavsiyesi vermeyiz; kâr vaadi ve sinyal yasaktır.</div>"
    h+="<div class='ex'><b>Video + Görsel Üreticisi (tam zamanlı)</b>\nTrader'lara yardımcı kısa ve uzun videolar ile kartlar üretecek birini arıyoruz: dikey çekim, ekran kaydı, kurgu, altyazı, Canva'da marka kitine uygun kartlar. Marka sade (koyu zemin, altın vurgu); şablonlar hazır. Aradığımız: temiz kurgu, ses ve ışık hassasiyeti, kurallara uyum.</div>"
    h+="<div class='ex'><b>Topluluk Yöneticisi (yarı zamanlı)</b>\nTrader topluluklarında (Reddit, X, Discord) yardımcı olacak, içerikleri kanallarda yayınlayacak birini arıyoruz. Aradığımız: İngilizce yazı, sakin ve yardımsever üslup, kurallara uyum. Satış ısrarı yok; sinyal vermeyiz.</div>"
    h+="<h3>Deneme görevleri</h3>"+T(["Rol","Görev","Neye bakılır?"],[
    ["İçerik editörü","(1) R-multiple'ı <b>100 kelimeyle</b>, vaat vermeden, örnek rakamı \"örnek\" diye işaretleyerek anlat. (2) Aynı konudan 30 saniyelik video senaryosu ve 3 tweet yaz. (3) Verilen 6 cümleden <b>kural dışı olanları bul</b> (kâr vaadi, sinyal gibi).","Sadelik, kural duyarlılığı, İngilizce kalitesi, kural cümlelerini yakalama."],
    ["Video + görsel üreticisi","Verilen <b>demo ekran kaydından</b> 45 saniyelik dikey, altyazılı video yap ve marka kitine uygun 1 karusel (5 kart) hazırla.","Temiz kurgu, ses, altyazı, marka kitine uyum, teslim süresi."],
    ["Topluluk yöneticisi","5 örnek yoruma cevap yaz: (a) \"hangi pariteyi alayım?\" (sinyal isteyen), (b) kızgın bir yorum, (c) gerçek bir yardım sorusu, (d) \"hesabıma giremiyorum\", (e) rakipten bir iğne.","Sakinlik, hazır kalıba uyum, doğru yönlendirme (sinyal vermemek, support@'a yönlendirmek, tartışmamak)."]])
    h+="<h3>Görüşme soruları</h3>"+ol(["Bir konuyu bilmiyorsan işi nasıl yaparsın? (\"emin değilim\" diyebilmek istiyoruz.)","Birisi sana \"bu hafta hangi pariteyi alayım?\" diye yazsa ne cevap verirsin?","Yapay zekâyla yazdığın bir metindeki hatayı nasıl yakalarsın?","Bir içeriğin danışmandan düzeltmeyle dönmesine nasıl tepki verirsin?","Haftada kaç saat ayırabilirsin, hangi günler müsaitsin?","Bu işte seni en çok neyin zorlayacağını düşünüyorsun?"])
    h+="<h3>İlk gün paketi ve erişimler</h3>"+T(["Kim","Okuyacağı belgeler","Verilen erişim (yönetici açar)"],[["Herkes","İçerik Ekibi El Kitabı, bu belge, marka kiti.","Şirket e-postası, ekip sohbeti, Havuz klasörü + fikir ve havuz tabloları."],["Editör","+ yazı örnekleri (yayındaki blog yazıları).","Yapay zekâ asistanı hesabı; Search Console (okuma)."],["Video + görsel","+ marka kiti klasörü (logo, kapaklar, kart şablonları).","Canva ekip hesabı; kurgu programı; Drive."],["Topluluk","+ kanal rehberleri (Bölüm 7).","Sosyal hesaplara <b>yönetici verdiği kadarıyla</b> giriş. Şifre paylaşılmaz; mümkünse sayfa rolü (yönetici/editör) verilir."]])
    h+=box("warn","Şifre kuralı","<p>Hiçbir çalışan hesap şifresi istemez, saklamaz, kendi telefonuna kaydetmez. Giriş gerekirse yöneticiden izin ister; doğrulama kodunu yönetici verir. Mümkünse hesap şifresi yerine <b>kişiye özel rol</b> verilir; böylece kişi ayrıldığında yalnızca onun yetkisi kaldırılır.</p>")
    h+="<h3>İlk 30 gün sonu değerlendirme</h3>"+ul(["Haftalık planın kaçını bitirdi?","Kural ihlali oldu mu, nasıl ele aldı?","Düzeltme isteklerine tepkisi nasıl?","Raporlarını düzenli yazdı mı?","Devam, ek eğitim ya da yollarımızı ayırmak (yönetici kararı)."])
    return h

def b14():
    h=sec(14,"Takılırsan")
    Q=[("Danışman 24 saat geçti, cevap vermedi.","Hatırlat (ekip sohbeti). Yanıt yoksa yöneticiye yaz; içeriği \"danışmanda\" bırak. <b>Onaysız yayınlama.</b>"),
    ("Danışman düzeltme istedi ama katılmıyorum.","Tartışmadan, madde madde düzelt. Gerçekten yanlış olduğunu düşünüyorsan kaynağıyla yaz; son karar danışman ve yöneticide."),
    ("3. düzeltme turu geldi.","Kısa bir toplantı yap (10 dk). Muhtemelen brief belirsizdi."),
    ("Yönetici onayından sonra bir hata fark ettim.","Havuz durumunu \"danışmanda\"ya çevir, yöneticiye haber ver. Düzeltilip yeniden onaylanmadan yayınlanmaz."),
    ("Yanlış bir şey yayınladım.","Gönderiyi hemen sil ya da gizle, yöneticiye haber ver. Saklamak durumu kötüleştirir."),
    ("Biri yorumda 'hangi parite alayım?' diye sordu.","Nazikçe: 'Teşekkürler! Biz sinyal ya da tavsiye vermiyoruz; kendi işlemlerini kaydedip incelemene yardım ediyoruz.' Başka bir şey yazma."),
    ("Biri hakaret etti ya da kızgın yazdı.","Cevap verme. Gerekirse yorumu gizle, ekran görüntüsüyle yöneticiye bildir."),
    ("Biri 'hesabıma girilmiyor / işlemlerim gelmiyor' dedi.","Çözmeye çalışma. support@simpletradejournal.io ya da Discord support kanalına yönlendir; yöneticiye bildir."),
    ("Fikir bulamıyorum.","Fikir havuzuna bak; topluluk sorularına bak; yöneticiden Search Console aramalarını iste; geçen haftanın en iyi içeriğinin devamını yap."),
    ("İş yetişmiyor.","Pazartesi toplantıda planı küçült; kaliteyi düşürme. Hafta ortasında anlarsan yöneticiye hemen yaz."),
    ("Bilmediğim bir durumla karşılaştım.","Yapma, sor. Emin olmadığında yayınlamamak her zaman daha iyi."),
    ("Biri 'ekran görüntümü paylaşın' dedi.","İzni yazılı al (e-posta). Kişisel bilgiyi kapat. Danışman ve yönetici onayı olmadan paylaşma.")]
    h+=T(["Durum","Ne yap"],[[f"<b>{q}</b>",a] for q,a in Q])
    return h

def bEk():
    h=sec("Ek","Şemalar: ekip ağacı ve içerik yolculuğu")
    h+="<p>İki şema: önce <b>kimin kim olduğu</b> (ekip ağacı), sonra <b>bir içeriğin yolculuğu</b>. Çalışanlar bu iki sayfayı duvara asabilir.</p><h3>Şema 1: Ekip ağacı</h3><div style='width:94%;margin:4pt auto 0'>"+org()+"</div>"
    h+="<h2 class='sec' style='border-top:none;font-size:15pt'>Şema 2: Bir içeriğin yolculuğu (11 aşama)</h2><div style='width:80%;margin:2pt auto 0'>"+akis()+"</div>"
    return h
