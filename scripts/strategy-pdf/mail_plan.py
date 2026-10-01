# E-posta sistemi ve mail marketing planı (PDF kaynağı)
from kk_lib import *

def cover():
    return """<div class="cover"><div class="brand">Simple Trading Journal</div>
<h1>E-posta sistemi ve<br><em>mail marketing planı</em></h1>
<p>Kullanıcı kaydolduğu andan itibaren ona hangi e-posta, ne zaman, neden gider. Destek mesajlarına bilet numarası. Raporlar, hatırlatmalar, bülten. Neyi şimdi yapabiliriz, neyi şirket kurulunca. Sonda iade konusu.</p>
<div class="foot">1 Ekim 2026 · simpletradejournal.io · Yapay Zekâ Ekibi El Kitabı (Bölüm 12) ile birlikte okunur</div></div>"""

def toc():
    items=[("1","Kısaca"),("2","Bugün ne var?"),("3","Destek bilet sistemi"),("4","Kullanıcı yolculuğu e-postaları"),
    ("5","Raporlar"),("6","Pazarlama e-postaları (şirket kurulunca)"),("7","Kurallar: sıklık, dil, görünüş, abonelikten çıkma"),
    ("8","Yasal çerçeve"),("9","Ölçüm"),("10","Kurulum sırası ve Ali'nin işi"),("11","İade konusu: görüşüm"),("Ek","Örnek e-posta metinleri")]
    return "<h2 class='sec nb' style='page-break-before:avoid;border-top:none'>İçindekiler</h2><table class='toc'>"+"".join(f"<tr><td class='n'>{a}</td><td>{b}</td></tr>" for a,b in items)+"</table>"

def s1():
    h=sec(1,"Kısaca")
    h+="<p>Büyük şirketlerden gelen o \"sürekli mail\"lerin arkasında bir düzen var: her mail <b>bir olaya</b> bağlıdır (kaydoldun, 3 gündür işlem eklemedin, ay bitti). Rastgele gönderilmez. Biz de aynısını kuruyoruz. E-postaları üç türe ayırıyoruz, çünkü kuralları farklı:</p>"
    h+=T(["Tür","Ne","Örnek","Ne zaman"],[
    ["<b>1. Hesap ve destek</b>","Kullanıcının yaptığı bir şeye cevap. Abonelikten çıkılamaz.","Hoş geldin, deneme bitiyor, destek bileti, veri silme onayı","Şimdi (çoğu var)"],
    ["<b>2. Ürün e-postaları</b>","Kullanıcının kendi verisi ve ürünü daha iyi kullanması. Satış yok.","Karşılama serisi, haftalık ve aylık rapor, \"bağlantın koptu\", geri çağırma","Şimdi"],
    ["<b>3. Pazarlama</b>","Bir şey satmak, kampanya, bülten.","Pro lansmanı, kurucu üye kampanyası, haftalık bülten","Şirket kurulunca (açık rıza, şirket adresi ve ödeme gerekiyor)"]])
    h+=box("ok","En önemli fikir","<p>Kazandıran mail \"satın al\" maili değil, kullanıcıyı <b>ilk işlemini eklemeye</b> ve <b>MetaTrader'ı bağlamaya</b> götüren maildir. Bunu yapan kullanıcı kalır; kalan kullanıcı Pro açılınca alır. Bu yüzden ilk iş karşılama serisi ve bilet sistemi.</p>")
    h+="<h3>Ali'nin işi</h3>"+ul(["Her yeni mail şablonunun Türkçesini <b>bir kez</b> okuyup \"tamam\" der. Sonra o mail kendiliğinden gider, bir daha sorulmaz.","Kodun canlıya çıkması için bir kez \"evet\".","Otomatik maillere gelen cevaplar support@'a düşer; onları e-posta asistanı karşılar ve her zamanki gibi \"tamam mı?\" diye sorar."])
    return h

