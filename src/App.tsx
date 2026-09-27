import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  PlusCircle, Globe, ChevronDown, ChevronLeft,
  Trash2, BookOpen, Clock, TrendingUp, X,
  Target, DollarSign, Activity, PieChart,
  CalendarDays, BarChart2, List, LogOut, User,
  Upload, Check, Shield, Home, Printer, Plug
} from 'lucide-react';
import {
  SignIn, SignUp, useUser, useClerk, useAuth
} from '@clerk/clerk-react';
import type { ImportTarget } from './components/CSVImport';
import type { MTTarget } from './components/MTTargetPicker';
import { tradeKey } from './lib/tradeKey';
import AppShell, { NavKey } from './components/AppShell';
import { Trade, Account, JournalGoals, JournalKind, DrawdownType } from './types';
import { useLanguage } from './context/LanguageContext';
import { PlanProvider, UpgradeReason, FREE_DAILY_TRADES } from './context/PlanContext';
import { demoData } from './lib/demo';
import { matchOpenTrade } from './lib/matchOpen';
import { usePrices } from './lib/pricing';
import { supabase } from './lib/supabase';
import { modalCard, input as uiInput, label as uiLabel, primaryBtn, quietBtn, hairline, TRANSITION } from './lib/ui';
import { isWinTrade, isLossTrade, lossAmount, winAmount, isOpenTrade } from './lib/tradeMath';
import { signedMoney, int, cur, CURRENCIES, setCurrency } from './lib/format';

/**
 * Ekranlar ihtiyaç anında yükleniyor. Hepsi tek parçaydı (~2 MB): ana sayfaya
 * gelen biri istatistik grafiklerini, içe aktarma ayrıştırıcısını, prop
 * değerlendirme metinlerini de indiriyordu. Şimdi her ekran açıldığında kendi
 * parçası geliyor.
 */
