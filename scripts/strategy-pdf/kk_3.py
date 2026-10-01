from kk_lib import *
from kk_2 import SP,CH,rules,types

def fitrow(r):
    k={"video":"video","image":"tek görsel","image_set":"çok görsel","pdf":"PDF","text":"yazı"}[r["kind"]]
    c=[]
    ori={"vertical":"dikey","square":"kare","horizontal":"yatay"}
    if r.get("orientation"): c.append("/".join(ori[o] for o in r["orientation"]))
    if "max_s" in r: c.append(f"≤ {r['max_s']:g} sn")
    if "min_s" in r: c.append(f"> {int(r['min_s'])} sn")
    if "max_mb" in r: c.append(f"≤ {r['max_mb']:g} MB")
    if "min_mb" in r: c.append(f"> {int(r['min_mb'])} MB")
    if "max_chars" in r: c.append(f"≤ {r['max_chars']} karakter")
    if "min_chars" in r: c.append(f"> {r['min_chars']-1} karakter")
    if "count" in r: c.append(f"{r['count'][0]}-{r['count'][1] if r['count'][1]<99 else 'n'} görsel")
    res={"ok":"<span class='pill g'>TAMAM</span>","prep":"<span class='pill y'>HAZIRLIK</span>","no":"<span class='pill r'>OLMAZ</span>"}[r["result"]]
    tr=("<br>"+", ".join(f"<code>{t}</code>" for t in r["transforms"])) if r.get("transforms") else ""
    nt=("<br><span class='s'>"+esc(r.get("note") or r.get("reason") or "")+"</span>") if (r.get("note") or r.get("reason")) else ""
    return [k,", ".join(c) or "her biçim",res+tr+nt]

