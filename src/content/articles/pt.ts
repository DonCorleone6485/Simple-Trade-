/** Yazıların pt metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  'metatrader-5-auto-sync': {
    title: 'Como ligar o MetaTrader 5 ao teu diário de trading',
    description: 'Passo a passo: instala o complemento do Simple Trading Journal no MT5 para que cada operação fechada chegue sozinha ao teu diário, com stop loss, risco e custos incluídos.',
    body: [
      { p: 'Escrever cada operação à mão é a principal razão pela qual as pessoas deixam de manter um diário. Com o complemento do MetaTrader 5, cada operação é registada no momento em que abre e completada quando fecha: entrada, saída, stop loss, lotes, comissão e swap. Tu só acrescentas o que o MetaTrader não pode saber: o teu setup, o teu raciocínio e como te sentias.' },
      { note: "Usas o MetaTrader 4? Os passos são os mesmos: no ecrã do MetaTrader escolhe MetaTrader 4, descarrega SimpleTradingJournal.mq4 e coloca-o em MQL4 → Experts. O MetaTrader 4 compila-o sozinho ao reiniciar." },
      { h2: 'O que precisas' },
      { ul: [
        'MetaTrader 5 em Windows ou Mac (o terminal de computador; a app móvel não corre complementos).',
        'Uma conta Simple Trading Journal com pelo menos um diário.',
        'Dois minutos.',
      ] },
      { h2: '1. Descarrega o complemento' },
      { p: 'Na app, abre MetaTrader no menu e descarrega SimpleTradingJournal.ex5. No MetaTrader escolhe File → Open Data Folder, entra em MQL5 → Experts e coloca lá o ficheiro.' },
      { note: 'No Mac, «Open Data Folder» não funciona em algumas versões. No Finder usa Ir → Ir para a pasta e cola: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts' },
      { h2: '2. Permite a ligação' },
      { p: 'O MetaTrader bloqueia os pedidos à internet dos complementos, a não ser que autorizes o endereço. Vai a Tools → Options → Expert Advisors, marca «Allow WebRequest for listed URL» e acrescenta:' },
      { code: 'https://www.simpletradejournal.io' },
      { h2: '3. Reinicia o MetaTrader' },
      { p: 'Fecha o MetaTrader e volta a abri-lo. O SimpleTradingJournal aparece agora em Expert Advisors, no painel Navigator à esquerda.' },
      { h2: '4. Arrasta-o para um gráfico e cola a chave' },
      { p: 'Na app, cria uma chave de ligação (começa por stj_). Arrasta o SimpleTradingJournal para qualquer gráfico, abre o separador Inputs, cola a chave em ApiKey e clica em OK. Quando o canto superior esquerdo do gráfico indicar que a ligação está a funcionar, está feito.' },
      { p: 'Cada chave pertence a um diário e fica presa à primeira conta de trading que se liga com ela, por isso as operações de duas contas nunca se misturam no mesmo diário. Para uma segunda conta, cria uma segunda chave.' },
      { h2: 'Em que gráfico o ponho?' },
      { p: 'O MetaTrader corre um só expert advisor por gráfico. Se já usas outro EA, abre um gráfico novo e vazio só para o complemento do diário e deixa-o aberto: cada operação fechada chega sozinha enquanto continuas a operar nos outros gráficos. Se preferires não manter um gráfico extra, podes pôr o complemento num gráfico só quando quiseres sincronizar; ele apanha tudo o que fechou entretanto.' },
      { h2: 'O que fica registado' },
      { ul: [
        'Símbolo, direção, lotes, preço e hora de entrada e de saída.',
        'Stop loss e take profit. O stop com que entraste é mantido mesmo que o movas depois, para que o teu risco e os teus múltiplos R continuem fiéis.',
        'Resultado bruto, comissão, swap e resultado líquido.',
        'Uma posição fechada por partes (TP1, TP2…) é registada como uma só operação quando fecha totalmente.',
      ] },
      { h2: 'Resolução de problemas' },
      { ul: [
        'Não chega nada: confirma que o endereço do passo 2 é exatamente https://www.simpletradejournal.io, que o gráfico com o complemento continua aberto e que a chave foi colada sem espaços.',
        '«Chave associada a outra conta»: a chave já pertence a outra conta de trading. Cria uma chave nova para esta conta.',
        'Perdi a chave: o MetaTrader lembra-se dela. Se a perdeste mesmo, cria uma nova na app e revoga a antiga.',
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
      { p: 'Queres que isto aconteça sozinho? Liga o MetaTrader 5 uma vez e as operações fechadas chegam automaticamente — vê o guia do MetaTrader 5.' },
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
      { p: 'Quando uma operação tem stop loss — escrito à mão, importado de um relatório ou sincronizado do MetaTrader 5 — o risco e o múltiplo R são calculados automaticamente, e as tuas estatísticas mostram o R realizado médio ao lado dos resultados em dinheiro.' },
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
};

export default TEXT;
