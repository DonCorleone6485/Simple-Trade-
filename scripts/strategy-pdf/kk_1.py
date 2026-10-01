from kk_lib import *

def cover():
    return """<div class="cover"><div class="brand">Simple Trading Journal</div>
<h1>İçerik dağıtım sistemi<br><em>kurulum el kitabı</em></h1>
<p>Bu sistemi kuracak kişi için: şirketi, ürünü ve işi hiç bilmeden başlayabilmen için baştan sona anlatıldı. Her adım örnekle, her karar nedeniyle yazıldı.</p>
<div class="foot">1 Ekim 2026 · simpletradejournal.io · Bu belge yanındaki kurulum paketiyle birlikte verilir</div></div>"""

def toc():
    items=[("1","Önce bunu oku"),("2","Şirketi tanı"),("3","Sözlük"),("4","Sana ne verilir, nasıl çalışırsın"),("5","Sistem bir bakışta"),("6","On kanal: tek tek"),("7","23 içerik türü ve karar tablosu"),("8","Veri modeli"),("9","Adım 1-2: içeriği bırak ve tanı"),("10","Adım 3: karar (kural motoru)"),("11","Adım 4: eksik varlıklar"),("12","Adım 5: kanala özel metin"),("13","Adım 6: onay"),("14","Adım 7: yayın ve takip"),("15","Yönetici sayfası ve yazılım düzeni"),("16","Güvenlik ve gizlilik"),("17","Kurulum planı (aşama aşama)"),("18","Kabul testleri: bitti nasıl anlaşılır"),("19","Teslim"),("20","Takılırsan"),("Ek","Sahibine sorulacaklar, doğrulama listesi, maliyet, sistem şeması (Ek E)")]
    return "<h2 class='sec nb' style='page-break-before:avoid;border-top:none'>İçindekiler</h2><table class='toc'>"+"".join(f"<tr><td class='n'>{a}</td><td>{b}</td></tr>" for a,b in items)+"</table>"

