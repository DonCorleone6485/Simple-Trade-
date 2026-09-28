//+------------------------------------------------------------------+
//|                                       SimpleTradingJournal.mq5   |
//|  Açık ve kapanan pozisyonları Simple Trading Journal'a gönderir.  |
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
#property version   "1.09"
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

// Bu oturumda gönderilmiş KAPANMIŞ pozisyonlar. Sunucu zaten aynı pozisyonu ikinci kez
// eklemez; bu liste sadece boşuna istek atmamak için.
long     g_sent[];
datetime g_scanFrom = 0;

/**
 * AÇIK POZİSYONLAR
 *
 * Kapanmayı beklemiyoruz: pozisyon açıldığı anda journal'a "açık işlem" olarak
 * giriyor. Sembol, yön, giriş fiyatı, stop ve hedef o anda belli; kullanıcının
 * bunları elle yazması için bir sebep yok. Notunu ve fotoğrafını hazır kayda
 * ekliyor, pozisyon kapandığında aynı satır sonuçla tamamlanıyor.
 *
 * Bunun mümkün olmasının sebebi: MetaTrader pozisyona açılışta bir numara
 * veriyor (POSITION_IDENTIFIER) ve kapanış işlemleri de aynı numarayı
 * taşıyor. Yani açık kayıt ile kapanış kaydı arasında tahmine yer yok.
 *
 * Aynı pozisyonu her turda tekrar göndermiyoruz; yalnızca yeniyse ya da
 * imzası değiştiyse (stop taşındı, hedef değişti, lot eklendi).
 */
long     g_open[];      // gönderilmiş açık pozisyonların numaraları
string   g_openSig[];   // her birinin son gönderilen hâli

int      g_total    = 0;   // bu oturumda gönderilen pozisyon sayısı
bool     g_fullScanDone = false;  // geçmişin tamamı bir kez tarandı mı
string   g_status   = "";  // grafiğe yazılan son durum
bool     g_ready    = false; // anahtar girilmiş ve tarama başlamış mı
string   g_key      = "";    // kullanılan anahtar: girilen ya da hatırlanan
string   g_journal  = "";    // anahtarın bağlı olduğu journal (sunucudan)

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


/**
 * Anahtarı hatırlarız. EA grafikten kalkıp yeniden eklendiğinde MetaTrader
 * girdileri boş getiriyor; kullanıcı her seferinde anahtarı bulup yeniden
 * yapıştırmak zorunda kalmasın. Dosya terminalin kendi MQL5/Files klasöründe.
 *
 * Anahtar hesap numarasına bağlı: aynı terminalde canlı ve prop hesabı
 * kullanan biri hesap değiştirince işlemler öteki hesabın journal'ına
 * gitmesin.
 */
string KeyFile() { return("SimpleTradingJournal_" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + ".key"); }

string LoadKey()
  {
   if(AccountInfoInteger(ACCOUNT_LOGIN) <= 0) return("");
   int h = FileOpen(KeyFile(), FILE_READ | FILE_TXT | FILE_ANSI);
   if(h == INVALID_HANDLE) return("");
   string key = FileReadString(h);
   FileClose(h);
   StringTrimLeft(key); StringTrimRight(key);
   return(key);
  }

void SaveKey(const string key)
  {
   if(AccountInfoInteger(ACCOUNT_LOGIN) <= 0) return;
   int h = FileOpen(KeyFile(), FILE_WRITE | FILE_TXT | FILE_ANSI);
   if(h == INVALID_HANDLE) return;
   FileWriteString(h, key);
   FileClose(h);
  }

/**
 * Durum grafiğin sol üst köşesinde durur.
 *
 * Kurulumu yapan kişinin "Araç kutusu > Uzmanlar" sekmesini bilmesi
 * gerekmesin: çalışıyor mu, ne eksik, kaç işlem gitti — hepsi ekranda.
 */
void Status(const string text)
  {
   g_status = text;
   Comment("Simple Trading Journal" + (g_journal != "" ? "  ->  Journal: " + g_journal : "") + "\n", Plain(text));
  }
/** Hem grafiğe hem Uzmanlar günlüğüne. */
void Say(const string text) { Status(text); LogLine(text); }

