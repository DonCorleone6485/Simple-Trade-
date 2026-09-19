import { PropPack } from './core';

/** Türkçe metinler. Seçenek sırası core.ts'teki `points` dizisiyle aynıdır. */
const tr: PropPack = {
  drawdown: {
    title: 'Maksimum Zarar Çizgisinin Tipi (Drawdown)',
    short: 'Hesabın ölüm çizgisi — altına inersen hesap biter. Soru şu: bu çizgi baştan sabit mi duruyor, yoksa sen kâr ettikçe yukarı mı kayıyor? Kayan bir çizgi, kâğıt üstündeki kârını geri verdiğinde seni patlatabilir. Bu, bir hesabı diğerinden ayıran en belirleyici tek değişkendir.',
    options: [
      'Sabit — baştan belirlenir, hiç oynamaz (Static)',
      'Kapalı bakiyeyi takip eder, başa baş noktasında kilitlenir',
      'Kapalı bakiyeyi takip eder, kilitlenme yok (Balance/EOD trailing)',
      'Açık pozisyon kârını da takip eder (Equity trailing)',
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

  news: {
    title: 'Haber Anında İşlem',
    short: 'Yüksek etkili haber anında işlem açıp kapatabiliyor musun? Kısıt varsa asıl mesele kısıtın kendisi değil, **ihlalin sonucu**: sadece o işlemin kârı mı siliniyor, yoksa hesap mı kapanıyor?',
    options: [
      'Tamamen serbest, zaman penceresi yok',
      'Ek paket (add-on) ile serbest',
      'Yasak penceresi var (±2, ±4, ±5 dk), önceden açılmış işlem muaf',
      'Yasak penceresi var (±2, ±4, ±5 dk), ihlalde sadece kâr siliniyor',
      'Yasak penceresi var (±2, ±4, ±5 dk), ihlalde hesap kapanıyor',
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

  floating: {
    title: 'Açık Pozisyon Zarar Limiti (Floating)',
    short: 'Açık pozisyonlarındaki **henüz kapatmadığın** zarara bakan ayrı bir sınır. Eşiği aşarsan sistem tüm pozisyonları anında kapatır — günlük limitine hiç yaklaşmamış olsan bile. Aynı anda birden fazla işlem açanlar için en sinsi kural.',
    options: [
      'Yok',
      'Var, eşik %4 ve üstü',
      'Var, eşik %3',
      'Var, eşik %2',
      'Var, eşik %2 altı',
    ],
    detail: [
      { h: 'Açıklama' },
      { p: 'Normalde iki zarar sınırı bilirsin: günlük ve toplam. Bu üçüncü bir sınır ve farklı çalışır — **sadece açık pozisyonlarındaki henüz kapatmadığın zarara** bakar.' },
      { p: 'Eşiği aşarsan sistem beklemez: tüm pozisyonlarını anında kapatır. Bazı firmalarda hesap da kapanır, bazılarında ilk seferde ceza (kâr payının düşürülmesi) verilir, ikinci seferde hesap kapatılır.' },
      { p: 'Neden sinsi? Çünkü **günlük limitine hiç yaklaşmamış olabilirsin**. Tek tek bakınca hepsi makul riskli birkaç pozisyon açarsın, ama açık zararları toplandığında bu eşiği aşar ve sistem seni piyasadan çıkarır — belki de pozisyonların dönmesine bir adım kala.' },
      { h: 'Örnek ($100.000 hesap, %2 eşik = $2.000)' },
      { p: 'Sabah üç işlem açtın, her birinin riski $1.000:' },
      { ul: ['XAUUSD long → şu an −$700', 'EURUSD long → şu an −$700', 'GBPUSD long → şu an −$700'] },
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

  dailyBase: {
    title: 'Günlük Zarar Çizgisinin Hesaplama Tabanı',
    short: 'Günlük çizgi her gün sıfırlanıp yeniden hesaplanır. Soru: neyin üzerinden? Yükseği kullanılıyorsa, gece taşıdığın kâğıt üstü kâr çizgiyi yukarı iter — ertesi gün o kârı geri verdiğinde, hiç gerçek zarar etmemişken hesap patlayabilir.',
    options: [
      'Günlük limit hiç yok',
      'Bakiye tabanlı — açık kâr çizgiyi itmez',
      'Bakiye ile equity\'nin yükseği alınır',
      'Gün içi equity zirvesinden hesaplanır',
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

  consistency: {
    title: 'Kâr Dağılımı Kuralı (Consistency)',
    short: 'En iyi gününün, toplam kârının belirli bir yüzdesini geçememesi kuralı. Hesabı kapatmaz ama ödemeyi bekletir. Dikkat: bazı firmalarda değerlendirmede yok ama fonlandıktan sonra devreye giriyor.',
    options: ['Yok', '%50 ve üstü', '%40 – %49', '%30 – %39', '%30 altı'],
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

  overnight: {
    title: 'Gece Pozisyon Taşıma',
    short: 'Pozisyonu gece boyunca, gün değişimini aşarak açık tutabilme. Yasaksa gün içinde açtığın her pozisyonu seans sonunda kapatmak zorundasın.',
    options: ['Serbest', 'Ek paket (add-on) ile serbest', 'Yasak — seans sonunda otomatik kapanıyor'],
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

  payout: {
    title: 'Ödeme Sıklığı',
    short: 'Kârını ne sıklıkla çekebiliyorsun ve ilk çekim için ne kadar beklemen gerekiyor? Çekilmemiş kâr her zaman risk altındadır.',
    options: [
      'İstediğin an (On-demand)',
      'Haftalık (7 gün)',
      '10 – 14 gün',
      'Ek paket (add-on) ile 14 güne iniyor',
      'Aylık (28 – 30 gün)',
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

  riskPerTrade: {
    title: 'İşlem veya Enstrüman Başına Risk Limiti',
    short: 'Toplam günlük limitin dışında, tek bir işlemde veya enstrümanda ne kadar riske girebileceğine dair ayrı bir tavan. Aynı enstrümandaki pozisyonlar toplanarak tek işlem sayılır.',
    options: [
      'Yok',
      'Var, eşik %3 ve üstü',
      'Var, eşik %2 – %3',
      'Var, eşik %2 altı',
      'Lot tavanı var (enstrüman bazlı)',
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

  stopLoss: {
    title: 'Stop-Loss Kuralı',
    short: 'Stop koymak zorunlu mu? Koyduğun stop platformda görünür kalmak zorunda mı? "Stop koy, sonra kaldır, fiyat gelince elle kapat" yöntemi bazı firmalarda gizli stop sayılır ve yasaktır.',
    options: [
      'Zorunlu değil, görünürlük şartı da yok',
      'Zorunlu değil ama koyulursa görünür kalmalı',
      'Zorunlu (belirli süre içinde konmalı)',
      'Zorunlu + maksimum mesafe şartı var',
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

  minDays: {
    title: 'Minimum İşlem Günü',
    short: 'Hedefi tutturmuş olsan bile geçmek için gereken minimum gün sayısı. Kritik ayrım: sadece **işlem açman** mı yeterli, yoksa o gün **kâr etmen** de şart mı?',
    options: [
      'Yok (0 gün)',
      '1 – 4 gün, düz gün (kâr şartı yok)',
      '5 gün ve üstü, düz gün',
      'Kârlı gün şartı var',
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

  payoutDrawdown: {
    title: 'Çekim Sonrası Zarar Çizgisinin Davranışı',
    short: 'Para çektiğinde bakiyen düşer — peki zarar çizgin de düşer mi, yoksa yerinde mi kalır? Yerinde kalıyorsa her çekim tamponunu daraltır.',
    options: [
      'Çekim çizgiyi etkilemez, taban çekim oranında aşağı iner',
      'Taban yerinde kalır, tampon çekim kadar daralır',
      'Taban başlangıç bakiyesinde kilitlenir',
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

  weekend: {
    title: 'Hafta Sonu Pozisyon Taşıma',
    short: 'Cuma kapanışından Pazartesi açılışına pozisyonu açık taşıyabilme. Gece taşımadan ayrı bir kuraldır. Serbest olsa bile endeks/petrolde swap maliyeti yükselir ve Pazartesi açılış boşluğu stop\'unu atlayabilir.',
    options: ['Serbest', 'Ek paket (add-on) ile serbest', 'Yasak — Cuma kapanışında otomatik kapanıyor'],
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
};

export default tr;
