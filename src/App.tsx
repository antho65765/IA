import React, { useState, useEffect, useCallback } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  ChatArea 
} from './components/ChatArea';
import { 
  MemoryPanel 
} from './components/MemoryPanel';
import { 
  AccessibilityToolbar 
} from './components/AccessibilityToolbar';
import { 
  StudentProfileModal 
} from './components/StudentProfileModal';
import { 
  QuizModal 
} from './components/QuizModal';
import { 
  FlashcardsModal 
} from './components/FlashcardsModal';
import { 
  TopicConnectorModal 
} from './components/TopicConnectorModal';
import { 
  ReadingGuide 
} from './components/ReadingGuide';
import { 
  StudentProfile, 
  TopicMemory, 
  ChatMessage, 
  AccessibilitySettings, 
  QuizQuestion, 
  Flashcard 
} from './types';
import { 
  INITIAL_STUDENT_PROFILE, 
  INITIAL_TOPIC_MEMORIES,
  SUBJECT_METADATA 
} from './data/pedagogicalConfig';

export default function App() {
  // Accessibility state
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('tutoria_accessibility');
      return saved ? JSON.parse(saved) : {
        highContrast: false,
        dyslexicFont: false,
        fontSize: 'normal',
        readingGuide: false,
        lineSpacing: 'normal',
        autoReadResponse: false,
        speechRate: 1.0,
        simplifiedView: false,
      };
    } catch {
      return {
        highContrast: false,
        dyslexicFont: false,
        fontSize: 'normal',
        readingGuide: false,
        lineSpacing: 'normal',
        autoReadResponse: false,
        speechRate: 1.0,
        simplifiedView: false,
      };
    }
  });

  // Student Profile state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('tutoria_profile');
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
    } catch {
      return INITIAL_STUDENT_PROFILE;
    }
  });

  // Topic Memories state
  const [memories, setMemories] = useState<TopicMemory[]>(() => {
    try {
      const saved = localStorage.getItem('tutoria_memories');
      return saved ? JSON.parse(saved) : INITIAL_TOPIC_MEMORIES;
    } catch {
      return INITIAL_TOPIC_MEMORIES;
    }
  });

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('tutoria_chat');
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        // Ensure welcome message reflects S.A.R.A
        return parsed.map((m) => {
          if (m.id === 'welcome-msg' && m.text.includes('TutorIA')) {
            return {
              ...m,
              text: m.text.replace(/TutorIA/g, 'S.A.R.A (Sistema de Apoyo y Rendimiento Académico)'),
            };
          }
          return m;
        });
      }
    } catch {}

    const subjectName = SUBJECT_METADATA[profile.currentSubject]?.name || 'Ciencias';
    return [
      {
        id: 'welcome-msg',
        sender: 'tutor',
        text: `¡Hola ${profile.name}! Soy **S.A.R.A** (*Sistema de Apoyo y Rendimiento Académico*), tu tutora personal de estudio.

He adaptado mi estilo pedagógico para tu nivel (**${profile.grade}**) con un enfoque **${profile.learningStyle}** en la materia de **${subjectName}**.

🧠 **Tengo acceso a tu memoria de estudio anterior:**
- Recuerda que ya repasamos temas como *Fotosíntesis y Cloroplastos* y *Ecuaciones de Primer Grado*.
- Siempre que lo necesites, relacionaremos lo nuevo con lo que ya dominas para potenciar tu rendimiento académico.

¿Qué tema, ejercicio o duda te gustaría que exploremos hoy?`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          '¿Cómo se relaciona la respiración celular con la fotosíntesis?',
          'Explícame un ejercicio paso a paso',
          'Hazme un quiz de repaso de mis temas anteriores',
        ],
        highlightedConcept: 'Bienvenida pedagógica',
      },
    ];
  });

  // Active UI states
  const [activeTab, setActiveTab] = useState<'chat' | 'memory'>('chat');
  const [currentTopic, setCurrentTopic] = useState<string>('Fotosíntesis y Respiración Celular');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Modals
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizTopic, setQuizTopic] = useState('');
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsTopic, setFlashcardsTopic] = useState('');
  const [isFlashcardsLoading, setIsFlashcardsLoading] = useState(false);

  const [isConnectorOpen, setIsConnectorOpen] = useState(false);
  const [connectorDefaultTopicA, setConnectorDefaultTopicA] = useState<TopicMemory | undefined>();

  // Screen reader announcer
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  const announce = useCallback((msg: string) => {
    setScreenReaderAnnouncement(msg);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('tutoria_accessibility', JSON.stringify(accessibility));
  }, [accessibility]);

  useEffect(() => {
    localStorage.setItem('tutoria_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('tutoria_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('tutoria_chat', JSON.stringify(messages));
  }, [messages]);

  // Apply font scale and accessibility classes to document root
  useEffect(() => {
    const scale = 
      accessibility.fontSize === 'large' ? '1.15rem' :
      accessibility.fontSize === 'extra-large' ? '1.30rem' : '1rem';
    
    document.documentElement.style.setProperty('--app-font-scale', scale);

    if (accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (accessibility.dyslexicFont) {
      document.body.classList.add('font-dyslexic');
    } else {
      document.body.classList.remove('font-dyslexic');
    }
  }, [accessibility.fontSize, accessibility.highContrast, accessibility.dyslexicFont]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAccessibilityOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsAccessibilityOpen(false);
        setIsProfileOpen(false);
        setIsQuizOpen(false);
        setIsFlashcardsOpen(false);
        setIsConnectorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Chat message sender
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);
    announce('Pregunta enviada. Esperando respuesta del tutor IA.');

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatHistory: messages.slice(-10),
          studentProfile: profile,
          memoryTopics: memories,
          currentTopic,
        }),
      });

      const data = await response.json();

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: data.responseText || 'Disculpa, no pude procesar esa respuesta. ¿Puedes reformularla?',
        timestamp: new Date().toISOString(),
        suggestedQuestions: data.suggestedQuestions || [],
        highlightedConcept: data.highlightedConcept,
        memoryUpdate: data.memoryUpdate,
      };

      setMessages((prev) => [...prev, tutorMsg]);

      // If tutor returned a memory update, integrate it into student's memory notebook!
      if (data.memoryUpdate && data.memoryUpdate.shouldUpdate && data.memoryUpdate.topicTitle) {
        const title = data.memoryUpdate.topicTitle;
        setMemories((prev) => {
          const existingIndex = prev.findIndex(
            (m) => m.topicTitle.toLowerCase() === title.toLowerCase()
          );

          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              lastStudied: new Date().toISOString(),
              summary: data.memoryUpdate.summary || updated[existingIndex].summary,
              keyConcepts: Array.from(
                new Set([...updated[existingIndex].keyConcepts, ...(data.memoryUpdate.keyConceptsLearned || [])])
              ),
              masteryLevel: data.memoryUpdate.suggestedMastery || updated[existingIndex].masteryLevel,
            };
            return updated;
          } else {
            const newMem: TopicMemory = {
              id: `mem-${Date.now()}`,
              subject: profile.currentSubject,
              subjectDisplayName: SUBJECT_METADATA[profile.currentSubject]?.name || profile.currentSubject,
              topicTitle: title,
              summary: data.memoryUpdate.summary || 'Tema aprendido en la sesión con el tutor.',
              keyConcepts: data.memoryUpdate.keyConceptsLearned || [],
              masteryLevel: data.memoryUpdate.suggestedMastery || 'iniciado',
              lastStudied: new Date().toISOString(),
              connections: [],
              notes: 'Actualizado automáticamente por S.A.R.A tras la sesión de estudio.',
            };
            return [newMem, ...prev];
          }
        });

        announce(`Concepto "${title}" añadido o actualizado en tu memoria.`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'tutor',
        text: 'Lo siento, ocurrió un problema conectando con el servicio pedagógico. Verifica que tu conexión a internet esté activa.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate Quiz for topic
  const handleGenerateQuiz = async (topicTitle: string) => {
    setQuizTopic(topicTitle);
    setIsQuizOpen(true);
    setIsQuizLoading(true);
    setQuizQuestions([]);
    announce(`Generando quiz diagnóstico para ${topicTitle}`);

    try {
      const res = await fetch('/api/tutor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicTitle,
          subject: SUBJECT_METADATA[profile.currentSubject]?.name || profile.currentSubject,
          grade: profile.grade,
          learningStyle: profile.learningStyle,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        announce(`Quiz listo con ${data.questions.length} preguntas.`);
      } else {
        announce('No se pudieron generar preguntas para este tema.');
      }
    } catch (e) {
      console.error('Quiz error:', e);
      announce('Error al generar el quiz.');
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Quiz completion updates mastery
  const handleQuizCompleted = (topic: string, score: number, total: number) => {
    const isMastered = score >= total * 0.8;
    const isProgress = score >= total * 0.5;

    setMemories((prev) => {
      const existing = prev.find((m) => m.topicTitle.toLowerCase() === topic.toLowerCase());
      if (existing) {
        return prev.map((m) => {
          if (m.id === existing.id) {
            return {
              ...m,
              masteryLevel: isMastered ? 'dominado' : isProgress ? 'en_progreso' : m.masteryLevel,
              lastStudied: new Date().toISOString(),
              notes: `Quiz completado con ${score}/${total}. ${m.notes || ''}`,
            };
          }
          return m;
        });
      }
      return prev;
    });
  };

  // Generate Flashcards
  const handleGenerateFlashcards = async (topicTitle: string) => {
    setFlashcardsTopic(topicTitle);
    setIsFlashcardsOpen(true);
    setIsFlashcardsLoading(true);
    setFlashcards([]);
    announce(`Generando tarjetas de memoria activa para ${topicTitle}`);

    try {
      const res = await fetch('/api/tutor/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicTitle,
          subject: SUBJECT_METADATA[profile.currentSubject]?.name || profile.currentSubject,
          grade: profile.grade,
        }),
      });

      const data = await res.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        announce(`Tarjetas listas. Se generaron ${data.flashcards.length} tarjetas.`);
      }
    } catch (e) {
      console.error('Flashcard error:', e);
    } finally {
      setIsFlashcardsLoading(false);
    }
  };

  // Resume topic from memory in chat
  const handleSelectTopicForChat = (topic: TopicMemory) => {
    setCurrentTopic(topic.topicTitle);
    setActiveTab('chat');
    handleSendMessage(`Tutor, me gustaría retomar y repasar el tema que tengo en mi memoria: "${topic.topicTitle}". ¿Puedes hacerme un resumen de lo principal y una pregunta para recordar?`);
    announce(`Cambiado a tutoría del tema ${topic.topicTitle}`);
  };

  // Add new topic manually
  const handleAddNewTopic = (newTopicData: Omit<TopicMemory, 'id'>) => {
    const newTopic: TopicMemory = {
      ...newTopicData,
      id: `mem-${Date.now()}`,
    };
    setMemories((prev) => [newTopic, ...prev]);
  };

  // Delete topic
  const handleDeleteTopic = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    announce('Tema eliminado de la memoria.');
  };

  // Open topic connector
  const handleOpenConnector = (topicA?: TopicMemory) => {
    setConnectorDefaultTopicA(topicA);
    setIsConnectorOpen(true);
  };

  return (
    <div 
      id="app-root"
      className={`min-h-screen flex flex-col ${
        accessibility.highContrast 
          ? 'bg-black text-yellow-300' 
          : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Invisible Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Reading Guide Ruler if active */}
      <ReadingGuide enabled={accessibility.readingGuide} />

      {/* Main App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentProfile={profile}
        accessibilitySettings={accessibility}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onToggleHighContrast={() => {
          const next = !accessibility.highContrast;
          setAccessibility((prev) => ({ ...prev, highContrast: next }));
          announce(next ? 'Alto contraste activado' : 'Alto contraste desactivado');
        }}
        memoryCount={memories.length}
      />

      {/* Main Content Area */}
      <main 
        id="main-content-area" 
        className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col"
      >
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-[600px]">
            <ChatArea
              messages={messages}
              studentProfile={profile}
              currentTopic={currentTopic}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              accessibilitySettings={accessibility}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenMemory={() => setActiveTab('memory')}
              onGenerateQuiz={handleGenerateQuiz}
              onGenerateFlashcards={handleGenerateFlashcards}
              onAnnounce={announce}
            />
          </div>
        ) : (
          <MemoryPanel
            memories={memories}
            onSelectTopicForChat={handleSelectTopicForChat}
            onGenerateQuizForTopic={(t) => handleGenerateQuiz(t.topicTitle)}
            onGenerateFlashcardsForTopic={(t) => handleGenerateFlashcards(t.topicTitle)}
            onOpenConnector={handleOpenConnector}
            onAddNewTopic={handleAddNewTopic}
            onDeleteTopic={handleDeleteTopic}
            onAnnounce={announce}
          />
        )}
      </main>

      {/* Accessibility Toolbar Modal */}
      <AccessibilityToolbar
        settings={accessibility}
        onUpdateSettings={(newSettings) => setAccessibility((prev) => ({ ...prev, ...newSettings }))}
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        onAnnounce={announce}
      />

      {/* Student Profile Settings Modal */}
      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={(newProf) => {
          setProfile(newProf);
          announce('Perfil pedagógico actualizado con éxito.');
        }}
        onAnnounce={announce}
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        topicTitle={quizTopic}
        questions={quizQuestions}
        isLoading={isQuizLoading}
        onQuizCompleted={handleQuizCompleted}
        onAnnounce={announce}
      />

      {/* Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        topicTitle={flashcardsTopic}
        flashcards={flashcards}
        isLoading={isFlashcardsLoading}
        onAnnounce={announce}
      />

      {/* Topic Connector Modal */}
      <TopicConnectorModal
        isOpen={isConnectorOpen}
        onClose={() => setIsConnectorOpen(false)}
        memories={memories}
        defaultTopicA={connectorDefaultTopicA}
        studentGrade={profile.grade}
        onAnnounce={announce}
      />
    </div>
  );
}
