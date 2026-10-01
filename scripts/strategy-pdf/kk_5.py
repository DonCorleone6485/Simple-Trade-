from kk_lib import *
from kk_2 import SP,CH

def b15():
    h=sec(15,"Yönetici sayfası ve yazılım düzeni")
    h+="<h3>Sayfalar (ekranlar)</h3>"+T(["Ekran","Kim kullanır","Ne gösterir / ne yaptırır"],[
    ["Giriş","Herkes","E-posta ile giriş (sihirli bağlantı). <code>app_users</code> listesinde olmayan giremez."],
    ["Yeni içerik","Ekip","Bölüm 9'daki form. Yükleme ilerleme çubuğu."],
    ["İçerik detayı","Ekip, danışman, yönetici","Profil (biçim, yön, süre, tür), kanal kanal karar tablosu <b>nedenleriyle</b>, eksikler, metinler, varlıklar, durum, kayıt."],
    ["Onay kuyruğu","Danışman, yönetici","Kendi onayını bekleyen içerikler. Bölüm 13 ekranı."],
    ["Görev kartları","Topluluk yöneticisi, geliştirici","Reddit paylaşımları, site sayfaları, yardım yorumu fırsatları. Hazır metin, dosya indirme, <b>kopyala düğmesi</b>, \"yaptım\" + adres."],
    ["Takvim","Herkes","Planlanan ve yayınlanan içerikler, kanal bazında."],
    ["Rapor","Yönetici","Haftalık özet, hatalar, bekleyen işler."],
    ["Ayarlar","Yönetici","Kanalları aç/kapat (<code>enabled</code>), kural tablolarını görüntüle, kişi ekle/çıkar. <b>Kural motoru tablolarını düzenlemek</b> (type_channel_rules, channel-specs) yalnız yönetici ve değişiklik günlüklü."]])
    h+="<h3>Önerilen yazılım düzeni</h3><p>Şirketin ana sitesi <b>React 19 + Vite + TypeScript + Tailwind</b> ile yapılmış. Aynı yığını önermemizin nedeni, şirketin sonradan bakımını kolay yapabilmesi. Başka yığın kullanmak istersen <b>yazılı gerekçeyle sahibine</b> sor; her durumda <b>aynı testleri geçmelisin</b>.</p>"
    h+=pre('''stj-publisher/                  (yeni, ayrı bir kod deposu)
  core/     karar motoru (decide), metin kontrolü (lintText), kanal/tür tabloları, testler
  api/      sunucu uç noktaları (serverless): içerik, analiz, karar, metin, onay, yayın
  worker/   video işleme (ffmpeg), altyazı, kesit; kuyruk tüketicisi
  web/      yönetici sayfası (React + Vite + TS + Tailwind)
  supabase/ 01-schema.sql ve tohum dosyaları
  docs/     kullanım ve bakım notu (Bölüm 19)''')
    h+="<h3>Parçalar için öneriler</h3>"+T(["Parça","Öneri","Neden"],[
    ["Veritabanı + depolama + giriş","Supabase (yeni proje): Postgres, Storage, Auth","Şema hazır; büyük dosya yüklemeyi destekler."],
    ["Sunucu uç noktaları","Vercel serverless fonksiyonları ya da benzeri","Kısa, istek-cevap işleri."],
    ["Video işleme (uzun işler)","GitHub Actions işi ya da küçük bir sunucu/çalışan: <code>ffmpeg</code>","Serverless fonksiyonlar ffmpeg'i ve uzun işleri taşımaz. Ubuntu makinelerinde <code>libass</code>'lı ffmpeg var."],
    ["Yapay zekâ","Claude API (metin ve tür tanıma). Tür tanıma gibi hafif işlerde hızlı/ucuz model.","Model adlarını kurulum günü resmi dokümandan kontrol et."],
    ["Konuşma-yazı","Whisper tabanlı bir API (örneğin Groq ya da OpenAI)","Zaman damgalı SRT verir."],
    ["Yayın","Ayrshare (öneri) + Telegram Bot API + Discord webhook","Bölüm 14."],
    ["Bildirim","Telegram botu","Ayrı bir bildirim botu aç; yayın botundan ayır."]])
    h+="<h3>Sunucu uç noktaları (özet)</h3>"+T(["Uç nokta","Ne yapar"],[["<code>POST /api/contents</code>","İçerik kaydı oluşturur, yükleme adresi verir."],["<code>POST /api/contents/:id/analyze</code>","Profili çıkarır, türü bulur."],["<code>POST /api/contents/:id/decide</code>","Kural motorunu çalıştırır, <code>outputs</code> satırlarını yazar."],["<code>POST /api/contents/:id/prepare</code>","Dönüşümleri ve varlıkları üretir, metinleri yazdırır."],["<code>POST /api/outputs/:id/approve</code>","Danışman/yönetici onayı (rol kontrolüyle)."],["<code>POST /api/outputs/:id/request-changes</code>","Düzeltme isteği."],["<code>POST /api/publish/run</code>","Kuyruğu işler (zamanlanmış çağrı)."],["<code>POST /api/tasks/:id/done</code>","Görevi tamamlar."]])
    h+="<p class='s'>Tüm uç noktalar giriş yapmış ve <code>app_users</code>'ta olan kişiyi, rolüne uygun yetkiyle kabul eder. <code>approve</code> ve ayar uç noktaları yalnız ilgili rolü.</p>"
    return h

