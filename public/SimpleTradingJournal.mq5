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
input int    HistoryDays  = 365;                                  // HistoryDays
input bool   Verbose      = true;                                 // Verbose

// Bu oturumda gönderilmiş pozisyonlar. Sunucu zaten aynı pozisyonu ikinci kez
// eklemez; bu liste sadece boşuna istek atmamak için.
long     g_sent[];
datetime g_scanFrom = 0;
int      g_total    = 0;   // bu oturumda gönderilen pozisyon sayısı
bool     g_fullScanDone = false;  // geçmişin tamamı bir kez tarandı mı
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
//| Kapanmış pozisyonları toplar ve gönderir                          |
//|                                                                   |
//| İki turda çalışır. Birincisi henüz gönderilmemiş kapanış           |
//| işlemlerini bulur (en çok 100 tane), ikincisi geçmişi bir kez      |
//| gezip yalnızca o pozisyonların toplamlarını çıkarır.               |
//|                                                                   |
//| Her kapanış için geçmişi baştan taramak bir yılda milyonlarca      |
//| karşılaştırma demekti; terminal her turda donardı.                 |
//+------------------------------------------------------------------+
void Scan()
  {
   // İlk tarama kullanıcının istediği kadar geriye gider; sonrakiler yalnızca
   // son birkaç güne bakar, çünkü eskiler zaten gönderilmiştir.
   datetime from = g_fullScanDone ? TimeCurrent() - 3 * 86400 : g_scanFrom;
   datetime to   = TimeCurrent() + 3600;

   if(!HistorySelect(from, to))
     {
      Print("HATA: geçmiş okunamadı.");
      return;
     }

   int deals = HistoryDealsTotal();

   // ── 1. tur: gönderilecek pozisyonları belirle ──
   long   posId[];      ulong  closeDeal[];
   string symbol[];     int    digits[];
   long   closeTime[];  double closePrice[];  long reasonCode[];
   double profit[];     double commission[];  double swap[];  double fee[];
   long   openTime[];   double openPrice[];   double sl[];    double tp[];
   string type[];       bool   hasOpen[];
   int count = 0;

   for(int i = 0; i < deals; i++)
     {
      ulong t = HistoryDealGetTicket(i);
      if(t == 0) continue;

      long entry = HistoryDealGetInteger(t, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_OUT_BY) continue;

      long pid = HistoryDealGetInteger(t, DEAL_POSITION_ID);
      if(pid <= 0 || AlreadySent(pid)) continue;

      string sym = HistoryDealGetString(t, DEAL_SYMBOL);
      if(sym == "") continue;

      int n = count + 1;
      ArrayResize(posId, n);      ArrayResize(closeDeal, n);
      ArrayResize(symbol, n);     ArrayResize(digits, n);
      ArrayResize(closeTime, n);  ArrayResize(closePrice, n);  ArrayResize(reasonCode, n);
      ArrayResize(profit, n);     ArrayResize(commission, n);  ArrayResize(swap, n);  ArrayResize(fee, n);
      ArrayResize(openTime, n);   ArrayResize(openPrice, n);   ArrayResize(sl, n);    ArrayResize(tp, n);
      ArrayResize(type, n);       ArrayResize(hasOpen, n);

      int d = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);
      posId[count]      = pid;
      closeDeal[count]  = t;
      symbol[count]     = sym;
      digits[count]     = (d > 0 ? d : 5);
      closeTime[count]  = HistoryDealGetInteger(t, DEAL_TIME);
      closePrice[count] = HistoryDealGetDouble(t, DEAL_PRICE);
      reasonCode[count] = HistoryDealGetInteger(t, DEAL_REASON);
      profit[count] = 0; commission[count] = 0; swap[count] = 0; fee[count] = 0;
      openTime[count] = 0; openPrice[count] = 0; sl[count] = 0; tp[count] = 0;
      type[count] = "buy"; hasOpen[count] = false;
      count++;

      if(count >= 100) break;   // sunucu tek istekte en fazla 200 kabul ediyor
     }

   if(count == 0) return;

   // ── 2. tur: geçmişi bir kez gez, bu pozisyonların toplamlarını çıkar ──
   for(int i = 0; i < deals; i++)
     {
      ulong t = HistoryDealGetTicket(i);
      if(t == 0) continue;

      long pid = HistoryDealGetInteger(t, DEAL_POSITION_ID);
      if(pid <= 0) continue;

      int k = -1;
      for(int j = 0; j < count; j++)
         if(posId[j] == pid) { k = j; break; }
      if(k < 0) continue;

      profit[k]     += HistoryDealGetDouble(t, DEAL_PROFIT);
      commission[k] += HistoryDealGetDouble(t, DEAL_COMMISSION);
      swap[k]       += HistoryDealGetDouble(t, DEAL_SWAP);
      fee[k]        += HistoryDealGetDouble(t, DEAL_FEE);

      if(HistoryDealGetInteger(t, DEAL_ENTRY) == DEAL_ENTRY_IN)
        {
         hasOpen[k]   = true;
         openTime[k]  = HistoryDealGetInteger(t, DEAL_TIME);
         openPrice[k] = HistoryDealGetDouble(t, DEAL_PRICE);
         type[k]      = (HistoryDealGetInteger(t, DEAL_TYPE) == DEAL_TYPE_BUY) ? "buy" : "sell";

         // Stop ve hedef, pozisyonu açan emirde durur.
         ulong orderTicket = (ulong)HistoryDealGetInteger(t, DEAL_ORDER);
         if(HistoryOrderSelect(orderTicket))
           {
            sl[k] = HistoryOrderGetDouble(orderTicket, ORDER_SL);
            tp[k] = HistoryOrderGetDouble(orderTicket, ORDER_TP);
           }
        }
     }

   // ── JSON ──
   int    offset = ServerGmtOffset();
   string items[];
   long   ids[];
   int    ready = 0;

   for(int k = 0; k < count; k++)
     {
      if(!hasOpen[k]) continue;   // açılışı pencerede olmayan pozisyonu atla

      // Sonradan konmuş ya da taşınmış stop açılış emrinde görünmez; stopla
      // kapandıysa kapanış fiyatı zaten stop seviyesidir.
      string reason = "manual";
      if(reasonCode[k] == DEAL_REASON_SL) { reason = "sl"; if(sl[k] == 0) sl[k] = closePrice[k]; }
      else if(reasonCode[k] == DEAL_REASON_TP) { reason = "tp"; if(tp[k] == 0) tp[k] = closePrice[k]; }

      string j = "{";
      j += "\"externalId\":" + IntegerToString(posId[k]) + ",";
      j += "\"openTime\":"  + IntegerToString(openTime[k]  - offset) + ",";
      j += "\"closeTime\":" + IntegerToString(closeTime[k] - offset) + ",";
      j += JsonStr("symbol", symbol[k]) + ",";
      j += JsonStr("type", type[k]) + ",";
      j += JsonPrice("openPrice", openPrice[k], digits[k]) + ",";
      j += JsonPrice("closePrice", closePrice[k], digits[k]) + ",";
      j += JsonPrice("sl", sl[k], digits[k]) + ",";
      j += JsonPrice("tp", tp[k], digits[k]) + ",";
      j += JsonNum("profit", profit[k]) + ",";
      j += JsonNum("commission", commission[k]) + ",";
      j += JsonNum("swap", swap[k]) + ",";
      j += JsonNum("fee", fee[k]) + ",";
      j += JsonStr("closeReason", reason);
      j += "}";

      ArrayResize(items, ready + 1);
      ArrayResize(ids, ready + 1);
      items[ready] = j;
      ids[ready]   = posId[k];
      ready++;
     }

   if(ready == 0) { g_fullScanDone = true; return; }

   string json = "{\"key\":\"" + ApiKey + "\"";
   double deposit = InitialDeposit();
   if(deposit > 0) json += ",\"startingCapital\":" + DoubleToString(deposit, 2);
   json += ",\"trades\":[";
   for(int i = 0; i < ready; i++)
     {
      if(i > 0) json += ",";
      json += items[i];
     }
   json += "]}";

   // Ancak sunucu kabul ettiyse gönderilmiş sayarız; ağ hatasında bir sonraki
   // turda yeniden denenir.
   if(Send(json, ready))
     {
      for(int i = 0; i < ready; i++)
         MarkSent(ids[i]);
      // 100'lük sınıra dayandıysak geçmişte daha var; bir sonraki turda devam.
      if(count < 100) g_fullScanDone = true;
     }
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