//+------------------------------------------------------------------+
int OnInit()
  {
   // Anahtar boşsa grafikten kendimizi kaldırmıyoruz. INIT_FAILED eklentiyi
   // sessizce siler: kullanıcı onu grafikte sanır, oysa hiç çalışmaz — ve
   // günlerce öyle kalır. Grafikte kalıp neyin eksik olduğunu söylüyoruz;
   // anahtar Girdiler'e yapıştırılınca MetaTrader OnInit'i yeniden çağırır.
   g_lang = DetectLang();
   g_key = ApiKey;
   StringTrimLeft(g_key); StringTrimRight(g_key);
   if(StringLen(g_key) < 8) g_key = LoadKey();

   if(StringLen(g_key) < 8)
     {
      g_ready = false;
      Say(Tx(T_NOKEY));
      Alert(Tx(T_NOKEY_ALERT));
      return(INIT_SUCCEEDED);
     }
   g_ready = true;

   g_scanFrom = TimeCurrent() - (datetime)HistoryDays * 86400;
   ArrayResize(g_sent, 0);
   ArrayResize(g_open, 0);
   ArrayResize(g_openSig, 0);

   EventSetTimer(PollSeconds < 5 ? 5 : PollSeconds);
   Say(Tx(T_SCANNING, IntegerToString(HistoryDays)));

   // Açılışta bir kez, işlem olmadan da bağlan: anahtarı hemen doğrular ve
   // hesabın gerçek sermayesini bildirir. Yeni işlem beklenirse journal
   // günlerce varsayılan 10.000 ile durur.
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
   g_scanFrom = TimeCurrent() - (datetime)HistoryDays * 86400;
  }

void OnTimer() { if(g_ready) { MaybeFullRescan(); ScanOpen(); Scan(); } }

// Pozisyon kapandığı anda beklemeden gönder.
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
  {
   if(!g_ready) return;
   // Bir işlem gerçekleşti: pozisyon açılmış, kapanmış ya da stop taşınmış
   // olabilir. İkisine de bakmak gerekiyor.
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD || trans.type == TRADE_TRANSACTION_POSITION)
     {
      ScanOpen();
      Scan();
     }
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

/** Açık pozisyonun son gönderilen hâli; yoksa boş döner. */
string OpenSig(const long positionId)
  {
   for(int i = 0; i < ArraySize(g_open); i++)
      if(g_open[i] == positionId) return(g_openSig[i]);
   return("");
  }