def b16():
    h=sec(16,"Güvenlik ve gizlilik")
    h+=T(["Konu","Kural"],[
    ["Gizli anahtarlar","API anahtarı, bot token, service-role anahtarı yalnızca <b>ortam değişkenlerinde</b>. Kodda, repoda, günlükte, hata mesajında, Telegram bildiriminde asla. <code>.env</code> dosyaları repoya girmez (<code>.gitignore</code>). Bir anahtar sızarsa hemen sahibe söyle; yenilenir."],
    ["Veritabanı erişimi","Tablolar RLS açık, politika yok. Tarayıcı hiçbir zaman doğrudan tabloya bağlanmaz. Service-role anahtarı yalnız sunucuda."],
    ["Giriş ve roller","Yalnız <code>app_users</code>'taki kişiler. Roller: owner (hepsi), advisor (ilk onay), editor (yükleme). Rol kontrolü sunucuda yapılır, ekranda gizlemek yeterli değildir."],
    ["Onay bütünlüğü","Onay sonrası metin/varlık değişirse onaylar sıfırlanır. Onay kayıtları silinmez."],
    ["Hesap yetkileri (OAuth)","Sosyal hesapları yayın servisine <b>sahibi</b> bağlar. Sen şifre ve doğrulama kodlarını hiç görmezsin. Servis token'ları ortam değişkeninde."],
    ["Deneme/Gerçek ayrımı","<code>DRY_RUN</code> varsayılan açık. Gerçek yayın ancak sahibin yazılı onayıyla, kanal kanal açılır. Test kanalları gerçek hesaplardan ayrıdır."],
    ["Kişisel veri","Gerçek kullanıcıya ait ad, e-posta, hesap, ekran görüntüsü sisteme <b>yüklenmez</b> (yazılı izinli vaka çalışması dışında; o durumda izin belgesinin kaydı içerikle tutulur). Şirketin canlı veritabanına erişim yok."],
    ["Yapay zekâya giden veri","Yapay zekâ servislerine yalnızca içerik ve kanal bilgisi gönderilir. Şifre, anahtar, kişisel veri gönderilmez."],
    ["Günlükler","Her yayın olayı ve her onay kayıtlıdır. Günlüklere anahtar ve token yazılmaz."],
    ["Yedek","Veritabanının otomatik yedeği açık. Depolamadaki orijinal dosyalar silinmez (yalnızca yönetici silebilir)."],
    ["Yasak içerik","Kâr vaadi, sinyal, tavsiye, uydurma yorum ve istatistik, gerçek kullanıcı verisi, rakibi kötüleme: Bölüm 12'deki kod kontrolü ve iki onay kapısı."]])
    h+=box("warn","Bir şey ters giderse","<p>Yanlışlıkla yanlış bir kanala bir şey yayınlandıysa: (1) hemen sahibe haber ver, (2) o kanalın bekleyen işlerini durdur, (3) <code>publish_log</code>'dan ne gittiğini bul, (4) kendi başına silme: gönderiyi silmek için sahibinden yönerge al. Saklama, haber verme, \"belki kimse görmedi\" demek en kötü seçenek.</p>")
    return h

