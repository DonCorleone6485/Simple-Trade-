import React from 'react';

/**
 * Ortak yüzey ve kontrol stilleri.
 *
 * Tasarım kuralları: kutu yerine boşluk, kenarlık yerine ton farkı, vurgu
 * rengi yalnızca birincil eylemde, sayılar hizalı (tabular-nums).
 */

export const EASE = 'cubic-bezier(0.4,0,0.2,1)';
export const TRANSITION = `all 150ms ${EASE}`;

/** Sayfa üstündeki ana yüzey — kart görünümü ama kenarlıksız. */
export const surface: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  borderRadius: '20px',
};

/** Yüzey içindeki ikincil alan (input, satır, iç blok). */
export const subtle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  borderRadius: '12px',
};

export const hairline = '1px solid rgba(255,255,255,0.06)';

/** Modal gövdesi. */
export const modalCard: React.CSSProperties = {
  background: '#12131f',
  borderRadius: '24px',
  border: hairline,
};

export const input: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  color: '#fff',
  borderRadius: '12px',
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  fontSize: '14px',
  transition: TRANSITION,
};

export const label: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  marginBottom: '8px',
  color: 'rgba(255,255,255,0.45)',
};

/** Birincil eylem — ekranda tek mor öğe olmalı. */
export const primaryBtn: React.CSSProperties = {
  background: '#8b5cf6',
  color: '#fff',
  borderRadius: '9999px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  transition: TRANSITION,
};

export const ghostBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.75)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '9999px',
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 500,
  transition: TRANSITION,
};

export const quietBtn: React.CSSProperties = {
  color: 'rgba(255,255,255,0.45)',
  padding: '10px 16px',
  fontSize: '14px',
  transition: TRANSITION,
};

/** Bölüm üstü küçük başlık. */
export const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'rgba(255,255,255,0.3)',
};

/** Hizalı rakamlar. */
export const figure: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.01em',
};
