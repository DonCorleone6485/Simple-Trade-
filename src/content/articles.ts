/**
 * Rehberler ve blog yazıları (/guides/…, /blog/…).
 *
 * Neden var: uygulamanın içindeki kurulum anlatımları Google'dan
 * bulunamıyordu; "MT5 trading journal", "how to keep a trading journal" gibi
 * aramalardan gelecek kişinin inebileceği bir sayfa yoktu. Bu sayfalar
 * derlemede önceden çiziliyor (scripts/prerender.mjs), yani JavaScript
 * çalıştırmayan botlar da içeriği görüyor.
 *
 * Dil: İngilizce (arama trafiğinin çoğu) ve Türkçe. Öbür dillerde İngilizce
 * gösteriliyor — kısa metinler değil, uzun yazılar; yarım yamalak çeviri
 * yerine düzgün İngilizce daha iyi.
 *
 * Yazılar yalnızca sitenin gerçekten yaptığını anlatıyor; rakiplerle ilgili
 * doğrulanmamış iddia yok.
 */
export type ArticleLang = 'en' | 'tr';

export type Block =
  | { h2: string }
  | { p: string }
  | { ol: string[] }
  | { ul: string[] }
  | { code: string }
  | { note: string };

export interface Article {
  slug: string;
  section: 'guides' | 'blog';
  /** Yayın / son güncelleme tarihi (YYYY-AA-GG). */
  date: string;
  minutes: number;
  title: Record<ArticleLang, string>;
  description: Record<ArticleLang, string>;
  body: Record<ArticleLang, Block[]>;
}

export const articlePath = (a: Pick<Article, 'section' | 'slug'>) => `/${a.section}/${a.slug}`;

