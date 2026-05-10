import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle, Globe, ChevronDown, ChevronLeft,
  Trash2, BookOpen, Clock, TrendingUp, X,
  Target, DollarSign, Activity, PieChart,
  CalendarDays, BarChart2, List, LogOut, User,
  Upload, Check, Shield
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
  const [hasPaid, setHasPaid] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'daily' | 'total' | 'journal'>('total');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [modalBilling, setModalBilling] = useState<'monthly' | 'yearly'>('yearly');

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
    const { data } = await supabase.from('users').select('is_pro, has_paid').eq('user_id', user.id).single();
    if (data) { setIsPro(data.is_pro); setHasPaid(data.has_paid || false); }
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
    const key = `hasSeenOnboarding_${user.id}`;
    if (mapped.length === 0 && !localStorage.getItem(key)) setShowOnboarding(true);
    setLoading(false);
  };

  const loadTrades = async () => {
    if (!user) return;
    const { data } = await supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (data) {
      setTrades(data.map((t: any) => ({
        id: t.id, accountId: t.journal_id, journal_id: t.journal_id, user_id: t.user_id,
        date: t.date, symbol: t.symbol, type: t.type, timeframe: t.timeframe, setup: t.setup,
        risk: t.risk, reward: t.reward, rr: t.rr, result: t.result,
        preTradeNotes: t.pre_trade_notes || '', postTradeNotes: t.post_trade_notes || '',
        preTradePhotos: t.pre_trade_photos || [], postTradePhotos: t.post_trade_photos || [],
      })));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setIsLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── JOURNAL LİMİT KONTROLÜ ──
  const handleNewJournalClick = () => {
    if (!isPro && accounts.length >= 1) {
      setUpgradeReason('journal');
      setShowUpgradeModal(true);
      return;
    }
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
  const handleNewTradeClick = () => {
    if (!isPro && user) {
      const userTrades = trades.filter(tr => tr.user_id === user.id);
      if (userTrades.length >= 20) {
        setUpgradeReason('total');
        setShowUpgradeModal(true);
        return;
      }
      const today = new Date().toDateString();
      const todayTrades = userTrades.filter(tr => new Date(tr.date).toDateString() === today);
      if (todayTrades.length >= 1) {
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
      symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe, setup: trade.setup,
      risk: trade.risk, reward: trade.reward, rr: trade.rr, result: trade.result,
      pre_trade_notes: trade.preTradeNotes, post_trade_notes: trade.postTradeNotes,
      pre_trade_photos: trade.preTradePhotos, post_trade_photos: trade.postTradePhotos,
    }).select().single();
    if (data) {
      const newTrade: Trade = {
        id: data.id, accountId: data.journal_id, journal_id: data.journal_id, user_id: data.user_id,
        date: data.date, symbol: data.symbol, type: data.type, timeframe: data.timeframe, setup: data.setup,
        risk: data.risk, reward: data.reward, rr: data.rr, result: data.result,
        preTradeNotes: data.pre_trade_notes || '', postTradeNotes: data.post_trade_notes || '',
        preTradePhotos: data.pre_trade_photos || [], postTradePhotos: data.post_trade_photos || [],
      };
      setTrades(prev => [newTrade, ...prev]);
      setShowTradeModal(false);
    }
  };

  const handleUpdateTrade = async (trade: Trade) => {
    await supabase.from('trades').update({
      symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe, setup: trade.setup,
      risk: trade.risk, reward: trade.reward, rr: trade.rr, result: trade.result,
      pre_trade_notes: trade.preTradeNotes, post_trade_notes: trade.postTradeNotes,
      pre_trade_photos: trade.preTradePhotos, post_trade_photos: trade.postTradePhotos,
    }).eq('id', trade.id);
    setTrades(prev => prev.map(tr => tr.id === trade.id ? trade : tr));
  };

  const handleDeleteMultiple = async (ids: string[]) => {
    await supabase.from('trades').delete().in('id', ids);
    setTrades(prev => prev.filter(tr => !ids.includes(tr.id)));
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
        date: data.date, symbol: data.symbol, type: data.type, timeframe: data.timeframe, setup: data.setup,
        risk: data.risk, reward: data.reward, rr: data.rr, result: data.result,
        preTradeNotes: data.pre_trade_notes || '', postTradeNotes: data.post_trade_notes || '',
        preTradePhotos: [], postTradePhotos: [],
      });
    }
    setTrades(prev => [...inserted, ...prev]);
  };

  const handleDeleteTrade = async (id: string) => {
    await supabase.from('trades').delete().eq('id', id);
    setTrades(prev => prev.filter(tr => tr.id !== id));
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    await supabase.from('journals').delete().eq('id', accountToDelete);
    setAccounts(prev => prev.filter(a => a.id !== accountToDelete));
    setTrades(prev => prev.filter(tr => tr.accountId !== accountToDelet
