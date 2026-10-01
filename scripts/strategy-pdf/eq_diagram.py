# Ekip el kitabı şemaları: organizasyon ağacı ve aşama akışı
from kk_diagram import box, arrow
from html import escape as e
def _open(h): return f'<svg viewBox="0 0 720 {h}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,Helvetica,Arial,sans-serif" style="width:100%;height:auto"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#7a8394"/></marker></defs><rect width="720" height="{h}" fill="#fff"/>'
def lab(x,y,t,anchor="start"): return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="9" fill="#8a8f9c" font-weight="600">{e(t)}</text>'
def org():
    s=_open(600)
    s+=lab(14,22,"YÖNETİM")
    s+=box(150,32,230,72,"#fde9e0","#eab29a","YÖNETİCİ (sahip)",["Son onay · bütçe · işe alım","Hesap erişimi ve şifreler onda","Her hafta raporları okur"],"KARAR")
    s+=box(430,32,270,72,"#fbe3e0","#e3a6a0","TRADER DANIŞMAN",["Bilgi ve uyum kontrolü (onay raporu)","Şimdilik yönetici, ileride dış danışman","Haftada 3-4 saat"],"KONTROL")
    s+=arrow("M380,68 L430,68",dash=True)
    s+=f'<text x="405" y="60" text-anchor="middle" font-size="7.5" fill="#8a8f9c">gerekirse aynı kişi</text>'
    s+=lab(14,142,"ÜRETİM EKİBİ")
    s+=box(14,152,222,128,"#e2eefb","#9bbbe6","İÇERİK EDİTÖRÜ",["Tam zamanlı","Fikir seçer · brief ve senaryo yazar","Blog, thread, bülten, açıklamalar","Takvimi ve havuzu tutar","Haftalık raporu birleştirir"],"1. İŞE ALIM")
    s+=box(249,152,222,128,"#fff3d6","#ecd08a","VİDEO + GÖRSEL ÜRETİCİSİ",["Tam zamanlı","Çekim, kurgu, altyazı","Karusel, kural kartı, infografik","Kapak ve thumbnail","Marka kitine uygun"],"2. İŞE ALIM")
    s+=box(484,152,222,128,"#e3f4e8","#9fd0ae","TOPLULUK YÖNETİCİSİ",["Yarı zamanlı","Yayın ve takvim","Yorum, Reddit, Discord, story","Fikir kartlarının ana kaynağı","Görev kartlarını yapar"],"3. İŞE ALIM")
    s+=arrow("M265,104 L265,128 L125,128 L125,152")+arrow("M265,104 L265,128 L360,128 L360,152")+arrow("M265,104 L265,128 L595,128 L595,152")
    s+=lab(14,322,"ORTAK NOKTA")
    s+=box(110,332,500,62,"#eee9f8","#b9aee0","İÇERİK HAVUZU",["Onaylanmış, yayına hazır içeriklerin tek yeri","Klasör + tablo (sonra: dağıtım sisteminin yükleme formu)"],None)
    s+=arrow("M125,280 L125,306 L240,306 L240,332")+arrow("M360,280 L360,332")+arrow("M595,280 L595,306 L480,306 L480,332")
    s+=lab(14,432,"YAYIN")
    s+=box(110,442,500,56,"#fdf0dc","#e3c27a","YAYIN: topluluk yöneticisi",["Şimdilik elle; dağıtım sistemi kurulunca sistem yayınlar, elle kalanlar görev kartı olur"],None)
    s+=arrow("M360,394 L360,442")
    s+=box(14,520,300,64,"#e3f4e8","#9fd0ae","10 KANAL",["Web sitesi · Instagram · X · YouTube · TikTok","Telegram · Facebook · LinkedIn · Reddit · Discord"],None)
    s+=arrow("M310,498 L210,498 L210,520")
    s+=box(390,520,316,64,"#f0f0f0","#c4c4c4","GELİŞTİRİCİ (siteye yazı/araç ekler)",["Yazıyı siteye koyar, aracı yapar","Her hafta yenilik notunu editöre verir"],None)
    s+=arrow("M390,552 L314,552",dash=True)
    s+="</svg>"
    return s
