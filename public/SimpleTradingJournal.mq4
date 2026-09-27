//+------------------------------------------------------------------+
//|                                       SimpleTradingJournal.mq4   |
//|  MetaTrader 4 sürümü: açık ve kapanan emirleri Simple Trading     |
//|  Journal'a gönderir. MT5 sürümüyle (SimpleTradingJournal.mq5)     |
//|  aynı işi yapar, sunucuya aynı biçimde gönderir.                  |
//|                                                                  |
//|  Kurulum:                                                        |
//|   1) Araçlar > Seçenekler > Uzman Danışmanlar sekmesinde         |
//|      "Listelenen URL'ler için WebRequest'e izin ver" kutusunu     |
//|      işaretle ve listeye https://www.simpletradejournal.io ekle.  |
//|   2) Bu dosyayı MQL4/Experts klasörüne koy.                       |
//|   3) Herhangi bir grafiğe sürükle, açılan pencerede journal       |
//|      anahtarını ApiKey alanına yapıştır.                          |
//|                                                                  |
//|  MT4 ile MT5'in farkı: MT4'te "pozisyon" yok, her işlem bir emir  |
//|  numarasıdır (ticket). Açık emir o numarayla gider, kapanınca      |
//|  aynı numarayla tamamlanır. Kısmi kapanışta MT4 kalan kısma yeni   |
//|  numara verir; journal'da iki ayrı işlem olarak görünür.           |
//+------------------------------------------------------------------+
#property copyright "Simple Trading Journal"
#property link      "https://www.simpletradejournal.io"
#property version   "1.06"
#property strict

input string ApiKey       = "";                                   // ApiKey  (stj_...)
input string ServerUrl    = "https://www.simpletradejournal.io";  // ServerUrl
input int    PollSeconds  = 30;                                   // PollSeconds
input int    HistoryDays  = 365;                                  // HistoryDays
input bool   Verbose      = true;                                 // Verbose

int      g_sent[];          // bu oturumda gönderilmiş kapanmış emirler
int      g_open[];          // gönderilmiş açık emirler
string   g_openSig[];       // her birinin son gönderilen hâli
int      g_total = 0;
bool     g_fullScanDone = false;
bool     g_ready = false;
string   g_key = "";
int      g_lastOpenCount = -1;
int      g_lastHistCount = -1;

string KeyFile() { return("SimpleTradingJournal_" + IntegerToString(AccountNumber()) + ".key"); }

string LoadKey()
  {
   if(AccountNumber() <= 0) return("");
   int h = FileOpen(KeyFile(), FILE_READ | FILE_TXT | FILE_ANSI);
   if(h == INVALID_HANDLE) return("");
   string key = FileReadString(h);
   FileClose(h);
   key = StringTrimLeft(StringTrimRight(key));
   return(key);
  }

void SaveKey(const string key)
  {
   if(AccountNumber() <= 0) return;
   int h = FileOpen(KeyFile(), FILE_WRITE | FILE_TXT | FILE_ANSI);
   if(h == INVALID_HANDLE) return;
   FileWriteString(h, key);
   FileClose(h);
  }

void Status(const string text) { Comment("Simple Trading Journal\n", text); }

