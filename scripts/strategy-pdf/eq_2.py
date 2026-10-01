from kk_lib import *

ST=[
("0","Fikir toplama","Herkes; en çok topluluk yöneticisi","Sürekli","Topluluğun soruları, Search Console aramaları, destek e-postaları, yeni özellikler.",
 "Bir fikirle karşılaştığında <b>fikir kartı</b> doldurur ve fikir havuzuna eklersin (Bölüm 12). Fikirler şu yerlerden gelir:",
 ["<b>Topluluk soruları:</b> Reddit, X, Discord (support), Instagram yorum ve mesajları. \"Pozisyon büyüklüğünü nasıl hesaplarım?\" gibi sorular altın değerinde.","<b>Google aramaları:</b> yönetici haftada bir Search Console'dan hangi aramalarla geldiğimizi paylaşır.","<b>Destek e-postaları</b> (support@): sık gelen sorular içerik konusudur.","<b>Yeni özellikler:</b> geliştirici haftalık yenilik notunu verir.","<b>Prop firma değişiklikleri:</b> bir firma kuralı değiştirince yeni içerik gerekir.","<b>Geçen haftanın en iyisi:</b> işe yarayan içeriğin devamı."],
 "Fikir havuzunda tam doldurulmuş fikir kartları.","Her kart başlık, kaynak, tür ve kanallarıyla eksiksiz.","Fikri tek cümle bırakma. Gerçek kullanıcının hikâyesini izinsiz yazma. Rakipten kopyalama."),
("1","Haftalık fikir toplantısı","İçerik editörü yönetir; video+görsel üreticisi, topluluk yöneticisi katılır (ilk ay danışman/yönetici de)","Pazartesi, 45 dakika","Fikir havuzu + geçen haftanın raporu.",
 "Toplantının akışı:",
 ["<b>Geçen hafta (10 dk):</b> rapor okunur: ne yayınlandı, ne işe yaradı, ne aksadı.","<b>Seçim (20 dk):</b> fikir havuzundan bu haftanın içerikleri seçilir. Ölçüt: (1) bir soruya cevap veriyor mu? (2) marka kurallarına uyuyor mu? (3) bu hafta yapılabilir mi? (4) türler dengeli mi (video, görsel, yazı)?","<b>İş dağıtımı (10 dk):</b> her içerik için kim yapacak, teslim günü ne.","<b>Engeller (5 dk):</b> kimin neye ihtiyacı var?"],
 "<b>Haftalık plan tablosu:</b> içerik, tür, kanallar, kim yapıyor, teslim günü.","Tablo yazılı ve herkes kendi satırını biliyor.","Haftalık hedefi aşma (kaliteyi düşürür). Danışmanın bilgi kontrolü gerektiren içerikleri işaretlemeyi unutma."),
("2","Brief ve senaryo / taslak","İçerik editörü","Pazartesi - Salı","Haftalık plan + fikir kartı.",
 "Her içerik için <b>bir sayfalık brief</b> (Bölüm 12) yazılır, ardından türüne göre:",
 ["<b>Video:</b> senaryo, saniye saniye (ne söylenecek, ekranda ne olacak).","<b>Blog:</b> iskelet ve taslak (giriş, adımlar, örnek hesap, sık sorulan sorular).","<b>Karusel / kart:</b> kart başına metin.","<b>Kısa metin / thread:</b> metin.","Rakam, formül ya da firma kuralı varsa <b>danışmana erken sor</b> (\"bu rakam doğru mu?\"). Sonradan değil."],
 "Brief + senaryo ya da taslak.","Üretici senaryoyu okuyup \"çekebilirim / tasarlayabilirim\" diyor; bilgi gerektiren yerler danışmanla netleşti.","Kuralı ezberden yazma. Her şeyi \"danışman bakar\" diye sonraya bırakma."),
("3","Üretim","Video+görsel üreticisi (video, kart, kapak); içerik editörü (yazılar)","Salı - Çarşamba","Brief ve senaryo.",
 "Üretici <b>İçerik Ekibi El Kitabı</b>'ndaki ilgili türün adımlarını izler:",
 ["Video: çekim, kurgu, altyazı (altyazısız video yayınlanmaz).","Görsel: marka kitine uygun kart, karusel, kural kartı, infografik. Her kart bir fikir.","Kapak / thumbnail: her video ve yazı için.","Yazılar: blog, thread, bülten, açıklama metinleri. Her kanal için başlık/açıklama ayrı yazılır.","Dosyalar <b>\"Taslak\" klasörüne</b> doğru adla konur (Bölüm 10)."],
 "Bitmiş video/görsel/yazı dosyaları, taslak klasöründe.","Üretilen her şey brief'teki ana mesajı veriyor; marka kiti ve altyazı tamam.","Marka renk/yazı tipini değiştirme. Başka uygulama filigranı. Gerçek hesap ekran görüntüsü."),
("4","Kendi kontrolü + ikinci göz","Üreten kişi + bir ekip arkadaşı","Çarşamba","Bitmiş taslak.",
 "<b>Üreten kişi</b> yayın öncesi kontrol listesini işaretler (10 madde, İçerik Ekibi El Kitabı Bölüm 4). Sonra bir ekip arkadaşı <b>5 dakikalık ikinci göz</b> yapar:",
 ["Yazım hatası var mı? Metni sesli oku.","Altyazı var ve doğru mu?","Bağlantı çalışıyor mu (tıkla)?","Rakamlar \"örnek\" diye işaretli mi?","Başka platformun logosu videoda var mı?"],
 "İşaretlenmiş kontrol listesi.","Liste tam işaretli, ikinci göz \"tamam\" dedi.","Listeyi bakmadan işaretleme. Başkasına baktırmadan danışmana gönderme."),
("5","Danışman kontrolü","Trader danışman (şimdilik gerektiğinde yönetici)","Çarşamba - Perşembe; 24 saat içinde cevap","Kontrolden geçmiş taslak + onay raporu.",
 "Üretici içerikle birlikte <b>onay raporu</b> gönderir (Bölüm 11). Danışman şunlara bakar:",
 ["Bilgi doğru mu (rakam, formül, firma kuralı, tarih)?","Kâr vaadi, sinyal, tavsiye ya da fiyat tahmini var mı?","Rakamlar örnek diye işaretli mi? \"Örnektir, tavsiye değildir\" notu var mı?","Gerçek kullanıcı verisi ya da izinsiz isim var mı?","Rakip anlatımı adil ve güncel mi?"],
 "Üç sonuçtan biri: <b>Onay</b> · <b>Düzeltme iste</b> (madde madde) · <b>Reddet</b> (nedenle).","Onay raporunda \"Danışman: ✓\" ve tarih var.","Danışman: bilmediğin konuyu onaylama; \"bu konuda emin değilim\" de. Üretici: düzeltme isteğine tartışmadan, madde madde cevap ver. Düzeltme turu en çok 2; 3. turda kısa bir toplantı yap."),
("6","Yönetici onayı","Yönetici","Perşembe","Danışman onaylı içerik.",
 "Yönetici içeriğe şu açılardan bakar: marka ve ton, zamanlama, \"bunu yayınlamak istiyor muyum?\". Onay raporuna <b>\"Yayınla\"</b> yazar.",
 ["Yönetici aynı zamanda danışman rolündeyse bile <b>iki ayrı kontrol</b> yapar: önce bilgi ve uyum (Aşama 5), sonra yayın kararı (Aşama 6). Rapordaki iki ayrı işaret ayrı doldurulur.","Danışman onayı olmadan yönetici onayı verilmez."],
 "Onay raporunda \"Yönetici: Yayınla\".","İçerik havuzuna girebilir hâle geldi.","Danışman kontrolünü atlama. Aceleye getirip onaylama."),
("7","İçerik havuzuna koy","İçeriği üreten kişi","Perşembe","İki onaylı içerik.",
 "<b>Havuz</b>, onaylı ve yayına hazır içeriklerin <b>tek yeri</b> (Bölüm 10). İçeriği şöyle koyarsın:",
 ["İçeriğin klasörünü <b>Havuz</b> klasörüne taşı (adı: <code>2026-10-08_r-multiple-30sn</code>).","Klasörde şunlar olsun: asıl dosya(lar), kapak, her kanal için yazılmış metinler, brief, onay raporu.","<b>Havuz tablosuna</b> bir satır ekle: tarih, başlık, tür, kanallar, bağlantı, durum = <b>hazır</b>.","Topluluk yöneticisine \"havuzda hazır\" diye haber ver."],
 "Havuzda eksiksiz klasör + tablo satırı (durum: hazır).","Topluluk yöneticisi başka hiçbir şey sormadan yayınlayabilir.","Onaysız içeriği havuza koyma. Klasör adını kafana göre yazma. Metinleri klasöre koymayı unutma."),
("8","Yayın","Topluluk yöneticisi","Perşembe - Cuma (takvime göre)","Havuzdaki \"hazır\" içerikler.",
 "Topluluk yöneticisi havuzdan içeriği alır ve kanallara yayınlar (kanal başına adımlar İçerik Ekibi El Kitabı Bölüm 7'de). Kanallar arası bir süre bırak (hepsini aynı anda atma).",
 ["Yayından önce tablodaki <b>\"Yönetici: Yayınla\"</b> işaretine bak. Yoksa <b>yayınlama</b>.","Bağlantıları tıklayıp dene.","Yayınlayınca <b>yayın kaydını</b> işle: kanal, saat, adres. Durum = <b>yayınlandı</b>.","Elle yapılan kanallar (Reddit) için metni havuzdan kopyala.","Yanlış bir şey yayınladıysan: gönderiyi hemen sil ya da gizle, yöneticiye haber ver."],
 "Yayın kayıtları tamam, durum \"yayınlandı\".","Her hedef kanalda içerik yayında ve kayıt tabloda.","Onaysız yayınlama. Aynı içeriği tekrar tekrar atma. Başka uygulamadan indirilmiş filigranlı video yükleme."),
("9","Yorum ve topluluk","Topluluk yöneticisi","Sürekli (günlük)","Yayındaki içerikler ve topluluk.",
 "Yayından sonra topluluk yöneticisi:",
 ["İlk saatlerde yorumlara cevap verir.","Discord <b>support</b> kanalına 24 saat içinde cevap verir.","Reddit'te haftada 3 yardım yorumu yazar (bağlantısız, gerçekten yardım).","X'te ve Instagram'da sorulara cevap verir.","Sinyal soranlara hazır nazik cevabı verir (\"Biz sinyal vermiyoruz...\").","Gelen soruları <b>fikir kartı</b> yapıp Aşama 0'a ekler.","Hesap sorunu, ciddi şikayet, hukuki tehdit, basın ya da rakip saldırısı gelirse <b>hemen yöneticiye</b> bildirir."],
 "Cevaplanmış yorumlar, yeni fikir kartları.","Bekleyen soru kalmadı; fikirler havuza eklendi.","Tartışmaya girme. Kızgın kişiye cevap yazma. \"Bizim ürünü kullan\" deme."),
("10","Ölçüm ve haftalık rapor","Herkes kendi bölümünü yazar; editör birleştirir; yönetici okur","Cuma","Haftanın yayın kayıtları ve sayılar.",
 "Her kişi haftalık raporun <b>kendi bölümünü</b> doldurur (Bölüm 11). Editör birleştirir. Yönetici cuma <b>30 dakika</b> okur ve ekiple konuşur.",
 ["Hangi içerikler yayınlandı (kanal bazında)?","Hedefe göre durum: planlanan kaçı bitti?","En iyi 3 içerik ve neden; en kötü 1 içerik ve neden.","Öğrendiklerin; gelecek hafta için fikirler; engeller ve ihtiyaçlar."],
 "Haftalık rapor, yöneticide.","Rapor cuma akşamına kadar yazıldı; pazartesi toplantısına girdi olarak hazır.","Sayıları şişirme. Kötü sonucu saklama: \"işe yaramadı\" yazmak da değerlidir.")]

