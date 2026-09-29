import { describe, expect, it } from 'vitest';
import { ARTICLE_LANGS } from '../src/content/articles';
import { BROKERS, DIRECTORY_PATHS, PROP_FIRMS, directoryMeta } from '../src/content/directory';

/**
 * Prop firma ve broker sayfalarının verisi (src/content/directory.ts).
 * Rakamların doğruluğunu test edemeyiz — o, firmanın sayfasıyla elle ya da
 * aylık kontrolle karşılaştırılır. Burada yapının bozulmadığına bakılıyor.
 */
describe('prop firma ve broker verisi', () => {
  it('her firmanın notları dokuz dilde, aynı sayıda', () => {
    for (const f of PROP_FIRMS) {
      const n = f.notes.en.length;
      for (const l of ARTICLE_LANGS) expect(f.notes[l], `${f.slug} ${l}`).toHaveLength(n);
    }
  });

  it('kaynaklar https, tarihler geçerli, yüzdeler "10%" biçiminde', () => {
    const pct = /^\d+(\.\d+)?%$/;
    for (const f of PROP_FIRMS) {
      expect(f.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const p of f.programs) {
        expect(p.source).toMatch(/^https:\/\//);
        for (const v of [...p.targets, p.max, ...(p.daily ? [p.daily] : [])]) expect(v, `${f.slug} ${p.name}`).toMatch(pct);
      }
    }
    for (const b of BROKERS) {
      expect(b.source).toMatch(/^https:\/\//);
      expect(b.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('adresler tekil ve her sayfanın her dilde başlığı var', () => {
    expect(new Set(DIRECTORY_PATHS).size).toBe(DIRECTORY_PATHS.length);
    for (const path of DIRECTORY_PATHS) {
      for (const l of ARTICLE_LANGS) {
        const m = directoryMeta(path, l);
        expect(m?.title, `${path} ${l}`).toBeTruthy();
        expect(m?.description).not.toMatch(/\{\w+\}/);
      }
    }
  });
});
