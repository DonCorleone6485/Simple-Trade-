export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { trades, language, journalName, startingCapital } = req.body;

    if (!trades || trades.length === 0) {
      return res.status(400).json({ error: 'No trades provided' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const wins = trades.filter((t: any) => t.result === 'Başarılı' || t.result === 'Manuel Karda');
    const losses = trades.filter((t: any) => t.result === 'Başarısız' || t.result === 'Manuel Zararda');
    const winRate = ((wins.length / trades.length) * 100).toFixed(1);
    const grossProfit = wins.reduce((s: number, t: any) => s + (t.reward || 0), 0);
    const grossLoss = losses.reduce((s: number, t: any) => s + (t.risk || 0), 0);
    const netPnL = grossProfit - grossLoss;
    const validRRs = trades.map((t: any) => parseFloat(t.rr)).filter((n: number) => !isNaN(n));
    const avgRR = validRRs.length > 0 ? (validRRs.reduce((a: number, b: number) => a + b, 0) / validRRs.length).toFixed(2) : '0';

    const setupMap: Record<string, { wins: number; total: number; pnl: number }> = {};
    trades.forEach((t: any) => {
      const key = t.setup || 'Belirtilmemiş';
      if (!setupMap[key]) setupMap[key] = { wins: 0, total: 0, pnl: 0 };
      setupMap[key].total++;
      if (t.result === 'Başarılı' || t.result === 'Manuel Karda') {
        setupMap[key].wins++;
        setupMap[key].pnl += (t.reward || 0);
      } else {
        setupMap[key].pnl -= (t.risk || 0);
      }
    });

    const symbolMap: Record<string, { wins: number; total: number; pnl: number }> = {};
    trades.forEach((t: any) => {
      if (!symbolMap[t.symbol]) symbolMap[t.symbol] = { wins: 0, total: 0, pnl: 0 };
      symbolMap[t.symbol].total++;
      if (t.result === 'Başarılı' || t.result === 'Manuel Karda') {
        symbolMap[t.symbol].wins++;
        symbolMap[t.symbol].pnl += (t.reward || 0);
      } else {
        symbolMap[t.symbol].pnl -= (t.risk || 0);
      }
    });

    const hourMap: Record<number, { wins: number; total: number }> = {};
    trades.forEach((t: any) => {
      const hour = new Date(t.date).getHours();
      if (!hourMap[hour]) hourMap[hour] = { wins: 0, total: 0 };
      hourMap[hour].total++;
      if (t.result === 'Başarılı' || t.result === 'Manuel Karda') hourMap[hour].wins++;
    });

    const notes = trades
      .filter((t: any) => t.preTradeNotes || t.postTradeNotes)
      .slice(0, 10)
      .map((t: any) => ({
        symbol: t.symbol,
        result: t.result,
        pre: t.preTradeNotes?.slice(0, 150),
        post: t.postTradeNotes?.slice(0, 150),
      }));

    const langInstructions: Record<string, string> = {
      tr: 'Türkçe olarak yanıt ver.',
      en: 'Respond in English.',
      fa: 'به فارسی پاسخ بده.',
    };

    const prompt = `Sen profesyonel bir trading coach ve analistsin. Aşağıdaki trader'ın journal verilerini analiz et ve kapsamlı bir rapor yaz.

${langInstructions[language] || langInstructions.tr}

Journal: ${journalName || 'Belirtilmemiş'}
Başlangıç Sermayesi: $${startingCapital || 'Belirtilmemiş'}
Toplam İşlem: ${trades.length}
Win Rate: %${winRate}
Net PnL: $${netPnL.toFixed(2)}
Ortalama R/R: ${avgRR}R

Setup Performansı:
${Object.entries(setupMap).map(([s, d]) => `- ${s}: ${d.total} işlem, %${((d.wins / d.total) * 100).toFixed(0)} win rate, $${d.pnl.toFixed(0)} PnL`).join('\n')}

Sembol Performansı:
${Object.entries(symbolMap).map(([s, d]) => `- ${s}: ${d.total} işlem, %${((d.wins / d.total) * 100).toFixed(0)} win rate, $${d.pnl.toFixed(0)} PnL`).join('\n')}

Saat Bazlı:
${Object.entries(hourMap).sort((a, b) => Number(b[1].total) - Number(a[1].total)).slice(0, 8).map(([h, d]) => `- Saat ${h}:00 — ${d.total} işlem, %${((d.wins / d.total) * 100).toFixed(0)} win rate`).join('\n')}

Notlar:
${notes.length > 0 ? notes.map((n: any) => `- ${n.symbol} (${n.result}): "${n.pre || '-'}" / "${n.post || '-'}"`).join('\n') : 'Not yok.'}

Şu başlıklar altında analiz yap:
1. Genel Performans
2. Güçlü Yönler
3. Zayıf Yönler
4. Setup Analizi
5. Zamanlama
6. Psikolojik Patternler
7. 5 Somut Öneri
8. Özet`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      return res.status(500).json({ error: 'Groq API error: ' + err });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return res.json({ analysis: text });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
