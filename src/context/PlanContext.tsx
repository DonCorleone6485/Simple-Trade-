import { createContext, useContext } from 'react';

/**
 * Kullanıcının planı ve "Pro'ya geç" penceresini açan tek kapı.
 *
 * Kilitli bir şeye dokunulan her yerde (kilitli işlem, sesli not, yapay zekâ)
 * aynı pencere, o kısıtlamayı anlatan cümleyle açılıyor. Bileşenlere tek tek
 * prop geçirmek yerine buradan okuyorlar.
 *
 * Varsayılan Pro: sağlayıcının dışında kalan bir yerde (ana sayfa gibi)
 * kilit simgesi yanlışlıkla görünmesin.
 */
export type UpgradeReason = 'daily' | 'journal' | 'locked' | 'importLocked' | 'voice' | 'ai' | 'delete';

interface Plan {
  isPro: boolean;
  askUpgrade: (reason: UpgradeReason) => void;
  /**
   * Kayıt olmadan örnek verilerle geziyor. Kayıt gerektiren her şey
   * (düzenleme, silme, yapay zekâ) "ücretsiz hesap aç" penceresini açar.
   */
  isGuest: boolean;
  requireAccount: () => void;
}

const PlanContext = createContext<Plan>({ isPro: true, askUpgrade: () => {}, isGuest: false, requireAccount: () => {} });

export const PlanProvider = PlanContext.Provider;
export const usePlan = () => useContext(PlanContext);

/** Ücretsiz planda her işlem gününün açık işlem hakkı. Veritabanındaki kuralla aynı. */
export const FREE_DAILY_TRADES = 2;
