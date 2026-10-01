# Kurulum paketi dosyalarını üretir (CSV, JSON). Tür ve matris build.py'den: tek kaynak.
import re, json, csv, os
PK="/Users/DonCorleone_1/Desktop/STJ-PDF/Dagitim-Sistemi-Kurulum-Paketi"
src=open("build.py",encoding="utf-8").read()
a=src.index("TYPES=["); b=src.index("\n]\n\nPLAT")+3
TYPES=eval(src[a+6:b])
MX={int(n):s.split() for n,s in re.findall(r'^(\d+):"([^"]+)",\s*$',src,re.M) if len(s.split())==10}
assert len(MX)==23
CH=["web","instagram","x","youtube","tiktok","telegram","facebook","linkedin","reddit","discord"]
MODE={6:"announce",11:"asset",21:"task"}
with open(f"{PK}/03-content-types.csv","w",encoding="utf-8",newline="") as f:
    f.write("type_no;name;group;publish_mode;description;example\n")
    for grp,gname,items in TYPES:
        for no,t,d,e in items:
            f.write(";".join([str(no),t,gname.split(" (")[0],MODE.get(no,"normal"),d.replace(";",",").replace('"',""),e.replace(";",",").replace('"',"")])+"\n")
with open(f"{PK}/04-type-channel-rules.csv","w",encoding="utf-8") as f:
    f.write("type_no,channel,symbol\n")
    for n in range(1,24):
        for c,s in zip(CH,MX[n]): f.write(f"{n},{c},{s}\n")
# kanallar
ch=json.load(open(f"{PK}/channel-specs.json",encoding="utf-8"))["channels"]
ACC={"web":("simpletradejournal.io","Açık"),"instagram":("@simpletradejournal","Açık"),"x":("@SimpleTradeJrnl","Açık"),"youtube":("@simpletradejournal","KAPALI: 11 Ekim 2026'dan sonra açılacak"),"tiktok":("(kullanıcı adı 30 Ekim 2026'dan sonra düzelecek)","Açık"),"telegram":("t.me/simpletradejournal","Açık"),"facebook":("facebook.com/simpletradejournalapp","Açık"),"linkedin":("linkedin.com/company/simpletradejournal","Açık"),"reddit":("u/simpletradejournal","Açık"),"discord":("discord.gg/yUJ5NXyJHg","Açık")}
with open(f"{PK}/02-channels.csv","w",encoding="utf-8") as f:
    f.write("channel,name,address,status,publish_mode,languages\n")
    for c in CH: f.write(f"{c},{ch[c]['name']},{ACC[c][0]},{ACC[c][1]},{ch[c]['mode']},{'|'.join(ch[c]['language'])}\n")
