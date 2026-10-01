from kk_lib import *
from kk_2 import SP,CH

def b12():
    br=json.load(open(PK+"/05-brand-rules.json",encoding="utf-8"))
    h=sec(12,"Adım 5: kanala özel metin")
    h+="<p>Sistem her <b>içerik × kanal × dil</b> için ayrı bir yapay zekâ çağrısı yapar. Her çağrı <b>tek bir kanal için tek bir metin</b> yazar. Karar vermez; kararı kural motoru verdi, yapay zekâ yalnızca yazar.</p>"
    h+="<h3>Yapay zekâya ne verilir?</h3>"+ul(["<b>Sistem talimatı</b> (aşağıda): marka kuralları ve ton.","<b>Kanal profili:</b> sınırlar, ton, hashtag sayısı, bağlantı kuralı (<code>channel-specs.json</code> + aşağıdaki tablo).","<b>İçerik özeti:</b> başlık, kısa not, türün adı, yazı ise metin, video ise konuşma-yazısı.","<b>Dil</b> ve varsa <b>bağlantı</b> (canonical_url)."])
    h+="<h3>Sistem talimatı (olduğu gibi kullan)</h3>"+pre('''You write social posts for Simple Trading Journal (simpletradejournal.io): software that
automatically records a trader's trades and shows them their mistakes.
You write ONE post for ONE channel in ONE language, using the content summary and the channel profile.

HARD RULES (any violation = the post is rejected):
1. Never promise profit or results. Never use: guarantee, guaranteed, risk-free, easy money,
   get rich, sure win, passive income, or their equivalents in any language.
2. No trade signals, entries, targets, price predictions, or "buy/sell X". No investment advice.
3. Any number about money or percentages is an EXAMPLE: label it "Example" and end with
   "Example only, not financial advice."
4. No real user names, faces, accounts or screenshots. Never invent testimonials, statistics or quotes.
5. Never attack competitors. State facts only.
6. If the channel profile says links are not clickable, do not write a URL: say "link in bio".
7. Respect the character limit in the profile.
8. Use ONLY facts present in the content summary. If a fact is missing, leave it out.

STYLE: plain, direct, helpful. No hype. Second person ("you"). Short sentences.
The first line states the topic. At most 1-2 emoji, only if the profile allows it.

Return ONLY this JSON (no other text):
{"title": string|null, "body": string, "hashtags": string[], "cta": string|null,
 "notes_for_reviewer": string|null}''')
    h+="<h3>Kanal profilleri (ton ve biçim)</h3>"+T(["Kanal","Ton ve biçim","Uzunluk","Hashtag","Bağlantı"],[
    ["Instagram","Kısa, sıcak. İlk satır dikkat çeker. Sonda \"Save this\" ya da \"link in bio\".","~150-600 karakter","5-8","Tıklanmaz: \"link in bio\""],
    ["X","Tek net cümle ya da thread (ilk tweet kanca, son tweet bağlantı).","≤ 280 (tweet başına)","0-2","Tıklanır"],
    ["YouTube","Başlık anahtar kelimeli; açıklamada site bağlantısı ve bölümler (zaman damgası).","Başlık ≤ 100, açıklama ≤ 5000","3-5 (açıklamada)","Açıklamada"],
    ["TikTok","Çok kısa, enerjik.","≤ 150 karakter","3-5","Yok"],
    ["Telegram","Zengin: kısa paragraflar, bağlantı doğrudan. İstenirse EN + TR (+ FA).","≤ 1024 (medya altı), ≤ 4096 (yazı)","0-3","Tıklanır"],
    ["Facebook","Daha anlatımlı, 2-3 kısa paragraf, bağlantı doğrudan.","~300-800","0-3","Tıklanır"],
    ["LinkedIn","Profesyonel, 3-4 kısa paragraf, sonda soru ya da çağrı.","~600-1500","2-4","Tıklanır"],
    ["Reddit (görev kartı)","Yardım odaklı, reklamsız, soruya doğrudan cevap. İlk haftalar bağlantı yok.","Uzun olabilir","Yok","Yok"],
    ["Discord","Duyuru tonu, kısa, bağlantılı.","≤ 2000","Yok","Tıklanır"]])
    h+="<h3>Çıktı biçimi ve yerleştirme</h3><p>Yapay zekâ <b>yalnızca JSON</b> döndürür (yukarıda). Kod, JSON'u doğrulayıp <code>outputs</code> tablosuna yerleştirir: <code>title</code>, <code>body</code>, <code>hashtags</code>. JSON bozuksa bir kez daha dene; yine bozuksa <code>needs_input</code> yap.</p>"
    h+="<h3>Otomatik kontrol ve yeniden yazdırma</h3>"+ol(["<b>Kodla kontrol (<code>lintText</code>)</b>: yasak kelimeler (aşağıdaki liste), karakter sınırı, tıklanmayan kanalda URL, para/yüzde içeren metinde \"example\" ibaresi. Referans: <code>reference/decide.mjs</code> içinde <code>lintText</code>.","Sorun varsa yapay zekâya <b>sorunları listeleyerek</b> \"şu kurallara uymadın, yeniden yaz\" de. En fazla <b>3 deneme</b>.","Kodu geçen metni <b>ikinci bir yapay zekâ çağrısına</b> ver (\"denetçi\"): <i>\"Does this post make any claim that could be read as a promise of profit, investment advice, or a trade signal? Return JSON {risky: boolean, quote: string|null, why: string|null}.\"</i> <code>risky</code> ise yeniden yazdır.","3 denemede temiz çıkmazsa <code>outputs.status = needs_input</code>; insan müdahale eder. Sorunlar <code>lint_problems</code> alanında saklanır."])
    h+="<h3>Marka kuralları (kod bunları zorlar)</h3>"+T(["Kural","Kontrol"],[[f"<code>{b['id']}</code>: {esc(b['msg'])}",f"<code>{esc(b['pattern'])}</code>"] for b in br["banned_patterns"]]+[["Rakam içeren metinde \"example/örnek\" ibaresi zorunlu","Para ya da yüzde varsa ve \"example, örnek, sample, demo, hypothetical\" yoksa uyarı"],["Karakter sınırı","Kanalın <code>caption_max</code>/<code>text_max</code> değeri"],["Tıklanmayan kanalda URL yasak","Instagram ve TikTok"]])
    h+="<p class='s'>Bu desenler başlangıçtır. Eksiklerini fark edersen <code>05-brand-rules.json</code>'a ekle ve her yeni desen için <code>06-test-cases.json</code>'a bir test yaz.</p>"
    h+="<h3>Diller</h3>"+ul(["<b>Varsayılan dil İngilizce</b>. Şirketin ana sosyal hesapları İngilizcedir.","<b>Türkçe ve Farsça</b> yalnızca Telegram ve Discord için, çalışan \"ek dil\" işaretlerse üretilir.","Ek dilde üretilen her metne <code>native_review</code> eksiği eklenir: <b>o dili ana dili olarak konuşan biri</b> kontrol edip işaretlemeden onaya gitmez. (Şirket bu kontrolü site için de yapıyor; yapay zekâ çevirisi tek başına yayınlanmaz.)","Metnin dili <code>outputs.language</code> alanındadır."])
    h+="<h3>Örnekler (şirketin gerçek içerik takviminden)</h3><p>Aşağıdakiler şirketin ilk haftalar için hazırladığı taslaklar. Sistemin üretmesi beklenen <b>kalite ve ton</b> budur:</p>"
    h+="<div class='ex'><b>X · tür 16 (kısa metin)</b>\nMost blown accounts are not bad setups. They are oversized positions. Fix your risk per trade first, then worry about entries. Free position size calculator: simpletradejournal.io/tools/position-size-calculator</div>"
    h+="<div class='ex'><b>X · tür 16</b>\nR-multiple in one line: profit or loss divided by what you risked. It lets you compare a $50 trade with a $500 one. simpletradejournal.io/blog/r-multiple-explained</div>"
    h+="<div class='ex'><b>X · tür 16</b>\nYour 6th trade of the day is rarely a setup. It is usually the first loss trying to get its money back. Spot it in your journal before it spots your balance: simpletradejournal.io/blog/revenge-trading</div>"
    h+=box("info","Not","<p>Bu örnek metinler yalnızca <b>ton ve kalite referansıdır</b>. Yayınlanmayacak, sistem yeni metin yazacak. Gördüğün gibi: kısa, yardımcı, vaat yok, rakamlar araç örneğinden.</p>")
    h+=box("ok","Bu adım ne zaman \"bitti\" sayılır?","<p>(1) 23 türün her biri için bir deneme içeriği: tüm kanallar için metin üretiliyor. (2) <code>06-test-cases.json</code>'daki 8 metin kontrol testi geçiyor. (3) Sana özellikle bozdurduğun bir istemle (\"bu araçla kazanırsın de\") sistem yasak cümleyi <b>yakalıyor</b> ve yeniden yazdırıyor. (4) Karakter sınırı aşılınca otomatik kısaltıyor. (5) Ek dil metni <code>native_review</code> bekliyor.</p>")
    return h

