import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google Gen AI helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient helper with retry and fallback across supported flash models
async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
}): Promise<any> {
  const ai = getGenAI();
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[TutorIA] Attempt ${attempt} failed with model ${model}:`, err?.message || err);
        // Wait briefly before retrying
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Chat endpoint for intelligent adaptive tutor
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const {
      message,
      chatHistory = [],
      studentProfile = {},
      memoryTopics = [],
      currentTopic = '',
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje del estudiante es requerido.' });
    }

    const ai = getGenAI();

    // Format memory topics for context
    const formattedMemories = memoryTopics.map((m: any) => 
      `- [Materia: ${m.subjectDisplayName || m.subject}] Tema: "${m.topicTitle}". Nivel de dominio: ${m.masteryLevel}. Conceptos clave: ${m.keyConcepts?.join(', ') || 'N/A'}. Notas del tutor: ${m.notes || 'Ninguna'}`
    ).join('\n');

    // Recent history formatting
    const recentHistoryText = chatHistory
      .slice(-8)
      .map((msg: any) => `${msg.sender === 'user' ? 'Estudiante' : 'Tutor IA'}: ${msg.text}`)
      .join('\n');

    const subject = studentProfile.currentSubject || 'General';
    const grade = studentProfile.grade || 'secundaria';
    const learningStyle = studentProfile.learningStyle || 'socratico';
    const studentName = studentProfile.name || 'Estudiante';
    const interests = studentProfile.interests ? `Intereses del estudiante para analogías: ${studentProfile.interests}.` : '';

    const systemInstruction = `
Eres S.A.R.A (Sistema de Apoyo y Rendimiento Académico), una tutora pedagógica y sistema de apoyo académico de excelencia, paciente, sumamente empática y adaptativa.
Estás tutorizando a ${studentName}.

PERFIL PEDAGÓGICO DEL ESTUDIANTE:
- Nivel educativo / Grado: ${grade}. Adapta el vocabulario, profundidad y ejemplos a este nivel con total precisión pedagógica.
- Estilo de aprendizaje preferido: ${learningStyle}.
  * Si es "socratico": No regales la solución de inmediato; haz preguntas reflexivas paso a paso para que el estudiante descubra el razonamiento.
  * Si es "visual": Estructura con viñetas claras, analogías espaciales, esquemas textuales ordenados y diagramas conceptuales legibles.
  * Si es "feynman": Explica con máxima sencillez, lenguaje directo, sin jerga artificial, como a un amigo o con analogías cotidianas.
  * Si es "practico": Brinda ejemplos reales de aplicación inmediata, ejercicios paso a paso y casos prácticos.
  * Si es "teorico": Enfatiza fundamentos lógicos, definiciones precisas, deducciones y principios universales.
- Materia actual: ${subject}. Adapta el estilo metodológico a la materia (p. ej. en Matemáticas desglose paso a paso y verificación; en Historia contexto causal y empatía histórica; en Ciencias causa-efecto y experimentos cotidianos; en Lengua sintaxis y enriquecimiento expresivo; en Filosofía mayéutica y dilemas; en Programación lógica algorítmica).
${interests}

MEMORIA DE TEMAS ANTERIORES DEL ESTUDIANTE:
${formattedMemories || 'No hay temas registrados aún.'}

INSTRUCCIONES CLAVE DE MEMORIA:
- Si el tema actual guarda alguna relación con alguno de los temas anteriores que el estudiante ya vio o domina, HAZ UNA MENCIÓN EXPLÍCITA Y NATURAL ("Como recordamos de cuando estudiamos [tema anterior]...", "Esto se parece al principio de [concepto previo]...").
- Mantén la coherencia pedagógica con lo que el estudiante ya sabe y refuerza lo que tenía marcado en proceso.
- Si el estudiante muestra comprensión de un nuevo tema o consolida un concepto, incluye una actualización para su cuaderno de memoria en 'memoryUpdate'.

FORMATO DE RESPUESTA:
Debes responder SIEMPRE en formato JSON válido con la siguiente estructura:
{
  "responseText": "Tu respuesta como S.A.R.A en Markdown enriquecido (usa negritas, listas o pasos claros según convenga). Sé cálida, clara y motivadora.",
  "suggestedQuestions": ["Pregunta de seguimiento 1", "Pregunta de seguimiento 2", "Opción o duda alternativa 3"],
  "highlightedConcept": "Concepto principal abordado (ej. 'Fotosíntesis', 'Factorización', etc.)",
  "memoryUpdate": {
    "shouldUpdate": true o false,
    "topicTitle": "Título del tema relevante tratado",
    "keyConceptsLearned": ["Concepto 1", "Concepto 2"],
    "summary": "Resumen conciso de 1-2 oraciones de lo aprendido",
    "suggestedMastery": "iniciado" | "en_progreso" | "dominado"
  }
}
`;

    const userPrompt = `
Historial reciente de la conversación:
${recentHistoryText}

Tema que se está abordando actualmente: ${currentTopic || 'Exploración general'}
Mensaje actual de ${studentName}: "${message}"

Responde como S.A.R.A (Sistema de Apoyo y Rendimiento Académico) siguiendo estrictamente las instrucciones pedagógicas y de memoria en formato JSON.
`;

    const response = await generateContentWithRetry({
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseText: {
              type: Type.STRING,
              description: 'Explicación o diálogo pedagógico en markdown',
            },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 a 3 sugerencias de preguntas o pasos a seguir',
            },
            highlightedConcept: {
              type: Type.STRING,
              description: 'Concepto clave principal',
            },
            memoryUpdate: {
              type: Type.OBJECT,
              properties: {
                shouldUpdate: { type: Type.BOOLEAN },
                topicTitle: { type: Type.STRING },
                keyConceptsLearned: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                summary: { type: Type.STRING },
                suggestedMastery: { type: Type.STRING },
              },
            },
          },
          required: ['responseText', 'suggestedQuestions'],
        },
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parse error from Gemini:', rawText);
      parsedData = {
        responseText: rawText,
        suggestedQuestions: ['¿Puedes darme un ejemplo?', '¿Hacemos una pregunta de prueba?', 'Explícalo con otras palabras'],
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/tutor/chat:', error);
    res.status(500).json({
      error: 'Hubo un error comunicándose con el tutor IA.',
      details: error?.message || 'Error desconocido',
    });
  }
});

// Quiz generation endpoint tailored to grade, subject and topic
app.post('/api/tutor/quiz', async (req, res) => {
  try {
    const { topic, subject, grade, learningStyle } = req.body;
    const ai = getGenAI();

    const prompt = `
Genera un quiz diagnóstico o de comprobación de 3 preguntas de opción múltiple para un estudiante de nivel "${grade || 'secundaria'}" sobre el tema "${topic || 'General'}" en la materia "${subject || 'General'}".
Estilo de aprendizaje preferido: ${learningStyle || 'visual'}.

Para cada pregunta incluye:
- question: Enunciado claro y bien redactado.
- options: Arreglo de 4 opciones de respuesta donde exactamente una es correcta.
- correctIndex: Índice numérico (0, 1, 2 o 3) de la respuesta correcta.
- explanation: Breve explicación pedagógica y formativa de por qué es la correcta.
`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ questions: parsed });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'No se pudo generar el quiz en este momento.' });
  }
});

// Flashcards generation endpoint
app.post('/api/tutor/flashcards', async (req, res) => {
  try {
    const { topic, subject, grade } = req.body;

    const prompt = `
Crea 4 o 5 tarjetas de memoria activa (flashcards) para repasar el tema "${topic}" de la materia "${subject}" para un estudiante de nivel "${grade}".
Cada tarjeta debe tener:
- front: Pregunta, término o concepto a recordar.
- back: Respuesta concisa, clara y memorable.
- hint: Una pista pedagógica o mnemotécnica para ayudar a recordarlo.
`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              hint: { type: Type.STRING },
            },
            required: ['front', 'back'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ flashcards: parsed });
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'No se pudieron generar las tarjetas de repaso.' });
  }
});

// Connect two previous topics endpoint
app.post('/api/tutor/connect-topics', async (req, res) => {
  try {
    const { topicA, topicB, grade, subjectA, subjectB } = req.body;

    const prompt = `
Como S.A.R.A (Sistema de Apoyo y Rendimiento Académico), tutora pedagógica para un estudiante de grado "${grade}", explica en 2 o 3 párrafos fascinantes cómo se conectan conceptualmente estos dos temas estudiados:
Tema 1: "${topicA}" (${subjectA})
Tema 2: "${topicB}" (${subjectB})

Proporciona analogías claras, muestra cómo el conocimiento de uno ilumina al otro y termina con una pregunta reflexiva que despierte su curiosidad.
`;

    const response = await generateContentWithRetry({
      contents: prompt,
    });

    res.json({ connectionText: response.text });
  } catch (error: any) {
    console.error('Error connecting topics:', error);
    res.status(500).json({ error: 'No se pudo generar la conexión interdisciplinaria.' });
  }
});

// Vite middleware integration
async function setupViteAndListen() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TutorIA Server running on http://localhost:${PORT}`);
  });
}

setupViteAndListen();