def b1():
    h=sec(1,"Önce bunu oku")
    h+="""<p>Bu belge, <b>Simple Trading Journal</b> adlı şirketin içerik dağıtım sistemini kuracak kişi için yazıldı. Şirketi, ürünü, sosyal medya hesaplarını ve içerik işini <b>hiç bilmediğini</b> varsayıyoruz. Sana kimseye soru sormadan başlayabilmen için gereken her şeyi yazdık. Bilmediğin bir kelime çıkarsa Bölüm 3'teki sözlüğe bak.</p>
<h3>Ne kuracaksın? (kısaca)</h3>
<p>Şirketin içerik ekibi her hafta video, görsel ve yazı üretiyor. Bunların her birini 10 farklı yere (Instagram, X, YouTube, TikTok, Telegram, Facebook, LinkedIn, Reddit, Discord ve şirketin kendi sitesi) elle yüklemek çok vakit alıyor ve hata çıkarıyor. Senin kuracağın sistem şunu yapacak:</p>
<div class="flow"><div class="st"><b>1 · Bırak</b>Çalışan içeriği tek yere yükler</div><div class="ar">→</div><div class="st"><b>2 · Tanı</b>Sistem içeriğin ne olduğunu anlar</div><div class="ar">→</div><div class="st"><b>3 · Karar</b>Hangi kanallara gideceğini bulur</div><div class="ar">→</div><div class="st"><b>4 · Eksik</b>Kapak, altyazı gibi eksikleri ister ya da üretir</div><div class="ar">→</div><div class="st"><b>5 · Yaz</b>Her kanal için ayrı metin yazar</div><div class="ar">→</div><div class="st"><b>6 · Onay</b>İki insan onaylar</div><div class="ar">→</div><div class="st"><b>7 · Yayın</b>Kanallara gönderir, takip eder</div></div>
<h3>Bir örnek: sistem çalışınca ne olacak?</h3>
<p>Bir çalışan <i>"R-multiple 30 saniyede"</i> adlı 45 saniyelik dikey bir video çekti. Yönetici sayfasına girip videoyu yükledi ve "R-multiple nedir, kısaca" diye tek cümlelik not yazdı. Bundan sonrası:</p>
"""+ol(["Sistem videonun dikey, 45 saniye, 30 MB olduğunu <b>kendisi okur</b>.","Notu ve videoyu inceleyip bunun 23 içerik türünden <b>tür 3 (kısa ipucu videosu)</b> olduğunu anlar. Emin değilse çalışana sorar.","Tür tablosuna bakar: Instagram, YouTube, TikTok ana kanal; X, Telegram, Facebook, LinkedIn, Discord'a da gider; sitede ve Reddit'te yeri yok. Bunu <b>yazılı bir kuralla</b> yapar, yapay zekâya sormaz.","Eksik var mı bakar: video altyazılı mı, kapak resmi lazım mı. Eksik varsa çalışana bildirir ya da kendisi üretir.","Yapay zekâya her kanal için ayrı metin yazdırır: Instagram'a kısa ve sıcak, X'e tek cümle, LinkedIn'e profesyonel.","Hepsini tek ekranda gösterir. Önce <b>trader danışman</b> (bilgi doğru mu, yasaklı cümle var mı), sonra <b>yönetici</b> onaylar.","Onaydan sonra kanallara 15 dakika arayla gönderir. Hangisi yayınlandı, hangisi hata verdi tabloda görünür."])
    h+=box("warn","Bu işin en önemli kuralı","<p>Bu sistem şirket adına <b>herkese açık yayın</b> yapacak. Yanlış bir cümle, yanlış rakam ya da yasaklı bir vaat (örneğin \"bu araçla kazanırsın\") şirketi ciddi şekilde zor durumda bırakır. Bu yüzden <b>hiçbir şey iki insan onaylamadan yayınlanmaz</b>. Bu kuralı hiçbir gerekçeyle gevşetme ve kendi başına \"şunu otomatik yayınlasın\" deme.</p>")
    h+="""<h3>Sonunda ne teslim edeceksin?</h3>"""+ul(["Çalışan bir <b>yönetici sayfası</b>: içerik yükle, kararı gör, düzelt, onayla, yayın durumunu izle.","Çalışan bir <b>sunucu tarafı</b>: kural motoru, yapay zekâ metin yazımı, video işleme, yayın kuyruğu.","<b>Veritabanı</b> (tablolar ve tohum verileri yüklenmiş).","Tüm testlerin geçtiğini gösteren bir <b>test raporu</b> (Bölüm 18).","Sistemi şirketin kullanabilmesi için <b>kullanım ve bakım notu</b> (Bölüm 19).","Hangi kanalların <b>gerçekten otomatik</b> yayınlandığını, hangilerinin elle (görev kartı) kaldığını gösteren dürüst bir durum tablosu."])
    h+="""<h3>Bu paketin içinde ne var?</h3>"""+T(["Dosya","Ne işe yarar"],[
    ["<code>Kurulum El Kitabı (bu PDF)</code>","Her şeyin açıklaması. Önce bunu baştan sona oku."],
    ["<code>01-schema.sql</code>","Veritabanı şeması. Gerçek bir Postgres'te denendi, hatasız kuruluyor."],
    ["<code>02-channels.csv</code>","10 kanal: adres, durum, yayın biçimi, diller."],
    ["<code>03-content-types.csv</code>","23 içerik türü: ad, grup, açıklama, örnek."],
    ["<code>04-type-channel-rules.csv</code>","Karar tablosu: her tür her kanalda ne durumda (230 satır)."],
    ["<code>channel-specs.json</code>","Her kanalın teknik sınırları ve uyum kuralları. Platform kuralı değişince yalnız bu dosya güncellenir."],
    ["<code>05-brand-rules.json</code>","Metinlerin uyması gereken marka kuralları ve yasak ifade listesi."],
    ["<code>06-test-cases.json</code>","Kural motorunun geçmesi gereken 47 test."],
    ["<code>reference/decide.mjs</code>, <code>run-tests.mjs</code>","Referans kural motoru ve test çalıştırıcı. <code>node reference/run-tests.mjs</code> ile çalışır. Kendi kodunu yazarsan aynı testleri geçmelisin."],
    ["<code>reference/ffmpeg-recipes.sh</code>","Video işleme komutları. Hepsi denendi."],
    ["<code>brand/</code>","Logolar, kapaklar, marka kiti ve kart üretici."]],cls="")
    h+=box("info","Nasıl okuyacaksın?","<p>Bölüm 1-4 ile başla (şirket ve çalışma kuralları). Bölüm 5-8 sistemi ve veriyi anlatır. Bölüm 9-14 sistemin yedi adımını tek tek, <b>ne yapılacağını ve nasıl test edileceğini</b> anlatır. Bölüm 17 ne sırayla kuracağını, Bölüm 18 işin ne zaman bittiğini söyler.</p>")
    return h

