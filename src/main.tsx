import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { LanguageProvider, useLanguage, detectLanguage } from './context/LanguageContext';
import { loadAppCopy, needsAppCopy } from './lib/appCopy';
import ErrorBoundary from './components/ErrorBoundary';
import { installErrorLogging } from './lib/errorLog';
import './index.css';

installErrorLogging();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Kayıt/giriş kodu ekranının alt yazısı. Alan adımız yeni olduğu için Outlook
 * gibi servisler ilk postaları Gereksiz/Spam klasörüne atabiliyor; kodu
 * bekleyen kişi oraya bakmayı akıl etmeyince kayıt yarıda kalıyordu.
 */
const CODE_HINT: Record<string, string> = {
  tr: 'Kodu e-postana gönderdik. Birkaç saniyede gelmezse Spam / Gereksiz klasörüne bak.',
  en: 'We emailed you a code. If it doesn\'t arrive within a few seconds, check your Spam / Junk folder.',
  fa: 'کد را به ایمیلت فرستادیم. اگر تا چند ثانیه نرسید، پوشه اسپم را نگاه کن.',
  ar: 'أرسلنا رمزاً إلى بريدك. إن لم يصل خلال ثوانٍ فتحقق من مجلد الرسائل غير المرغوب فيها.',
  ru: 'Мы отправили код на вашу почту. Если его нет через несколько секунд, проверьте папку «Спам».',
  es: 'Te enviamos un código. Si no llega en unos segundos, revisa la carpeta de spam o correo no deseado.',
  pt: 'Enviámos-te um código. Se não chegar em poucos segundos, vê a pasta de spam / lixo.',
  de: 'Wir haben dir einen Code geschickt. Kommt er nicht in wenigen Sekunden, schau in den Spam-Ordner.',
  fr: 'Nous vous avons envoyé un code. S\'il n\'arrive pas d\'ici quelques secondes, vérifiez vos spams / courriers indésirables.',
};

/**
 * Giriş/kayıt pencereleri (Clerk) sitenin dilinde. Clerk'in hazır çevirileri
 * dil başına ~20 KB; hepsini ana pakete koymak yerine yalnızca seçili dil
 * yükleniyor (ilk çizimden önce ve dil değişince). İngilizce Clerk'in kendi
 * varsayılanı.
 */
const CLERK_LOCALES: Record<string, () => Promise<{ [k: string]: any }>> = {
  tr: () => import('@clerk/localizations/tr-TR'),
  fa: () => import('@clerk/localizations/fa-IR'),
  ar: () => import('@clerk/localizations/ar-SA'),
  ru: () => import('@clerk/localizations/ru-RU'),
  es: () => import('@clerk/localizations/es-ES'),
  pt: () => import('@clerk/localizations/pt-PT'),
  de: () => import('@clerk/localizations/de-DE'),
  fr: () => import('@clerk/localizations/fr-FR'),
};
const clerkLocaleCache: Record<string, any> = {};
function loadClerkLocale(lang: string): Promise<any> {
  if (lang in clerkLocaleCache) return Promise.resolve(clerkLocaleCache[lang]);
  const load = CLERK_LOCALES[lang];
  if (!load) return Promise.resolve(undefined);
  return load()
    .then(m => (clerkLocaleCache[lang] = Object.values(m).find(v => v && typeof v === 'object' && 'locale' in v)))
    .catch(() => undefined);
}

function ClerkWithLanguage({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [base, setBase] = useState<any>(() => clerkLocaleCache[language]);
  useEffect(() => {
    let live = true;
    loadClerkLocale(language).then(l => { if (live) setBase(l); });
    return () => { live = false; };
  }, [language]);
  const hint = CODE_HINT[language] || CODE_HINT.en;
  const localization = {
    ...base,
    signUp: { ...base?.signUp, emailCode: { ...base?.signUp?.emailCode, subtitle: hint } },
    signIn: { ...base?.signIn, emailCode: { ...base?.signIn?.emailCode, subtitle: hint } },
  };
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} localization={localization}>
      {children}
    </ClerkProvider>
  );
}

// Çeviri tablosu (TR/EN dışı) ve giriş penceresinin dili gelmeden çizmiyoruz;
// yoksa ilk anda İngilizce görünür (bkz. lib/appCopy.ts).
const initial = detectLanguage();
Promise.all([needsAppCopy(initial) ? loadAppCopy() : null, loadClerkLocale(initial)]).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
      <LanguageProvider>
        <ClerkWithLanguage>
          <App />
        </ClerkWithLanguage>
        {/* Çerezsiz ziyaretçi sayımı (Vercel). Journal adresleri kişiye özel
            kimlik taşıyor (/journal/<id>/…); istatistiğe yalnızca /journal gitsin. */}
        <Analytics beforeSend={e => ({ ...e, url: e.url.replace(/\/journal\/.*$/, '/journal') })} />
      </LanguageProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
});
