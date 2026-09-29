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
        "« Clé liée à un autre compte » : la clé appartient déjà à un autre compte de trading. Créez une nouvelle clé pour ce compte.", "Les trades arrivent dans le mauvais journal : la ligne « Journal: » du graphique indique où ils partent. Si elle affiche un autre journal, le module utilise encore une ancienne clé. Ouvrez Inputs, videz entièrement ApiKey, collez la nouvelle clé, appuyez sur Entrée puis sur OK. L'ancienne clé se ferme d'elle-même dès que la nouvelle se connecte.", "Sur MetaTrader 4, le module est grisé et ne se glisse pas : utilisez le fichier SimpleTradingJournal.ex4 téléchargé depuis l'écran MetaTrader, puis faites un clic droit sur Expert Advisors dans le panneau Navigator et choisissez Refresh.",
        "J'ai perdu la clé : MetaTrader la mémorise. Si elle est vraiment perdue, créez-en une nouvelle dans l'application ; l'ancienne se ferme d'elle-même dès que la nouvelle se connecte.",
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
  "pre-trade-checklist": {
    "title": "La checklist avant un trade : comment en écrire une que vous utiliserez vraiment",
    "description": "Pourquoi une courte checklist avant d'entrer réduit les trades impulsifs, comment écrire des règles auxquelles on répond par oui ou non, et comment vérifier que votre checklist fonctionne.",
    "body": [
      {
        "p": "La plupart des mauvais trades ne viennent pas d'une mauvaise analyse. Ce sont des trades pris alors que le setup n'était qu'à moitié là — un niveau presque atteint, un signal presque confirmé — parce que rester les bras croisés semblait pire qu'agir. Une checklist vous permet de prendre cette décision avant que le moment n'arrive."
      },
      {
        "h2": "À quoi sert une checklist"
      },
      {
        "p": "Une checklist ne trouve pas de trades à votre place. Elle filtre ceux que vous voulez déjà prendre, pour ne laisser passer que ceux qui correspondent à votre plan. Les pilotes et les chirurgiens s'en servent pour la même raison : sous pression, on saute des étapes que l'on connaît par cœur."
      },
      {
        "h2": "Des règles auxquelles on répond par oui ou non"
      },
      {
        "p": "Chaque point doit être une question qui a une réponse claire au moment de l'entrée. « La tendance est-elle haussière ? » laisse place à l'interprétation ; « Le prix est-il au-dessus de la moyenne mobile 200 périodes sur le graphique 4 heures ? » non."
      },
      {
        "ul": [
          "Contexte : la direction de l'unité de temps supérieure est-elle la même que celle de mon trade ?",
          "Emplacement : l'entrée se fait-elle sur un niveau marqué avant la séance, et non sur un niveau trouvé après que le prix a bougé ?",
          "Déclencheur : mon signal d'entrée a-t-il vraiment clôturé, ou commence-t-il seulement à se former ?",
          "Risque : le stop est-il là où l'idée devient fausse, et la taille reste-t-elle dans mon risque par trade ?",
          "Calendrier : aucune annonce à fort impact n'est-elle prévue dans les 30 prochaines minutes ?"
        ]
      },
      {
        "h2": "Restez court"
      },
      {
        "p": "Trois à sept points suffisent. Une liste de quinze est survolée, puis ignorée. Si un point ne change jamais une décision, retirez-le ; si la même erreur revient sans cesse, faites-en un point."
      },
      {
        "h2": "Une liste par stratégie"
      },
      {
        "p": "Si vous tradez deux setups différents — une cassure et un pullback, par exemple —, ils demandent des conditions différentes. Les réunir dans une seule liste rend la moitié des points inutiles à chaque trade, et cocher des cases inutiles devient vite l'habitude de cocher sans lire."
      },
      {
        "h2": "Vérifiez qu'elle fonctionne"
      },
      {
        "p": "Une checklist est une hypothèse. Après 20 à 30 trades, comparez ceux où tous les points étaient cochés avec ceux que vous avez pris quand même. Si les trades entièrement cochés ne font pas mieux, ce sont les mauvais points : changez-les plutôt que d'abandonner l'idée."
      },
      {
        "h2": "Dans Simple Trading Journal"
      },
      {
        "p": "Vous pouvez tenir plusieurs checklists nommées, une par stratégie, choisir celle qu'utilise chaque journal et cocher les points sur chaque trade. Les trades qui arrivent de MetaTrader reçoivent aussi la checklist du journal, que vous remplissez en ajoutant vos notes."
      }
    ]
  },
  "trading-emotions-journal": {
    "title": "Noter ses émotions dans son journal de trading : quoi enregistrer et comment s'en servir",
    "description": "Comment étiqueter l'état émotionnel derrière chaque trade, quelles émotions précèdent souvent les erreurs, et comment transformer ces étiquettes en règles plutôt qu'en regrets.",
    "body": [
      {
        "p": "Les traders connaissent généralement leurs erreurs. Après coup, ils vous diront qu'ils ont couru après un mouvement de peur de le manquer, ou doublé la taille pour se refaire d'une perte. Ce qu'ils ont rarement, c'est une trace de la fréquence à laquelle cela arrive et de ce que cela coûte. Étiqueter l'émotion de chaque trade transforme une impression vague en quelque chose que l'on peut compter."
      },
      {
        "h2": "Notez-la sur le moment"
      },
      {
        "p": "Notez l'émotion à l'entrée ou juste après la clôture, pas en fin de semaine. La mémoire réécrit les trades : un trade de revanche qui a gagné par chance devient « une bonne lecture », et la peur derrière une sortie anticipée est oubliée."
      },
      {
        "h2": "Une liste courte et fixe"
      },
      {
        "p": "Choisissez toujours parmi les mêmes mots, pour que les trades soient comparables. Une liste utile sépare les états qui aident de ceux qui ont tendance à nuire :"
      },
      {
        "ul": [
          "Utiles : calme, concentré, confiant.",
          "Signaux d'alerte : trop confiant, FOMO, craintif, impatient.",
          "Signaux d'arrêt : en colère, revanche, fatigué."
        ]
      },
      {
        "p": "Un trade peut en avoir plusieurs. Être à la fois fatigué et impatient est fréquent, et c'est bon à savoir."
      },
      {
        "h2": "Cherchez des tendances, pas des trades isolés"
      },
      {
        "p": "Un seul trade FOMO perdant ne dit pas grand-chose. Vingt, mis à côté du reste de vos trades, en disent beaucoup. Au bout d'un mois, regroupez vos trades par émotion et comparez les résultats en R : beaucoup de traders découvrent que l'essentiel de leurs pertes se concentre sous deux ou trois étiquettes."
      },
      {
        "h2": "Transformez la tendance en règle"
      },
      {
        "p": "Le but n'est pas de ne plus rien ressentir, mais de décider à l'avance de ce que vous faites quand vous le remarquez. Si la revanche est votre étiquette la plus coûteuse, une règle comme « après deux pertes d'affilée, j'arrête pour la journée » fera plus que n'importe quelle volonté. Inscrivez la règle dans votre checklist pour la rencontrer avant la prochaine entrée, pas après."
      },
      {
        "h2": "Dans Simple Trading Journal"
      },
      {
        "p": "Chaque trade dispose d'un sélecteur d'émotions avec douze états courants — les utiles et les signaux d'alerte dans des couleurs différentes — et vous pouvez ajouter vos propres mots. Les étiquettes s'affichent sur le trade et sont incluses lorsque vous exportez vos trades vers Excel, pour les trier et les comparer."
      }
    ]
  },
  "position-sizing-risk-per-trade": {
    "title": "Taille de position : combien risquer par trade et comment calculer le lot",
    "description": "Comment choisir un risque fixe par trade, le convertir en taille de lot à partir de la distance du stop, et vérifier dans votre journal que vous le respectez vraiment.",
    "body": [
      {
        "p": "Deux traders peuvent prendre le même trade au même prix avec le même stop et finir avec des comptes très différents. La différence, c'est la taille. La taille de position décide combien vous coûte une perte, et donc combien de pertes d'affilée vous pouvez encaisser pendant que votre avantage se manifeste."
      },
      {
        "h2": "Partir du risque, pas des lots"
      },
      {
        "p": "Beaucoup de traders choisissent d'abord le lot — « je trade 1 lot » — et laissent le stop décider de ce qu'ils perdent. Chaque perte a alors une taille différente. Inversez : décidez quelle part du compte vous acceptez de perdre si le stop est touché, puis calculez la taille qui le garantit."
      },
      {
        "h2": "Choisir le risque par trade"
      },
      {
        "p": "Un pourcentage fixe du compte — souvent entre 0,5 % et 2 % — est le point de départ habituel. Le chiffre compte moins que sa constance. Avec 1 % de risque, dix pertes d'affilée coûtent environ 10 % du compte ; avec 5 %, la même série coûte près de 40 %, et chaque trade suivant doit travailler beaucoup plus pour le récupérer."
      },
      {
        "p": "Sur un compte de prop firm, dimensionnez aussi selon ses limites : si la perte journalière maximale est de 5 %, un risque de 2 % par trade ne laisse de place qu'à deux pertes complètes dans la journée."
      },
      {
        "h2": "Le calcul"
      },
      {
        "code": "Taille de position = Montant risqué ÷ (Distance du stop × Valeur du point)"
      },
      {
        "p": "Exemple : un compte de 10 000 $ qui risque 1 % a 100 $ à perdre. Le stop sur EURUSD est à 25 pips, et un lot standard vaut environ 10 $ par pip. 100 $ ÷ (25 × 10 $) = 0,4 lot. Si le stop est à 50 pips, la taille est divisée par deux, 0,2 lot — le risque reste 100 $."
      },
      {
        "p": "La valeur du point dépend de l'instrument et du courtier (l'or, les indices et la crypto sont cotés différemment) : consultez une fois la spécification du contrat dans votre plateforme et notez-la."
      },
      {
        "h2": "Erreurs courantes"
      },
      {
        "ul": [
          "Éloigner le stop après l'entrée sans réduire la taille — le risque grossit sans bruit.",
          "Augmenter la taille après une perte pour la rattraper plus vite.",
          "Arrondir le lot vers le haut à chaque fois : 0,37 devient 0,4, puis 0,5.",
          "Oublier le spread et la commission, qui rendent la perte réelle un peu plus grande que prévu."
        ]
      },
      {
        "h2": "Vérifiez dans votre journal"
      },
      {
        "p": "Notez le risque prévu sur chaque trade. Après quelques semaines, regardez les trades perdants : si certains ont perdu deux ou trois fois le montant habituel, votre taille n'est pas aussi fixe que vous le pensez. Lire les résultats en R (gain ou perte divisé par le risque prévu) fait ressortir ces cas immédiatement."
      },
      {
        "h2": "Dans Simple Trading Journal"
      },
      {
        "p": "Chaque trade a un champ de risque et les résultats peuvent se lire en R. Vous pouvez ajouter à vos objectifs un risque maximal par trade, et la vue discipline signale les trades où, juste après une perte, le risque a dépassé 1,5 fois celui du trade précédent."
      }
    ]
  },
  "revenge-trading": {
    "title": "Revenge trading : le repérer dans votre journal et l'arrêter",
    "description": "À quoi ressemble le revenge trading dans les données, pourquoi il coûte si cher, et des règles pratiques pour que le trade qui suit une perte ne soit pas émotionnel.",
    "body": [
      {
        "p": "Une perte se clôture et, quelques minutes plus tard, vous êtes de retour sur le marché — souvent sur le même instrument, parfois avec une taille plus grosse — pour la rattraper. C'est le revenge trading, le trading de vengeance. Presque tous les traders l'ont fait ; la question est de savoir à quelle fréquence, et ce que cela coûte."
      },
      {
        "h2": "Pourquoi cela coûte si cher"
      },
      {
        "p": "Le trade qui suit une perte est généralement pris pour une autre raison que votre plan : réparer une émotion. Le setup est plus faible, l'entrée précipitée, et la taille a tendance à grossir. Une seule mauvaise journée peut effacer des semaines de trading soigné."
      },
      {
        "h2": "À quoi cela ressemble dans les données"
      },
      {
        "ul": [
          "Un nouveau trade ouvert quelques minutes après la clôture d'un trade perdant.",
          "Le risque de ce trade est nettement plus élevé que celui du précédent.",
          "Plusieurs trades rapprochés un jour qui a commencé par une perte.",
          "Des trades en dehors des heures où vous tradez habituellement."
        ]
      },
      {
        "p": "Nul besoin de vous souvenir de ce que vous ressentiez pour trouver ces trades. Les heures, les tailles et les résultats sont déjà dans votre journal."
      },
      {
        "h2": "Mesurez-le"
      },
      {
        "p": "Séparez les trades qui correspondent à ces schémas du reste et comparez les résultats. Si le groupe signalé perd de l'argent alors que le reste de votre trading est à peu près à l'équilibre ou positif, vous avez trouvé ce qu'il y a de plus précieux à corriger — et c'est une règle, pas une stratégie."
      },
      {
        "h2": "Des règles qui aident"
      },
      {
        "ul": [
          "Temps de pause : après une perte, pas de nouveau trade pendant 15 à 30 minutes.",
          "Stop journalier : après deux pertes d'affilée ou un montant perdu fixé, la journée est finie.",
          "La taille n'augmente jamais après une perte ; si elle change, elle baisse.",
          "Avant le trade suivant, reprenez votre checklist depuis le début."
        ]
      },
      {
        "p": "Écrivez la règle avant la séance. Décider sur le moment, c'est précisément ce qui ne marche pas."
      },
      {
        "h2": "Dans Simple Trading Journal"
      },
      {
        "p": "La vue discipline lit vos trades existants et signale un trade ouvert dans les 15 minutes suivant une perte, un risque supérieur à 1,5 fois celui du trade précédent après une perte, les jours avec beaucoup plus de trades que d'habitude et les trades hors de vos horaires habituels. Elle montre ensuite ce que ces trades ont coûté par rapport au reste. Les trades qui arrivent de MetaTrader sont inclus automatiquement."
      }
    ]
  },
  "expectancy-and-profit-factor": {
    "title": "Espérance et profit factor : les deux chiffres qui montrent si votre trading fonctionne",
    "description": "Ce que signifient l'espérance (expectancy) et le profit factor, comment les calculer à partir de vos propres trades, et pourquoi un taux de réussite élevé en dit peu à lui seul.",
    "body": [
      {
        "p": "Le taux de réussite est le chiffre que les traders citent le plus, et à lui seul le moins utile. Une stratégie qui gagne 80 % du temps peut perdre de l'argent, et une qui gagne 35 % peut être solide. Deux chiffres répondent à la vraie question — est-ce que cela rapporte sur un grand nombre de trades ? — : l'espérance et le profit factor."
      },
      {
        "h2": "L'espérance"
      },
      {
        "p": "L'espérance est le résultat moyen par trade sur un grand nombre de trades."
      },
      {
        "code": "Espérance = (Taux de réussite × Gain moyen) − (Taux d'échec × Perte moyenne)"
      },
      {
        "p": "Exemple : vous gagnez 40 % de vos trades, le gain moyen est de 300 $ et la perte moyenne de 150 $. 0,40 × 300 − 0,60 × 150 = 120 − 90 = 30 $. En moyenne, chaque trade a rapporté 30 $. Un chiffre positif signifie que l'approche a fonctionné sur ces trades ; un chiffre négatif, qu'elle n'a pas fonctionné, aussi bonnes qu'aient paru certaines journées."
      },
      {
        "p": "Exprimée en R plutôt qu'en argent — gain et perte moyens divisés par votre risque habituel —, l'espérance se compare d'une taille de compte à l'autre et d'une période à l'autre."
      },
      {
        "h2": "Le profit factor"
      },
      {
        "code": "Profit factor = Gains bruts ÷ Pertes brutes"
      },
      {
        "p": "Avec les mêmes chiffres sur 100 trades : 40 × 300 $ = 12 000 $ gagnés, 60 × 150 $ = 9 000 $ perdus, soit un profit factor de 1,33. Au-dessus de 1, les gagnants l'emportent sur les perdants ; en dessous, non. Il se lit vite, mais ne dit pas combien de trades il a fallu pour y arriver."
      },
      {
        "h2": "Pourquoi le taux de réussite trompe"
      },
      {
        "p": "Un taux de réussite élevé vient souvent de prises de bénéfices trop rapides et de pertes qu'on laisse courir. Dix gains de 50 $ et une perte de 600 $, c'est 91 % de réussite et 100 $ de perte nette. L'espérance le montre tout de suite ; le taux de réussite le cache."
      },
      {
        "h2": "Combien de trades suffisent ?"
      },
      {
        "p": "Sur un petit échantillon, ces chiffres bougent beaucoup. Vingt trades peuvent sembler excellents ou désastreux par hasard. Regardez-les sur au moins 30 à 50 trades, et comparez-les par setup plutôt que pour tout le compte mélangé."
      },
      {
        "h2": "Dans Simple Trading Journal"
      },
      {
        "p": "La page de statistiques affiche l'espérance, le profit factor, le ratio gain/perte, le gain et la perte moyens et le taux de réussite, calculés sur vos trades clôturés — y compris ceux qui arrivent de MetaTrader ou sont importés d'un relevé. Le tableau de performance par setup montre le taux de réussite et le résultat net de chacun, pour voir lequel porte vos résultats."
      }
    ]
  },
  "overtrading": {
    "title": "Surtrading : comment savoir si vous tradez trop",
    "description": "Ce qu'est le surtrading (overtrading), comment il apparaît dans vos propres données, pourquoi les trades en trop coûtent généralement de l'argent et des limites simples pour garder le nombre de trades sous contrôle.",
    "body": [
      {
        "p": "Le surtrading consiste à prendre plus de trades que votre plan ne le prévoit : des entrées qui arrivent parce que vous êtes devant l'écran, pas parce que votre setup est apparu. Sur le moment, cela ressemble rarement à une erreur. Chaque trade paraît raisonnable pris isolément ; le problème n'apparaît que lorsque vous les comptez."
      },
      {
        "h2": "Pourquoi les trades en trop coûtent de l'argent"
      },
      {
        "p": "Les bons setups sont limités ; le marché ne les offre pas toutes les heures. Quand le nombre de trades augmente, ceux en trop sont généralement plus faibles : setups presque formés, entrées au milieu d'un range, trades aux heures calmes. Chaque trade a aussi un coût — spread, commission, swap — qui s'accumule plus vite que la plupart des traders ne le pensent."
      },
      {
        "h2": "Causes fréquentes"
      },
      {
        "ul": [
          "Vouloir récupérer une perte (revenge trading).",
          "L'ennui un jour calme, ou l'impression qu'une journée sans trade est une journée perdue.",
          "Un objectif de gain quotidien qui pousse à continuer jusqu'à l'atteindre.",
          "Passer à une unité de temps plus petite, où les setups apparaissent plus souvent mais veulent dire moins.",
          "Continuer après un gros gain, quand la confiance est au plus haut."
        ]
      },
      {
        "h2": "Comment le repérer dans votre journal"
      },
      {
        "ul": [
          "Des journées avec beaucoup plus de trades qu'une journée habituelle.",
          "Les résultats selon le rang du trade dans la journée : vos quatrième et cinquième trades sont-ils moins bons que les deux premiers ?",
          "Des trades sans setup, ou avec un setup que vous n'utilisez qu'occasionnellement.",
          "Beaucoup de trades courts à la suite sur le même instrument."
        ]
      },
      {
        "p": "La comparaison utile est simple : prenez vos journées les plus chargées et comparez leur résultat net et leur taux de réussite à ceux de vos journées normales. Si les journées chargées sont nettement moins bonnes, le nombre de trades fait partie du problème."
      },
      {
        "h2": "Des limites qui aident"
      },
      {
        "ul": [
          "Un nombre maximal de trades par jour, écrit avant la séance — par exemple votre nombre habituel plus un.",
          "Un arrêt après un nombre fixe de pertes, quel que soit le nombre de trades.",
          "Seuls les setups de votre checklist comptent ; le reste n'est pas un trade.",
          "Une plage horaire fixe ; en dehors, aucune nouvelle entrée."
        ]
      },
      {
        "p": "Une limite ne fonctionne que si elle est fixée à l'avance. Au cinquième trade de la journée, l'argument pour un sixième paraîtra toujours convaincant."
      },
      {
        "h2": "Dans Simple Trading Journal"
      },
      {
        "p": "La vue discipline calcule votre nombre habituel de trades par jour à partir de votre propre historique et signale les journées qui en comptent plus du double (et au moins quatre trades). Il lui faut au moins cinq jours de trading pour juger, et elle montre ce qu'ont coûté les trades de ces journées par rapport aux autres. Le calendrier affiche le nombre de trades et le résultat de chaque jour, et les trades venus de MetaTrader sont inclus automatiquement."
      }
    ]
  },
  "tradervue-alternative": {
    "title": "Simple Trading Journal ou Tradervue : une comparaison honnête",
    "description": "Vous cherchez une alternative à Tradervue ? Prix, plan gratuit, essai et prise en charge de MetaTrader côte à côte, et les points forts de chacun.",
    "body": [
      {
        "p": "Tradervue est l'un des plus anciens journaux de trading, apprécié des traders d'actions, d'options et de futures américains. Si vous cherchez une alternative moins chère, dans votre langue ou avec une synchro automatique MetaTrader, voici comment Simple Trading Journal se compare."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradervue"
          ],
          [
            "Prix mensuel",
            "$14.99",
            "$29.95 – $49.95"
          ],
          [
            "Prix annuel",
            "$119",
            "Non indiqué sur sa page de tarifs"
          ],
          [
            "Plan gratuit",
            "Oui — 2 trades par jour, sans limite de durée",
            "Oui — 30 trades importés par mois"
          ],
          [
            "Essai gratuit",
            "3 jours de Pro, sans carte",
            "7 jours de Silver ou Gold ; la carte est débitée à la fin, sauf passage au plan gratuit"
          ],
          [
            "Synchro automatique MetaTrader",
            "MT4 et MT5",
            "Non — MT4 et MT5 en téléversant un fichier de rapport"
          ],
          [
            "Connexion à MetaTrader",
            "Module dans MetaTrader + clé, sans partager de mot de passe",
            "Enregistrer un rapport HTML dans MetaTrader et le téléverser"
          ],
          [
            "Import",
            "Relevé MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, tout CSV",
            "Une longue liste de courtiers et plateformes ; synchro avec certains courtiers"
          ]
        ]
      },
      {
        "note": "Les prix et fonctionnalités de Tradervue proviennent de ses propres pages de tarifs, de plateformes et d'aide en septembre 2026 et ont pu changer. Vérifiez sur son site avant de décider."
      },
      {
        "h2": "Là où Tradervue est plus fort"
      },
      {
        "ul": [
          "Une prise en charge poussée des actions, options et futures américains, avec de nombreux courtiers et plateformes américains.",
          "Des rapports détaillés et, dans l'offre supérieure, l'analyse des sorties et les statistiques MFE/MAE.",
          "Le mentorat et le partage de trades avec sa communauté.",
          "Un très long historique."
        ]
      },
      {
        "h2": "Là où Simple Trading Journal est plus fort"
      },
      {
        "ul": [
          "Les trades MetaTrader 4 et 5 arrivent seuls pendant que vous tradez — pas de rapport à exporter et téléverser à chaque fois.",
          "Pro coûte $14.99 par mois ou $119 par an — les offres payantes de Tradervue commencent à $29.95 par mois.",
          "Un essai Pro de 3 jours sans carte.",
          "Toute l'application en 9 langues, dont le turc, le persan et l'arabe.",
          "Analyse de discipline intégrée (trades de revanche, risque en hausse après une perte, surtrading, trades hors de vos horaires) et suivi des limites des prop firms."
        ]
      },
      {
        "h2": "Lequel choisir ?"
      },
      {
        "p": "Si vous tradez des actions, options ou futures américains via un courtier américain, Tradervue est conçu exactement pour cela. Si vous tradez le forex, les indices ou l'or sur MetaTrader, voulez que vos trades s'enregistrent seuls et préférez commencer gratuitement, essayez Simple Trading Journal — le plan gratuit ne demande pas de carte."
      }
    ]
  },
  "tradesviz-alternative": {
    "title": "Simple Trading Journal ou TradesViz : une comparaison honnête",
    "description": "Vous cherchez une alternative à TradesViz ? Prix, plan gratuit, essai et synchronisation MetaTrader côte à côte, et les points forts de chacun.",
    "body": [
      {
        "p": "TradesViz est un journal de trading doté d'un très large ensemble de statistiques, graphiques, simulateurs et outils d'IA. Si vous cherchez une alternative plus simple, moins chère à l'année, dans votre langue ou gratuite pour le forex, voici comment Simple Trading Journal se compare."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TradesViz"
          ],
          [
            "Prix mensuel",
            "$14.99",
            "$19.99 – $29.99"
          ],
          [
            "Prix annuel",
            "$119",
            "$179.88 – $269.88"
          ],
          [
            "Plan gratuit",
            "Oui — 2 trades par jour, sans limite de durée, tous les instruments",
            "Oui — actions uniquement, 3 000 exécutions par mois"
          ],
          [
            "Essai gratuit",
            "3 jours de Pro, sans carte",
            "7 jours de Pro ou Platinum"
          ],
          [
            "Synchro automatique MetaTrader",
            "MT4 et MT5",
            "MT4 et MT5 (offres payantes ; le plan gratuit est limité aux actions)"
          ],
          [
            "Connexion à MetaTrader",
            "Module dans MetaTrader + clé, sans partager de mot de passe",
            "Numéro de compte + mot de passe investisseur, ou publication des rapports MetaTrader par FTP"
          ],
          [
            "Import",
            "Relevé MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, tout CSV",
            "Plus de 250 courtiers et plateformes, plus de 70 connexions en synchro automatique"
          ]
        ]
      },
      {
        "note": "Les prix et fonctionnalités de TradesViz proviennent de ses propres pages de tarifs, de courtiers et de blog en septembre 2026 et ont pu changer. Vérifiez sur son site avant de décider."
      },
      {
        "h2": "Là où TradesViz est plus fort"
      },
      {
        "ul": [
          "Un ensemble bien plus large de statistiques et de graphiques — plus de 600, selon TradesViz.",
          "Des simulateurs de trading, la relecture des trades, des outils pour les options et un screener d'actions.",
          "Des outils d'IA qui répondent à vos questions sur vos trades.",
          "Beaucoup plus d'intégrations de courtiers, y compris actions, options, futures et cryptomonnaies."
        ]
      },
      {
        "h2": "Là où Simple Trading Journal est plus fort"
      },
      {
        "ul": [
          "Le plan gratuit couvre le forex, les indices, l'or et tous les autres instruments — celui de TradesViz se limite aux actions.",
          "Pro coûte $119 par an — l'offre annuelle la moins chère de TradesViz coûte $179.88.",
          "MetaTrader 4 et 5 se connectent via un petit module et une clé ; vous ne partagez jamais votre mot de passe investisseur.",
          "Une application plus simple, avec moins d'écrans à apprendre.",
          "Toute l'application en 9 langues, dont le turc, le persan et l'arabe."
        ]
      },
      {
        "h2": "Lequel choisir ?"
      },
      {
        "p": "Si vous voulez l'analyse la plus poussée possible, des simulateurs et des outils d'IA et que vous allez vraiment les utiliser, TradesViz en offre davantage. Si vous tradez le forex ou les CFD sur MetaTrader et voulez un journal clair dans votre langue, que vous pouvez commencer gratuitement, essayez Simple Trading Journal — le plan gratuit ne demande pas de carte."
      }
    ]
  },
  "fx-replay-alternative": {
    "title": "Simple Trading Journal ou FX Replay : à quoi sert chacun",
    "description": "FX Replay ou Simple Trading Journal ? L'un est une plateforme de backtest, l'autre un journal de vos trades réels. Prix, plans gratuits et prise en charge de MetaTrader comparés.",
    "body": [
      {
        "p": "FX Replay est avant tout une plateforme de backtest : vous rejouez des graphiques historiques et vous vous entraînez à trader dessus, avec un journal inclus. Simple Trading Journal est un journal des trades que vous prenez réellement sur votre compte. Ils se recoupent moins qu'il n'y paraît — voici la comparaison."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "FX Replay"
          ],
          [
            "Usage principal",
            "Suivi et analyse de vos trades réels",
            "Backtest sur graphiques historiques, avec journal"
          ],
          [
            "Prix mensuel",
            "$14.99",
            "$17.99 – $35"
          ],
          [
            "Prix annuel",
            "$119",
            "$180 – $350"
          ],
          [
            "Plan gratuit",
            "Oui — 2 trades par jour, sans limite de durée",
            "Oui — 2 sessions de backtest, 1 indicateur, données conservées 1 semaine"
          ],
          [
            "Essai gratuit",
            "3 jours de Pro, sans carte",
            "Oui, sans carte (durée non précisée)"
          ],
          [
            "MetaTrader",
            "Synchro automatique MT4 et MT5 avec module + clé",
            "MT4 et MT5 par téléversement de fichier"
          ],
          [
            "Import",
            "Relevé MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, tout CSV",
            "Tout CSV ; fichiers NinjaTrader, Tradovate et MT4/MT5"
          ]
        ]
      },
      {
        "note": "Les prix et fonctionnalités de FX Replay proviennent de ses propres pages de tarifs et de journal en septembre 2026 et ont pu changer. Vérifiez sur son site avant de décider."
      },
      {
        "h2": "Là où FX Replay est plus fort"
      },
      {
        "ul": [
          "Le backtest : rejouer les prix passés bougie par bougie, avec des données à la seconde dans l'offre Pro.",
          "Un simulateur de challenge de prop firm pour s'entraîner selon ses règles.",
          "Tester une stratégie sur un large échantillon avant de risquer de l'argent.",
          "Une communauté active sur Discord."
        ]
      },
      {
        "h2": "Là où Simple Trading Journal est plus fort"
      },
      {
        "ul": [
          "Vos trades réels sur MetaTrader 4 et 5 s'enregistrent automatiquement pendant que vous tradez.",
          "Pro coûte $14.99 par mois ou $119 par an.",
          "Analyse de discipline sur les trades réels : revanche, risque en hausse après une perte, surtrading, trades hors de vos horaires.",
          "Suivi des limites de la prop firm sur votre vrai compte de challenge.",
          "Toute l'application en 9 langues, dont le turc, le persan et l'arabe."
        ]
      },
      {
        "h2": "Lequel choisir ?"
      },
      {
        "p": "Ils ne font pas le même travail. Pour tester une stratégie sur des données passées, FX Replay est conçu pour cela. Pour enregistrer et analyser les trades que vous prenez réellement — surtout sur MetaTrader —, utilisez Simple Trading Journal. Beaucoup de traders utilisent un outil de backtest et un journal côte à côte ; ici, le plan gratuit ne demande pas de carte."
      }
    ]
  },
};

export default TEXT;
