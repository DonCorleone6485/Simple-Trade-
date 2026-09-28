import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTICLES, ARTICLE_LANGS, articleText } from '../src/content/articles';

/**
 * Elle kopyalanmış ya da dokuz dilde tutulan şeyler. Biri değişip öteki
 * unutulunca sessizce bozulan yerler; burada yakalanır.
 */

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

describe('MetaTrader eklentisi', () => {
  /** g_text[] içindeki metinler, sırasıyla. */
  const texts = (src: string) => {
    const block = src.slice(src.indexOf('string g_text[] ='), src.indexOf('};', src.indexOf('string g_text[] =')));
    return [...block.matchAll(/^\s*"((?:[^"\\]|\\.)*)"/gm)].map(m => m[1]);
  };
  const mq4 = read('public/SimpleTradingJournal.mq4');
  const mq5 = read('public/SimpleTradingJournal.mq5');

  it('MT4 ve MT5 aynı mesaj tablosunu taşır', () => {
    expect(texts(mq4)).toEqual(texts(mq5));
  });

  it('her mesaj dokuz dilde', () => {
    const ids = [...mq5.matchAll(/^#define T_\w+ (\d+)$/gm)].length;
    expect(ids).toBeGreaterThan(0);
    expect(texts(mq5)).toHaveLength(ids * 9);
    expect(texts(mq5).every(t => t.trim().length > 0)).toBe(true);
  });

  it('iki dosyanın sürümü aynı', () => {
    const v = (s: string) => s.match(/#property version\s+"([^"]+)"/)?.[1];
    expect(v(mq4)).toBe(v(mq5));
  });
});

describe('seans saatleri', () => {
  it('Supabase fonksiyonundaki kopya uygulamadakiyle aynı', () => {
    // Fonksiyondaki kopyanın başında iki satırlık "KOPYA" notu var.
    const body = (s: string) => s.replace(/^\/\/ KOPYA:.*\n\/\/.*\n\n/, '');
    expect(body(read('supabase/functions/push-alerts/sessions.ts'))).toBe(read('src/lib/sessions.ts'));
  });
});

describe('yazılar', () => {
  for (const a of ARTICLES) {
    it(`${a.slug} dokuz dilde, aynı yapıda`, () => {
      const shape = (lang: string) => articleText(a, lang).body.map(b => Object.keys(b)[0]);
      const en = articleText(a, 'en');
      for (const lang of ARTICLE_LANGS) {
        const t = articleText(a, lang);
        // articleText eksik dilde İngilizceye düşer; burada düşmemeli.
        if (lang !== 'en') expect(t, lang).not.toBe(en);
        expect(t.title.length, lang).toBeGreaterThan(0);
        expect(t.description.length, lang).toBeGreaterThan(0);
        expect(shape(lang), lang).toEqual(shape('en'));
      }
    });
  }
});
