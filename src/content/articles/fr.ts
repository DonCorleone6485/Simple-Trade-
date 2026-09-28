/** Yazıların fr metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  'metatrader-5-auto-sync': {
    title: "Comment connecter MetaTrader 4 ou 5 à votre journal de trading",
    description: "Pas à pas : installez le module Simple Trading Journal dans MT4 ou MT5 pour que chaque trade clôturé arrive automatiquement dans votre journal — stop loss, risque et frais compris.",
    body: [
      { p: "Saisir chaque trade à la main est la principale raison pour laquelle on abandonne son journal. Avec le module MetaTrader (MT4 et MT5), chaque trade est enregistré à l'ouverture et complété à la clôture : entrée, sortie, stop loss, taille, commission et swap. Vous n'ajoutez que ce que MetaTrader ne peut pas savoir : votre setup, votre raisonnement et votre état d'esprit." },
      { note: "MetaTrader 4 ou 5 ? Les étapes sont les mêmes pour les deux ; seuls le fichier et le dossier changent. Sur l'écran MetaTrader de l'application, choisissez d'abord votre version : MetaTrader 5 utilise SimpleTradingJournal.ex5 et MQL5 → Experts, MetaTrader 4 utilise SimpleTradingJournal.ex4 et MQL4 → Experts." },
      { h2: 'Ce qu\'il vous faut' },
      { ul: [
        "MetaTrader 4 ou MetaTrader 5 sur Windows ou Mac (le terminal de bureau — l'application mobile ne fait pas tourner de modules).",
        'Un compte Simple Trading Journal avec au moins un journal.',
        'Deux minutes.',
      ] },
      { h2: '1. Téléchargez le module' },
      { p: "Dans l'application, ouvrez MetaTrader depuis le menu, choisissez MetaTrader 4 ou 5 et téléchargez le module (SimpleTradingJournal.ex5 pour MT5, SimpleTradingJournal.ex4 pour MT4). Dans MetaTrader, choisissez File → Open Data Folder, allez dans MQL5 → Experts (MQL4 → Experts sur MT4) et déposez-y le fichier." },
      { note: "Sur Mac, « Open Data Folder » ne fonctionne pas dans certaines versions. Dans le Finder, utilisez Aller → Aller au dossier et collez le chemin de votre version. MetaTrader 5 : ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts — MetaTrader 4 : ~/Library/Application Support/net.metaquotes.wine.metatrader4/drive_c/Program Files (x86)/MetaTrader 4/MQL4/Experts" },
      { h2: '2. Autorisez la connexion' },
      { p: 'MetaTrader bloque les requêtes Internet des modules tant que vous n\'autorisez pas l\'adresse. Allez dans Tools → Options → Expert Advisors, cochez « Allow WebRequest for listed URL » et ajoutez :' },
      { code: 'https://www.simpletradejournal.io' },
      { h2: '3. Redémarrez MetaTrader' },
      { p: 'Fermez MetaTrader puis rouvrez-le. SimpleTradingJournal apparaît maintenant sous Expert Advisors dans le panneau Navigator à gauche.' },
      { h2: '4. Glissez-le sur un graphique et collez votre clé' },
      { p: "Dans l'application, créez une clé de connexion (elle commence par stj_). Glissez SimpleTradingJournal sur n'importe quel graphique, ouvrez l'onglet Inputs, collez la clé dans ApiKey et cliquez sur OK. Quand le coin supérieur gauche du graphique indique que la connexion fonctionne, c'est terminé. Il indique aussi vers quel journal partent les trades (Journal: …) — vérifiez que c'est le bon." },
      { p: 'Chaque clé appartient à un journal et se verrouille sur le premier compte de trading qui s\'y connecte : les trades de deux comptes ne se mélangent jamais dans le même journal. Pour un deuxième compte, créez une deuxième clé.' },
      { h2: 'Sur quel graphique le mettre ?' },
      { p: 'MetaTrader n\'exécute qu\'un expert advisor par graphique. Si vous utilisez déjà un autre EA, ouvrez un nouveau graphique vide réservé au module du journal et laissez-le ouvert : chaque trade clôturé arrive tout seul pendant que vous tradez sur vos autres graphiques. Si vous préférez ne pas garder de graphique en plus, placez le module sur un graphique seulement quand vous voulez synchroniser ; il rattrape tout ce qui a été clôturé entre-temps.' },
      { h2: 'Ce qui est enregistré' },
      { ul: [
        'Symbole, sens, taille, prix et heure d\'entrée et de sortie.',
        'Stop loss et take profit. Le stop avec lequel vous êtes entré est conservé même si vous le déplacez ensuite, pour que votre risque et vos multiples de R restent justes.',
        'Résultat brut, commission, swap et résultat net.',
        "Sur MetaTrader 5, une position clôturée en plusieurs fois (TP1, TP2…) est enregistrée comme un seul trade une fois entièrement fermée. Sur MetaTrader 4, une clôture partielle donne au reste de l'ordre un nouveau numéro : il apparaît donc comme un trade distinct.",
      ] },
      { h2: 'Dépannage' },
      { ul: [
        'Rien n\'arrive : vérifiez que l\'adresse de l\'étape 2 est exactement https://www.simpletradejournal.io, que le graphique portant le module est toujours ouvert et que la clé a été collée sans espace.',
        "« Clé liée à un autre compte » : la clé appartient déjà à un autre compte de trading. Créez une nouvelle clé pour ce compte.", "Les trades arrivent dans le mauvais journal : la ligne « Journal: » du graphique indique où ils partent. Si elle affiche un autre journal, le module utilise encore une ancienne clé. Ouvrez Inputs, videz entièrement ApiKey, collez la nouvelle clé, appuyez sur Entrée puis sur OK, et révoquez l'ancienne clé dans l'application.", "Sur MetaTrader 4, le module est grisé et ne se glisse pas : utilisez le fichier SimpleTradingJournal.ex4 téléchargé depuis l'écran MetaTrader, puis faites un clic droit sur Expert Advisors dans le panneau Navigator et choisissez Refresh.",
        'J\'ai perdu la clé : MetaTrader la mémorise. Si elle est vraiment perdue, créez-en une nouvelle dans l\'application et révoquez l\'ancienne.',
      ] },
      { p: 'Vous préférez ne rien installer ? Vous pouvez aussi importer le rapport propre à MetaTrader — voir le guide d\'import.' },
    ],
  },
  'import-trade-history': {
    title: 'Comment importer votre historique de trades dans un journal de trading',
    description: 'Importez les trades clôturés depuis MetaTrader 4/5, cTrader, TradeLocker, DXtrade ou Match-Trader. Comment obtenir le bon rapport, ce qui y est lu et comment les doublons sont évités.',
    body: [
      { p: 'Si vous tradez depuis des mois, inutile de tout ressaisir. Exportez un rapport depuis votre plateforme et déposez-le dans le journal : le fichier est lu dans votre navigateur, la plateforme est reconnue automatiquement et vous voyez tous les trades avant que quoi que ce soit ne soit enregistré.' },
      { h2: 'Plateformes prises en charge' },
      { ul: ['MetaTrader 5 et MetaTrader 4 (le rapport HTML)', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader', 'Tout autre CSV — vous indiquez quelle colonne est la date, le symbole, le sens et le résultat'] },
      { h2: 'Obtenir le bon rapport MetaTrader' },
      { ol: [
        'Dans MetaTrader, ouvrez la Toolbox (Ctrl+T) et allez dans l\'onglet History.',
        'Faites un clic droit dans la liste et choisissez la période voulue (par exemple « All history »).',
        'Nouveau clic droit → Report, et enregistrez-le en HTML.',
      ] },
      { note: 'N\'utilisez pas le rapport de compte qui n\'affiche que le solde et les positions ouvertes : il ne contient aucun trade clôturé. Si l\'import indique n\'avoir trouvé aucun trade clôturé, c\'est presque toujours la raison.' },
      { h2: 'Importer' },
      { ol: [
        'Dans l\'application, choisissez Importer et sélectionnez le journal de destination.',
        'Glissez le fichier dans la fenêtre ou cliquez pour le choisir.',
        'Vérifiez l\'aperçu : symbole, sens, taille, prix, heures et résultat net de chaque trade.',
        'Confirmez. Les trades apparaissent dans votre journal, votre calendrier et vos statistiques.',
      ] },
      { h2: 'Ce qui est lu dans le rapport' },
      { ul: [
        'Le résultat net — pas seulement le profit brut : commission, swap et frais sont pris en compte.',
        'Le stop loss, pour calculer le risque et le multiple de R de chaque trade.',
        'Les prix et heures d\'entrée et de sortie.',
      ] },
      { h2: 'Importer deux fois le même fichier' },
      { p: 'Chaque trade porte son identifiant de plateforme : un trade déjà présent dans le journal est ignoré au lieu d\'être ajouté à nouveau. Vous pouvez importer un rapport à jour chaque semaine sans rien nettoyer. Si vous avez saisi un trade à la main pendant qu\'il était encore ouvert, l\'import complète cette saisie au lieu d\'en créer une deuxième.' },
      { p: "Vous voulez que cela se fasse tout seul ? Connectez MetaTrader 4 ou 5 une fois et les trades clôturés arrivent automatiquement — voir le guide MetaTrader." },
    ],
  },
  'how-to-keep-a-trading-journal': {
    title: 'Comment tenir un journal de trading que vous utiliserez vraiment',
    description: 'Quoi noter pour chaque trade, à quelle fréquence le relire, et les habitudes qui transforment un journal de trading abandonné en votre outil le plus utile.',
    body: [
      { p: 'La plupart des traders reconnaissent qu\'un journal aide, et la plupart l\'abandonnent en quelques semaines. Le problème est rarement la discipline : le journal demande trop au mauvais moment et ne rend rien. Un journal que vous utiliserez vraiment se remplit vite, se relit vite et vous montre ce que vous ne verriez pas seul.' },
      { h2: 'Quoi noter pour chaque trade' },
      { p: 'Séparez ce que la plateforme sait de ce que vous seul savez.' },
      { ul: [
        'Les faits : symbole, sens, entrée, sortie, stop loss, taille, résultat après frais. Ils ne devraient jamais être saisis à la main — importez-les ou synchronisez-les depuis votre plateforme.',
        'Le plan : quel setup c\'était et pourquoi vous êtes entré. Une ligne suffit.',
        'L\'état d\'esprit : comment vous vous sentiez à l\'entrée — calme, lassé, pressé, en train de vouloir vous refaire.',
        'Une capture du graphique à l\'entrée si le setup est visuel.',
      ] },
      { h2: 'Mesurez en R, pas en argent' },
      { p: 'Un gain de 300 dollars ne dit pas grand-chose à lui seul. Si vous risquiez 100 dollars, c\'était un trade à 3R ; si vous risquiez 600, c\'était un demi-R et un mauvais trade qui a fonctionné par chance. Noter votre stop permet au journal d\'exprimer chaque résultat en multiple de votre risque, et c\'est ce chiffre qui montre si votre avantage est réel.' },
      { h2: 'Relisez à intervalles réguliers' },
      { ul: [
        'Chaque jour, deux minutes : ai-je suivi mon plan aujourd\'hui ? Y a-t-il quelque chose à noter tant que c\'est frais ?',
        'Chaque semaine, quinze minutes : quels setups ont rapporté, lesquels ont coûté, et quels jours et sessions.',
        'Chaque mois : ma courbe de capital progresse-t-elle grâce aux setups auxquels je crois, ou malgré eux ?',
      ] },
      { h2: 'Cherchez les comportements, pas seulement les statistiques' },
      { p: 'Le taux de réussite et le R moyen disent ce qui s\'est passé. Les questions les plus utiles portent sur votre comportement : avez-vous repris un trade quelques minutes après une perte ? Votre taille a-t-elle augmenté après avoir perdu ? Certains jours, avez-vous tradé bien plus que votre plan ne le permet, ou en dehors de vos horaires habituels ? Ces schémas coûtent plus cher que n\'importe quel mauvais setup, et ils passent facilement inaperçus trade par trade.' },
      { p: 'Simple Trading Journal vérifie automatiquement ces quatre habitudes — le trading de revanche, la hausse du risque après une perte, le surtrading et le trading hors de vos horaires habituels — sur tous vos journaux.' },
      { h2: 'Gardez l\'effort minimal' },
      { ul: [
        'Automatisez les faits pour qu\'enregistrer un trade prenne des secondes, pas des minutes.',
        'Utilisez une courte checklist avant d\'entrer plutôt que de longues notes après.',
        'Étiquetez vos setups de façon cohérente — cinq setups utilisés chaque jour valent mieux que cinquante utilisés une fois.',
        'Tenez des journaux séparés pour des comptes séparés, comme un challenge de prop firm et un compte personnel.',
      ] },
      { h2: 'Commencez petit' },
      { p: 'Pas besoin d\'un système parfait dès le premier jour. Enregistrez les faits automatiquement, ajoutez une ligne sur la raison de chaque trade et relisez une fois par semaine. Au bout d\'un mois, vous aurez ce qu\'aucun indicateur ne peut donner : des preuves sur votre propre trading.' },
    ],
  },
  'r-multiple-explained': {
    title: 'Les multiples de R expliqués : jugez chaque trade au risque pris',
    description: 'Ce qu\'est un multiple de R, comment le calculer à partir du stop loss et pourquoi l\'espérance en R est le moyen le plus clair de savoir si une stratégie a un avantage.',
    body: [
      { p: 'L\'argent est un mauvais moyen de comparer des trades. Le même gain de 200 dollars peut être excellent ou imprudent selon ce que vous avez risqué pour l\'obtenir. Les multiples de R règlent ce problème en mesurant chaque résultat par rapport au risque pris.' },
      { h2: 'Qu\'est-ce que 1R ?' },
      { p: '1R est la somme que vous perdez si le trade touche votre stop loss. Achat à 1,1000 avec 1 lot et stop à 1,0950 : 1R correspond au coût de ces 50 pips — disons 500 dollars.' },
      { h2: 'Calculer le multiple de R' },
      { code: 'Multiple de R = résultat du trade ÷ risque initial (1R)' },
      { ul: [
        'Gain de 1 000 dollars pour 500 de risque : +2R.',
        'Perte de 500 au stop : −1R.',
        'Perte de 750 à cause d\'un glissement ou d\'un stop déplacé : −1,5R — signe que quelque chose a mal tourné.',
        'Clôture anticipée à +150 : +0,3R.',
      ] },
      { h2: 'Pourquoi c\'est important' },
      { p: 'Quand tous les trades sont exprimés en R, les résultats deviennent comparables quelles que soient la taille, l\'instrument ou le compte. On voit qu\'un setup à 40 % de réussite est excellent parce que ses gagnants font en moyenne +2,5R, ou qu\'un taux de 70 % pose problème parce que les perdants font en moyenne −3R.' },
      { h2: 'L\'espérance' },
      { p: 'L\'espérance est votre R moyen par trade. Additionnez le R de tous les trades et divisez par leur nombre.' },
      { code: 'Espérance = total des R ÷ nombre de trades' },
      { p: 'Une espérance positive signifie qu\'en moyenne chaque trade vous a rapporté par rapport au risque pris. 0,3R sur 100 trades font 30R ; avec 1 % de risque par trade, environ 30 % avant effet composé. Avec une espérance négative, trader davantage n\'aidera pas — c\'est le setup, l\'exécution ou la gestion du risque qui doit changer.' },
      { h2: 'Erreurs fréquentes' },
      { ul: [
        'Ne pas noter le stop. Sans lui, pas de 1R ni de multiple de R.',
        'Utiliser le stop déplacé au lieu du stop initial. Le R mesure le risque accepté à l\'entrée.',
        'Ignorer les frais. Commission et swap font partie du résultat ; un trade à +1R peut tomber à +0,9R après frais.',
        'Juger un setup sur une poignée de trades. Regardez-en au moins 30 avant de conclure.',
      ] },
      { h2: 'Dans Simple Trading Journal' },
      { p: "Quand un trade a un stop loss — saisi à la main, importé d'un rapport ou synchronisé depuis MetaTrader —, son risque et son multiple de R sont calculés automatiquement, et vos statistiques affichent votre R réalisé moyen à côté de vos résultats en argent." },
    ],
  },
  'prop-firm-daily-loss-and-drawdown': {
    title: 'Perte journalière et drawdown maximal : suivre les règles d\'une prop firm sans les enfreindre',
    description: 'Comment fonctionnent généralement les limites de perte journalière, le drawdown maximal et les objectifs de profit des prop firms, pourquoi la plupart des challenges sont perdus à cause d\'une règle plutôt que d\'un mauvais trade, et comment toujours connaître votre distance à la limite.',
    body: [
      { p: 'Les challenges de prop firm sont rarement perdus parce qu\'une stratégie cesse de fonctionner. Ils sont perdus un mardi après-midi, quand un trader, après trois pertes, ne réalise pas qu\'il n\'est plus qu\'à 180 dollars de la limite journalière. Les règles sont simples ; le difficile est de savoir exactement, trade après trade, où l\'on se situe par rapport à elles.' },
      { note: 'Chaque société formule ses règles à sa façon et les modifie avec le temps. Vérifiez toujours les règles actuelles de votre société — cet article présente les types de règles courants, pas une société en particulier.' },
      { h2: 'Les trois chiffres qui décident d\'un challenge' },
      { ul: [
        'Objectif de profit : le gain à atteindre, généralement un pourcentage du solde de départ.',
        'Limite de perte journalière : ce que vous pouvez perdre en une journée de trading. Les sociétés diffèrent sur le point de départ (solde ou equity du début de journée) et sur l\'heure de remise à zéro.',
        'Perte maximale (drawdown) : jusqu\'où le compte peut baisser au total. Elle peut être fixe (mesurée depuis le solde de départ) ou suiveuse (elle suit à la hausse votre plus haut solde ou equity).',
      ] },
      { h2: 'Drawdown fixe ou suiveur' },
      { p: 'Avec une limite fixe sur un compte de 100 000 dollars et une perte maximale de 10 %, le compte échoue sous 90 000, quoi qu\'il se soit passé avant. Avec une limite suiveuse, si le compte monte d\'abord à 105 000, le plancher monte avec lui, à 95 000 dans cet exemple. Les limites suiveuses pénalisent le fait de rendre ses gains : la distance à la limite peut donc diminuer même pendant une semaine gagnante.' },
      { h2: 'Pourquoi les challenges sont perdus à cause des règles' },
      { ul: [
        'Les pertes arrivent en série. Trois stops d\'affilée dans une session, c\'est normal, et avec 1 % de risque par trade plus les frais, cela suffit souvent à toucher la limite journalière.',
        'Les trades ouverts comptent. Avec des règles basées sur l\'equity, une perte latente peut franchir la limite avant qu\'aucun trade ne soit clôturé.',
        'Les frais et le swap comptent. La limite voit votre résultat net, pas le brut.',
        'Sous pression, le comportement change. Les trades de revanche et la taille qui grossit après une perte sont exactement ce qui transforme une mauvaise journée en challenge perdu.',
      ] },
      { h2: 'Une routine de protection simple' },
      { ol: [
        'Dimensionnez vos positions pour qu\'une série de pertes normale ne puisse pas atteindre la limite journalière — par exemple, pas plus d\'un tiers de la limite journalière en risque par trade.',
        'Avant chaque trade, vérifiez votre distance aux limites journalière et maximale.',
        'Fixez-vous un arrêt personnel bien avant celui de la société : si vous avez perdu la moitié de la limite journalière, arrêtez pour la journée.',
        'Analysez chaque journée où vous vous êtes approché de la limite. Le schéma se répète en général.',
      ] },
      { h2: 'Le suivi dans Simple Trading Journal' },
      { p: 'Marquez un journal comme compte prop, saisissez l\'objectif de profit, la limite de perte journalière et la perte maximale de la société : le journal vous montre en temps réel votre distance à chacun. Les limites de perte passent à l\'ambre puis au rouge à mesure que vous vous en approchez ; l\'objectif de profit vire au vert quand vous vous en rapprochez. L\'analyse de discipline signale les trades de revanche et la hausse du risque après des pertes — les habitudes qui mettent fin à la plupart des challenges.' },
    ],
  },
  // --- karşılaştırmalar (scripts: compare_gen) ---
  'tradezella-alternative': {
    "title": "Simple Trading Journal ou Tradezella : une comparaison honnête",
    "description": "Vous cherchez une alternative à Tradezella ? Prix, plan gratuit, essai et synchronisation MetaTrader côte à côte, et les points forts de chacun.",
    "body": [
      {
        "p": "Tradezella est l'un des journaux de trading les plus connus. Si vous cherchez une alternative moins chère, dans votre langue ou avec un plan gratuit, voici comment Simple Trading Journal se compare."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradezella"
          ],
          [
            "Prix mensuel",
            "$14.99",
            "$35 – $99"
          ],
          [
            "Prix annuel",
            "$119",
            "$315 – $891"
          ],
          [
            "Plan gratuit",
            "Oui — 2 trades par jour, sans limite de durée",
            "Non"
          ],
          [
            "Essai gratuit",
            "3 jours de Pro, sans carte",
            "Non indiqué sur sa page de tarifs"
          ],
          [
            "Synchro automatique MetaTrader",
            "MT4 et MT5",
            "MT4 et MT5"
          ],
          [
            "Connexion à MetaTrader",
            "Module dans MetaTrader + clé, sans partager de mot de passe",
            "Numéro de compte + mot de passe investisseur"
          ],
          [
            "Import",
            "Relevé MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, tout CSV",
            "Plus de 500 courtiers et prop firms"
          ]
        ]
      },
      {
        "note": "Les prix et fonctionnalités de Tradezella proviennent de ses propres pages de tarifs et d'aide en septembre 2026 et ont pu changer. Vérifiez sur son site avant de décider."
      },
      {
        "h2": "Là où Tradezella est plus fort"
      },
      {
        "ul": [
          "Beaucoup plus d'intégrations de courtiers et de prop firms — plus de 500 selon Tradezella.",
          "Plus d'ancienneté et davantage de fonctionnalités dans ses offres supérieures.",
          "Les comptes MT4 et MT5 se synchronisent sans rien installer dans MetaTrader."
        ]
      },
      {
        "h2": "Là où Simple Trading Journal est plus fort"
      },
      {
        "ul": [
          "Un plan gratuit sans limite de durée (2 trades par jour) et 3 jours de Pro sans carte.",
          "Pro coûte $14.99 par mois ou $119 par an — l'option la moins chère de Tradezella est à $35 par mois.",
          "Toute l'application en 9 langues, dont le français, le turc, le persan et l'arabe.",
          "MetaTrader 4 et 5 se connectent par un petit module et une clé ; vous ne partagez jamais votre mot de passe investisseur.",
          "Analyse de discipline intégrée (trades de revanche, risque en hausse après des pertes, surtrading, trading hors horaires) et suivi des limites de prop firm."
        ]
      },
      {
        "h2": "Lequel choisir ?"
      },
      {
        "p": "Si vous avez besoin d'un très large choix d'intégrations de courtiers ou de ses outils plus avancés, Tradezella vous conviendra peut-être mieux. Si vous tradez sur MetaTrader, voulez un journal dans votre langue et préférez commencer gratuitement, essayez Simple Trading Journal — le plan gratuit ne demande pas de carte."
      }
    ]
  },
  'tradersync-alternative': {
    "title": "Simple Trading Journal ou TraderSync : une comparaison honnête",
    "description": "Vous cherchez une alternative à TraderSync ? Prix, plan gratuit, essai et synchronisation MetaTrader côte à côte, et les points forts de chacun.",
    "body": [
      {
        "p": "TraderSync est l'un des journaux de trading les plus connus. Si vous cherchez une alternative moins chère, dans votre langue ou avec un plan gratuit, voici comment Simple Trading Journal se compare."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TraderSync"
          ],
          [
            "Prix mensuel",
            "$14.99",
            "$29.95 – $79.95"
          ],
          [
            "Prix annuel",
            "$119",
            "$269.52 – $719.52"
          ],
          [
            "Plan gratuit",
            "Oui — 2 trades par jour, sans limite de durée",
            "Non"
          ],
          [
            "Essai gratuit",
            "3 jours de Pro, sans carte",
            "7 jours, sans carte"
          ],
          [
            "Synchro automatique MetaTrader",
            "MT4 et MT5",
            "MT4 et MT5"
          ],
          [
            "Import",
            "Relevé MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, tout CSV",
            "Plus de 200 courtiers et plateformes"
          ]
        ]
      },
      {
        "note": "Les prix et fonctionnalités de TraderSync proviennent de ses propres pages de tarifs et d'aide en septembre 2026 et ont pu changer. Vérifiez sur son site avant de décider."
      },
      {
        "h2": "Là où TraderSync est plus fort"
      },
      {
        "ul": [
          "Plus de 200 courtiers et plateformes pris en charge.",
          "Un assistant IA (Cypher) et le replay des trades dans ses offres supérieures.",
          "Un essai de 7 jours avec toutes les fonctionnalités, sans carte."
        ]
      },
      {
        "h2": "Là où Simple Trading Journal est plus fort"
      },
      {
        "ul": [
          "Un plan gratuit sans limite de durée (2 trades par jour) et 3 jours de Pro sans carte.",
          "Pro coûte $14.99 par mois ou $119 par an — l'option la moins chère de TraderSync est à $29.95 par mois.",
          "Toute l'application en 9 langues, dont le français, le turc, le persan et l'arabe.",
          "MetaTrader 4 et 5 se connectent par un petit module et une clé ; vous ne partagez jamais votre mot de passe investisseur.",
          "Analyse de discipline intégrée (trades de revanche, risque en hausse après des pertes, surtrading, trading hors horaires) et suivi des limites de prop firm."
        ]
      },
      {
        "h2": "Lequel choisir ?"
      },
      {
        "p": "Si vous avez besoin d'un très large choix d'intégrations de courtiers ou de ses outils plus avancés, TraderSync vous conviendra peut-être mieux. Si vous tradez sur MetaTrader, voulez un journal dans votre langue et préférez commencer gratuitement, essayez Simple Trading Journal — le plan gratuit ne demande pas de carte."
      }
    ]
  },
  'edgewonk-alternative': {
    "title": "Simple Trading Journal ou Edgewonk : une comparaison honnête",
    "description": "Vous cherchez une alternative à Edgewonk ? Prix, plan gratuit, essai et synchronisation MetaTrader côte à côte, et les points forts de chacun.",
    "body": [
      {
        "p": "Edgewonk est l'un des journaux de trading les plus connus. Si vous cherchez une alternative moins chère, dans votre langue ou avec un plan gratuit, voici comment Simple Trading Journal se compare."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Edgewonk"
          ],
          [
            "Prix mensuel",
            "$14.99",
            "— (annuel uniquement)"
          ],
          [
            "Prix annuel",
            "$119",
            "$197"
          ],
          [
            "Plan gratuit",
            "Oui — 2 trades par jour, sans limite de durée",
            "Non"
          ],
          [
            "Essai gratuit",
            "3 jours de Pro, sans carte",
            "Non — satisfait ou remboursé 14 jours"
          ],
          [
            "Synchro automatique MetaTrader",
            "MT4 et MT5",
            "MT4 et MT5"
          ],
          [
            "Connexion à MetaTrader",
            "Module dans MetaTrader + clé, sans partager de mot de passe",
            "Publication des rapports MetaTrader par FTP"
          ],
          [
            "Import",
            "Relevé MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, tout CSV",
            "Nombreuses plateformes (voir sa page d'import)"
          ]
        ]
      },
      {
        "note": "Les prix et fonctionnalités de Edgewonk proviennent de ses propres pages de tarifs et d'aide en septembre 2026 et ont pu changer. Vérifiez sur son site avant de décider."
      },
      {
        "h2": "Là où Edgewonk est plus fort"
      },
      {
        "ul": [
          "Un journal de longue date avec une seule offre qui inclut toutes les fonctionnalités.",
          "Une garantie satisfait ou remboursé de 14 jours.",
          "Synchro automatique MT4 et MT5 via la publication de rapports propre à MetaTrader."
        ]
      },
      {
        "h2": "Là où Simple Trading Journal est plus fort"
      },
      {
        "ul": [
          "Un plan gratuit sans limite de durée (2 trades par jour) et 3 jours de Pro sans carte.",
          "Pro coûte $14.99 par mois ou $119 par an — l'option la moins chère de Edgewonk est à $197 par an.",
          "Toute l'application en 9 langues, dont le français, le turc, le persan et l'arabe.",
          "MetaTrader 4 et 5 se connectent par un petit module et une clé ; vous ne partagez jamais votre mot de passe investisseur.",
          "Analyse de discipline intégrée (trades de revanche, risque en hausse après des pertes, surtrading, trading hors horaires) et suivi des limites de prop firm."
        ]
      },
      {
        "h2": "Lequel choisir ?"
      },
      {
        "p": "Si vous avez besoin d'un très large choix d'intégrations de courtiers ou de ses outils plus avancés, Edgewonk vous conviendra peut-être mieux. Si vous tradez sur MetaTrader, voulez un journal dans votre langue et préférez commencer gratuitement, essayez Simple Trading Journal — le plan gratuit ne demande pas de carte."
      }
    ]
  },
};

export default TEXT;
