/**
 * İşlemleri Excel'in çift tıklamayla doğru açacağı bir CSV olarak indirmek.
 *
 * Excel, CSV'yi bilgisayarın bölge ayarına göre okur: ondalık ayırıcısı
 * virgül olan yerlerde (Türkiye, Almanya, Fransa…) sütun ayırıcısı olarak
 * noktalı virgül bekler; virgülle ayrılmış dosyayı tek sütuna yığar ve 1.5'i
 * tarih sanar. O yüzden ayırıcılar kullanıcının diline göre seçiliyor. Başa
 * eklenen BOM, Türkçe karakterlerin bozulmadan görünmesi için.
 */

export type Cell = string | number | null | undefined;

const LOCALE: Record<string, string> = {
  tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
};

function separators(language: string) {
  let decimal = '.';
  try {
    decimal = new Intl.NumberFormat(LOCALE[language] || 'en-US').formatToParts(1.5)
      .find(p => p.type === 'decimal')?.value || '.';
  } catch { /* varsayılan nokta */ }
  // Farsça ve Arapçada ondalık işareti "٫" çıkıyor; Excel onu sayı saymıyor.
  const comma = decimal === ',';
  return { sep: comma ? ';' : ',', decimal: comma ? ',' : '.' };
}

export function downloadCsv(fileName: string, header: string[], rows: Cell[][], language: string) {
  const { sep, decimal } = separators(language);
  const cell = (v: Cell): string => {
    if (v == null) return '';
    let s = typeof v === 'number'
      ? (isFinite(v) ? String(Math.round(v * 100000) / 100000).replace('.', decimal) : '')
      : String(v);
    if (s.includes(sep) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      s = `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const text = [header, ...rows].map(r => r.map(cell).join(sep)).join('\r\n');
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "2026-09-24 14:05" — Excel bunu tarih olarak tanıyor, saat dilimi kullanıcının. */
export function csvDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Dosya adında sorun çıkaracak karakterleri at. */
export function safeFileName(s: string): string {
  return s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-').slice(0, 60) || 'journal';
}
