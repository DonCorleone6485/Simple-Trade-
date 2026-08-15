import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle, Globe, ChevronDown, ChevronLeft,
  Trash2, BookOpen, Clock, TrendingUp, X,
  Target, DollarSign, Activity, PieChart,
  CalendarDays, BarChart2, List, LogOut, User,
  Upload, Check, Shield, Home
} from 'lucide-react';
import {
  SignIn, SignUp, useUser, useClerk, SignedIn, SignedOut
} from '@clerk/clerk-react';
import TradeForm from './components/TradeForm';
import TradeHistory from './components/TradeHistory';
import CalendarView from './components/CalendarView';
import GoalsView from './components/GoalsView';
import PricingPage from './components/PricingPage';
import PaymentModal from './components/PaymentModal';
import CSVImport from './components/CSVImport';
import LandingPage from './components/LandingPage';
import JournalDashboard from './components/JournalDashboard';
import AppShell, { NavKey } from './components/AppShell';
import { Trade, Account, JournalGoals } from './types';
import { useLanguage } from './context/LanguageContext';
import { supabase } from './lib/supabase';
import { isWinTrade, isLossTrade, lossAmount, winAmount } from './lib/tradeMath';

type View = 'dashboard' | 'expanded' | 'pricing';
type JournalTab = 'trades' | 'calendar' | 'stats' | 'goals';
type AuthView = 'signin' | 'signup';
type AuthStage = 'landing' | 'auth';
type Page = 'home' | 'journal';

const JOURNAL_PATH = '/journal';

function getInitialPage(): Page {
  return window.location.pathname.replace(/\/+$/, '') === JOURNAL_PATH ? 'journal' : 'home';
}

function pathForPage(page: Page): string {
  return page === 'journal' ? JOURNAL_PATH : '/';
}

