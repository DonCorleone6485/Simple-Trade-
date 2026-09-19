import { PropPack } from './core';

/** Texte français. L'ordre des options suit le tableau points de core.ts. */
const fr: PropPack = {
  drawdown: {
    title: 'Type de ligne de perte maximale (Drawdown)',
    short: 'La ligne de mort du compte : passez en dessous et tout s\'arrête. La question est de savoir si cette ligne reste fixe dès le départ ou si elle monte à mesure que vous gagnez. Une ligne qui monte vous fait sauter au moment précis où vous rendez un gain sur le papier. C\'est la différence la plus décisive entre deux comptes.',
    options: [
      'Fixe — définie au départ, ne bouge jamais (Static)',
      'Suit le solde clôturé et se verrouille au point mort',
      'Suit le solde clôturé, sans verrouillage (Balance/EOD trailing)',
      'Suit aussi le gain latent (Equity trailing)',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'Chaque compte a une « ligne de mort » : si votre argent passe en dessous, le compte est fermé. L\'endroit où elle se trouve compte, mais **son comportement** compte tout autant. Il existe trois modèles :' },
      { p: '**Fixe (Static) :** la ligne est définie au départ et ne bouge plus de toute la vie du compte. Que vous gagniez, que vous retiriez ou que votre solde double, elle reste au même endroit. L\'avantage : plus vous gagnez, plus la distance jusqu\'à elle augmente, donc plus vous avez d\'espace.' },
      { p: '**Suit le solde clôturé (Balance/EOD trailing) :** la ligne monte derrière les gains que vous **clôturez**. Les oscillations d\'une position ouverte ne la déplacent pas : elle ne monte qu\'à la fermeture. Chez certaines firmes elle s\'arrête une fois votre solde de départ atteint et devient fixe en pratique ; c\'est nettement mieux que la version qui monte toujours.' },
      { p: '**Suit aussi le gain latent (Equity trailing) :** le modèle le plus dangereux. La ligne monte même sur un gain que vous n\'avez pas encore réalisé. Votre position passe un instant en profit, la ligne se verrouille plus haut, et quand ce gain s\'évapore — sans que vous ayez perdu un seul dollar réel — le compte peut disparaître.' },
      { h: 'Exemple (compte de 100 000 $, ligne à 10 %)' },
      { p: 'Disons que vous ouvrez une position sur l\'or : d\'abord +5 000 $ de gain, puis retour en arrière, et vous clôturez au point mort.' },
      {
        table: {
          head: ['Moment', 'Solde', 'Equity', 'Ligne fixe', 'Ligne Equity trailing'],
          rows: [
            ['Départ', '100 000 $', '100 000 $', '90 000 $', '90 000 $'],
            ['Position +5 000 $ de gain', '100 000 $', '105 000 $', '90 000 $', '**95 000 $** ↑'],
            ['Le gain s\'évapore', '100 000 $', '94 000 $', 'Sans danger', '**Ligne franchie — compte perdu**'],
          ],
        },
      },
      { p: 'Avec la ligne fixe, rien ne s\'est passé. Avec l\'equity trailing, le compte a fermé alors que l\'argent dans votre poche n\'a jamais diminué — parce que la ligne avait grimpé derrière un gain que vous n\'avez jamais encaissé.' },
      { p: '**Que se passe-t-il à mesure que vous gagnez ?** Imaginez un solde à 120 000 $. Avec une ligne fixe, le plancher reste à 90 000 $ : vous avez 30 000 $ d\'espace. Avec le trailing, la ligne est montée avec vous jusqu\'à 110 000 $ et votre espace reste toujours les mêmes 10 000 $.' },
    ],
  },

  news: {
    title: 'Trader pendant les news',
    short: 'Pouvez-vous ouvrir et fermer des positions au moment des annonces à fort impact ? S\'il y a une restriction, l\'essentiel n\'est pas la restriction mais **le prix de l\'infraction** : efface-t-on seulement le gain de cette position ou ferme-t-on le compte ?',
    options: [
      'Totalement autorisé, aucune fenêtre de blocage',
      'Autorisé avec une option payante (add-on)',
      'Fenêtre de blocage (±2, ±4, ±5 min), position ouverte avant exemptée',
      'Fenêtre de blocage ; en cas d\'infraction seul le gain est effacé',
      'Fenêtre de blocage ; en cas d\'infraction le compte est fermé',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'Les publications à fort impact comme le NFP, le CPI ou le FOMC provoquent de gros mouvements en quelques secondes. Les firmes n\'aiment pas ce risque, donc la plupart imposent une **fenêtre de blocage** : 2, 4 ou 5 minutes avant et après la publication, vous ne pouvez ni ouvrir ni fermer de position.' },
      { p: 'Mais le décisif n\'est pas la fenêtre, c\'est **ce qui arrive en cas d\'infraction**. Vous verrez trois issues :' },
      {
        ul: [
          '**Seul le gain de cette position est effacé** → agaçant, mais le compte continue',
          '**Le compte est fermé** → une seule erreur met fin à tout',
          '**Il existe une exemption** → certaines firmes disent : « si la position a été ouverte 4 à 5 heures avant, nous ne la comptons pas comme un trade de news »',
        ],
      },
      { p: 'Et voici le détail que beaucoup ignorent : chez certaines firmes, l\'infraction peut survenir **sans que vous fassiez quoi que ce soit**. Si le stop ou l\'objectif d\'une position ouverte des heures plus tôt se déclenche dans cette fenêtre, cela compte aussi comme « fermer une position dans la fenêtre ».' },
      { h: 'Exemple' },
      { p: 'À 10 h 00 vous achetez de l\'or avec un objectif à 4 120 $. Le NFP sort à 15 h 30 et la fenêtre de blocage va de 15 h 28 à 15 h 32.' },
      { p: '**Scénario A — firme qui efface le gain :** le pic de la news touche votre objectif à 15 h 29. La position se ferme à +2 000 $, mais ce gain est effacé du compte. Le compte continue ; vous ne gardez simplement pas ce profit.' },
      { p: '**Scénario B — firme qui ferme le compte :** la même chose se produit, mais votre compte est fermé. Vous n\'étiez même pas devant l\'écran ; c\'est le système qui a déclenché l\'ordre — cela compte quand même comme une infraction.' },
      { p: '**Scénario C — firme avec exemption :** vous avez ouvert à 10 h 00, soit cinq heures et demie avant l\'annonce. La firme ne la traite pas comme un trade de news et votre gain reste acquis.' },
      { p: '**Conséquence pratique :** dans une firme du scénario B, avant chaque annonce importante vous devez éloigner de la fenêtre les stops et objectifs de toutes vos positions ouvertes. Des dizaines de fois par mois. Un oubli et le compte est perdu.' },
    ],
  },

  floating: {
    title: 'Limite de perte sur positions ouvertes (Floating)',
    short: 'Une limite distincte qui regarde la perte **non encore réalisée** de vos positions ouvertes. Franchissez le seuil et le système ferme tout instantanément, même si vous n\'avez jamais approché votre limite journalière. La règle la plus sournoise pour qui garde plusieurs positions à la fois.',
    options: [
      'Inexistante',
      'Oui, seuil de 4 % ou plus',
      'Oui, seuil de 3 %',
      'Oui, seuil de 2 %',
      'Oui, seuil inférieur à 2 %',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'Vous connaissez d\'ordinaire deux limites de perte : la journalière et la totale. Celle-ci est une troisième et fonctionne autrement — elle ne regarde **que la perte non réalisée de vos positions ouvertes**.' },
      { p: 'Si vous franchissez le seuil, le système n\'attend pas : il ferme toutes vos positions d\'un coup. Chez certaines firmes le compte est fermé aussi ; chez d\'autres la première fois entraîne une pénalité (baisse de votre part de profit) et la seconde ferme le compte.' },
      { p: 'Pourquoi sournoise ? Parce que **vous n\'avez peut-être jamais approché votre limite journalière**. Vous ouvrez plusieurs positions dont le risque est raisonnable une à une, mais leurs pertes latentes s\'additionnent, franchissent le seuil et le système vous sort du marché — peut-être à un pas du retournement.' },
      { h: 'Exemple (compte de 100 000 $, seuil de 2 % = 2 000 $)' },
      { p: 'Le matin vous avez ouvert trois positions, chacune risquant 1 000 $ :' },
      { ul: ['XAUUSD long → actuellement −700 $', 'EURUSD long → actuellement −700 $', 'GBPUSD long → actuellement −700 $'] },
      { p: '**Perte latente totale : −2 100 $** → le système intervient et ferme les trois.' },
      { p: 'Pourtant :' },
      {
        ul: [
          'votre limite journalière était de 5 000 $ et vous n\'en étiez pas proche',
          'aucun stop n\'avait été touché, les trois pouvaient encore se retourner',
          'votre risque total ne représentait que 3 % du compte',
        ],
      },
      { p: 'Vous n\'avez donc forcé aucune règle volontairement, mais aux yeux du système « votre perte latente est devenue trop grande ».' },
      { p: '**Règle pratique :** si cette limite existe, le risque cumulé de toutes vos positions ouvertes simultanément doit rester sous le seuil. Sur un compte de 100 K$ avec un seuil de 2 %, le risque ouvert total ne doit pas dépasser 2 000 $ : pour quatre positions, 500 $ maximum chacune.' },
    ],
  },

  dailyBase: {
    title: 'Base de calcul de la ligne de perte journalière',
    short: 'La ligne journalière est remise à zéro et recalculée chaque jour. Sur quelle base ? Si l\'on retient le plus élevé des deux, le gain sur le papier porté pendant la nuit pousse la ligne vers le haut — et en le rendant le lendemain, vous pouvez perdre le compte sans une seule perte réelle.',
    options: [
      'Aucune limite journalière',
      'Basée sur le solde — le gain latent ne pousse pas la ligne',
      'On retient le plus élevé entre solde et equity',
      'Calculée depuis le sommet d\'equity de la journée',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'La ligne de perte journalière est remise à zéro et recalculée chaque jour. Mais **sur quoi** elle se calcule varie selon la firme, et la différence est vitale :' },
      { p: '**Basée sur le solde :** la ligne part de l\'argent clôturé en début de journée. Le gain ou la perte d\'une position ouverte n\'entre pas en compte. Le modèle le plus sûr.' },
      { p: '**Le plus élevé des deux :** en début de journée on regarde le solde et l\'equity et on retient le plus haut. Si votre position de la nuit est en gain, ce gain sur le papier pousse la ligne vers le haut.' },
      { p: '**Depuis le sommet d\'equity de la journée :** le modèle le plus dur. Dès que vous passez en gain dans la journée, la ligne se verrouille plus haut.' },
      { p: 'Pourquoi est-ce important ? Parce que dans le deuxième et le troisième modèle vous pouvez perdre le compte **sans la moindre perte réelle**, simplement en rendant un gain sur le papier.' },
      { h: 'Exemple (compte de 100 000 $, limite journalière de 5 %)' },
      { p: 'À minuit votre solde est de 100 000 $ et votre position ouverte sur l\'or affiche +10 000 $ (equity 110 000 $).' },
      { p: '**Firme basée sur le solde :** ligne = 100 000 − 5 000 = **95 000 $**. Le lendemain le gain s\'évapore et vous clôturez au point mort → equity 100 000 $. Vous êtes à 5 000 $ de la ligne, aucun souci.' },
      { p: '**Firme qui retient le plus élevé :** ligne = 110 000 × 0,95 = **104 500 $**. Le lendemain 5 500 $ s\'évaporent → l\'equity tombe à 104 500 $. **Compte fermé.**' },
      { p: 'Notez-le : dans le second cas, l\'argent dans votre poche vaut toujours 100 000 $. Vous n\'avez pas perdu un centime réel. Vous avez seulement rendu un gain que vous n\'aviez jamais encaissé, et le compte a disparu.' },
      { p: '**Règle pratique :** si votre firme retient le plus élevé, plus le gain sur le papier que vous portez jusqu\'à minuit est important, plus votre marge est étroite le lendemain. Passer la nuit avec un gain latent supérieur à environ 5 % du compte, c\'est entrer en zone dangereuse.' },
    ],
  },

  consistency: {
    title: 'Règle de consistance (répartition du gain)',
    short: 'Votre meilleure journée ne doit pas dépasser une part donnée du gain total. Cela ne ferme pas le compte mais bloque le paiement. Attention : chez certaines firmes la règle n\'existe pas pendant l\'évaluation et s\'active après le financement.',
    options: ['Inexistante', '50 % ou plus', '40 % – 49 %', '30 % – 39 %', 'Moins de 30 %'],
    detail: [
      { h: 'Explication' },
      { p: 'La règle dit : **le gain d\'une seule journée ne peut pas dépasser un certain pourcentage du gain total.** La firme cherche à savoir si vous avez eu un coup de chance ou si vous savez vraiment faire.' },
      { p: 'Point important : cette règle **ne ferme pas** votre compte. Elle bloque votre argent. Jusqu\'à ce qu\'elle soit respectée, il faut continuer à trader et augmenter le gain total pour que cette grosse journée pèse moins en pourcentage.' },
      { p: 'Il y a un piège : chez certaines firmes elle n\'existe pas pendant l\'évaluation mais s\'applique après le financement. Les conditions de paiement se lisent séparément.' },
      { h: 'Exemple (compte de 100 000 $, règle de 35 %)' },
      { p: 'Disons que vous atteignez l\'objectif avec 7 000 $ de gain total. La règle : la meilleure journée ne peut dépasser 35 % du total. 7 000 × 0,35 = **2 450 $**' },
      { p: '**Cas A :** votre meilleure journée fait 2 000 $. Aucun souci, vous êtes payé.' },
      { p: '**Cas B :** votre meilleure journée fait 4 000 $. Règle enfreinte, paiement bloqué. Que faut-il ? 4 000 ÷ 0,35 = **11 429 $**' },
      { p: 'Autrement dit, pour légitimer cette seule journée il faut porter le gain total à 11 429 $. Impossible de s\'arrêter à 7 000 $ et d\'être payé : il faut gagner 4 400 $ de plus.' },
      { p: '**Qui est touché :** celui qui accumule de petits gains chaque jour ne sent jamais cette règle. Celui qui gagne sur les news ou en quelques gros coups s\'y heurte sans cesse : par nature, sa stratégie concentre le gain sur quelques journées.' },
      { p: '**Plus le pourcentage est élevé, mieux c\'est :** à 50 %, une journée peut représenter la moitié du total (confortable) ; à 15 %, seulement un septième (très serré).' },
    ],
  },

  overnight: {
    title: 'Conserver une position la nuit',
    short: 'Garder une position ouverte pendant la nuit, en traversant le changement de journée. Si c\'est interdit, tout ce que vous ouvrez doit être fermé à la fin de la séance.',
    options: ['Autorisé', 'Autorisé avec une option payante (add-on)', 'Interdit — fermeture automatique en fin de séance'],
    detail: [
      { h: 'Explication' },
      { p: 'Le droit de garder une position à travers le changement de journée. Cela paraît anodin, mais cela détermine directement votre stratégie.' },
      { p: 'Si c\'est interdit, chaque position doit être fermée le jour même — le système ferme tout à la fin de la séance. Vous ne pouvez alors pas faire de swing, pas capter les mouvements de plusieurs jours, pas porter une position de news au lendemain.' },
      { p: 'Chez certaines firmes c\'est autorisé, mais via une option payante. Chez d\'autres c\'est autorisé mais l\'intérêt de nuit (swap) coûte cher — surtout sur les indices et le pétrole, où quelques jours de portage mangent le gain.' },
      { h: 'Exemple' },
      { p: 'Jeudi vous repérez un bon achat sur l\'or ; le mouvement visé prendra deux ou trois jours.' },
      { p: '**Dans une firme qui l\'autorise :** vous ouvrez, vous portez vendredi et lundi, vous clôturez sur l\'objectif. Vous ne payez que le swap de nuit.' },
      { p: '**Dans une firme qui l\'interdit :** vous devez fermer le jour même. Si le mouvement continue la nuit, vous le ratez. Le lendemain il faut rentrer de nouveau — mais le prix est peut-être déjà parti. En plus, commission et spread se multiplient puisque vous rentrez chaque jour.' },
      { p: '**Qui est touché :** un scalpeur qui entre et sort dans la journée ne sent pas cette règle. Pour qui tient des positions de swing ou de news, le compte devient inutilisable.' },
    ],
  },

  payout: {
    title: 'Fréquence des paiements',
    short: 'À quelle fréquence pouvez-vous retirer vos gains et combien de temps attendez-vous le premier retrait ? Un gain non retiré reste toujours exposé.',
    options: [
      'Quand vous voulez (On-demand)',
      'Hebdomadaire (7 jours)',
      '10 – 14 jours',
      'Ramené à 14 jours avec une option payante (add-on)',
      'Mensuel (28 – 30 jours)',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'À quelle fréquence vous pouvez sortir votre argent. Cela ne met pas le compte en danger, mais n\'oubliez pas une chose : **le gain qui dort sur le compte n\'est pas votre argent.** Tant que vous ne l\'avez pas retiré, il reste exposé — une infraction, une mauvaise journée, et il disparaît.' },
      { p: 'Deux choses à regarder : combien de temps vous attendez le premier paiement, et à quelle fréquence le cycle revient ensuite.' },
      { h: 'Exemple' },
      { p: 'Vous êtes financé et vous gagnez 5 000 $ le premier mois.' },
      { p: '**Firme avec retrait à la demande :** vous le demandez le jour même où le gain apparaît et il est sur votre compte en quelques jours ouvrés. L\'argent est vraiment à vous.' },
      { p: '**Firme avec paiement mensuel :** il faut attendre 30 jours. Pendant ce temps vous pouvez traverser une mauvaise semaine et rendre une partie, ou enfreindre une règle et perdre les 5 000 $ entiers. Dans ce cas le chiffre affiché n\'était qu\'un chiffre : il n\'est jamais arrivé dans votre poche.' },
      { p: '**Conséquence pratique :** la fréquence de paiement n\'est pas une question de « à quelle vitesse je deviens riche », mais de **à quelle vitesse le risque quitte la table**. Une firme qui paie souvent vous laisse sécuriser votre gain plus tôt.' },
    ],
  },

  riskPerTrade: {
    title: 'Limite de risque par position ou par instrument',
    short: 'En plus de la limite journalière, un plafond distinct sur ce que vous pouvez risquer sur une position ou un instrument. Les positions sur le même instrument sont généralement additionnées et comptées comme une seule.',
    options: [
      'Inexistante',
      'Oui, seuil de 3 % ou plus',
      'Oui, seuil de 2 % – 3 %',
      'Oui, seuil inférieur à 2 %',
      'Plafond en lots (par instrument)',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'Au-delà des limites journalière et totale, un plafond distinct sur ce que vous pouvez risquer **sur une position ou un instrument**. Il prend deux formes :' },
      { p: '**En pourcentage :** « sur une même idée, risquez au plus 2 % du compte ». Détail important : plusieurs positions sur le même instrument et dans le même sens comptent généralement comme **une seule position**, donc leurs risques s\'additionnent.' },
      { p: '**En lots (plafond de lots) :** « sur l\'or, 3 lots maximum ». C\'est plus strict, car cela limite la taille absolue et non le risque.' },
      { h: 'Exemple 1 — en pourcentage (compte de 100 000 $, 2 % = 2 000 $)' },
      { p: 'Vous avez acheté de l\'or en trois fois, en risquant 800 $ à chaque fois. Vous y voyez trois positions ; la firme y voit une seule idée : 800 × 3 = **2 400 $** → limite dépassée, infraction.' },
      { h: 'Exemple 2 — plafond de lots (3 lots sur l\'or)' },
      { p: 'Vous voulez risquer 2 500 $ sur l\'or. Les lots nécessaires dépendent de la distance du stop :' },
      {
        table: {
          head: ['Distance du stop', 'Lots nécessaires', 'Résultat'],
          rows: [
            ['20 $', '1,25 lot', '✓ Aucun souci'],
            ['10 $', '2,5 lots', '✓ Aucun souci'],
            ['5 $', '5 lots', '✗ Plafond à 3 lots — 1 500 $ de risque au maximum'],
          ],
        },
      },
      { p: 'Autrement dit, avec un stop serré vous n\'atteignez mathématiquement pas le risque voulu. Le plafond de lots pénalise directement ceux qui utilisent des stops serrés.' },
    ],
  },

  stopLoss: {
    title: 'Règle du stop-loss',
    short: 'Le stop est-il obligatoire ? Doit-il rester visible sur la plateforme ? La méthode « poser le stop, l\'enlever, fermer à la main quand le prix arrive » est considérée comme un stop caché chez certaines firmes, et interdite.',
    options: [
      'Non obligatoire, sans condition de visibilité',
      'Non obligatoire, mais s\'il est posé il doit rester visible',
      'Obligatoire (à poser dans un délai donné)',
      'Obligatoire + condition de distance maximale',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'La règle contient deux questions distinctes :' },
      { p: '**Le stop est-il obligatoire ?** Certaines firmes exigent un stop sur chaque position dans un délai donné. D\'autres n\'interviennent pas du tout.' },
      { p: '**Le stop doit-il rester visible ?** Règle moins connue mais importante. Certains traders posent le stop, le retirent, puis ferment à la main quand le prix arrive — pour éviter la « chasse aux stops ». Certaines firmes appellent cela un **stop caché (stealth stop)** et l\'interdisent. Pour elles, le stop doit être un ordre réel présent sur la plateforme pendant toute la vie de la position.' },
      { p: 'Pourquoi cela leur importe-t-il ? Parce qu\'elles calculent leur propre risque à partir de vos stops visibles. Un trader dont le stop ne se voit pas est, à leurs yeux, un trader dont le risque n\'est pas mesurable.' },
      { h: 'Exemple' },
      { p: 'Disons que vous achetez de l\'or et posez un stop à 10 $, puis vous le retirez en vous disant « si le prix y arrive, je ferme à la main ».' },
      { p: '**Dans une firme sans règle :** aucun problème, vous gérez comme vous voulez.' },
      { p: '**Dans une firme avec condition de visibilité :** c\'est une infraction. Cela apparaît comme un schéma dans votre historique (positions sans stop, fermetures toujours manuelles) et vous passez en revue.' },
      { p: '**La solution — le meilleur des deux mondes :** posez le stop **large** dès le départ (là où les pics ne vont pas) et réduisez la taille de la position en conséquence : votre risque en dollars ne change pas. La vraie décision de sortie reste manuelle, quand le prix atteint votre niveau mental. Mais un stop de sécurité est toujours sur la plateforme.' },
      { p: 'Le bonus : vous restez protégé quand internet coupe, quand vous dormez ou quand la plateforme se fige. Un stop mental ne fonctionne que devant l\'écran.' },
    ],
  },

  minDays: {
    title: 'Jours de trading minimum',
    short: 'Le nombre minimum de jours pour valider, même si l\'objectif est déjà atteint. La distinction clé : suffit-il **d\'ouvrir une position** ou faut-il aussi **gagner** ce jour-là ?',
    options: [
      'Aucun (0 jour)',
      '1 – 4 jours, jours simples (sans condition de gain)',
      '5 jours ou plus, jours simples',
      'Condition de journée gagnante',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'Même avec l\'objectif de gain atteint, il faut avoir tradé un certain nombre de jours distincts pour valider. L\'idée est d\'écarter ceux qui passent sur un coup de chance. La distinction clé :' },
      { p: '**Jour simple :** il suffit **d\'ouvrir** une position ce jour-là. Gain ou perte, le jour compte. Même une toute petite position le remplit.' },
      { p: '**Journée gagnante :** il faut **gagner** un montant donné ce jour-là (en général 0,5 % du compte). Un jour perdant, ou faiblement gagnant, ne compte pas.' },
      { p: 'L\'écart entre les deux est énorme. La condition de jour simple ne fait que vous retarder. Celle de journée gagnante vous retire la maîtrise du délai : si le marché n\'offre pas d\'occasion, vous attendez.' },
      { h: 'Exemple (compte de 50 000 $, 3 journées gagnantes, 0,5 % = 250 $)' },
      {
        table: {
          head: ['Jour', 'Positions clôturées ce jour-là', 'Net', 'Comptée ?'],
          rows: [
            ['Lundi', '+415 $, −403 $', '+12 $', '✗ (sous 250 $)'],
            ['Mardi', '+139 $, +368 $', '+507 $', '✓'],
            ['Mercredi', '+989 $', '+989 $', '✓'],
            ['Jeudi', '−658 $', '−658 $', '✗'],
            ['Vendredi', '+2 814 $', '+2 814 $', '✓'],
          ],
        },
      },
      { p: 'Trois journées gagnantes validées. Mais notez : lundi n\'a pas compté malgré deux positions, car le net faisait 12 $. Jeudi n\'a pas compté car la journée s\'est close en perte. Dans une firme avec condition de « jour simple », les cinq jours auraient compté.' },
      { p: '**Un détail de plus :** chez certaines firmes, le « jour » est celui où la position a été **ouverte**. Une position ouverte lundi et fermée mercredi ne compte que le lundi ; elle ne remplit ni le mardi ni le mercredi.' },
    ],
  },

  payoutDrawdown: {
    title: 'Comportement de la ligne après un retrait',
    short: 'Un retrait fait baisser votre solde — la ligne de perte baisse-t-elle avec lui ou reste-t-elle en place ? Si elle reste, chaque retrait rétrécit votre marge.',
    options: [
      'Le retrait n\'affecte pas la ligne ; le plancher descend proportionnellement',
      'Le plancher reste, la marge se réduit du montant retiré',
      'Le plancher se verrouille sur le solde initial',
    ],
    detail: [
      { h: 'Explication' },
      { p: 'Quand vous retirez de l\'argent, votre solde baisse. Et la ligne de perte ? Trois possibilités :' },
      { p: '**La ligne baisse aussi :** elle descend proportionnellement au retrait et votre marge est préservée. Le meilleur cas.' },
      { p: '**La ligne reste :** le solde baisse mais la ligne ne bouge pas — la distance entre les deux, donc votre espace de manœuvre, se resserre. Le modèle le plus courant.' },
      { p: '**La ligne se verrouille sur le solde initial :** au moment du retrait, elle est fixée au niveau de départ. Si vous retirez tout votre gain, votre marge est exactement nulle.' },
      { p: 'Ce troisième cas est dangereux car le compte paraît « plein » sur le papier mais peut fermer sur une seule petite perte.' },
      { h: 'Exemple (compte de 100 000 $, firme qui verrouille le plancher à 100 000 $)' },
      { p: 'Vous avez gagné 10 000 $ et votre solde est de 110 000 $.' },
      { p: '**Cas A — vous retirez 5 000 $ :** solde 105 000 $, plancher 100 000 $ → **5 000 $ de marge.** Vous continuez tranquillement.' },
      { p: '**Cas B — vous retirez les 10 000 $ :** solde 100 000 $, plancher 100 000 $ → **marge nulle.** Dès la première position, une baisse de la taille du spread et de la commission suffit à faire passer l\'equity sous 100 000 $ et le compte ferme. Le retrait passe, mais vous perdez le compte.' },
      { p: '**Règle pratique :** la marge restante après un retrait doit être nettement supérieure au risque total que vous pouvez avoir ouvert en même temps. Si trois positions représentent 3 000 $ de risque, laissez au moins 5 000 à 6 000 $ de marge après le retrait. Ne retirez jamais la totalité du gain.' },
    ],
  },

  weekend: {
    title: 'Conserver une position le week-end',
    short: 'Porter une position de la clôture du vendredi à l\'ouverture du lundi. C\'est une règle distincte de celle de la nuit. Même autorisée, le swap grimpe sur les indices et le pétrole, et le gap du lundi peut sauter par-dessus votre stop.',
    options: ['Autorisé', 'Autorisé avec une option payante (add-on)', 'Interdit — fermeture automatique à la clôture du vendredi'],
    detail: [
      { h: 'Explication' },
      { p: 'Le droit de garder une position de la clôture du vendredi à l\'ouverture du lundi. C\'est une **règle distincte** de celle de la nuit — certaines firmes autorisent les nuits de semaine mais interdisent le week-end.' },
      { p: 'Si c\'est interdit, tout doit être fermé avant la clôture du vendredi ; le système s\'en charge généralement. Même autorisé, deux effets secondaires méritent d\'être connus :' },
      { p: '**Coût du swap :** pour le week-end, on facture d\'ordinaire trois jours d\'intérêts. Sur les indices et le pétrole le montant peut être sérieux ; sur le forex et l\'or il reste plus raisonnable.' },
      { p: '**Risque de gap :** le marché ferme vendredi et rouvre lundi à un autre prix. Si une nouvelle tombe entre-temps, le prix peut ouvrir bien au-delà de votre stop — le stop ne vous protège donc pas et vous perdez plus que prévu.' },
      { h: 'Exemple' },
      { p: 'Vendredi vous êtes acheteur d\'or avec un stop à 50 $.' },
      { p: '**Cas normal :** lundi ouvre un peu plus bas, votre stop fonctionne normalement, vous prenez la perte prévue.' },
      { p: '**Cas du gap :** un événement géopolitique survient le week-end. Lundi, l\'or ouvre 80 $ sous la clôture du vendredi. Votre stop était à 50 $, mais le premier prix traité est 80 $ plus bas — votre position s\'y ferme. Vous prenez presque le double de la perte prévue.' },
      { p: 'C\'est pourquoi, en portant une position sur le week-end, il faut laisser plus de distance que d\'habitude jusqu\'à vos lignes journalière et totale.' },
    ],
  },
};

export default fr;
