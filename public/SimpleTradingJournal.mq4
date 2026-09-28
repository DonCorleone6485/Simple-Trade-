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
#property version   "1.09"
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
string   g_journal = "";
int      g_lastOpenCount = -1;
int      g_lastHistCount = -1;

//+------------------------------------------------------------------+
//| Mesajlar: MetaTrader'ın kendi dilinde                             |
//+------------------------------------------------------------------+
// Grafikteki mesajlar MetaTrader'ın menülerini anıyor (Araçlar > Seçenekler…),
// o yüzden dil sitenin değil terminalin dilidir: menü adları kullanıcının
// ekranda gördüğüyle aynı olsun. Desteklenmeyen dilde İngilizce.
// Sıra: en tr ru es pt de fr ar fa. Metni değiştirirsen MT4 ve MT5 dosyasında
// birlikte değiştir.
int g_lang = 0;

int DetectLang()
  {
   string l = TerminalInfoString(TERMINAL_LANGUAGE);
   StringToLower(l);
   if(StringFind(l, "turk") == 0)    return(1);
   if(StringFind(l, "russ") == 0)    return(2);
   if(StringFind(l, "span") == 0)    return(3);
   if(StringFind(l, "portu") == 0)   return(4);
   if(StringFind(l, "germ") == 0)    return(5);
   if(StringFind(l, "fren") == 0)    return(6);
   if(StringFind(l, "arab") == 0)    return(7);
   if(StringFind(l, "pers") == 0 || StringFind(l, "farsi") == 0) return(8);
   return(0);
  }

#define T_NOKEY 0
#define T_NOKEY_ALERT 1
#define T_SCANNING 2
#define T_RUNNING_OPEN 3
#define T_WAITING 4
#define T_NO_PERMISSION 5
#define T_CONN_FAIL 6
#define T_REPLACED 7
#define T_REPLACED_TO 8
#define T_REMOVE 9
#define T_INVALID 10
#define T_BOUND 11
#define T_SERVER_ERR 12
#define T_RUNNING_COUNT 13
#define T_HISTORY_FAIL 14
#define T_SENT_LOG 15

