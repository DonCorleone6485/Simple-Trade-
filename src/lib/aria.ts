/**
 * Yalnızca simgeden oluşan düğmelerin ekran okuyucuya söylediği adlar.
 *
 * "X" simgeli bir düğme ekran okuyucuda yalnızca "düğme" diye okunuyordu;
 * ne yaptığını bilmenin yolu yoktu. Görünen bir yazı eklemek tasarımı
 * değiştirirdi, aria-label değiştirmiyor.
 */
const A = {
  close: { tr: 'Kapat', en: 'Close', fa: 'بستن', ar: 'إغلاق', ru: 'Закрыть', es: 'Cerrar', pt: 'Fechar', de: 'Schließen', fr: 'Fermer' },
  openMenu: { tr: 'Menüyü aç', en: 'Open menu', fa: 'باز کردن منو', ar: 'فتح القائمة', ru: 'Открыть меню', es: 'Abrir menú', pt: 'Abrir menu', de: 'Menü öffnen', fr: 'Ouvrir le menu' },
  prevMonth: { tr: 'Önceki ay', en: 'Previous month', fa: 'ماه قبل', ar: 'الشهر السابق', ru: 'Предыдущий месяц', es: 'Mes anterior', pt: 'Mês anterior', de: 'Vorheriger Monat', fr: 'Mois précédent' },
  nextMonth: { tr: 'Sonraki ay', en: 'Next month', fa: 'ماه بعد', ar: 'الشهر التالي', ru: 'Следующий месяц', es: 'Mes siguiente', pt: 'Mês seguinte', de: 'Nächster Monat', fr: 'Mois suivant' },
  removePhoto: { tr: 'Fotoğrafı kaldır', en: 'Remove photo', fa: 'حذف عکس', ar: 'إزالة الصورة', ru: 'Убрать фото', es: 'Quitar foto', pt: 'Remover foto', de: 'Foto entfernen', fr: 'Retirer la photo' },
  enlargePhoto: { tr: 'Fotoğrafı büyüt', en: 'Enlarge photo', fa: 'بزرگ کردن عکس', ar: 'تكبير الصورة', ru: 'Увеличить фото', es: 'Ampliar foto', pt: 'Ampliar foto', de: 'Foto vergrößern', fr: 'Agrandir la photo' },
  removeItem: { tr: 'Maddeyi sil', en: 'Remove item', fa: 'حذف مورد', ar: 'حذف البند', ru: 'Удалить пункт', es: 'Quitar elemento', pt: 'Remover item', de: 'Eintrag entfernen', fr: 'Supprimer l\'élément' },
  clearSearch: { tr: 'Aramayı temizle', en: 'Clear search', fa: 'پاک کردن جستجو', ar: 'مسح البحث', ru: 'Очистить поиск', es: 'Borrar búsqueda', pt: 'Limpar pesquisa', de: 'Suche leeren', fr: 'Effacer la recherche' },
  deleteTrade: { tr: 'İşlemi sil', en: 'Delete trade', fa: 'حذف معامله', ar: 'حذف الصفقة', ru: 'Удалить сделку', es: 'Eliminar operación', pt: 'Apagar operação', de: 'Trade löschen', fr: 'Supprimer le trade' },
  yearlyBilling: { tr: 'Yıllık ödeme', en: 'Yearly billing', fa: 'پرداخت سالانه', ar: 'الدفع السنوي', ru: 'Оплата за год', es: 'Facturación anual', pt: 'Faturação anual', de: 'Jährliche Zahlung', fr: 'Facturation annuelle' },
} as const;

export type AriaKey = keyof typeof A;

export function aria(key: AriaKey, language: string): string {
  const row = A[key] as Record<string, string>;
  return row[language] || row.en;
}
