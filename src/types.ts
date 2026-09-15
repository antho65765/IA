export type StudentGrade = 
  | 'primaria' 
  | 'secundaria' 
  | 'bachillerato' 
  | 'universidad' 
  | 'autodidacta';

export type LearningStyle = 
  | 'visual' 
  | 'practico' 
  | 'teorico' 
  | 'socratico' 
  | 'feynman';

export type SubjectKey = 
  | 'matematicas' 
  | 'ciencias' 
  | 'historia' 
  | 'lengua' 
  | 'filosofia' 
  | 'programacion' 
  | 'idiomas' 
  | 'otro';

export interface StudentProfile {
  name: string;
  grade: StudentGrade;
  learningStyle: LearningStyle;
  currentSubject: SubjectKey;
  customSubjectName?: string;
  interests?: string; // e.g. "fútbol, videojuegos, música" for contextual metaphors
}

export type MasteryLevel = 'iniciado' | 'en_progreso' | 'dominado';

export interface TopicMemory {
  id: string;
  subject: SubjectKey;
  subjectDisplayName: string;
  topicTitle: string;
  summary: string;
  keyConcepts: string[];
  masteryLevel: MasteryLevel;
  lastStudied: string; // ISO date
  studyTimeMinutes?: number;
  connections?: string[]; // references to other topics
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  highlightedConcept?: string;
  memoryUpdate?: {
    topicTitle: string;
    keyConceptsLearned: string[];
    summary: string;
    suggestedMastery?: MasteryLevel;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  subject: SubjectKey;
  topic: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  dyslexicFont: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  readingGuide: boolean;
  lineSpacing: 'normal' | 'relaxed' | 'double';
  autoReadResponse: boolean;
  speechRate: number; // 0.8, 1.0, 1.2
  simplifiedView: boolean; // distraction-free focus mode
}
