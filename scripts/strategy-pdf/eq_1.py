from kk_lib import *

def cover():
    return """<div class="cover"><div class="brand">Simple Trading Journal</div>
<h1>Ekip kurulumu ve<br><em>çalışma düzeni</em></h1>
<p>Kimleri işe alacağız, kim ne yapacak, bir fikir yayına nasıl dönüşür, kim kime rapor verir. İşe yeni başlayan biri bile okuyunca ne yapacağını anlasın diye örnekle yazıldı.</p>
<div class="foot">1 Ekim 2026 · simpletradejournal.io · İçerik Ekibi El Kitabı ile birlikte okunur</div></div>"""

def toc():
    items=[("1","Önce bunu oku"),("2","Şirketi tanı"),("3","Sözlük"),("4","Aşamalar: bir içerik nasıl yayına döner?"),("5","Bir fikrin yolculuğu: baştan sona örnek"),("6","Ekip: kimleri işe alacağız?"),("7","Rol kartları: her kişi ne yapar?"),("8","Kim hangi aşamayı yapar? (tek tablo)"),("9","Haftalık düzen ve toplantılar"),("10","Fikir havuzu ve içerik havuzu"),("11","Rapor vermek: danışmana ve yöneticiye"),("12","Şablonlar"),("13","İşe alım: ilan, deneme görevi, ilk 30 gün"),("14","Takılırsan"),("Ek","Şemalar: ekip ağacı ve içerik yolculuğu")]
    return "<h2 class='sec nb' style='page-break-before:avoid;border-top:none'>İçindekiler</h2><table class='toc'>"+"".join(f"<tr><td class='n'>{a}</td><td>{b}</td></tr>" for a,b in items)+"</table>"

