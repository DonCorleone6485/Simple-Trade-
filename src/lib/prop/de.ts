import { PropPack } from './core';

/** Deutscher Text. Die Reihenfolge der Optionen entspricht dem points-Array in core.ts. */
const de: PropPack = {
  drawdown: {
    title: 'Art der maximalen Verlustlinie (Drawdown)',
    short: 'Die Todeslinie des Kontos — fällst du darunter, ist das Konto weg. Die Frage: bleibt diese Linie von Anfang an stehen oder wandert sie mit deinem Gewinn nach oben? Eine wandernde Linie zerlegt dich genau dann, wenn du Buchgewinn zurückgibst. Das ist der entscheidendste Einzelunterschied zwischen zwei Konten.',
    options: [
      'Fest — zu Beginn festgelegt, bewegt sich nie (Static)',
      'Folgt dem geschlossenen Saldo, rastet am Break-even ein',
      'Folgt dem geschlossenen Saldo, ohne Einrasten (Balance/EOD trailing)',
      'Folgt auch dem offenen Gewinn (Equity trailing)',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Jedes Konto hat eine "Todeslinie" — sinkt dein Geld darunter, wird das Konto geschlossen. Wo sie liegt, ist wichtig; **wie sie sich verhält**, genauso. Es gibt drei Modelle:' },
      { p: '**Fest (Static):** die Linie wird zu Beginn festgelegt und rührt sich das ganze Kontoleben nicht. Ob du Gewinn machst, auszahlen lässt oder dein Saldo sich verdoppelt — sie bleibt stehen. Der Vorteil: je mehr du verdienst, desto größer der Abstand zu ihr, also mehr Bewegungsraum.' },
      { p: '**Folgt dem geschlossenen Saldo (Balance/EOD trailing):** die Linie steigt hinter den Gewinnen her, die du **schließt**. Schwankungen einer offenen Position bewegen sie nicht — sie steigt nur beim Schließen. Bei manchen Firmen stoppt sie, sobald sie deinen Startsaldo erreicht, und wird faktisch fest; das ist deutlich besser als die Variante, die immer weiterwandert.' },
      { p: '**Folgt auch dem offenen Gewinn (Equity trailing):** das gefährlichste Modell. Die Linie steigt sogar mit Gewinn, den du noch gar nicht realisiert hast. Deine Position ist kurz im Plus, die Linie rastet höher ein, und wenn dieser Gewinn wieder verschwindet — ohne dass du einen echten Dollar verloren hast — kann das Konto weg sein.' },
      { h: 'Beispiel ($100.000-Konto, 10%-Linie)' },
      { p: 'Angenommen, du eröffnest eine Gold-Position: erst +$5.000 im Plus, dann zurück, und du schließt auf Break-even.' },
      {
        table: {
          head: ['Moment', 'Saldo', 'Equity', 'Feste Linie', 'Equity-Trailing-Linie'],
          rows: [
            ['Start', '$100.000', '$100.000', '$90.000', '$90.000'],
            ['Position +$5.000 im Plus', '$100.000', '$105.000', '$90.000', '**$95.000** ↑'],
            ['Gewinn weg, Equity gefallen', '$100.000', '$94.000', 'Sicher', '**Linie verletzt — Konto weg**'],
          ],
        },
      },
      { p: 'Bei der festen Linie ist nichts passiert. Beim Equity Trailing wurde das Konto geschlossen, obwohl das Geld in deiner Tasche nie weniger wurde — weil die Linie einem Gewinn hinterhergestiegen war, den du nie genommen hast.' },
      { p: '**Was passiert mit wachsendem Gewinn?** Stell dir vor, dein Saldo steht bei $120.000. Bei fester Linie liegt der Boden weiterhin bei $90.000 — du hast $30.000 Spielraum. Beim Trailing ist die Linie mit dir auf $110.000 gestiegen und dein Spielraum bleibt für immer dieselben $10.000.' },
    ],
  },

  news: {
    title: 'Handel während News',
    short: 'Darfst du bei wichtigen Nachrichten Positionen eröffnen und schließen? Falls es eine Beschränkung gibt, zählt nicht die Beschränkung selbst, sondern **was ein Verstoß kostet**: wird nur der Gewinn dieses Trades gestrichen oder das Konto geschlossen?',
    options: [
      'Vollständig erlaubt, kein Sperrfenster',
      'Erlaubt mit kostenpflichtigem Add-on',
      'Sperrfenster (±2, ±4, ±5 Min.), vorher eröffnete Position ist ausgenommen',
      'Sperrfenster, bei Verstoß wird nur der Gewinn gestrichen',
      'Sperrfenster, bei Verstoß wird das Konto geschlossen',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Wichtige Veröffentlichungen wie NFP, CPI und FOMC bewegen den Markt in Sekunden heftig. Firmen mögen dieses Risiko nicht, deshalb setzen die meisten ein **Sperrfenster**: 2, 4 oder 5 Minuten vor und nach der Zahl darfst du keine Position öffnen oder schließen.' },
      { p: 'Entscheidend ist aber nicht das Fenster, sondern **was bei einem Verstoß passiert**. Du siehst drei Varianten:' },
      {
        ul: [
          '**Nur der Gewinn dieses Trades wird gestrichen** → ärgerlich, das Konto lebt weiter',
          '**Das Konto wird geschlossen** → ein Fehler beendet alles',
          '**Es gibt eine Ausnahme** → manche Firmen sagen: "wurde die Position 4-5 Stunden vor der Zahl eröffnet, zählt sie nicht als News-Trade"',
        ],
      },
      { p: 'Und ein Detail, das viele übersehen: bei manchen Firmen entsteht ein Verstoß, **ohne dass du etwas tust**. Löst der Stop oder das Ziel einer Stunden zuvor eröffneten Position innerhalb des Fensters aus, gilt auch das als "Schließen im Fenster".' },
      { h: 'Beispiel' },
      { p: 'Um 10:00 kaufst du Gold mit Ziel bei $4.120. Um 15:30 kommen die NFP, das Sperrfenster läuft von 15:28 bis 15:32.' },
      { p: '**Szenario A — Firma streicht den Gewinn:** der News-Spike trifft um 15:29 dein Ziel. Der Trade schließt mit +$2.000, doch dieser Gewinn wird vom Konto gestrichen. Das Konto läuft weiter, du bekommst den Ertrag nur nicht.' },
      { p: '**Szenario B — Firma schließt das Konto:** dasselbe passiert, aber dein Konto ist weg. Du hast an dem Tag nicht einmal auf den Bildschirm gesehen; die Order löste das System aus — trotzdem gilt es als Verstoß.' },
      { p: '**Szenario C — Firma mit Ausnahme:** du hast um 10:00 eröffnet, fünfeinhalb Stunden vor der Zahl. Die Firma wertet das nicht als News-Trade, dein Gewinn bleibt.' },
      { p: '**Praktische Folge:** bei einer Firma aus Szenario B musst du vor jeder wichtigen Nachricht die Stops und Ziele aller offenen Positionen aus dem Fenster schieben. Dutzende Male im Monat. Einmal vergessen und das Konto ist weg.' },
    ],
  },

  floating: {
    title: 'Verlustlimit für offene Positionen (Floating)',
    short: 'Ein eigenes Limit, das auf den **noch nicht realisierten** Verlust deiner offenen Positionen schaut. Überschreitest du die Schwelle, schließt das System sofort alles — auch wenn du dem Tageslimit nie nahe kamst. Die heimtückischste Regel für alle, die mehrere Trades gleichzeitig halten.',
    options: [
      'Gibt es nicht',
      'Ja, Schwelle 4% oder höher',
      'Ja, Schwelle 3%',
      'Ja, Schwelle 2%',
      'Ja, Schwelle unter 2%',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Normalerweise kennst du zwei Verlustgrenzen: die tägliche und die gesamte. Dies ist eine dritte und funktioniert anders — sie sieht **nur den nicht realisierten Verlust in deinen offenen Positionen**.' },
      { p: 'Überschreitest du die Schwelle, wartet das System nicht: es schließt alle Positionen sofort. Bei manchen Firmen wird auch das Konto geschlossen, bei anderen gibt es beim ersten Mal eine Strafe (geringerer Gewinnanteil) und beim zweiten Mal die Schließung.' },
      { p: 'Warum heimtückisch? Weil du **dem Tageslimit vielleicht nie nahe warst**. Einzeln betrachtet sind alle Positionen vernünftig dimensioniert, aber ihre offenen Verluste summieren sich, reißen die Schwelle und das System wirft dich aus dem Markt — womöglich einen Schritt vor der Wende.' },
      { h: 'Beispiel ($100.000-Konto, Schwelle 2% = $2.000)' },
      { p: 'Morgens hast du drei Trades eröffnet, jeder mit $1.000 Risiko:' },
      { ul: ['XAUUSD long → aktuell −$700', 'EURUSD long → aktuell −$700', 'GBPUSD long → aktuell −$700'] },
      { p: '**Gesamter offener Verlust: −$2.100** → das System greift ein und schließt alle drei.' },
      { p: 'Dabei gilt:' },
      {
        ul: [
          'dein Tageslimit lag bei $5.000 und du warst weit davon entfernt',
          'kein Stop war getroffen, alle drei hätten noch drehen können',
          'dein Gesamtrisiko betrug nur 3% des Kontos',
        ],
      },
      { p: 'Du hast also keine Regel bewusst gedehnt, aber aus Sicht des Systems "wurde dein offener Verlust zu groß".' },
      { p: '**Praxisregel:** wenn es dieses Limit gibt, muss das Gesamtrisiko aller gleichzeitig offenen Positionen unter der Schwelle bleiben. Auf einem $100K-Konto mit 2%-Schwelle darf das gesamte offene Risiko $2.000 nicht überschreiten — bei vier Trades also höchstens $500 pro Trade.' },
    ],
  },

  dailyBase: {
    title: 'Berechnungsbasis der Tagesverlustlinie',
    short: 'Die Tageslinie wird jeden Tag zurückgesetzt und neu berechnet. Auf welcher Basis? Wird der höhere Wert genommen, schiebt der über Nacht getragene Buchgewinn die Linie nach oben — gibst du ihn am nächsten Tag zurück, kann das Konto ohne einen einzigen echten Verlust platzen.',
    options: [
      'Es gibt kein Tageslimit',
      'Saldo-basiert — offener Gewinn schiebt die Linie nicht',
      'Der höhere Wert aus Saldo und Equity wird genommen',
      'Wird vom Equity-Hoch des Tages berechnet',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Die Tagesverlustlinie wird täglich zurückgesetzt und neu berechnet. Aber **worauf** sie sich stützt, unterscheidet sich von Firma zu Firma, und der Unterschied ist entscheidend:' },
      { p: '**Saldo-basiert:** die Linie geht vom geschlossenen Geld zu Tagesbeginn aus. Gewinn oder Verlust offener Positionen zählen nicht. Das sicherste Modell.' },
      { p: '**Der höhere Wert:** zu Tagesbeginn schaut man auf Saldo und Equity und nimmt den höheren. Steht deine Nachtposition im Plus, schiebt dieser Buchgewinn die Linie nach oben.' },
      { p: '**Vom Equity-Hoch des Tages:** das härteste Modell. In dem Moment, in dem du im Tagesverlauf ins Plus gehst, rastet die Linie höher ein.' },
      { p: 'Warum wichtig? Weil du im zweiten und dritten Modell dein Konto **ohne echten Verlust** verlieren kannst — allein dadurch, dass du Buchgewinn zurückgibst.' },
      { h: 'Beispiel ($100.000-Konto, 5% Tageslimit)' },
      { p: 'Um Mitternacht steht dein Saldo bei $100.000, die offene Gold-Position liegt +$10.000 im Plus (Equity $110.000).' },
      { p: '**Saldo-basierte Firma:** Linie = $100.000 − $5.000 = **$95.000**. Am nächsten Tag verschwindet der Gewinn ganz, du schließt auf Break-even → Equity $100.000. Du bist $5.000 von der Linie entfernt, kein Problem.' },
      { p: '**Firma nimmt den höheren Wert:** Linie = $110.000 × 0,95 = **$104.500**. Am nächsten Tag verschwinden $5.500 → Equity fällt auf $104.500. **Konto geschlossen.**' },
      { p: 'Achtung: im zweiten Fall liegen in deiner Tasche weiterhin $100.000. Du hast keinen Cent echten Verlust gemacht. Du hast nur einen Gewinn zurückgegeben, den du nie genommen hast — und das Konto war weg.' },
      { p: '**Praxisregel:** nimmt deine Firma den höheren Wert, gilt: je größer der Buchgewinn, den du über Mitternacht trägst, desto enger dein Spielraum am nächsten Tag. Mit schwebendem Gewinn über rund 5% des Kontos in den neuen Tag zu gehen, ist Gefahrenzone.' },
    ],
  },

  consistency: {
    title: 'Consistency-Regel (Gewinnverteilung)',
    short: 'Dein bester Tag darf einen bestimmten Anteil am Gesamtgewinn nicht überschreiten. Das schließt kein Konto, hält aber die Auszahlung zurück. Achtung: bei manchen Firmen gilt sie erst nach der Finanzierung, nicht in der Evaluierung.',
    options: ['Gibt es nicht', '50% oder mehr', '40% – 49%', '30% – 39%', 'Unter 30%'],
    detail: [
      { h: 'Erklärung' },
      { p: 'Die Regel sagt: **der Gewinn eines einzelnen Tages darf einen bestimmten Prozentsatz des Gesamtgewinns nicht überschreiten.** Die Firma will wissen, ob du einen Glückstreffer gelandet hast oder wirklich etwas kannst.' },
      { p: 'Wichtig: diese Regel **schließt** dein Konto nicht. Sie sperrt dein Geld. Bis sie erfüllt ist, musst du weiter handeln und den Gesamtgewinn vergrößern, damit der Anteil des großen Tages prozentual schrumpft.' },
      { p: 'Es gibt eine Falle: bei manchen Firmen existiert sie in der Evaluierung nicht, greift aber nach der Finanzierung. Die Auszahlungsbedingungen muss man getrennt lesen.' },
      { h: 'Beispiel ($100.000-Konto, 35%-Regel)' },
      { p: 'Angenommen, du hast das Ziel erreicht, Gesamtgewinn $7.000. Die Regel: der beste Tag darf 35% der Summe nicht überschreiten. $7.000 × 0,35 = **$2.450**' },
      { p: '**Fall A:** dein bester Tag war $2.000. Kein Problem, du wirst ausgezahlt.' },
      { p: '**Fall B:** dein bester Tag war $4.000. Regel verletzt — Auszahlung gesperrt. Was ist nötig? $4.000 ÷ 0,35 = **$11.429**' },
      { p: 'Um diesen einen Tag zu legitimieren, musst du den Gesamtgewinn also auf $11.429 heben. Bei $7.000 stehenbleiben und auszahlen lassen geht nicht; du musst weitere $4.400 verdienen.' },
      { p: '**Wen trifft es:** wer täglich kleine Gewinne einsammelt, spürt die Regel nie. Wer mit News oder wenigen großen Treffern verdient, läuft ständig hinein — seine Strategie konzentriert den Gewinn naturgemäß auf wenige Tage.' },
      { p: '**Je höher der Prozentsatz, desto besser:** bei 50% darf ein Tag die Hälfte sein (bequem), bei 15% nur ein Siebtel (sehr eng).' },
    ],
  },

  overnight: {
    title: 'Position über Nacht halten',
    short: 'Eine Position über den Tageswechsel hinweg offen halten. Ist es verboten, musst du alles, was du am Tag eröffnest, zum Sessionende schließen.',
    options: ['Erlaubt', 'Erlaubt mit kostenpflichtigem Add-on', 'Verboten — wird zum Sessionende automatisch geschlossen'],
    detail: [
      { h: 'Erklärung' },
      { p: 'Das Recht, eine Position über den Tageswechsel zu halten. Klingt nebensächlich, bestimmt aber direkt deine Strategie.' },
      { p: 'Ist es verboten, musst du jede Position am selben Tag schließen — das System schließt zum Sessionende alles automatisch. Dann sind Swing-Trades unmöglich, mehrtägige Bewegungen nicht greifbar und eine News-Position lässt sich nicht in den nächsten Tag tragen.' },
      { p: 'Bei manchen Firmen ist es erlaubt, aber an ein kostenpflichtiges Add-on gebunden. Bei anderen ist es erlaubt, doch der Übernachtzins (Swap) ist teuer — besonders bei Indizes und Öl, wo ein paar Tage Haltedauer den Gewinn auffressen.' },
      { h: 'Beispiel' },
      { p: 'Am Donnerstag siehst du einen guten Long in Gold; die Bewegung, die du willst, dauert zwei bis drei Tage.' },
      { p: '**Bei einer Firma, die es erlaubt:** du eröffnest, hältst über Freitag und Montag und schließt am Ziel. Du zahlst nur den Swap.' },
      { p: '**Bei einer Firma, die es verbietet:** du musst am selben Tag schließen. Läuft die Bewegung nachts weiter, bist du nicht dabei. Am nächsten Tag musst du neu einsteigen — der Preis kann längst weg sein. Außerdem vervielfachen sich Kommission und Spread, weil du jeden Tag neu einsteigst.' },
      { p: '**Wen trifft es:** ein Scalper, der innerhalb des Tages rein und raus geht, merkt die Regel nicht. Für jemanden mit Swing- oder News-Positionen wird das Konto unbrauchbar.' },
    ],
  },

  payout: {
    title: 'Auszahlungsfrequenz',
    short: 'Wie oft kannst du deinen Gewinn abheben und wie lange wartest du auf die erste Auszahlung? Nicht abgehobener Gewinn steht immer noch im Risiko.',
    options: [
      'Jederzeit (On-demand)',
      'Wöchentlich (7 Tage)',
      '10 – 14 Tage',
      'Mit kostenpflichtigem Add-on auf 14 Tage',
      'Monatlich (28 – 30 Tage)',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Wie oft du dein Geld herausholen kannst. Das gefährdet das Konto nicht, aber vergiss eines nicht: **Gewinn, der auf dem Konto liegt, ist nicht dein Geld.** Solange du ihn nicht abhebst, steht er im Risiko — ein Regelverstoß, ein schlechter Tag, und er ist weg.' },
      { p: 'Zwei Dinge sind zu prüfen: wie lange du auf die erste Auszahlung wartest und wie häufig der Zyklus danach ist.' },
      { h: 'Beispiel' },
      { p: 'Du wurdest finanziert und hast im ersten Monat $5.000 verdient.' },
      { p: '**Firma mit Auszahlung auf Abruf:** du beantragst sie am Tag, an dem der Gewinn entsteht, und hast sie in wenigen Werktagen auf dem Konto. Das Geld gehört jetzt wirklich dir.' },
      { p: '**Firma mit Monatsauszahlung:** 30 Tage Wartezeit. In dieser Zeit kannst du eine schlechte Woche haben und einen Teil zurückgeben oder eine Regel verletzen und die ganzen $5.000 verlieren. Im zweiten Fall war die Zahl auf dem Konto nur eine Zahl und kam nie in deine Tasche.' },
      { p: '**Praktische Folge:** Auszahlungsfrequenz ist keine Frage von "wie schnell werde ich reich", sondern von **wie schnell Risiko vom Tisch kommt**. Eine Firma, die häufig zahlt, lässt dich deinen Gewinn früher sichern.' },
    ],
  },

  riskPerTrade: {
    title: 'Risikolimit pro Trade oder Instrument',
    short: 'Zusätzlich zum Tageslimit eine eigene Obergrenze dafür, wie viel du in einem Trade oder einem Instrument riskieren darfst. Positionen im selben Instrument werden meist addiert und als ein Trade gezählt.',
    options: [
      'Gibt es nicht',
      'Ja, Schwelle 3% oder höher',
      'Ja, Schwelle 2% – 3%',
      'Ja, Schwelle unter 2%',
      'Lot-Obergrenze (je Instrument)',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Neben Tages- und Gesamtlimit eine eigene Grenze dafür, wie viel du **in einem Trade oder einem Instrument** riskieren darfst. Es gibt zwei Formen:' },
      { p: '**Prozentual:** etwa "in einer Trade-Idee darfst du höchstens 2% des Kontos riskieren". Wichtiges Detail: mehrere Positionen im selben Instrument und in dieselbe Richtung gelten meist als **ein Trade**, ihre Risiken werden also addiert.' },
      { p: '**Nach Lots (Lot-Obergrenze):** etwa "in Gold höchstens 3 Lots". Das ist strenger, weil es nicht das Risiko, sondern die absolute Positionsgröße begrenzt.' },
      { h: 'Beispiel 1 — prozentual ($100.000-Konto, 2% = $2.000)' },
      { p: 'Du hast Gold dreimal getrennt gekauft, je $800 Risiko. Du siehst drei Trades, die Firma sieht eine Idee: $800 × 3 = **$2.400** → Limit überschritten, Verstoß.' },
      { h: 'Beispiel 2 — Lot-Obergrenze (3 Lots in Gold)' },
      { p: 'Du willst in Gold $2.500 riskieren. Die nötige Lotgröße hängt vom Stop-Abstand ab:' },
      {
        table: {
          head: ['Stop-Abstand', 'Nötige Lots', 'Ergebnis'],
          rows: [
            ['$20', '1,25 Lots', '✓ Kein Problem'],
            ['$10', '2,5 Lots', '✓ Kein Problem'],
            ['$5', '5 Lots', '✗ Grenze 3 Lots — höchstens $1.500 Risiko'],
          ],
        },
      },
      { p: 'Mit engem Stop erreichst du das gewünschte Risiko also rechnerisch nicht. Eine Lot-Obergrenze trifft direkt jene, die enge Stops setzen.' },
    ],
  },

  stopLoss: {
    title: 'Stop-Loss-Regel',
    short: 'Ist ein Stop Pflicht? Muss der gesetzte Stop in der Plattform sichtbar bleiben? Die Methode "Stop setzen, wieder entfernen, beim Kurs von Hand schließen" gilt bei manchen Firmen als versteckter Stop und ist verboten.',
    options: [
      'Nicht verpflichtend, keine Sichtbarkeitsbedingung',
      'Nicht verpflichtend, aber wenn gesetzt, muss er sichtbar bleiben',
      'Verpflichtend (innerhalb einer Frist zu setzen)',
      'Verpflichtend + maximale Abstandsbedingung',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Die Regel enthält zwei getrennte Fragen:' },
      { p: '**Ist ein Stop Pflicht?** Manche Firmen verlangen für jede Position innerhalb einer Frist einen Stop. Andere mischen sich gar nicht ein.' },
      { p: '**Muss der Stop sichtbar bleiben?** Die weniger bekannte, aber wichtige Regel. Manche Trader setzen den Stop in der Plattform, nehmen ihn wieder heraus und schließen von Hand, wenn der Kurs ankommt — um nicht in die "Stop-Jagd" zu geraten. Manche Firmen nennen das **versteckter Stop (stealth stop)** und verbieten es. Für sie muss der Stop eine echte Order sein, die die ganze Laufzeit der Position in der Plattform steht.' },
      { p: 'Warum ist das den Firmen wichtig? Weil sie ihr eigenes Risiko anhand deiner sichtbaren Stops berechnen. Ein Trader, dessen Stop nicht zu sehen ist, ist für sie ein Trader mit nicht messbarem Risiko.' },
      { h: 'Beispiel' },
      { p: 'Angenommen, du kaufst Gold und setzt den Stop $10 entfernt, nimmst ihn dann heraus und sagst: "kommt der Kurs, schließe ich von Hand".' },
      { p: '**Bei einer Firma ohne Regel:** kein Problem, du managst wie du willst.' },
      { p: '**Bei einer Firma mit Sichtbarkeitsbedingung:** das gilt als Verstoß. Es zeigt sich als Muster in deiner Historie (Positionen ohne Stops, immer manuelle Schließungen) und du landest in der Prüfung.' },
      { p: '**Die Lösung — das Beste aus beiden Welten:** setze den Stop von Anfang an **weit** (dorthin, wo Spikes nicht hinreichen) und verkleinere die Position entsprechend — dein Dollar-Risiko bleibt gleich. Die echte Ausstiegsentscheidung triffst du weiterhin von Hand, wenn der Kurs dein mentales Niveau erreicht. In der Plattform steht aber immer ein Sicherungsstop.' },
      { p: 'Der Bonus: du bist auch geschützt, wenn das Internet ausfällt, wenn du schläfst oder wenn die Plattform einfriert. Ein mentaler Stop wirkt nur, solange du vor dem Bildschirm sitzt.' },
    ],
  },

  minDays: {
    title: 'Mindesthandelstage',
    short: 'Die Mindestzahl an Tagen, um zu bestehen, selbst wenn das Ziel schon erreicht ist. Der entscheidende Unterschied: reicht es, **einen Trade zu eröffnen**, oder musst du an dem Tag auch **Gewinn machen**?',
    options: [
      'Keine (0 Tage)',
      '1 – 4 Tage, einfache Tage (ohne Gewinnbedingung)',
      '5 Tage oder mehr, einfache Tage',
      'Es gilt eine Gewinntag-Bedingung',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Selbst mit erreichtem Gewinnziel musst du an einer bestimmten Zahl unterschiedlicher Tage gehandelt haben. Ziel ist, jene auszusieben, die mit einem Glückstreffer bestehen. Der entscheidende Unterschied:' },
      { p: '**Einfacher Tag:** es genügt, an dem Tag eine Position zu **eröffnen**. Ob Gewinn oder Verlust, der Tag zählt. Sogar ein winziger Trade füllt ihn.' },
      { p: '**Gewinntag:** an dem Tag musst du einen bestimmten Betrag (meist 0,5% des Kontos) **verdienen**. Tage mit Verlust oder kleinem Gewinn zählen nicht.' },
      { p: 'Der Unterschied ist gewaltig. Die Bedingung "einfacher Tag" hält dich nur hin. Die Bedingung "Gewinntag" nimmt dir aus der Hand, in wie vielen Tagen du bestehst — gibt der Markt keine Gelegenheit, wartest du.' },
      { h: 'Beispiel ($50.000-Konto, 3 Gewinntage nötig, 0,5% = $250)' },
      {
        table: {
          head: ['Tag', 'An dem Tag geschlossene Trades', 'Netto', 'Gezählt?'],
          rows: [
            ['Montag', '+$415, −$403', '+$12', '✗ (unter $250)'],
            ['Dienstag', '+$139, +$368', '+$507', '✓'],
            ['Mittwoch', '+$989', '+$989', '✓'],
            ['Donnerstag', '−$658', '−$658', '✗'],
            ['Freitag', '+$2.814', '+$2.814', '✓'],
          ],
        },
      },
      { p: 'Drei Gewinntage stehen. Aber Achtung: der Montag zählte trotz zweier Trades nicht, weil netto $12 blieben. Der Donnerstag zählte nicht, weil er im Minus schloss. Bei einer Firma mit "einfacher Tag"-Bedingung hätten in derselben Woche alle fünf gezählt.' },
      { p: '**Noch ein Detail:** bei manchen Firmen ist der "Tag" jener, an dem die Position **eröffnet** wurde. Eine am Montag eröffnete und am Mittwoch geschlossene Position zählt nur den Montag; Dienstag und Mittwoch bleiben leer.' },
    ],
  },

  payoutDrawdown: {
    title: 'Verhalten der Verlustlinie nach einer Auszahlung',
    short: 'Nach einer Auszahlung sinkt dein Saldo — sinkt die Verlustlinie mit oder bleibt sie stehen? Bleibt sie stehen, verengt jede Auszahlung deinen Puffer.',
    options: [
      'Die Auszahlung berührt die Linie nicht; der Boden sinkt anteilig mit',
      'Der Boden bleibt, der Puffer verengt sich um den ausgezahlten Betrag',
      'Der Boden rastet beim Startsaldo ein',
    ],
    detail: [
      { h: 'Erklärung' },
      { p: 'Wenn du Geld abhebst, sinkt dein Saldo. Und die Verlustlinie? Drei Möglichkeiten:' },
      { p: '**Die Linie sinkt mit:** sie fällt im Verhältnis zur Auszahlung, dein Puffer bleibt erhalten. Der beste Fall.' },
      { p: '**Die Linie bleibt:** der Saldo sinkt, die Linie steht — der Abstand dazwischen, also dein Bewegungsraum, verengt sich. Das häufigste Modell.' },
      { p: '**Die Linie rastet beim Startsaldo ein:** im Moment der Auszahlung wird sie auf dem Ausgangsniveau fixiert. Hebst du deinen ganzen Gewinn ab, ist dein Puffer exakt null.' },
      { p: 'Dieser dritte Fall ist gefährlich, weil das Konto auf dem Papier "voll" aussieht, aber mit einem einzigen kleinen Verlust schließen kann.' },
      { h: 'Beispiel ($100.000-Konto, Firma fixiert den Boden bei $100.000)' },
      { p: 'Du hast $10.000 verdient, dein Saldo steht bei $110.000.' },
      { p: '**Fall A — du hebst $5.000 ab:** Saldo $105.000, Boden $100.000 → **$5.000 Puffer.** Du handelst entspannt weiter.' },
      { p: '**Fall B — du hebst die ganzen $10.000 ab:** Saldo $100.000, Boden $100.000 → **Puffer null.** Schon beim ersten Trade genügt ein Rückgang in Höhe von Spread und Kommission, damit die Equity unter $100.000 fällt und das Konto schließt. Die Auszahlung geht durch, aber das Konto ist weg.' },
      { p: '**Praxisregel:** der nach einer Auszahlung verbleibende Puffer muss deutlich größer sein als das Gesamtrisiko, das du gleichzeitig offen haben kannst. Wenn drei Trades $3.000 Risiko bedeuten, lass nach der Auszahlung mindestens $5.000–6.000 Puffer. Hebe niemals den gesamten Gewinn ab.' },
    ],
  },

  weekend: {
    title: 'Position über das Wochenende halten',
    short: 'Eine Position vom Freitagsschluss bis zur Montagseröffnung halten. Eine eigene Regel, getrennt vom Halten über Nacht. Selbst wenn erlaubt, steigen Swap-Kosten bei Indizes und Öl, und die Montagslücke kann deinen Stop überspringen.',
    options: ['Erlaubt', 'Erlaubt mit kostenpflichtigem Add-on', 'Verboten — wird zum Freitagsschluss automatisch geschlossen'],
    detail: [
      { h: 'Erklärung' },
      { p: 'Das Recht, eine Position vom Freitagsschluss bis zur Montagseröffnung zu halten. Das ist eine **eigene Regel**, getrennt vom Halten über Nacht — manche Firmen erlauben Wochennächte, verbieten aber das Wochenende.' },
      { p: 'Ist es verboten, musst du vor dem Freitagsschluss alles schließen; meist erledigt das System es automatisch. Selbst wenn es erlaubt ist, solltest du zwei Nebenwirkungen kennen:' },
      { p: '**Swap-Kosten:** fürs Wochenende werden meist drei Tage Zinsen berechnet. Bei Indizes und Öl kann die Zahl erheblich sein, bei Forex und Gold ist sie moderater.' },
      { p: '**Gap-Risiko:** der Markt schließt Freitag und öffnet Montag zu einem anderen Kurs. Kommt dazwischen eine Nachricht, kann der Kurs weit hinter deinem Stop eröffnen — der Stop schützt dich also nicht und du verlierst mehr als geplant.' },
      { h: 'Beispiel' },
      { p: 'Am Freitag bist du in Gold long, der Stop liegt $50 entfernt.' },
      { p: '**Normalfall:** Montag eröffnet etwas tiefer, dein Stop greift wie üblich, du nimmst den geplanten Verlust.' },
      { p: '**Gap-Fall:** am Wochenende passiert etwas Geopolitisches. Montag eröffnet Gold $80 unter dem Freitagsschluss. Dein Stop lag bei $50, doch der erste gehandelte Kurs liegt $80 tiefer — dort wird deine Position geschlossen. Du nimmst fast den doppelten geplanten Verlust.' },
      { p: 'Deshalb solltest du beim Halten über das Wochenende mehr Abstand als sonst zu deiner Tages- und Gesamtlinie lassen.' },
    ],
  },
};

export default de;
