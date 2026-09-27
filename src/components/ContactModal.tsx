import React, { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { aria } from '../lib/aria';
import { SUPPORT_EMAIL } from '../lib/contact';

/**
 * "Bize yaz" formu. Önce bağlantılar mailto: açıyordu; kullanıcı siteden
 * çıkıp kendi posta programına gidiyordu (ve posta programı kurulu değilse
 * hiçbir şey olmuyordu). Form mesajı sunucu üzerinden support@'a iletiyor
 * (api/emails.ts → contact). Nasıl açıldığı: lib/contact.ts.
 */
type L9 = Record<'tr' | 'en' | 'fa' | 'ar' | 'ru' | 'es' | 'pt' | 'de' | 'fr', string>;
const T: Record<string, L9> = {
  title: { tr: 'Bize yaz', en: 'Contact us', fa: 'تماس با ما', ar: 'تواصل معنا', ru: 'Написать нам', es: 'Escríbenos', pt: 'Fala connosco', de: 'Schreib uns', fr: 'Nous écrire' },
  lead: {
    tr: 'Soru, hata ya da öneri — genelde bir iş günü içinde e-postayla dönüyoruz.',
    en: 'Questions, bugs or ideas — we usually reply by email within one business day.',
    fa: 'پرسش، خطا یا پیشنهاد — معمولاً ظرف یک روز کاری با ایمیل پاسخ می‌دهیم.',
    ar: 'أسئلة أو أخطاء أو اقتراحات — نرد عادةً بالبريد خلال يوم عمل واحد.',
    ru: 'Вопросы, ошибки или идеи — обычно отвечаем по почте в течение рабочего дня.',
    es: 'Dudas, errores o ideas: solemos responder por correo en un día hábil.',
    pt: 'Dúvidas, erros ou ideias — normalmente respondemos por e-mail num dia útil.',
    de: 'Fragen, Fehler oder Ideen – wir antworten meist innerhalb eines Werktags per E-Mail.',
    fr: 'Questions, bugs ou idées — nous répondons généralement par e-mail sous un jour ouvré.',
  },
  name: { tr: 'Adın (isteğe bağlı)', en: 'Your name (optional)', fa: 'نام تو (اختیاری)', ar: 'اسمك (اختياري)', ru: 'Имя (необязательно)', es: 'Tu nombre (opcional)', pt: 'O teu nome (opcional)', de: 'Dein Name (optional)', fr: 'Votre nom (facultatif)' },
  email: { tr: 'E-posta adresin', en: 'Your email', fa: 'ایمیل تو', ar: 'بريدك الإلكتروني', ru: 'Ваш e-mail', es: 'Tu correo', pt: 'O teu e-mail', de: 'Deine E-Mail', fr: 'Votre e-mail' },
  replyTo: { tr: 'Cevabı şu adrese yazacağız: {0}', en: 'We\'ll reply to {0}', fa: 'پاسخ را به {0} می‌فرستیم', ar: 'سنرد على {0}', ru: 'Ответим на {0}', es: 'Te responderemos a {0}', pt: 'Respondemos para {0}', de: 'Wir antworten an {0}', fr: 'Nous répondrons à {0}' },
  message: { tr: 'Mesajın', en: 'Your message', fa: 'پیام تو', ar: 'رسالتك', ru: 'Сообщение', es: 'Tu mensaje', pt: 'A tua mensagem', de: 'Deine Nachricht', fr: 'Votre message' },
  send: { tr: 'Gönder', en: 'Send', fa: 'ارسال', ar: 'إرسال', ru: 'Отправить', es: 'Enviar', pt: 'Enviar', de: 'Senden', fr: 'Envoyer' },
  sending: { tr: 'Gönderiliyor…', en: 'Sending…', fa: 'در حال ارسال…', ar: 'جارٍ الإرسال…', ru: 'Отправляем…', es: 'Enviando…', pt: 'A enviar…', de: 'Wird gesendet…', fr: 'Envoi…' },
  sent: { tr: 'Mesajın ulaştı', en: 'Message sent', fa: 'پیامت رسید', ar: 'وصلت رسالتك', ru: 'Сообщение отправлено', es: 'Mensaje enviado', pt: 'Mensagem enviada', de: 'Nachricht gesendet', fr: 'Message envoyé' },
  sentText: {
    tr: 'Teşekkürler! Cevabımız e-posta kutuna gelecek — birkaç saat içinde görmezsen Spam klasörüne de bak.',
    en: 'Thank you! Our reply will arrive in your inbox — if you don\'t see it within a few hours, check your spam folder too.',
    fa: 'ممنون! پاسخ ما به صندوق ایمیلت می‌رسد — اگر تا چند ساعت ندیدی، پوشه اسپم را هم نگاه کن.',
    ar: 'شكراً! سيصل ردّنا إلى بريدك — إن لم تره خلال ساعات فتحقق من مجلد الرسائل غير المرغوب فيها.',
    ru: 'Спасибо! Ответ придёт вам на почту — если не увидите его через несколько часов, проверьте и «Спам».',
    es: '¡Gracias! Nuestra respuesta llegará a tu correo; si no la ves en unas horas, revisa también el spam.',
    pt: 'Obrigado! A nossa resposta chega ao teu e-mail — se não a vires dentro de algumas horas, vê também o spam.',
    de: 'Danke! Unsere Antwort kommt per E-Mail – falls du sie in ein paar Stunden nicht siehst, schau auch in den Spam-Ordner.',
    fr: 'Merci ! Notre réponse arrivera dans votre boîte — si vous ne la voyez pas d\'ici quelques heures, vérifiez aussi vos spams.',
  },
  close: { tr: 'Kapat', en: 'Close', fa: 'بستن', ar: 'إغلاق', ru: 'Закрыть', es: 'Cerrar', pt: 'Fechar', de: 'Schließen', fr: 'Fermer' },
  errEmail: { tr: 'Geçerli bir e-posta adresi yaz.', en: 'Please enter a valid email address.', fa: 'یک ایمیل معتبر بنویس.', ar: 'اكتب بريداً إلكترونياً صالحاً.', ru: 'Введите корректный e-mail.', es: 'Escribe un correo válido.', pt: 'Escreve um e-mail válido.', de: 'Bitte gib eine gültige E-Mail-Adresse ein.', fr: 'Saisissez une adresse e-mail valide.' },
  errMessage: { tr: 'Mesaj en az 5 karakter olmalı.', en: 'The message needs at least 5 characters.', fa: 'پیام باید دست‌کم ۵ نویسه باشد.', ar: 'يجب أن تكون الرسالة 5 أحرف على الأقل.', ru: 'В сообщении должно быть не меньше 5 символов.', es: 'El mensaje debe tener al menos 5 caracteres.', pt: 'A mensagem precisa de pelo menos 5 caracteres.', de: 'Die Nachricht braucht mindestens 5 Zeichen.', fr: 'Le message doit contenir au moins 5 caractères.' },
  errSend: {
    tr: 'Gönderilemedi. Biraz sonra yeniden dene ya da doğrudan {0} adresine yaz.',
    en: 'It couldn\'t be sent. Try again shortly, or write to {0} directly.',
    fa: 'ارسال نشد. کمی بعد دوباره امتحان کن یا مستقیم به {0} بنویس.',
    ar: 'تعذّر الإرسال. حاول بعد قليل أو راسل {0} مباشرة.',
    ru: 'Не удалось отправить. Попробуйте чуть позже или напишите напрямую на {0}.',
    es: 'No se pudo enviar. Inténtalo en un rato o escribe directamente a {0}.',
    pt: 'Não foi possível enviar. Tenta daqui a pouco ou escreve diretamente para {0}.',
    de: 'Senden fehlgeschlagen. Versuch es gleich noch einmal oder schreib direkt an {0}.',
    fr: 'L\'envoi a échoué. Réessayez dans un instant ou écrivez directement à {0}.',
  },
};

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

export default function ContactModal({ onClose, accountEmail, getToken }: {
  onClose: () => void;
  /** Giriş yapmışsa hesabın e-postası; alan gösterilmez, cevap oraya gider. */
  accountEmail?: string | null;
  getToken?: () => Promise<string | null>;
}) {
  const { language } = useLanguage();
  const s = (k: keyof typeof T, arg = '') => ((T[k] as Record<string, string>)[language] || T[k].en).replace('{0}', arg);
  const rtl = language === 'fa' || language === 'ar';
  const openedAt = useRef(Date.now());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!accountEmail && !EMAIL_RE.test(email.trim())) { setError(s('errEmail')); return; }
    if (message.trim().length < 5) { setError(s('errMessage')); return; }
    setState('sending');
    try {
      const token = getToken ? await getToken().catch(() => null) : null;
      const r = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name, email: accountEmail || email.trim(), message: message.trim(), website,
          openedAt: openedAt.current, language, page: window.location.pathname,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState('sent');
    } catch {
      setState('idle');
      setError(s('errSend', SUPPORT_EMAIL));
    }
  };

  const field: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose} dir={rtl ? 'rtl' : 'ltr'}>
      <div role="dialog" aria-modal="true" aria-labelledby="contact-title"
        className="w-full max-w-md rounded-2xl p-6" style={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 id="contact-title" className="font-display text-[21px] font-medium text-white">{state === 'sent' ? s('sent') : s('title')}</h2>
          <button onClick={onClose} aria-label={aria('close', language)} className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {state === 'sent' ? (
          <>
            <div className="w-10 h-10 rounded-full flex items-center justify-center my-4" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <Check className="w-5 h-5" style={{ color: '#34d399' }} />
            </div>
            <p className="text-[14.5px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>{s('sentText')}</p>
            <button onClick={onClose} className="cta w-full py-2.5 rounded-full text-[14.5px] font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
              {s('close')}
            </button>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>{s('lead')}</p>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder={s('name')} aria-label={s('name')}
                maxLength={80} autoComplete="name" className="w-full rounded-xl px-3.5 py-2.5 text-[14.5px] outline-none" style={field} />
              {accountEmail ? (
                <p className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{s('replyTo', accountEmail)}</p>
              ) : (
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder={s('email')} aria-label={s('email')}
                  type="email" inputMode="email" autoComplete="email" dir="ltr" maxLength={200}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[14.5px] outline-none" style={field} />
              )}
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={s('message')} aria-label={s('message')}
                rows={6} maxLength={5000} className="w-full rounded-xl px-3.5 py-2.5 text-[14.5px] outline-none resize-y" style={field} autoFocus />
              {/* Bot tuzağı: insan görmez, doldurmaz. */}
              <input value={website} onChange={e => setWebsite(e.target.value)} name="website" tabIndex={-1} autoComplete="off"
                aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
            </div>
            {error && <p className="text-[13px] mt-3" style={{ color: '#f87171' }}>{error}</p>}
            <button type="submit" disabled={state === 'sending'}
              className="cta w-full mt-5 py-2.5 rounded-full text-[14.5px] font-medium disabled:opacity-60" style={{ background: '#8b5cf6', color: '#fff' }}>
              {state === 'sending' ? s('sending') : s('send')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
