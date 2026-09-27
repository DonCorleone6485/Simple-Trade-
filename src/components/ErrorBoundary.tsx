import React from 'react';
import { logError } from '../lib/errorLog';

/**
 * Bir ekran çizilirken hata çıkarsa React bütün sayfayı boşaltıyordu:
 * kullanıcı açıklamasız, bembeyaz bir ekran görüyordu. Artık hata kaydediliyor
 * (lib/errorLog.ts) ve yerine yeniden yükleme düğmesi olan sade bir ekran
 * çıkıyor. Verilere dokunulmuyor; sorun büyük ihtimalle tek bir ekrandadır.
 *
 * Dil bağlamının dışında durabilsin diye metinler burada ve dil
 * localStorage'dan okunuyor.
 */
const TEXT: Record<string, [string, string, string]> = {
  tr: ['Bir şeyler ters gitti', 'Bu ekran açılırken bir hata oluştu; verilerin güvende. Sayfayı yenilemek genelde yeterli. Kaydını aldık, bakacağız.', 'Sayfayı yenile'],
  en: ['Something went wrong', 'This screen hit an error while loading; your data is safe. Reloading usually fixes it. We\'ve logged it and will look into it.', 'Reload the page'],
  fa: ['مشکلی پیش آمد', 'هنگام باز شدن این صفحه خطایی رخ داد؛ داده‌هایت امن است. معمولاً بارگذاری دوباره کافی است. خطا ثبت شد و بررسی می‌کنیم.', 'بارگذاری دوباره'],
  ar: ['حدث خطأ ما', 'حدث خطأ أثناء فتح هذه الشاشة؛ بياناتك بأمان. غالباً تكفي إعادة تحميل الصفحة. سجّلنا الخطأ وسنراجعه.', 'إعادة تحميل الصفحة'],
  ru: ['Что-то пошло не так', 'При открытии этого экрана произошла ошибка; ваши данные в безопасности. Обычно помогает перезагрузка. Мы записали ошибку и разберёмся.', 'Перезагрузить страницу'],
  es: ['Algo salió mal', 'Esta pantalla falló al cargar; tus datos están a salvo. Normalmente basta con recargar. Lo hemos registrado y lo revisaremos.', 'Recargar la página'],
  pt: ['Algo correu mal', 'Este ecrã falhou ao carregar; os teus dados estão seguros. Normalmente basta recarregar. Registámos o erro e vamos analisá-lo.', 'Recarregar a página'],
  de: ['Etwas ist schiefgelaufen', 'Beim Laden dieses Bildschirms ist ein Fehler aufgetreten; deine Daten sind sicher. Neu laden hilft meistens. Wir haben den Fehler erfasst und sehen ihn uns an.', 'Seite neu laden'],
  fr: ['Un problème est survenu', 'Cet écran a rencontré une erreur au chargement ; vos données sont en sécurité. Recharger suffit généralement. Nous l\'avons enregistrée et allons l\'examiner.', 'Recharger la page'],
};

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  declare readonly props: Readonly<{ children: React.ReactNode }>;
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    logError('render', error, info.componentStack || undefined);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    let lang = 'en';
    try { lang = localStorage.getItem('language') || 'en'; } catch { /* yok */ }
    const [title, text, button] = TEXT[lang] || TEXT.en;
    const rtl = lang === 'fa' || lang === 'ar';
    return (
      <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0e1a' }}>
        <div className="max-w-md text-center">
          <h1 className="font-display text-[24px] font-medium text-white mb-3">{title}</h1>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>{text}</p>
          <button onClick={() => location.reload()} className="cta px-6 py-2.5 rounded-full text-[15px] font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
            {button}
          </button>
        </div>
      </div>
    );
  }
}