string g_text[] =
  {
   // T_NOKEY
   "KEY NOT ENTERED - the add-on is not working yet.\nPress F7 on the chart (or right-click > Expert Advisors > Properties),\npaste the key from the site into the ApiKey row on the Inputs tab, then OK.",
   "ANAHTAR GİRİLMEMİŞ - şu an çalışmıyor.\nGrafikte F7'ye bas (ya da sağ tık > Uzman Danışmanlar > Özellikler),\nGirdiler sekmesinde ApiKey satırına sitedeki anahtarı yapıştır, Tamam.",
   "КЛЮЧ НЕ ВВЕДЁН - дополнение пока не работает.\nНажмите F7 на графике (или правый клик > Советники > Свойства),\nна вкладке «Входные параметры» вставьте ключ с сайта в строку ApiKey и нажмите OK.",
   "CLAVE NO INTRODUCIDA - el complemento todavía no funciona.\nPulsa F7 en el gráfico (o clic derecho > Asesores Expertos > Propiedades),\npega la clave del sitio en la fila ApiKey de la pestaña Parámetros de entrada y pulsa Aceptar.",
   "CHAVE NÃO INTRODUZIDA - o complemento ainda não funciona.\nPressiona F7 no gráfico (ou clique direito > Expert Advisors > Propriedades),\ncola a chave do site na linha ApiKey do separador Parâmetros de entrada e clica em OK.",
   "KEIN SCHLÜSSEL EINGEGEBEN - das Add-on arbeitet noch nicht.\nDrücke F7 im Chart (oder Rechtsklick > Expert Advisors > Eigenschaften),\nfüge den Schlüssel von der Website in die Zeile ApiKey im Reiter Eingaben ein und klicke OK.",
   "CLÉ NON SAISIE - le module ne fonctionne pas encore.\nAppuyez sur F7 sur le graphique (ou clic droit > Expert Advisors > Propriétés),\ncollez la clé du site dans la ligne ApiKey de l'onglet Paramètres, puis OK.",
   "لم يتم إدخال المفتاح - الإضافة لا تعمل بعد.\nاضغط F7 على الرسم البياني (أو انقر بالزر الأيمن > المستشارون الخبراء > الخصائص)،\nوالصق المفتاح من الموقع في سطر ApiKey في تبويب المدخلات، ثم موافق.",
   "کلید وارد نشده - افزونه هنوز کار نمی‌کند.\nروی چارت F7 را بزن (یا راست‌کلیک > اکسپرت‌ها > ویژگی‌ها)،\nدر تب ورودی‌ها کلید سایت را در ردیف ApiKey بچسبان و تأیید را بزن.",
   // T_NOKEY_ALERT
   "Simple Trading Journal: no key entered, the add-on is not working. Press F7 on the chart and paste the key from the site into Inputs > ApiKey.",
   "Simple Trading Journal: anahtar girilmedi, eklenti çalışmıyor. Grafikte F7'ye basıp Girdiler > ApiKey satırına sitedeki anahtarı yapıştır.",
   "Simple Trading Journal: ключ не введён, дополнение не работает. Нажмите F7 на графике и вставьте ключ с сайта в «Входные параметры» > ApiKey.",
   "Simple Trading Journal: no se introdujo la clave, el complemento no funciona. Pulsa F7 en el gráfico y pega la clave del sitio en Parámetros de entrada > ApiKey.",
   "Simple Trading Journal: nenhuma chave introduzida, o complemento não funciona. Pressiona F7 no gráfico e cola a chave do site em Parâmetros de entrada > ApiKey.",
   "Simple Trading Journal: kein Schlüssel eingegeben, das Add-on arbeitet nicht. Drücke F7 im Chart und füge den Schlüssel von der Website unter Eingaben > ApiKey ein.",
   "Simple Trading Journal : aucune clé saisie, le module ne fonctionne pas. Appuyez sur F7 sur le graphique et collez la clé du site dans Paramètres > ApiKey.",
   "Simple Trading Journal: لم يتم إدخال المفتاح، الإضافة لا تعمل. اضغط F7 على الرسم البياني والصق المفتاح من الموقع في المدخلات > ApiKey.",
   "Simple Trading Journal: کلید وارد نشده و افزونه کار نمی‌کند. روی چارت F7 را بزن و کلید سایت را در ورودی‌ها > ApiKey بچسبان.",
   // T_SCANNING
   "Connected. Scanning the last %1 days...",
   "Bağlandı. Son %1 gün taranıyor...",
   "Подключено. Проверка сделок за последние %1 дн...",
   "Conectado. Revisando los últimos %1 días...",
   "Ligado. A verificar os últimos %1 dias...",
   "Verbunden. Die letzten %1 Tage werden durchsucht...",
   "Connecté. Analyse des %1 derniers jours...",
   "تم الاتصال. جارٍ فحص آخر %1 يوم...",
   "وصل شد. در حال بررسی %1 روز اخیر...",
   // T_RUNNING_OPEN
   "Running. Open trades were added to the journal;\nthe same entries will be completed with the result when they close.",
   "Çalışıyor. Açık işlemler journal'a girildi;\nkapandıklarında aynı kayıtlar sonuçla tamamlanacak.",
   "Работает. Открытые сделки добавлены в журнал;\nпосле закрытия эти же записи дополнятся результатом.",
   "Funcionando. Las operaciones abiertas se añadieron al diario;\nal cerrarse, esos mismos registros se completarán con el resultado.",
   "A funcionar. As operações abertas foram adicionadas ao diário;\nao fechar, os mesmos registos serão completados com o resultado.",
   "Läuft. Offene Trades wurden ins Journal eingetragen;\nbeim Schließen werden dieselben Einträge mit dem Ergebnis ergänzt.",
   "En marche. Les positions ouvertes ont été ajoutées au journal ;\nà la clôture, ces mêmes entrées seront complétées avec le résultat.",
   "يعمل. أُضيفت الصفقات المفتوحة إلى السجل؛\nوعند إغلاقها تُستكمل السجلات نفسها بالنتيجة.",
   "در حال کار. معاملات باز به ژورنال اضافه شدند؛\nبعد از بسته شدن، همان رکوردها با نتیجه کامل می‌شوند.",
   // T_WAITING
   "Connected. Waiting for the next closed trade.",
   "Bağlantı tamam. Yeni kapanan işlem bekleniyor.",
   "Подключено. Ожидание следующей закрытой сделки.",
   "Conectado. Esperando la próxima operación cerrada.",
   "Ligado. À espera da próxima operação fechada.",
   "Verbunden. Warte auf den nächsten geschlossenen Trade.",
   "Connecté. En attente de la prochaine position clôturée.",
   "تم الاتصال. بانتظار الصفقة المغلقة التالية.",
   "وصل شد. منتظر معامله بسته‌شده بعدی.",
   // T_NO_PERMISSION
   "Not allowed yet.\nIn Tools > Options > Expert Advisors, tick\n\"Allow WebRequest for listed URL\" and add to the list: %1",
   "İzin yok.\nAraçlar > Seçenekler > Uzman Danışmanlar sekmesinde\n\"Listelenen URL'ler için WebRequest'e izin ver\" kutusunu işaretle\nve listeye ekle: %1",
   "Нет разрешения.\nСервис > Настройки > Советники: отметьте\n«Разрешить WebRequest для следующих URL» и добавьте в список: %1",
   "Sin permiso.\nEn Herramientas > Opciones > Asesores Expertos, marca la casilla\nque permite WebRequest para las URL de la lista y añade: %1",
   "Sem permissão.\nEm Ferramentas > Opções > Expert Advisors, marca a opção\nque permite WebRequest para os URLs da lista e adiciona: %1",
   "Keine Erlaubnis.\nUnter Extras > Optionen > Expert Advisors das Kästchen\nfür WebRequest bei aufgelisteten URLs anhaken und hinzufügen: %1",
   "Pas d'autorisation.\nDans Outils > Options > Expert Advisors, cochez la case\nautorisant WebRequest pour les URL listées et ajoutez : %1",
   "لا يوجد إذن.\nمن أدوات > خيارات > المستشارون الخبراء، فعّل خيار\nالسماح بـ WebRequest للعناوين المدرجة وأضف: %1",
   "اجازه داده نشده.\nدر ابزارها > تنظیمات > اکسپرت‌ها، گزینه\nاجازه WebRequest برای آدرس‌های فهرست را تیک بزن و این را اضافه کن: %1",
   // T_CONN_FAIL
   "Could not connect (error %1). Check your internet connection.",
   "Bağlantı kurulamadı (hata %1). İnternet bağlantını kontrol et.",
   "Не удалось подключиться (ошибка %1). Проверьте подключение к интернету.",
   "No se pudo conectar (error %1). Revisa tu conexión a internet.",
   "Não foi possível ligar (erro %1). Verifica a tua ligação à internet.",
   "Keine Verbindung (Fehler %1). Prüfe deine Internetverbindung.",
   "Connexion impossible (erreur %1). Vérifiez votre connexion internet.",
   "تعذّر الاتصال (خطأ %1). تحقق من اتصالك بالإنترنت.",
   "اتصال برقرار نشد (خطا %1). اینترنتت را بررسی کن.",
   // T_REPLACED
   "This key was replaced by a newer one.",
   "Bu anahtar yenisiyle değiştirildi.",
   "Этот ключ заменён более новым.",
   "Esta clave fue reemplazada por una más nueva.",
   "Esta chave foi substituída por uma mais recente.",
   "Dieser Schlüssel wurde durch einen neueren ersetzt.",
   "Cette clé a été remplacée par une plus récente.",
   "تم استبدال هذا المفتاح بمفتاح أحدث.",
   "این کلید با کلید جدیدتری جایگزین شد.",
   // T_REPLACED_TO
   "This account now sends to the \"%1\" journal.",
   "Bu hesap artık \"%1\" journal'ına gönderiyor.",
   "Теперь этот счёт отправляет сделки в журнал «%1».",
   "Esta cuenta ahora envía al diario \"%1\".",
   "Esta conta agora envia para o diário \"%1\".",
   "Dieses Konto sendet jetzt an das Journal \"%1\".",
   "Ce compte envoie désormais au journal « %1 ».",
   "هذا الحساب يرسل الآن إلى سجل \"%1\".",
   "این حساب حالا به ژورنال «%1» می‌فرستد.",
   // T_REMOVE
   "You can remove the add-on from this chart.",
   "Bu grafikteki eklentiyi kaldırabilirsin.",
   "Дополнение можно удалить с этого графика.",
   "Puedes quitar el complemento de este gráfico.",
   "Podes remover o complemento deste gráfico.",
   "Du kannst das Add-on von diesem Chart entfernen.",
   "Vous pouvez retirer le module de ce graphique.",
   "يمكنك إزالة الإضافة من هذا الرسم البياني.",
   "می‌توانی افزونه را از این چارت برداری.",
   // T_INVALID
   "Key invalid or revoked.\nCreate a new key on the site and paste it here.",
   "Anahtar geçersiz ya da iptal edilmiş.\nSiteden yeni anahtar oluşturup buraya yapıştır.",
   "Ключ недействителен или отозван.\nСоздайте новый ключ на сайте и вставьте его сюда.",
   "Clave no válida o revocada.\nCrea una clave nueva en el sitio y pégala aquí.",
   "Chave inválida ou revogada.\nCria uma nova chave no site e cola-a aqui.",
   "Schlüssel ungültig oder widerrufen.\nErstelle auf der Website einen neuen Schlüssel und füge ihn hier ein.",
   "Clé invalide ou révoquée.\nCréez une nouvelle clé sur le site et collez-la ici.",
   "المفتاح غير صالح أو ملغى.\nأنشئ مفتاحًا جديدًا في الموقع والصقه هنا.",
   "کلید نامعتبر است یا لغو شده.\nدر سایت کلید جدیدی بساز و اینجا بچسبان.",
   // T_BOUND
   "This key is linked to another MetaTrader account.\nCreate a new key for this account on the site and paste it here.",
   "Bu anahtar başka bir MetaTrader hesabına bağlı.\nBu hesap için siteden yeni anahtar oluşturup buraya yapıştır.",
   "Этот ключ привязан к другому счёту MetaTrader.\nСоздайте на сайте новый ключ для этого счёта и вставьте его сюда.",
   "Esta clave está vinculada a otra cuenta de MetaTrader.\nCrea una clave nueva para esta cuenta en el sitio y pégala aquí.",
   "Esta chave está associada a outra conta do MetaTrader.\nCria uma nova chave para esta conta no site e cola-a aqui.",
   "Dieser Schlüssel ist mit einem anderen MetaTrader-Konto verknüpft.\nErstelle auf der Website einen neuen Schlüssel für dieses Konto und füge ihn hier ein.",
   "Cette clé est liée à un autre compte MetaTrader.\nCréez une nouvelle clé pour ce compte sur le site et collez-la ici.",
   "هذا المفتاح مرتبط بحساب MetaTrader آخر.\nأنشئ مفتاحًا جديدًا لهذا الحساب في الموقع والصقه هنا.",
   "این کلید به حساب MetaTrader دیگری وصل است.\nدر سایت برای این حساب کلید جدیدی بساز و اینجا بچسبان.",
   // T_SERVER_ERR
   "Server error (%1).",
   "Sunucu hatası (%1).",
   "Ошибка сервера (%1).",
   "Error del servidor (%1).",
   "Erro do servidor (%1).",
   "Serverfehler (%1).",
   "Erreur du serveur (%1).",
   "خطأ في الخادم (%1).",
   "خطای سرور (%1).",
   // T_RUNNING_COUNT
   "Running. Trades sent this session: %1",
   "Çalışıyor. Bu oturumda gönderilen işlem: %1",
   "Работает. Отправлено сделок за сеанс: %1",
   "Funcionando. Operaciones enviadas en esta sesión: %1",
   "A funcionar. Operações enviadas nesta sessão: %1",
   "Läuft. In dieser Sitzung gesendete Trades: %1",
   "En marche. Positions envoyées pendant cette session : %1",
   "يعمل. الصفقات المرسلة في هذه الجلسة: %1",
   "در حال کار. معاملات فرستاده‌شده در این جلسه: %1",
   // T_HISTORY_FAIL
   "Could not read the trade history.",
   "İşlem geçmişi okunamadı.",
   "Не удалось прочитать историю сделок.",
   "No se pudo leer el historial de operaciones.",
   "Não foi possível ler o histórico de operações.",
   "Die Handelshistorie konnte nicht gelesen werden.",
   "Impossible de lire l'historique des positions.",
   "تعذّرت قراءة سجل الصفقات.",
   "تاریخچه معاملات خوانده نشد.",
   // T_SENT_LOG
   "%1 trades sent.",
   "%1 işlem gönderildi.",
   "Отправлено сделок: %1.",
   "%1 operaciones enviadas.",
   "%1 operações enviadas.",
   "%1 Trades gesendet.",
   "%1 positions envoyées.",
   "تم إرسال %1 صفقة.",
   "%1 معامله فرستاده شد."
  };