//+------------------------------------------------------------------+
int OnInit()
  {
   // Anahtar boşsa grafikten kendimizi kaldırmıyoruz (MT5 sürümündeki gibi):
   // eklenti grafikte kalıp neyin eksik olduğunu söylüyor.
   g_key = StringTrimLeft(StringTrimRight(ApiKey));
   if(StringLen(g_key) < 8) g_key = LoadKey();

   if(StringLen(g_key) < 8)
     {
      g_ready = false;
      Status("ANAHTAR GIRILMEMIS - su an calismiyor.\n"
             "Grafikte F7'ye bas (ya da sag tik > Uzman Danismanlar > Ozellikler),\n"
             "Girdiler sekmesinde ApiKey satirina sitedeki anahtari yapistir, Tamam.");
      Print("HATA: ApiKey boş. Grafikte F7 > Girdiler > ApiKey satırına journal'daki anahtarı yapıştır.");
      Alert("Simple Trading Journal: anahtar girilmedi, eklenti çalışmıyor. "
            "Grafikte F7'ye basıp Girdiler > ApiKey satırına sitedeki anahtarı yapıştır.");
      return(INIT_SUCCEEDED);
     }
   g_ready = true;

   ArrayResize(g_sent, 0);
   ArrayResize(g_open, 0);
   ArrayResize(g_openSig, 0);
   g_fullScanDone = false;

   EventSetTimer(PollSeconds < 5 ? 5 : PollSeconds);
   Status("Baglandi. Son " + IntegerToString(HistoryDays) + " gun taraniyor...");
   Print("Simple Trading Journal (MT4) bağlandı. İlk tarama: son ", HistoryDays, " gün.");

   Hello();
   ScanOpen();
   Scan();
   if(g_total == 0)
      Status("Calisiyor. Acik emirler journal'a girildi;\n"
             "kapandiklarinda ayni kayitlar sonucla tamamlanacak.");
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason) { EventKillTimer(); Comment(""); }

void OnTimer() { if(g_ready) { ScanOpen(); Scan(); } }

// MT4'te işlem olayı yok: her fiyatta emir sayıları değişti mi diye bakıyoruz,
// değiştiyse (açıldı / kapandı) zamanlayıcıyı beklemeden gönderiyoruz.
void OnTick()
  {
   if(!g_ready) return;
   int o = OrdersTotal(), h = OrdersHistoryTotal();
   if(o != g_lastOpenCount || h != g_lastHistCount)
     {
      g_lastOpenCount = o; g_lastHistCount = h;
      ScanOpen();
      Scan();
     }
  }

//+------------------------------------------------------------------+
bool AlreadySent(const int ticket)
  {
   for(int i = 0; i < ArraySize(g_sent); i++)
      if(g_sent[i] == ticket) return(true);
   return(false);
  }

void MarkSent(const int ticket)
  {
   int n = ArraySize(g_sent);
   ArrayResize(g_sent, n + 1);
   g_sent[n] = ticket;
  }

string OpenSig(const int ticket)
  {
   for(int i = 0; i < ArraySize(g_open); i++)
      if(g_open[i] == ticket) return(g_openSig[i]);
   return("");
  }

void MarkOpen(const int ticket, const string sig)
  {
   for(int i = 0; i < ArraySize(g_open); i++)
      if(g_open[i] == ticket) { g_openSig[i] = sig; return; }
   int n = ArraySize(g_open);
   ArrayResize(g_open, n + 1);
   ArrayResize(g_openSig, n + 1);
   g_open[n] = ticket;
   g_openSig[n] = sig;
  }

/** Hesabın başlangıç sermayesi: bakiye kayıtlarının (tür 6) toplamı. */
double InitialDeposit()
  {
   double total = 0;
   int n = OrdersHistoryTotal();
   for(int i = 0; i < n; i++)
     {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;
      if(OrderType() == 6) total += OrderProfit();
     }
   return(total);
  }

/**
 * Sunucu saatinin GMT'den farkı. MT4'te TimeTradeServer() yok; TimeCurrent()
 * son fiyatın saati olduğu için hafta sonu donar. Piyasa açıkken ölçüp
 * saklıyoruz, donmuşken (fark 14 saati aşıyorsa) son ölçümü kullanıyoruz.
 */
int ServerGmtOffset()
  {
   long diff = (long)TimeCurrent() - (long)TimeGMT();
   int rounded = (int)(MathRound((double)diff / 1800.0) * 1800);
   string gv = "STJ_GMT_OFFSET";
   if(MathAbs(rounded) <= 14 * 3600)
     {
      GlobalVariableSet(gv, rounded);
      return(rounded);
     }
   if(GlobalVariableCheck(gv)) return((int)GlobalVariableGet(gv));
   return(0);
  }

string JsonStr(const string key, const string value)
  {
   string v = value;
   StringReplace(v, "\\", "\\\\");
   StringReplace(v, "\"", "\\\"");
   return("\"" + key + "\":\"" + v + "\"");
  }

