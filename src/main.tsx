import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { LanguageProvider, useLanguage, detectLanguage } from './context/LanguageContext';
import { loadAppCopy, needsAppCopy } from './lib/appCopy';
import './index.css';

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

function ClerkWithLanguage({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const hint = CODE_HINT[language] || CODE_HINT.en;
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      localization={{ signUp: { emailCode: { subtitle: hint } }, signIn: { emailCode: { subtitle: hint } } }}
    >
      {children}
    </ClerkProvider>
  );
}

// Türkçe/İngilizce dışındaki dillerde çeviri tablosu gelmeden çizmiyoruz;
// yoksa ilk anda İngilizce görünür (bkz. lib/appCopy.ts).
const initial = detectLanguage();
(needsAppCopy(initial) ? loadAppCopy() : Promise.resolve()).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <LanguageProvider>
        <ClerkWithLanguage>
          <App />
        </ClerkWithLanguage>
        {/* Çerezsiz ziyaretçi sayımı (Vercel). Journal adresleri kişiye özel
            kimlik taşıyor (/journal/<id>/…); istatistiğe yalnızca /journal gitsin. */}
        <Analytics beforeSend={e => ({ ...e, url: e.url.replace(/\/journal\/.*$/, '/journal') })} />
      </LanguageProvider>
    </React.StrictMode>
  );
});
