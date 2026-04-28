import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle, List, Globe, ChevronDown, ChevronLeft,
  Trash2, BookOpen, Clock, TrendingUp
} from 'lucide-react';
import TradeForm from './components/TradeForm';
import TradeHistory from './components/TradeHistory';
import { Trade, Account } from './types';
import { useLanguage } from './context/LanguageContext';

type View = 'dashboard' | 'journal';
type JournalTab = 'add' | 'history';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [view, setView] = useState<View>('dashboard');
  const [journalTab, setJournalTab] = useState<JournalTab>('add');
  const [activeJournal, setActiveJournal] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalStartDate, setNewJournalStartDate] = useState('');
  const [newJournalCapital, setNewJournalCapital] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  useEffect(() => {
    const savedTrades = localStorage.getItem('trades');
    if (savedTrades) { try { setTrades(JSON.parse(savedTrades)); } catch (e) {} }
    const savedAccounts = localStorage.getItem('trade_accounts');
    if (savedAccounts) {
      try {
        const parsed = JSON.parse(savedAccounts);
        const filtered = parsed.filter((a: Account) => a.id !== 'default' && a.name !== 'X' && a.name !== 'Ana Hesap');
        setAccounts(filtered);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('trades', JSON.stringify(trades)); } catch (e) {}
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('trade_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createJournal = () => {
    if (!newJournalName.trim() || !newJournalStartDate || !newJournalCapital) return;
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: newJournalName.trim(),
      startDate: newJournalStartDate,
      startingCapital: parseFloat(newJournalCapital),
    };
    setAccounts(prev => [...prev, newAccount]);
    setActiveJournal(newAccount);
    setShowNewJournalModal(false);
    setNewJournalName('');
    setNewJournalStartDate('');
    setNewJournalCapital('');
    setView('journal');
    setJournalTab('add');
  };

  const handleAddTrade = (trade: Trade) => {
    if (!activeJournal) return;
    const finalTrade: Trade = {
      ...trade,
      id: crypto.randomUUID(),
      accountId: activeJournal.id,
    };
    setTrades(prev => [finalTrade, ...prev]);
    setJournalTab('history');
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;
    setAccounts(prev => prev.filter(a => a.id !== accountToDelete));
    setTrades(prev => prev.filter(t => t.accountId !== accountToDelete));
    setAccountToDelete(null);
  };

  const openJournal = (account: Account) => {
    setActiveJournal(account);
    setView('journal');
    setJournalTab('history');
  };

  const filteredTrades = activeJournal
    ? trades.filter(t => t.accountId === activeJournal.id)
    : [];

  const getJournalStats = (accountId: string) => {
    const jTrades = trades.filter(t => t.accountId === accountId);
    const wins = jTrades.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda');
    const losses = jTrades.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda');
    const winRate = jTrades.length > 0 ? ((wins.length / jTrades.length) * 100).toFixed(0) : '0';
    const grossProfit = wins.reduce((sum, t) => sum + (t.reward || 0), 0);
    const grossLoss = losses.reduce((sum, t) => sum + (t.risk || 0), 0);
    const netPnL = grossProfit - grossLoss;
    return { total: jTrades.length, winRate, netPnL };
  };

  const languages = [
    { code: 'tr', label: 'Türkçe (TR)' },
    { code: 'en', label: 'English (EN)' },
    { code: 'fa', label: 'فارسی (FA)' },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (language === 'tr') return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(d);
    if (language === 'fa') return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(d);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d);
  };

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen font-sans" style={{ background: '#0d0e1a', color: '#fff' }} dir={language === 'fa' ? 'rtl' : 'ltr'}>

        {/* Silme Onay Modalı */}
        {accountToDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#f87171' }}>{t('deleteAccountTitle')}</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('deleteAccountDesc')}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAccountToDelete(null)} className="px-4 py-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('cancel')}</button>
                <button onClick={confirmDeleteAccount} className="px-4 py-2 text-sm font-medium rounded-xl" style={{ background: '#dc2626', color: '#fff' }}>{t('delete')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Yeni Journal Modalı */}
        {showNewJournalModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-semibold mb-1">{t('newJournal')}</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('newJournalDesc')}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('journalName')}</label>
                  <input
                    type="text"
                    value={newJournalName}
                    onChange={e => setNewJournalName(e.target.value)}
                    placeholder={t('journalNamePlaceholder')}
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('startDate')}</label>
                  <input
                    type="date"
                    value={newJournalStartDate}
                    onChange={e => setNewJournalStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('startingCapital')}</label>
                  <div className="relative">
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newJournalCapital}
                      onChange={e => setNewJournalCapital(e.target.value)}
                      placeholder="10000"
                      className="w-full ps-8 pe-3 py-2.5 rounded-xl text-sm outline-none font-mono"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowNewJournalModal(false); setNewJournalName(''); setNewJournalStartDate(''); setNewJournalCapital(''); }}
                  className="px-4 py-2 text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={createJournal}
                  disabled={!newJournalName.trim() || !newJournalStartDate || !newJournalCapital}
                  className="px-6 py-2 text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#eab308', color: '#000' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0d0e1a' }} className="sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#eab308' }} />
              <span className="font-bold tracking-tight">Trade Journal</span>
            </div>
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium uppercase"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <Globe className="w-4 h-4" />
                {language}
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangMenuOpen && (
                <div className="absolute top-full end-0 mt-2 w-40 rounded-xl shadow-xl overflow-hidden z-50 py-1" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as any); setIsLangMenuOpen(false); }}
                      className="w-full text-start px-4 py-2 text-sm"
                      style={{ color: language === lang.code ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: language === lang.code ? 600 : 400 }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-8">{t('dashboardTitle')}</h1>

          {/* Yeni Journal Butonu */}
          <div className="mb-10">
            <button
              onClick={() => setShowNewJournalModal(true)}
              className="flex items-center gap-4 rounded-2xl px-6 py-5 transition-all"
              style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(234,179,8,0.13)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(234,179,8,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(234,179,8,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(234,179,8,0.25)'; }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.15)' }}>
                <PlusCircle className="w-5 h-5" style={{ color: '#eab308' }} />
              </div>
              <div className="text-start">
                <div className="font-semibold">{t('newJournal')}</div>
                <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('newJournalSubtitle')}</div>
              </div>
            </button>
          </div>

          {/* Journal Listesi */}
          {accounts.length > 0 ? (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('myJournals')}
              </h2>
              <div className="space-y-3">
                {[...accounts].reverse().map(acc => {
                  const stats = getJournalStats(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => openJournal(acc)}
                      className="flex items-center gap-6 rounded-2xl px-6 py-5 cursor-pointer transition-all group"
                      style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1f2035'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1a1b2e'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <BookOpen className="w-5 h-5" style={{ color: '#818cf8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{acc.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(acc.startDate)}</span>
                          {acc.startingCapital && (
                            <><span>·</span><span>${acc.startingCapital.toLocaleString()}</span></>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-8 text-sm flex-shrink-0">
                        <div className="text-center hidden sm:block">
                          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('tradeCount')}</div>
                          <div className="font-semibold font-mono">{stats.total}</div>
                        </div>
                        <div className="text-center hidden sm:block">
                          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('winRate')}</div>
                          <div className="font-semibold font-mono">%{stats.winRate}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('netProfit')}</div>
                          <div className="font-semibold font-mono" style={{ color: stats.netPnL >= 0 ? '#34d399' : '#f87171' }}>
                            {stats.netPnL >= 0 ? '+' : '-'}${Math.abs(stats.netPnL).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setAccountToDelete(acc.id); }}
                        className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ms-2 flex-shrink-0"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl" style={{ background: '#1a1b2e', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
              <p style={{ color: 'rgba(255,255,255,0.35)' }}>{t('noJournals')}</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── JOURNAL VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans" style={{ background: '#0d0e1a', color: '#fff' }} dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <header style={{ background: '#0d0e1a', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{t('backToDashboard')}</span>
            </button>
            <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-none">
              {activeJournal?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setJournalTab('add')}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all"
                style={journalTab === 'add'
                  ? { background: 'rgba(255,255,255,0.1)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('newTradeTab')}</span>
              </button>
              <button
                onClick={() => setJournalTab('history')}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all"
                style={journalTab === 'history'
                  ? { background: 'rgba(255,255,255,0.1)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{t('historyTab')}</span>
              </button>
            </nav>

            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium uppercase transition-all"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <Globe className="w-4 h-4" />
                {language}
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangMenuOpen && (
                <div className="absolute top-full end-0 mt-2 w-40 rounded-xl shadow-xl overflow-hidden z-50 py-1" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as any); setIsLangMenuOpen(false); }}
                      className="w-full text-start px-4 py-2 text-sm"
                      style={{ color: language === lang.code ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: language === lang.code ? 600 : 400 }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {journalTab === 'add' ? (
          <TradeForm onSave={handleAddTrade} />
        ) : (
          <TradeHistory trades={filteredTrades} onDelete={handleDeleteTrade} />
        )}
      </main>
    </div>
  );
}