def s2():
    h=sec(2,"Bugün ne var?")
    h+=T(["E-posta","Ne zaman gider","Durum"],[
    ["Hoş geldin","Kayıt anında","✅ 9 dilde"],["Pro denemen yakında bitiyor","Bitişe 36 saatten az kala","✅ 9 dilde"],
    ["Pro denemen bitti, verilerin yerinde","Bittikten sonra","✅ 9 dilde"],["Haftalık özet","Cumartesi, o hafta işlemi olana","✅ 9 dilde"],
    ["İletişim formu","Mesaj support@'a iletilir","✅ ama kullanıcıya \"aldık\" maili gitmiyor, numara yok"],
    ["Abonelikten çıkma","Her mailin altında tek bağlantı","✅ ama tek düğme: hepsini kapatıyor"]])
    h+="<h3>Bilmen gereken teknik sınırlar</h3>"+ul(["Otomatik gönderim <b>günde bir kez</b> çalışıyor (09:00 UTC, Türkiye'de 12:00). \"Kayıttan 1 gün sonra\" demek, ertesi gün 12:00 civarı demek. Bilet otomatik cevabı ise beklemeden, anında gider.",
    "Sunucu fonksiyon sınırı dolu (12/12). Yeni mailler mevcut e-posta dosyasının içine eklenir, yeni fonksiyon açılmaz.",
    "Gönderim servisi Resend. Planımızın günlük ve aylık sınırı kontrol edilecek; ücretsiz planda sınır düşüktür (yazıldığı tarihte günde 100, ayda 3.000). Kullanıcı sayısı birkaç yüzü geçince ücretli plana geçiş Ali'ye sorulur.",
    "Gönderen adres hello@updates.simpletradejournal.io, \"yanıtla\" support@'a gider. SPF, DKIM, DMARC kurulu."])
    return h

def s3():
    h=sec(3,"Destek bilet sistemi")
    h+="<p>Kullanıcı bize yazdığında, büyük sitelerde olduğu gibi <b>hemen</b> bir mail alır: \"Mesajını aldık, bilet numaran STJ-1042, şu kadar sürede döneceğiz.\" Bu, kullanıcının \"mesajım kayboldu mu?\" endişesini bitirir ve her konuşmayı tek numarada toplar.</p>"
    h+="<h3>Nasıl çalışır?</h3>"
    h+="<div class='flow'><div class='st'><b>1</b>Kullanıcı formu doldurur ya da support@'a yazar</div><div class='ar'>→</div><div class='st'><b>2</b>Bilet açılır: STJ-1042, konu türü</div><div class='ar'>→</div><div class='st'><b>3</b>Anında otomatik cevap, kendi dilinde</div><div class='ar'>→</div><div class='st'><b>4</b>E-posta asistanı cevabı hazırlar, Ali \"tamam\" der</div><div class='ar'>→</div><div class='st'><b>5</b>Cevap aynı numarayla gider, bilet kapanır</div></div>"
    h+="<h3>Konu türleri ve söz verdiğimiz süre</h3><p>Formda kullanıcı konuyu seçer. Doğrudan support@'a yazana konuyu e-posta asistanı verir.</p>"
    h+=T(["Konu","Otomatik cevapta yazan süre","Not"],[
    ["Bir şey çalışmıyor (hata)","1 iş günü","Kalite Kontrol'e de gider"],["Soru, nasıl yapılır","1 iş günü","Cevaba yardım sayfası linki eklenir"],
    ["Hesap ve veriler (silme, indirme)","1 iş günü içinde cevap, en geç 3 gün içinde tamamlanır","Acil; Ali onaylar"],
    ["Öneri, istek","1 iş günü","Araştırma'ya gider; yol haritası /changelog'da"],["İş birliği, basın","3 iş günü","Karar Ali'de"],
    ["Ödeme ve iade","1 iş günü","Ödeme açılınca eklenir"]])
    h+="<h3>Kurallar</h3>"+ul(["Numara sırayla artar (STJ-1001, STJ-1002 …). Her mailin konu satırında yazar: <code>[STJ-1042] Mesajını aldık</code>. Kullanıcı bu maile cevap yazarsa aynı bilete eklenir.",
    "Durum: <b>Açık</b> → <b>Cevaplandı</b> → <b>Kapandı</b>. Bizim cevabımızdan sonra 5 gün ses gelmezse bilet kapanır. Kapanış maili gönderilmez (gereksiz mail), son cevabımızda \"başka bir şey olursa bu maile cevap ver\" yazar.",
    "Doğrudan support@'a gelen mail için bilet ve otomatik cevabı e-posta asistanı açar (sabah ya da akşam turunda).",
    "Otomatik cevap şablonu Ali'nin bir kez onayladığı sabit bir metindir; her seferinde sorulmaz. Asıl cevap ise her zaman Ali'nin \"tamam\"ından geçer.",
    "Koordinatörün haftalık raporunda: açılan bilet, kapanan bilet, ortalama ilk cevap süresi."])
    return h

