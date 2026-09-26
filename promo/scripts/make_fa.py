"""Ayna, Fiş ve Hiçbir Şey Yapma'nın Farsça (sağdan sola) sürümlerini üretir.

Kaynak: src/Ayna.tsx, src/Fis.tsx, src/Hic.tsx → src/AynaFa.tsx, FisFa.tsx, HicFa.tsx.
Metinler çevrilir, düzen sağdan sola akar. Cümlelerde Farsça rakam; uygulama
kartlarında sitedeki gibi Batı rakamı. Etiketler sitenin kendi Farsça çevirileri.
Kaynak değişince: python3 scripts/make_fa.py
"""
import re

LRI, PDI = '\u2066', '\u2069'  # gerçek karakterler: JSX özniteliğinde kaçış işlenmiyor

def common(s, name):
    s = s.replace(f"export function {name}(", f"export function {name}Fa(", 1)
    s = re.sub(r"import \{ C, ([^}]*)\} from './theme';",
               lambda m: "import { C, " + m.group(1).replace('sans', 'faSans as sans').replace('serif', 'faSerif as serif') + "} from './theme';", s, count=1)
    if 'faSerif as serif' not in s:
        s = s.replace("import { C, ", "import { C, faSerif as serif, ", 1)
    s = s.replace("<AbsoluteFill style={{ background: C.bg }}>", "<AbsoluteFill style={{ background: C.bg, direction: 'rtl' }}>", 1)
    s = re.sub(r"letterSpacing: '0\.\d+em'", "letterSpacing: 0", s)
    s = s.replace("fontStyle: 'italic', ", "")
    s = re.sub(r"<Words (?![^>]*family=)", '<Words family={serif} weight={600} letterSpacing="0" lineHeight={1.4} ', s)
    s = s.replace("<Card style={{", "<Card style={{ fontFamily: sans,")
    s = s.replace("<Kicker ", '<Kicker family={sans} spacing="0" ')
    return "// ÜRETİLMİŞ DOSYA — scripts/make_fa.py. Kaynağı düzenleyip betiği çalıştır.\n" + s

def apply(s, pairs, name):
    miss = [a[:70] for a, b in pairs if a not in s]
    assert not miss, (name, miss)
    for a, b in pairs:
        s = s.replace(a, b)
    return s

