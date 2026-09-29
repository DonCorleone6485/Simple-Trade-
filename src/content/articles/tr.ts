/** Yazıların tr metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  "metatrader-5-auto-sync": {
    "title": "MetaTrader 4 veya 5'i trading journal'ına nasıl bağlarsın",
    "description": "Adım adım: Simple Trading Journal eklentisini MT4 ya da MT5'e kur, kapanan her işlem stop, risk ve masraflarıyla birlikte journal'ına kendiliğinden gelsin.",
    "body": [
      {
        "p": "Her işlemi journal'a elle yazmak, insanların journal tutmayı bırakmasının bir numaralı sebebi. MetaTrader eklentisiyle (MT4 ve MT5) her işlem açıldığı anda kaydediliyor, kapandığında tamamlanıyor: giriş, çıkış, stop, lot, komisyon ve swap dahil. Sen yalnızca MetaTrader'ın bilemeyeceğini eklersin: setup'ın, gerekçen ve o anki hislerin."
      },
      {
        "note": "MetaTrader 4 mü, 5 mi? Adımlar ikisinde de aynı, yalnız dosya ve klasör değişiyor. Uygulamadaki MetaTrader ekranında önce sürümünü seç: MetaTrader 5 için SimpleTradingJournal.ex5 ve MQL5 → Experts, MetaTrader 4 için SimpleTradingJournal.ex4 ve MQL4 → Experts."
      },
      {
        "h2": "Ne gerekiyor"
      },
      {
        "ul": [
          "Windows ya da Mac'te MetaTrader 4 veya MetaTrader 5 (masaüstü uygulaması — mobil uygulama eklenti çalıştıramaz).",
          "En az bir journal'ı olan bir Simple Trading Journal hesabı.",
          "İki dakika."
        ]
      },
      {
        "h2": "1. Eklentiyi indir"
      },
      {
        "p": "Uygulamada menüden MetaTrader'ı aç, MetaTrader 4 ya da 5'i seç ve eklentiyi indir (MT5 için SimpleTradingJournal.ex5, MT4 için SimpleTradingJournal.ex4). MetaTrader'da Dosya → Veri Klasörünü Aç, açılan pencerede MQL5 → Experts klasörüne (MT4'te MQL4 → Experts) gir ve dosyayı içine at."
      },
      {
        "note": "Mac'te \"Veri Klasörünü Aç\" bazı sürümlerde çalışmaz. O zaman Finder'da Git → Klasöre Git ile sürümüne uygun yola git. MetaTrader 5: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts — MetaTrader 4: ~/Library/Application Support/net.metaquotes.wine.metatrader4/drive_c/Program Files (x86)/MetaTrader 4/MQL4/Experts"
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
        "p": "Uygulamada bir bağlantı anahtarı oluştur (stj_ ile başlar). SimpleTradingJournal'ı herhangi bir grafiğin üstüne sürükle, Girdiler sekmesine geç, anahtarı ApiKey satırına yapıştır ve Tamam'a bas. Grafiğin sol üstünde bağlantının çalıştığı yazınca iş bitti. Aynı yerde işlemlerin hangi journal'a gittiği de yazar (Journal: …); doğru journal olduğundan emin ol."
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
          "MetaTrader 5'te parça parça kapatılan bir pozisyon (TP1, TP2…) tamamen kapandığında tek işlem olarak kaydedilir. MetaTrader 4'te kısmi kapanışta emrin kalan kısmı yeni numara alır, bu yüzden ayrı bir işlem olarak görünür."
        ]
      },
      {
        "h2": "Sorun giderme"
      },
      {
        "ul": [
          "Hiçbir şey gelmiyor: 2. adımdaki adresin tam olarak https://www.simpletradejournal.io olduğundan, eklentinin olduğu grafiğin açık olduğundan ve anahtarın boşluksuz yapıştırıldığından emin ol.",
          "\"Anahtar başka hesaba bağlı\": anahtar zaten başka bir işlem hesabına ait. Bu hesap için yeni bir anahtar oluştur.", "İşlemler yanlış journal'a gidiyor: grafikteki \"Journal:\" satırı nereye gittiğini gösterir. Başka bir journal yazıyorsa eklenti hâlâ eski anahtarı kullanıyordur. Girdiler'i aç, ApiKey'i tamamen temizle, yeni anahtarı yapıştır, Enter'a ve sonra Tamam'a bas. Yeni anahtar bağlandığı an eskisi kendiliğinden kapanır.", "MetaTrader 4'te eklenti gri görünüyor ve sürüklenmiyor: MetaTrader ekranından indirdiğin SimpleTradingJournal.ex4 dosyasını kullan, sonra Kılavuz panelinde Uzman Danışmanlar'a sağ tıkla ve Yenile'yi seç.",
          "Anahtarı kaybettim: MetaTrader onu hatırlıyor. Gerçekten kaybettiysen uygulamada yenisini oluştur; yenisi bağlandığı an eskisi kendiliğinden kapanır."
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
        "p": "Bunun kendiliğinden olmasını mı istersin? MetaTrader 4 ya da 5'i bir kez bağla, kapanan işlemler otomatik gelsin — MetaTrader rehberine bak."
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
        "p": "Bir işlemin stopu varsa — elle yazılmış, rapordan aktarılmış ya da MetaTrader'dan gelmiş — riski ve R değeri kendiliğinden hesaplanır; istatistiklerin, paradaki sonuçlarının yanında ortalama gerçekleşen R'yi de gösterir."
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
  "pre-trade-checklist": {
    "title": "İşlem öncesi checklist: gerçekten kullanacağın bir liste nasıl yazılır",
    "description": "Kısa bir işlem öncesi checklist neden dürtüsel işlemleri azaltır, evet/hayır ile cevaplanan kurallar nasıl yazılır ve listenin işe yarayıp yaramadığı nasıl anlaşılır.",
    "body": [
      {
        "p": "Kötü işlemlerin çoğu kötü analizden gelmez. Setup yarım kalmışken açılan işlemlerdir: seviyeye neredeyse gelinmiş, sinyal neredeyse oluşmuş — beklemek, bir şey yapmaktan daha zor geldiği için girilmiştir. Checklist, bu kararı o an gelmeden vermeni sağlar."
      },
      {
        "h2": "Checklist ne işe yarar"
      },
      {
        "p": "Checklist senin yerine işlem bulmaz. Zaten girmek istediğin işlemleri süzer; yalnızca planına uyanlar geçer. Pilotlar ve cerrahlar da aynı sebeple checklist kullanır: baskı altında insan ezbere bildiği adımları atlar."
      },
      {
        "h2": "Evet ya da hayır ile cevaplanan kurallar"
      },
      {
        "p": "Her madde, giriş anında net cevabı olan bir soru olmalı. \"Trend yukarı mı?\" yoruma açık; \"Fiyat 4 saatlik grafikte 200 periyotluk hareketli ortalamanın üstünde mi?\" değil."
      },
      {
        "ul": [
          "Bağlam: üst zaman diliminin yönü işlemimle aynı mı?",
          "Yer: giriş, seans öncesi işaretlediğim bir seviyede mi, yoksa fiyat hareket ettikten sonra bulduğum bir yerde mi?",
          "Tetik: giriş sinyalim gerçekten kapandı mı, yoksa yalnızca oluşmaya mı başladı?",
          "Risk: stop, fikrin yanlış çıktığı yerde mi ve lot işlem başı riskimin içinde mi?",
          "Takvim: önümüzdeki 30 dakikada yüksek etkili haber yok mu?"
        ]
      },
      {
        "h2": "Kısa tut"
      },
      {
        "p": "Üç ile yedi madde yeter. On beş maddelik liste önce göz ucuyla okunur, sonra hiç okunmaz. Bir madde hiçbir kararı değiştirmiyorsa sil; aynı hata tekrar tekrar geliyorsa onu maddeye çevir."
      },
      {
        "h2": "Her strateji için ayrı liste"
      },
      {
        "p": "İki farklı setup işletiyorsan — örneğin kırılım ve geri çekilme — koşulları da farklıdır. İkisini tek listeye sıkıştırınca her işlemde maddelerin yarısı alakasız kalır ve alakasız kutuları tiklemek, okumadan tikleme alışkanlığına dönüşür."
      },
      {
        "h2": "İşe yarıyor mu, kontrol et"
      },
      {
        "p": "Checklist bir hipotezdir. 20–30 işlemden sonra her maddesi tiklenmiş işlemleri, yine de girdiğin işlemlerle karşılaştır. Tam tiklenmiş işlemler daha iyi gitmiyorsa maddeler yanlıştır — fikirden vazgeçme, maddeleri değiştir."
      },
      {
        "h2": "Simple Trading Journal'da"
      },
      {
        "p": "Her strateji için bir tane olmak üzere birden fazla adlandırılmış checklist tutabilir, her journal'ın hangisini kullanacağını seçebilir ve maddeleri her işlemde tikleyebilirsin. MetaTrader'dan gelen işlemlere de journal'ın checklist'i eklenir; notlarını yazarken doldurursun."
      }
    ]
  },
  "trading-emotions-journal": {
    "title": "Trading journal'ında duyguları kaydetmek: neyi yazmalı, nasıl kullanmalı",
    "description": "Her işlemin arkasındaki duyguyu nasıl etiketlersin, hangi duygular genellikle hatalardan önce gelir ve bu etiketleri pişmanlık yerine kurala nasıl çevirirsin.",
    "body": [
      {
        "p": "Trader'lar genellikle hatalarını bilir. Sonradan, bir hareketi kaçırma korkusuyla kovaladıklarını ya da kaybı geri almak için lotu ikiye katladıklarını anlatabilirler. Nadiren sahip oldukları şey, bunun ne sıklıkla olduğunun ve neye mal olduğunun kaydıdır. Her işleme duygu etiketi koymak, belirsiz bir hissi sayılabilir bir şeye çevirir."
      },
      {
        "h2": "O anda kaydet"
      },
      {
        "p": "Duyguyu girerken ya da kapattıktan hemen sonra yaz, hafta sonunda değil. Hafıza işlemleri yeniden yazar: şans eseri kazanan bir intikam işlemi \"iyi okuma\" olur, erken çıkışın arkasındaki korku unutulur."
      },
      {
        "h2": "Kısa ve sabit bir liste"
      },
      {
        "p": "Her seferinde aynı kelime grubundan seç ki işlemler karşılaştırılabilsin. İşe yarar bir liste, yardım eden hâlleri zarar vermeye yatkın olanlardan ayırır:"
      },
      {
        "ul": [
          "Yardım edenler: sakin, odaklı, kendinden emin.",
          "Uyarı işaretleri: aşırı özgüvenli, FOMO, korkulu, sabırsız.",
          "Dur işaretleri: sinirli, intikam, yorgun."
        ]
      },
      {
        "p": "Bir işlemin birden fazla etiketi olabilir. Aynı anda hem yorgun hem sabırsız olmak sık görülür ve bilmeye değer."
      },
      {
        "h2": "Tek işleme değil, örüntüye bak"
      },
      {
        "p": "Kaybeden tek bir FOMO işlemi sana pek bir şey söylemez. Yirmi tanesi, diğer işlemlerinin yanına konunca çok şey söyler. Bir ay sonra işlemlerini duyguya göre grupla ve sonuçları R cinsinden karşılaştır: birçok trader kayıplarının çoğunun iki üç etiketin altında toplandığını görür."
      },
      {
        "h2": "Örüntüyü kurala çevir"
      },
      {
        "p": "Amaç bir şey hissetmemek değil; fark ettiğinde ne yapacağına önceden karar vermek. En pahalı etiketin intikam işlemleriyse, \"üst üste iki kayıptan sonra o gün dur\" gibi bir kural her türlü iradeden fazlasını yapar. Kuralı checklist'ine yaz ki bir sonraki girişten önce karşına çıksın, sonra değil."
      },
      {
        "h2": "Simple Trading Journal'da"
      },
      {
        "p": "Her işlemde on iki yaygın hâlden oluşan bir duygu seçici var — yardım edenler ve uyarı işaretleri farklı renkte — ve kendi kelimelerini de ekleyebilirsin. Etiketler işlemde görünür ve işlemlerini Excel'e aktardığında dahil edilir; sıralayıp karşılaştırabilirsin."
      }
    ]
  },
  "position-sizing-risk-per-trade": {
    "title": "Pozisyon büyüklüğü: işlem başına ne kadar risk almalı, lot nasıl hesaplanır",
    "description": "İşlem başına sabit bir risk seçmek, bunu stop mesafesinden lot büyüklüğüne çevirmek ve journal'da gerçekten uyup uymadığını kontrol etmek.",
    "body": [
      {
        "p": "İki trader aynı işleme aynı fiyattan, aynı stopla girip bambaşka hesaplarla çıkabilir. Farkı yaratan büyüklüktür. Pozisyon büyüklüğü tek bir kaybın sana neye mal olacağını, yani avantajın kendini gösterene kadar üst üste kaç kayba dayanabileceğini belirler."
      },
      {
        "h2": "Lottan değil, riskten başla"
      },
      {
        "p": "Çoğu trader önce lotu seçer — \"ben 1 lot açarım\" — ve ne kadar kaybedeceğine stop karar verir. Böylece her kayıp farklı büyüklükte olur. Tersine çevir: stop çalışırsa hesabın ne kadarını kaybetmeyi kabul ettiğine karar ver, sonra bunu sağlayan büyüklüğü hesapla."
      },
      {
        "h2": "İşlem başına riski seçmek"
      },
      {
        "p": "Hesabın sabit bir yüzdesi — çoğunlukla %0,5 ile %2 arası — olağan başlangıç noktasıdır. Sayının kendisi, onu sabit tutmaktan daha az önemlidir. %1 riskle üst üste on kayıp hesabın yaklaşık %10'una mal olur; %5 riskle aynı seri yaklaşık %40 götürür ve sonraki her işlemin bunu geri getirmek için çok daha fazla çalışması gerekir."
      },
      {
        "p": "Prop firma hesabında firmanın sınırlarına göre de hesapla: günlük kayıp sınırı %5 ise işlem başına %2 risk, bir günde yalnızca iki tam kayba yer bırakır."
      },
      {
        "h2": "Hesap"
      },
      {
        "code": "Pozisyon büyüklüğü = Risk tutarı ÷ (Stop mesafesi × Puan başına değer)"
      },
      {
        "p": "Örnek: %1 risk alan 10.000 $'lık hesabın kaybetmeye ayırdığı tutar 100 $. EURUSD'de stop 25 pip uzakta, bir standart lot pip başına yaklaşık 10 $. 100 $ ÷ (25 × 10 $) = 0,4 lot. Stop 50 pip uzaktaysa büyüklük yarıya, 0,2 lota iner — risk yine 100 $ kalır."
      },
      {
        "p": "Puan başına değer enstrümana ve brokera göre değişir (altın, endeksler ve kripto farklı fiyatlanır); platformundaki sözleşme özelliklerine bir kez bak ve not al."
      },
      {
        "h2": "Sık yapılan hatalar"
      },
      {
        "ul": [
          "Girişten sonra stopu uzaklaştırıp büyüklüğü küçültmemek — risk sessizce büyür.",
          "Kayıptan sonra daha hızlı geri almak için büyüklüğü artırmak.",
          "Lotu her seferinde yukarı yuvarlamak: 0,37 önce 0,4, sonra 0,5 olur.",
          "Spread ve komisyonu unutmak; gerçek kayıp plandakinden biraz büyük olur."
        ]
      },
      {
        "h2": "Journal'da kontrol et"
      },
      {
        "p": "Her işlemde planlanan riski yaz. Birkaç hafta sonra kaybeden işlemlere bak: bazıları olağan tutarın iki üç katını kaybettiyse, büyüklüğün sandığın kadar sabit değil. Sonuçları R cinsinden (kâr ya da zarar ÷ planlanan risk) okumak bu aykırı işlemleri kolayca gösterir."
      },
      {
        "h2": "Simple Trading Journal'da"
      },
      {
        "p": "Her işlemin bir risk alanı var ve sonuçlar R cinsinden okunabiliyor. Hedeflerine işlem başına azami risk ekleyebilirsin; disiplin ekranı da bir kayıptan hemen sonra riskin bir önceki işlemin 1,5 katından fazlasına çıktığı işlemleri işaretler."
      }
    ]
  },
  "revenge-trading": {
    "title": "İntikam işlemi (revenge trading): journal'da nasıl fark edilir, nasıl durdurulur",
    "description": "İntikam işleminin verilerde nasıl göründüğü, neden bu kadar pahalı olduğu ve kayıptan sonraki işlemin duygusal olmasını engelleyen pratik kurallar.",
    "body": [
      {
        "p": "Bir kayıp kapanıyor ve birkaç dakika içinde yeniden piyasadasın — çoğu zaman aynı enstrümanda, bazen daha büyük lotla — kaybı geri almak için. Buna intikam işlemi denir. Neredeyse her trader bunu yapmıştır; asıl soru ne sıklıkla yaptığın ve sana neye mal olduğu."
      },
      {
        "h2": "Neden bu kadar pahalı"
      },
      {
        "p": "Kayıptan sonraki işlem genellikle planın dışında bir sebeple açılır: bir duyguyu düzeltmek için. Kurulum daha zayıf, giriş aceleye gelmiş, büyüklük de büyümeye meyillidir. Tek bir kötü gün, haftalarca dikkatle yapılan işi silebilir."
      },
      {
        "h2": "Verilerde nasıl görünür"
      },
      {
        "ul": [
          "Kaybeden bir işlem kapandıktan birkaç dakika sonra açılan yeni işlem.",
          "Bu işlemin riski bir öncekinden belirgin şekilde büyük.",
          "Kayıpla başlayan bir günde art arda açılan birkaç işlem.",
          "Normalde işlem yaptığın saatlerin dışındaki işlemler."
        ]
      },
      {
        "p": "Bu işlemleri bulmak için o an ne hissettiğini hatırlamana gerek yok. Saatler, büyüklükler ve sonuçlar zaten journal'ında."
      },
      {
        "h2": "Ölç"
      },
      {
        "p": "Yukarıdaki kalıplara uyan işlemleri diğerlerinden ayır ve sonuçları karşılaştır. İşaretlenen grup para kaybederken geri kalanı aşağı yukarı başa baş ya da artıdaysa, düzeltilecek en değerli şeyi buldun — ve bu bir strateji değil, bir kural."
      },
      {
        "h2": "İşe yarayan kurallar"
      },
      {
        "ul": [
          "Soğuma süresi: kayıptan sonra 15–30 dakika yeni işlem yok.",
          "Günlük durma: üst üste iki kayıptan ya da belirli bir tutar kaybettikten sonra o gün bitti.",
          "Kayıptan sonra büyüklük asla artmaz; değişecekse azalır.",
          "Sonraki işlemden önce checklist'ini baştan geç."
        ]
      },
      {
        "p": "Kuralı seanstan önce yaz. O an karar vermek tam olarak işe yaramayan şey."
      },
      {
        "h2": "Simple Trading Journal'da"
      },
      {
        "p": "Disiplin ekranı mevcut işlemlerini okur ve bir kayıptan sonraki 15 dakika içinde açılan işlemi, kayıptan sonra riskin bir önceki işlemin 1,5 katını aştığı işlemi, olağandan çok daha fazla işlem yapılan günleri ve her zamanki saatlerin dışındaki işlemleri işaretler. Sonra bu işlemlerin diğerlerine göre neye mal olduğunu gösterir. MetaTrader'dan gelen işlemler de kendiliğinden dahil."
      }
    ]
  },
  "expectancy-and-profit-factor": {
    "title": "Beklenti (expectancy) ve kâr faktörü: trading'inin işe yarayıp yaramadığını gösteren iki sayı",
    "description": "Beklenti ve kâr faktörünün ne anlama geldiği, kendi işlemlerinden nasıl hesaplanacağı ve yüksek kazanma oranının tek başına neden az şey söylediği.",
    "body": [
      {
        "p": "Kazanma oranı trader'ların en çok söylediği sayıdır ve tek başına en az işe yarayanıdır. İşlemlerin %80'ini kazanan bir strateji para kaybedebilir, %35'ini kazanan bir strateji sağlam olabilir. Asıl soruya — bu, çok sayıda işlemde para kazandırıyor mu? — iki sayı cevap verir: beklenti ve kâr faktörü."
      },
      {
        "h2": "Beklenti"
      },
      {
        "p": "Beklenti, çok sayıda işlem üzerinden işlem başına ortalama sonuçtur."
      },
      {
        "code": "Beklenti = (Kazanma oranı × Ortalama kazanç) − (Kaybetme oranı × Ortalama kayıp)"
      },
      {
        "p": "Örnek: işlemlerin %40'ını kazanıyorsun, ortalama kazanç 300 $, ortalama kayıp 150 $. 0,40 × 300 − 0,60 × 150 = 120 − 90 = 30 $. Ortalamada her işlem 30 $ eklemiş. Artı bir sayı, yaklaşımın bu işlemlerde işe yaradığını; eksi bir sayı, tek tek günler ne kadar iyi hissettirmiş olursa olsun işe yaramadığını gösterir."
      },
      {
        "p": "Para yerine R cinsinden — ortalama kazanç ve kaybı olağan riskine bölerek — hesaplanan beklenti, farklı hesap büyüklükleri ve dönemler arasında karşılaştırılabilir."
      },
      {
        "h2": "Kâr faktörü"
      },
      {
        "code": "Kâr faktörü = Brüt kâr ÷ Brüt zarar"
      },
      {
        "p": "Aynı sayılarla 100 işlemde: 40 × 300 $ = 12.000 $ kazanç, 60 × 150 $ = 9.000 $ kayıp, kâr faktörü 1,33. 1'in üstünde kazananlar kaybedenlerden ağır basar; altında basmaz. Hızlı okunur ama oraya kaç işlemde gelindiğini hesaba katmaz."
      },
      {
        "h2": "Kazanma oranı neden yanıltır"
      },
      {
        "p": "Yüksek kazanma oranı çoğu zaman kârı erken alıp zararı koşturmaktan gelir. 50 $'lık on kazanç ve 600 $'lık bir kayıp, %91 kazanma oranı ve 100 $ net zarardır. Beklenti bunu hemen gösterir; kazanma oranı gizler."
      },
      {
        "h2": "Kaç işlem yeterli?"
      },
      {
        "p": "Bu sayılar küçük bir örneklemde çok oynar. Yirmi işlem şans eseri mükemmel ya da berbat görünebilir. En az 30–50 işlem üzerinden bak ve bütün hesabı karışık değil, kurulum bazında karşılaştır."
      },
      {
        "h2": "Simple Trading Journal'da"
      },
      {
        "p": "İstatistik sayfası beklentiyi, kâr faktörünü, ödeme oranını (payoff), ortalama kazanç ve kaybı ve kazanma oranını kapanmış işlemlerinden hesaplar — MetaTrader'dan gelen ya da rapordan içe aktarılan işlemler dahil. Kurulum performansı tablosu her kurulumun kazanma oranını ve net sonucunu gösterir; sonuçlarını hangisinin taşıdığını görürsün."
      }
    ]
  },
  "overtrading": {
    "title": "Aşırı işlem: fazla işlem açtığını nasıl anlarsın",
    "description": "Aşırı işlem (overtrading) nedir, kendi işlem verinde nasıl görünür, fazladan işlemler neden para kaybettirir ve işlem sayını kontrol altında tutan basit sınırlar.",
    "body": [
      {
        "p": "Aşırı işlem, planının gerektirdiğinden fazla işlem açmaktır — kurulumun oluştuğu için değil, ekranın başında olduğun için açılan işlemler. O an nadiren hata gibi hissettirir. Her işlem tek başına makul görünür; sorun ancak onları saydığında ortaya çıkar."
      },
      {
        "h2": "Fazladan işlemler neden pahalıya patlar"
      },
      {
        "p": "İyi kurulumlar sınırlıdır; piyasa onları her saat sunmaz. İşlem sayısı arttıkça fazladan olanlar genellikle daha zayıftır: neredeyse oluşmuş kurulumlar, aralığın ortasında girişler, sakin saatlerde açılan işlemler. Her işlemin bir de maliyeti vardır — spread, komisyon, swap — ve bunlar çoğu trader'ın sandığından hızlı birikir."
      },
      {
        "h2": "Sık görülen sebepler"
      },
      {
        "ul": [
          "Bir kaybı geri almaya çalışmak (intikam işlemi).",
          "Durgun bir günde sıkılmak ya da işlemsiz geçen günü boşa gitmiş saymak.",
          "Ulaşılana kadar devam etmeye iten günlük kâr hedefi.",
          "Kurulumların daha sık çıktığı ama daha az şey anlattığı küçük zaman dilimine inmek.",
          "Özgüvenin en yüksek olduğu anda, büyük bir kazançtan sonra devam etmek."
        ]
      },
      {
        "h2": "Journal'ında nasıl fark edersin"
      },
      {
        "ul": [
          "Olağan gününden çok daha fazla işlem açtığın günler.",
          "Gün içindeki sıraya göre sonuçlar: dördüncü ve beşinci işlemlerin, birinci ve ikinciden kötü mü?",
          "Kurulumu olmayan ya da ara sıra kullandığın bir kuruluma bağlanan işlemler.",
          "Aynı enstrümanda art arda açılan çok sayıda kısa işlem."
        ]
      },
      {
        "p": "Önemli olan karşılaştırma basit: en yoğun günlerini al, net sonuçlarını ve kazanma oranlarını normal günlerinle karşılaştır. Yoğun günler belirgin şekilde kötüyse işlem sayısı sorunun bir parçasıdır."
      },
      {
        "h2": "İşe yarayan sınırlar"
      },
      {
        "ul": [
          "Seanstan önce yazılmış günlük en fazla işlem sayısı — örneğin olağan sayın artı bir.",
          "Kaçıncı işlem olursa olsun, belirli sayıda kayıptan sonra durmak.",
          "Yalnız kontrol listendeki kurulumlar sayılır; gerisi işlem değildir.",
          "Belirli bir işlem saati aralığı; dışında yeni giriş yok."
        ]
      },
      {
        "p": "Sınır ancak önceden konursa işe yarar. Günün beşinci işleminde altıncı için bulunan gerekçe her zaman ikna edici gelir."
      },
      {
        "h2": "Simple Trading Journal'da"
      },
      {
        "p": "Disiplin ekranı, kendi geçmişinden günde olağan kaç işlem açtığını çıkarır ve bunun iki katından fazla (en az dört) işlem açılan günleri işaretler. Karar vermek için en az beş işlem günü gerekir; o günlerdeki işlemlerin geri kalanlara göre sana neye mal olduğunu da gösterir. Takvim her günün işlem sayısını ve sonucunu gösterir; MetaTrader'dan gelen işlemler de otomatik olarak dahildir."
      }
    ]
  },
  "tradervue-alternative": {
    "title": "Simple Trading Journal ve Tradervue: dürüst bir karşılaştırma",
    "description": "Tradervue alternatifi mi arıyorsun? Fiyat, ücretsiz plan, deneme ve MetaTrader desteği yan yana; hangisinin nerede güçlü olduğu da.",
    "body": [
      {
        "p": "Tradervue en eski trading journal'lardan biri; ABD hisse, opsiyon ve vadeli işlem trader'ları arasında yaygın. Daha ucuz, kendi dilinde ya da MetaTrader otomatik kaydı olan bir alternatif arıyorsan, Simple Trading Journal'ın nasıl karşılaştırıldığı aşağıda."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradervue"
          ],
          [
            "Aylık fiyat",
            "$14.99",
            "$29.95 – $49.95"
          ],
          [
            "Yıllık fiyat",
            "$119",
            "Fiyat sayfasında yok"
          ],
          [
            "Ücretsiz plan",
            "Var — günde 2 işlem, süre sınırı yok",
            "Var — ayda 30 işlem içe aktarma"
          ],
          [
            "Ücretsiz deneme",
            "3 gün Pro, kart gerekmez",
            "7 gün Silver ya da Gold; ücretsiz plana geçmezsen bitince karttan çekilir"
          ],
          [
            "MetaTrader otomatik kayıt",
            "MT4 ve MT5",
            "Yok — MT4 ve MT5 rapor dosyası yükleyerek"
          ],
          [
            "MetaTrader nasıl bağlanıyor",
            "MetaTrader'a eklenti + anahtar, şifre paylaşılmaz",
            "MetaTrader'da HTML rapor kaydedip yüklemek"
          ],
          [
            "İçe aktarma",
            "MT4/MT5 raporu, cTrader, TradeLocker, DXtrade, Match-Trader, her CSV",
            "Uzun bir broker ve platform listesi; bazı broker'larda otomatik eşitleme"
          ]
        ]
      },
      {
        "note": "Tradervue'nun fiyat ve özellikleri Eylül 2026'da kendi fiyat, platform ve yardım sayfalarından alındı; o tarihten beri değişmiş olabilir. Karar vermeden önce sitesine bak."
      },
      {
        "h2": "Tradervue nerede daha güçlü"
      },
      {
        "ul": [
          "ABD hisse, opsiyon ve vadeli işlemlerine derin destek; birçok ABD broker'ı ve platformu.",
          "Ayrıntılı raporlar; üst planında çıkış analizi ve MFE/MAE istatistikleri.",
          "Mentorluk ve işlemleri topluluğuyla paylaşma.",
          "Çok uzun bir geçmiş."
        ]
      },
      {
        "h2": "Simple Trading Journal nerede daha güçlü"
      },
      {
        "ul": [
          "MetaTrader 4 ve 5 işlemleri sen işlem yaptıkça kendiliğinden gelir — her seferinde rapor alıp yüklemen gerekmez.",
          "Pro ayda $14.99 ya da yılda $119 — Tradervue'nun ücretli planları ayda $29.95'ten başlıyor.",
          "Kart istemeyen 3 günlük Pro denemesi.",
          "Uygulamanın tamamı Türkçe, Farsça ve Arapça dahil 9 dilde.",
          "Yerleşik disiplin analizi (intikam işlemleri, kayıptan sonra artan risk, aşırı işlem, saat dışı işlem) ve prop firma limit takibi."
        ]
      },
      {
        "h2": "Hangisini seçmelisin?"
      },
      {
        "p": "ABD hisse, opsiyon ya da vadeli işlemlerini bir ABD broker'ı üzerinden yapıyorsan Tradervue tam olarak bunun için kurulmuş. MetaTrader'da forex, endeks ya da altın işlemi yapıyorsan, işlemlerinin kendiliğinden kaydolmasını istiyorsan ve ücretsiz başlamayı tercih ediyorsan Simple Trading Journal'ı dene — ücretsiz plan kart istemez."
      }
    ]
  },
  "tradesviz-alternative": {
    "title": "Simple Trading Journal ve TradesViz: dürüst bir karşılaştırma",
    "description": "TradesViz alternatifi mi arıyorsun? Fiyat, ücretsiz plan, deneme ve MetaTrader bağlantısı yan yana; hangisinin nerede güçlü olduğu da.",
    "body": [
      {
        "p": "TradesViz çok geniş bir istatistik, grafik, simülatör ve yapay zekâ aracı yelpazesi sunan bir trading journal. Daha sade, yıllıkta daha ucuz, kendi dilinde ya da forex için ücretsiz bir alternatif arıyorsan, Simple Trading Journal'ın nasıl karşılaştırıldığı aşağıda."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TradesViz"
          ],
          [
            "Aylık fiyat",
            "$14.99",
            "$19.99 – $29.99"
          ],
          [
            "Yıllık fiyat",
            "$119",
            "$179.88 – $269.88"
          ],
          [
            "Ücretsiz plan",
            "Var — günde 2 işlem, süre sınırı yok, tüm enstrümanlar",
            "Var — yalnız hisse senedi, ayda 3.000 gerçekleşme"
          ],
          [
            "Ücretsiz deneme",
            "3 gün Pro, kart gerekmez",
            "7 gün Pro ya da Platinum"
          ],
          [
            "MetaTrader otomatik kayıt",
            "MT4 ve MT5",
            "MT4 ve MT5 (ücretli planlarda; ücretsiz plan yalnız hisse)"
          ],
          [
            "MetaTrader nasıl bağlanıyor",
            "MetaTrader'a eklenti + anahtar, şifre paylaşılmaz",
            "Hesap numarası + yatırımcı şifresi ya da MetaTrader'ın FTP ile rapor yayını"
          ],
          [
            "İçe aktarma",
            "MT4/MT5 raporu, cTrader, TradeLocker, DXtrade, Match-Trader, her CSV",
            "250+ broker ve platform, 70+ otomatik eşitleme bağlantısı"
          ]
        ]
      },
      {
        "note": "TradesViz'in fiyat ve özellikleri Eylül 2026'da kendi fiyat, broker ve blog sayfalarından alındı; o tarihten beri değişmiş olabilir. Karar vermeden önce sitesine bak."
      },
      {
        "h2": "TradesViz nerede daha güçlü"
      },
      {
        "ul": [
          "Çok daha geniş bir istatistik ve grafik seti — TradesViz'e göre 600'den fazla.",
          "İşlem simülatörleri, işlem tekrarı, opsiyon araçları ve hisse tarayıcı.",
          "İşlemlerinle ilgili soruları yanıtlayan yapay zekâ araçları.",
          "Hisse, opsiyon, vadeli işlem ve kripto dahil çok daha fazla broker entegrasyonu."
        ]
      },
      {
        "h2": "Simple Trading Journal nerede daha güçlü"
      },
      {
        "ul": [
          "Ücretsiz plan forex, endeks, altın ve diğer tüm enstrümanları kapsar — TradesViz'in ücretsiz planı yalnız hisse senedi.",
          "Pro yılda $119 — TradesViz'in en ucuz yıllık planı $179.88.",
          "MetaTrader 4 ve 5 küçük bir eklenti ve anahtarla bağlanır; yatırımcı şifreni hiç paylaşmazsın.",
          "Öğrenmesi daha az ekran gerektiren, daha sade bir uygulama.",
          "Uygulamanın tamamı Türkçe, Farsça ve Arapça dahil 9 dilde."
        ]
      },
      {
        "h2": "Hangisini seçmelisin?"
      },
      {
        "p": "Olabilecek en derin analizi, simülatörleri ve yapay zekâ araçlarını istiyor ve gerçekten kullanacaksan TradesViz daha fazlasını sunuyor. MetaTrader'da forex ya da CFD işlemi yapıyorsan ve kendi dilinde, ücretsiz başlayabileceğin sade bir journal istiyorsan Simple Trading Journal'ı dene — ücretsiz plan kart istemez."
      }
    ]
  },
  "fx-replay-alternative": {
    "title": "Simple Trading Journal ve FX Replay: hangisi ne işe yarar",
    "description": "FX Replay mi Simple Trading Journal mı? Biri geriye dönük test platformu, diğeri gerçek işlemlerin için journal. Fiyat, ücretsiz plan ve MetaTrader desteği karşılaştırması.",
    "body": [
      {
        "p": "FX Replay esas olarak bir geriye dönük test (backtest) platformu: geçmiş grafikleri yeniden oynatıp üzerinde işlem pratiği yaparsın; içinde bir journal da var. Simple Trading Journal ise hesabında gerçekten açtığın işlemler için bir journal. Göründüğünden daha az örtüşüyorlar — karşılaştırması aşağıda."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "FX Replay"
          ],
          [
            "Asıl amaç",
            "Gerçek işlemlerinin kaydı ve analizi",
            "Geçmiş grafiklerde test, yanında journal"
          ],
          [
            "Aylık fiyat",
            "$14.99",
            "$17.99 – $35"
          ],
          [
            "Yıllık fiyat",
            "$119",
            "$180 – $350"
          ],
          [
            "Ücretsiz plan",
            "Var — günde 2 işlem, süre sınırı yok",
            "Var — 2 test oturumu, 1 gösterge, 1 hafta veri saklama"
          ],
          [
            "Ücretsiz deneme",
            "3 gün Pro, kart gerekmez",
            "Var, kart gerekmez (süresi belirtilmemiş)"
          ],
          [
            "MetaTrader",
            "MT4 ve MT5, eklenti + anahtarla otomatik kayıt",
            "MT4 ve MT5 dosya yükleyerek"
          ],
          [
            "İçe aktarma",
            "MT4/MT5 raporu, cTrader, TradeLocker, DXtrade, Match-Trader, her CSV",
            "Her CSV; NinjaTrader, Tradovate ve MT4/MT5 dosyaları"
          ]
        ]
      },
      {
        "note": "FX Replay'in fiyat ve özellikleri Eylül 2026'da kendi fiyat ve journal sayfalarından alındı; o tarihten beri değişmiş olabilir. Karar vermeden önce sitesine bak."
      },
      {
        "h2": "FX Replay nerede daha güçlü"
      },
      {
        "ul": [
          "Geriye dönük test: geçmiş fiyat hareketini mum mum oynatma; Pro planında saniye düzeyinde veri.",
          "Challenge kurallarıyla pratik için prop firma challenge simülatörü.",
          "Bir stratejiyi, para riske atmadan önce büyük bir örneklemde denemek.",
          "Discord'da hareketli bir topluluk."
        ]
      },
      {
        "h2": "Simple Trading Journal nerede daha güçlü"
      },
      {
        "ul": [
          "Gerçek MetaTrader 4 ve 5 işlemlerin sen işlem yaptıkça kendiliğinden kaydolur.",
          "Pro ayda $14.99 ya da yılda $119.",
          "Gerçek işlemlerde disiplin analizi: intikam işlemleri, kayıptan sonra artan risk, aşırı işlem, saat dışı işlem.",
          "Gerçek challenge hesabında prop firma limit takibi.",
          "Uygulamanın tamamı Türkçe, Farsça ve Arapça dahil 9 dilde."
        ]
      },
      {
        "h2": "Hangisini seçmelisin?"
      },
      {
        "p": "İkisi farklı işler yapıyor. Bir stratejiyi geçmiş veride denemek için FX Replay tam bunun için yapılmış. Gerçekten açtığın işlemleri — özellikle MetaTrader'da — kaydedip incelemek için Simple Trading Journal'ı kullan. Birçok trader bir test aracını ve bir journal'ı birlikte kullanıyor; buradaki ücretsiz plan kart istemez."
      }
    ]
  },
};

export default TEXT;