def card(n,t,kim,ne,girdi,intro,adim,cikti,bitti,yapma):
    h=f"<div class='card'><h3>Aşama {n} · {t}</h3>"
    h+="<table><tr><td class='k' style='width:70pt'>Kim yapar</td><td>"+kim+"</td></tr><tr><td class='k'>Ne zaman</td><td>"+ne+"</td></tr><tr><td class='k'>Girdi</td><td>"+girdi+"</td></tr></table>"
    h+=f"<p>{intro}</p>"+ul(adim)
    h+=f"<p><b>Çıktı:</b> {cikti}</p><p><b>Bitti sayılır:</b> {bitti}</p><p><b>Yapma:</b> {yapma}</p></div>"
    return h

def b4():
    h=sec(4,"Aşamalar: bir içerik nasıl yayına döner?")
    h+="<p>Bir fikir yayına <b>11 aşamadan</b> geçerek döner. Her hafta aynı sıra tekrarlanır. Aşağıdaki özet tablo bir bakışta kimin ne zaman ne yaptığını gösterir; sonra her aşama tek tek, <b>ne yapılacağı, kimin yapacağı ve ne zaman bittiği</b> ile anlatılıyor. Sayfa sonundaki şema (Ek) aynı akışın resmi.</p>"
    h+=T(["Aşama","Ne","Kim","Ne zaman"],[[f"<b>{s[0]}</b>",s[1],s[2],s[3]] for s in ST])
    h+=box("info","Neden bu kadar aşama?","<p>Her aşama bir hatayı yakalar. Fikir aşaması yanlış konuyu eler, brief belirsizliği eler, kendi kontrolün yazım hatasını eler, danışman yanlış bilgiyi eler, yönetici markaya aykırı olanı eler. Bir içerik havuza girdiğinde artık hem doğru hem güvenlidir. Hızlı olmak için aşama atlamıyoruz; <b>aşamaları kısa tutuyoruz.</b></p>")
    for s in ST: h+=card(*s)
    return h