def s4():
    h=sec(4,"Kullanıcı yolculuğu e-postaları")
    h+="<p>Her mail bir olaya ve <b>bir koşula</b> bağlıdır. Koşul tutmuyorsa mail gitmez. Örnek: \"İlk işlemini ekle\" maili, kullanıcı zaten işlem eklediyse gitmez. Böylece kimse gereksiz mail almaz.</p>"
    h+="<h3>Bir kullanıcının ilk ayı</h3>"
    h+="<div class='flow'><div class='st'><b>Gün 0</b>Hoş geldin</div><div class='ar'>→</div><div class='st'><b>Gün 1</b>İlk işlemini ekle (işlem yoksa)</div><div class='ar'>→</div><div class='st'><b>Gün 3</b>MetaTrader'ı bağla (bağlı değilse)</div><div class='ar'>→</div><div class='st'><b>Gün 7</b>İlk haftan</div><div class='ar'>→</div><div class='st'><b>Gün 14</b>Bir özelliği tanı</div><div class='ar'>→</div><div class='st'><b>Ayın 1'i</b>Aylık rapor</div></div>"
    h+=T(["E-posta","Ne zaman / hangi koşulda","İçinde ne var","Tür","Durum"],[
    ["Hoş geldin","Kayıt anında","Üç yol: MetaTrader eklentisi, dosya yükleme, elle ekleme","Hesap","✅ var"],
    ["İlk işlemini ekle","Kayıttan 1 gün sonra, <b>hiç işlem yoksa</b>","Tek adım: en kolay yol + 2 dakikalık rehber linki","Ürün","Yeni"],
    ["MetaTrader'ı bağla","Gün 3, <b>bağlı değilse ve dosya da yüklemediyse</b>","İşlemler kendiliğinden gelsin; kurulum rehberi","Ürün","Yeni"],
    ["İlk haftan","Gün 7. İşlemi varsa: \"journal'ını nasıl okursun\". Yoksa: \"takıldığın yer var mı? cevap ver, yardım edelim\"","İki farklı metin","Ürün","Yeni"],
    ["Bir özelliği tanı","Gün 14, aktifse","Disiplin analizi ya da prop takibi (kullandığına göre)","Ürün","Yeni"],
    ["Bağlantın koptu","MetaTrader anahtarı önceden veri gönderip <b>3 iş günüdür</b> göndermiyorsa (hafta sonu sayılmaz)","Neden olabilir (terminal kapalı, eklenti kaldırıldı), nasıl düzelir","Ürün","Yeni"],
    ["Kilitli işlemlerin var","Ücretsiz planda günlük sınır ilk kez dolunca; <b>deneme hiç kullanılmadıysa</b>","İşlemler silinmedi, kilitli. 3 gün kartsız Pro denemesiyle açılır","Ürün","Yeni"],
    ["Pro denemen bitiyor / bitti","Var olan kurallar","Ödeme açılınca \"Pro'ya geç\" düğmesi eklenir","Hesap","✅ var"],
    ["Geri çağırma 1","14 gündür giriş yok ve MetaTrader bağlı değil","Sana işe yarayacak tek bir şey (yeni araç ya da yazı)","Ürün","Sonra"],
    ["Geri çağırma 2","30 gündür giriş yok","Son mail: \"verilerin yerinde, istersen buradan devam\". <b>Sonra durur.</b>","Ürün","Sonra"],
    ["Aylık yenilikler","Ayın 15'i, geçen ay yeni bir şey çıktıysa","Değişiklik günlüğünden 3 madde","Ürün","Sonra"]])
    h+=box("warn","\"Geri çağırma\" ile \"bülten\" farklı şeyler","<p>Prop firmaların neredeyse her gün attığı mailler geri çağırma değil, <b>pazarlama</b> (bülten, kampanya). Kullanıcı kayıtta ya da satın alırken buna izin vermiştir; izin verdiği sürece, hiç alışveriş yapmasa da her gün mail alabilir. Bizde de aynısı olacak: şirket kurulunca pazarlamaya izin veren kullanıcı, siteye hiç girmese de bülteni ve kampanyaları alır, ta ki kendisi çıkana kadar. <b>\"En çok 2\" sınırı yalnız izinsiz gönderilen \"seni özledik\" maillerine konur.</b> Nedenleri: (1) izin yokken satış ya da ısrar içeren mail yasal değil; (2) açmayan kişiye sürekli mail atmak Gmail'in gözünde \"spam gönderen\" yapar, sonra hoş geldin ve bilet mailleri de spam klasörüne düşer. Büyük firmaların yıllardır biriken bir gönderici itibarı var, yeni bir alan adının yok. Bu yüzden pazarlama mailleri ayrı bir alt adresten (örneğin news.simpletradejournal.io) gönderilmeli ki sorun çıkarsa öteki mailleri etkilemesin.</p>")
    h+=box("info","Neden \"MetaTrader bağlıysa geri çağırma yok\"?","<p>Eklentisi bağlı kullanıcının işlemleri zaten kendiliğinden geliyor; siteye girmese de journal'ı dolu ve haftalık özeti alıyor. Ona \"seni özledik\" demek gereksiz olur.</p>")
    return h