function getInitialAuthStage(): AuthStage {
  // Clerk's routing="hash" drives multi-step auth (email verification,
  // OAuth/SSO return) via window.location.hash. A non-trivial hash on
  // first load means we're mid-flow — resume auth, don't show the
  // marketing page.
  return window.location.hash && window.location.hash.length > 1 ? 'auth' : 'landing';
}

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [page, setPage] = useState<Page>(getInitialPage);
  const [view, setView] = useState<View>('dashboard');
  const [journalTab, setJournalTab] = useState<JournalTab>('trades');
  const [activeJournal, setActiveJournal] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [authStage, setAuthStage] = useState<AuthStage>(getInitialAuthStage);
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
  const [hasPaid, setHasPaid] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'daily' | 'total' | 'journal'>('total');
  const [modalBilling, setModalBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpiredPricing, setShowExpiredPricing] = useState(false);

  const isRTL = language === 'fa' || language === 'ar';

  const upgradeReasonText: Record<string, string> = {
    daily: language === 'tr' ? 'Günlük 1 işlem limitini aştınız.' : "You've reached the daily 1 trade limit.",
    total: language === 'tr' ? 'Toplam 20 işlem limitini aştınız.' : "You've reached the 20 trade limit.",
    journal: language === 'tr' ? '1 Journal limitini aştınız.' : "You've reached the 1 journal limit.",
  };

  const proFeaturesList = [
    language === 'tr' ? 'Sınırsız Journal' : 'Unlimited Journals',
    language === 'tr' ? 'Sınırsız Trade' : 'Unlimited Trades',
    language === 'tr' ? 'Sınırsız Fotoğraf Yükleme' : 'Unlimited Photo Upload',
    language === 'tr' ? 'AI Analiz' : 'AI Analysis',
    language === 'tr' ? 'Gelişmiş İstatistikler' : 'Advanced Statistics',
    language === 'tr' ? 'Hedef & Kural Sistemi' : 'Goals & Rules System',
    language === 'tr' ? 'Drawdown & Streak Analizi' : 'Drawdown & Streak Analysis',
    language === 'tr' ? 'Isı Haritası' : 'Heat Map',
    language === 'tr' ? 'Setup Performans Analizi' : 'Setup Performance Analysis',
    language === 'tr' ? 'Öncelikli Destek' : 'Priority Support',
  ];

  useEffect(() => {
    if (user) {
      loadJournals();
      loadTrades();
      checkProStatus();
      generateReferralCode();

      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        localStorage.setItem('pendingRefCode', refCode);
        window.history.replaceState({}, '', window.location.pathname);
      }

      const pendingRefCode = localStorage.getItem('pendingRefCode');
      if (pendingRefCode) {
        localStorage.removeItem('pendingRefCode');
        fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'use', userId: user.id, code: pendingRefCode }),
        }).then(res => res.json()).then(data => {
          if (data.success) setIsPro(true);
        });
      }
    }
  }, [user]);

  const checkProStatus = async () => {
    if (!user) return;
    const { data } = await supabase.from('users').select('is_pro, has_paid, pro_until').eq('user_id', user.id).single();
    if (data) {
      const isStillPro = data.is_pro && data.pro_until && new Date(data.pro_until) > new Date();
      const proExpired = data.is_pro && !isStillPro && data.pro_until;

      if (proExpired) {
        // Pro süresi doldu, DB'yi güncelle
        await supabase.from('users').update({ is_pro: false }).eq('user_id', user.id);
        setShowExpiredPricing(true);
      }

      setIsPro(!!isStillPro);
      setHasPaid(data.has_paid || false);
    }
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
    if (data.success) { setReferralMsg('🎉 1 ay ücretsiz Pro kazandınız!'); setIsPro(true); }
    else { setReferralMsg(data.error || 'Hata oluştu'); }
  };

  const loadJournals = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('journals').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    const mapped = (data || []).map((j: any) => ({
      id: j.id, user_id: j.user_id, name: j.name,
      startDate: j.start_date, startingCapital: j.starting_capital, goals: j.goals,
    }));
    setAccounts(mapped);
    setLoading(false);
  };

  const loadTrades = async () => {
    if (!user) return;
    const { data } = await supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (data) {
      setTrades(data.map((t: any) => ({
        id: t.id, accountId: t.journal_id, journal_id: t.journal_id, user_id: t.user_id,
        date: t.date, symbol: t.symbol, type: t.type, timeframe: t.timeframe, orderType: t.order_type || undefined, setup: t.setup,
        risk: t.risk, reward: t.reward, rr: t.rr, result: t.result,
        preTradeNotes: t.pre_trade_notes || '', postTradeNotes: t.post_trade_notes || '',
        preTradePhotos: t.pre_trade_photos || [], postTradePhotos: t.post_trade_photos || [],
        mtfAnalysis: t.mtf_analysis || [],
        checklist: t.checklist || [],
      })));
    }
  };

  // ── SAYFA YÖNLENDİRME (ana sayfa ↔ journal) ──
  const navigate = (target: Page, replace = false) => {
    const path = pathForPage(target);
    // Landing page anchor'ları (#features) ve Clerk'in hash routing'i geride
    // kalmasın — sayfa değişince hash'i temizle.
    if (window.location.pathname !== path || window.location.hash) {
      const method = replace ? 'replaceState' : 'pushState';
      window.history[method]({}, '', path + window.location.search);
    }
    setPage(target);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPopState = () => setPage(getInitialPage());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      // Giriş/kayıt tamamlandı: kullanıcıyı doğrudan journal'a al.
      if (authStage === 'auth') {
        setAuthStage('landing');
        navigate('journal', true);
      }
    } else if (page === 'journal') {
      // Girişi olmayan biri /journal'a geldi — ana sayfaya döndür.
      navigate('home', true);
    }
  }, [isLoaded, isSignedIn, authStage, page]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setIsLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── YENİ JOURNAL VARSAYILANLARI ──
  /** Mevcut isimlerle çakışmayan ilk "Journal N". */
  const suggestJournalName = () => {
    let n = 1;
    while (accounts.some(a => a.name.trim().toLowerCase() === `journal ${n}`)) n++;
    return `Journal ${n}`;
  };

  /** input[type=date] için yerel saate göre bugünün tarihi. */
  const todayForDateInput = () => {
    const d = new Date();
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // ── JOURNAL LİMİT KONTROLÜ ──
  const handleNewJournalClick = () => {
    if (!isPro && accounts.length >= 1) {
      setUpgradeReason('journal');
      setShowUpgradeModal(true);
      return;
    }
    setNewJournalName(suggestJournalName());
    setNewJournalStartDate(todayForDateInput());
    setNewJournalCapital('10000');
    setShowNewJournalModal(true);
  };

  const createJournal = async () => {
    if (!newJournalName.trim() || !newJournalStartDate || !newJournalCapital || !user) return;
    const { data } = await supabase.from('journals').insert({
      user_id: user.id, name: newJournalName.trim(),
      start_date: newJournalStartDate, starting_capital: parseFloat(newJournalCapital),
    }).select().single();
    if (data) {
      const newAccount: Account = {
        id: data.id, user_id: data.user_id, name: data.name,
        startDate: data.start_date, startingCapital: data.starting_capital,
      };
      setAccounts(prev => [...prev, newAccount]);
      setActiveJournal(newAccount);
      setShowNewJournalModal(false);
      setNewJournalName(''); setNewJournalStartDate(''); setNewJournalCapital('');
      setView('expanded');
    }
  };

  // ── TRADE LİMİT KONTROLÜ ──
  const handleNewTradeClick = async () => {
    if (!isPro && user) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: totalCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((totalCount || 0) >= 20) {
        setUpgradeReason('total');
        setShowUpgradeModal(true);
        return;
      }

      const { count: todayCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', todayStart.toISOString());

      if ((todayCount || 0) >= 1) {
        setUpgradeReason('daily');
        setShowUpgradeModal(true);
        return;
      }
    }
    setShowTradeModal(true);
  };

  const handleAddTrade = async (trade: Trade) => {
    if (!activeJournal || !user) return;
    const { data } = await supabase.from('trades').insert({
      user_id: user.id, journal_id: activeJournal.id, date: trade.date,
      symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe, order_type: trade.orderType || null, setup: trade.setup,
      risk: trade.risk, reward: trade.reward, rr: trade.rr, result: trade.result,
      pre_trade_notes: trade.preTradeNotes, post_trade_notes: trade.postTradeNotes,
      pre_trade_photos: trade.preTradePhotos, post_trade_photos: trade.postTradePhotos,
      mtf_analysis: trade.mtfAnalysis?.length ? trade.mtfAnalysis : null,
      checklist: trade.checklist?.length ? trade.checklist : null,
    }).select().single();
    if (data) {
      const newTrade: Trade = {
        id: data.id, accountId: data.journal_id, journal_id: data.journal_id, user_id: data.user_id,
        date: data.date, symbol: data.symbol, type: data.type, timeframe: data.timeframe, orderType: data.order_type || undefined, setup: data.setup,
        risk: data.risk, reward: data.reward, rr: data.rr, result: data.result,
        preTradeNotes: data.pre_trade_notes || '', postTradeNotes: data.post_trade_notes || '',
        preTradePhotos: data.pre_trade_photos || [], postTradePhotos: data.post_trade_photos || [],
        mtfAnalysis: data.mtf_analysis || [],
        checklist: data.checklist || [],
      };
      setTrades(prev => [newTrade, ...prev]);
      setShowTradeModal(false);
    }
  };

  const handleUpdateTrade = async (trade: Trade) => {
    const { error } = await supabase.from('trades').update({
      symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe, order_type: trade.orderType || null, setup: trade.setup,
      risk: trade.risk, reward: trade.reward, rr: trade.rr, result: trade.result,
      pre_trade_notes: trade.preTradeNotes, post_trade_notes: trade.postTradeNotes,
      pre_trade_photos: trade.preTradePhotos, post_trade_photos: trade.postTradePhotos,
      mtf_analysis: trade.mtfAnalysis?.length ? trade.mtfAnalysis : null,
      checklist: trade.checklist?.length ? trade.checklist : null,
    }).eq('id', trade.id);

    if (error) {
      alert(language === 'tr'
        ? 'Kayıt başarısız. Fotoğraflar çok büyük olabilir, daha küçük fotoğraflar deneyin.'
        : 'Save failed. Photos may be too large, try smaller images.');
      return;
    }
    setTrades(prev => prev.map(tr => tr.id === trade.id ? trade : tr));
  };


  const handleCSVImport = async (importedTrades: Trade[]) => {
    if (!activeJournal || !user) return;
    if (!isPro) {
      const currentCount = trades.filter(tr => tr.user_id === user.id).length;
      const remaining = 20 - currentCount;
      if (remaining <= 0) { setUpgradeReason('total'); setShowUpgradeModal(true); return; }
      importedTrades = importedTrades.slice(0, remaining);
    }
    const inserted: Trade[] = [];
    for (const trade of importedTrades) {
      const { data } = await supabase.from('trades').insert({
        user_id: user.id, journal_id: activeJournal.id, date: trade.date,
        symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe || '',
        setup: trade.setup || '', risk: trade.risk || 0, reward: trade.reward || 0,
        rr: trade.rr || '', result: trade.result,
        pre_trade_notes: trade.preTradeNotes || '', post_trade_notes: trade.postTradeNotes || '',
        pre_trade_photos: [], post_trade_photos: [],
      }).select().single();
      if (data) inserted.push({
        id: data.id, accountId: data.journal_id, journal_id: data.journal_id, user_id: data.user_id,
        date: data.date, symbol: data.symbol, type: data.type, timeframe: data.timeframe, orderType: data.order_type || undefined, setup: data.setup,
        risk: data.risk, reward: data.reward, rr: data.rr, result: data.result,
        preTradeNotes: data.pre_trade_notes || '', postTradeNotes: data.post_trade_notes || '',
        preTradePhotos: [], postTradePhotos: [],
      });
    }
    setTrades(prev => [...inserted, ...prev]);
  };

  // ── STORAGE'DAN FOTOĞRAF SİL ──
  const deletePhotosFromStorage = async (photos: string[]) => {
    const paths = photos
      .filter(url => url && url.includes('/trade-photos/'))
      .map(url => url.split('/trade-photos/')[1])
      .filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from('trade-photos').remove(paths);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    const trade = trades.find(tr => tr.id === id);
    if (trade) {
      await deletePhotosFromStorage([
        ...(trade.preTradePhotos || []),
        ...(trade.postTradePhotos || []),
      ]);
    }
    await supabase.from('trades').delete().eq('id', id);
    setTrades(prev => prev.filter(tr => tr.id !== id));
  };

  const handleDeleteMultiple = async (ids: string[]) => {
    const toDelete = trades.filter(tr => ids.includes(tr.id));
    for (const trade of toDelete) {
      await deletePhotosFromStorage([
        ...(trade.preTradePhotos || []),
        ...(trade.postTradePhotos || []),
      ]);
    }
    await supabase.from('trades').delete().in('id', ids);
    setTrades(prev => prev.filter(tr => !ids.includes(tr.id)));
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    await supabase.from('journals').delete().eq('id', accountToDelete);
    setAccounts(prev => prev.filter(a => a.id !== accountToDelete));
    setTrades(prev => prev.filter(tr => tr.accountId !== accountToDelete));
    if (activeJournal?.id === accountToDelete) { setView('dashboard'); setActiveJournal(null); }
    setAccountToDelete(null);
  };

  const openJournal = (account: Account) => { setActiveJournal(account); setView('expanded'); setJournalTab('trades'); };

  const goToAuth = (targetView: AuthView) => {
    // Clear any in-page anchor hash left by the landing page (#features etc.)
    // so it can't be mistaken for one of Clerk's own hash-routing steps.
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setAuthView(targetView);
    setAuthStage('auth');
  };

  const handleUpdateGoals = async (goals: JournalGoals) => {
    if (!activeJournal) return;
    await supabase.from('journals').update({ goals }).eq('id', activeJournal.id);
    setAccounts(prev => prev.map(a => a.id === activeJournal.id ? { ...a, goals } : a));
    setActiveJournal(prev => prev ? { ...prev, goals } : prev);
  };

  const filteredTrades = activeJournal ? trades.filter(tr => tr.accountId === activeJournal.id) : [];

  const getJournalStats = (accountId: string) => {
    const jt = trades.filter(tr => tr.accountId === accountId);
    const wins = jt.filter(isWinTrade);
    const losses = jt.filter(isLossTrade);
    // Başa baş işlemler ne kazanç ne kayıp — oranın paydasına girmezler.
    const decided = wins.length + losses.length;
    const winRate = decided > 0 ? ((wins.length / decided) * 100).toFixed(0) : '0';
    const grossProfit = wins.reduce((s, tr) => s + winAmount(tr), 0);
    const grossLoss = losses.reduce((s, tr) => s + lossAmount(tr), 0);
    const netPnL = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';
    return { total: jt.length, winRate, netPnL, profitFactor };
  };

  const languages = [
    { code: 'tr', label: 'Türkçe' }, { code: 'en', label: 'English' }, { code: 'fa', label: 'فارسی' },
    { code: 'ar', label: 'العربية' }, { code: 'ru', label: 'Русский' }, { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }, { code: 'de', label: 'Deutsch' }, { code: 'fr', label: 'Français' },
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

  const signInLabel = language === 'tr' ? 'Giriş Yap' : language === 'fa' ? 'ورود' : 'Sign In';
  const signUpLabel = language === 'tr' ? 'Kayıt Ol' : language === 'fa' ? 'ثبت نام' : 'Sign Up';
  const pricingLabel = language === 'tr' ? 'Fiyatlar' : language === 'fa' ? 'قیمت‌ها' : 'Pricing';
  const homeLabel = language === 'tr' ? 'Ana Sayfa' : language === 'fa' ? 'صفحه اصلی' : 'Home';
  const importLabel = language === 'tr' ? 'CSV İçe Aktar' : 'Import CSV';

  // ── PORTAL KABUĞU ──
  const navKey: NavKey =
    view === 'pricing' ? 'pricing'
    : view === 'expanded' ? (journalTab as NavKey)
    : 'journals';

  const handleNav = (key: NavKey) => {
    if (key === 'home') { navigate('home'); return; }
    if (key === 'referral') { setShowReferral(true); return; }
    if (key === 'pricing') { setView('pricing'); return; }
    if (key === 'journals') { setView('dashboard'); setActiveJournal(null); return; }
    if (activeJournal) { setView('expanded'); setJournalTab(key as JournalTab); }
  };

  const shellTitle =
    view === 'pricing' ? pricingLabel
    : view === 'expanded' && activeJournal ? activeJournal.name
    : t('myJournals');

  const shellSubtitle =
    view === 'expanded' && activeJournal
      ? [formatDate(activeJournal.startDate), activeJournal.startingCapital ? `$${activeJournal.startingCapital.toLocaleString()}` : null]
          .filter(Boolean).join('  ·  ')
      : view === 'dashboard'
      ? `${accounts.length} journal  ·  ${trades.length} ${language === 'tr' ? 'işlem' : 'trades'}`
      : undefined;

  const pillBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(255,255,255,0.1)', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
  };

  const shellActions =
    view === 'dashboard' ? (
      <button onClick={handleNewJournalClick}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
        style={{ background: '#8b5cf6', color: '#fff', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">{t('newJournal')}</span>
      </button>
    ) : view === 'expanded' ? (
      <>
        <button onClick={() => setShowCSVImport(true)}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium"
          style={pillBtn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
          <Upload className="w-4 h-4" />
          <span className="hidden md:inline">{importLabel}</span>
        </button>
        <button onClick={handleNewTradeClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
          style={{ background: '#8b5cf6', color: '#fff', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t('newTradeTab')}</span>
        </button>
      </>
    ) : undefined;

  const languageMenu = (
    <div className="relative" ref={langMenuRef}>
      <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[13px]"
        style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 150ms' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline uppercase text-[11px] tracking-wider">{language}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      {isLangMenuOpen && (
        <div className="absolute top-full end-0 mt-2 w-44 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
          style={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          {languages.map(lang => (
            <button key={lang.code} onClick={() => { setLanguage(lang.code as any); setIsLangMenuOpen(false); }}
              className="w-full text-start px-4 py-2 text-[13px]"
              style={{ color: language === lang.code ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: language === lang.code ? 500 : 400 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );


  return (
    <div className="min-h-screen font-sans" style={{ background: '#0d0e1a', color: '#fff' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── PRO SÜRESİ DOLDU EKRANI ── */}
      {showExpiredPricing && page === 'journal' && (
        <PricingPage
          onboardingMode
          onFreeStart={() => setShowExpiredPricing(false)}
          onProStart={() => { setShowExpiredPricing(false); setShowPaymentModal(true); }}
          expiredMode
        />
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}

      {/* ── UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="rounded-2xl p-8 relative w-full max-w-md my-8"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
            <button onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 end-4 p-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5" style={{ color: '#a78bfa' }} />
              <h2 className="text-xl font-bold text-white">
                {language === 'tr' ? "Pro'ya Geç" : 'Upgrade to Pro'}
              </h2>
            </div>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {upgradeReasonText[upgradeReason]}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm" style={{ color: modalBilling === 'monthly' ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                {language === 'tr' ? 'Aylık' : 'Monthly'}
              </span>
              <button
                onClick={() => setModalBilling(modalBilling === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: modalBilling === 'yearly' ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: modalBilling === 'yearly' ? '26px' : '2px' }} />
              </button>
              <span className="text-sm" style={{ color: modalBilling === 'yearly' ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                {language === 'tr' ? 'Yıllık' : 'Yearly'}
                <span className="ms-1 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                  %36
                </span>
              </span>
            </div>

            <div className="mb-2">
              <span className="text-5xl font-bold text-white">
                ${modalBilling === 'monthly' ? '12.99' : '8.25'}
              </span>
              <span className="text-sm ms-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {language === 'tr' ? '/ ay' : '/ month'}
              </span>
              {modalBilling === 'yearly' && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {language === 'tr' ? 'Yıllık $99 faturalandırılır' : 'Billed $99/year'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6 mt-4 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <Shield className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
              <span className="text-xs font-medium" style={{ color: '#34d399' }}>
                {language === 'tr' ? '3 Gün Ücretsiz Dene — 3. günün sonunda ödeme alınır' : '3-Day Free Trial — charged on day 3'}
              </span>
            </div>

            <button onClick={() => { setShowUpgradeModal(false); setShowPaymentModal(true); }}
              className="w-full py-3 rounded-xl text-sm font-semibold mb-6 transition-all"
              style={{ background: '#8b5cf6', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
              {language === 'tr' ? "Pro'ya Geç" : 'Upgrade to Pro'}
            </button>

            <div className="space-y-3 mb-6">
              {proFeaturesList.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(139,92,246,0.2)' }}>
                    <Check className="w-3 h-3" style={{ color: '#a78bfa' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowUpgradeModal(false)}
              className="w-full py-2 rounded-xl text-sm transition-all text-center"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
              {language === 'tr' ? 'Şimdilik Devam Et' : 'Continue for Now'}
            </button>
          </div>
        </div>
      )}

      {/* CSV Import */}
      {showCSVImport && activeJournal && user && (
        <CSVImport onImport={handleCSVImport} onClose={() => setShowCSVImport(false)} journalId={activeJournal.id} userId={user.id} />
      )}

      {/* AUTH */}
      <SignedOut>
        {(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = urlParams.get('ref');
          if (refCode) localStorage.setItem('pendingRefCode', refCode);
          return null;
        })()}

        {authStage === 'landing' ? (
          <LandingPage
            onGetStarted={() => goToAuth('signup')}
            onSignIn={() => goToAuth('signin')}
          />
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0d0e1a' }}>
            <button onClick={() => setAuthStage('landing')}
              className="fixed top-4 start-4 sm:top-6 sm:start-6 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
              <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{language === 'tr' ? 'Geri' : language === 'fa' ? 'بازگشت' : 'Back'}</span>
            </button>

            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6" style={{ color: '#8b5cf6' }} />
              <span className="text-xl font-bold">Simple Trading Journal</span>
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
        )}
      </SignedOut>

      <SignedIn>
        {page === 'home' ? (
          /* Giriş yapmış kullanıcı için ana sayfa — CTA'lar journal'a götürür */
          <LandingPage
            signedIn
            onGetStarted={() => navigate('journal')}
            onSignIn={() => navigate('journal')}
          />
        ) : (
        <>

        {/* Referral Modal */}
        {showReferral && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl p-6 w-full max-w-md space-y-5" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">🎁 {language === 'tr' ? 'Referans Kodu Oluştur' : 'Create Referral Code'}</h3>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {language === 'tr' ? 'Her tıklamada yeni kod oluşturulur' : 'A new code is generated each time'}
                  </p>
                </div>
                <button onClick={() => { setShowReferral(false); setReferralMsg(''); setReferralInput(''); }}
                  className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ödül paylaşım seçimi */}
              <div className="space-y-2">
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {language === 'tr' ? 'Ödülü nasıl paylaşmak istersiniz?' : 'How would you like to share the reward?'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: '50_50',
                      title: language === 'tr' ? '%50 / %50' : '50% / 50%',
                      desc: language === 'tr' ? 'Ödülü paylaş' : 'Share the reward',
                      detail: language === 'tr' ? '1 ay → sen 7 gün, arkadaşın 7 gün\n1 yıl → sen 45 gün, arkadaşın 45 gün' : '1mo → you 7d, friend 7d\n1yr → you 45d, friend 45d',
                    },
                    {
                      key: '100_friend',
                      title: language === 'tr' ? '%100 Arkadaşa' : '100% to Friend',
                      desc: language === 'tr' ? 'Tüm ödülü hediye et' : 'Gift all reward',
                      detail: language === 'tr' ? '1 ay → arkadaşın 14 gün\n1 yıl → arkadaşın 90 gün' : '1mo → friend 14d\n1yr → friend 90d',
                    },
                  ].map(opt => (
                    <button key={opt.key} type="button"
                      onClick={() => setReferralInput(opt.key)}
                      className="p-3 rounded-xl text-start transition-all"
                      style={referralInput === opt.key
                        ? { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="font-semibold text-sm text-white">{opt.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#34d399' }}>{opt.desc}</div>
                      <div className="text-xs mt-1.5 whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.4)' }}>{opt.detail}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kod oluştur butonu */}
              <button
                onClick={async () => {
                  if (!user || !referralInput) return;
                  const splitType = referralInput;
                  // Yeni kod oluştur
                  const newCode = `ST-${user.id.slice(-6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
                  const res = await fetch('/api/referral', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'generate_new', userId: user.id, splitType, code: newCode }),
                  });
                  const data = await res.json();
                  if (data.code) {
                    setReferralCode(data.code);
                    setReferralMsg('');
                  }
                }}
                disabled={!referralInput}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: '#34d399', color: '#000' }}>
                {language === 'tr' ? '✨ Yeni Kod Oluştur' : '✨ Generate New Code'}
              </button>

              {/* Oluşturulan kod */}
              {referralCode && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#34d399' }}>
                    {language === 'tr' ? '✅ Kodunuz hazır! Arkadaşınızla paylaşın:' : '✅ Your code is ready! Share with your friend:'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-xl font-mono text-sm font-bold text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.1em' }}>
                      {referralCode}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(referralCode).then(() => {
                          setReferralMsg(language === 'tr' ? '✅ Kopyalandı!' : '✅ Copied!');
                          setTimeout(() => setReferralMsg(''), 2000);
                        });
                      }}
                      className="px-3 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
                      style={{ background: '#34d399', color: '#000' }}>
                      {language === 'tr' ? 'Kopyala' : 'Copy'}
                    </button>
                  </div>
                  {referralMsg && <p className="text-sm font-medium" style={{ color: '#34d399' }}>{referralMsg}</p>}
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {language === 'tr'
                      ? '⚠️ Bu kod bir kez kullanılabilir. Kullanıldıktan sonra yeni kod oluşturun.'
                      : '⚠️ This code can only be used once. Generate a new code after it\'s used.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Journal Modal */}
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
                    onFocus={e => e.target.select()}
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
              <TradeForm onSave={handleAddTrade} isPro={isPro} />
            </div>
          </div>
        )}

        <AppShell
          active={navKey}
          onNavigate={handleNav}
          activeJournalName={view === 'expanded' ? activeJournal?.name : undefined}
          title={shellTitle}
          subtitle={shellSubtitle}
          actions={shellActions}
          isPro={isPro}
          userLabel={user?.firstName || user?.emailAddresses[0]?.emailAddress}
          userImage={user?.imageUrl}
          onSignOut={() => signOut()}
          languageMenu={languageMenu}
        >
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }} />
            </div>
          )}

          {!loading && view === 'pricing' && (
            <PricingPage
              onFreeStart={() => setView('dashboard')}
              onProStart={() => setShowPaymentModal(true)}
            />
          )}

          {!loading && view === 'dashboard' && (
            <JournalDashboard
              hideHeader
              accounts={accounts}
              getStats={getJournalStats}
              formatDate={formatDate}
              onNewJournal={handleNewJournalClick}
              onOpen={openJournal}
              onDelete={setAccountToDelete}
            />
          )}

          {!loading && view === 'expanded' && activeJournal && activeStats && (
            <div>
              {/* Journal özeti — kart yok, hizalı sayı sütunları */}
              <div className="flex items-baseline gap-8 sm:gap-14 flex-wrap mb-10 pb-10"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: t('totalTrades'), value: String(activeStats.total), color: 'rgba(255,255,255,0.85)' },
                  { label: t('winRate'), value: `%${activeStats.winRate}`, color: 'rgba(255,255,255,0.85)' },
                  { label: t('netProfit'), value: `${activeStats.netPnL >= 0 ? '+' : '\u2212'}$${Math.abs(activeStats.netPnL).toFixed(2)}`, color: activeStats.netPnL >= 0 ? '#34d399' : '#f87171' },
                  { label: t('profitFactor'), value: activeStats.profitFactor, color: 'rgba(255,255,255,0.85)' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-[11px] uppercase tracking-[0.12em] mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    <div className="font-mono text-2xl sm:text-3xl"
                      style={{ color: s.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {journalTab === 'trades' && <TradeHistory trades={filteredTrades} onDelete={handleDeleteTrade} onDeleteMultiple={handleDeleteMultiple} onUpdate={handleUpdateTrade} />}
              {journalTab === 'calendar' && <CalendarView trades={filteredTrades} onDelete={handleDeleteTrade} />}
              {journalTab === 'stats' && <TradeHistory trades={filteredTrades} onDelete={handleDeleteTrade} onDeleteMultiple={handleDeleteMultiple} onUpdate={handleUpdateTrade} statsOnly />}
              {journalTab === 'goals' && <GoalsView trades={filteredTrades} account={activeJournal} onUpdateGoals={handleUpdateGoals} />}
            </div>
          )}
        </AppShell>

        </>
        )}
      </SignedIn>
    </div>
  );
}