def b2():
    h=sec(2,"Şirketi tanı")
    h+="""<h3>Simple Trading Journal nedir?</h3>
<p><b>Trader</b>'lar (borsada ya da döviz piyasasında alım satım yapan kişiler) her işlemlerini kaydeder ve incelerse hatalarını görür. Bu kaydı tutan deftere <b>trading journal</b> (işlem günlüğü) denir. Simple Trading Journal, bu defteri <b>otomatik tutan bir online yazılım</b>. Trader işlem yapar; program işlemi kendisi deftere yazar. Sonra trader "neyi doğru, neyi yanlış yapıyorum?" sorusunun cevabını görür.</p>
<p>Site adresi: <b>simpletradejournal.io</b>. Site 9 dilde yayınlanır. Sosyal medya hesapları <b>İngilizce</b>.</p>
<h3>Neyi öne çıkarıyor?</h3>"""+ul(["<b>Otomatik kayıt:</b> en yaygın işlem programı olan MetaTrader'daki (MT4 ve MT5) işlemler elle yazılmadan deftere düşer.","<b>Hata analizi:</b> intikam işlemi (kayıptan sonra mantıksız işlem), aşırı işlem gibi kötü alışkanlıkları gösterir.","<b>Prop firma takibi:</b> trader'a para veren firmaların kurallarına (günlük kayıp limiti vb.) ne kadar yaklaştığını gösterir.","<b>Ücretsiz hesap makineleri:</b> pozisyon büyüklüğü, risk/ödül gibi. Siteye arama motorundan trafik getirir.","Ücretsiz bir plan ve ücretli bir Pro plan var. (Fiyatı sen paylaşmayacaksın; sistem fiyat yazmaz. Fiyat lazım olursa sahibine sor.)"])
    h+="""<h3>Ne satıyoruz, ne satmıyoruz? (çok önemli)</h3>
"""+box("warn","Biz bir yazılım şirketiyiz, yatırım danışmanı değiliz","<p>Şirket <b>kâr vaat etmez</b>, <b>\"şunu al, şunu sat\" demez</b>, fiyat tahmini yapmaz. İçeriklerde \"kazanırsın\", \"garanti\", \"kesin\", \"kolay para\" gibi sözler <b>yasaktır</b>. Yazıda ya da videoda geçen her rakam <b>örnek</b> diye işaretlenir (\"$10.000 hesap, %1 risk = $100. Örnektir, tavsiye değildir.\"). Gerçek bir kullanıcının adı, yüzü ya da hesabı <b>yazılı izin olmadan</b> gösterilmez.</p>")
    h+="""<h3>Müşteri kim?</h3>
<p>Her gün işlem yapan bireysel trader'lar ve <b>prop firma</b> (kendi parasını trader'a açan firma; trader kurallara uyarsa o parayla işlem yapar, uymazsa hesabı kapanır) hesabıyla çalışanlar. Çoğu MetaTrader kullanır.</p>
<h3>Neden içerik üretiyoruz?</h3>
<p>Şirket reklam vermiyor. Büyüme iki yoldan: (1) <b>Google aramaları</b> (blog yazıları, hesap makineleri, karşılaştırmalar) ve (2) <b>sosyal medyada yardımcı içerik</b> (kısa videolar, kartlar, ipuçları). Amaç satış yapmaya çalışmak değil, <b>trader'a yardım etmek</b>; merak edenin siteyi denemesi. İçerik ekibinin işi budur. Senin sistemin ekibin bu işi hatasız ve hızlı yapmasını sağlayacak.</p>
<h3>Ekip ve kişiler</h3>"""+T(["Rol","Ne yapar","Sistemle ilişkisi"],[
    ["<b>Yönetici (sahip)</b>","Şirketin sahibi. Son onayı verir, hesapların şifrelerini ve anahtarlarını tutar.","İçerik yükleyebilir; <b>son onay kapısı</b>; hesap bağlantılarını o yapar."],
    ["<b>Trader danışman</b> (yarı zamanlı)","Her içeriğin doğruluğunu ve kurala uygunluğunu kontrol eder.","<b>İlk onay kapısı</b>."],
    ["Video yapımcısı","Ekran kaydı, kısa/uzun video, altyazı, kurgu.","İçerik yükler."],
    ["Grafik tasarımcı","Kart, karusel, infografik, kapak, şablon.","İçerik yükler."],
    ["Yazar","Blog, karşılaştırma, bülten, thread, sözlük.","İçerik yükler."],
    ["Sosyal medya ve topluluk yöneticisi","Paylaşım takvimi, yayın, yorumlara cevap, Discord/Reddit.","Sistemin günlük kullanıcısı; <b>görev kartlarını</b> yapar."]],cls="")
    h+="<p>Bu kişilerin iletişim bilgilerini sahibi sana ayrıca verir. İş sırasında bir karar için sahibe sormak gerekirse <b>Ek</b> bölümündeki \"sahibine sorulacaklar\" listesine bak: hangi kararları ona bırakman gerektiği orada yazılı.</p>"
    h+="""<h3>Marka sesi (metinlerin tonu)</h3>"""+ul(["Sade, doğrudan, yardımcı. Abartı ve \"hype\" yok. Ünlem yığını yok.","Trader'a saygılı, \"sen\" dili (İngilizcede \"you\").","Kısa cümleler. İlk satırda konu.","Örnek bir cümle: <i>\"Size the position, not the hope. Risk a fixed % of your account on every trade.\"</i>"])
    return h

