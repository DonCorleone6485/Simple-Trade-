import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, List, TrendingUp, Globe, ChevronDown, Wallet, ChevronLeft, Trash2 } from 'lucide-react';
import TradeForm from './components/TradeForm';
import TradeHistory from './components/TradeHistory';
import { Trade, Account } from './types';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [trades, setTrades] = useState<Trade[]>([]);
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const savedTrades = localStorage.getItem('trades');
    let hasTrades = false;
    if (savedTrades) {
      try {
        const parsedTrades = JSON.parse(savedTrades);
        if (parsedTrades && parsedTrades.length > 0) hasTrades = true;
      } catch (e) {}
    }

    if (!hasTrades) return [];

    const saved = localStorage.getItem('trade_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter((a: Account) => a.id !== 'default' && a.name !== 'X' && a.name !== 'Ana Hesap');
    }
    return [];
  });

  const [historyView, setHistoryView] = useState<'accounts' | 'trades'>('accounts');
  const [selectedHistoryAccountId, setSelectedHistoryAccountId] = useState<string>('');

  const [pendingTrade, setPendingTrade] = useState<Omit<Trade, 'id'> | null>(null);
  const [saveAccountId, setSaveAccountId] = useState<string>('new');
  const [newAccountName, setNewAccountName] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trades');
    if (saved) {
      try {
        setTrades(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse trades from local storage");
      }
    }
  }, []);

  // Save to local storage when trades change
  useEffect(() => {
    try {
      localStorage.setItem('trades', JSON.stringify(trades));
    } catch (e) {
      console.error("Failed to save trades to local storage, might be full due to images.");
    }
  }, [trades]);

  // Save accounts to local storage
  useEffect(() => {
    localStorage.setItem('trade_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const handleTabChange = (tab: 'add' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history') {
      setHistoryView('accounts');
    }
  };

  const handleAddTrade = (trade: Omit<Trade, 'id'>) => {
    setPendingTrade(trade);
    const lastUsed = localStorage.getItem('last_used_account_id');
    if (lastUsed && accounts.some(a => a.id === lastUsed)) {
      setSaveAccountId(lastUsed);
    } else {
      setSaveAccountId(accounts[0]?.id || 'new');
    }
  };

  const confirmSaveTrade = () => {
    if (!pendingTrade) return;
    let finalAccountId = saveAccountId;

    if (saveAccountId === 'new') {
      if (!newAccountName.trim()) return;
      const newAccount = { id: crypto.randomUUID(), name: newAccountName.trim() };
      setAccounts([...accounts, newAccount]);
      finalAccountId = newAccount.id;
      setNewAccountName('');
    }

    localStorage.setItem('last_used_account_id', finalAccountId);

    const newTrade: Trade = { ...pendingTrade, id: crypto.randomUUID(), accountId: finalAccountId };
    setTrades([newTrade, ...trades]);
    setPendingTrade(null);
    setActiveTab('history');
    setHistoryView('trades');
    setSelectedHistoryAccountId(finalAccountId);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(trades.filter(trade => trade.id !== id));
  };

  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;
    
    // Remove account
    const newAccounts = accounts.filter(a => a.id !== accountToDelete);
    setAccounts(newAccounts);
    
    // Remove associated trades
    const newTrades = trades.filter(t => t.accountId !== accountToDelete);
    setTrades(newTrades);
    
    // Clean up local storage if needed
    if (localStorage.getItem('last_used_account_id') === accountToDelete) {
      localStorage.removeItem('last_used_account_id');
    }
    
    setAccountToDelete(null);
  };

  const languages = [
    { code: 'tr', label: 'Türkçe (TR)' },
    { code: 'en', label: 'English (EN)' },
    { code: 'fa', label: 'فارسی (FA)' }
  ];

  const filteredTrades = trades.filter(t => t.accountId === selectedHistoryAccountId);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Delete Account Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-red-600">{t('deleteAccountTitle')}</h3>
            <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
              {t('deleteAccountDesc')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Trade Account Selection Modal */}
      {pendingTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-2">{t('saveTradeTo')}</h3>
            <p className="text-zinc-500 text-sm mb-6">{t('selectAccountToSave')}</p>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {accounts.length > 0 && [...accounts].sort((a, b) => {
                const lastUsed = localStorage.getItem('last_used_account_id');
                if (a.id === lastUsed) return -1;
                if (b.id === lastUsed) return 1;
                return 0;
              }).map(acc => (
                <label key={acc.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${saveAccountId === acc.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                  <input type="radio" name="account" value={acc.id} checked={saveAccountId === acc.id} onChange={() => setSaveAccountId(acc.id)} className="w-4 h-4 text-zinc-900 focus:ring-zinc-900" />
                  <span className="font-medium text-zinc-900">{acc.name}</span>
                </label>
              ))}
              <label className={`flex flex-col gap-3 p-3 rounded-xl border cursor-pointer transition-all ${saveAccountId === 'new' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                {accounts.length > 0 && (
                  <div className="flex items-center gap-3">
                    <input type="radio" name="account" value="new" checked={saveAccountId === 'new'} onChange={() => setSaveAccountId('new')} className="w-4 h-4 text-zinc-900 focus:ring-zinc-900" />
                    <span className="font-medium text-zinc-900">{t('createNewAccount')}</span>
                  </div>
                )}
                {(saveAccountId === 'new' || accounts.length === 0) && (
                  <div className={accounts.length > 0 ? "ps-7 pe-2" : "px-2"}>
                    {accounts.length === 0 && <span className="block font-medium text-zinc-900 mb-2">{t('createNewAccount')}</span>}
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={e => setNewAccountName(e.target.value)}
                      placeholder={t('accountName')}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                )}
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingTrade(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmSaveTrade}
                disabled={saveAccountId === 'new' && !newAccountName.trim()}
                className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-black disabled:opacity-50 transition-all"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900">
            <TrendingUp className="w-5 h-5 hidden sm:block" />
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">{t('appTitle')}</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex gap-1 bg-zinc-100/80 p-1 rounded-lg border border-zinc-200/50">
              <button
                onClick={() => handleTabChange('add')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'add' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('newTradeTab')}</span>
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'history' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{t('historyTab')}</span>
              </button>
            </nav>

            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
                  isLangMenuOpen 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border-transparent hover:border-zinc-200'
                } uppercase`}
                title="Change Language"
              >
                <Globe className="w-4 h-4" />
                {language}
                <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full end-0 mt-2 w-36 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50 py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-start px-4 py-2 text-sm transition-colors ${
                        language === lang.code 
                          ? 'font-semibold text-zinc-900 bg-zinc-50' 
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {activeTab === 'add' ? (
          <TradeForm onSave={handleAddTrade} />
        ) : (
          historyView === 'accounts' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">{t('accounts')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-zinc-200 border-dashed">
                    <p className="text-zinc-500">{t('createNewAccount')}</p>
                  </div>
                )}
                {accounts.map(acc => {
                  const accTrades = trades.filter(t => t.accountId === acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => { setSelectedHistoryAccountId(acc.id); setHistoryView('trades'); }}
                      className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer group relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccountToDelete(acc.id);
                        }}
                        className="absolute top-4 end-4 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title={t('deleteAccountTitle')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-900">{acc.name}</h3>
                          <p className="text-sm text-zinc-500">{accTrades.length} {t('tradeCount')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setHistoryView('accounts')}
                  className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                  {t('backToAccounts')}
                </button>
                <div className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-lg">
                  {accounts.find(a => a.id === selectedHistoryAccountId)?.name || ''}
                </div>
              </div>
              <TradeHistory trades={filteredTrades} onDelete={handleDeleteTrade} />
            </div>
          )
        )}
      </main>
    </div>
  );
}