def b17():
    h=sec(17,"Kurulum planı (aşama aşama)")
    h+="<p>Toplam süre tek geliştirici için yaklaşık <b>3-4 hafta</b>. Her aşamanın sonunda <b>\"bitti ölçütü\"</b> var; ölçüt sağlanmadan sonraki aşamaya geçme ve her aşama sonunda sahibe kısa bir <b>demo</b> göster.</p>"
    P=[
    ("0","Hazırlık ve doğrulama","1-2 gün",["Bu belgeyi ve paketi baştan sona oku; takıldığın yerleri yaz.","Yeni (ayrı) bir kod deposu, Supabase projesi, barındırma hesabı kurulumu (sahibiyle netleştir).","<b>Ek B'deki doğrulama listesini</b> uygula: her platformun resmi sayfasından sınırları ve API koşullarını kontrol et; farkları <code>channel-specs.json</code>'a işle.","<b>Yayın servisi seçimi:</b> Ayrshare ve 1-2 alternatifi için kapsam (hangi kanallar), fiyat, sınırlar tablosu çıkar. <b>Satın alma yapma</b>; sahibine rapor ver, onay bekle.","Kendi test hesaplarını aç: Telegram test kanalı + test botu, Discord test sunucusu + webhook.","ffmpeg ve ffprobe kurulu mu kontrol et; <code>subtitles</code> filtresini dene (Bölüm 11 uyarısı)."],"Doğrulama raporu sahibe gitti ve onaylandı; test hesapları hazır."),
    ("1","Veri ve kural motoru","2-3 gün",["<code>01-schema.sql</code>'ı kur, tohum dosyalarını yükle (Bölüm 8). <code>app_users</code>'ı doldur.","Kural motorunu <code>core/</code> içinde yaz (referans kodu örnek al) ve <code>06-test-cases.json</code>'daki <b>47 testi</b> geçir.","Motoru bir uç noktaya bağla: profil ver, karar tablosu al."],"47/47 test geçiyor. Bir profil gönderince 10 kanal için karar ve nedenler dönüyor."),
    ("2","Yönetici sayfası: giriş, yükleme, tanı","3 gün",["Giriş (e-posta bağlantısı + <code>app_users</code> kontrolü).","\"Yeni içerik\" formu; büyük dosya için kesintiden devam eden yükleme.","Analiz: <code>ffprobe</code> ile profil, altyazı ve konuşma tespiti, yapay zekâyla tür tanıma, soru akışı (Bölüm 9).","İçerik detay ekranı: profil + karar tablosu + nedenler."],"Her biçimden örnek dosya doğru profil çıkarıyor; tür belirsizse sistem soruyor."),
    ("3","Metin yazımı ve otomatik kontrol","3-4 gün",["Sistem talimatı ve kanal profilleriyle her <b>içerik × kanal × dil</b> için metin üret.","Kod kontrolü (<code>lintText</code>), yeniden yazdırma döngüsü (en çok 3), ikinci \"denetçi\" çağrısı.","Ek dil (TR/FA) ve <code>native_review</code> kuralı."],"23 tür için deneme metinleri üretiliyor; yasak cümle yakalanıyor; 8 metin testi geçiyor."),
    ("4","Eksik varlıklar ve video işleme","4-5 gün",["Eksik listesi ve \"sen yükle / sistem üretsin\" akışı.","Dikeye çevirme, kesit önerisi + insan seçimi, thumbnail, kapak, altyazı (SRT + insan düzeltme + gömme), kart ve PDF karusel (Bölüm 11).","Uzun işleri çalışan/iş kuyruğuna taşı."],"Bölüm 11'deki 5 ölçüt sağlanıyor."),
    ("5","Onay akışı ve bildirimler","2-3 gün",["İki kapı, roller, sıfırlama kuralı, onay kayıtları (Bölüm 13).","Telegram bildirimleri (içerik/gizli bilgi olmadan).","Görev kartları ekranı (Reddit, site, yardım yorumu)."],"Bölüm 13'teki 5 ölçüt sağlanıyor."),
    ("6","Yayın katmanı","4-5 gün",["Adaptörler: Telegram, Discord (doğrudan), yayın servisi (Ayrshare ya da seçilen).","Kuyruk, aralık, yayın penceresi, tekrar deneme, idempotency, hata yönetimi (Bölüm 14).","<b>DRY_RUN ile</b> bütün kanalları dene. Sonra yalnız <b>test kanallarına</b> gerçek gönderim.","Gerçek hesaplara geçiş: <b>sahibin yazılı onayıyla ve kanal kanal</b>. Öneri sırası: Telegram, Discord, X, LinkedIn, Facebook, Instagram, TikTok (YouTube kanalı açılınca)."],"Bölüm 14'teki 5 ölçüt sağlanıyor; sahibi gerçek bir kanalda ilk onaylı gönderimi gördü."),
    ("7","Rapor, teslim ve eğitim","2-3 gün",["Haftalık rapor, takvim ekranı.","Kabul testleri (Bölüm 18) hepsini çalıştır, rapora yaz.","Kullanım ve bakım notu, 1 saatlik eğitim (Bölüm 19)."],"Bölüm 18 kontrol listesi tam; teslim yapıldı.")]
    for a,t,s,items,ok in P:
        h+=f"<div class='card'><h3>Aşama {a} · {t} <span class='pill b'>{s}</span></h3>{ol(items)}<p><b>Bitti sayılır:</b> {ok}</p></div>"
    h+=box("info","Sahibe sorulacak kararlar","<p>Planın bazı yerleri senin kararın değil, sahibin kararı (yayın servisi seçimi, saat dilimi, ek diller, kimin danışman olduğu...). Bunlar <b>Ek A</b>'da toplandı. Aşama 0'ın sonunda hepsini tek mesajda sor.</p>")
    return h