# ── AYNA ──
AYNA = [
    ("claim: '“Kaybettikten sonra\\nhemen geri girmem.”'", "claim: '«بعد از ضرر\\nفوری برنمی‌گردم.»'"),
    ("title: 'Hemen geri girme',", "title: 'بازگشت فوری',"),
    ("desc: 'Kaybettikten sonra 15 dakika içinde açılan işlemler',", "desc: 'معاملات باز شده تا ۱۵ دقیقه پس از ضرر',"),
    ("claim: '“Riskimi asla\\nbüyütmem.”'", "claim: '«ریسکم را\\nهرگز بالا نمی‌برم.»'"),
    ("title: 'Riski büyütme',", "title: 'افزایش ریسک',"),
    ("desc: 'Kayıptan sonra riski bir buçuk katından fazla artırma',", "desc: 'افزایش ریسک بیش از ۱.۵ برابر پس از ضرر',"),
    ("claim: '“Cuma günleri\\nbenim günüm.”'", "claim: '«جمعه‌ها\\nروزِ من است.»'"),
    ("transformOrigin: 'left center',", "transformOrigin: 'right center',"),
    ("        İŞARETLENEN ALIŞKANLIKLAR", "        عادت‌های علامت‌خورده"),
    (">bu işlemlerin sonucu</div>", ">نتیجه‌ی این معاملات</div>"),
    ("const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];", "const DAYS = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه'];"),
    ("gridTemplateColumns: '80px repeat(6, 1fr)'", "gridTemplateColumns: '118px repeat(6, 1fr)'"),
    ("<div style={{ fontSize: 26, color: di === 4 ? C.text", "<div style={{ fontSize: 22, color: di === 4 ? C.text"),
    (">ISI HARİTASI</div>", ">نقشه حرارتی</div>"),
    ("color: C.text }}>Cuma <span", "color: C.text }}>جمعه <span"),
    ("<span style={{ color: C.faint, fontFamily: mono, fontSize: 26 }}>12:00–16:00</span>", "<span style={{ color: C.faint, fontFamily: mono, fontSize: 26, direction: 'ltr', unicodeBidi: 'isolate' }}>12:00–16:00</span>"),
    ('<Kicker text="SEN"', '<Kicker text="تو"'),
    ("<Kicker text=\"JOURNAL’IN\"", "<Kicker text=\"ژورنالِ تو\""),
    ("{n} işlem</div>", "{n} معامله</div>"),
    ("text={'Aynı trader.\\nAynı strateji.'}", "text={'همان تریدر.\\nهمان استراتژی.'}"),
    ('<Bar label="Kurala uyan işlemler"', '<Bar label="معاملات مطابق قوانین"'),
    ('<Bar label="İşaretlenen işlemler"', '<Bar label="معاملات علامت‌خورده"'),
    ("        Fark stratejide değil.", "        فرق در استراتژی نیست."),
    ("text={'Kendine yalan\\nsöyleyebilirsin.'}", "text={'می‌توانی به خودت\\nدروغ بگویی.'}"),
    ("text={'Journal’ına\\nsöyleyemezsin.'}", "text={'به ژورنالت\\nنمی‌توانی.'}"),
    ("accent={['söyleyemezsin']}", "accent={['نمی‌توانی']}"),
    ('<Endcard start={AYNA.end} line="Kendini olduğu gibi gör." stacked', '<Endcard start={AYNA.end} line="خودت را همان‌طور که هستی ببین." cta="رایگان شروع کنید" lineFamily={serif} ctaFamily={sans} stacked'),
]
# ── FİŞ ──
FIS = [
    ("text: '★  PROP CHALLENGE  ★'", "text: '★  چالش پراپ  ★'"),
    ("text: 'FİŞ NO 0008'", "text: 'رسید شماره 0008'"),
    ("text: 'TEŞEKKÜR EDERİZ'", "text: 'از خرید شما سپاسگزاریم'"),
    ("text: 'YİNE BEKLERİZ :)'", "text: 'باز هم منتظرتان هستیم :)'"),
    ("label: 'TOPLAM',", "label: 'جمع کل',"),
    ("label: 'ALINAN PAYOUT',", "label: 'پی‌اوت دریافتی',"),
    ("fontFamily: mono, color: INK };", "fontFamily: sans, color: INK };"),
    ("<span style={{ width: 118 }}>TARİH</span><span style={{ flex: 1 }}>HESAP</span>", "<span style={{ width: 118 }}>تاریخ</span><span style={{ flex: 1 }}>حساب</span>"),
    ("<span style={{ width: 120, textAlign: 'right' }}>ÜCRET</span><span style={{ width: 200, textAlign: 'right' }}>DURUM</span>", "<span style={{ width: 120, textAlign: 'left' }}>هزینه</span><span style={{ width: 200, textAlign: 'left' }}>وضعیت</span>"),
    ("<span style={{ flex: 1 }}>{l.acct} CHALLENGE</span>", "<span style={{ flex: 1 }}>چالش {l.acct}</span>"),
    ("<span style={{ width: 200, textAlign: 'right', fontWeight: 700 }}>✗ PATLADI</span>", "<span style={{ width: 200, textAlign: 'left', fontWeight: 700 }}>✗ رد شد</span>"),
    ("<span style={{ width: 120, textAlign: 'right' }}>${l.price}</span>", "<span style={{ width: 120, textAlign: 'left', direction: 'ltr' }}>${l.price}</span>"),
    ("text={'Sınıra ne kadar kaldığını\\nher an bil.'}", "text={'هر لحظه بدان\\nتا مرزت چقدر مانده.'}"),
    ("accent={['her', 'an']}", "accent={['هر', 'لحظه']}"),
    ('label="HEDEFE KALAN" limit={1000} left={640} note="hedef $1,000"', f'label="تا هدف" limit={{1000}} left={{640}} note="هدف {LRI}$1,000{PDI}"'),
    ('label="BUGÜNKÜ LİMİTE KALAN" limit={500} left={188} note="bugün −$312"', f'label="تا حد امروز" limit={{500}} left={{188}} note="امروز {LRI}−$312{PDI}"'),
    ('label="TOPLAM KAYBA KALAN" limit={1000} left={780} note="taban $9,000"', f'label="تا ضرر کل" limit={{1000}} left={{780}} note="کف {LRI}$9,000{PDI}"'),
    ("text={'Aynı hatayı\\nsatın almayı bırak.'}", "text={'همان اشتباه را\\nدوباره نخر.'}"),
    ("accent={['bırak']}", "accent={['نخر']}"),
    ('<Endcard start={FIS.end} line="Prop hesabın için journal." stacked', '<Endcard start={FIS.end} line="ژورنالی برای حساب پراپ تو." cta="رایگان شروع کنید" lineFamily={serif} ctaFamily={sans} stacked'),
]
# ── HİÇ ──
HIC = [
    ("<Card style={{ width: 880, padding: '30px 40px 34px', position: 'relative' }}>", "<Card style={{ width: 880, padding: '30px 40px 34px', position: 'relative', direction: 'ltr' }}>"),
    ("          MetaTrader bağlı", "          متاتریدر متصل"),
    (">Bugün</div>", ">امروز</div>"),
    ("pill={filled ? undefined : 'Tamamlanmadı'} />", "pill={filled ? undefined : 'ناتمام'} />"),
    ("textAlign: 'right' }}>{r ?? ''}</span>", "textAlign: 'left', direction: 'ltr' }}>{r ?? ''}</span>"),
    ("<span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 32, fontWeight: 500, color: win ? C.green : C.red }}>", "<span style={{ marginInlineStart: 'auto', fontFamily: mono, fontSize: 32, fontWeight: 500, color: win ? C.green : C.red }}>"),
    ("        ) : amount}", "        ) : <span style={{ direction: 'ltr', display: 'inline-block' }}>{amount}</span>}"),
    ('<Caption text="Sen işlemine gir."', '<Caption text="تو وارد معامله شو."'),
    ('<Caption text="Biz yazalım." from={HIC.cap2} to={HIC.cap3 - 0.05} accent={[\'yazalım\']} />', '<Caption text="ما ثبتش می‌کنیم." from={HIC.cap2} to={HIC.cap3 - 0.05} accent={[\'ثبتش\']} />'),
    ('<Caption text="Kapanınca biz tamamlayalım." from={HIC.cap3} to={HIC.verdict} accent={[\'tamamlayalım\']} />', '<Caption text="بسته که شد، ما کاملش می‌کنیم." from={HIC.cap3} to={HIC.verdict} accent={[\'کاملش\']} />'),
    ("text={'Journal’a tek tuşa\\nbile basmadın.'}", "text={'حتی یک دکمه هم\\nدر ژورنال نزدی.'}"),
    ("accent={['basmadın']}", "accent={['نزدی']}"),
    ('<Endcard start={HIC.end} line="MetaTrader 5 ile otomatik." stacked', '<Endcard start={HIC.end} line="خودکار با متاتریدر ۵." cta="رایگان شروع کنید" lineFamily={serif} ctaFamily={sans} stacked'),
]

for name, pairs in [('Ayna', AYNA), ('Fis', FIS), ('Hic', HIC)]:
    s = open(f'src/{name}.tsx').read()
    s = apply(s, pairs, name)
    s = common(s, name)
    open(f'src/{name}Fa.tsx', 'w').write(s)
    print(name + 'Fa.tsx yazıldı')