def b1():
    h=sec(1,"Önce bunu oku")
    h+="""<p>Bu belgenin iki işi var:</p>"""+ul(["<b>Yönetici için:</b> içerik ekibini kurmak. Kaç kişi lazım, kimi önce işe alacağız, kim ne yapacak, onlardan nasıl rapor alacağız.","<b>Çalışanlar için:</b> işe girince <b>kimseye sormadan</b> kendi işini, hangi aşamada olduğunu, işi kimden alıp kime vereceğini ve nasıl rapor vereceğini anlamak."])
    h+="<h3>Yanındaki belge</h3><p>Bu belge <b>\"kim, ne zaman, kime\"</b> sorusunu cevaplar. Her içerik türünün <b>nasıl yapılacağını</b> (adım adım, hazır örnekle) anlatan ikinci belge ise <b>İçerik Ekibi El Kitabı</b>. İkisi birlikte verilir. Bu belgeyi okurken \"nasıl yapacağım?\" diye takılırsan o kitaba bak.</p>"
    h+="<h3>Kısaca: kurulacak düzen</h3>"+T(["Soru","Cevap"],[
    ["Kaç kişi?","<b>3 kişi</b> (iki tam zamanlı, bir yarı zamanlı) + <b>trader danışman</b> + yönetici. Siteye yazı koyan geliştirici zaten var."],
    ["Kimler?","<b>İçerik editörü</b> (fikir, senaryo, yazı), <b>video + görsel üreticisi</b>, <b>topluluk yöneticisi</b>."],
    ["Danışman kim?","Şimdilik <b>yönetici gerektiğinde kendisi danışman olur</b>. İleride dışarıdan bir trader danışman alınabilir. İş aynı: içerik yayından önce bilgi ve uyum açısından kontrol edilir."],
    ["İş nasıl akar?","<b>11 aşamadan</b> geçer (hemen aşağıda tek tek listelendi): fikir → haftalık toplantı → senaryo → üretim → kontrol → danışman → yönetici onayı → <b>içerik havuzu</b> → yayın → yorum → rapor."],
    ["İçerik bitince ne olur?","Onaylanan içerik <b>içerik havuzuna</b> konur. Yayını yapan kişi havuzdan alır ve kanallara yayınlar (ileride bunu bir sistem yapacak)."],
    ["Rapor?","Günlük 3 satır not, haftalık rapor, her içerik için onay raporu (Bölüm 11)."]],cls="")
    h+="<h3>11 aşama: bir içerik yayına nasıl döner?</h3><p>Bu belgede <b>\"Aşama\"</b> dediğimiz şey, bir içeriğin yayına gelene kadar geçtiği 11 adımdır (Aşama 0'dan Aşama 10'a). Kısaca hepsi şunlar. Her birinin tam anlatımı <b>Bölüm 4</b>'te; kimin hangi aşamayı yaptığı <b>Bölüm 8</b>'deki tabloda.</p>"
    h+=T(["Aşama","Adı","Ne yapılır? (kısaca)","Kim yapar?"],[
    ["<b>0</b>","Fikir toplama","İçerik fikirleri toplanır ve kısa bir <b>fikir kartı</b> olarak yazılır. Fikir; topluluğun sorularından, Google aramalarından, destek e-postalarından gelir.","Herkes; en çok topluluk yöneticisi"],
    ["<b>1</b>","Haftalık fikir toplantısı","Pazartesi 45 dakika: bu hafta hangi içerikler yapılacak seçilir, işler dağıtılır.","İçerik editörü yönetir; hepsi katılır"],
    ["<b>2</b>","Brief ve senaryo / taslak","Her içerik için bir sayfalık iş tarifi (brief) ve video için senaryo, yazı için taslak yazılır.","İçerik editörü"],
    ["<b>3</b>","Üretim","Video çekilip kurgulanır, kartlar ve kapaklar tasarlanır, yazılar yazılır.","Video+görsel üreticisi; editör (yazılar)"],
    ["<b>4</b>","Kendi kontrolü + ikinci göz","Üreten kişi 10 maddelik kontrol listesini işaretler; bir ekip arkadaşı 5 dakika bakar.","Üreten kişi + bir arkadaşı"],
    ["<b>5</b>","Danışman kontrolü","Bilgi doğru mu, yasaklı vaat var mı diye bakılır. Sonuç: onay, düzeltme isteği ya da ret.","Trader danışman (şimdilik gerektiğinde yönetici)"],
    ["<b>6</b>","Yönetici onayı","Yayından önceki son onay: \"Yayınla\".","Yönetici"],
    ["<b>7</b>","İçerik havuzuna koy","Onaylı içerik eksiksiz klasörüyle <b>içerik havuzuna</b> konur ve tabloya yazılır.","İçeriği üreten kişi"],
    ["<b>8</b>","Yayın","Havuzdaki içerik kanallara yayınlanır, yayın kaydı tutulur.","Topluluk yöneticisi"],
    ["<b>9</b>","Yorum ve topluluk","Yorumlara ve sorulara cevap verilir; gelen sorular yeni fikirlere dönüşür.","Topluluk yöneticisi"],
    ["<b>10</b>","Ölçüm ve haftalık rapor","Cuma günü herkes kendi bölümünü yazar, editör birleştirir, yönetici okur.","Herkes; yönetici okur"]])
    h+=box("info","Bu belgede iki farklı numara var, karıştırma","<p><b>Aşama</b> = içeriğin geçtiği adım (0-10). <b>Bölüm</b> = bu belgenin bölümleri (1-14). Örneğin \"Aşama 5\" danışman kontrolü, \"Bölüm 5\" ise bir fikrin yolculuğu örneğidir. Aşağıda bölümleri hep adıyla yazdık.</p>")
    h+="<h3>Kim hangi bölümleri okur?</h3>"+T(["Kim","Okuması gereken bölümler"],[["Yönetici","Bölüm 1 (Önce bunu oku), 2 (Şirketi tanı), 6 (Ekip), 7 (Rol kartları), 8 (Kim hangi aşamayı yapar), 9 (Haftalık düzen), 11 (Rapor vermek), 13 (İşe alım)."],["Yeni çalışan (herkes)","Hepsi. Önce Bölüm 1-5 (aşamalar ve örnek), sonra kendi rol kartı (Bölüm 7), sonra Bölüm 8-12."],["Danışman","Bölüm 1, 2, Bölüm 4'teki Aşama 5 (danışman kontrolü) ve Bölüm 11 (onay raporu)."]])
    h+=box("warn","Bu işin üç değişmez kuralı","<ol><li><b>Hiçbir içerik onaysız yayınlanmaz.</b> Önce danışman kontrolü, sonra yönetici onayı.</li><li><b>Kâr vaadi, sinyal ve yatırım tavsiyesi yok.</b> Biz bir yazılım şirketiyiz, yatırım danışmanı değiliz.</li><li><b>Şifreler yönetici ve şifre yöneticisinde durur.</b> Hiç kimse hesap şifresi istemez, paylaşmaz, kaydetmez.</li></ol>")
    return h