# marka kuralları
brand={
 "_not":"Her metin yayın kuyruğuna girmeden bu kurallardan geçer. Kural çiğnenirse metin yeniden yazdırılır; 3 denemede olmazsa insana işaretlenir.",
 "tone":"Sade, doğrudan, yardımcı. Abartı yok, hype yok, ünlem yığını yok. Trader'a saygılı: 'sen' dili (İngilizce 'you').",
 "banned_patterns":[
  {"id":"profit_promise","pattern":"\\b(guarantee[sd]?|guaranteed|risk[- ]free|sure (win|profit)|get rich|easy money|passive income|100% win)\\b","msg":"Kâr vaadi yasak."},
  {"id":"profit_promise_tr","pattern":"(garanti|kesin kazan|kolay para|zengin ol|risksiz|%100 kazan)","msg":"Kâr vaadi yasak (TR)."},
  {"id":"signal","pattern":"\\b(buy|sell|long|short)\\s+[A-Z]{3,7}(\\/[A-Z]{3})?\\b.{0,40}\\b(at|@|target|tp|sl|stop)\\b","msg":"Alım satım sinyali yasak."},
  {"id":"signal2","pattern":"\\b(entry|giriş)\\s*[:=]?\\s*\\d","msg":"Giriş/hedef fiyatı yazma."},
  {"id":"advice","pattern":"\\b(you should (buy|sell)|i recommend (buying|selling)|al(ın)?|sat(ın)?)\\b.{0,12}\\b(EURUSD|GBPUSD|XAUUSD|BTC|NASDAQ|US30)\\b","msg":"Yatırım tavsiyesi yasak."},
  {"id":"competitor_insult","pattern":"\\b(trash|garbage|scam|rezil)\\b","msg":"Rakibi kötüleme yasak."}
 ],
 "must_label":"Rakam içeren her anlatım 'example / örnek' diye işaretlenir ve 'not advice' ibaresi yer alır. Gerçek kullanıcı adı, yüzü, hesabı yoktur (yazılı izin yoksa).",
 "no_real_user_data":True,
 "required_disclaimer_en":"Example only, not financial advice.",
 "required_disclaimer_tr":"Örnektir, tavsiye değildir.",
 "approval_chain":["advisor","owner"],
 "max_rewrite_attempts":3
}
json.dump(brand,open(f"{PK}/05-brand-rules.json","w",encoding="utf-8"),ensure_ascii=False,indent=2)
# test: tür başına kanonik profil
CANON={1:dict(kind="video",orientation="horizontal",duration_s=600,size_mb=400,burned_subs=True),
2:dict(kind="video",orientation="horizontal",duration_s=300,size_mb=200,burned_subs=True),
3:dict(kind="video",orientation="vertical",duration_s=45,size_mb=30,burned_subs=True),
4:dict(kind="video",orientation="vertical",duration_s=50,size_mb=35,burned_subs=True),
5:dict(kind="video",orientation="horizontal",duration_s=420,size_mb=300,burned_subs=True),
6:dict(kind="text",orientation="none",text_chars=300),
7:dict(kind="image_set",orientation="vertical",count=6),
8:dict(kind="image",orientation="square"),
9:dict(kind="image",orientation="square"),
10:dict(kind="image",orientation="horizontal"),
11:dict(kind="image",orientation="horizontal"),
12:dict(kind="pdf",orientation="none",size_mb=2),
13:dict(kind="text",orientation="none",text_chars=5000),
14:dict(kind="text",orientation="none",text_chars=6000),
15:dict(kind="text",orientation="none",text_chars=4000),
16:dict(kind="text",orientation="none",text_chars=200),
17:dict(kind="text",orientation="none",text_chars=3000),
18:dict(kind="text",orientation="none",text_chars=2500),
19:dict(kind="image",orientation="square"),
20:dict(kind="text",orientation="none",text_chars=120),
21:dict(kind="text",orientation="none",text_chars=300),
22:dict(kind="video",orientation="vertical",duration_s=90,size_mb=60,burned_subs=True),
23:dict(kind="image",orientation="square")}
def exp_class(no,c,sym):
    if sym=="-": return "NO"
    if MODE.get(no)=="asset": return "ASSET"
    if MODE.get(no)=="task": return "TASK"
    if c=="web": return "SITE_TASK"
    if c=="reddit": return "TASK"
    if sym=="↗": return "CONVERT*"
    return None   # SEND / SEND_PREP / NO: biçime göre; matris testinde sınıf (GİDER ailesi) sorulur
tests=[]
for n in range(1,24):
    p=dict(CANON[n]); p["type_no"]=n
    exp={}
    for c,s in zip(CH,MX[n]):
        k=exp_class(n,c,s)
        exp[c]= k if k else "SEND*"   # SEND* = SEND ya da SEND_PREP ya da (biçim uymuyorsa) NO
    tests.append({"id":f"tür-{n:02d}","açıklama":f"Tür {n} için kanonik içerik: kanal sınıfları tablodan","profile":p,"expect_class":exp})
json.dump({"_not":"expect_class: NO / SITE_TASK / TASK / ASSET kesin; CONVERT* = CONVERT ya da (kanal bu biçimi hiç kabul etmiyorsa, örn. YouTube'a PDF) NO; SEND* = SEND ya da SEND_PREP ya da biçime uymuyorsa NO. Her NO'nun nedeni yazılı olmalı. 'cases' bölümü kesin beklenenlerdir.","by_type":tests},open(f"{PK}/06-test-cases.json","w",encoding="utf-8"),ensure_ascii=False,indent=2)

