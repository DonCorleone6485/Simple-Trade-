import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'tr' | 'en' | 'fa' | 'ar' | 'ru' | 'es' | 'pt' | 'de' | 'fr';

interface Translations {
  [key: string]: { tr: string; en: string; fa: string; ar: string; ru: string; es: string; pt: string; de: string; fr: string; };
}

export const translations: Translations = {
  appTitle: { tr: 'Trade Journal', en: 'Trade Journal', fa: 'دفترچه معاملات', ar: 'سجل التداول', ru: 'Торговый журнал', es: 'Diario de Trading', pt: 'Diário de Trading', de: 'Trading Journal', fr: 'Journal de Trading' },
  dashboardTitle: { tr: 'Journal', en: 'Journal', fa: 'ژورنال', ar: 'السجل', ru: 'Журнал', es: 'Diario', pt: 'Diário', de: 'Journal', fr: 'Journal' },
  newJournal: { tr: 'Yeni Journal', en: 'New Journal', fa: 'ژورنال جدید', ar: 'سجل جديد', ru: 'Новый журнал', es: 'Nuevo Diario', pt: 'Novo Diário', de: 'Neues Journal', fr: 'Nouveau Journal' },
  newJournalSubtitle: { tr: 'Yeni bir işlem günlüğü başlat', en: 'Start a new trading journal', fa: 'یک دفترچه معاملاتی جدید شروع کنید', ar: 'ابدأ سجل تداول جديد', ru: 'Начать новый торговый журнал', es: 'Iniciar un nuevo diario de trading', pt: 'Iniciar um novo diário de trading', de: 'Neues Trading-Journal starten', fr: 'Démarrer un nouveau journal de trading' },
  importTarget: { tr: 'İşlemler nereye eklensin?', en: 'Where should the trades go?', fa: 'معاملات کجا اضافه شوند؟', ar: 'أين تُضاف الصفقات؟', ru: 'Куда добавить сделки?', es: '¿Dónde añadir las operaciones?', pt: 'Onde adicionar as operações?', de: 'Wohin sollen die Trades?', fr: 'Où ajouter les trades ?' },
  importToNew: { tr: 'Yeni journal oluştur', en: 'Create a new journal', fa: 'ژورنال جدید بساز', ar: 'أنشئ سجلاً جديداً', ru: 'Создать новый журнал', es: 'Crear un diario nuevo', pt: 'Criar um novo diário', de: 'Neues Journal anlegen', fr: 'Créer un nouveau journal' },
  importToExisting: { tr: 'Mevcut journal\'a ekle', en: 'Add to an existing journal', fa: 'به ژورنال موجود اضافه کن', ar: 'أضف إلى سجل موجود', ru: 'Добавить в существующий журнал', es: 'Añadir a un diario existente', pt: 'Adicionar a um diário existente', de: 'Zu bestehendem Journal hinzufügen', fr: 'Ajouter à un journal existant' },
  incompleteTrade: { tr: 'Tamamlanmadı', en: 'Incomplete', fa: 'ناتمام', ar: 'غير مكتمل', ru: 'Не завершено', es: 'Incompleto', pt: 'Incompleto', de: 'Unvollständig', fr: 'Incomplet' },
  openShort: { tr: 'açık', en: 'open', fa: 'باز', ar: 'مفتوحة', ru: 'откр.', es: 'abiertas', pt: 'abertas', de: 'offen', fr: 'ouverts' },
  openTradesCount: { tr: 'Açık İşlem', en: 'Open Trades', fa: 'معاملات باز', ar: 'صفقات مفتوحة', ru: 'Открытые сделки', es: 'Operaciones abiertas', pt: 'Operações abertas', de: 'Offene Trades', fr: 'Trades ouverts' },
  finishLater: { tr: 'Sonuç sonra girilebilir — işlem kapanınca düzenleyip tamamlayabilirsin.', en: 'The result can be filled in later — edit the trade once it closes.', fa: 'نتیجه را می‌توانید بعداً وارد کنید.', ar: 'يمكن إدخال النتيجة لاحقاً.', ru: 'Результат можно заполнить позже.', es: 'El resultado puede completarse más tarde.', pt: 'O resultado pode ser preenchido depois.', de: 'Das Ergebnis kann später ergänzt werden.', fr: 'Le résultat peut être complété plus tard.' },
  reportTradeDetails: { tr: 'İşlem Detayları', en: 'Trade Details', fa: 'جزئیات معامله', ar: 'تفاصيل الصفقة', ru: 'Детали сделки', es: 'Detalles de la operación', pt: 'Detalhes da operação', de: 'Trade-Details', fr: 'Détails du trade' },
  reportPreNotes: { tr: 'İşlem Öncesi Açıklamalar', en: 'Pre-Trade Notes', fa: 'یادداشت‌های پیش از معامله', ar: 'ملاحظات ما قبل الصفقة', ru: 'Заметки до сделки', es: 'Notas previas', pt: 'Notas pré-operação', de: 'Notizen vor dem Trade', fr: 'Notes avant le trade' },
  reportPrePhotos: { tr: 'İşlem Öncesi Fotoğraflar', en: 'Pre-Trade Screenshots', fa: 'تصاویر پیش از معامله', ar: 'صور ما قبل الصفقة', ru: 'Скриншоты до сделки', es: 'Capturas previas', pt: 'Capturas pré-operação', de: 'Screenshots vor dem Trade', fr: 'Captures avant le trade' },
  reportPostNotes: { tr: 'İşlem Sonrası Açıklamalar', en: 'Post-Trade Notes', fa: 'یادداشت‌های پس از معامله', ar: 'ملاحظات ما بعد الصفقة', ru: 'Заметки после сделки', es: 'Notas posteriores', pt: 'Notas pós-operação', de: 'Notizen nach dem Trade', fr: 'Notes après le trade' },
  reportPostPhotos: { tr: 'İşlem Sonrası Fotoğraflar', en: 'Post-Trade Screenshots', fa: 'تصاویر پس از معامله', ar: 'صور ما بعد الصفقة', ru: 'Скриншоты после сделки', es: 'Capturas posteriores', pt: 'Capturas pós-operação', de: 'Screenshots nach dem Trade', fr: 'Captures après le trade' },
  exitDateTime: { tr: 'Çıkış Tarihi ve Saati', en: 'Exit Date & Time', fa: 'تاریخ و زمان خروج', ar: 'تاريخ ووقت الخروج', ru: 'Дата и время выхода', es: 'Fecha y hora de salida', pt: 'Data e hora de saída', de: 'Ausstiegsdatum und -zeit', fr: 'Date et heure de sortie' },
  reportExit: { tr: 'İşlemden Çıkış', en: 'Exit', fa: 'خروج', ar: 'الخروج', ru: 'Выход', es: 'Salida', pt: 'Saída', de: 'Ausstieg', fr: 'Sortie' },
  tradeDuration: { tr: 'İşlem Süresi', en: 'Duration', fa: 'مدت معامله', ar: 'مدة الصفقة', ru: 'Длительность', es: 'Duración', pt: 'Duração', de: 'Dauer', fr: 'Durée' },
  avgDuration: { tr: 'Ort. İşlem Süresi', en: 'Avg. Duration', fa: 'میانگین مدت', ar: 'متوسط المدة', ru: 'Средняя длительность', es: 'Duración media', pt: 'Duração média', de: 'Ø Dauer', fr: 'Durée moyenne' },
  reportEntry: { tr: 'İşleme Giriş', en: 'Entry', fa: 'ورود', ar: 'الدخول', ru: 'Вход', es: 'Entrada', pt: 'Entrada', de: 'Einstieg', fr: 'Entrée' },
  printPdf: { tr: 'PDF', en: 'PDF', fa: 'PDF', ar: 'PDF', ru: 'PDF', es: 'PDF', pt: 'PDF', de: 'PDF', fr: 'PDF' },
  printTrade: { tr: 'Bu işlemi PDF yap', en: 'Export this trade as PDF', fa: 'خروجی PDF این معامله', ar: 'تصدير هذه الصفقة PDF', ru: 'Экспорт сделки в PDF', es: 'Exportar esta operación a PDF', pt: 'Exportar esta operação em PDF', de: 'Diesen Trade als PDF', fr: 'Exporter ce trade en PDF' },
  printJournal: { tr: 'Journal\'ı PDF yap', en: 'Export journal as PDF', fa: 'خروجی PDF ژورنال', ar: 'تصدير السجل PDF', ru: 'Экспорт журнала в PDF', es: 'Exportar diario a PDF', pt: 'Exportar diário em PDF', de: 'Journal als PDF', fr: 'Exporter le journal en PDF' },
  editJournal: { tr: 'Journal\'ı Düzenle', en: 'Edit Journal', fa: 'ویرایش ژورنال', ar: 'تعديل السجل', ru: 'Редактировать журнал', es: 'Editar diario', pt: 'Editar diário', de: 'Journal bearbeiten', fr: 'Modifier le journal' },
  editJournalDesc: { tr: 'Journal bilgilerini güncelleyin', en: 'Update journal details', fa: 'جزئیات ژورنال را به‌روزرسانی کنید', ar: 'حدّث تفاصيل السجل', ru: 'Обновите данные журнала', es: 'Actualice los detalles del diario', pt: 'Atualize os detalhes do diário', de: 'Journal-Details aktualisieren', fr: 'Mettre à jour les détails du journal' },
  newJournalDesc: { tr: 'Journal bilgilerini girin', en: 'Enter journal details', fa: 'جزئیات ژورنال را وارد کنید', ar: 'أدخل تفاصيل السجل', ru: 'Введите данные журнала', es: 'Ingrese los detalles del diario', pt: 'Insira os detalhes do diário', de: 'Journal-Details eingeben', fr: 'Entrez les détails du journal' },
  journalName: { tr: 'Journal Adı', en: 'Journal Name', fa: 'نام ژورنال', ar: 'اسم السجل', ru: 'Название журнала', es: 'Nombre del diario', pt: 'Nome do diário', de: 'Journal-Name', fr: 'Nom du journal' },
  journalNamePlaceholder: { tr: 'Örn: Prop Hesabım', en: 'e.g. My Prop Account', fa: 'مثال: حساب پراپ من', ar: 'مثال: حساب Prop الخاص بي', ru: 'Напр: Мой Prop счёт', es: 'Ej: Mi cuenta Prop', pt: 'Ex: Minha conta Prop', de: 'Z.B.: Mein Prop-Konto', fr: 'Ex: Mon compte Prop' },
  startDate: { tr: 'Başlangıç Tarihi', en: 'Start Date', fa: 'تاریخ شروع', ar: 'تاريخ البدء', ru: 'Дата начала', es: 'Fecha de inicio', pt: 'Data de início', de: 'Startdatum', fr: 'Date de début' },
  startingCapital: { tr: 'Başlangıç Sermayesi', en: 'Starting Capital', fa: 'سرمایه اولیه', ar: 'رأس المال الابتدائي', ru: 'Начальный капитал', es: 'Capital inicial', pt: 'Capital inicial', de: 'Startkapital', fr: 'Capital initial' },
  myJournals: { tr: 'Journallerim', en: 'My Journals', fa: 'ژورنال‌های من', ar: 'سجلاتي', ru: 'Мои журналы', es: 'Mis diarios', pt: 'Meus diários', de: 'Meine Journals', fr: 'Mes journaux' },
  noJournals: { tr: 'Henüz journal yok. Yeni bir tane oluştur!', en: 'No journals yet. Create a new one!', fa: 'هنوز ژورنالی وجود ندارد. یکی بسازید!', ar: 'لا توجد سجلات بعد. أنشئ واحداً جديداً!', ru: 'Журналов пока нет. Создайте новый!', es: '¡No hay diarios aún. Crea uno nuevo!', pt: 'Ainda não há diários. Crie um novo!', de: 'Noch keine Journals. Erstelle ein neues!', fr: "Pas encore de journaux. Créez-en un nouveau!" },
  backToDashboard: { tr: 'Dashboard', en: 'Dashboard', fa: 'داشبورد', ar: 'لوحة التحكم', ru: 'Панель', es: 'Panel', pt: 'Painel', de: 'Dashboard', fr: 'Tableau de bord' },
  newTradeTab: { tr: 'Yeni İşlem', en: 'New Trade', fa: 'معامله جدید', ar: 'صفقة جديدة', ru: 'Новая сделка', es: 'Nueva operación', pt: 'Nova operação', de: 'Neuer Trade', fr: 'Nouveau trade' },
  historyTab: { tr: 'İşlemler', en: 'Trades', fa: 'معاملات', ar: 'الصفقات', ru: 'Сделки', es: 'Operaciones', pt: 'Operações', de: 'Trades', fr: 'Trades' },
  calendarTab: { tr: 'Takvim', en: 'Calendar', fa: 'تقویم', ar: 'التقويم', ru: 'Календарь', es: 'Calendario', pt: 'Calendário', de: 'Kalender', fr: 'Calendrier' },
  statsTab: { tr: 'İstatistikler', en: 'Statistics', fa: 'آمار', ar: 'الإحصائيات', ru: 'Статистика', es: 'Estadísticas', pt: 'Estatísticas', de: 'Statistiken', fr: 'Statistiques' },
  newsSection: { tr: 'Haber Saatleri', en: 'Around the News', fa: 'ساعات خبر', ar: 'أوقات الأخبار', ru: 'Вокруг новостей', es: 'En torno a las noticias', pt: 'Em torno das notícias', de: 'Rund um die News', fr: 'Autour des news' },
  newsNear: { tr: 'Haber saatinde açılan', en: 'Opened around news', fa: 'باز شده در زمان خبر', ar: 'فُتحت وقت الأخبار', ru: 'Открыты у новостей', es: 'Abiertas junto a noticias', pt: 'Abertas junto a notícias', de: 'Nahe an News eröffnet', fr: 'Ouverts près des news' },
  newsAway: { tr: 'Sakin saatlerde açılan', en: 'Opened away from news', fa: 'باز شده در زمان آرام', ar: 'فُتحت بعيداً عن الأخبار', ru: 'Открыты в спокойное время', es: 'Abiertas lejos de noticias', pt: 'Abertas longe de notícias', de: 'Abseits von News eröffnet', fr: 'Ouverts loin des news' },
  newsNote: { tr: 'Girişinden 30 dakika önce ya da sonra yüksek etkili bir haber varsa işlem "haber saatinde" sayılır.', en: 'A trade counts as "around news" when a high-impact event falls within 30 minutes of its entry.', fa: 'معامله زمانی «در زمان خبر» است که خبری با تأثیر بالا در ۳۰ دقیقه اطراف ورود باشد.', ar: 'تُحتسب الصفقة "وقت الأخبار" إذا وقع حدث عالي التأثير خلال 30 دقيقة من الدخول.', ru: 'Сделка считается «у новостей», если важное событие попадает в 30 минут от входа.', es: 'Una operación cuenta como "junto a noticias" si un evento de alto impacto cae dentro de 30 minutos de la entrada.', pt: 'Uma operação conta como "junto a notícias" se um evento de alto impacto ocorrer dentro de 30 minutos da entrada.', de: 'Ein Trade zählt als "nahe an News", wenn ein wichtiges Ereignis innerhalb von 30 Minuten um den Einstieg liegt.', fr: 'Un trade compte comme « près des news » si un événement à fort impact tombe dans les 30 minutes de l\'entrée.' },
  newsAtEntry: { tr: 'Girişte haber', en: 'News at entry', fa: 'خبر هنگام ورود', ar: 'خبر عند الدخول', ru: 'Новость при входе', es: 'Noticia en la entrada', pt: 'Notícia na entrada', de: 'News beim Einstieg', fr: 'News à l\'entrée' },
  disciplineTab: { tr: 'Disiplin', en: 'Discipline', fa: 'انضباط', ar: 'الانضباط', ru: 'Дисциплина', es: 'Disciplina', pt: 'Disciplina', de: 'Disziplin', fr: 'Discipline' },
  disciplineIntro1: { tr: 'Kaybettiren şey çoğu zaman kötü bir setup değil, kaybettikten sonra yapılanlardır. Hemen geri girmek, riski büyütmek, o gün durmamak, her zamanki saatlerinin dışına taşmak — hiçbiri tek başına hata gibi görünmez, ama faturası birikir.', en: 'What costs you is usually not a bad setup but what you do after a loss. Going straight back in, raising the stake, not stopping for the day, drifting outside the hours you normally keep — none of them looks like a mistake on its own, but the bill adds up.', fa: 'آنچه ضرر می‌زند معمولاً ستاپ بد نیست، بلکه کاری است که پس از ضرر می‌کنید.', ar: 'ما يكلفك عادةً ليس إعداداً سيئاً بل ما تفعله بعد الخسارة.', ru: 'Убыток обычно приносит не плохой сетап, а то, что вы делаете после потери.', es: 'Lo que te cuesta no suele ser un mal setup, sino lo que haces tras una pérdida.', pt: 'O que custa não costuma ser um mau setup, mas o que fazes depois de uma perda.', de: 'Was kostet, ist meist kein schlechtes Setup, sondern was nach einem Verlust folgt.', fr: 'Ce qui coûte n\'est pas un mauvais setup mais ce que vous faites après une perte.' },
  disciplineIntro2: { tr: 'Aşağıdaki dört alışkanlık, işlemlerinin tarih, risk ve sonuç bilgilerinden çıkarılıyor — ayrıca bir şey doldurman gerekmiyor. Önemli olan kaç kez olduğu değil, yanındaki tutar.', en: 'The four habits below are read from the dates, risk and results already on your trades — nothing extra to fill in. What matters is not how often, but the figure beside it.', fa: 'چهار عادت زیر از تاریخ، ریسک و نتیجه معاملات شما استخراج می‌شود.', ar: 'العادات الأربع أدناه تُستخرج من تواريخ صفقاتك ومخاطرها ونتائجها.', ru: 'Четыре привычки ниже вычисляются из дат, риска и результатов ваших сделок.', es: 'Los cuatro hábitos siguientes se extraen de las fechas, el riesgo y los resultados de tus operaciones.', pt: 'Os quatro hábitos abaixo são extraídos das datas, risco e resultados das tuas operações.', de: 'Die vier Gewohnheiten unten stammen aus Datum, Risiko und Ergebnis deiner Trades.', fr: 'Les quatre habitudes ci-dessous sont tirées des dates, du risque et des résultats de vos trades.' },
  disciplineAllJournals: { tr: 'Burada bütün journal\'ların birlikte hesaplanıyor', en: 'All your journals are counted together here', fa: 'همه ژورنال‌های شما اینجا با هم حساب می‌شوند', ar: 'تُحسب جميع سجلاتك معاً هنا', ru: 'Здесь учитываются все ваши журналы вместе', es: 'Aquí se cuentan todos tus diarios juntos', pt: 'Aqui todos os teus diários são contados juntos', de: 'Hier zählen alle deine Journals zusammen', fr: 'Tous vos journaux sont comptés ensemble ici' },
  disciplineWhyAll: { tr: 'Davranış hesaba göre değişmez. Prop hesabında kaybedip on dakika sonra demo hesabında geri girdiysen, bu aynı davranıştır. Aşırı işlem de ancak bütün hesaplar birlikte sayılınca doğru çıkar: bir güne bir journal\'a üç, ötekine dört işlem girdiysen o gün yedi işlem açmışsın demektir.', en: 'Behaviour does not change with the account. Losing on the funded account and going straight back in on the demo ten minutes later is the same behaviour. Overtrading only comes out right when the accounts are counted together: three trades in one journal and four in another on the same day is seven trades that day.', fa: 'رفتار با حساب تغییر نمی‌کند.', ar: 'السلوك لا يتغير بتغير الحساب.', ru: 'Поведение не меняется от счёта к счёту.', es: 'El comportamiento no cambia con la cuenta.', pt: 'O comportamento não muda com a conta.', de: 'Verhalten ändert sich nicht mit dem Konto.', fr: 'Le comportement ne change pas selon le compte.' },
  disciplinePerJournal: { tr: 'Tek bir hesaba bakmak istersen, her journal\'ın kendi disiplin bölümü o journal\'ın İstatistikler sekmesinde duruyor.', en: 'To look at one account on its own, each journal has its own discipline section in its Statistics tab.', fa: 'برای بررسی یک حساب، بخش انضباط هر ژورنال در تب آمار آن است.', ar: 'لعرض حساب واحد، لكل سجل قسم انضباط في تبويب الإحصائيات.', ru: 'Чтобы посмотреть один счёт, у каждого журнала есть свой раздел дисциплины во вкладке статистики.', es: 'Para ver una sola cuenta, cada diario tiene su sección de disciplina en Estadísticas.', pt: 'Para ver uma conta, cada diário tem a sua secção de disciplina em Estatísticas.', de: 'Für ein einzelnes Konto hat jedes Journal seinen eigenen Disziplin-Abschnitt in den Statistiken.', fr: 'Pour un seul compte, chaque journal a sa section discipline dans ses statistiques.' },
  discipline: { tr: 'Disiplin', en: 'Discipline', fa: 'انضباط', ar: 'الانضباط', ru: 'Дисциплина', es: 'Disciplina', pt: 'Disciplina', de: 'Disziplin', fr: 'Discipline' },
  ruleRevenge: { tr: 'Hemen geri girme', en: 'Straight back in', fa: 'بازگشت فوری', ar: 'العودة الفورية', ru: 'Сразу обратно', es: 'Vuelta inmediata', pt: 'Volta imediata', de: 'Sofort zurück', fr: 'Retour immédiat' },
  ruleRevengeDesc: { tr: 'Kaybettikten sonra 15 dakika içinde açılan işlemler', en: 'Trades opened within 15 minutes of a loss', fa: 'معاملات باز شده تا ۱۵ دقیقه پس از ضرر', ar: 'صفقات فُتحت خلال 15 دقيقة من خسارة', ru: 'Сделки в течение 15 минут после убытка', es: 'Operaciones abiertas 15 minutos después de una pérdida', pt: 'Operações abertas 15 minutos após uma perda', de: 'Trades innerhalb von 15 Minuten nach einem Verlust', fr: 'Trades ouverts dans les 15 minutes suivant une perte' },
  ruleRiskUp: { tr: 'Riski büyütme', en: 'Raising the stake', fa: 'افزایش ریسک', ar: 'رفع المخاطرة', ru: 'Увеличение риска', es: 'Subir el riesgo', pt: 'Aumentar o risco', de: 'Einsatz erhöht', fr: 'Risque augmenté' },
  ruleRiskUpDesc: { tr: 'Kayıptan sonra riski bir buçuk katından fazla artırma', en: 'Risking more than half again as much after a loss', fa: 'افزایش ریسک بیش از ۱.۵ برابر پس از ضرر', ar: 'المخاطرة بأكثر من مرة ونصف بعد الخسارة', ru: 'Риск более чем в полтора раза выше после убытка', es: 'Arriesgar más de vez y media tras una pérdida', pt: 'Arriscar mais de uma vez e meia após uma perda', de: 'Nach einem Verlust mehr als das Anderthalbfache riskiert', fr: 'Risquer plus d\'une fois et demie après une perte' },
  ruleOvertrading: { tr: 'Aşırı işlem', en: 'Overtrading', fa: 'معامله بیش از حد', ar: 'الإفراط في التداول', ru: 'Перебор сделок', es: 'Exceso de operaciones', pt: 'Excesso de operações', de: 'Overtrading', fr: 'Surtrading' },
  ruleOvertradingDesc: { tr: 'Olağan gününün iki katından çok işlem açtığın günler', en: 'Days with more than twice your usual number of trades', fa: 'روزهایی با بیش از دو برابر معاملات معمول', ar: 'أيام بأكثر من ضعف عدد صفقاتك المعتاد', ru: 'Дни с более чем вдвое большим числом сделок', es: 'Días con más del doble de operaciones de lo habitual', pt: 'Dias com mais do dobro das operações habituais', de: 'Tage mit mehr als doppelt so vielen Trades wie üblich', fr: 'Jours avec plus du double de trades habituels' },
  ruleOffHours: { tr: 'Saat kayması', en: 'Off your hours', fa: 'خارج از ساعات معمول', ar: 'خارج ساعاتك', ru: 'Вне обычных часов', es: 'Fuera de tu horario', pt: 'Fora do teu horário', de: 'Außerhalb deiner Zeiten', fr: 'Hors de tes heures' },
  ruleOffHoursDesc: { tr: 'Her zamanki işlem saatlerinin dışında açılan işlemler', en: 'Trades opened outside the hours you normally trade', fa: 'معاملات خارج از ساعات معمول شما', ar: 'صفقات خارج ساعات تداولك المعتادة', ru: 'Сделки вне ваших обычных часов', es: 'Operaciones fuera de tu horario habitual', pt: 'Operações fora do teu horário habitual', de: 'Trades außerhalb deiner üblichen Zeiten', fr: 'Trades hors de tes heures habituelles' },
  disciplineClean: { tr: 'Kurala uyan işlemler', en: 'Trades that kept the rules', fa: 'معاملات مطابق قوانین', ar: 'صفقات التزمت بالقواعد', ru: 'Сделки по правилам', es: 'Operaciones que siguieron las reglas', pt: 'Operações que seguiram as regras', de: 'Trades nach den Regeln', fr: 'Trades respectant les règles' },
  disciplineFlagged: { tr: 'İşaretlenen işlemler', en: 'Trades that broke them', fa: 'معاملات علامت‌خورده', ar: 'صفقات خالفتها', ru: 'Сделки с нарушением', es: 'Operaciones marcadas', pt: 'Operações marcadas', de: 'Markierte Trades', fr: 'Trades signalés' },
  disciplineNone: { tr: 'İşaretlenecek bir şey yok. Kurallarına uymuşsun.', en: 'Nothing to flag. You kept to your rules.', fa: 'چیزی برای علامت‌گذاری نیست.', ar: 'لا شيء للإشارة إليه.', ru: 'Отмечать нечего.', es: 'Nada que marcar.', pt: 'Nada a assinalar.', de: 'Nichts zu markieren.', fr: 'Rien à signaler.' },
  sessionsTab: { tr: 'Seanslar', en: 'Sessions', fa: 'سشن‌ها', ar: 'الجلسات', ru: 'Сессии', es: 'Sesiones', pt: 'Sessões', de: 'Sessions', fr: 'Sessions' },
  newsTab: { tr: 'Günün Haberleri', en: 'Today\'s News', fa: 'اخبار روز', ar: 'أخبار اليوم', ru: 'Новости дня', es: 'Noticias del día', pt: 'Notícias do dia', de: 'News des Tages', fr: 'Actualités du jour' },
  mtConnectTab: { tr: 'MetaTrader', en: 'MetaTrader', fa: 'متاتریدر', ar: 'ميتاتريدر', ru: 'MetaTrader', es: 'MetaTrader', pt: 'MetaTrader', de: 'MetaTrader', fr: 'MetaTrader' },
  goalsTab: { tr: 'Hedefler', en: 'Goals', fa: 'اهداف', ar: 'الأهداف', ru: 'Цели', es: 'Objetivos', pt: 'Metas', de: 'Ziele', fr: 'Objectifs' },
  formTitle: { tr: 'Yeni İşlem Kaydı', en: 'New Trade Record', fa: 'ثبت معامله جدید', ar: 'تسجيل صفقة جديدة', ru: 'Новая запись сделки', es: 'Nuevo registro de operación', pt: 'Novo registro de operação', de: 'Neuer Trade-Eintrag', fr: 'Nouveau enregistrement de trade' },
  formSubtitle: { tr: 'İşlem detaylarını, fotoğraflarını ve notlarını aşağıya girin.', en: 'Enter trade details, photos, and notes below.', fa: 'جزئیات معامله، عکس‌ها و یادداشت‌های خود را در زیر وارد کنید.', ar: 'أدخل تفاصيل الصفقة والصور والملاحظات أدناه.', ru: 'Введите детали сделки, фото и заметки ниже.', es: 'Ingrese los detalles de la operación, fotos y notas a continuación.', pt: 'Insira os detalhes da operação, fotos e notas abaixo.', de: 'Geben Sie Trade-Details, Fotos und Notizen unten ein.', fr: 'Entrez les détails du trade, les photos et les notes ci-dessous.' },
  dateTime: { tr: 'İşlem Tarihi ve Saati', en: 'Trade Date & Time', fa: 'تاریخ و زمان معامله', ar: 'تاريخ ووقت الصفقة', ru: 'Дата и время сделки', es: 'Fecha y hora de la operación', pt: 'Data e hora da operação', de: 'Datum und Uhrzeit des Trades', fr: 'Date et heure du trade' },
  symbol: { tr: 'Parite / Sembol', en: 'Pair / Symbol', fa: 'جفت ارز / نماد', ar: 'الزوج / الرمز', ru: 'Пара / Символ', es: 'Par / Símbolo', pt: 'Par / Símbolo', de: 'Paar / Symbol', fr: 'Paire / Symbole' },
  type: { tr: 'İşlem Türü', en: 'Trade Type', fa: 'نوع معامله', ar: 'نوع الصفقة', ru: 'Тип сделки', es: 'Tipo de operación', pt: 'Tipo de operação', de: 'Trade-Typ', fr: 'Type de trade' },
  buy: { tr: 'Buy', en: 'Buy', fa: 'Buy', ar: 'شراء', ru: 'Купить', es: 'Compra', pt: 'Compra', de: 'Kaufen', fr: 'Achat' },
  sell: { tr: 'Sell', en: 'Sell', fa: 'Sell', ar: 'بيع', ru: 'Продать', es: 'Venta', pt: 'Venda', de: 'Verkaufen', fr: 'Vente' },
  timeframe: { tr: 'Timeframe', en: 'Timeframe', fa: 'تایم‌فریم', ar: 'الإطار الزمني', ru: 'Таймфрейм', es: 'Marco temporal', pt: 'Tempo gráfico', de: 'Zeitrahmen', fr: 'Unité de temps' },
  setup: { tr: 'Strateji', en: 'Strategy', fa: 'استراتژی', ar: 'الاستراتيجية', ru: 'Стратегия', es: 'Estrategia', pt: 'Estratégia', de: 'Strategie', fr: 'Stratégie' },
  requiredNote: { tr: 'Zorunlu alan', en: 'Required field', fa: 'فیلد الزامی', ar: 'حقل مطلوب', ru: 'Обязательное поле', es: 'Campo obligatorio', pt: 'Campo obrigatório', de: 'Pflichtfeld', fr: 'Champ obligatoire' },
  optionalLabel: { tr: 'isteğe bağlı', en: 'optional', fa: 'اختیاری', ar: 'اختياري', ru: 'необязательно', es: 'opcional', pt: 'opcional', de: 'optional', fr: 'facultatif' },
  orderType: { tr: 'Emir Türü', en: 'Order Type', fa: 'نوع سفارش', ar: 'نوع الأمر', ru: 'Тип ордера', es: 'Tipo de orden', pt: 'Tipo de ordem', de: 'Orderart', fr: 'Type d\'ordre' },
  orderMarket: { tr: 'Piyasa', en: 'Market', fa: 'بازار', ar: 'سوق', ru: 'Рыночный', es: 'Mercado', pt: 'Mercado', de: 'Market', fr: 'Marché' },
  orderLimit: { tr: 'Limit', en: 'Limit', fa: 'لیمیت', ar: 'حد', ru: 'Лимитный', es: 'Límite', pt: 'Limite', de: 'Limit', fr: 'Limite' },
  orderStop: { tr: 'Stop', en: 'Stop', fa: 'استاپ', ar: 'إيقاف', ru: 'Стоп', es: 'Stop', pt: 'Stop', de: 'Stop', fr: 'Stop' },
  rr: { tr: 'Risk/Reward (R/R)', en: 'Risk/Reward (R/R)', fa: 'ریسک/ریوارد (R/R)', ar: 'المخاطرة/المكافأة (R/R)', ru: 'Риск/Прибыль (R/R)', es: 'Riesgo/Recompensa (R/R)', pt: 'Risco/Retorno (R/R)', de: 'Risiko/Ertrag (R/R)', fr: 'Risque/Récompense (R/R)' },
  rrPlaceholder: { tr: 'Örn: 2.5', en: 'e.g., 2.5', fa: 'مثال: 2.5', ar: 'مثال: 2.5', ru: 'Напр.: 2.5', es: 'Ej: 2.5', pt: 'Ex: 2.5', de: 'Z.B.: 2.5', fr: 'Ex: 2.5' },
  risk: { tr: 'Risk ($)', en: 'Risk ($)', fa: 'ریسک ($)', ar: 'المخاطرة ($)', ru: 'Риск ($)', es: 'Riesgo ($)', pt: 'Risco ($)', de: 'Risiko ($)', fr: 'Risque ($)' },
  reward: { tr: 'Kazanç ($)', en: 'Reward ($)', fa: 'سود ($)', ar: 'المكافأة ($)', ru: 'Прибыль ($)', es: 'Ganancia ($)', pt: 'Ganho ($)', de: 'Gewinn ($)', fr: 'Gain ($)' },
  lossAmountLabel: { tr: 'Kayıp ($)', en: 'Loss ($)', fa: 'ضرر ($)', ar: 'الخسارة ($)', ru: 'Убыток ($)', es: 'Pérdida ($)', pt: 'Perda ($)', de: 'Verlust ($)', fr: 'Perte ($)' },
  rewardOrLossLabel: { tr: 'Kazanç / Kayıp ($)', en: 'Reward / Loss ($)', fa: 'سود / ضرر ($)', ar: 'الربح / الخسارة ($)', ru: 'Прибыль / Убыток ($)', es: 'Ganancia / Pérdida ($)', pt: 'Ganho / Perda ($)', de: 'Gewinn / Verlust ($)', fr: 'Gain / Perte ($)' },
  selectPlaceholder: { tr: '— Seçin —', en: '— Select —', fa: '— انتخاب کنید —', ar: '— اختر —', ru: '— Выберите —', es: '— Seleccionar —', pt: '— Selecionar —', de: '— Auswählen —', fr: '— Sélectionner —' },
  result: { tr: 'Sonuç', en: 'Result', fa: 'نتیجه', ar: 'النتيجة', ru: 'Результат', es: 'Resultado', pt: 'Resultado', de: 'Ergebnis', fr: 'Résultat' },
  resultOpen: { tr: 'Açık / Beklemede', en: 'Open / Pending', fa: 'باز / در انتظار', ar: 'مفتوح / معلق', ru: 'Открытая / Ожидает', es: 'Abierta / Pendiente', pt: 'Aberta / Pendente', de: 'Offen / Ausstehend', fr: 'Ouverte / En attente' },
  resultWin: { tr: 'Başarılı', en: 'Win', fa: 'موفق', ar: 'فوز', ru: 'Прибыль', es: 'Ganada', pt: 'Ganha', de: 'Gewinn', fr: 'Gagné' },
  resultLoss: { tr: 'Başarısız', en: 'Loss', fa: 'ناموفق', ar: 'خسارة', ru: 'Убыток', es: 'Perdida', pt: 'Perdida', de: 'Verlust', fr: 'Perdu' },
  resultManualWin: { tr: 'Karda manuel kapattım', en: 'Closed Manually (Profit)', fa: 'بسته شده دستی (سود)', ar: 'أغلقت يدوياً (ربح)', ru: 'Закрыта вручную (прибыль)', es: 'Cerrada manualmente (beneficio)', pt: 'Fechada manualmente (lucro)', de: 'Manuell geschlossen (Gewinn)', fr: 'Fermée manuellement (profit)' },
  resultManualLoss: { tr: 'Zararda manuel kapattım', en: 'Closed Manually (Loss)', fa: 'بسته شده دستی (ضرر)', ar: 'أغلقت يدوياً (خسارة)', ru: 'Закрыта вручную (убыток)', es: 'Cerrada manualmente (pérdida)', pt: 'Fechada manualmente (perda)', de: 'Manuell geschlossen (Verlust)', fr: 'Fermée manuellement (perte)' },
  resultBreakeven: { tr: 'Başa baş kapattım', en: 'Breakeven', fa: 'سر به سر', ar: 'تعادل', ru: 'Безубыток', es: 'Sin pérdida ni ganancia', pt: 'Empate', de: 'Break-even', fr: 'Seuil de rentabilité' },
  preTrade: { tr: 'İşlem Öncesi', en: 'Pre-Trade', fa: 'قبل از معامله', ar: 'قبل الصفقة', ru: 'До сделки', es: 'Pre-operación', pt: 'Pré-operação', de: 'Vor dem Trade', fr: 'Avant le trade' },
  postTrade: { tr: 'İşlem Sonrası', en: 'Post-Trade', fa: 'بعد از معامله', ar: 'بعد الصفقة', ru: 'После сделки', es: 'Post-operación', pt: 'Pós-operação', de: 'Nach dem Trade', fr: 'Après le trade' },
  photos: { tr: 'Fotoğraflar', en: 'Photos', fa: 'عکس‌ها', ar: 'الصور', ru: 'Фото', es: 'Fotos', pt: 'Fotos', de: 'Fotos', fr: 'Photos' },
  photoUpload: { tr: 'Fotoğraf Yükle', en: 'Upload Photo', fa: 'آپلود عکس', ar: 'رفع صورة', ru: 'Загрузить фото', es: 'Subir foto', pt: 'Enviar foto', de: 'Foto hochladen', fr: 'Télécharger une photo' },
  notes: { tr: 'Not', en: 'Notes', fa: 'یادداشت', ar: 'الملاحظات', ru: 'Заметки', es: 'Notas', pt: 'Notas', de: 'Notizen', fr: 'Notes' },
  preNotesPlaceholder: { tr: 'İşleme girme nedeniniz, beklentileriniz...', en: 'Reason for entry, expectations...', fa: 'دلیل ورود به معامله، انتظارات...', ar: 'سبب الدخول، التوقعات...', ru: 'Причина входа, ожидания...', es: 'Razón de entrada, expectativas...', pt: 'Motivo de entrada, expectativas...', de: 'Grund für Einstieg, Erwartungen...', fr: "Raison d'entrée, attentes..." },
  postNotesPlaceholder: { tr: 'İşlem sonucu, yapılan hatalar, çıkarılan dersler...', en: 'Trade result, mistakes made, lessons learned...', fa: 'نتیجه معامله، اشتباهات، درس‌های گرفته شده...', ar: 'نتيجة الصفقة، الأخطاء المرتكبة، الدروس المستفادة...', ru: 'Результат сделки, ошибки, выводы...', es: 'Resultado, errores cometidos, lecciones aprendidas...', pt: 'Resultado, erros cometidos, lições aprendidas...', de: 'Ergebnis, Fehler, Lektionen...', fr: 'Résultat, erreurs, leçons apprises...' },
  saveButton: { tr: 'İşlemi Kaydet', en: 'Save Trade', fa: 'ثبت معامله', ar: 'حفظ الصفقة', ru: 'Сохранить сделку', es: 'Guardar operación', pt: 'Salvar operação', de: 'Trade speichern', fr: 'Enregistrer le trade' },
  pleaseSelectDate: { tr: 'Lütfen tarih seçin', en: 'Please select a date', fa: 'لطفاً تاریخ را انتخاب کنید', ar: 'الرجاء اختيار تاريخ', ru: 'Пожалуйста, выберите дату', es: 'Por favor seleccione una fecha', pt: 'Por favor selecione uma data', de: 'Bitte Datum auswählen', fr: 'Veuillez sélectionner une date' },
  emptyTitle: { tr: 'Henüz işlem yok', en: 'No trades yet', fa: 'هنوز معامله‌ای ثبت نشده', ar: 'لا توجد صفقات بعد', ru: 'Сделок пока нет', es: 'Aún no hay operaciones', pt: 'Ainda não há operações', de: 'Noch keine Trades', fr: 'Pas encore de trades' },
  emptyDesc: { tr: 'Yeni İşlem butonunu kullanarak ilk işleminizi kaydedin.', en: 'Use the New Trade button to record your first trade.', fa: 'برای ثبت اولین معامله از دکمه معامله جدید استفاده کنید.', ar: 'استخدم زر صفقة جديدة لتسجيل أول صفقة لك.', ru: 'Используйте кнопку "Новая сделка" для записи первой сделки.', es: 'Usa el botón Nueva operación para registrar tu primera operación.', pt: 'Use o botão Nova operação para registrar sua primeira operação.', de: 'Verwenden Sie die Schaltfläche "Neuer Trade", um Ihren ersten Trade zu erfassen.', fr: 'Utilisez le bouton Nouveau trade pour enregistrer votre premier trade.' },
  backToList: { tr: 'Listeye Dön', en: 'Back to List', fa: 'بازگشت به لیست', ar: 'العودة إلى القائمة', ru: 'Вернуться к списку', es: 'Volver a la lista', pt: 'Voltar à lista', de: 'Zurück zur Liste', fr: 'Retour à la liste' },
  riskRewardLabel: { tr: 'Risk / Kazanç', en: 'Risk / Reward', fa: 'ریسک / سود', ar: 'المخاطرة / المكافأة', ru: 'Риск / Прибыль', es: 'Riesgo / Ganancia', pt: 'Risco / Retorno', de: 'Risiko / Gewinn', fr: 'Risque / Gain' },
  deleteTrade: { tr: 'İşlemi Sil', en: 'Delete Trade', fa: 'حذف معامله', ar: 'حذف الصفقة', ru: 'Удалить сделку', es: 'Eliminar operación', pt: 'Excluir operação', de: 'Trade löschen', fr: 'Supprimer le trade' },
  noNotes: { tr: 'Not eklenmemiş.', en: 'No notes added.', fa: 'یادداشتی اضافه نشده است.', ar: 'لم تتم إضافة ملاحظات.', ru: 'Заметок нет.', es: 'No se han añadido notas.', pt: 'Nenhuma nota adicionada.', de: 'Keine Notizen hinzugefügt.', fr: 'Aucune note ajoutée.' },
  openStatus: { tr: 'Açık', en: 'Open', fa: 'باز', ar: 'مفتوح', ru: 'Открытая', es: 'Abierta', pt: 'Aberta', de: 'Offen', fr: 'Ouverte' },
  winStatus: { tr: 'Başarılı', en: 'Win', fa: 'موفق', ar: 'فوز', ru: 'Прибыль', es: 'Ganada', pt: 'Ganha', de: 'Gewinn', fr: 'Gagné' },
  lossStatus: { tr: 'Başarısız', en: 'Loss', fa: 'ناموفق', ar: 'خسارة', ru: 'Убыток', es: 'Perdida', pt: 'Perdida', de: 'Verlust', fr: 'Perdu' },
  statsTitle: { tr: 'İstatistikler', en: 'Statistics', fa: 'آمار', ar: 'الإحصائيات', ru: 'Статистика', es: 'Estadísticas', pt: 'Estatísticas', de: 'Statistiken', fr: 'Statistiques' },
  tradeCount: { tr: 'İşlem', en: 'Trades', fa: 'معامله', ar: 'الصفقات', ru: 'Сделки', es: 'Operaciones', pt: 'Operações', de: 'Trades', fr: 'Trades' },
  totalTrades: { tr: 'Toplam İşlem', en: 'Total Trades', fa: 'معاملات بسته شده', ar: 'إجمالي الصفقات', ru: 'Всего сделок', es: 'Total operaciones', pt: 'Total de operações', de: 'Trades gesamt', fr: 'Total des trades' },
  winRate: { tr: 'Kazanma Oranı', en: 'Win Rate', fa: 'نرخ برد', ar: 'نسبة الفوز', ru: 'Процент прибыльных', es: 'Tasa de éxito', pt: 'Taxa de acerto', de: 'Gewinnrate', fr: 'Taux de réussite' },
  netProfit: { tr: 'Net Kar/Zarar', en: 'Net PnL', fa: 'سود/زیان خالص', ar: 'صافي الربح/الخسارة', ru: 'Чистая прибыль/убыток', es: 'PnL neto', pt: 'PnL líquido', de: 'Netto-PnL', fr: 'PnL net' },
  profitFactor: { tr: 'Kar Faktörü', en: 'Profit Factor', fa: 'فاکتور سود', ar: 'معامل الربح', ru: 'Профит-фактор', es: 'Factor de beneficio', pt: 'Fator de lucro', de: 'Profit-Faktor', fr: 'Facteur de profit' },
  bestTrade: { tr: 'En İyi İşlem', en: 'Best Trade', fa: 'بهترین معامله', ar: 'أفضل صفقة', ru: 'Лучшая сделка', es: 'Mejor operación', pt: 'Melhor operação', de: 'Bester Trade', fr: 'Meilleur trade' },
  worstTrade: { tr: 'En Kötü İşlem', en: 'Worst Trade', fa: 'بدترین معامله', ar: 'أسوأ صفقة', ru: 'Худшая сделка', es: 'Peor operación', pt: 'Pior operação', de: 'Schlechtester Trade', fr: 'Pire trade' },
  avgRR: { tr: 'Ortalama R/R', en: 'Avg R/R', fa: 'میانگین R/R', ar: 'متوسط R/R', ru: 'Ср. R/R', es: 'R/R promedio', pt: 'R/R médio', de: 'Durchschn. R/R', fr: 'R/R moyen' },
  expectancy: { tr: 'İşlem Başı Beklenti', en: 'Expectancy', fa: 'انتظار هر معامله', ar: 'التوقع لكل صفقة', ru: 'Ожидание на сделку', es: 'Expectativa por operación', pt: 'Expectativa por operação', de: 'Erwartungswert pro Trade', fr: 'Espérance par trade' },
  avgWin: { tr: 'Ortalama Kazanç', en: 'Average Win', fa: 'میانگین سود', ar: 'متوسط الربح', ru: 'Средняя прибыль', es: 'Ganancia media', pt: 'Ganho médio', de: 'Ø Gewinn', fr: 'Gain moyen' },
  avgLoss: { tr: 'Ortalama Kayıp', en: 'Average Loss', fa: 'میانگین ضرر', ar: 'متوسط الخسارة', ru: 'Средний убыток', es: 'Pérdida media', pt: 'Perda média', de: 'Ø Verlust', fr: 'Perte moyenne' },
  payoffRatio: { tr: 'Kazanç / Kayıp Oranı', en: 'Payoff Ratio', fa: 'نسبت سود به ضرر', ar: 'نسبة العائد', ru: 'Отношение выигрыш/проигрыш', es: 'Ratio ganancia/pérdida', pt: 'Rácio ganho/perda', de: 'Gewinn-Verlust-Verhältnis', fr: 'Ratio gain/perte' },
  maxRealizedR: { tr: 'En Yüksek R', en: 'Best R', fa: 'بالاترین R', ar: 'أعلى R', ru: 'Лучший R', es: 'Mejor R', pt: 'Melhor R', de: 'Bestes R', fr: 'Meilleur R' },
  winnersCount: { tr: 'Kazanan', en: 'Winners', fa: 'برنده', ar: 'رابحة', ru: 'Прибыльные', es: 'Ganadoras', pt: 'Vencedoras', de: 'Gewinner', fr: 'Gagnants' },
  losersCount: { tr: 'Kaybeden', en: 'Losers', fa: 'بازنده', ar: 'خاسرة', ru: 'Убыточные', es: 'Perdedoras', pt: 'Perdedoras', de: 'Verlierer', fr: 'Perdants' },
  breakevenCount: { tr: 'Başa Baş', en: 'Breakeven', fa: 'سربه‌سر', ar: 'تعادل', ru: 'Безубыточные', es: 'Sin cambio', pt: 'Sem alteração', de: 'Breakeven', fr: 'Seuil' },
  accountBalance: { tr: 'Hesap Bakiyesi', en: 'Account Balance', fa: 'موجودی حساب', ar: 'رصيد الحساب', ru: 'Баланс счёта', es: 'Saldo de la cuenta', pt: 'Saldo da conta', de: 'Kontostand', fr: 'Solde du compte' },
  totalReturn: { tr: 'Toplam Getiri', en: 'Total Return', fa: 'بازده کل', ar: 'العائد الإجمالي', ru: 'Общая доходность', es: 'Rentabilidad total', pt: 'Retorno total', de: 'Gesamtrendite', fr: 'Rendement total' },
  monthlyPerformance: { tr: 'Aylık Performans', en: 'Monthly Performance', fa: 'عملکرد ماهانه', ar: 'الأداء الشهري', ru: 'Помесячно', es: 'Rendimiento mensual', pt: 'Desempenho mensal', de: 'Monatliche Performance', fr: 'Performance mensuelle' },
  directionStats: { tr: 'Yöne Göre', en: 'By Direction', fa: 'بر اساس جهت', ar: 'حسب الاتجاه', ru: 'По направлению', es: 'Por dirección', pt: 'Por direção', de: 'Nach Richtung', fr: 'Par direction' },
  overview: { tr: 'Genel Görünüm', en: 'Overview', fa: 'نمای کلی', ar: 'نظرة عامة', ru: 'Обзор', es: 'Resumen', pt: 'Visão geral', de: 'Überblick', fr: 'Vue d\'ensemble' },
  riskMetrics: { tr: 'Risk ve Getiri', en: 'Risk & Reward', fa: 'ریسک و بازده', ar: 'المخاطرة والعائد', ru: 'Риск и доходность', es: 'Riesgo y beneficio', pt: 'Risco e retorno', de: 'Risiko & Ertrag', fr: 'Risque et gain' },
  breakdowns: { tr: 'Dağılımlar', en: 'Breakdowns', fa: 'تفکیک‌ها', ar: 'التوزيعات', ru: 'Разбивка', es: 'Desgloses', pt: 'Repartições', de: 'Aufschlüsselung', fr: 'Répartitions' },
  avgRealizedR: { tr: 'Ortalama Gerçekleşen R', en: 'Avg Realised R', fa: 'میانگین R محقق‌شده', ar: 'متوسط R المحقق', ru: 'Ср. фактический R', es: 'R realizado promedio', pt: 'R realizado médio', de: 'Durchschn. realisiertes R', fr: 'R réalisé moyen' },
  realizedR: { tr: 'Gerçekleşen R', en: 'Realised R', fa: 'R محقق‌شده', ar: 'R المحقق', ru: 'Фактический R', es: 'R realizado', pt: 'R realizado', de: 'Realisiertes R', fr: 'R réalisé' },
  plannedRR: { tr: 'Planlanan R/R', en: 'Planned R/R', fa: 'R/R برنامه‌ریزی‌شده', ar: 'R/R المخطط', ru: 'Плановый R/R', es: 'R/R planificado', pt: 'R/R planeado', de: 'Geplantes R/R', fr: 'R/R prévu' },
  bestDay: { tr: 'En İyi Gün', en: 'Best Day', fa: 'بهترین روز', ar: 'أفضل يوم', ru: 'Лучший день', es: 'Mejor día', pt: 'Melhor dia', de: 'Bester Tag', fr: 'Meilleur jour' },
  streaks: { tr: 'Seriler', en: 'Streaks', fa: 'سری‌ها', ar: 'السلاسل', ru: 'Серии', es: 'Rachas', pt: 'Sequências', de: 'Serien', fr: 'Séries' },
  currentStreak: { tr: 'Mevcut Seri', en: 'Current Streak', fa: 'سری فعلی', ar: 'السلسلة الحالية', ru: 'Текущая серия', es: 'Racha actual', pt: 'Sequência atual', de: 'Aktuelle Serie', fr: 'Série actuelle' },
  bestWinStreak: { tr: 'En İyi Kazanç Serisi', en: 'Best Win Streak', fa: 'بهترین سری برد', ar: 'أفضل سلسلة فوز', ru: 'Лучшая серия побед', es: 'Mejor racha ganadora', pt: 'Melhor sequência de ganhos', de: 'Beste Gewinnserie', fr: 'Meilleure série gagnante' },
  bestLossStreak: { tr: 'En Kötü Kayıp Serisi', en: 'Best Loss Streak', fa: 'بدترین سری باخت', ar: 'أسوأ سلسلة خسارة', ru: 'Худшая серия потерь', es: 'Peor racha perdedora', pt: 'Pior sequência de perdas', de: 'Schlechteste Verlustserie', fr: 'Pire série perdante' },
  maxDrawdown: { tr: 'Max Drawdown', en: 'Max Drawdown', fa: 'حداکثر افت', ar: 'أقصى تراجع', ru: 'Макс. просадка', es: 'Drawdown máximo', pt: 'Drawdown máximo', de: 'Max. Drawdown', fr: 'Drawdown maximum' },
  drawdownChart: { tr: 'Drawdown Grafiği', en: 'Drawdown Chart', fa: 'نمودار افت', ar: 'مخطط التراجع', ru: 'График просадки', es: 'Gráfico de drawdown', pt: 'Gráfico de drawdown', de: 'Drawdown-Chart', fr: 'Graphique de drawdown' },
  heatMap: { tr: 'Isı Haritası', en: 'Heat Map', fa: 'نقشه حرارتی', ar: 'خريطة الحرارة', ru: 'Тепловая карта', es: 'Mapa de calor', pt: 'Mapa de calor', de: 'Heatmap', fr: 'Carte thermique' },
  setupPerformance: { tr: 'Setup Performansı', en: 'Setup Performance', fa: 'عملکرد ستاپ', ar: 'أداء الإعداد', ru: 'Эффективность сетапа', es: 'Rendimiento del setup', pt: 'Desempenho do setup', de: 'Setup-Performance', fr: 'Performance du setup' },
  symbolPerformance: { tr: 'Sembol Performansı', en: 'Symbol Performance', fa: 'عملکرد نماد', ar: 'أداء الرمز', ru: 'Эффективность символа', es: 'Rendimiento del símbolo', pt: 'Desempenho do símbolo', de: 'Symbol-Performance', fr: 'Performance du symbole' },
  profitable: { tr: 'Karlı', en: 'Profitable', fa: 'سودآور', ar: 'مربح', ru: 'Прибыльные', es: 'Rentable', pt: 'Lucrativo', de: 'Profitabel', fr: 'Profitable' },
  losing: { tr: 'Zararlı', en: 'Losing', fa: 'زیان‌ده', ar: 'خاسر', ru: 'Убыточные', es: 'Perdedora', pt: 'Com perda', de: 'Verlustreich', fr: 'Perdant' },
  cumulativePnl: { tr: 'Kümülatif PnL', en: 'Cumulative PnL', fa: 'سود/زیان انباشته', ar: 'PnL التراكمي', ru: 'Накопленная прибыль', es: 'PnL acumulado', pt: 'PnL acumulado', de: 'Kumulativer PnL', fr: 'PnL cumulatif' },
  tradePnl: { tr: 'İşlem PnL', en: 'Trade PnL', fa: 'سود/زیان معامله', ar: 'PnL الصفقة', ru: 'Прибыль по сделке', es: 'PnL de operación', pt: 'PnL da operação', de: 'Trade-PnL', fr: 'PnL du trade' },
  sessionStats: { tr: 'Oturum Başarı Oranları', en: 'Session Win Rates', fa: 'نرخ برد جلسات', ar: 'معدلات الفوز في الجلسة', ru: 'Процент побед по сессиям', es: 'Tasas de éxito por sesión', pt: 'Taxas de acerto por sessão', de: 'Sitzungs-Gewinnraten', fr: 'Taux de réussite par session' },
  dayStats: { tr: 'Günlük Başarı Oranları', en: 'Daily Win Rates', fa: 'نرخ برد روزانه', ar: 'معدلات الفوز اليومية', ru: 'Дневные показатели побед', es: 'Tasas de éxito diarias', pt: 'Taxas de acerto diárias', de: 'Tägliche Gewinnraten', fr: 'Taux de réussite quotidiens' },
  asianSession: { tr: 'Asya', en: 'Asian', fa: 'آسیا', ar: 'آسيا', ru: 'Азия', es: 'Asia', pt: 'Ásia', de: 'Asien', fr: 'Asie' },
  londonSession: { tr: 'Londra', en: 'London', fa: 'لندن', ar: 'لندن', ru: 'Лондон', es: 'Londres', pt: 'Londres', de: 'London', fr: 'Londres' },
  nySession: { tr: 'New York', en: 'New York', fa: 'نیویورک', ar: 'نيويورك', ru: 'Нью-Йорк', es: 'Nueva York', pt: 'Nova York', de: 'New York', fr: 'New York' },
  monday: { tr: 'Pazartesi', en: 'Monday', fa: 'دوشنبه', ar: 'الاثنين', ru: 'Понедельник', es: 'Lunes', pt: 'Segunda', de: 'Montag', fr: 'Lundi' },
  tuesday: { tr: 'Salı', en: 'Tuesday', fa: 'سه‌شنبه', ar: 'الثلاثاء', ru: 'Вторник', es: 'Martes', pt: 'Terça', de: 'Dienstag', fr: 'Mardi' },
  wednesday: { tr: 'Çarşamba', en: 'Wednesday', fa: 'چهارشنبه', ar: 'الأربعاء', ru: 'Среда', es: 'Miércoles', pt: 'Quarta', de: 'Mittwoch', fr: 'Mercredi' },
  thursday: { tr: 'Perşembe', en: 'Thursday', fa: 'پنج‌شنبه', ar: 'الخميس', ru: 'Четверг', es: 'Jueves', pt: 'Quinta', de: 'Donnerstag', fr: 'Jeudi' },
  friday: { tr: 'Cuma', en: 'Friday', fa: 'جمعه', ar: 'الجمعة', ru: 'Пятница', es: 'Viernes', pt: 'Sexta', de: 'Freitag', fr: 'Vendredi' },
  saturday: { tr: 'Cumartesi', en: 'Saturday', fa: 'شنبه', ar: 'السبت', ru: 'Суббота', es: 'Sábado', pt: 'Sábado', de: 'Samstag', fr: 'Samedi' },
  sunday: { tr: 'Pazar', en: 'Sunday', fa: 'یکشنبه', ar: 'الأحد', ru: 'Воскресенье', es: 'Domingo', pt: 'Domingo', de: 'Sonntag', fr: 'Dimanche' },
  accounts: { tr: 'Hesaplar', en: 'Accounts', fa: 'حساب‌ها', ar: 'الحسابات', ru: 'Счета', es: 'Cuentas', pt: 'Contas', de: 'Konten', fr: 'Comptes' },
  deleteAccountTitle: { tr: "Journal'ı Sil", en: 'Delete Journal', fa: 'حذف ژورنال', ar: 'حذف السجل', ru: 'Удалить журнал', es: 'Eliminar diario', pt: 'Excluir diário', de: 'Journal löschen', fr: 'Supprimer le journal' },
  deleteAccountDesc: { tr: "Bu journal'ı ve içindeki tüm işlemleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.", en: 'Are you sure you want to delete this journal and all its trades? This action cannot be undone.', fa: 'آیا مطمئن هستید که می‌خواهید این ژورنال و تمام معاملات آن را حذف کنید؟ این عمل غیرقابل بازگشت است.', ar: 'هل أنت متأكد أنك تريد حذف هذا السجل وجميع صفقاته؟ لا يمكن التراجع عن هذا الإجراء.', ru: 'Вы уверены, что хотите удалить этот журнал и все его сделки? Это действие нельзя отменить.', es: '¿Estás seguro de que quieres eliminar este diario y todas sus operaciones? Esta acción no se puede deshacer.', pt: 'Tem certeza que deseja excluir este diário e todas as suas operações? Esta ação não pode ser desfeita.', de: 'Sind Sie sicher, dass Sie dieses Journal und alle Trades löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.', fr: 'Êtes-vous sûr de vouloir supprimer ce journal et tous ses trades ? Cette action ne peut pas être annulée.' },
  delete: { tr: 'Sil', en: 'Delete', fa: 'حذف', ar: 'حذف', ru: 'Удалить', es: 'Eliminar', pt: 'Excluir', de: 'Löschen', fr: 'Supprimer' },
  cancel: { tr: 'İptal', en: 'Cancel', fa: 'لغو', ar: 'إلغاء', ru: 'Отмена', es: 'Cancelar', pt: 'Cancelar', de: 'Abbrechen', fr: 'Annuler' },
  save: { tr: 'Kaydet', en: 'Save', fa: 'ذخیره', ar: 'حفظ', ru: 'Сохранить', es: 'Guardar', pt: 'Salvar', de: 'Speichern', fr: 'Enregistrer' },
  aiAnalyzing: { tr: 'Yapay zeka analiz yapıyor...', en: 'AI is analyzing...', fa: 'هوش مصنوعی در حال تحلیل است...', ar: 'الذكاء الاصطناعي يحلل...', ru: 'ИИ анализирует...', es: 'La IA está analizando...', pt: 'A IA está analisando...', de: 'KI analysiert...', fr: "L'IA analyse..." },
  aiAnalyzeBtn: { tr: '✨ Analiz Et', en: '✨ Analyze', fa: '✨ تحلیل', ar: '✨ تحليل', ru: '✨ Анализ', es: '✨ Analizar', pt: '✨ Analisar', de: '✨ Analysieren', fr: '✨ Analyser' },
  aiAnalyzeLoading: { tr: '⏳ Analiz yapılıyor...', en: '⏳ Analyzing...', fa: '⏳ در حال تحلیل...', ar: '⏳ جاري التحليل...', ru: '⏳ Анализируется...', es: '⏳ Analizando...', pt: '⏳ Analisando...', de: '⏳ Wird analysiert...', fr: '⏳ Analyse en cours...' },
  aiAnalyzeDesc: { tr: 'Tüm trade verilerinizi AI ile analiz edin. Güçlü/zayıf yönler, setup performansı ve kişisel öneriler alın.', en: 'Analyze all your trade data with AI. Get strengths/weaknesses, setup performance and personal recommendations.', fa: 'تمام داده‌های معاملاتی خود را با هوش مصنوعی تحلیل کنید.', ar: 'حلل جميع بيانات تداولك بالذكاء الاصطناعي. احصل على نقاط القوة/الضعف وتوصيات شخصية.', ru: 'Анализируйте все данные сделок с помощью ИИ. Получите сильные/слабые стороны и рекомендации.', es: 'Analiza todos tus datos de trading con IA. Obtén fortalezas/debilidades y recomendaciones personales.', pt: 'Analise todos os seus dados de trading com IA. Obtenha pontos fortes/fracos e recomendações pessoais.', de: 'Analysieren Sie alle Trade-Daten mit KI. Erhalten Sie Stärken/Schwächen und persönliche Empfehlungen.', fr: 'Analysez toutes vos données de trading avec l\'IA. Obtenez forces/faiblesses et recommandations personnelles.' },
  goalsTitle: { tr: 'Hedefler & Kurallar', en: 'Goals & Rules', fa: 'اهداف و قوانین', ar: 'الأهداف والقواعد', ru: 'Цели и правила', es: 'Objetivos y reglas', pt: 'Metas e regras', de: 'Ziele & Regeln', fr: 'Objectifs et règles' },
  editGoals: { tr: 'Hedefleri Düzenle', en: 'Edit Goals', fa: 'ویرایش اهداف', ar: 'تعديل الأهداف', ru: 'Изменить цели', es: 'Editar objetivos', pt: 'Editar metas', de: 'Ziele bearbeiten', fr: 'Modifier les objectifs' },
  monthlyPnLGoal: { tr: 'Aylık PnL Hedefi', en: 'Monthly PnL Goal', fa: 'هدف سود ماهانه', ar: 'هدف الربح الشهري', ru: 'Цель по прибыли в месяц', es: 'Meta de PnL mensual', pt: 'Meta de PnL mensal', de: 'Monatliches PnL-Ziel', fr: 'Objectif PnL mensuel' },
  winRateGoal: { tr: 'Win Rate Hedefi', en: 'Win Rate Goal', fa: 'هدف نرخ برد', ar: 'هدف نسبة الفوز', ru: 'Цель по проценту побед', es: 'Meta de tasa de éxito', pt: 'Meta de taxa de acerto', de: 'Gewinnraten-Ziel', fr: 'Objectif taux de réussite' },
  maxDailyTrades: { tr: 'Günlük Max İşlem', en: 'Max Daily Trades', fa: 'حداکثر معاملات روزانه', ar: 'الحد الأقصى للصفقات اليومية', ru: 'Макс. сделок в день', es: 'Máximo de operaciones diarias', pt: 'Máximo de operações diárias', de: 'Max. tägliche Trades', fr: 'Max trades quotidiens' },
  maxRiskPerTrade: { tr: 'İşlem Başı Max Risk', en: 'Max Risk Per Trade', fa: 'حداکثر ریسک هر معامله', ar: 'الحد الأقصى للمخاطرة لكل صفقة', ru: 'Макс. риск на сделку', es: 'Riesgo máximo por operación', pt: 'Risco máximo por operação', de: 'Max. Risiko pro Trade', fr: 'Risque maximum par trade' },
  maxRiskDesc: { tr: 'Bu limitin üzerinde risk alan işlemler ihlal olarak işaretlenir.', en: 'Trades exceeding this limit will be flagged as violations.', fa: 'معاملات بیش از این حد به عنوان نقض علامت‌گذاری می‌شوند.', ar: 'ستُعلَّم الصفقات التي تتجاوز هذا الحد كانتهاكات.', ru: 'Сделки с риском выше лимита будут отмечены как нарушения.', es: 'Las operaciones que superen este límite se marcarán como infracciones.', pt: 'Operações que excedam este limite serão marcadas como violações.', de: 'Trades, die dieses Limit überschreiten, werden als Verstöße markiert.', fr: 'Les trades dépassant cette limite seront signalés comme violations.' },
  noTradeHours: { tr: 'İşlem Yasak Saatler', en: 'No-Trade Hours', fa: 'ساعات ممنوع معامله', ar: 'ساعات عدم التداول', ru: 'Часы без торговли', es: 'Horas sin operar', pt: 'Horas sem operar', de: 'Handelsfreie Stunden', fr: 'Heures sans trading' },
  noTradeHoursStart: { tr: 'Yasak Başlangıç Saati', en: 'No-Trade Start', fa: 'شروع ساعت ممنوع', ar: 'بداية وقت عدم التداول', ru: 'Начало запретных часов', es: 'Inicio de horas sin operar', pt: 'Início das horas sem operar', de: 'Start der handelsfreien Zeit', fr: 'Début des heures sans trading' },
  noTradeHoursEnd: { tr: 'Yasak Bitiş Saati', en: 'No-Trade End', fa: 'پایان ساعت ممنوع', ar: 'نهاية وقت عدم التداول', ru: 'Конец запретных часов', es: 'Fin de horas sin operar', pt: 'Fim das horas sem operar', de: 'Ende der handelsfreien Zeit', fr: 'Fin des heures sans trading' },
  noTradeHoursDesc: { tr: 'Bu saatler arasında açılan işlemler ihlal olarak işaretlenir.', en: 'Trades opened during these hours will be flagged as violations.', fa: 'معاملات باز شده در این ساعات به عنوان نقض علامت‌گذاری می‌شوند.', ar: 'ستُعلَّم الصفقات المفتوحة خلال هذه الساعات كانتهاكات.', ru: 'Сделки, открытые в эти часы, будут отмечены как нарушения.', es: 'Las operaciones abiertas durante estas horas se marcarán como infracciones.', pt: 'Operações abertas durante estas horas serão marcadas como violações.', de: 'Trades in diesen Stunden werden als Verstöße markiert.', fr: 'Les trades ouverts pendant ces heures seront signalés comme violations.' },
  notSet: { tr: 'Belirlenmedi', en: 'Not set', fa: 'تنظیم نشده', ar: 'غير محدد', ru: 'Не задано', es: 'No establecido', pt: 'Não definido', de: 'Nicht gesetzt', fr: 'Non défini' },
  violations: { tr: 'Kural İhlalleri', en: 'Rule Violations', fa: 'نقض قوانین', ar: 'انتهاكات القواعد', ru: 'Нарушения правил', es: 'Infracciones de reglas', pt: 'Violações de regras', de: 'Regelverstoße', fr: 'Violations de règles' },
  noViolations: { tr: 'Tüm kurallara uyuluyor!', en: 'All rules followed!', fa: 'همه قوانین رعایت شده!', ar: 'تم اتباع جميع القواعد!', ru: 'Все правила соблюдены!', es: '¡Todas las reglas seguidas!', pt: 'Todas as regras seguidas!', de: 'Alle Regeln befolgt!', fr: 'Toutes les règles respectées !' },
  noGoalsTitle: { tr: 'Henüz hedef belirlenmedi', en: 'No goals set yet', fa: 'هنوز هدفی تعیین نشده', ar: 'لم يتم تحديد أهداف بعد', ru: 'Цели ещё не заданы', es: 'Aún no hay objetivos establecidos', pt: 'Ainda não há metas definidas', de: 'Noch keine Ziele gesetzt', fr: 'Aucun objectif défini encore' },
  noGoalsDesc: { tr: 'Aylık hedefler ve kurallar belirleyerek disiplininizi artırın.', en: 'Set monthly goals and rules to improve your discipline.', fa: 'اهداف ماهانه و قوانین تعیین کنید تا انضباط خود را بهبود بخشید.', ar: 'حدد أهدافاً وقواعد شهرية لتحسين انضباطك.', ru: 'Установите ежемесячные цели и правила для улучшения дисциплины.', es: 'Establece metas y reglas mensuales para mejorar tu disciplina.', pt: 'Defina metas e regras mensais para melhorar sua disciplina.', de: 'Setzen Sie monatliche Ziele und Regeln zur Verbesserung Ihrer Disziplin.', fr: 'Définissez des objectifs et règles mensuels pour améliorer votre discipline.' },
  noMonthlyPnLGoal: { tr: 'Aylık PnL hedefi yok', en: 'No monthly PnL goal', fa: 'هدف سود ماهانه وجود ندارد', ar: 'لا يوجد هدف PnL شهري', ru: 'Нет цели по месячной прибыли', es: 'Sin meta de PnL mensual', pt: 'Sem meta de PnL mensal', de: 'Kein monatliches PnL-Ziel', fr: 'Pas d\'objectif PnL mensuel' },
  noWinRateGoal: { tr: 'Win rate hedefi yok', en: 'No win rate goal', fa: 'هدف نرخ برد وجود ندارد', ar: 'لا يوجد هدف لنسبة الفوز', ru: 'Нет цели по проценту побед', es: 'Sin meta de tasa de éxito', pt: 'Sem meta de taxa de acerto', de: 'Kein Gewinnraten-Ziel', fr: 'Pas d\'objectif de taux de réussite' },
  noMaxDailyTrades: { tr: 'Günlük limit yok', en: 'No daily limit', fa: 'محدودیت روزانه وجود ندارد', ar: 'لا يوجد حد يومي', ru: 'Нет дневного лимита', es: 'Sin límite diario', pt: 'Sem limite diário', de: 'Kein Tageslimit', fr: 'Pas de limite quotidienne' },
  noMaxRisk: { tr: 'Risk limiti yok', en: 'No risk limit', fa: 'محدودیت ریسک وجود ندارد', ar: 'لا يوجد حد للمخاطرة', ru: 'Нет лимита риска', es: 'Sin límite de riesgo', pt: 'Sem limite de risco', de: 'Kein Risikolimit', fr: 'Pas de limite de risque' },
  maxDailyTradesViolation: { tr: 'Günlük işlem limiti aşıldı', en: 'Daily trade limit exceeded', fa: 'محدودیت معاملات روزانه تجاوز شد', ar: 'تم تجاوز الحد اليومي للصفقات', ru: 'Превышен дневной лимит сделок', es: 'Límite diario de operaciones superado', pt: 'Limite diário de operações excedido', de: 'Tägliches Trade-Limit überschritten', fr: 'Limite quotidienne de trades dépassée' },
  maxRiskViolation: { tr: 'Risk limiti aşılan işlemler var', en: 'Trades exceeding risk limit', fa: 'معاملاتی که از حد ریسک تجاوز کرده‌اند', ar: 'صفقات تتجاوز حد المخاطرة', ru: 'Сделки с превышением лимита риска', es: 'Operaciones que superan el límite de riesgo', pt: 'Operações que excedem o limite de risco', de: 'Trades überschreiten Risikolimit', fr: 'Trades dépassant la limite de risque' },
  noTradeHoursViolation: { tr: 'Yasak saatlerde işlem yapıldı', en: 'Trades during no-trade hours', fa: 'معاملات در ساعات ممنوع', ar: 'صفقات خلال ساعات عدم التداول', ru: 'Сделки в запретные часы', es: 'Operaciones durante horas sin operar', pt: 'Operações durante horas sem operar', de: 'Trades in handelsfreien Stunden', fr: 'Trades pendant les heures sans trading' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGES: Language[] = ['tr', 'en', 'fa', 'ar', 'ru', 'es', 'pt', 'de', 'fr'];
const STORAGE_KEY = 'language';
const RTL: Language[] = ['fa', 'ar'];

/**
 * Açılışta hangi dil?
 *
 * 1. Kullanıcının daha önce seçtiği dil (tarayıcıda saklanır)
 * 2. Yoksa tarayıcının dili
 * 3. O da tutmazsa İngilizce
 *
 * Varsayılanı Türkçe yapmak, siteyi Türkçe bilmeyen herkese Türkçe açar.
 */
/**
 * Ülke kodundan dil.
 *
 * Yalnızca tarayıcının dili bize bir şey söylemediğinde kullanılır: İran ve
 * Afganistan'da telefonlar çoğu zaman İngilizce kurulu olur, o yüzden tek
 * başına tarayıcı dili o kullanıcıyı İngilizce'ye düşürür.
 */
const COUNTRY_LANGUAGE: Record<string, Language> = {
  TR: 'tr',
  // Afganistan'da Derice Farsça'nın bir kolu ve aynı Arap alfabesiyle yazılır.
  IR: 'fa', AF: 'fa',
  // Tacikçe de Farsça'nın bir kolu ama Kiril alfabesiyle yazılır — Arap
  // alfabesindeki Farsça metni Tacik bir okur çözemez. Ülkede yaygın ikinci
  // dil olan Rusça daha isabetli.
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', UZ: 'ru', TM: 'ru', TJ: 'ru',
  SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar',
  JO: 'ar', LB: 'ar', IQ: 'ar', SY: 'ar', YE: 'ar', PS: 'ar', LY: 'ar',
  MA: 'ar', DZ: 'ar', TN: 'ar', SD: 'ar', MR: 'ar',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es',
  SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  DE: 'de', AT: 'de',
  FR: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', LU: 'fr',
};

export function detectLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && LANGUAGES.includes(saved)) return saved;
  } catch { /* gizli sekmede localStorage kapalı olabilir */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : '';
  return (LANGUAGES as string[]).includes(nav) ? (nav as Language) : 'en';
}