def b2():
    h=sec(2,"Şirketi tanı")
    h+="""<h3>Simple Trading Journal nedir?</h3>
<p><b>Trader</b>'lar (borsada ya da döviz piyasasında alım satım yapan kişiler) işlemlerini kaydeder ve inceleyerek hatalarını görür. Bu deftere <b>trading journal</b> (işlem günlüğü) denir. Simple Trading Journal, bu defteri <b>otomatik tutan bir online yazılım</b>. Trader işlem yapar; program işlemi kendisi deftere yazar. Trader sonra "neyi doğru, neyi yanlış yapıyorum?" sorusunun cevabını görür. Adres: <b>simpletradejournal.io</b>. Site 9 dilde; sosyal hesaplar İngilizce.</p>
<h3>Neyi öne çıkarıyoruz?</h3>"""+ul(["MetaTrader'daki (MT4 ve MT5) işlemler <b>elle yazılmadan</b> deftere düşer.","<b>Hata analizi:</b> intikam işlemi (kayıptan sonra mantıksız işlem), aşırı işlem gibi alışkanlıkları gösterir.","<b>Prop firma takibi:</b> trader'a para veren firmaların kurallarına (günlük kayıp limiti vb.) ne kadar yaklaşıldığını gösterir.","<b>Ücretsiz hesap makineleri</b> (pozisyon büyüklüğü, risk/ödül, prop firma kaybı).","Ücretsiz plan var; Pro plan 3 gün kartsız denenebilir. <b>Pro şu an satın alınamıyor</b>, bu yüzden içerikte fiyat yazılmaz."])
    h+="<h3>Neden içerik üretiyoruz?</h3><p>Şirket reklam vermiyor. Büyüme iki yoldan: <b>Google aramaları</b> (blog yazıları, hesap makineleri, karşılaştırmalar) ve <b>sosyal medyadaki yardımcı içerikler</b>. Amaç satış yapmaya çalışmak değil, trader'a <b>yardım etmek</b>. Merak eden siteyi dener.</p>"
    h+=box("warn","Ne satıyoruz, ne satmıyoruz?","<p>Bir <b>yazılım</b> satıyoruz. \"Şunu al, şunu sat\" demiyoruz, kâr vaat etmiyoruz, fiyat tahmini yapmıyoruz. Yazı ya da videoda geçen her rakam <b>örnek</b> diye işaretlenir (\"$10.000 hesap, %1 risk = $100. Örnektir, tavsiye değildir.\"). Gerçek kullanıcının adı, yüzü, hesabı <b>yazılı izin olmadan</b> gösterilmez.</p>")
    h+="<h3>10 kanalımız</h3>"+T(["Kanal","Adres","Durum"],[["Web sitesi","simpletradejournal.io","Açık"],["Instagram","@simpletradejournal","Açık"],["X","@SimpleTradeJrnl","Açık"],["YouTube","@simpletradejournal","Açılacak (11 Ekim'den sonra)"],["TikTok","(ad 30 Ekim'den sonra düzelecek)","Açık"],["Telegram","t.me/simpletradejournal","Açık"],["Facebook","facebook.com/simpletradejournalapp","Açık"],["LinkedIn","linkedin.com/company/simpletradejournal","Açık"],["Reddit","u/simpletradejournal","Açık"],["Discord","discord.gg/yUJ5NXyJHg","Açık"]])
    h+="<h3>Marka sesi</h3>"+ul(["Sade, doğrudan, yardımcı. Abartı ve \"hype\" yok. Ünlem yığını yok.","Trader'a saygılı: \"sen\" dili.","İlk satırda konu. Kısa cümleler.","Örnek: <i>\"Size the position, not the hope. Risk a fixed % of your account on every trade.\"</i>","Görünüm: koyu zemin, altın vurgu (bir görselde bir kez), Newsreader başlık, Inter metin. Ayrıntı: İçerik Ekibi El Kitabı."])
    return h