string JsonNum(const string key, const double value) { return("\"" + key + "\":" + DoubleToString(value, 2)); }
string JsonPrice(const string key, const double value, const int digits) { return("\"" + key + "\":" + DoubleToString(value, digits)); }

string Head()
  {
   return("{\"key\":\"" + g_key + "\",\"account\":{\"login\":"
          + IntegerToString(AccountNumber()) + ","
          + JsonStr("server", AccountServer()) + "}");
  }

void Hello()
  {
   double deposit = InitialDeposit();
   string json = Head();
   if(deposit > 0) json += ",\"startingCapital\":" + DoubleToString(deposit, 2);
   json += ",\"trades\":[]}";
   if(Send(json, 0))
     {
      SaveKey(g_key);
      Status("Baglanti tamam. Yeni kapanan islem bekleniyor.");
     }
  }

int DigitsOf(const string sym)
  {
   int d = (int)MarketInfo(sym, MODE_DIGITS);
   return(d > 0 ? d : 5);
  }

/**
 * Stop mesafesinin kaç para ettiği. MT4'te OrderCalcProfit yok; tick değeri
 * ve tick büyüklüğüyle hesaplıyoruz (tick değeri hesap para biriminde).
 */
double RiskAtStop(const string sym, const double lots, const double openPrice, const double sl)
  {
   if(sl <= 0) return(0);
   double tickValue = MarketInfo(sym, MODE_TICKVALUE);
   double tickSize  = MarketInfo(sym, MODE_TICKSIZE);
   if(tickValue <= 0 || tickSize <= 0) return(0);
   return(MathAbs(openPrice - sl) / tickSize * tickValue * lots);
  }

//+------------------------------------------------------------------+
//| Açık emirler: kapanış beklemeden journal'a "açık işlem" olarak      |
//+------------------------------------------------------------------+
void ScanOpen()
  {
   int total = OrdersTotal();
   if(total <= 0) return;

   int    offset = ServerGmtOffset();
   string items[];
   int    ids[];
   string sigs[];
   int    ready = 0;

   for(int i = 0; i < total; i++)
     {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      int type = OrderType();
      if(type != OP_BUY && type != OP_SELL) continue;   // bekleyen emirler işlem değil

      int    ticket = OrderTicket();
      string sym    = OrderSymbol();
      double lots   = OrderLots();
      double price  = OrderOpenPrice();
      double sl     = OrderStopLoss();
      double tp     = OrderTakeProfit();
      int    d      = DigitsOf(sym);

      string sig = DoubleToString(price, d) + "|" + DoubleToString(sl, d) + "|" +
                   DoubleToString(tp, d) + "|" + DoubleToString(lots, 2);
      if(OpenSig(ticket) == sig) continue;

      string j = "{";
      j += "\"externalId\":" + IntegerToString(ticket) + ",";
      j += JsonStr("state", "open") + ",";
      j += "\"openTime\":" + IntegerToString((long)OrderOpenTime() - offset) + ",";
      j += JsonStr("symbol", sym) + ",";
      j += JsonStr("type", type == OP_BUY ? "buy" : "sell") + ",";
      j += JsonPrice("openPrice", price, d) + ",";
      j += JsonPrice("sl", sl, d) + ",";
      j += JsonPrice("tp", tp, d) + ",";
      j += JsonNum("risk", RiskAtStop(sym, lots, price, sl));
      j += "}";

      ArrayResize(items, ready + 1);
      ArrayResize(ids, ready + 1);
      ArrayResize(sigs, ready + 1);
      items[ready] = j; ids[ready] = ticket; sigs[ready] = sig;
      ready++;
      if(ready >= 100) break;
     }

   if(ready == 0) return;

   string json = Head() + ",\"trades\":[";
   for(int i = 0; i < ready; i++) { if(i > 0) json += ","; json += items[i]; }
   json += "]}";

   if(Send(json, 0))
     {
      for(int i = 0; i < ready; i++) MarkOpen(ids[i], sigs[i]);
      if(Verbose) Print(ready, " açık emir gönderildi.");
     }
  }

