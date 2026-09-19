import { PropPack } from './core';
import tr from './tr';
import en from './en';
import fa from './fa';
import ar from './ar';
import ru from './ru';
import es from './es';
import pt from './pt';
import de from './de';
import fr from './fr';

export * from './core';

const PACKS: Record<string, PropPack> = { tr, en, fa, ar, ru, es, pt, de, fr };

/** Seçilen dilin metinleri; o dil yoksa İngilizce. */
export const propPack = (language: string): PropPack => PACKS[language] || PACKS.en;