string Tx(const int id) { return(g_text[id * 9 + g_lang]); }
string Tx(const int id, const string a) { string s = g_text[id * 9 + g_lang]; StringReplace(s, "%1", a); return(s); }

/**
 * Grafik için aksansız yazım. Grafikte Türkçe harflerin bozulduğu görüldü;
 * Latin alfabeli dillerde harfleri sadeleştiriyoruz (ş -> s, é -> e, ü -> ue).
 * Rusça, Arapça ve Farsçada sadeleştirecek bir karşılık yok, olduğu gibi kalır.
 */
string Plain(string s)
  {
   if(g_lang >= 7 || g_lang == 2) return(s);
   if(g_lang == 5)
     {
      StringReplace(s, "ä", "ae"); StringReplace(s, "ö", "oe"); StringReplace(s, "ü", "ue");
      StringReplace(s, "Ä", "AE"); StringReplace(s, "Ö", "OE"); StringReplace(s, "Ü", "UE");
     }
   StringReplace(s, "ß", "ss");
   string from = "çğıöşüÇĞİÖŞÜáàâãäéèêëíìîïóòôõúùûñÁÀÂÃÉÈÊÍÓÔÕÚÑ«»";
   string to   = "cgiosuCGIOSUaaaaaeeeeiiiioooouuunAAAAEEEIOOOUN\"\"";
   for(int i = 0; i < StringLen(from); i++)
      StringReplace(s, StringSubstr(from, i, 1), StringSubstr(to, i, 1));
   return(s);
  }

