import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'tr' | 'en' | 'fa';

interface Translations {
  [key: string]: { tr: string; en: string; fa: string; };
}

export const translations: Translations = {
  appTitle: { tr: 'Trade Journal', en: 'Trade Journal', fa: 'دفترچه معاملات' },
  dashboardTitle: { tr: 'Journal', en: 'Journal', fa: 'ژورنال' },
  newJournal: { tr: 'Yeni Journal', en: 'New Journal', fa: 'ژورنال جدید' },
  newJournalSubtitle: { tr: 'Yeni bir işlem günlüğü başlat', en: 'Start a new trading journal', fa: 'یک دفترچه معاملاتی جدید شروع کنید' },
  newJournalDesc: { tr: 'Journal bilgilerini girin', en: 'Enter journal details', fa: 'جزئیات ژورنال را وارد کنید' },
  journalName: { tr: 'Journal Adı', en: 'Journal Name', fa: 'نام ژورنال' },
  journalNamePlaceholder: { tr: 'Örn: Prop Hesabım', en: 'e.g. My Prop Account', fa: 'مثال: حساب پراپ من' },
  startDate: { tr: 'Başlangıç Tarihi', en: 'Start Date', fa: 'تاریخ شروع' },
  startingCapital: { tr: 'Başlangıç Sermayesi', en: 'Starting Capital', fa: 'سرمایه اولیه' },
  myJournals: { tr: 'Journallerim', en: 'My Journals', fa: 'ژورنال‌های من' },
  noJournals: { tr: 'Henüz journal yok. Yeni bir tane oluştur!', en: 'No journals yet. Create a new one!', fa: 'هنوز ژورنالی وجود ندارد. یکی بسازید!' },
  backToDashboard: { tr: 'Dashboard', en: 'Dashboard', fa: 'داشبورد' },
  newTradeTab: { tr: 'Yeni İşlem', en: 'New Trade', fa: 'معامله جدید' },
  historyTab: { tr: 'Geçmiş', en: 'History', fa: 'تاریخچه' },
  calendarTab: { tr: 'Takvim', en: 'Calendar', fa: 'تقویم' },
  statsTab: { tr: 'İstatistikler', en: 'Statistics', fa: 'آمار' },
  formTitle: { tr: 'Yeni İşlem Kaydı', en: 'New Trade Record', fa: 'ثبت معامله جدید' },
  formSubtitle: { tr: 'İşlem detaylarını, fotoğraflarını ve notlarını aşağıya girin.', en: 'Enter trade details, photos, and notes below.', fa: 'جزئیات معامله، عکس‌ها و یادداشت‌های خود را در زیر وارد کنید.' },
  dateTime: { tr: 'İşlem Tarihi ve Saati', en: 'Trade Date & Time', fa: 'تاریخ و زمان معامله' },
  symbol: { tr: 'Parite / Sembol', en: 'Pair / Symbol', fa: 'جفت ارز / نماد' },
  type: { tr: 'İşlem Türü', en: 'Trade Type', fa: 'نوع معامله' },
  buy: { tr: 'Buy', en: 'Buy', fa: 'Buy' },
  sell: { tr: 'Sell', en: 'Sell', fa: 'Sell' },
  timeframe: { tr: 'Timeframe', en: 'Timeframe', fa: 'تایم‌فریم' },
  setup: { tr: 'Setup / Strateji', en: 'Setup / Strategy', fa: 'ستاپ / استراتژی' },
  rr: { tr: 'Risk/Reward (R/R)', en: 'Risk/Reward (R/R)', fa: 'ریسک/ریوارد (R/R)' },
  rrPlaceholder: { tr: 'Örn: 2.5', en: 'e.g., 2.5', fa: 'مثال: 2.5' },
  risk: { tr: 'Risk ($)', en: 'Risk ($)', fa: 'ریسک ($)' },
  reward: { tr: 'Kazanç ($)', en: 'Reward ($)', fa: 'سود ($)' },
  result: { tr: 'Sonuç', en: 'Result', fa: 'نتیجه' },
  resultOpen: { tr: 'Açık / Beklemede', en: 'Open / Pending', fa: 'باز / در انتظار' },
  resultWin: { tr: 'Başarılı', en: 'Win', fa: 'موفق' },
  resultLoss: { tr: 'Başarısız', en: 'Loss', fa: 'ناموفق' },
  resultManualWin: { tr: 'Karda manuel kapattım', en: 'Closed Manually (Profit)', fa: 'بسته شده دستی (سود)' },
  resultManualLoss: { tr: 'Zararda manuel kapattım', en: 'Closed Manually (Loss)', fa: 'بسته شده دستی (ضرر)' },
  preTrade: { tr: 'İşlem Öncesi', en: 'Pre-Trade', fa: 'قبل از معامله' },
  postTrade: { tr: 'İşlem Sonrası', en: 'Post-Trade', fa: 'بعد از معامله' },
  photos: { tr: 'Fotoğraflar', en: 'Photos', fa: 'عکس‌ها' },
  photoUpload: { tr: 'Fotoğraf Yükle', en: 'Upload Photo', fa: 'آپلود عکس' },
  notes: { tr: 'Not', en: 'Notes', fa: 'یادداشت' },
  preNotesPlaceholder: { tr: 'İşleme girme nedeniniz, beklentileriniz...', en: 'Reason for entry, expectations...', fa: 'دلیل ورود به معامله، انتظارات...' },
  postNotesPlaceholder: { tr: 'İşlem sonucu, yapılan hatalar, çıkarılan dersler...', en: 'Trade result, mistakes made, lessons learned...', fa: 'نتیجه معامله، اشتباهات، درس‌های گرفته شده...' },
  saveButton: { tr: 'İşlemi Kaydet', en: 'Save Trade', fa: 'ثبت معامله' },
  pleaseSelectDate: { tr: 'Lütfen tarih seçin', en: 'Please select a date', fa: 'لطفاً تاریخ را انتخاب کنید' },
  emptyTitle: { tr: 'Henüz işlem yok', en: 'No trades yet', fa: 'هنوز معامله‌ای ثبت نشده' },
  emptyDesc: { tr: 'Yeni İşlem butonunu kullanarak ilk işleminizi kaydedin.', en: 'Use the New Trade button to record your first trade.', fa: 'برای ثبت اولین معامله از دکمه معامله جدید استفاده کنید.' },
  backToList: { tr: 'Listeye Dön', en: 'Back to List', fa: 'بازگشت به لیست' },
  riskRewardLabel: { tr: 'Risk / Kazanç', en: 'Risk / Reward', fa: 'ریسک / سود' },
  deleteTrade: { tr: 'İşlemi Sil', en: 'Delete Trade', fa: 'حذف معامله' },
  noNotes: { tr: 'Not eklenmemiş.', en: 'No notes added.', fa: 'یادداشتی اضافه نشده است.' },
  openStatus: { tr: 'Açık', en: 'Open', fa: 'باز' },
  winStatus: { tr: 'Başarılı', en: 'Win', fa: 'موفق' },
  lossStatus: { tr: 'Başarısız', en: 'Loss', fa: 'ناموفق' },
  statsTitle: { tr: 'İstatistikler', en: 'Statistics', fa: 'آمار' },
  tradeCount: { tr: 'İşlem', en: 'Trades', fa: 'معامله' },
  totalTrades: { tr: 'Toplam İşlem', en: 'Total Trades', fa: 'معاملات بسته شده' },
  winRate: { tr: 'Kazanma Oranı', en: 'Win Rate', fa: 'نرخ برد' },
  netProfit: { tr: 'Net Kar/Zarar', en: 'Net PnL', fa: 'سود/زیان خالص' },
  profitFactor: { tr: 'Kar Faktörü', en: 'Profit Factor', fa: 'فاکتور سود' },
  bestTrade: { tr: 'En İyi İşlem', en: 'Best Trade', fa: 'بهترین معامله' },
  worstTrade: { tr: 'En Kötü İşlem', en: 'Worst Trade', fa: 'بدترین معامله' },
  avgRR: { tr: 'Ortalama R/R', en: 'Avg R/R', fa: 'میانگین R/R' },
  bestDay: { tr: 'En İyi Gün', en: 'Best Day', fa: 'بهترین روز' },
  cumulativePnl: { tr: 'Kümülatif PnL', en: 'Cumulative PnL', fa: 'سود/زیان انباشته' },
  tradePnl: { tr: 'İşlem PnL', en: 'Trade PnL', fa: 'سود/زیان معامله' },
  sessionStats: { tr: 'Oturum Başarı Oranları', en: 'Session Win Rates', fa: 'نرخ برد جلسات' },
  dayStats: { tr: 'Günlük Başarı Oranları', en: 'Daily Win Rates', fa: 'نرخ برد روزانه' },
  asianSession: { tr: 'Asya', en: 'Asian', fa: 'آسیا' },
  londonSession: { tr: 'Londra', en: 'London', fa: 'لندن' },
  nySession: { tr: 'New York', en: 'New York', fa: 'نیویورک' },
  monday: { tr: 'Pazartesi', en: 'Monday', fa: 'دوشنبه' },
  tuesday: { tr: 'Salı', en: 'Tuesday', fa: 'سه‌شنبه' },
  wednesday: { tr: 'Çarşamba', en: 'Wednesday', fa: 'چهارشنبه' },
  thursday: { tr: 'Perşembe', en: 'Thursday', fa: 'پنج‌شنبه' },
  friday: { tr: 'Cuma', en: 'Friday', fa: 'جمعه' },
  saturday: { tr: 'Cumartesi', en: 'Saturday', fa: 'شنبه' },
  sunday: { tr: 'Pazar', en: 'Sunday', fa: 'یکشنبه' },
  accounts: { tr: 'Hesaplar', en: 'Accounts', fa: 'حساب‌ها' },
  deleteAccountTitle: { tr: "Journal'ı Sil", en: 'Delete Journal', fa: 'حذف ژورنال' },
  deleteAccountDesc: { tr: "Bu journal'ı ve içindeki tüm işlemleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.", en: 'Are you sure you want to delete this journal and all its trades? This action cannot be undone.', fa: 'آیا مطمئن هستید که می‌خواهید این ژورنال و تمام معاملات آن را حذف کنید؟ این عمل غیرقابل بازگشت است.' },
  delete: { tr: 'Sil', en: 'Delete', fa: 'حذف' },
  cancel: { tr: 'İptal', en: 'Cancel', fa: 'لغو' },
  save: { tr: 'Kaydet', en: 'Save', fa: 'ذخیره' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr');
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