def s5():
    h=sec(5,"Raporlar")
    h+="<p>Raporlar en çok açılan maillerdir, çünkü kullanıcının <b>kendi</b> rakamlarını gösterir. Satış içermez.</p>"
    h+=T(["Rapor","Ne zaman","İçinde","Durum"],[
    ["Haftalık özet","Cumartesi, o hafta kapanmış işlemi olana","Haftanın işlemleri, sonuç, en iyi ve en kötü işlem","✅ var"],
    ["Aylık rapor","Ayın 1'i, geçen ay en az 5 işlemi olana","İşlem sayısı, kazanç oranı, ortalama R, en iyi ve en kötü gün, disiplin notu, geçen aya göre değişim; \"bu ay dikkat et\" tek cümle","Yeni"],
    ["Yıllık özet","Ocak başı","Yılın rakamları, en iyi ay, en sık yapılan hata (intikam işlemi, aşırı işlem). Paylaşılabilir bir kart","Sonra (Ocak 2027)"]])
    h+=box("warn","Rapor kuralları","<ul><li>Rakamlar kullanıcının kendi verisi; \"örnek\" değil, uydurma değil.</li><li>Yorum yok, tavsiye yok: \"Şu pariteden uzak dur\" denmez. \"Kayıptan sonraki işlemlerin %70'i zararla kapanmış\" gibi <b>gözlem</b> yazılır.</li><li>İşlemi az olana rapor gitmez (boş rapor kötü görünür).</li></ul>")
    return h

def s6():
    h=sec(6,"Pazarlama e-postaları (şirket kurulunca)")
    h+="<p>Bunlar satış ya da kampanya içerir. Yasal olarak açık rıza, şirket adı ve adresi gerekir (Bölüm 8); bir kısmı ödeme sistemine bağlı. Metinleri önceden hazırlanabilir, gönderim şirket kurulunca başlar.</p>"
    h+=T(["E-posta","Ne","Koşul"],[
    ["Bülten (2 haftada bir)","1 yeni yazı, 1 ipucu, 1 araç ya da yenilik. Kısa.","Kayıtta işaretlenen rıza kutusu (varsayılan boş)"],
    ["Pro lansmanı","Ödeme açıldı: neler var, nasıl geçilir","Rıza + ödeme sistemi"],
    ["Kurucu üye kampanyası","İlk 500 kişiye yıllık özel fiyat (karar bekliyor)","Rıza + ödeme + Ali'nin kararı"],
    ["Yorum isteği","2 hafta aktif kullanana Trustpilot daveti","Şirket + Trustpilot hesabı"],
    ["Davet hatırlatması","Davet kodu sistemi zaten var: \"arkadaşını davet et, ikiniz de kazanın\"","Rıza"],
    ["Ödeme ve fatura","Makbuz, yenileme, ödeme başarısız","Paddle kullanılırsa bunları Paddle kendisi gönderir"]])
    return h