const TradeForm = lazy(() => import('./components/TradeForm'));
const TradeHistory = lazy(() => import('./components/TradeHistory'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const GoalsView = lazy(() => import('./components/GoalsView'));
const PricingPage = lazy(() => import('./components/PricingPage'));
const PaymentModal = lazy(() => import('./components/PaymentModal'));
const CSVImport = lazy(() => import('./components/CSVImport'));
const MTConnect = lazy(() => import('./components/MTConnect'));
const MTTargetPicker = lazy(() => import('./components/MTTargetPicker'));
const SessionsView = lazy(() => import('./components/SessionsView'));
const NewsView = lazy(() => import('./components/NewsView'));
const DisciplineView = lazy(() => import('./components/DisciplineView'));
const ChecklistLibrary = lazy(() => import('./components/ChecklistLibrary'));
const PropEvaluation = lazy(() => import('./components/PropEvaluation'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const InfoPage = lazy(() => import('./components/InfoPage'));
const JournalDashboard = lazy(() => import('./components/JournalDashboard'));
const PrintableReport = lazy(() => import('./components/PrintableReport'));
const PropStatus = lazy(() => import('./components/PropStatus'));

type View = 'dashboard' | 'expanded' | 'pricing' | 'sessions' | 'news' | 'discipline' | 'checklists' | 'propReview';
type JournalTab = 'newTrade' | 'trades' | 'calendar' | 'stats' | 'goals' | 'mtConnect';
type AuthView = 'signin' | 'signup';
type AuthStage = 'landing' | 'auth';
type Page = 'home' | 'journal' | 'help' | 'changelog';

const JOURNAL_PATH = '/journal';
const JOURNAL_TABS: JournalTab[] = ['newTrade', 'trades', 'calendar', 'stats', 'goals', 'mtConnect'];

/** Adres satırındaki yolun parçaları: ['journal', '<id>', 'trades'] gibi. */
function pathParts(): string[] {
  return window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
}

function getInitialPage(): Page {
  const first = pathParts()[0];
  return first === 'journal' ? 'journal' : first === 'help' ? 'help' : first === 'changelog' ? 'changelog' : 'home';
}

function pathForPage(page: Page): string {
  return page === 'journal' ? JOURNAL_PATH : page === 'help' ? '/help' : page === 'changelog' ? '/changelog' : '/';
}

/**
 * Journal içindeki her görünümün kendi adresi var.
 *
 * Bunlar React state'i olarak kalsaydı tarayıcının geri tuşu uygulamadan
 * tamamen çıkarırdı: kullanıcı işlem listesinden geri dediğinde ana sayfaya
 * düşerdi.
 */
function pathForView(view: View, journalId?: string, tab: JournalTab = 'trades'): string {
  if (view === 'pricing') return `${JOURNAL_PATH}/pricing`;
  if (view === 'sessions') return `${JOURNAL_PATH}/sessions`;
  if (view === 'news') return `${JOURNAL_PATH}/news`;
  if (view === 'discipline') return `${JOURNAL_PATH}/discipline`;
  if (view === 'checklists') return `${JOURNAL_PATH}/checklists`;
  if (view === 'propReview') return `${JOURNAL_PATH}/prop-review`;
  if (view === 'expanded' && journalId) return `${JOURNAL_PATH}/${journalId}/${tab}`;
  return JOURNAL_PATH;
}

function parseView(): { view: View; journalId?: string; tab: JournalTab } {
  const [, second, third] = pathParts();
  if (second === 'pricing') return { view: 'pricing', tab: 'trades' };
  if (second === 'sessions') return { view: 'sessions', tab: 'trades' };
  if (second === 'news') return { view: 'news', tab: 'trades' };
  if (second === 'discipline') return { view: 'discipline', tab: 'trades' };
  if (second === 'checklists') return { view: 'checklists', tab: 'trades' };
  if (second === 'prop-review') return { view: 'propReview', tab: 'trades' };
  if (second) {
    const tab = JOURNAL_TABS.includes(third as JournalTab) ? (third as JournalTab) : 'trades';
    return { view: 'expanded', journalId: second, tab };
  }
  return { view: 'dashboard', tab: 'trades' };
}

function getInitialAuthStage(): AuthStage {
  // Clerk's routing="hash" drives multi-step auth (email verification,
  // OAuth/SSO return) via window.location.hash, always as "#/step". A hash
  // like that on first load means we're mid-flow — resume auth. Landing
  // anchors (#pricing, #features) are not: a shared link to the pricing
  // section used to open the sign-in form instead.
  return window.location.hash.startsWith('#/') ? 'auth' : 'landing';
}

/** Veritabanı satırını işleme çevirir. */
const tradeFromRow = (t: any): Trade => ({
  id: t.id, accountId: t.journal_id, journal_id: t.journal_id, user_id: t.user_id,
  date: t.date, exitDate: t.exit_date || undefined, symbol: t.symbol, type: t.type, timeframe: t.timeframe, orderType: t.order_type || undefined, setup: t.setup,
  risk: t.risk, reward: t.reward, rr: t.rr, result: t.result,
  preTradeNotes: t.pre_trade_notes || '', postTradeNotes: t.post_trade_notes || '',
  preTradePhotos: t.pre_trade_photos || [], postTradePhotos: t.post_trade_photos || [],
  mtfAnalysis: t.mtf_analysis || [],
  checklist: t.checklist || [],
  externalId: t.external_id || undefined,
  emotions: t.emotions || [],
  entryPrice: t.entry_price ?? undefined,
  stopLoss: t.stop_loss ?? undefined,
  exitPrice: t.exit_price ?? undefined,
  locked: !!t.locked,
});

/** Formdan gelen isteğe bağlı alanların sütun karşılıkları. */
const optionalColumns = (trade: Trade) => ({
  emotions: trade.emotions?.length ? trade.emotions : null,
  entry_price: trade.entryPrice ?? null,
  stop_loss: trade.stopLoss ?? null,
  exit_price: trade.exitPrice ?? null,
});

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { getToken } = useAuth();
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
  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalStartDate, setNewJournalStartDate] = useState('');
  const [newJournalCapital, setNewJournalCapital] = useState('');
  const [newJournalKind, setNewJournalKind] = useState<JournalKind>('real');
  const [newPropTarget, setNewPropTarget] = useState('');
  const [newPropDaily, setNewPropDaily] = useState('');
  const [newPropTotal, setNewPropTotal] = useState('');
  const [newPropDD, setNewPropDD] = useState<DrawdownType>('static');
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [editingJournal, setEditingJournal] = useState<Account | null>(null);
  /** Yazdırma/PDF görünümüne gönderilen işlemler; null ise rapor kapalı. */
  const [printJob, setPrintJob] = useState<{ trades: Trade[]; single: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason>('daily');
  /** İçe aktarmada kilitli kaydedilen işlem sayısı — pencerede söyleniyor. */
  const [importLockedCount, setImportLockedCount] = useState(0);
  const [modalBilling, setModalBilling] = useState<'monthly' | 'yearly'>('yearly');
  const prices = usePrices();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpiredPricing, setShowExpiredPricing] = useState(false);
  /** Deneme sürüyorsa bitiş anı; rozet kalan günü buradan sayıyor. */
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  /** Deneme, MT hesabı başka bir denemede kullanıldığı için bittiyse bir kez söylenir. */
  const [trialNotice, setTrialNotice] = useState(false);
  /** Deneme hiç kullanılmadı: sınıra takılınca "3 gün ücretsiz dene" teklif edilir. */
  const [trialAvailable, setTrialAvailable] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);
  /** Tek kullanımlık e-postayla açılmış hesap: uygulama açılmıyor. */
  const [emailBlocked, setEmailBlocked] = useState(false);
  /**
   * Kayıt olmadan gezinti. "Ücretsiz Başla" önce örnek verilerle dolu
   * uygulamayı açıyor; hesap ancak kayıt gerektiren bir şeye basınca
   * isteniyor. Sekme yenilense de sürsün diye oturum boyunca hatırlanıyor.
   */
  const [guest, setGuest] = useState(() => {
    try { return sessionStorage.getItem('stjGuest') === '1'; } catch { return false; }
  });
  /** Gösterilen para birimi (users.currency); değişince ekran yeniden çizilsin diye state'te de. */
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    try { return localStorage.getItem('stjCurrency') || 'USD'; } catch { return 'USD'; }
  });
  /** Hesap penceresi ve hesabı silme adımları. */
  const [showAccount, setShowAccount] = useState(false);
  const [deleteStep, setDeleteStep] = useState(false);
  const [deleteWord, setDeleteWord] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  /** "Kendi journal'ın için ücretsiz hesap aç" penceresi. */
  const [showJoin, setShowJoin] = useState(false);
  const isGuest = guest && isLoaded && !isSignedIn;
  const isInfoPage = page === 'help' || page === 'changelog';

  const isRTL = language === 'fa' || language === 'ar';

  const upgradeReasonText: Record<UpgradeReason, string> = {
    daily: t('upgradeDaily').replace('{n}', String(FREE_DAILY_TRADES)),
    journal: t('upgradeJournal'),
    locked: t('upgradeLocked').replace('{n}', String(FREE_DAILY_TRADES)),
    importLocked: t('upgradeImportLocked').replace('{n}', String(importLockedCount)),
    voice: t('upgradeVoice'),
    ai: t('upgradeAi'),
    delete: t('upgradeDelete'),
  };

  /** Kilitli bir şeye dokunulduğunda: o kısıtlamayı anlatan pencere. */
  const askUpgrade = (reason: UpgradeReason) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const proFeaturesList = [
    t('proFeatTrades'),
    t('proFeatJournals'),
    t('proFeatMt'),
    t('proFeatVoice'),
    t('proFeatAi'),
    t('proFeatPhotos'),
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
        getToken().then(token => fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'use', code: pendingRefCode }),
        })).then(res => res.json()).then(data => {
          if (data.success) setIsPro(true);
        });
      }
    }
  }, [user]);

  const checkProStatus = async () => {
    if (!user) return;
    const cols = 'is_pro, has_paid, pro_until, trial_started_at, trial_ends_at, trial_denied, email_checked_at, email_disposable, timezone, currency';
    let { data } = await supabase.from('users').select(cols).eq('user_id', user.id).maybeSingle();

    // E-posta bir kez, sunucuda kontrol ediliyor (Clerk'ten okunuyor).
    // Başarısız olursa kimse engellenmiyor; bir sonraki açılışta yeniden denenir.
    if (!data?.email_checked_at) {
      try {
        const token = await getToken();
        const r = await fetch('/api/trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'check' }),
        });
        if (r.ok) ({ data } = await supabase.from('users').select(cols).eq('user_id', user.id).maybeSingle());
      } catch { /* kontrol olmadan devam */ }
    }
    setEmailBlocked(!!data?.email_disposable);
    if (data?.currency) { setCurrency(data.currency); setCurrencyCode(data.currency); }

    // Günlük işlem hakkı kullanıcının kendi gününe göre sayılıyor (veritabanı
    // kuralı bu saat dilimini kullanıyor). Yolculukta değişirse güncellenir.
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && data?.timezone !== tz) {
        await supabase.from('users').upsert({ user_id: user.id, timezone: tz }, { onConflict: 'user_id' });
      }
    } catch { /* saat dilimi yoksa UTC sayılır */ }

    if (!data) setTrialAvailable(true);
    if (data) {
      // pro_until saat dilimsiz tutuluyor ve UTC yazılıyor. Olduğu gibi
      // okununca Türkiye'de süre üç saat geç bitiyordu.
      const until = data.pro_until
        ? new Date(/(Z|[+-]\d\d:?\d\d)$/.test(data.pro_until) ? data.pro_until : data.pro_until + 'Z')
        : null;
      const isStillPro = data.is_pro && until && until > new Date();
      const proExpired = data.is_pro && !isStillPro && data.pro_until;

      if (proExpired) {
        // Pro'yu tarayıcı artık yazamıyor (bkz. protect_user_privileges); süre
        // zaten pro_until'den okunuyor. "Süren doldu" ekranı her süre için bir
        // kez gösteriliyor — yoksa her açılışta yeniden çıkardı.
        const seenKey = `proExpiredSeen:${data.pro_until}`;
        let seen = false;
        try { seen = !!localStorage.getItem(seenKey); localStorage.setItem(seenKey, '1'); } catch { /* yok */ }
        if (!seen) setShowExpiredPricing(true);
      }

      setIsPro(!!isStillPro);
      setHasPaid(data.has_paid || false);
      setTrialAvailable(!data.trial_started_at && !isStillPro && !data.has_paid && !data.email_disposable);

      const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
      setTrialEndsAt(isStillPro && !data.has_paid && !data.trial_denied && trialEnd && trialEnd > new Date() ? trialEnd : null);

      if (data.trial_denied === 'mt_reused') {
        try {
          if (!localStorage.getItem('trialNoticeSeen')) setTrialNotice(true);
        } catch { setTrialNotice(true); }
      }
    }
  };

  /** Sınıra takılan kullanıcı "3 gün ücretsiz dene"ye bastı. */
  const startTrial = async () => {
    setStartingTrial(true);
    try {
      const token = await getToken();
      const r = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'start' }),
      });
      if (r.ok) setShowUpgradeModal(false);
      await checkProStatus();
    } finally {
      setStartingTrial(false);
    }
  };

  const generateReferralCode = async () => {
    if (!user) return;
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
      body: JSON.stringify({ action: 'generate' }),
    });
    const data = await res.json();
    if (data.code) setReferralCode(data.code);
  };

  const useReferralCode = async () => {
    if (!user || !referralInput.trim()) return;
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
      body: JSON.stringify({ action: 'use', code: referralInput.trim() }),
    });
    const data = await res.json();
    if (data.success) { setReferralMsg('🎉 1 ay ücretsiz Pro kazandınız!'); setIsPro(true); }
    else { setReferralMsg(data.error || 'Hata oluştu'); }
  };

  /**
   * Veritabanı satırını Account'a çevirir.
   *
   * Üç ayrı yerde elle eşleniyordu ve yeni bir sütun eklendiğinde birini
   * unutmak çok kolaydı — nitekim prop alanları eklenirken tam bu oldu.
   * Artık tek yer var.
   */
  const accountFromRow = (j: any): Account => ({
    id: j.id, user_id: j.user_id, name: j.name,
    startDate: j.start_date, startingCapital: j.starting_capital, goals: j.goals,
    checklistId: j.checklist_id || null,
    kind: (j.kind as JournalKind) || 'real',
    prop: j.kind === 'prop' ? {
      profitTarget: j.prop_profit_target ?? undefined,
      maxDailyLoss: j.prop_max_daily_loss ?? undefined,
      maxTotalLoss: j.prop_max_total_loss ?? undefined,
      drawdownType: (j.prop_drawdown_type as DrawdownType) || 'static',
    } : undefined,
  });

  /** Formdaki sayı alanı boşsa null gider — 0 ile karışmasın. */
  const num = (v: string) => (v.trim() === '' ? null : parseFloat(v));

  const journalNameFields = () => ({
    name: newJournalName.trim(),
    start_date: newJournalStartDate,
    starting_capital: parseFloat(newJournalCapital),
  });

  /** Tür 'real'e dönerse prop sütunları temizlenir; eski değerler kalmasın. */
  const propColumns = () => (newJournalKind === 'prop'
    ? {
        kind: 'prop' as const,
        prop_profit_target: num(newPropTarget),
        prop_max_daily_loss: num(newPropDaily),
        prop_max_total_loss: num(newPropTotal),
        prop_drawdown_type: newPropDD,
      }
    : {
        kind: 'real' as const,
        prop_profit_target: null,
        prop_max_daily_loss: null,
        prop_max_total_loss: null,
        prop_drawdown_type: null,
      });

  const propRules = () => (newJournalKind === 'prop' ? {
    profitTarget: num(newPropTarget) ?? undefined,
    maxDailyLoss: num(newPropDaily) ?? undefined,
    maxTotalLoss: num(newPropTotal) ?? undefined,
    drawdownType: newPropDD,
  } : undefined);

  const loadJournals = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('journals').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    const mapped = (data || []).map(accountFromRow);
    setAccounts(mapped);
    setLoading(false);
  };

  const loadTrades = async () => {
    if (!user) return;
    const { data } = await supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (data) {
      setTrades(data.map(tradeFromRow));
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

  /**
   * Journal içinde gezinme. State'i değiştirmekle kalmaz, adresi de yazar —
   * böylece tarayıcının geri tuşu bir önceki ekrana döner.
   */
  const goTo = (
    next: { view: View; journal?: Account | null; tab?: JournalTab },
    replace = false,
  ) => {
    const journal = next.journal !== undefined ? next.journal : activeJournal;
    const tab = next.tab || journalTab;
    setView(next.view);
    if (next.journal !== undefined) setActiveJournal(next.journal);
    if (next.tab) setJournalTab(next.tab);
    const path = pathForView(next.view, journal?.id, tab);
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    }
    window.scrollTo(0, 0);
  };

  // Geri/ileri tuşu: adres ne diyorsa görünümü ona getir. Journal listesi
  // dinleyicinin içinde tazeyken okunsun diye ref'te tutuluyor.
  const accountsRef = useRef<Account[]>([]);
  useEffect(() => { accountsRef.current = accounts; }, [accounts]);

  useEffect(() => {
    const onPopState = () => {
      const target = getInitialPage();
      setPage(target);
      if (target !== 'journal') return;
      const r = parseView();
      if (r.view === 'expanded') {
        const acc = accountsRef.current.find(a => a.id === r.journalId);
        // Journal silinmişse listeye düş; olmayan bir journal'ı açamayız.
        if (!acc) { setView('dashboard'); setActiveJournal(null); return; }
        setActiveJournal(acc);
        setJournalTab(r.tab);
        setView('expanded');
        return;
      }
      if (r.view === 'dashboard') setActiveJournal(null);
      setView(r.view);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sayfa doğrudan /journal/<id>/<sekme> adresiyle açıldıysa, journal'lar
  // yüklendiği anda o ekrana git.
  useEffect(() => {
    if (page !== 'journal' || accounts.length === 0 || activeJournal) return;
    const r = parseView();
    if (r.view !== 'expanded') return;
    const acc = accounts.find(a => a.id === r.journalId);
    if (acc) { setActiveJournal(acc); setJournalTab(r.tab); setView('expanded'); }
  }, [accounts, page, activeJournal]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      // Gezintiden hesaba geçti: örnek veri gitsin, gerçek veri yüklenecek.
      if (guest) {
        setGuest(false);
        try { sessionStorage.removeItem('stjGuest'); } catch { /* yok */ }
        setAccounts([]);
        setTrades([]);
        setActiveJournal(null);
        setView('dashboard');
      }
      // Giriş/kayıt tamamlandı: kullanıcıyı doğrudan journal'a al.
      if (authStage === 'auth') {
        setAuthStage('landing');
        navigate('journal', true);
      }
    } else if (page === 'journal' && !guest) {
      // Girişi olmayan biri /journal'a geldi — ana sayfaya döndür.
      navigate('home', true);
    }
  }, [isLoaded, isSignedIn, authStage, page, guest]);

  // Gezintinin örnek verisi — seçili dilde, tarayıcıda üretiliyor.
  useEffect(() => {
    if (!isGuest) return;
    const demo = demoData(language);
    setAccounts(demo.journals);
    setTrades(demo.trades);
    setActiveJournal(j => (j ? demo.journals.find(x => x.id === j.id) || null : j));
  }, [isGuest, language]);

  /** "Ücretsiz Başla": kayıt istemeden örnek verilerle uygulamaya gir. */
  const startGuest = () => {
    try { sessionStorage.setItem('stjGuest', '1'); } catch { /* yok */ }
    setGuest(true);
    setActiveJournal(null);
    setView('dashboard');
    navigate('journal');
    window.scrollTo(0, 0);
  };

  /** Gezinen biri kayıt gerektiren bir şeye bastı: pencereyi aç, işlemi durdur. */
  const needAccount = (): boolean => {
    if (!isGuest) return false;
    setShowJoin(true);
    return true;
  };

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

  const openEditJournal = (account: Account) => {
    setEditingJournal(account);
    setNewJournalName(account.name);
    setNewJournalStartDate(account.startDate ? String(account.startDate).slice(0, 10) : '');
    setNewJournalCapital(account.startingCapital != null ? String(account.startingCapital) : '');
    setNewJournalKind(account.kind || 'real');
    const pr = account.prop || {};
    setNewPropTarget(pr.profitTarget != null ? String(pr.profitTarget) : '');
    setNewPropDaily(pr.maxDailyLoss != null ? String(pr.maxDailyLoss) : '');
    setNewPropTotal(pr.maxTotalLoss != null ? String(pr.maxTotalLoss) : '');
    setNewPropDD(pr.drawdownType || 'static');
    setShowNewJournalModal(true);
  };

  const closeJournalModal = () => {
    setShowNewJournalModal(false);
    setEditingJournal(null);
    setNewJournalName(''); setNewJournalStartDate(''); setNewJournalCapital('');
    setNewJournalKind('real');
    setNewPropTarget(''); setNewPropDaily(''); setNewPropTotal(''); setNewPropDD('static');
  };

  // ── JOURNAL LİMİT KONTROLÜ ──
  const handleNewJournalClick = () => {
    if (needAccount()) return;
    if (!isPro && accounts.length >= 1) {
      setUpgradeReason('journal');
      setShowUpgradeModal(true);
      return;
    }
    setEditingJournal(null);
    setNewJournalName(suggestJournalName());
    setNewJournalStartDate(todayForDateInput());
    setNewJournalCapital('10000');
    setNewJournalKind('real');
    setNewPropTarget(''); setNewPropDaily(''); setNewPropTotal(''); setNewPropDD('static');
    setShowNewJournalModal(true);
  };

  const saveJournal = async () => {
    if (!newJournalName.trim() || !newJournalStartDate || !newJournalCapital || !user) return;

    // Düzenleme
    if (editingJournal) {
      const patch = { ...journalNameFields(), ...propColumns() };
      const { error } = await supabase.from('journals').update(patch).eq('id', editingJournal.id);
      if (error) {
        alert(language === 'tr' ? 'Journal güncellenemedi: ' + error.message : 'Could not update journal: ' + error.message);
        return;
      }
      const updated: Account = {
        ...editingJournal,
        name: patch.name,
        startDate: patch.start_date,
        startingCapital: patch.starting_capital,
        kind: patch.kind,
        prop: propRules(),
      };
      setAccounts(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setActiveJournal(prev => (prev && prev.id === updated.id ? updated : prev));
      closeJournalModal();
      return;
    }

    // Yeni kayıt
    const { data } = await supabase.from('journals').insert({
      user_id: user.id, ...journalNameFields(), ...propColumns(),
    }).select().single();
    if (data) {
      const newAccount: Account = accountFromRow(data);
      setAccounts(prev => [...prev, newAccount]);
      closeJournalModal();
      goTo({ view: 'expanded', journal: newAccount, tab: 'trades' });
    }
  };

  // ── TRADE LİMİT KONTROLÜ ──
  const handleNewTradeClick = async () => {
    if (needAccount()) return;
    if (!isPro && todayOpenCount >= FREE_DAILY_TRADES) {
      askUpgrade('daily');
      return;
    }
    goTo({ view: 'expanded', tab: 'newTrade' });
  };

  const handleAddTrade = async (trade: Trade) => {
    if (!activeJournal || !user) return;
    const { data } = await supabase.from('trades').insert({
      user_id: user.id, journal_id: activeJournal.id, date: trade.date, exit_date: trade.exitDate || null,
      symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe, order_type: trade.orderType || null, setup: trade.setup,
      risk: trade.risk, reward: trade.reward, rr: trade.rr, result: trade.result,
      pre_trade_notes: trade.preTradeNotes, post_trade_notes: trade.postTradeNotes,
      pre_trade_photos: trade.preTradePhotos, post_trade_photos: trade.postTradePhotos,
      mtf_analysis: trade.mtfAnalysis?.length ? trade.mtfAnalysis : null,
      checklist: trade.checklist?.length ? trade.checklist : null,
      ...optionalColumns(trade),
    }).select().single();
    if (data) {
      const newTrade = tradeFromRow(data);
      setTrades(prev => [newTrade, ...prev]);
      goTo({ view: 'expanded', tab: 'trades' });
      // Geçmiş bir güne, o günün hakkı dolmuşken girildiyse kilitli kaydedildi.
      if (newTrade.locked && !isPro) askUpgrade('locked');
    }
  };

  const handleUpdateTrade = async (trade: Trade) => {
    if (needAccount()) return;
    const { error } = await supabase.from('trades').update({
      date: trade.date,
      exit_date: trade.exitDate || null,
      symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe, order_type: trade.orderType || null, setup: trade.setup,
      risk: trade.risk, reward: trade.reward, rr: trade.rr, result: trade.result,
      pre_trade_notes: trade.preTradeNotes, post_trade_notes: trade.postTradeNotes,
      pre_trade_photos: trade.preTradePhotos, post_trade_photos: trade.postTradePhotos,
      mtf_analysis: trade.mtfAnalysis?.length ? trade.mtfAnalysis : null,
      checklist: trade.checklist?.length ? trade.checklist : null,
      ...optionalColumns(trade),
    }).eq('id', trade.id);

    if (error) {
      alert(language === 'tr'
        ? (language === 'tr'
        ? 'Kayıt başarısız. Fotoğraflar çok büyük olabilir, daha küçük fotoğraflar deneyin.'
        : 'Could not save. The photos may be too large — try smaller ones.')
        : 'Save failed. Photos may be too large, try smaller images.');
      return;
    }
    setTrades(prev => prev.map(tr => tr.id === trade.id ? trade : tr));
  };


  const handleCSVImport = async (importedTrades: Trade[], target: ImportTarget) => {
    if (!user) return;

    // Hedef journal: mevcut olan ya da dosya için yeni açılan
    let targetJournal: Account | null = null;
    if (target.kind === 'existing') {
      targetJournal = accounts.find(a => a.id === target.journalId) || activeJournal;
    } else {
      if (!isPro && accounts.length >= 1) {
        setUpgradeReason('journal');
        setShowUpgradeModal(true);
        return;
      }
      // Journal'ın başlangıcı, dosyadaki en eski işlemin tarihi olsun.
      const earliest = importedTrades.reduce<string | null>((min, tr) =>
        !min || new Date(tr.date) < new Date(min) ? tr.date : min, null);
      const { data, error } = await supabase.from('journals').insert({
        user_id: user.id,
        name: target.name,
        start_date: (earliest || new Date().toISOString()).slice(0, 10),
        starting_capital: 10000,
      }).select().single();
      if (error || !data) {
        alert(language === 'tr' ? 'Journal oluşturulamadı.' : 'Could not create the journal.');
        return;
      }
      targetJournal = accountFromRow(data);
      setAccounts(prev => [...prev, targetJournal as Account]);
    }
    if (!targetJournal) return;
    // Ekran zaten mevcutları eliyor; burada bir kez daha süzüyoruz ki iki
    // sekmeden aynı rapor yüklendiğinde de kopya oluşmasın.
    const known = new Set(
      trades.filter(tr => tr.journal_id === targetJournal!.id).map(tradeKey)
    );
    importedTrades = importedTrades.filter(tr => !known.has(tradeKey(tr)));

    // Bekleyen kayıtlar: işleme girerken yazılıp sonucu henüz girilmemiş olanlar.
    // Rapordaki kapanmış işlem bunlardan biriyle eşleşirse yeni satır açılmıyor,
    // o kayıt tamamlanıyor — notlar ve fotoğraflar yerinde kalıyor. MetaTrader
    // bağlantısı da aynı kuralla çalışıyor (api/ingest.ts).
    const pending = trades.filter(tr => tr.journal_id === targetJournal!.id && isOpenTrade(tr));
    const completedTrades: Trade[] = [];
    const inserted: Trade[] = [];
    for (const trade of importedTrades) {
      if (trade.result) {
        const sameId = trade.externalId
          ? pending.find(p => p.externalId === trade.externalId && p.symbol.toUpperCase() === trade.symbol.toUpperCase())
          : undefined;
        const hit = sameId || matchOpenTrade(
          { symbol: trade.symbol, type: trade.type, openPrice: trade.entryPrice || 0, openTime: trade.date },
          pending.filter(p => !p.externalId),
        );
        if (hit) {
          // Kapanış bilgisi yazılıyor; kullanıcının girdiği risk, R:R, stop ve
          // giriş fiyatı duruyorsa dokunulmuyor, yalnız boşsa dolduruluyor.
          const patch: any = { date: trade.date, exit_date: trade.exitDate || null, reward: trade.reward || 0, result: trade.result };
          if (trade.externalId) patch.external_id = trade.externalId;
          if (trade.exitPrice) patch.exit_price = trade.exitPrice;
          if (!(Number(hit.risk) > 0) && trade.risk) patch.risk = trade.risk;
          if (!hit.rr && trade.rr) patch.rr = trade.rr;
          if (hit.stopLoss == null && trade.stopLoss) patch.stop_loss = trade.stopLoss;
          if (hit.entryPrice == null && trade.entryPrice) patch.entry_price = trade.entryPrice;
          const { data } = await supabase.from('trades').update(patch).eq('id', hit.id).select().single();
          if (data) {
            completedTrades.push(tradeFromRow(data));
            pending.splice(pending.indexOf(hit), 1);
            continue;
          }
        }
      }
      const { data } = await supabase.from('trades').insert({
        user_id: user.id, journal_id: targetJournal.id, date: trade.date, exit_date: trade.exitDate || null,
        symbol: trade.symbol, type: trade.type, timeframe: trade.timeframe || '',
        setup: trade.setup || '', risk: trade.risk || 0, reward: trade.reward || 0,
        rr: trade.rr || '', result: trade.result,
        pre_trade_notes: trade.preTradeNotes || '', post_trade_notes: trade.postTradeNotes || '',
        pre_trade_photos: [], post_trade_photos: [],
        external_id: trade.externalId || null,
        ...optionalColumns(trade),
      }).select().single();
      if (data) inserted.push(tradeFromRow(data));
    }
    setTrades(prev => [...inserted, ...prev.map(tr => completedTrades.find(c => c.id === tr.id) || tr)]);
    // Yeni journal açıldıysa doğrudan içine gir.
    if (target.kind === 'new') {
      goTo({ view: 'expanded', journal: targetJournal, tab: 'trades' });
    }
    // Hiçbiri atılmadı; günlük hakkı aşanlar kilitli kaydedildi.
    const lockedNow = inserted.filter(tr => tr.locked).length;
    if (lockedNow > 0 && !isPro) {
      setImportLockedCount(lockedNow);
      askUpgrade('importLocked');
    }
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
    if (needAccount()) return;
    // Ücretsiz planda silme yok (veritabanı da izin vermiyor): silip yeniden
    // girerek günlük hakkı sıfırlamak olmasın.
    if (!isPro) { askUpgrade('delete'); return; }
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

  /** İşlemleri başka bir journal'a taşır; not, fotoğraf, checklist hepsi gider. */
  const handleMoveTrades = async (ids: string[], targetJournalId: string) => {
    if (needAccount()) return;
    if (!user || ids.length === 0) return;
    const { error } = await supabase
      .from('trades')
      .update({ journal_id: targetJournalId })
      .in('id', ids)
      .eq('user_id', user.id);
    if (error) {
      alert(language === 'tr' ? 'İşlemler taşınamadı.' : 'The trades could not be moved.');
      return;
    }
    setTrades(prev => prev.map(tr =>
      ids.includes(tr.id)
        ? { ...tr, journal_id: targetJournalId, accountId: targetJournalId }
        : tr
    ));
  };

  /** Seçilen checklist journal'da kalsın: her işlemde yeniden seçilmesin. */
  const handleChecklistSelect = async (checklistId: string) => {
    if (!activeJournal || !user) return;
    setAccounts(prev => prev.map(a => (a.id === activeJournal.id ? { ...a, checklistId } : a)));
    setActiveJournal(j => (j ? { ...j, checklistId } : j));
    await supabase.from('journals').update({ checklist_id: checklistId }).eq('id', activeJournal.id);
  };

  const handleDeleteMultiple = async (ids: string[]) => {
    if (needAccount()) return;
    if (!isPro) { askUpgrade('delete'); return; }
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
    // Silinen journal'ın adresi geçmişte kalmasın: geri tuşu oraya dönmesin.
    if (activeJournal?.id === accountToDelete) goTo({ view: 'dashboard', journal: null }, true);
    setAccountToDelete(null);
  };

  const openJournal = (account: Account) => goTo({ view: 'expanded', journal: account, tab: 'trades' });

  /**
   * MetaTrader düğmesi — İçe Aktar'ın yanında. Journal'ın içinden: doğrudan o
   * journal'ın bağlantı sayfası. Journal listesinden: önce hedef seçilir (yeni
   * ya da mevcut), sonra o journal'ın bağlantı sayfasına gidilir.
   */
  const [showMTPicker, setShowMTPicker] = useState(false);
  const handleMTTarget = async (target: MTTarget) => {
    if (!user) return;
    if (target.kind === 'existing') {
      const acc = accounts.find(a => a.id === target.journalId);
      setShowMTPicker(false);
      if (acc) goTo({ view: 'expanded', journal: acc, tab: 'mtConnect' });
      return;
    }
    if (!isPro && accounts.length >= 1) {
      setShowMTPicker(false);
      setUpgradeReason('journal');
      setShowUpgradeModal(true);
      return;
    }
    // Sermaye varsayılan 10.000 ile açılıyor; uzman ilk bağlandığında hesabın
    // gerçek başlangıç sermayesini kendisi yazıyor.
    const { data, error } = await supabase.from('journals').insert({
      user_id: user.id,
      name: target.name,
      start_date: new Date().toISOString().slice(0, 10),
      starting_capital: 10000,
    }).select().single();
    if (error || !data) {
      alert(language === 'tr' ? 'Journal oluşturulamadı.' : 'Could not create the journal.');
      return;
    }
    const acc = accountFromRow(data);
    setAccounts(prev => [...prev, acc]);
    setShowMTPicker(false);
    goTo({ view: 'expanded', journal: acc, tab: 'mtConnect' });
  };

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
    if (needAccount()) return;
    if (!activeJournal) return;
    await supabase.from('journals').update({ goals }).eq('id', activeJournal.id);
    setAccounts(prev => prev.map(a => a.id === activeJournal.id ? { ...a, goals } : a));
    setActiveJournal(prev => prev ? { ...prev, goals } : prev);
  };

  const filteredTrades = activeJournal ? trades.filter(tr => tr.accountId === activeJournal.id) : [];
  /**
   * İstatistik, takvim, hedef ve disiplin kilitli işlemleri saymaz — yoksa
   * gizli sonuç rakamlardan okunabilirdi. Liste ise hepsini gösterir.
   */
  const openTrades = isPro ? trades : trades.filter(tr => !tr.locked);
  const filteredOpen = isPro ? filteredTrades : filteredTrades.filter(tr => !tr.locked);
  /** Bugün (kullanıcının günü) kaydedilmiş açık işlem sayısı — ücretsiz planın sayacı. */
  const todayOpenCount = (() => {
    const today = new Date().toDateString();
    return trades.filter(tr => !tr.locked && new Date(tr.date).toDateString() === today).length;
  })();

  const getJournalStats = (accountId: string) => {
    const jt = openTrades.filter(tr => tr.accountId === accountId);
    const wins = jt.filter(isWinTrade);
    const losses = jt.filter(isLossTrade);
    // Başa baş işlemler ne kazanç ne kayıp — oranın paydasına girmezler.
    const decided = wins.length + losses.length;
    const winRate = decided > 0 ? ((wins.length / decided) * 100).toFixed(0) : '0';
    const grossProfit = wins.reduce((s, tr) => s + winAmount(tr), 0);
    const grossLoss = losses.reduce((s, tr) => s + lossAmount(tr), 0);
    const netPnL = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';
    const locked = isPro ? 0 : trades.filter(tr => tr.accountId === accountId && tr.locked).length;
    return { total: jt.length, winRate, netPnL, profitFactor, open: jt.filter(isOpenTrade).length, locked };
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
  // Dosya biçimi butonun işi değil: CSV de HTML de kabul ediliyor.
  const importLabel = language === 'tr' ? 'İçe Aktar' : 'Import';

  // ── PORTAL KABUĞU ──
  const navKey: NavKey =
    view === 'sessions' ? 'sessions'
    : view === 'news' ? 'news'
    : view === 'discipline' ? 'discipline'
    : view === 'checklists' ? 'checklists'
    : view === 'propReview' ? 'propReview'
    : view === 'pricing' ? 'pricing'
    : view === 'expanded' ? (journalTab as NavKey)
    : 'journals';

  // Tarayıcı sekmesinin başlığı hangi ekranda olunduğunu söylesin (ana sayfa
  // ve Yardım/Değişiklikler kendi başlıklarını kendileri koyuyor).
  useEffect(() => {
    if (page !== 'journal') return;
    const label = typeof shellTitle === 'string' ? shellTitle : '';
    document.title = label ? `${label} · Simple Trading Journal` : 'Simple Trading Journal';
  });

  const handleNav = (key: NavKey) => {
    if (key === 'home') { navigate('home'); return; }
    if (key === 'help') { navigate('help'); return; }
    if (key === 'referral') { if (!needAccount()) setShowReferral(true); return; }
    if (key === 'pricing') { goTo({ view: 'pricing' }); return; }
    if (key === 'sessions') { goTo({ view: 'sessions', journal: null }); return; }
    if (key === 'news') { goTo({ view: 'news', journal: null }); return; }
    if (key === 'discipline') { goTo({ view: 'discipline', journal: null }); return; }
    if (key === 'checklists') { if (!needAccount()) goTo({ view: 'checklists', journal: null }); return; }
    if (key === 'propReview') { goTo({ view: 'propReview', journal: null }); return; }
    if (key === 'journals') { goTo({ view: 'dashboard', journal: null }); return; }
    // Yeni işlem, plan limitlerinden geçmeli.
    if (key === 'newTrade') { handleNewTradeClick(); return; }
    if (activeJournal) goTo({ view: 'expanded', tab: key as JournalTab });
  };

  const shellTitle =
    view === 'sessions' ? t('sessionsTab')
    : view === 'news' ? t('newsTab')
    : view === 'discipline' ? t('disciplineTab')
    : view === 'checklists' ? t('checklistsTab')
    : view === 'propReview' ? t('propReviewTab')
    : view === 'pricing' ? pricingLabel
    : view === 'expanded' && journalTab === 'newTrade' ? t('newTradeTab')
    : view === 'expanded' && activeJournal ? activeJournal.name
    : t('myJournals');

  const shellSubtitle =
    view === 'expanded' && journalTab === 'newTrade' && activeJournal
      ? activeJournal.name
      : view === 'expanded' && activeJournal
      ? [formatDate(activeJournal.startDate), activeJournal.startingCapital ? `${cur()}${int(activeJournal.startingCapital)}` : null]
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
      <>
      <button onClick={() => { if (!needAccount()) setShowCSVImport(true); }} title={importLabel}
        className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium"
        style={pillBtn}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
        <Upload className="w-4 h-4" />
        <span className="hidden xl:inline">{importLabel}</span>
      </button>
      {/* Telefonda da görünür (simge olarak): sol menüde artık MetaTrader yok. */}
      <button onClick={() => { if (!needAccount()) setShowMTPicker(true); }} title={t('mtConnectTab')}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium"
        style={pillBtn}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
        <Plug className="w-4 h-4" />
        <span className="hidden xl:inline">{t('mtConnectTab')}</span>
      </button>
      <button onClick={handleNewJournalClick}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
        style={{ background: '#8b5cf6', color: '#fff', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">{t('newJournal')}</span>
      </button>
      </>
    ) : view === 'expanded' && journalTab !== 'newTrade' ? (
      <>
        <button onClick={() => setPrintJob({ trades: filteredTrades, single: false })}
          disabled={filteredTrades.length === 0}
          title={t('printJournal')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          style={pillBtn}
          onMouseEnter={e => { if (filteredTrades.length) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
          <Printer className="w-4 h-4" />
          <span className="hidden xl:inline">{t('printPdf')}</span>
        </button>
        <button onClick={() => { if (!needAccount()) setShowCSVImport(true); }} title={importLabel}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium"
          style={pillBtn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
          <Upload className="w-4 h-4" />
          <span className="hidden xl:inline">{importLabel}</span>
        </button>
        <button onClick={() => { if (!needAccount()) goTo({ view: 'expanded', tab: 'mtConnect' }); }} title={t('mtConnectTab')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium"
          style={journalTab === 'mtConnect' ? { ...pillBtn, background: 'rgba(139,92,246,0.15)', color: '#fff', border: '1px solid rgba(139,92,246,0.35)' } : pillBtn}
          onMouseEnter={e => { if (journalTab !== 'mtConnect') (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { if (journalTab !== 'mtConnect') (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
          <Plug className="w-4 h-4" />
          <span className="hidden xl:inline">{t('mtConnectTab')}</span>
        </button>
        <button onClick={handleNewTradeClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
          style={{ background: '#8b5cf6', color: '#fff', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t('newTradeTab')}</span>
          {/* Google Flow'daki kredi gibi: ücretsiz planda bugünkü hak görünsün. */}
          {!isPro && !isGuest && (
            <span className="text-[11.5px] font-mono px-1.5 py-0.5 rounded-full"
              title={t('todayQuotaTitle')}
              style={{ background: 'rgba(255,255,255,0.18)' }}>
              {Math.min(todayOpenCount, FREE_DAILY_TRADES)}/{FREE_DAILY_TRADES}
            </span>
          )}
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
    <div className="app-ground min-h-screen font-sans" style={{ color: '#fff' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── PRO SÜRESİ DOLDU EKRANI ── */}
      {showExpiredPricing && page === 'journal' && (
        <Suspense fallback={null}>
        <PricingPage
          onboardingMode
          onFreeStart={() => setShowExpiredPricing(false)}
          onProStart={() => { setShowExpiredPricing(false); setShowPaymentModal(true); }}
          expiredMode
        />
        </Suspense>
      )}

      {/* ── Deneme erken bitti: aynı MetaTrader hesabı ── */}
      {trialNotice && page === 'journal' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-display text-[20px] font-medium text-white">{t('trialEndedTitle')}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('trialEndedMtReused')}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { try { localStorage.setItem('trialNoticeSeen', '1'); } catch { /* yok */ } setTrialNotice(false); }}
                className="px-4 py-2 text-sm rounded-xl" style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)' }}>
                {t('trialEndedOk')}
              </button>
              <button onClick={() => { try { localStorage.setItem('trialNoticeSeen', '1'); } catch { /* yok */ } setTrialNotice(false); setShowPaymentModal(true); }}
                className="cta px-4 py-2 text-sm font-semibold rounded-xl" style={{ background: '#8b5cf6', color: '#fff' }}>
                {t('trialEndedUpgrade')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPaymentModal && <Suspense fallback={null}><PaymentModal onClose={() => setShowPaymentModal(false)} /></Suspense>}

      {/* ── UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="p-8 relative w-full max-w-md my-8"
            style={{ ...modalCard, background: 'linear-gradient(180deg, rgba(139,92,246,0.12), rgba(18,19,31,1) 45%)', border: '1px solid rgba(139,92,246,0.22)' }}>
            <button onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 end-4 p-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5" style={{ color: '#a78bfa' }} />
              <h2 className="font-display text-[22px] text-white" style={{ letterSpacing: '-0.01em' }}>
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
                  %{prices.savings}
                </span>
              </span>
            </div>

            <div className="mb-2">
              <span className="text-5xl font-bold text-white">
                {prices.fmt(modalBilling === 'monthly' ? prices.monthly : prices.yearlyMonthly)}
              </span>
              <span className="text-sm ms-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {language === 'tr' ? '/ ay' : '/ month'}
              </span>
              {modalBilling === 'yearly' && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {(language === 'tr' ? 'Yıllık {p} faturalandırılır' : 'Billed {p}/year').replace('{p}', prices.fmt(prices.yearly))}
                </p>
              )}
            </div>

            {trialAvailable ? (
              <div className="mt-5 mb-6">
                {/* Deneme hakkı olan kullanıcıya önce deneme: kart istemeden
                    bütün Pro'yu görsün, satın alma kararını ondan sonra versin. */}
                <button onClick={startTrial} disabled={startingTrial}
                  className="w-full py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ background: '#8b5cf6', color: '#fff' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
                  {t('trialStartCta')}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34d399' }} />
                  <span className="text-xs" style={{ color: '#34d399' }}>{t('trialNoCard')}</span>
                </div>
                <button onClick={() => { setShowUpgradeModal(false); setShowPaymentModal(true); }}
                  className="w-full mt-3 text-xs underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {t('trialOrUpgrade')}
                </button>
              </div>
            ) : (
              <button onClick={() => { setShowUpgradeModal(false); setShowPaymentModal(true); }}
                className="w-full py-3 rounded-full text-sm font-medium mt-5 mb-6 transition-all"
                style={{ background: '#8b5cf6', color: '#fff' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
                {language === 'tr' ? "Pro'ya Geç" : 'Upgrade to Pro'}
              </button>
            )}

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
              className="w-full py-2 rounded-full text-sm transition-all text-center"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
              {language === 'tr' ? 'Şimdilik Devam Et' : 'Continue for Now'}
            </button>
          </div>
        </div>
      )}

      {/* MetaTrader: journal listesinden hedef seçimi */}
      {showMTPicker && user && (
        <Suspense fallback={null}>
        <MTTargetPicker
          journals={accounts.map(a => ({ id: a.id, name: a.name }))}
          onChoose={handleMTTarget}
          onClose={() => setShowMTPicker(false)}
        />
        </Suspense>
      )}

      {/* CSV Import */}
      {showCSVImport && user && (
        <Suspense fallback={null}>
        <CSVImport
          onImport={handleCSVImport}
          onClose={() => setShowCSVImport(false)}
          journalId={view === 'expanded' ? activeJournal?.id : undefined}
          journalName={view === 'expanded' ? activeJournal?.name : undefined}
          userId={user.id}
          existingKeys={view === 'expanded' && activeJournal
            ? trades.filter(tr => tr.journal_id === activeJournal.id).map(tradeKey)
            : []}
          journals={accounts.map(a => ({ id: a.id, name: a.name }))}
          keysByJournal={view === 'expanded' ? {} : Object.fromEntries(
            accounts.map(a => [a.id, trades.filter(tr => tr.journal_id === a.id).map(tradeKey)]))}
        />
        </Suspense>
      )}

      {/* AUTH */}
      {/* Yardım ve Değişiklikler: giriş gerekmeyen, herkese aynı iki sayfa. */}
      {isInfoPage && (
        <Suspense fallback={<div className="min-h-screen" style={{ background: '#0d0e1a' }} />}>
          <InfoPage
            kind={page as 'help' | 'changelog'}
            onHome={() => navigate('home')}
            onOther={() => navigate(page === 'help' ? 'changelog' : 'help')}
            cta={isSignedIn
              ? { label: t('guestGoJournal'), onClick: () => navigate('journal') }
              : { label: t('guestStartFree'), onClick: startGuest }}
          />
        </Suspense>
      )}

      {!isInfoPage && isLoaded && !isSignedIn && !(isGuest && page === 'journal' && authStage !== 'auth') && (<>
        {(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = urlParams.get('ref');
          if (refCode) localStorage.setItem('pendingRefCode', refCode);
          return null;
        })()}

        {authStage === 'landing' ? (
          <Suspense fallback={<div className="min-h-screen" style={{ background: '#0d0e1a' }} />}>
          <LandingPage
            onGetStarted={startGuest}
            onSignIn={() => goToAuth('signin')}
          />
          </Suspense>
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
      </>)}

      {printJob && activeJournal && (
        <Suspense fallback={null}>
        <PrintableReport
          journal={activeJournal}
          trades={printJob.trades}
          single={printJob.single}
          onDone={() => setPrintJob(null)}
        />
        </Suspense>
      )}

      {!isInfoPage && (isSignedIn || (isGuest && page === 'journal' && authStage !== 'auth')) && (
        <PlanProvider value={isGuest
          ? { isPro: true, askUpgrade: () => setShowJoin(true), isGuest: true, requireAccount: () => setShowJoin(true) }
          : { isPro, askUpgrade, isGuest: false, requireAccount: () => {} }}>
        {/* Hesap: plan bilgisi ve hesabı tamamen silme (KVKK / GDPR). */}
        {showAccount && !isGuest && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="w-full max-w-md rounded-2xl p-7 space-y-5" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-[21px] font-medium text-white">{t('accountTitle')}</h2>
                  <p className="text-sm mt-1 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
                <button onClick={() => setShowAccount(false)} className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                {trialEndsAt ? t('accountPlanTrial') : isPro ? t('accountPlanPro') : t('accountPlanFree')}
              </div>

              {/* Para birimi: yalnızca simge, kur çevrimi yok (bkz. lib/format.ts). */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('accountCurrency')}</label>
                <select value={currencyCode}
                  onChange={async e => {
                    const code = e.target.value;
                    setCurrency(code);
                    setCurrencyCode(code);
                    if (user) await supabase.from('users').upsert({ user_id: user.id, currency: code }, { onConflict: 'user_id' });
                  }}
                  className="w-full outline-none text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '12px', padding: '10px 14px' }}>
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} style={{ background: '#1a1b2e', color: '#fff' }}>{c.code} ({c.symbol.trim()})</option>
                  ))}
                </select>
                <p className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('accountCurrencyNote')}</p>
              </div>

              {/* Saat dilimi: günlük hak bu dilime göre sayılıyor; tarayıcıdan geliyor. */}
              <div>
                <div className="text-[12px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('accountTimezone')}</div>
                <div className="text-sm font-mono" style={{ color: '#fff' }}>
                  {(() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; } })()}
                </div>
                <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('accountTimezoneNote')}</p>
              </div>

              <button onClick={() => { setShowAccount(false); openUserProfile(); }}
                className="w-full py-2.5 rounded-full text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {t('accountProfile')}
              </button>

              {!deleteStep ? (
                <button onClick={() => setDeleteStep(true)} className="text-[13px] underline underline-offset-2" style={{ color: '#f87171' }}>
                  {t('accountDelete')}
                </button>
              ) : (
                <div className="space-y-3 pt-1" style={{ borderTop: '1px solid rgba(248,113,113,0.2)' }}>
                  <p className="text-[13px] leading-relaxed pt-3" style={{ color: 'rgba(255,255,255,0.65)' }}>{t('accountDeleteWarn')}</p>
                  <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {t('accountDeleteType').replace('{w}', t('accountDeleteWord'))}
                  </p>
                  <input value={deleteWord} onChange={e => setDeleteWord(e.target.value)} autoFocus
                    className="w-full outline-none text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(248,113,113,0.3)', color: '#fff', borderRadius: '12px', padding: '10px 14px' }} />
                  {deleteError && <p className="text-[13px]" style={{ color: '#f87171' }}>{deleteError}</p>}
                  <button
                    disabled={deleting || deleteWord.trim().toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US') !== t('accountDeleteWord')}
                    onClick={async () => {
                      setDeleting(true);
                      setDeleteError('');
                      try {
                        const token = await getToken();
                        const r = await fetch('/api/account', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ action: 'delete', confirm: true }),
                        });
                        if (!r.ok) throw new Error();
                        setShowAccount(false);
                        await signOut();
                        navigate('home', true);
                      } catch {
                        setDeleteError(t('accountDeleteFailed'));
                      } finally {
                        setDeleting(false);
                      }
                    }}
                    className="w-full py-3 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#dc2626', color: '#fff' }}>
                    {deleting ? t('accountDeleting') : t('accountDeleteConfirm')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Gezinen biri kayıt gerektiren bir şeye bastı. */}
        {showJoin && isGuest && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="w-full max-w-md rounded-2xl p-7 space-y-4" style={{ background: '#1a1b2e', border: '1px solid rgba(139,92,246,0.25)' }}>
              <h2 className="font-display text-[21px] font-medium text-white">{t('joinTitle')}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('joinBody')}</p>
              <button onClick={() => { setShowJoin(false); goToAuth('signup'); }}
                className="cta w-full py-3 rounded-full text-sm font-semibold" style={{ background: '#8b5cf6', color: '#fff' }}>
                {t('guestSignUp')}
              </button>
              <div className="flex items-center justify-between text-[13px] pt-1">
                <button onClick={() => { setShowJoin(false); goToAuth('signin'); }} style={{ color: '#a78bfa' }}>
                  {t('guestSignIn')}
                </button>
                <button onClick={() => setShowJoin(false)} style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {t('joinContinue')}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tek kullanımlık e-postayla açılmış hesap: ne deneme ne ücretsiz plan.
            İleride e-postayla ulaşabileceğimiz gerçek bir adres istiyoruz. */}
        {emailBlocked && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: '#0d0e1a' }}>
            <div className="w-full max-w-md rounded-2xl p-7 space-y-4 text-center"
              style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="font-display text-[21px] font-medium text-white">{t('emailBlockedTitle')}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('emailBlockedBody')}</p>
              <button onClick={() => signOut()}
                className="cta w-full py-3 rounded-full text-sm font-semibold" style={{ background: '#8b5cf6', color: '#fff' }}>
                {t('emailBlockedSignOut')}
              </button>
            </div>
          </div>
        )}
        {page === 'home' ? (
          /* Giriş yapmış kullanıcı için ana sayfa — CTA'lar journal'a götürür */
          <Suspense fallback={<div className="min-h-screen" style={{ background: '#0d0e1a' }} />}>
          <LandingPage
            signedIn
            account={{
              label: user?.firstName || user?.emailAddresses[0]?.emailAddress,
              image: user?.imageUrl,
              isPro,
              onSignOut: () => signOut(),
            }}
            onGetStarted={() => navigate('journal')}
            onSignIn={() => navigate('journal')}
          />
          </Suspense>
        ) : (
        <>

        {/* Referral Modal */}
        {showReferral && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="p-7 w-full max-w-md space-y-6" style={modalCard}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[22px] text-white" style={{ letterSpacing: '-0.01em' }}>{language === 'tr' ? 'Referans Kodu Oluştur' : 'Create Referral Code'}</h3>
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
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
                    body: JSON.stringify({ action: 'generate_new', splitType, code: newCode }),
                  });
                  const data = await res.json();
                  if (data.code) {
                    setReferralCode(data.code);
                    setReferralMsg('');
                  }
                }}
                disabled={!referralInput}
                className="w-full py-3 rounded-full text-sm font-medium transition-all disabled:opacity-40"
                style={{ background: '#34d399', color: '#04140d', transition: TRANSITION }}>
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
                      className="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', transition: TRANSITION }}>
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
            <div className="p-7 w-full max-w-md" style={modalCard}>
              <h3 className="font-display text-[22px] mb-2" style={{ color: '#f87171', letterSpacing: '-0.01em' }}>{t('deleteAccountTitle')}</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('deleteAccountDesc')}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setAccountToDelete(null)} style={quietBtn}>{t('cancel')}</button>
                <button onClick={confirmDeleteAccount} className="rounded-full"
                  style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', padding: '10px 20px', fontSize: '14px', fontWeight: 500, transition: TRANSITION }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#dc2626'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.15)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}>
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Journal Modal */}
        {showNewJournalModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            {/* Prop hesapta dört alan daha var. Aynı dar kutuda alt alta
                dizilince modal ekrandan taşıyordu; kutu genişliyor ve alanlar
                iki sütuna giriyor, böylece satır sayısı yarıya iniyor. */}
            <div className={`p-7 w-full max-h-[88vh] overflow-y-auto ${newJournalKind === 'prop' ? 'max-w-2xl' : 'max-w-md'}`}
              style={modalCard}>
              <h3 className="font-display text-[22px] mb-1.5" style={{ letterSpacing: '-0.01em' }}>
                {editingJournal ? t('editJournal') : t('newJournal')}
              </h3>
              <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {editingJournal ? t('editJournalDesc') : t('newJournalDesc')}
              </p>
              <div className="space-y-4">
                {/* Tür en üstte: altındaki alanların hangileri olacağını o
                    belirliyor, sonra sorulursa kullanıcı iki kez doldurur. */}
                <div>
                  <label style={uiLabel}>{t('journalKind')}</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {([
                      { k: 'real' as const, title: t('kindReal'), desc: t('kindRealDesc') },
                      { k: 'prop' as const, title: t('kindProp'), desc: t('kindPropDesc') },
                    ]).map(o => {
                      const on = newJournalKind === o.k;
                      return (
                        <button key={o.k} type="button" onClick={() => setNewJournalKind(o.k)}
                          data-on={on}
                          className="ui-nav text-start px-3.5 py-3 rounded-xl"
                          style={{ border: `1px solid ${on ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
                          <div className="text-[13.5px] font-medium">{o.title}</div>
                          <div className="text-[11.5px] leading-snug mt-0.5" style={{ opacity: 0.65 }}>{o.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={uiLabel}>{t('journalName')}</label>
                  <input type="text" value={newJournalName} onChange={e => setNewJournalName(e.target.value)} placeholder={t('journalNamePlaceholder')} autoFocus
                    onFocus={e => e.target.select()}
                    style={uiInput} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label style={uiLabel}>{t('startDate')}</label>
                    <input type="date" value={newJournalStartDate} onChange={e => setNewJournalStartDate(e.target.value)}
                      style={{ ...uiInput, colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label style={uiLabel}>{t('startingCapital')}</label>
                    <div className="relative">
                      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{cur().trim()}</span>
                      <input type="number" min="0" step="0.01" value={newJournalCapital} onChange={e => setNewJournalCapital(e.target.value)} placeholder="10000"
                        className="font-mono"
                        style={{ ...uiInput, paddingInlineStart: '30px' }} />
                    </div>
                  </div>
                </div>

                {/* Prop kuralları yalnızca prop hesapta sorulur. Gerçek hesapta
                    bu alanlar yok — kimse kendi parasına kâr hedefi dayatmaz. */}
                {newJournalKind === 'prop' && (
                  <div className="pt-4 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      {t('propRulesHint')}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {([
                        { label: t('profitTarget'), v: newPropTarget, set: setNewPropTarget, ph: '10000' },
                        { label: t('maxDailyLoss'), v: newPropDaily, set: setNewPropDaily, ph: '5000' },
                        { label: t('maxTotalLoss'), v: newPropTotal, set: setNewPropTotal, ph: '10000' },
                      ]).map(f => {
                        const cap = parseFloat(newJournalCapital);
                        const n = parseFloat(f.v);
                        // Şirketler kuralı yüzdeyle ilan eder, kullanıcı parayla
                        // düşünür. İkisini birden göstermek yanlış rakamı anında
                        // fark ettiriyor.
                        const pct = cap > 0 && n > 0 ? `%${((n / cap) * 100).toFixed(1).replace(/\.0$/, '')}` : null;
                        return (
                          <div key={f.label}>
                            <label style={uiLabel}>{f.label}</label>
                            <div className="relative">
                              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{cur().trim()}</span>
                              <input type="number" min="0" step="0.01" value={f.v} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                                className="font-mono" style={{ ...uiInput, paddingInlineStart: '30px' }} />
                              {pct && (
                                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[12px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div>
                        <label style={uiLabel}>{t('drawdownType')}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { k: 'static' as const, label: t('ddStatic') },
                            { k: 'trailing' as const, label: t('ddTrailing') },
                          ]).map(o => (
                            <button key={o.k} type="button" onClick={() => setNewPropDD(o.k)}
                              data-on={newPropDD === o.k}
                              className="ui-nav text-start px-3 py-2.5 rounded-xl text-[12px] leading-snug"
                              style={{ border: `1px solid ${newPropDD === o.k ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeJournalModal} style={quietBtn}>{t('cancel')}</button>
                <button onClick={saveJournal} disabled={!newJournalName.trim() || !newJournalStartDate || !newJournalCapital}
                  className="rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                  style={primaryBtn}>{editingJournal ? t('save') : t('newJournal')}</button>
              </div>
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
          trialDaysLeft={trialEndsAt ? Math.max(1, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000)) : undefined}
          userLabel={user?.firstName || user?.emailAddresses[0]?.emailAddress}
          userImage={user?.imageUrl}
          onSignOut={() => signOut()}
          guest={isGuest ? { onSignUp: () => goToAuth('signup'), onSignIn: () => goToAuth('signin') } : undefined}
          onOpenAccount={() => { setShowAccount(true); setDeleteStep(false); setDeleteWord(''); setDeleteError(''); }}
          languageMenu={languageMenu}
        >
          {isGuest && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.22)' }}>
              <p className="text-[13.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('guestBanner')}</p>
              <button onClick={() => goToAuth('signup')}
                className="cta px-4 py-1.5 rounded-full text-[13px] font-semibold flex-shrink-0" style={{ background: '#8b5cf6', color: '#fff' }}>
                {t('guestSignUp')}
              </button>
            </div>
          )}
          <Suspense fallback={
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }} />
            </div>
          }>
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }} />
            </div>
          )}

          {!loading && view === 'pricing' && (
            <PricingPage
              freeLabel={isGuest ? t('guestSignUp') : isPro ? t('pricingBackToJournals') : t('pricingCurrentPlan')}
              freeDisabled={!isPro && !isGuest}
              onFreeStart={() => { if (!needAccount()) goTo({ view: 'dashboard', journal: null }); }}
              proLabel={isGuest ? t('trialStartCta')
                : trialEndsAt ? t('pricingTrialActive')
                : isPro ? t('pricingCurrentPlan')
                : trialAvailable ? t('trialStartCta')
                : t('trialEndedUpgrade')}
              proDisabled={!isGuest && isPro}
              onProStart={() => {
                if (needAccount()) return;
                if (trialAvailable) startTrial();
                else setShowPaymentModal(true);
              }}
            />
          )}

          {!loading && view === 'sessions' && <SessionsView />}
          {!loading && view === 'news' && <NewsView />}
          {!loading && view === 'checklists' && <ChecklistLibrary />}
          {!loading && view === 'propReview' && <PropEvaluation />}

          {!loading && view === 'discipline' && (
            <DisciplineView
              trades={openTrades.filter(tr => isGuest || tr.user_id === user?.id)}
              journalCount={accounts.length}
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
              onDelete={id => {
                if (needAccount()) return;
                if (!isPro) { askUpgrade('delete'); return; }
                setAccountToDelete(id);
              }}
              onEdit={acc => { if (!needAccount()) openEditJournal(acc); }}
            />
          )}

          {!loading && view === 'expanded' && activeJournal && journalTab === 'newTrade' && (
            <div className="max-w-4xl">
              <TradeForm onSave={handleAddTrade} isPro={isPro} hideTitle
                checklistId={activeJournal.checklistId}
                onChecklistSelect={handleChecklistSelect} />
            </div>
          )}

          {!loading && view === 'expanded' && activeJournal && activeStats && journalTab !== 'newTrade' && (
            <div>
              {/* Journal özeti — kart yok, hizalı sayı sütunları.
                  Takvim ve istatistikler kendi özetlerini gösterir; ikisini üst
                  üste koymak aynı dört sayıyı iki kez okutur. */}
              {/* Prop hesapta sınırlar her şeyden önce gelir: kaç işlem
                  yaptığından önce ne kadar yerin kaldığını görmen lazım.
                  Takvim ve istatistik sekmeleri kendi özetlerini gösterdiği
                  için oralarda tekrarlanmıyor. */}
              {activeJournal.kind === 'prop' && journalTab !== 'stats' && journalTab !== 'calendar' && journalTab !== 'mtConnect' && (
                <PropStatus account={activeJournal} trades={filteredOpen} />
              )}

              {journalTab !== 'stats' && journalTab !== 'calendar' && journalTab !== 'mtConnect' && (
              <div className="flex items-baseline gap-8 sm:gap-14 flex-wrap mb-10 pb-10"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: t('totalTrades'), value: String(activeStats.total), color: 'rgba(255,255,255,0.85)' },
                  { label: t('winRate'), value: `%${activeStats.winRate}`, color: 'rgba(255,255,255,0.85)' },
                  { label: t('netProfit'), value: signedMoney(activeStats.netPnL), color: activeStats.netPnL >= 0 ? '#34d399' : '#f87171' },
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
              )}

              {journalTab === 'trades' && <TradeHistory trades={filteredTrades} journalName={activeJournal.name} onDelete={handleDeleteTrade} onDeleteMultiple={handleDeleteMultiple} onUpdate={handleUpdateTrade} onPrintTrade={trade => setPrintJob({ trades: [trade], single: true })}
                otherJournals={accounts.filter(a => a.id !== activeJournal.id).map(a => ({ id: a.id, name: a.name }))}
                onMoveTrades={handleMoveTrades} account={activeJournal} />}
              {journalTab === 'calendar' && <CalendarView trades={filteredOpen} onDelete={handleDeleteTrade}
                lockedTrades={isPro ? [] : filteredTrades.filter(tr => tr.locked)} />}
              {journalTab === 'stats' && <TradeHistory trades={filteredOpen} onDelete={handleDeleteTrade} onDeleteMultiple={handleDeleteMultiple} onUpdate={handleUpdateTrade} account={activeJournal} statsOnly />}
              {journalTab === 'goals' && <GoalsView trades={filteredOpen} account={activeJournal} onUpdateGoals={handleUpdateGoals} />}
              {journalTab === 'mtConnect' && <MTConnect journalId={activeJournal.id} journalName={activeJournal.name} />}
            </div>
          )}
          </Suspense>
        </AppShell>

        </>
        )}
        </PlanProvider>
      )}
    </div>
  );
}