GL=[("Fikir kartı","Bir içerik fikrinin kısa yazılı hâli: başlık, nereden geldi, hangi tür, hangi kanallar. Bölüm 12'de şablonu var.","\"R-multiple 30 saniyede\""),
("Fikir havuzu","Henüz yapılmamış fikirlerin durduğu liste (tablo).","—"),
("Brief","Bir içerik başlamadan önce yazılan bir sayfalık iş tarifi: ne, kim için, ana mesaj, yasaklar.","—"),
("Senaryo","Videoda ne söylenecek ve ne gösterilecek: saniye saniye yazı.","0:00 soru, 0:08 açıklama..."),
("Taslak","Henüz onaylanmamış, çalışılan iş.","—"),
("Danışman kontrolü","Bilgi doğru mu, kural ihlali var mı diye bakmak. Sonuç: onay, düzeltme isteği ya da ret.","—"),
("Yönetici onayı","Yayından önceki son onay.","—"),
("Onay raporu","Danışman ve yöneticiye verilen, her içerik için tek sayfalık kontrol raporu.","Bölüm 11"),
("İçerik havuzu","Onaylı, yayına hazır içeriklerin tek yeri (klasör + tablo).","Bölüm 10"),
("Düzeltme turu","Danışmanın düzeltme isteyip senin düzeltmeni.","En çok 2 tur"),
("Yayın kaydı","İçeriğin hangi kanalda ne zaman yayınlandığını gösteren tablo satırı.","—"),
("İkinci göz","Yayından önce başka bir ekip arkadaşının 5 dakikalık bakışı.","Yazım hatası, altyazı, bağlantı"),
("Kanal","Bir yayın yeri (Instagram, X...).","10 kanal"),
("İçerik türü","Şirketin 23 içerik çeşidinden biri.","Tür 3 = kısa ipucu videosu"),
("Karusel","Kaydırmalı çok görselli gönderi.","—"),
("Reels / Shorts","Instagram ve YouTube'un kısa dikey videoları (TikTok da aynı).","—"),
("Thumbnail","Videonun liste üzerindeki küçük resmi.","—"),
("Altyazı","Videoda konuşulanın ekranda yazılı çıkması.","—"),
("CTA","Paylaşımın sonunda izleyiciden istenen şey.","\"Ücretsiz hesap makinesini dene.\""),
("Filigran","Başka uygulamanın videoya koyduğu logo. Yüklenen video filigransız olmalı.","—"),
("Demo / örnek veri","Gerçek olmayan deneme verisi. İçeriklerde hep bunu kullanırız.","—"),
("Search Console","Google'ın sitemize hangi aramalarla geldiğini gösteren ücretsiz aracı. Fikir kaynağıdır.","Yöneticiden gelir")]
def b3():
    h=sec(3,"Sözlük (bilmediğin kelimeler)")
    h+="<p>Bu belgeye özgü kelimeler burada. Trading terimleri için İçerik Ekibi El Kitabı'ndaki sözlüğe bak.</p>"+T(["Kelime","Ne demek?","Örnek"],[[f"<b>{a}</b>",b,c] for a,b,c in GL])
    return h
