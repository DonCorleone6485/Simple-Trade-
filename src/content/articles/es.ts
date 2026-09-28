/** Yazıların es metni. Yapı ve kurallar: ../articles.ts */
import type { ArticleText } from '../articles';

const TEXT: Record<string, ArticleText> = {
  'metatrader-5-auto-sync': {
    title: 'Cómo conectar MetaTrader 5 a tu diario de trading',
    description: 'Paso a paso: instala el complemento de Simple Trading Journal en MT5 para que cada operación cerrada llegue sola a tu diario, con stop loss, riesgo y comisiones incluidos.',
    body: [
      { p: 'Escribir cada operación a mano es la principal razón por la que la gente deja de llevar un diario. Con el complemento de MetaTrader 5, cada operación se registra en el momento en que se abre y se completa al cerrarse: entrada, salida, stop loss, lotes, comisión y swap. Tú solo añades lo que MetaTrader no puede saber: tu setup, tu razonamiento y cómo te sentías.' },
      { note: "¿Usas MetaTrader 4? Los pasos son los mismos: en la pantalla de MetaTrader elige MetaTrader 4, descarga SimpleTradingJournal.ex4 y ponlo en MQL4 → Experts." },
      { h2: 'Qué necesitas' },
      { ul: [
        'MetaTrader 5 en Windows o Mac (la terminal de escritorio; la app móvil no ejecuta complementos).',
        'Una cuenta de Simple Trading Journal con al menos un diario.',
        'Dos minutos.',
      ] },
      { h2: '1. Descarga el complemento' },
      { p: 'En la app, abre MetaTrader desde el menú y descarga SimpleTradingJournal.ex5. En MetaTrader elige File → Open Data Folder, entra en MQL5 → Experts y deja ahí el archivo.' },
      { note: 'En Mac, «Open Data Folder» no funciona en algunas versiones. En el Finder usa Ir → Ir a la carpeta y pega: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts' },
      { h2: '2. Permite la conexión' },
      { p: 'MetaTrader bloquea las conexiones a internet de los complementos salvo que permitas la dirección. Ve a Tools → Options → Expert Advisors, marca «Allow WebRequest for listed URL» y añade:' },
      { code: 'https://www.simpletradejournal.io' },
      { h2: '3. Reinicia MetaTrader' },
      { p: 'Cierra MetaTrader y vuelve a abrirlo. SimpleTradingJournal aparecerá en Expert Advisors, en el panel Navigator de la izquierda.' },
      { h2: '4. Arrástralo a un gráfico y pega tu clave' },
      { p: 'En la app, crea una clave de conexión (empieza por stj_). Arrastra SimpleTradingJournal a cualquier gráfico, abre la pestaña Inputs, pega la clave en ApiKey y pulsa OK. Cuando la esquina superior izquierda del gráfico indique que la conexión funciona, habrás terminado.' },
      { p: 'Cada clave pertenece a un diario y se vincula a la primera cuenta de trading que se conecta con ella, así que las operaciones de dos cuentas nunca se mezclan en el mismo diario. Para una segunda cuenta, crea una segunda clave.' },
      { h2: '¿En qué gráfico lo pongo?' },
      { p: 'MetaTrader ejecuta un solo asesor experto por gráfico. Si ya usas otro EA, abre un gráfico nuevo y vacío solo para el complemento del diario y déjalo abierto: cada operación cerrada llegará sola mientras sigues operando en tus otros gráficos. Si prefieres no mantener un gráfico extra, puedes poner el complemento en un gráfico solo cuando quieras sincronizar; recogerá todo lo que se haya cerrado entretanto.' },
      { h2: 'Qué se registra' },
      { ul: [
        'Símbolo, dirección, lotes, precio y hora de entrada y de salida.',
        'Stop loss y take profit. El stop con el que entraste se conserva aunque luego lo muevas, para que tu riesgo y tus múltiplos R sigan siendo fieles.',
        'Resultado bruto, comisión, swap y resultado neto.',
        'Una posición cerrada por partes (TP1, TP2…) se registra como una sola operación cuando se cierra del todo.',
      ] },
      { h2: 'Solución de problemas' },
      { ul: [
        'No llega nada: comprueba que la dirección del paso 2 es exactamente https://www.simpletradejournal.io, que el gráfico con el complemento sigue abierto y que la clave se pegó sin espacios.',
        '«Clave vinculada a otra cuenta»: la clave ya pertenece a otra cuenta de trading. Crea una clave nueva para esta cuenta.',
        'He perdido la clave: MetaTrader la recuerda. Si de verdad la perdiste, crea una nueva en la app y revoca la anterior.',
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
      { p: '¿Quieres que ocurra solo? Conecta MetaTrader 5 una vez y las operaciones cerradas llegarán automáticamente: consulta la guía de MetaTrader 5.' },
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
      { p: 'Cuando una operación tiene stop loss —introducido a mano, importado de un informe o sincronizado desde MetaTrader 5—, su riesgo y su múltiplo R se calculan automáticamente, y tus estadísticas muestran tu R realizado medio junto a tus resultados en dinero.' },
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
};

export default TEXT;
