import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, Pencil, Check, Square, CheckSquare } from 'lucide-react';
import { ChecklistItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface ChecklistProps {
  value: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  /** Yeni işlemde şablonu kullanıcı hesabından yükler ve değişiklikleri geri yazar. */
  syncTemplate?: boolean;
}

/**
 * Hesabında henüz şablon olmayan kullanıcıya gösterilen örnekler.
 * Silinebilir ve düzenlenebilir — ilk değişiklikte kullanıcının kendi şablonu olur.
 */
const SAMPLE_ITEMS: { tr: ChecklistItem[]; en: ChecklistItem[] } = {
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

const newId = () => `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/** Kayıtlı checklist'in salt-okunur görünümü — işlem detayında kullanılır. */
export function ChecklistView({ items }: { items: ChecklistItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-2.5 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {item.checked
            ? <CheckSquare className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#34d399' }} />
            : <Square className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />}
          <div className="min-w-0">
            <div className="text-sm font-medium" style={{ color: item.checked ? '#fff' : 'rgba(255,255,255,0.55)' }}>
              {item.title}
            </div>
            {item.desc && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Checklist({ value, onChange, syncTemplate = false }: ChecklistProps) {
  const { language } = useLanguage();
  const { user } = useUser();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const items = value || [];
  /**
   * Aynı render turunda arka arkaya iki kutu işaretlenirse `items` henüz
   * tazelenmemiş olur; her değişikliği buradan okuyup buraya yazarak ilk
   * tıklamanın kaybolmasını önlüyoruz.
   */
  const itemsRef = useRef<ChecklistItem[]>(items);
  itemsRef.current = items;

  const commit = (next: ChecklistItem[]) => {
    itemsRef.current = next;
    onChange(next);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  /** Şablon yüklenmeden yapılan yazma, yüklemeyi ezmesin. */
  const templateLoaded = useRef(!syncTemplate);

  useEffect(() => {
    if (adding || editingId) titleRef.current?.focus();
  }, [adding, editingId]);

  // Kullanıcının kayıtlı şablonunu getir; yoksa örneklerle başla.
  useEffect(() => {
    if (!syncTemplate || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('users')
        .select('checklist_template')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const saved = data?.checklist_template as ChecklistItem[] | null | undefined;
      // null = hiç şablon yok (örnekleri göster), [] = kullanıcı hepsini silmiş.
      const base = saved ?? (language === 'tr' ? SAMPLE_ITEMS.tr : SAMPLE_ITEMS.en);
      commit(base.map(i => ({ ...i, checked: false })));
      templateLoaded.current = true;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTemplate, user?.id]);

  /** Madde metinleri değişti — kullanıcının kalıcı şablonuna yaz. */
  const persistTemplate = async (next: ChecklistItem[]) => {
    if (!syncTemplate || !user || !templateLoaded.current) return;
    const template = next.map(({ id, title, desc }) => ({ id, title, desc }));
    await supabase
      .from('users')
      .upsert({ user_id: user.id, checklist_template: template }, { onConflict: 'user_id' });
  };

  const toggle = (id: string) => {
    commit(itemsRef.current.map(i => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const startAdd = () => {
    setAdding(true);
    setEditingId(null);
    setDraftTitle('');
    setDraftDesc('');
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setAdding(false);
    setDraftTitle(item.title);
    setDraftDesc(item.desc || '');
  };

  const cancelDraft = () => {
    setAdding(false);
    setEditingId(null);
    setDraftTitle('');
    setDraftDesc('');
  };

  const saveDraft = () => {
    const title = draftTitle.trim();
    if (!title) return;
    const desc = draftDesc.trim();
    const next = editingId
      ? itemsRef.current.map(i => (i.id === editingId ? { ...i, title, desc } : i))
      : [...itemsRef.current, { id: newId(), title, desc, checked: false }];
    commit(next);
    persistTemplate(next);
    cancelDraft();
  };

  const removeItem = (id: string) => {
    const next = itemsRef.current.filter(i => i.id !== id);
    commit(next);
    persistTemplate(next);
    if (editingId === id) cancelDraft();
  };

  const draftBox = (
    <div className="rounded-xl p-3.5 space-y-2.5"
      style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <input ref={titleRef} type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveDraft(); } if (e.key === 'Escape') cancelDraft(); }}
        placeholder={tr('Madde başlığı — örn: Yapı kırıldı mı?', 'Item title — e.g. Has structure broken?')}
        className="w-full outline-none text-sm"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '8px 12px' }} />
      <textarea value={draftDesc} onChange={e => setDraftDesc(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') cancelDraft(); }}
        placeholder={tr('Açıklama (isteğe bağlı)', 'Description (optional)')}
        className="w-full outline-none text-sm"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '10px 12px', height: '70px', resize: 'vertical' }} />
      <div className="flex items-center gap-2">
        <button type="button" onClick={saveDraft} disabled={!draftTitle.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#8b5cf6', color: '#fff' }}>
          <Check className="w-4 h-4" />
          {tr('Kaydet', 'Save')}
        </button>
        <button type="button" onClick={cancelDraft}
          className="px-4 py-2 rounded-xl text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          {tr('Vazgeç', 'Cancel')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {items.map(item => (
        editingId === item.id ? (
          <div key={item.id}>{draftBox}</div>
        ) : (
          <div key={item.id} className="group flex items-start gap-3 rounded-xl p-3.5 transition-all"
            style={{
              background: item.checked ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.04)',
              border: item.checked ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}>
            <button type="button" onClick={() => toggle(item.id)}
              className="flex-shrink-0 mt-0.5" title={tr('İşaretle', 'Toggle')}>
              {item.checked
                ? <CheckSquare className="w-5 h-5" style={{ color: '#34d399' }} />
                : <Square className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />}
            </button>

            <button type="button" onClick={() => toggle(item.id)} className="flex-1 min-w-0 text-start">
              <div className="text-sm font-medium" style={{ color: item.checked ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                {item.title}
              </div>
              {item.desc && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
              )}
            </button>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => startEdit(item)} title={tr('Düzenle', 'Edit')}
                className="p-1.5 rounded-lg transition-all" style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#a78bfa'; (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => removeItem(item.id)} title={tr('Sil', 'Delete')}
                className="p-1.5 rounded-lg transition-all" style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      ))}

      {adding && draftBox}

      {!adding && !editingId && (
        <button type="button" onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}>
          <Plus className="w-4 h-4" />
          {tr('Madde Ekle', 'Add Item')}
        </button>
      )}

      {syncTemplate && items.length > 0 && (
        <p className="text-xs pt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {tr(
            'Maddeler kaydedilir ve her yeni işlemde işaretsiz olarak karşına gelir.',
            'Items are saved and appear unchecked on every new trade.'
          )}
        </p>
      )}
    </div>
  );
}
