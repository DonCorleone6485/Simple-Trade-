/**
 * Bir bağlantıdaki resmi alıp yüklenmeye hazır bir dosyaya çevirir.
 *
 * İndirme işini sunucu yapıyor (api/snapshot): tarayıcı başka sitelerden
 * doğrudan resim okuyamaz, CORS buna izin vermez. Sunucudan base64 gelir,
 * burada File'a dönüşür ve elle seçilmiş bir dosyadan ayırt edilemez —
 * böylece yükleme, kota ve silme kuralları tek yoldan geçer.
 *
 * İki yerden çağrılıyor: yeni işlem formu ve işlem düzenleme. Aynı kodu iki
 * kez yazmamak için burada.
 */

export interface LinkPhotoResult {
  file?: File;
  /** Kullanıcıya gösterilecek hata — zaten çevrilmiş hâlde. */
  error?: string;
}

const MESSAGES: Record<string, { tr: string; en: string }> = {
  'not-https': { tr: 'Yalnızca https bağlantısı.', en: 'Only https links.' },
  'bad-url': { tr: 'Bağlantı okunamadı.', en: 'That link could not be read.' },
  'private-address': { tr: 'Bu adres açılamaz.', en: 'That address cannot be opened.' },
  'too-large': { tr: 'Resim çok büyük (en fazla 8 MB).', en: 'Image too large (8 MB max).' },
  'no-image': { tr: 'Bu bağlantıda resim bulunamadı.', en: 'No image found at that link.' },
  'unauthorized': { tr: 'Oturumun düşmüş, sayfayı yenile.', en: 'Your session expired — reload the page.' },
};

const FALLBACK = { tr: 'Resim alınamadı.', en: 'Could not fetch the image.' };

export async function fetchPhotoFromLink(
  url: string,
  getToken: () => Promise<string | null>,
  language: string,
): Promise<LinkPhotoResult> {
  const say = (m: { tr: string; en: string }) => (language === 'tr' ? m.tr : m.en);
  try {
    const token = await getToken();
    const res = await fetch('/api/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: say(MESSAGES[body?.error] || FALLBACK) };

    const bin = atob(body.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const type = body.contentType || 'image/png';
    const ext = type.split('/')[1] || 'png';
    return { file: new File([bytes], `link.${ext}`, { type }) };
  } catch {
    return { error: say(FALLBACK) };
  }
}