/** Günlüğe tek satır: grafikteki çok satırlı mesajın aynısı. */
void LogLine(string s) { StringReplace(s, "\n", " "); Print(s); }


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

void Status(const string text) { Comment("Simple Trading Journal" + (g_journal != "" ? "  ->  Journal: " + g_journal : "") + "\n", Plain(text)); }
/** Hem grafiğe hem Uzmanlar günlüğüne. */
void Say(const string text) { Status(text); LogLine(text); }

//+------------------------------------------------------------------+
int OnInit()
  {
   // Anahtar boşsa grafikten kendimizi kaldırmıyoruz (MT5 sürümündeki gibi):
   // eklenti grafikte kalıp neyin eksik olduğunu söylüyor.
   g_lang = DetectLang();
   g_key = StringTrimLeft(StringTrimRight(ApiKey));
   if(StringLen(g_key) < 8) g_key = LoadKey();

   if(StringLen(g_key) < 8)
     {
      g_ready = false;
      Say(Tx(T_NOKEY));
      Alert(Tx(T_NOKEY_ALERT));
      return(INIT_SUCCEEDED);
     }
   g_ready = true;

   ArrayResize(g_sent, 0);
   ArrayResize(g_open, 0);
   ArrayResize(g_openSig, 0);
   g_fullScanDone = false;

   EventSetTimer(PollSeconds < 5 ? 5 : PollSeconds);
   Say(Tx(T_SCANNING, IntegerToString(HistoryDays)));

   Hello();
   ScanOpen();
   Scan();
   if(g_total == 0)
      Status(Tx(T_RUNNING_OPEN));
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason) { EventKillTimer(); Comment(""); }

