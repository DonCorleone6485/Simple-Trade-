import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, Pencil, Check, Square, CheckSquare, RotateCcw } from 'lucide-react';
import { ChecklistItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { NamedChecklist, SAMPLE_ITEMS, bare, loadChecklists, saveChecklists, newListId } from '../lib/checklists';

interface ChecklistProps {
  value: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  /** Yeni işlemde şablonu kullanıcı hesabından yükler ve değişiklikleri geri yazar. */
  syncTemplate?: boolean;
  /** Bu journal'ın en son seçtiği liste. */
  selectedListId?: string | null;
  onSelectList?: (id: string) => void;
}


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

export default function Checklist({ value, onChange, syncTemplate = false, selectedListId, onSelectList }: ChecklistProps) {
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

  // Adlandırılmış listeler. Tek liste varsa seçici hiç görünmez — işlem
  // kaydetmenin hızını bozmamak için.
  const [library, setLibrary] = useState<NamedChecklist[]>([]);
  const [activeId, setActiveId] = useState<string | null>(selectedListId ?? null);
  const [namingNew, setNamingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<NamedChecklist[]>([]);
  libraryRef.current = library;

  useEffect(() => { if (namingNew) nameRef.current?.focus(); }, [namingNew]);

  useEffect(() => {
    if (adding || editingId) titleRef.current?.focus();
  }, [adding, editingId]);

  // Kullanıcının listelerini getir; hiç yoksa örneklerle başla.
  useEffect(() => {
    if (!syncTemplate || !user) return;
    let cancelled = false;
    (async () => {
      const lists = await loadChecklists(user.id);
      if (cancelled) return;

      if (lists.length === 0) {
        // Hiç listesi yok: örnekleri göster, kaydetmeden. İlk düzenlemede
        // kendi listesi olur.
        commit((language === 'tr' ? SAMPLE_ITEMS.tr : SAMPLE_ITEMS.en).map(i => ({ ...i, checked: false })));
        templateLoaded.current = true;
        return;
      }

      const chosen = lists.find(l => l.id === selectedListId) || lists[0];
      setLibrary(lists);
      setActiveId(chosen.id);
      commit(chosen.items.map(i => ({ ...i, checked: false })));
      templateLoaded.current = true;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTemplate, user?.id]);

  /** Madde metinleri değişti — açık olan listeye yaz. */
  const persistTemplate = async (next: ChecklistItem[]) => {
    if (!syncTemplate || !user || !templateLoaded.current) return;
    const items = bare(next);
    const lists = libraryRef.current;

    // Henüz listesi olmayan kullanıcı ilk kez düzenledi: listesi burada doğar.
    if (lists.length === 0) {
      const first: NamedChecklist = { id: newListId(), name: tr('Varsayılan', 'Default'), items };
      setLibrary([first]);
      setActiveId(first.id);
      onSelectList?.(first.id);
      await saveChecklists(user.id, [first]);
      return;
    }

    const next2 = lists.map(l => (l.id === activeId ? { ...l, items } : l));
    setLibrary(next2);
    await saveChecklists(user.id, next2);
  };

  const selectList = (id: string) => {
    const list = libraryRef.current.find(l => l.id === id);
    if (!list) return;
    setActiveId(id);
    onSelectList?.(id);
    commit(list.items.map(i => ({ ...i, checked: false })));
  };

  const createList = async () => {
    const name = newName.trim();
    if (!name || !user) return;
    const list: NamedChecklist = { id: newListId(), name, items: [] };
    const next = [...libraryRef.current, list];
    setLibrary(next);
    setActiveId(list.id);
    onSelectList?.(list.id);
    commit([]);
    setNamingNew(false);
    setNewName('');
    await saveChecklists(user.id, next);
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

  const loadSamples = () => {
    const samples = (language === 'tr' ? SAMPLE_ITEMS.tr : SAMPLE_ITEMS.en).map(i => ({ ...i, checked: false }));
    commit(samples);
    persistTemplate(samples);
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

  const chip: React.CSSProperties = {
    padding: '5px 12px', borderRadius: '999px', fontSize: '12.5px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.55)', transition: 'all 150ms',
  };

  return (
    <div className="space-y-2.5">
      {/* Liste seçici. Tek liste varsa görünmez — o zaman seçilecek bir şey
          yok ve yeni işlem ekranına gereksiz bir adım eklemiş oluruz. */}
      {syncTemplate && (library.length > 1 || namingNew) && (
        <div className="flex items-center gap-2 flex-wrap pb-1">
          {library.map(l => (
            <button key={l.id} type="button" onClick={() => selectList(l.id)}
              style={l.id === activeId
                ? { ...chip, background: 'rgba(139,92,246,0.16)', borderColor: 'rgba(139,92,246,0.4)', color: '#fff' }
                : chip}>
              {l.name}
            </button>
          ))}
          {namingNew ? (
            <span className="flex items-center gap-2">
              <input ref={nameRef} value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); createList(); }
                  if (e.key === 'Escape') { setNamingNew(false); setNewName(''); }
                }}
                placeholder={tr('Liste adı', 'List name')}
                className="outline-none text-[12.5px]"
                style={{ ...chip, color: '#fff', width: '150px' }} />
              <button type="button" onClick={createList}
                style={{ ...chip, background: '#8b5cf6', borderColor: '#8b5cf6', color: '#fff' }}>
                {tr('Ekle', 'Add')}
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setNamingNew(true)} style={{ ...chip, color: '#a78bfa' }}>
              + {tr('Yeni liste', 'New list')}
            </button>
          )}
        </div>
      )}

      {/* Tek listesi olan için sessiz bir giriş: yeni liste açmak isterse. */}
      {syncTemplate && library.length <= 1 && !namingNew && (
        <button type="button" onClick={() => setNamingNew(true)}
          className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          + {tr('Yeni liste', 'New list')}
        </button>
      )}

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
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}>
            <Plus className="w-4 h-4" />
            {tr('Madde Ekle', 'Add Item')}
          </button>

          {/* Maddelerin hepsi silinmişse örneklere dönüş yolu açık kalsın. */}
          {items.length === 0 && (
            <button type="button" onClick={loadSamples}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}>
              <RotateCcw className="w-4 h-4" />
              {tr('Örnek maddeleri yükle', 'Load sample items')}
            </button>
          )}
        </div>
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
