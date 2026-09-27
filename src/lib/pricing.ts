import { useEffect, useState } from 'react';

/**
 * Pro'nun fiyatları — sitenin tek kaynağı.
 *
 * Önce dört ayrı dosyada elle yazılıydı ve biri değişince ötekiler eski
 * rakamda kalıyordu. Ana sayfa, uygulamadaki fiyat sayfası, yükseltme
 * penceresi ve ödeme penceresi buradan okuyor.
 *
 * Türkiye'den gelen ziyaretçi TL fiyatını görür (Netflix/Spotify gibi yerel
 * fiyat, dolar çevirisi değil; KDV dahil). Ülke Vercel'in IP'den çözdüğü
 * koddan geliyor (api/geo); öğrenilemezse dolar gösterilir. TL fiyatları kur
 * ve enflasyon yüzünden altı ayda bir gözden geçirilmeli.
 */
export interface Prices {
  currency: 'USD' | 'TRY';
  monthly: number;
  yearly: number;
  /** Yıllığın aylık karşılığı. */
  yearlyMonthly: number;
  /** Yıllıkta aylığa göre indirim, yüzde. */
  savings: number;
  fmt: (n: number) => string;
}

const TABLE = {
  USD: { monthly: 14.99, yearly: 119 },
  TRY: { monthly: 349, yearly: 2790 },
} as const;

function build(currency: 'USD' | 'TRY'): Prices {
  const { monthly, yearly } = TABLE[currency];
  const nf = currency === 'TRY'
    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2, minimumFractionDigits: 0 })
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 0 });
  return {
    currency,
    monthly,
    yearly,
    yearlyMonthly: Math.round((yearly / 12) * 100) / 100,
    savings: Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100),
    fmt: n => nf.format(n),
  };
}

/** Ülke bir kez soruluyor; bütün bileşenler aynı cevabı bekliyor. */
let countryPromise: Promise<string | null> | null = null;
function country(): Promise<string | null> {
  if (!countryPromise) {
    countryPromise = fetch('/api/geo')
      .then(r => (r.ok ? r.json() : null))
      .then(d => (d && typeof d.country === 'string' ? d.country : null))
      .catch(() => null);
  }
  return countryPromise;
}

export function usePrices(): Prices {
  const [currency, setCurrency] = useState<'USD' | 'TRY'>('USD');
  useEffect(() => {
    let cancelled = false;
    country().then(c => { if (!cancelled && c === 'TR') setCurrency('TRY'); });
    return () => { cancelled = true; };
  }, []);
  return build(currency);
}
