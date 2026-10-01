from kk_lib import *

def b6():
    h=sec(6,"Ekip: kimleri işe alacağız?")
    h+="<h3>İşin büyüklüğü</h3><p>Her hafta üretilmesi gereken içerik ve yaklaşık süreleri (tahmindir; yapay zekâ yardımıyla bu süreler kısalabilir):</p>"
    h+=T(["İş","Haftalık miktar","Yaklaşık saat"],[["Uzun eğitim videosu (çekim, kurgu, altyazı)","1","8-10"],["Kısa videolar (çoğu uzun videodan kesit)","3","4-6"],["Karusel, kural kartı, infografik, kapak","2 karusel, 3-5 kart, 1 infografik","6-8"],["Blog yazısı (1000-1500 kelime)","1","4-6"],["Kısa metin, thread, bülten, Discord duyuruları","günlük + 1 thread + 1 bülten","4-5"],["Fikir toplama, brief, senaryo, takvim","—","4-5"],["Topluluk: yorum, Reddit yardımı, Discord support, story","günlük","8-10"],["Trader danışman kontrolü","10-15 içerik","3-4"],["<b>Toplam</b>","","<b>~40-50 saat/hafta</b>"]])
    h+="<p>Bu, yaklaşık <b>iki tam zamanlı kişilik</b> iş. Ama işin farklı becerileri var (yazı, video, topluluk), bu yüzden üç kişi öneriyoruz.</p>"
    h+="<h3>Önerilen ekip</h3>"+T(["Rol","Süre","Haftalık saat","Ana iş","Kime rapor verir"],[
    ["<b>1. İçerik editörü</b>","Tam zamanlı","~40","Fikir seçer, brief ve senaryo yazar, bütün yazıları yazar, takvimi ve havuzu tutar.","Yönetici"],
    ["<b>2. Video + görsel üreticisi</b>","Tam zamanlı","~40","Çekim, kurgu, altyazı, karusel, kural kartı, infografik, kapak.","Yönetici"],
    ["<b>3. Topluluk yöneticisi</b>","Yarı zamanlı","~20","Yayın, yorumlar, Reddit, Discord, story, görev kartları, fikir kartları.","Yönetici"],
    ["<b>Trader danışman</b>","Gerektiğinde (haftada 3-4 saat)","3-4","İçeriklerin bilgi ve uyum kontrolü (onay raporu).","Yönetici"],
    ["<b>Yönetici (sen)</b>","—","~3-4","Son onay, işe alım, bütçe, hesap erişimi, haftalık rapor okuma.","—"],
    ["<b>Geliştirici</b> (var)","Ayrı","—","Siteye yazı ve araç ekler, haftalık yenilik notu verir.","Yönetici"]])
    h+="<h3>Neden fikir, senaryo ve yazı tek kişide?</h3>"+ul(["<b>Fikir ile senaryo birbirine bağlıdır.</b> Ayrı kişilerde olursa her iş iki el değiştirir; gecikme ve yanlış anlama çıkar.","<b>Fikir bir kişinin kafasından gelmez, veriden gelir:</b> topluluğun soruları, Google aramaları, destek e-postaları. Bu yüzden \"fikir kişisi\" yerine <b>haftalık fikir toplantısı</b> var; herkes fikir getirir, editör seçer.","<b>Video + görsel tek kişide:</b> markamız çok sade (koyu zemin, altın vurgu) ve şablonlar hazır. Bir kişi hem kurgu hem Canva kartı yapabilir.","İş büyüdüğünde (içerik iki katına çıkınca) editör ayrılır: ayrı yazar, ayrı senaryocu; üretici ayrılır: ayrı grafik tasarımcı."])
    h+="<h3>İşe alım sırası</h3>"+T(["Sıra","Kim","Neden bu sırada"],[["1","İçerik editörü","Plan, brief ve senaryo olmadan üretim başlamaz. Editör ilk haftalarda yönetici ve yapay zekâyla birlikte takvimi kurar."],["2","Video + görsel üreticisi","Brief ve senaryo hazır olunca üretim başlar."],["3","Topluluk yöneticisi","İçerik yayında olduktan sonra topluluk gelir. İlk haftalar yönetici ya da editör yayını yapar."]])
    h+=box("info","Danışman meselesi","<p>Yönetici \"gerektiğinde ben danışman olurum\" diyor; bu işleyebilir, <b>iki kuralla</b>: (1) Danışman kontrolü ve yayın onayı <b>iki ayrı iş</b> olarak yapılır ve raporda iki ayrı işaretle kayıt edilir. (2) <b>Bilmediğin teknik konuyu onaylama:</b> emin değilsen \"emin değilim\" yaz, resmi kaynağa (örneğin firmanın kural sayfasına) bak ya da içeriği yayınlama. İçerik arttıkça ya da konu zorlaşınca haftada birkaç saatlik dış bir trader danışman alınabilir.</p>")
    h+=box("warn","Maaş, çalışma yeri ve sözleşme","<p>Bu belgede maaş, çalışma biçimi (uzaktan/ofis) ve sözleşme yok: bunlar yöneticinin kararı. Süreler (tam/yarı zamanlı) ve saatler yukarıdaki iş yükü tahminine dayanır; gerçekte kişiye göre değişir.</p>")
    return h

