/** Yazıların pt metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  'metatrader-5-auto-sync': {
    title: "Como ligar o MetaTrader 4 ou 5 ao teu diário de trading",
    description: "Passo a passo: instala o complemento do Simple Trading Journal no MT4 ou MT5 para que cada operação fechada chegue sozinha ao teu diário, com stop loss, risco e custos incluídos.",
    body: [
      { p: "Escrever cada operação à mão é a principal razão pela qual as pessoas deixam de manter um diário. Com o complemento do MetaTrader (MT4 e MT5), cada operação é registada no momento em que abre e completada quando fecha: entrada, saída, stop loss, lotes, comissão e swap. Tu só acrescentas o que o MetaTrader não pode saber: o teu setup, o teu raciocínio e como te sentias." },
      { note: "MetaTrader 4 ou 5? Os passos são os mesmos para os dois; só mudam o ficheiro e a pasta. No ecrã do MetaTrader da app escolhe primeiro a tua versão: o MetaTrader 5 usa SimpleTradingJournal.ex5 e MQL5 → Experts; o MetaTrader 4 usa SimpleTradingJournal.ex4 e MQL4 → Experts." },
      { h2: 'O que precisas' },
      { ul: [
        "MetaTrader 4 ou MetaTrader 5 em Windows ou Mac (o terminal de computador; a app móvel não corre complementos).",
        'Uma conta Simple Trading Journal com pelo menos um diário.',
        'Dois minutos.',
      ] },
      { h2: '1. Descarrega o complemento' },
      { p: "Na app, abre MetaTrader no menu, escolhe MetaTrader 4 ou 5 e descarrega o complemento (SimpleTradingJournal.ex5 para o MT5, SimpleTradingJournal.ex4 para o MT4). No MetaTrader escolhe File → Open Data Folder, entra em MQL5 → Experts (MQL4 → Experts no MT4) e coloca lá o ficheiro." },
      { note: "No Mac, «Open Data Folder» não funciona em algumas versões. No Finder usa Ir → Ir para a pasta e cola o caminho da tua versão. MetaTrader 5: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts — MetaTrader 4: ~/Library/Application Support/net.metaquotes.wine.metatrader4/drive_c/Program Files (x86)/MetaTrader 4/MQL4/Experts" },
      { h2: '2. Permite a ligação' },
      { p: 'O MetaTrader bloqueia os pedidos à internet dos complementos, a não ser que autorizes o endereço. Vai a Tools → Options → Expert Advisors, marca «Allow WebRequest for listed URL» e acrescenta:' },
      { code: 'https://www.simpletradejournal.io' },
      { h2: '3. Reinicia o MetaTrader' },
      { p: 'Fecha o MetaTrader e volta a abri-lo. O SimpleTradingJournal aparece agora em Expert Advisors, no painel Navigator à esquerda.' },
      { h2: '4. Arrasta-o para um gráfico e cola a chave' },
      { p: "Na app, cria uma chave de ligação (começa por stj_). Arrasta o SimpleTradingJournal para qualquer gráfico, abre o separador Inputs, cola a chave em ApiKey e clica em OK. Quando o canto superior esquerdo do gráfico indicar que a ligação está a funcionar, está feito. Aí também aparece para que diário vão as operações (Journal: …); confirma que é o certo." },
      { p: 'Cada chave pertence a um diário e fica presa à primeira conta de trading que se liga com ela, por isso as operações de duas contas nunca se misturam no mesmo diário. Para uma segunda conta, cria uma segunda chave.' },
      { h2: 'Em que gráfico o ponho?' },
      { p: 'O MetaTrader corre um só expert advisor por gráfico. Se já usas outro EA, abre um gráfico novo e vazio só para o complemento do diário e deixa-o aberto: cada operação fechada chega sozinha enquanto continuas a operar nos outros gráficos. Se preferires não manter um gráfico extra, podes pôr o complemento num gráfico só quando quiseres sincronizar; ele apanha tudo o que fechou entretanto.' },
      { h2: 'O que fica registado' },
      { ul: [
        'Símbolo, direção, lotes, preço e hora de entrada e de saída.',
        'Stop loss e take profit. O stop com que entraste é mantido mesmo que o movas depois, para que o teu risco e os teus múltiplos R continuem fiéis.',
        'Resultado bruto, comissão, swap e resultado líquido.',
        "No MetaTrader 5, uma posição fechada por partes (TP1, TP2…) é registada como uma só operação quando fecha totalmente. No MetaTrader 4, um fecho parcial dá ao resto da ordem um número novo, por isso aparece como uma operação separada.",
      ] },
      { h2: 'Resolução de problemas' },
      { ul: [
        'Não chega nada: confirma que o endereço do passo 2 é exatamente https://www.simpletradejournal.io, que o gráfico com o complemento continua aberto e que a chave foi colada sem espaços.',
        "«Chave associada a outra conta»: a chave já pertence a outra conta de trading. Cria uma chave nova para esta conta.", "As operações vão para o diário errado: a linha «Journal:» no gráfico mostra para onde vão. Se indicar outro diário, o complemento ainda usa uma chave antiga. Abre Inputs, apaga o ApiKey por completo, cola a chave nova, carrega em Enter e depois em OK. A chave antiga fecha-se sozinha assim que a nova se liga.", "No MetaTrader 4 o complemento aparece a cinzento e não se consegue arrastar: usa o ficheiro SimpleTradingJournal.ex4 descarregado no ecrã do MetaTrader e depois clica com o botão direito em Expert Advisors, no painel Navigator, e escolhe Refresh.",
        "Perdi a chave: o MetaTrader lembra-se dela. Se a perdeste mesmo, cria uma nova na app; a antiga fecha-se sozinha assim que a nova se liga.",
      ] },
      { p: 'Preferes não instalar nada? Também podes importar o próprio relatório do MetaTrader — vê o guia de importação.' },
    ],
  },
  'import-trade-history': {
    title: 'Como importar o teu histórico de operações para um diário de trading',
    description: 'Importa operações fechadas do MetaTrader 4/5, cTrader, TradeLocker, DXtrade ou Match-Trader. Como obter o relatório certo, o que é lido dele e como se evitam duplicados.',
    body: [
      { p: 'Se já operas há meses, não tens de escrever tudo. Exporta um relatório da tua plataforma e larga-o no diário — o ficheiro é lido no teu navegador, a plataforma é reconhecida automaticamente e vês todas as operações antes de qualquer coisa ser guardada.' },
      { h2: 'Plataformas suportadas' },
      { ul: ['MetaTrader 5 e MetaTrader 4 (o relatório HTML)', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader', 'Qualquer outro CSV — escolhes tu que coluna é a data, o símbolo, a direção e o resultado'] },
      { h2: 'Obter o relatório certo do MetaTrader' },
      { ol: [
        'No MetaTrader abre a Toolbox (Ctrl+T) e vai ao separador History.',
        'Clica com o botão direito dentro da lista e escolhe o período que queres (por exemplo, «All history»).',
        'Botão direito outra vez → Report, e guarda como HTML.',
      ] },
      { note: 'Não uses o relatório de conta que só mostra o saldo e as posições abertas — não contém operações fechadas. Se o importador disser que não encontrou operações fechadas, a razão é quase sempre esta.' },
      { h2: 'Importar' },
      { ol: [
        'Na app escolhe Importar e seleciona o diário para onde vão as operações.',
        'Arrasta o ficheiro para a janela ou clica para o escolher.',
        'Verifica a pré-visualização: símbolo, direção, lotes, preços, horas e resultado líquido de cada operação.',
        'Confirma. As operações aparecem no teu diário, calendário e estatísticas.',
      ] },
      { h2: 'O que é lido do relatório' },
      { ul: [
        'O resultado líquido — não só o lucro bruto; comissão, swap e custos são tidos em conta.',
        'O stop loss, para calcular o risco e o múltiplo R de cada operação.',
        'Preços e horas de entrada e de saída.',
      ] },
      { h2: 'Importar o mesmo ficheiro duas vezes' },
      { p: 'Cada operação leva o seu identificador da plataforma, por isso uma operação que já está no diário é ignorada em vez de ser adicionada outra vez. Podes importar um relatório atualizado todas as semanas sem limpar nada. Se registaste uma operação à mão enquanto ainda estava aberta, a importação completa esse registo em vez de criar um segundo.' },
      { p: "Queres que isto aconteça sozinho? Liga o MetaTrader 4 ou 5 uma vez e as operações fechadas chegam automaticamente — vê o guia do MetaTrader." },
    ],
  },
  'how-to-keep-a-trading-journal': {
    title: 'Como manter um diário de trading que vais mesmo usar',
    description: 'O que registar em cada operação, com que frequência rever e os hábitos que transformam o diário de trading de uma folha de cálculo abandonada na tua ferramenta mais útil.',
    body: [
      { p: 'A maioria dos traders concorda que um diário ajuda, e a maioria deixa de o manter ao fim de poucas semanas. Raramente é falta de disciplina: o diário pede demasiado no momento errado e não devolve nada. Um diário que vais mesmo usar preenche-se depressa, revê-se depressa e mostra-te algo que não verias sozinho.' },
      { h2: 'O que registar em cada operação' },
      { p: 'Separa o que a plataforma sabe do que só tu sabes.' },
      { ul: [
        'Os factos: símbolo, direção, entrada, saída, stop loss, tamanho e resultado depois de custos. Nunca deviam ser escritos à mão — importa-os ou sincroniza-os a partir da plataforma.',
        'O plano: que setup era e porque entraste. Uma linha chega.',
        'O estado: como te sentias ao entrar — calmo, aborrecido, apressado, a tentar recuperar uma perda.',
        'Uma captura do gráfico na entrada, se o setup for visual.',
      ] },
      { h2: 'Mede em R, não em dinheiro' },
      { p: 'Um ganho de 300 dólares, sozinho, diz pouco. Se arriscaste 100, foi uma operação de 3R; se arriscaste 600, foi meio R e uma má operação que por acaso correu bem. Registar o stop permite ao diário exprimir cada resultado como múltiplo do que arriscaste, e é esse o número que mostra se a tua vantagem é real.' },
      { h2: 'Revê com regularidade' },
      { ul: [
        'Diariamente, dois minutos: segui hoje o meu plano? Há alguma coisa a anotar enquanto está fresca?',
        'Semanalmente, quinze minutos: que setups deram dinheiro, quais o tiraram, e em que dias e sessões.',
        'Mensalmente: a curva de capital sobe graças aos setups em que acredito ou apesar deles?',
      ] },
      { h2: 'Procura comportamentos, não só estatísticas' },
      { p: 'A taxa de acerto e o R médio dizem-te o que aconteceu. As perguntas mais úteis são sobre como te comportaste: abriste outra operação minutos depois de uma perda? O teu tamanho subiu depois de perder? Operaste em alguns dias muito mais do que o plano permite, ou fora do teu horário habitual? Estes padrões custam mais do que qualquer mau setup e é fácil não os ver operação a operação.' },
      { p: 'O Simple Trading Journal verifica automaticamente estes quatro hábitos — operar por vingança, aumentar o risco depois de uma perda, operar em excesso e operar fora do teu horário habitual — em todos os teus diários.' },
      { h2: 'Mantém-no leve' },
      { ul: [
        'Automatiza os factos para que registar uma operação leve segundos, não minutos.',
        'Usa uma checklist curta antes de entrar em vez de notas longas depois.',
        'Etiqueta os setups de forma consistente — cinco setups usados todos os dias valem mais do que cinquenta usados uma vez.',
        'Mantém diários separados para contas separadas, como um challenge de prop firm e uma conta pessoal.',
      ] },
      { h2: 'Começa pequeno' },
      { p: 'Não precisas de um sistema perfeito no primeiro dia. Regista os factos automaticamente, acrescenta uma linha sobre o porquê de cada operação e olha para ele uma vez por semana. Ao fim de um mês terás algo que nenhum indicador te dá: provas sobre o teu próprio trading.' },
    ],
  },
  'r-multiple-explained': {
    title: 'Múltiplos R explicados: avalia cada operação pelo risco que assumiste',
    description: 'O que é um múltiplo R, como o calcular a partir do stop loss e porque a expectativa em R é a forma mais clara de saber se uma estratégia tem vantagem.',
    body: [
      { p: 'O dinheiro é uma má forma de comparar operações. O mesmo lucro de 200 dólares pode ser excelente ou imprudente consoante o que arriscaste para o obter. Os múltiplos R resolvem isto medindo cada resultado face ao risco que assumiste.' },
      { h2: 'O que é 1R?' },
      { p: '1R é o que perdes se a operação atingir o stop loss. Compras a 1,1000 com 1 lote e stop em 1,0950: 1R é o custo desses 50 pips — digamos 500 dólares.' },
      { h2: 'Calcular o múltiplo R' },
      { code: 'Múltiplo R = resultado da operação ÷ risco inicial (1R)' },
      { ul: [
        'Ganhaste 1000 dólares com 500 em risco: +2R.',
        'Perdeste 500 no stop: −1R.',
        'Perdeste 750 por slippage ou por mexer no stop: −1,5R — sinal de que algo correu mal.',
        'Fechaste cedo com 150: +0,3R.',
      ] },
      { h2: 'Porque importa' },
      { p: 'Quando todas as operações estão em R, os resultados tornam-se comparáveis entre tamanhos, instrumentos e contas. Vês que um setup com 40 % de acerto é excelente porque as vencedoras dão em média +2,5R, ou que 70 % de acerto é um problema porque as perdedoras dão em média −3R.' },
      { h2: 'Expectativa' },
      { p: 'A expectativa é o teu R médio por operação. Soma o R de todas as operações e divide pelo número de operações.' },
      { code: 'Expectativa = R total ÷ número de operações' },
      { p: 'Uma expectativa positiva significa que, em média, cada operação te deu dinheiro face ao risco assumido. 0,3R em 100 operações são 30R; com 1 % de risco por operação, cerca de 30 % antes do efeito composto. Com expectativa negativa, mais operações não ajudam — tem de mudar o setup, a execução ou a gestão de risco.' },
      { h2: 'Erros comuns' },
      { ul: [
        'Não registar o stop. Sem ele não há 1R nem múltiplo R.',
        'Usar o stop movido em vez do original. O R mede o risco que aceitaste ao entrar.',
        'Ignorar custos. Comissão e swap fazem parte do resultado; uma operação de +1R pode ficar em +0,9R depois dos custos.',
        'Avaliar um setup com meia dúzia de operações. Olha para pelo menos 30 antes de tirar conclusões.',
      ] },
      { h2: 'No Simple Trading Journal' },
      { p: "Quando uma operação tem stop loss — escrito à mão, importado de um relatório ou sincronizado do MetaTrader — o risco e o múltiplo R são calculados automaticamente, e as tuas estatísticas mostram o R realizado médio ao lado dos resultados em dinheiro." },
    ],
  },
  'prop-firm-daily-loss-and-drawdown': {
    title: 'Perda diária e drawdown máximo: como acompanhar as regras de uma prop firm sem as quebrar',
    description: 'Como costumam funcionar os limites de perda diária, o drawdown máximo e os objetivos de lucro das prop firms, porque a maioria dos challenges se perde por uma regra e não por uma má operação, e como saber sempre a distância ao limite.',
    body: [
      { p: 'Os challenges de prop firm raramente se perdem porque a estratégia deixou de funcionar. Perdem-se numa terça à tarde, quando um trader, depois de três perdas, não percebe que está a 180 dólares do limite diário. As regras são simples; o difícil é saber exatamente, operação a operação, onde estás em relação a elas.' },
      { note: 'Cada empresa escreve as regras à sua maneira e muda-as com o tempo. Confirma sempre as regras atuais da tua empresa — este artigo explica os tipos mais comuns, não uma empresa em particular.' },
      { h2: 'Os três números que decidem um challenge' },
      { ul: [
        'Objetivo de lucro: o ganho que tens de atingir, normalmente uma percentagem do saldo inicial.',
        'Limite de perda diária: quanto podes perder num dia de trading. As empresas diferem em medi-lo a partir do saldo ou do equity do início do dia, e na hora em que o dia reinicia.',
        'Perda máxima (drawdown): quanto a conta pode cair no total. Pode ser estática (medida a partir do saldo inicial) ou dinâmica (acompanha para cima o teu saldo ou equity máximo).',
      ] },
      { h2: 'Drawdown estático vs dinâmico' },
      { p: 'Com um limite estático numa conta de 100 000 dólares e perda máxima de 10 %, a conta falha abaixo de 90 000, aconteça o que tiver acontecido antes. Com um limite dinâmico, se a conta subir primeiro a 105 000, o piso sobe com ela, para 95 000 neste exemplo. Os limites dinâmicos castigam devolver lucros, por isso a distância ao limite pode encolher até numa semana ganhadora.' },
      { h2: 'Porque os challenges se perdem pelas regras' },
      { ul: [
        'As perdas vêm em série. Três stops seguidos numa sessão é normal e, com 1 % de risco por operação mais custos, muitas vezes chega para tocar o limite diário.',
        'As operações abertas contam. Com regras baseadas no equity, uma perda flutuante pode romper o limite antes de qualquer operação fechar.',
        'Custos e swap contam. O limite vê o teu resultado líquido, não o bruto.',
        'Sob pressão o comportamento muda. Operações de vingança e tamanho maior depois de uma perda são exatamente o que transforma um mau dia num challenge perdido.',
      ] },
      { h2: 'Uma rotina simples de proteção' },
      { ol: [
        'Dimensiona as posições para que uma série normal de perdas não chegue ao limite diário — por exemplo, não arrisques mais de um terço do limite diário por operação.',
        'Antes de cada operação, vê a que distância estás dos limites diário e máximo.',
        'Define um stop pessoal bem antes do da empresa: se perdeste metade do limite diário, pára por hoje.',
        'Revê cada dia em que chegaste perto. O padrão costuma repetir-se.',
      ] },
      { h2: 'Acompanhar no Simple Trading Journal' },
      { p: 'Marca um diário como conta prop, introduz o objetivo de lucro, o limite de perda diária e a perda máxima da empresa, e o diário mostra a que distância estás de cada um enquanto operas. Os limites de perda ficam âmbar e depois vermelhos à medida que te aproximas; o objetivo de lucro fica verde quando te aproximas dele. A análise de disciplina assinala operações de vingança e o aumento de risco depois de perdas — os hábitos que acabam com a maioria dos challenges.' },
    ],
  },
  // --- karşılaştırmalar (scripts: compare_gen) ---
  'tradezella-alternative': {
    "title": "Simple Trading Journal vs Tradezella: uma comparação honesta",
    "description": "Procuras uma alternativa ao Tradezella? Preços, plano gratuito, teste e sincronização com o MetaTrader lado a lado, e onde cada um é mais forte.",
    "body": [
      {
        "p": "O Tradezella é um dos diários de trading mais conhecidos. Se procuras uma alternativa mais barata, na tua língua ou com plano gratuito, é assim que o Simple Trading Journal se compara."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradezella"
          ],
          [
            "Preço mensal",
            "$14.99",
            "$35 – $99"
          ],
          [
            "Preço anual",
            "$119",
            "$315 – $891"
          ],
          [
            "Plano gratuito",
            "Sim — 2 operações por dia, sem limite de tempo",
            "Não"
          ],
          [
            "Teste gratuito",
            "3 dias de Pro, sem cartão",
            "Não indicado na página de preços"
          ],
          [
            "Sincronização automática com o MetaTrader",
            "MT4 e MT5",
            "MT4 e MT5"
          ],
          [
            "Como o MetaTrader se liga",
            "Complemento no MetaTrader + chave, sem partilhar palavra-passe",
            "Número de conta + palavra-passe de investidor"
          ],
          [
            "Importação",
            "Relatório MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, qualquer CSV",
            "Mais de 500 corretoras e prop firms"
          ]
        ]
      },
      {
        "note": "Os preços e funcionalidades do Tradezella foram retirados das suas próprias páginas de preços e ajuda em setembro de 2026 e podem ter mudado. Confirma no site antes de decidir."
      },
      {
        "h2": "Onde o Tradezella é mais forte"
      },
      {
        "ul": [
          "Muitas mais integrações com corretoras e prop firms — mais de 500, segundo o Tradezella.",
          "Mais historial e mais funcionalidades nos planos superiores.",
          "As contas MT4 e MT5 sincronizam sem instalar nada no MetaTrader."
        ]
      },
      {
        "h2": "Onde o Simple Trading Journal é mais forte"
      },
      {
        "ul": [
          "Um plano gratuito sem limite de tempo (2 operações por dia) e 3 dias de Pro sem cartão.",
          "O Pro custa $14.99 por mês ou $119 por ano — a opção mais barata do Tradezella é $35 por mês.",
          "A aplicação inteira em 9 línguas, incluindo português, turco, persa e árabe.",
          "O MetaTrader 4 e 5 ligam-se com um pequeno complemento e uma chave; nunca partilhas a palavra-passe de investidor.",
          "Análise de disciplina integrada (operações de vingança, mais risco depois de perdas, excesso de operações, operar fora de horas) e acompanhamento dos limites das prop firms."
        ]
      },
      {
        "h2": "Qual escolher?"
      },
      {
        "p": "Se precisas de uma gama muito grande de integrações com corretoras ou das ferramentas mais avançadas, o Tradezella pode servir-te melhor. Se operas no MetaTrader, queres um diário na tua língua e preferes começar grátis, experimenta o Simple Trading Journal — o plano gratuito não pede cartão."
      }
    ]
  },
  'tradersync-alternative': {
    "title": "Simple Trading Journal vs TraderSync: uma comparação honesta",
    "description": "Procuras uma alternativa ao TraderSync? Preços, plano gratuito, teste e sincronização com o MetaTrader lado a lado, e onde cada um é mais forte.",
    "body": [
      {
        "p": "O TraderSync é um dos diários de trading mais conhecidos. Se procuras uma alternativa mais barata, na tua língua ou com plano gratuito, é assim que o Simple Trading Journal se compara."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TraderSync"
          ],
          [
            "Preço mensal",
            "$14.99",
            "$29.95 – $79.95"
          ],
          [
            "Preço anual",
            "$119",
            "$269.52 – $719.52"
          ],
          [
            "Plano gratuito",
            "Sim — 2 operações por dia, sem limite de tempo",
            "Não"
          ],
          [
            "Teste gratuito",
            "3 dias de Pro, sem cartão",
            "7 dias, sem cartão"
          ],
          [
            "Sincronização automática com o MetaTrader",
            "MT4 e MT5",
            "MT4 e MT5"
          ],
          [
            "Importação",
            "Relatório MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, qualquer CSV",
            "Mais de 200 corretoras e plataformas"
          ]
        ]
      },
      {
        "note": "Os preços e funcionalidades do TraderSync foram retirados das suas próprias páginas de preços e ajuda em setembro de 2026 e podem ter mudado. Confirma no site antes de decidir."
      },
      {
        "h2": "Onde o TraderSync é mais forte"
      },
      {
        "ul": [
          "Mais de 200 corretoras e plataformas suportadas.",
          "Um assistente de IA (Cypher) e repetição de operações nos planos superiores.",
          "Um teste de 7 dias com todas as funcionalidades, sem cartão."
        ]
      },
      {
        "h2": "Onde o Simple Trading Journal é mais forte"
      },
      {
        "ul": [
          "Um plano gratuito sem limite de tempo (2 operações por dia) e 3 dias de Pro sem cartão.",
          "O Pro custa $14.99 por mês ou $119 por ano — a opção mais barata do TraderSync é $29.95 por mês.",
          "A aplicação inteira em 9 línguas, incluindo português, turco, persa e árabe.",
          "O MetaTrader 4 e 5 ligam-se com um pequeno complemento e uma chave; nunca partilhas a palavra-passe de investidor.",
          "Análise de disciplina integrada (operações de vingança, mais risco depois de perdas, excesso de operações, operar fora de horas) e acompanhamento dos limites das prop firms."
        ]
      },
      {
        "h2": "Qual escolher?"
      },
      {
        "p": "Se precisas de uma gama muito grande de integrações com corretoras ou das ferramentas mais avançadas, o TraderSync pode servir-te melhor. Se operas no MetaTrader, queres um diário na tua língua e preferes começar grátis, experimenta o Simple Trading Journal — o plano gratuito não pede cartão."
      }
    ]
  },
  'edgewonk-alternative': {
    "title": "Simple Trading Journal vs Edgewonk: uma comparação honesta",
    "description": "Procuras uma alternativa ao Edgewonk? Preços, plano gratuito, teste e sincronização com o MetaTrader lado a lado, e onde cada um é mais forte.",
    "body": [
      {
        "p": "O Edgewonk é um dos diários de trading mais conhecidos. Se procuras uma alternativa mais barata, na tua língua ou com plano gratuito, é assim que o Simple Trading Journal se compara."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Edgewonk"
          ],
          [
            "Preço mensal",
            "$14.99",
            "— (só anual)"
          ],
          [
            "Preço anual",
            "$119",
            "$197"
          ],
          [
            "Plano gratuito",
            "Sim — 2 operações por dia, sem limite de tempo",
            "Não"
          ],
          [
            "Teste gratuito",
            "3 dias de Pro, sem cartão",
            "Não — garantia de reembolso de 14 dias"
          ],
          [
            "Sincronização automática com o MetaTrader",
            "MT4 e MT5",
            "MT4 e MT5"
          ],
          [
            "Como o MetaTrader se liga",
            "Complemento no MetaTrader + chave, sem partilhar palavra-passe",
            "Publicação de relatórios por FTP do MetaTrader"
          ],
          [
            "Importação",
            "Relatório MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, qualquer CSV",
            "Muitas plataformas (ver a página de importação)"
          ]
        ]
      },
      {
        "note": "Os preços e funcionalidades do Edgewonk foram retirados das suas próprias páginas de preços e ajuda em setembro de 2026 e podem ter mudado. Confirma no site antes de decidir."
      },
      {
        "h2": "Onde o Edgewonk é mais forte"
      },
      {
        "ul": [
          "Um diário veterano com um único plano que inclui todas as funcionalidades.",
          "Garantia de reembolso de 14 dias.",
          "Sincronização automática de MT4 e MT5 com a publicação de relatórios do próprio MetaTrader."
        ]
      },
      {
        "h2": "Onde o Simple Trading Journal é mais forte"
      },
      {
        "ul": [
          "Um plano gratuito sem limite de tempo (2 operações por dia) e 3 dias de Pro sem cartão.",
          "O Pro custa $14.99 por mês ou $119 por ano — a opção mais barata do Edgewonk é $197 por ano.",
          "A aplicação inteira em 9 línguas, incluindo português, turco, persa e árabe.",
          "O MetaTrader 4 e 5 ligam-se com um pequeno complemento e uma chave; nunca partilhas a palavra-passe de investidor.",
          "Análise de disciplina integrada (operações de vingança, mais risco depois de perdas, excesso de operações, operar fora de horas) e acompanhamento dos limites das prop firms."
        ]
      },
      {
        "h2": "Qual escolher?"
      },
      {
        "p": "Se precisas de uma gama muito grande de integrações com corretoras ou das ferramentas mais avançadas, o Edgewonk pode servir-te melhor. Se operas no MetaTrader, queres um diário na tua língua e preferes começar grátis, experimenta o Simple Trading Journal — o plano gratuito não pede cartão."
      }
    ]
  },
  "pre-trade-checklist": {
    "title": "A checklist antes de operar: como escrever uma que vais mesmo usar",
    "description": "Porque é que uma checklist curta antes de entrar reduz as operações impulsivas, como escrever regras que se respondem com sim ou não e como verificar se a tua checklist funciona.",
    "body": [
      {
        "p": "A maioria das más operações não vem de uma má análise. São operações abertas quando o setup estava só a meio — um nível quase atingido, um sinal quase confirmado — porque ficar parado parecia pior do que agir. Uma checklist permite-te tomar essa decisão antes de o momento chegar."
      },
      {
        "h2": "Para que serve uma checklist"
      },
      {
        "p": "Uma checklist não encontra operações por ti. Filtra as que já queres abrir, para que só passem as que encaixam no teu plano. Pilotos e cirurgiões usam checklists pela mesma razão: sob pressão, as pessoas saltam passos que sabem de cor."
      },
      {
        "h2": "Regras que se respondem com sim ou não"
      },
      {
        "p": "Cada ponto deve ser uma pergunta com uma resposta clara no momento da entrada. «A tendência é de subida?» está aberta a interpretação; «O preço está acima da média móvel de 200 períodos no gráfico de 4 horas?» não está."
      },
      {
        "ul": [
          "Contexto: a direção do tempo gráfico superior é a mesma da minha operação?",
          "Local: a entrada está num nível que marquei antes da sessão, e não num que encontrei depois de o preço se mexer?",
          "Gatilho: o meu sinal de entrada fechou mesmo, ou só começou a formar-se?",
          "Risco: o stop está onde a ideia se prova errada, e o tamanho está dentro do meu risco por operação?",
          "Calendário: não há notícias de alto impacto nos próximos 30 minutos?"
        ]
      },
      {
        "h2": "Mantém-na curta"
      },
      {
        "p": "Três a sete pontos chegam. Uma lista de quinze é lida na diagonal e depois ignorada. Se um ponto nunca muda uma decisão, tira-o; se o mesmo erro continua a voltar, transforma-o num ponto."
      },
      {
        "h2": "Uma lista por estratégia"
      },
      {
        "p": "Se operas dois setups diferentes — um rompimento e um recuo, por exemplo — precisam de condições diferentes. Juntar os dois numa só lista deixa metade dos pontos sem sentido em cada operação, e marcar caixas sem sentido depressa se torna o hábito de marcar sem ler."
      },
      {
        "h2": "Verifica se funciona"
      },
      {
        "p": "Uma checklist é uma hipótese. Ao fim de 20–30 operações, compara as que tinham todos os pontos marcados com as que abriste mesmo assim. Se as completas não correm melhor, os pontos estão errados — muda-os em vez de desistir da ideia."
      },
      {
        "h2": "No Simple Trading Journal"
      },
      {
        "p": "Podes ter várias checklists com nome, uma por estratégia, escolher qual usa cada diário e marcar os pontos em cada operação. As operações que chegam do MetaTrader também recebem a checklist do diário, para a preencheres quando juntas as tuas notas."
      }
    ]
  },
  "trading-emotions-journal": {
    "title": "Registar emoções no teu diário de trading: o que anotar e como usar",
    "description": "Como etiquetar o estado emocional por trás de cada operação, que emoções costumam vir antes dos erros e como transformar essas etiquetas em regras em vez de arrependimentos.",
    "body": [
      {
        "p": "Os traders costumam conhecer os seus erros. Depois do facto, contam-te que perseguiram um movimento por medo de o perder ou que duplicaram o tamanho para recuperar uma perda. O que raramente têm é um registo de quantas vezes isso acontece e de quanto custa. Etiquetar a emoção em cada operação transforma uma sensação vaga em algo que se pode contar."
      },
      {
        "h2": "Regista no momento"
      },
      {
        "p": "Anota a emoção ao entrar ou logo depois de fechar, não no fim da semana. A memória reescreve as operações: uma operação de vingança que por acaso ganhou passa a ser «uma boa leitura», e o medo por trás de uma saída antecipada é esquecido."
      },
      {
        "h2": "Uma lista curta e fixa"
      },
      {
        "p": "Escolhe sempre do mesmo conjunto de palavras, para que as operações se possam comparar. Uma lista útil separa os estados que ajudam dos que costumam prejudicar:"
      },
      {
        "ul": [
          "Ajudam: calma, foco, confiança.",
          "Sinais de alerta: excesso de confiança, FOMO, medo, impaciência.",
          "Sinais para parar: raiva, vingança, cansaço."
        ]
      },
      {
        "p": "Uma operação pode ter mais do que uma. Estar cansado e impaciente ao mesmo tempo é comum, e vale a pena saber."
      },
      {
        "h2": "Procura padrões, não operações soltas"
      },
      {
        "p": "Uma única operação de FOMO perdedora diz pouco. Vinte, ao lado das restantes operações, dizem muito. Ao fim de um mês, agrupa as operações por emoção e compara os resultados em R: muitos traders descobrem que a maior parte das perdas se concentra em duas ou três etiquetas."
      },
      {
        "h2": "Transforma o padrão numa regra"
      },
      {
        "p": "O objetivo não é deixar de sentir; é decidir de antemão o que fazes quando reparas. Se a tua etiqueta mais cara são as operações de vingança, uma regra como «depois de duas perdas seguidas, paro por hoje» faz mais do que qualquer força de vontade. Põe a regra na tua checklist para a encontrares antes da próxima entrada, não depois."
      },
      {
        "h2": "No Simple Trading Journal"
      },
      {
        "p": "Cada operação tem um seletor de emoções com doze estados comuns — os que ajudam e os sinais de alerta em cores diferentes — e podes acrescentar as tuas próprias palavras. As etiquetas aparecem na operação e são incluídas quando exportas as operações para Excel, para as ordenares e comparares."
      }
    ]
  },
  "position-sizing-risk-per-trade": {
    "title": "Tamanho da posição: quanto arriscar por operação e como calcular o lote",
    "description": "Como escolher um risco fixo por operação, convertê-lo num tamanho de lote a partir da distância do stop e confirmar no teu diário que o cumpres mesmo.",
    "body": [
      {
        "p": "Dois traders podem abrir a mesma operação ao mesmo preço e com o mesmo stop e acabar com contas muito diferentes. A diferença é o tamanho. O tamanho da posição decide quanto te custa uma perda e, portanto, quantas perdas seguidas aguentas enquanto a tua vantagem se revela."
      },
      {
        "h2": "Começa pelo risco, não pelos lotes"
      },
      {
        "p": "Muitos traders escolhem primeiro o lote — «eu opero 1 lote» — e deixam o stop decidir quanto perdem. Assim cada perda tem um tamanho diferente. Inverte: decide que parte da conta aceitas perder se o stop for atingido e calcula o tamanho que o garante."
      },
      {
        "h2": "Escolher o risco por operação"
      },
      {
        "p": "Uma percentagem fixa da conta — muitas vezes entre 0,5% e 2% — é o ponto de partida habitual. O número importa menos do que mantê-lo constante. Com 1% de risco, dez perdas seguidas custam cerca de 10% da conta; com 5%, a mesma sequência custa perto de 40%, e cada operação seguinte tem de trabalhar muito mais para o recuperar."
      },
      {
        "p": "Numa conta de prop firm, dimensiona também pelos limites da empresa: se a perda diária máxima é 5%, um risco de 2% por operação só deixa espaço para duas perdas completas num dia."
      },
      {
        "h2": "O cálculo"
      },
      {
        "code": "Tamanho da posição = Valor em risco ÷ (Distância do stop × Valor por ponto)"
      },
      {
        "p": "Exemplo: uma conta de 10 000 $ que arrisca 1% tem 100 $ para perder. O stop em EURUSD está a 25 pips e um lote standard vale cerca de 10 $ por pip. 100 $ ÷ (25 × 10 $) = 0,4 lotes. Se o stop estiver a 50 pips, o tamanho passa para metade, 0,2 lotes — o risco continua a ser 100 $."
      },
      {
        "p": "O valor por ponto varia com o instrumento e a corretora (ouro, índices e cripto são cotados de outra forma), por isso consulta uma vez a especificação do contrato na tua plataforma e aponta-a."
      },
      {
        "h2": "Erros comuns"
      },
      {
        "ul": [
          "Afastar o stop depois de entrar sem reduzir o tamanho — o risco cresce em silêncio.",
          "Aumentar o tamanho depois de uma perda para a recuperar mais depressa.",
          "Arredondar o lote para cima todas as vezes: 0,37 passa a 0,4 e depois a 0,5.",
          "Esquecer o spread e a comissão, que tornam a perda real um pouco maior do que o previsto."
        ]
      },
      {
        "h2": "Confirma no teu diário"
      },
      {
        "p": "Regista o risco previsto em cada operação. Passadas algumas semanas, olha para as operações perdedoras: se algumas perderam duas ou três vezes o habitual, o teu tamanho não é tão fixo como pensas. Ler os resultados em R (lucro ou prejuízo a dividir pelo risco previsto) torna esses casos fáceis de ver."
      },
      {
        "h2": "No Simple Trading Journal"
      },
      {
        "p": "Cada operação tem um campo de risco e os resultados podem ser lidos em R. Podes juntar aos teus objetivos um risco máximo por operação, e a vista de disciplina assinala as operações em que, logo a seguir a uma perda, o risco subiu para mais de 1,5 vezes o da operação anterior."
      }
    ]
  },
  "revenge-trading": {
    "title": "Revenge trading: como o detetar no teu diário e travá-lo",
    "description": "Como o revenge trading aparece nos dados, porque sai tão caro e regras práticas para que a operação seguinte a uma perda não seja emocional.",
    "body": [
      {
        "p": "Fecha-se uma perda e, poucos minutos depois, voltas ao mercado — muitas vezes no mesmo instrumento, às vezes com mais tamanho — para a recuperar. Isso é revenge trading, operar por vingança. Quase todos os traders já o fizeram; a questão é com que frequência e quanto custa."
      },
      {
        "h2": "Porque sai tão caro"
      },
      {
        "p": "A operação depois de uma perda costuma ser aberta por outro motivo que não o teu plano: resolver um sentimento. O setup é mais fraco, a entrada é apressada e o tamanho tende a crescer. Um único dia mau pode desfazer semanas de trading cuidadoso."
      },
      {
        "h2": "Como aparece nos dados"
      },
      {
        "ul": [
          "Uma operação nova aberta poucos minutos depois de fechar uma perdedora.",
          "O risco dessa operação é claramente maior do que o da anterior.",
          "Várias operações seguidas num dia que começou com uma perda.",
          "Operações fora das horas em que costumas operar."
        ]
      },
      {
        "p": "Não precisas de te lembrar do que sentiste para encontrar estas operações. As horas, os tamanhos e os resultados já estão no teu diário."
      },
      {
        "h2": "Mede-o"
      },
      {
        "p": "Separa as operações que encaixam nestes padrões das restantes e compara os resultados. Se o grupo assinalado perde dinheiro enquanto o resto do teu trading está mais ou menos neutro ou positivo, encontraste a coisa mais valiosa a corrigir — e é uma regra, não uma estratégia."
      },
      {
        "h2": "Regras que ajudam"
      },
      {
        "ul": [
          "Pausa: depois de uma perda, nenhuma operação nova durante 15–30 minutos.",
          "Stop diário: depois de duas perdas seguidas ou de perder um valor fixo, o dia acabou.",
          "O tamanho nunca sobe depois de uma perda; se mudar, desce.",
          "Antes da operação seguinte, percorre a tua checklist desde o início."
        ]
      },
      {
        "p": "Escreve a regra antes da sessão. Decidir no momento é exatamente o que não funciona."
      },
      {
        "h2": "No Simple Trading Journal"
      },
      {
        "p": "A vista de disciplina lê as tuas operações e assinala a operação aberta nos 15 minutos seguintes a uma perda, o risco mais de 1,5 vezes superior ao da operação anterior depois de uma perda, os dias com muito mais operações do que o normal e as operações fora do teu horário habitual. Depois mostra quanto custaram face às restantes. As operações que chegam do MetaTrader entram automaticamente."
      }
    ]
  },
  "expectancy-and-profit-factor": {
    "title": "Expectativa e profit factor: os dois números que mostram se o teu trading funciona",
    "description": "O que são a expectativa (expectancy) e o profit factor, como calculá-los com as tuas próprias operações e porque uma taxa de acerto alta diz pouco sozinha.",
    "body": [
      {
        "p": "A taxa de acerto é o número que os traders mais citam e, sozinha, o menos útil. Uma estratégia que ganha 80% das vezes pode perder dinheiro, e uma que ganha 35% pode ser sólida. Dois números respondem à pergunta que interessa — isto dá dinheiro ao longo de muitas operações? —: a expectativa e o profit factor."
      },
      {
        "h2": "Expectativa"
      },
      {
        "p": "A expectativa é o resultado médio por operação ao longo de muitas operações."
      },
      {
        "code": "Expectativa = (Taxa de acerto × Ganho médio) − (Taxa de perda × Perda média)"
      },
      {
        "p": "Exemplo: ganhas 40% das operações, o ganho médio é 300 $ e a perda média 150 $. 0,40 × 300 − 0,60 × 150 = 120 − 90 = 30 $. Em média, cada operação acrescentou 30 $. Um número positivo significa que a abordagem funcionou nestas operações; um negativo, que não, por melhores que alguns dias tenham parecido."
      },
      {
        "p": "Expressa em R em vez de dinheiro — ganho e perda médios divididos pelo teu risco habitual —, a expectativa pode ser comparada entre contas de tamanhos diferentes e entre períodos."
      },
      {
        "h2": "Profit factor"
      },
      {
        "code": "Profit factor = Lucro bruto ÷ Prejuízo bruto"
      },
      {
        "p": "Com os mesmos números em 100 operações: 40 × 300 $ = 12 000 $ ganhos, 60 × 150 $ = 9 000 $ perdidos, um profit factor de 1,33. Acima de 1 as vencedoras pesam mais do que as perdedoras; abaixo, não. Lê-se depressa, mas ignora quantas operações foram precisas para lá chegar."
      },
      {
        "h2": "Porque a taxa de acerto engana"
      },
      {
        "p": "Uma taxa de acerto alta vem muitas vezes de fechar os lucros cedo e deixar as perdas correr. Dez ganhos de 50 $ e uma perda de 600 $ dão 91% de acerto e 100 $ de prejuízo líquido. A expectativa mostra-o logo; a taxa de acerto esconde-o."
      },
      {
        "h2": "Quantas operações chegam?"
      },
      {
        "p": "Numa amostra pequena estes números mexem muito. Vinte operações podem parecer excelentes ou péssimas por acaso. Olha para eles ao longo de pelo menos 30–50 operações e compara-os por setup, não com a conta toda misturada."
      },
      {
        "h2": "No Simple Trading Journal"
      },
      {
        "p": "A página de estatísticas mostra a expectativa, o profit factor, o rácio de pagamento, o ganho e a perda médios e a taxa de acerto, calculados a partir das tuas operações fechadas — incluindo as que chegam do MetaTrader ou são importadas de um relatório. A tabela de desempenho por setup mostra a taxa de acerto e o resultado líquido de cada um, para veres qual sustenta os teus resultados."
      }
    ]
  },
  "overtrading": {
    "title": "Overtrading: como perceber que estás a operar demasiado",
    "description": "O que é o overtrading, como aparece nos teus próprios dados, porque é que as operações a mais costumam custar dinheiro e limites simples para manter sob controlo o número de operações.",
    "body": [
      {
        "p": "Overtrading é abrir mais operações do que o teu plano pede: entradas que acontecem porque estás em frente ao ecrã, não porque o teu setup apareceu. No momento raramente parece um erro. Cada operação parece razoável por si só; o problema só se vê quando as contas."
      },
      {
        "h2": "Porque é que as operações a mais custam dinheiro"
      },
      {
        "p": "Os bons setups são limitados; o mercado não os oferece a cada hora. Quando o número de operações sobe, as que estão a mais costumam ser mais fracas: setups quase formados, entradas a meio do intervalo, operações em horas calmas. Cada operação tem ainda custos — spread, comissão, swap — que se acumulam mais depressa do que a maioria dos traders espera."
      },
      {
        "h2": "Causas comuns"
      },
      {
        "ul": [
          "Tentar recuperar uma perda (operar por vingança).",
          "O tédio num dia lento, ou a sensação de que um dia sem operações é um dia perdido.",
          "Um objetivo diário de lucro que te leva a continuar até o atingir.",
          "Descer para um timeframe menor, onde os setups aparecem mais vezes mas significam menos.",
          "Continuar depois de um grande ganho, quando a confiança está no auge."
        ]
      },
      {
        "h2": "Como o detetar no teu diário"
      },
      {
        "ul": [
          "Dias com muito mais operações do que o teu dia habitual.",
          "Resultados por número da operação no dia: a tua quarta e quinta operações são piores do que a primeira e a segunda?",
          "Operações sem setup, ou com um setup que só usas de vez em quando.",
          "Muitas operações curtas seguidas no mesmo instrumento."
        ]
      },
      {
        "p": "A comparação que interessa é simples: pega nos teus dias mais carregados e compara o resultado líquido e a taxa de acerto com os teus dias normais. Se os dias carregados forem claramente piores, o número de operações faz parte do problema."
      },
      {
        "h2": "Limites que ajudam"
      },
      {
        "ul": [
          "Um máximo de operações por dia, escrito antes da sessão — por exemplo, o teu número habitual mais uma.",
          "Parar após um número fixo de perdas, seja qual for o número de operações.",
          "Só contam os setups da tua lista de verificação; o resto não é uma operação.",
          "Uma janela horária fixa para operar; fora dela, nenhuma entrada nova."
        ]
      },
      {
        "p": "Um limite só funciona se for definido com antecedência. Na quinta operação do dia, o argumento para uma sexta vai parecer sempre convincente."
      },
      {
        "h2": "No Simple Trading Journal"
      },
      {
        "p": "A vista de disciplina calcula o teu número habitual de operações por dia a partir do teu próprio histórico e assinala os dias com mais do dobro (e pelo menos quatro operações). Precisa de pelo menos cinco dias de trading para avaliar e mostra quanto te custaram as operações desses dias em comparação com as restantes. O calendário mostra o número de operações e o resultado de cada dia, e as operações do MetaTrader entram automaticamente."
      }
    ]
  },
  "tradervue-alternative": {
    "title": "Simple Trading Journal vs Tradervue: uma comparação honesta",
    "description": "Procuras uma alternativa ao Tradervue? Preços, plano gratuito, teste e suporte ao MetaTrader lado a lado, e onde cada um é mais forte.",
    "body": [
      {
        "p": "O Tradervue é um dos diários de trading mais antigos, popular entre quem opera ações, opções e futuros dos EUA. Se procuras uma alternativa mais barata, na tua língua ou com sincronização automática do MetaTrader, é assim que o Simple Trading Journal se compara."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradervue"
          ],
          [
            "Preço mensal",
            "$14.99",
            "$29.95 – $49.95"
          ],
          [
            "Preço anual",
            "$119",
            "Não indicado na página de preços"
          ],
          [
            "Plano gratuito",
            "Sim — 2 operações por dia, sem limite de tempo",
            "Sim — 30 operações importadas por mês"
          ],
          [
            "Teste gratuito",
            "3 dias de Pro, sem cartão",
            "7 dias de Silver ou Gold; no fim é cobrado no cartão, a não ser que passes para o plano gratuito"
          ],
          [
            "Sincronização automática com o MetaTrader",
            "MT4 e MT5",
            "Não — MT4 e MT5 carregando um ficheiro de relatório"
          ],
          [
            "Como o MetaTrader se liga",
            "Complemento no MetaTrader + chave, sem partilhar palavra-passe",
            "Guardar um relatório HTML no MetaTrader e carregá-lo"
          ],
          [
            "Importação",
            "Relatório MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, qualquer CSV",
            "Uma longa lista de corretoras e plataformas; sincronização com algumas corretoras"
          ]
        ]
      },
      {
        "note": "Os preços e funcionalidades do Tradervue foram retirados das suas próprias páginas de preços, plataformas e ajuda em setembro de 2026 e podem ter mudado. Confirma no site antes de decidir."
      },
      {
        "h2": "Onde o Tradervue é mais forte"
      },
      {
        "ul": [
          "Suporte profundo a ações, opções e futuros dos EUA, com muitas corretoras e plataformas americanas.",
          "Relatórios detalhados e, no plano superior, análise de saídas e estatísticas MFE/MAE.",
          "Mentoria e partilha de operações com a comunidade.",
          "Um historial muito longo."
        ]
      },
      {
        "h2": "Onde o Simple Trading Journal é mais forte"
      },
      {
        "ul": [
          "As operações do MetaTrader 4 e 5 chegam sozinhas enquanto operas — não precisas de exportar e carregar um relatório de cada vez.",
          "O Pro custa $14.99 por mês ou $119 por ano; os planos pagos do Tradervue começam em $29.95 por mês.",
          "Teste do Pro de 3 dias sem cartão.",
          "A aplicação inteira em 9 línguas, incluindo turco, persa e árabe.",
          "Análise de disciplina incluída (operações de vingança, mais risco após perdas, overtrading, operar fora de horas) e acompanhamento dos limites de prop firms."
        ]
      },
      {
        "h2": "Qual escolher?"
      },
      {
        "p": "Se operas ações, opções ou futuros dos EUA através de uma corretora americana, o Tradervue foi feito exatamente para isso. Se operas forex, índices ou ouro no MetaTrader, queres que as operações fiquem registadas sozinhas e preferes começar grátis, experimenta o Simple Trading Journal — o plano gratuito não pede cartão."
      }
    ]
  },
  "tradesviz-alternative": {
    "title": "Simple Trading Journal vs TradesViz: uma comparação honesta",
    "description": "Procuras uma alternativa ao TradesViz? Preços, plano gratuito, teste e sincronização com o MetaTrader lado a lado, e onde cada um é mais forte.",
    "body": [
      {
        "p": "O TradesViz é um diário de trading com um conjunto enorme de estatísticas, gráficos, simuladores e ferramentas de IA. Se procuras uma alternativa mais simples, mais barata por ano, na tua língua ou gratuita para forex, é assim que o Simple Trading Journal se compara."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TradesViz"
          ],
          [
            "Preço mensal",
            "$14.99",
            "$19.99 – $29.99"
          ],
          [
            "Preço anual",
            "$119",
            "$179.88 – $269.88"
          ],
          [
            "Plano gratuito",
            "Sim — 2 operações por dia, sem limite de tempo, todos os instrumentos",
            "Sim — só ações, 3.000 execuções por mês"
          ],
          [
            "Teste gratuito",
            "3 dias de Pro, sem cartão",
            "7 dias de Pro ou Platinum"
          ],
          [
            "Sincronização automática com o MetaTrader",
            "MT4 e MT5",
            "MT4 e MT5 (planos pagos; o gratuito é só para ações)"
          ],
          [
            "Como o MetaTrader se liga",
            "Complemento no MetaTrader + chave, sem partilhar palavra-passe",
            "Número de conta + palavra-passe de investidor, ou publicação de relatórios por FTP do MetaTrader"
          ],
          [
            "Importação",
            "Relatório MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, qualquer CSV",
            "Mais de 250 corretoras e plataformas, mais de 70 ligações com sincronização automática"
          ]
        ]
      },
      {
        "note": "Os preços e funcionalidades do TradesViz foram retirados das suas próprias páginas de preços, corretoras e blogue em setembro de 2026 e podem ter mudado. Confirma no site antes de decidir."
      },
      {
        "h2": "Onde o TradesViz é mais forte"
      },
      {
        "ul": [
          "Um conjunto muito maior de estatísticas e gráficos — mais de 600, segundo o TradesViz.",
          "Simuladores de trading, repetição de operações, ferramentas de opções e um screener de ações.",
          "Ferramentas de IA que respondem a perguntas sobre as tuas operações.",
          "Muitas mais integrações com corretoras, incluindo ações, opções, futuros e criptomoedas."
        ]
      },
      {
        "h2": "Onde o Simple Trading Journal é mais forte"
      },
      {
        "ul": [
          "O plano gratuito cobre forex, índices, ouro e qualquer outro instrumento — o do TradesViz é só para ações.",
          "O Pro custa $119 por ano — o plano anual mais barato do TradesViz custa $179.88.",
          "O MetaTrader 4 e 5 ligam-se com um pequeno complemento e uma chave; nunca partilhas a palavra-passe de investidor.",
          "Uma aplicação mais simples, com menos ecrãs para aprender.",
          "A aplicação inteira em 9 línguas, incluindo turco, persa e árabe."
        ]
      },
      {
        "h2": "Qual escolher?"
      },
      {
        "p": "Se queres a análise mais profunda possível, simuladores e ferramentas de IA e vais mesmo usá-los, o TradesViz oferece mais. Se operas forex ou CFD no MetaTrader e queres um diário claro na tua língua com que possas começar grátis, experimenta o Simple Trading Journal — o plano gratuito não pede cartão."
      }
    ]
  },
  "fx-replay-alternative": {
    "title": "Simple Trading Journal vs FX Replay: para que serve cada um",
    "description": "FX Replay ou Simple Trading Journal? Um é uma plataforma de backtesting, o outro um diário das tuas operações reais. Preços, planos gratuitos e MetaTrader comparados.",
    "body": [
      {
        "p": "O FX Replay é sobretudo uma plataforma de backtesting: reproduzes gráficos históricos e praticas operações neles, e inclui um diário. O Simple Trading Journal é um diário das operações que abres de facto na tua conta. Sobrepõem-se menos do que parece — é assim que se comparam."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "FX Replay"
          ],
          [
            "Objetivo principal",
            "Registo e análise das tuas operações reais",
            "Backtesting em gráficos históricos, com diário"
          ],
          [
            "Preço mensal",
            "$14.99",
            "$17.99 – $35"
          ],
          [
            "Preço anual",
            "$119",
            "$180 – $350"
          ],
          [
            "Plano gratuito",
            "Sim — 2 operações por dia, sem limite de tempo",
            "Sim — 2 sessões de backtesting, 1 indicador, dados guardados 1 semana"
          ],
          [
            "Teste gratuito",
            "3 dias de Pro, sem cartão",
            "Sim, sem cartão (duração não indicada)"
          ],
          [
            "MetaTrader",
            "Sincronização automática de MT4 e MT5 com complemento + chave",
            "MT4 e MT5 carregando um ficheiro"
          ],
          [
            "Importação",
            "Relatório MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, qualquer CSV",
            "Qualquer CSV; ficheiros do NinjaTrader, Tradovate e MT4/MT5"
          ]
        ]
      },
      {
        "note": "Os preços e funcionalidades do FX Replay foram retirados das suas próprias páginas de preços e do diário em setembro de 2026 e podem ter mudado. Confirma no site antes de decidir."
      },
      {
        "h2": "Onde o FX Replay é mais forte"
      },
      {
        "ul": [
          "Backtesting: reproduzir o preço passado vela a vela, com dados ao segundo no plano Pro.",
          "Um simulador de desafios de prop firms para praticar com as regras do desafio.",
          "Testar uma estratégia numa amostra grande antes de arriscar dinheiro.",
          "Uma comunidade ativa no Discord."
        ]
      },
      {
        "h2": "Onde o Simple Trading Journal é mais forte"
      },
      {
        "ul": [
          "As tuas operações reais do MetaTrader 4 e 5 ficam registadas sozinhas enquanto operas.",
          "O Pro custa $14.99 por mês ou $119 por ano.",
          "Análise de disciplina sobre operações reais: vingança, mais risco após perdas, overtrading, operar fora de horas.",
          "Acompanhamento dos limites da prop firm na tua conta de desafio real.",
          "A aplicação inteira em 9 línguas, incluindo turco, persa e árabe."
        ]
      },
      {
        "h2": "Qual escolher?"
      },
      {
        "p": "Fazem trabalhos diferentes. Para testar uma estratégia com dados passados, o FX Replay foi feito para isso. Para registar e rever as operações que fazes de facto — sobretudo no MetaTrader —, usa o Simple Trading Journal. Muitos traders usam uma ferramenta de backtesting e um diário lado a lado; aqui o plano gratuito não pede cartão."
      }
    ]
  },
  "forex-trading-journal": {
    "title": "Diário de trading de forex: o que registar e como rever",
    "description": "O que deve ter um diário de forex — par, sessão, spread, pips, risco em R — como o preencher automaticamente a partir do MetaTrader e uma revisão semanal de 15 minutos.",
    "body": [
      {
        "p": "Um diário de trading de forex é o registo de cada operação que fazes e da razão por trás dela. O forex acrescenta detalhes que os diários de ações raramente precisam: muitos pares, três sessões principais, spreads e swaps, e resultados que se contam em pips, em dinheiro ou em unidades de risco. Um diário que os capte mostra-te onde está de facto a tua vantagem, ou a tua fuga."
      },
      {
        "h2": "O que registar em cada operação"
      },
      {
        "ul": [
          "Par e direção (compra ou venda).",
          "Hora de entrada e a sessão em que caiu: asiática, Londres ou Nova Iorque.",
          "Setup e motivo da entrada, numa frase.",
          "Entrada, stop loss, take profit e tamanho do lote.",
          "Risco em dinheiro e em percentagem da conta, para exprimires o resultado em R.",
          "Resultado em pips, em dinheiro e em R.",
          "Spread, comissão e swap.",
          "Qualquer notícia perto da operação.",
          "Como te sentias antes e depois, e uma captura do gráfico."
        ]
      },
      {
        "h2": "Porque é que só os pips não chegam"
      },
      {
        "p": "Contar pips ignora o tamanho do lote e o valor do pip, que muda de par para par. Dez pips numa posição grande podem custar mais do que quarenta numa pequena. Regista também o resultado em dinheiro e em R e compara as operações assim."
      },
      {
        "h2": "Padrões que vale a pena procurar no forex"
      },
      {
        "ul": [
          "Resultado por sessão: corre-te melhor em Londres do que em Nova Iorque?",
          "Resultado por par: poucos pares costumam dar quase todo o lucro e um só quase toda a perda.",
          "Resultado por dia da semana e por hora.",
          "Operações perto de notícias face a períodos calmos.",
          "Tempo de detenção e swap: as operações que passam a noite comportam-se de forma diferente?"
        ]
      },
      {
        "h2": "Deixa o MetaTrader preencher por ti"
      },
      {
        "p": "Escrever cada operação à mão é a principal razão para as pessoas abandonarem o diário. Com o complemento para MetaTrader 4 e 5, cada operação chega sozinha com entrada, saída, stop loss, lote, comissão e swap. Tu só acrescentas o que a plataforma não pode saber: o setup, o teu raciocínio e como te sentias."
      },
      {
        "h2": "Uma revisão semanal em 15 minutos"
      },
      {
        "ol": [
          "Vê o total em dinheiro e em R, não só em pips.",
          "Divide a semana por sessão e por par e encontra o grupo mais fraco.",
          "Lê as operações que quebraram as tuas regras e conta quanto custaram.",
          "Escolhe uma única coisa para mudar na semana seguinte.",
          "Escreve-a no topo do diário e confirma-a na sexta-feira."
        ]
      },
      {
        "note": "Um diário mostra o que fizeste e quanto custou. Não prevê o que o mercado vai fazer e não é aconselhamento de investimento."
      }
    ]
  },
  "trading-glossary": {
    "title": "Glossário de trading: os termos que todo trader encontra",
    "description": "Definições claras de pip, lote, spread, alavancagem, stop loss, drawdown, múltiplo R, rácio risco-retorno, taxa de acerto, expectativa, fator de lucro, swap, slippage e limite de perda diária.",
    "body": [
      {
        "p": "Definições curtas e claras dos termos que mais aparecem ao operar e ao ler um diário de trading. Estão pela ordem em que costumas encontrá-los."
      },
      {
        "h2": "Pip"
      },
      {
        "p": "A unidade padrão de movimento do preço no forex. Na maioria dos pares é a quarta casa decimal (0,0001); nos pares com iene, a segunda (0,01). Um movimento de 1,0850 para 1,0851 é um pip."
      },
      {
        "h2": "Lote"
      },
      {
        "p": "O tamanho de uma operação. Um lote padrão são 100.000 unidades da moeda base, um minilote 10.000 e um microlote 1.000 (0,01 lote)."
      },
      {
        "h2": "Spread"
      },
      {
        "p": "A diferença entre o preço de compra (ask) e o de venda (bid). É um custo que pagas à entrada, por isso toda a operação começa ligeiramente no negativo."
      },
      {
        "h2": "Alavancagem"
      },
      {
        "p": "Exposição emprestada que te deixa controlar uma posição maior do que o teu saldo, por exemplo 1:30. Multiplica por igual ganhos e perdas. O teu risco real é definido pelo stop loss e pelo tamanho do lote, não pelo número da alavancagem."
      },
      {
        "h2": "Stop loss"
      },
      {
        "p": "Ordem que fecha uma operação a um preço definido para limitar a perda. A distância da entrada ao stop, vezes o tamanho do lote, é o valor que arriscas nessa operação."
      },
      {
        "h2": "Drawdown"
      },
      {
        "p": "A queda desde um máximo do saldo (ou do capital) até um mínimo posterior, em valor ou em percentagem. O drawdown máximo é a queda mais funda num período."
      },
      {
        "h2": "Múltiplo R"
      },
      {
        "p": "Um resultado medido em unidades do que arriscaste. Se arriscas 100 $ e ganhas 250 $, a operação é +2,5R; um stop completo é −1R. Permite comparar operações de tamanhos diferentes."
      },
      {
        "h2": "Rácio risco-retorno"
      },
      {
        "p": "O ganho potencial dividido pelo risco. Um stop a 20 pips com um alvo a 40 pips é um rácio de 1:2, ou 2R."
      },
      {
        "h2": "Taxa de acerto"
      },
      {
        "p": "A proporção de operações que fecharam com lucro. Sozinha diz pouco; lê-a junto com o ganho médio e a perda média."
      },
      {
        "h2": "Expectativa"
      },
      {
        "p": "O resultado médio por operação, de preferência em R: (taxa de acerto × ganho médio) − (taxa de erro × perda média). Uma expectativa positiva em muitas operações é o que parece um método que funciona no papel."
      },
      {
        "h2": "Fator de lucro"
      },
      {
        "p": "O lucro bruto dividido pela perda bruta. Acima de 1 ganhaste mais do que perdeste; 1,5 significa 1,50 $ ganhos por cada 1 $ perdido."
      },
      {
        "h2": "Swap"
      },
      {
        "p": "Uma taxa ou crédito por manter uma posição depois da viragem diária, com base na diferença de taxas de juro entre as duas moedas. Aparece no registo da operação."
      },
      {
        "h2": "Slippage (derrapagem)"
      },
      {
        "p": "A diferença entre o preço esperado e o preço obtido, sobretudo em mercados rápidos ou em torno de notícias."
      },
      {
        "h2": "Limite de perda diária"
      },
      {
        "p": "Uma regra, comum em contas de prop firms, que reprova a conta ou termina o teu dia quando a perda de um dia ultrapassa um valor ou percentagem fixados da conta."
      },
      {
        "note": "Estas definições são educativas e não constituem aconselhamento de investimento."
      }
    ]
  },
  "max-drawdown-explained": {
    "title": "Drawdown máximo: como calcular e por que recuperar é mais difícil do que perder",
    "description": "Como medir o drawdown máximo no seu histórico de operações, por que uma perda de 50% exige um ganho de 100% para recuperar e como funcionam os limites de drawdown estático e móvel em contas de prop firm.",
    "body": [
      {
        "p": "O drawdown máximo é a maior queda que a sua conta sofreu, de um pico até o ponto mais baixo seguinte, antes de atingir um novo pico. Ele responde a uma pergunta que nem a taxa de acerto nem o lucro total respondem: até onde foi o pior momento e você teria aguentado?"
      },
      {
        "h2": "Como calcular"
      },
      {
        "p": "Acompanhe o saldo operação por operação. Toda vez que ele faz uma nova máxima, esse é o pico. O drawdown em qualquer momento é quanto o saldo está abaixo do último pico; o drawdown máximo é a maior dessas distâncias."
      },
      {
        "code": "Drawdown = Pico − Saldo atual\nDrawdown % = (Pico − Saldo atual) ÷ Pico × 100"
      },
      {
        "p": "Exemplo: uma conta sobe para US$ 10.000, cai para US$ 8.000 num período ruim e volta a subir. O drawdown é de US$ 2.000, ou 20%. Se não vier depois uma queda mais profunda, 20% é o drawdown máximo. Ele é medido a partir do pico, não de onde você começou nem da sua última operação."
      },
      {
        "note": "Um drawdown calculado com operações encerradas subestima a queda real. Enquanto uma posição está aberta, a perda flutuante pode levar a conta mais abaixo do que a curva de operações encerradas jamais mostra."
      },
      {
        "h2": "Por que recuperar é mais difícil do que perder"
      },
      {
        "p": "Uma perda e o ganho necessário para desfazê-la não são o mesmo número, porque o ganho é calculado sobre um saldo menor. Depois de perder 20%, você precisa de +25% para voltar, não de +20%."
      },
      {
        "table": [
          [
            "Perda a partir do pico",
            "Ganho necessário para recuperar"
          ],
          [
            "10%",
            "11.1%"
          ],
          [
            "20%",
            "25%"
          ],
          [
            "30%",
            "42.9%"
          ],
          [
            "40%",
            "66.7%"
          ],
          [
            "50%",
            "100%"
          ],
          [
            "60%",
            "150%"
          ]
        ]
      },
      {
        "p": "É por isso que controlar o drawdown importa mais do que perseguir retorno. Quanto mais fundo o buraco, mais longe você está do ritmo normal da sua vantagem e mais tentador fica arriscar mais — assim os drawdowns viram contas estouradas."
      },
      {
        "h2": "Como o risco por operação molda o drawdown"
      },
      {
        "p": "Sequências de perdas são normais em qualquer estratégia; o risco por operação define quanto elas custam. Com 1% de risco, dez perdas seguidas tiram cerca de 9,6% da conta. Com 5%, as mesmas dez perdas tiram cerca de 40%. Pense ao contrário: decida qual drawdown você aceita e escolha um tamanho que mantenha uma sequência ruim dentro dele."
      },
      {
        "h2": "Contas de prop firm: estático versus móvel"
      },
      {
        "p": "As prop firms impõem um limite de drawdown, e a forma de medi-lo muda tudo."
      },
      {
        "ul": [
          "Estático: o limite é contado a partir do saldo inicial. Numa conta de US$ 100.000 com limite de 10%, o piso é US$ 90.000 e fica ali.",
          "Móvel (trailing): o piso acompanha o maior saldo atingido. Com limite de US$ 10.000 e um saldo que chegou a US$ 105.000, o piso subiu para US$ 95.000 — o lucro aproxima o piso. Algumas empresas param de acompanhar quando o piso chega ao saldo inicial; leia a regra exata.",
          "Saldo ou equity: algumas empresas medem só as operações encerradas, outras incluem as posições abertas, de modo que uma perda flutuante pode contar antes de você fechar a operação."
        ]
      },
      {
        "p": "Os mesmos números podem ser seguros numa regra e fatais em outra. Veja qual a sua empresa usa antes de definir o tamanho das operações."
      },
      {
        "h2": "Como usar na prática"
      },
      {
        "ul": [
          "Coloque o seu drawdown máximo ao lado do seu mês médio. Se um único drawdown apaga o lucro de vários meses, o risco é alto demais para a sua vantagem.",
          "Veja quanto os drawdowns duram, não só a profundidade: meses abaixo do pico desgastam a disciplina.",
          "Defina uma regra de antemão — por exemplo, reduza o risco pela metade depois de perder certa porcentagem a partir do pico e volte ao normal só após uma nova máxima.",
          "Olhe o que você fez dentro do drawdown: tamanhos maiores, mais operações, checklist ignorado? Essa é a parte que você pode mudar."
        ]
      },
      {
        "h2": "No Simple Trading Journal"
      },
      {
        "p": "Suas estatísticas mostram o drawdown máximo em dinheiro, e o gráfico de drawdown traça a distância até o último pico após cada operação encerrada, para você ver a profundidade e a duração de cada queda. Numa conta prop, a tela de progresso acompanha quanto do limite de perda total foi usado (a partir do saldo inicial no drawdown estático, do maior saldo no móvel) e mostra o piso acima do qual você deve ficar. Ambos se baseiam em operações encerradas."
      }
    ]
  },
};

export default TEXT;
