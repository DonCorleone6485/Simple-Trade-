import type React from 'react';

/**
 * "Bize yaz" formunu her yerden açmak için (ana sayfa, yardım, uygulama
 * menüsü). Bağlantı `openContact` çağırır, App dinleyip ContactModal'ı
 * gösterir. Form ayrı dosyada ve ancak açılınca yükleniyor; bu dosya küçük
 * kalsın diye ikisi ayrı.
 *
 * Bağlantıların href'i yine mailto: — JavaScript yoksa (ön çizilmiş sayfa,
 * botlar) eski yol çalışsın.
 */
export const CONTACT_EVENT = 'stj:contact';
export const SUPPORT_EMAIL = 'support@simpletradejournal.io';
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

export function openContact(e?: React.MouseEvent) {
  e?.preventDefault();
  window.dispatchEvent(new Event(CONTACT_EVENT));
}