def P(**k): return k
cases=[
 {"id":"K01","açıklama":"45 sn dikey video, altyazılı (tür 3)","profile":P(kind="video",orientation="vertical",duration_s=45,size_mb=30,burned_subs=True,type_no=3),
  "expect":{"web":"NO","instagram":"SEND","x":"SEND","youtube":"SEND","tiktok":"SEND","telegram":"SEND","facebook":"SEND","linkedin":"SEND","reddit":"NO","discord":"SEND_PREP"},
  "expect_transforms":{"discord":["link_post"]}},
 {"id":"K02","açıklama":"Aynı video altyazısız: altyazı eksik istenir","profile":P(kind="video",orientation="vertical",duration_s=45,size_mb=30,burned_subs=False,type_no=3),
  "expect":{"instagram":"SEND","tiktok":"SEND","youtube":"SEND"},"expect_needs":{"instagram":["subtitles"],"tiktok":["subtitles"],"youtube":["subtitles"]}},
 {"id":"K03","açıklama":"12 dk yatay uzun eğitim videosu (tür 1)","profile":P(kind="video",orientation="horizontal",duration_s=720,size_mb=500,burned_subs=True,type_no=1),
  "expect":{"web":"SITE_TASK","instagram":"CONVERT","x":"CONVERT","youtube":"SEND","tiktok":"CONVERT","telegram":"CONVERT","facebook":"CONVERT","linkedin":"CONVERT","reddit":"NO","discord":"CONVERT"},
  "expect_transforms":{"instagram":["cut_clips","crop_vertical","link_in_text"],"telegram":["link_post"]},
  "expect_needs":{"youtube":["thumbnail_1280x720"],"instagram":["canonical_url"]}},
 {"id":"K04","açıklama":"Kısa ipucu (tür 3) ama yatay çekilmiş: dikeye çevrilir","profile":P(kind="video",orientation="horizontal",duration_s=60,size_mb=40,burned_subs=True,type_no=3),
  "expect":{"instagram":"SEND_PREP","tiktok":"SEND_PREP","youtube":"SEND","x":"SEND"},
  "expect_transforms":{"instagram":["crop_vertical"],"tiktok":["crop_vertical"]},"expect_needs":{"youtube":["thumbnail_1280x720"]}},
 {"id":"K05","açıklama":"Dikey ama 200 sn video: Instagram kesit ister, TikTok olur","profile":P(kind="video",orientation="vertical",duration_s=200,size_mb=90,burned_subs=True,type_no=3),
  "expect":{"instagram":"SEND_PREP","tiktok":"SEND","youtube":"SEND"},"expect_transforms":{"instagram":["cut_clips","crop_vertical"]}},
 {"id":"K06","açıklama":"Kısa metin 200 karakter (tür 16)","profile":P(kind="text",orientation="none",text_chars=200,type_no=16),
  "expect":{"x":"SEND","telegram":"SEND","facebook":"SEND","linkedin":"SEND","instagram":"NO","youtube":"NO","tiktok":"NO","discord":"NO","web":"NO","reddit":"NO"}},
 {"id":"K07","açıklama":"Kısa metin ama 400 karakter: X thread olur","profile":P(kind="text",orientation="none",text_chars=400,type_no=16),
  "expect":{"x":"SEND_PREP"},"expect_transforms":{"x":["make_thread"]}},
 {"id":"K08","açıklama":"12 görselli set (tür 7)","profile":P(kind="image_set",orientation="vertical",count=12,type_no=7),
  "expect":{"instagram":"SEND_PREP","linkedin":"SEND_PREP","telegram":"SEND_PREP","x":"SEND_PREP","discord":"SEND_PREP","tiktok":"NO","youtube":"NO"},
  "expect_transforms":{"instagram":["split_set"],"linkedin":["make_pdf_carousel"],"x":["first_four_plus_link"]}},
 {"id":"K09","açıklama":"5000 karakterlik blog yazısı, bağlantısı henüz yok (tür 13)","profile":P(kind="text",orientation="none",text_chars=5000,type_no=13),
  "expect":{"web":"SITE_TASK","instagram":"CONVERT","x":"CONVERT","telegram":"CONVERT","facebook":"CONVERT","discord":"CONVERT","linkedin":"SEND_PREP","reddit":"TASK","youtube":"NO","tiktok":"NO"},
  "expect_transforms":{"instagram":["make_card","link_in_text"],"x":["summary_with_link"],"linkedin":["summary_with_link"]},
  "expect_needs":{"x":["canonical_url"],"linkedin":["canonical_url"]}},
 {"id":"K10","açıklama":"Aynı blog, bağlantı VAR: canonical_url istenmez","profile":P(kind="text",orientation="none",text_chars=5000,type_no=13,has_link=True),
  "expect":{"x":"CONVERT"},"expect_no_needs":{"x":["canonical_url"]}},
 {"id":"K11","açıklama":"Tür belirsiz: hepsi bekler","profile":P(kind="video",orientation="vertical",duration_s=30,size_mb=20),
  "expect":{"instagram":"WAIT","x":"WAIT","reddit":"WAIT","web":"WAIT"}},
 {"id":"K12","açıklama":"Yardım yorumu (tür 21): yayın değil, görev","profile":P(kind="text",orientation="none",text_chars=300,type_no=21),
  "expect":{"instagram":"TASK","x":"TASK","youtube":"TASK","tiktok":"TASK","reddit":"TASK","discord":"TASK","web":"NO","telegram":"NO","facebook":"NO","linkedin":"NO"}},
 {"id":"K13","açıklama":"Kapak/thumbnail (tür 11): yayınlanmaz, varlıktır","profile":P(kind="image",orientation="horizontal",type_no=11),
  "expect":{"web":"ASSET","instagram":"ASSET","youtube":"ASSET","x":"NO","reddit":"NO"}},
 {"id":"K14","açıklama":"Duyuru metni (tür 6)","profile":P(kind="text",orientation="none",text_chars=300,type_no=6),
  "expect":{"instagram":"SEND_PREP","youtube":"NO","x":"CONVERT","telegram":"CONVERT","facebook":"CONVERT","discord":"SEND","web":"NO","linkedin":"CONVERT","tiktok":"NO","reddit":"NO"}},
 {"id":"K15","açıklama":"12 MB PDF şablon (tür 12)","profile":P(kind="pdf",orientation="none",size_mb=12,type_no=12),
  "expect":{"web":"SITE_TASK","telegram":"SEND","discord":"SEND_PREP","linkedin":"SEND","instagram":"CONVERT","x":"CONVERT","youtube":"NO","tiktok":"NO","facebook":"NO","reddit":"NO"},
  "expect_transforms":{"discord":["link_post"],"instagram":["make_card","link_post"]}},
 {"id":"K16","açıklama":"Reels ile aynı 45 sn video ama 60 MB: Telegram sınırı geçilmez, Discord bağlantıyla","profile":P(kind="video",orientation="vertical",duration_s=45,size_mb=60,burned_subs=True,type_no=3),
  "expect":{"telegram":"SEND_PREP","discord":"SEND_PREP"},"expect_transforms":{"telegram":["link_post"]}}
]
lint=[
 {"text":"Guaranteed profits with our journal","channel":"x","expect_rules":["profit_promise"]},
 {"text":"Buy EURUSD at 1.0850 target 1.0950","channel":"x","expect_rules":["signal"]},
 {"text":"A $10,000 account risking 1% risks $100 per trade.","channel":"x","expect_rules":["example_label"]},
 {"text":"Example only: a $10,000 account risking 1% risks $100 per trade. Not financial advice.","channel":"x","expect_rules":[]},
 {"text":"Free calculator: simpletradejournal.io/tools","channel":"instagram","expect_rules":["no_link"]},
 {"text":"x"*300,"channel":"x","expect_rules":["length"]},
 {"text":"Kesin kazanç sağlayan yöntem","channel":"telegram","expect_rules":["profit_promise_tr"]},
 {"text":"Size the position, not the hope. Free calculator: simpletradejournal.io/tools/position-size-calculator","channel":"x","expect_rules":[]}
]
d=json.load(open(f"{PK}/06-test-cases.json",encoding="utf-8")); d["cases"]=cases; d["lint"]=lint
json.dump(d,open(f"{PK}/06-test-cases.json","w",encoding="utf-8"),ensure_ascii=False,indent=2)
print("ok")
