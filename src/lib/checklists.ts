import { ChecklistItem } from '../types';
import { supabase } from './supabase';

/**
 * Adlandırılmış checklist.
 *
 * Tek bir şablon, iki farklı strateji işleten birine yetmiyor: maddeleri tek
 * listede birleştirince yarısı her işlemde alakasız kalıyor ve tiklemek
 * anlamsızlaşıyor. Listelere ad verilince hem ayrılıyorlar hem de sonradan
 * "hangi listeyle açtığım işlemler daha iyi gitmiş" diye sorulabiliyor.
 */
export interface NamedChecklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export const newListId = () => `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const SAMPLE_ITEMS: { tr: ChecklistItem[]; en: ChecklistItem[] } = {
  tr: [
    { id: 'sample-1', title: 'Yapı kırıldı mı?', desc: "HTF'de (4H/1H) BOS veya CHoCH oluştu mu — yönüm bu kırılımla aynı mı?" },
    { id: 'sample-2', title: 'Likidite alındı mı?', desc: 'Girmeden önce fiyat bir yüksek/düşük süpürdü mü — ters taraftaki stoplar temizlendi mi?' },
    { id: 'sample-3', title: 'Girişim geçerli bir bölgede mi?', desc: "Order Block veya FVG'ye geri çekilme oldu mu — havada mı giriyorum, yoksa taze bir bölgeden mi?" },
  ],
  en: [
    { id: 'sample-1', title: 'Has structure broken?', desc: 'Did a BOS or CHoCH form on the HTF (4H/1H) — is my direction aligned with that break?' },
    { id: 'sample-2', title: 'Was liquidity taken?', desc: 'Did price sweep a high/low before entry — were the stops on the other side cleared?' },
    { id: 'sample-3', title: 'Is the entry in a valid zone?', desc: 'Was there a retrace into an Order Block or FVG — am I entering mid-air or from a fresh zone?' },
  ],
};

/** Maddeler işleme kaydedilirken işaret taşır; kütüphanede taşımaz. */
export const bare = (items: ChecklistItem[]): ChecklistItem[] =>
  items.map(({ id, title, desc }) => ({ id, title, desc }));

export async function loadChecklists(userId: string): Promise<NamedChecklist[]> {
  const { data } = await supabase
    .from('users').select('checklists, checklist_template').eq('user_id', userId).maybeSingle();

  const lists = data?.checklists as NamedChecklist[] | null | undefined;
  if (Array.isArray(lists) && lists.length > 0) return lists;

  // Adlandırılmış listelere geçmeden önceki tek şablon.
  const legacy = data?.checklist_template as ChecklistItem[] | null | undefined;
  if (Array.isArray(legacy) && legacy.length > 0) {
    return [{ id: 'default', name: 'Varsayılan', items: legacy }];
  }
  return [];
}

export async function saveChecklists(userId: string, lists: NamedChecklist[]) {
  await supabase.from('users').upsert({ user_id: userId, checklists: lists }, { onConflict: 'user_id' });
}
