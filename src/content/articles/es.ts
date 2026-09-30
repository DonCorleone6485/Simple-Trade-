/** Yazıların es metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  'metatrader-5-auto-sync': {
    title: "Cómo conectar MetaTrader 4 o 5 a tu diario de trading",
    description: "Paso a paso: instala el complemento de Simple Trading Journal en MT4 o MT5 para que cada operación cerrada llegue sola a tu diario, con stop loss, riesgo y comisiones incluidos.",
    body: [
      { p: "Escribir cada operación a mano es la principal razón por la que la gente deja de llevar un diario. Con el complemento de MetaTrader (MT4 y MT5), cada operación se registra en el momento en que se abre y se completa al cerrarse: entrada, salida, stop loss, lotes, comisión y swap. Tú solo añades lo que MetaTrader no puede saber: tu setup, tu razonamiento y cómo te sentías." },
      { note: "¿MetaTrader 4 o 5? Los pasos son los mismos para ambos; solo cambian el archivo y la carpeta. En la pantalla de MetaTrader de la app elige primero tu versión: MetaTrader 5 usa SimpleTradingJournal.ex5 y MQL5 → Experts; MetaTrader 4 usa SimpleTradingJournal.ex4 y MQL4 → Experts." },
      { h2: 'Qué necesitas' },
      { ul: [
        "MetaTrader 4 o MetaTrader 5 en Windows o Mac (la terminal de escritorio; la app móvil no ejecuta complementos).",
        'Una cuenta de Simple Trading Journal con al menos un diario.',
        'Dos minutos.',
      ] },
      { h2: '1. Descarga el complemento' },
      { p: "En la app, abre MetaTrader desde el menú, elige MetaTrader 4 o 5 y descarga el complemento (SimpleTradingJournal.ex5 para MT5, SimpleTradingJournal.ex4 para MT4). En MetaTrader elige File → Open Data Folder, entra en MQL5 → Experts (MQL4 → Experts en MT4) y deja ahí el archivo." },
      { note: "En Mac, «Open Data Folder» no funciona en algunas versiones. En el Finder usa Ir → Ir a la carpeta y pega la ruta de tu versión. MetaTrader 5: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts — MetaTrader 4: ~/Library/Application Support/net.metaquotes.wine.metatrader4/drive_c/Program Files (x86)/MetaTrader 4/MQL4/Experts" },
      { h2: '2. Permite la conexión' },
      { p: 'MetaTrader bloquea las conexiones a internet de los complementos salvo que permitas la dirección. Ve a Tools → Options → Expert Advisors, marca «Allow WebRequest for listed URL» y añade:' },
      { code: 'https://www.simpletradejournal.io' },
      { h2: '3. Reinicia MetaTrader' },
      { p: 'Cierra MetaTrader y vuelve a abrirlo. SimpleTradingJournal aparecerá en Expert Advisors, en el panel Navigator de la izquierda.' },
      { h2: '4. Arrástralo a un gráfico y pega tu clave' },
      { p: "En la app, crea una clave de conexión (empieza por stj_). Arrastra SimpleTradingJournal a cualquier gráfico, abre la pestaña Inputs, pega la clave en ApiKey y pulsa OK. Cuando la esquina superior izquierda del gráfico indique que la conexión funciona, habrás terminado. Ahí también verás a qué diario van las operaciones (Journal: …); comprueba que sea el correcto." },
      { p: 'Cada clave pertenece a un diario y se vincula a la primera cuenta de trading que se conecta con ella, así que las operaciones de dos cuentas nunca se mezclan en el mismo diario. Para una segunda cuenta, crea una segunda clave.' },
      { h2: '¿En qué gráfico lo pongo?' },
      { p: 'MetaTrader ejecuta un solo asesor experto por gráfico. Si ya usas otro EA, abre un gráfico nuevo y vacío solo para el complemento del diario y déjalo abierto: cada operación cerrada llegará sola mientras sigues operando en tus otros gráficos. Si prefieres no mantener un gráfico extra, puedes poner el complemento en un gráfico solo cuando quieras sincronizar; recogerá todo lo que se haya cerrado entretanto.' },
      { h2: 'Qué se registra' },
      { ul: [
        'Símbolo, dirección, lotes, precio y hora de entrada y de salida.',
        'Stop loss y take profit. El stop con el que entraste se conserva aunque luego lo muevas, para que tu riesgo y tus múltiplos R sigan siendo fieles.',
        'Resultado bruto, comisión, swap y resultado neto.',
        "En MetaTrader 5, una posición cerrada por partes (TP1, TP2…) se registra como una sola operación cuando se cierra del todo. En MetaTrader 4, un cierre parcial da al resto de la orden un número nuevo, así que aparece como una operación aparte.",
      ] },
      { h2: 'Solución de problemas' },
      { ul: [
        'No llega nada: comprueba que la dirección del paso 2 es exactamente https://www.simpletradejournal.io, que el gráfico con el complemento sigue abierto y que la clave se pegó sin espacios.',
        "«Clave vinculada a otra cuenta»: la clave ya pertenece a otra cuenta de trading. Crea una clave nueva para esta cuenta.", "Las operaciones llegan al diario equivocado: la línea «Journal:» del gráfico muestra adónde van. Si indica otro diario, el complemento sigue usando una clave antigua. Abre Inputs, borra ApiKey por completo, pega la clave nueva, pulsa Enter y luego OK. La clave antigua se cierra sola en cuanto se conecta la nueva.", "En MetaTrader 4 el complemento aparece en gris y no se puede arrastrar: usa el archivo SimpleTradingJournal.ex4 descargado desde la pantalla de MetaTrader y luego haz clic derecho en Expert Advisors, en el panel Navigator, y elige Refresh.",
        "He perdido la clave: MetaTrader la recuerda. Si de verdad la perdiste, crea una nueva en la app; la anterior se cierra sola en cuanto se conecta la nueva.",
      ] },
      { p: '¿Prefieres no instalar nada? También puedes importar el propio informe de MetaTrader: consulta la guía de importación.' },
    ],
  },
  'import-trade-history': {
    title: 'Cómo importar tu historial de operaciones a un diario de trading',
    description: 'Importa operaciones cerradas de MetaTrader 4/5, cTrader, TradeLocker, DXtrade o Match-Trader. Cómo obtener el informe correcto, qué se lee de él y cómo se evitan los duplicados.',
    body: [
      { p: 'Si ya llevas meses operando, no tienes que escribirlo todo. Exporta un informe de tu plataforma y suéltalo en el diario: el archivo se lee en tu navegador, la plataforma se reconoce automáticamente y ves todas las operaciones antes de guardar nada.' },
      { h2: 'Plataformas compatibles' },
      { ul: ['MetaTrader 5 y MetaTrader 4 (el informe HTML)', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader', 'Cualquier otro CSV: tú eliges qué columna es la fecha, el símbolo, la dirección y el resultado'] },
      { h2: 'Cómo obtener el informe correcto de MetaTrader' },
      { ol: [
        'En MetaTrader abre la Toolbox (Ctrl+T) y ve a la pestaña History.',
        'Haz clic derecho dentro de la lista y elige el periodo que quieras (por ejemplo, «All history»).',
        'Clic derecho de nuevo → Report, y guárdalo como HTML.',
      ] },
      { note: 'No uses el informe de cuenta que solo muestra el balance y las posiciones abiertas: no contiene operaciones cerradas. Si el importador dice que no encontró operaciones cerradas, casi siempre es por esto.' },
      { h2: 'Importar' },
      { ol: [
        'En la app elige Importar y selecciona el diario al que irán las operaciones.',
        'Arrastra el archivo a la ventana o haz clic para elegirlo.',
        'Revisa la vista previa: símbolo, dirección, lotes, precios, horas y resultado neto de cada operación.',
        'Confirma. Las operaciones aparecen en tu diario, tu calendario y tus estadísticas.',
      ] },
      { h2: 'Qué se lee del informe' },
      { ul: [
        'El resultado neto: no solo el beneficio bruto; se tienen en cuenta comisión, swap y cargos.',
        'El stop loss, para calcular el riesgo y el múltiplo R de cada operación.',
        'Precios y horas de entrada y de salida.',
      ] },
      { h2: 'Importar el mismo archivo dos veces' },
      { p: 'Cada operación lleva su identificador de la plataforma, así que una operación que ya está en el diario se omite en vez de añadirse otra vez. Puedes importar un informe actualizado cada semana sin limpiar nada. Si registraste una operación a mano mientras seguía abierta, la importación completa ese registro en lugar de crear uno segundo.' },
      { p: "¿Quieres que ocurra solo? Conecta MetaTrader 4 o 5 una vez y las operaciones cerradas llegarán automáticamente: consulta la guía de MetaTrader." },
    ],
  },
  'how-to-keep-a-trading-journal': {
    title: 'Cómo llevar un diario de trading que de verdad vayas a usar',
    description: 'Qué registrar en cada operación, cada cuánto revisarlo y los hábitos que convierten el diario de trading de una hoja de cálculo abandonada en tu herramienta más útil.',
    body: [
      { p: 'La mayoría de los traders coincide en que un diario ayuda, y la mayoría deja de llevarlo en pocas semanas. Rara vez es falta de disciplina: el diario pide demasiado en el momento equivocado y no devuelve nada. Un diario que de verdad vas a usar se rellena rápido, se revisa rápido y te muestra algo que no verías por tu cuenta.' },
      { h2: 'Qué registrar en cada operación' },
      { p: 'Divídelo entre lo que sabe la plataforma y lo que solo sabes tú.' },
      { ul: [
        'Los hechos: símbolo, dirección, entrada, salida, stop loss, tamaño y resultado después de costes. Nunca deberían escribirse a mano: impórtalos o sincronízalos desde tu plataforma.',
        'El plan: qué setup era y por qué entraste. Basta con una línea.',
        'El estado: cómo te sentías al entrar: tranquilo, aburrido, con prisa, intentando recuperar una pérdida.',
        'Una captura del gráfico en la entrada, si el setup es visual.',
      ] },
      { h2: 'Mide en R, no en dinero' },
      { p: 'Ganar 300 dólares, por sí solo, dice poco. Si arriesgaste 100 fue una operación de 3R; si arriesgaste 600 fue medio R y una mala operación que salió bien de casualidad. Registrar tu stop permite al diario expresar cada resultado como múltiplo de lo que arriesgaste, y ese es el número que muestra si tu ventaja es real.' },
      { h2: 'Revisa con un calendario' },
      { ul: [
        'A diario, dos minutos: ¿he seguido hoy mi plan? ¿Hay algo que anotar mientras lo tengo fresco?',
        'Cada semana, quince minutos: qué setups ganaron dinero, cuáles lo perdieron y en qué días y sesiones.',
        'Cada mes: ¿la curva de capital sube gracias a los setups en los que creo o a pesar de ellos?',
      ] },
      { h2: 'Busca comportamientos, no solo estadísticas' },
      { p: 'La tasa de acierto y el R medio te dicen qué pasó. Las preguntas más útiles son sobre cómo te comportaste: ¿abriste otra operación minutos después de una pérdida? ¿Subió tu tamaño tras perder? ¿Operaste algunos días mucho más de lo que permite tu plan, o fuera de tu horario habitual? Estos patrones cuestan más que cualquier mal setup y es fácil pasarlos por alto operación a operación.' },
      { p: 'Simple Trading Journal revisa automáticamente estos cuatro hábitos —operar por venganza, subir el riesgo tras una pérdida, sobreoperar y operar fuera de tu horario habitual— en todos tus diarios.' },
      { h2: 'Que cueste poco' },
      { ul: [
        'Automatiza los hechos para que registrar una operación lleve segundos, no minutos.',
        'Usa una lista de comprobación corta antes de entrar en lugar de notas largas después.',
        'Etiqueta los setups de forma coherente: cinco setups usados a diario valen más que cincuenta usados una vez.',
        'Lleva diarios separados para cuentas separadas, como un challenge de prop firm y una cuenta personal.',
      ] },
      { h2: 'Empieza con poco' },
      { p: 'No necesitas un sistema perfecto el primer día. Registra los hechos automáticamente, añade una línea sobre por qué entraste en cada operación y míralo una vez por semana. En un mes tendrás algo que ningún indicador te puede dar: pruebas sobre tu propio trading.' },
    ],
  },
  'r-multiple-explained': {
    title: 'Múltiplos R explicados: juzga cada operación por el riesgo que asumiste',
    description: 'Qué es un múltiplo R, cómo calcularlo a partir del stop loss y por qué la expectativa en R es la forma más clara de saber si una estrategia tiene ventaja.',
    body: [
      { p: 'El dinero es una mala forma de comparar operaciones. El mismo beneficio de 200 dólares puede ser excelente o temerario según cuánto arriesgaste para conseguirlo. Los múltiplos R lo resuelven midiendo cada resultado frente al riesgo que asumiste.' },
      { h2: '¿Qué es 1R?' },
      { p: '1R es lo que perderías si la operación toca tu stop loss. Compras en 1,1000 con 1 lote y el stop en 1,0950: 1R es lo que te cuestan esos 50 pips, digamos 500 dólares.' },
      { h2: 'Cómo calcular el múltiplo R' },
      { code: 'Múltiplo R = resultado de la operación ÷ riesgo inicial (1R)' },
      { ul: [
        'Ganaste 1.000 dólares con 500 en riesgo: +2R.',
        'Perdiste 500 en el stop: −1R.',
        'Perdiste 750 por deslizamiento o por mover el stop: −1,5R, señal de que algo salió mal.',
        'Cerraste antes con 150: +0,3R.',
      ] },
      { h2: 'Por qué importa' },
      { p: 'Cuando todas las operaciones están en R, los resultados se pueden comparar entre tamaños, instrumentos y cuentas. Puedes ver que un setup con un 40 % de acierto es excelente porque sus ganadoras promedian +2,5R, o que un 70 % de acierto es un problema porque las perdedoras promedian −3R.' },
      { h2: 'Expectativa' },
      { p: 'La expectativa es tu R medio por operación. Suma el R de todas las operaciones y divídelo por el número de operaciones.' },
      { code: 'Expectativa = R total ÷ número de operaciones' },
      { p: 'Una expectativa positiva significa que, de media, cada operación te ha hecho ganar dinero respecto al riesgo asumido. 0,3R en 100 operaciones son 30R; con un 1 % de riesgo por operación, alrededor de un 30 % antes del interés compuesto. Con expectativa negativa, más operaciones no ayudan: hay que cambiar el setup, la ejecución o la gestión del riesgo.' },
      { h2: 'Errores frecuentes' },
      { ul: [
        'No registrar el stop. Sin él no hay 1R ni múltiplo R.',
        'Usar el stop movido en lugar del original. R mide el riesgo que aceptaste al entrar.',
        'Ignorar los costes. Comisión y swap forman parte del resultado; una operación de +1R puede quedarse en +0,9R tras los costes.',
        'Juzgar un setup con un puñado de operaciones. Mira al menos 30 antes de sacar conclusiones.',
      ] },
      { h2: 'En Simple Trading Journal' },
      { p: "Cuando una operación tiene stop loss —introducido a mano, importado de un informe o sincronizado desde MetaTrader—, su riesgo y su múltiplo R se calculan automáticamente, y tus estadísticas muestran tu R realizado medio junto a tus resultados en dinero." },
    ],
  },
  'prop-firm-daily-loss-and-drawdown': {
    title: 'Pérdida diaria y drawdown máximo: cómo seguir las reglas de una prop firm sin romperlas',
    description: 'Cómo suelen funcionar los límites de pérdida diaria, el drawdown máximo y los objetivos de beneficio de las prop firms, por qué la mayoría de los challenges se pierden por una regla y no por una mala operación, y cómo saber siempre tu distancia al límite.',
    body: [
      { p: 'Los challenges de prop firm rara vez se pierden porque la estrategia deje de funcionar. Se pierden un martes por la tarde, cuando un trader, tras tres pérdidas, no se da cuenta de que está a 180 dólares del límite diario. Las reglas son sencillas; lo difícil es saber exactamente, operación a operación, dónde estás respecto a ellas.' },
      { note: 'Cada empresa redacta sus reglas a su manera y las cambia con el tiempo. Consulta siempre las reglas vigentes de tu empresa: este artículo explica los tipos habituales, no los de una empresa concreta.' },
      { h2: 'Los tres números que deciden un challenge' },
      { ul: [
        'Objetivo de beneficio: la ganancia que debes alcanzar, normalmente un porcentaje del balance inicial.',
        'Límite de pérdida diaria: cuánto puedes perder en un día de trading. Las empresas difieren en si se mide desde el balance o el equity de inicio del día y en cuándo se reinicia el día.',
        'Pérdida máxima (drawdown): cuánto puede caer la cuenta en total. Puede ser estática (medida desde el balance inicial) o dinámica (sigue hacia arriba tu balance o equity máximo).',
      ] },
      { h2: 'Drawdown estático frente a dinámico' },
      { p: 'Con un límite estático en una cuenta de 100.000 dólares y una pérdida máxima del 10 %, la cuenta falla por debajo de 90.000, pase lo que pase antes. Con un límite dinámico, si la cuenta sube primero a 105.000, el suelo sube con ella, a 95.000 en este ejemplo. Los límites dinámicos castigan devolver beneficios, así que la distancia al límite puede reducirse incluso en una semana ganadora.' },
      { h2: 'Por qué los challenges se pierden por las reglas' },
      { ul: [
        'Las pérdidas llegan en rachas. Tres stops seguidos en una sesión es normal, y con un 1 % de riesgo por operación más costes suele bastar para tocar el límite diario.',
        'Las operaciones abiertas cuentan. Con reglas basadas en equity, una pérdida flotante puede romper el límite antes de cerrar ninguna operación.',
        'Comisiones y swap cuentan. El límite ve tu resultado neto, no el bruto.',
        'Bajo presión cambia el comportamiento. Las operaciones de venganza y el tamaño mayor tras una pérdida son justo lo que convierte un mal día en un challenge perdido.',
      ] },
      { h2: 'Una rutina de protección sencilla' },
      { ol: [
        'Dimensiona las posiciones para que una racha perdedora normal no alcance el límite diario; por ejemplo, no arriesgues más de un tercio del límite diario por operación.',
        'Antes de cada operación, comprueba a qué distancia estás de los límites diario y máximo.',
        'Ponte un stop personal mucho antes que el de la empresa: si has perdido la mitad del límite diario, para por hoy.',
        'Revisa cada día en que te acercaste al límite. El patrón suele repetirse.',
      ] },
      { h2: 'Seguimiento en Simple Trading Journal' },
      { p: 'Marca un diario como cuenta prop, introduce el objetivo de beneficio, el límite de pérdida diaria y la pérdida máxima de la empresa, y el diario te muestra a qué distancia estás de cada uno mientras operas. Los límites de pérdida pasan a ámbar y luego a rojo al acercarte; el objetivo de beneficio se vuelve verde según te aproximas. El análisis de disciplina señala las operaciones de venganza y el aumento de riesgo tras las pérdidas, los hábitos que acaban con la mayoría de los challenges.' },
    ],
  },
  // --- karşılaştırmalar (scripts: compare_gen) ---
  'tradezella-alternative': {
    "title": "Simple Trading Journal frente a Tradezella: una comparación honesta",
    "description": "¿Buscas una alternativa a Tradezella? Precios, plan gratuito, prueba y sincronización con MetaTrader lado a lado, y en qué destaca cada uno.",
    "body": [
      {
        "p": "Tradezella es uno de los diarios de trading más conocidos. Si buscas una alternativa más barata, en tu idioma o con plan gratuito, así se compara Simple Trading Journal."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradezella"
          ],
          [
            "Precio mensual",
            "$14.99",
            "$35 – $99"
          ],
          [
            "Precio anual",
            "$119",
            "$315 – $891"
          ],
          [
            "Plan gratuito",
            "Sí — 2 operaciones al día, sin límite de tiempo",
            "No"
          ],
          [
            "Prueba gratuita",
            "3 días de Pro, sin tarjeta",
            "No figura en su página de precios"
          ],
          [
            "Sincronización automática con MetaTrader",
            "MT4 y MT5",
            "MT4 y MT5"
          ],
          [
            "Cómo se conecta MetaTrader",
            "Complemento en MetaTrader + clave, sin compartir contraseña",
            "Número de cuenta + contraseña de inversor"
          ],
          [
            "Importación",
            "Informe MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, cualquier CSV",
            "Más de 500 brókers y prop firms"
          ]
        ]
      },
      {
        "note": "Los precios y funciones de Tradezella se tomaron de sus propias páginas de precios y ayuda en septiembre de 2026 y pueden haber cambiado. Consulta su web antes de decidir."
      },
      {
        "h2": "Dónde destaca Tradezella"
      },
      {
        "ul": [
          "Muchas más integraciones con brókers y prop firms: más de 500, según Tradezella.",
          "Más trayectoria y más funciones en sus planes superiores.",
          "Las cuentas MT4 y MT5 se sincronizan sin instalar nada en MetaTrader."
        ]
      },
      {
        "h2": "Dónde destaca Simple Trading Journal"
      },
      {
        "ul": [
          "Un plan gratuito sin límite de tiempo (2 operaciones al día) y 3 días de Pro sin tarjeta.",
          "Pro cuesta $14.99 al mes o $119 al año; la opción más barata de Tradezella es $35 al mes.",
          "Toda la aplicación en 9 idiomas, incluidos español, turco, persa y árabe.",
          "MetaTrader 4 y 5 se conectan con un pequeño complemento y una clave; nunca compartes tu contraseña de inversor.",
          "Análisis de disciplina integrado (operaciones de venganza, más riesgo tras pérdidas, sobreoperar, operar fuera de horario) y seguimiento de límites de prop firms."
        ]
      },
      {
        "h2": "¿Cuál elegir?"
      },
      {
        "p": "Si necesitas una gama muy amplia de integraciones con brókers o sus herramientas más avanzadas, Tradezella puede encajarte mejor. Si operas en MetaTrader, quieres un diario en tu idioma y prefieres empezar gratis, prueba Simple Trading Journal: el plan gratuito no pide tarjeta."
      }
    ]
  },
  'tradersync-alternative': {
    "title": "Simple Trading Journal frente a TraderSync: una comparación honesta",
    "description": "¿Buscas una alternativa a TraderSync? Precios, plan gratuito, prueba y sincronización con MetaTrader lado a lado, y en qué destaca cada uno.",
    "body": [
      {
        "p": "TraderSync es uno de los diarios de trading más conocidos. Si buscas una alternativa más barata, en tu idioma o con plan gratuito, así se compara Simple Trading Journal."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TraderSync"
          ],
          [
            "Precio mensual",
            "$14.99",
            "$29.95 – $79.95"
          ],
          [
            "Precio anual",
            "$119",
            "$269.52 – $719.52"
          ],
          [
            "Plan gratuito",
            "Sí — 2 operaciones al día, sin límite de tiempo",
            "No"
          ],
          [
            "Prueba gratuita",
            "3 días de Pro, sin tarjeta",
            "7 días, sin tarjeta"
          ],
          [
            "Sincronización automática con MetaTrader",
            "MT4 y MT5",
            "MT4 y MT5"
          ],
          [
            "Importación",
            "Informe MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, cualquier CSV",
            "Más de 200 brókers y plataformas"
          ]
        ]
      },
      {
        "note": "Los precios y funciones de TraderSync se tomaron de sus propias páginas de precios y ayuda en septiembre de 2026 y pueden haber cambiado. Consulta su web antes de decidir."
      },
      {
        "h2": "Dónde destaca TraderSync"
      },
      {
        "ul": [
          "Más de 200 brókers y plataformas compatibles.",
          "Un asistente de IA (Cypher) y repetición de operaciones en sus planes superiores.",
          "Una prueba de 7 días con todas las funciones, sin tarjeta."
        ]
      },
      {
        "h2": "Dónde destaca Simple Trading Journal"
      },
      {
        "ul": [
          "Un plan gratuito sin límite de tiempo (2 operaciones al día) y 3 días de Pro sin tarjeta.",
          "Pro cuesta $14.99 al mes o $119 al año; la opción más barata de TraderSync es $29.95 al mes.",
          "Toda la aplicación en 9 idiomas, incluidos español, turco, persa y árabe.",
          "MetaTrader 4 y 5 se conectan con un pequeño complemento y una clave; nunca compartes tu contraseña de inversor.",
          "Análisis de disciplina integrado (operaciones de venganza, más riesgo tras pérdidas, sobreoperar, operar fuera de horario) y seguimiento de límites de prop firms."
        ]
      },
      {
        "h2": "¿Cuál elegir?"
      },
      {
        "p": "Si necesitas una gama muy amplia de integraciones con brókers o sus herramientas más avanzadas, TraderSync puede encajarte mejor. Si operas en MetaTrader, quieres un diario en tu idioma y prefieres empezar gratis, prueba Simple Trading Journal: el plan gratuito no pide tarjeta."
      }
    ]
  },
  'edgewonk-alternative': {
    "title": "Simple Trading Journal frente a Edgewonk: una comparación honesta",
    "description": "¿Buscas una alternativa a Edgewonk? Precios, plan gratuito, prueba y sincronización con MetaTrader lado a lado, y en qué destaca cada uno.",
    "body": [
      {
        "p": "Edgewonk es uno de los diarios de trading más conocidos. Si buscas una alternativa más barata, en tu idioma o con plan gratuito, así se compara Simple Trading Journal."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Edgewonk"
          ],
          [
            "Precio mensual",
            "$14.99",
            "— (solo anual)"
          ],
          [
            "Precio anual",
            "$119",
            "$197"
          ],
          [
            "Plan gratuito",
            "Sí — 2 operaciones al día, sin límite de tiempo",
            "No"
          ],
          [
            "Prueba gratuita",
            "3 días de Pro, sin tarjeta",
            "No — garantía de devolución de 14 días"
          ],
          [
            "Sincronización automática con MetaTrader",
            "MT4 y MT5",
            "MT4 y MT5"
          ],
          [
            "Cómo se conecta MetaTrader",
            "Complemento en MetaTrader + clave, sin compartir contraseña",
            "Publicación de informes por FTP de MetaTrader"
          ],
          [
            "Importación",
            "Informe MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, cualquier CSV",
            "Muchas plataformas (ver su página de importación)"
          ]
        ]
      },
      {
        "note": "Los precios y funciones de Edgewonk se tomaron de sus propias páginas de precios y ayuda en septiembre de 2026 y pueden haber cambiado. Consulta su web antes de decidir."
      },
      {
        "h2": "Dónde destaca Edgewonk"
      },
      {
        "ul": [
          "Un diario veterano con un único plan que incluye todas las funciones.",
          "Garantía de devolución de 14 días.",
          "Sincronización automática de MT4 y MT5 con la publicación de informes del propio MetaTrader."
        ]
      },
      {
        "h2": "Dónde destaca Simple Trading Journal"
      },
      {
        "ul": [
          "Un plan gratuito sin límite de tiempo (2 operaciones al día) y 3 días de Pro sin tarjeta.",
          "Pro cuesta $14.99 al mes o $119 al año; la opción más barata de Edgewonk es $197 al año.",
          "Toda la aplicación en 9 idiomas, incluidos español, turco, persa y árabe.",
          "MetaTrader 4 y 5 se conectan con un pequeño complemento y una clave; nunca compartes tu contraseña de inversor.",
          "Análisis de disciplina integrado (operaciones de venganza, más riesgo tras pérdidas, sobreoperar, operar fuera de horario) y seguimiento de límites de prop firms."
        ]
      },
      {
        "h2": "¿Cuál elegir?"
      },
      {
        "p": "Si necesitas una gama muy amplia de integraciones con brókers o sus herramientas más avanzadas, Edgewonk puede encajarte mejor. Si operas en MetaTrader, quieres un diario en tu idioma y prefieres empezar gratis, prueba Simple Trading Journal: el plan gratuito no pide tarjeta."
      }
    ]
  },
  "pre-trade-checklist": {
    "title": "La checklist antes de operar: cómo escribir una que de verdad uses",
    "description": "Por qué una checklist corta antes de entrar reduce las operaciones impulsivas, cómo escribir reglas que se respondan con sí o no y cómo comprobar si tu checklist funciona.",
    "body": [
      {
        "p": "La mayoría de las malas operaciones no vienen de un mal análisis. Son operaciones abiertas cuando el setup estaba a medias —un nivel casi alcanzado, una señal casi confirmada— porque quedarse quieto se sentía peor que actuar. Una checklist te permite tomar esa decisión antes de que llegue el momento."
      },
      {
        "h2": "Para qué sirve una checklist"
      },
      {
        "p": "Una checklist no encuentra operaciones por ti. Filtra las que ya quieres abrir, para que solo pasen las que encajan con tu plan. Pilotos y cirujanos las usan por la misma razón: bajo presión, la gente se salta pasos que conoce de memoria."
      },
      {
        "h2": "Reglas que se responden con sí o no"
      },
      {
        "p": "Cada punto debe ser una pregunta con una respuesta clara en el momento de entrar. «¿La tendencia es alcista?» se presta a interpretación; «¿Está el precio por encima de la media móvil de 200 periodos en el gráfico de 4 horas?» no."
      },
      {
        "ul": [
          "Contexto: ¿la dirección del marco temporal superior coincide con mi operación?",
          "Ubicación: ¿la entrada está en un nivel que marqué antes de la sesión, y no en uno que encontré después de que el precio se moviera?",
          "Gatillo: ¿mi señal de entrada ha cerrado de verdad, o solo ha empezado a formarse?",
          "Riesgo: ¿el stop está donde la idea resulta equivocada, y el tamaño está dentro de mi riesgo por operación?",
          "Calendario: ¿no hay noticias de alto impacto en los próximos 30 minutos?"
        ]
      },
      {
        "h2": "Que sea corta"
      },
      {
        "p": "Con tres a siete puntos basta. Una lista de quince se lee por encima y luego se ignora. Si un punto nunca cambia una decisión, quítalo; si el mismo error vuelve una y otra vez, conviértelo en un punto."
      },
      {
        "h2": "Una lista por estrategia"
      },
      {
        "p": "Si operas dos setups distintos —por ejemplo, una ruptura y un retroceso—, necesitan condiciones distintas. Meter ambos en una sola lista deja la mitad de los puntos sin sentido en cada operación, y marcar casillas sin sentido se convierte enseguida en la costumbre de marcar sin leer."
      },
      {
        "h2": "Comprueba si funciona"
      },
      {
        "p": "Una checklist es una hipótesis. Tras 20–30 operaciones, compara las que tenían todos los puntos marcados con las que abriste de todos modos. Si las completas no van mejor, los puntos son los equivocados: cámbialos en lugar de abandonar la idea."
      },
      {
        "h2": "En Simple Trading Journal"
      },
      {
        "p": "Puedes tener varias checklists con nombre, una por estrategia, elegir cuál usa cada diario y marcar los puntos en cada operación. Las operaciones que llegan desde MetaTrader también reciben la checklist del diario, para que la completes al añadir tus notas."
      }
    ]
  },
  "trading-emotions-journal": {
    "title": "Registrar emociones en tu diario de trading: qué anotar y cómo usarlo",
    "description": "Cómo etiquetar el estado emocional detrás de cada operación, qué emociones suelen preceder a los errores y cómo convertir esas etiquetas en reglas en lugar de arrepentimientos.",
    "body": [
      {
        "p": "Los traders suelen conocer sus errores. A posteriori te cuentan que persiguieron un movimiento por miedo a perdérselo o que doblaron el tamaño para recuperar una pérdida. Lo que casi nunca tienen es un registro de cuántas veces pasa y cuánto cuesta. Etiquetar la emoción en cada operación convierte una sensación vaga en algo que se puede contar."
      },
      {
        "h2": "Anótalo en el momento"
      },
      {
        "p": "Anota la emoción al entrar o justo después de cerrar, no al final de la semana. La memoria reescribe las operaciones: una operación de venganza que por suerte salió bien se convierte en «una buena lectura», y el miedo detrás de una salida anticipada se olvida."
      },
      {
        "h2": "Una lista corta y fija"
      },
      {
        "p": "Elige siempre del mismo conjunto de palabras, para que las operaciones se puedan comparar. Una lista útil separa los estados que ayudan de los que suelen perjudicar:"
      },
      {
        "ul": [
          "Ayudan: calma, concentración, confianza.",
          "Señales de alerta: exceso de confianza, FOMO, miedo, impaciencia.",
          "Señales de parar: enfado, venganza, cansancio."
        ]
      },
      {
        "p": "Una operación puede tener más de una. Estar cansado e impaciente a la vez es habitual, y conviene saberlo."
      },
      {
        "h2": "Busca patrones, no operaciones sueltas"
      },
      {
        "p": "Una sola operación de FOMO perdedora dice poco. Veinte, puestas junto al resto de tus operaciones, dicen mucho. Al cabo de un mes, agrupa tus operaciones por emoción y compara los resultados en R: muchos traders descubren que la mayoría de sus pérdidas se concentran bajo dos o tres etiquetas."
      },
      {
        "h2": "Convierte el patrón en una regla"
      },
      {
        "p": "No se trata de dejar de sentir, sino de decidir de antemano qué harás cuando lo notes. Si tu etiqueta más cara son las operaciones de venganza, una regla como «tras dos pérdidas seguidas, paro por hoy» hace más que cualquier fuerza de voluntad. Pon la regla en tu checklist para encontrártela antes de la siguiente entrada, no después."
      },
      {
        "h2": "En Simple Trading Journal"
      },
      {
        "p": "Cada operación tiene un selector de emociones con doce estados habituales —los que ayudan y las señales de alerta en colores distintos— y puedes añadir tus propias palabras. Las etiquetas aparecen en la operación y se incluyen al exportar tus operaciones a Excel, para que puedas ordenarlas y compararlas."
      }
    ]
  },
  "position-sizing-risk-per-trade": {
    "title": "Tamaño de posición: cuánto arriesgar por operación y cómo calcular el lotaje",
    "description": "Cómo elegir un riesgo fijo por operación, convertirlo en lotaje a partir de la distancia del stop y comprobar en tu diario que de verdad lo cumples.",
    "body": [
      {
        "p": "Dos traders pueden abrir la misma operación al mismo precio y con el mismo stop y terminar con cuentas muy distintas. La diferencia es el tamaño. El tamaño de posición decide cuánto te cuesta una pérdida y, por tanto, cuántas pérdidas seguidas puedes aguantar mientras tu ventaja se manifiesta."
      },
      {
        "h2": "Empieza por el riesgo, no por los lotes"
      },
      {
        "p": "Muchos traders eligen primero el lotaje —«yo opero 1 lote»— y dejan que el stop decida cuánto pierden. Así cada pérdida tiene un tamaño diferente. Dale la vuelta: decide qué parte de la cuenta aceptas perder si salta el stop y calcula el tamaño que lo cumple."
      },
      {
        "h2": "Elegir el riesgo por operación"
      },
      {
        "p": "Un porcentaje fijo de la cuenta —a menudo entre el 0,5% y el 2%— es el punto de partida habitual. El número importa menos que mantenerlo constante. Con un 1% de riesgo, diez pérdidas seguidas cuestan alrededor del 10% de la cuenta; con un 5%, la misma racha cuesta cerca del 40% y cada operación posterior tiene que trabajar mucho más para recuperarlo."
      },
      {
        "p": "En una cuenta de prop firm, calcula también según sus límites: si la pérdida diaria máxima es del 5%, un riesgo del 2% por operación solo deja sitio para dos pérdidas completas en un día."
      },
      {
        "h2": "El cálculo"
      },
      {
        "code": "Tamaño de posición = Importe en riesgo ÷ (Distancia del stop × Valor por punto)"
      },
      {
        "p": "Ejemplo: una cuenta de 10.000 $ que arriesga el 1% tiene 100 $ para perder. El stop en EURUSD está a 25 pips y un lote estándar vale unos 10 $ por pip. 100 $ ÷ (25 × 10 $) = 0,4 lotes. Si el stop está a 50 pips, el tamaño se reduce a la mitad, 0,2 lotes, y el riesgo sigue siendo 100 $."
      },
      {
        "p": "El valor por punto cambia según el instrumento y el bróker (oro, índices y cripto cotizan de otra forma), así que consulta una vez la especificación del contrato en tu plataforma y anótala."
      },
      {
        "h2": "Errores habituales"
      },
      {
        "ul": [
          "Alejar el stop después de entrar sin reducir el tamaño: el riesgo crece en silencio.",
          "Subir el tamaño tras una pérdida para recuperarla antes.",
          "Redondear el lotaje hacia arriba cada vez: 0,37 pasa a 0,4 y luego a 0,5.",
          "Olvidar el spread y la comisión, que hacen la pérdida real algo mayor que la prevista."
        ]
      },
      {
        "h2": "Compruébalo en tu diario"
      },
      {
        "p": "Anota el riesgo previsto en cada operación. Tras unas semanas, mira las operaciones perdedoras: si algunas perdieron dos o tres veces lo habitual, tu tamaño no es tan fijo como crees. Leer los resultados en R (beneficio o pérdida dividido entre el riesgo previsto) hace que esos casos salten a la vista."
      },
      {
        "h2": "En Simple Trading Journal"
      },
      {
        "p": "Cada operación tiene un campo de riesgo y los resultados se pueden leer en R. Puedes añadir a tus objetivos un riesgo máximo por operación, y la vista de disciplina marca las operaciones en las que, justo después de una pérdida, el riesgo subió a más de 1,5 veces el de la operación anterior."
      }
    ]
  },
  "revenge-trading": {
    "title": "Revenge trading: cómo detectarlo en tu diario y frenarlo",
    "description": "Cómo se ve el revenge trading en los datos, por qué sale tan caro y reglas prácticas para que la operación siguiente a una pérdida no sea emocional.",
    "body": [
      {
        "p": "Se cierra una pérdida y a los pocos minutos vuelves a estar en el mercado —a menudo en el mismo instrumento, a veces con más tamaño— para recuperarla. Eso es revenge trading, operar por venganza. Casi todos los traders lo han hecho; la cuestión es con qué frecuencia y cuánto cuesta."
      },
      {
        "h2": "Por qué sale tan caro"
      },
      {
        "p": "La operación después de una pérdida suele abrirse por un motivo distinto a tu plan: arreglar una sensación. El setup es más débil, la entrada es precipitada y el tamaño tiende a crecer. Un solo mal día puede deshacer semanas de trading cuidadoso."
      },
      {
        "h2": "Cómo se ve en los datos"
      },
      {
        "ul": [
          "Una operación nueva abierta pocos minutos después de cerrar una perdedora.",
          "El riesgo de esa operación es claramente mayor que el de la anterior.",
          "Varias operaciones seguidas en un día que empezó con una pérdida.",
          "Operaciones fuera de las horas en las que sueles operar."
        ]
      },
      {
        "p": "No necesitas recordar cómo te sentías para encontrarlas. Las horas, los tamaños y los resultados ya están en tu diario."
      },
      {
        "h2": "Mídelo"
      },
      {
        "p": "Separa las operaciones que encajan con esos patrones del resto y compara los resultados. Si el grupo marcado pierde dinero mientras el resto de tu trading está más o menos plano o en positivo, has encontrado lo más valioso que puedes corregir, y es una regla, no una estrategia."
      },
      {
        "h2": "Reglas que ayudan"
      },
      {
        "ul": [
          "Pausa: tras una pérdida, ninguna operación nueva durante 15–30 minutos.",
          "Stop diario: después de dos pérdidas seguidas o de perder una cantidad fija, se acabó el día.",
          "El tamaño nunca sube tras una pérdida; si cambia, baja.",
          "Antes de la siguiente operación, repasa tu checklist desde el principio."
        ]
      },
      {
        "p": "Escribe la regla antes de la sesión. Decidir en el momento es justo lo que no funciona."
      },
      {
        "h2": "En Simple Trading Journal"
      },
      {
        "p": "La vista de disciplina lee tus operaciones y marca la operación abierta en los 15 minutos siguientes a una pérdida, el riesgo más de 1,5 veces mayor que el de la operación anterior tras una pérdida, los días con muchas más operaciones de lo normal y las operaciones fuera de tu horario habitual. Luego muestra cuánto costaron frente al resto. Las operaciones que llegan de MetaTrader se incluyen automáticamente."
      }
    ]
  },
  "expectancy-and-profit-factor": {
    "title": "Esperanza matemática y profit factor: los dos números que dicen si tu trading funciona",
    "description": "Qué son la esperanza matemática (expectancy) y el profit factor, cómo calcularlos con tus propias operaciones y por qué una tasa de acierto alta dice poco por sí sola.",
    "body": [
      {
        "p": "La tasa de acierto es el número que más citan los traders y, por sí sola, el menos útil. Una estrategia que gana el 80% de las veces puede perder dinero, y una que gana el 35% puede ser sólida. Dos números responden a la pregunta de verdad —¿gana dinero a lo largo de muchas operaciones?—: la esperanza matemática y el profit factor."
      },
      {
        "h2": "Esperanza matemática"
      },
      {
        "p": "La esperanza es el resultado medio por operación a lo largo de muchas operaciones."
      },
      {
        "code": "Esperanza = (Tasa de acierto × Ganancia media) − (Tasa de fallo × Pérdida media)"
      },
      {
        "p": "Ejemplo: ganas el 40% de las operaciones, la ganancia media es de 300 $ y la pérdida media de 150 $. 0,40 × 300 − 0,60 × 150 = 120 − 90 = 30 $. De media, cada operación ha sumado 30 $. Un número positivo significa que el enfoque ha funcionado en estas operaciones; uno negativo, que no, por buenos que parecieran algunos días."
      },
      {
        "p": "Expresada en R en vez de en dinero —ganancia y pérdida media divididas entre tu riesgo habitual—, la esperanza se puede comparar entre cuentas de distinto tamaño y entre periodos."
      },
      {
        "h2": "Profit factor"
      },
      {
        "code": "Profit factor = Beneficio bruto ÷ Pérdida bruta"
      },
      {
        "p": "Con los mismos números en 100 operaciones: 40 × 300 $ = 12.000 $ ganados, 60 × 150 $ = 9.000 $ perdidos, un profit factor de 1,33. Por encima de 1 las ganadoras pesan más que las perdedoras; por debajo, no. Se lee rápido, pero no dice cuántas operaciones hicieron falta para llegar ahí."
      },
      {
        "h2": "Por qué engaña la tasa de acierto"
      },
      {
        "p": "Una tasa de acierto alta suele venir de cerrar beneficios pronto y dejar correr las pérdidas. Diez ganancias de 50 $ y una pérdida de 600 $ son un 91% de acierto y 100 $ de pérdida neta. La esperanza lo muestra al instante; la tasa de acierto lo esconde."
      },
      {
        "h2": "¿Cuántas operaciones bastan?"
      },
      {
        "p": "Con una muestra pequeña estos números se mueven mucho. Veinte operaciones pueden parecer excelentes o terribles por azar. Míralos sobre al menos 30–50 operaciones y compáralos por setup, no con toda la cuenta mezclada."
      },
      {
        "h2": "En Simple Trading Journal"
      },
      {
        "p": "La página de estadísticas muestra la esperanza, el profit factor, el ratio de pago, la ganancia y la pérdida media y la tasa de acierto, calculados con tus operaciones cerradas, incluidas las que llegan de MetaTrader o se importan de un informe. La tabla de rendimiento por setup muestra la tasa de acierto y el resultado neto de cada uno, para que veas cuál sostiene tus resultados."
      }
    ]
  },
  "overtrading": {
    "title": "Sobreoperar: cómo saber si estás operando demasiado",
    "description": "Qué es el overtrading, cómo se ve en tus propios datos, por qué las operaciones de más suelen costar dinero y límites sencillos para mantener bajo control tu número de operaciones.",
    "body": [
      {
        "p": "Sobreoperar (overtrading) es abrir más operaciones de las que pide tu plan: entradas que ocurren porque estás frente a la pantalla, no porque apareció tu setup. En el momento rara vez parece un error. Cada operación parece razonable por sí sola; el problema solo se ve cuando las cuentas."
      },
      {
        "h2": "Por qué las operaciones de más cuestan dinero"
      },
      {
        "p": "Los buenos setups son limitados; el mercado no los ofrece cada hora. Cuando sube el número de operaciones, las de más suelen ser más débiles: setups casi formados, entradas en mitad del rango, operaciones en horas tranquilas. Cada operación además tiene costes —spread, comisión, swap— que se acumulan más rápido de lo que la mayoría espera."
      },
      {
        "h2": "Causas habituales"
      },
      {
        "ul": [
          "Intentar recuperar una pérdida (operar por venganza).",
          "El aburrimiento en un día lento, o sentir que un día sin operaciones es un día perdido.",
          "Un objetivo diario de beneficio que te empuja a seguir hasta alcanzarlo.",
          "Bajar a un marco temporal menor, donde los setups aparecen más a menudo pero significan menos.",
          "Seguir después de una gran ganancia, cuando la confianza está en su punto más alto."
        ]
      },
      {
        "h2": "Cómo detectarlo en tu diario"
      },
      {
        "ul": [
          "Días con muchas más operaciones que tu día habitual.",
          "Resultados según el número de operación del día: ¿tu cuarta y quinta operación son peores que la primera y la segunda?",
          "Operaciones sin setup, o con un setup que solo usas de vez en cuando.",
          "Muchas operaciones cortas seguidas en el mismo instrumento."
        ]
      },
      {
        "p": "La comparación que importa es sencilla: toma tus días más cargados y compara su resultado neto y su tasa de acierto con tus días normales. Si los días cargados son claramente peores, el número de operaciones es parte del problema."
      },
      {
        "h2": "Límites que ayudan"
      },
      {
        "ul": [
          "Un máximo de operaciones por día, escrito antes de la sesión; por ejemplo, tu número habitual más una.",
          "Parar tras un número fijo de pérdidas, sean cuantas sean las operaciones.",
          "Solo cuentan los setups de tu lista de verificación; lo demás no es una operación.",
          "Una franja horaria fija para operar; fuera de ella, ninguna entrada nueva."
        ]
      },
      {
        "p": "Un límite solo funciona si se fija de antemano. En la quinta operación del día, el argumento para una sexta siempre sonará convincente."
      },
      {
        "h2": "En Simple Trading Journal"
      },
      {
        "p": "La vista de disciplina calcula tu número habitual de operaciones por día a partir de tu propio historial y marca los días con más del doble (y al menos cuatro operaciones). Necesita al menos cinco días de trading para juzgar y muestra cuánto te costaron las operaciones de esos días frente al resto. El calendario muestra el número de operaciones y el resultado de cada día, y las operaciones de MetaTrader se incluyen automáticamente."
      }
    ]
  },
  "tradervue-alternative": {
    "title": "Simple Trading Journal frente a Tradervue: una comparación honesta",
    "description": "¿Buscas una alternativa a Tradervue? Precios, plan gratuito, prueba y compatibilidad con MetaTrader lado a lado, y en qué destaca cada uno.",
    "body": [
      {
        "p": "Tradervue es uno de los diarios de trading más veteranos, popular entre quienes operan acciones, opciones y futuros de EE. UU. Si buscas una alternativa más barata, en tu idioma o con sincronización automática de MetaTrader, así se compara Simple Trading Journal."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "Tradervue"
          ],
          [
            "Precio mensual",
            "$14.99",
            "$29.95 – $49.95"
          ],
          [
            "Precio anual",
            "$119",
            "No figura en su página de precios"
          ],
          [
            "Plan gratuito",
            "Sí — 2 operaciones al día, sin límite de tiempo",
            "Sí — 30 operaciones importadas al mes"
          ],
          [
            "Prueba gratuita",
            "3 días de Pro, sin tarjeta",
            "7 días de Silver o Gold; al terminar se cobra a la tarjeta salvo que pases al plan gratuito"
          ],
          [
            "Sincronización automática con MetaTrader",
            "MT4 y MT5",
            "No — MT4 y MT5 subiendo un archivo de informe"
          ],
          [
            "Cómo se conecta MetaTrader",
            "Complemento en MetaTrader + clave, sin compartir contraseña",
            "Guardar un informe HTML en MetaTrader y subirlo"
          ],
          [
            "Importación",
            "Informe MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, cualquier CSV",
            "Una larga lista de brókers y plataformas; sincronización con algunos brókers"
          ]
        ]
      },
      {
        "note": "Los precios y funciones de Tradervue se tomaron de sus propias páginas de precios, plataformas y ayuda en septiembre de 2026 y pueden haber cambiado. Consulta su web antes de decidir."
      },
      {
        "h2": "Dónde destaca Tradervue"
      },
      {
        "ul": [
          "Soporte profundo para acciones, opciones y futuros de EE. UU., con muchos brókers y plataformas estadounidenses.",
          "Informes detallados y, en su plan superior, análisis de salidas y estadísticas MFE/MAE.",
          "Mentoría y compartir operaciones con su comunidad.",
          "Una trayectoria muy larga."
        ]
      },
      {
        "h2": "Dónde destaca Simple Trading Journal"
      },
      {
        "ul": [
          "Las operaciones de MetaTrader 4 y 5 llegan solas mientras operas; no hay que exportar y subir un informe cada vez.",
          "Pro cuesta $14.99 al mes o $119 al año; los planes de pago de Tradervue empiezan en $29.95 al mes.",
          "Prueba de Pro de 3 días sin tarjeta.",
          "Toda la aplicación en 9 idiomas, incluidos turco, persa y árabe.",
          "Análisis de disciplina integrado (operaciones de venganza, más riesgo tras pérdidas, sobreoperar, operar fuera de horario) y seguimiento de límites de prop firms."
        ]
      },
      {
        "h2": "¿Cuál elegir?"
      },
      {
        "p": "Si operas acciones, opciones o futuros de EE. UU. con un bróker estadounidense, Tradervue está pensado justo para eso. Si operas forex, índices u oro en MetaTrader, quieres que tus operaciones se registren solas y prefieres empezar gratis, prueba Simple Trading Journal: el plan gratuito no pide tarjeta."
      }
    ]
  },
  "tradesviz-alternative": {
    "title": "Simple Trading Journal frente a TradesViz: una comparación honesta",
    "description": "¿Buscas una alternativa a TradesViz? Precios, plan gratuito, prueba y sincronización con MetaTrader lado a lado, y en qué destaca cada uno.",
    "body": [
      {
        "p": "TradesViz es un diario de trading con un conjunto enorme de estadísticas, gráficos, simuladores y herramientas de IA. Si buscas una alternativa más sencilla, más barata al año, en tu idioma o gratuita para forex, así se compara Simple Trading Journal."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "TradesViz"
          ],
          [
            "Precio mensual",
            "$14.99",
            "$19.99 – $29.99"
          ],
          [
            "Precio anual",
            "$119",
            "$179.88 – $269.88"
          ],
          [
            "Plan gratuito",
            "Sí — 2 operaciones al día, sin límite de tiempo, todos los instrumentos",
            "Sí — solo acciones, 3.000 ejecuciones al mes"
          ],
          [
            "Prueba gratuita",
            "3 días de Pro, sin tarjeta",
            "7 días de Pro o Platinum"
          ],
          [
            "Sincronización automática con MetaTrader",
            "MT4 y MT5",
            "MT4 y MT5 (planes de pago; el gratuito es solo para acciones)"
          ],
          [
            "Cómo se conecta MetaTrader",
            "Complemento en MetaTrader + clave, sin compartir contraseña",
            "Número de cuenta + contraseña de inversor, o publicación de informes por FTP de MetaTrader"
          ],
          [
            "Importación",
            "Informe MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, cualquier CSV",
            "Más de 250 brókers y plataformas, más de 70 conexiones con sincronización automática"
          ]
        ]
      },
      {
        "note": "Los precios y funciones de TradesViz se tomaron de sus propias páginas de precios, brókers y blog en septiembre de 2026 y pueden haber cambiado. Consulta su web antes de decidir."
      },
      {
        "h2": "Dónde destaca TradesViz"
      },
      {
        "ul": [
          "Un conjunto mucho mayor de estadísticas y gráficos: más de 600, según TradesViz.",
          "Simuladores de trading, repetición de operaciones, herramientas de opciones y un escáner de acciones.",
          "Herramientas de IA que responden preguntas sobre tus operaciones.",
          "Muchas más integraciones con brókers, incluidas acciones, opciones, futuros y criptomonedas."
        ]
      },
      {
        "h2": "Dónde destaca Simple Trading Journal"
      },
      {
        "ul": [
          "El plan gratuito cubre forex, índices, oro y cualquier otro instrumento; el de TradesViz es solo para acciones.",
          "Pro cuesta $119 al año; el plan anual más barato de TradesViz cuesta $179.88.",
          "MetaTrader 4 y 5 se conectan con un pequeño complemento y una clave; nunca compartes tu contraseña de inversor.",
          "Una aplicación más sencilla, con menos pantallas que aprender.",
          "Toda la aplicación en 9 idiomas, incluidos turco, persa y árabe."
        ]
      },
      {
        "h2": "¿Cuál elegir?"
      },
      {
        "p": "Si quieres el análisis más profundo posible, simuladores y herramientas de IA y de verdad los vas a usar, TradesViz ofrece más. Si operas forex o CFD en MetaTrader y quieres un diario claro en tu idioma con el que empezar gratis, prueba Simple Trading Journal: el plan gratuito no pide tarjeta."
      }
    ]
  },
  "fx-replay-alternative": {
    "title": "Simple Trading Journal frente a FX Replay: para qué sirve cada uno",
    "description": "¿FX Replay o Simple Trading Journal? Uno es una plataforma de backtesting y el otro un diario de tus operaciones reales. Precios, planes gratuitos y MetaTrader comparados.",
    "body": [
      {
        "p": "FX Replay es sobre todo una plataforma de backtesting: reproduces gráficos históricos y practicas operaciones en ellos, y trae un diario incluido. Simple Trading Journal es un diario de las operaciones que de verdad abres en tu cuenta. Se solapan menos de lo que parece; así se comparan."
      },
      {
        "table": [
          [
            "",
            "Simple Trading Journal",
            "FX Replay"
          ],
          [
            "Propósito principal",
            "Registro y análisis de tus operaciones reales",
            "Backtesting en gráficos históricos, con diario"
          ],
          [
            "Precio mensual",
            "$14.99",
            "$17.99 – $35"
          ],
          [
            "Precio anual",
            "$119",
            "$180 – $350"
          ],
          [
            "Plan gratuito",
            "Sí — 2 operaciones al día, sin límite de tiempo",
            "Sí — 2 sesiones de backtesting, 1 indicador, datos guardados 1 semana"
          ],
          [
            "Prueba gratuita",
            "3 días de Pro, sin tarjeta",
            "Sí, sin tarjeta (duración no indicada)"
          ],
          [
            "MetaTrader",
            "Sincronización automática de MT4 y MT5 con complemento + clave",
            "MT4 y MT5 subiendo un archivo"
          ],
          [
            "Importación",
            "Informe MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, cualquier CSV",
            "Cualquier CSV; archivos de NinjaTrader, Tradovate y MT4/MT5"
          ]
        ]
      },
      {
        "note": "Los precios y funciones de FX Replay se tomaron de sus propias páginas de precios y del diario en septiembre de 2026 y pueden haber cambiado. Consulta su web antes de decidir."
      },
      {
        "h2": "Dónde destaca FX Replay"
      },
      {
        "ul": [
          "Backtesting: reproducir el precio pasado vela a vela, con datos al segundo en su plan Pro.",
          "Un simulador de desafíos de prop firms para practicar con sus reglas.",
          "Probar una estrategia con una muestra grande antes de arriesgar dinero.",
          "Una comunidad activa en Discord."
        ]
      },
      {
        "h2": "Dónde destaca Simple Trading Journal"
      },
      {
        "ul": [
          "Tus operaciones reales de MetaTrader 4 y 5 se registran solas mientras operas.",
          "Pro cuesta $14.99 al mes o $119 al año.",
          "Análisis de disciplina sobre operaciones reales: venganza, más riesgo tras pérdidas, sobreoperar, operar fuera de horario.",
          "Seguimiento de los límites de la prop firm en tu cuenta de desafío real.",
          "Toda la aplicación en 9 idiomas, incluidos turco, persa y árabe."
        ]
      },
      {
        "h2": "¿Cuál elegir?"
      },
      {
        "p": "Hacen trabajos distintos. Para probar una estrategia con datos pasados, FX Replay está hecho para eso. Para registrar y revisar las operaciones que de verdad haces —sobre todo en MetaTrader—, usa Simple Trading Journal. Muchos traders usan una herramienta de backtesting y un diario a la vez; aquí el plan gratuito no pide tarjeta."
      }
    ]
  },
  "forex-trading-journal": {
    "title": "Diario de trading de forex: qué registrar y cómo revisarlo",
    "description": "Qué debe contener un diario de forex — par, sesión, spread, pips, riesgo en R — cómo rellenarlo automáticamente desde MetaTrader y una revisión semanal de 15 minutos.",
    "body": [
      {
        "p": "Un diario de trading de forex es el registro de cada operación que haces y de la razón que hay detrás. El forex añade detalles que los diarios de acciones rara vez necesitan: muchos pares, tres sesiones principales, spreads y swaps, y resultados que pueden contarse en pips, en dinero o en unidades de riesgo. Un diario que los recoja te permite ver dónde está de verdad tu ventaja, o tu fuga."
      },
      {
        "h2": "Qué registrar en cada operación"
      },
      {
        "ul": [
          "Par y dirección (compra o venta).",
          "Hora de entrada y sesión en la que cayó: asiática, Londres o Nueva York.",
          "Setup y motivo de la entrada, en una frase.",
          "Entrada, stop loss, take profit y tamaño del lote.",
          "Riesgo en dinero y como porcentaje de la cuenta, para poder expresar el resultado en R.",
          "Resultado en pips, en dinero y en R.",
          "Spread, comisión y swap.",
          "Cualquier noticia cercana a la operación.",
          "Cómo te sentías antes y después, y una captura del gráfico."
        ]
      },
      {
        "h2": "Por qué los pips solos no bastan"
      },
      {
        "p": "Contar pips ignora el tamaño del lote y el valor del pip, que cambia de un par a otro. Diez pips en una posición grande pueden costar más que cuarenta en una pequeña. Registra también el resultado en dinero y en R y compara las operaciones así."
      },
      {
        "h2": "Patrones que merece la pena buscar en forex"
      },
      {
        "ul": [
          "Resultado por sesión: ¿te va mejor en Londres que en Nueva York?",
          "Resultado por par: unos pocos pares suelen aportar casi todo el beneficio y uno solo, casi toda la pérdida.",
          "Resultado por día de la semana y por hora.",
          "Operaciones cerca de noticias frente a periodos tranquilos.",
          "Tiempo en posición y swap: ¿se comportan distinto las operaciones que pasan la noche?"
        ]
      },
      {
        "h2": "Que MetaTrader lo rellene por ti"
      },
      {
        "p": "Teclear cada operación a mano es la razón principal por la que la gente abandona el diario. Con el complemento para MetaTrader 4 y 5, cada operación llega sola con entrada, salida, stop loss, lote, comisión y swap. Tú solo añades lo que la plataforma no puede saber: el setup, tu razonamiento y cómo te sentías."
      },
      {
        "h2": "Una revisión semanal en 15 minutos"
      },
      {
        "ol": [
          "Mira el total en dinero y en R, no solo en pips.",
          "Divide la semana por sesión y por par y encuentra el grupo más débil.",
          "Lee las operaciones que rompieron tus reglas y cuenta lo que costaron.",
          "Elige una sola cosa para cambiar la semana siguiente.",
          "Escríbela al principio del diario y compruébala el viernes."
        ]
      },
      {
        "note": "Un diario muestra lo que hiciste y lo que costó. No predice lo que hará el mercado y no es asesoramiento de inversión."
      }
    ]
  },
  "trading-glossary": {
    "title": "Glosario de trading: los términos que todo trader encuentra",
    "description": "Definiciones claras de pip, lote, spread, apalancamiento, stop loss, drawdown, múltiplo R, ratio riesgo-beneficio, tasa de acierto, expectativa, factor de beneficio, swap, slippage y límite de pérdida diaria.",
    "body": [
      {
        "p": "Definiciones breves y claras de los términos que más aparecen al operar y al leer un diario de trading. Van en el orden en que sueles encontrarlos."
      },
      {
        "h2": "Pip"
      },
      {
        "p": "La unidad estándar de movimiento del precio en forex. En la mayoría de los pares es el cuarto decimal (0,0001); en los pares con yen, el segundo (0,01). Un movimiento de 1,0850 a 1,0851 es un pip."
      },
      {
        "h2": "Lote"
      },
      {
        "p": "El tamaño de una operación. Un lote estándar son 100.000 unidades de la divisa base, un minilote 10.000 y un microlote 1.000 (0,01 lote)."
      },
      {
        "h2": "Spread"
      },
      {
        "p": "La diferencia entre el precio de compra (ask) y el de venta (bid). Es un coste que pagas al entrar, así que toda operación empieza ligeramente en negativo."
      },
      {
        "h2": "Apalancamiento"
      },
      {
        "p": "Exposición prestada que te permite controlar una posición mayor que tu saldo, por ejemplo 1:30. Multiplica por igual ganancias y pérdidas. Tu riesgo real lo fijan el stop loss y el tamaño del lote, no la cifra de apalancamiento."
      },
      {
        "h2": "Stop loss"
      },
      {
        "p": "Orden que cierra una operación a un precio fijado para limitar la pérdida. La distancia de la entrada al stop, por el tamaño del lote, es la cantidad que arriesgas en esa operación."
      },
      {
        "h2": "Drawdown"
      },
      {
        "p": "La caída desde un máximo del saldo (o del capital) hasta un mínimo posterior, en importe o en porcentaje. El drawdown máximo es la caída más profunda en un periodo."
      },
      {
        "h2": "Múltiplo R"
      },
      {
        "p": "Un resultado medido en unidades de lo que arriesgaste. Si arriesgas 100 $ y ganas 250 $, la operación es +2,5R; un stop completo es −1R. Permite comparar operaciones de distinto tamaño."
      },
      {
        "h2": "Ratio riesgo-beneficio"
      },
      {
        "p": "El beneficio potencial dividido entre el riesgo. Un stop a 20 pips con un objetivo a 40 pips es una ratio de 1:2, o 2R."
      },
      {
        "h2": "Tasa de acierto"
      },
      {
        "p": "La proporción de operaciones que cerraron con beneficio. Por sí sola dice poco; léela junto con la ganancia media y la pérdida media."
      },
      {
        "h2": "Expectativa"
      },
      {
        "p": "El resultado medio por operación, mejor en R: (tasa de acierto × ganancia media) − (tasa de fallo × pérdida media). Una expectativa positiva en muchas operaciones es lo que parece un método que funciona sobre el papel."
      },
      {
        "h2": "Factor de beneficio"
      },
      {
        "p": "El beneficio bruto dividido entre la pérdida bruta. Por encima de 1 ganaste más de lo que perdiste; 1,5 significa 1,50 $ ganados por cada 1 $ perdido."
      },
      {
        "h2": "Swap"
      },
      {
        "p": "Un cargo o abono por mantener una posición pasado el cierre diario, basado en la diferencia de tipos de interés entre las dos divisas. Aparece en el registro de la operación."
      },
      {
        "h2": "Slippage (deslizamiento)"
      },
      {
        "p": "La diferencia entre el precio esperado y el obtenido, casi siempre en mercados rápidos o alrededor de noticias."
      },
      {
        "h2": "Límite de pérdida diaria"
      },
      {
        "p": "Una regla, habitual en cuentas de prop firms, que suspende la cuenta o termina tu día cuando la pérdida de un día supera un importe o porcentaje fijado de la cuenta."
      },
      {
        "note": "Estas definiciones son educativas y no constituyen asesoramiento de inversión."
      }
    ]
  },
};

export default TEXT;
