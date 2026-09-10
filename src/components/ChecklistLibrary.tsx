import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, Pencil, Check, ClipboardList, Loader } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { ChecklistItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { NamedChecklist, loadChecklists, saveChecklists, newListId, SAMPLE_ITEMS } from '../lib/checklists';

const newItemId = () => `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Checklist kütüphanesi.
 *
 * Listeler burada oluşturulur ve düzenlenir; yeni işlem ekranı yalnızca
 * hangisinin kullanılacağını sorar. Böylece işlem kaydetmek hızlı kalır.
 */
export default function ChecklistLibrary() {
  const { user } = useUser();
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const [lists, setLists] = useState<NamedChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [namingNew, setNamingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (namingNew || renamingId) nameRef.current?.focus(); }, [namingNew, renamingId]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    loadChecklists(user.id).then(l => {
      if (cancelled) return;
      setLists(l);
      setActiveId(l[0]?.id ?? null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  const persist = async (next: NamedChecklist[]) => {
    setLists(next);
    if (user) await saveChecklists(user.id, next);
  };

  const active = lists.find(l => l.id === activeId) || null;

  // Ad parametreyle de gelebilmeli: "örnek maddelerle başla" durumunda
  // state güncellemesi bu çağrının kapanışına yansımaz.
  const addList = async (items: ChecklistItem[] = [], nameArg?: string) => {
    const name = (nameArg ?? newName).trim();
    if (!name) return;
    const list: NamedChecklist = { id: newListId(), name, items };
    setActiveId(list.id);
    setNamingNew(false);
    setNewName('');
    await persist([...lists, list]);
  };

  const removeList = async (id: string) => {
    const list = lists.find(l => l.id === id);
    if (!confirm(tr(`"${list?.name}" listesi silinsin mi?`, `Delete the list "${list?.name}"?`))) return;
    const next = lists.filter(l => l.id !== id);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
    await persist(next);
  };

  const rename = async (id: string) => {
    const name = draftName.trim();
    setRenamingId(null);
    if (!name) return;
    await persist(lists.map(l => (l.id === id ? { ...l, name } : l)));
  };

  const updateItems = async (items: ChecklistItem[]) =>
    persist(lists.map(l => (l.id === activeId ? { ...l, items } : l)));

  const addItem = async () => {
    const title = itemTitle.trim();
    if (!title || !active) return;
    setItemTitle(''); setItemDesc(''); setAddingItem(false);
    await updateItems([...active.items, { id: newItemId(), title, desc: itemDesc.trim() || undefined }]);
  };

  const card: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px',
  };
  const chip: React.CSSProperties = {
    padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.6)',
  };
  const input: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: '10px', padding: '9px 12px', fontSize: '14px', outline: 'none', width: '100%',
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8">
        <Loader className="w-4 h-4 animate-spin" style={{ color: '#8b5cf6' }} />
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr('Yükleniyor…', 'Loading…')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {tr('Farklı stratejiler için ayrı listeler tut. Yeni işlem açarken hangisini kullanacağını seçersin; seçtiğin liste o journal\'da kalır.',
            'Keep a separate list for each strategy. You pick one when logging a trade, and it stays chosen for that journal.')}
      </p>

      {/* ── Listeler ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {lists.map(l => (
          <span key={l.id} className="group flex items-center">
            {renamingId === l.id ? (
              <input ref={nameRef} value={draftName} onChange={e => setDraftName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') rename(l.id); if (e.key === 'Escape') setRenamingId(null); }}
                onBlur={() => rename(l.id)} style={{ ...input, width: '180px', padding: '6px 12px' }} />
            ) : (
              <button onClick={() => setActiveId(l.id)}
                style={l.id === activeId
                  ? { ...chip, background: 'rgba(139,92,246,0.16)', borderColor: 'rgba(139,92,246,0.4)', color: '#fff' }
                  : chip}>
                {l.name}
                <span className="ms-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{l.items.length}</span>
              </button>
            )}
          </span>
        ))}

        {namingNew ? (
          <span className="flex items-center gap-2">
            <input ref={nameRef} value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addList(); }
                if (e.key === 'Escape') { setNamingNew(false); setNewName(''); }
              }}
              placeholder={tr('Liste adı', 'List name')} style={{ ...input, width: '180px', padding: '6px 12px' }} />
            <button onClick={() => addList()} style={{ ...chip, background: '#8b5cf6', borderColor: '#8b5cf6', color: '#fff' }}>
              {tr('Ekle', 'Add')}
            </button>
          </span>
        ) : (
          <button onClick={() => setNamingNew(true)} style={{ ...chip, color: '#a78bfa' }}>
            <Plus className="w-3.5 h-3.5 inline-block -mt-0.5 me-1" />
            {tr('Yeni liste', 'New list')}
          </button>
        )}
      </div>

      {/* ── Seçili listenin maddeleri ── */}
      {!active ? (
        <div style={card} className="p-8 text-center">
          <ClipboardList className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-[14.5px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {tr('Henüz listen yok.', 'You have no lists yet.')}
          </p>
          <button
            onClick={() => addList(language === 'tr' ? SAMPLE_ITEMS.tr : SAMPLE_ITEMS.en, tr('Varsayılan', 'Default'))}
            className="text-sm font-medium" style={{ color: '#a78bfa' }}>
            {tr('Örnek maddelerle başla', 'Start with sample items')}
          </button>
        </div>
      ) : (
        <div style={card} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[15px] font-medium">{active.name}</span>
            <span className="flex items-center gap-3">
              <button onClick={() => { setRenamingId(active.id); setDraftName(active.name); }}
                className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.3)' }} title={tr('Adını değiştir', 'Rename')}>
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => removeList(active.id)}
                className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.3)' }} title={tr('Listeyi sil', 'Delete list')}>
                <X className="w-4 h-4" />
              </button>
            </span>
          </div>

          <ul className="space-y-2.5">
            {active.items.map(item => (
              <li key={item.id} className="group flex items-start gap-3 rounded-xl p-3.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.title}</div>
                  {item.desc && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>{item.desc}</p>}
                </div>
                <button onClick={() => updateItems(active.items.filter(i => i.id !== item.id))}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 flex-shrink-0"
                  style={{ color: '#f87171' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>

          {addingItem ? (
            <div className="mt-3 space-y-2">
              <input autoFocus value={itemTitle} onChange={e => setItemTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') setAddingItem(false); }}
                placeholder={tr('Madde başlığı', 'Item title')} style={input} />
              <input value={itemDesc} onChange={e => setItemDesc(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') setAddingItem(false); }}
                placeholder={tr('Açıklama (isteğe bağlı)', 'Description (optional)')} style={input} />
              <div className="flex gap-2">
                <button onClick={addItem} className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: '#8b5cf6', color: '#fff' }}>
                  <Check className="w-4 h-4 inline-block -mt-0.5 me-1" />{tr('Ekle', 'Add')}
                </button>
                <button onClick={() => setAddingItem(false)} className="px-4 py-2 text-sm"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>{tr('Vazgeç', 'Cancel')}</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingItem(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
              <Plus className="w-4 h-4" />{tr('Madde Ekle', 'Add Item')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
