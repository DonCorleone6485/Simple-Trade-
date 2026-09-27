import { supabase } from './supabase';
import type { AlertSettings } from './alerts';

/**
 * Sekme kapalıyken bildirim (Web Push) aboneliği.
 *
 * Kullanıcı haber ya da seans bildirimini açınca: bildirimler için servis
 * çalışanı (public/sw.js) kaydedilir, tarayıcıdan abonelik alınır ve ayarlarla
 * birlikte veritabanına yazılır (save_push_subscription). Supabase'deki
 * push-alerts görevi dakikada bir zamanı gelen uyarıları gönderir. İkisi de
 * kapanınca abonelik silinir.
 *
 * Yalnızca giriş yapmış kullanıcılar için; misafirde bildirim eskisi gibi
 * yalnızca sekme açıkken gelir. iPhone'da tarayıcıların push desteği ancak
 * site ana ekrana eklenince (iOS 16.4+) açılıyor.
 */
const VAPID_PUBLIC_KEY = 'BFV0nlRX6pHeBDv82KXARCHoJ_8_FV81h4Lp3E9AKZx84qILyP6Z4vzrql4lEK6iMWg3_jpi-rpDFoOk457PNik';

export const pushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const signedIn = () => !!(window as any).Clerk?.session;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

/**
 * Ayarlara göre aboneliği aç, güncelle ya da kapat. Başarılıysa true: o zaman
 * uyarılar sekme kapalıyken de gelir.
 */
export async function syncPush(settings: AlertSettings, language: string): Promise<boolean> {
  if (!pushSupported() || !signedIn()) return false;
  try {
    const wanted = settings.news || settings.session;
    const reg = wanted
      ? await navigator.serviceWorker.register('/sw.js')
      : await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) return false;
    let sub = await reg.pushManager.getSubscription();
    if (!wanted) {
      if (sub) {
        await supabase.rpc('delete_push_subscription', { p_endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      return false;
    }
    if (Notification.permission !== 'granted') return false;
    if (!sub) {
      await navigator.serviceWorker.ready;
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
    }
    const json = sub.toJSON() as { endpoint: string; keys?: { p256dh?: string; auth?: string } };
    if (!json.keys?.p256dh || !json.keys?.auth) return false;
    const { error } = await supabase.rpc('save_push_subscription', {
      p_endpoint: json.endpoint, p_p256dh: json.keys.p256dh, p_auth: json.keys.auth,
      p_settings: settings, p_language: language,
    });
    return !error;
  } catch {
    return false;
  }
}
