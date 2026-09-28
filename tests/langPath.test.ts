import { describe, expect, it } from 'vitest';
import { langPath, splitLangPath } from '../src/lib/langPath';

describe('dilli adresler', () => {
  it('önekli yolu ayırır', () => {
    expect(splitLangPath('/tr/blog/x')).toEqual({ lang: 'tr', path: '/blog/x' });
    expect(splitLangPath('/fa')).toEqual({ lang: 'fa', path: '/' });
    expect(splitLangPath('/blog/')).toEqual({ lang: null, path: '/blog' });
  });

  it('İngilizce kökte kalır, diğer diller önek alır', () => {
    expect(langPath('/blog', 'en')).toBe('/blog');
    expect(langPath('/', 'tr')).toBe('/tr');
    expect(langPath('/help', 'ar')).toBe('/ar/help');
  });

  it('ayırıp geri birleştirmek aynı yolu verir', () => {
    for (const p of ['/tr/blog/r-multiple-explained', '/de/changelog', '/ru']) {
      const { lang, path } = splitLangPath(p);
      expect(langPath(path, lang!)).toBe(p);
    }
  });
});
