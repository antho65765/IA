import { StudentProfile, TopicMemory, SubjectKey } from '../types';

export const GRADE_LABELS: Record<string, { title: string; desc: string; ageRange: string }> = {
  primaria: {
    title: 'Primaria (Básica)',
    desc: 'Explicaciones lúdicas, metáforas cotidianas, pasos breves y refuerzo muy positivo.',
    ageRange: '6 a 11 años',
  },
  secundaria: {
    title: 'Secundaria / ESO',
    desc: 'Equilibrio entre rigor y claridad, ejemplos aplicados al mundo real y preguntas reflexivas.',
    ageRange: '12 a 15 años',
  },
  bachillerato: {
    title: 'Bachillerato / Preparatoria',
    desc: 'Conceptos formales, preparación para exámenes, análisis crítico y resolución estructurada.',
    ageRange: '16 a 18 años',
  },
  universidad: {
    title: 'Universidad / Superior',
    desc: 'Profundidad académica, pensamiento crítico avanzado, bibliografía teórica y debate conceptual.',
    ageRange: 'Educación Superior',
  },
  autodidacta: {
    title: 'Autodidacta / Aprendizaje Continuo',
    desc: 'Orientado a la aplicación práctica, autonomía, proyectos y entendimiento conceptual profundo.',
    ageRange: 'Todas las edades',
  },
};

export const LEARNING_STYLE_LABELS: Record<string, { title: string; desc: string; iconName: string }> = {
  visual: {
    title: 'Visual y Esquemas',
    desc: 'Representaciones estructuradas, analogías espaciales, mapas mentales y esquemas paso a paso.',
    iconName: 'Eye',
  },
  practico: {
    title: 'Práctico y Aplicado',
    desc: 'Ejemplos de la vida real, ejercicios inmediatos y resolución práctica de problemas.',
    iconName: 'Wrench',
  },
  teorico: {
    title: 'Teórico y Lógico',
    desc: 'Definiciones rigurosas, principios fundamentales, deducción paso a paso y demostraciones.',
    iconName: 'BookOpen',
  },
  socratico: {
    title: 'Método Socrático',
    desc: 'El tutor te guía con preguntas reflexivas para que tú descubras la respuesta por ti mismo.',
    iconName: 'HelpCircle',
  },
  feynman: {
    title: 'Técnica Feynman (Simple)',
    desc: 'Explicaciones claras y cristalinas como si se las explicaras a un amigo, sin jerga innecesaria.',
    iconName: 'Sparkles',
  },
};

export const SUBJECT_METADATA: Record<SubjectKey, { name: string; icon: string; defaultColor: string; pedagogicalHint: string }> = {
  matematicas: {
    name: 'Matemáticas',
    icon: 'Calculator',
    defaultColor: 'blue',
    pedagogicalHint: 'Desglose algorítmico paso a paso, comprobación de operaciones y detección del origen de errores.',
  },
  ciencias: {
    name: 'Ciencias Naturales / Física / Química / Biología',
    icon: 'Atom',
    defaultColor: 'emerald',
    pedagogicalHint: 'Modelos de causa y efecto, leyes naturales, método científico y analogías con fenómenos diarios.',
  },
  historia: {
    name: 'Historia y Ciencias Sociales',
    icon: 'Landmark',
    defaultColor: 'amber',
    pedagogicalHint: 'Contextualización espacio-temporal, causas, consecuencias y empatía con actores de la época.',
  },
  lengua: {
    name: 'Lengua, Literatura y Redacción',
    icon: 'Feather',
    defaultColor: 'purple',
    pedagogicalHint: 'Estructura sintáctica, riqueza de vocabulario, comprensión lectora y técnicas de argumentación.',
  },
  filosofia: {
    name: 'Filosofía y Ética',
    icon: 'Compass',
    defaultColor: 'indigo',
    pedagogicalHint: 'Mayéutica, dilemas morales, corrientes de pensamiento y justificación de argumentos.',
  },
  programacion: {
    name: 'Programación y Computación',
    icon: 'Terminal',
    defaultColor: 'cyan',
    pedagogicalHint: 'Lógica algorítmica, trazabilidad, descomposición de problemas e identificación de bugs.',
  },
  idiomas: {
    name: 'Idiomas Extranjeros',
    icon: 'Languages',
    defaultColor: 'rose',
    pedagogicalHint: 'Inmersión comunicativa, patrones comunes, fonética y corrección constructiva.',
  },
  otro: {
    name: 'Materia Personalizada',
    icon: 'GraduationCap',
    defaultColor: 'slate',
    pedagogicalHint: 'Adaptación flexible al objetivo específico del estudiante.',
  },
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Alex',
  grade: 'secundaria',
  learningStyle: 'socratico',
  currentSubject: 'ciencias',
  customSubjectName: '',
  interests: 'naturaleza, tecnología y deportes',
};

export const INITIAL_TOPIC_MEMORIES: TopicMemory[] = [
  {
    id: 'mem-1',
    subject: 'ciencias',
    subjectDisplayName: 'Ciencias Naturales',
    topicTitle: 'Fotosíntesis y Cloroplastos',
    summary: 'Proceso por el cual las plantas convierten luz solar, agua y CO2 en glucosa y oxígeno dentro de los tilacoides.',
    keyConcepts: ['Clorofila', 'Fase luminosa', 'Ciclo de Calvin', 'Glucosa', 'Estomas'],
    masteryLevel: 'dominado',
    lastStudied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    studyTimeMinutes: 35,
    connections: ['Respiración celular', 'Cadena trófica', 'Ciclo del carbono'],
    notes: 'Entendió muy bien la analogía de la cocina solar; recordar conectar esto cuando veamos la respiración celular.',
  },
  {
    id: 'mem-2',
    subject: 'matematicas',
    subjectDisplayName: 'Matemáticas',
    topicTitle: 'Ecuaciones de Primer Grado con una Incógnita',
    summary: 'Aislamiento de la incógnita x mediante operaciones inversas en ambos lados de la balanza de igualdad.',
    keyConcepts: ['Incógnita', 'Propiedad uniforme', 'Despeje', 'Comprobación'],
    masteryLevel: 'en_progreso',
    lastStudied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    studyTimeMinutes: 45,
    connections: ['Sistemas de ecuaciones', 'Problemas de edades', 'Velocidad en física'],
    notes: 'Le cuesta un poco cambiar el signo al transponer términos negativos; reforzar la metáfora de la balanza.',
  },
  {
    id: 'mem-3',
    subject: 'historia',
    subjectDisplayName: 'Historia',
    topicTitle: 'La Revolución Industrial y la Máquina de Vapor',
    summary: 'Transformación económica y social iniciada en Gran Bretaña en el siglo XVIII con la mecanización del trabajo.',
    keyConcepts: ['James Watt', 'Éxodo rural', 'Proletariado', 'Carbón y hierro'],
    masteryLevel: 'iniciado',
    lastStudied: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    studyTimeMinutes: 25,
    connections: ['Movimiento obrero', 'Desarrollo tecnológico'],
    notes: 'Comprendió el impacto social; falta profundizar en la segunda fase de la industrialización.',
  },
];
