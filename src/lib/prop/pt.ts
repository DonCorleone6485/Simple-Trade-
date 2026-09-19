import { PropPack } from './core';

/** Texto em português. A ordem das opções acompanha o array points em core.ts. */
const pt: PropPack = {
  drawdown: {
    title: 'Tipo da linha de perda máxima (Drawdown)',
    short: 'A linha de morte da conta — passou para baixo, acabou. A pergunta é se essa linha fica parada desde o início ou sobe à medida que você lucra. Uma linha que sobe estoura a conta no momento em que você devolve o lucro no papel. É a diferença mais decisiva entre uma conta e outra.',
    options: [
      'Fixa — definida no início e nunca se mexe (Static)',
      'Segue o saldo fechado e trava no ponto de equilíbrio',
      'Segue o saldo fechado, sem travar (Balance/EOD trailing)',
      'Segue também o lucro em aberto (Equity trailing)',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Toda conta tem uma "linha de morte" — se o seu dinheiro cai abaixo dela, a conta é encerrada. Importa onde ela está, mas **como ela se comporta** importa tanto quanto. Há três modelos:' },
      { p: '**Fixa (Static):** definida no início e não se mexe durante toda a vida da conta. Você lucrar, sacar ou dobrar o saldo não muda nada. O lado bom: quanto mais você lucra, maior fica a distância até ela, ou seja, mais espaço para respirar.' },
      { p: '**Segue o saldo fechado (Balance/EOD trailing):** a linha sobe atrás dos lucros que você **fecha**. A oscilação de uma posição aberta não a move — ela só sobe quando você encerra a operação. Em algumas firmas essa linha para ao alcançar o saldo inicial e vira fixa na prática; isso é claramente melhor que a versão que sobe sempre.' },
      { p: '**Segue também o lucro em aberto (Equity trailing):** o modelo mais perigoso. A linha sobe até com lucro que você ainda não realizou. A posição entra um instante no lucro, a linha trava mais alto e, quando esse lucro evapora — sem você perder um dólar real —, a conta pode ir embora.' },
      { h: 'Exemplo (conta de $100.000, linha de 10%)' },
      { p: 'Digamos que você abriu uma posição em ouro: primeiro foi a +$5.000 de lucro, depois voltou e você fechou no zero a zero.' },
      {
        table: {
          head: ['Momento', 'Saldo', 'Equity', 'Linha fixa', 'Linha Equity trailing'],
          rows: [
            ['Início', '$100.000', '$100.000', '$90.000', '$90.000'],
            ['Posição +$5.000 no lucro', '$100.000', '$105.000', '$90.000', '**$95.000** ↑'],
            ['Lucro evaporou, equity caiu', '$100.000', '$94.000', 'Seguro', '**Linha violada — conta perdida**'],
          ],
        },
      },
      { p: 'Com a linha fixa nada aconteceu. Com equity trailing a conta fechou mesmo com o dinheiro no bolso intacto — porque a linha tinha subido atrás de um lucro que você nunca embolsou.' },
      { p: '**O que acontece conforme você lucra?** Imagine que o saldo chega a $120.000. Com linha fixa o piso continua em $90.000 — você tem $30.000 de espaço. Com trailing a linha subiu junto até $110.000 e o seu espaço fica sempre nos mesmos $10.000.' },
    ],
  },

  news: {
    title: 'Operar durante notícias',
    short: 'Você pode abrir e fechar operações no momento de notícias de alto impacto? Se há restrição, o que importa não é a restrição em si, mas **o preço de violá-la**: apaga-se só o lucro daquela operação ou a conta é encerrada?',
    options: [
      'Totalmente liberado, sem janela de bloqueio',
      'Liberado com um pacote pago (add-on)',
      'Há janela de bloqueio (±2, ±4, ±5 min), operação aberta antes fica isenta',
      'Há janela de bloqueio; na violação apaga-se só o lucro',
      'Há janela de bloqueio; na violação a conta é encerrada',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Indicadores de alto impacto como NFP, CPI e FOMC criam movimentos enormes em segundos. As firmas não gostam desse risco, então a maioria impõe uma **janela de bloqueio**: você não pode abrir nem fechar operações 2, 4 ou 5 minutos antes e depois do dado.' },
      { p: 'Mas o decisivo não é a janela, e sim **o que acontece quando ela é violada**. Você verá três desfechos:' },
      {
        ul: [
          '**Apaga-se só o lucro daquela operação** → irrita, mas a conta segue',
          '**A conta é encerrada** → um erro acaba com tudo',
          '**Há isenção** → algumas firmas dizem: "se a operação foi aberta 4-5 horas antes, não contamos como operação de notícia"',
        ],
      },
      { p: 'E há um detalhe que muita gente não percebe: em algumas firmas a violação acontece **mesmo sem você fazer nada**. Se o stop ou o alvo de uma posição aberta horas antes dispara dentro daquela janela, isso também conta como fechar operação na janela.' },
      { h: 'Exemplo' },
      { p: 'Às 10:00 você comprou ouro com alvo em $4.120. Às 15:30 sai o NFP e a janela de bloqueio vai das 15:28 às 15:32.' },
      { p: '**Cenário A — firma que apaga o lucro:** o pico da notícia bateu no seu alvo às 15:29. A operação fechou com +$2.000, mas esse lucro é apagado da conta. A conta continua; você apenas não fica com o ganho.' },
      { p: '**Cenário B — firma que encerra a conta:** aconteceu o mesmo, mas a sua conta foi encerrada. Você nem estava olhando a tela; o sistema disparou a ordem — ainda assim contou como violação.' },
      { p: '**Cenário C — firma com isenção:** você abriu às 10:00, cinco horas e meia antes do dado. A firma não trata como operação de notícia e o lucro é seu.' },
      { p: '**Consequência prática:** numa firma do cenário B, antes de cada notícia importante você precisa afastar da janela os stops e alvos de todas as posições abertas. Dezenas de vezes por mês. Esquecer uma vez e a conta se vai.' },
    ],
  },

  floating: {
    title: 'Limite de perda em posições abertas (Floating)',
    short: 'Um limite à parte que olha a perda **ainda não realizada** das suas posições abertas. Ultrapassou o limiar, o sistema fecha tudo na hora — mesmo que você nem tenha chegado perto do limite diário. A regra mais traiçoeira para quem mantém várias operações ao mesmo tempo.',
    options: [
      'Não existe',
      'Existe, limiar de 4% ou mais',
      'Existe, limiar de 3%',
      'Existe, limiar de 2%',
      'Existe, limiar abaixo de 2%',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Normalmente você conhece dois limites de perda: o diário e o total. Este é um terceiro e funciona diferente — olha **apenas a perda não realizada das suas posições abertas**.' },
      { p: 'Se passar do limiar o sistema não espera: fecha todas as posições de uma vez. Em algumas firmas a conta também é encerrada; em outras a primeira vez rende punição (corte na divisão de lucros) e a segunda encerra a conta.' },
      { p: 'Por que é traiçoeira? Porque **você pode nem ter chegado perto do limite diário**. Você abre posições que, uma a uma, têm risco razoável, mas as perdas abertas se somam, passam do limiar e o sistema te tira do mercado — talvez a um passo de elas virarem.' },
      { h: 'Exemplo (conta de $100.000, limiar de 2% = $2.000)' },
      { p: 'De manhã você abriu três operações, cada uma arriscando $1.000:' },
      { ul: ['XAUUSD comprado → agora −$700', 'EURUSD comprado → agora −$700', 'GBPUSD comprado → agora −$700'] },
      { p: '**Perda aberta total: −$2.100** → o sistema entra e fecha as três.' },
      { p: 'Sendo que:' },
      {
        ul: [
          'o seu limite diário era $5.000 e você nem chegou perto',
          'nenhum stop tinha sido tocado, as três ainda podiam virar',
          'o seu risco total era apenas 3% da conta',
        ],
      },
      { p: 'Ou seja, você não forçou nenhuma regra de propósito, mas aos olhos do sistema "a perda em aberto ficou grande demais".' },
      { p: '**Regra prática:** se esse limite existe, o risco somado de todas as posições abertas ao mesmo tempo precisa ficar abaixo do limiar. Numa conta de $100K com limiar de 2%, o risco aberto total não pode passar de $2.000 — ou seja, para quatro operações, cada uma arrisca no máximo $500.' },
    ],
  },

  dailyBase: {
    title: 'Base de cálculo da linha diária de perda',
    short: 'A linha diária zera e é recalculada todo dia. Sobre o quê? Se usam o maior dos dois, o lucro no papel que você carrega pela noite empurra a linha para cima — ao devolvê-lo no dia seguinte, a conta pode estourar sem uma única perda real.',
    options: [
      'Não há limite diário',
      'Baseada no saldo — lucro em aberto não empurra a linha',
      'Usa-se o maior entre saldo e equity',
      'Calculada a partir do pico de equity do dia',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'A linha diária de perda zera e é recalculada todo dia. Mas **sobre o que** ela é calculada muda de firma para firma, e a diferença é vital:' },
      { p: '**Baseada no saldo:** a linha parte do dinheiro fechado no início do dia. Lucro ou prejuízo de posição aberta não entram na conta. O modelo mais seguro.' },
      { p: '**O maior dos dois:** no início do dia olham saldo e equity e usam o maior. Ou seja, se a sua posição da noite está no lucro, esse lucro no papel empurra a linha para cima.' },
      { p: '**A partir do pico de equity do dia:** o modelo mais duro. No instante em que você entra no lucro durante o dia, a linha trava mais alto.' },
      { p: 'Por que importa? Porque no segundo e no terceiro modelo você pode perder a conta **sem nenhuma perda real** — apenas devolvendo lucro no papel.' },
      { h: 'Exemplo (conta de $100.000, limite diário de 5%)' },
      { p: 'À meia-noite o saldo é $100.000 e a posição aberta em ouro está +$10.000 (equity $110.000).' },
      { p: '**Firma baseada no saldo:** linha = $100.000 − $5.000 = **$95.000**. No dia seguinte o lucro evapora e você fecha no zero a zero → equity $100.000. Você está $5.000 longe da linha, sem problema.' },
      { p: '**Firma que usa o maior:** linha = $110.000 × 0,95 = **$104.500**. No dia seguinte evaporam $5.500 → equity cai para $104.500. **Conta encerrada.**' },
      { p: 'Repare: no segundo caso o dinheiro no seu bolso ainda é $100.000. Você não perdeu um centavo real. Só devolveu um lucro que nunca embolsou e a conta se foi.' },
      { p: '**Regra prática:** se a firma usa o maior, quanto maior o lucro no papel que você leva para a meia-noite, mais estreito fica o seu espaço no dia seguinte. Virar o dia com lucro flutuante acima de cerca de 5% da conta é entrar em zona de perigo.' },
    ],
  },

  consistency: {
    title: 'Regra de consistência (distribuição do lucro)',
    short: 'O seu melhor dia não pode passar de certa fatia do lucro total. Não encerra a conta, mas segura o pagamento. Atenção: em algumas firmas não existe na avaliação e entra em vigor depois do financiamento.',
    options: ['Não existe', '50% ou mais', '40% – 49%', '30% – 39%', 'Abaixo de 30%'],
    detail: [
      { h: 'Explicação' },
      { p: 'A regra diz: **o lucro de um único dia não pode ultrapassar certa porcentagem do lucro total.** A firma quer descobrir se você deu uma tacada de sorte ou se realmente sabe o que faz.' },
      { p: 'Ponto importante: essa regra **não encerra** a conta. Ela tranca o seu dinheiro. Até cumpri-la você precisa continuar operando e aumentar o lucro total para que aquele dia grande encolha em porcentagem.' },
      { p: 'Tem uma armadilha: em algumas firmas ela não existe na fase de avaliação, mas passa a valer depois do financiamento. As condições de pagamento precisam ser lidas à parte.' },
      { h: 'Exemplo (conta de $100.000, regra de 35%)' },
      { p: 'Digamos que você bateu a meta com $7.000 de lucro total. A regra: o melhor dia não pode passar de 35% do total. $7.000 × 0,35 = **$2.450**' },
      { p: '**Caso A:** o seu melhor dia foi $2.000. Sem problema, você recebe.' },
      { p: '**Caso B:** o seu melhor dia foi $4.000. Regra violada — pagamento travado. O que fazer? $4.000 ÷ 0,35 = **$11.429**' },
      { p: 'Ou seja, para legitimar aquele único dia você precisa levar o lucro total a $11.429. Não dá para parar em $7.000 e receber: é preciso ganhar mais $4.400.' },
      { p: '**Quem sofre e quem não:** quem junta lucros pequenos todo dia nem sente a regra. Quem ganha em notícias ou em poucas tacadas grandes esbarra nela sempre — a estratégia concentra o lucro em poucos dias por natureza.' },
      { p: '**Quanto maior a porcentagem, melhor:** a 50% um dia pode ser metade do total (confortável); a 15%, apenas um sétimo (muito apertado).' },
    ],
  },

  overnight: {
    title: 'Segurar posição de um dia para o outro',
    short: 'Poder manter a posição aberta pela noite, atravessando a virada do dia. Se for proibido, tudo que você abrir tem de ser fechado no fim da sessão.',
    options: ['Liberado', 'Liberado com um pacote pago (add-on)', 'Proibido — fecha automaticamente no fim da sessão'],
    detail: [
      { h: 'Explicação' },
      { p: 'O direito de manter a posição através da virada do dia. Parece pequeno, mas define a sua estratégia diretamente.' },
      { p: 'Se for proibido, toda posição precisa ser fechada no mesmo dia — o sistema fecha tudo no fim da sessão. Aí você não faz swing, não pega movimentos de vários dias e não leva uma posição de notícia para o dia seguinte.' },
      { p: 'Em algumas firmas é liberado, mas dentro de um pacote pago. Em outras é liberado, porém o juro overnight (swap) é caro — principalmente em índices e petróleo, onde alguns dias de carrego comem o lucro.' },
      { h: 'Exemplo' },
      { p: 'Na quinta-feira você viu uma boa compra em ouro; o movimento que você quer leva dois ou três dias.' },
      { p: '**Numa firma que libera:** você abre, carrega pela sexta e pela segunda e fecha no alvo. Paga apenas o swap.' },
      { p: '**Numa firma que proíbe:** tem de fechar no mesmo dia. Se o movimento seguir à noite, você perde. No dia seguinte precisa entrar de novo — mas o preço já pode ter ido. Além disso, comissão e spread se multiplicam porque você entra de novo todo dia.' },
      { p: '**Quem sofre e quem não:** o scalper que entra e sai dentro do dia nem sente a regra. Para quem segura swing ou posição de notícia, a conta fica inutilizável.' },
    ],
  },

  payout: {
    title: 'Frequência de pagamento',
    short: 'Com que frequência você pode sacar o lucro e quanto espera pelo primeiro saque? Lucro não sacado continua sempre sob risco.',
    options: [
      'Quando quiser (On-demand)',
      'Semanal (7 dias)',
      '10 – 14 dias',
      'Cai para 14 dias com pacote pago (add-on)',
      'Mensal (28 – 30 dias)',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Com que frequência você consegue tirar o dinheiro. Não coloca a conta em risco, mas não esqueça: **lucro parado na conta não é seu dinheiro.** Enquanto não sacar, ele segue sob risco — uma violação de regra, um dia ruim, e some.' },
      { p: 'Duas coisas a observar: quanto você espera pelo primeiro pagamento e com que frequência o ciclo se repete depois.' },
      { h: 'Exemplo' },
      { p: 'Você foi financiado e lucrou $5.000 no primeiro mês.' },
      { p: '**Firma com saque sob demanda:** você solicita no mesmo dia em que o lucro aparece e em poucos dias úteis está na sua conta. O dinheiro passa a ser realmente seu.' },
      { p: '**Firma com pagamento mensal:** são 30 dias de espera. Nesse período você pode ter uma semana ruim e devolver parte, ou violar uma regra e perder os $5.000 inteiros. Nesse caso o número que você via na conta era só um número: nunca chegou ao bolso.' },
      { p: '**Consequência prática:** a frequência de pagamento não é sobre "quão rápido eu fico rico", e sim sobre **quão rápido você tira risco da mesa**. Uma firma que paga com frequência deixa você garantir o lucro antes.' },
    ],
  },

  riskPerTrade: {
    title: 'Limite de risco por operação ou instrumento',
    short: 'Além do limite diário, um teto à parte para quanto você pode arriscar em uma única operação ou em um único instrumento. Posições no mesmo instrumento costumam ser somadas e contadas como uma só.',
    options: [
      'Não existe',
      'Existe, limiar de 3% ou mais',
      'Existe, limiar de 2% – 3%',
      'Existe, limiar abaixo de 2%',
      'Existe teto de lotes (por instrumento)',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Além dos limites diário e total, um teto que define quanto você pode arriscar **em uma operação ou um instrumento**. Aparece em duas formas:' },
      { p: '**Por porcentagem:** "em uma ideia você pode arriscar no máximo 2% da conta". Detalhe importante: várias posições no mesmo instrumento e na mesma direção normalmente contam como **uma operação**, ou seja, os riscos se somam.' },
      { p: '**Por lotes (teto de lotes):** "no ouro, no máximo 3 lotes". É mais rígido porque limita o tamanho absoluto da posição, não o risco.' },
      { h: 'Exemplo 1 — por porcentagem (conta de $100.000, 2% = $2.000)' },
      { p: 'Você comprou ouro em três entradas separadas, arriscando $800 em cada. Você vê três operações; a firma vê uma ideia só: $800 × 3 = **$2.400** → limite estourado, violação.' },
      { h: 'Exemplo 2 — teto de lotes (3 lotes no ouro)' },
      { p: 'Você quer arriscar $2.500 no ouro. O lote necessário depende da distância do stop:' },
      {
        table: {
          head: ['Distância do stop', 'Lote necessário', 'Resultado'],
          rows: [
            ['$20', '1,25 lote', '✓ Sem problema'],
            ['$10', '2,5 lotes', '✓ Sem problema'],
            ['$5', '5 lotes', '✗ Teto de 3 lotes — no máximo $1.500 de risco'],
          ],
        },
      },
      { p: 'Ou seja, com stop curto você matematicamente não alcança o risco desejado. O teto de lotes limita diretamente quem usa stops apertados.' },
    ],
  },

  stopLoss: {
    title: 'Regra de stop-loss',
    short: 'Colocar stop é obrigatório? O stop colocado precisa ficar visível na plataforma? O método de colocar o stop, tirar e fechar na mão quando o preço chega conta como stop oculto em algumas firmas e é proibido.',
    options: [
      'Não é obrigatório, sem exigência de visibilidade',
      'Não é obrigatório, mas se colocado deve ficar visível',
      'Obrigatório (deve ser colocado dentro de um prazo)',
      'Obrigatório + exigência de distância máxima',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Contém duas perguntas distintas:' },
      { p: '**Colocar stop é obrigatório?** Algumas firmas exigem stop em toda posição dentro de um prazo. Outras não se metem.' },
      { p: '**O stop precisa ficar visível?** Regra menos conhecida, porém importante. Alguns traders colocam o stop, depois tiram e fecham na mão quando o preço chega — para não cair na "caça aos stops". Algumas firmas chamam isso de **stop oculto (stealth stop)** e proíbem. Para elas o stop precisa ser uma ordem real, presente na plataforma durante toda a vida da posição.' },
      { p: 'Por que se importam? Porque calculam o próprio risco a partir dos seus stops visíveis. Um trader cujo stop não aparece é, para elas, um trader cujo risco não pode ser medido.' },
      { h: 'Exemplo' },
      { p: 'Digamos que você comprou ouro e colocou o stop a $10, depois tirou e disse "se o preço chegar eu fecho na mão".' },
      { p: '**Numa firma sem a regra:** sem problema, você gerencia como quiser.' },
      { p: '**Numa firma com exigência de visibilidade:** conta como violação. Aparece como padrão no seu histórico (posições sem stop, fechamentos sempre manuais) e você cai em revisão.' },
      { p: '**A solução — o melhor dos dois mundos:** coloque o stop **largo** desde o início (onde os picos não alcançam) e reduza o tamanho da posição na mesma proporção — o seu risco em dólares não muda. A decisão real de saída continua sendo sua, na mão, quando o preço chega ao seu nível mental. Mas na plataforma sempre existe um stop de segurança.' },
      { p: 'O bônus: você fica protegido quando a internet cai, quando dorme ou quando a plataforma trava. O stop mental só funciona enquanto você está na frente da tela.' },
    ],
  },

  minDays: {
    title: 'Mínimo de dias operados',
    short: 'O número mínimo de dias para passar, mesmo com a meta já batida. A diferença crítica: basta **abrir uma operação** ou é preciso **lucrar** naquele dia?',
    options: [
      'Não há (0 dias)',
      '1 – 4 dias, dias simples (sem exigência de lucro)',
      '5 dias ou mais, dias simples',
      'Há exigência de dia lucrativo',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Mesmo com a meta de lucro batida, para passar você precisa ter operado em certo número de dias distintos. A ideia é eliminar quem passa com uma tacada de sorte. A diferença crítica:' },
      { p: '**Dia simples:** basta **abrir** uma posição naquele dia. Lucro ou prejuízo, o dia conta. Até uma operação bem pequena preenche o dia.' },
      { p: '**Dia lucrativo:** naquele dia você precisa **lucrar** um valor definido (em geral 0,5% da conta). Dia em que você perdeu, ou lucrou pouco, não conta.' },
      { p: 'A diferença é enorme. A exigência de dia simples só te faz esperar. A de dia lucrativo tira das suas mãos em quantos dias você passa — se o mercado não der oportunidade, você espera.' },
      { h: 'Exemplo (conta de $50.000, 3 dias lucrativos, 0,5% = $250)' },
      {
        table: {
          head: ['Dia', 'Operações fechadas no dia', 'Líquido', 'Contou?'],
          rows: [
            ['Segunda', '+$415, −$403', '+$12', '✗ (abaixo de $250)'],
            ['Terça', '+$139, +$368', '+$507', '✓'],
            ['Quarta', '+$989', '+$989', '✓'],
            ['Quinta', '−$658', '−$658', '✗'],
            ['Sexta', '+$2.814', '+$2.814', '✓'],
          ],
        },
      },
      { p: 'Três dias lucrativos completos. Mas repare: segunda não contou mesmo com duas operações, porque o líquido foi $12. Quinta não contou porque fechou no prejuízo. Numa firma com exigência de "dia simples", os cinco dias teriam contado.' },
      { p: '**Mais um detalhe:** em algumas firmas "dia" é o dia em que a posição foi **aberta**. Uma posição aberta na segunda e fechada na quarta conta só a segunda; não preenche terça nem quarta.' },
    ],
  },

  payoutDrawdown: {
    title: 'Comportamento da linha depois do saque',
    short: 'Ao sacar, o saldo cai — a linha de perda cai junto ou fica onde estava? Se ficar, cada saque estreita a sua folga.',
    options: [
      'O saque não afeta a linha; o piso desce na mesma proporção',
      'O piso fica, a folga estreita no valor sacado',
      'O piso trava no saldo inicial',
    ],
    detail: [
      { h: 'Explicação' },
      { p: 'Quando você saca, o saldo cai. E a linha de perda? Três possibilidades:' },
      { p: '**A linha também desce:** desce na proporção do saque e a sua folga é preservada. O melhor caso.' },
      { p: '**A linha fica:** o saldo cai mas a linha permanece — então a distância entre os dois, o seu espaço de manobra, estreita. O modelo mais comum.' },
      { p: '**A linha trava no saldo inicial:** no momento do saque ela é fixada no nível de partida. Se sacar todo o lucro, a folga fica exatamente zero.' },
      { p: 'Esse terceiro caso é perigoso porque a conta parece "cheia" no papel mas pode fechar com uma única perda pequena.' },
      { h: 'Exemplo (conta de $100.000, firma que trava o piso em $100.000)' },
      { p: 'Você lucrou $10.000 e o saldo está $110.000.' },
      { p: '**Caso A — sacou $5.000:** saldo $105.000, piso $100.000 → **folga de $5.000.** Você segue tranquilo.' },
      { p: '**Caso B — sacou os $10.000 inteiros:** saldo $100.000, piso $100.000 → **folga zero.** Na primeira operação, basta cair o equivalente a spread e comissão para o equity ficar abaixo de $100.000 e a conta fechar. O saque é processado, mas você perde a conta.' },
      { p: '**Regra prática:** a folga que sobra depois do saque precisa ser claramente maior que o risco total que você pode ter aberto ao mesmo tempo. Se três operações somam $3.000 de risco, deixe ao menos $5.000-6.000 de folga depois de sacar. Nunca saque todo o lucro.' },
    ],
  },

  weekend: {
    title: 'Segurar posição no fim de semana',
    short: 'Levar a posição do fechamento de sexta à abertura de segunda. É uma regra separada da noturna. Mesmo liberado, o swap sobe em índices e petróleo e o gap de segunda pode pular o seu stop.',
    options: ['Liberado', 'Liberado com um pacote pago (add-on)', 'Proibido — fecha automaticamente no fechamento de sexta'],
    detail: [
      { h: 'Explicação' },
      { p: 'O direito de manter a posição do fechamento de sexta à abertura de segunda. É uma **regra separada** da noturna — algumas firmas liberam as noites da semana mas proíbem o fim de semana.' },
      { p: 'Se for proibido, tudo precisa ser fechado antes do fechamento de sexta; normalmente o sistema fecha sozinho. Mesmo liberado, vale conhecer dois efeitos colaterais:' },
      { p: '**Custo de swap:** no fim de semana costuma-se cobrar juros de três dias. Em índices e petróleo o número pode ser sério; em forex e ouro é mais razoável.' },
      { p: '**Risco de gap:** o mercado fecha na sexta e abre na segunda a outro preço. Se sair uma notícia no meio, o preço pode abrir muito além do seu stop — ou seja, o stop não protege e você perde mais do que planejou.' },
      { h: 'Exemplo' },
      { p: 'Na sexta você está comprado em ouro com stop a $50.' },
      { p: '**Cenário normal:** segunda abre um pouco abaixo, o stop funciona normalmente e você toma o prejuízo planejado.' },
      { p: '**Cenário de gap:** no fim de semana houve um evento geopolítico. Na segunda o ouro abriu $80 abaixo do fechamento de sexta. O seu stop estava a $50, mas o primeiro preço negociado está $80 abaixo — a posição fecha ali. Você toma quase o dobro do prejuízo planejado.' },
      { p: 'Por isso, ao carregar pelo fim de semana, deixe mais distância do que o normal até as suas linhas diária e total.' },
    ],
  },
};

export default pt;
