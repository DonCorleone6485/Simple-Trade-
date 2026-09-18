/**
 * Prop hesabı değerlendirme maddeleri.
 *
 * Toplam 100 puan; ağırlıklar maddelerin hesabı gerçekten bitirme gücüne göre
 * dağıtılmış: drawdown tipi tek başına 20 puan, hafta sonu taşıma 1 puan.
 *
 * Uzun açıklamalar burada veri olarak duruyor, bileşende değil: metin sayfanın
 * yapısından uzun ömürlü ve düzenlemesi daha sık.
 */

export type DetailBlock =
  | { p: string }
  | { h: string }
  | { ul: string[] }
  | { table: { head: string[]; rows: string[][] } };

export interface PropOption {
  tr: string;
  en: string;
  points: number;
}

export interface PropCriterion {
  id: string;
  /** Bu maddeden alınabilecek en yüksek puan. */
  max: number;
  title: { tr: string; en: string };
  /** Başlığın altındaki kısa tanım. */
  short: { tr: string; en: string };
  /** Firmaların kural metninde bu maddenin geçtiği adlar. */
  keywords: string;
  options: PropOption[];
  /** "Açıklama ve örnek" panelinin içeriği. */
  detail: DetailBlock[];
}

export const PROP_CRITERIA: PropCriterion[] = [
  {
    id: 'drawdown',
    max: 20,
    title: { tr: 'Maksimum Zarar Çizgisinin Tipi (Drawdown)', en: 'Type of Maximum Drawdown' },
    short: {
      tr: 'Hesabın ölüm çizgisi — altına inersen hesap biter. Soru şu: bu çizgi baştan sabit mi duruyor, yoksa sen kâr ettikçe yukarı mı kayıyor? Kayan bir çizgi, kâğıt üstündeki kârını geri verdiğinde seni patlatabilir. Bu, bir hesabı diğerinden ayıran en belirleyici tek değişkendir.',
      en: 'The account\'s kill line — go below it and the account is over. The question: does it stay where it started, or does it climb as you profit? A trailing line can blow you up when you give back paper profit. This is the single most decisive difference between accounts.',
    },
    keywords: '"Max Drawdown", "Maximum Loss", "Overall Drawdown", "Static / Trailing Drawdown", "Smart Drawdown", "High Water Mark"',
    options: [
      { tr: 'Sabit — baştan belirlenir, hiç oynamaz (Static)', en: 'Static — set at the start, never moves', points: 20 },
      { tr: 'Kapalı bakiyeyi takip eder, başa baş noktasında kilitlenir', en: 'Trails closed balance, locks at breakeven', points: 14 },
      { tr: 'Kapalı bakiyeyi takip eder, kilitlenme yok (Balance/EOD trailing)', en: 'Trails closed balance, never locks (Balance/EOD trailing)', points: 10 },
      { tr: 'Açık pozisyon kârını da takip eder (Equity trailing)', en: 'Trails open profit too (Equity trailing)', points: 2 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Her hesapta bir "ölüm çizgisi" vardır — paran o seviyenin altına inerse hesap kapanır. Bu çizginin nerede olduğu kadar, **nasıl davrandığı** da önemlidir. Üç farklı model var:' },
      { p: '**Sabit (Static):** Çizgi baştan belirlenir ve hesap boyunca hiç kıpırdamaz. Kâr etsen de, para çeksen de, bakiyen ikiye katlansa da aynı yerde durur. Bunun güzel yanı şu: kazandıkça çizgiyle aranda mesafe açılır, yani hareket alanın genişler.' },
      { p: '**Kapalı bakiyeyi takip eden (Balance/EOD trailing):** Çizgi, senin **kapattığın** kârları takip ederek yukarı kayar. Açık pozisyondaki dalgalanma çizgiyi etkilemez — sadece işlemi kapattığında yukarı çıkar. Bazı firmalarda bu çizgi başlangıç bakiyene ulaşınca durur ve fiilen sabite dönüşür; bu, sürekli kayan versiyondan belirgin şekilde daha iyidir.' },
      { p: '**Açık kârı da takip eden (Equity trailing):** En tehlikeli model. Çizgi, henüz kapatmadığın kâra göre bile yukarı kayar. Yani pozisyonun bir anlığına kâra geçtiğinde çizgi yukarı kilitlenir, sonra o kâr eridiğinde — sen hiç gerçek zarar etmemişken — hesabın gidebilir.' },
      { h: 'Örnek ($100.000 hesap, %10 çizgi)' },
      { p: 'Diyelim bir altın pozisyonu açtın, önce +$5.000 kâra geçti, sonra geri döndü ve sen breakeven\'da kapattın.' },
      {
        table: {
          head: ['An', 'Bakiye', 'Equity', 'Sabit çizgi', 'Equity trailing çizgi'],
          rows: [
            ['Başlangıç', '$100.000', '$100.000', '$90.000', '$90.000'],
            ['Pozisyon +$5.000 kârda', '$100.000', '$105.000', '$90.000', '**$95.000** ↑'],
            ['Kâr eridi, equity düştü', '$100.000', '$94.000', 'Güvende', '**Çizgi ihlal — hesap gitti**'],
          ],
        },
      },
      { p: 'Sabit çizgide hiçbir şey olmadı. Equity trailing\'de ise cebindeki para hiç azalmadığı halde hesap kapandı — çünkü çizgi, hiç almadığın bir kârın peşinden yukarı çıkmıştı.' },
      { p: '**Kâr ettikçe ne oluyor?** Bakiyen $120.000\'a çıktığını düşün. Sabit çizgide taban hâlâ $90.000 — yani $30.000 hareket alanın var. Trailing\'de ise çizgi seninle birlikte $110.000\'a kadar çıkmış olur ve alanın hep aynı $10.000\'da kalır.' },
    ],
  },

  {
    id: 'news',
    max: 15,
    title: { tr: 'Haber Anında İşlem', en: 'Trading Around News' },
    short: {
      tr: 'Yüksek etkili haber anında işlem açıp kapatabiliyor musun? Kısıt varsa asıl mesele kısıtın kendisi değil, **ihlalin sonucu**: sadece o işlemin kârı mı siliniyor, yoksa hesap mı kapanıyor?',
      en: 'Can you open and close trades during high-impact news? If there is a restriction, what matters is not the restriction but **what happens when you breach it**: is only that trade\'s profit removed, or is the account closed?',
    },
    keywords: '"News Trading", "News Restriction", "Blackout Period", "High-Impact News", "Major News Events", "News Straddling"',
    options: [
      { tr: 'Tamamen serbest, zaman penceresi yok', en: 'Fully allowed, no blackout window', points: 15 },
      { tr: 'Ek paket (add-on) ile serbest', en: 'Allowed with a paid add-on', points: 12 },
      { tr: 'Yasak penceresi var (±2, ±4, ±5 dk), önceden açılmış işlem muaf', en: 'Blackout window, trades opened earlier are exempt', points: 9 },
      { tr: 'Yasak penceresi var (±2, ±4, ±5 dk), ihlalde sadece kâr siliniyor', en: 'Blackout window, breach removes only the profit', points: 6 },
      { tr: 'Yasak penceresi var (±2, ±4, ±5 dk), ihlalde hesap kapanıyor', en: 'Blackout window, breach closes the account', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'NFP, CPI, FOMC gibi yüksek etkili haberler saniyeler içinde büyük hareketler yaratır. Firmalar bu anlarda oluşan riski sevmez, bu yüzden çoğu bir **yasak penceresi** koyar: haberden 2, 4 veya 5 dakika önce ve sonra işlem açıp kapatamazsın.' },
      { p: 'Ama asıl kritik olan pencerenin varlığı değil, **ihlal edince ne olduğu**. Üç farklı sonuç görürsün:' },
      {
        ul: [
          '**Sadece o işlemin kârı silinir** → canın sıkılır, hesabın devam eder',
          '**Hesap kapanır** → tek bir hatada her şey biter',
          '**Muafiyet var** → bazı firmalar "işlem haberden 4-5 saat önce açıldıysa haber işlemi saymıyoruz" der',
        ],
      },
      { p: 'Bir de çoğu kişinin fark etmediği bir detay var: bazı firmalarda **sen hiçbir şey yapmasan bile** ihlal olabiliyor. Saatler önce açtığın pozisyonun stop veya hedefi o pencere içinde tetiklenirse, bu da "pencerede işlem kapatmak" sayılır.' },
      { h: 'Örnek' },
      { p: 'Sabah 10:00\'da altın alımı yaptın, hedefin $4.120. Akşam 15:30\'da NFP açıklanacak, yasak penceresi 15:28–15:32 arası.' },
      { p: '**Senaryo A — Kâr silme kuralı olan firma:** Haber spike\'ı 15:29\'da hedefini vurdu. İşlem +$2.000 kârla kapandı ama bu kâr hesabından silinir. Hesabın devam eder, sadece o kazancı alamazsın.' },
      { p: '**Senaryo B — Hesap kapatma kuralı olan firma:** Aynı şey oldu, ama bu sefer hesabın kapandı. Sen o gün ekrana bile bakmamıştın, emri sistem tetikledi — yine de ihlal sayıldı.' },
      { p: '**Senaryo C — Muafiyetli firma:** İşlemi 10:00\'da, yani haberden 5.5 saat önce açmıştın. Firma bunu "haber işlemi" saymaz, kârın cebinde kalır.' },
      { p: '**Pratik sonuç:** Senaryo B\'deki bir firmada çalışıyorsan, her yüksek etkili haber öncesi açık pozisyonlarının stop ve hedeflerini pencereden uzağa çekmen gerekir. Ayda onlarca kez. Bir kere unutursan hesap gider.' },
    ],
  },

  {
    id: 'floating',
    max: 12,
    title: { tr: 'Açık Pozisyon Zarar Limiti (Floating)', en: 'Open Position Loss Limit (Floating)' },
    short: {
      tr: 'Açık pozisyonlarındaki **henüz kapatmadığın** zarara bakan ayrı bir sınır. Eşiği aşarsan sistem tüm pozisyonları anında kapatır — günlük limitine hiç yaklaşmamış olsan bile. Aynı anda birden fazla işlem açanlar için en sinsi kural.',
      en: 'A separate limit on the loss you have **not yet realised**. Cross it and the system closes every position at once — even if you never came near your daily limit. The sneakiest rule for anyone holding several trades at a time.',
    },
    keywords: '"Guardian Shield", "Equity Protection", "Position Loss Limit", "Open P&L Protection", "Account Drawdown", "Max Floating Loss", "Unrealised Loss Limit"',
    options: [
      { tr: 'Yok', en: 'None', points: 12 },
      { tr: 'Var, eşik %4 ve üstü', en: 'Yes, threshold 4% or above', points: 9 },
      { tr: 'Var, eşik %3', en: 'Yes, threshold 3%', points: 7 },
      { tr: 'Var, eşik %2', en: 'Yes, threshold 2%', points: 4 },
      { tr: 'Var, eşik %2 altı', en: 'Yes, threshold below 2%', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Normalde iki zarar sınırı bilirsin: günlük ve toplam. Bu üçüncü bir sınır ve farklı çalışır — **sadece açık pozisyonlarındaki henüz kapatmadığın zarara** bakar.' },
      { p: 'Eşiği aşarsan sistem beklemez: tüm pozisyonlarını anında kapatır. Bazı firmalarda hesap da kapanır, bazılarında ilk seferde ceza (kâr payının düşürülmesi) verilir, ikinci seferde hesap kapatılır.' },
      { p: 'Neden sinsi? Çünkü **günlük limitine hiç yaklaşmamış olabilirsin**. Tek tek bakınca hepsi makul riskli birkaç pozisyon açarsın, ama açık zararları toplandığında bu eşiği aşar ve sistem seni piyasadan çıkarır — belki de pozisyonların dönmesine bir adım kala.' },
      { h: 'Örnek ($100.000 hesap, %2 eşik = $2.000)' },
      { p: 'Sabah üç işlem açtın, her birinin riski $1.000:' },
      {
        ul: [
          'XAUUSD long → şu an −$700',
          'EURUSD long → şu an −$700',
          'GBPUSD long → şu an −$700',
        ],
      },
      { p: '**Toplam açık zarar: −$2.100** → Sistem devreye girer, üç pozisyonu da kapatır.' },
      { p: 'Oysa:' },
      {
        ul: [
          'Günlük limitin $5.000\'dı, ona hiç yaklaşmamıştın',
          'Stop\'ların vurulmamıştı, üçü de hâlâ dönebilirdi',
          'Toplam riskin sadece hesabın %3\'üydü',
        ],
      },
      { p: 'Yani hiçbir kuralı bilerek zorlamadın, ama sistemin gözünde "açık zararın çok büyüdü."' },
      { p: '**Pratik kural:** Bu limit varsa, aynı anda açık tüm pozisyonlarının toplam riski eşiğin altında kalmalı. %2 eşikli $100K hesapta toplam açık riskin $2.000\'ı geçmemeli — yani 4 işlem açacaksan her biri en fazla $500 riskli olmalı.' },
    ],
  },

  {
    id: 'dailyBase',
    max: 10,
    title: { tr: 'Günlük Zarar Çizgisinin Hesaplama Tabanı', en: 'Basis of the Daily Loss Line' },
    short: {
      tr: 'Günlük çizgi her gün sıfırlanıp yeniden hesaplanır. Soru: neyin üzerinden? Yükseği kullanılıyorsa, gece taşıdığın kâğıt üstü kâr çizgiyi yukarı iter — ertesi gün o kârı geri verdiğinde, hiç gerçek zarar etmemişken hesap patlayabilir.',
      en: 'The daily line resets every day. On what basis? If the higher of balance and equity is used, paper profit carried overnight pushes the line up — give that profit back the next day and the account can die without a single real loss.',
    },
    keywords: '"Daily Loss Limit", "Daily Drawdown", "Balance-based / Equity-based", "Higher of balance or equity", "Previous day\'s closing balance", "Midnight Mark"',
    options: [
      { tr: 'Günlük limit hiç yok', en: 'No daily limit at all', points: 10 },
      { tr: 'Bakiye tabanlı — açık kâr çizgiyi itmez', en: 'Balance-based — open profit does not move it', points: 9 },
      { tr: 'Bakiye ile equity\'nin yükseği alınır', en: 'Higher of balance or equity', points: 5 },
      { tr: 'Gün içi equity zirvesinden hesaplanır', en: 'From the intraday equity peak', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Günlük zarar çizgisi her gün sıfırlanıp yeniden hesaplanır. Ama **neyin üzerinden** hesaplandığı firmadan firmaya değişir ve bu fark hayati:' },
      { p: '**Bakiye tabanlı:** Çizgi, gün başındaki kapanmış paranı baz alır. Açık pozisyonundaki kâr ya da zarar hesaba katılmaz. En güvenli model.' },
      { p: '**Yükseği alınan:** Gün başında bakiyene ve equity\'ne bakılır, hangisi yüksekse o baz alınır. Yani gece pozisyonun kârdaysa, o kâğıt üstü kâr çizgiyi yukarı iter.' },
      { p: '**Gün içi equity zirvesinden:** En sert model. Gün içinde kâra geçtiğin anda çizgi anında yukarı kilitlenir.' },
      { p: 'Fark neden önemli? Çünkü ikinci ve üçüncü modelde **hiç gerçek zarar etmeden** hesabını kaybedebilirsin — sadece kâğıt üstündeki kârı geri vererek.' },
      { h: 'Örnek ($100.000 hesap, %5 günlük limit)' },
      { p: 'Gece yarısında bakiyen $100.000, açık altın pozisyonun +$10.000 kârda (equity $110.000).' },
      { p: '**Bakiye tabanlı firma:** Çizgi = $100.000 − $5.000 = **$95.000**. Ertesi gün kâr tamamen eridi, pozisyonu breakeven\'da kapattın → equity $100.000. Çizgiden $5.000 uzaktasın, sorun yok.' },
      { p: '**Yükseği alan firma:** Çizgi = $110.000 × 0.95 = **$104.500**. Ertesi gün kâr $5.500 eridi → equity $104.500\'e indi. **Hesap kapandı.**' },
      { p: 'Dikkat et: ikinci senaryoda cebindeki para hâlâ $100.000. Tek kuruş gerçek zarar etmedin. Sadece almadığın bir kârı geri verdin ve hesabın gitti.' },
      { p: '**Pratik kural:** "Yükseği alan" bir firmadaysan, gece yarısına taşıdığın kâğıt üstü kâr ne kadar büyükse ertesi gün o kadar dar alanda kalırsın. Kabaca hesabın %5\'ini aşan floating kârla geceyi geçmek tehlikeli bölgeye girmektir.' },
    ],
  },

  {
    id: 'consistency',
    max: 10,
    title: { tr: 'Kâr Dağılımı Kuralı (Consistency)', en: 'Profit Consistency Rule' },
    short: {
      tr: 'En iyi gününün, toplam kârının belirli bir yüzdesini geçememesi kuralı. Hesabı kapatmaz ama ödemeyi bekletir. Dikkat: bazı firmalarda değerlendirmede yok ama fonlandıktan sonra devreye giriyor.',
      en: 'Your best day may not exceed a set share of total profit. It does not close the account but it holds your payout. Careful: some firms apply it only after funding, not during the evaluation.',
    },
    keywords: '"Consistency Rule", "Consistency Score", "Best Day Rule", "Profit Consistency", "Daily Profit Distribution", "Profit Concentration"',
    options: [
      { tr: 'Yok', en: 'None', points: 10 },
      { tr: '%50 ve üstü', en: '50% or above', points: 8 },
      { tr: '%40 – %49', en: '40% – 49%', points: 6 },
      { tr: '%30 – %39', en: '30% – 39%', points: 4 },
      { tr: '%30 altı', en: 'Below 30%', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Bu kural şunu söyler: **tek bir günün kârı, toplam kârının belirli bir yüzdesini geçemez.** Amaç, firmanın "bu adam şanslı bir vuruş yaptı mı yoksa gerçekten becerikli mi?" sorusuna cevap aramasıdır.' },
      { p: 'Önemli nokta: bu kural hesabını **kapatmaz**. Sadece paranı kilitler. Kural sağlanana kadar işlem yapmaya devam edip toplam kârını büyütmen gerekir ki o büyük günün payı yüzde olarak küçülsün.' },
      { p: 'Bir tuzağı var: bazı firmalarda değerlendirme aşamasında bu kural hiç yoktur, ama fonlandıktan sonra devreye girer. Ödeme şartlarını ayrıca okumak lazım.' },
      { h: 'Örnek ($100.000 hesap, %35 kural)' },
      { p: 'Diyelim hedefine ulaştın, toplam kârın $7.000. Kural diyor ki: en iyi günün toplamın %35\'ini geçemez. $7.000 × 0.35 = **$2.450**' },
      { p: '**Durum A:** En iyi günün $2.000. Sorun yok, ödemeni alırsın.' },
      { p: '**Durum B:** En iyi günün $4.000. Kural ihlal — ödeme kilitli. Ne yapman gerekir? $4.000 ÷ 0.35 = **$11.429**' },
      { p: 'Yani o tek günün meşrulaşması için toplam kârını $11.429\'a çıkarman gerekir. $7.000\'de durup ödeme alamazsın, $4.400 daha kazanman şart.' },
      { p: '**Kimi vurur, kimi vurmaz:** Her gün küçük kârlar toplayan biri bu kuralı hiç hissetmez. Ama haberle veya birkaç büyük vuruşla kazanan biri sürekli buna takılır — stratejisinin doğası gereği kârı birkaç güne yoğunlaşır.' },
      { p: '**Yüzde ne kadar yüksekse o kadar iyi:** %50\'de bir gün toplamın yarısı olabilir (rahat), %15\'te ise sadece yedide biri (çok sıkı).' },
    ],
  },

  {
    id: 'overnight',
    max: 9,
    title: { tr: 'Gece Pozisyon Taşıma', en: 'Holding Overnight' },
    short: {
      tr: 'Pozisyonu gece boyunca, gün değişimini aşarak açık tutabilme. Yasaksa gün içinde açtığın her pozisyonu seans sonunda kapatmak zorundasın.',
      en: 'Holding a position through the daily rollover. If it is banned, everything you open must be closed by the end of the session.',
    },
    keywords: '"Overnight Holding", "Swing Trading", "Hold Overnight", "Rollover", "Flat by Close", "End of Session Close"',
    options: [
      { tr: 'Serbest', en: 'Allowed', points: 9 },
      { tr: 'Ek paket (add-on) ile serbest', en: 'Allowed with a paid add-on', points: 6 },
      { tr: 'Yasak — seans sonunda otomatik kapanıyor', en: 'Banned — closed automatically at session end', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Pozisyonunu gün değişimini aşarak, gece boyunca açık tutabilme hakkı. Basit görünür ama stratejini doğrudan belirler.' },
      { p: 'Yasaksa, açtığın her pozisyonu o gün kapatmak zorundasın — sistem seansın sonunda otomatik olarak hepsini kapatır. Bu durumda swing yapamazsın, birkaç gün süren hareketleri yakalayamazsın, haber pozisyonunu ertesi güne taşıyamazsın.' },
      { p: 'Bazı firmalarda serbesttir ama ek pakete bağlıdır. Bazılarında ise serbest olmasına rağmen gecelik faiz (swap) maliyeti yüksektir — özellikle endeks ve petrolde, birkaç gün taşırsan kârını yiyebilir.' },
      { h: 'Örnek' },
      { p: 'Perşembe günü altında güzel bir alım fırsatı gördün, hedefin 2-3 gün sürecek bir hareket.' },
      { p: '**Serbest firmada:** Pozisyonunu açarsın, Cuma ve Pazartesi boyunca taşırsın, hedefe ulaşınca kapatırsın. Sadece gecelik swap maliyetini ödersin.' },
      { p: '**Yasak olan firmada:** Pozisyonu o gün kapatmak zorundasın. Hareket gece devam ederse yakalayamazsın. Ertesi gün yeniden girmen gerekir — ama fiyat çoktan kaçmış olabilir. Ayrıca her gün yeniden giriş yaptığın için komisyon ve spread maliyetin katlanır.' },
      { p: '**Kimi vurur, kimi vurmaz:** Gün içinde girip çıkan bir scalper bu kuralı hiç hissetmez. Ama swing veya haber pozisyonu tutan biri için hesap kullanılamaz hale gelir.' },
    ],
  },

  {
    id: 'payout',
    max: 8,
    title: { tr: 'Ödeme Sıklığı', en: 'Payout Frequency' },
    short: {
      tr: 'Kârını ne sıklıkla çekebiliyorsun ve ilk çekim için ne kadar beklemen gerekiyor? Çekilmemiş kâr her zaman risk altındadır.',
      en: 'How often can you withdraw, and how long until the first payout? Profit you have not withdrawn is always still at risk.',
    },
    keywords: '"Payout Frequency", "Reward Cycle", "Withdrawal Cycle", "On-Demand Payout", "First Payout", "Minimum Withdrawal"',
    options: [
      { tr: 'İstediğin an (On-demand)', en: 'On demand', points: 8 },
      { tr: 'Haftalık (7 gün)', en: 'Weekly (7 days)', points: 7 },
      { tr: '10 – 14 gün', en: '10 – 14 days', points: 5 },
      { tr: 'Ek paket (add-on) ile 14 güne iniyor', en: 'Down to 14 days with a paid add-on', points: 4 },
      { tr: 'Aylık (28 – 30 gün)', en: 'Monthly (28 – 30 days)', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Kazandığın parayı ne sıklıkla çekebildiğin. Hesabı riske atmaz ama bir gerçeği unutma: **hesapta duran kâr, senin paran değil.** Çekmediğin sürece o para hâlâ risk altındadır — bir kural ihlali, bir kötü gün, hepsini silebilir.' },
      { p: 'İki ayrı şeye bakman gerekir: ilk ödeme için ne kadar beklemen gerektiği, ve sonrasındaki döngünün ne kadar sık olduğu.' },
      { h: 'Örnek' },
      { p: 'Fonlandın ve ilk ayda $5.000 kâr yaptın.' },
      { p: '**İstediğin an (on-demand) çekim yapan firmada:** Kârın oluştuğu gün talep edersin, birkaç iş günü içinde hesabındadır. Para artık gerçekten senin.' },
      { p: '**Aylık ödeme yapan firmada:** 30 gün beklemen gerekir. O 30 gün içinde kötü bir hafta geçirip kârın bir kısmını geri verebilirsin, ya da bir kural ihlali yapıp $5.000\'ın tamamını kaybedebilirsin. İkinci durumda hesapta gördüğün rakam sadece bir sayıydı, hiç cebine girmedi.' },
      { p: '**Pratik sonuç:** Ödeme sıklığı, "ne kadar çabuk zengin olurum" meselesi değil — **riski masadan kaldırma hızı** meselesi. Sık ödeme yapan firma, kârını daha çabuk güvenceye almanı sağlar.' },
    ],
  },

  {
    id: 'riskPerTrade',
    max: 6,
    title: { tr: 'İşlem veya Enstrüman Başına Risk Limiti', en: 'Risk Limit per Trade or Instrument' },
    short: {
      tr: 'Toplam günlük limitin dışında, tek bir işlemde veya enstrümanda ne kadar riske girebileceğine dair ayrı bir tavan. Aynı enstrümandaki pozisyonlar toplanarak tek işlem sayılır.',
      en: 'On top of the daily limit, a separate cap on how much you may risk in one trade or one instrument. Positions in the same instrument are usually added together and counted as one.',
    },
    keywords: '"Risk per Trade", "Symbol Loss Limit", "Risk per Trade Idea", "Max Risk per Position", "Maximum Lot Size", "Position Size Limit"',
    options: [
      { tr: 'Yok', en: 'None', points: 6 },
      { tr: 'Var, eşik %3 ve üstü', en: 'Yes, threshold 3% or above', points: 5 },
      { tr: 'Var, eşik %2 – %3', en: 'Yes, threshold 2% – 3%', points: 4 },
      { tr: 'Var, eşik %2 altı', en: 'Yes, threshold below 2%', points: 2 },
      { tr: 'Lot tavanı var (enstrüman bazlı)', en: 'Lot cap per instrument', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Günlük ve toplam limitlerin dışında, **tek bir işlemde veya tek bir enstrümanda** ne kadar riske girebileceğini sınırlayan ayrı bir tavan. İki biçimi var:' },
      { p: '**Yüzde bazlı:** "Tek işlem fikrinde hesabın en fazla %2\'sini riske atabilirsin" gibi. Önemli detay: aynı enstrümanda aynı yönde açtığın birden fazla pozisyon genelde **tek işlem sayılır**, yani riskleri toplanır.' },
      { p: '**Lot bazlı (lot tavanı):** "Altında en fazla 3 lot açabilirsin" gibi. Bu daha katıdır çünkü riskle değil, mutlak pozisyon büyüklüğüyle sınırlar.' },
      { h: 'Örnek 1 — Yüzde bazlı ($100.000 hesap, %2 = $2.000 limit)' },
      { p: 'Altında üç ayrı alım yaptın, her birinde $800 risk aldın. Sen bunları "üç farklı işlem" sanıyorsun ama firma hepsini tek fikir sayar: $800 × 3 = **$2.400** → limit aşıldı, ihlal.' },
      { h: 'Örnek 2 — Lot tavanı (altında 3 lot sınırı)' },
      { p: 'Altında $2.500 riske girmek istiyorsun. Stop mesafene göre gereken lot:' },
      {
        table: {
          head: ['Stop mesafesi', 'Gereken lot', 'Sonuç'],
          rows: [
            ['$20', '1.25 lot', '✓ Sorun yok'],
            ['$10', '2.5 lot', '✓ Sorun yok'],
            ['$5', '5 lot', '✗ Tavan 3 lot — en fazla $1.500 riske girebilirsin'],
          ],
        },
      },
      { p: 'Yani dar stop kullandığında, istediğin riske matematiksel olarak ulaşamazsın. Lot tavanı, sıkı stop kullanan trader\'ları doğrudan kısıtlar.' },
    ],
  },

  {
    id: 'stopLoss',
    max: 5,
    title: { tr: 'Stop-Loss Kuralı', en: 'Stop-Loss Rule' },
    short: {
      tr: 'Stop koymak zorunlu mu? Koyduğun stop platformda görünür kalmak zorunda mı? "Stop koy, sonra kaldır, fiyat gelince elle kapat" yöntemi bazı firmalarda gizli stop sayılır ve yasaktır.',
      en: 'Is a stop mandatory? Must it stay visible on the platform? Placing a stop, removing it and closing by hand counts as a hidden stop at some firms, and is banned.',
    },
    keywords: '"Stop Loss Requirement", "Mandatory Stop Loss", "Hidden / Stealth Stop Loss", "Visible SL", "SL must remain on platform"',
    options: [
      { tr: 'Zorunlu değil, görünürlük şartı da yok', en: 'Not required, no visibility condition', points: 5 },
      { tr: 'Zorunlu değil ama koyulursa görünür kalmalı', en: 'Not required, but must stay visible if placed', points: 4 },
      { tr: 'Zorunlu (belirli süre içinde konmalı)', en: 'Mandatory (within a set time)', points: 3 },
      { tr: 'Zorunlu + maksimum mesafe şartı var', en: 'Mandatory + maximum distance condition', points: 1 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'İki ayrı soru içerir:' },
      { p: '**Stop koymak zorunlu mu?** Bazı firmalar her pozisyona belirli bir süre içinde stop konmasını şart koşar. Bazıları hiç karışmaz.' },
      { p: '**Koyduğun stop görünür kalmak zorunda mı?** Bu daha az bilinen ama önemli bir kural. Bazı trader\'lar stop\'u platforma koyar, sonra kaldırır ve fiyat o seviyeye gelince elle kapatır — amaç "stop avına" yakalanmamaktır. Bazı firmalar buna **gizli stop (stealth stop)** der ve yasaklar. Onlara göre stop, pozisyon boyunca platformda duran gerçek bir emir olmalıdır.' },
      { p: 'Firmalar bunu neden önemser? Çünkü risklerini senin görünür stop\'larına göre hesaplarlar. Stop\'u görünmeyen bir trader, onların gözünde "riski ölçülemeyen" bir traderdır.' },
      { h: 'Örnek' },
      { p: 'Diyelim altında alım yaptın ve $10 uzağa stop koydun, sonra kaldırıp "fiyat oraya gelirse elle kapatırım" dedin.' },
      { p: '**Kuralı olmayan firmada:** Sorun yok, istediğin gibi yönetirsin.' },
      { p: '**Görünürlük şartı olan firmada:** Bu ihlal sayılır. İşlem geçmişinde desen olarak görünür (sürekli stop\'suz pozisyonlar, hep manuel kapanışlar) ve incelemeye takılırsın.' },
      { p: '**Çözüm — her iki dünyanın iyisi:** Stop\'u baştan **geniş** koy (spike\'ların ulaşamayacağı yere) ve pozisyonu ona göre küçült — dolar riskin aynı kalır. Gerçek çıkış kararını yine elle verirsin, fiyat senin zihinsel seviyene gelince kapatırsın. Ama platformda her zaman bir sigorta stopu durur.' },
      { p: 'Bu yöntemin bonusu: internetin koptuğunda, uyuduğunda veya platform donduğunda da korunmuş olursun. Zihinsel stop sadece sen ekrandayken çalışır.' },
    ],
  },

  {
    id: 'minDays',
    max: 2,
    title: { tr: 'Minimum İşlem Günü', en: 'Minimum Trading Days' },
    short: {
      tr: 'Hedefi tutturmuş olsan bile geçmek için gereken minimum gün sayısı. Kritik ayrım: sadece **işlem açman** mı yeterli, yoksa o gün **kâr etmen** de şart mı?',
      en: 'The minimum number of days before you can pass, even with the target hit. The critical distinction: is **opening a trade** enough, or must the day be **profitable**?',
    },
    keywords: '"Minimum Trading Days", "Profitable Days", "Active Trading Days", "Qualifying Days", "Minimum Profitable Days"',
    options: [
      { tr: 'Yok (0 gün)', en: 'None (0 days)', points: 2 },
      { tr: '1 – 4 gün, düz gün (kâr şartı yok)', en: '1 – 4 days, plain days (no profit condition)', points: 1.5 },
      { tr: '5 gün ve üstü, düz gün', en: '5 days or more, plain days', points: 1 },
      { tr: 'Kârlı gün şartı var', en: 'Profitable-day condition', points: 0.5 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Kâr hedefini tutturmuş olsan bile, hesabı geçmek için belirli sayıda farklı günde işlem yapmış olman gerekir. Amaç, "tek şanslı vuruşla geçenleri" elemektir. Kritik ayrım şu:' },
      { p: '**Düz gün:** Sadece o gün bir pozisyon **açman** yeterlidir. Kâr etsen de zarar etsen de gün sayılır. Hatta çok küçük bir işlem bile günü doldurur.' },
      { p: '**Kârlı gün:** O gün belirli bir miktar (genelde hesabın %0.5\'i) **kâr etmen** gerekir. Zarar ettiğin veya küçük kâr ettiğin gün sayılmaz.' },
      { p: 'İkisi arasında dağlar kadar fark var. Düz gün şartı sadece seni bekletir. Kârlı gün şartı ise kaç günde geçeceğini senin kontrolünden çıkarır — piyasa uygun fırsat vermezse bekleyeceksin.' },
      { h: 'Örnek ($50.000 hesap, 3 kârlı gün şartı, %0.5 = $250)' },
      {
        table: {
          head: ['Gün', 'O gün kapanan işlemler', 'Net', 'Sayıldı mı?'],
          rows: [
            ['Pazartesi', '+$415, −$403', '+$12', '✗ ($250 altı)'],
            ['Salı', '+$139, +$368', '+$507', '✓'],
            ['Çarşamba', '+$989', '+$989', '✓'],
            ['Perşembe', '−$658', '−$658', '✗'],
            ['Cuma', '+$2.814', '+$2.814', '✓'],
          ],
        },
      },
      { p: 'Üç kârlı gün tamam. Ama dikkat: Pazartesi günü iki işlem yapmana rağmen net $12 kaldığı için sayılmadı. Perşembe zararla kapattığın için sayılmadı. Aynı hafta "düz gün" şartı olan bir firmada olsaydı, beş günün beşi de sayılacaktı.' },
      { p: '**Bir detay daha:** Bazı firmalarda "gün" tanımı pozisyonun **açıldığı** gündür. Pazartesi açıp Çarşamba kapattığın bir pozisyon sadece Pazartesi\'yi sayar, Salı ve Çarşamba\'yı doldurmaz.' },
    ],
  },

  {
    id: 'payoutDrawdown',
    max: 2,
    title: { tr: 'Çekim Sonrası Zarar Çizgisinin Davranışı', en: 'The Loss Line After a Payout' },
    short: {
      tr: 'Para çektiğinde bakiyen düşer — peki zarar çizgin de düşer mi, yoksa yerinde mi kalır? Yerinde kalıyorsa her çekim tamponunu daraltır.',
      en: 'A payout lowers your balance — does the loss line come down with it, or stay where it was? If it stays, every withdrawal narrows your buffer.',
    },
    keywords: '"Drawdown Lock Upon Payout", "Payout Drawdown Adjustment", "Withdrawal Impact on Drawdown", "Buffer after withdrawal"',
    options: [
      { tr: 'Çekim çizgiyi etkilemez, taban çekim oranında aşağı iner', en: 'The line drops with the withdrawal, buffer preserved', points: 2 },
      { tr: 'Taban yerinde kalır, tampon çekim kadar daralır', en: 'The line stays, the buffer narrows by the amount withdrawn', points: 1 },
      { tr: 'Taban başlangıç bakiyesinde kilitlenir', en: 'The line locks at the starting balance', points: 0.5 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Para çektiğinde bakiyen düşer. Peki zarar çizgin ne yapar? Üç ihtimal var:' },
      { p: '**Çizgi de aşağı iner:** Çektiğin oranda çizgi de düşer, tamponun korunur. En iyi senaryo.' },
      { p: '**Çizgi yerinde kalır:** Bakiyen düşer ama çizgi durduğu yerde kalır — yani aradaki mesafe, yani hareket alanın daralır. En yaygın model.' },
      { p: '**Çizgi başlangıç bakiyende kilitlenir:** Çekim yaptığın anda çizgi başladığın seviyeye sabitlenir. Kârının tamamını çekersen tamponun tam olarak sıfır olur.' },
      { p: 'Bu üçüncü durum tehlikelidir çünkü hesabın kâğıt üstünde "dolu" görünür ama tek bir küçük zararda kapanabilir.' },
      { h: 'Örnek ($100.000 hesap, taban $100.000\'da kilitlenen firma)' },
      { p: '$10.000 kâr yaptın, bakiyen $110.000.' },
      { p: '**Durum A — $5.000 çektin:** Bakiye $105.000, taban $100.000 → **$5.000 tamponun var.** Rahatça işleme devam edersin.' },
      { p: '**Durum B — $10.000\'ın tamamını çektin:** Bakiye $100.000, taban $100.000 → **Tamponun sıfır.** Açtığın ilk işlemde spread ve komisyon kadar bile düşsen equity $100.000\'ın altına iner ve hesap kapanır. Çekim işlenir ama hesabı kaybedersin.' },
      { p: '**Pratik kural:** Çekim sonrası kalan tampon, aynı anda alabileceğin toplam riskten belirgin şekilde büyük olmalı. Üç işlemde toplam $3.000 riske giriyorsan, çekimden sonra en az $5.000-6.000 tampon bırak. Kârın tamamını asla çekme.' },
    ],
  },

  {
    id: 'weekend',
    max: 1,
    title: { tr: 'Hafta Sonu Pozisyon Taşıma', en: 'Holding Over the Weekend' },
    short: {
      tr: 'Cuma kapanışından Pazartesi açılışına pozisyonu açık taşıyabilme. Gece taşımadan ayrı bir kuraldır. Serbest olsa bile endeks/petrolde swap maliyeti yükselir ve Pazartesi açılış boşluğu stop\'unu atlayabilir.',
      en: 'Holding from Friday\'s close to Monday\'s open. A separate rule from overnight holding. Even when allowed, swap costs rise on indices and oil, and Monday\'s gap can jump over your stop.',
    },
    keywords: '"Weekend Holding", "Hold Over Weekend", "Friday Close", "Weekend Gap Risk", "Flat by Friday", "Swing Add-on"',
    options: [
      { tr: 'Serbest', en: 'Allowed', points: 1 },
      { tr: 'Ek paket (add-on) ile serbest', en: 'Allowed with a paid add-on', points: 0.75 },
      { tr: 'Yasak — Cuma kapanışında otomatik kapanıyor', en: 'Banned — closed automatically at Friday\'s close', points: 0.25 },
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Cuma kapanışından Pazartesi açılışına kadar pozisyonunu açık tutabilme hakkı. Gece taşımadan **ayrı bir kuraldır** — bazı firmalar hafta içi geceleri serbest bırakır ama hafta sonunu yasaklar.' },
      { p: 'Yasaksa, Cuma kapanışından önce her şeyi kapatmak zorundasın; sistem genelde otomatik kapatır. Serbest olsa bile iki yan etkiyi bilmek gerekir:' },
      { p: '**Swap maliyeti:** Hafta sonu için genelde üç günlük faiz işlenir. Endeks ve petrolde bu rakam ciddi olabilir, forex ve altında daha makuldür.' },
      { p: '**Boşluk (gap) riski:** Piyasa Cuma kapanır, Pazartesi farklı bir fiyattan açılır. Arada bir haber çıkarsa fiyat stop\'unun çok ötesinden açabilir — yani stop\'un seni koruyamaz, beklediğinden fazla zarar edersin.' },
      { h: 'Örnek' },
      { p: 'Cuma günü altında alım pozisyonun var, $50 uzağa stop koymuşsun.' },
      { p: '**Normal senaryo:** Pazartesi fiyat biraz aşağıdan açar, stop\'un normal çalışır, planladığın zararı edersin.' },
      { p: '**Gap senaryosu:** Hafta sonu jeopolitik bir gelişme oldu. Pazartesi altın, Cuma kapanışının $80 altından açtı. Stop\'un $50\'de olmasına rağmen ilk işlem gören fiyat $80 aşağıda — pozisyonun orada kapanır. Planladığın zararın neredeyse iki katını yersin.' },
      { p: 'Bu yüzden hafta sonu taşırken, günlük ve toplam çizgilerine normalden daha fazla mesafe bırakmak gerekir.' },
    ],
  },
];

/** Tüm maddelerin en yüksek puanları toplamı — 100. */
export const PROP_MAX_SCORE = PROP_CRITERIA.reduce((sum, c) => sum + c.max, 0);

/** Her maddede en kötü seçenek seçilseydi çıkacak puan — tabanın sıfır olmadığını gösterir. */
export const PROP_MIN_SCORE = PROP_CRITERIA.reduce(
  (sum, c) => sum + Math.min(...c.options.map(o => o.points)), 0);

export interface ScoreBand {
  min: number;
  tr: string;
  en: string;
  color: string;
}

export const SCORE_BANDS: ScoreBand[] = [
  { min: 85, tr: 'Kusursuza yakın — nadir bulunur', en: 'Near flawless — rare', color: '#34d399' },
  { min: 70, tr: 'Güçlü hesap, sektörün üst dilimi', en: 'Strong account, top of the field', color: '#a3e635' },
  { min: 55, tr: 'Ortalama — çoğu firma bu bantta', en: 'Average — where most firms sit', color: '#fbbf24' },
  { min: 40, tr: 'Zayıf, ciddi kısıtlar var', en: 'Weak, with serious restrictions', color: '#fb923c' },
  { min: 0, tr: 'Kötü', en: 'Poor', color: '#f87171' },
];

export const bandFor = (score: number): ScoreBand =>
  SCORE_BANDS.find(b => score >= b.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