def role(title,kisa,sure,rapor,hours,out,bil,arac,gun,otuz,nolist):
    h=f"<div class='card'><h3>{title}</h3><p>{kisa}</p>"
    h+="<table><tr><td class='k' style='width:70pt'>Süre</td><td>"+sure+"</td></tr><tr><td class='k'>Rapor verir</td><td>"+rapor+"</td></tr></table>"
    h+="<h4>Haftalık işler ve süreleri</h4>"+T(["İş","Saat"],hours)
    h+="<h4>Haftalık çıktı (hedef)</h4>"+ul(out)
    h+="<h4>Bilmesi gerekenler</h4>"+ul(bil)
    h+="<h4>Kullandığı araçlar</h4><p>"+arac+"</p>"
    h+="<h4>Günlük düzen</h4>"+ul(gun)
    h+="<h4>İlk 30 gün</h4>"+ul(otuz)
    h+="<h4>Yapmaması gerekenler</h4>"+ul(nolist)
    h+="</div>"
    return h

def b7():
    h=sec(7,"Rol kartları: her kişi ne yapar?")
    h+="<p>Her kartta: ne yapar, haftalık işleri, haftalık hedef, ne bilmesi gerekir, hangi araçları kullanır, günlük düzeni, ilk 30 günü ve yapmaması gerekenler. Çalışanlar <b>kendi kartını</b> ve komşu kartları (kimden iş alıp kime verdikleri) okusun.</p>"
    h+=role("1 · İçerik editörü","<b>Ne üretileceğine karar verir ve bütün yazılı işi yapar.</b> Fikir seçer, brief ve senaryo yazar, blog/thread/bülten/açıklamaları yazar, takvimi ve havuzu tutar, haftalık raporu birleştirir.","Tam zamanlı (~40 saat/hafta)","Yönetici",
     [["Pazartesi fikir toplantısını yönetmek","1"],["Brief ve senaryo (1 uzun video, 3 kısa video, 2 karusel)","8"],["Blog yazısı","6"],["Thread, kısa metinler, bülten, açıklama metinleri","6"],["Takvim, havuz tablosu, yayın kayıtları","3"],["Danışman ve yöneticiyle koordinasyon, düzeltme turları","4"],["Yapay zekâyla taslak çıkarma, düzeltme, ikinci göz","6"],["Haftalık raporu birleştirme","2"],["Fikir kartlarını derleme","4"]],
     ["1 blog yazısı (1000-1500 kelime)","1 thread, haftada 5-7 kısa metin, 1 bülten","1 uzun + 3 kısa video senaryosu, 2 karusel metni","Her içerik için brief","Güncel takvim ve havuz tablosu"],
     ["İngilizce ve Türkçe temiz, kısa, sade yazmak (sosyal hesaplar İngilizce).","Trader'ın dünyasını (risk, psikoloji, işlem günlüğü) öğrenmeye istekli olmak; ilk ay terimleri öğrenir.","Yapay zekâ yazı araçlarıyla çalışmak ve çıktısını <b>düzeltmek</b> (yapay zekâ taslak yazar, son metin editörün sorumluluğu).","Basit tablo kullanmak.","Kural duyarlılığı: vaat, sinyal ve tavsiye cümlelerini fark etmek.","Artı: trader deneyimi, SEO bilgisi."],
     "Google Docs/Word, Google Sheets (fikir ve havuz tabloları), yapay zekâ asistanı, Canva (okuma), Search Console (okuma).",
     ["Sabah: havuz ve takvim tablosuna bak; danışmandan bekleyen var mı?","Gün içi: yazı ve senaryo işi (derin çalışma, 3-4 saat kesintisiz).","Gün sonu: 3 satırlık günlük not (dün/bugün/engel)."],
     ["Hafta 1: İçerik Ekibi El Kitabı'nı, marka kitini ve bu belgeyi oku; 2 deneme yazısı yaz, yönetici düzeltsin.","Hafta 2: ilk gerçek blog yazısı + 5 kısa metin; ilk fikir toplantısını yönetici ile birlikte yönet.","Hafta 3: tam haftalık ritim; brief + senaryolar kendi başına.","Hafta 4: haftalık rapor yazılıyor; danışman ilk turda %70'e yakın onay veriyor."],
     ["Kuralı ezberden yazmamak (resmi sayfaya bak).","Yapay zekâ çıktısını okumadan göndermemek.","Danışmandan onay almadan hiçbir şeyi havuza koymamak.","Rakibi kötülememek."])
    h+=role("2 · Video + görsel üreticisi","<b>Bütün videoları ve görselleri üretir.</b> Çekim, kurgu, altyazı, karusel, kural kartı, infografik, kapak ve thumbnail. Hepsi marka kitine uygun.","Tam zamanlı (~40 saat/hafta)","Yönetici",
     [["1 uzun eğitim videosu (çekim, kurgu, altyazı)","9"],["3 kısa video (uzun videodan kesit + 1-2 yeni çekim)","5"],["2 karusel","4"],["3-5 kural kartı + 1 infografik","3"],["Kapak ve thumbnail (her video ve yazı için)","3"],["Ürün güncelleme görseli (gerektiğinde)","1"],["Düzeltme turları (danışman istekleri)","4"],["Havuza düzgün yükleme, dosya adları, kayıt","2"],["Ekran kaydı ve demo veri hazırlığı","4"],["İkinci göz (editörün yazılarına)","1"],["Haftalık rapor bölümü","1"]],
     ["1 uzun video (8-15 dk, altyazılı)","3 kısa video (15-60 sn, dikey, altyazılı)","2 karusel (5-7 kart) ve 3-5 kural kartı","1 infografik","Her video ve yazı için kapak"],
     ["Telefonla dikey video çekmek; ışık ve ses temelleri.","Ekran kaydı almak ve temiz kurgulamak (kesme, altyazı, ses).","Canva'da şablonla kart yapmak; marka kitine <b>birebir</b> uymak (koyu zemin, altın vurgu, Newsreader/Inter).","Altyazı yazmak ve kontrol etmek.","Dikey (9:16) ve yatay (16:9) mantığı.","Artı: kısa video dilini bilmek (ama bizde ton sade)."],
     "Telefon + mikrofon, ekran kaydı (Mac: Cmd+Shift+5), CapCut ya da benzeri kurgu programı, Canva (marka kiti), Google Drive (havuz).",
     ["Sabah: haftalık plana ve brief'lere bak.","Salı-çarşamba çekim ve kurgu günleri; perşembe düzeltme ve havuz.","Gün sonu: 3 satırlık günlük not."],
     ["Hafta 1: belgeleri oku, marka kitini incele; 1 deneme kısa video + 1 karusel yap.","Hafta 2: ilk gerçek kısa video ve kartlar.","Hafta 3: ilk uzun video.","Hafta 4: tam ritim; havuza eksiksiz klasör koyuyor."],
     ["Marka renk ve yazı tipini değiştirmemek.","Altyazısız video yayına göndermemek.","Gerçek kullanıcı ekran görüntüsü kullanmamak (demo veri).","Başka uygulamanın filigranlı videosunu yüklememek."])
    h+=role("3 · Topluluk yöneticisi","<b>İçeriği yayınlar ve toplulukla konuşur.</b> Yayın, yorumlar, Reddit, Discord, story, görev kartları. Aynı zamanda <b>fikirlerin ana kaynağı</b>: toplulukta duyduğunu fikir kartına çevirir.","Yarı zamanlı (~20 saat/hafta)","Yönetici",
     [["Havuzdan alıp kanallara yayınlama, yayın kayıtları","5"],["Instagram story (günde 3-5)","4"],["Yorum ve mesajlara cevap (Instagram, X, YouTube...)","3"],["Reddit: 3 yardım yorumu","3"],["Discord: haftalık duyuru, soru, support cevapları","3"],["Fikir kartları + haftalık rapor bölümü","2"]],
     ["Haftalık plandaki tüm içerik yayında, kayıtlar tam","Günde 3-5 story","Haftada 3 Reddit yardım yorumu","Discord support: 24 saat içinde cevap","Haftada en az 5 yeni fikir kartı"],
     ["İngilizce yazmak; empati ve sakinlik (kızgın kişiye cevap vermemek).","Trader topluluklarının dilini bilmek (Reddit, X, Discord).","Kurallara uymak: sinyal vermemek, bağlantı yağdırmamak.","Telefondan hızlı yayın yapmak (Instagram, TikTok, Telegram).","Artı: Türkçe ve Farsça bilmek (Discord ve Telegram'da faydalı)."],
     "Instagram, X, YouTube, TikTok, Telegram, Facebook, LinkedIn, Reddit, Discord (hesaplara giriş <b>yönetici</b> tarafından verilir, şifre kaydedilmez), Google Sheets (havuz ve yayın kayıtları).",
     ["Sabah: yorumlara bak, support kanalını kontrol et.","Gün içi: yayın ve story; Reddit yardım yorumu (haftada 3).","Akşam: yeni soruları fikir kartı yap; 3 satırlık günlük not."],
     ["Hafta 1: hesapları ve kuralları öğren; yalnızca <b>oku</b> (Reddit'te ilk haftalar yalnız yorum).","Hafta 2: yönetici gözetiminde yayın ve ilk yorumlar.","Hafta 3: kendi başına yayın, günlük story.","Hafta 4: haftalık rapor bölümü; fikir kartları düzenli."],
     ["Aşırı satışçı olmamak, Reddit'te yeni hesapla bağlantı koymamak.","Sinyal vermemek, kızgın kişiyle tartışmamak.","Onaysız içerik yayınlamamak.","Hesap sorununu çözmeye çalışmamak (support@'a yönlendir, yöneticiye bildir)."])
    h+="<div class='card'><h3>Trader danışman</h3><p><b>İçeriklerin bilgi ve uyum açısından kontrolü.</b> Şimdilik gerektiğinde yönetici; ileride dış danışman.</p>"+T(["Konu","Ayrıntı"],[["Süre","Haftada 3-4 saat. Haftada 10-15 içerik, her biri 10-15 dakika."],["Ne yapar","Onay raporunu okur, içeriği kontrol eder, üç sonuçtan birini verir: onay, düzeltme iste, reddet."],["Bilmesi gereken","Trading ve risk yönetimi, prop firma kuralları, işlem metrikleri (R-multiple, drawdown, beklenti)."],["Ek işleri","Ayda 1 prop firma kural kontrolü (sayfalar güncel mi?). Rakam ve formüllerin teyidi. Gerekirse fikir toplantısına katılmak."],["Cevap süresi","24 saat içinde."],["Rapor verir","Yöneticiye (yönetici danışmansa kendi kontrolünü iki ayrı işaretle kaydeder)."],["Yapmaması gerekenler","Bilmediği konuyu onaylamak. \"Bu iyi bir yatırım\" gibi bir şeyi içeriğe sokmak."]])+"</div>"
    h+="<div class='card'><h3>Yönetici (sen)</h3>"+T(["Konu","Ayrıntı"],[["Süre","Haftada 3-4 saat (rapor okuma 30 dk, cuma toplantı 30 dk, onaylar, işe alım)."],["Son onay","Her içerik için \"Yayınla\"."],["Hesap erişimi","Şifreler ve doğrulama kodları sende, şifre yöneticisinde. Çalışana yalnız gerektiğinde ve gerektiği kadar giriş verirsin."],["Haftalık okuma","Cuma günü haftalık rapor (30 dk)."],["Bütçe ve işe alım","Ücretli araçlar (Canva, kurgu, yapay zekâ), yeni kişi kararı."]])+"</div>"
    h+="<div class='card'><h3>Geliştirici (zaten var)</h3>"+T(["Konu","Ayrıntı"],[["Ne yapar","Blog yazılarını, hesap makinelerini, sözlük/yardım sayfalarını siteye ekler (9 dilde). Yeni özelliği yapar."],["İçerik ekibine verir","Her hafta kısa <b>yenilik notu</b> (ne ekledik, ne düzelttik). Editör bunu içeriğe çevirir."],["İçerik ekibinden alır","Onaylı yazı (belge olarak), kapak görseli, ilgili bağlantılar."]])+"</div>"
    return h

