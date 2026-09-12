import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Kurulumun canlandırması.
 *
 * Ekran görüntüsü dizisi yerine oynayan bir tur: MetaTrader penceresinin
 * sadeleştirilmiş bir taklidi üstünde menüler açılır, kutu işaretlenir,
 * adres yazılır, EA grafiğe sürüklenir. Yazıyı okumayan da ne yapacağını
 * görür.
 *
 * Sahne 960×540 px'lik sabit bir tuvale çizilir, kabın genişliğine
 * ölçeklenir; içerideki bütün koordinatlar bu tuvale göredir.
 *
 * Zamanlama tek bir adım dizisinden okunur. Her adımın içindeki ilerleme
 * (yazma animasyonu, tıklama halkası) o adımın kendi süresinden hesaplanır —
 * böylece duraklatma ve bölüme atlama ayrı bir iş istemez.
 */

const URL_TEXT = 'https://www.simpletradejournal.io';
const KEY_TEXT = 'stj_7f3a9c21e84b06d5';

const STAGE_W = 960;

interface Step {
  sc: number;
  beat: number;
  dur: number;
  cap: string;                 // **kalın** ve `kod` işaretlerini destekler
  cursor?: [number, number];
  click?: boolean;
  ring?: string;               // data-el değeri
  press?: string;
  hide?: string;
  drag?: [[number, number], [number, number]];
  typing?: { el: string; text: string };
}

