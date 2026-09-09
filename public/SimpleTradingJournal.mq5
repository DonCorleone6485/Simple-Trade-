//+------------------------------------------------------------------+
//|                                       SimpleTradingJournal.mq5   |
//|  Kapanan pozisyonları Simple Trading Journal'a gönderir.         |
//|                                                                  |
//|  Kurulum:                                                        |
//|   1) Araçlar > Seçenekler > Uzman Danışmanlar sekmesinde         |
//|      "Listelenen URL'ler için WebRequest'e izin ver" kutusunu     |
//|      işaretle ve listeye https://www.simpletradejournal.io ekle.  |
//|   2) Bu dosyayı MQL5/Experts klasörüne koyup F7 ile derle.        |
//|   3) Herhangi bir grafiğe sürükle, açılan pencerede journal       |
//|      anahtarını ApiKey alanına yapıştır.                          |
//+------------------------------------------------------------------+
#property copyright "Simple Trading Journal"
#property link      "https://www.simpletradejournal.io"
#property version   "1.00"
#property strict

// Girdi etiketleri MQL5'te yorum satırından gelir ve ekranda öyle görünür.
// Site dokuz dilde, EA ise tek dosya: etiketi bir dile çevirmek geri kalan
// sekizinde kurulum adımlarıyla uyumsuz hale getirir. Değişken adları her
// dilde aynı olduğu için etiket olarak onları kullanıyoruz.
input string ApiKey       = "";                                   // ApiKey  (stj_...)
input string ServerUrl    = "https://www.simpletradejournal.io";  // ServerUrl
input int    PollSeconds  = 30;                                   // PollSeconds
input int    HistoryDays  = 30;                                   // HistoryDays
input bool   Verbose      = true;                                 // Verbose

// Bu oturumda gönderilmiş pozisyonlar. Sunucu zaten aynı pozisyonu ikinci kez
// eklemez; bu liste sadece boşuna istek atmamak için.
long     g_sent[];
datetime g_scanFrom = 0;
int      g_total    = 0;   // bu oturumda gönderilen pozisyon sayısı
string   g_status   = "";  // grafiğe yazılan son durum

/**
 * Durum grafiğin sol üst köşesinde durur.
 *
 * Kurulumu yapan kişinin "Araç kutusu > Uzmanlar" sekmesini bilmesi
 * gerekmesin: çalışıyor mu, ne eksik, kaç işlem gitti — hepsi ekranda.
 */
void Status(const string text)
  {
   g_status = text;
   Comment("Simple Trading Journal\n", text);
  }

//+------------------------------------------------------------------+
int OnInit()
  {
   if(StringLen(ApiKey) < 8)
     {
      Status("Anahtar girilmemiş.\nSitede journal > MetaTrader sekmesinden anahtar oluştur,\nsonra bu EA'ya sag tikla > Ozellikler > Girdiler > ApiKey.");
      Print("HATA: ApiKey boş. Journal'daki MetaTrader sekmesinden anahtar oluşturup buraya yapıştır.");
      return(INIT_FAILED);
     }

   g_scanFrom = TimeCurrent() - (datetime)HistoryDays * 86400;
   ArrayResize(g_sent, 0);

   EventSetTimer(PollSeconds < 5 ? 5 : PollSeconds);
   Status("Baglandi. Son " + IntegerToString(HistoryDays) + " gun taraniyor...");
   Print("Simple Trading Journal bağlandı. İlk tarama: son ", HistoryDays, " gün.");

   // Açılışta bir kez, işlem olmadan da bağlan: anahtarı hemen doğrular ve
   // hesabın gerçek sermayesini bildirir. Yeni işlem beklenirse journal
   // günlerce varsayılan 10.000 ile durur.
   Hello();
   Scan();
   if(g_total == 0) Status("Calisiyor. Yeni kapanan islem bekleniyor.");
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason) { EventKillTimer(); Comment(""); }

void OnTimer() { Scan(); }

// Pozisyon kapandığı anda beklemeden gönder.
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
  {
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
      Scan();
  }

//+------------------------------------------------------------------+
bool AlreadySent(const long positionId)
  {
   for(int i = 0; i < ArraySize(g_sent); i++)
      if(g_sent[i] == positionId) return(true);
   return(false);
  }

void MarkSent(const long positionId)
  {
   int n = ArraySize(g_sent);
   ArrayResize(g_sent, n + 1);
   g_sent[n] = positionId;
  }

/**
 * Hesabın başlangıç sermayesi.
 *
 * Bakiye hareketlerinin (yatırma/çekme) toplamı. Prop hesaplarında bu tek bir
 * kayıttır: challenge'ın büyüklüğü. Journal'ı açarken varsayılan 10.000 kalırsa
 * bakiye ve getiri yanlış çıkar — kullanıcıya sormak yerine buradan okuyoruz.
 *
 * Tüm geçmişi tarar, çünkü ilk yatırım kolayca 30 günden eskidir.
 */
