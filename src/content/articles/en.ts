/** Yazıların en metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  "metatrader-5-auto-sync": {
    "title": "How to connect MetaTrader 4 or 5 to your trading journal",
    "description": "Step-by-step: install the Simple Trading Journal add-on in MT4 or MT5 so every closed trade lands in your journal automatically — including stop loss, risk and fees.",
    "body": [
      {
        "p": "Typing every trade into a journal by hand is the main reason people stop journaling. With the MetaTrader add-on (MT4 and MT5), each trade is recorded the moment it opens and completed when it closes — entry, exit, stop loss, lot size, commission and swap included. You only add what MetaTrader cannot know: your setup, your reasoning and how you felt."
      },
      {
        "note": "MetaTrader 4 or 5? The steps are the same for both; only the file and the folder differ. On the MetaTrader screen in the app, choose your version first: MetaTrader 5 uses SimpleTradingJournal.ex5 and MQL5 → Experts, MetaTrader 4 uses SimpleTradingJournal.ex4 and MQL4 → Experts."
      },
      {
        "h2": "What you need"
      },
      {
        "ul": [
          "MetaTrader 4 or MetaTrader 5 on Windows or Mac (the desktop terminal — the mobile app cannot run add-ons).",
          "A Simple Trading Journal account with at least one journal.",
          "Two minutes."
        ]
      },
      {
        "h2": "1. Download the add-on"
      },
      {
        "p": "In the app, open MetaTrader from the menu, choose MetaTrader 4 or 5 and download the add-on (SimpleTradingJournal.ex5 for MT5, SimpleTradingJournal.ex4 for MT4). In MetaTrader choose File → Open Data Folder, go into MQL5 → Experts (MQL4 → Experts on MT4), and drop the file there."
      },
      {
        "note": "On a Mac, \"Open Data Folder\" does not work in some builds. In Finder use Go → Go to Folder and paste the path for your version. MetaTrader 5: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts — MetaTrader 4: ~/Library/Application Support/net.metaquotes.wine.metatrader4/drive_c/Program Files (x86)/MetaTrader 4/MQL4/Experts"
      },
      {
        "h2": "2. Allow the connection"
      },
      {
        "p": "MetaTrader blocks internet requests from add-ons unless you allow the address. Go to Tools → Options → Expert Advisors, tick \"Allow WebRequest for listed URL\" and add:"
      },
      {
        "code": "https://www.simpletradejournal.io"
      },
      {
        "h2": "3. Restart MetaTrader"
      },
      {
        "p": "Close MetaTrader and open it again. SimpleTradingJournal now appears under Expert Advisors in the Navigator panel on the left."
      },
      {
        "h2": "4. Drag it onto a chart and paste your key"
      },
      {
        "p": "In the app, create a connection key (it starts with stj_). Drag SimpleTradingJournal onto any chart, open the Inputs tab, paste the key into ApiKey and click OK. When the top-left of the chart shows that the connection is working, you are done. It also shows which journal the trades go to (Journal: …) — check that it is the one you expect."
      },
      {
        "p": "Each key belongs to one journal and locks to the first trading account that connects with it, so trades from two accounts never mix in the same journal. For a second account, create a second key."
      },
      {
        "h2": "Which chart should it go on?"
      },
      {
        "p": "MetaTrader runs one expert advisor per chart. If you already use another EA, open a new, empty chart just for the journal add-on and leave it open — every closed trade then arrives on its own while you keep trading on your other charts. If you would rather not keep an extra chart, you can drop the add-on on a chart only when you want to sync; it catches up on everything closed in between."
      },
      {
        "h2": "What gets recorded"
      },
      {
        "ul": [
          "Symbol, direction, lot size, entry and exit price and time.",
          "Stop loss and take profit. The stop you entered with is kept even if you move it later, so your risk and R-multiples stay honest.",
          "Gross result, commission and swap, and the net result.",
          "On MetaTrader 5, a position closed in parts (TP1, TP2…) is recorded as one trade once it is fully closed. On MetaTrader 4, a partial close gives the rest of the order a new number, so it shows as a separate trade."
        ]
      },
      {
        "h2": "Troubleshooting"
      },
      {
        "ul": [
          "Nothing arrives: check that the address in step 2 is exactly https://www.simpletradejournal.io, that the chart with the add-on is still open, and that the key was pasted without spaces.",
          "\"Key bound to another account\": the key already belongs to a different trading account. Create a new key for this account.", "Trades land in the wrong journal: the \"Journal:\" line on the chart shows where they go. If it names another journal, the add-on is still using an old key. Open its Inputs, clear ApiKey completely, paste the new key, press Enter and then OK. The old key closes by itself as soon as the new one connects.", "On MetaTrader 4 the add-on is greyed out and cannot be dragged: use SimpleTradingJournal.ex4 downloaded from the MetaTrader screen, then right-click Expert Advisors in the Navigator and choose Refresh.",
          "Lost the key: MetaTrader remembers it. If you really lost it, create a new one in the app; the old one closes by itself as soon as the new one connects."
        ]
      },
      {
        "p": "Prefer not to install anything? You can also import MetaTrader's own report file — see the import guide."
      }
    ]
  },
  "import-trade-history": {
    "title": "How to import your trade history into a trading journal",
    "description": "Import closed trades from MetaTrader 4/5, cTrader, TradeLocker, DXtrade or Match-Trader. How to get the right report, what is read from it and how duplicates are avoided.",
    "body": [
      {
        "p": "If you already have months of trades, you do not have to type them in. Export a report from your platform and drop it into the journal — the file is read in your browser, the platform is recognised automatically and you see every trade before anything is saved."
      },
      {
        "h2": "Supported platforms"
      },
      {
        "ul": [
          "MetaTrader 5 and MetaTrader 4 (the HTML report)",
          "cTrader",
          "TradeLocker",
          "DXtrade",
          "Match-Trader",
          "Any other CSV — you pick which column is the date, symbol, direction and result"
        ]
      },
      {
        "h2": "Getting the right MetaTrader report"
      },
      {
        "ol": [
          "In MetaTrader open the Toolbox (Ctrl+T) and go to the History tab.",
          "Right-click inside the list and choose the period you want (for example \"All history\").",
          "Right-click again → Report, and save it as HTML."
        ]
      },
      {
        "note": "Do not use the account report that only shows balance and open positions — it contains no closed trades. If the importer says it found no closed trades, this is almost always the reason."
      },
      {
        "h2": "Importing"
      },
      {
        "ol": [
          "In the app choose Import and pick the journal the trades should go into.",
          "Drag the file onto the window or click to choose it.",
          "Check the preview: symbol, direction, lots, prices, times and the net result of each trade.",
          "Confirm. The trades appear in your journal, calendar and statistics."
        ]
      },
      {
        "h2": "What is read from the report"
      },
      {
        "ul": [
          "The net result — commission, swap and fees are taken into account, not just the gross profit.",
          "The stop loss, so each trade's risk and R-multiple can be calculated.",
          "Entry and exit prices and times."
        ]
      },
      {
        "h2": "Importing the same file twice"
      },
      {
        "p": "Every trade carries its platform ID, so a trade that is already in the journal is skipped instead of added again. You can import an updated report every week without cleaning anything up. If you logged a trade by hand while it was still open, the import completes that entry instead of creating a second one."
      },
      {
        "p": "Want this to happen by itself? Connect MetaTrader 4 or 5 once and closed trades arrive automatically — see the MetaTrader guide."
      }
    ]
  },
  "how-to-keep-a-trading-journal": {
    "title": "How to keep a trading journal you will actually use",
    "description": "What to record for each trade, how often to review it, and the habits that turn a trading journal from a spreadsheet you abandon into your most useful trading tool.",
    "body": [
      {
        "p": "Most traders agree that a journal helps, and most traders stop keeping one within a few weeks. The problem is rarely discipline. It is that the journal asks for too much at the wrong moment and gives nothing back. A journal you will actually use is short to fill in, fast to review, and shows you something you could not see on your own."
      },
      {
        "h2": "What to record for every trade"
      },
      {
        "p": "Split it into what the platform knows and what only you know."
      },
      {
        "ul": [
          "The facts: symbol, direction, entry, exit, stop loss, size, result after fees. These should never be typed by hand — import them or sync them from your platform.",
          "The plan: which setup this was, and why you took it. One line is enough.",
          "The state: how you felt going in — calm, bored, rushed, trying to win back a loss.",
          "A screenshot of the chart at entry, if the setup is visual."
        ]
      },
      {
        "h2": "Measure in R, not in money"
      },
      {
        "p": "A $300 win means little on its own. If you risked $100 it was a 3R trade; if you risked $600 it was half an R and a bad trade that happened to work. Recording your stop lets the journal express every result as a multiple of what you risked, and that is the number that shows whether your edge is real."
      },
      {
        "h2": "Review on a schedule"
      },
      {
        "ul": [
          "Daily, two minutes: did I follow my plan today? Anything to note while it is fresh?",
          "Weekly, fifteen minutes: which setups made money, which lost it, and on which days and sessions.",
          "Monthly: is the equity curve moving because of the setups I believe in, or despite them?"
        ]
      },
      {
        "h2": "Look for behaviour, not just statistics"
      },
      {
        "p": "Win rate and average R tell you what happened. The more useful questions are about how you behaved: did you take another trade minutes after a loss? Did your size go up after losing? Did you trade far more on some days than your plan allows, or outside the hours you normally trade? These patterns cost more than any single bad setup, and they are easy to miss trade by trade."
      },
      {
        "p": "Simple Trading Journal checks these four habits automatically — revenge trading, raising risk after a loss, overtrading and trading outside your usual hours — across all your journals."
      },
      {
        "h2": "Keep it low effort"
      },
      {
        "ul": [
          "Automate the facts so that journaling a trade takes seconds, not minutes.",
          "Use a short checklist before entering instead of long notes afterwards.",
          "Tag setups consistently — five setups used every day beat fifty used once.",
          "Keep separate journals for separate accounts, such as a prop challenge and a personal account."
        ]
      },
      {
        "h2": "Start small"
      },
      {
        "p": "You do not need a perfect system on day one. Record the facts automatically, add one line about why you took each trade, and look at it once a week. After a month you will have something no indicator can give you: evidence about your own trading."
      }
    ]
  },
  "r-multiple-explained": {
    "title": "R-multiples explained: judge every trade by the risk you took",
    "description": "What an R-multiple is, how to calculate it from your stop loss, and why expectancy in R is the clearest way to tell whether a trading strategy has an edge.",
    "body": [
      {
        "p": "Money is a poor way to compare trades. The same $200 profit can be excellent or reckless depending on how much you put at risk to get it. R-multiples fix this by measuring every result against the risk you took."
      },
      {
        "h2": "What is 1R?"
      },
      {
        "p": "1R is the amount you stand to lose if the trade hits your stop loss. Buy at 1.1000 with a stop at 1.0950 and 1 lot, and 1R is whatever those 50 pips cost you — say $500."
      },
      {
        "h2": "Calculating the R-multiple"
      },
      {
        "code": "R-multiple = result of the trade ÷ initial risk (1R)"
      },
      {
        "ul": [
          "Won $1,000 with $500 at risk: +2R.",
          "Lost $500 at the stop: −1R.",
          "Lost $750 because you slipped or moved the stop: −1.5R — a sign something went wrong.",
          "Closed early for $150: +0.3R."
        ]
      },
      {
        "h2": "Why it matters"
      },
      {
        "p": "Once every trade is in R, results become comparable across position sizes, instruments and accounts. You can see that a setup with a 40% win rate is excellent because its winners average +2.5R, or that a 70% win rate is a problem because the losers average −3R."
      },
      {
        "h2": "Expectancy"
      },
      {
        "p": "Expectancy is your average R per trade. Add up the R of all trades and divide by the number of trades."
      },
      {
        "code": "Expectancy = total R ÷ number of trades"
      },
      {
        "p": "Positive expectancy means that, on average, each trade has made you money relative to the risk taken. 0.3R over 100 trades is 30R; at 1% risk per trade that is roughly 30% before compounding. Negative expectancy means more trades will not help — the setup, the execution or the risk management has to change."
      },
      {
        "h2": "Common mistakes"
      },
      {
        "ul": [
          "Not recording the stop. Without it there is no 1R and no R-multiple.",
          "Using the moved stop instead of the original one. R measures the risk you accepted when you entered.",
          "Ignoring fees. Commission and swap are part of the result; a +1R trade can be +0.9R after costs.",
          "Judging a setup on a handful of trades. Look at at least 30 before drawing conclusions."
        ]
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "When a trade has a stop loss — typed in, imported from a report or synced from MetaTrader — its risk and R-multiple are calculated automatically, and your statistics show your average realised R next to your results in money."
      }
    ]
  },
  "prop-firm-daily-loss-and-drawdown": {
    "title": "Daily loss and max drawdown: how to track prop firm rules without breaking them",
    "description": "How prop firm daily loss limits, maximum drawdown and profit targets usually work, why most challenges are lost to a rule rather than a bad trade, and how to always know your distance to the limit.",
    "body": [
      {
        "p": "Prop firm challenges are rarely lost because a strategy stops working. They are lost on a Tuesday afternoon when a trader, three losses in, does not realise they are $180 away from the daily limit. The rules are simple; knowing exactly where you stand against them, trade by trade, is the hard part."
      },
      {
        "note": "Every firm words its rules differently and changes them over time. Always check your own firm's current rules — this article explains the common types, not any specific firm."
      },
      {
        "h2": "The three numbers that decide a challenge"
      },
      {
        "ul": [
          "Profit target: the gain you must reach, usually a percentage of the starting balance.",
          "Daily loss limit: how much you may lose within one trading day. Firms differ on whether it is measured from the day's starting balance or equity, and on when the day resets.",
          "Maximum loss (drawdown): how far the account may fall in total. It can be static (measured from the starting balance) or trailing (it follows your highest balance or equity upwards)."
        ]
      },
      {
        "h2": "Static vs trailing drawdown"
      },
      {
        "p": "With a static limit on a $100,000 account and a 10% maximum loss, the account fails below $90,000, whatever happened before. With a trailing limit, if the account first grows to $105,000 the floor moves up with it, to $95,000 in this example. Trailing limits punish giving back profits, so the distance to the limit can shrink even on a winning week."
      },
      {
        "h2": "Why challenges are lost to rules"
      },
      {
        "ul": [
          "Losses cluster. Three stops in a row in one session is normal, and often enough to reach a daily limit at 1% risk per trade plus fees.",
          "Open trades count. With equity-based rules, a floating loss can breach the limit before any trade is closed.",
          "Fees and swap count. The limit sees your net result, not your gross result.",
          "Behaviour changes under pressure. Revenge trades and bigger size after a loss are exactly what turns a bad day into a failed challenge."
        ]
      },
      {
        "h2": "A simple protection routine"
      },
      {
        "ol": [
          "Size positions so that a normal losing streak cannot reach the daily limit — for example, no more than a third of the daily limit at risk per trade.",
          "Before each trade, check how far you are from the daily and maximum limits.",
          "Set a personal stop well before the firm's: when you have lost half the daily limit, stop for the day.",
          "Review every day you came close. The pattern usually repeats."
        ]
      },
      {
        "h2": "Tracking it in Simple Trading Journal"
      },
      {
        "p": "Mark a journal as a prop account, enter the firm's profit target, daily loss limit and maximum loss, and the journal shows how far you are from each one as you trade. Loss limits turn amber and then red as you approach them; the profit target turns green as you get closer. The discipline analysis flags revenge trades and rising risk after losses — the habits that end most challenges."
      }
    ]
  },
  // --- karşılaştırmalar (scripts: compare_gen) ---
  'tradezella-alternative': {
    "title": "Simple Trading Journal vs Tradezella: an honest comparison",
    "description": "Looking for a Tradezella alternative? Prices, free plan, trial and MetaTrader sync compared side by side, with where each one is stronger.",
    "body": [
      {
        "p": "Tradezella is one of the best-known trading journals. If you are looking for an alternative — cheaper, in your own language, or with a free plan — here is how Simple Trading Journal compares."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradezella"
          ],
          [
            "Monthly price",
            "$14.99",
            "$35 – $99"
          ],
          [
            "Yearly price",
            "$119",
            "$315 – $891"
          ],
          [
            "Free plan",
            "Yes — 2 trades a day, no time limit",
            "No"
          ],
          [
            "Free trial",
            "3 days of Pro, no card",
            "Not listed on its pricing page"
          ],
          [
            "MetaTrader auto-sync",
            "MT4 and MT5",
            "MT4 and MT5"
          ],
          [
            "How MetaTrader connects",
            "Add-on in MetaTrader + key, no password shared",
            "Account number + investor password"
          ],
          [
            "Imports",
            "MT4/MT5 report, cTrader, TradeLocker, DXtrade, Match-Trader, any CSV",
            "500+ broker and prop firm integrations"
          ]
        ]
      },
      {
        "note": "Tradezella's prices and features are taken from its own pricing and help pages in September 2026 and may have changed since. Check its website before you decide."
      },
      {
        "h2": "Where Tradezella is stronger"
      },
      {
        "ul": [
          "Far more broker and prop firm integrations — more than 500, according to Tradezella.",
          "A longer track record and a bigger feature set in its higher plans.",
          "MT4 and MT5 accounts sync without installing anything in MetaTrader."
        ]
      },
      {
        "h2": "Where Simple Trading Journal is stronger"
      },
      {
        "ul": [
          "A free plan with no time limit (2 trades a day) and a 3-day Pro trial without a card.",
          "Pro costs $14.99 a month or $119 a year — Tradezella's cheapest option is $35 a month.",
          "The whole app in 9 languages, including Turkish, Persian and Arabic.",
          "MetaTrader 4 and 5 sync through a small add-on and a key; you never share your investor password.",
          "Built-in discipline analysis (revenge trades, rising risk after losses, overtrading, off-hours trading) and prop firm limit tracking."
        ]
      },
      {
        "h2": "Which one should you choose?"
      },
      {
        "p": "If you need a very wide range of broker integrations or its more advanced tools, Tradezella may suit you better. If you trade on MetaTrader, want a journal in your own language and would rather start free, try Simple Trading Journal — the free plan needs no card."
      }
    ]
  },
  'tradersync-alternative': {
    "title": "Simple Trading Journal vs TraderSync: an honest comparison",
    "description": "Looking for a TraderSync alternative? Prices, free plan, trial and MetaTrader sync compared side by side, with where each one is stronger.",
    "body": [
      {
        "p": "TraderSync is one of the best-known trading journals. If you are looking for an alternative — cheaper, in your own language, or with a free plan — here is how Simple Trading Journal compares."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TraderSync"
          ],
          [
            "Monthly price",
            "$14.99",
            "$29.95 – $79.95"
          ],
          [
            "Yearly price",
            "$119",
            "$269.52 – $719.52"
          ],
          [
            "Free plan",
            "Yes — 2 trades a day, no time limit",
            "No"
          ],
          [
            "Free trial",
            "3 days of Pro, no card",
            "7 days, no card"
          ],
          [
            "MetaTrader auto-sync",
            "MT4 and MT5",
            "MT4 and MT5"
          ],
          [
            "Imports",
            "MT4/MT5 report, cTrader, TradeLocker, DXtrade, Match-Trader, any CSV",
            "200+ brokers and platforms"
          ]
        ]
      },
      {
        "note": "TraderSync's prices and features are taken from its own pricing and help pages in September 2026 and may have changed since. Check its website before you decide."
      },
      {
        "h2": "Where TraderSync is stronger"
      },
      {
        "ul": [
          "More than 200 supported brokers and platforms.",
          "An AI assistant (Cypher) and trade replay in its higher plans.",
          "A 7-day trial with every feature, without a card."
        ]
      },
      {
        "h2": "Where Simple Trading Journal is stronger"
      },
      {
        "ul": [
          "A free plan with no time limit (2 trades a day) and a 3-day Pro trial without a card.",
          "Pro costs $14.99 a month or $119 a year — TraderSync's cheapest option is $29.95 a month.",
          "The whole app in 9 languages, including Turkish, Persian and Arabic.",
          "MetaTrader 4 and 5 sync through a small add-on and a key; you never share your investor password.",
          "Built-in discipline analysis (revenge trades, rising risk after losses, overtrading, off-hours trading) and prop firm limit tracking."
        ]
      },
      {
        "h2": "Which one should you choose?"
      },
      {
        "p": "If you need a very wide range of broker integrations or its more advanced tools, TraderSync may suit you better. If you trade on MetaTrader, want a journal in your own language and would rather start free, try Simple Trading Journal — the free plan needs no card."
      }
    ]
  },
  'edgewonk-alternative': {
    "title": "Simple Trading Journal vs Edgewonk: an honest comparison",
    "description": "Looking for a Edgewonk alternative? Prices, free plan, trial and MetaTrader sync compared side by side, with where each one is stronger.",
    "body": [
      {
        "p": "Edgewonk is one of the best-known trading journals. If you are looking for an alternative — cheaper, in your own language, or with a free plan — here is how Simple Trading Journal compares."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Edgewonk"
          ],
          [
            "Monthly price",
            "$14.99",
            "— (yearly only)"
          ],
          [
            "Yearly price",
            "$119",
            "$197"
          ],
          [
            "Free plan",
            "Yes — 2 trades a day, no time limit",
            "No"
          ],
          [
            "Free trial",
            "3 days of Pro, no card",
            "No — 14-day money-back guarantee"
          ],
          [
            "MetaTrader auto-sync",
            "MT4 and MT5",
            "MT4 and MT5"
          ],
          [
            "How MetaTrader connects",
            "Add-on in MetaTrader + key, no password shared",
            "MetaTrader's FTP report publishing"
          ],
          [
            "Imports",
            "MT4/MT5 report, cTrader, TradeLocker, DXtrade, Match-Trader, any CSV",
            "Many platforms (see its import page)"
          ]
        ]
      },
      {
        "note": "Edgewonk's prices and features are taken from its own pricing and help pages in September 2026 and may have changed since. Check its website before you decide."
      },
      {
        "h2": "Where Edgewonk is stronger"
      },
      {
        "ul": [
          "A long-established journal with a single plan that includes every feature.",
          "A 14-day money-back guarantee.",
          "MT4 and MT5 auto-sync using MetaTrader's own report publishing."
        ]
      },
      {
        "h2": "Where Simple Trading Journal is stronger"
      },
      {
        "ul": [
          "A free plan with no time limit (2 trades a day) and a 3-day Pro trial without a card.",
          "Pro costs $14.99 a month or $119 a year — Edgewonk's cheapest option is $197 a year.",
          "The whole app in 9 languages, including Turkish, Persian and Arabic.",
          "MetaTrader 4 and 5 sync through a small add-on and a key; you never share your investor password.",
          "Built-in discipline analysis (revenge trades, rising risk after losses, overtrading, off-hours trading) and prop firm limit tracking."
        ]
      },
      {
        "h2": "Which one should you choose?"
      },
      {
        "p": "If you need a very wide range of broker integrations or its more advanced tools, Edgewonk may suit you better. If you trade on MetaTrader, want a journal in your own language and would rather start free, try Simple Trading Journal — the free plan needs no card."
      }
    ]
  },
  "pre-trade-checklist": {
    "title": "The pre-trade checklist: how to write one you will actually use",
    "description": "Why a short pre-trade checklist cuts impulsive trades, how to write rules you can answer yes or no, and how to check whether your checklist is working.",
    "body": [
      {
        "p": "Most bad trades are not bad analysis. They are trades taken when the setup was only half there — a level almost reached, a signal almost confirmed — because sitting on your hands felt worse than acting. A checklist lets you make that decision before the moment arrives."
      },
      {
        "h2": "What a checklist is for"
      },
      {
        "p": "A checklist does not find trades for you. It filters the ones you already want to take, so that only those matching your plan get through. Pilots and surgeons use checklists for the same reason: under pressure, people skip steps they know by heart."
      },
      {
        "h2": "Rules you can answer yes or no"
      },
      {
        "p": "Every item should be a question with a clear answer at the moment of entry. \"Is the trend up?\" is open to interpretation; \"Is price above the 200-period moving average on the 4-hour chart?\" is not."
      },
      {
        "ul": [
          "Context: is the higher-timeframe direction the same as my trade?",
          "Location: is the entry at a level I marked before the session, not one I found after price moved?",
          "Trigger: has my entry signal actually closed, not just started to form?",
          "Risk: is the stop where the idea is proven wrong, and is the size within my risk per trade?",
          "Calendar: is there no high-impact news in the next 30 minutes?"
        ]
      },
      {
        "h2": "Keep it short"
      },
      {
        "p": "Three to seven items is enough. A list of fifteen gets skimmed and then ignored. If an item never changes a decision, remove it; if the same mistake keeps coming back, turn it into an item."
      },
      {
        "h2": "One list per strategy"
      },
      {
        "p": "If you trade two different setups — a breakout and a pullback, say — they need different conditions. Forcing both into one list leaves half the items irrelevant on every trade, and ticking irrelevant boxes quickly becomes a habit of ticking without reading."
      },
      {
        "h2": "Check whether it works"
      },
      {
        "p": "A checklist is a hypothesis. After 20–30 trades, compare the trades where every item was ticked with the ones you entered anyway. If the fully checked trades do not do better, the items are the wrong ones — change them rather than dropping the idea."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "You can keep several named checklists, one per strategy, choose which one each journal uses, and tick the items on every trade. Trades that arrive from MetaTrader get the journal's checklist too, so you can fill it in when you add your notes."
      }
    ]
  },
  "trading-emotions-journal": {
    "title": "Tracking emotions in your trading journal: what to record and how to use it",
    "description": "How to tag the emotional state behind each trade, which emotions tend to come before mistakes, and how to turn those tags into rules instead of regrets.",
    "body": [
      {
        "p": "Traders usually know their mistakes. After the fact they can tell you that they chased a move for fear of missing it, or doubled the size to win back a loss. What they rarely have is a record of how often it happens and what it costs. Tagging emotions on every trade turns a vague feeling into something you can count."
      },
      {
        "h2": "Record it at the time"
      },
      {
        "p": "Note the emotion when you enter or right after you close, not at the end of the week. Memory rewrites trades: a revenge trade that happened to win becomes \"a good read\", and the fear behind an early exit is forgotten."
      },
      {
        "h2": "A short, fixed list"
      },
      {
        "p": "Pick from the same set of words every time, so trades can be compared. A useful list separates states that help from states that tend to hurt:"
      },
      {
        "ul": [
          "Helpful: calm, focused, confident.",
          "Warning signs: overconfident, FOMO, fearful, impatient.",
          "Stop signs: angry, revenge, tired."
        ]
      },
      {
        "p": "A trade can have more than one. Being tired and impatient at the same time is common, and worth knowing."
      },
      {
        "h2": "Look for patterns, not single trades"
      },
      {
        "p": "One losing FOMO trade tells you little. Twenty of them, set against the rest of your trades, tell you a lot. After a month, group your trades by emotion and compare the results in R: many traders find that most of their losses sit under two or three tags."
      },
      {
        "h2": "Turn the pattern into a rule"
      },
      {
        "p": "The point is not to stop feeling things; it is to decide in advance what you do when you notice them. If revenge trades are your most expensive tag, a rule such as \"after two losses in a row, stop for the day\" does more than any amount of willpower. Put the rule in your checklist so you meet it before the next entry, not after."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "Every trade has an emotion picker with twelve common states — helpful ones and warning signs in different colours — and you can add your own words. The tags show on the trade and are included when you export your trades to Excel, so you can sort and compare them."
      }
    ]
  },
  "position-sizing-risk-per-trade": {
    "title": "Position sizing: how much to risk per trade, and how to calculate the lot size",
    "description": "How to choose a fixed risk per trade, turn it into a lot size from your stop distance, and check in your journal that you actually stick to it.",
    "body": [
      {
        "p": "Two traders can take the same trade at the same price with the same stop and end up with very different accounts. The difference is size. Position sizing decides how much a single loss costs you, and so how many losses in a row you can survive while your edge plays out."
      },
      {
        "h2": "Start from risk, not from lots"
      },
      {
        "p": "Many traders pick a lot size first — \"I trade 1 lot\" — and let the stop decide how much they lose. That makes every loss a different size. Turn it around: decide how much of the account you are willing to lose if the stop is hit, then work out the size that makes that true."
      },
      {
        "h2": "Choosing a risk per trade"
      },
      {
        "p": "A fixed percentage of the account — often somewhere between 0.5% and 2% — is the usual starting point. The number matters less than keeping it constant. With 1% risk, ten losses in a row cost roughly 10% of the account; with 5% risk, the same streak costs about 40%, and every later trade has to work much harder to get it back."
      },
      {
        "p": "On a prop firm account, size from the firm's limits as well: if the daily loss limit is 5%, a 2% risk per trade leaves room for only two full losses in a day."
      },
      {
        "h2": "The calculation"
      },
      {
        "code": "Position size = Risk amount ÷ (Stop distance × Value per point)"
      },
      {
        "p": "Example: a $10,000 account risking 1% has $100 to lose. The stop on EURUSD is 25 pips away, and one standard lot is worth about $10 per pip. $100 ÷ (25 × $10) = 0.4 lots. If the stop is 50 pips away, the size halves to 0.2 lots — the risk stays $100."
      },
      {
        "p": "The value per point differs by instrument and by broker (gold, indices and crypto are quoted differently), so check the contract specification in your platform once and write it down."
      },
      {
        "h2": "Common mistakes"
      },
      {
        "ul": [
          "Moving the stop further away after entry without reducing size — the risk quietly grows.",
          "Raising the size after a loss to win it back faster.",
          "Rounding up the lot size every time: 0.37 becomes 0.4, then 0.5.",
          "Forgetting spread and commission, which make the real loss slightly larger than planned."
        ]
      },
      {
        "h2": "Check it in your journal"
      },
      {
        "p": "Write the planned risk on every trade. After a few weeks, look at the losing trades: if some of them lost two or three times the usual amount, your sizing is not as fixed as you think. Measuring results in R (profit or loss divided by the planned risk) makes these outliers easy to spot."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "Each trade has a risk field, and results can be read in R. Your goals can include a maximum risk per trade, and the discipline view flags trades where the risk jumped to more than 1.5 times the previous trade right after a loss."
      }
    ]
  },
  "revenge-trading": {
    "title": "Revenge trading: how to spot it in your journal and stop it",
    "description": "What revenge trading looks like in the data, why it is so expensive, and practical rules that stop the next trade after a loss from being an emotional one.",
    "body": [
      {
        "p": "A loss closes, and within minutes you are back in the market — often in the same instrument, sometimes with a bigger size — to win it back. That is revenge trading. Almost every trader has done it; the question is how often, and what it costs."
      },
      {
        "h2": "Why it hurts so much"
      },
      {
        "p": "The trade after a loss is usually taken for a different reason than your plan: to fix a feeling. The setup is weaker, the entry is rushed, and the size tends to grow. A single bad day can then undo weeks of careful trading."
      },
      {
        "h2": "What it looks like in the data"
      },
      {
        "ul": [
          "A new trade opened within a few minutes of a losing trade closing.",
          "The risk on that trade is noticeably larger than on the one before.",
          "Several trades in quick succession on a day that started with a loss.",
          "Trades outside the hours you normally trade."
        ]
      },
      {
        "p": "You do not need to remember how you felt to find these trades. The times, the sizes and the results are already in your journal."
      },
      {
        "h2": "Measure it"
      },
      {
        "p": "Separate the trades that match the patterns above from the rest and compare the results. If the flagged group loses money while the rest of your trading is roughly flat or positive, you have found the most valuable thing to fix — and it is a rule, not a strategy."
      },
      {
        "h2": "Rules that help"
      },
      {
        "ul": [
          "A cooling-off period: after a loss, no new trade for 15–30 minutes.",
          "A daily stop: after two losses in a row, or a fixed amount lost, stop for the day.",
          "Size never goes up after a loss; if anything, it goes down.",
          "Before the next trade, go through your checklist from the top."
        ]
      },
      {
        "p": "Write the rule down before the session. Deciding in the moment is exactly what does not work."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "The discipline view reads your existing trades and marks a trade opened within 15 minutes of a loss, a risk more than 1.5 times the previous trade after a loss, days with far more trades than usual, and trades outside your usual hours. It then shows what those trades cost compared with the rest. Trades that arrive from MetaTrader are included automatically."
      }
    ]
  },
  "expectancy-and-profit-factor": {
    "title": "Expectancy and profit factor: the two numbers that show whether your trading works",
    "description": "What expectancy and profit factor mean, how to calculate them from your own trades, and why a high win rate alone says little about a strategy.",
    "body": [
      {
        "p": "Win rate is the number traders quote most, and it is the least useful on its own. A strategy that wins 80% of the time can still lose money, and one that wins 35% of the time can be solid. Two numbers answer the real question — does this make money over many trades? — expectancy and profit factor."
      },
      {
        "h2": "Expectancy"
      },
      {
        "p": "Expectancy is the average result per trade over a large number of trades."
      },
      {
        "code": "Expectancy = (Win rate × Average win) − (Loss rate × Average loss)"
      },
      {
        "p": "Example: you win 40% of trades, the average win is $300 and the average loss is $150. 0.40 × 300 − 0.60 × 150 = 120 − 90 = $30. On average, each trade has added $30. A positive number means the approach has worked on these trades; a negative one means it has not, however good individual days felt."
      },
      {
        "p": "Expressed in R instead of money — average win and loss divided by your usual risk — expectancy can be compared across account sizes and periods."
      },
      {
        "h2": "Profit factor"
      },
      {
        "code": "Profit factor = Gross profit ÷ Gross loss"
      },
      {
        "p": "With the same numbers over 100 trades: 40 × $300 = $12,000 won, 60 × $150 = $9,000 lost, a profit factor of 1.33. Above 1 the winners outweigh the losers; below 1 they do not. It is quick to read, but it ignores how many trades it took to get there."
      },
      {
        "h2": "Why win rate misleads"
      },
      {
        "p": "A high win rate often comes from taking profits early and letting losses run. Ten wins of $50 and one loss of $600 is a 91% win rate and a net loss of $100. Expectancy shows this immediately; win rate hides it."
      },
      {
        "h2": "How many trades are enough?"
      },
      {
        "p": "These numbers move a lot over a small sample. Twenty trades can look excellent or terrible by chance. Look at them over at least 30–50 trades, and compare them per setup rather than for your whole account mixed together."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "The statistics page shows expectancy, profit factor, payoff ratio, average win and loss, and win rate, calculated from your closed trades — including trades that arrive from MetaTrader or are imported from a report. The setup performance table shows the win rate and net result of each setup, so you can see which one carries your results."
      }
    ]
  },
  "overtrading": {
    "title": "Overtrading: how to tell when you are trading too much",
    "description": "What overtrading is, how it shows up in your own trade data, why extra trades tend to cost money, and simple limits that keep your trade count in check.",
    "body": [
      {
        "p": "Overtrading means taking more trades than your plan calls for — entries that happen because you are at the screen, not because your setup appeared. It rarely feels like a mistake in the moment. Each trade looks reasonable on its own; the problem only shows when you count them."
      },
      {
        "h2": "Why extra trades cost money"
      },
      {
        "p": "Good setups are limited; the market does not offer them every hour. When the number of trades goes up, the extra ones are usually weaker: setups that are almost there, entries in the middle of a range, trades in quiet hours. Every trade also carries costs — spread, commission, swap — and these add up faster than most traders expect."
      },
      {
        "h2": "Common causes"
      },
      {
        "ul": [
          "Trying to win back a loss (revenge trading).",
          "Boredom on a slow day, or the feeling that a day without trades is wasted.",
          "A daily profit goal that pushes you to keep going until it is reached.",
          "Dropping to a lower timeframe, where setups appear more often but mean less.",
          "Carrying on after a big win, when confidence is at its highest."
        ]
      },
      {
        "h2": "How to spot it in your journal"
      },
      {
        "ul": [
          "Days with far more trades than your usual day.",
          "Results by trade number within the day: are your fourth and fifth trades worse than your first and second?",
          "Trades with no setup, or with a setup you only use occasionally.",
          "Many short trades in a row on the same instrument."
        ]
      },
      {
        "p": "The comparison that matters is simple: take your busiest days and compare their net result and win rate with your normal days. If the busy days are clearly worse, the number of trades is part of the problem."
      },
      {
        "h2": "Limits that help"
      },
      {
        "ul": [
          "A maximum number of trades per day, written down before the session — for example your usual number plus one.",
          "A stop after a set number of losses, however many trades that is.",
          "Only setups on your checklist count; anything else is not a trade.",
          "A fixed trading window; outside it, no new entries."
        ]
      },
      {
        "p": "A limit only works if it is set in advance. At the fifth trade of the day, the case for a sixth will always sound convincing."
      },
      {
        "h2": "In Simple Trading Journal"
      },
      {
        "p": "The discipline view works out your usual number of trades per day from your own history and marks days with more than twice that number (and at least four trades). It needs at least five trading days to judge, and it shows what the trades on those days cost compared with the rest. The calendar shows each day's trade count and result, and trades from MetaTrader are included automatically."
      }
    ]
  },
  "tradervue-alternative": {
    "title": "Simple Trading Journal vs Tradervue: an honest comparison",
    "description": "Looking for a Tradervue alternative? Prices, free plan, trial and MetaTrader support compared side by side, with where each one is stronger.",
    "body": [
      {
        "p": "Tradervue is one of the longest-running trading journals, popular with US stock, options and futures traders. If you are looking for an alternative — cheaper, in your own language, or with MetaTrader auto-sync — here is how Simple Trading Journal compares."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradervue"
          ],
          [
            "Monthly price",
            "$14.99",
            "$29.95 – $49.95"
          ],
          [
            "Yearly price",
            "$119",
            "Not listed on its pricing page"
          ],
          [
            "Free plan",
            "Yes — 2 trades a day, no time limit",
            "Yes — 30 trades imported a month"
          ],
          [
            "Free trial",
            "3 days of Pro, no card",
            "7 days of Silver or Gold; the card is charged when it ends unless you switch to the free plan"
          ],
          [
            "MetaTrader auto-sync",
            "MT4 and MT5",
            "No — MT4 and MT5 by uploading a report file"
          ],
          [
            "How MetaTrader connects",
            "Add-on in MetaTrader + key, no password shared",
            "Save an HTML report in MetaTrader and upload it"
          ],
          [
            "Imports",
            "MT4/MT5 report, cTrader, TradeLocker, DXtrade, Match-Trader, any CSV",
            "A long list of brokers and platforms; broker sync for some brokers"
          ]
        ]
      },
      {
        "note": "Tradervue's prices and features are taken from its own pricing, platform and help pages in September 2026 and may have changed since. Check its website before you decide."
      },
      {
        "h2": "Where Tradervue is stronger"
      },
      {
        "ul": [
          "Deep support for US stocks, options and futures, with many US brokers and platforms.",
          "Detailed reports, and exit analysis and MFE/MAE statistics on its higher plan.",
          "Mentoring and sharing trades with its community.",
          "A very long track record."
        ]
      },
      {
        "h2": "Where Simple Trading Journal is stronger"
      },
      {
        "ul": [
          "MetaTrader 4 and 5 trades arrive on their own as you trade — no report to export and upload each time.",
          "Pro costs $14.99 a month or $119 a year — Tradervue's paid plans start at $29.95 a month.",
          "A 3-day Pro trial without a card.",
          "The whole app in 9 languages, including Turkish, Persian and Arabic.",
          "Built-in discipline analysis (revenge trades, rising risk after losses, overtrading, off-hours trading) and prop firm limit tracking."
        ]
      },
      {
        "h2": "Which one should you choose?"
      },
      {
        "p": "If you trade US stocks, options or futures through a US broker, Tradervue is built around exactly that. If you trade forex, indices or gold on MetaTrader, want your trades recorded automatically and would rather start free, try Simple Trading Journal — the free plan needs no card."
      }
    ]
  },
  "tradesviz-alternative": {
    "title": "Simple Trading Journal vs TradesViz: an honest comparison",
    "description": "Looking for a TradesViz alternative? Prices, free plan, trial and MetaTrader sync compared side by side, with where each one is stronger.",
    "body": [
      {
        "p": "TradesViz is a trading journal with a very large set of statistics, charts, simulators and AI tools. If you are looking for an alternative — simpler, cheaper per year, in your own language, or free for forex — here is how Simple Trading Journal compares."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TradesViz"
          ],
          [
            "Monthly price",
            "$14.99",
            "$19.99 – $29.99"
          ],
          [
            "Yearly price",
            "$119",
            "$179.88 – $269.88"
          ],
          [
            "Free plan",
            "Yes — 2 trades a day, no time limit, all instruments",
            "Yes — stocks only, 3,000 executions a month"
          ],
          [
            "Free trial",
            "3 days of Pro, no card",
            "7 days of Pro or Platinum"
          ],
          [
            "MetaTrader auto-sync",
            "MT4 and MT5",
            "MT4 and MT5 (paid plans; the free plan is stocks only)"
          ],
          [
            "How MetaTrader connects",
            "Add-on in MetaTrader + key, no password shared",
            "Account number + investor password, or MetaTrader's FTP report publishing"
          ],
          [
            "Imports",
            "MT4/MT5 report, cTrader, TradeLocker, DXtrade, Match-Trader, any CSV",
            "250+ brokers and platforms, 70+ auto-sync connections"
          ]
        ]
      },
      {
        "note": "TradesViz's prices and features are taken from its own pricing, broker and blog pages in September 2026 and may have changed since. Check its website before you decide."
      },
      {
        "h2": "Where TradesViz is stronger"
      },
      {
        "ul": [
          "A much larger set of statistics and charts — more than 600, according to TradesViz.",
          "Trading simulators, trade replay, options tools and a stock screener.",
          "AI tools that answer questions about your trades.",
          "Far more broker integrations, including stocks, options, futures and crypto."
        ]
      },
      {
        "h2": "Where Simple Trading Journal is stronger"
      },
      {
        "ul": [
          "The free plan covers forex, indices, gold and every other instrument — TradesViz's free plan is stocks only.",
          "Pro costs $119 a year — TradesViz's cheapest yearly plan is $179.88.",
          "MetaTrader 4 and 5 sync through a small add-on and a key; you never share your investor password.",
          "A simpler app with fewer screens to learn.",
          "The whole app in 9 languages, including Turkish, Persian and Arabic."
        ]
      },
      {
        "h2": "Which one should you choose?"
      },
      {
        "p": "If you want the deepest possible analysis, simulators and AI tools and you will use them, TradesViz offers more. If you trade forex or CFDs on MetaTrader and want a clear journal in your own language that you can start using free, try Simple Trading Journal — the free plan needs no card."
      }
    ]
  },
  "fx-replay-alternative": {
    "title": "Simple Trading Journal vs FX Replay: what each one is for",
    "description": "FX Replay or Simple Trading Journal? One is a backtesting platform, the other a journal for your real trades. Prices, free plans and MetaTrader support compared.",
    "body": [
      {
        "p": "FX Replay is mainly a backtesting platform: you replay historical charts and practise trades on them, and it includes a journal. Simple Trading Journal is a journal for the trades you actually take on your account. They overlap less than it seems — here is how they compare."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "FX Replay"
          ],
          [
            "Main purpose",
            "Journal and analysis of your real trades",
            "Backtesting on historical charts, with a journal"
          ],
          [
            "Monthly price",
            "$14.99",
            "$17.99 – $35"
          ],
          [
            "Yearly price",
            "$119",
            "$180 – $350"
          ],
          [
            "Free plan",
            "Yes — 2 trades a day, no time limit",
            "Yes — 2 backtesting sessions, 1 indicator, 1 week of data retention"
          ],
          [
            "Free trial",
            "3 days of Pro, no card",
            "Yes, no card (length not stated)"
          ],
          [
            "MetaTrader",
            "MT4 and MT5 auto-sync with an add-on + key",
            "MT4 and MT5 by file upload"
          ],
          [
            "Imports",
            "MT4/MT5 report, cTrader, TradeLocker, DXtrade, Match-Trader, any CSV",
            "Any CSV; NinjaTrader, Tradovate and MT4/MT5 files"
          ]
        ]
      },
      {
        "note": "FX Replay's prices and features are taken from its own pricing and journal pages in September 2026 and may have changed since. Check its website before you decide."
      },
      {
        "h2": "Where FX Replay is stronger"
      },
      {
        "ul": [
          "Backtesting: replay past price action bar by bar, including seconds-level data on its Pro plan.",
          "A prop firm challenge simulator for practising under challenge rules.",
          "Testing a strategy on a large sample before risking money on it.",
          "An active community on Discord."
        ]
      },
      {
        "h2": "Where Simple Trading Journal is stronger"
      },
      {
        "ul": [
          "Your real MetaTrader 4 and 5 trades are recorded automatically as you trade.",
          "Pro costs $14.99 a month or $119 a year.",
          "Discipline analysis on real trades: revenge trades, rising risk after losses, overtrading, off-hours trading.",
          "Prop firm limit tracking on your real challenge account.",
          "The whole app in 9 languages, including Turkish, Persian and Arabic."
        ]
      },
      {
        "h2": "Which one should you choose?"
      },
      {
        "p": "They do different jobs. To test a strategy on past data, FX Replay is built for that. To record and review the trades you actually take — especially on MetaTrader — use Simple Trading Journal. Many traders use a backtesting tool and a journal side by side; the free plan here needs no card."
      }
    ]
  },
};

export default TEXT;