def b13():
    h=sec(13,"Adım 6: onay")
    h+="<p>Metinler ve varlıklar hazır olunca içerik <b>iki insan kapısından</b> geçer. Bu kapı sistemin güvenlik ağıdır; kaldırılamaz ve atlanamaz.</p>"
    h+="<h3>İki kapı</h3>"+T(["Kapı","Kim","Neye bakar","Yapabileceği"],[["1 · Danışman","Trader danışman","Bilgi doğru mu (rakam, formül, kural)? Yasaklı bir vaat var mı? Örnek rakamlar \"örnek\" diye işaretli mi?","Onayla · Düzeltme iste (yorumla) · Reddet"],["2 · Yönetici","Şirketin sahibi","Marka, ton, zamanlama. Genel \"yayınlamak istiyor muyum?\"","Onayla · Düzeltme iste · Reddet"]])
    h+="<h3>Onay ekranı: tek bakışta karar</h3><p>Bir içeriğin ekranı şuna benzemeli:</p>"
    h+=pre('''İçerik: R-multiple 30 saniyede   (tür 3 · dikey · 45 sn)        Durum: Danışman onayı bekliyor
──────────────────────────────────────────────────────────────────────────────────────────────
Kanal        Karar            Metin (önizleme)                  Kapak/varlık      Zaman     Not
Instagram    GİDER (ana)      "R-multiple in 30 seconds..."     kapak ✔           Sal 18:00  Tür 3: ana kanal
YouTube      GİDER (Shorts)   "R-multiple explained in 30s"      —                 Sal 18:15
TikTok       GİDER (ana)      "R-multiple, fast."                kapak ✔           Sal 18:30
X            GİDER            "Profit or loss ÷ what you..."     video ✔           Sal 18:45
Telegram     GİDER+hazırlık   ...bağlantı bekliyor               —                 —          Video 60 MB > 50 MB
Reddit       —                (tabloda yok)                      —                 —
──────────────────────────────────────────────────────────────────────────────────────────────
[Danışman: Onayla] [Düzeltme iste] [Reddet]        Her satırda ayrı: ☐ gönderme (kanalı çıkar)''')
    h+=ul(["Her satırda <b>kararın nedeni</b> (\"Tür 3: ana kanal\", \"Telegram'da 50 MB sınırı\") görünür.","Metni tıklayınca <b>tam önizleme</b> açılır (kanalın gerçek görünümüne yakın: Instagram kartı, X tweeti).","Sistemin ürettiği kapak/altyazı/dikey sürüm ayrı gösterilir; <b>onaylanmadan geçmez</b>.","Platform platform ya da \"tümünü onayla\" yapılabilir. Danışman ve yönetici ayrı ayrı onaylar."])
    h+="<h3>Kurallar</h3>"+ol(["Bir kanal ancak <b>eksiği olmayan ve kontrolden geçmiş</b> ise onaya gelir.","Danışman onaylamadan yönetici onay ekranı <b>açılmaz</b>.","<b>Metin ya da varlık değişirse tüm onaylar sıfırlanır</b> ve baştan istenir. Onaylanmış bir metnin üstünde sessiz değişiklik yapılamaz.","İçeriği yükleyen kişi <b>kendi içeriğine danışman onayı veremez</b>. (Yönetici hem yükleyip hem onaylayabilir; son kapı odur.)","<b>Düzeltme isteği</b> yorumla gelir, içerik <code>preparing</code>'e döner, çalışan düzeltip tekrar gönderir.","Her onay <code>approvals</code> tablosuna yazılır: kim, ne zaman, hangi aşama, yorum. <b>Silinmez</b>."])
    h+="<h3>Bildirimler (Telegram)</h3>"+T(["Olay","Kime","Mesaj örneği"],[["Danışman onayı bekliyor","Danışman","\"Yeni içerik onayını bekliyor: R-multiple 30 saniyede (6 kanal). [Aç]\""],["Yönetici onayı bekliyor","Yönetici","\"Danışman onayladı: R-multiple 30 saniyede. [Aç]\""],["Düzeltme istendi","Yükleyen","\"Danışman düzeltme istedi: 'rakam örnek diye işaretli değil'. [Aç]\""],["Yayın hatası","Yönetici + yükleyen","\"X'e gönderilemedi: yetki süresi dolmuş. [Aç]\""],["Görev bekliyor","Topluluk yöneticisi","\"Reddit görev kartı hazır: ... [Aç]\""]])
    h+=box("warn","Bildirimde içerik ve gizli bilgi yok","<p>Telegram mesajı yalnızca başlık ve bağlantı taşır. Metnin tamamı, anahtar, e-posta mesaja yazılmaz; ayrıntı için giriş yapılan sayfaya gidilir.</p>")
    h+=box("ok","Bu adım ne zaman \"bitti\" sayılır?","<p>(1) Danışman onaylamadan yönetici onay düğmesi görünmüyor. (2) Onaylanmış bir metni düzeltince onaylar sıfırlanıyor. (3) Yükleyen kişi kendi içeriğine danışman olarak onay veremiyor. (4) Her onay tabloda kayıtlı. (5) Telegram bildirimleri geliyor ve içinde metin yok.</p>")
    return h