def b8():
    h=sec(8,"Kim hangi aşamayı yapar? (tek tablo)")
    h+="<p><b>S</b> = sorumlu (işi yapan) · <b>O</b> = onaylayan / karar veren · <b>D</b> = danışılan (fikri alınan) · <b>B</b> = bilgilendirilen.</p>"
    cols=["Yönetici","Danışman","Editör","Video+görsel","Topluluk","Geliştirici"]
    rows=[("0 · Fikir toplama",["B","","S","S","S","D"]),("1 · Haftalık toplantı",["B","D","S","S","S",""]),("2 · Brief ve senaryo",["","D","S","D","",""]),("3 · Üretim",["","","S (yazı)","S (video, görsel)","",""]),("4 · Kendi kontrolü + ikinci göz",["","","S","S","",""]),("5 · Danışman kontrolü",["B","O","S (rapor)","S (rapor)","",""]),("6 · Yönetici onayı",["O","B","B","B","B",""]),("7 · Havuza koy",["B","","S","S","D",""]),("8 · Yayın",["B","","B","","S","S (site)"]),("9 · Yorum ve topluluk",["B (kritik olaylar)","","D","","S",""]),("10 · Haftalık rapor",["O (okur)","B","S (birleştirir)","S (kendi bölümü)","S (kendi bölümü)","B"])]
    h+=T(["Aşama"]+cols,[[f"<b>{a}</b>"]+[c or "—" for c in cs] for a,cs in rows])
    h+="<h3>El değiştirme (içerik kimden kime geçer?)</h3>"+T(["Kimden","Kime","Ne verir","Nasıl bilinir?"],[["Topluluk yöneticisi","Editör","Fikir kartı","Fikir havuzunda satır"],["Editör","Video+görsel üreticisi","Brief + senaryo","Haftalık plan tablosunda \"senaryo hazır\""],["Üretici (editör/video)","Danışman","Taslak + onay raporu","Rapor gönderildi"],["Danışman","Yönetici","Onaylı içerik","Raporda \"Danışman ✓\""],["Yönetici","Üretici","\"Yayınla\"","Raporda \"Yönetici: Yayınla\""],["Üretici","Topluluk yöneticisi","Havuzdaki klasör","Havuz tablosunda \"hazır\""],["Topluluk yöneticisi","Herkes","Yayın kaydı","Tabloda \"yayınlandı\" + adres"]])
    return h