//+------------------------------------------------------------------+
//| Kapanmış emirler                                                  |
//+------------------------------------------------------------------+
void Scan()
  {
   datetime from = g_fullScanDone ? TimeCurrent() - 3 * 86400 : TimeCurrent() - (datetime)HistoryDays * 86400;
   int    offset = ServerGmtOffset();
   string items[];
   int    ids[];
   int    ready = 0;

   int n = OrdersHistoryTotal();
   for(int i = 0; i < n; i++)
     {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;
      int type = OrderType();
      if(type != OP_BUY && type != OP_SELL) continue;   // bakiye, kredi, iptal edilmiş bekleyen emir
      if(OrderCloseTime() <= 0 || OrderCloseTime() < from) continue;

      int ticket = OrderTicket();
      if(AlreadySent(ticket)) continue;

      string sym   = OrderSymbol();
      int    d     = DigitsOf(sym);
      double sl    = OrderStopLoss();
      double tp    = OrderTakeProfit();
      double close = OrderClosePrice();

      // MT4 stopla / hedefle kapanan emrin açıklamasına [sl] / [tp] yazar.
      string comment = OrderComment();
      string reason = "manual";
      if(StringFind(comment, "[sl]") >= 0) { reason = "sl"; if(sl == 0) sl = close; }
      else if(StringFind(comment, "[tp]") >= 0) { reason = "tp"; if(tp == 0) tp = close; }

      string j = "{";
      j += "\"externalId\":" + IntegerToString(ticket) + ",";
      j += "\"openTime\":"  + IntegerToString((long)OrderOpenTime()  - offset) + ",";
      j += "\"closeTime\":" + IntegerToString((long)OrderCloseTime() - offset) + ",";
      j += JsonStr("symbol", sym) + ",";
      j += JsonStr("type", type == OP_BUY ? "buy" : "sell") + ",";
      j += JsonPrice("openPrice", OrderOpenPrice(), d) + ",";
      j += JsonPrice("closePrice", close, d) + ",";
      j += JsonPrice("sl", sl, d) + ",";
      j += JsonPrice("tp", tp, d) + ",";
      j += JsonNum("profit", OrderProfit()) + ",";
      j += JsonNum("commission", OrderCommission()) + ",";
      j += JsonNum("swap", OrderSwap()) + ",";
      j += JsonNum("fee", 0) + ",";
      j += JsonStr("closeReason", reason);
      j += "}";

      ArrayResize(items, ready + 1);
      ArrayResize(ids, ready + 1);
      items[ready] = j; ids[ready] = ticket;
      ready++;
      if(ready >= 100) break;
     }

   if(ready == 0) { g_fullScanDone = true; return; }

   string json = Head();
   double deposit = InitialDeposit();
   if(deposit > 0) json += ",\"startingCapital\":" + DoubleToString(deposit, 2);
   json += ",\"trades\":[";
   for(int i = 0; i < ready; i++) { if(i > 0) json += ","; json += items[i]; }
   json += "]}";

   if(Send(json, ready))
     {
      for(int i = 0; i < ready; i++) MarkSent(ids[i]);
      if(ready < 100) g_fullScanDone = true;
     }
  }

//+------------------------------------------------------------------+
bool Send(const string json, const int count)
  {
   string url = ServerUrl + "/api/ingest";
   string headers = "Content-Type: application/json\r\n";
   char post[], result[];
   string resultHeaders;

   int len = StringToCharArray(json, post, 0, WHOLE_ARRAY, CP_UTF8) - 1;
   if(len < 0) return(false);
   ArrayResize(post, len);

   ResetLastError();
   int status = WebRequest("POST", url, headers, 10000, post, result, resultHeaders);

   if(status == -1)
     {
      int err = GetLastError();
      if(err == 4060 || err == 4014)
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
      else if(status == 409)
        {
         Status("Bu anahtar baska bir MetaTrader hesabina bagli.\nBu hesap icin siteden yeni anahtar olusturup buraya yapistir.");
         Print("Bu anahtar başka bir MetaTrader hesabına bağlı. Bu hesap için sitede yeni anahtar oluştur.");
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
   if(Verbose && count > 0) Print(count, " emir gönderildi -> ", body);
   return(true);
  }
//+------------------------------------------------------------------+