def b18():
    h=sec(18,"Kabul testleri: bitti nasıl anlaşılır")
    h+="<p>Sistem aşağıdaki maddelerin <b>hepsi</b> sağlanınca teslim edilebilir. Her madde için sonucu (geçti/kaldı) ve ekran görüntüsü ya da günlük kaydını teslim raporuna ekle.</p>"
    A=[("Kural motoru",["<code>run-tests.mjs</code> (ya da senin motorunun karşılığı) 47/47 geçiyor.","Her <code>NO</code> kararının nedeni yazılı ve ekranda görünüyor.","YouTube kapalı (<code>enabled=false</code>) iken hiçbir içerik YouTube'a karar almıyor; açınca alıyor."]),
       ("Tanı",["Dikey video, yatay video, 6 görsel, PDF, 500 karakterlik yazı: hepsi doğru profil.","Tür belirsiz içerikte sistem soruyor (tahmin yürütmüyor).","İnsanın seçtiği tür yapay zekânınkini eziyor."]),
       ("Eksik varlık",["Yatay videodan 1080×1920 dikey sürüm çıkıyor.","Kesit önerisi geliyor, insan seçince üretiliyor.","YouTube thumbnail 1280×720 ve 2 MB altında.","Altyazı insana gösteriliyor, onay olmadan kullanılmıyor.","6 görsel tek PDF karusel oluyor."]),
       ("Metin",["23 türün her birinde kanal metinleri üretiliyor.","\"Bu araçla kazanırsın\" tarzı istem yasak cümle olarak yakalanıp yeniden yazdırılıyor.","Instagram/TikTok metninde URL yok; X metni 280'i aşmıyor.","Ek dil metni <code>native_review</code> bekliyor."]),
       ("Onay",["Danışman onaylamadan yönetici onay düğmesi yok.","Onaylı metni düzeltince onaylar sıfırlanıyor.","Yükleyen kendi içeriğine danışman onayı veremiyor.","Her onay <code>approvals</code>'ta kayıtlı."]),
       ("Yayın",["<code>DRY_RUN=true</code> iken hiçbir kanala gönderim yok; günlükte istek görünüyor.","Telegram test kanalına: metin, görsel, albüm, video gerçek gönderim.","Discord test sunucusuna gerçek gönderim.","Aynı işi iki kez tetikleyince gönderi bir kez çıkıyor.","Yanlış token ile bir kanal hata veriyor; diğerleri yayınlanıyor; yönetici bildirim alıyor.","Reddit için görev kartı üretiliyor; tamamlayınca adres kaydediliyor."]),
       ("Güvenlik",["Tarayıcıdan tabloya doğrudan erişim reddediliyor (RLS).","<code>app_users</code>'ta olmayan e-posta giremiyor.","Repoda, günlükte, bildirimde anahtar yok (taramayla kontrol et).","Şirketin canlı veritabanına hiçbir bağlantı yok."])]
    n=1
    for g,items in A:
        h+=f"<h4>{g}</h4><table>"
        for it in items:
            h+=f"<tr><td style='width:20pt'>☐</td><td style='width:20pt'><b>{n}</b></td><td>{it}</td></tr>"; n+=1
        h+="</table>"
    h+="<h3>Uçtan uca senaryolar (hepsini canlı göster)</h3>"+T(["#","Senaryo","Beklenen"],[
    ["S1","Dikey 45 sn video yükle (tür 3), altyazısız.","Altyazı eksik istenir → üretilir → insan onaylar → danışman → yönetici → DRY_RUN günlüğünde 7 kanal, aralıklı zamanlarla."],
    ["S2","12 dk yatay video yükle (tür 1), bağlantı yok.","YouTube GİDER (thumbnail ister); diğer video kanalları DÖNÜŞTÜR (kesit önerisi); bağlantı girilene kadar bekler."],
    ["S3","500+ karakterlik blog yazısı (tür 13) + bağlantı gir.","Site: iş kartı; X özet+bağlantı, LinkedIn özet, Reddit görev kartı, Instagram yazı kartı."],
    ["S4","6 görselli set (tür 7).","Instagram karusel, LinkedIn tek PDF, X ilk 4+bağlantı, Telegram albüm, Discord bağlantı."],
    ["S5","Bir metne bilerek \"garanti kazanç\" yaz.","Kod yakalar; yeniden yazdırır; olmazsa insana işaretler. Yayına giremez."]])
    return h