def s7():
    h=sec(7,"Kurallar: sıklık, dil, görünüş, abonelikten çıkma")
    h+="<h3>Sıklık</h3>"+ul(["Bir kullanıcıya <b>günde en çok 1</b>, <b>haftada en çok 2</b> mail (hesap ve destek mailleri hariç).",
    "Aynı gün iki mail düşerse öncelik: hesap ve destek → bağlantın koptu → karşılama serisi → rapor → diğerleri. Düşen mail ertesi güne kayar.",
    "Geri çağırma en çok 2 kez. Cevap yoksa o kişiye bir daha geri çağırma gitmez."])
    h+="<h3>Dil ve ton</h3>"+ul(["Kullanıcının seçtiği dilde (9 dil). Farsça ve Arapça sağdan sola.","\"Sen\" dili, kısa, tek konu. Konu satırı en çok 50 harf ve içeriği söyler (\"Bağlantın koptu, 1 dakikada düzelt\").","Kâr vaadi yok, \"son fırsat\" baskısı yok, ünlem yığını yok."])
    h+="<h3>Görünüş</h3>"+ul(["Mevcut şablon: açık zemin, logo, kısa metin, <b>tek düğme</b>. Telefonda düzgün.","Her mailin düz yazı sürümü de gider (var).","Alt kısımda: neden bu maili aldığı, tercihler bağlantısı, abonelikten çıkma."])
    h+="<h3>Abonelikten çıkma: tek düğme yerine tercihler</h3><p>Bugün tek bağlantı bütün mailleri kapatıyor. Yerine 4 kategori:</p>"
    h+=T(["Kategori","İçinde","Kapatılabilir mi?"],[
    ["Hesap ve destek","Hoş geldin, deneme, bilet, veri silme, güvenlik","Hayır (hizmetin parçası)"],
    ["Raporlar ve uyarılar","Haftalık özet, aylık rapor, bağlantın koptu","Evet"],
    ["İpuçları ve yenilikler","Karşılama serisi, geri çağırma, aylık yenilikler","Evet"],
    ["Pazarlama","Bülten, kampanyalar","Evet; <b>varsayılan kapalı</b>, kullanıcı açar"]])
    h+="<p>Her mailde ayrıca \"tek tıkla abonelikten çık\" başlığı (Gmail ve Yahoo bunu istiyor). Bugün çıkmış olan kullanıcılar yeni sistemde de bütün kapatılabilir kategorilerde kapalı başlar.</p>"
    return h

def s8():
    h=sec(8,"Yasal çerçeve")
    h+="<p>Kısa ve sade; son sözü şirket kurulurken avukat ya da mali müşavir söyler.</p>"
    h+=T(["Tür","Ne gerekir","Durumumuz"],[
    ["Hesap ve destek","Rıza gerekmez; kullanıcının istediği hizmetin parçası.","Şimdi gönderilebilir"],
    ["Ürün e-postaları (satışsız)","Satış içermemeli; her mailde çıkış imkânı.","Şimdi gönderilebilir. İçine \"Pro'yu satın al\" konmaz."],
    ["Pazarlama","Açık rıza (işaretlenmemiş kutu), göndericinin adı ve adresi, kolay çıkış. Türkiye'deki alıcılar için ticari elektronik ileti kuralları ve İleti Yönetim Sistemi (İYS); AB'deki alıcılar için GDPR.","Şirket kurulunca. İYS kaydı gerekip gerekmediği o zaman sorulacak."]])
    h+=box("warn","Şirket kurulana kadar","<p>Kampanya, indirim ya da \"Pro'yu al\" diyen hiçbir mail gitmez. Gizlilik politikası (kişisel verilerin nasıl işlendiği) de şirketle birlikte yayınlanacak; PLAN.md'de \"kesin yapılacak\".</p>")
    return h

