import { supabase } from './supabase';

/**
 * Kullanıcıların tarayıcısında çıkan hatalar — bizim göremediğimiz yerde.
 *
 * Sentry gibi bir servis hesap ve anahtar istiyordu; aynı işin sade hâli:
 * yakalanmamış hatalar ve çizim hataları Supabase'deki client_errors
 * tablosuna yazılıyor (yalnızca eklenebiliyor, okunamıyor; kimin adına
 * olduğunu veritabanı oturumdan kendisi yazıyor). Günlük görev son 24 saatte
 * hata varsa support@'a özet gönderiyor (api/emails.ts).
 *
 * Gürültü süzülüyor: tarayıcı eklentilerinin hataları, "Script error." gibi
 * içeriği görünmeyen hatalar ve bilinen zararsız uyarılar yazılmıyor. Aynı
 * hata bir oturumda bir kez, bir oturumda en fazla 10 hata.
 */
const MAX_PER_SESSION = 10;
const seen = new Set<string>();

const NOISE = [
  /^Script error\.?$/i,
  /ResizeObserver loop/i,
  /Non-Error promise rejection captured/i,
  /Load failed$/i,            // Safari: ağ kesilince fetch
  /Failed to fetch$/i,         // aynısı, Chrome
  /NetworkError when attempting to fetch/i,
  /AbortError/i,
];

export function logError(kind: 'error' | 'rejection' | 'render', err: unknown, extraStack?: string) {
  try {
    const e = err as { message?: string; stack?: string } | undefined;
    const message = String(e?.message || err || 'Unknown error').slice(0, 1000);
    const stack = String([e?.stack, extraStack].filter(Boolean).join('\n')).slice(0, 4000);
    if (NOISE.some(r => r.test(message))) return;
    if (/chrome-extension:|moz-extension:|safari-extension:/.test(stack)) return;
    const key = `${kind}:${message}`;
    if (seen.has(key) || seen.size >= MAX_PER_SESSION) return;
    seen.add(key);
    let lang = '';
    try { lang = localStorage.getItem('language') || ''; } catch { /* yok */ }
    void supabase.from('client_errors').insert({
      kind, message, stack: stack || null,
      url: (location.pathname + location.search).slice(0, 500),
      user_agent: navigator.userAgent.slice(0, 400),
      lang: lang.slice(0, 5) || null,
    }).then(() => {}, () => {});
  } catch { /* hata kaydederken hata: sessizce geç */ }
}

let installed = false;
export function installErrorLogging() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', ev => logError('error', ev.error || ev.message));
  window.addEventListener('unhandledrejection', ev => logError('rejection', ev.reason));
}
