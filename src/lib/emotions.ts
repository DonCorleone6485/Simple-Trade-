/**
 * İşleme girerkenki ruh hâli.
 *
 * Hazır seçenekler bir anahtarla saklanır, etiketi dile göre çizilir: dil
 * değişince aynı duygu iki ayrı kayıt gibi görünmesin, ileride duygu bazlı
 * istatistik çıkarken "Sinirli" ile "Angry" ayrı sayılmasın. Kullanıcının
 * kendi eklediği duygular yazıldığı gibi saklanır.
 */
export interface EmotionOption {
  key: string;
  tr: string;
  en: string;
  /** İşlemi olumlu mu olumsuz mu etkiler — renk için. */
  tone: 'good' | 'bad';
}

export const DEFAULT_EMOTIONS: EmotionOption[] = [
  { key: 'calm', tr: 'Sakin', en: 'Calm', tone: 'good' },
  { key: 'focused', tr: 'Odaklı', en: 'Focused', tone: 'good' },
  { key: 'confident', tr: 'Kendinden emin', en: 'Confident', tone: 'good' },
  { key: 'overconfident', tr: 'Aşırı özgüvenli', en: 'Overconfident', tone: 'bad' },
  { key: 'fomo', tr: 'FOMO', en: 'FOMO', tone: 'bad' },
  { key: 'fearful', tr: 'Korkulu', en: 'Fearful', tone: 'bad' },
  { key: 'angry', tr: 'Sinirli', en: 'Angry', tone: 'bad' },
  { key: 'revenge', tr: 'İntikam', en: 'Revenge', tone: 'bad' },
  { key: 'impatient', tr: 'Sabırsız', en: 'Impatient', tone: 'bad' },
  { key: 'sad', tr: 'Üzgün', en: 'Sad', tone: 'bad' },
  { key: 'tired', tr: 'Yorgun', en: 'Tired', tone: 'bad' },
  { key: 'sleepy', tr: 'Uykulu', en: 'Sleepy', tone: 'bad' },
];

const BY_KEY = new Map(DEFAULT_EMOTIONS.map(e => [e.key, e]));

/** Kayıttaki değerin ekrandaki adı: hazırsa dile göre, özelse olduğu gibi. */
export function emotionLabel(value: string, language: string): string {
  const e = BY_KEY.get(value);
  if (!e) return value;
  return language === 'tr' ? e.tr : e.en;
}

export function emotionTone(value: string): 'good' | 'bad' | 'custom' {
  return BY_KEY.get(value)?.tone ?? 'custom';
}

export const TONE_COLOR: Record<'good' | 'bad' | 'custom', { fg: string; bg: string }> = {
  good: { fg: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  bad: { fg: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  custom: { fg: '#a78bfa', bg: 'rgba(139,92,246,0.14)' },
};
