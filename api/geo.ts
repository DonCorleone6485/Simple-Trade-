/**
 * Ziyaretçinin ülkesi.
 *
 * Vercel her isteğe IP'den çözdüğü ülke kodunu başlık olarak ekler; ayrı bir
 * servise ya da anahtara gerek yok. Yalnızca iki harflik ülke kodunu döneriz —
 * IP adresi ne saklanır ne de geri verilir.
 */
export default function handler(req: any, res: any) {
  const country =
    req.headers['x-vercel-ip-country'] ||
    req.headers['cf-ipcountry'] ||
    '';
  // Ülke isteğin kendisinden gelir; kenarda kısa süre önbelleklenebilir.
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.status(200).json({ country: String(country).toUpperCase() });
}