def b9():
    h=sec(9,"Adım 1-2: içeriği bırak ve tanı")
    h+="<h3>Adım 1: çalışan içeriği bırakır</h3><p>Yönetici sayfasında \"Yeni içerik\" ekranı vardır. Çalışanın doldurduğu alanlar:</p>"
    h+=T(["Alan","Zorunlu mu","Ne yazılır / ne seçilir"],[["Dosya ya da metin","Evet","Video (mp4, mov), görsel (png, jpg, webp; birden çoksa hepsi), PDF ya da yapıştırılan yazı."],["Başlık","Evet","İçeride kullanılan ad. Örnek: \"R-multiple 30 saniyede\"."],["Kısa not","Evet","1-2 cümle: bu içerik ne anlatıyor? Örnek: \"R-multiple'ı tek cümlede açıklayan kısa ipucu.\""],["Tür (23'ten)","Hayır","Biliyorsa seçer. Boş bırakırsa sistem bulur."],["Bağlantı (canonical URL)","Bazen","İçeriğin sitedeki sayfası. Blog yazısı duyurulacaksa şart."],["Gitmesin diye işaretlenecek kanallar","Hayır","Örnek: \"Reddit'e gitmesin\"."],["Ek diller","Hayır","Varsayılan İngilizce. Telegram ve Discord için Türkçe/Farsça eklenebilir (insan kontrolü şart)."],["Yayın zamanı","Hayır","Boşsa onaydan sonra sistem uygun sırayı bulur."]])
    h+="<h4>Yükleme nasıl çalışmalı</h4>"+ul(["Videolar büyüktür (yüzlerce MB). Dosya <b>tarayıcıdan doğrudan depolamaya</b> (Supabase Storage) yüklenir; senin sunucundan geçirme. Büyük dosya için <b>kesintiden devam eden yükleme</b> (resumable / TUS) kullan. Üst sınır: 2 GB.","Yükleme bitince ekranda ilerleme çubuğu, bitince \"analiz ediliyor\" görünür.","Yükleyen kişinin e-postası <code>contents.created_by</code> alanına yazılır."])
    h+="<h3>Adım 2: tanı</h3><p>Sistem içeriği <b>kodla</b> okur ve bir <b>içerik profili</b> çıkarır:</p>"
    h+=pre('''{
  "kind": "video",            // text | image | image_set | pdf | video
  "orientation": "vertical",  // vertical | square | horizontal | none
  "duration_s": 45,
  "size_mb": 30,
  "count": 1,                 // image_set için görsel sayısı
  "text_chars": null,         // text için karakter sayısı
  "has_speech": true,         // konuşma var mı
  "burned_subs": true,        // altyazı görüntüye gömülü mü (true/false/null = bilinmiyor)
  "type_no": 3,               // 23 türden biri (null = belirsiz)
  "has_link": false           // canonical_url girilmiş mi
}''')
    h+=T(["Profil alanı","Nasıl bulunur"],[
    ["kind, size_mb","Dosya uzantısı/MIME ve dosya boyutu."],
    ["orientation","Genişlik ÷ yükseklik: ≤ 0.8 dikey; 0.8-1.25 kare; > 1.25 yatay. (Yazı ve PDF için none.)"],
    ["duration_s, width, height","<code>ffprobe</code> (komut Bölüm 11'de ve <code>ffmpeg-recipes.sh probe</code>)."],
    ["has_speech","Ses seviyesi ölçümü (<code>ffmpeg -i in.mp4 -af volumedetect -f null -</code>, ortalama -50 dB'den yüksekse ses var) ve konuşma-yazı çıktısında en az 5 kelime."],
    ["burned_subs","Videodan 3 kare alıp (ekranın alt üçte biri) yapay zekâya sor: \"burada gömülü altyazı var mı? evet/hayır/emin değilim\". Emin değilse <code>null</code> (sonra insana sorulur)."],
    ["text_chars","Yazının karakter sayısı."],
    ["type_no","İnsan seçtiyse o (<code>type_source=human</code>); seçmediyse yapay zekâ (aşağıda)."]])
    h+="<h4>Türü yapay zekâ nasıl bulur?</h4><p>Yapay zekâya (örneğin Claude'un ucuz ve hızlı modeli) şu bilgileri gönder: profil, kısa not, başlık, yazı ya da videonun konuşma-yazısı, ve <b>23 türün listesi</b> (<code>03-content-types.csv</code>). Cevabı <b>yalnızca JSON</b> olarak iste:</p>"
    h+=pre('''SYSTEM:
You classify content for Simple Trading Journal, a trading-journal software company.
Choose which ONE of the 23 content types best fits the item. The type list is provided.
Rules:
- Use the profile (kind, orientation, duration) and the user's note. Do not invent facts.
- If two types are plausible, pick the likelier and lower your confidence.
- If nothing fits, return type_no = null.
- Never classify something as type 22 (customer case study) unless the note says
  a real user gave written permission.
Return ONLY this JSON:
{"type_no": <1-23 or null>, "confidence": <0..1>, "reason": "<one short sentence>",
 "question_for_human": "<a short question if confidence < 0.75, else null>"}''')
    h+="<ul><li>Güven <b>≥ 0.75</b> ise tür atanır (<code>type_source='ai'</code>), ekranda \"Sistem bunu tür 3 sandı, doğru mu?\" diye gösterilir; çalışan düzeltebilir.</li><li>Güven <b>&lt; 0.75</b> ise içerik <code>needs_input</code> olur; çalışana <code>question_for_human</code> sorulur. <b>Tahminle devam edilmez.</b></li></ul>"
    h+=box("ok","Bu adım ne zaman \"bitti\" sayılır?","<p>(1) Her biçimden bir örnek dosya (dikey video, yatay video, 6 görsel, PDF, 500 karakterlik yazı) yüklenince profil <b>doğru</b> çıkıyor. (2) Tür belirsiz bir içerikte sistem soru soruyor, tahmin yürütmüyor. (3) İnsanın seçtiği tür yapay zekânınkini ezer. Deneme dosyası üretmek için: <code>ffmpeg -f lavfi -i testsrc2=size=1920x1080:rate=30 -f lavfi -i sine=frequency=440 -t 12 -pix_fmt yuv420p test.mp4</code> (12 saniyelik yatay video).</p>")
    return h

