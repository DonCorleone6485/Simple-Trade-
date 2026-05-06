import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle, Globe, ChevronDown, ChevronLeft,
  Trash2, BookOpen, Clock, TrendingUp, X,
  Target, DollarSign, Activity, PieChart,
  CalendarDays, BarChart2, List, LogOut, User,
  Upload
} from 'lucide-react';
import {
  SignIn, SignUp, useUser, useClerk, SignedIn, SignedOut
} from '@clerk/clerk-react';
import TradeForm from './components/TradeForm';
import TradeHistory from './components/TradeHistory';
import CalendarView from './components/CalendarView';
import GoalsView from './components/GoalsView';
import PricingPage from './components/PricingPage';
import CSVImport from './components/CSVImport';
import { Trade, Account, JournalGoals } from './types';
import { useLanguage } from './context/LanguageContext';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'expanded' | 'pricing';
type JournalTab = 'trades' | 'calendar' | 'stats' | 'goals';
type AuthView = 'signin' | 'signup';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [view, setView] = useState<View>('dashboard');
  const [journalTab, setJournalTab] = useState<JournalTab>('trades');
  const [activeJournal, setActiveJournal] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signin');
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalStartDate, setNewJournalStartDate] = useState('');
  const [newJournalCapital, setNewJournalCapital] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [referralCode, setReferralCode] = useState('');
const [referralInput, setReferralInput] = useState('');
const [referralMsg, setReferralMsg] = useState('');
const [showReferral, setShowReferral] = useState(false);

  const isRTL = language === 'fa' || language === 'ar';

  useEffect(() => {
  if (user) {
    loadJournals();
    loadTrades();
    checkProStatus();
    generateReferralCode();
  }
}, [user]);

  const checkProStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .select('is_pro')
      .eq('user_id', user.id)
      .single();
    if (data) setIsPro(data.is_pro);
  };
  const generateReferralCode = async () => {
  if (!user) return;
  const res = await fetch('/api/referral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate', userId: user.id }),
  });
  const data = await res.json();
  if (data.code) setReferralCode(data.code);
};

const useReferralCode = async () => {
  if (!user || !referralInput.trim()) return;
  const res = await fetch('/api/referral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'use', userId: user.id, code: referralInput.trim() }),
  });
  const data = await res.json();
  if (data.success) {
    setReferralMsg('🎉 1 ay ücretsiz Pro kazandınız!');
    setIsPro(true);
  } else {
    setReferralMsg(data.error || 'Hata oluştu');
  }
};

  const loadJournals = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) {
      setAccounts(data.map((j: any) => ({
        id: j.id,
        user_id: j.user_id,
        name: j.name,
        startDate: j.start_date,
        startingCapital: j.starting_capital,
        goals: j.goals,
      })));
    }
    setLoading(false);
  };

  const loadTrades = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (data) {
      setTrades(data.map((t: any) => ({
        id: t.id,
        accountId: t.journal_id,
        journal_id: t.journal_id,
        user_id: t.user_id,
        date: t.date,
        symbol: t.symbol,
        type: t.type,
        timeframe: t.timeframe,
        setup: t.setup,
        risk: t.risk,
        reward: t.reward,
        rr: t.rr,
        result: t.result,
        preTradeNotes: t.pre_trade_notes || '',
        postTradeNotes: t.post_trade_notes || '',
        preTradePhotos: t.pre_trade_photos || [],
        postTradePhotos: t.post_trade_photos || [],
      })));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createJournal = async () => {
    if (!newJournalName.trim() || !newJournalStartDate || !newJournalCapital || !user) return;
    const { data } = await supabase
      .from('journals')
      .insert({
        user_id: user.id,
        name: newJournalName.trim(),
        start_date: newJournalStartDate,
        starting_capital: parseFloat(newJournalCapital),
      })
      .select()
      .single();
    if (data) {
      const newAccount: Account = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        startDate: data.start_date,
        startingCapital: data.starting_capital,
      };
      setAccounts(prev => [...prev, newAccount]);
      setActiveJournal(newAccount);
      setShowNewJournalModal(false);
      setNewJournalName(''); setNewJournalStartDate(''); setNewJournalCapital('');
      setView('expanded');
      // ✅ setShowTradeModal(true) kaldırıldı — artık otomatik açılmıyor
    }
  };

  const handleAddTrade = async (trade: Trade) => {
    if (!activeJournal || !user) return;
    if (!isPro && trades.filter(t => t.user_id === user.id).length >= 20) {
      setShowTradeModal(false);
      setView('pricing');
      return;
    }
    const { data } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        journal_id: activeJournal.id,
        date: trade.date,
        symbol: trade.symbol,
        type: trade.type,
        timeframe: trade.timeframe,
        setup: trade.setup,
        risk: trade.risk,
        reward: trade.reward,
        rr: trade.rr,
        result: trade.result,
        pre_trade_notes: trade.preTradeNotes,
        post_trade_notes: trade.postTradeNotes,
        pre_trade_photos: trade.preTradePhotos,
        post_trade_photos: trade.postTradePhotos,
      })
      .select()
      .single();
    if (data) {
      const newTrade: Trade = {
        id: data.id,
        accountId: data.journal_id,
        journal_id: data.journal_id,
        user_id: data.user_id,
        date: data.date,
        symbol: data.symbol,
        type: data.type,
        timeframe: data.timeframe,
        setup: data.setup,
        risk: data.risk,
        reward: data.reward,
        rr: data.rr,
        result: data.result,
        preTradeNotes: data.pre_trade_notes || '',
        postTradeNotes: data.post_trade_notes || '',
        preTradePhotos: data.pre_trade_photos || [],
        postTradePhotos: data.post_trade_photos || [],
      };
      setTrades(prev => [newTrade, ...prev]);
      setShowTradeModal(false);
    }
  };
  const handleUpdateTrade = async (trade: Trade) => {
  await supabase.from('trades').update({
    symbol: trade.symbol,
    type: trade.type,
    timeframe: trade.timeframe,
    setup: trade.setup,
    risk: trade.risk,
    reward: trade.reward,
    rr: trade.rr,
    result: trade.result,
    pre_trade_notes: trade.preTradeNotes,
    post_trade_notes: trade.postTradeNotes,
  }).eq('id', trade.id);
  setTrades(prev => prev.map(t => t.id === trade.id ? trade : t));
};