double InitialDeposit()
  {
   if(!HistorySelect(0, TimeCurrent() + 3600)) return(0);

   double total = 0;
   int deals = HistoryDealsTotal();
   for(int i = 0; i < deals; i++)
     {
      ulong t = HistoryDealGetTicket(i);
      if(t == 0) continue;
      if(HistoryDealGetInteger(t, DEAL_TYPE) == DEAL_TYPE_BALANCE)
         total += HistoryDealGetDouble(t, DEAL_PROFIT);
     }
   return(total);
  }

/**
 * Sunucu saatinin GMT'den farkı.
 *
 * Geçmişteki bütün zamanlar sunucu saatiyle gelir. Olduğu gibi gönderilirse
 * aynı işlem, rapordan aktarılan ikiziyle farklı saatte görünür. Yarım saatlik
 * dilimler de olduğu için 1800 saniyeye yuvarlıyoruz.
 */
int ServerGmtOffset()
  {
   long diff = (long)TimeCurrent() - (long)TimeGMT();
   return((int)(MathRound((double)diff / 1800.0) * 1800));
  }

string JsonStr(const string key, const string value)
  {
   string v = value;
   StringReplace(v, "\\", "\\\\");
   StringReplace(v, "\"", "\\\"");
   return("\"" + key + "\":\"" + v + "\"");
  }

string JsonNum(const string key, const double value)
  {
   return("\"" + key + "\":" + DoubleToString(value, 2));
  }

string JsonPrice(const string key, const double value, const int digits)
  {
   return("\"" + key + "\":" + DoubleToString(value, digits));
  }

/** İşlemsiz ilk istek: anahtarı doğrular, sermayeyi bildirir. */
void Hello()
  {
   double deposit = InitialDeposit();
   string json = "{\"key\":\"" + ApiKey + "\"";
   if(deposit > 0) json += ",\"startingCapital\":" + DoubleToString(deposit, 2);
   json += ",\"trades\":[]}";
   if(Send(json, 0))
      Status("Baglanti tamam. Yeni kapanan islem bekleniyor.");
  }

//+------------------------------------------------------------------+
//| Kapanmış pozisyonları toplar ve gönderir                          |
//+------------------------------------------------------------------+
void Scan()
  {
   datetime to = TimeCurrent() + 3600;
   if(!HistorySelect(g_scanFrom, to))
     {
      Print("HATA: geçmiş okunamadı.");
      return;
     }

   int    offset  = ServerGmtOffset();
   string items[];
   long   ids[];
   int    count   = 0;

   int deals = HistoryDealsTotal();
   for(int i = 0; i < deals; i++)
     {
      ulong dealTicket = HistoryDealGetTicket(i);
      if(dealTicket == 0) continue;

      // Pozisyonu kapatan bacak. Kısmi kapanışlarda son OUT işlemi esas alınır.
      long entry = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_OUT_BY) continue;

      long positionId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      if(positionId <= 0 || AlreadySent(positionId)) continue;

      string payload = BuildPosition(positionId, dealTicket, offset);
      if(payload == "") continue;

      ArrayResize(items, count + 1);
      ArrayResize(ids, count + 1);
      items[count] = payload;
      ids[count]   = positionId;
      count++;

      if(count >= 100) break;   // sunucu tek istekte en fazla 200 kabul ediyor
     }

   if(count == 0) return;

   // InitialDeposit() geçmiş seçimini değiştirir; sonrasında bir daha
   // okumadığımız için sorun olmaz, ama sıra önemli.

   string json = "{\"key\":\"" + ApiKey + "\"";
   double deposit = InitialDeposit();
   if(deposit > 0) json += ",\"startingCapital\":" + DoubleToString(deposit, 2);
   json += ",\"trades\":[";
   for(int i = 0; i < count; i++)
     {
      if(i > 0) json += ",";
      json += items[i];
     }
   json += "]}";

   // Ancak sunucu kabul ettiyse gönderilmiş sayarız; ağ hatasında bir sonraki
   // turda yeniden denenir.
   if(Send(json, count))
      for(int i = 0; i < count; i++)
         MarkSent(ids[i]);
  }