def b9():
    h=sec(9,"Haftalık düzen ve toplantılar")
    h+=T(["Gün","Editör","Video + görsel","Topluluk","Danışman / yönetici"],[
    ["<b>Pazartesi</b>","Fikir toplantısı yönetir (45 dk). Brief ve senaryo yazar.","Toplantıya katılır. Brief'leri okur, malzeme hazırlar.","Toplantıya katılır. Yayın planını netleştirir.","İlk ay toplantıya katılır. Önceki haftanın raporunu okur."],
    ["<b>Salı</b>","Senaryoları bitirir; blog yazısını yazar.","Uzun videoyu çeker.","Yorumlara cevap, story, Reddit yardımı.","Erken sorulan bilgi sorularına cevap."],
    ["<b>Çarşamba</b>","Yazıları bitirir; açıklamaları yazar; ikinci göz.","Kurgu, altyazı, kartlar; kendi kontrolü.","Yayın hazırlığı; yorumlar.","<b>Danışman kontrolü başlar</b> (24 saat içinde cevap)."],
    ["<b>Perşembe</b>","Düzeltmeleri yapar; havuza koyar.","Düzeltmeleri yapar; havuza koyar.","Havuzdan alıp yayınlar.","Danışman onay; <b>yönetici \"Yayınla\"</b>."],
    ["<b>Cuma</b>","Haftalık raporu birleştirir.","Rapor bölümünü yazar; bir sonraki haftaya hazırlık.","Yayın, yorumlar; rapor bölümünü yazar.","Yönetici raporu okur; <b>ekip toplantısı (30 dk)</b>."],
    ["<b>Cumartesi</b>","—","—","Yorum ve topluluk (kısa).","Haftalık özet e-postası otomatik gider."],
    ["<b>Pazar</b>","—","—","Yalnız yanıtlar.","—"]])
    h+="<h3>Toplantılar (haftada iki tane)</h3>"+T(["Toplantı","Ne zaman","Kim","Süre","Gündem"],[["<b>Fikir toplantısı</b>","Pazartesi","Editör (yönetir), video+görsel, topluluk; ilk ay danışman/yönetici","45 dk","Geçen hafta (10), seçim (20), iş dağıtımı (10), engeller (5)."],["<b>Haftalık kapanış</b>","Cuma","Herkes + yönetici","30 dk","Rapor okunur: ne yayınlandı, ne işe yaradı, ne aksadı; gelecek hafta için ihtiyaçlar."]])
    h+="<h3>Günlük not (3 satır)</h3><p>Her çalışan gün sonunda yöneticiye üç satır yazar: <b>Bugün ne yaptım? Yarın ne yapacağım? Engelim var mı?</b> (Örnek: \"Bugün: R-multiple videosunu kurguladım, altyazı bitti. Yarın: kapak + danışmana gönderme. Engel: yok.\")</p>"
    h+=box("info","Hedefler (ilk 2 ay)","<p>İlk iki ayda hedef <b>sayı değil alışkanlık</b>: (1) haftalık planın %90'ı tamamlansın, (2) <b>sıfır kural ihlali</b> (yasak cümle, onaysız yayın), (3) danışman cevabı 24 saat içinde, (4) her cuma rapor yazılsın. Sonuçlar (takipçi, tıklama) ikinci aydan sonra hedeflenir.</p>")
    return h