// Saatte bir geçmişin tamamı yeniden gönderilir. Sunucu journal'da zaten
// olanı atlıyor; bu sayede o an kabul edilmemiş bir işlem (ör. anahtar yanlış
// journal'a bağlıyken gönderilmiş) eklentiyi yeniden başlatmadan gelir.
// Kullanıcının journal'dan sildiği işlemi sunucu hatırlıyor, geri getirmiyor.
datetime g_lastFullScan = 0;
void MaybeFullRescan()
  {
   if(g_lastFullScan == 0) { g_lastFullScan = TimeLocal(); return; }
   if(TimeLocal() - g_lastFullScan < 3600) return;
   g_lastFullScan = TimeLocal();
   ArrayResize(g_sent, 0);
   g_fullScanDone = false;
  }

void OnTimer() { if(g_ready) { MaybeFullRescan(); ScanOpen(); Scan(); } }

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
      Status(Tx(T_WAITING));
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
      if(Verbose) LogLine(Tx(T_SENT_LOG, IntegerToString(ready)));
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

/**
 * Sunucunun cevabındaki journal adı ("journal":"..."). Grafikte gösteriliyor:
 * eski bir anahtar takılı kalırsa işlemlerin nereye gittiği ilk bakışta
 * görünsün. Türkçe karakterler grafikte bozulabildiği için olduğu gibi yazılır.
 */
