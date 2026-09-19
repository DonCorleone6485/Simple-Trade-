import { PropPack } from './core';

/** English copy. Option order matches the `points` array in core.ts. */
const en: PropPack = {
  drawdown: {
    title: 'Type of Maximum Drawdown',
    short: 'The account\'s kill line — go below it and the account is over. The question: does it stay where it started, or climb as you make money? A trailing line can blow you up the moment you give back paper profit. This is the single most decisive difference between one account and another.',
    options: [
      'Static — set at the start, never moves',
      'Trails closed balance, locks at breakeven',
      'Trails closed balance, never locks (Balance/EOD trailing)',
      'Trails open profit as well (Equity trailing)',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'Every account has a "kill line" — drop below it and the account is closed. Where that line sits matters, but **how it behaves** matters just as much. There are three models:' },
      { p: '**Static:** The line is set at the start and never moves for the life of the account. Profit, withdrawals, a balance that doubles — it stays put. The good part: as you earn, the distance between you and the line grows, so your room to breathe grows with it.' },
      { p: '**Trailing the closed balance (Balance/EOD trailing):** The line climbs behind the profits you **close**. Swings in an open position do not move it — it only rises when you close a trade. At some firms the line stops once it reaches your starting balance and effectively becomes static; that is clearly better than one that trails forever.' },
      { p: '**Trailing open profit as well (Equity trailing):** The dangerous one. The line climbs on profit you have not even realised. Your position ticks into profit for a moment, the line locks higher, and when that profit evaporates — without you losing a single real dollar — the account can be gone.' },
      { h: 'Example ($100,000 account, 10% line)' },
      { p: 'Say you open a gold position. It first runs +$5,000 into profit, then comes back and you close at breakeven.' },
      {
        table: {
          head: ['Moment', 'Balance', 'Equity', 'Static line', 'Equity trailing line'],
          rows: [
            ['Start', '$100,000', '$100,000', '$90,000', '$90,000'],
            ['Position +$5,000 in profit', '$100,000', '$105,000', '$90,000', '**$95,000** ↑'],
            ['Profit gone, equity fell', '$100,000', '$94,000', 'Safe', '**Line breached — account gone**'],
          ],
        },
      },
      { p: 'Nothing happened under the static line. Under equity trailing the account closed even though the money in your pocket never shrank — because the line had climbed after a profit you never took.' },
      { p: '**What happens as you profit?** Imagine your balance reaches $120,000. With a static line the floor is still $90,000 — $30,000 of room. With trailing, the line has climbed with you to $110,000 and your room stays the same $10,000 forever.' },
    ],
  },

  news: {
    title: 'Trading Around News',
    short: 'Can you open and close trades during high-impact news? If there is a restriction, what really matters is not the restriction itself but **what a breach costs**: is only that trade\'s profit removed, or is the account closed?',
    options: [
      'Fully allowed, no blackout window',
      'Allowed with a paid add-on',
      'Blackout window (±2, ±4, ±5 min), trades opened earlier are exempt',
      'Blackout window (±2, ±4, ±5 min), a breach only removes the profit',
      'Blackout window (±2, ±4, ±5 min), a breach closes the account',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'High-impact releases such as NFP, CPI and FOMC move the market violently within seconds. Firms dislike the risk that creates, so most impose a **blackout window**: you may not open or close a trade 2, 4 or 5 minutes before and after the release.' },
      { p: 'But the window itself is not the critical part — **what happens when you breach it** is. You will see three outcomes:' },
      {
        ul: [
          '**Only that trade\'s profit is removed** → annoying, but the account lives on',
          '**The account is closed** → one mistake ends everything',
          '**There is an exemption** → some firms say "if the trade was opened 4-5 hours before the release, we do not count it as news trading"',
        ],
      },
      { p: 'And here is the detail most people miss: at some firms you can breach the rule **without doing anything at all**. If the stop or target of a position you opened hours earlier is triggered inside that window, that counts as closing a trade in the window.' },
      { h: 'Example' },
      { p: 'At 10:00 you buy gold with a target at $4,120. NFP lands at 15:30 and the blackout window runs 15:28–15:32.' },
      { p: '**Scenario A — firm that removes the profit:** the news spike hits your target at 15:29. The trade closes +$2,000, but that profit is wiped from the account. The account continues; you simply do not keep the gain.' },
      { p: '**Scenario B — firm that closes the account:** the same thing happens and your account is gone. You were not even at the screen; the system triggered the order — it still counted as a breach.' },
      { p: '**Scenario C — firm with an exemption:** you opened at 10:00, five and a half hours before the release. The firm does not treat it as news trading and the profit stays yours.' },
      { p: '**What it means in practice:** at a Scenario B firm you have to pull the stops and targets of every open position away from the window before each high-impact release. Dozens of times a month. Forget once and the account is gone.' },
    ],
  },

  floating: {
    title: 'Open Position Loss Limit (Floating)',
    short: 'A separate limit that watches the loss you have **not yet realised**. Cross the threshold and the system closes every position instantly — even if you never came near your daily limit. The sneakiest rule there is for anyone who holds several trades at once.',
    options: [
      'None',
      'Yes, threshold 4% or above',
      'Yes, threshold 3%',
      'Yes, threshold 2%',
      'Yes, threshold below 2%',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'You normally know two loss limits: daily and overall. This is a third one and it works differently — it watches **only the unrealised loss sitting in your open positions**.' },
      { p: 'Cross the threshold and the system does not wait: it closes every position at once. At some firms the account is closed too; at others the first offence brings a penalty (a cut in your profit share) and the second closes the account.' },
      { p: 'Why is it sneaky? Because **you may be nowhere near your daily limit**. Each position looks sensibly sized on its own, but their open losses add up, cross the threshold, and the system takes you out of the market — possibly one step before the trades would have turned.' },
      { h: 'Example ($100,000 account, 2% threshold = $2,000)' },
      { p: 'You opened three trades this morning, each risking $1,000:' },
      { ul: ['XAUUSD long → now −$700', 'EURUSD long → now −$700', 'GBPUSD long → now −$700'] },
      { p: '**Total open loss: −$2,100** → the system steps in and closes all three.' },
      { p: 'And yet:' },
      {
        ul: [
          'Your daily limit was $5,000 and you never came close',
          'None of your stops were hit; all three could still have turned',
          'Your total risk was only 3% of the account',
        ],
      },
      { p: 'You never pushed a single rule on purpose, but in the system\'s eyes "your open loss grew too large".' },
      { p: '**Rule of thumb:** where this limit exists, the combined risk of everything open at once must stay under the threshold. On a $100K account with a 2% threshold, total open risk must stay under $2,000 — so if you plan four trades, each can risk at most $500.' },
    ],
  },

  dailyBase: {
    title: 'Basis of the Daily Loss Line',
    short: 'The daily line resets and is recalculated every day. On what basis? If the higher of balance and equity is used, paper profit carried overnight pushes the line up — give that profit back the next day and the account can die without a single real loss.',
    options: [
      'No daily limit at all',
      'Balance-based — open profit does not move it',
      'The higher of balance or equity is used',
      'Calculated from the intraday equity peak',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'The daily loss line resets and is recalculated every day. But **what it is calculated from** varies by firm, and the difference is vital:' },
      { p: '**Balance-based:** the line is drawn from your closed money at the start of the day. Profit or loss in an open position is ignored. The safest model.' },
      { p: '**Higher of the two:** at the start of the day the firm looks at both balance and equity and takes whichever is higher. So if your overnight position is in profit, that paper profit pushes the line up.' },
      { p: '**From the intraday equity peak:** the harshest model. The moment you go into profit during the day, the line locks higher.' },
      { p: 'Why does it matter? Because in the second and third model you can lose the account **without a single real loss** — simply by handing back paper profit.' },
      { h: 'Example ($100,000 account, 5% daily limit)' },
      { p: 'At midnight your balance is $100,000 and your open gold position is +$10,000 in profit (equity $110,000).' },
      { p: '**Balance-based firm:** line = $100,000 − $5,000 = **$95,000**. The next day the profit evaporates and you close at breakeven → equity $100,000. You are $5,000 clear of the line. No problem.' },
      { p: '**Firm that takes the higher:** line = $110,000 × 0.95 = **$104,500**. The next day $5,500 of profit evaporates → equity falls to $104,500. **Account closed.**' },
      { p: 'Notice: in the second case the money in your pocket is still $100,000. You did not lose a cent of real money. You simply gave back a profit you never took, and the account was gone.' },
      { p: '**Rule of thumb:** at a "higher of the two" firm, the larger the paper profit you carry into midnight, the tighter your room is the next day. Carrying floating profit worth more than roughly 5% of the account into the new day puts you in dangerous territory.' },
    ],
  },

  consistency: {
    title: 'Profit Consistency Rule',
    short: 'Your best day may not exceed a set share of your total profit. It does not close the account but it holds your payout. Careful: at some firms it does not exist during the evaluation and only switches on once you are funded.',
    options: ['None', '50% or above', '40% – 49%', '30% – 39%', 'Below 30%'],
    detail: [
      { h: 'Explanation' },
      { p: 'The rule says: **a single day\'s profit may not exceed a set percentage of your total profit.** The firm is asking itself whether you got one lucky hit or whether you actually know what you are doing.' },
      { p: 'The important part: this rule does **not** close your account. It locks your money. Until the rule is satisfied you have to keep trading and grow your total profit so that the big day shrinks as a percentage.' },
      { p: 'There is a trap: at some firms the rule does not exist during the evaluation but switches on after funding. The payout terms have to be read separately.' },
      { h: 'Example ($100,000 account, 35% rule)' },
      { p: 'Say you hit the target with $7,000 of total profit. The rule says your best day may not exceed 35% of the total. $7,000 × 0.35 = **$2,450**' },
      { p: '**Case A:** your best day was $2,000. Fine — you get paid.' },
      { p: '**Case B:** your best day was $4,000. Rule breached, payout locked. What does it take to fix? $4,000 ÷ 0.35 = **$11,429**' },
      { p: 'So to legitimise that one day you must lift total profit to $11,429. You cannot stop at $7,000 and get paid; you have to make another $4,400.' },
      { p: '**Who it hurts:** someone collecting small profits every day never feels this rule. Someone who earns on news or a few big hits runs into it constantly — their strategy concentrates profit into a handful of days by design.' },
      { p: '**The higher the percentage the better:** at 50% one day may be half the total (comfortable); at 15% only a seventh (very tight).' },
    ],
  },

  overnight: {
    title: 'Holding Overnight',
    short: 'Keeping a position open through the daily rollover. If it is banned, everything you open during the day has to be closed by the end of the session.',
    options: ['Allowed', 'Allowed with a paid add-on', 'Banned — closed automatically at session end'],
    detail: [
      { h: 'Explanation' },
      { p: 'The right to hold a position through the daily rollover. It sounds minor, but it decides your strategy for you.' },
      { p: 'If it is banned, every position you open has to be closed the same day — the system closes them all at the end of the session. You cannot swing, you cannot catch a move that takes several days, you cannot carry a news position into the next day.' },
      { p: 'At some firms it is allowed but behind a paid add-on. At others it is allowed yet the overnight interest (swap) is expensive — especially on indices and oil, where a few days of carry can eat your profit.' },
      { h: 'Example' },
      { p: 'On Thursday you spot a good long in gold; the move you are after will take two or three days.' },
      { p: '**At a firm that allows it:** you open, you carry through Friday and Monday, and you close at your target. All you pay is the overnight swap.' },
      { p: '**At a firm that bans it:** you must close the same day. If the move continues overnight you miss it. You have to re-enter the next day — but price may already be gone. And re-entering daily multiplies your commission and spread costs.' },
      { p: '**Who it hurts:** a scalper who is in and out within the day never feels this rule. For someone holding swing or news positions it makes the account unusable.' },
    ],
  },

  payout: {
    title: 'Payout Frequency',
    short: 'How often can you withdraw your profit, and how long is the wait for the first payout? Profit you have not withdrawn is always still at risk.',
    options: [
      'On demand',
      'Weekly (7 days)',
      '10 – 14 days',
      'Down to 14 days with a paid add-on',
      'Monthly (28 – 30 days)',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'How often you can take your money out. It does not put the account at risk, but do not forget one fact: **profit sitting in the account is not your money.** Until you withdraw it, it is still at risk — one rule breach, one bad day, and it is gone.' },
      { p: 'Two separate things to check: how long you wait for the first payout, and how frequent the cycle is after that.' },
      { h: 'Example' },
      { p: 'You get funded and make $5,000 in the first month.' },
      { p: '**At an on-demand firm:** you request it the day the profit appears and it is in your account within a few business days. The money is genuinely yours.' },
      { p: '**At a monthly firm:** you wait 30 days. During those 30 days you might have a bad week and give part of it back, or breach a rule and lose the whole $5,000. In that case the number you saw in the account was only a number — it never reached your pocket.' },
      { p: '**What it means in practice:** payout frequency is not a question of how fast you get rich — it is a question of **how fast you take risk off the table**. A firm that pays often lets you bank your profit sooner.' },
    ],
  },

  riskPerTrade: {
    title: 'Risk Limit per Trade or Instrument',
    short: 'On top of the daily limit, a separate ceiling on how much you may risk in one trade or one instrument. Positions in the same instrument are usually added together and counted as one trade.',
    options: [
      'None',
      'Yes, threshold 3% or above',
      'Yes, threshold 2% – 3%',
      'Yes, threshold below 2%',
      'Lot cap per instrument',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'Beyond the daily and overall limits, a separate ceiling on how much you may risk **in a single trade or a single instrument**. It comes in two forms:' },
      { p: '**Percentage-based:** "you may risk at most 2% of the account on a single trade idea". The detail that matters: several positions opened in the same instrument in the same direction usually count as **one trade**, so their risks are added together.' },
      { p: '**Lot-based (a lot cap):** "you may hold at most 3 lots in gold". This one is stricter because it caps absolute position size, not risk.' },
      { h: 'Example 1 — percentage-based ($100,000 account, 2% = $2,000 limit)' },
      { p: 'You bought gold three separate times, risking $800 each. You think of them as three trades; the firm counts them as one idea: $800 × 3 = **$2,400** → limit exceeded, breach.' },
      { h: 'Example 2 — lot cap (3-lot limit in gold)' },
      { p: 'You want to risk $2,500 in gold. The lots you need depend on your stop distance:' },
      {
        table: {
          head: ['Stop distance', 'Lots needed', 'Result'],
          rows: [
            ['$20', '1.25 lots', '✓ Fine'],
            ['$10', '2.5 lots', '✓ Fine'],
            ['$5', '5 lots', '✗ Cap is 3 lots — you can risk at most $1,500'],
          ],
        },
      },
      { p: 'So with a tight stop you cannot mathematically reach the risk you wanted. A lot cap restricts traders who use tight stops directly.' },
    ],
  },

  stopLoss: {
    title: 'Stop-Loss Rule',
    short: 'Is a stop mandatory? Must the stop you place stay visible on the platform? Placing a stop, removing it, then closing by hand when price arrives counts as a hidden stop at some firms, and is banned.',
    options: [
      'Not required, no visibility condition',
      'Not required, but it must stay visible if placed',
      'Mandatory (must be placed within a set time)',
      'Mandatory + a maximum distance condition',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'It contains two separate questions:' },
      { p: '**Is a stop mandatory?** Some firms require a stop on every position within a set time. Others never interfere.' },
      { p: '**Must the stop stay visible?** This is the less known but important rule. Some traders place a stop, remove it, and close manually when price reaches that level — the aim is to avoid getting "stop hunted". Some firms call this a **stealth stop** and ban it. To them a stop must be a real order sitting on the platform for the life of the position.' },
      { p: 'Why do firms care? Because they size their own risk from your visible stops. A trader whose stop cannot be seen is, in their eyes, a trader whose risk cannot be measured.' },
      { h: 'Example' },
      { p: 'Say you buy gold and place a stop $10 away, then remove it and tell yourself "if price gets there I will close by hand".' },
      { p: '**At a firm with no rule:** no problem, manage it as you like.' },
      { p: '**At a firm with a visibility condition:** this counts as a breach. It shows up as a pattern in your trade history (positions without stops, always closed manually) and you get flagged in review.' },
      { p: '**The fix — best of both worlds:** place the stop **wide** from the start (beyond where spikes reach) and size the position down to match — your dollar risk is unchanged. You still make the real exit decision by hand when price reaches your mental level. But an insurance stop always sits on the platform.' },
      { p: 'The bonus: you stay protected when your internet drops, when you are asleep, or when the platform freezes. A mental stop only works while you are at the screen.' },
    ],
  },

  minDays: {
    title: 'Minimum Trading Days',
    short: 'The minimum number of days before you can pass, even with the target already hit. The critical distinction: is **opening a trade** enough, or must you also **make a profit** that day?',
    options: [
      'None (0 days)',
      '1 – 4 days, plain days (no profit condition)',
      '5 days or more, plain days',
      'A profitable-day condition applies',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'Even with the profit target hit, you have to have traded on a certain number of separate days to pass. The point is to filter out those who passed on one lucky hit. The critical distinction:' },
      { p: '**Plain day:** simply **opening** a position that day is enough. Profit or loss, the day counts. Even a tiny trade fills it.' },
      { p: '**Profitable day:** you have to **make** a set amount that day (usually 0.5% of the account). Days you lost, or made only a little, do not count.' },
      { p: 'The gap between the two is enormous. A plain-day condition only delays you. A profitable-day condition takes the timing out of your hands — if the market offers no decent opportunity, you wait.' },
      { h: 'Example ($50,000 account, 3 profitable days required, 0.5% = $250)' },
      {
        table: {
          head: ['Day', 'Trades closed that day', 'Net', 'Counted?'],
          rows: [
            ['Monday', '+$415, −$403', '+$12', '✗ (under $250)'],
            ['Tuesday', '+$139, +$368', '+$507', '✓'],
            ['Wednesday', '+$989', '+$989', '✓'],
            ['Thursday', '−$658', '−$658', '✗'],
            ['Friday', '+$2,814', '+$2,814', '✓'],
          ],
        },
      },
      { p: 'Three profitable days done. But note: Monday did not count even though you traded twice, because the net was $12. Thursday did not count because it closed at a loss. At a firm with a plain-day condition, all five days would have counted.' },
      { p: '**One more detail:** at some firms a "day" is the day the position was **opened**. A position opened Monday and closed Wednesday counts only Monday; it does not fill Tuesday and Wednesday.' },
    ],
  },

  payoutDrawdown: {
    title: 'The Loss Line After a Payout',
    short: 'A withdrawal lowers your balance — does the loss line come down with it, or stay where it was? If it stays, every payout narrows your buffer.',
    options: [
      'The withdrawal does not affect the line; the floor drops with it',
      'The floor stays, the buffer narrows by the amount withdrawn',
      'The floor locks at the starting balance',
    ],
    detail: [
      { h: 'Explanation' },
      { p: 'When you withdraw, your balance falls. What does the loss line do? Three possibilities:' },
      { p: '**The line falls too:** it drops in proportion to the withdrawal and your buffer is preserved. The best case.' },
      { p: '**The line stays:** your balance falls but the line holds its position — so the distance between them, your room to move, narrows. The most common model.' },
      { p: '**The line locks at your starting balance:** the moment you withdraw, the line is fixed at the level you began with. Withdraw all of your profit and your buffer is exactly zero.' },
      { p: 'That third case is dangerous because the account looks "full" on paper but can close on a single small loss.' },
      { h: 'Example ($100,000 account, firm that locks the floor at $100,000)' },
      { p: 'You made $10,000 of profit; your balance is $110,000.' },
      { p: '**Case A — you withdraw $5,000:** balance $105,000, floor $100,000 → **a $5,000 buffer.** You carry on comfortably.' },
      { p: '**Case B — you withdraw the whole $10,000:** balance $100,000, floor $100,000 → **zero buffer.** On your very next trade, even a dip the size of spread and commission takes equity below $100,000 and the account closes. The payout goes through but you lose the account.' },
      { p: '**Rule of thumb:** the buffer left after a payout must be clearly larger than the total risk you can have on at once. If three trades put $3,000 at risk, leave at least $5,000–6,000 of buffer after withdrawing. Never withdraw all of your profit.' },
    ],
  },

  weekend: {
    title: 'Holding Over the Weekend',
    short: 'Carrying a position from Friday\'s close to Monday\'s open. It is a separate rule from overnight holding. Even when allowed, swap costs rise on indices and oil, and Monday\'s opening gap can jump straight over your stop.',
    options: ['Allowed', 'Allowed with a paid add-on', 'Banned — closed automatically at Friday\'s close'],
    detail: [
      { h: 'Explanation' },
      { p: 'The right to hold a position from Friday\'s close to Monday\'s open. It is a **separate rule** from overnight holding — some firms allow weeknights but ban the weekend.' },
      { p: 'If it is banned you have to close everything before Friday\'s close; the system usually does it for you. Even when it is allowed, two side effects are worth knowing:' },
      { p: '**Swap cost:** the weekend usually carries three days of interest. On indices and oil that number can be serious; on forex and gold it is more reasonable.' },
      { p: '**Gap risk:** the market closes on Friday and opens Monday at a different price. If news breaks in between, price can open far beyond your stop — meaning your stop cannot protect you and you lose more than you planned.' },
      { h: 'Example' },
      { p: 'You are long gold on Friday with a stop $50 away.' },
      { p: '**Normal case:** Monday opens a little lower, your stop works as usual, you take the loss you planned.' },
      { p: '**Gap case:** something geopolitical happens over the weekend. Gold opens $80 below Friday\'s close on Monday. Your stop was at $50, but the first traded price is $80 lower — your position closes there. You take nearly twice the loss you planned.' },
      { p: 'This is why, when carrying over a weekend, you should leave more distance to your daily and overall lines than usual.' },
    ],
  },
};

export default en;
