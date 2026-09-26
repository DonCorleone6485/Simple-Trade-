"""Maç Kaseti'nin Farsça (sağdan sola) sürümünü Mac.tsx'ten üretir → src/MacFa.tsx.

Metinler çevrilir, düzen aynalanır, kalem çizimleri aynalanır. Cümlelerde
Farsça rakam; uygulama kartlarında sitedeki gibi Batı rakamı.
Mac.tsx değişince yeniden çalıştır: python3 scripts/make_mac_fa.py
"""
import re
s = open('src/Mac.tsx').read()
R = []
def r(a, b, all=False): R.append((a, b, all))
r("export function Mac(", "export function MacFa(")
r("import { C, mono, sans, serif, signed, money } from './theme';", "import { C, mono, faSans as sans, faSerif as serif, signed, money } from './theme';")
r("{ off: '', rew: '◀◀  GERİ SAR', play: '▶  OYNAT', pause: '❚❚  DURAKLAT', stop: '■  DURDUR' }", "{ off: '', rew: '◀◀  عقب', play: '▶  پخش', pause: '❚❚  مکث', stop: '■  توقف' }")
r("""      <div style={{ position: 'absolute', left: 70, top: 56, fontFamily: mono, fontSize: 28, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)', ...chroma }}>
        HAFTA 38 · MAÇ KASETİ""", """      <div style={{ position: 'absolute', right: 70, top: 50, fontFamily: sans, fontWeight: 600, fontSize: 32, color: 'rgba(255,255,255,0.7)', ...chroma }}>
        هفته 38 · فیلم مسابقه""")
r("<div style={{ position: 'absolute', right: 70, top: 56, fontFamily: mono, fontSize: 28, letterSpacing: '0.1em', color, textAlign: 'right', ...chroma }}>",
  "<div style={{ position: 'absolute', left: 70, top: 52, fontFamily: sans, fontWeight: 600, fontSize: 30, color, textAlign: 'left', ...chroma }}>")
r("<div style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 10 }}>{tc(tapeTime(t), fps)}</div>",
  "<div style={{ fontFamily: mono, fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 10, direction: 'ltr' }}>{tc(tapeTime(t), fps)}</div>")
r("<div style={{ position: 'absolute', left: 70, top: 108, display: 'flex', alignItems: 'center', gap: 12, fontFamily: mono, fontSize: 22, color: 'rgba(255,255,255,0.45)' }}>",
  "<div style={{ position: 'absolute', right: 70, top: 108, display: 'flex', alignItems: 'center', gap: 12, fontFamily: sans, fontSize: 24, color: 'rgba(255,255,255,0.45)' }}>")
r("        İNCELEME", "        بازبینی")
r("<div style={{ position: 'absolute', left: `${progress * 100}%`, top: -7,", "<div style={{ position: 'absolute', right: `${progress * 100}%`, top: -7,")
r("borderRadius: 9, background: C.text, transform: 'translateX(-9px)' }} />", "borderRadius: 9, background: C.text, transform: 'translateX(9px)' }} />")
r("fontFamily: serif, fontStyle: 'italic', fontSize: 54, color: C.text, background: 'rgba(0,0,0,0.55)',", "fontFamily: sans, fontWeight: 500, fontSize: 50, color: C.text, background: 'rgba(0,0,0,0.55)',")
r("position: 'absolute', left: x, top: y, fontFamily: serif, fontStyle: 'italic', fontSize: size, color: C.gold,", "position: 'absolute', right: x, top: y, fontFamily: serif, fontWeight: 600, fontSize: size, color: C.gold,")
r("<div style={{ position: 'absolute', left: 150, top: 190, display: 'flex', gap: 50 }}>", "<div style={{ position: 'absolute', right: 150, top: 190, display: 'flex', gap: 50 }}>")
r(">İŞLEM SONRASI GRAFİK</div>", ">نمودار بعد از معامله</div>")
r("<div style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>\n          <CandleChart candles={C1}", "<div style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', direction: 'ltr' }}>\n          <CandleChart candles={C1}")
r(">17 Eylül · 14:02</div>", ">17 سپتامبر · 14:02</div>")
r(">RİSK</div>", ">ریسک</div>")
r(">SONUÇ</div>", ">نتیجه</div>")
r("lineHeight: 1 }}>−1.7R</div>", "lineHeight: 1, direction: 'ltr', textAlign: 'right' }}>−1.7R</div>")
r(">NOTUN</div>", ">یادداشت تو</div>")
r("fontFamily: serif, fontStyle: 'italic', fontSize: 34, color: 'rgba(255,255,255,0.8)', marginTop: 10, lineHeight: 1.3 }}>\n          “Stopu biraz genişlettim, dönecekti.”",
  "fontFamily: serif, fontSize: 34, color: 'rgba(255,255,255,0.8)', marginTop: 10, lineHeight: 1.5 }}>\n          «حد ضرر را کمی بازتر کردم، برمی‌گشت.»")
