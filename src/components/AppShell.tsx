import React, { useState } from 'react';
import {
  TrendingUp, BookOpen, List, CalendarDays, BarChart2, Target,
  Home, Gift, Sparkles, LogOut, Menu, X, ChevronRight, PlusCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type NavKey =
  | 'journals' | 'newTrade' | 'trades' | 'calendar' | 'stats' | 'goals'
  | 'pricing' | 'referral' | 'home';

interface AppShellProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  /** Bir journal açıkken alt menü görünür. */
  activeJournalName?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  isPro?: boolean;
  userLabel?: string;
  userImage?: string;
  onSignOut: () => void;
  languageMenu?: React.ReactNode;
  children: React.ReactNode;
}

const SIDEBAR_W = 248;

export default function AppShell({
  active, onNavigate, activeJournalName, title, subtitle, actions,
  isPro, userLabel, userImage, onSignOut, languageMenu, children,
}: AppShellProps) {
  const { t, language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = language === 'fa' || language === 'ar';
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const go = (key: NavKey) => { onNavigate(key); setMobileOpen(false); };

  const NavItem = ({ icon, label, itemKey, nested = false }: {
    icon: React.ReactNode; label: string; itemKey: NavKey; nested?: boolean;
  }) => {
    const on = active === itemKey;
    return (
      <button onClick={() => go(itemKey)}
        className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-[13.5px] relative ${nested ? 'ps-9 pe-3' : 'px-3'}`}
        style={{
          background: on ? 'rgba(139,92,246,0.12)' : 'transparent',
          color: on ? '#fff' : 'rgba(255,255,255,0.45)',
          fontWeight: on ? 500 : 400,
          transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={e => { if (!on) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; } }}
        onMouseLeave={e => { if (!on) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}>
        {on && (
          <span className="absolute top-1/2 -translate-y-1/2 rounded-full"
            style={{ insetInlineStart: 0, width: '2px', height: '18px', background: '#8b5cf6' }} />
        )}
        <span style={{ color: on ? '#a78bfa' : 'currentColor', display: 'flex' }}>{icon}</span>
        <span className="truncate">{label}</span>
      </button>
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="px-3 pt-6 pb-2 text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
      {children}
    </div>
  );

  const sidebar = (
    <div className="flex flex-col h-full" style={{ width: SIDEBAR_W, background: '#0a0b14' }}>
      {/* Marka */}
      <button onClick={() => go('home')}
        className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <TrendingUp className="w-[18px] h-[18px] flex-shrink-0" style={{ color: '#8b5cf6' }} />
        <span className="font-display text-[15px] truncate" style={{ letterSpacing: '-0.01em' }}>
          Simple Trading Journal
        </span>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <NavItem icon={<BookOpen className="w-4 h-4" />} label={t('myJournals')} itemKey="journals" />

        {activeJournalName && (
          <>
            <SectionLabel>
              <span className="flex items-center gap-1.5 truncate">
                <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                {activeJournalName}
              </span>
            </SectionLabel>
            <NavItem nested icon={<PlusCircle className="w-4 h-4" />} label={t('newTradeTab')} itemKey="newTrade" />
            <NavItem nested icon={<List className="w-4 h-4" />} label={t('historyTab')} itemKey="trades" />
            <NavItem nested icon={<CalendarDays className="w-4 h-4" />} label={t('calendarTab')} itemKey="calendar" />
            <NavItem nested icon={<BarChart2 className="w-4 h-4" />} label={t('statsTab')} itemKey="stats" />
            <NavItem nested icon={<Target className="w-4 h-4" />} label={t('goalsTab')} itemKey="goals" />
          </>
        )}

        <SectionLabel>{tr('Hesap', 'Account')}</SectionLabel>
        {!isPro && (
          <NavItem icon={<Sparkles className="w-4 h-4" />} label={tr('Pro\'ya Geç', 'Upgrade to Pro')} itemKey="pricing" />
        )}
        <NavItem icon={<Gift className="w-4 h-4" />} label={tr('Referans Kodu', 'Referral Code')} itemKey="referral" />
        <NavItem icon={<Home className="w-4 h-4" />} label={tr('Ana Sayfa', 'Home')} itemKey="home" />
      </nav>

      {/* Kullanıcı */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(139,92,246,0.18)' }}>
            {userImage
              ? <img src={userImage} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[11px] font-medium" style={{ color: '#a78bfa' }}>
                  {(userLabel || '?').charAt(0).toUpperCase()}
                </div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{userLabel}</div>
            {isPro && <div className="text-[10px] tracking-wider" style={{ color: '#a78bfa' }}>PRO</div>}
          </div>
          <button onClick={onSignOut} className="p-1.5 rounded-lg flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 150ms' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
            title={tr('Çıkış Yap', 'Sign Out')}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0e1a', color: '#fff' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Masaüstü yan menü */}
      <aside className="hidden lg:block fixed inset-y-0 z-30"
        style={{ insetInlineStart: 0, borderInlineEnd: '1px solid rgba(255,255,255,0.05)' }}>
        {sidebar}
      </aside>

      {/* Mobil çekmece */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full" style={{ borderInlineEnd: '1px solid rgba(255,255,255,0.06)' }}>{sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 lg:ps-[248px]">
        {/* Üst bar */}
        <header className="sticky top-0 z-20 h-16 flex items-center gap-4 px-5 sm:px-8"
          style={{ background: 'rgba(13,14,26,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ms-2 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[19px] leading-tight truncate" style={{ letterSpacing: '-0.01em' }}>{title}</h1>
            {subtitle && <p className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            {languageMenu}
          </div>
        </header>

        <div className="px-5 sm:px-8 py-8 sm:py-10">{children}</div>
      </div>

      {mobileOpen && (
        <button onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed top-4 end-4 z-[60] p-2 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
