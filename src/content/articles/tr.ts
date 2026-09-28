/** Yazıların tr metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  "metatrader-5-auto-sync": {
    "title": "MetaTrader 5'i trading journal'ına nasıl bağlarsın",
    "description": "Adım adım: Simple Trading Journal eklentisini MT5'e kur, kapanan her işlem stop, risk ve masraflarıyla birlikte journal'ına kendiliğinden gelsin.",
    "body": [
      {
        "p": "Her işlemi journal'a elle yazmak, insanların journal tutmayı bırakmasının bir numaralı sebebi. MetaTrader 5 eklentisiyle her işlem açıldığı anda kaydediliyor, kapandığında tamamlanıyor: giriş, çıkış, stop, lot, komisyon ve swap dahil. Sen yalnızca MetaTrader'ın bilemeyeceğini eklersin: setup'ın, gerekçen ve o anki hislerin."
      },
      {
        "note": "MetaTrader 4 mü kullanıyorsun? Adımlar aynı: MetaTrader ekranında MetaTrader 4'ü seç, SimpleTradingJournal.ex4 dosyasını indir ve MQL4 → Experts klasörüne koy."
      },
      {
        "h2": "Ne gerekiyor"
      },
      {
        "ul": [
          "Windows ya da Mac'te MetaTrader 5 (masaüstü uygulaması — mobil uygulama eklenti çalıştıramaz).",
          "En az bir journal'ı olan bir Simple Trading Journal hesabı.",
          "İki dakika."
        ]
      },
      {
        "h2": "1. Eklentiyi indir"
      },
      {
        "p": "Uygulamada menüden MetaTrader'ı aç ve SimpleTradingJournal.ex5 dosyasını indir. MetaTrader'da Dosya → Veri Klasörünü Aç, açılan pencerede MQL5 → Experts klasörüne gir ve dosyayı içine at."
      },
      {
        "note": "Mac'te \"Veri Klasörünü Aç\" bazı sürümlerde çalışmaz. O zaman Finder'da Git → Klasöre Git ile şuraya git: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts"
      },
      {
        "h2": "2. Bağlantıya izin ver"
      },
      {
        "p": "MetaTrader, adresine izin vermediğin sürece eklentilerin internete çıkmasını engeller. Araçlar → Seçenekler → Uzman Danışmanlar sekmesinde \"Listelenen URL'ler için WebRequest'e izin ver\" kutusunu işaretle ve şu adresi ekle:"
      },
      {
        "code": "https://www.simpletradejournal.io"
      },
      {
        "h2": "3. MetaTrader'ı yeniden başlat"
      },
      {
        "p": "MetaTrader'ı kapatıp yeniden aç. SimpleTradingJournal artık soldaki Kılavuz panelinde Uzman Danışmanlar altında görünür."
      },
      {
        "h2": "4. Grafiğe sürükle ve anahtarı yapıştır"
      },
      {
        "p": "Uygulamada bir bağlantı anahtarı oluştur (stj_ ile başlar). SimpleTradingJournal'ı herhangi bir grafiğin üstüne sürükle, Girdiler sekmesine geç, anahtarı ApiKey satırına yapıştır ve Tamam'a bas. Grafiğin sol üstünde bağlantının çalıştığı yazınca iş bitti."
      },
      {
        "p": "Her anahtar bir journal'a ait ve onunla bağlanan ilk işlem hesabına kilitlenir; böylece iki hesabın işlemleri aynı journal'da karışmaz. İkinci bir hesap için ikinci bir anahtar oluştur."
      },
      {
        "h2": "Hangi grafiğe koymalıyım?"
      },
      {
        "p": "MetaTrader bir grafikte yalnızca bir uzman danışman çalıştırır. Başka bir EA kullanıyorsan journal eklentisi için yeni, boş bir grafik aç ve açık bırak — öbür grafiklerde işlem yapmaya devam ederken kapanan her işlem kendiliğinden gelir. Fazladan grafik istemiyorsan eklentiyi yalnızca güncellemek istediğinde bir grafiğe koyabilirsin; arada kapananların hepsini yakalar."
      },
      {
        "h2": "Neler kaydediliyor"
      },
      {
        "ul": [
          "Sembol, yön, lot, giriş ve çıkış fiyatı ve saati.",
          "Stop ve kâr al. Sonradan taşısan da girdiğin andaki stop korunur; böylece riskin ve R değerlerin doğru kalır.",
          "Brüt sonuç, komisyon, swap ve net sonuç.",
          "Parça parça kapatılan bir pozisyon (TP1, TP2…) tamamen kapandığında tek işlem olarak kaydedilir."
        ]
      },
      {
        "h2": "Sorun giderme"
      },
      {
        "ul": [
          "Hiçbir şey gelmiyor: 2. adımdaki adresin tam olarak https://www.simpletradejournal.io olduğundan, eklentinin olduğu grafiğin açık olduğundan ve anahtarın boşluksuz yapıştırıldığından emin ol.",
          "\"Anahtar başka hesaba bağlı\": anahtar zaten başka bir işlem hesabına ait. Bu hesap için yeni bir anahtar oluştur.",
          "Anahtarı kaybettim: MetaTrader onu hatırlıyor. Gerçekten kaybettiysen uygulamada yenisini oluştur, eskisini iptal et."
        ]
      },
      {
        "p": "Hiçbir şey kurmak istemiyor musun? MetaTrader'ın kendi rapor dosyasını da içe aktarabilirsin — içe aktarma rehberine bak."
      }
    ]
  },
  "import-trade-history": {
    "title": "İşlem geçmişini trading journal'ına nasıl aktarırsın",
    "description": "MetaTrader 4/5, cTrader, TradeLocker, DXtrade veya Match-Trader'dan kapanmış işlemleri içe aktar. Doğru rapor nasıl alınır, içinden ne okunur, çift kayıt nasıl önlenir.",
    "body": [
      {
        "p": "Aylardır işlem yapıyorsan hepsini tek tek yazmana gerek yok. Platformundan bir rapor al ve journal'a bırak — dosya tarayıcında okunur, platform kendiliğinden tanınır ve hiçbir şey kaydedilmeden önce bütün işlemleri görürsün."
      },
      {
        "h2": "Desteklenen platformlar"
      },
      {
        "ul": [
          "MetaTrader 5 ve MetaTrader 4 (HTML raporu)",
          "cTrader",
          "TradeLocker",
          "DXtrade",
          "Match-Trader",
          "Başka herhangi bir CSV — tarih, sembol, yön ve sonuç sütununu sen seçersin"
        ]
      },
      {
        "h2": "Doğru MetaTrader raporunu almak"
      },
      {
        "ol": [
          "MetaTrader'da Araç Kutusu'nu aç (Ctrl+T) ve Geçmiş sekmesine geç.",
          "Listenin içinde sağ tıkla ve istediğin dönemi seç (örneğin \"Tüm geçmiş\").",
          "Yeniden sağ tıkla → Rapor, HTML olarak kaydet."
        ]
      },
      {
        "note": "Yalnızca bakiye ve açık pozisyonları gösteren hesap raporunu kullanma — içinde kapanmış işlem yoktur. İçe aktarma \"kapanmış işlem bulunamadı\" diyorsa sebep neredeyse her zaman budur."
      },
      {
        "h2": "İçe aktarma"
      },
      {
        "ol": [
          "Uygulamada İçe Aktar'ı seç ve işlemlerin gideceği journal'ı belirle.",
          "Dosyayı pencereye sürükle ya da tıklayıp seç.",
          "Önizlemeyi kontrol et: her işlemin sembolü, yönü, lotu, fiyatları, saatleri ve net sonucu.",
          "Onayla. İşlemler journal'ında, takviminde ve istatistiklerinde görünür."
        ]
      },
      {
        "h2": "Rapordan neler okunuyor"
      },
      {
        "ul": [
          "Net sonuç — yalnızca brüt kâr değil; komisyon, swap ve masraflar hesaba katılır.",
          "Stop seviyesi; böylece her işlemin riski ve R değeri hesaplanır.",
          "Giriş ve çıkış fiyatları ve saatleri."
        ]
      },
      {
        "h2": "Aynı dosyayı iki kez aktarmak"
      },
      {
        "p": "Her işlem platformdaki kimliğini taşır; journal'da zaten olan işlem yeniden eklenmez, atlanır. Her hafta güncel raporu hiçbir şeyi temizlemeden aktarabilirsin. İşlem açıkken elle kaydettiysen, içe aktarma ikinci bir kayıt açmak yerine o kaydı tamamlar."
      },
      {
        "p": "Bunun kendiliğinden olmasını mı istersin? MetaTrader 5'i bir kez bağla, kapanan işlemler otomatik gelsin — MetaTrader 5 rehberine bak."
      }
    ]
  },
  "how-to-keep-a-trading-journal": {
    "title": "Gerçekten kullanacağın bir trading journal nasıl tutulur",
    "description": "Her işlem için neyi kaydetmeli, ne sıklıkla gözden geçirmeli ve trading journal'ı yarıda bırakılan bir tablodan en faydalı araca çeviren alışkanlıklar.",
    "body": [
      {
        "p": "Trader'ların çoğu journal'ın işe yaradığında hemfikir, çoğu da birkaç hafta içinde tutmayı bırakıyor. Sorun nadiren disiplin. Journal yanlış anda çok şey istiyor ve karşılığında hiçbir şey vermiyor. Gerçekten kullanacağın bir journal hızlı doldurulur, hızlı gözden geçirilir ve sana kendi başına göremeyeceğin bir şey gösterir."
      },
      {
        "h2": "Her işlem için neyi kaydetmeli"
      },
      {
        "p": "İkiye ayır: platformun bildikleri ve yalnızca senin bildiklerin."
      },
      {
        "ul": [
          "Olgular: sembol, yön, giriş, çıkış, stop, lot, masraflar sonrası sonuç. Bunlar asla elle yazılmamalı — içe aktar ya da platformdan otomatik gelsin.",
          "Plan: hangi setup'tı ve neden girdin. Bir satır yeter.",
          "Ruh hâli: girerken nasıldın — sakin, sıkılmış, aceleci, kaybı geri almaya çalışan.",
          "Setup görselse, giriş anındaki grafiğin ekran görüntüsü."
        ]
      },
      {
        "h2": "Parayla değil, R ile ölç"
      },
      {
        "p": "300 dolarlık kazanç tek başına pek bir şey söylemez. 100 dolar riske attıysan 3R'lik bir işlemdir; 600 dolar riske attıysan yarım R'dir ve şans eseri tutmuş kötü bir işlemdir. Stopunu kaydetmek, journal'ın her sonucu riske attığının katı olarak göstermesini sağlar; avantajının gerçek olup olmadığını gösteren sayı budur."
      },
      {
        "h2": "Belli aralıklarla gözden geçir"
      },
      {
        "ul": [
          "Her gün, iki dakika: bugün planıma uydum mu? Tazeyken not edilecek bir şey var mı?",
          "Her hafta, on beş dakika: hangi setup'lar kazandırdı, hangileri kaybettirdi; hangi günlerde ve seanslarda.",
          "Her ay: sermaye eğrim inandığım setup'lar sayesinde mi ilerliyor, yoksa onlara rağmen mi?"
        ]
      },
      {
        "h2": "Yalnızca istatistiğe değil, davranışa bak"
      },
      {
        "p": "Kazanma oranı ve ortalama R ne olduğunu söyler. Daha faydalı sorular nasıl davrandığınla ilgili: bir kayıptan dakikalar sonra yeni işleme girdin mi? Kaybettikten sonra lotun büyüdü mü? Bazı günlerde planının izin verdiğinden çok daha fazla işlem yaptın mı, ya da alışık olduğun saatlerin dışında? Bu kalıplar tek bir kötü setup'tan çok daha pahalıya patlar ve işlem işlem bakınca gözden kaçar."
      },
      {
        "p": "Simple Trading Journal bu dört alışkanlığı — intikam işlemi, kayıptan sonra riski artırma, aşırı işlem ve alışık olmadığın saatlerde işlem — bütün journal'larında kendiliğinden kontrol eder."
      },
      {
        "h2": "Zahmetsiz tut"
      },
      {
        "ul": [
          "Olguları otomatiğe bağla; bir işlemi kaydetmek dakikalar değil saniyeler sürsün.",
          "Sonradan uzun notlar yerine girmeden önce kısa bir kontrol listesi kullan.",
          "Setup'ları tutarlı etiketle — her gün kullanılan beş setup, bir kez kullanılan elli setup'tan iyidir.",
          "Ayrı hesaplar için ayrı journal tut; örneğin prop challenge ve kişisel hesap."
        ]
      },
      {
        "h2": "Küçük başla"
      },
      {
        "p": "İlk gün mükemmel bir sisteme ihtiyacın yok. Olguları otomatik kaydet, her işlem için neden girdiğine dair bir satır ekle ve haftada bir bak. Bir ay sonra hiçbir indikatörün veremeyeceği bir şeyin olur: kendi trading'in hakkında kanıt."
      }
    ]
  },
  "r-multiple-explained": {
    "title": "R değeri nedir: her işlemi aldığın riske göre değerlendir",
    "description": "R değeri nedir, stoptan nasıl hesaplanır ve bir stratejinin avantajı olup olmadığını anlamanın en net yolu neden R cinsinden beklentidir.",
    "body": [
      {
        "p": "Para, işlemleri karşılaştırmak için kötü bir ölçü. Aynı 200 dolarlık kâr, onu kazanmak için ne kadar riske girdiğine bağlı olarak mükemmel de olabilir, pervasız da. R değeri her sonucu aldığın riske göre ölçerek bunu düzeltir."
      },
      {
        "h2": "1R nedir?"
      },
      {
        "p": "1R, işlem stopa değerse kaybedeceğin tutardır. 1.1000'den 1 lot al, stop 1.0950 olsun; 1R o 50 pip'in sana maliyetidir — diyelim 500 dolar."
      },
      {
        "h2": "R değerini hesaplamak"
      },
      {
        "code": "R değeri = işlemin sonucu ÷ başlangıç riski (1R)"
      },
      {
        "ul": [
          "500 dolar riskle 1.000 dolar kazandın: +2R.",
          "Stopta 500 dolar kaybettin: −1R.",
          "Kayma ya da stopu taşıman yüzünden 750 dolar kaybettin: −1,5R — bir şeylerin ters gittiğinin işareti.",
          "Erken kapatıp 150 dolar aldın: +0,3R."
        ]
      },
      {
        "h2": "Neden önemli"
      },
      {
        "p": "Her işlem R cinsinden olunca sonuçlar lot büyüklüğü, enstrüman ve hesap fark etmeksizin karşılaştırılabilir hâle gelir. %40 kazanma oranlı bir setup'ın kazananları ortalama +2,5R olduğu için mükemmel olduğunu, ya da %70 kazanma oranının kaybedenler ortalama −3R olduğu için sorun olduğunu görürsün."
      },
      {
        "h2": "Beklenti"
      },
      {
        "p": "Beklenti, işlem başına ortalama R'dir. Bütün işlemlerin R'sini topla, işlem sayısına böl."
      },
      {
        "code": "Beklenti = toplam R ÷ işlem sayısı"
      },
      {
        "p": "Pozitif beklenti, her işlemin ortalamada aldığın riske göre sana para kazandırdığı anlamına gelir. 100 işlemde 0,3R, 30R eder; işlem başına %1 riskle bileşik etki olmadan kabaca %30. Negatif beklentide daha fazla işlem çözüm değildir — setup, uygulama ya da risk yönetimi değişmeli."
      },
      {
        "h2": "Sık yapılan hatalar"
      },
      {
        "ul": [
          "Stopu kaydetmemek. Stop yoksa 1R de R değeri de yoktur.",
          "İlk stop yerine taşınmış stopu kullanmak. R, girerken kabul ettiğin riski ölçer.",
          "Masrafları yok saymak. Komisyon ve swap sonucun parçası; +1R'lik işlem masraflardan sonra +0,9R olabilir.",
          "Bir setup'ı birkaç işleme bakıp değerlendirmek. Sonuç çıkarmadan önce en az 30 işleme bak."
        ]
      },
      {
        "h2": "Simple Trading Journal'da"
      },
      {
        "p": "Bir işlemin stopu varsa — elle yazılmış, rapordan aktarılmış ya da MetaTrader 5'ten gelmiş — riski ve R değeri kendiliğinden hesaplanır; istatistiklerin, paradaki sonuçlarının yanında ortalama gerçekleşen R'yi de gösterir."
      }
    ]
  },
  "prop-firm-daily-loss-and-drawdown": {
    "title": "Günlük kayıp ve maksimum düşüş: prop firma kurallarını çiğnemeden nasıl takip edersin",
    "description": "Prop firmaların günlük kayıp sınırı, maksimum düşüş ve kâr hedefi genelde nasıl işler, challenge'lar neden çoğunlukla kötü bir işlemle değil bir kuralla kaybedilir ve sınıra uzaklığını her an nasıl bilirsin.",
    "body": [
      {
        "p": "Prop challenge'lar nadiren strateji çalışmayı bıraktığı için kaybedilir. Bir salı öğleden sonra, üç kayıp sonrasında günlük sınıra 180 dolar kaldığını fark etmeyen trader yüzünden kaybedilir. Kurallar basit; zor olan, işlem işlem onlara göre tam olarak nerede durduğunu bilmek."
      },
      {
        "note": "Her firma kurallarını farklı yazar ve zamanla değiştirir. Her zaman kendi firmanın güncel kurallarına bak — bu yazı belirli bir firmayı değil, yaygın kural türlerini anlatıyor."
      },
      {
        "h2": "Bir challenge'ı belirleyen üç sayı"
      },
      {
        "ul": [
          "Kâr hedefi: ulaşman gereken kazanç, genelde başlangıç bakiyesinin bir yüzdesi.",
          "Günlük kayıp sınırı: bir işlem gününde kaybedebileceğin tutar. Firmalar bunun günün başlangıç bakiyesinden mi varlıktan (equity) mı ölçüldüğü ve günün ne zaman sıfırlandığı konusunda farklılaşır.",
          "Maksimum kayıp (düşüş): hesabın toplamda ne kadar düşebileceği. Sabit olabilir (başlangıç bakiyesinden ölçülür) ya da takip eden (en yüksek bakiye veya varlıkla birlikte yukarı taşınır)."
        ]
      },
      {
        "h2": "Sabit ve takip eden düşüş"
      },
      {
        "p": "100.000 dolarlık hesapta %10 sabit maksimum kayıpla hesap, önceden ne olursa olsun 90.000 doların altında düşer. Takip eden sınırda hesap önce 105.000 dolara çıkarsa taban da onunla yukarı taşınır, bu örnekte 95.000 dolara. Takip eden sınırlar kârı geri vermeyi cezalandırır; kazançlı bir haftada bile sınıra uzaklığın azalabilir."
      },
      {
        "h2": "Challenge'lar neden kurallara kaybedilir"
      },
      {
        "ul": [
          "Kayıplar kümelenir. Bir seansta art arda üç stop normaldir ve işlem başına %1 risk ile masraflar eklenince günlük sınıra ulaşmaya çoğu zaman yeter.",
          "Açık işlemler sayılır. Varlığa dayalı kurallarda kapanmamış bir zarar, hiçbir işlem kapanmadan sınırı aşabilir.",
          "Masraf ve swap sayılır. Sınır brüt değil net sonucunu görür.",
          "Baskı altında davranış değişir. İntikam işlemleri ve kayıptan sonra büyüyen lot, kötü bir günü kaybedilmiş bir challenge'a çeviren şeyin ta kendisi."
        ]
      },
      {
        "h2": "Basit bir koruma düzeni"
      },
      {
        "ol": [
          "Pozisyonları normal bir kayıp serisi günlük sınıra ulaşamayacak şekilde boyutlandır — örneğin işlem başına günlük sınırın üçte birinden fazlasını riske atma.",
          "Her işlemden önce günlük ve maksimum sınıra ne kadar uzak olduğuna bak.",
          "Firmanınkinden çok önce kendi durağını koy: günlük sınırın yarısını kaybettiysen o gün dur.",
          "Sınıra yaklaştığın her günü gözden geçir. Kalıp genelde tekrar eder."
        ]
      },
      {
        "h2": "Simple Trading Journal'da takip"
      },
      {
        "p": "Bir journal'ı prop hesabı olarak işaretle, firmanın kâr hedefini, günlük kayıp sınırını ve maksimum kaybını gir; journal işlem yaptıkça her birine ne kadar uzak olduğunu gösterir. Kayıp sınırlarına yaklaştıkça çubuk sarıya sonra kırmızıya döner; kâr hedefine yaklaştıkça yeşile. Disiplin analizi de çoğu challenge'ı bitiren alışkanlıkları — intikam işlemlerini ve kayıptan sonra artan riski — işaretler."
      }
    ]
  },
  // --- karşılaştırmalar (scripts: compare_gen) ---
  'tradezella-alternative': {
    "title": "Simple Trading Journal ve Tradezella: dürüst bir karşılaştırma",
    "description": "Tradezella alternatifi mi arıyorsun? Fiyat, ücretsiz plan, deneme ve MetaTrader bağlantısı yan yana; hangisinin nerede güçlü olduğu da.",
    "body": [
      {
        "p": "Tradezella en bilinen trading journal'lardan biri. Daha ucuz, kendi dilinde ya da ücretsiz planı olan bir alternatif arıyorsan, Simple Trading Journal'ın nasıl karşılaştırıldığı aşağıda."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradezella"
          ],
          [
            "Aylık fiyat",
            "$14.99",
            "$35 – $99"
          ],
          [
            "Yıllık fiyat",
            "$119",
            "$315 – $891"
          ],
          [
            "Ücretsiz plan",
            "Var — günde 2 işlem, süre sınırı yok",
            "Yok"
          ],
          [
            "Ücretsiz deneme",
            "3 gün Pro, kart gerekmez",
            "Fiyat sayfasında belirtilmemiş"
          ],
          [
            "MetaTrader otomatik kayıt",
            "MT4 ve MT5",
            "MT4 ve MT5"
          ],
          [
            "MetaTrader nasıl bağlanıyor",
            "MetaTrader'a eklenti + anahtar, şifre paylaşılmaz",
            "Hesap numarası + yatırımcı şifresi"
          ],
          [
            "İçe aktarma",
            "MT4/MT5 raporu, cTrader, TradeLocker, DXtrade, Match-Trader, her CSV",
            "500'den fazla broker ve prop firma"
          ]
        ]
      },
      {
        "note": "Tradezella'nın fiyat ve özellikleri Eylül 2026'da kendi fiyat ve yardım sayfalarından alındı; o tarihten beri değişmiş olabilir. Karar vermeden önce sitesine bak."
      },
      {
        "h2": "Tradezella nerede daha güçlü"
      },
      {
        "ul": [
          "Çok daha fazla broker ve prop firma bağlantısı — Tradezella'ya göre 500'den fazla.",
          "Daha uzun geçmiş ve üst planlarında daha geniş özellik seti.",
          "MT4 ve MT5 hesapları MetaTrader'a bir şey kurmadan bağlanıyor."
        ]
      },
      {
        "h2": "Simple Trading Journal nerede daha güçlü"
      },
      {
        "ul": [
          "Süre sınırı olmayan ücretsiz plan (günde 2 işlem) ve kartsız 3 günlük Pro denemesi.",
          "Pro aylık $14.99 ya da yıllık $119 — Tradezella'nın en ucuz seçeneği aylık $35.",
          "Uygulamanın tamamı 9 dilde; Türkçe, Farsça ve Arapça dahil.",
          "MetaTrader 4 ve 5 küçük bir eklenti ve anahtarla bağlanıyor; yatırımcı şifreni hiç paylaşmıyorsun.",
          "Hazır disiplin analizi (intikam işlemi, kayıptan sonra artan risk, aşırı işlem, alışılmadık saatler) ve prop firma sınır takibi."
        ]
      },
      {
        "h2": "Hangisini seçmeli?"
      },
      {
        "p": "Çok geniş bir broker bağlantısı yelpazesine ya da daha gelişmiş araçlarına ihtiyacın varsa Tradezella sana daha uygun olabilir. MetaTrader'da işlem yapıyor, kendi dilinde bir journal istiyor ve ücretsiz başlamayı tercih ediyorsan Simple Trading Journal'ı dene — ücretsiz plan kart istemiyor."
      }
    ]
  },
  'tradersync-alternative': {
    "title": "Simple Trading Journal ve TraderSync: dürüst bir karşılaştırma",
    "description": "TraderSync alternatifi mi arıyorsun? Fiyat, ücretsiz plan, deneme ve MetaTrader bağlantısı yan yana; hangisinin nerede güçlü olduğu da.",
    "body": [
      {
        "p": "TraderSync en bilinen trading journal'lardan biri. Daha ucuz, kendi dilinde ya da ücretsiz planı olan bir alternatif arıyorsan, Simple Trading Journal'ın nasıl karşılaştırıldığı aşağıda."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TraderSync"
          ],
          [
            "Aylık fiyat",
            "$14.99",
            "$29.95 – $79.95"
          ],
          [
            "Yıllık fiyat",
            "$119",
            "$269.52 – $719.52"
          ],
          [
            "Ücretsiz plan",
            "Var — günde 2 işlem, süre sınırı yok",
            "Yok"
          ],
          [
            "Ücretsiz deneme",
            "3 gün Pro, kart gerekmez",
            "7 gün, kart gerekmez"
          ],
          [
            "MetaTrader otomatik kayıt",
            "MT4 ve MT5",
            "MT4 ve MT5"
          ],
          [
            "İçe aktarma",
            "MT4/MT5 raporu, cTrader, TradeLocker, DXtrade, Match-Trader, her CSV",
            "200'den fazla broker ve platform"
          ]
        ]
      },
      {
        "note": "TraderSync'in fiyat ve özellikleri Eylül 2026'da kendi fiyat ve yardım sayfalarından alındı; o tarihten beri değişmiş olabilir. Karar vermeden önce sitesine bak."
      },
      {
        "h2": "TraderSync nerede daha güçlü"
      },
      {
        "ul": [
          "200'den fazla desteklenen broker ve platform.",
          "Üst planlarında yapay zekâ asistanı (Cypher) ve işlem tekrarı.",
          "Bütün özellikleriyle, kartsız 7 günlük deneme."
        ]
      },
      {
        "h2": "Simple Trading Journal nerede daha güçlü"
      },
      {
        "ul": [
          "Süre sınırı olmayan ücretsiz plan (günde 2 işlem) ve kartsız 3 günlük Pro denemesi.",
          "Pro aylık $14.99 ya da yıllık $119 — TraderSync'in en ucuz seçeneği aylık $29.95.",
          "Uygulamanın tamamı 9 dilde; Türkçe, Farsça ve Arapça dahil.",
          "MetaTrader 4 ve 5 küçük bir eklenti ve anahtarla bağlanıyor; yatırımcı şifreni hiç paylaşmıyorsun.",
          "Hazır disiplin analizi (intikam işlemi, kayıptan sonra artan risk, aşırı işlem, alışılmadık saatler) ve prop firma sınır takibi."
        ]
      },
      {
        "h2": "Hangisini seçmeli?"
      },
      {
        "p": "Çok geniş bir broker bağlantısı yelpazesine ya da daha gelişmiş araçlarına ihtiyacın varsa TraderSync sana daha uygun olabilir. MetaTrader'da işlem yapıyor, kendi dilinde bir journal istiyor ve ücretsiz başlamayı tercih ediyorsan Simple Trading Journal'ı dene — ücretsiz plan kart istemiyor."
      }
    ]
  },
  'edgewonk-alternative': {
    "title": "Simple Trading Journal ve Edgewonk: dürüst bir karşılaştırma",
    "description": "Edgewonk alternatifi mi arıyorsun? Fiyat, ücretsiz plan, deneme ve MetaTrader bağlantısı yan yana; hangisinin nerede güçlü olduğu da.",
    "body": [
      {
        "p": "Edgewonk en bilinen trading journal'lardan biri. Daha ucuz, kendi dilinde ya da ücretsiz planı olan bir alternatif arıyorsan, Simple Trading Journal'ın nasıl karşılaştırıldığı aşağıda."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Edgewonk"
          ],
          [
            "Aylık fiyat",
            "$14.99",
            "— (yalnızca yıllık)"
          ],
          [
            "Yıllık fiyat",
            "$119",
            "$197"
          ],
          [
            "Ücretsiz plan",
            "Var — günde 2 işlem, süre sınırı yok",
            "Yok"
          ],
          [
            "Ücretsiz deneme",
            "3 gün Pro, kart gerekmez",
            "Yok — 14 gün para iadesi"
          ],
          [
            "MetaTrader otomatik kayıt",
            "MT4 ve MT5",
            "MT4 ve MT5"
          ],
          [
            "MetaTrader nasıl bağlanıyor",
            "MetaTrader'a eklenti + anahtar, şifre paylaşılmaz",
            "MetaTrader'ın FTP ile rapor yayını"
          ],
          [
            "İçe aktarma",
            "MT4/MT5 raporu, cTrader, TradeLocker, DXtrade, Match-Trader, her CSV",
            "Birçok platform (içe aktarma sayfasına bak)"
          ]
        ]
      },
      {
        "note": "Edgewonk'un fiyat ve özellikleri Eylül 2026'da kendi fiyat ve yardım sayfalarından alındı; o tarihten beri değişmiş olabilir. Karar vermeden önce sitesine bak."
      },
      {
        "h2": "Edgewonk nerede daha güçlü"
      },
      {
        "ul": [
          "Her özelliği tek bir planda sunan, köklü bir journal.",
          "14 gün para iade garantisi.",
          "MetaTrader'ın kendi rapor yayınıyla MT4 ve MT5 otomatik kayıt."
        ]
      },
      {
        "h2": "Simple Trading Journal nerede daha güçlü"
      },
      {
        "ul": [
          "Süre sınırı olmayan ücretsiz plan (günde 2 işlem) ve kartsız 3 günlük Pro denemesi.",
          "Pro aylık $14.99 ya da yıllık $119 — Edgewonk'un en ucuz seçeneği yıllık $197.",
          "Uygulamanın tamamı 9 dilde; Türkçe, Farsça ve Arapça dahil.",
          "MetaTrader 4 ve 5 küçük bir eklenti ve anahtarla bağlanıyor; yatırımcı şifreni hiç paylaşmıyorsun.",
          "Hazır disiplin analizi (intikam işlemi, kayıptan sonra artan risk, aşırı işlem, alışılmadık saatler) ve prop firma sınır takibi."
        ]
      },
      {
        "h2": "Hangisini seçmeli?"
      },
      {
        "p": "Çok geniş bir broker bağlantısı yelpazesine ya da daha gelişmiş araçlarına ihtiyacın varsa Edgewonk sana daha uygun olabilir. MetaTrader'da işlem yapıyor, kendi dilinde bir journal istiyor ve ücretsiz başlamayı tercih ediyorsan Simple Trading Journal'ı dene — ücretsiz plan kart istemiyor."
      }
    ]
  },
};

export default TEXT;
