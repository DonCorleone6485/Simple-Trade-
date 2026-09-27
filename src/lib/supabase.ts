import { createClient } from '@supabase/supabase-js';

/**
 * Her istek, giriş yapmış kullanıcının Clerk oturum anahtarıyla gidiyor.
 *
 * Supabase, Clerk'i üçüncü taraf kimlik sağlayıcı olarak tanıyor; anahtarın
 * içindeki kullanıcı kimliği (sub) tablo kurallarında user_id ile
 * karşılaştırılıyor. Böylece herkes yalnızca kendi journal'larını, işlemlerini
 * ve fotoğraflarını görebiliyor. Önce istekler anonim anahtarla gidiyordu ve
 * veritabanı kimin sorduğunu bilmediği için kurallar herkese her şeyi açmıştı.
 *
 * Oturum yoksa null dönüyor; istemci o zaman anonim anahtarı kullanıyor.
 */
export const supabase = createClient(
  'https://obaqhbfaeejepocsdgiv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iYXFoYmZhZWVqZXBvY3NkZ2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjQyMjgsImV4cCI6MjA5MzQ0MDIyOH0.D8GFUOAKOrIkr0vUKCFpTEDNFCNehq0MNskukIWY2Qg',
  {
    accessToken: async () => (await (window as any).Clerk?.session?.getToken()) ?? null,
  }
);
