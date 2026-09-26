"""Showreel'in Farsça sürümü: src/Reel.tsx → src/ReelFa.tsx.
Farsçada harfler bitişik: harf harf oynatılan yerlerde kelime kelime oynatılır.
Marka adı (SIMPLE TRADING JOURNAL) İngilizce kalır. Çalıştır: python3 scripts/make_reel_fa.py
"""
s = open('src/Reel.tsx').read()
R = [
 ("export function Reel(", "export function ReelFa("),
 ("import { C, mono, sans, serif, signed, money } from './theme';", "import { C, mono, sans, serif, signed, money, faSans, faSerif } from './theme';"),
 ("<div style={{ position: 'absolute', left: 90, top: 80, display: 'flex', alignItems: 'center', gap: 22, fontFamily: sans }}>", "<div style={{ position: 'absolute', right: 90, top: 76, display: 'flex', alignItems: 'center', gap: 22, fontFamily: faSans, direction: 'rtl' }}>"),
 ("fontSize: 28, fontWeight: 600, letterSpacing: '0.24em', color: C.text", "fontSize: 34, fontWeight: 700, letterSpacing: 0, color: C.text"),
 ('<Label n="01" text="OTOMATİK KAYIT"', '<Label n="۰۱" text="ثبت خودکار"'),
 ('<Label n="02" text="DİSİPLİN ANALİZİ"', '<Label n="۰۲" text="تحلیل انضباط"'),
 ('<Label n="03" text="PROP SAYACI"', '<Label n="۰۳" text="شمارنده‌ی پراپ"'),
 ('<Label n="04" text="SEANS & HABER"', '<Label n="۰۴" text="سشن‌ها و اخبار"'),
 ("const word = ['KAYDET', 'ANALİZ ET', 'DÜZELT', 'TEKRARLA'][which];", "const word = ['ثبت کن', 'تحلیل کن', 'اصلاح کن', 'تکرار کن'][which];"),
 ("<div style={{ display: 'flex' }}>\n        {word.split('').map(", "<div style={{ display: 'flex', gap: '0.28em', direction: 'rtl' }}>\n        {word.split(' ').map("),
 ("<div style={{ display: 'flex', position: 'relative' }}>\n          {word.split('').map(", "<div style={{ display: 'flex', position: 'relative', gap: '0.28em', direction: 'rtl' }}>\n          {word.split(' ').map("),
 ("fontFamily: sans, fontWeight: 800, fontSize: 250, letterSpacing: '-0.05em', color: fgs[which]", "fontFamily: faSans, fontWeight: 900, fontSize: 230, letterSpacing: 0, direction: 'rtl', color: fgs[which]"),
 ("<div style={{ position: 'absolute', left: 90, bottom: 80, fontFamily: sans, fontSize: 34,", "<div style={{ position: 'absolute', right: 90, bottom: 80, fontFamily: faSans, direction: 'rtl', fontSize: 36,"),
 ("MetaTrader'dan <span style={{ color: C.gold }}>kendiliğinden.</span>", "از متاتریدر، <span style={{ color: C.gold }}>خودبه‌خود.</span>"),
 ("[[14, 'Hemen geri girme', -1380], [6, 'Riski büyütme', -2240], [29, 'Aşırı işlem', -940]]", "[[14, 'بازگشت فوری', -1380], [6, 'افزایش ریسک', -2240], [29, 'معامله بیش از حد', -940]]"),
 ("<div key={i} style={{ fontFamily: sans, padding: '22px 30px'", "<div key={i} style={{ fontFamily: faSans, direction: 'rtl', padding: '22px 30px'"),
 ("['HEDEFE KALAN', 1000, 640, C.gold], ['BUGÜNKÜ LİMİTE KALAN', 500, 188, C.amber], ['TOPLAM KAYBA KALAN', 1000, 780, C.green]", "['تا هدف', 1000, 640, C.gold], ['تا حد امروز', 500, 188, C.amber], ['تا ضرر کل', 1000, 780, C.green]"),
 ("fontFamily: sans, fontSize: 17, letterSpacing: '0.14em', color: C.faint, marginTop: 8", "fontFamily: faSans, fontSize: 22, letterSpacing: 0, color: C.faint, marginTop: 8"),
 ("transform: `translateX(${(1 - morph) * 80}px)`, fontFamily: sans }}>", "transform: `translateX(${(1 - morph) * -80}px)`, fontFamily: faSans, direction: 'rtl' }}>"),
 ("<span style={{ fontSize: 24, letterSpacing: '0.14em', color: C.faint }}>{label}</span>", "<span style={{ fontSize: 28, letterSpacing: 0, color: C.faint }}>{label}</span>"),
 ("['SYDNEY', 21, 30, '#60a5fa'], ['TOKYO', 0, 9, C.lilac], ['LONDRA', 7, 16, C.gold], ['NEW YORK', 12, 21, C.green]", "['سیدنی', 21, 30, '#60a5fa'], ['توکیو', 0, 9, C.lilac], ['لندن', 7, 16, C.gold], ['نیویورک', 12, 21, C.green]"),
 ("fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: col,", "fontFamily: faSans, fontWeight: 700, fontSize: 28, letterSpacing: 0, color: col,"),
 ("boxShadow: '0 30px 80px rgba(0,0,0,0.6)', fontFamily: sans }}>", "boxShadow: '0 30px 80px rgba(0,0,0,0.6)', fontFamily: faSans, direction: 'rtl' }}>"),
 (">Önemli haber yaklaşıyor</div>", ">خبر مهم نزدیک است</div>"),
 ("</span> NFP · 60 dakika sonra</div>", "</span> NFP · 60 دقیقه دیگر</div>"),
 ("fontFamily: sans, fontWeight: 800, fontSize: 88, letterSpacing: '-0.05em', color: C.text }}>{['KAYDET', 'ANALİZ', 'DÜZELT']", "fontFamily: faSans, fontWeight: 900, fontSize: 88, letterSpacing: 0, color: C.text }}>{['ثبت', 'تحلیل', 'اصلاح']"),
 ("const faces = ['KAYDET', 'ANALİZ ET', 'DÜZELT', 'SINIR', 'STJ', 'HABER', 'SEANS', 'DİSİPLİN', 'TEKRARLA'];", "const faces = ['ثبت کن', 'تحلیل کن', 'اصلاح کن', 'مرز', 'STJ', 'خبر', 'سشن', 'انضباط', 'تکرار کن'];"),
 ("fontFamily: sans, fontWeight: 800, fontSize: gold ? 120 : 60, letterSpacing: '-0.04em'", "fontFamily: gold ? sans : faSans, fontWeight: gold ? 800 : 900, fontSize: gold ? 120 : 64, letterSpacing: gold ? '-0.04em' : 0"),
 ("<span style={{ fontFamily: serif, fontSize: 46, color: C.dim }}>Disiplin, basitlikle.</span>", "<span style={{ fontFamily: faSerif, fontWeight: 600, fontSize: 46, color: C.dim, direction: 'rtl' }}>انضباط، با سادگی.</span>"),
]
miss = [a[:80] for a, b in R if a not in s]
assert not miss, miss
for a, b in R:
    s = s.replace(a, b, 1)
s = "// ÜRETİLMİŞ DOSYA — scripts/make_reel_fa.py. Reel.tsx'i düzenleyip betiği çalıştır.\n" + s
open('src/ReelFa.tsx', 'w').write(s)
print('ReelFa.tsx yazıldı')