export default function MTSetupTour() {
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<HTMLButtonElement[]>([]);

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  /* Motorun her karede okuduğu, render tetiklemeyen durum. */
  const clock = useRef({ t: 0, playing: true, step: -1 });
  /* Duraklatılmışken bölüme atlayınca da kare çizilsin diye. */
  const drawRef = useRef<() => void>(() => {});

  const steps: Step[] = useMemo(() => [
    /* 01 — Dosyayı Experts klasörüne koy */
    { sc: 0, beat: 0, dur: 2300, cursor: [300, 250],
      cap: tr('İndirdiğin `SimpleTradingJournal.ex5` dosyası MetaTrader\'ın kendi klasörüne girmeli. Yolu terminalin kendisi açıyor.',
              'The `SimpleTradingJournal.ex5` file you downloaded has to go into MetaTrader\'s own folder. The terminal opens that folder for you.') },
    { sc: 0, beat: 1, dur: 2400, cursor: [70, 80], click: true, ring: 's0-file',
      cap: tr('**Dosya** menüsünü aç, **Veri Klasörünü Aç**\'a tıkla.',
              'Open the **File** menu and click **Open Data Folder**.') },
    { sc: 0, beat: 2, dur: 2600, cursor: [300, 210], click: true, ring: 's0-experts',
      cap: tr('Açılan pencerede **MQL5** klasörünün içindesin. **Experts**\'e çift tıkla.',
              'The window opens inside **MQL5**. Double-click **Experts**.') },
    { sc: 0, beat: 3, dur: 1600, cursor: [420, 300],
      cap: tr('Klasör boş ya da içinde başka eklentiler var — ikisi de olur.',
              'The folder may be empty or already hold other add-ons — either is fine.') },
    { sc: 0, beat: 4, dur: 2800, cursor: [330, 290],
      cap: tr('İndirdiğin dosyayı buraya sürükle. Adım tamam.',
              'Drag the downloaded file in here. That step is done.') },

    /* 02 — WebRequest izni */
    { sc: 1, beat: 0, dur: 2600, cursor: [280, 80], click: true, ring: 's1-tools',
      cap: tr('Eklenti işlemleri siteye gönderecek. MetaTrader bu izni sormadan vermez: **Araçlar › Seçenekler**.',
              'The add-on will send your trades to the site. MetaTrader will not allow that until you say so: **Tools › Options**.') },
    { sc: 1, beat: 1, dur: 2200, cursor: [470, 140], click: true, ring: 's1-tab',
      cap: tr('**Uzman Danışmanlar** sekmesine geç.', 'Go to the **Expert Advisors** tab.') },
    { sc: 1, beat: 2, dur: 2200, cursor: [250, 232], click: true, ring: 's1-check',
      cap: tr('“Listelenen URL\'ler için WebRequest\'e izin ver” kutusunu işaretle.',
              'Tick “Allow WebRequest for listed URL”.') },
    { sc: 1, beat: 3, dur: 3200, cursor: [400, 268], typing: { el: 's1-list', text: URL_TEXT },
      cap: tr('Alttaki listeye adresi ekle: `https://www.simpletradejournal.io`',
              'Add this address to the list below: `https://www.simpletradejournal.io`') },
    { sc: 1, beat: 4, dur: 1800, cursor: [600, 368], click: true, press: 's1-ok',
      cap: tr('**Tamam**. İzin verildi.', '**OK**. Permission granted.') },

    /* 03 — Yeniden başlat */
    { sc: 2, beat: 0, dur: 2000, cursor: [760, 60], click: true, ring: 's2-x',
      cap: tr('MetaTrader yeni dosyayı ancak yeniden açılınca görür. Kapat.',
              'MetaTrader only notices the new file after a restart. Close it.') },
    { sc: 2, beat: 1, dur: 1500, cursor: [480, 270], hide: 's2-win',
      cap: tr('Kapat ve tekrar aç.', 'Close it and open it again.') },
    { sc: 2, beat: 2, dur: 3000, cursor: [190, 250], ring: 's2-ea',
      cap: tr('Soldaki **Kılavuz** panelinde, **Uzman Danışmanlar** altında **SimpleTradingJournal** göründü. Panel kapalıysa **Ctrl+N** ile aç.',
              '**SimpleTradingJournal** now sits under **Expert Advisors** in the **Navigator** panel on the left. If the panel is hidden, **Ctrl+N** brings it back.') },

    /* 04 — Grafiğe sürükle, anahtarı yapıştır */
    { sc: 3, beat: 0, dur: 2900, cursor: [600, 300], drag: [[150, 205], [600, 300]],
      cap: tr('Eklentiyi herhangi bir grafiğin üstüne sürükle. Hangi sembol olduğu fark etmez.',
              'Drag the add-on onto any chart. The symbol does not matter.') },
    { sc: 3, beat: 1, dur: 2400, cursor: [420, 150], click: true, ring: 's3-tab',
      cap: tr('Açılan pencerede **Girdiler** sekmesine geç.',
              'In the window that opens, go to the **Inputs** tab.') },
    { sc: 3, beat: 2, dur: 3400, cursor: [500, 205], typing: { el: 's3-key', text: KEY_TEXT },
      cap: tr('**ApiKey** satırına, yukarıda ürettiğin anahtarı yapıştır. Öteki satırlara dokunma.',
              'Paste the key you created above into the **ApiKey** row. Leave the other rows alone.') },
    { sc: 3, beat: 3, dur: 2600, cursor: [590, 326], click: true, press: 's3-ok',
      cap: tr('**Tamam** dedikten sonra grafiğin sol üstünde eklentinin durumu yazar.',
              'After **OK**, the add-on writes its status at the top-left of the chart.') },
    { sc: 3, beat: 4, dur: 3000, cursor: [590, 326],
      cap: tr('Geçmiş tarandı, kapanan işlemler journal\'a gitti. Sağ üstteki gülen yüz “çalışıyor” demek.',
              'History scanned, closed trades sent to the journal. The smiley at the top-right means it is running.') },

    /* Kapanış */
    { sc: 4, beat: 0, dur: 4000,
      cap: tr('Hepsi bu. Bundan sonrası kendiliğinden.', 'That is all. From here it runs on its own.') },
  ], [language]);

  const chapters = useMemo(() => [
    { name: tr('Dosyayı yerine koy', 'Put the file in place'), from: 0 },
    { name: tr('İzin ver', 'Allow it'), from: 5 },
    { name: tr('Yeniden başlat', 'Restart'), from: 10 },
    { name: tr('Anahtarı gir', 'Paste the key'), from: 13 },
  ], [language]);

  const { starts, total } = useMemo(() => {
    const s: number[] = [];
    let acc = 0;
    steps.forEach(st => { s.push(acc); acc += st.dur; });
    return { starts: s, total: acc };
  }, [steps]);

  /* ── Motor ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    if (!root || !stage || !viewport) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { clock.current.playing = false; setPlaying(false); }

    const pick = (el: string) => stage.querySelector(`[data-el="${el}"]`) as HTMLElement | null;

    /* Mumlar: tohumlu rastgelelik, her açılışta aynı grafik. */
    (stage.querySelectorAll('[data-candles]') as NodeListOf<HTMLElement>).forEach(chart => {
      if (chart.querySelector('.candles')) return;
      const count = parseInt(chart.dataset.candles || '40', 10);
      const stepX = Math.max((chart.clientWidth - 16) / count, 7);
      const w = Math.max(Math.round(stepX * 0.55), 3);
      let seed = 7 + count, price = 150, html = '';
      const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
      for (let i = 0; i < count; i++) {
        const open = price;
        const close = price + (rnd() - 0.46) * 26;
        price = close;
        const hi = Math.max(open, close) + rnd() * 9;
        const lo = Math.min(open, close) - rnd() * 9;
        const top = 300 - hi, bot = 300 - lo;
        const bt = 300 - Math.max(open, close), bb = 300 - Math.min(open, close);
        html += `<span class="candle" style="width:${w}px;left:${Math.round(i * stepX + 8)}px;` +
                `top:${top + 90}px;height:${Math.max(bot - top, 2)}px;` +
                `color:${close >= open ? 'var(--mt-up)' : 'var(--mt-down)'}">` +
                `<i style="left:${Math.floor(w / 2)}px"></i>` +
                `<b style="width:${w}px;top:${bt - top}px;height:${Math.max(bb - bt, 2)}px"></b></span>`;
      }
      const box = document.createElement('div');
      box.className = 'candles';
      box.innerHTML = html;
      chart.appendChild(box);
    });

    const setTyped = (el: string, text: string, p: number, caret: boolean) => {
      const node = pick(el);
      if (!node) return;
      const n = Math.round(p * text.length);
      node.textContent = text.slice(0, n);
      if (caret && n < text.length) {
        const c = document.createElement('span');
        c.className = 'caret';
        node.appendChild(c);
      }
    };

    /* Bir adıma girerken sahneyi kur. */
    const enter = (i: number) => {
      const s = steps[i];
      const scenes = stage.querySelectorAll('.scene') as NodeListOf<HTMLElement>;
      scenes.forEach((sc, n) => sc.classList.toggle('live', n === s.sc));
      const scene = scenes[s.sc];

      (scene.querySelectorAll('.fx') as NodeListOf<HTMLElement>).forEach(el => {
        const from = parseInt(el.dataset.from || '0', 10);
        const to = parseInt(el.dataset.to || '0', 10);
        el.classList.toggle('on', s.beat >= from && s.beat <= to);
      });

      stage.querySelectorAll('.ring').forEach(el => el.classList.remove('ring'));
      stage.querySelectorAll('.press').forEach(el => el.classList.remove('press'));
      stage.querySelectorAll('.gone').forEach(el => el.classList.remove('gone'));
      stage.querySelectorAll('.menubar .hot').forEach(el => el.classList.remove('hot'));

      if (s.ring) pick(s.ring)?.classList.add('ring');
      if (s.press) pick(s.press)?.classList.add('press');
      if (s.hide) pick(s.hide)?.classList.add('gone');

      /* Açık menünün başlığı vurgulu kalsın. */
      if (s.sc === 0 && s.beat === 1) pick('s0-file')?.classList.add('hot');
      if (s.sc === 1 && s.beat === 0) pick('s1-tools')?.classList.add('hot');

      const box = pick('s1-box');
      if (box) {
        const on = s.sc === 1 && s.beat >= 2;
        box.classList.toggle('on', on);
        box.textContent = on ? '✓' : '';
      }

      const path = pick('s0-path');
      if (path) {
        path.innerHTML = (s.sc === 0 && s.beat >= 3)
          ? '<span>MQL5</span><span>›</span><b>Experts</b>'
          : '<span>MetaTrader 5</span><span>›</span><b>MQL5</b>';
      }

      /* Yazma alanları: bu adımda yazılmıyorsa ya boş ya tam dolu. */
      setTyped('s1-list', URL_TEXT, s.sc > 1 ? 1 : 0, false);
      setTyped('s3-key', KEY_TEXT, s.sc === 3 && s.beat > 2 ? 1 : 0, false);

      const cur = scene.querySelector('.cursor') as HTMLElement | null;
      if (cur && s.cursor) cur.style.transform = `translate(${s.cursor[0]}px,${s.cursor[1]}px)`;

      const ghost = pick('s3-ghost');
      if (ghost) {
        if (s.drag) {
          ghost.style.transition = 'none';
          ghost.style.transform = `translate(${s.drag[0][0]}px,${s.drag[0][1]}px)`;
          void ghost.offsetWidth;
          ghost.style.transition = '';
          ghost.style.transform = `translate(${s.drag[1][0]}px,${s.drag[1][1]}px)`;
        } else {
          ghost.style.transform = 'translate(150px,205px)';
        }
      }

      setStepIndex(i);
    };

    const render = () => {
      const t = clock.current.t;
      let i = steps.length - 1;
      for (let k = 0; k < steps.length; k++) {
        if (t < starts[k] + steps[k].dur) { i = k; break; }
      }
      if (i !== clock.current.step) { clock.current.step = i; enter(i); }

      const s = steps[i];
      const p = Math.min((t - starts[i]) / s.dur, 1);

      if (s.typing) setTyped(s.typing.el, s.typing.text, Math.min(p / 0.85, 1), true);

      const scene = (stage.querySelectorAll('.scene') as NodeListOf<HTMLElement>)[s.sc];
      scene.querySelector('.cursor')?.classList.toggle('click', !!s.click && p < 0.3);

      barsRef.current.forEach((btn, n) => {
        if (!btn) return;
        const from = starts[chapters[n].from];
        const to = n + 1 < chapters.length ? starts[chapters[n + 1].from] : total;
        const f = (t - from) / (to - from);
        const fill = btn.querySelector('i') as HTMLElement | null;
        if (fill) fill.style.width = `${Math.max(0, Math.min(f, 1)) * 100}%`;
        btn.dataset.state = f >= 1 ? 'done' : f > 0 ? 'now' : 'next';
      });

      if (timeRef.current) {
        const sec = Math.floor(t / 1000);
        timeRef.current.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      }
    };

    drawRef.current = render;

    let raf = 0, last: number | null = null;
    const frame = (now: number) => {
      if (last === null) last = now;
      const dt = now - last;
      last = now;
      if (clock.current.playing) {
        clock.current.t += dt;
        if (clock.current.t >= total) { clock.current.t = total - 1; clock.current.playing = false; setPlaying(false); }
        render();
      }
      raf = requestAnimationFrame(frame);
    };

    const fit = () => { stage.style.transform = `scale(${viewport.clientWidth / STAGE_W})`; };
    const ro = new ResizeObserver(fit);
    ro.observe(viewport);
    fit();

    clock.current.step = -1;
    render();
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [steps, starts, total, chapters]);

  const toggle = () => {
    if (!clock.current.playing && clock.current.t >= total - 1) {
      clock.current.t = 0;
      clock.current.step = -1;
    }
    clock.current.playing = !clock.current.playing;
    setPlaying(clock.current.playing);
  };

  const seek = (ms: number) => {
    clock.current.t = Math.max(0, Math.min(ms, total - 1));
    clock.current.step = -1;
    drawRef.current();
  };

  const current = steps[stepIndex] || steps[0];

  return (
    <div className="mt-tour" ref={rootRef}>
      <div className="tour-viewport" ref={viewportRef}>
        <div className="tour-stage" ref={stageRef}>

          {/* ══ 1. Dosyayı Experts klasörüne koy ══════════════════════ */}
          <section className="scene">
            <div className="chip">
              <span className="n">01</span>
              <span className="t">{tr('Dosyayı Experts klasörüne koy', 'Put the file in the Experts folder')}</span>
            </div>
            <div className="mt5">
              <Titlebar />
              <div className="menubar">
                <span data-el="s0-file">{tr('Dosya', 'File')}</span>
                <span>{tr('Görünüm', 'View')}</span><span>{tr('Ekle', 'Insert')}</span>
                <span>{tr('Grafikler', 'Charts')}</span><span>{tr('Araçlar', 'Tools')}</span>
                <span>{tr('Pencere', 'Window')}</span><span>{tr('Yardım', 'Help')}</span>
              </div>
              <Toolbar />
              <div className="wbody">
                <div className="chart" data-candles="46"><span className="sym">EURUSD, H1</span></div>
              </div>

              <div className="dropdown fx pop" data-from="1" data-to="1" style={{ left: 6 }}>
                <div className="item">{tr('Yeni Grafik', 'New Chart')}</div>
                <div className="item">{tr('Aç', 'Open')}</div>
                <div className="item">{tr('Farklı Kaydet…', 'Save As…')}</div>
                <div className="sep" />
                <div className="item hot">{tr('Veri Klasörünü Aç', 'Open Data Folder')}</div>
                <div className="sep" />
                <div className="item">{tr('Çıkış', 'Exit')}</div>
              </div>
            </div>

            <div className="explorer fx pop" data-from="2" data-to="4">
              <div className="path" data-el="s0-path">
                <span>MetaTrader 5</span><span>›</span><b>MQL5</b>
              </div>
              <div className="fgrid fx" data-from="2" data-to="2">
                <div className="folder" data-el="s0-experts"><span className="fi" />Experts</div>
                <div className="folder"><span className="fi" />Indicators</div>
                <div className="folder"><span className="fi" />Include</div>
                <div className="folder"><span className="fi" />Libraries</div>
                <div className="folder"><span className="fi" />Scripts</div>
                <div className="folder"><span className="fi" />Files</div>
              </div>
              <div className="fgrid fx" data-from="3" data-to="4">
                <div className="dropfile fx drop" data-from="4" data-to="4">
                  <span className="fi">EX5</span>SimpleTradingJournal.ex5
                </div>
              </div>
            </div>

            <Cursor />
          </section>

          {/* ══ 2. WebRequest izni ════════════════════════════════════ */}
          <section className="scene">
            <div className="chip">
              <span className="n">02</span>
              <span className="t">{tr('Sunucuya bağlanma izni ver', 'Allow it to reach the server')}</span>
            </div>
            <div className="mt5">
              <Titlebar />
              <div className="menubar">
                <span>{tr('Dosya', 'File')}</span><span>{tr('Görünüm', 'View')}</span>
                <span>{tr('Ekle', 'Insert')}</span><span>{tr('Grafikler', 'Charts')}</span>
                <span data-el="s1-tools">{tr('Araçlar', 'Tools')}</span>
                <span>{tr('Pencere', 'Window')}</span><span>{tr('Yardım', 'Help')}</span>
              </div>
              <Toolbar />
              <div className="wbody">
                <div className="chart" data-candles="46"><span className="sym">EURUSD, H1</span></div>
              </div>

              <div className="dropdown fx pop" data-from="0" data-to="0" style={{ left: 212 }}>
                <div className="item">{tr('Yeni Emir', 'New Order')}</div>
                <div className="item">{tr('Geçmiş Merkezi', 'History Center')}</div>
                <div className="item">MetaQuotes Language Editor</div>
                <div className="sep" />
                <div className="item hot">{tr('Seçenekler…', 'Options…')}</div>
              </div>
            </div>

            <div className="dialog fx pop" data-from="1" data-to="4" style={{ left: 212, top: 88, width: 536 }}>
              <div className="dhead">{tr('Seçenekler', 'Options')}</div>
              <div className="tabs">
                <div className="tab">{tr('Sunucu', 'Server')}</div>
                <div className="tab">{tr('Grafikler', 'Charts')}</div>
                <div className="tab">{tr('Ticaret', 'Trade')}</div>
                <div className="tab on" data-el="s1-tab">{tr('Uzman Danışmanlar', 'Expert Advisors')}</div>
                <div className="tab">{tr('Olaylar', 'Events')}</div>
              </div>
              <div className="pane">
                <div className="check" style={{ marginBottom: 9, color: '#5a6172' }}>
                  <span className="box on">✓</span>
                  <span>{tr('Algoritmik alım satıma izin ver', 'Allow algorithmic trading')}</span>
                </div>
                <div className="check" data-el="s1-check">
                  <span className="box" data-el="s1-box" />
                  <span>{tr('Listelenen URL\'ler için WebRequest\'e izin ver:', 'Allow WebRequest for listed URL:')}</span>
                </div>
                <div className="listbox" data-el="s1-list" />
              </div>
              <div className="btnrow">
                <div className="btn primary" data-el="s1-ok">{tr('Tamam', 'OK')}</div>
                <div className="btn">{tr('İptal', 'Cancel')}</div>
              </div>
            </div>

            <Cursor />
          </section>

          {/* ══ 3. Yeniden başlat ═════════════════════════════════════ */}
          <section className="scene">
            <div className="chip">
              <span className="n">03</span>
              <span className="t">{tr('MetaTrader\'ı kapat, tekrar aç', 'Close MetaTrader and open it again')}</span>
            </div>
            <div className="mt5" data-el="s2-win">
              <Titlebar closeEl="s2-x" />
              <div className="menubar">
                <span>{tr('Dosya', 'File')}</span><span>{tr('Görünüm', 'View')}</span>
                <span>{tr('Ekle', 'Insert')}</span><span>{tr('Grafikler', 'Charts')}</span>
                <span>{tr('Araçlar', 'Tools')}</span><span>{tr('Pencere', 'Window')}</span>
                <span>{tr('Yardım', 'Help')}</span>
              </div>
              <Toolbar />
              <div className="wbody">
                <div className="nav-panel fx" data-from="2" data-to="2">
                  <div className="head">{tr('Kılavuz', 'Navigator')}</div>
                  <div className="tree">
                    <div className="node"><span className="tw">▸</span><span className="ic" />{tr('Göstergeler', 'Indicators')}</div>
                    <div className="node"><span className="tw">▾</span><span className="ic" />{tr('Uzman Danışmanlar', 'Expert Advisors')}</div>
                    <div className="node child"><span className="ic" />MACD Sample</div>
                    <div className="node child"><span className="ic" />Moving Average</div>
                    <div className="node child ea" data-el="s2-ea"><span className="ic" />SimpleTradingJournal</div>
                    <div className="node"><span className="tw">▸</span><span className="ic" />{tr('Betikler', 'Scripts')}</div>
                  </div>
                </div>
                <div className="chart" data-candles="40"><span className="sym">EURUSD, H1</span></div>
              </div>
            </div>
            <Cursor />
          </section>

          {/* ══ 4. Grafiğe sürükle, anahtarı yapıştır ═════════════════ */}
          <section className="scene">
            <div className="chip">
              <span className="n">04</span>
              <span className="t">{tr('Grafiğe sürükle, anahtarı yapıştır', 'Drag it onto a chart, paste the key')}</span>
            </div>
            <div className="mt5">
              <Titlebar />
              <div className="menubar">
                <span>{tr('Dosya', 'File')}</span><span>{tr('Görünüm', 'View')}</span>
                <span>{tr('Ekle', 'Insert')}</span><span>{tr('Grafikler', 'Charts')}</span>
                <span>{tr('Araçlar', 'Tools')}</span><span>{tr('Pencere', 'Window')}</span>
                <span>{tr('Yardım', 'Help')}</span>
              </div>
              <Toolbar />
              <div className="wbody">
                <div className="nav-panel">
                  <div className="head">{tr('Kılavuz', 'Navigator')}</div>
                  <div className="tree">
                    <div className="node"><span className="tw">▸</span><span className="ic" />{tr('Göstergeler', 'Indicators')}</div>
                    <div className="node"><span className="tw">▾</span><span className="ic" />{tr('Uzman Danışmanlar', 'Expert Advisors')}</div>
                    <div className="node child"><span className="ic" />MACD Sample</div>
                    <div className="node child ea" data-el="s3-ea"><span className="ic" />SimpleTradingJournal</div>
                  </div>
                </div>
                <div className="chart" data-candles="36">
                  <span className="sym">EURUSD, H1</span>
                  <span className="smiley fx" data-from="3" data-to="4">☺</span>
                  <div className="comment fx" data-from="3" data-to="3">
                    {'Simple Trading Journal\nBaglandi. Son 365 gun taraniyor...'}
                  </div>
                  <div className="comment fx" data-from="4" data-to="4">
                    {'Simple Trading Journal\n'}
                    <span className="ok">Calisiyor. Yeni kapanan islem bekleniyor.</span>
                    {'\n7 islem gonderildi.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="ghost fx" data-from="0" data-to="0" data-el="s3-ghost">SimpleTradingJournal</div>

            <div className="dialog fx pop" data-from="1" data-to="2" style={{ left: 236, top: 96, width: 500 }}>
              <div className="dhead">SimpleTradingJournal</div>
              <div className="tabs">
                <div className="tab">{tr('Ortak', 'Common')}</div>
                <div className="tab on" data-el="s3-tab">{tr('Girdiler', 'Inputs')}</div>
                <div className="tab">{tr('Bağımlılıklar', 'Dependencies')}</div>
              </div>
              <div className="pane" style={{ padding: 0 }}>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <th style={{ width: '42%' }}>{tr('Değişken', 'Variable')}</th>
                      <th>{tr('Değer', 'Value')}</th>
                    </tr>
                    <tr className="focus">
                      <td>ApiKey&nbsp;&nbsp;(stj_…)</td>
                      <td className="val" data-el="s3-key">&nbsp;</td>
                    </tr>
                    <tr><td>ServerUrl</td><td className="val">https://www.simpletradejournal.io</td></tr>
                    <tr><td>PollSeconds</td><td className="val">30</td></tr>
                    <tr><td>HistoryDays</td><td className="val">365</td></tr>
                    <tr><td>Verbose</td><td className="val">true</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="btnrow">
                <div className="btn primary" data-el="s3-ok">{tr('Tamam', 'OK')}</div>
                <div className="btn">{tr('İptal', 'Cancel')}</div>
              </div>
            </div>

            <Cursor />
          </section>

          {/* ══ Kapanış ═══════════════════════════════════════════════ */}
          <section className="scene">
            <div className="endcard">
              <div className="tick">✓</div>
              <h3>{tr('Kurulum bitti', 'Setup complete')}</h3>
              <p>
                {tr('Bundan sonra kapanan her işlem, sen hiçbir şey yapmadan journal\'ına düşer. MetaTrader açık olduğu sürece eklenti otuz saniyede bir bakar.',
                    'From now on every closed trade lands in your journal without you doing anything. While MetaTrader is open the add-on checks every thirty seconds.')}
              </p>
            </div>
          </section>

        </div>
      </div>

      <div className="tour-caption">
        <span className="step">{String(Math.min(current.sc + 1, 4)).padStart(2, '0')}</span>
        <span className="text">{renderCaption(current.cap)}</span>
      </div>

      <div className="tour-controls">
        <button
          type="button"
          className="pp"
          onClick={toggle}
          aria-label={playing ? tr('Duraklat', 'Pause') : tr('Oynat', 'Play')}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <div className="track">
          {chapters.map((c, i) => {
            const from = starts[c.from];
            const to = i + 1 < chapters.length ? starts[chapters[i + 1].from] : total;
            return (
              <button
                type="button"
                key={c.name}
                ref={el => { if (el) barsRef.current[i] = el; }}
                className="ch"
                style={{ flexGrow: to - from }}
                onClick={() => seek(from)}
              >
                <span className="bar"><i /></span>
                <span className="lb">{String(i + 1).padStart(2, '0')} · {c.name}</span>
              </button>
            );
          })}
        </div>
        <span className="tour-time" ref={timeRef}>0:00</span>
      </div>
    </div>
  );
}

/* Altyazılarda **kalın** ve `kod` işaretleri. Küçük bir sözdizimi, çünkü
   metinlerin içinde menü adları ve adresler geçiyor. */
function renderCaption(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function Titlebar({ closeEl }: { closeEl?: string }) {
  const { language } = useLanguage();
  const demo = language === 'tr' ? 'Demo Hesap' : 'Demo Account';
  return (
    <div className="titlebar">
      <span className="dot" />
      <span>{demo} — MetaTrader 5</span>
      <span className="winbtns">
        <span className="winbtn">—</span>
        <span className="winbtn">▫</span>
        <span className="winbtn x" data-el={closeEl}>✕</span>
      </span>
    </div>
  );
}

function Toolbar() {
  return (
    <div className="toolbar">
      <span className="tool a" /><span className="tool" /><span className="tool sep" />
      <span className="tool b" /><span className="tool" /><span className="tool c" />
      <span className="tool sep" /><span className="tool" /><span className="tool" />
    </div>
  );
}

function Cursor() {
  return (
    <div className="cursor">
      <svg width="22" height="22" viewBox="0 0 22 22">
        <path d="M3 2l14 8-6 1.6L8.4 18z" fill="#fff" stroke="#1a1a22" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