def b19():
    h=sec(19,"Teslim")
    h+="<h3>Neleri teslim edeceksin</h3>"+ul(["Kod deposunun tamamı (<code>core, api, worker, web, supabase, docs</code>) ve nasıl çalıştırılacağı (<code>README</code>).","Çalışan, dağıtılmış sistem (deneme modunda, test kanallarıyla).","Kabul test raporu (Bölüm 18; her maddenin sonucu).","<b>Durum tablosu:</b> her kanal için dürüst bilgi: otomatik mi, elle mi, neden; hangi platform onayı ya da izni bekleniyor.","Ortam değişkenleri <b>listesi</b> (adları ve ne işe yaradığı; <b>değerleri değil</b>).","Kullanım ve bakım notu (aşağıda)."])
    h+="<h3>Kullanım ve bakım notu: neler yazılmalı</h3>"+T(["Başlık","İçinde ne olmalı"],[["Günlük kullanım","Çalışan için 1 sayfa: nasıl yüklenir, ne zaman soru gelir, nasıl onaylanır."],["Danışman ve yönetici kılavuzu","Onay ekranı, düzeltme isteği, ne zaman reddedilir."],["Görev kartları","Reddit/site/yardım yorumu: nasıl yapılır, bitince ne yazılır."],["Kural tablolarını değiştirmek","Bir kanalın sınırı ya da bir türün kanal ataması nasıl değişir; <b>değişiklikten sonra testleri çalıştır</b>."],["Yeni kanal / yeni tür ekleme","Hangi tablolara ne eklenir, hangi adaptör yazılır, hangi testler eklenir."],["Kanal açma/kapama","YouTube açılınca <code>enabled=true</code>; TikTok adı değişince ne yapılır."],["Sorun giderme","Bölüm 20'nin kendi sistemine uyarlanmış hâli."],["Anahtar yenileme","Hangi anahtar nerede durur; süresi dolunca (özellikle yayın servisi/OAuth) ne yapılır; kimin yapacağı."],["Maliyet","Aylık hangi servise ne ödeniyor; üst sınır; nereden izlenir."]])
    h+="<h3>Eğitim</h3><p>Teslimde yaklaşık <b>1 saatlik canlı anlatım</b> yap: çalışan, danışman ve yönetici birlikte, S1 ve S3 senaryosunu canlı gösterirsin. Teslimden sonra <b>ilk 2 hafta</b> sorulara cevap ver (kapsamı sahibiyle netleştir).</p>"
    return h