def akis():
    s=_open(800)
    stages=[
     ("0","Fikir toplama","Herkes · en çok topluluk yöneticisi","Sürekli","#eee9f8","#b9aee0"),
     ("1","Haftalık fikir toplantısı","Editör yönetir · hepsi katılır","Pazartesi 45 dk","#e2eefb","#9bbbe6"),
     ("2","Brief ve senaryo / taslak","İçerik editörü","Pzt – Salı","#e2eefb","#9bbbe6"),
     ("3","Üretim","Video+görsel üreticisi, editör","Salı – Çarşamba","#fff3d6","#ecd08a"),
     ("4","Kendi kontrolü + ikinci göz","Üreten ve bir ekip arkadaşı","Çarşamba","#eee9f8","#b9aee0"),
     ("5","Danışman kontrolü","Trader danışman (onay raporu)","Çarşamba – Perşembe","#fbe3e0","#e3a6a0"),
     ("6","Yönetici onayı","Yönetici","Perşembe","#fde9e0","#eab29a"),
     ("7","İÇERİK HAVUZUNA KOY","Üreten kişi","Perşembe","#eee9f8","#8f7fd0"),
     ("8","Yayın","Topluluk yöneticisi","Perşembe – Cuma","#fdf0dc","#e3c27a"),
     ("9","Yorum ve topluluk","Topluluk yöneticisi","Sürekli","#e3f4e8","#9fd0ae"),
     ("10","Ölçüm ve haftalık rapor","Herkes yazar, editör birleştirir","Cuma","#e3f4e8","#9fd0ae")]
    # sol sütun 0..5 yukarıdan aşağı, sağ sütun 6..10 aşağıdan yukarı
    W=310;H=92
    pos={}
    for i in range(6): pos[i]=(44,40+i*128)
    for k,i in enumerate(range(6,11)): pos[i]=(380,40+(4-k)*128+128)  # sağda aşağıdan yukarı
    s+=lab(14,22,"BİR İÇERİĞİN YOLCULUĞU · her hafta tekrarlanır")
    for i,(n,t,who,when,f,st) in enumerate(stages):
        x,y=pos[i]
        s+=box(x,y,W,H,f,st,f"Aşama {n} · {t}",[who,when],None)
    # oklar sol sütun aşağı
    for i in range(5):
        x,y=pos[i]; s+=arrow(f"M{x+W/2},{y+H} L{x+W/2},{pos[i+1][1]}")
    # sol 5 -> sağ 6
    x5,y5=pos[5]; x6,y6=pos[6]
    s+=arrow(f"M{x5+W},{y5+H/2} L{x6},{y6+H/2}")
    # sağ sütun yukarı
    for i in range(6,10):
        x,y=pos[i]; s+=arrow(f"M{x+W/2},{y} L{x+W/2},{pos[i+1][1]+H}")
    # 10 -> 0 geri dönüş (kesikli, üstten)
    x10,y10=pos[10]; x0,y0=pos[0]
    s+=arrow(f"M{x10+W/2},{y10} L{x10+W/2},{y10-18} L{x0+W/2+60},{y10-18} L{x0+W/2+60},{y0+H}".replace(f"{y10-18} L{x0+W/2+60},{y0+H}",f"{y10-18} L{x0+W/2+60},{y0+H}"),dash=True)
    s+=f'<text x="400" y="{y10-24}" text-anchor="middle" font-size="8" fill="#8a8f9c">sonuçlar yeni fikirlere dönüşür</text>'
    # düzeltme döngüsü 5 -> 2
    xa,ya=pos[5]; xb,yb=pos[2]
    s+=arrow(f"M{xa},{ya+H/2} L22,{ya+H/2} L22,{yb+H/2} L{xb},{yb+H/2}",dash=True,color="#c0392b")
    s+=f'<text x="11" y="{(ya+yb)/2+H/2}" font-size="8" fill="#c0392b" transform="rotate(-90 11 {(ya+yb)/2+H/2})" text-anchor="middle">düzeltme isteği (en çok 2 tur)</text>'
    # lejant
    leg=[("#eee9f8","#b9aee0","Ortak / herkes"),("#e2eefb","#9bbbe6","İçerik editörü"),("#fff3d6","#ecd08a","Video + görsel üreticisi"),("#e3f4e8","#9fd0ae","Topluluk yöneticisi"),("#fbe3e0","#e3a6a0","Trader danışman"),("#fde9e0","#eab29a","Yönetici")]
    for k,(f,st,t) in enumerate(leg):
        s+=f'<rect x="565" y="{54+k*17}" width="14" height="14" rx="3" fill="{f}" stroke="{st}"/><text x="586" y="{65+k*17}" font-size="9" fill="#3a4354">{e(t)}</text>'
    s+='<text x="565" y="44" font-size="8.5" font-weight="700" fill="#8a8f9c">KİM YAPAR (renk)</text>'
    s+="</svg>"
    return s
