import { PropPack } from './core';

/** Texto en español. El orden de las opciones coincide con el array points de core.ts. */
const es: PropPack = {
  drawdown: {
    title: 'Tipo de línea de pérdida máxima (Drawdown)',
    short: 'La línea de muerte de la cuenta: si la cruzas hacia abajo, se acabó. La pregunta es si esa línea se queda fija desde el principio o sube a medida que ganas. Una línea que sube te revienta justo cuando devuelves el beneficio sobre el papel. Es la diferencia más decisiva entre una cuenta y otra.',
    options: [
      'Fija — se define al inicio y nunca se mueve (Static)',
      'Sigue el balance cerrado y se bloquea en el punto de equilibrio',
      'Sigue el balance cerrado, sin bloqueo (Balance/EOD trailing)',
      'Sigue también el beneficio abierto (Equity trailing)',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Toda cuenta tiene una "línea de muerte": si tu dinero baja de ese nivel, la cuenta se cierra. Importa dónde está, pero **cómo se comporta** importa igual. Hay tres modelos:' },
      { p: '**Fija (Static):** se define al inicio y no se mueve en toda la vida de la cuenta. Ganes, retires o dupliques el balance, sigue en el mismo sitio. Lo bueno: cuanto más ganas, mayor es la distancia hasta ella, es decir, más espacio para moverte.' },
      { p: '**Sigue el balance cerrado (Balance/EOD trailing):** la línea sube detrás de los beneficios que **cierras**. Las oscilaciones de una posición abierta no la mueven: solo sube cuando cierras la operación. En algunas firmas se detiene al alcanzar tu balance inicial y pasa a ser fija en la práctica; eso es claramente mejor que la versión que sube siempre.' },
      { p: '**Sigue también el beneficio abierto (Equity trailing):** el modelo más peligroso. La línea sube incluso con beneficio que aún no has cerrado. La posición entra un momento en ganancia, la línea se bloquea más arriba y, cuando ese beneficio se evapora —sin que hayas perdido un solo dólar real—, la cuenta puede irse.' },
      { h: 'Ejemplo (cuenta de $100.000, línea del 10%)' },
      { p: 'Supón que abres una posición en oro: primero sube +$5.000 y luego vuelve, y cierras en el punto de equilibrio.' },
      {
        table: {
          head: ['Momento', 'Balance', 'Equity', 'Línea fija', 'Línea Equity trailing'],
          rows: [
            ['Inicio', '$100.000', '$100.000', '$90.000', '$90.000'],
            ['Posición +$5.000 en ganancia', '$100.000', '$105.000', '$90.000', '**$95.000** ↑'],
            ['El beneficio se evapora', '$100.000', '$94.000', 'A salvo', '**Línea violada — cuenta perdida**'],
          ],
        },
      },
      { p: 'Con la línea fija no pasó nada. Con equity trailing la cuenta se cerró aunque el dinero en tu bolsillo nunca bajó, porque la línea había subido detrás de un beneficio que nunca cobraste.' },
      { p: '**¿Qué pasa según ganas?** Imagina que tu balance llega a $120.000. Con línea fija el suelo sigue en $90.000: tienes $30.000 de margen. Con trailing la línea ha subido contigo hasta $110.000 y tu margen se queda siempre en los mismos $10.000.' },
    ],
  },

  news: {
    title: 'Operar durante las noticias',
    short: '¿Puedes abrir y cerrar operaciones durante noticias de alto impacto? Si hay restricción, lo importante no es la restricción sino **qué cuesta incumplirla**: ¿se borra solo el beneficio de esa operación o se cierra la cuenta?',
    options: [
      'Totalmente permitido, sin ventana de bloqueo',
      'Permitido con un complemento de pago (add-on)',
      'Hay ventana de bloqueo (±2, ±4, ±5 min), la operación abierta antes queda exenta',
      'Hay ventana de bloqueo; al incumplir solo se borra el beneficio',
      'Hay ventana de bloqueo; al incumplir se cierra la cuenta',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Las publicaciones de alto impacto como NFP, CPI o FOMC mueven el mercado con violencia en segundos. A las firmas no les gusta ese riesgo, así que la mayoría impone una **ventana de bloqueo**: no puedes abrir ni cerrar operaciones 2, 4 o 5 minutos antes y después del dato.' },
      { p: 'Pero lo decisivo no es la ventana, sino **qué ocurre al incumplirla**. Verás tres desenlaces:' },
      {
        ul: [
          '**Solo se borra el beneficio de esa operación** → te fastidia, pero la cuenta sigue',
          '**Se cierra la cuenta** → un error acaba con todo',
          '**Hay exención** → algunas firmas dicen: "si la operación se abrió 4-5 horas antes, no la contamos como operación de noticias"',
        ],
      },
      { p: 'Y hay un detalle que a muchos se les escapa: en algunas firmas puedes incumplir **sin hacer nada**. Si el stop o el objetivo de una posición abierta horas antes se activa dentro de esa ventana, eso también cuenta como cerrar una operación en la ventana.' },
      { h: 'Ejemplo' },
      { p: 'A las 10:00 compras oro con objetivo en $4.120. A las 15:30 sale el NFP y la ventana de bloqueo va de 15:28 a 15:32.' },
      { p: '**Escenario A — firma que borra el beneficio:** el pico de la noticia toca tu objetivo a las 15:29. La operación cierra con +$2.000, pero ese beneficio se borra de la cuenta. La cuenta sigue; simplemente no te quedas esa ganancia.' },
      { p: '**Escenario B — firma que cierra la cuenta:** ocurre lo mismo, pero tu cuenta se cierra. Ni siquiera estabas mirando la pantalla; la orden la ejecutó el sistema, y aun así cuenta como incumplimiento.' },
      { p: '**Escenario C — firma con exención:** abriste a las 10:00, cinco horas y media antes del dato. La firma no lo considera operación de noticias y el beneficio es tuyo.' },
      { p: '**Consecuencia práctica:** en una firma del escenario B tendrás que alejar de la ventana los stops y objetivos de todas tus posiciones abiertas antes de cada noticia importante. Decenas de veces al mes. Si lo olvidas una vez, adiós cuenta.' },
    ],
  },

  floating: {
    title: 'Límite de pérdida en posiciones abiertas (Floating)',
    short: 'Un límite aparte que mira la pérdida **aún no realizada** de tus posiciones abiertas. Si cruzas el umbral, el sistema cierra todo al instante, aunque no te hayas acercado al límite diario. La regla más traicionera para quien mantiene varias operaciones a la vez.',
    options: [
      'No existe',
      'Sí, umbral del 4% o superior',
      'Sí, umbral del 3%',
      'Sí, umbral del 2%',
      'Sí, umbral por debajo del 2%',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Normalmente conoces dos límites de pérdida: el diario y el total. Este es un tercero y funciona distinto: mira **solo la pérdida no realizada de tus posiciones abiertas**.' },
      { p: 'Si cruzas el umbral el sistema no espera: cierra todas las posiciones de golpe. En algunas firmas también se cierra la cuenta; en otras la primera vez hay penalización (recorte del reparto de beneficios) y la segunda cierra la cuenta.' },
      { p: '¿Por qué es traicionera? Porque **puede que ni te hayas acercado al límite diario**. Abres varias posiciones con riesgo razonable una a una, pero sus pérdidas abiertas se suman, cruzan el umbral y el sistema te saca del mercado, quizá a un paso de que giraran.' },
      { h: 'Ejemplo (cuenta de $100.000, umbral del 2% = $2.000)' },
      { p: 'Por la mañana abriste tres operaciones, cada una con $1.000 de riesgo:' },
      { ul: ['XAUUSD largo → ahora −$700', 'EURUSD largo → ahora −$700', 'GBPUSD largo → ahora −$700'] },
      { p: '**Pérdida abierta total: −$2.100** → el sistema interviene y cierra las tres.' },
      { p: 'Y sin embargo:' },
      {
        ul: [
          'tu límite diario eran $5.000 y no te acercaste',
          'ningún stop había saltado, las tres podían girar todavía',
          'tu riesgo total era solo el 3% de la cuenta',
        ],
      },
      { p: 'Es decir, no forzaste ninguna regla a propósito, pero a ojos del sistema "tu pérdida abierta creció demasiado".' },
      { p: '**Regla práctica:** si este límite existe, el riesgo sumado de todas tus posiciones abiertas a la vez debe quedar por debajo del umbral. En una cuenta de $100K con umbral del 2%, el riesgo abierto total no debe pasar de $2.000: si vas a abrir cuatro operaciones, cada una arriesga como mucho $500.' },
    ],
  },

  dailyBase: {
    title: 'Base de cálculo de la línea diaria de pérdida',
    short: 'La línea diaria se reinicia y se recalcula cada día. ¿Sobre qué base? Si se toma el mayor de los dos, el beneficio sobre el papel que arrastras de una noche empuja la línea hacia arriba: al devolverlo al día siguiente puedes perder la cuenta sin una sola pérdida real.',
    options: [
      'No hay límite diario',
      'Basada en el balance — el beneficio abierto no la mueve',
      'Se toma el mayor entre balance y equity',
      'Se calcula desde el pico de equity del día',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'La línea diaria de pérdida se reinicia y se recalcula cada día. Pero **sobre qué** se calcula cambia según la firma, y la diferencia es vital:' },
      { p: '**Basada en el balance:** la línea parte del dinero cerrado al inicio del día. El beneficio o la pérdida de una posición abierta no cuentan. El modelo más seguro.' },
      { p: '**El mayor de los dos:** al inicio del día se miran balance y equity y se toma el más alto. Si tu posición nocturna está en ganancia, ese beneficio sobre el papel empuja la línea hacia arriba.' },
      { p: '**Desde el pico de equity del día:** el modelo más duro. En cuanto entras en ganancia durante el día, la línea se bloquea más arriba.' },
      { p: '¿Por qué importa? Porque en el segundo y el tercer modelo puedes perder la cuenta **sin una sola pérdida real**, solo devolviendo beneficio sobre el papel.' },
      { h: 'Ejemplo (cuenta de $100.000, límite diario del 5%)' },
      { p: 'A medianoche tu balance es de $100.000 y tu posición abierta en oro gana $10.000 (equity $110.000).' },
      { p: '**Firma basada en balance:** línea = $100.000 − $5.000 = **$95.000**. Al día siguiente el beneficio se evapora y cierras en equilibrio → equity $100.000. Estás a $5.000 de la línea, sin problema.' },
      { p: '**Firma que toma el mayor:** línea = $110.000 × 0,95 = **$104.500**. Al día siguiente se evaporan $5.500 → el equity baja a $104.500. **Cuenta cerrada.**' },
      { p: 'Fíjate: en el segundo caso el dinero en tu bolsillo sigue siendo $100.000. No perdiste un céntimo real. Solo devolviste un beneficio que nunca cobraste y la cuenta se fue.' },
      { p: '**Regla práctica:** si tu firma toma el mayor, cuanto más beneficio sobre el papel arrastres a medianoche, más estrecho será tu margen al día siguiente. Pasar la noche con beneficio flotante superior a cerca del 5% de la cuenta es entrar en zona peligrosa.' },
    ],
  },

  consistency: {
    title: 'Regla de consistencia (reparto del beneficio)',
    short: 'Tu mejor día no puede superar cierto porcentaje del beneficio total. No cierra la cuenta, pero retiene el pago. Ojo: en algunas firmas no existe durante la evaluación y se activa después de la financiación.',
    options: ['No existe', '50% o más', '40% – 49%', '30% – 39%', 'Menos del 30%'],
    detail: [
      { h: 'Explicación' },
      { p: 'La regla dice: **el beneficio de un solo día no puede superar cierto porcentaje del beneficio total.** La firma busca responderse si diste un golpe de suerte o si de verdad sabes.' },
      { p: 'Lo importante: esta regla **no cierra** la cuenta. Bloquea tu dinero. Hasta cumplirla tienes que seguir operando y aumentar el beneficio total para que aquel día grande pese menos en porcentaje.' },
      { p: 'Tiene una trampa: en algunas firmas no existe durante la evaluación pero se activa tras la financiación. Las condiciones de pago hay que leerlas aparte.' },
      { h: 'Ejemplo (cuenta de $100.000, regla del 35%)' },
      { p: 'Supón que llegas al objetivo con $7.000 de beneficio total. La regla dice que tu mejor día no puede pasar del 35%: $7.000 × 0,35 = **$2.450**' },
      { p: '**Caso A:** tu mejor día fue $2.000. Sin problema, cobras.' },
      { p: '**Caso B:** tu mejor día fue $4.000. Regla incumplida, pago bloqueado. ¿Qué hace falta? $4.000 ÷ 0,35 = **$11.429**' },
      { p: 'Es decir, para legitimar ese único día tienes que elevar el beneficio total a $11.429. No puedes quedarte en $7.000 y cobrar: hay que ganar $4.400 más.' },
      { p: '**A quién golpea:** quien acumula pequeños beneficios cada día no nota la regla. Quien gana con noticias o con unos pocos golpes grandes choca con ella constantemente: su estrategia concentra el beneficio en pocos días.' },
      { p: '**Cuanto más alto el porcentaje, mejor:** al 50% un día puede ser la mitad del total (cómodo); al 15%, solo una séptima parte (muy estricto).' },
    ],
  },

  overnight: {
    title: 'Mantener posiciones de un día para otro',
    short: 'Poder mantener la posición abierta durante la noche, cruzando el cambio de día. Si está prohibido, todo lo que abras hay que cerrarlo al final de la sesión.',
    options: ['Permitido', 'Permitido con un complemento de pago (add-on)', 'Prohibido — se cierra automáticamente al final de la sesión'],
    detail: [
      { h: 'Explicación' },
      { p: 'El derecho a mantener una posición a través del cambio de día. Parece menor, pero determina tu estrategia directamente.' },
      { p: 'Si está prohibido, cada posición hay que cerrarla el mismo día: el sistema las cierra todas al terminar la sesión. Entonces no puedes hacer swing, no puedes capturar movimientos de varios días ni llevar una posición de noticias al día siguiente.' },
      { p: 'En algunas firmas está permitido pero detrás de un complemento de pago. En otras está permitido pero el interés nocturno (swap) es caro, sobre todo en índices y petróleo, donde unos días de carry se comen el beneficio.' },
      { h: 'Ejemplo' },
      { p: 'El jueves ves una buena compra en oro; el movimiento que buscas tardará dos o tres días.' },
      { p: '**En una firma que lo permite:** abres, mantienes el viernes y el lunes y cierras en el objetivo. Solo pagas el swap nocturno.' },
      { p: '**En una firma que lo prohíbe:** tienes que cerrar el mismo día. Si el movimiento sigue de noche, lo pierdes. Al día siguiente hay que volver a entrar, pero el precio quizá ya se fue. Además, la comisión y el spread se multiplican porque entras de nuevo cada día.' },
      { p: '**A quién golpea:** un scalper que entra y sale dentro del día no nota la regla. Para quien mantiene swing o posiciones de noticias, la cuenta se vuelve inservible.' },
    ],
  },

  payout: {
    title: 'Frecuencia de pago',
    short: '¿Con qué frecuencia puedes retirar tu beneficio y cuánto esperas para el primer pago? El beneficio no retirado sigue siempre en riesgo.',
    options: [
      'Cuando quieras (On-demand)',
      'Semanal (7 días)',
      '10 – 14 días',
      'Baja a 14 días con un complemento de pago (add-on)',
      'Mensual (28 – 30 días)',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Con qué frecuencia puedes sacar tu dinero. No pone la cuenta en riesgo, pero no olvides algo: **el beneficio que está en la cuenta no es tu dinero.** Mientras no lo retires sigue en riesgo: un incumplimiento, un mal día, y desaparece.' },
      { p: 'Hay que mirar dos cosas: cuánto esperas al primer pago y con qué frecuencia se repite el ciclo después.' },
      { h: 'Ejemplo' },
      { p: 'Te financian y ganas $5.000 el primer mes.' },
      { p: '**Firma con retiro a demanda:** lo solicitas el mismo día que aparece el beneficio y en unos días hábiles está en tu cuenta. El dinero ya es realmente tuyo.' },
      { p: '**Firma con pago mensual:** esperas 30 días. En ese tiempo puedes tener una mala semana y devolver parte, o incumplir una regla y perder los $5.000 enteros. En ese caso la cifra que veías era solo una cifra: nunca llegó a tu bolsillo.' },
      { p: '**Consecuencia práctica:** la frecuencia de pago no va de "cuán rápido me hago rico", sino de **cuán rápido quitas riesgo de la mesa**. Una firma que paga a menudo te deja asegurar el beneficio antes.' },
    ],
  },

  riskPerTrade: {
    title: 'Límite de riesgo por operación o instrumento',
    short: 'Además del límite diario, un techo aparte para cuánto puedes arriesgar en una sola operación o en un solo instrumento. Las posiciones en el mismo instrumento suelen sumarse y contar como una.',
    options: [
      'No existe',
      'Sí, umbral del 3% o superior',
      'Sí, umbral del 2% – 3%',
      'Sí, umbral por debajo del 2%',
      'Hay techo de lotes (por instrumento)',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Además de los límites diario y total, un techo aparte que limita cuánto puedes arriesgar **en una operación o un instrumento**. Tiene dos formas:' },
      { p: '**Por porcentaje:** "en una sola idea puedes arriesgar como mucho el 2% de la cuenta". Detalle importante: varias posiciones en el mismo instrumento y en la misma dirección suelen contar como **una sola operación**, o sea que sus riesgos se suman.' },
      { p: '**Por lotes (techo de lotes):** "en oro, máximo 3 lotes". Es más estricto porque limita el tamaño absoluto de la posición, no el riesgo.' },
      { h: 'Ejemplo 1 — por porcentaje (cuenta de $100.000, 2% = $2.000)' },
      { p: 'Compraste oro tres veces por separado, arriesgando $800 cada vez. Tú lo ves como tres operaciones; la firma lo cuenta como una idea: $800 × 3 = **$2.400** → límite superado, incumplimiento.' },
      { h: 'Ejemplo 2 — techo de lotes (3 lotes en oro)' },
      { p: 'Quieres arriesgar $2.500 en oro. Los lotes necesarios según la distancia del stop:' },
      {
        table: {
          head: ['Distancia del stop', 'Lotes necesarios', 'Resultado'],
          rows: [
            ['$20', '1,25 lotes', '✓ Sin problema'],
            ['$10', '2,5 lotes', '✓ Sin problema'],
            ['$5', '5 lotes', '✗ Techo de 3 lotes — como mucho $1.500 de riesgo'],
          ],
        },
      },
      { p: 'Es decir, con un stop estrecho no llegas matemáticamente al riesgo que querías. El techo de lotes limita directamente a quien usa stops ajustados.' },
    ],
  },

  stopLoss: {
    title: 'Regla del stop-loss',
    short: '¿Es obligatorio poner stop? ¿El stop que pones debe permanecer visible en la plataforma? El método de poner el stop, quitarlo y cerrar a mano cuando llega el precio cuenta como stop oculto en algunas firmas y está prohibido.',
    options: [
      'No obligatorio, sin condición de visibilidad',
      'No obligatorio, pero si se pone debe quedar visible',
      'Obligatorio (hay que ponerlo en un plazo)',
      'Obligatorio + condición de distancia máxima',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Contiene dos preguntas distintas:' },
      { p: '**¿Es obligatorio el stop?** Algunas firmas exigen stop en cada posición dentro de un plazo. Otras no se meten.' },
      { p: '**¿El stop debe quedar visible?** Regla menos conocida pero importante. Algunos traders ponen el stop, lo quitan y cierran a mano cuando el precio llega, para no caer en la "caza de stops". Algunas firmas lo llaman **stop oculto (stealth stop)** y lo prohíben. Para ellas el stop debe ser una orden real presente en la plataforma durante toda la vida de la posición.' },
      { p: '¿Por qué les importa? Porque calculan su propio riesgo a partir de tus stops visibles. Un trader cuyo stop no se ve es, para ellos, un trader cuyo riesgo no se puede medir.' },
      { h: 'Ejemplo' },
      { p: 'Supón que compras oro y pones el stop a $10, luego lo quitas y dices "si el precio llega, cierro a mano".' },
      { p: '**En una firma sin regla:** ningún problema, lo gestionas como quieras.' },
      { p: '**En una firma con condición de visibilidad:** cuenta como incumplimiento. Aparece como patrón en tu historial (posiciones sin stop, cierres siempre manuales) y acabas en revisión.' },
      { p: '**La solución — lo mejor de los dos mundos:** pon el stop **ancho** desde el principio (donde no lleguen los picos) y reduce el tamaño de la posición en consecuencia: tu riesgo en dólares no cambia. La decisión real de salida la sigues tomando a mano cuando el precio llega a tu nivel mental. Pero en la plataforma siempre hay un stop de seguridad.' },
      { p: 'El extra: quedas protegido si se cae internet, si duermes o si la plataforma se congela. El stop mental solo funciona mientras estás delante de la pantalla.' },
    ],
  },

  minDays: {
    title: 'Días mínimos de operativa',
    short: 'Los días mínimos necesarios para pasar, aunque ya hayas alcanzado el objetivo. La diferencia clave: ¿basta con **abrir una operación** o hace falta además **ganar** ese día?',
    options: [
      'No hay (0 días)',
      '1 – 4 días, días simples (sin condición de beneficio)',
      '5 días o más, días simples',
      'Hay condición de día rentable',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Aunque hayas alcanzado el objetivo de beneficio, para pasar tienes que haber operado en cierto número de días distintos. La idea es descartar a quien pasa con un golpe de suerte. La diferencia clave:' },
      { p: '**Día simple:** basta con **abrir** una posición ese día. Ganes o pierdas, el día cuenta. Incluso una operación mínima lo llena.' },
      { p: '**Día rentable:** ese día tienes que **ganar** una cantidad determinada (normalmente el 0,5% de la cuenta). Un día con pérdida, o con poca ganancia, no cuenta.' },
      { p: 'La diferencia es enorme. La condición de día simple solo te hace esperar. La de día rentable saca de tus manos cuántos días tardarás: si el mercado no da oportunidad, esperas.' },
      { h: 'Ejemplo (cuenta de $50.000, 3 días rentables, 0,5% = $250)' },
      {
        table: {
          head: ['Día', 'Operaciones cerradas ese día', 'Neto', '¿Contó?'],
          rows: [
            ['Lunes', '+$415, −$403', '+$12', '✗ (menos de $250)'],
            ['Martes', '+$139, +$368', '+$507', '✓'],
            ['Miércoles', '+$989', '+$989', '✓'],
            ['Jueves', '−$658', '−$658', '✗'],
            ['Viernes', '+$2.814', '+$2.814', '✓'],
          ],
        },
      },
      { p: 'Tres días rentables completados. Pero fíjate: el lunes no contó aunque hiciste dos operaciones, porque el neto fue $12. El jueves no contó porque cerró en pérdida. En una firma con condición de "día simple", esa misma semana habrían contado los cinco.' },
      { p: '**Otro detalle:** en algunas firmas el "día" es el día en que se **abrió** la posición. Una posición abierta el lunes y cerrada el miércoles solo cuenta el lunes; no llena el martes ni el miércoles.' },
    ],
  },

  payoutDrawdown: {
    title: 'Comportamiento de la línea tras un retiro',
    short: 'Al retirar baja tu balance. ¿Baja también la línea de pérdida o se queda donde estaba? Si se queda, cada retiro estrecha tu colchón.',
    options: [
      'El retiro no afecta a la línea; el suelo baja en la misma proporción',
      'El suelo se queda, el colchón se estrecha por el importe retirado',
      'El suelo se bloquea en el balance inicial',
    ],
    detail: [
      { h: 'Explicación' },
      { p: 'Cuando retiras dinero, tu balance baja. ¿Y la línea de pérdida? Tres posibilidades:' },
      { p: '**La línea también baja:** baja en la proporción retirada y tu colchón se conserva. El mejor caso.' },
      { p: '**La línea se queda:** el balance baja pero la línea sigue en su sitio, así que la distancia entre ambos, tu espacio de maniobra, se estrecha. El modelo más común.' },
      { p: '**La línea se bloquea en el balance inicial:** en cuanto retiras, queda fijada en el nivel de partida. Si retiras todo tu beneficio, tu colchón es exactamente cero.' },
      { p: 'Ese tercer caso es peligroso porque la cuenta parece "llena" sobre el papel pero puede cerrarse con una sola pérdida pequeña.' },
      { h: 'Ejemplo (cuenta de $100.000, firma que bloquea el suelo en $100.000)' },
      { p: 'Ganaste $10.000 y tu balance es de $110.000.' },
      { p: '**Caso A — retiras $5.000:** balance $105.000, suelo $100.000 → **colchón de $5.000.** Sigues operando tranquilo.' },
      { p: '**Caso B — retiras los $10.000 enteros:** balance $100.000, suelo $100.000 → **colchón cero.** En la primera operación, con que bajes lo que valen el spread y la comisión, el equity cae por debajo de $100.000 y la cuenta se cierra. El retiro se procesa, pero pierdes la cuenta.' },
      { p: '**Regla práctica:** el colchón que queda tras un retiro debe ser claramente mayor que el riesgo total que puedes tener abierto a la vez. Si tres operaciones suponen $3.000 de riesgo, deja al menos $5.000-6.000 de colchón tras retirar. Nunca retires todo el beneficio.' },
    ],
  },

  weekend: {
    title: 'Mantener posiciones el fin de semana',
    short: 'Llevar la posición del cierre del viernes a la apertura del lunes. Es una regla distinta de la nocturna. Aunque esté permitido, el swap sube en índices y petróleo y el hueco del lunes puede saltarse tu stop.',
    options: ['Permitido', 'Permitido con un complemento de pago (add-on)', 'Prohibido — se cierra automáticamente al cierre del viernes'],
    detail: [
      { h: 'Explicación' },
      { p: 'El derecho a mantener una posición del cierre del viernes a la apertura del lunes. Es una **regla aparte** de la nocturna: algunas firmas permiten las noches entre semana pero prohíben el fin de semana.' },
      { p: 'Si está prohibido, hay que cerrar todo antes del cierre del viernes; normalmente lo cierra el sistema. Aun estando permitido, conviene conocer dos efectos secundarios:' },
      { p: '**Coste del swap:** el fin de semana suele cobrarse el interés de tres días. En índices y petróleo la cifra puede ser seria; en forex y oro es más razonable.' },
      { p: '**Riesgo de hueco (gap):** el mercado cierra el viernes y abre el lunes a otro precio. Si entre medias sale una noticia, el precio puede abrir muy por detrás de tu stop: el stop no te protege y pierdes más de lo previsto.' },
      { h: 'Ejemplo' },
      { p: 'El viernes tienes una compra en oro con el stop a $50.' },
      { p: '**Escenario normal:** el lunes abre algo más abajo, tu stop funciona como siempre y asumes la pérdida prevista.' },
      { p: '**Escenario con hueco:** el fin de semana ocurre algo geopolítico. El lunes el oro abre $80 por debajo del cierre del viernes. Tu stop estaba a $50, pero el primer precio negociado está $80 más abajo: tu posición se cierra ahí. Pierdes casi el doble de lo previsto.' },
      { p: 'Por eso, al mantener posiciones el fin de semana conviene dejar más distancia de lo habitual hasta tus líneas diaria y total.' },
    ],
  },
};

export default es;