def b14():
    h=sec(14,"Adım 7: yayın ve takip")
    h+="<p>İki onay alındıktan sonra her kanalın metni <b>yayın kuyruğuna</b> girer. Yayın katmanı, kanala gönderen küçük parçalardan (<b>adaptör</b>) oluşur.</p>"
    h+=box("warn","Önce deneme modu: DRY_RUN","<p><code>DRY_RUN=true</code> ortam değişkeni <b>varsayılan olarak açıktır</b>. Açıkken adaptörler hiçbir kanala göndermez; göndereceği isteği (kanal, metin, dosya) <code>publish_log</code>'a yazar. Gerçek yayına geçiş yalnızca <b>sahibinin yazılı onayıyla</b> ve kanal kanal olur (Aşama 6).</p>")
    h+="<h3>Adaptör arayüzü</h3><p>Her kanal aynı arayüzü uygular; yayın servisini değiştirmek yalnız adaptörü değiştirmektir:</p>"+pre('''interface Publisher {
  channel: string;                       // "instagram", "x", "telegram", ...
  publish(output: OutputRow, assets: AssetRow[]): Promise<{ externalId: string; url?: string }>;
}
// Hata türleri: AuthExpired (yetki doldu), RateLimited (bekle), Rejected (platform reddetti), Transient (geçici)''',long=False)
    h+="<h3>Kanal kanal nasıl gönderilir?</h3>"+T(["Kanal","Yöntem","Notlar"],[
    ["Instagram, Facebook, X, TikTok, LinkedIn, YouTube","<b>Yayın servisi</b> (planlayıcı API'si). <b>Önerilen: Ayrshare</b> (tek API ile bu kanallara gönderir). Alternatifler: Publer, Buffer, Metricool veya kanalların kendi API'leri.","<b>Aşama 0'da doğrula:</b> hangi kanalı gerçekten destekliyor, plan sınırı, fiyat, video yükleme sınırı. Doğrulamadan <b>satın alma</b>; sahibine rapor ver. Hesapları servise <b>sahibi</b> bağlar (OAuth), sen değil."],
    ["Telegram","<b>Telegram Bot API</b> ile doğrudan: <code>sendMessage</code>, <code>sendPhoto</code>, <code>sendVideo</code>, <code>sendMediaGroup</code> (albüm), <code>sendDocument</code>.","Bot kanalda yönetici olmalı. Bot ile dosya yükleme sınırı <b>~50 MB</b>; büyük video bağlantıyla. Test için kendi test kanalın."],
    ["Discord","<b>Webhook</b>: bir kanalın webhook adresine JSON ya da dosya (multipart) POST.","Dosya sınırı küçük (~10 MB): video bağlantıyla. Test için kendi test sunucun."],
    ["Reddit, Web sitesi","<b>Yayın yok.</b> Görev kartı (Reddit) / iş kartı (site).","Kartta hazır metin, dosya, kopyala düğmesi. İnsan yapar, bitince adresi (<code>tasks.url_after</code>) yazar."]])
    h+="<h3>Kuyruk kuralları</h3>"+ul(["<b>Aralık:</b> aynı içeriğin kanalları arasında <b>15 dakika ± 5 dakika rastgele</b> bırak. Aynı saniyede hepsini göndermek spam gibi görünür ve erişimi düşürebilir.","<b>Yayın penceresi:</b> varsayılan 09:00-21:00 (UTC). Saat dilimi ve pencere sahibine sorulur (Ek A). Pencere dışında onaylananlar sonraki pencerenin başına alınır.","<b>Sıra:</b> zamanı gelen en eski iş önce. Aynı anda en fazla 3 iş işlenir.","<b>İdempotency:</b> her gönderiye <code>idempotency_key = sha256(content_id | channel | language | metin_özeti)</code> ver. Aynı anahtar ikinci kez gönderilmez. Sistem yeniden başlasa ya da iş iki kez tetiklense bile <b>aynı gönderi iki kez çıkmaz</b>.","<b>Orijinal dosya:</b> her kanala orijinal (filigransız) dosya ya da işlenmiş sürüm gider; başka uygulamadan indirilmiş kopya değil.","<b>İptal:</b> yayın zamanı gelmeden \"iptal\" edilebilir; bu <code>skipped</code> olur."])
    h+="<h3>Hata olunca ne yapılır?</h3>"+T(["Hata","Ne yapar","Kime haber"],[["Geçici ağ/sunucu hatası (<code>Transient</code>)","Tekrar dene: 1 dk, 5 dk, 15 dk (en çok 3). Hâlâ olmazsa <code>failed</code>.","Başarısızsa yönetici"],["Hız sınırı (<code>RateLimited</code>)","Platformun söylediği süre kadar bekle, sonra dene.","—"],["Yetki doldu / geçersiz (<code>AuthExpired</code>)","<b>Tekrar deneme.</b> Kanalı <code>failed</code> işaretle; o kanalın tüm bekleyen işlerini durdur.","<b>Hemen yönetici</b> (yeniden bağlaması gerekir)"],["Platform içeriği reddetti (<code>Rejected</code>)","Tekrar deneme. Platformun mesajını <code>error</code>'a yaz.","Yükleyen + yönetici"],["Medya işlenemedi","Dosyayı kontrol et; 1 kez tekrar dene.","Yükleyen"]])
    h+="<p><b>Bir kanalın hatası diğer kanalları durdurmaz.</b> Her kanalın durumu kendi satırında tutulur (<code>outputs.status</code>).</p>"
    h+="<h3>Yayından sonra</h3>"+ul(["Başarılı her gönderinin <b>adresi</b> (<code>external_url</code>) ve platformdaki kimliği (<code>external_id</code>) kaydedilir.","Her olay <code>publish_log</code>'a yazılır: kuyruğa girdi, başladı, tamam, hata, tekrar.","Tüm kanallar sonuçlanınca içerik <code>done</code> olur."])
    h+="<h3>Haftalık rapor</h3><p>Her pazartesi sabahı yöneticiye Telegram'dan özet gider: (1) bu hafta kaç içerik yayınlandı, kanal bazında; (2) hata alanlar; (3) onay süresi (yüklemeden yayına ortalama); (4) elle kalan görevlerden tamamlanmayanlar. İsteyen için örnek sorgu:</p>"+pre('''select channel_id, count(*) filter (where status='published') as yayinlandi,
       count(*) filter (where status='failed') as hata
from outputs where published_at > now() - interval '7 days' group by channel_id order by 2 desc;''')
    h+="<p class='s'>Hangi içeriğin ne kadar iş yaptığını (izlenme, tıklama) platformlardan çekmek <b>bu ilk sürümün parçası değil</b>; yayın servisinin analitik ucu varsa ikinci aşamada eklenir.</p>"
    h+=box("ok","Bu adım ne zaman \"bitti\" sayılır?","<p>(1) <code>DRY_RUN=true</code> iken hiçbir kanala bir şey gitmiyor, günlükte göndereceği istek görünüyor. (2) Telegram test kanalına ve Discord test sunucusuna <b>gerçek</b> gönderim çalışıyor (metin, görsel, albüm, video). (3) Aynı işi iki kez tetikleyince gönderi <b>bir kez</b> çıkıyor. (4) Bir kanalı bilerek bozunca (yanlış token) yalnız o kanal hata veriyor, öteki kanallar yayınlanıyor ve yönetici haberdar oluyor. (5) Reddit için görev kartı üretiliyor.</p>")
    return h
