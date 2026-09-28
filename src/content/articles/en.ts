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
};

export default TEXT;
