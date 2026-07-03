export type Dimension =
  | 'Mentalidad'
  | 'Contexto'
  | 'Datos'
  | 'Automatización'
  | 'Calidad'
  | 'Autonomía'
  | 'Liderazgo';

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  score: 1 | 2 | 3 | 4;
}

export interface Question {
  id: number;
  number: string;
  title: string;
  desc: string;
  note: string;
  dimension: Dimension;
  options: QuestionOption[];
}

const opts = (
  a: string,
  b: string,
  c: string,
  d: string,
): QuestionOption[] => [
  { letter: 'A', text: a, score: 1 },
  { letter: 'B', text: b, score: 2 },
  { letter: 'C', text: c, score: 3 },
  { letter: 'D', text: d, score: 4 },
];

export const QUESTIONS: Question[] = [
  {
    id: 1, number: '01',
    title: '¿Cómo describes tu relación actual con la inteligencia artificial?',
    desc: 'Captura la emoción dominante — el predictor más fuerte de adopción real.',
    note: 'La emoción con la que te acercas a la IA determina cuánto vas a exprimirla.',
    dimension: 'Mentalidad',
    options: opts(
      'Me genera desconfianza o prefiero esperar a que esté más probada antes de adoptarla',
      'Curiosidad mezclada con resistencia — la uso cuando me toca, pero no es mi herramienta principal',
      'Confianza y apertura activa — la incorporo como parte habitual de cómo trabajo y aprendo',
      'Entusiasmo responsable — la integro estratégicamente, reviso siempre sus resultados y movilizo a otros',
    ),
  },
  {
    id: 2, number: '02',
    title: '¿Qué representa la IA en el contexto de tu trabajo y tu industria?',
    desc: 'El paradigma con el que la miras determina si la ves como amenaza, moda, herramienta o ventaja estratégica.',
    note: 'Lo que representa la IA para ti define cuánta energía inviertes en dominarla.',
    dimension: 'Mentalidad',
    options: opts(
      'Una amenaza que podría sustituir roles o desestabilizar procesos que funcionan',
      'Una tendencia cuyo valor real a largo plazo todavía está por probarse',
      'Una herramienta funcional para mejorar la eficiencia y los procesos del equipo',
      'Una ventaja estratégica para crear valor diferencial para clientes y diferenciarnos en el mercado',
    ),
  },
  {
    id: 3, number: '03',
    title: '¿Cómo está configurado tu espacio de trabajo con IA?',
    desc: 'El nivel 1 empieza desde cero cada vez. El nivel 2 tiene un espacio que ya lo conoce.',
    note: 'La configuración es el primer multiplicador de productividad.',
    dimension: 'Contexto',
    options: opts(
      'No tengo nada configurado — cada conversación empieza desde cero',
      'Tengo un espacio con mi contexto guardado (Claude: Proyecto · Gemini: Gem · Copilot: Agente)',
      'Tengo un prompt maestro documentado con mi rol, voz, estilo y procesos clave',
      'La IA actualiza su conocimiento sobre mí automáticamente con cada interacción y flujo de trabajo',
    ),
  },
  {
    id: 4, number: '04',
    title: '¿Cómo le das instrucciones a tu IA?',
    desc: 'La calidad del prompt es el mayor diferenciador entre el 5% y el 50% del potencial.',
    note: 'Una buena instrucción incluye quién eres, qué quieres, en qué formato y qué no quieres.',
    dimension: 'Contexto',
    options: opts(
      'Escribo lo que necesito en el momento, sin estructura ni contexto previo',
      'Incluyo contexto básico, el objetivo y el formato que quiero',
      'Uso plantillas con rol + objetivo + formato + restricciones + ejemplos',
      'Tengo un sistema completo: prompt maestro de contexto + prompts de sistema por flujo de trabajo',
    ),
  },
  {
    id: 5, number: '05',
    title: '¿Desde dónde trabaja tu IA con la información de tu negocio?',
    desc: 'El integrador no abandona la herramienta — hace el trabajo desde dentro de ella, sin copiar y pegar.',
    note: 'Conectar la IA a tus herramientas reales la convierte en un colaborador, no en un asistente.',
    dimension: 'Datos',
    options: opts(
      'Solo con lo que le copio y pego manualmente en el chat',
      'Con archivos o links que le comparto para que los lea',
      'Directamente desde mis herramientas (Claude: MCP–Gmail/Drive/Slack · Gemini: Docs/Sheets · Copilot: Word/Teams)',
      'Cruza información de múltiples sistemas en tiempo real y la consolida sin que yo intervenga',
    ),
  },
  {
    id: 6, number: '06',
    title: '¿Cómo accede tu IA a datos de otros sistemas (correo, CRM, reportes, calendarios)?',
    desc: 'Qué tan lejos llega la IA para buscar la información que necesita.',
    note: 'Cuanto menos tengas que buscar tú, más tiempo tienes para pensar y decidir.',
    dimension: 'Datos',
    options: opts(
      'Los busco yo, los copio y los pego en el chat',
      'Le pido que busque en internet o le paso los archivos relevantes',
      'Consulta directamente mis sistemas sin que yo intervenga en la búsqueda',
      'Consolida datos de múltiples fuentes automáticamente y me presenta un análisis listo',
    ),
  },
  {
    id: 7, number: '07',
    title: '¿Qué haces cuando una tarea se repite más de 3 veces por semana?',
    desc: 'Regla del Director: si lo haces más de 3 veces por semana, conviértelo en una habilidad.',
    note: 'Cada tarea que automatizas es tiempo que recuperas para lo que realmente importa.',
    dimension: 'Automatización',
    options: opts(
      'La hago desde cero cada vez',
      'Tengo el prompt guardado y lo copio manualmente cuando lo necesito',
      'La convertí en una habilidad activable con un comando (Claude: Skill/slash · Gemini: Gem · Copilot: Studio)',
      'Está programada para ejecutarse sola en horario definido (Claude: Cowork · Gemini: Flow · Copilot: Power Automate)',
    ),
  },
  {
    id: 8, number: '08',
    title: '¿Cuál es el flujo más complejo que has configurado con IA?',
    desc: 'El nivel 4 encadena habilidades: redactar + revisar + enviar = pipeline completo.',
    note: 'Ahí la IA deja de ser herramienta y empieza a ser sistema.',
    dimension: 'Automatización',
    options: opts(
      'Una sola pregunta o tarea simple en el chat',
      'Una tarea estructurada con contexto bien definido',
      'Un flujo de varios pasos encadenados (ej: redactar + revisar + enviar)',
      'Un pipeline completo con múltiples habilidades o agentes en secuencia o paralelo',
    ),
  },
  {
    id: 9, number: '09',
    title: '¿Cuánta edición necesitan los resultados que produce tu IA?',
    desc: 'Si siempre reescribes mucho, la IA no te conoce lo suficiente.',
    note: 'El objetivo es que con el tiempo edites cada vez menos.',
    dimension: 'Calidad',
    options: opts(
      'Reescribo casi todo — la estructura sirve pero el contenido no refleja mi estilo ni criterio',
      'Edición moderada — ajusto tono, datos y las partes más importantes',
      'Solo correcciones menores de tono o detalle — el resultado ya es sólido',
      'Salen listos para usar — la IA ya conoce mi criterio y lo aplica de forma consistente',
    ),
  },
  {
    id: 10, number: '10',
    title: '¿Tienes procesos documentados que tu IA reproduce de forma consistente?',
    desc: 'Un proceso documentado en forma de prompt es un activo de la organización.',
    note: 'No es una habilidad personal que se va con la persona.',
    dimension: 'Calidad',
    options: opts(
      'No — cada sesión varía según lo que me sale en el momento',
      'Tengo prompts guardados pero el proceso no está del todo estandarizado',
      'Tengo instrucciones de sistema por tipo de tarea que producen resultados consistentes',
      'Tengo un sistema completo: prompt maestro + skills encadenados + criterios de calidad medibles',
    ),
  },
  {
    id: 11, number: '11',
    title: '¿Tu IA puede completar trabajo importante sin que estés presente?',
    desc: 'El Director configura, presiona Enter, sale a cenar y vuelve con el trabajo hecho.',
    note: 'La prueba real de autonomía es qué tan bien trabaja la IA sin ti.',
    dimension: 'Autonomía',
    options: opts(
      'No — necesita que yo esté presente en cada paso para continuar',
      'Ejecuta tareas largas, pero yo las inicio y superviso cada paso',
      'Tengo tareas programadas que se ejecutan solas — yo solo apruebo el resultado final',
      'Tengo agentes autónomos que operan flujos completos — estoy en la cima del circuito, no en la ejecución',
    ),
  },
  {
    id: 12, number: '12',
    title: '¿Qué has construido o diseñado con IA más allá de simplemente usarla?',
    desc: 'Construir con IA — aunque sea una herramienta simple — cambia tu relación con la tecnología.',
    note: 'Pasas de usuario a arquitecto.',
    dimension: 'Autonomía',
    options: opts(
      'Solo uso las interfaces estándar — nunca he construido nada propio',
      'He creado artefactos, dashboards o mini-apps dentro del chat',
      'He construido herramientas internas, apps o sistemas reales con IA (Claude Code · Gemini AI Studio · Power Apps)',
      'Tengo un sistema donde una IA orquesta a otras, con agente de crítica que revisa antes de que llegue a mí',
    ),
  },
  {
    id: 13, number: '13',
    title: '¿Cómo movilizas a otros en tu equipo frente al uso de la IA?',
    desc: 'El liderazgo frente a la IA va de Reactivo → Pasivo → Proactivo → Transformador.',
    note: 'El nivel de movilización define el impacto organizacional real.',
    dimension: 'Liderazgo',
    options: opts(
      'Mi relación con la IA es personal — no tengo un rol activo de enseñanza ni movilización',
      'Comparto lo que aprendo cuando me preguntan, pero no lidero activamente la adopción',
      'Promuevo activamente el uso en el equipo, co-creo con otros y comparto buenas prácticas',
      'Soy agente de cambio organizacional — diseño, enseño y escalo la adopción con criterio y estrategia',
    ),
  },
  {
    id: 14, number: '14',
    title: '¿Cómo mides el impacto de tu uso de la IA en el negocio?',
    desc: 'La medición del impacto es el salto del Táctico al Amplificador: de "ahorré tiempo" a "generé valor medible".',
    note: 'Sin métricas, el impacto se percibe pero no se prueba.',
    dimension: 'Liderazgo',
    options: opts(
      'No lo mido — no tengo indicadores definidos ni visibilidad del impacto',
      'Percibo ahorro de tiempo pero no tengo métricas formales ni seguimiento sistemático',
      'Mido KPIs de proceso: velocidad de entrega, reducción de errores, productividad del equipo',
      'Mido impacto de negocio: ingresos, EBITDA, satisfacción del cliente, cuota de mercado',
    ),
  },
  {
    id: 15, number: '15',
    title: '¿Cuál es tu principal objetivo al usar IA en tu trabajo hoy?',
    desc: 'La pregunta de cierre captura la orientación estratégica real.',
    note: 'No lo que crees que deberías responder, sino hacia dónde apunta tu energía.',
    dimension: 'Liderazgo',
    options: opts(
      'Resolver preguntas puntuales y reducir incertidumbre cuando no sé algo',
      'Optimizar mi productividad personal y ahorrar tiempo en tareas repetitivas',
      'Mejorar los procesos del equipo, co-crear valor y facilitar la adopción colectiva',
      'Innovar, construir soluciones y generar ventaja competitiva real para el negocio y mis clientes',
    ),
  },
];

// Sub-score groupings
export const ACTITUD_QUESTIONS = [1, 2, 13, 14, 15]; // question ids
export const TECNICO_QUESTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