def s9():
    h=sec(9,"Ölçüm")
    h+=T(["Ölçü","Ne demek","Hedef"],[
    ["<b>Aktivasyon</b> (en önemlisi)","Kaydolanların kaçı 7 gün içinde ilk işlemini ekledi?","Her ay artmalı"],
    ["MetaTrader bağlama oranı","Kaydolanların kaçı 14 gün içinde eklentiyi bağladı?","Her ay artmalı"],
    ["Tıklama oranı","Maili alanların kaçı düğmeye bastı?","Karşılama serisinde %10 üstü"],
    ["Abonelikten çıkma","Her gönderimde","%0,5 altı"],
    ["Spam şikâyeti","\"Bu spam\" diyenler","%0,1 altı (Gmail %0,3'te cezalandırıyor)"],
    ["Geri dönen mail","Adres yok, kutu dolu","%2 altı"],
    ["Bilet ilk cevap süresi","Bilet açıldıktan bizim ilk cevaba kadar","1 iş günü içinde"]])
    h+="<p class='s'>Açılma oranı güvenilir değil (Apple Mail mailleri otomatik açıyor); karar tıklamaya ve aktivasyona göre verilir. Rakamlar Koordinatörün haftalık raporuna girer.</p>"
    return h

def s10():
    h=sec(10,"Kurulum sırası ve Ali'nin işi")
    h+=box("warn","Şimdi kurulmuyor (Ali'nin kararı, 1 Ekim 2026)","<p>Bu planın hiçbir aşaması şu an kurulmayacak. Plan hazır duruyor; Ali \"başla\" deyince A aşamasından başlanır.</p>")
    h+=T(["Aşama","Ne","Ali ne yapar"],[
    ["<b>A: ilk kurulacak</b>","1) Bilet sistemi + anında otomatik cevap (9 dil)<br>2) 4 kategorili tercihler + tek tıkla çıkış<br>3) Karşılama serisi: gün 1, 3, 7<br>4) \"Bağlantın koptu\" uyarısı","Kod için bir kez \"evet\"; her yeni şablonun Türkçesine bir kez \"tamam\""],
    ["<b>B: A'dan 2-4 hafta sonra</b>","Aylık rapor, \"kilitli işlemlerin var\", gün 14 özelliği tanı, geri çağırma, aylık yenilikler. A'nın rakamlarına bakarak.","Aynı: şablon başına bir \"tamam\""],
    ["<b>C: şirket + ödeme</b>","Rıza kutusu, bülten, Pro lansmanı, kurucu üye kampanyası, yorum isteği, deneme maillerine \"Pro'ya geç\", iade onayı maili","Kampanya kararları"]])
    h+=box("ok","Sonuç: Ali neyle uğraşır, neyle uğraşmaz?","<p><b>Uğraşmaz:</b> otomatik mailler, bilet numaraları, kim ne zaman hangi maili alacak. Hepsi kendiliğinden.<br><b>Uğraşır:</b> her şablona bir kez \"tamam\"; kullanıcı cevap yazınca e-posta asistanının günde en çok iki kez sorduğu \"tamam mı?\" sorusu; kampanya kararları.</p>")
    return h

def s11():
    h=sec(11,"İade konusu: görüşüm")
    h+="<p>İlk incelemede \"iade politikası sitede yok\" denmişti. Doğru, ama şu an bir eksik değil:</p>"
    h+=ul(["<b>Şu an hiçbir şey satılmıyor.</b> Pro satın alınamıyor, kart alınmıyor. Satılmayan bir şeyin iade şartını yazmak kafa karıştırır.",
    "<b>Ödeme açılmadan önce ise şart.</b> Paddle gibi ödeme aracıları başvuruda iade politikasını ister; tüketici yasaları da bunu bekler. PLAN.md'de gizlilik ve kullanım şartlarıyla birlikte \"şirket kurulunca, kesin yapılacak\" diye yazılı."])
    h+=box("warn","Karar verilmedi","<p>Aşağıdakiler yalnız öneri. Ali'nin kararı (1 Ekim 2026): iade kuralları <b>ödeme sistemi kurulurken</b> konuşulacak, şimdi karar verilmeyecek.</p>")
    h+="<h3>Önerim (ödeme kurulurken konuşulacak)</h3>"+T(["Konu","Öneri","Neden"],[
    ["Yıllık plan","İlk ödemeden sonra <b>14 gün içinde, sebep sormadan tam iade</b>","Daha önce konuşulan kural; güven verir, yıllık satışı kolaylaştırır"],
    ["Aylık plan","İade yok; istediği an iptal eder, ödediği ayın sonuna kadar kullanır","Zaten 3 gün kartsız deneyebiliyor; aylık tutar küçük"],
    ["Kötüye kullanım","Aynı kişiye ikinci kez iade yok","Al, kullan, iade et, tekrar al döngüsünü önler"],
    ["Ödeme aracının kuralı","Paddle gibi aracıların kendi alıcı şartları da geçerli; bizim kuralımız onlarınkinden cimri olamaz","Başvuruda kontrol edilir"]])
    h+="<h3>İade nasıl işler?</h3>"+ol(["Kullanıcı yazar → bilet açılır (konu: ödeme ve iade).","E-posta asistanı kuralı kontrol eder, Ali'ye \"14 gün içinde, ilk iade; iade edelim mi?\" diye sorar.","Ali \"tamam\" der. İadeyi ödeme panelinden Ali yapar (para işlemi; yapay zekâ yapmaz).","Kullanıcıya \"iaden yapıldı\" maili gider (şablon, 9 dil)."])
    h+=box("info","Şimdi yapılabilecek","<p>İade, gizlilik ve kullanım şartları metinlerini 9 dilde şimdiden hazırlayıp <b>yayınlamadan</b> bekletmek. Şirket adı ve adresi gelince eklenir, aynı gün yayına çıkar.</p>")
    return h

