#!/usr/bin/env node
// client_errors tablosundan ERRORS.md üretir. Kullanım: node scripts/errors-report.mjs [gün=7]
// Supabase CLI ile okur (bağlı proje). Kişisel bilgi dosyaya girmez: e-posta,
// kullanıcı kimliği, uzun anahtarlar silinir; kişi sayısı yalnız sayı olarak yazılır.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const days = Math.max(1, Math.min(90, Number(process.argv[2]) || 7));
const sql = `select kind, regexp_replace(message, '-[A-Za-z0-9_-]{8}\\.js', '-*.js') as message, max(url) as url, count(*)::int as n,
  count(distinct coalesce(user_id, user_agent, 'anon'))::int as people,
  min(created_at) as first_seen, max(created_at) as last_seen,
  max(left(stack, 600)) as stack
  from client_errors where kind <> 'csp' and created_at > now() - interval '${days} days'
  group by kind, 2 order by max(created_at) desc limit 60`;

const out = execFileSync('supabase', ['db', 'query', '--linked', sql], { encoding: 'utf8', maxBuffer: 10_000_000 });
const rows = JSON.parse(out.slice(out.indexOf('{'))).rows || [];

const redact = (s = '') => String(s)
  .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<email>')
  .replace(/user_[A-Za-z0-9]{10,}/g, '<user>')
  .replace(/\b(?:eyJ|sk_|pk_|gsk_)[A-Za-z0-9_\-.]{12,}/g, '<token>')
  .replace(/\b[A-Fa-f0-9]{32,}\b/g, '<hex>')
  .replace(/[?&](token|key|code|email)=[^&\s]*/gi, '?$1=<x>');

const START = '<!-- ERRORS:START -->', END = '<!-- ERRORS:END -->';
const table = rows.length ? rows.map(r =>
  `### ${r.kind} — ${redact(r.message).slice(0, 200)}\n` +
  `- ${r.n}× · ${r.people} kişi · ilk ${r.first_seen.slice(0, 16)} · son ${r.last_seen.slice(0, 16)} UTC\n` +
  `- Sayfa: \`${redact(r.url || '-')}\`\n` +
  (r.stack ? `\`\`\`\n${redact(r.stack)}\n\`\`\`\n` : '')
).join('\n') : '_Son ' + days + ' günde hata yok._\n';
const block = `${START}\n_Otomatik üretildi: ${new Date().toISOString().slice(0, 16)} UTC, son ${days} gün, ${rows.length} farklı hata. Elle düzenleme: bu işaretlerin dışında._\n\n${table}\n${END}`;

const head = `# ERRORS.md

Kullanıcıların karşılaştığı hatalar (\`client_errors\` tablosu: tarayıcı + sunucu). İşaretler arası
\`node scripts/errors-report.mjs\` ile yenilenir; her saat zamanlanmış görev çalıştırır.
CSP raporları (kind 'csp') buraya girmez; onlar PLAN.md'deki CSP görevinde. Kişisel bilgi silinir. Düzeltme akışı: Claude hatayı inceler → dalda düzeltir + test → kullanıcı
onayı → main. Çözülenler aşağıdaki "Çözülenler" bölümüne taşınır.

## Açık hatalar
`;
const tail = `\n## Çözülenler\n_Henüz yok._\n`;
let prev = existsSync('ERRORS.md') ? readFileSync('ERRORS.md', 'utf8') : '';
let next;
if (prev.includes(START) && prev.includes(END)) {
  next = prev.slice(0, prev.indexOf(START)) + block + prev.slice(prev.indexOf(END) + END.length);
} else next = head + block + '\n' + tail;
writeFileSync('ERRORS.md', next);
console.log(`ERRORS.md: ${rows.length} farklı hata (son ${days} gün)`);