void MarkOpen(const long positionId, const string sig)
  {
   for(int i = 0; i < ArraySize(g_open); i++)
      if(g_open[i] == positionId) { g_openSig[i] = sig; return; }
   int n = ArraySize(g_open);
   ArrayResize(g_open, n + 1);
   ArrayResize(g_openSig, n + 1);
   g_open[n]    = positionId;
   g_openSig[n] = sig;
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
   // TimeCurrent() son fiyatın saatidir: hafta sonu cuma gecesinde donar ve
   // fark iki güne çıkar — işlemler iki gün ileri tarihli gönderilirdi.
   // TimeTradeServer() fiyat gelmese de sunucunun şu anki saatini verir.
   long diff = (long)TimeTradeServer() - (long)TimeGMT();
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

/**
 * Her isteğin başı: anahtar ve hangi MetaTrader hesabından geldiği.
 *
 * Hesap numarasıyla sunucu adı birlikte bir hesabı tanımlar — aynı numara
 * başka bir aracı kurumda başka bir hesaptır. Sunucu bunları açık hâlde
 * saklamaz, yalnızca özetini tutar; deneme süresinin aynı hesapla tekrar
 * tekrar açılmasını engellemek için kullanılıyor.
 */
string Head()
  {
   return("{\"key\":\"" + g_key + "\",\"account\":{\"login\":"
          + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + ","
          + JsonStr("server", AccountInfoString(ACCOUNT_SERVER)) + "}");
  }

/** İşlemsiz ilk istek: anahtarı doğrular, sermayeyi bildirir. */
void Hello()
  {
   double deposit = InitialDeposit();
   string json = Head();
   if(deposit > 0) json += ",\"startingCapital\":" + DoubleToString(deposit, 2);
   json += ",\"trades\":[]}";
   if(Send(json, 0))
     {
      // Sunucu kabul etti: anahtar doğru, bir dahaki eklemede hatırlanır.
      SaveKey(g_key);
      Status(Tx(T_WAITING));
     }
  }

//+------------------------------------------------------------------+
//| Açık pozisyonları gönderir                                        |
//|                                                                   |
//| Kapanış beklemeden journal'a düşsün: kullanıcı notunu, fotoğrafını |
//| ve kurulumunu pozisyon hayattayken yazıyor. Sunucu bu kaydı açık   |
//| olarak tutuyor, kapanış geldiğinde aynı numaradan bulup            |
//| tamamlıyor — ikinci bir satır açmıyor.                             |
//+------------------------------------------------------------------+
void ScanOpen()
  {
   int total = PositionsTotal();
   if(total <= 0) return;

   int    offset = ServerGmtOffset();
   string items[];
   long   ids[];
   string sigs[];
   int    ready = 0;

   for(int i = 0; i < total; i++)
     {
      if(!PositionGetTicket(i)) continue;

      long   pid    = PositionGetInteger(POSITION_IDENTIFIER);
      string sym    = PositionGetString(POSITION_SYMBOL);
      if(pid <= 0 || sym == "") continue;

      long   ptype  = PositionGetInteger(POSITION_TYPE);
      double volume = PositionGetDouble(POSITION_VOLUME);
      double price  = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl     = PositionGetDouble(POSITION_SL);
      double tp     = PositionGetDouble(POSITION_TP);
      long   opened = PositionGetInteger(POSITION_TIME);

      int d = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);
      if(d <= 0) d = 5;

      // İmza: bunlardan biri değişmedikçe aynı pozisyonu tekrar göndermiyoruz.
      // Stop taşındığında ya da lot eklendiğinde journal'daki kayıt tazelenmeli.
      string sig = DoubleToString(price, d) + "|" + DoubleToString(sl, d) + "|" +
                   DoubleToString(tp, d) + "|" + DoubleToString(volume, 2);
      if(OpenSig(pid) == sig) continue;

      // Stop mesafesinin kaç para ettiğini yalnızca terminal bilir: lot,
      // sözleşme büyüklüğü ve tick değeri buradadır. Stop yoksa risk de yok.
      double risk = 0;
      if(sl > 0)
        {
         double atStop = 0;
         ENUM_ORDER_TYPE ot = (ptype == POSITION_TYPE_BUY) ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
         if(OrderCalcProfit(ot, sym, volume, price, sl, atStop))
            risk = MathAbs(atStop);
        }

      string j = "{";
      j += "\"externalId\":" + IntegerToString(pid) + ",";
      j += JsonStr("state", "open") + ",";
      j += "\"openTime\":" + IntegerToString(opened - offset) + ",";
      j += JsonStr("symbol", sym) + ",";
      j += JsonStr("type", (ptype == POSITION_TYPE_BUY) ? "buy" : "sell") + ",";
      j += JsonPrice("openPrice", price, d) + ",";
      j += JsonPrice("sl", sl, d) + ",";
      j += JsonPrice("tp", tp, d) + ",";
      j += JsonNum("risk", risk);
      j += "}";

      ArrayResize(items, ready + 1);
      ArrayResize(ids, ready + 1);
      ArrayResize(sigs, ready + 1);
      items[ready] = j;
      ids[ready]   = pid;
      sigs[ready]  = sig;
      ready++;

      if(ready >= 100) break;   // sunucu tek istekte en fazla 200 kabul ediyor
     }

   if(ready == 0) return;

   string json = Head() + ",\"trades\":[";
   for(int i = 0; i < ready; i++)
     {
      if(i > 0) json += ",";
      json += items[i];
     }
   json += "]}";

   // Ancak sunucu kabul ettiyse gönderilmiş sayarız; ağ hatasında bir sonraki
   // turda yeniden denenir.
   if(Send(json, 0))
     {
      for(int i = 0; i < ready; i++)
         MarkOpen(ids[i], sigs[i]);
      if(Verbose) LogLine(Tx(T_SENT_LOG, IntegerToString(ready)));
     }
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
      LogLine(Tx(T_HISTORY_FAIL));
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

      // Kısmi kapanış: pozisyonun bir kısmı kapandı, kalanı hâlâ açık.
      // Tamamı kapanmadan göndermiyoruz; yoksa yarım kârla kaydolurdu.
      if(PositionSelectByTicket((ulong)pid)) continue;

      // Aynı pozisyonun birden çok çıkışı (TP1, TP2…) tek işlemdir. Geçmiş
      // zamana göre sıralı: sonraki çıkış kapanış bilgisinin üstüne yazar.
      int seen = -1;
      for(int j = 0; j < count; j++)
         if(posId[j] == pid) { seen = j; break; }
      if(seen >= 0)
        {
         closeDeal[seen]  = t;
         closeTime[seen]  = HistoryDealGetInteger(t, DEAL_TIME);
         closePrice[seen] = HistoryDealGetDouble(t, DEAL_PRICE);
         reasonCode[seen] = HistoryDealGetInteger(t, DEAL_REASON);
         continue;
        }

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

      // Pozisyona sonradan ekleme yapıldıysa açılış ilk giriştir.
      if(HistoryDealGetInteger(t, DEAL_ENTRY) == DEAL_ENTRY_IN && !hasOpen[k])
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

   string json = Head();
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
         // Anahtar başka bir MetaTrader hesabına bağlı: işlemler yanlış
         // journal'a gitmesin diye sunucu reddetti.
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
