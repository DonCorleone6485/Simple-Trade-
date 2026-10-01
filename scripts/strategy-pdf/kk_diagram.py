# Sistem şeması (ağaç/akış). Simple Trading Journal içerik dağıtım sistemi.
from html import escape as e
def _lines(x,y,w,h,title,lines,badge=None,fs=9.2):
    s=f'<text x="{x+w/2}" y="{y+19}" text-anchor="middle" font-weight="700" font-size="11.2" fill="#1b2230">{e(title)}</text>'
    for i,l in enumerate(lines):
        s+=f'<text x="{x+w/2}" y="{y+36+i*12.5}" text-anchor="middle" font-size="{fs}" fill="#3a4354">{e(l)}</text>'
    if badge:
        bw=7*len(badge)+12
        s+=f'<rect x="{x+w-bw-6}" y="{y-8}" width="{bw}" height="15" rx="7.5" fill="#1b2230"/><text x="{x+w-bw/2-6}" y="{y+2.6}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#fff">{e(badge)}</text>'
    return s
def box(x,y,w,h,fill,stroke,title,lines,badge=None,dash=False):
    d=' stroke-dasharray="4 3"' if dash else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="1.2"{d}/>'+_lines(x,y,w,h,title,lines,badge)
def arrow(d,dash=False,color="#7a8394"):
    ds=' stroke-dasharray="5 4"' if dash else ''
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="1.4"{ds} marker-end="url(#ah)"/>'
def sema():
    s='<svg viewBox="0 0 720 930" xmlns="http://www.w3.org/2000/svg" font-family="Inter,Helvetica,Arial,sans-serif" style="width:100%;height:auto">'
    s+='<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#7a8394"/></marker></defs>'
    s+='<rect width="720" height="930" fill="#ffffff"/>'
    # etiketler
    def lab(y,t): return f'<text x="12" y="{y}" font-size="9" fill="#8a8f9c" font-weight="600">{e(t)}</text>'
    # Satır A
    s+=lab(24,"AŞAMA 1 – 3 · İÇERİK İÇERİ ALINIR")
    s+=box(14,34,200,76,"#eee9f8","#b9aee0","Aşama 1 · Üretim",["Video, görsel, yazı, PDF","İçerik ekibi hazırlar","(dikey/yatay fark etmez)"],"İNSAN")
    s+=box(260,34,200,76,"#e2eefb","#9bbbe6","Aşama 2 · Tek giriş + havuz",["Yönetici sayfası + veritabanı","Her içerik tek kayıt","Dosya + kısa not"],"KOD")
    s+=box(506,34,200,76,"#e3f4e8","#9fd0ae","Aşama 3 · Tanı",["Biçim, yön, süre okunur","23 türden hangisi? Emin değilse","çalışana sorar"],"KOD + YZ")
    s+=arrow("M214,72 L260,72")+arrow("M460,72 L506,72")
    # Satır B
    s+=lab(142,"AŞAMA 4 · KARAR (YAPAY ZEKÂ DEĞİL, KURAL)")
    s+=box(190,152,340,86,"#fde9e0","#eab29a","Aşama 4 · Kural motoru",["23 tür × 10 kanal tablosu + kanal sınırları","Her kanal için: GİDER · DÖNÜŞTÜR ·","GİTMEZ · GÖREV · SİTE İŞİ (nedeniyle)"],"KOD")
    s+=arrow("M606,110 L606,132 L360,132 L360,152")
    # Satır C
    s+=lab(270,"AŞAMA 5 · HAZIRLIK")
    s+=box(40,280,300,84,"#fff3d6","#ecd08a","Aşama 5a · Eksik varlıklar",["Kapak, thumbnail, altyazı, dikey sürüm,","kesit önerisi (ffmpeg + kart üretici)","\"Sen yükle\" ya da \"sistem üretsin\""],"KOD + İNSAN")
    s+=box(380,280,300,84,"#e2eefb","#9bbbe6","Aşama 5b · Kanala özel metin",["Her kanal için ayrı yazı (ton, uzunluk)","Marka kuralı denetimi: kâr vaadi,","sinyal, \"örnek\" ibaresi"],"YZ + KOD")
    s+=arrow("M300,238 L300,258 L190,258 L190,280")+arrow("M420,238 L420,258 L530,258 L530,280")
    # Satır D
    s+=lab(398,"AŞAMA 6 · İKİ İNSAN KAPISI")
    s+=box(190,408,340,84,"#fbe3e0","#e3a6a0","Aşama 6 · Onay kapısı",["① Trader danışman  →  ② Yönetici","Onaysız yayın YOK","Metin değişirse onaylar sıfırlanır"],"İNSAN")
    s+=arrow("M190,364 L190,386 L300,386 L300,408")+arrow("M530,364 L530,386 L420,386 L420,408")
    # Satır E
    s+=lab(526,"AŞAMA 7 · YAYIN")
    s+=box(190,536,340,76,"#f0f0f0","#c4c4c4","Aşama 7 · Yayın kuyruğu",["Kanallar arası 15 dk, hata olunca tekrar deneme","Her gönderi yalnız bir kez · deneme modu açık başlar"],"KOD")
    s+=arrow("M360,492 L360,536")
    # Kanal grid
    s+=lab(619,"AŞAMA 8 · ON KANALA DAĞITIM")
    xs=[10,152,294,436,578]
    def ch(i,row,fill,stroke,name,sub,dash=False):
        x=xs[i]; y=660+row*62
        return box(x,y,132,50,fill,stroke,name,[sub],None,dash).replace('y="%s"'%(y+19),'y="%s"'%(y+20))
    G=("#e3f4e8","#9fd0ae"); B=("#e2eefb","#9bbbe6"); O=("#fdf0dc","#e3c27a"); P=("#eee9f8","#b9aee0")
    row1=[("Instagram","yayın servisiyle"),("Facebook","yayın servisiyle"),("X","yayın servisiyle"),("LinkedIn","yayın servisiyle"),("TikTok","yayın servisiyle")]
    for i,(n,sb) in enumerate(row1): s+=ch(i,0,*G,n,sb)
    s+=ch(0,1,*G,"YouTube","kanal açılınca (11 Eki+)",True)
    s+=ch(1,1,*B,"Telegram","doğrudan bot")
    s+=ch(2,1,*B,"Discord","doğrudan webhook")
    s+=ch(3,1,*O,"Reddit","görev kartı (insan)")
    s+=ch(4,1,*P,"Web sitesi","iş kartı (geliştirici)")
    for x in (76,218,360,502,644): s+=arrow(f"M360,612 L360,628 L{x},628 L{x},660") if x!=360 else arrow("M360,612 L360,660")
    # Lejant
    ly=792
    items=[("#e3f4e8","#9fd0ae","Otomatik (yayın servisi)"),("#e2eefb","#9bbbe6","Otomatik (doğrudan)"),("#fdf0dc","#e3c27a","Elle: görev kartı"),("#eee9f8","#b9aee0","Sitede: iş kartı")]
    xx=14
    for f,st,t in items:
        s+=f'<rect x="{xx}" y="{ly}" width="14" height="14" rx="3" fill="{f}" stroke="{st}"/><text x="{xx+19}" y="{ly+11}" font-size="9" fill="#3a4354">{e(t)}</text>'
        xx+=168
    s+=f'<text x="14" y="{ly+34}" font-size="9" fill="#3a4354">Rozetler: <tspan font-weight="700">KOD</tspan> = kesin kural · <tspan font-weight="700">YZ</tspan> = yapay zekâ · <tspan font-weight="700">İNSAN</tspan> = insan karar verir/yapar</text>'
    # Rapor
    s+=box(100,850,580,66,"#e3f4e8","#9fd0ae","Aşama 9 · Rapor ve öğrenme",["Haftalık rapor: ne yayınlandı, hangi kanal ne kadar iş yaptı, hangi hata çıktı","Bulgulara göre kural tabloları insan onayıyla güncellenir"],None)
    s+='<rect x="112" y="842" width="82" height="15" rx="7.5" fill="#1b2230"/><text x="153" y="852.6" text-anchor="middle" font-size="7.6" font-weight="700" fill="#fff">KOD + İNSAN</text>'
    s+=arrow("M660,772 L660,850",dash=False)
    s+=arrow("M100,883 L6,883 L6,196 L190,196",dash=True)
    s+='</svg>'
    return s
def sema_html(title="Sistem şeması"):
    return f"<div class='sema'>{sema()}</div>"