def ek():
    h=sec("Ek","Örnek e-posta metinleri (Türkçe; 9 dilde yazılır)")
    ex=[("Bilet otomatik cevabı","Konu: [STJ-1042] Mesajını aldık\n\nMerhaba Ayşe,\n\nMesajın bize ulaştı. Bilet numaran: STJ-1042\nKonu: Bir şey çalışmıyor\n\nGenelde 1 iş günü içinde dönüyoruz. Eklemek istediğin bir şey (ekran görüntüsü, hata mesajı) olursa bu maile cevap vermen yeterli; aynı bilete eklenir.\n\nBu arada sık sorulan sorular: simpletradejournal.io/help\n\nSimple Trading Journal"),
    ("Gün 1: İlk işlemini ekle","Konu: İlk işlemini 2 dakikada ekle\n\nMerhaba Ayşe,\n\nJournal'ın hazır ama henüz boş. En kolay yol:\n• MetaTrader kullanıyorsan eklentiyi bağla, işlemler kendiliğinden gelsin.\n• Geçmiş işlemlerin bir dosyadaysa yükle (MT4, MT5, cTrader, TradeLocker, DXtrade, Match-Trader).\n\n[İlk işlemimi ekle]\n\nTakıldığın yer olursa bu maile cevap ver."),
    ("Bağlantın koptu","Konu: MetaTrader bağlantın koptu, 1 dakikada düzelt\n\nMerhaba Ayşe,\n\n\"Hesap 1234\" için eklentiden 3 iş günüdür işlem gelmiyor. Genelde sebebi:\n1) MetaTrader terminali kapalı,\n2) eklenti grafikten kaldırılmış,\n3) \"Algo Trading\" kapalı.\n\n[Kurulum rehberini aç]\n\nİşlem yapmadıysan bu maili görmezden gel."),
    ("Aylık rapor","Konu: Eylül raporun: 42 işlem\n\nMerhaba Ayşe, Eylül'de:\n• 42 işlem, kazanç oranı %48 (Ağustos: %41)\n• Ortalama 0,6R\n• En iyi gün: 12 Eylül. En zor gün: 23 Eylül\n• Gözlem: kayıptan sonraki 1 saat içinde açtığın 9 işlemin 7'si zararla kapanmış.\n\n[Raporun tamamını gör]\n\nRakamlar senin journal'ından. Yatırım tavsiyesi değildir."),
    ("Geri çağırma 2 (son)","Konu: Journal'ın yerinde duruyor\n\nMerhaba Ayşe,\n\nBir süredir uğramadın. Verilerin silinmedi; istediğin zaman kaldığın yerden devam edebilirsin.\n\n[Journal'ımı aç]\n\nBu konuda sana bir daha yazmayacağız.")]
    for t,b in ex: h+=f"<h3>{t}</h3><div class='ex'>{esc(b)}</div>"
    return h

body=cover()+toc()+s1()+s2()+s3()+s4()+s5()+s6()+s7()+s8()+s9()+s10()+s11()+ek()
html=f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>E-posta sistemi ve mail marketing planı</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{body}</body></html>"""
html=html.replace("class='sec'","class='sec nb'")
open("mail_plan.html","w",encoding="utf-8").write(html); print("html",len(html))
