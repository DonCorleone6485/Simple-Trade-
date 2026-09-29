// @vitest-environment happy-dom
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { decodeReport, parseCSVFile } from '../src/components/CSVImport';

/**
 * Gerçek MetaTrader 5 raporu (Türkçe arayüz, UTF-16LE). Uydurma bir test
 * dosyası kendi varsayımımızı kendimize doğrulatır; bu rapor dört gerçek
 * hatayı buldu (UTF-16, gizli dolgu hücresi, nete girmeyen komisyon,
 * stop/manuel ayrımı). Kişisel hesap verisi içerdiği için depoda değil:
 * yoksa test atlanır. Yer: STJ_MT5_REPORT ya da aşağıdaki varsayılanlar.
 * Beklenen sonuç raporun kendi özetinden okunur (Toplam İşlem, Toplam Net
 * Kar), böylece daha yeni bir rapor da aynı testten geçer.
 */
const REPORT = process.env.STJ_MT5_REPORT || [
  `${homedir()}/Desktop/Live Journal/ReportHistory-26659718.html`,
  `${homedir()}/Desktop/ReportHistory-26659718.html`,
].find(existsSync) || '';

/** Özet tablosunda etiketin yanındaki sayı ("-2 877.33" → -2877.33). */
function summary(text: string, label: string): number {
  const m = text.match(new RegExp(`${label}:\\s*</td>\\s*<td[^>]*>(?:<b>)?\\s*([-\\d\\s.,]+)`));
  if (!m) throw new Error(`Raporda "${label}" yok`);
  return Number(m[1].replace(/\s/g, ''));
}

describe.skipIf(!REPORT)('gerçek MT5 raporu', () => {
  it('işlem sayısı ve toplam net, raporun özetiyle aynı', () => {
    const buf = readFileSync(REPORT);
    const text = decodeReport(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const r = parseCSVFile(text, 'j', 'u');
    expect(r.errors).toEqual([]);
    expect(r.trades).toHaveLength(summary(text, 'Toplam İşlem'));
    const net = r.trades.reduce((s, t) => s + (t.reward || 0), 0);
    expect(Math.round(net * 100) / 100).toBe(summary(text, 'Toplam Net Kar'));
  });
});

describe('dosya kodlaması', () => {
  it('BOM\'lu UTF-16LE okunur', () => {
    const s = 'Pozisyon;Sembol';
    const u16 = new Uint8Array([0xff, 0xfe, ...[...s].flatMap(c => [c.charCodeAt(0), 0])]);
    expect(decodeReport(u16.buffer)).toBe(s);
  });

  it('UTF-8 olmayan Türkçe dosya Windows-1254 ile okunur', () => {
    // "Açılış" Windows-1254'te: A ç(0xE7) ı(0xFD) l ı(0xFD) ş(0xFE)
    const b = new Uint8Array([0x41, 0xe7, 0xfd, 0x6c, 0xfd, 0xfe]);
    expect(decodeReport(b.buffer)).toBe('Açılış');
  });
});

describe('ABD biçimli dosyalar', () => {
  // NinjaTrader'ın işlem tablosu gibi: tutarlar "$", eksi parantezde, binlik
  // ayırıcı virgül, tarih ay/gün/yıl. Önceden "$1,250.00" 0, "($75.50)" 0
  // okunuyor, kapanış tarihi atılıyordu.
  const csv = [
    'Trade number,Instrument,Account,Market pos.,Qty,Entry price,Exit price,Entry time,Exit time,Profit,Commission',
    '1,ES 12-26,Sim101,Long,1,5400.25,5425.25,9/22/2026 9:31:05 AM,9/22/2026 10:02:40 AM,"$1,250.00",($4.12)',
    '2,NQ 12-26,Sim101,Short,1,19850.50,19854.28,9/22/2026 11:15:00 AM,9/22/2026 11:20:12 AM,($75.50),($4.12)',
  ].join('\n');

  it('tutarları, yönü ve kapanış zamanını doğru okur', () => {
    const r = parseCSVFile(csv, 'j', 'u');
    expect(r.errors).toEqual([]);
    expect(r.trades).toHaveLength(2);
    const [a, b] = r.trades;
    expect(a.type).toBe('Buy');
    expect(a.reward).toBe(1245.88);
    expect(a.externalId).toBe('1');
    expect(a.exitDate).toBeTruthy();
    expect(b.type).toBe('Sell');
    expect(b.reward).toBe(-79.62);
  });

  it('Avrupa biçimi bozulmaz', () => {
    const eu = [
      'Symbol;Type;Open Time;Close Time;Profit',
      'EURUSD;buy;2026.09.22 10:00;2026.09.22 11:00;1.234,56',
      'EURUSD;sell;2026.09.22 12:00;2026.09.22 13:00;- 127,74',
    ].join('\n');
    const r = parseCSVFile(eu, 'j', 'u');
    expect(r.trades.map(t => t.reward)).toEqual([1234.56, -127.74]);
  });
});
