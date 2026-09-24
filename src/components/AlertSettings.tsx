import React, { useState } from 'react';
import { Bell, BellOff, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  AlertSettings as Settings, MINUTE_CHOICES,
  permissionState, requestPermission, saveAlerts,
} from '../lib/alerts';

/**
 * Bildirim ayarları — Seanslar ve Günün Haberleri sayfalarının başında.
 *
 * Ayrı bir "Ayarlar" sayfası açmadık: haberleri okurken haber uyarısını,
 * seanslara bakarken seans uyarısını açmak, bir menü dolaşmaktan doğal.
 *
 * İZİN NE ZAMAN İSTENİR: yalnızca kullanıcı anahtarı açtığında. Sayfa
 * açılır açılmaz istemek yanlış olurdu — tarayıcı reddedilen bir izni bir
 * daha sormaya izin vermiyor, yani erken sorup "hayır" almak özelliği
 * kalıcı olarak öldürüyor.
 */

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className="ui-pill flex items-center gap-3 text-start w-full px-3.5 py-3 rounded-xl"
      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="w-9 h-5 rounded-full flex-shrink-0 relative"
        style={{ background: on ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s ease' }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ insetInlineStart: on ? '18px' : '2px', background: '#fff', transition: 'inset-inline-start 0.2s ease' }} />
      </span>
      <span className="text-[13.5px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</span>
    </button>
  );
}

function Minutes({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 flex-wrap ps-3.5">
      {MINUTE_CHOICES.map(m => (
        <button key={m} type="button" onClick={() => onChange(m)} data-on={value === m}
          className="ui-nav px-3 py-1.5 rounded-lg text-[12.5px] font-mono"
          style={{ border: `1px solid ${value === m ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
          {m >= 60 ? `${m / 60}${t('hourShort')}` : `${m}${t('minutesShort')}`}
        </button>
      ))}
      <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('alertsBefore')}</span>
    </div>
  );
}

export default function AlertSettings({ kind, settings, onChange }: {
  kind: 'news' | 'session';
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  const { t } = useLanguage();
  const [perm, setPerm] = useState(permissionState());

  const set = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    onChange(next);
    saveAlerts(next);
  };

  /** Anahtar açılırken izin sorulur; reddedilirse anahtar açılmaz. */
  const toggle = async (on: boolean) => {
    if (!on) { set(kind === 'news' ? { news: false } : { session: false }); return; }
    let state = permissionState();
    if (state === 'default') state = await requestPermission();
    setPerm(state);
    if (state !== 'granted') return;
    set(kind === 'news' ? { news: true } : { session: true });
  };

  const on = kind === 'news' ? settings.news : settings.session;
  const minutes = kind === 'news' ? settings.newsMinutes : settings.sessionMinutes;

  return (
    <div className="mb-8 pb-8 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {on ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        {t('alertsTitle')}
      </div>

      <Switch on={on} onChange={toggle} label={kind === 'news' ? t('alertsNews') : t('alertsSession')} />

      {on && (
        <>
          <Minutes value={minutes} onChange={m => set(kind === 'news' ? { newsMinutes: m } : { sessionMinutes: m })} />
          {kind === 'news' && (
            // Kullanıcı "kırmızı" dedi, turuncu demedi: orta etki ayrı bir
            // tercih ve varsayılanı kapalı.
            <Switch on={settings.newsMedium} onChange={v => set({ newsMedium: v })} label={t('alertsMedium')} />
          )}
          {/* Bu satır şart. "Bildirim açık" sanıp haberi kaçıran biri için bu
              özellik hiç olmamasından kötüdür. */}
          <p className="text-[12px] leading-relaxed ps-3.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {t('alertsOnlyOpenTab')}
          </p>
        </>
      )}

      {perm === 'denied' && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-[12.5px] leading-relaxed"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t('alertsBlocked')}</span>
        </div>
      )}
      {perm === 'unsupported' && (
        <p className="text-[12.5px] ps-3.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('alertsUnsupported')}</p>
      )}
    </div>
  );
}