def b20():
    h=sec(20,"Takılırsan")
    Q=[("Sistem türü sürekli \"belirsiz\" çıkarıyor.","İçerik özeti ve not kısa/belirsiz olabilir. Notu uzat (1-2 net cümle); tür listesini yapay zekâya <b>tam metinle</b> ver (csv'den); güven eşiğini (0.75) düşürme, bunun yerine soru akışını iyileştir."),
       ("Platform bir sınırı değiştirmiş, testlerim bozuldu.","<code>channel-specs.json</code>'daki değeri güncelle; <b>ilgili testi de</b> güncelle (06-test-cases.json); sahibine yaz."),
       ("Yayın servisi bir kanalı desteklemiyor ya da çok pahalı.","O kanalı geçici olarak <code>manual_task</code> yap (görev kartı). Alternatif servis ya da kanalın kendi API'si için sahibine rapor ver; bütçeyi sormadan alma."),
       ("Hesabı bağlarken şifre/kod isteniyor.","<b>Sen girme.</b> Hesabın sahibi (yönetici) bağlantıyı kendisi yapar. Sana şifre vermeye çalışırsa kabul etme, bağlantıyı onun yapmasını iste."),
       ("Bir gönderi iki kez çıktı.","İdempotency anahtarını kontrol et; <code>publish_log</code>'a bak. Hemen sahibe haber ver, gönderiyi silmek için yönerge iste."),
       ("YouTube kanalı henüz yok, testi nasıl yaparım?","YouTube <code>enabled=false</code> kalır. Karar testlerinde YouTube'u atlayan senaryoyu da dene; kanal açılınca etkinleştirip yeniden test et."),
       ("Altyazıyı videoya gömemiyorum.","ffmpeg'inde <code>libass</code> yoktur. libass'lı sürüm kur ya da sunucuda Ubuntu'nun ffmpeg paketini kullan. Geçici çözüm: ayrı <code>.srt</code> yükleyen kanallarda ayrı dosya, Instagram/TikTok'ta kurgu programıyla göm."),
       ("Telegram'a video gitmiyor.","Dosya 50 MB'ı geçiyor olabilir. Sistem bunu <code>link_post</code> yapmalıydı (Bölüm 10). Büyük videoyu YouTube/site bağlantısıyla paylaş."),
       ("Yapay zekâ yine de vaat içeren cümle yazıyor.","Yasak desenlere ekle (<code>05-brand-rules.json</code>), testini yaz, talimatı sıkılaştır. <b>Hiçbir durumda</b> kontrolü gevşetme ya da insan onayını kaldırma."),
       ("Danışman/yönetici onayı yavaş, içerikler birikiyor.","Çözüm onayı kaldırmak değil: bildirimi iyileştir, günlük özet gönder, sahibine rapor ver."),
       ("Farsça/Türkçe metinler yapay zekâdan hatalı çıkıyor.","Normal. Bu yüzden ek dil <code>native_review</code> bekler. Hatalı çıkanları not et, talimata ekle."),
       ("Sahibine ulaşamıyorum, karar lazım.","Güvenli tarafta kal: DRY_RUN açık, satın alma yok, yayın yok. İş durur; çalışabildiğin yere devam et (başka bir aşama) ve soruyu yazılı bırak.")]
    h+=T(["Sorun","Ne yap"],[[f"<b>{q}</b>",a] for q,a in Q])
    return h

