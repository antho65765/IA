import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Brain,
  Wand2,
  StopCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, StudentProfile, TopicMemory, AccessibilitySettings } from '../types';
import { GRADE_LABELS, LEARNING_STYLE_LABELS, SUBJECT_METADATA } from '../data/pedagogicalConfig';

interface ChatAreaProps {
  messages: ChatMessage[];
  studentProfile: StudentProfile;
  currentTopic: string;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  accessibilitySettings: AccessibilitySettings;
  onOpenProfile: () => void;
  onOpenMemory: () => void;
  onGenerateQuiz: (topicTitle: string) => void;
  onGenerateFlashcards: (topicTitle: string) => void;
  onAnnounce: (msg: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  studentProfile,
  currentTopic,
  onSendMessage,
  isLoading,
  accessibilitySettings,
  onOpenProfile,
  onOpenMemory,
  onGenerateQuiz,
  onGenerateFlashcards,
  onAnnounce,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech Recognition (Dictation)
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        onAnnounce(`Voz reconocida: "${transcript}"`);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onAnnounce]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir tu duda en el campo de texto.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        onAnnounce('Micrófono activado. Habla ahora tu pregunta para S.A.R.A.');
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  // Text-To-Speech (Lectura en voz alta)
  const speakText = (text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }

    if (currentlySpeakingId === messageId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Remove markdown symbols for cleaner TTS
    const cleanText = text
      .replace(/[#*`_\[\]()]/g, '')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = accessibilitySettings.speechRate || 1.0;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    setCurrentlySpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
    onAnnounce('Leyendo respuesta del tutor en voz alta.');
  };

  // Auto-read response if enabled
  useEffect(() => {
    if (accessibilitySettings.autoReadResponse && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'tutor') {
        speakText(lastMsg.text, lastMsg.id);
      }
    }
  }, [messages.length, accessibilitySettings.autoReadResponse]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const query = inputText.trim();
    setInputText('');
    await onSendMessage(query);
  };

  const currentSubjectInfo = SUBJECT_METADATA[studentProfile.currentSubject] || {
    name: 'General',
  };
  const currentGradeInfo = GRADE_LABELS[studentProfile.grade] || {
    title: studentProfile.grade,
  };
  const currentStyleInfo = LEARNING_STYLE_LABELS[studentProfile.learningStyle] || {
    title: studentProfile.learningStyle,
  };

  const lineSpacingClass = {
    normal: 'leading-relaxed',
    relaxed: 'leading-loose',
    double: 'leading-loose space-y-4',
  }[accessibilitySettings.lineSpacing || 'normal'];

  return (
    <div id="chat-area-container" className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Top Pedagogical Context Banner */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-tight">
            SARA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                S.A.R.A con {studentProfile.name}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                {currentSubjectInfo.name.split('/')[0]}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Nivel: <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentGradeInfo.title}</strong> • Estilo: <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentStyleInfo.title}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="change-pedagogical-profile-btn"
            onClick={onOpenProfile}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Ajustar Pedagogía
          </button>
          <button
            id="view-memory-from-chat-btn"
            onClick={onOpenMemory}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Ver Memoria</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div 
        id="chat-messages-scroll"
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = currentlySpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              id={`chat-msg-${msg.id}`}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Sender Tag & Actions */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{isUser ? studentProfile.name : 'S.A.R.A'}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                {!isUser && (
                  <button
                    onClick={() => speakText(msg.text, msg.id)}
                    className={`p-1 rounded-md transition-colors ${
                      isSpeaking
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title={isSpeaking ? 'Detener lectura en voz alta' : 'Escuchar respuesta en voz alta'}
                    aria-label={isSpeaking ? 'Detener lectura en voz alta' : 'Escuchar respuesta en voz alta'}
                  >
                    {isSpeaking ? (
                      <span className="flex items-center gap-1 text-blue-600">
                        <StopCircle className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        <span className="text-[10px]">Detener</span>
                      </span>
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${lineSpacingClass} ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {/* Concept Banner if highlighted */}
                {!isUser && msg.highlightedConcept && (
                  <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    {msg.highlightedConcept}
                  </div>
                )}

                {/* Body in Markdown */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-inherit break-words">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {/* Memory update notification pill */}
                {!isUser && msg.memoryUpdate && msg.memoryUpdate.topicTitle && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Concepto memorizado: <strong>{msg.memoryUpdate.topicTitle}</strong>
                      </span>
                    </div>
                    <button
                      onClick={onOpenMemory}
                      className="text-emerald-800 dark:text-emerald-300 font-bold hover:underline shrink-0"
                    >
                      Ver en Memoria →
                    </button>
                  </div>
                )}
              </div>

              {/* Suggested Questions / Next Steps */}
              {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.suggestedQuestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(sug)}
                      disabled={isLoading}
                      className="text-left text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                    >
                      💡 {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start space-y-1.5">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>S.A.R.A está adaptando la explicación a tu estilo pedagógico...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Pills for Learning */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
        <span className="font-semibold text-slate-500 shrink-0 mr-1">Herramientas:</span>
        <button
          onClick={() => onSendMessage('Explícamelo como a un niño de 10 años (Técnica Feynman)')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          Más Simple (Feynman)
        </button>
        <button
          onClick={() => onSendMessage('Dame un ejemplo real y práctico de la vida cotidiana sobre esto')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1 transition-colors"
        >
          <Lightbulb className="w-3 h-3 text-blue-500" />
          Ejemplo Práctico
        </button>
        <button
          onClick={() => onSendMessage('Hazme una pregunta desafiante para poner a prueba si de verdad lo entendí')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3 h-3 text-purple-500" />
          Ponme a Prueba
        </button>
        <button
          onClick={() => onSendMessage('¿Cómo se conecta este tema con lo que aprendí en temas anteriores?')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1 transition-colors"
        >
          <Brain className="w-3 h-3 text-emerald-500" />
          Conectar con Memoria
        </button>
        <button
          onClick={() => onGenerateQuiz(currentTopic || currentSubjectInfo.name)}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold shrink-0 flex items-center gap-1"
        >
          <BookOpen className="w-3 h-3" />
          Quiz Rápido
        </button>
      </div>

      {/* Input Form Bar */}
      <form 
        onSubmit={handleSend}
        className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0"
      >
        <div className="flex items-center gap-2">
          {/* Voice Dictation Button */}
          <button
            type="button"
            id="voice-dictation-btn"
            onClick={toggleVoiceInput}
            title={isListening ? 'Detener dictado' : 'Hablar por micrófono (Dictado por voz accesible)'}
            aria-label={isListening ? 'Detener dictado' : 'Hablar por micrófono'}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse ring-2 ring-red-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              id="chat-input-field"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Escuchando tu voz... Habla ahora'
                  : 'Pregunta a tu tutor, escribe un ejercicio o pide una explicación...'
              }
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950 transition-all outline-hidden pr-10"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="chat-send-btn"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs shrink-0 flex items-center justify-center focus:ring-2 focus:ring-blue-400"
            aria-label="Enviar mensaje al tutor"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isListening && (
          <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            Dictado activo: habla con claridad hacia tu micrófono
          </p>
        )}
      </form>

    </div>
  );
};
