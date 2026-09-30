import { lazy, type ComponentType } from 'react';

/**
 * Yeni sürüm yayınlanınca eski sekmedeki sayfa, silinmiş bir dosyayı
 * (ToolPage-abc123.js gibi) istiyor ve "Failed to fetch dynamically imported
 * module" ile açılamıyordu: kullanıcı hata ekranı görüyordu. Böyle bir dosya
 * yüklenemezse sayfa bir kez yeniden yüklenir (yeni index.html yeni dosya
 * adlarını getirir). Bir dakika içinde ikinci kez olursa döngüye girmesin
 * diye hata olduğu gibi bırakılır; ErrorBoundary devralır.
 */
const KEY = 'chunk-reload-at';

export function shouldReload(storage: Pick<Storage, 'getItem' | 'setItem'> | null, now: number): boolean {
  if (!storage) return false;
  try {
    const last = Number(storage.getItem(KEY) || 0);
    if (now - last < 60_000) return false;
    storage.setItem(KEY, String(now));
    return true;
  } catch {
    return false;
  }
}

export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await load();
    } catch (err) {
      let storage: Storage | null = null;
      try { storage = sessionStorage; } catch { /* yok */ }
      if (shouldReload(storage, Date.now())) {
        location.reload();
        return new Promise<{ default: T }>(() => {}); // yeniden yüklenirken çözülmez
      }
      throw err;
    }
  });
}