def b5():
    h=sec(5,"Bir fikrin yolculuğu: baştan sona örnek")
    h+="<p>Gerçek bir örnek: <b>\"R-multiple 30 saniyede\"</b> adlı kısa video (tür 3). Hafta boyunca ne olur:</p>"
    h+=T(["Gün","Aşama","Ne olur","Kim"],[
    ["Cumartesi","0 · Fikir","Reddit'te biri \"how do I compare a $50 trade to a $500 one?\" diye sordu. Topluluk yöneticisi fikir kartı yaptı: \"R-multiple 30 saniyede\".","Topluluk yöneticisi"],
    ["Pazartesi","1 · Toplantı","Fikir seçildi: kısa ipucu videosu (tür 3), kanallar: Instagram, YouTube Shorts, TikTok, X, Telegram, Facebook, LinkedIn, Discord. Teslim: çarşamba.","Editör + ekip"],
    ["Pazartesi","2 · Senaryo","Editör 5 satırlık senaryo yazdı (\"Bir işlemde 100 dolar riske ettin, 200 dolar kazandın. Bu kaç R? İki.\"). Rakamlar örnek. Danışmana \"R formülü doğru mu?\" diye erken sordu: doğru.","Editör"],
    ["Salı","3 · Üretim","Video üreticisi dikey çekti, kurguladı, altyazı ekledi, kapak yaptı. Editör her kanal için açıklama metnini yazdı.","Üretici + editör"],
    ["Çarşamba sabah","4 · Kontrol","Üretici listeyi işaretledi; editör ikinci göz yaptı: \"altyazıda bir yazım hatası var\" → düzeltildi.","Üretici + editör"],
    ["Çarşamba öğleden sonra","5 · Danışman","Onay raporu geldi. Danışman: \"Onay. Altyazıya 'Örnektir, tavsiye değildir' ekleyin.\" → eklendi (1. tur).","Danışman"],
    ["Perşembe sabah","6 · Yönetici","Yönetici baktı: \"Yayınla.\"","Yönetici"],
    ["Perşembe","7 · Havuz","Üretici klasörü <code>2026-10-08_r-multiple-30sn</code> adıyla havuza koydu, tabloya satır ekledi (durum: hazır).","Üretici"],
    ["Perşembe - Cuma","8 · Yayın","Topluluk yöneticisi takvime göre kanallara yayınladı, kayıtları işledi (durum: yayınlandı).","Topluluk yöneticisi"],
    ["Cuma","9 · Yorum","İlk saatlerde yorumlara cevap verdi; bir kişi \"hangi pariteyi alayım?\" diye sordu → hazır nazik cevap.","Topluluk yöneticisi"],
    ["Cuma","10 · Rapor","Haftalık rapora yazıldı: \"R-multiple videosu en çok kaydedilen içerik; TikTok'ta zayıf kaldı.\" Pazartesi toplantısı bunu girdi olarak aldı.","Herkes"]])
    h+=box("ok","Örnekten çıkan ders","<p>Hiçbir aşama diğerini beklemeden başlamıyor, ama <b>sıra değişmiyor</b>. Kimse bir içeriği yalnız başına yayına çıkarmıyor. Her el değiştirmede (üretici → danışman → yönetici → havuz → yayın) bir işaret ve bir kayıt var; böylece \"bu içerik kimin elinde?\" sorusunun cevabı her zaman belli.</p>")
    return h