GLOS=[
("Trader","Alım satım yapan kişi.","Ahmet her gün dolar/euro alıp satıyor. Ahmet bir trader."),
("İşlem (trade)","Bir alım ve ona karşılık gelen satım.","Sabah euro aldı, öğlen sattı: 1 işlem."),
("Journal (işlem günlüğü)","Yapılan işlemlerin yazıldığı defter.","Her işlemin ne zaman ve neden yapıldığı."),
("MetaTrader (MT4/MT5)","Trader'ların en yaygın kullandığı işlem programı.","Bizim yazılım bunun içindeki işlemleri otomatik alır."),
("Prop firma","Trader'a para veren şirket; kurallara uyarsa trader o parayla çalışır.","FTMO, The5ers."),
("Günlük kayıp limiti","Bir günde en çok kaybedilebilecek para.","Limit 500 dolar; 500 kaybeden hesap kapanabilir."),
("Drawdown","Hesabın en yüksek noktasından ne kadar düştüğü.","10.000'den 9.000'e düştü: drawdown 1.000."),
("Risk","Bir işlemde kaybetmeyi göze aldığın para.","10.000 dolarlık hesapta %1 risk = 100 dolar."),
("R-multiple","Kazanç ya da kaybın, göze alınan riske oranı.","100 riske edip 200 kazandın: +2R."),
("İntikam işlemi","Kayıptan sonra kaybı geri almak için mantıksız işlem açmak.","—"),
("Aşırı işlem","Gereğinden çok işlem açmak.","Plan 3 işlem, yapılan 15."),
("İçerik","Yayınlanacak bir şey: video, görsel, yazı ya da PDF.","—"),
("İçerik türü","Şirketin tanımladığı 23 içerik çeşidi. Hangisinin hangi kanala gideceği buna bağlı.","Tür 3 = kısa ipucu videosu."),
("Kanal","Bir yayın yeri: Instagram, X, YouTube, TikTok, Telegram, Facebook, LinkedIn, Reddit, Discord, web sitesi.","10 kanal var."),
("Karar","Sistemin bir içerik için bir kanalda vereceği cevap: GİDER, DÖNÜŞTÜR, GİTMEZ, görev, vb.","Bölüm 10."),
("Dikey / yatay video","Telefonu dik tutarak çekilen (9:16) ve yatay (16:9) video.","Reels, Shorts, TikTok dikey ister."),
("Reels / Shorts","Instagram ve YouTube'un kısa dikey videoları. TikTok da aynı türdür.","—"),
("Story","24 saat sonra kaybolan kısa Instagram paylaşımı.","—"),
("Karusel","Kaydırmalı çok görselli gönderi.","6 kartlık \"5 adımda pozisyon büyüklüğü\"."),
("Thread","X'te art arda bağlı tweetler.","1/6, 2/6, ..."),
("Caption","Paylaşımın altındaki yazı.","—"),
("Hashtag","# ile başlayan etiket.","#TradingJournal"),
("Thumbnail / kapak","Videonun liste üzerindeki küçük resmi. YouTube uzun videoda 1280×720 gerekir.","—"),
("Altyazı","Videoda konuşulanın ekranda yazılı çıkması. Çoğu kişi sesi kapalı izler.","—"),
("CTA","Paylaşımın sonunda izleyiciden istenen şey.","\"Ücretsiz hesap makinesini dene.\""),
("Filigran","Başka uygulamanın videoya koyduğu logo. Yüklenen video filigransız, orijinal olmalı.","—"),
("Canonical URL","Bir içeriğin kalıcı adresi. Çoğunlukla sitedeki sayfası.","simpletradejournal.io/blog/r-multiple-explained"),
("Kural motoru","Hangi içeriğin hangi kanala gideceğine <b>kodla</b> karar veren parça. Yapay zekâ değil.","Bölüm 10."),
("Adaptör","Bir kanala gönderen küçük kod parçası (Telegram adaptörü, Discord adaptörü...).","Bölüm 14."),
("Kuyruk","Yayına hazır işlerin sırayla beklediği liste.","—"),
("Görev kartı","Sistemin yapamadığı, bir insanın yapacağı iş için hazırlanan kart: hazır metin, dosya, kopyala düğmesi.","Reddit paylaşımı."),
("Onay kapısı","İçeriğin yayın öncesi geçmesi gereken insan onayı. İki tane var: danışman, yönetici.","Bölüm 13."),
("DRY_RUN","\"Deneme modu\": sistem yayınlamaz, ne yapacağını günlüğe yazar. Başlangıçta HER ZAMAN açık.","Bölüm 14."),
("İdempotency anahtarı","Aynı gönderinin iki kez gitmesini önleyen benzersiz kimlik.","—"),
("OAuth","Bir uygulamaya, kullanıcının şifresini vermeden hesabına yetki verme yöntemi. Bunu hesabın sahibi yapar.","—"),
("RLS","Veritabanında satır düzeyinde güvenlik (Row Level Security). Tabloları kimsenin doğrudan okumasını engeller.","Bölüm 16."),
]
def b3():
    h=sec(3,"Sözlük (bilmediğin kelimeler)")
    h+="<p>Her kelime sade anlatıldı ve gerekirse örnek verildi.</p>"
    h+=T(["Kelime","Ne demek?","Örnek"],[[f"<b>{a}</b>",b,c] for a,b,c in GLOS])
    return h

