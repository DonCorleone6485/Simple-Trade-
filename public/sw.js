/*
 * Yalnızca bildirimler için servis çalışanı — önbellek YOK.
 *
 * Sayfaları bilerek önbelleğe almıyoruz (eski sürümde takılıp kalma riski);
 * burada fetch dinleyicisi yok. Tek iş: sunucudan (Supabase, push-alerts)
 * gelen haber/seans bildirimini sekme kapalıyken göstermek ve tıklanınca
 * ilgili sayfayı açmak. Kaydı yalnızca kullanıcı bildirimi açınca yapılıyor
 * (src/lib/push.ts).
 */
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { /* boş bildirim */ }
  event.waitUntil(self.registration.showNotification(d.title || 'Simple Trading Journal', {
    body: d.body || '',
    // Sekme açıkken aynı uyarıyı sayfa da gösterir; aynı etiket tek bildirim bırakır.
    tag: d.tag,
    icon: '/apple-touch-icon.png',
    badge: '/favicon-32.png',
    data: { target: d.target },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.target;
  const url = target === 'sessions' ? '/journal/sessions' : '/journal/news';
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (new URL(c.url).origin === self.location.origin && 'focus' in c) {
        if ('navigate' in c) { try { await c.navigate(url); } catch (e) { /* başka sayfadaysa yine odaklan */ } }
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