def b10():
    h=sec(10,"Adım 3: karar (kural motoru)")
    h+="<p>Bu, sistemin <b>beyni</b>. Girdisi içerik profili, çıktısı her kanal için bir karar. Yapay zekâ <b>kullanılmaz</b>; çünkü bu kesin kurallar işidir ve aynı girdi her zaman aynı sonucu vermelidir. Referans kodu <code>reference/decide.mjs</code> (yaklaşık 110 satır). Kendi dilinde yeniden yazabilirsin; ama <code>06-test-cases.json</code>'daki 47 testi aynı sonuçla geçmelisin.</p>"
    h+="<h3>Sekiz olası karar</h3>"+T(["Karar","Ekranda","Ne demek","Sonra ne olur"],[
    ["SEND","<span class='pill g'>GİDER</span>","İçerik olduğu gibi uygun.","Metin yazılır, onaya gider."],
    ["SEND_PREP","<span class='pill g'>GİDER + hazırlık</span>","Uygun ama önce bir işlem lazım (dikeye çevir, thread'e böl, PDF yap).","Hazırlık yapılır (Bölüm 11), sonra yazılır."],
    ["CONVERT","<span class='pill y'>DÖNÜŞTÜR</span>","Tabloda ↗: bu kanalda içeriğin kendisi değil <b>kesit ya da bağlantılı duyuru</b> paylaşılır.","Kesit/özet üretilir; <b>bağlantı (canonical_url) şart</b>."],
    ["TASK","<span class='pill b'>GÖREV KARTI</span>","Otomatik atılmaz (Reddit) ya da insan yazar (tür 21).","Hazır metinli görev kartı üretilir."],
    ["SITE_TASK","<span class='pill b'>SİTE İŞİ</span>","Web sitesine eklenecek.","Geliştiriciye iş kartı."],
    ["ASSET","<span class='pill y'>VARLIK</span>","Tür 11: yayınlanmaz, saklanır.","Kimseye gönderilmez."],
    ["NO","<span class='pill r'>GİTMEZ</span>","Tabloda yok ya da biçim uymuyor. <b>Nedeni her zaman yazılı.</b>","Atlanır; ekranda neden görünür."],
    ["WAIT","<span class='pill y'>BEKLİYOR</span>","Tür belirsiz.","Çalışana soru sorulur."]])
    h+="<h3>Algoritma (her kanal için, sırayla)</h3>"+ol([
    "<b>Tür belli mi?</b> Değilse tüm kanallar <code>WAIT</code>.",
    "<b>Tablodaki işarete bak</b> (<code>type_channel_rules</code>). Boşsa (<code>-</code>) → <code>NO</code> (\"Tür tablosunda bu kanal yok\"). Kanal kapalıysa (<code>enabled=false</code>) → atla.",
    "<b>Özel türler:</b> tür 11 → <code>ASSET</code>; tür 21 → <code>TASK</code>.",
    "<b>Özel kanallar:</b> web sitesi → <code>SITE_TASK</code>; Reddit → <code>TASK</code>.",
    "<b>İşaret ↗ ise:</b> önce kanal bu biçimi hiç kabul ediyor mu bak (örneğin YouTube'a PDF yüklenmez → <code>NO</code>). Kabul ediyorsa <code>CONVERT</code>; dönüşümleri belirle (video için kesit + dikey; yazı için özet + bağlantı; ...) ve <code>canonical_url</code>'yi eksik olarak işaretle (girilmemişse).",
    "<b>İşaret ● ya da ✓ ise:</b> <code>channel-specs.json</code>'daki o kanalın <code>fit</code> kurallarına <b>yukarıdan aşağı</b> bak; <b>ilk eşleşen</b> kural kazanır: <code>ok</code> → <code>SEND</code>, <code>prep</code> → <code>SEND_PREP</code> (dönüşümlerle), <code>no</code> → <code>NO</code> (nedenle). Eşleşen kural yoksa → <code>NO</code>, \"insana sor\".",
    "<b>Eksik varlıkları hesapla:</b> uzun YouTube videosu için <code>thumbnail_1280x720</code>; altyazısız video için <code>subtitles</code>; bağlantı gerektiren dönüşüm için <code>canonical_url</code>; Instagram/TikTok için isteğe bağlı kapak."])
    h+="<h3>Kanal kanal teknik kurallar</h3><p>Aşağıdaki tablolar <code>channel-specs.json</code>'dan otomatik üretildi. <b>Yukarıdan aşağı okunur, ilk eşleşen kazanır.</b> Bu dosyayı düzenleyen herkes sıraya dikkat etmeli.</p>"
    for c in CH:
        s=SP["channels"][c]
        if "fit" not in s:
            h+=f"<h4>{s['name']}</h4><p class='s'>{esc(s.get('note',''))}</p>"; continue
        h+=f"<h4>{s['name']}</h4>"+T(["İçerik biçimi","Koşul","Sonuç"],[fitrow(r) for r in s["fit"]])
    h+="<h3>Dönüşüm sözlüğü</h3>"+T(["Dönüşüm","Ne yapar"],[[f"<code>{k}</code>",esc(v)] for k,v in SP["transforms"].items()]+[["<code>link_in_text</code>","Metne içeriğin bağlantısını koy (bağlantının tıklanabildiği kanallarda) ya da \"link in bio\" de."]])
    h+="<h3>Gerçek bir çıktı</h3><p>Aşağıdaki iki sonuç referans motoru <b>gerçekten çalıştırılarak</b> alındı.</p>"
    prof=dict(kind="video",orientation="vertical",duration_s=45,size_mb=30,burned_subs=True,type_no=3)
    o=run_engine(prof)
    rows=[[SP["channels"][c]["name"],o[c]["decision"],", ".join(o[c].get("transforms",[])) or "—",", ".join(o[c].get("needs",[])) or "—"] for c in CH]
    h+="<p><b>1) 45 saniyelik dikey video, altyazılı, tür 3 (kısa ipucu)</b></p>"+T(["Kanal","Karar","Dönüşüm","Eksik"],rows)
    prof=dict(kind="video",orientation="horizontal",duration_s=720,size_mb=500,burned_subs=True,type_no=1)
    o=run_engine(prof)
    rows=[[SP["channels"][c]["name"],o[c]["decision"],", ".join(o[c].get("transforms",[])) or "—",", ".join(o[c].get("needs",[])) or "—"] for c in CH]
    h+="<p><b>2) 12 dakikalık yatay video, altyazılı, tür 1 (uzun eğitim videosu), bağlantı henüz yok</b></p>"+T(["Kanal","Karar","Dönüşüm","Eksik"],rows)
    prof=dict(kind="text",orientation="none",text_chars=5000,type_no=13)
    o=run_engine(prof)
    rows=[[SP["channels"][c]["name"],o[c]["decision"],", ".join(o[c].get("transforms",[])) or "—",", ".join(o[c].get("needs",[])) or "—"] for c in CH]
    h+="<p><b>3) 5000 karakterlik blog yazısı, tür 13, bağlantı henüz yok</b></p>"+T(["Kanal","Karar","Dönüşüm","Eksik"],rows)
    h+=box("ok","Bu adım ne zaman \"bitti\" sayılır?","<p><code>node reference/run-tests.mjs</code> (ya da senin motorunun karşılığı) <b>47/47 geçiyor</b>. Ayrıca motor çıktısında her <code>NO</code>'nun <b>nedeni</b> yazılı ve ekranda gösteriliyor.</p>")
    return h