def bEk():
    h=sec("Ek A-D","Sahibine sorulacaklar, doğrulama listesi, maliyet")
    h+="<h3>Ek A: Sahibine sorulacak kararlar (Aşama 0'ın sonunda tek mesajda)</h3>"+T(["#","Karar","Önerimiz"],[
    ["1","Yayın servisi hangisi, aylık bütçe tavanı ne?","Önce Ayrshare dahil 2-3 servisin kapsam/fiyat raporu; onaydan sonra seç."],
    ["2","Yayın saat dilimi ve penceresi?","Varsayılan 09:00-21:00 UTC; hedef kitleye göre sahibi belirler."],
    ["3","Hangi kanallarda ek dil (TR/FA) olacak, kim kontrol edecek?","Yalnız Telegram ve Discord; kontrolcü adı belirlenmeli."],
    ["4","Danışman kim, bildirimler hangi Telegram grubuna gidecek?","Ayrı \"STJ Yayın\" grubu: danışman + yönetici."],
    ["5","Gerçek yayına hangi kanal önce geçecek?","Telegram → Discord → X → LinkedIn → Facebook → Instagram → TikTok."],
    ["6","YouTube kanalı açılınca (11 Ekim sonrası) kim etkinleştirecek?","Sahibi bildirir, sen <code>enabled=true</code> yaparsın ve test edersin."],
    ["7","TikTok kullanıcı adı (30 Ekim sonrası değişecek) sistemi etkiler mi?","Hayır; yalnız adres alanı güncellenir."],
    ["8","Reddit görev kartlarını kim yapacak?","Topluluk yöneticisi."],
    ["9","Yapay zekâ servisi hesabı ve aylık harcama tavanı?","Sahibi hesabı açar; tavan koyulur."],
    ["10","Barındırma hesapları (Supabase, Vercel/benzeri, GitHub) kimin adına?","Şirket adına; sana erişim verilir."]])
    h+="<h3>Ek B: Doğrulama listesi (Aşama 0'da resmi sayfalardan kontrol et)</h3><p>Aşağıdaki başlıklar için <b>güncel resmi dokümanı</b> aç; sınırları ve koşulları <code>channel-specs.json</code>'a işle ve sahibe rapor ver.</p>"
    h+=T(["Kanal","Neyi doğrula"],[
    ["Instagram","Reels süre üst sınırı; karusel görsel sayısı; hesap tipi (iş/yaratıcı) ve yayın API'sinin koşulları; tıklanamayan bağlantı kuralı."],
    ["Facebook","Sayfa yayın API'si, video/Reels süre ve boyut sınırları."],
    ["YouTube","Shorts süre üst sınırı; <code>videos.insert</code> günlük kota; doğrulanmamış projede yüklemelerin özel kalması; thumbnail koşulları (1280×720, 2 MB)."],
    ["TikTok","İçerik yayın API'sinin denetim (audit) koşulu; onaysız uygulamada yayının özel kalması; süre ve boyut sınırları."],
    ["LinkedIn","Şirket sayfası için yayın izni ve onay süreci; belge (PDF) gönderisi; video süre sınırı."],
    ["X","API ücret planları; video süre sınırı; yayın servisinin X desteği ve maliyeti."],
    ["Telegram","Bot API: dosya sınırı (50 MB); mesaj ve açıklama uzunluk sınırları; <code>core.telegram.org/bots/api</code>."],
    ["Discord","Webhook: dosya boyutu sınırı; mesaj uzunluğu; <code>discord.com/developers/docs/resources/webhook</code>."],
    ["Yayın servisi (örn. Ayrshare)","Desteklediği kanallar; plan ve sınırlar; API ile video yükleme; zamanlama; analitik; fiyat; <code>docs.ayrshare.com</code>."],
    ["Yapay zekâ ve konuşma-yazı","Güncel model adları ve fiyatlar; konuşma-yazı için dosya süre/boyut sınırı."]])
    h+="<h3>Ek C: Tahmini aylık maliyet</h3>"+T(["Kalem","Tahmin","Not"],[["Supabase (yeni proje)","0-25 $","Ücretsiz plan başlangıç için yeterli olabilir; depolama büyüyünce artar."],["Barındırma (serverless)","0-20 $",""],["Yayın servisi","15-50 $","Seçime bağlı; Aşama 0'da netleşir."],["Yapay zekâ (metin + tür tanıma)","5-25 $","Hacme bağlı."],["Konuşma-yazı","0-5 $",""],["Video işleme (GitHub Actions / çalışan)","0-10 $",""],["<b>Toplam</b>","<b>~20-135 $</b>","Fiyatlar tahmini; satın almadan önce güncel sayfadan teyit."]])
    h+="<h3>Ek D: İlk denemeler için örnek içerik listesi</h3><p>Şirketin 1-14 Ekim takviminden alınan gerçek içerikler. Aşama 6'da sistemi bunlarla dene (yayınlamadan; DRY_RUN):</p>"+T(["Gün","İçerik","Tür","Beklenen kanallar"],[["1 Eki","Pozisyon büyüklüğü metni + araç bağlantısı","16","X, Telegram (+ Facebook, LinkedIn)"],["2 Eki","Pozisyon büyüklüğü: 5 kartlık karusel","7","Instagram, LinkedIn (PDF), X, Telegram, Facebook, Discord"],["3 Eki","R-multiple nedir (blog bağlantısı)","13","X, Telegram, LinkedIn, Reddit (görev)"],["5 Eki","Risk/ödül hesap makinesi","19","X, LinkedIn (+ diğerleri)"],["8 Eki","Prop firma günlük kayıp limiti hesabı","19","X, Discord"],["12 Eki","Aşırı işlem (blog)","13","X, LinkedIn, Telegram"],["14 Eki","MT4/MT5 otomatik senkron","2 (video)","X, Telegram, Discord (+ YouTube kanal açılınca)"]])
    h+=box("info","Son söz","<p>Bu belgedeki her şey sistemi <b>güvenli ve kademeli</b> kurman için yazıldı. Takıldığın yerde Bölüm 20'ye bak; hâlâ belirsizse tahmin etme, sahibine yaz. Başarılar.</p>")
    return h

def bSema():
    from kk_diagram import sema
    h=sec("Ek E","Sistem şeması: tek bakışta")
    h+="<p>Sistemin tamamı tek sayfada. Yukarıdan aşağı okunur: içerik içeri alınır, <b>kural motoru</b> hangi kanala gideceğine karar verir, eksikler tamamlanır, metin yazılır, <b>iki insan onaylar</b>, sonra on kanala dağıtılır. Rozetler kimin karar verdiğini gösterir: <b>KOD</b> kesin kural, <b>YZ</b> yapay zekâ, <b>İNSAN</b> insan.</p>"
    h+="<div style='width:86%;margin:4pt auto 0'>"+sema()+"</div>"
    return h