/** Tarayıcının dili desteklediğimiz bir dil mi? */
function browserLanguageKnown(): boolean {
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : '';
  return (LANGUAGES as string[]).includes(nav);
}

function savedLanguage(): Language | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    return saved && LANGUAGES.includes(saved) ? saved : null;
  } catch { return null; }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  /** Seçim kalıcı olsun: yenilemede ya da ertesi gün sıfırlanmasın. */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* önemsiz */ }
  };

  // Tarayıcı dili tanıdık değilse ülkeye bakarız — İngilizce'ye düşürmeden
  // önce son bir şans. Kullanıcının kendi seçimi her zaman üstündür ve bu
  // sadece ilk ziyarette, bir kez çalışır.
  useEffect(() => {
    if (savedLanguage() || browserLanguageKnown()) return;
    let cancelled = false;
    fetch('/api/geo')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const guess = data && COUNTRY_LANGUAGE[data.country];
        // Seçimi kaydetmiyoruz: tahmin, kullanıcının kararı değil.
        if (!cancelled && guess) setLanguageState(guess);
      })
      .catch(() => { /* ülke öğrenilemedi, İngilizce kalır */ });
    return () => { cancelled = true; };
  }, []);

  // Sayfanın kendi dil ve yön bilgisi de takip etsin: yazım denetimi,
  // ekran okuyucular ve Arapça/Farsça için sağdan sola akış buna bakar.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = RTL.includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: keyof typeof translations) => translations[key]?.[language] || key;
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
