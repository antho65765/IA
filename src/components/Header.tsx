import React from 'react';
import { 
  Brain, 
  MessageSquare, 
  GraduationCap, 
  Sliders, 
  Eye, 
  Sun, 
  Moon, 
  Volume2, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { StudentProfile, AccessibilitySettings, SubjectKey } from '../types';
import { SUBJECT_METADATA, GRADE_LABELS } from '../data/pedagogicalConfig';

interface HeaderProps {
  activeTab: 'chat' | 'memory';
  setActiveTab: (tab: 'chat' | 'memory') => void;
  studentProfile: StudentProfile;
  accessibilitySettings: AccessibilitySettings;
  onOpenAccessibility: () => void;
  onOpenProfile: () => void;
  onToggleHighContrast: () => void;
  memoryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  studentProfile,
  accessibilitySettings,
  onOpenAccessibility,
  onOpenProfile,
  onToggleHighContrast,
  memoryCount,
}) => {
  const currentSubjectInfo = SUBJECT_METADATA[studentProfile.currentSubject] || {
    name: 'General',
  };
  const gradeInfo = GRADE_LABELS[studentProfile.grade] || {
    title: studentProfile.grade,
  };

  return (
    <header 
      id="main-app-header"
      className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      {/* Skip link for screen readers */}
      <a 
        href="#main-content-area"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-blue-600 focus:text-white focus:font-bold focus:top-2 focus:left-2 focus:rounded-xl shadow-lg"
      >
        Saltar al contenido principal
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                S.A.R.A
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Sistema de Apoyo y Rendimiento Académico
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-none">
              Tutoría inteligente adaptativa con memoria de estudio
            </p>
          </div>
        </div>

        {/* Center Tab Switcher */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80" aria-label="Navegación principal">
          <button
            id="tab-btn-chat"
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            aria-selected={activeTab === 'chat'}
            role="tab"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tutoría</span>
          </button>
          <button
            id="tab-btn-memory"
            onClick={() => setActiveTab('memory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            aria-selected={activeTab === 'memory'}
            role="tab"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memoria ({memoryCount})</span>
          </button>
        </nav>

        {/* Right Accessibility & Profile Toolbar */}
        <div className="flex items-center gap-2">
          
          {/* Quick High Contrast Button */}
          <button
            id="quick-contrast-btn"
            onClick={onToggleHighContrast}
            title={accessibilitySettings.highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
            aria-label={accessibilitySettings.highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              accessibilitySettings.highContrast
                ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Accessibility Settings Modal Button */}
          <button
            id="open-accessibility-menu-btn"
            onClick={onOpenAccessibility}
            title="Abrir panel de accesibilidad (Alt+A)"
            aria-label="Abrir panel de accesibilidad avanzada"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline">Accesibilidad</span>
          </button>

          {/* Student Profile Capsule Button */}
          <button
            id="student-profile-capsule-btn"
            onClick={onOpenProfile}
            title="Ver o editar perfil y estilo de aprendizaje"
            aria-label={`Perfil de estudiante: ${studentProfile.name}`}
            className="pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800 transition-all flex items-center gap-2 text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="hidden lg:block leading-tight">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                {studentProfile.name}
              </span>
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[100px]">
                {gradeInfo.title.split('(')[0]}
              </span>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