def b4():
    h=sec(4,"Sana ne verilir, nasıl çalışırsın")
    h+="<h3>Sana verilenler</h3>"+ul(["Bu paket (belge, şema, tablolar, kurallar, testler, tarifler, marka dosyaları).","Sosyal hesapların adresleri (Bölüm 6). Hesapların kendisine <b>giriş verilmez</b>.","Sahibine ve danışmana ulaşma yolu.","Bir <b>test ortamı</b>: yeni ve ayrı bir veritabanı projesi, yeni bir kod deposu. Bunları sen kurarsın ya da sahibi kurup sana erişim verir (Aşama 0'da netleşir)."])
    h+="<h3>Sana verilmeyenler (bilerek)</h3>"+T(["Verilmez","Neden"],[
    ["Hesapların şifreleri ve iki adımlı doğrulama kodları","Hesapların güvenliği. Yetki bağlantısını (OAuth) hesap sahibi kendisi yapar, sen şifreyi hiç görmezsin."],
    ["Şirketin canlı veritabanı ve kullanıcı bilgileri","Orada gerçek kullanıcıların e-postaları var. Bu sistemin onlarla ilgisi yok. Senin sistemin <b>tamamen ayrı</b> bir veritabanında çalışır."],
    ["Şirketin ana kod deposuna yazma erişimi","Siteye sen dokunmayacaksın. Sistem siteye yazmaz; geliştiriciye \"bu sayfayı ekle\" diye <b>iş kartı</b> üretir."],
    ["Şirketin ödeme, e-posta, reklam hesapları","Bu işle ilgisiz."]])
    h+="<h3>Çalışma kuralların</h3>"+ol(["<b>Canlıya dokunma.</b> Bütün geliştirme ayrı projede olur. Şirketin siteyi çalıştıran sistemine hiçbir şey yazma.","<b>Gizli anahtarlar</b> (API anahtarı, bot token) yalnızca ortam değişkenlerinde durur. Koda yazma, repoya gönderme, sohbete/e-postaya yapıştırma. Bir anahtarı yanlışlıkla paylaşırsan hemen sahibe söyle; anahtar yenilenir.","<b>DRY_RUN her zaman açık başlar.</b> Sistem sen \"canlı\" diye açana kadar hiçbir kanala yayın yapmaz, yalnız günlüğe yazar. Canlıya geçiş yalnızca sahibin yazılı onayıyla olur (Aşama 6).","<b>Gerçek hesaplara test yayını yapma.</b> Testi kendi açtığın test hesaplarıyla yap: bir Telegram test kanalı, bir Discord test sunucusu. Gerçek şirket hesaplarında deneme yayını yok.","<b>Satın alma yapma.</b> Ücretli bir araç (yayın servisi, yapay zekâ API'si) gerekiyorsa önce sahibe yaz: ne için, ne kadar, alternatifi ne. Onaylamadan alma.","<b>Emin değilsen sor, tahmin etme.</b> Özellikle hukuki ya da marka konusunda. Bir sorun çıkarsa Bölüm 20'ye bak, orada çözemezsen sahibe yaz.","<b>Her gün kısa not tut.</b> Ne yaptın, ne engelleniyor, ne zaman biter. Haftada bir sahibe özet gönder."])
    h+=box("ok","Bu kuralların amacı","<p>Seni sınırlamak değil, hem şirketi hem seni korumak. Herkese açık yayın yapan bir sistemde \"ben yanlışlıkla gerçek hesaba atmışım\" gibi bir hata geri alınamaz. Bu yüzden her şey önce deneme modunda, ayrı ortamda ve onayla ilerler.</p>")
    return h