string JournalName(const string body)
  {
   string tag = "\"journal\":\"";
   int s = StringFind(body, tag);
   if(s < 0) return("");
   s += StringLen(tag);
   int e = StringFind(body, "\"", s);
   if(e <= s) return("");
   return(StringSubstr(body, s, e - s));
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
         Say(Tx(T_NO_PERMISSION, ServerUrl));
        }
      else
        {
         Say(Tx(T_CONN_FAIL, IntegerToString(err)));
        }
      return(false);
     }

   string body = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
   if(status == 200)
     {
      string jn = JournalName(body);
      if(jn != "") g_journal = jn;
     }

   if(status != 200)
     {
      if(status == 401 || status == 409) g_journal = "";
      if(status == 401 && StringFind(body, "\"key_replaced\"") >= 0)
        {
         // Aynı MT hesabına daha yeni bir anahtar bağlandı: bu grafik artık
         // gereksiz. Göndermeyi bırakıyoruz ve nedenini söylüyoruz.
         string to = JournalName(body);
         g_ready = false;
         EventKillTimer();
         Say(Tx(T_REPLACED) + "\n"
             + (to != "" ? Tx(T_REPLACED_TO, to) + "\n" : "")
             + Tx(T_REMOVE));
         return(false);
        }
      if(status == 401)
        {
         Say(Tx(T_INVALID));
        }
      else if(status == 409)
        {
         Say(Tx(T_BOUND));
        }
      else
         Status(Tx(T_SERVER_ERR, IntegerToString(status)));
      Print("HTTP ", status, ": ", body);
      return(false);
     }

   if(count > 0)
     {
      g_total += count;
      Status(Tx(T_RUNNING_COUNT, IntegerToString(g_total)));
     }
   if(Verbose && count > 0) Print(Tx(T_SENT_LOG, IntegerToString(count)), " -> ", body);
   return(true);
  }
//+------------------------------------------------------------------+