def b11():
    h=sec(11,"Adım 4: eksik varlıklar")
    h+="<p>Karar çıkınca, gidecek her kanal için <b>neyin eksik olduğu</b> belli olur (<code>outputs.needs</code>). Sistem bunu çalışana tek mesajda bildirir. Her eksik için iki yol sunulur: <b>\"Ben yükleyeyim\"</b> ya da <b>\"Sistem üretsin\"</b>.</p>"
    h+=T(["Eksik kodu","Ne demek","Kim ister","Sistem üretirse nasıl"],[
    ["<code>canonical_url</code>","İçeriğin kalıcı adresi.","Bağlantılı duyurular (↗), uzun yazıyı özetleyen paylaşımlar, Telegram/Discord'a büyük dosya","<b>Üretilemez.</b> Çalışan girer (sitedeki sayfa yayına alınınca). Girilene kadar o kanallar <code>needs_input</code> bekler."],
    ["<code>thumbnail_1280x720</code>","YouTube uzun video kapağı, 1280×720, 2 MB altında.","YouTube","Videodan bir kare + marka şablonu üstüne başlık (aşağıda)."],
    ["<code>subtitles</code>","Altyazı.","Instagram, TikTok, YouTube, Facebook, X, LinkedIn videoları","Konuşmayı yazıya çevir → <code>.srt</code> → <b>insan kontrol eder</b> → gömülür ya da ayrı yüklenir."],
    ["<code>cover_optional</code>","Dikey kapak (isteğe bağlı).","Instagram Reels, TikTok","Videodan net bir kare + şablon."],
    ["<code>pdf_cover_card</code>","LinkedIn PDF karusel için kapak kartı.","LinkedIn","Şablonla ilk kart."]])
    h+="<h3>Dönüşümler: nasıl yapılır</h3>"
    h+="<h4>Dikeye çevirme (<code>crop_vertical</code>)</h4><p>Yatay ya da kare videoyu 1080×1920 dikey yapar; arka plan bulanık, asıl video ortada. <b>Denendi</b> (1920×1080 → 1080×1920).</p>"+pre('''ffmpeg -y -i in.mp4 -filter_complex \\
 "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:5[bg];\\
  [0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p[v]" \\
 -map "[v]" -map 0:a? -c:v libx264 -crf 20 -preset medium -c:a aac -movflags +faststart out.mp4''')
    h+="<h4>Kesit (<code>cut_clips</code>)</h4>"+pre("ffmpeg -y -ss BAŞLANGIÇ_SN -t SÜRE_SN -i in.mp4 -c:v libx264 -crf 20 -c:a aac -movflags +faststart kesit.mp4")
    h+="<p><b>Hangi anların kesileceğini yapay zekâ önerir, insan seçer.</b> Akış: (1) videonun konuşması yazıya çevrilir (zaman damgalı); (2) yapay zekâya \"bu konuşmadan 15-60 saniyelik, tek fikirli, başı ve sonu temiz 3 kesit öner; her biri için başlangıç/bitiş saniyesi ve neden yaz\" denir; (3) çalışan ekranda 3 öneriyi önizleyip seçer ya da süreleri düzeltir; (4) sistem kesitleri üretir (ve gerekirse dikeye çevirir). Yapay zekâ <b>kendi başına seçip yayına sokmaz</b>.</p>"
    h+="<h4>Kapak karesi ve thumbnail</h4>"+pre("ffmpeg -y -ss 3 -i in.mp4 -frames:v 1 -vf scale=1280:720 thumb.jpg   # YouTube thumbnail (1280x720)")
    h+="<p>Hangi karenin alınacağı: videonun ilk 10 saniyesinden 5 kare çıkar, yapay zekâya \"yüzü/arayüzü en net olanı seç\" ya da çalışana seçtir. Sonra marka şablonunun üstüne başlık yazılır. Kart üreticisi (<code>brand/card-generator/post.sh</code>) bunu yapar; <b>denendi</b> (1080×1080 kart üretiyor, Chrome gerekir).</p>"
    h+="<h4>Altyazı</h4>"+ol(["Konuşmayı yazıya çevir: bir konuşma-yazı (speech-to-text) servisi kullan (örnek: Whisper tabanlı bir API). Zaman damgalı <code>.srt</code> iste.","<b>İnsan kontrol eder</b> (ekranda metni düzeltir). Trading terimleri sık yanlış çıkar (\"R-multiple\", \"drawdown\", \"prop firm\").","Gömme: <code>ffmpeg -i in.mp4 -vf \"subtitles=alt.srt:force_style='FontSize=18,Outline=2'\" out.mp4</code>"])
    h+=box("warn","Altyazı gömme: bir uyarı","<p>Deneme Mac'indeki ffmpeg sürümünde <code>subtitles</code> filtresi <b>yoktu</b> (<code>libass</code> olmadan derlenmiş). Çözüm: libass'lı ffmpeg kullan (Ubuntu'nun <code>apt install ffmpeg</code> paketi ve GitHub Actions makineleri destekler) ya da altyazıyı bir kurgu programıyla göm. YouTube, Facebook ve LinkedIn <b>ayrı .srt dosyasını</b> da kabul eder; Instagram ve TikTok'ta altyazı <b>videoya gömülü</b> olmalı. Bunu Aşama 4'ün ilk gününde dene.</p>")
    h+="<h4>PDF karusel (<code>make_pdf_carousel</code>)</h4><p>Görselleri sırayla tek PDF'e birleştir. Python Pillow ile (<b>denendi</b>, 3 görsel → 3 sayfa): ilk görseli aç, <code>save('karusel.pdf', save_all=True, append_images=[...])</code>.</p>"
    h+="<h4>Yazıdan kart (<code>make_card</code>)</h4><p>Yazının tek cümlelik özünü marka kart şablonuna yaz (başlık + altın vurgulu kelime + alt metin). Aynı kart üretici kullanılır: <code>post.sh ig|sq|x \"Başlık\" \"Altın vurgu\" \"Alt metin\"</code>. Marka kuralı: <b>altın vurgu bir kartta bir kez</b>.</p>"
    h+="<h3>Sorma mesajı: nasıl görünmeli</h3>"+pre('''İçerik: "R-multiple 30 saniyede" (tür 3, dikey, 45 sn)
Şunlar eksik:
 ☐ Instagram, TikTok: altyazı yok      → [Sistem üretsin] [Ben yükleyeyim]
 ☐ YouTube Shorts: başlık hazır, kapak gerekmiyor
 ☐ Telegram: video 60 MB, sınır 50 MB   → bağlantıyla paylaşılacak. Bağlantı gir: [________]
Hazır olunca "Hazırla" düğmesi etkinleşir.''')
    h+=box("info","Sorma disiplini","<p>Sistem eksik varsa <b>durup sorar, uydurmaz</b>. Otomatik üretilen her şey (altyazı, kırpılmış video, kapak) onay ekranında <b>insan gözüne sunulur</b> (<code>assets.approved</code>). Bir kanalın hazırlığı takılırsa diğer kanallar yoluna devam eder.</p>")
    h+=box("ok","Bu adım ne zaman \"bitti\" sayılır?","<p>(1) Yatay videodan dikey sürüm çıkıyor, 1080×1920. (2) Videodan 3 kesit önerisi geliyor ve insan seçince üretiliyor. (3) YouTube thumbnail 1280×720 ve 2 MB altında çıkıyor. (4) Altyazı üretilip insana gösteriliyor; onay olmadan kullanılmıyor. (5) 6 görsel tek PDF oluyor.</p>")
    return h