//+------------------------------------------------------------------+
//| Tek bir pozisyonun JSON'u                                         |
//+------------------------------------------------------------------+
string BuildPosition(const long positionId, const ulong closeDeal, const int offset)
  {
   string symbol     = HistoryDealGetString(closeDeal, DEAL_SYMBOL);
   if(symbol == "") return("");

   int    digits     = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   if(digits <= 0) digits = 5;

   datetime closeTime = (datetime)HistoryDealGetInteger(closeDeal, DEAL_TIME);
   double closePrice  = HistoryDealGetDouble(closeDeal, DEAL_PRICE);
   long   reasonCode  = HistoryDealGetInteger(closeDeal, DEAL_REASON);

   // Açılış bacağını ve pozisyonun toplam maliyetlerini bul.
   datetime openTime  = 0;
   double   openPrice = 0, profit = 0, commission = 0, swap = 0, fee = 0;
   double   sl = 0, tp = 0;
   string   type = "buy";
   bool     foundOpen = false;

   int deals = HistoryDealsTotal();
   for(int i = 0; i < deals; i++)
     {
      ulong t = HistoryDealGetTicket(i);
      if(t == 0) continue;
      if(HistoryDealGetInteger(t, DEAL_POSITION_ID) != positionId) continue;

      profit     += HistoryDealGetDouble(t, DEAL_PROFIT);
      commission += HistoryDealGetDouble(t, DEAL_COMMISSION);
      swap       += HistoryDealGetDouble(t, DEAL_SWAP);
      fee        += HistoryDealGetDouble(t, DEAL_FEE);

      if(HistoryDealGetInteger(t, DEAL_ENTRY) == DEAL_ENTRY_IN)
        {
         foundOpen = true;
         openTime  = (datetime)HistoryDealGetInteger(t, DEAL_TIME);
         openPrice = HistoryDealGetDouble(t, DEAL_PRICE);
         type      = (HistoryDealGetInteger(t, DEAL_TYPE) == DEAL_TYPE_BUY) ? "buy" : "sell";

         // Stop ve hedef, pozisyonu açan emirde durur.
         ulong orderTicket = (ulong)HistoryDealGetInteger(t, DEAL_ORDER);
         if(HistoryOrderSelect(orderTicket))
           {
            sl = HistoryOrderGetDouble(orderTicket, ORDER_SL);
            tp = HistoryOrderGetDouble(orderTicket, ORDER_TP);
           }
        }
     }

   if(!foundOpen) return("");   // açılışı bu pencerede olmayan pozisyonu atla

   // Sonradan konmuş ya da taşınmış stop, açılış emrinde görünmez; stopla
   // kapandıysa kapanış fiyatı zaten stop seviyesidir.
   string reason = "manual";
   if(reasonCode == DEAL_REASON_SL) { reason = "sl"; if(sl == 0) sl = closePrice; }
   else if(reasonCode == DEAL_REASON_TP) { reason = "tp"; if(tp == 0) tp = closePrice; }

   string j = "{";
   j += "\"externalId\":" + IntegerToString(positionId) + ",";
   j += "\"openTime\":"  + IntegerToString((long)openTime  - offset) + ",";
   j += "\"closeTime\":" + IntegerToString((long)closeTime - offset) + ",";
   j += JsonStr("symbol", symbol) + ",";
   j += JsonStr("type", type) + ",";
   j += JsonPrice("openPrice", openPrice, digits) + ",";
   j += JsonPrice("closePrice", closePrice, digits) + ",";
   j += JsonPrice("sl", sl, digits) + ",";
   j += JsonPrice("tp", tp, digits) + ",";
   j += JsonNum("profit", profit) + ",";
   j += JsonNum("commission", commission) + ",";
   j += JsonNum("swap", swap) + ",";
   j += JsonNum("fee", fee) + ",";
   j += JsonStr("closeReason", reason);
   j += "}";
   return(j);
  }

//+------------------------------------------------------------------+
bool Send(const string json, const int count)
  {
   string url = ServerUrl + "/api/ingest";
   string headers = "Content-Type: application/json\r\n";

   char post[], result[];
   string resultHeaders;

   // StringToCharArray sona bir sıfır bayt ekler; onu göndermemek gerekir,
   // yoksa sunucu gövdeyi bozuk JSON olarak görür.
   int len = StringToCharArray(json, post, 0, WHOLE_ARRAY, CP_UTF8) - 1;
   if(len < 0) return(false);
   ArrayResize(post, len);

   ResetLastError();
   int status = WebRequest("POST", url, headers, 10000, post, result, resultHeaders);

   if(status == -1)
     {
      int err = GetLastError();
      if(err == 4014)
        {
         Status("Izin yok.\nAraclar > Secenekler > Uzman Danismanlar sekmesinde\n\"Listelenen URL'ler icin WebRequest'e izin ver\" kutusunu isaretle\nve listeye ekle: " + ServerUrl);
         Print("HATA: WebRequest'e izin verilmemiş. Araçlar > Seçenekler > Uzman Danışmanlar sekmesinde ",
               ServerUrl, " adresini listeye ekle.");
        }
      else
        {
         Status("Baglanti kurulamadi (hata " + IntegerToString(err) + "). Internet baglantisini kontrol et.");
         Print("HATA: istek gönderilemedi (", err, ").");
        }
      return(false);
     }

   string body = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);

   if(status != 200)
     {
      if(status == 401)
        {
         Status("Anahtar gecersiz ya da iptal edilmis.\nSiteden yeni anahtar olusturup buraya yapistir.");
         Print("Anahtar geçersiz ya da iptal edilmiş. Journal'dan yeni anahtar oluştur.");
        }
      else
         Status("Sunucu hatasi (" + IntegerToString(status) + ").");
      Print("HATA ", status, ": ", body);
      return(false);
     }

   if(count > 0)
     {
      g_total += count;
      Status("Calisiyor. Bu oturumda gonderilen islem: " + IntegerToString(g_total));
     }
   if(Verbose && count > 0) Print(count, " pozisyon gönderildi -> ", body);
   return(true);
  }
//+------------------------------------------------------------------+