r("{['Aşırı özgüvenli', 'Sabırsız'].map(", "{['بیش از حد مطمئن', 'بی‌صبر'].map(")
r("{signed(pnl)}.00</span>", "<span style={{ direction: 'ltr', display: 'inline-block' }}>{signed(pnl)}.00</span></span>")
r("<span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 36, fontWeight: 500, color: pnl >= 0 ? C.green : C.red }}>", "<span style={{ marginInlineStart: 'auto', fontFamily: mono, fontSize: 36, fontWeight: 500, color: pnl >= 0 ? C.green : C.red }}>")
r("<span style={{ fontFamily: mono, fontSize: 30, color: 'rgba(255,255,255,0.45)', width: 120, textAlign: 'right' }}>{R}</span>", "<span style={{ fontFamily: mono, fontSize: 30, color: 'rgba(255,255,255,0.45)', width: 120, textAlign: 'left', direction: 'ltr' }}>{R}</span>")
r("<div style={{ position: 'absolute', left, top, opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>", "<div style={{ position: 'absolute', right: left, top, opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>")
r(">DİSİPLİN · İŞARETLENEN</div>", ">انضباط · علامت‌خورده</div>")
r("<div style={{ fontFamily: mono, fontSize: 64, lineHeight: 1, color: C.amber, width: 84, textAlign: 'right' }}>{count}</div>", "<div style={{ fontFamily: mono, fontSize: 64, lineHeight: 1, color: C.amber, width: 84, textAlign: 'left' }}>{count}</div>")
r("<div style={{ fontFamily: mono, fontSize: 56, color: C.red, textAlign: 'right', letterSpacing: '-0.03em' }}>{signed(pnl)}</div>", "<div style={{ fontFamily: mono, fontSize: 56, color: C.red, textAlign: 'left', letterSpacing: '-0.03em', direction: 'ltr' }}>{signed(pnl)}</div>")
r("<div style={{ position: 'absolute', left: 150, top: 180 }}>", "<div style={{ position: 'absolute', right: 150, top: 180 }}>")
r(">Perşembe, 17 Eylül</div>", ">پنجشنبه، 17 سپتامبر</div>")
r("const heads = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];", "const heads = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه'];")
r("{st[1]} işlem</div>", "{st[1]} معامله</div>")
r("<div style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: col }}>{signed(st[0])}</div>", "<div style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: col, direction: 'ltr', textAlign: 'right' }}>{signed(st[0])}</div>")
r("<div style={{ position: 'absolute', left: 150, top: 140 }}>", "<div style={{ position: 'absolute', right: 150, top: 140 }}>")
r(">Eylül 2026</div>", ">سپتامبر 2026</div>")
r("fontFamily: sans, paddingLeft: 12 }}>{h}</div>", "fontFamily: sans, paddingInlineStart: 12 }}>{h}</div>")
r("<span style={{ fontFamily: mono, fontSize: 32, color: 'rgba(255,255,255,0.45)', opacity: filled }}>+1.8R</span>", "<span style={{ fontFamily: mono, fontSize: 32, color: 'rgba(255,255,255,0.45)', opacity: filled, direction: 'ltr' }}>+1.8R</span>")
r("<span style={{ marginLeft: 'auto', position: 'relative', height: 50, display: 'flex', alignItems: 'center' }}>", "<span style={{ marginInlineStart: 'auto', position: 'relative', height: 50, display: 'flex', alignItems: 'center' }}>")
r(">Tamamlanmadı</span>", ">ناتمام</span>")
r("<span style={{ position: 'absolute', right: 0, opacity: filled,", "<span style={{ position: 'absolute', left: 0, opacity: filled,")
r("const rows: [number, string, number][] = [[14, 'Hemen geri girme', -1380], [6, 'Riski büyütme', -2240], [29, 'Aşırı işlem', -940]];", "const rows: [number, string, number][] = [[14, 'بازگشت فوری', -1380], [6, 'افزایش ریسک', -2240], [29, 'معامله بیش از حد', -940]];")
r("<span style={{ fontFamily: mono, fontSize: 44, color: C.amber, width: 70, textAlign: 'right' }}>{n}</span>", "<span style={{ fontFamily: mono, fontSize: 44, color: C.amber, width: 70, textAlign: 'left' }}>{n}</span>")
r("<span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 40, color: C.red }}>{signed(pnl)}</span>", "<span style={{ marginInlineStart: 'auto', fontFamily: mono, fontSize: 40, color: C.red, direction: 'ltr' }}>{signed(pnl)}</span>")
r("['HEDEFE KALAN', 1000, 640, 'target', 'hedef $1,000'],", "['تا هدف', 1000, 640, 'target', 'هدف \u2066$1,000\u2069'],")
r("['BUGÜNKÜ LİMİTE KALAN', 500, 410, 'loss', 'bugün −$90'],", "['تا حد امروز', 500, 410, 'loss', 'امروز \u2066−$90\u2069'],")
r("['TOPLAM KAYBA KALAN', 1000, 870, 'loss', 'taban $9,000'],", "['تا ضرر کل', 1000, 870, 'loss', 'کف \u2066$9,000\u2069'],")
r("<div style={{ fontFamily: mono, fontSize: 62, color, marginTop: 14, letterSpacing: '-0.03em' }}>{money(now)}</div>", "<div style={{ fontFamily: mono, fontSize: 62, color, marginTop: 14, letterSpacing: '-0.03em', direction: 'ltr', textAlign: 'right' }}>{money(now)}</div>")
r("<div style={{ fontFamily: mono, fontSize: 22, color: C.faint, marginTop: 12 }}>{note}</div>", "<div style={{ fontFamily: sans, fontSize: 22, color: C.faint, marginTop: 12 }}>{note}</div>")
r(">şimdi</span>", ">اکنون</span>")
r(">Önemli haber yaklaşıyor</div>", ">خبر مهم نزدیک است</div>")
r("<span style={{ color: C.red }}>●</span> Non-Farm Employment Change · 60 dakika sonra", "<span style={{ color: C.red }}>●</span> Non-Farm Employment Change · 60 دقیقه دیگر")
r('<Frame label="İŞLEM ÖNCESİ"', '<Frame label="قبل از معامله"')
r('<Frame label="İŞLEM SONRASI"', '<Frame label="بعد از معامله"')
r("<div style={{ fontFamily: mono, fontSize: 20, color: C.faint, letterSpacing: '0.14em', marginBottom: 10 }}>{label}</div>", "<div style={{ fontFamily: sans, fontSize: 22, color: C.faint, marginBottom: 10 }}>{label}</div>")
r("<div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>", "<div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', direction: 'ltr' }}>")
r("fontFamily: serif, fontStyle: 'italic', fontSize: 38, color: 'rgba(255,255,255,0.8)' }}>\n        “Londra açılışını bekledim. Plana sadık kaldım.”", "fontFamily: serif, fontSize: 38, color: 'rgba(255,255,255,0.8)' }}>\n        «منتظر باز شدن لندن ماندم. به برنامه‌ام پایبند ماندم.»")
r("const week: [string, number, number][] = [['Pzt', 240, 2], ['Sal', 180, 2], ['Çar', -60, 1], ['Per', 310, 2], ['Cum', 150, 1]];", "const week: [string, number, number][] = [['دوشنبه', 240, 2], ['سه‌شنبه', 180, 2], ['چهارشنبه', -60, 1], ['پنجشنبه', 310, 2], ['جمعه', 150, 1]];")
r("<span style={{ marginTop: 'auto', fontFamily: mono, fontSize: 44, fontWeight: 600, color: col }}>{signed(pnl)}</span>", "<span style={{ marginTop: 'auto', fontFamily: mono, fontSize: 44, fontWeight: 600, color: col, direction: 'ltr', textAlign: 'right' }}>{signed(pnl)}</span>")
r("{n} işlem</span>", "{n} معامله</span>", True)
r("<span style={{ fontFamily: mono, fontSize: 58, color, width: 280, textAlign: 'right', letterSpacing: '-0.03em' }}>{signed(pnl * p)}</span>", "<span style={{ fontFamily: mono, fontSize: 58, color, width: 280, textAlign: 'left', letterSpacing: '-0.03em', direction: 'ltr' }}>{signed(pnl * p)}</span>")
r('<Words text="Üç hafta sonra." start={s + 0.05} size={84} stagger={0.1} />', '<Words text="سه هفته بعد." family={serif} weight={600} start={s + 0.05} size={84} stagger={0.1} letterSpacing="0" />')
r('<Bar label="Kurala uyan işlemler"', '<Bar label="معاملات مطابق قوانین"')
r('<Bar label="İşaretlenen işlemler"', '<Bar label="معاملات علامت‌خورده"')
r('<Scribble text="planladığının 1,7 katı" x={1492} y={458} at={K1.data} size={38} />', '<Scribble text="۱٫۷ برابرِ برنامه‌ات" x={1492} y={520} at={K1.data} size={40} />')
r('<Scribble text="4 dk" x={24} y={420} at={K2.draw + 0.75} size={46} rot={-8} />', '<Scribble text="۴ دقیقه" x={24} y={528} at={K2.draw + 0.75} size={38} rot={6} />')
r('<Scribble text="← 11 işlem!" x={946} y={545} at={K3.draw + 0.5} size={46} rot={-5} />', '<Scribble text="→ ۱۱ معامله!" x={946} y={540} at={K3.draw + 0.5} size={46} rot={5} />')
r('<Subtitle text="Her maçtan sonra aynı şeyi yaparlar."', '<Subtitle text="بعد از هر مسابقه همین کار را می‌کنند."')
r('<Subtitle text="Kaseti açarlar."', '<Subtitle text="فیلم مسابقه را می‌گذارند."')
r('<Subtitle text="Burada. Stopu uzaklaştırdın."', '<Subtitle text="اینجا. حد ضررت را دورتر بردی."')
r('<Subtitle text="Kaybettin. Dört dakika sonra geri girdin."', '<Subtitle text="باختی. چهار دقیقه بعد دوباره وارد شدی."')
r('<Subtitle text="Bir günde on bir işlem."', '<Subtitle text="یازده معامله در یک روز."')
r("<Words text={'Şampiyonlar\\nkaybettikleri maçı izler.'} start={MAC.champ1} size={112} stagger={0.28} dur={0.6} accent={['izler']} />",
  "<Words text={'قهرمان‌ها\\nشکستشان را تماشا می‌کنند.'} family={serif} weight={600} letterSpacing=\"0\" lineHeight={1.45} start={MAC.champ1} size={108} stagger={0.28} dur={0.6} accent={['تماشا']} />")