export const ARTICLES: Article[] = [
  {
    slug: 'metatrader-5-auto-sync',
    section: 'guides',
    date: '2026-09-27',
    minutes: 5,
    title: {
      en: 'How to connect MetaTrader 5 to your trading journal',
      tr: 'MetaTrader 5\'i trading journal\'ına nasıl bağlarsın',
    },
    description: {
      en: 'Step-by-step: install the Simple Trading Journal add-on in MT5 so every closed trade lands in your journal automatically — including stop loss, risk and fees.',
      tr: 'Adım adım: Simple Trading Journal eklentisini MT5\'e kur, kapanan her işlem stop, risk ve masraflarıyla birlikte journal\'ına kendiliğinden gelsin.',
    },
    body: {
      en: [
        { p: 'Typing every trade into a journal by hand is the main reason people stop journaling. With the MetaTrader 5 add-on, each trade is recorded the moment it opens and completed when it closes — entry, exit, stop loss, lot size, commission and swap included. You only add what MetaTrader cannot know: your setup, your reasoning and how you felt.' },
        { h2: 'What you need' },
        { ul: [
          'MetaTrader 5 on Windows or Mac (the desktop terminal — the mobile app cannot run add-ons).',
          'A Simple Trading Journal account with at least one journal.',
          'Two minutes.',
        ] },
        { h2: '1. Download the add-on' },
        { p: 'In the app, open MetaTrader from the menu and download SimpleTradingJournal.ex5. In MetaTrader choose File → Open Data Folder, go into MQL5 → Experts, and drop the file there.' },
        { note: 'On a Mac, "Open Data Folder" does not work in some builds. In Finder use Go → Go to Folder and paste: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts' },
        { h2: '2. Allow the connection' },
        { p: 'MetaTrader blocks internet requests from add-ons unless you allow the address. Go to Tools → Options → Expert Advisors, tick "Allow WebRequest for listed URL" and add:' },
        { code: 'https://www.simpletradejournal.io' },
        { h2: '3. Restart MetaTrader' },
        { p: 'Close MetaTrader and open it again. SimpleTradingJournal now appears under Expert Advisors in the Navigator panel on the left.' },
        { h2: '4. Drag it onto a chart and paste your key' },
        { p: 'In the app, create a connection key (it starts with stj_). Drag SimpleTradingJournal onto any chart, open the Inputs tab, paste the key into ApiKey and click OK. When the top-left of the chart shows that the connection is working, you are done.' },
        { p: 'Each key belongs to one journal and locks to the first trading account that connects with it, so trades from two accounts never mix in the same journal. For a second account, create a second key.' },
        { h2: 'Which chart should it go on?' },
        { p: 'MetaTrader runs one expert advisor per chart. If you already use another EA, open a new, empty chart just for the journal add-on and leave it open — every closed trade then arrives on its own while you keep trading on your other charts. If you would rather not keep an extra chart, you can drop the add-on on a chart only when you want to sync; it catches up on everything closed in between.' },
        { h2: 'What gets recorded' },
        { ul: [
          'Symbol, direction, lot size, entry and exit price and time.',
          'Stop loss and take profit. The stop you entered with is kept even if you move it later, so your risk and R-multiples stay honest.',
          'Gross result, commission and swap, and the net result.',
          'A position closed in parts (TP1, TP2…) is recorded as one trade once it is fully closed.',
        ] },
        { h2: 'Troubleshooting' },
        { ul: [
          'Nothing arrives: check that the address in step 2 is exactly https://www.simpletradejournal.io, that the chart with the add-on is still open, and that the key was pasted without spaces.',
          '"Key bound to another account": the key already belongs to a different trading account. Create a new key for this account.',
          'Lost the key: MetaTrader remembers it. If you really lost it, create a new one in the app and revoke the old one.',
        ] },
        { p: 'Prefer not to install anything? You can also import MetaTrader\'s own report file — see the import guide.' },
      ],
      tr: [
        { p: 'Her işlemi journal\'a elle yazmak, insanların journal tutmayı bırakmasının bir numaralı sebebi. MetaTrader 5 eklentisiyle her işlem açıldığı anda kaydediliyor, kapandığında tamamlanıyor: giriş, çıkış, stop, lot, komisyon ve swap dahil. Sen yalnızca MetaTrader\'ın bilemeyeceğini eklersin: setup\'ın, gerekçen ve o anki hislerin.' },
        { h2: 'Ne gerekiyor' },
        { ul: [
          'Windows ya da Mac\'te MetaTrader 5 (masaüstü uygulaması — mobil uygulama eklenti çalıştıramaz).',
          'En az bir journal\'ı olan bir Simple Trading Journal hesabı.',
          'İki dakika.',
        ] },
        { h2: '1. Eklentiyi indir' },
        { p: 'Uygulamada menüden MetaTrader\'ı aç ve SimpleTradingJournal.ex5 dosyasını indir. MetaTrader\'da Dosya → Veri Klasörünü Aç, açılan pencerede MQL5 → Experts klasörüne gir ve dosyayı içine at.' },
        { note: 'Mac\'te "Veri Klasörünü Aç" bazı sürümlerde çalışmaz. O zaman Finder\'da Git → Klasöre Git ile şuraya git: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts' },
        { h2: '2. Bağlantıya izin ver' },
        { p: 'MetaTrader, adresine izin vermediğin sürece eklentilerin internete çıkmasını engeller. Araçlar → Seçenekler → Uzman Danışmanlar sekmesinde "Listelenen URL\'ler için WebRequest\'e izin ver" kutusunu işaretle ve şu adresi ekle:' },
        { code: 'https://www.simpletradejournal.io' },
        { h2: '3. MetaTrader\'ı yeniden başlat' },
        { p: 'MetaTrader\'ı kapatıp yeniden aç. SimpleTradingJournal artık soldaki Kılavuz panelinde Uzman Danışmanlar altında görünür.' },
        { h2: '4. Grafiğe sürükle ve anahtarı yapıştır' },
        { p: 'Uygulamada bir bağlantı anahtarı oluştur (stj_ ile başlar). SimpleTradingJournal\'ı herhangi bir grafiğin üstüne sürükle, Girdiler sekmesine geç, anahtarı ApiKey satırına yapıştır ve Tamam\'a bas. Grafiğin sol üstünde bağlantının çalıştığı yazınca iş bitti.' },
        { p: 'Her anahtar bir journal\'a ait ve onunla bağlanan ilk işlem hesabına kilitlenir; böylece iki hesabın işlemleri aynı journal\'da karışmaz. İkinci bir hesap için ikinci bir anahtar oluştur.' },
        { h2: 'Hangi grafiğe koymalıyım?' },
        { p: 'MetaTrader bir grafikte yalnızca bir uzman danışman çalıştırır. Başka bir EA kullanıyorsan journal eklentisi için yeni, boş bir grafik aç ve açık bırak — öbür grafiklerde işlem yapmaya devam ederken kapanan her işlem kendiliğinden gelir. Fazladan grafik istemiyorsan eklentiyi yalnızca güncellemek istediğinde bir grafiğe koyabilirsin; arada kapananların hepsini yakalar.' },
        { h2: 'Neler kaydediliyor' },
        { ul: [
          'Sembol, yön, lot, giriş ve çıkış fiyatı ve saati.',
          'Stop ve kâr al. Sonradan taşısan da girdiğin andaki stop korunur; böylece riskin ve R değerlerin doğru kalır.',
          'Brüt sonuç, komisyon, swap ve net sonuç.',
          'Parça parça kapatılan bir pozisyon (TP1, TP2…) tamamen kapandığında tek işlem olarak kaydedilir.',
        ] },
        { h2: 'Sorun giderme' },
        { ul: [
          'Hiçbir şey gelmiyor: 2. adımdaki adresin tam olarak https://www.simpletradejournal.io olduğundan, eklentinin olduğu grafiğin açık olduğundan ve anahtarın boşluksuz yapıştırıldığından emin ol.',
          '"Anahtar başka hesaba bağlı": anahtar zaten başka bir işlem hesabına ait. Bu hesap için yeni bir anahtar oluştur.',
          'Anahtarı kaybettim: MetaTrader onu hatırlıyor. Gerçekten kaybettiysen uygulamada yenisini oluştur, eskisini iptal et.',
        ] },
        { p: 'Hiçbir şey kurmak istemiyor musun? MetaTrader\'ın kendi rapor dosyasını da içe aktarabilirsin — içe aktarma rehberine bak.' },
      ],
    },
  },
  {
    slug: 'import-trade-history',
    section: 'guides',
    date: '2026-09-27',
    minutes: 4,
    title: {
      en: 'How to import your trade history into a trading journal',
      tr: 'İşlem geçmişini trading journal\'ına nasıl aktarırsın',
    },
    description: {
      en: 'Import closed trades from MetaTrader 4/5, cTrader, TradeLocker, DXtrade or Match-Trader. How to get the right report, what is read from it and how duplicates are avoided.',
      tr: 'MetaTrader 4/5, cTrader, TradeLocker, DXtrade veya Match-Trader\'dan kapanmış işlemleri içe aktar. Doğru rapor nasıl alınır, içinden ne okunur, çift kayıt nasıl önlenir.',
    },
    body: {
      en: [
        { p: 'If you already have months of trades, you do not have to type them in. Export a report from your platform and drop it into the journal — the file is read in your browser, the platform is recognised automatically and you see every trade before anything is saved.' },
        { h2: 'Supported platforms' },
        { ul: ['MetaTrader 5 and MetaTrader 4 (the HTML report)', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader', 'Any other CSV — you pick which column is the date, symbol, direction and result'] },
        { h2: 'Getting the right MetaTrader report' },
        { ol: [
          'In MetaTrader open the Toolbox (Ctrl+T) and go to the History tab.',
          'Right-click inside the list and choose the period you want (for example "All history").',
          'Right-click again → Report, and save it as HTML.',
        ] },
        { note: 'Do not use the account report that only shows balance and open positions — it contains no closed trades. If the importer says it found no closed trades, this is almost always the reason.' },
        { h2: 'Importing' },
        { ol: [
          'In the app choose Import and pick the journal the trades should go into.',
          'Drag the file onto the window or click to choose it.',
          'Check the preview: symbol, direction, lots, prices, times and the net result of each trade.',
          'Confirm. The trades appear in your journal, calendar and statistics.',
        ] },
        { h2: 'What is read from the report' },
        { ul: [
          'The net result — commission, swap and fees are taken into account, not just the gross profit.',
          'The stop loss, so each trade\'s risk and R-multiple can be calculated.',
          'Entry and exit prices and times.',
        ] },
        { h2: 'Importing the same file twice' },
        { p: 'Every trade carries its platform ID, so a trade that is already in the journal is skipped instead of added again. You can import an updated report every week without cleaning anything up. If you logged a trade by hand while it was still open, the import completes that entry instead of creating a second one.' },
        { p: 'Want this to happen by itself? Connect MetaTrader 5 once and closed trades arrive automatically — see the MetaTrader 5 guide.' },
      ],
      tr: [
        { p: 'Aylardır işlem yapıyorsan hepsini tek tek yazmana gerek yok. Platformundan bir rapor al ve journal\'a bırak — dosya tarayıcında okunur, platform kendiliğinden tanınır ve hiçbir şey kaydedilmeden önce bütün işlemleri görürsün.' },
        { h2: 'Desteklenen platformlar' },
        { ul: ['MetaTrader 5 ve MetaTrader 4 (HTML raporu)', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader', 'Başka herhangi bir CSV — tarih, sembol, yön ve sonuç sütununu sen seçersin'] },
        { h2: 'Doğru MetaTrader raporunu almak' },
        { ol: [
          'MetaTrader\'da Araç Kutusu\'nu aç (Ctrl+T) ve Geçmiş sekmesine geç.',
          'Listenin içinde sağ tıkla ve istediğin dönemi seç (örneğin "Tüm geçmiş").',
          'Yeniden sağ tıkla → Rapor, HTML olarak kaydet.',
        ] },
        { note: 'Yalnızca bakiye ve açık pozisyonları gösteren hesap raporunu kullanma — içinde kapanmış işlem yoktur. İçe aktarma "kapanmış işlem bulunamadı" diyorsa sebep neredeyse her zaman budur.' },
        { h2: 'İçe aktarma' },
        { ol: [
          'Uygulamada İçe Aktar\'ı seç ve işlemlerin gideceği journal\'ı belirle.',
          'Dosyayı pencereye sürükle ya da tıklayıp seç.',
          'Önizlemeyi kontrol et: her işlemin sembolü, yönü, lotu, fiyatları, saatleri ve net sonucu.',
          'Onayla. İşlemler journal\'ında, takviminde ve istatistiklerinde görünür.',
        ] },
        { h2: 'Rapordan neler okunuyor' },
        { ul: [
          'Net sonuç — yalnızca brüt kâr değil; komisyon, swap ve masraflar hesaba katılır.',
          'Stop seviyesi; böylece her işlemin riski ve R değeri hesaplanır.',
          'Giriş ve çıkış fiyatları ve saatleri.',
        ] },
        { h2: 'Aynı dosyayı iki kez aktarmak' },
        { p: 'Her işlem platformdaki kimliğini taşır; journal\'da zaten olan işlem yeniden eklenmez, atlanır. Her hafta güncel raporu hiçbir şeyi temizlemeden aktarabilirsin. İşlem açıkken elle kaydettiysen, içe aktarma ikinci bir kayıt açmak yerine o kaydı tamamlar.' },
        { p: 'Bunun kendiliğinden olmasını mı istersin? MetaTrader 5\'i bir kez bağla, kapanan işlemler otomatik gelsin — MetaTrader 5 rehberine bak.' },
      ],
    },
  },
  {
    slug: 'how-to-keep-a-trading-journal',
    section: 'blog',
    date: '2026-09-27',
    minutes: 6,
    title: {
      en: 'How to keep a trading journal you will actually use',
      tr: 'Gerçekten kullanacağın bir trading journal nasıl tutulur',
    },
    description: {
      en: 'What to record for each trade, how often to review it, and the habits that turn a trading journal from a spreadsheet you abandon into your most useful trading tool.',
      tr: 'Her işlem için neyi kaydetmeli, ne sıklıkla gözden geçirmeli ve trading journal\'ı yarıda bırakılan bir tablodan en faydalı araca çeviren alışkanlıklar.',
    },
    body: {
      en: [
        { p: 'Most traders agree that a journal helps, and most traders stop keeping one within a few weeks. The problem is rarely discipline. It is that the journal asks for too much at the wrong moment and gives nothing back. A journal you will actually use is short to fill in, fast to review, and shows you something you could not see on your own.' },
        { h2: 'What to record for every trade' },
        { p: 'Split it into what the platform knows and what only you know.' },
        { ul: [
          'The facts: symbol, direction, entry, exit, stop loss, size, result after fees. These should never be typed by hand — import them or sync them from your platform.',
          'The plan: which setup this was, and why you took it. One line is enough.',
          'The state: how you felt going in — calm, bored, rushed, trying to win back a loss.',
          'A screenshot of the chart at entry, if the setup is visual.',
        ] },
        { h2: 'Measure in R, not in money' },
        { p: 'A $300 win means little on its own. If you risked $100 it was a 3R trade; if you risked $600 it was half an R and a bad trade that happened to work. Recording your stop lets the journal express every result as a multiple of what you risked, and that is the number that shows whether your edge is real.' },
        { h2: 'Review on a schedule' },
        { ul: [
          'Daily, two minutes: did I follow my plan today? Anything to note while it is fresh?',
          'Weekly, fifteen minutes: which setups made money, which lost it, and on which days and sessions.',
          'Monthly: is the equity curve moving because of the setups I believe in, or despite them?',
        ] },
        { h2: 'Look for behaviour, not just statistics' },
        { p: 'Win rate and average R tell you what happened. The more useful questions are about how you behaved: did you take another trade minutes after a loss? Did your size go up after losing? Did you trade far more on some days than your plan allows, or outside the hours you normally trade? These patterns cost more than any single bad setup, and they are easy to miss trade by trade.' },
        { p: 'Simple Trading Journal checks these four habits automatically — revenge trading, raising risk after a loss, overtrading and trading outside your usual hours — across all your journals.' },
        { h2: 'Keep it low effort' },
        { ul: [
          'Automate the facts so that journaling a trade takes seconds, not minutes.',
          'Use a short checklist before entering instead of long notes afterwards.',
          'Tag setups consistently — five setups used every day beat fifty used once.',
          'Keep separate journals for separate accounts, such as a prop challenge and a personal account.',
        ] },
        { h2: 'Start small' },
        { p: 'You do not need a perfect system on day one. Record the facts automatically, add one line about why you took each trade, and look at it once a week. After a month you will have something no indicator can give you: evidence about your own trading.' },
      ],
      tr: [
        { p: 'Trader\'ların çoğu journal\'ın işe yaradığında hemfikir, çoğu da birkaç hafta içinde tutmayı bırakıyor. Sorun nadiren disiplin. Journal yanlış anda çok şey istiyor ve karşılığında hiçbir şey vermiyor. Gerçekten kullanacağın bir journal hızlı doldurulur, hızlı gözden geçirilir ve sana kendi başına göremeyeceğin bir şey gösterir.' },
        { h2: 'Her işlem için neyi kaydetmeli' },
        { p: 'İkiye ayır: platformun bildikleri ve yalnızca senin bildiklerin.' },
        { ul: [
          'Olgular: sembol, yön, giriş, çıkış, stop, lot, masraflar sonrası sonuç. Bunlar asla elle yazılmamalı — içe aktar ya da platformdan otomatik gelsin.',
          'Plan: hangi setup\'tı ve neden girdin. Bir satır yeter.',
          'Ruh hâli: girerken nasıldın — sakin, sıkılmış, aceleci, kaybı geri almaya çalışan.',
          'Setup görselse, giriş anındaki grafiğin ekran görüntüsü.',
        ] },
        { h2: 'Parayla değil, R ile ölç' },
        { p: '300 dolarlık kazanç tek başına pek bir şey söylemez. 100 dolar riske attıysan 3R\'lik bir işlemdir; 600 dolar riske attıysan yarım R\'dir ve şans eseri tutmuş kötü bir işlemdir. Stopunu kaydetmek, journal\'ın her sonucu riske attığının katı olarak göstermesini sağlar; avantajının gerçek olup olmadığını gösteren sayı budur.' },
        { h2: 'Belli aralıklarla gözden geçir' },
        { ul: [
          'Her gün, iki dakika: bugün planıma uydum mu? Tazeyken not edilecek bir şey var mı?',
          'Her hafta, on beş dakika: hangi setup\'lar kazandırdı, hangileri kaybettirdi; hangi günlerde ve seanslarda.',
          'Her ay: sermaye eğrim inandığım setup\'lar sayesinde mi ilerliyor, yoksa onlara rağmen mi?',
        ] },
        { h2: 'Yalnızca istatistiğe değil, davranışa bak' },
        { p: 'Kazanma oranı ve ortalama R ne olduğunu söyler. Daha faydalı sorular nasıl davrandığınla ilgili: bir kayıptan dakikalar sonra yeni işleme girdin mi? Kaybettikten sonra lotun büyüdü mü? Bazı günlerde planının izin verdiğinden çok daha fazla işlem yaptın mı, ya da alışık olduğun saatlerin dışında? Bu kalıplar tek bir kötü setup\'tan çok daha pahalıya patlar ve işlem işlem bakınca gözden kaçar.' },
        { p: 'Simple Trading Journal bu dört alışkanlığı — intikam işlemi, kayıptan sonra riski artırma, aşırı işlem ve alışık olmadığın saatlerde işlem — bütün journal\'larında kendiliğinden kontrol eder.' },
        { h2: 'Zahmetsiz tut' },
        { ul: [
          'Olguları otomatiğe bağla; bir işlemi kaydetmek dakikalar değil saniyeler sürsün.',
          'Sonradan uzun notlar yerine girmeden önce kısa bir kontrol listesi kullan.',
          'Setup\'ları tutarlı etiketle — her gün kullanılan beş setup, bir kez kullanılan elli setup\'tan iyidir.',
          'Ayrı hesaplar için ayrı journal tut; örneğin prop challenge ve kişisel hesap.',
        ] },
        { h2: 'Küçük başla' },
        { p: 'İlk gün mükemmel bir sisteme ihtiyacın yok. Olguları otomatik kaydet, her işlem için neden girdiğine dair bir satır ekle ve haftada bir bak. Bir ay sonra hiçbir indikatörün veremeyeceği bir şeyin olur: kendi trading\'in hakkında kanıt.' },
      ],
    },
  },
  {
    slug: 'r-multiple-explained',
    section: 'blog',
    date: '2026-09-27',
    minutes: 5,
    title: {
      en: 'R-multiples explained: judge every trade by the risk you took',
      tr: 'R değeri nedir: her işlemi aldığın riske göre değerlendir',
    },
    description: {
      en: 'What an R-multiple is, how to calculate it from your stop loss, and why expectancy in R is the clearest way to tell whether a trading strategy has an edge.',
      tr: 'R değeri nedir, stoptan nasıl hesaplanır ve bir stratejinin avantajı olup olmadığını anlamanın en net yolu neden R cinsinden beklentidir.',
    },
    body: {
      en: [
        { p: 'Money is a poor way to compare trades. The same $200 profit can be excellent or reckless depending on how much you put at risk to get it. R-multiples fix this by measuring every result against the risk you took.' },
        { h2: 'What is 1R?' },
        { p: '1R is the amount you stand to lose if the trade hits your stop loss. Buy at 1.1000 with a stop at 1.0950 and 1 lot, and 1R is whatever those 50 pips cost you — say $500.' },
        { h2: 'Calculating the R-multiple' },
        { code: 'R-multiple = result of the trade ÷ initial risk (1R)' },
        { ul: [
          'Won $1,000 with $500 at risk: +2R.',
          'Lost $500 at the stop: −1R.',
          'Lost $750 because you slipped or moved the stop: −1.5R — a sign something went wrong.',
          'Closed early for $150: +0.3R.',
        ] },
        { h2: 'Why it matters' },
        { p: 'Once every trade is in R, results become comparable across position sizes, instruments and accounts. You can see that a setup with a 40% win rate is excellent because its winners average +2.5R, or that a 70% win rate is a problem because the losers average −3R.' },
        { h2: 'Expectancy' },
        { p: 'Expectancy is your average R per trade. Add up the R of all trades and divide by the number of trades.' },
        { code: 'Expectancy = total R ÷ number of trades' },
        { p: 'Positive expectancy means that, on average, each trade has made you money relative to the risk taken. 0.3R over 100 trades is 30R; at 1% risk per trade that is roughly 30% before compounding. Negative expectancy means more trades will not help — the setup, the execution or the risk management has to change.' },
        { h2: 'Common mistakes' },
        { ul: [
          'Not recording the stop. Without it there is no 1R and no R-multiple.',
          'Using the moved stop instead of the original one. R measures the risk you accepted when you entered.',
          'Ignoring fees. Commission and swap are part of the result; a +1R trade can be +0.9R after costs.',
          'Judging a setup on a handful of trades. Look at at least 30 before drawing conclusions.',
        ] },
        { h2: 'In Simple Trading Journal' },
        { p: 'When a trade has a stop loss — typed in, imported from a report or synced from MetaTrader 5 — its risk and R-multiple are calculated automatically, and your statistics show your average realised R next to your results in money.' },
      ],
      tr: [
        { p: 'Para, işlemleri karşılaştırmak için kötü bir ölçü. Aynı 200 dolarlık kâr, onu kazanmak için ne kadar riske girdiğine bağlı olarak mükemmel de olabilir, pervasız da. R değeri her sonucu aldığın riske göre ölçerek bunu düzeltir.' },
        { h2: '1R nedir?' },
        { p: '1R, işlem stopa değerse kaybedeceğin tutardır. 1.1000\'den 1 lot al, stop 1.0950 olsun; 1R o 50 pip\'in sana maliyetidir — diyelim 500 dolar.' },
        { h2: 'R değerini hesaplamak' },
        { code: 'R değeri = işlemin sonucu ÷ başlangıç riski (1R)' },
        { ul: [
          '500 dolar riskle 1.000 dolar kazandın: +2R.',
          'Stopta 500 dolar kaybettin: −1R.',
          'Kayma ya da stopu taşıman yüzünden 750 dolar kaybettin: −1,5R — bir şeylerin ters gittiğinin işareti.',
          'Erken kapatıp 150 dolar aldın: +0,3R.',
        ] },
        { h2: 'Neden önemli' },
        { p: 'Her işlem R cinsinden olunca sonuçlar lot büyüklüğü, enstrüman ve hesap fark etmeksizin karşılaştırılabilir hâle gelir. %40 kazanma oranlı bir setup\'ın kazananları ortalama +2,5R olduğu için mükemmel olduğunu, ya da %70 kazanma oranının kaybedenler ortalama −3R olduğu için sorun olduğunu görürsün.' },
        { h2: 'Beklenti' },
        { p: 'Beklenti, işlem başına ortalama R\'dir. Bütün işlemlerin R\'sini topla, işlem sayısına böl.' },
        { code: 'Beklenti = toplam R ÷ işlem sayısı' },
        { p: 'Pozitif beklenti, her işlemin ortalamada aldığın riske göre sana para kazandırdığı anlamına gelir. 100 işlemde 0,3R, 30R eder; işlem başına %1 riskle bileşik etki olmadan kabaca %30. Negatif beklentide daha fazla işlem çözüm değildir — setup, uygulama ya da risk yönetimi değişmeli.' },
        { h2: 'Sık yapılan hatalar' },
        { ul: [
          'Stopu kaydetmemek. Stop yoksa 1R de R değeri de yoktur.',
          'İlk stop yerine taşınmış stopu kullanmak. R, girerken kabul ettiğin riski ölçer.',
          'Masrafları yok saymak. Komisyon ve swap sonucun parçası; +1R\'lik işlem masraflardan sonra +0,9R olabilir.',
          'Bir setup\'ı birkaç işleme bakıp değerlendirmek. Sonuç çıkarmadan önce en az 30 işleme bak.',
        ] },
        { h2: 'Simple Trading Journal\'da' },
        { p: 'Bir işlemin stopu varsa — elle yazılmış, rapordan aktarılmış ya da MetaTrader 5\'ten gelmiş — riski ve R değeri kendiliğinden hesaplanır; istatistiklerin, paradaki sonuçlarının yanında ortalama gerçekleşen R\'yi de gösterir.' },
      ],
    },
  },
  {
    slug: 'prop-firm-daily-loss-and-drawdown',
    section: 'blog',
    date: '2026-09-27',
    minutes: 5,
    title: {
      en: 'Daily loss and max drawdown: how to track prop firm rules without breaking them',
      tr: 'Günlük kayıp ve maksimum düşüş: prop firma kurallarını çiğnemeden nasıl takip edersin',
    },
    description: {
      en: 'How prop firm daily loss limits, maximum drawdown and profit targets usually work, why most challenges are lost to a rule rather than a bad trade, and how to always know your distance to the limit.',
      tr: 'Prop firmaların günlük kayıp sınırı, maksimum düşüş ve kâr hedefi genelde nasıl işler, challenge\'lar neden çoğunlukla kötü bir işlemle değil bir kuralla kaybedilir ve sınıra uzaklığını her an nasıl bilirsin.',
    },
    body: {
      en: [
        { p: 'Prop firm challenges are rarely lost because a strategy stops working. They are lost on a Tuesday afternoon when a trader, three losses in, does not realise they are $180 away from the daily limit. The rules are simple; knowing exactly where you stand against them, trade by trade, is the hard part.' },
        { note: 'Every firm words its rules differently and changes them over time. Always check your own firm\'s current rules — this article explains the common types, not any specific firm.' },
        { h2: 'The three numbers that decide a challenge' },
        { ul: [
          'Profit target: the gain you must reach, usually a percentage of the starting balance.',
          'Daily loss limit: how much you may lose within one trading day. Firms differ on whether it is measured from the day\'s starting balance or equity, and on when the day resets.',
          'Maximum loss (drawdown): how far the account may fall in total. It can be static (measured from the starting balance) or trailing (it follows your highest balance or equity upwards).',
        ] },
        { h2: 'Static vs trailing drawdown' },
        { p: 'With a static limit on a $100,000 account and a 10% maximum loss, the account fails below $90,000, whatever happened before. With a trailing limit, if the account first grows to $105,000 the floor moves up with it, to $95,000 in this example. Trailing limits punish giving back profits, so the distance to the limit can shrink even on a winning week.' },
        { h2: 'Why challenges are lost to rules' },
        { ul: [
          'Losses cluster. Three stops in a row in one session is normal, and often enough to reach a daily limit at 1% risk per trade plus fees.',
          'Open trades count. With equity-based rules, a floating loss can breach the limit before any trade is closed.',
          'Fees and swap count. The limit sees your net result, not your gross result.',
          'Behaviour changes under pressure. Revenge trades and bigger size after a loss are exactly what turns a bad day into a failed challenge.',
        ] },
        { h2: 'A simple protection routine' },
        { ol: [
          'Size positions so that a normal losing streak cannot reach the daily limit — for example, no more than a third of the daily limit at risk per trade.',
          'Before each trade, check how far you are from the daily and maximum limits.',
          'Set a personal stop well before the firm\'s: when you have lost half the daily limit, stop for the day.',
          'Review every day you came close. The pattern usually repeats.',
        ] },
        { h2: 'Tracking it in Simple Trading Journal' },
        { p: 'Mark a journal as a prop account, enter the firm\'s profit target, daily loss limit and maximum loss, and the journal shows how far you are from each one as you trade. Loss limits turn amber and then red as you approach them; the profit target turns green as you get closer. The discipline analysis flags revenge trades and rising risk after losses — the habits that end most challenges.' },
      ],
      tr: [
        { p: 'Prop challenge\'lar nadiren strateji çalışmayı bıraktığı için kaybedilir. Bir salı öğleden sonra, üç kayıp sonrasında günlük sınıra 180 dolar kaldığını fark etmeyen trader yüzünden kaybedilir. Kurallar basit; zor olan, işlem işlem onlara göre tam olarak nerede durduğunu bilmek.' },
        { note: 'Her firma kurallarını farklı yazar ve zamanla değiştirir. Her zaman kendi firmanın güncel kurallarına bak — bu yazı belirli bir firmayı değil, yaygın kural türlerini anlatıyor.' },
        { h2: 'Bir challenge\'ı belirleyen üç sayı' },
        { ul: [
          'Kâr hedefi: ulaşman gereken kazanç, genelde başlangıç bakiyesinin bir yüzdesi.',
          'Günlük kayıp sınırı: bir işlem gününde kaybedebileceğin tutar. Firmalar bunun günün başlangıç bakiyesinden mi varlıktan (equity) mı ölçüldüğü ve günün ne zaman sıfırlandığı konusunda farklılaşır.',
          'Maksimum kayıp (düşüş): hesabın toplamda ne kadar düşebileceği. Sabit olabilir (başlangıç bakiyesinden ölçülür) ya da takip eden (en yüksek bakiye veya varlıkla birlikte yukarı taşınır).',
        ] },
        { h2: 'Sabit ve takip eden düşüş' },
        { p: '100.000 dolarlık hesapta %10 sabit maksimum kayıpla hesap, önceden ne olursa olsun 90.000 doların altında düşer. Takip eden sınırda hesap önce 105.000 dolara çıkarsa taban da onunla yukarı taşınır, bu örnekte 95.000 dolara. Takip eden sınırlar kârı geri vermeyi cezalandırır; kazançlı bir haftada bile sınıra uzaklığın azalabilir.' },
        { h2: 'Challenge\'lar neden kurallara kaybedilir' },
        { ul: [
          'Kayıplar kümelenir. Bir seansta art arda üç stop normaldir ve işlem başına %1 risk ile masraflar eklenince günlük sınıra ulaşmaya çoğu zaman yeter.',
          'Açık işlemler sayılır. Varlığa dayalı kurallarda kapanmamış bir zarar, hiçbir işlem kapanmadan sınırı aşabilir.',
          'Masraf ve swap sayılır. Sınır brüt değil net sonucunu görür.',
          'Baskı altında davranış değişir. İntikam işlemleri ve kayıptan sonra büyüyen lot, kötü bir günü kaybedilmiş bir challenge\'a çeviren şeyin ta kendisi.',
        ] },
        { h2: 'Basit bir koruma düzeni' },
        { ol: [
          'Pozisyonları normal bir kayıp serisi günlük sınıra ulaşamayacak şekilde boyutlandır — örneğin işlem başına günlük sınırın üçte birinden fazlasını riske atma.',
          'Her işlemden önce günlük ve maksimum sınıra ne kadar uzak olduğuna bak.',
          'Firmanınkinden çok önce kendi durağını koy: günlük sınırın yarısını kaybettiysen o gün dur.',
          'Sınıra yaklaştığın her günü gözden geçir. Kalıp genelde tekrar eder.',
        ] },
        { h2: 'Simple Trading Journal\'da takip' },
        { p: 'Bir journal\'ı prop hesabı olarak işaretle, firmanın kâr hedefini, günlük kayıp sınırını ve maksimum kaybını gir; journal işlem yaptıkça her birine ne kadar uzak olduğunu gösterir. Kayıp sınırlarına yaklaştıkça çubuk sarıya sonra kırmızıya döner; kâr hedefine yaklaştıkça yeşile. Disiplin analizi de çoğu challenge\'ı bitiren alışkanlıkları — intikam işlemlerini ve kayıptan sonra artan riski — işaretler.' },
      ],
    },
  },
];

export const findArticle = (section: string, slug: string) =>
  ARTICLES.find(a => a.section === section && a.slug === slug);