const handleDeleteMultiple = async (ids: string[]) => {
  await supabase.from('trades').delete().in('id', ids);
  setTrades(prev => prev.filter(t => !ids.includes(t.id)));
};

  const handleCSVImport = async (importedTrades: Trade[]) => {
    if (!activeJournal || !user) return;
    if (!isPro) {
      const currentCount = trades.filter(t => t.user_id === user.id).length;
      const remaining = 20 - currentCount;
      if (remaining <= 0) { setView('pricing'); return; }
      importedTrades = importedTrades.slice(0, remaining);
    }
    const inserted: Trade[] = [];
    for (const trade of importedTrades) {
      const { data } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          journal_id: activeJournal.id,
          date: trade.date,
          symbol: trade.symbol,
          type: trade.type,
          timeframe: trade.timeframe || '',
          setup: trade.setup || '',
          risk: trade.risk || 0,
          reward: trade.reward || 0,
          rr: trade.rr || '',
          result: trade.result,
          pre_trade_notes: trade.preTradeNotes || '',
          post_trade_notes: trade.postTradeNotes || '',
          pre_trade_photos: [],
          post_trade_photos: [],
        })
        .select()
        .single();
      if (data) {
        inserted.push({
          id: data.id,
          accountId: data.journal_id,
          journal_id: data.journal_id,
          user_id: data.user_id,
          date: data.date,
          symbol: data.symbol,
          type: data.type,
          timeframe: data.timeframe,
          setup: data.setup,
          risk: data.risk,
          reward: data.reward,
          rr: data.rr,
          result: data.result,
          preTradeNotes: data.pre_trade_notes || '',
          postTradeNotes: data.post_trade_notes || '',
          preTradePhotos: [],
          postTradePhotos: [],
        });
      }
    }
    setTrades(prev => [...inserted, ...prev]);
  };

  const handleDeleteTrade = async (id: string) => {
    await supabase.from('trades').delete().eq('id', id);
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    await supabase.from('journals').delete().eq('id', accountToDelete);
    setAccounts(prev => prev.filter(a => a.id !== accountToDelete));
    setTrades(prev => prev.filter(t => t.accountId !== accountToDelete));
    if (activeJournal?.id === accountToDelete) { setView('dashboard'); setActiveJournal(null); }
    setAccountToDelete(null);
  };

  const openJournal = (account: Account) => {
    setActiveJournal(account);
    setView('expanded');
    setJournalTab('trades');
  };

  const handleUpdateGoals = async (goals: JournalGoals) => {
    if (!activeJournal) return;
    await supabase.from('journals').update({ goals }).eq('id', activeJournal.id);
    setAccounts(prev => prev.map(a => a.id === activeJournal.id ? { ...a, goals } : a));
    setActiveJournal(prev => prev ? { ...prev, goals } : prev);
  };

  const filteredTrades = activeJournal ? trades.filter(t => t.accountId === activeJournal.id) : [];

  const getJournalStats = (accountId: string) => {
    const jt = trades.filter(t => t.accountId === accountId);
    const wins = jt.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda');
    const losses = jt.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda');
    const winRate = jt.length > 0 ? ((wins.length / jt.length) * 100).toFixed(0) : '0';
    const grossProfit = wins.reduce((s, t) => s + (t.reward || 0), 0);
    const grossLoss = losses.reduce((s, t) => s + (t.risk || 0), 0);
    const netPnL = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';
    return { total: jt.length, winRate, netPnL, profitFactor };
  };

  const languages = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
    { code: 'fa', label: 'فارسی' },
    { code: 'ar', label: 'العربية' },
    { code: 'ru', label: 'Русский' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (language === 'tr') return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(d);
    if (language === 'fa') return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(d);
    if (language === 'ar') return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(d);
    if (language === 'ru') return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(d);
    if (language === 'es') return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(d);
    if (language === 'pt') return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(d);
    if (language === 'de') return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(d);
    if (language === 'fr') return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d);
  };

  const activeStats = activeJournal ? getJournalStats(activeJournal.id) : null;

  const tabs = [
    { key: 'trades', label: t('historyTab'), icon: <List className="w-4 h-4" /> },
    { key: 'calendar', label: t('calendarTab'), icon: <CalendarDays className="w-4 h-4" /> },
    { key: 'stats', label: t('statsTab'), icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'goals', label: t('goalsTab'), icon: <Target className="w-4 h-4" /> },
  ];

  const signInLabel = language === 'tr' ? 'Giriş Yap' : language === 'fa' ? 'ورود' : language === 'ar' ? 'تسجيل الدخول' : language === 'ru' ? 'Войти' : language === 'es' ? 'Iniciar sesión' : language === 'pt' ? 'Entrar' : language === 'de' ? 'Anmelden' : language === 'fr' ? 'Se connecter' : 'Sign In';
  const signUpLabel = language === 'tr' ? 'Kayıt Ol' : language === 'fa' ? 'ثبت نام' : language === 'ar' ? 'إنشاء حساب' : language === 'ru' ? 'Регистрация' : language === 'es' ? 'Registrarse' : language === 'pt' ? 'Cadastrar' : language === 'de' ? 'Registrieren' : language === 'fr' ? "S'inscrire" : 'Sign Up';
  const pricingLabel = language === 'tr' ? 'Fiyatlar' : language === 'fa' ? 'قیمت‌ها' : language === 'ar' ? 'الأسعار' : language === 'ru' ? 'Цены' : language === 'es' ? 'Precios' : language === 'pt' ? 'Preços' : language === 'de' ? 'Preise' : language === 'fr' ? 'Tarifs' : 'Pricing';
  const importLabel = language === 'tr' ? 'CSV İçe Aktar' : language === 'fa' ? 'وارد کردن CSV' : language === 'ar' ? 'استيراد CSV' : language === 'ru' ? 'Импорт CSV' : language === 'es' ? 'Importar CSV' : language === 'pt' ? 'Importar CSV' : language === 'de' ? 'CSV Importieren' : language === 'fr' ? 'Importer CSV' : 'Import CSV';

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0d0e1a', color: '#fff' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* CSV Import Modal */}
      {showCSVImport && activeJournal && user && (
        <CSVImport
          onImport={handleCSVImport}
          onClose={() => setShowCSVImport(false)}
          journalId={activeJournal.id}
          userId={user.id}
        />
      )}

      {/* AUTH EKRANI */}
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0d0e1a' }}>
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6" style={{ color: '#8b5cf6' }} />
            <span className="text-xl font-bold">Trade Journal</span>
          </div>
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button onClick={() => setAuthView('signin')} className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
              style={authView === 'signin' ? { background: '#8b5cf6', color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }}>
              {signInLabel}
            </button>
            <button onClick={() => setAuthView('signup')} className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
              style={authView === 'signup' ? { background: '#8b5cf6', color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }}>
              {signUpLabel}
            </button>
          </div>
          {authView === 'signin' ? <SignIn routing="hash" /> : <SignUp routing="hash" />}
        </div>
      </SignedOut>

      {/* ANA UYGULAMA */}
      <SignedIn>

        {/* Delete Modal */}
        {accountToDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#f87171' }}>{t('deleteAccountTitle')}</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('deleteAccountDesc')}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAccountToDelete(null)} className="px-4 py-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('cancel')}</button>
                <button onClick={confirmDeleteAccount} className="px-4 py-2 text-sm font-medium rounded-xl" style={{ background: '#dc2626', color: '#fff' }}>{t('delete')}</button>
              </div>
            </div>
          </div>
        )}

        {/* New Journal Modal */}
        {showNewJournalModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-semibold mb-1">{t('newJournal')}</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('newJournalDesc')}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('journalName')}</label>
                  <input type="text" value={newJournalName} onChange={e => setNewJournalName(e.target.value)} placeholder={t('journalNamePlaceholder')} autoFocus
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('startDate')}</label>
                  <input type="date" value={newJournalStartDate} onChange={e => setNewJournalStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('startingCapital')}</label>
                  <div className="relative">
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                    <input type="number" min="0" step="0.01" value={newJournalCapital} onChange={e => setNewJournalCapital(e.target.value)} placeholder="10000"
                      className="w-full ps-8 pe-3 py-2.5 rounded-xl text-sm outline-none font-mono"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowNewJournalModal(false); setNewJournalName(''); setNewJournalStartDate(''); setNewJournalCapital(''); }}
                  className="px-4 py-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('cancel')}</button>
                <button onClick={createJournal} disabled={!newJournalName.trim() || !newJournalStartDate || !newJournalCapital}
                  className="px-6 py-2 text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#8b5cf6', color: '#fff' }}>OK</button>
              </div>
            </div>
          </div>
        )}

        {/* Trade Form Modal */}
        {showTradeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-4xl my-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-white">{activeJournal?.name}</span>
                <button onClick={() => setShowTradeModal(false)} className="p-2 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <TradeForm onSave={handleAddTrade} />
            </div>
          </div>
        )}

        {/* Header */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0d0e1a' }} className="sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {view === 'expanded' ? (
                <>
                 <button onClick={() => { setView('dashboard'); setActiveJournal(null); }}
  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
  style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
  <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
  <span className="hidden sm:inline">{t('myJournals')}</span>
</button>
                  <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <span className="font-semibold text-white truncate max-w-[150px] sm:max-w-none">{activeJournal?.name}</span>
                </>
              ) : (
                <button onClick={() => setView('dashboard')} className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                  <span className="font-bold tracking-tight">Trade Journal</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Journal içindeyken CSV + Yeni İşlem butonları */}
              {view === 'expanded' && (
                <>
                  <button onClick={() => setShowCSVImport(true)}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
                    <Upload className="w-4 h-4" />
                    <span className="hidden md:inline">{importLabel}</span>
                  </button>
                  <button onClick={() => setShowTradeModal(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: '#8b5cf6', color: '#fff' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('newTradeTab')}</span>
                  </button>
                </>
              )}

              <button onClick={() => setView('pricing')}
                className="hidden sm:block px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ color: view === 'pricing' ? '#a78bfa' : 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = view === 'pricing' ? '#a78bfa' : 'rgba(255,255,255,0.5)'; }}>
                {pricingLabel}
              </button>

              {isPro && (
                <span className="hidden sm:block px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                  PRO
                </span>
              )}

              <div className="relative" ref={langMenuRef}>
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase">{language}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangMenuOpen && (
                  <div className="absolute top-full end-0 mt-2 w-44 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                    style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {languages.map(lang => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code as any); setIsLangMenuOpen(false); }}
                        className="w-full text-start px-4 py-2 text-sm transition-colors"
                        style={{ color: language === lang.code ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: language === lang.code ? 600 : 400 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden" style={{ background: 'rgba(139,92,246,0.2)' }}>
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                    </div>
                  )}
                </div>
                <button onClick={() => signOut()} className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
                  title="Çıkış Yap">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }} />
          </div>
        )}

        {!loading && view === 'pricing' && <PricingPage />}

        {/* DASHBOARD */}
        {!loading && view === 'dashboard' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold">{t('dashboardTitle')}</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="mb-8 sm:mb-10">
              <button onClick={() => setShowNewJournalModal(true)}
                className="w-full sm:w-auto flex items-center gap-4 rounded-2xl px-6 py-5 transition-all"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.13)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.25)'; }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <PlusCircle className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                </div>
                <div className="text-start">
                  <div className="font-semibold">{t('newJournal')}</div>
                  <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('newJournalSubtitle')}</div>
                </div>
              </button>
            </div>

            {accounts.length > 0 ? (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('myJournals')}</h2>
                <div className="space-y-3">
                  {[...accounts].reverse().map(acc => {
                    const stats = getJournalStats(acc.id);
                    return (
                      <div key={acc.id} onClick={() => openJournal(acc)}
                        className="flex items-center gap-4 sm:gap-6 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 cursor-pointer transition-all group"
                        style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1f2035'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1a1b2e'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.1)' }}>
                          <BookOpen className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{acc.name}</div>
                          <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{formatDate(acc.startDate)}</span>
                            {acc.startingCapital && <><span>·</span><span>${acc.startingCapital.toLocaleString()}</span></>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-8 text-sm flex-shrink-0">
                          <div className="text-center hidden md:block">
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
                        <button onClick={e => { e.stopPropagation(); setAccountToDelete(acc.id); }}
                          className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                          style={{ color: 'rgba(255,255,255,0.25)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
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
        )}

        {/* EXPANDED VIEW */}
        {!loading && view === 'expanded' && activeJournal && activeStats && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{activeJournal.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm flex-wrap" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {activeJournal.startDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(activeJournal.startDate)}
                  </span>
                )}
                {activeJournal.startingCapital && <><span>·</span><span>${activeJournal.startingCapital.toLocaleString()}</span></>}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { icon: <Activity className="w-4 h-4" />, label: t('totalTrades'), value: String(activeStats.total), color: '#fff' },
                { icon: <PieChart className="w-4 h-4" />, label: t('winRate'), value: `%${activeStats.winRate}`, color: '#fff' },
                { icon: <DollarSign className="w-4 h-4" />, label: t('netProfit'), value: `${activeStats.netPnL >= 0 ? '+' : '-'}$${Math.abs(activeStats.netPnL).toFixed(2)}`, color: activeStats.netPnL >= 0 ? '#34d399' : '#f87171' },
                { icon: <TrendingUp className="w-4 h-4" />, label: t('profitFactor'), value: activeStats.profitFactor, color: '#fff' },
              ].map((s, i) => (
                <div key={i} className="p-3 sm:p-4 rounded-xl" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {s.icon}
                    <span className="text-xs font-medium uppercase tracking-wider truncate">{s.label}</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-semibold font-mono" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-1 p-1 rounded-xl mb-6 sm:mb-8 w-full sm:w-fit"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setJournalTab(tab.key as JournalTab)}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none whitespace-nowrap"
                  style={journalTab === tab.key
                    ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }
                    : { color: 'rgba(255,255,255,0.4)' }}>
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
{journalTab === 'trades' && <TradeHistory trades={filteredTrades} onDelete={handleDeleteTrade} onDeleteMultiple={handleDeleteMultiple} onUpdate={handleUpdateTrade} />}
{journalTab === 'calendar' && <CalendarView trades={filteredTrades} onDelete={handleDeleteTrade} />}
{journalTab === 'stats' && <TradeHistory trades={filteredTrades} onDelete={handleDeleteTrade} onDeleteMultiple={handleDeleteMultiple} onUpdate={handleUpdateTrade} statsOnly />}
{journalTab === 'goals' && <GoalsView trades={filteredTrades} account={activeJournal} onUpdateGoals={handleUpdateGoals} />}
          </main>
        )}

      </SignedIn>
    </div>
  );
}