r("<Words text={'Amatörler\\nbir sonrakine koşar.'} start={MAC.champ2} size={112} stagger={0.28} dur={0.6} accentColor={C.red} accent={['koşar']} />",
  "<Words text={'آماتورها\\nسراغ مسابقه‌ی بعدی می‌دوند.'} family={serif} weight={600} letterSpacing=\"0\" lineHeight={1.45} start={MAC.champ2} size={108} stagger={0.28} dur={0.6} accentColor={C.red} accent={['می‌دوند']} />")
for a, b in [('Her işlem kendiliğinden kaydolur.', 'هر معامله خودبه‌خود ثبت می‌شود.'), ('Her alışkanlık işaretlenir.', 'هر عادت بد علامت می‌خورد.'),
             ('Sınırın her an gözünün önünde.', 'حد مجازت همیشه جلوی چشمت است.'), ('Kırmızı haberden önce haber verir.', 'قبل از خبرهای قرمز خبرت می‌کند.'),
             ('Grafiğin ve notun, hepsi yerinde.', 'نمودار و یادداشتت، همه سر جایش.'), ('Haftanı tek bakışta gör.', 'هفته‌ات را در یک نگاه ببین.')]:
    r(f"['{a}',", f"['{b}',")
r("<Words text={caption} start={at} size={72} stagger={0.05} dur={0.35} />", "<Words text={caption} family={serif} weight={600} letterSpacing=\"0\" start={at} size={72} stagger={0.05} dur={0.35} />")
r('<Endcard start={MAC.end} line="Kasetini izle." logoWidth={1150} gap={64} />', '<Endcard start={MAC.end} line="مبارزه‌ات را دوباره ببین." cta="رایگان شروع کنید" lineFamily={serif} ctaFamily={sans} logoWidth={1150} gap={64} />')
r("color: C.text, marginTop: 8 }}>$202.50</div>", "color: C.text, marginTop: 8, direction: 'ltr', textAlign: 'right' }}>$202.50</div>")
r("color: C.red, marginTop: 8 }}>−$351.00</div>", "color: C.red, marginTop: 8, direction: 'ltr', textAlign: 'right' }}>−$351.00</div>")
r('title="Hemen geri girme" desc="Kaybettikten sonra 15 dakika içinde açılan işlemler"', 'title="بازگشت فوری" desc="معاملات باز شده تا ۱۵ دقیقه پس از ضرر"')
r('title="Aşırı işlem" desc="Olağan gününün iki katından çok işlem açtığın günler"', 'title="معامله بیش از حد" desc="روزهایی با بیش از دو برابر معاملات معمول"')
r('<DrawCircle cx={1278} cy={512} rx={205} ry={80} at={K1.draw} />', '<DrawCircle cx={1278} cy={538} rx={200} ry={70} at={K1.draw} />')
missing = [a[:70] for a, b, al in R if a not in s]
assert not missing, missing
for a, b, al in R:
    s = s.replace(a, b) if al else s.replace(a, b, 1)
s = re.sub(r'(\n\s*)(<Draw(?:Circle|Arrow) [^\n]*/>)', lambda m: f'{m.group(1)}<Mirror>{m.group(2)}</Mirror>', s)
s = s.replace("// ─── Grafik ─", """/** Kalem çizimlerini yatay aynalar: sağdan sola düzende daireler aynı öğelerin üstüne düşsün. */
function Mirror({ children }: { children: React.ReactNode }) {
  return <div style={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)', pointerEvents: 'none' }}>{children}</div>;
}

// ─── Grafik ─""", 1)
s = s.replace("    <AbsoluteFill style={{ background: C.bg }}>\n      {music && <Html5Audio", "    <AbsoluteFill style={{ background: C.bg, direction: 'rtl' }}>\n      {music && <Html5Audio", 1)
s = re.sub(r"letterSpacing: '0\.1\d?em'", "letterSpacing: 0", s)
s = "// ÜRETİLMİŞ DOSYA — scripts/make_mac_fa.py. Elle düzenleme; Mac.tsx'i düzenleyip betiği çalıştır.\n" + s
open('src/MacFa.tsx', 'w').write(s)
print('MacFa.tsx yazıldı, aynalanan çizim:', s.count('<Mirror>'))
