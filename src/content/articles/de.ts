/** Yazıların de metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  'metatrader-5-auto-sync': {
    title: "So verbindest du MetaTrader 4 oder 5 mit deinem Trading-Journal",
    description: "Schritt für Schritt: Installiere das Simple-Trading-Journal-Add-on in MT4 oder MT5, damit jeder geschlossene Trade automatisch in deinem Journal landet – mit Stop-Loss, Risiko und Gebühren.",
    body: [
      { p: "Jeden Trade von Hand ins Journal zu tippen, ist der Hauptgrund, warum Leute mit dem Journaling aufhören. Mit dem MetaTrader-Add-on (MT4 und MT5) wird jeder Trade in dem Moment erfasst, in dem er eröffnet wird, und beim Schließen vervollständigt: Einstieg, Ausstieg, Stop-Loss, Lotgröße, Kommission und Swap. Du ergänzt nur, was MetaTrader nicht wissen kann: dein Setup, deine Begründung und wie du dich gefühlt hast." },
      { note: "MetaTrader 4 oder 5? Die Schritte sind bei beiden gleich, nur Datei und Ordner unterscheiden sich. Wähle auf dem MetaTrader-Bildschirm der App zuerst deine Version: MetaTrader 5 nutzt SimpleTradingJournal.ex5 und MQL5 → Experts, MetaTrader 4 nutzt SimpleTradingJournal.ex4 und MQL4 → Experts." },
      { h2: 'Was du brauchst' },
      { ul: [
        "MetaTrader 4 oder MetaTrader 5 unter Windows oder Mac (das Desktop-Terminal – die Mobile-App kann keine Add-ons ausführen).",
        'Ein Simple-Trading-Journal-Konto mit mindestens einem Journal.',
        'Zwei Minuten.',
      ] },
      { h2: '1. Add-on herunterladen' },
      { p: "Öffne in der App im Menü MetaTrader, wähle MetaTrader 4 oder 5 und lade das Add-on herunter (SimpleTradingJournal.ex5 für MT5, SimpleTradingJournal.ex4 für MT4). Wähle in MetaTrader File → Open Data Folder, geh in MQL5 → Experts (bei MT4 MQL4 → Experts) und leg die Datei dort ab." },
      { note: "Auf dem Mac funktioniert „Open Data Folder“ in manchen Versionen nicht. Nutze dann im Finder Gehe zu → Gehe zum Ordner und füge den Pfad für deine Version ein. MetaTrader 5: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts — MetaTrader 4: ~/Library/Application Support/net.metaquotes.wine.metatrader4/drive_c/Program Files (x86)/MetaTrader 4/MQL4/Experts" },
      { h2: '2. Verbindung erlauben' },
      { p: 'MetaTrader blockiert Internetanfragen von Add-ons, bis du die Adresse freigibst. Geh zu Tools → Options → Expert Advisors, setz das Häkchen bei „Allow WebRequest for listed URL“ und füge hinzu:' },
      { code: 'https://www.simpletradejournal.io' },
      { h2: '3. MetaTrader neu starten' },
      { p: 'Schließe MetaTrader und öffne es wieder. SimpleTradingJournal erscheint jetzt unter Expert Advisors im Navigator links.' },
      { h2: '4. Auf einen Chart ziehen und Schlüssel einfügen' },
      { p: "Erstelle in der App einen Verbindungsschlüssel (er beginnt mit stj_). Zieh SimpleTradingJournal auf einen beliebigen Chart, öffne den Tab Inputs, füge den Schlüssel bei ApiKey ein und klicke auf OK. Sobald oben links im Chart steht, dass die Verbindung funktioniert, bist du fertig. Dort steht auch, an welches Journal die Trades gehen (Journal: …) – prüfe, ob es das richtige ist." },
      { p: 'Jeder Schlüssel gehört zu einem Journal und wird an das erste Handelskonto gebunden, das sich damit verbindet – so vermischen sich die Trades zweier Konten nie in einem Journal. Für ein zweites Konto erstellst du einen zweiten Schlüssel.' },
      { h2: 'Auf welchen Chart gehört es?' },
      { p: 'MetaTrader führt pro Chart nur einen Expert Advisor aus. Wenn du bereits einen anderen EA nutzt, öffne einen neuen, leeren Chart nur für das Journal-Add-on und lass ihn offen – jeder geschlossene Trade kommt dann von selbst an, während du auf deinen anderen Charts weiter handelst. Willst du keinen zusätzlichen Chart offen halten, kannst du das Add-on auch nur dann auf einen Chart legen, wenn du synchronisieren willst; es holt alles nach, was in der Zwischenzeit geschlossen wurde.' },
      { h2: 'Was erfasst wird' },
      { ul: [
        'Symbol, Richtung, Lotgröße, Ein- und Ausstiegskurs und -zeit.',
        'Stop-Loss und Take-Profit. Der Stop, mit dem du eingestiegen bist, bleibt erhalten, auch wenn du ihn später verschiebst – so bleiben Risiko und R-Multiples ehrlich.',
        'Bruttoergebnis, Kommission, Swap und Nettoergebnis.',
        "In MetaTrader 5 wird eine in Teilen geschlossene Position (TP1, TP2 …) nach dem vollständigen Schließen als ein Trade erfasst. In MetaTrader 4 erhält der Rest einer teilweise geschlossenen Order eine neue Nummer und erscheint deshalb als eigener Trade.",
      ] },
      { h2: 'Fehlerbehebung' },
      { ul: [
        'Es kommt nichts an: Prüfe, ob die Adresse aus Schritt 2 genau https://www.simpletradejournal.io lautet, ob der Chart mit dem Add-on noch offen ist und ob der Schlüssel ohne Leerzeichen eingefügt wurde.',
        "„Schlüssel an ein anderes Konto gebunden“: Der Schlüssel gehört bereits zu einem anderen Handelskonto. Erstelle für dieses Konto einen neuen Schlüssel.", "Trades landen im falschen Journal: Die Zeile „Journal:“ auf dem Chart zeigt, wohin sie gehen. Steht dort ein anderes Journal, nutzt das Add-on noch einen alten Schlüssel. Öffne Inputs, leere ApiKey vollständig, füge den neuen Schlüssel ein, drücke Enter und dann OK. Der alte Schlüssel wird automatisch geschlossen, sobald sich der neue verbindet.", "In MetaTrader 4 ist das Add-on ausgegraut und lässt sich nicht ziehen: Nutze die SimpleTradingJournal.ex4 vom MetaTrader-Bildschirm, klicke dann im Navigator mit der rechten Maustaste auf Expert Advisors und wähle Refresh.",
        "Schlüssel verloren: MetaTrader merkt ihn sich. Falls er wirklich weg ist, erstelle in der App einen neuen; der alte wird automatisch geschlossen, sobald sich der neue verbindet.",
      ] },
      { p: 'Lieber nichts installieren? Du kannst auch den MetaTrader-eigenen Bericht importieren – siehe die Anleitung zum Import.' },
    ],
  },
  'import-trade-history': {
    title: 'So importierst du deine Handelshistorie in ein Trading-Journal',
    description: 'Importiere geschlossene Trades aus MetaTrader 4/5, cTrader, TradeLocker, DXtrade oder Match-Trader. Wie du den richtigen Bericht bekommst, was daraus gelesen wird und wie Duplikate vermieden werden.',
    body: [
      { p: 'Wenn du schon seit Monaten handelst, musst du nicht alles abtippen. Exportiere einen Bericht aus deiner Plattform und zieh ihn ins Journal – die Datei wird in deinem Browser gelesen, die Plattform automatisch erkannt, und du siehst alle Trades, bevor irgendetwas gespeichert wird.' },
      { h2: 'Unterstützte Plattformen' },
      { ul: ['MetaTrader 5 und MetaTrader 4 (der HTML-Bericht)', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader', 'Jede andere CSV – du wählst selbst, welche Spalte Datum, Symbol, Richtung und Ergebnis ist'] },
      { h2: 'Den richtigen MetaTrader-Bericht erstellen' },
      { ol: [
        'Öffne in MetaTrader die Toolbox (Strg+T) und wechsle zum Tab History.',
        'Klicke mit der rechten Maustaste in die Liste und wähle den gewünschten Zeitraum (zum Beispiel „All history“).',
        'Erneut Rechtsklick → Report und als HTML speichern.',
      ] },
      { note: 'Verwende nicht den Kontobericht, der nur Kontostand und offene Positionen zeigt – er enthält keine geschlossenen Trades. Meldet der Import, dass keine geschlossenen Trades gefunden wurden, liegt es fast immer daran.' },
      { h2: 'Importieren' },
      { ol: [
        'Wähle in der App Importieren und das Journal, in das die Trades sollen.',
        'Zieh die Datei ins Fenster oder klicke, um sie auszuwählen.',
        'Prüfe die Vorschau: Symbol, Richtung, Lots, Kurse, Zeiten und Nettoergebnis jedes Trades.',
        'Bestätige. Die Trades erscheinen in Journal, Kalender und Statistik.',
      ] },
      { h2: 'Was aus dem Bericht gelesen wird' },
      { ul: [
        'Das Nettoergebnis – nicht nur der Bruttogewinn; Kommission, Swap und Gebühren werden berücksichtigt.',
        'Der Stop-Loss, damit Risiko und R-Multiple jedes Trades berechnet werden können.',
        'Ein- und Ausstiegskurse und -zeiten.',
      ] },
      { h2: 'Dieselbe Datei zweimal importieren' },
      { p: 'Jeder Trade trägt seine Plattform-ID, daher wird ein Trade, der schon im Journal steht, übersprungen statt erneut hinzugefügt. Du kannst jede Woche einen aktuellen Bericht importieren, ohne etwas aufräumen zu müssen. Hast du einen Trade von Hand erfasst, solange er noch offen war, vervollständigt der Import diesen Eintrag, statt einen zweiten anzulegen.' },
      { p: "Soll das von selbst passieren? Verbinde MetaTrader 4 oder 5 einmal, und geschlossene Trades kommen automatisch an – siehe die MetaTrader-Anleitung." },
    ],
  },
  'how-to-keep-a-trading-journal': {
    title: 'So führst du ein Trading-Journal, das du wirklich nutzt',
    description: 'Was du zu jedem Trade festhältst, wie oft du es auswertest und welche Gewohnheiten ein Trading-Journal von einer aufgegebenen Tabelle in dein nützlichstes Werkzeug verwandeln.',
    body: [
      { p: 'Die meisten Trader sind sich einig, dass ein Journal hilft – und die meisten hören nach ein paar Wochen damit auf. Selten liegt es an Disziplin. Das Journal verlangt zum falschen Zeitpunkt zu viel und gibt nichts zurück. Ein Journal, das du wirklich nutzt, ist schnell ausgefüllt, schnell ausgewertet und zeigt dir etwas, das du allein nicht sehen würdest.' },
      { h2: 'Was du zu jedem Trade festhältst' },
      { p: 'Teile es auf in das, was die Plattform weiß, und das, was nur du weißt.' },
      { ul: [
        'Die Fakten: Symbol, Richtung, Einstieg, Ausstieg, Stop-Loss, Größe, Ergebnis nach Gebühren. Die sollten nie von Hand getippt werden – importiere sie oder synchronisiere sie von deiner Plattform.',
        'Der Plan: welches Setup es war und warum du eingestiegen bist. Eine Zeile reicht.',
        'Der Zustand: wie du dich beim Einstieg gefühlt hast – ruhig, gelangweilt, gehetzt, auf Verlustausgleich aus.',
        'Ein Screenshot des Charts beim Einstieg, wenn das Setup visuell ist.',
      ] },
      { h2: 'Miss in R, nicht in Geld' },
      { p: 'Ein Gewinn von 300 Dollar sagt für sich wenig. Hast du 100 Dollar riskiert, war es ein 3R-Trade; hast du 600 riskiert, war es ein halbes R und ein schlechter Trade, der zufällig aufgegangen ist. Wenn du deinen Stop festhältst, kann das Journal jedes Ergebnis als Vielfaches deines Risikos ausdrücken – und genau diese Zahl zeigt, ob dein Vorteil echt ist.' },
      { h2: 'Nach festem Rhythmus auswerten' },
      { ul: [
        'Täglich, zwei Minuten: Habe ich mich heute an meinen Plan gehalten? Gibt es etwas zu notieren, solange es frisch ist?',
        'Wöchentlich, fünfzehn Minuten: Welche Setups haben Geld gebracht, welche gekostet – an welchen Tagen und in welchen Sessions?',
        'Monatlich: Steigt meine Kapitalkurve wegen der Setups, an die ich glaube, oder trotz ihnen?',
      ] },
      { h2: 'Achte auf Verhalten, nicht nur auf Statistik' },
      { p: 'Trefferquote und durchschnittliches R sagen dir, was passiert ist. Nützlicher sind Fragen zu deinem Verhalten: Hast du Minuten nach einem Verlust den nächsten Trade eröffnet? Ist deine Größe nach Verlusten gestiegen? Hast du an manchen Tagen deutlich mehr gehandelt, als dein Plan erlaubt, oder außerhalb deiner üblichen Zeiten? Diese Muster kosten mehr als jedes einzelne schlechte Setup und fallen Trade für Trade kaum auf.' },
      { p: 'Simple Trading Journal prüft diese vier Gewohnheiten automatisch – Revenge-Trading, höheres Risiko nach Verlusten, Overtrading und Handeln außerhalb deiner üblichen Zeiten – über alle deine Journale hinweg.' },
      { h2: 'Halte den Aufwand klein' },
      { ul: [
        'Automatisiere die Fakten, damit ein Trade in Sekunden erfasst ist, nicht in Minuten.',
        'Nutze eine kurze Checkliste vor dem Einstieg statt langer Notizen danach.',
        'Benenne Setups einheitlich – fünf täglich genutzte Setups schlagen fünfzig, die einmal vorkommen.',
        'Führe getrennte Journale für getrennte Konten, etwa eine Prop-Challenge und ein privates Konto.',
      ] },
      { h2: 'Fang klein an' },
      { p: 'Am ersten Tag brauchst du kein perfektes System. Erfasse die Fakten automatisch, schreib zu jedem Trade eine Zeile, warum du ihn genommen hast, und schau einmal pro Woche hinein. Nach einem Monat hast du etwas, das dir kein Indikator geben kann: Belege über dein eigenes Trading.' },
    ],
  },
  'r-multiple-explained': {
    title: 'R-Multiples erklärt: Bewerte jeden Trade am eingegangenen Risiko',
    description: 'Was ein R-Multiple ist, wie du es aus dem Stop-Loss berechnest und warum der Erwartungswert in R der klarste Weg ist, um zu erkennen, ob eine Strategie einen Vorteil hat.',
    body: [
      { p: 'Geld ist ein schlechter Maßstab, um Trades zu vergleichen. Derselbe Gewinn von 200 Dollar kann hervorragend oder leichtsinnig sein – je nachdem, wie viel du dafür riskiert hast. R-Multiples lösen das, indem sie jedes Ergebnis am eingegangenen Risiko messen.' },
      { h2: 'Was ist 1R?' },
      { p: '1R ist der Betrag, den du verlierst, wenn der Trade deinen Stop-Loss erreicht. Kauf bei 1,1000 mit 1 Lot und Stop bei 1,0950: 1R ist das, was dich diese 50 Pips kosten – sagen wir 500 Dollar.' },
      { h2: 'R-Multiple berechnen' },
      { code: 'R-Multiple = Ergebnis des Trades ÷ Anfangsrisiko (1R)' },
      { ul: [
        '1.000 Dollar gewonnen bei 500 Risiko: +2R.',
        '500 Dollar am Stop verloren: −1R.',
        '750 verloren wegen Slippage oder verschobenem Stop: −1,5R – ein Zeichen, dass etwas schiefgelaufen ist.',
        'Früh mit 150 geschlossen: +0,3R.',
      ] },
      { h2: 'Warum das wichtig ist' },
      { p: 'Sobald jeder Trade in R ausgedrückt ist, werden Ergebnisse über Positionsgrößen, Instrumente und Konten hinweg vergleichbar. Du siehst, dass ein Setup mit 40 % Trefferquote hervorragend ist, weil die Gewinner im Schnitt +2,5R bringen – oder dass 70 % Trefferquote ein Problem sind, weil die Verlierer im Schnitt −3R kosten.' },
      { h2: 'Erwartungswert' },
      { p: 'Der Erwartungswert ist dein durchschnittliches R pro Trade. Addiere das R aller Trades und teile durch die Anzahl der Trades.' },
      { code: 'Erwartungswert = Summe R ÷ Anzahl Trades' },
      { p: 'Ein positiver Erwartungswert bedeutet, dass dir jeder Trade im Schnitt Geld im Verhältnis zum Risiko eingebracht hat. 0,3R über 100 Trades sind 30R; bei 1 % Risiko pro Trade grob 30 % vor Zinseszins. Bei negativem Erwartungswert helfen mehr Trades nicht – Setup, Ausführung oder Risikomanagement müssen sich ändern.' },
      { h2: 'Häufige Fehler' },
      { ul: [
        'Den Stop nicht erfassen. Ohne ihn gibt es kein 1R und kein R-Multiple.',
        'Den verschobenen statt des ursprünglichen Stops verwenden. R misst das Risiko, das du beim Einstieg akzeptiert hast.',
        'Kosten ignorieren. Kommission und Swap gehören zum Ergebnis; ein +1R-Trade kann nach Kosten +0,9R sein.',
        'Ein Setup nach einer Handvoll Trades beurteilen. Schau dir mindestens 30 an, bevor du Schlüsse ziehst.',
      ] },
      { h2: 'In Simple Trading Journal' },
      { p: "Hat ein Trade einen Stop-Loss – von Hand eingegeben, aus einem Bericht importiert oder aus MetaTrader synchronisiert –, werden sein Risiko und sein R-Multiple automatisch berechnet, und deine Statistik zeigt dein durchschnittlich realisiertes R neben den Ergebnissen in Geld." },
    ],
  },
  'prop-firm-daily-loss-and-drawdown': {
    title: 'Tagesverlust und maximaler Drawdown: Prop-Firm-Regeln im Blick behalten, ohne sie zu brechen',
    description: 'Wie Tagesverlustlimits, maximaler Drawdown und Gewinnziele bei Prop-Firmen meist funktionieren, warum die meisten Challenges an einer Regel statt an einem schlechten Trade scheitern und wie du jederzeit deinen Abstand zum Limit kennst.',
    body: [
      { p: 'Prop-Challenges scheitern selten, weil eine Strategie nicht mehr funktioniert. Sie scheitern an einem Dienstagnachmittag, wenn ein Trader nach drei Verlusten nicht merkt, dass er noch 180 Dollar vom Tageslimit entfernt ist. Die Regeln sind einfach; schwer ist es, Trade für Trade genau zu wissen, wo man im Verhältnis zu ihnen steht.' },
      { note: 'Jede Firma formuliert ihre Regeln anders und ändert sie mit der Zeit. Prüfe immer die aktuellen Regeln deiner Firma – dieser Artikel erklärt die üblichen Regelarten, nicht eine bestimmte Firma.' },
      { h2: 'Die drei Zahlen, die über eine Challenge entscheiden' },
      { ul: [
        'Gewinnziel: der Gewinn, den du erreichen musst, meist ein Prozentsatz des Startkapitals.',
        'Tagesverlustlimit: wie viel du an einem Handelstag verlieren darfst. Firmen unterscheiden sich darin, ob es vom Kontostand oder vom Equity zu Tagesbeginn gemessen wird und wann der Tag zurückgesetzt wird.',
        'Maximaler Verlust (Drawdown): wie weit das Konto insgesamt fallen darf. Er kann statisch sein (gemessen vom Startkapital) oder nachlaufend (er folgt deinem höchsten Kontostand oder Equity nach oben).',
      ] },
      { h2: 'Statischer vs. nachlaufender Drawdown' },
      { p: 'Bei einem statischen Limit auf einem 100.000-Dollar-Konto und 10 % maximalem Verlust scheitert das Konto unter 90.000 – egal, was vorher passiert ist. Bei einem nachlaufenden Limit steigt die Untergrenze mit, wenn das Konto zuerst auf 105.000 wächst, in diesem Beispiel auf 95.000. Nachlaufende Limits bestrafen es, Gewinne wieder abzugeben, sodass der Abstand zum Limit selbst in einer Gewinnwoche schrumpfen kann.' },
      { h2: 'Warum Challenges an Regeln scheitern' },
      { ul: [
        'Verluste kommen gehäuft. Drei Stops in Folge in einer Session sind normal und reichen bei 1 % Risiko pro Trade plus Gebühren oft bis ans Tageslimit.',
        'Offene Trades zählen. Bei Equity-basierten Regeln kann ein schwebender Verlust das Limit reißen, bevor ein Trade geschlossen ist.',
        'Gebühren und Swap zählen. Das Limit sieht dein Netto-, nicht dein Bruttoergebnis.',
        'Unter Druck ändert sich Verhalten. Revenge-Trades und größere Positionen nach Verlusten machen aus einem schlechten Tag eine verlorene Challenge.',
      ] },
      { h2: 'Eine einfache Schutzroutine' },
      { ol: [
        'Wähle die Positionsgröße so, dass eine normale Verlustserie das Tageslimit nicht erreichen kann – etwa höchstens ein Drittel des Tageslimits Risiko pro Trade.',
        'Prüfe vor jedem Trade, wie weit du vom Tages- und vom Maximallimit entfernt bist.',
        'Setz dir einen persönlichen Stopp weit vor dem der Firma: Hast du die Hälfte des Tageslimits verloren, ist für heute Schluss.',
        'Werte jeden Tag aus, an dem du nah dran warst. Das Muster wiederholt sich meist.',
      ] },
      { h2: 'Tracking in Simple Trading Journal' },
      { p: 'Markiere ein Journal als Prop-Konto, trage Gewinnziel, Tagesverlustlimit und maximalen Verlust der Firma ein, und das Journal zeigt dir beim Handeln, wie weit du von jedem entfernt bist. Verlustlimits werden bei Annäherung erst bernsteinfarben, dann rot; das Gewinnziel wird grün, je näher du ihm kommst. Die Disziplin-Analyse markiert Revenge-Trades und steigendes Risiko nach Verlusten – die Gewohnheiten, an denen die meisten Challenges scheitern.' },
    ],
  },
  // --- karşılaştırmalar (scripts: compare_gen) ---
  'tradezella-alternative': {
    "title": "Simple Trading Journal vs. Tradezella: ein ehrlicher Vergleich",
    "description": "Auf der Suche nach einer Tradezella-Alternative? Preise, Gratis-Plan, Testphase und MetaTrader-Sync im direkten Vergleich – und wo welches Tool stärker ist.",
    "body": [
      {
        "p": "Tradezella ist eines der bekanntesten Trading-Journale. Wenn du eine Alternative suchst – günstiger, in deiner Sprache oder mit Gratis-Plan –, so schneidet Simple Trading Journal im Vergleich ab."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradezella"
          ],
          [
            "Monatspreis",
            "$14.99",
            "$35 – $99"
          ],
          [
            "Jahrespreis",
            "$119",
            "$315 – $891"
          ],
          [
            "Gratis-Plan",
            "Ja – 2 Trades pro Tag, ohne Zeitlimit",
            "Nein"
          ],
          [
            "Kostenlose Testphase",
            "3 Tage Pro, ohne Karte",
            "Nicht auf der Preisseite angegeben"
          ],
          [
            "Automatischer MetaTrader-Sync",
            "MT4 und MT5",
            "MT4 und MT5"
          ],
          [
            "So wird MetaTrader verbunden",
            "Add-on in MetaTrader + Schlüssel, kein Passwort nötig",
            "Kontonummer + Investor-Passwort"
          ],
          [
            "Import",
            "MT4/MT5-Bericht, cTrader, TradeLocker, DXtrade, Match-Trader, jede CSV",
            "Über 500 Broker und Prop-Firmen"
          ]
        ]
      },
      {
        "note": "Preise und Funktionen von Tradezella stammen von seinen eigenen Preis- und Hilfeseiten im September 2026 und können sich geändert haben. Prüfe seine Website, bevor du dich entscheidest."
      },
      {
        "h2": "Wo Tradezella stärker ist"
      },
      {
        "ul": [
          "Deutlich mehr Broker- und Prop-Firm-Anbindungen – laut Tradezella über 500.",
          "Längere Erfahrung und mehr Funktionen in den höheren Tarifen.",
          "MT4- und MT5-Konten synchronisieren, ohne etwas in MetaTrader zu installieren."
        ]
      },
      {
        "h2": "Wo Simple Trading Journal stärker ist"
      },
      {
        "ul": [
          "Ein Gratis-Plan ohne Zeitlimit (2 Trades pro Tag) und 3 Tage Pro ohne Karte.",
          "Pro kostet $14.99 im Monat oder $119 im Jahr – die günstigste Option von Tradezella kostet $35 im Monat.",
          "Die ganze App in 9 Sprachen, darunter Deutsch, Türkisch, Persisch und Arabisch.",
          "MetaTrader 4 und 5 verbinden sich über ein kleines Add-on und einen Schlüssel; dein Investor-Passwort gibst du nie weiter.",
          "Eingebaute Disziplin-Analyse (Revenge-Trades, steigendes Risiko nach Verlusten, Overtrading, Handeln außerhalb deiner Zeiten) und Prop-Firm-Limit-Tracking."
        ]
      },
      {
        "h2": "Welches solltest du wählen?"
      },
      {
        "p": "Wenn du eine sehr breite Auswahl an Broker-Anbindungen oder die fortgeschritteneren Werkzeuge brauchst, passt Tradezella vielleicht besser. Wenn du auf MetaTrader handelst, ein Journal in deiner Sprache willst und lieber kostenlos startest, probier Simple Trading Journal – der Gratis-Plan braucht keine Karte."
      }
    ]
  },
  'tradersync-alternative': {
    "title": "Simple Trading Journal vs. TraderSync: ein ehrlicher Vergleich",
    "description": "Auf der Suche nach einer TraderSync-Alternative? Preise, Gratis-Plan, Testphase und MetaTrader-Sync im direkten Vergleich – und wo welches Tool stärker ist.",
    "body": [
      {
        "p": "TraderSync ist eines der bekanntesten Trading-Journale. Wenn du eine Alternative suchst – günstiger, in deiner Sprache oder mit Gratis-Plan –, so schneidet Simple Trading Journal im Vergleich ab."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TraderSync"
          ],
          [
            "Monatspreis",
            "$14.99",
            "$29.95 – $79.95"
          ],
          [
            "Jahrespreis",
            "$119",
            "$269.52 – $719.52"
          ],
          [
            "Gratis-Plan",
            "Ja – 2 Trades pro Tag, ohne Zeitlimit",
            "Nein"
          ],
          [
            "Kostenlose Testphase",
            "3 Tage Pro, ohne Karte",
            "7 Tage, ohne Karte"
          ],
          [
            "Automatischer MetaTrader-Sync",
            "MT4 und MT5",
            "MT4 und MT5"
          ],
          [
            "Import",
            "MT4/MT5-Bericht, cTrader, TradeLocker, DXtrade, Match-Trader, jede CSV",
            "Über 200 Broker und Plattformen"
          ]
        ]
      },
      {
        "note": "Preise und Funktionen von TraderSync stammen von seinen eigenen Preis- und Hilfeseiten im September 2026 und können sich geändert haben. Prüfe seine Website, bevor du dich entscheidest."
      },
      {
        "h2": "Wo TraderSync stärker ist"
      },
      {
        "ul": [
          "Über 200 unterstützte Broker und Plattformen.",
          "Ein KI-Assistent (Cypher) und Trade-Replay in den höheren Tarifen.",
          "Eine 7-tägige Testphase mit allen Funktionen, ohne Karte."
        ]
      },
      {
        "h2": "Wo Simple Trading Journal stärker ist"
      },
      {
        "ul": [
          "Ein Gratis-Plan ohne Zeitlimit (2 Trades pro Tag) und 3 Tage Pro ohne Karte.",
          "Pro kostet $14.99 im Monat oder $119 im Jahr – die günstigste Option von TraderSync kostet $29.95 im Monat.",
          "Die ganze App in 9 Sprachen, darunter Deutsch, Türkisch, Persisch und Arabisch.",
          "MetaTrader 4 und 5 verbinden sich über ein kleines Add-on und einen Schlüssel; dein Investor-Passwort gibst du nie weiter.",
          "Eingebaute Disziplin-Analyse (Revenge-Trades, steigendes Risiko nach Verlusten, Overtrading, Handeln außerhalb deiner Zeiten) und Prop-Firm-Limit-Tracking."
        ]
      },
      {
        "h2": "Welches solltest du wählen?"
      },
      {
        "p": "Wenn du eine sehr breite Auswahl an Broker-Anbindungen oder die fortgeschritteneren Werkzeuge brauchst, passt TraderSync vielleicht besser. Wenn du auf MetaTrader handelst, ein Journal in deiner Sprache willst und lieber kostenlos startest, probier Simple Trading Journal – der Gratis-Plan braucht keine Karte."
      }
    ]
  },
  'edgewonk-alternative': {
    "title": "Simple Trading Journal vs. Edgewonk: ein ehrlicher Vergleich",
    "description": "Auf der Suche nach einer Edgewonk-Alternative? Preise, Gratis-Plan, Testphase und MetaTrader-Sync im direkten Vergleich – und wo welches Tool stärker ist.",
    "body": [
      {
        "p": "Edgewonk ist eines der bekanntesten Trading-Journale. Wenn du eine Alternative suchst – günstiger, in deiner Sprache oder mit Gratis-Plan –, so schneidet Simple Trading Journal im Vergleich ab."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Edgewonk"
          ],
          [
            "Monatspreis",
            "$14.99",
            "– (nur jährlich)"
          ],
          [
            "Jahrespreis",
            "$119",
            "$197"
          ],
          [
            "Gratis-Plan",
            "Ja – 2 Trades pro Tag, ohne Zeitlimit",
            "Nein"
          ],
          [
            "Kostenlose Testphase",
            "3 Tage Pro, ohne Karte",
            "Nein – 14 Tage Geld-zurück-Garantie"
          ],
          [
            "Automatischer MetaTrader-Sync",
            "MT4 und MT5",
            "MT4 und MT5"
          ],
          [
            "So wird MetaTrader verbunden",
            "Add-on in MetaTrader + Schlüssel, kein Passwort nötig",
            "FTP-Berichtsveröffentlichung von MetaTrader"
          ],
          [
            "Import",
            "MT4/MT5-Bericht, cTrader, TradeLocker, DXtrade, Match-Trader, jede CSV",
            "Viele Plattformen (siehe Import-Seite)"
          ]
        ]
      },
      {
        "note": "Preise und Funktionen von Edgewonk stammen von seinen eigenen Preis- und Hilfeseiten im September 2026 und können sich geändert haben. Prüfe seine Website, bevor du dich entscheidest."
      },
      {
        "h2": "Wo Edgewonk stärker ist"
      },
      {
        "ul": [
          "Ein etabliertes Journal mit einem einzigen Tarif, der alle Funktionen enthält.",
          "Eine 14-tägige Geld-zurück-Garantie.",
          "Automatischer MT4- und MT5-Sync über die eigene Berichtsveröffentlichung von MetaTrader."
        ]
      },
      {
        "h2": "Wo Simple Trading Journal stärker ist"
      },
      {
        "ul": [
          "Ein Gratis-Plan ohne Zeitlimit (2 Trades pro Tag) und 3 Tage Pro ohne Karte.",
          "Pro kostet $14.99 im Monat oder $119 im Jahr – die günstigste Option von Edgewonk kostet $197 im Jahr.",
          "Die ganze App in 9 Sprachen, darunter Deutsch, Türkisch, Persisch und Arabisch.",
          "MetaTrader 4 und 5 verbinden sich über ein kleines Add-on und einen Schlüssel; dein Investor-Passwort gibst du nie weiter.",
          "Eingebaute Disziplin-Analyse (Revenge-Trades, steigendes Risiko nach Verlusten, Overtrading, Handeln außerhalb deiner Zeiten) und Prop-Firm-Limit-Tracking."
        ]
      },
      {
        "h2": "Welches solltest du wählen?"
      },
      {
        "p": "Wenn du eine sehr breite Auswahl an Broker-Anbindungen oder die fortgeschritteneren Werkzeuge brauchst, passt Edgewonk vielleicht besser. Wenn du auf MetaTrader handelst, ein Journal in deiner Sprache willst und lieber kostenlos startest, probier Simple Trading Journal – der Gratis-Plan braucht keine Karte."
      }
    ]
  },
  "pre-trade-checklist": {
    "title": "Die Checkliste vor dem Trade: So schreibst du eine, die du wirklich nutzt",
    "description": "Warum eine kurze Checkliste vor dem Einstieg impulsive Trades reduziert, wie du Regeln schreibst, die sich mit Ja oder Nein beantworten lassen, und wie du prüfst, ob deine Checkliste funktioniert.",
    "body": [
      {
        "p": "Die meisten schlechten Trades entstehen nicht aus schlechter Analyse. Es sind Trades, die eingegangen wurden, als das Setup nur halb da war – ein Level fast erreicht, ein Signal fast bestätigt –, weil Stillhalten sich schlimmer anfühlte als Handeln. Eine Checkliste lässt dich diese Entscheidung treffen, bevor der Moment kommt."
      },
      {
        "h2": "Wozu eine Checkliste dient"
      },
      {
        "p": "Eine Checkliste findet keine Trades für dich. Sie filtert die, die du ohnehin eingehen willst, sodass nur die durchkommen, die zu deinem Plan passen. Piloten und Chirurgen nutzen Checklisten aus demselben Grund: Unter Druck überspringen Menschen Schritte, die sie auswendig kennen."
      },
      {
        "h2": "Regeln, die sich mit Ja oder Nein beantworten lassen"
      },
      {
        "p": "Jeder Punkt sollte eine Frage mit einer klaren Antwort im Moment des Einstiegs sein. „Ist der Trend aufwärts?“ ist Auslegungssache; „Liegt der Kurs im 4-Stunden-Chart über dem gleitenden 200-Perioden-Durchschnitt?“ nicht."
      },
      {
        "ul": [
          "Kontext: Stimmt die Richtung des höheren Zeitrahmens mit meinem Trade überein?",
          "Ort: Liegt der Einstieg an einem Level, das ich vor der Session markiert habe – nicht an einem, das ich erst nach der Bewegung gefunden habe?",
          "Auslöser: Hat mein Einstiegssignal wirklich geschlossen, oder beginnt es erst, sich zu bilden?",
          "Risiko: Liegt der Stop dort, wo die Idee widerlegt ist, und bleibt die Größe innerhalb meines Risikos pro Trade?",
          "Kalender: Stehen in den nächsten 30 Minuten keine wichtigen Nachrichten an?"
        ]
      },
      {
        "h2": "Halte sie kurz"
      },
      {
        "p": "Drei bis sieben Punkte reichen. Eine Liste mit fünfzehn wird überflogen und dann ignoriert. Ändert ein Punkt nie eine Entscheidung, streiche ihn; kommt derselbe Fehler immer wieder, mach ihn zu einem Punkt."
      },
      {
        "h2": "Eine Liste pro Strategie"
      },
      {
        "p": "Wenn du zwei verschiedene Setups handelst – etwa einen Ausbruch und einen Pullback –, brauchen sie unterschiedliche Bedingungen. Beide in eine Liste zu zwängen, macht bei jedem Trade die Hälfte der Punkte bedeutungslos, und bedeutungslose Kästchen abzuhaken wird schnell zur Gewohnheit, ohne Lesen abzuhaken."
      },
      {
        "h2": "Prüfe, ob sie funktioniert"
      },
      {
        "p": "Eine Checkliste ist eine Hypothese. Vergleiche nach 20–30 Trades die Trades, bei denen alle Punkte abgehakt waren, mit denen, die du trotzdem eingegangen bist. Laufen die vollständig abgehakten nicht besser, sind es die falschen Punkte – ändere sie, statt die Idee aufzugeben."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "Du kannst mehrere benannte Checklisten führen, eine pro Strategie, für jedes Journal festlegen, welche es nutzt, und die Punkte bei jedem Trade abhaken. Trades, die aus MetaTrader kommen, erhalten ebenfalls die Checkliste des Journals, damit du sie ausfüllen kannst, wenn du deine Notizen ergänzt."
      }
    ]
  },
  "trading-emotions-journal": {
    "title": "Emotionen im Trading-Journal festhalten: was du notieren solltest und wie du es nutzt",
    "description": "Wie du den emotionalen Zustand hinter jedem Trade markierst, welche Emotionen Fehlern oft vorausgehen und wie du aus diesen Markierungen Regeln statt Reue machst.",
    "body": [
      {
        "p": "Trader kennen ihre Fehler meist. Im Nachhinein erzählen sie dir, dass sie einer Bewegung aus Angst, sie zu verpassen, hinterhergelaufen sind oder die Größe verdoppelt haben, um einen Verlust zurückzuholen. Was sie selten haben, ist eine Aufzeichnung darüber, wie oft das passiert und was es kostet. Wer bei jedem Trade die Emotion markiert, macht aus einem vagen Gefühl etwas Zählbares."
      },
      {
        "h2": "Halte es sofort fest"
      },
      {
        "p": "Notiere die Emotion beim Einstieg oder direkt nach dem Schließen, nicht am Ende der Woche. Die Erinnerung schreibt Trades um: Ein Rache-Trade, der zufällig gewonnen hat, wird zur „guten Einschätzung“, und die Angst hinter einem zu frühen Ausstieg ist vergessen."
      },
      {
        "h2": "Eine kurze, feste Liste"
      },
      {
        "p": "Wähle jedes Mal aus denselben Wörtern, damit sich Trades vergleichen lassen. Eine nützliche Liste trennt Zustände, die helfen, von solchen, die eher schaden:"
      },
      {
        "ul": [
          "Hilfreich: ruhig, fokussiert, zuversichtlich.",
          "Warnzeichen: übermütig, FOMO, ängstlich, ungeduldig.",
          "Stoppzeichen: wütend, Rache, müde."
        ]
      },
      {
        "p": "Ein Trade kann mehrere haben. Gleichzeitig müde und ungeduldig zu sein ist häufig – und gut zu wissen."
      },
      {
        "h2": "Achte auf Muster, nicht auf einzelne Trades"
      },
      {
        "p": "Ein einzelner verlorener FOMO-Trade sagt wenig. Zwanzig davon, neben deine übrigen Trades gestellt, sagen viel. Gruppiere deine Trades nach einem Monat nach Emotion und vergleiche die Ergebnisse in R: Viele Trader stellen fest, dass sich der Großteil ihrer Verluste unter zwei oder drei Markierungen sammelt."
      },
      {
        "h2": "Mach aus dem Muster eine Regel"
      },
      {
        "p": "Es geht nicht darum, nichts mehr zu fühlen, sondern vorab zu entscheiden, was du tust, wenn du es bemerkst. Ist Rache deine teuerste Markierung, bewirkt eine Regel wie „nach zwei Verlusten in Folge ist für heute Schluss“ mehr als jede Willenskraft. Schreib die Regel in deine Checkliste, damit sie dir vor dem nächsten Einstieg begegnet, nicht danach."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "Jeder Trade hat eine Emotionsauswahl mit zwölf häufigen Zuständen – hilfreiche und Warnzeichen in unterschiedlichen Farben –, und du kannst eigene Wörter hinzufügen. Die Markierungen erscheinen beim Trade und sind im Excel-Export enthalten, sodass du sie sortieren und vergleichen kannst."
      }
    ]
  },
  "position-sizing-risk-per-trade": {
    "title": "Positionsgröße: wie viel du pro Trade riskierst und wie du die Lotgröße berechnest",
    "description": "Wie du ein festes Risiko pro Trade wählst, es aus dem Stop-Abstand in eine Lotgröße umrechnest und im Journal prüfst, ob du dich wirklich daran hältst.",
    "body": [
      {
        "p": "Zwei Trader können denselben Trade zum selben Kurs mit demselben Stop eingehen und am Ende sehr unterschiedliche Konten haben. Der Unterschied ist die Größe. Die Positionsgröße entscheidet, was dich ein einzelner Verlust kostet – und damit, wie viele Verluste in Folge du überstehst, während sich dein Vorteil zeigt."
      },
      {
        "h2": "Vom Risiko ausgehen, nicht von Lots"
      },
      {
        "p": "Viele Trader wählen zuerst die Lotgröße – „ich handle 1 Lot“ – und lassen den Stop entscheiden, wie viel sie verlieren. So ist jeder Verlust unterschiedlich groß. Dreh es um: Lege fest, welchen Teil des Kontos du verlieren willst, wenn der Stop greift, und berechne dann die Größe, die genau das ergibt."
      },
      {
        "h2": "Das Risiko pro Trade wählen"
      },
      {
        "p": "Ein fester Prozentsatz des Kontos – oft zwischen 0,5 % und 2 % – ist der übliche Ausgangspunkt. Die Zahl selbst ist weniger wichtig, als sie konstant zu halten. Bei 1 % Risiko kosten zehn Verluste in Folge etwa 10 % des Kontos; bei 5 % kostet dieselbe Serie rund 40 %, und jeder weitere Trade muss viel mehr leisten, um das zurückzuholen."
      },
      {
        "p": "Auf einem Prop-Firm-Konto richte die Größe auch nach deren Grenzen aus: Liegt das Tagesverlustlimit bei 5 %, lässt ein Risiko von 2 % pro Trade nur Platz für zwei volle Verluste an einem Tag."
      },
      {
        "h2": "Die Berechnung"
      },
      {
        "code": "Positionsgröße = Risikobetrag ÷ (Stop-Abstand × Wert pro Punkt)"
      },
      {
        "p": "Beispiel: Ein Konto mit 10.000 $ und 1 % Risiko hat 100 $ zu verlieren. Der Stop bei EURUSD liegt 25 Pips entfernt, ein Standardlot ist etwa 10 $ pro Pip wert. 100 $ ÷ (25 × 10 $) = 0,4 Lots. Liegt der Stop 50 Pips entfernt, halbiert sich die Größe auf 0,2 Lots – das Risiko bleibt 100 $."
      },
      {
        "p": "Der Wert pro Punkt hängt von Instrument und Broker ab (Gold, Indizes und Krypto werden anders notiert). Sieh dir die Kontraktspezifikation in deiner Plattform einmal an und notiere sie."
      },
      {
        "h2": "Häufige Fehler"
      },
      {
        "ul": [
          "Den Stop nach dem Einstieg weiter weg setzen, ohne die Größe zu verringern – das Risiko wächst unbemerkt.",
          "Nach einem Verlust die Größe erhöhen, um ihn schneller zurückzuholen.",
          "Die Lotgröße jedes Mal aufrunden: aus 0,37 wird 0,4, dann 0,5.",
          "Spread und Kommission vergessen, die den echten Verlust etwas größer machen als geplant."
        ]
      },
      {
        "h2": "Im Journal prüfen"
      },
      {
        "p": "Notiere bei jedem Trade das geplante Risiko. Sieh dir nach ein paar Wochen die Verlusttrades an: Haben einige das Zwei- oder Dreifache des Üblichen verloren, ist deine Größe nicht so fest, wie du denkst. Ergebnisse in R (Gewinn oder Verlust geteilt durch das geplante Risiko) machen solche Ausreißer sofort sichtbar."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "Jeder Trade hat ein Risikofeld, und Ergebnisse lassen sich in R lesen. Du kannst deinen Zielen ein maximales Risiko pro Trade hinzufügen, und die Disziplin-Ansicht markiert Trades, bei denen das Risiko direkt nach einem Verlust auf mehr als das 1,5-Fache des vorherigen Trades gestiegen ist."
      }
    ]
  },
  "revenge-trading": {
    "title": "Revenge Trading: wie du es im Journal erkennst und stoppst",
    "description": "Wie Revenge Trading in den Daten aussieht, warum es so teuer ist und welche praktischen Regeln verhindern, dass der Trade nach einem Verlust ein emotionaler wird.",
    "body": [
      {
        "p": "Ein Verlust wird geschlossen, und wenige Minuten später bist du wieder im Markt – oft im selben Instrument, manchmal mit größerer Position –, um ihn zurückzuholen. Das ist Revenge Trading, Rache-Trading. Fast jeder Trader hat es schon getan; die Frage ist, wie oft und was es kostet."
      },
      {
        "h2": "Warum es so teuer ist"
      },
      {
        "p": "Der Trade nach einem Verlust wird meist aus einem anderen Grund als deinem Plan eröffnet: um ein Gefühl zu reparieren. Das Setup ist schwächer, der Einstieg überhastet, die Größe wächst tendenziell. Ein einziger schlechter Tag kann Wochen sorgfältigen Tradings zunichtemachen."
      },
      {
        "h2": "Wie es in den Daten aussieht"
      },
      {
        "ul": [
          "Ein neuer Trade, eröffnet wenige Minuten nach dem Schließen eines Verlusttrades.",
          "Das Risiko dieses Trades ist deutlich höher als beim vorherigen.",
          "Mehrere Trades kurz hintereinander an einem Tag, der mit einem Verlust begann.",
          "Trades außerhalb der Uhrzeiten, in denen du normalerweise handelst."
        ]
      },
      {
        "p": "Um diese Trades zu finden, musst du dich nicht erinnern, wie du dich gefühlt hast. Zeiten, Größen und Ergebnisse stehen bereits in deinem Journal."
      },
      {
        "h2": "Miss es"
      },
      {
        "p": "Trenne die Trades, die zu diesen Mustern passen, vom Rest und vergleiche die Ergebnisse. Verliert die markierte Gruppe Geld, während dein übriges Trading ungefähr bei null oder im Plus liegt, hast du das Wertvollste gefunden, das du ändern kannst – und das ist eine Regel, keine Strategie."
      },
      {
        "h2": "Regeln, die helfen"
      },
      {
        "ul": [
          "Abkühlphase: nach einem Verlust 15–30 Minuten kein neuer Trade.",
          "Tagesstopp: nach zwei Verlusten in Folge oder einem festen Verlustbetrag ist der Tag vorbei.",
          "Nach einem Verlust steigt die Größe nie; wenn sie sich ändert, dann nach unten.",
          "Vor dem nächsten Trade die Checkliste von vorn durchgehen."
        ]
      },
      {
        "p": "Schreib die Regel vor der Session auf. Im Moment zu entscheiden ist genau das, was nicht funktioniert."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "Die Disziplin-Ansicht liest deine vorhandenen Trades und markiert einen Trade, der innerhalb von 15 Minuten nach einem Verlust eröffnet wurde, ein Risiko von mehr als dem 1,5-Fachen des vorherigen Trades nach einem Verlust, Tage mit deutlich mehr Trades als üblich und Trades außerhalb deiner üblichen Uhrzeiten. Dann zeigt sie, was diese Trades im Vergleich zum Rest gekostet haben. Trades aus MetaTrader werden automatisch einbezogen."
      }
    ]
  },
  "expectancy-and-profit-factor": {
    "title": "Erwartungswert und Profit-Faktor: die zwei Zahlen, die zeigen, ob dein Trading funktioniert",
    "description": "Was Erwartungswert (Expectancy) und Profit-Faktor bedeuten, wie du sie aus deinen eigenen Trades berechnest und warum eine hohe Trefferquote allein wenig über eine Strategie sagt.",
    "body": [
      {
        "p": "Die Trefferquote ist die Zahl, die Trader am häufigsten nennen – und allein die am wenigsten nützliche. Eine Strategie, die in 80 % der Fälle gewinnt, kann Geld verlieren, eine mit 35 % kann solide sein. Zwei Zahlen beantworten die eigentliche Frage – bringt das über viele Trades Geld? –: Erwartungswert und Profit-Faktor."
      },
      {
        "h2": "Erwartungswert"
      },
      {
        "p": "Der Erwartungswert ist das durchschnittliche Ergebnis pro Trade über eine große Zahl von Trades."
      },
      {
        "code": "Erwartungswert = (Trefferquote × Durchschnittsgewinn) − (Verlustquote × Durchschnittsverlust)"
      },
      {
        "p": "Beispiel: Du gewinnst 40 % der Trades, der Durchschnittsgewinn beträgt 300 $, der Durchschnittsverlust 150 $. 0,40 × 300 − 0,60 × 150 = 120 − 90 = 30 $. Im Schnitt hat jeder Trade 30 $ gebracht. Eine positive Zahl heißt, der Ansatz hat bei diesen Trades funktioniert; eine negative, dass nicht – egal wie gut sich einzelne Tage angefühlt haben."
      },
      {
        "p": "In R statt in Geld ausgedrückt – Durchschnittsgewinn und -verlust geteilt durch dein übliches Risiko – lässt sich der Erwartungswert über Kontogrößen und Zeiträume hinweg vergleichen."
      },
      {
        "h2": "Profit-Faktor"
      },
      {
        "code": "Profit-Faktor = Bruttogewinn ÷ Bruttoverlust"
      },
      {
        "p": "Mit denselben Zahlen über 100 Trades: 40 × 300 $ = 12.000 $ gewonnen, 60 × 150 $ = 9.000 $ verloren, ein Profit-Faktor von 1,33. Über 1 überwiegen die Gewinner, darunter nicht. Er ist schnell gelesen, sagt aber nicht, wie viele Trades dafür nötig waren."
      },
      {
        "h2": "Warum die Trefferquote täuscht"
      },
      {
        "p": "Eine hohe Trefferquote entsteht oft, wenn Gewinne früh mitgenommen und Verluste laufen gelassen werden. Zehn Gewinne von 50 $ und ein Verlust von 600 $ ergeben 91 % Trefferquote und 100 $ Nettoverlust. Der Erwartungswert zeigt das sofort; die Trefferquote verdeckt es."
      },
      {
        "h2": "Wie viele Trades reichen?"
      },
      {
        "p": "Bei einer kleinen Stichprobe schwanken diese Zahlen stark. Zwanzig Trades können zufällig hervorragend oder schrecklich aussehen. Betrachte sie über mindestens 30–50 Trades und vergleiche sie je Setup statt für das ganze Konto durcheinander."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "Die Statistikseite zeigt Erwartungswert, Profit-Faktor, Payoff-Ratio, Durchschnittsgewinn und -verlust sowie die Trefferquote, berechnet aus deinen geschlossenen Trades – einschließlich Trades aus MetaTrader oder aus einem importierten Bericht. Die Tabelle zur Setup-Performance zeigt Trefferquote und Nettoergebnis jedes Setups, damit du siehst, welches deine Ergebnisse trägt."
      }
    ]
  },
};

export default TEXT;
