import React, { useState } from 'react';
import { 
  Brain, 
  Search, 
  Sparkles, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Plus, 
  Trash2, 
  BookCheck, 
  Clock, 
  Share2, 
  FileQuestion, 
  Zap,
  HelpCircle,
  Tag
} from 'lucide-react';
import { TopicMemory, SubjectKey, MasteryLevel } from '../types';
import { SUBJECT_METADATA } from '../data/pedagogicalConfig';

interface MemoryPanelProps {
  memories: TopicMemory[];
  onSelectTopicForChat: (topic: TopicMemory) => void;
  onGenerateQuizForTopic: (topic: TopicMemory) => void;
  onGenerateFlashcardsForTopic: (topic: TopicMemory) => void;
  onOpenConnector: (topicA?: TopicMemory) => void;
  onAddNewTopic: (newTopic: Omit<TopicMemory, 'id'>) => void;
  onDeleteTopic: (id: string) => void;
  onAnnounce: (msg: string) => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  memories,
  onSelectTopicForChat,
  onGenerateQuizForTopic,
  onGenerateFlashcardsForTopic,
  onOpenConnector,
  onAddNewTopic,
  onDeleteTopic,
  onAnnounce,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<string>('all');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // New topic state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectKey>('ciencias');
  const [newSummary, setNewSummary] = useState('');
  const [newConcepts, setNewConcepts] = useState('');
  const [newMastery, setNewMastery] = useState<MasteryLevel>('iniciado');
  const [newNotes, setNewNotes] = useState('');

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = 
      m.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.keyConcepts.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = subjectFilter === 'all' || m.subject === subjectFilter;
    const matchesMastery = masteryFilter === 'all' || m.masteryLevel === masteryFilter;

    return matchesSearch && matchesSubject && matchesMastery;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddNewTopic({
      subject: newSubject,
      subjectDisplayName: SUBJECT_METADATA[newSubject]?.name || newSubject,
      topicTitle: newTitle.trim(),
      summary: newSummary.trim() || 'Estudio individual registrado por el estudiante.',
      keyConcepts: newConcepts.split(',').map((c) => c.trim()).filter(Boolean),
      masteryLevel: newMastery,
      lastStudied: new Date().toISOString(),
      notes: newNotes.trim() || 'Agregado manualmente al cuaderno de memoria.',
      connections: [],
    });

    onAnnounce(`Nuevo tema "${newTitle}" añadido a la memoria`);
    setIsAddingTopic(false);
    setNewTitle('');
    setNewSummary('');
    setNewConcepts('');
    setNewNotes('');
  };

  const masteryConfig: Record<MasteryLevel, { label: string; badgeClass: string; dotClass: string }> = {
    dominado: {
      label: 'Dominado',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      dotClass: 'bg-emerald-500',
    },
    en_progreso: {
      label: 'En Progreso',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      dotClass: 'bg-amber-500',
    },
    iniciado: {
      label: 'Recién Iniciado',
      badgeClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      dotClass: 'bg-blue-500',
    },
  };

  const dominatedCount = memories.filter((m) => m.masteryLevel === 'dominado').length;
  const inProgressCount = memories.filter((m) => m.masteryLevel === 'en_progreso').length;

  return (
    <div id="memory-panel-root" className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs text-indigo-200">
              <Brain className="w-3.5 h-3.5 text-indigo-300" />
              Memoria Continua de S.A.R.A
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Cuaderno de Temas Anteriores y Progreso
            </h2>
            <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
              S.A.R.A consulta esta memoria en cada conversación para tender puentes entre lo que ya aprendiste y los nuevos conceptos académicos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="open-connector-btn"
              onClick={() => onOpenConnector()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              Conectar 2 Temas
            </button>
            <button
              id="btn-add-memory-topic"
              onClick={() => setIsAddingTopic(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir Tema
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-xl font-extrabold text-white">{memories.length}</span>
            <p className="text-[11px] text-indigo-200">Temas en Memoria</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-xl font-extrabold text-emerald-400">{dominatedCount}</span>
            <p className="text-[11px] text-indigo-200">Temas Dominados</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-xl font-extrabold text-amber-400">{inProgressCount}</span>
            <p className="text-[11px] text-indigo-200">En Progreso / Refuerzo</p>
          </div>
        </div>
      </div>

      {/* Add Topic Modal / Drawer Form */}
      {isAddingTopic && (
        <form 
          onSubmit={handleCreateTopic}
          className="p-5 bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-lg space-y-4 animate-in fade-in slide-in-from-top duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Plus className="w-4 h-4 text-indigo-600" />
              Registrar nuevo tema en el historial del estudiante
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingTopic(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Título del Tema *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Teorema de Pitágoras, Ecosistemas, Revolución Francesa"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Materia
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value as SubjectKey)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-hidden focus:border-indigo-500"
              >
                {(Object.keys(SUBJECT_METADATA) as SubjectKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SUBJECT_METADATA[key].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resumen o Explicación Clave
            </label>
            <textarea
              rows={2}
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="¿Qué es lo principal que aprendió el estudiante sobre este tema?"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Conceptos clave (separados por comas)
              </label>
              <input
                type="text"
                value={newConcepts}
                onChange={(e) => setNewConcepts(e.target.value)}
                placeholder="Ej: Cateto, Hipotenusa, Triángulo rectángulo"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nivel de dominio inicial
              </label>
              <div className="flex gap-2">
                {(['iniciado', 'en_progreso', 'dominado'] as MasteryLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNewMastery(lvl)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      newMastery === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {masteryConfig[lvl].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTopic(false)}
              className="px-3 py-1.5 text-xs text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Guardar en Memoria
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            id="search-memory-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tema, concepto clave o resumen..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <select
            id="filter-subject-select"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="all">Todas las materias</option>
            {(Object.keys(SUBJECT_METADATA) as SubjectKey[]).map((key) => (
              <option key={key} value={key}>
                {SUBJECT_METADATA[key].name}
              </option>
            ))}
          </select>

          <select
            id="filter-mastery-select"
            value={masteryFilter}
            onChange={(e) => setMasteryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="all">Todos los estados</option>
            <option value="dominado">Dominado</option>
            <option value="en_progreso">En Progreso</option>
            <option value="iniciado">Recién Iniciado</option>
          </select>
        </div>
      </div>

      {/* Memory Topics Cards List */}
      <div className="space-y-4">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
            <Brain className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-sm">No se encontraron temas con esos filtros.</p>
            <p className="text-xs text-slate-400 mt-1">
              Prueba con otra búsqueda o pide al tutor en el chat repasar un nuevo concepto.
            </p>
          </div>
        ) : (
          filteredMemories.map((topic) => {
            const mastery = masteryConfig[topic.masteryLevel];
            return (
              <div
                key={topic.id}
                id={`memory-item-${topic.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3.5"
              >
                {/* Header of card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {topic.subjectDisplayName || topic.subject}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${mastery.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${mastery.dotClass}`} />
                        {mastery.label}
                      </span>
                      {topic.lastStudied && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(topic.lastStudied).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {topic.topicTitle}
                    </h3>
                  </div>

                  {/* Primary actions on topic */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onGenerateQuizForTopic(topic)}
                      title="Generar Quiz de 3 preguntas de este tema"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <FileQuestion className="w-3.5 h-3.5 text-blue-600" />
                      Quiz
                    </button>
                    <button
                      onClick={() => onGenerateFlashcardsForTopic(topic)}
                      title="Generar tarjetas de memoria activa (Flashcards)"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Tarjetas
                    </button>
                    <button
                      onClick={() => onSelectTopicForChat(topic)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Repasar con Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {topic.summary}
                </p>

                {/* Key Concepts Chips */}
                {topic.keyConcepts && topic.keyConcepts.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                      <Tag className="w-3 h-3" /> Conceptos clave:
                    </span>
                    {topic.keyConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-100 dark:border-indigo-900/60"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tutor Notes & Connections */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="italic">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 not-italic">Nota del Tutor: </span>
                    {topic.notes || 'Ninguna observación especial registrada.'}
                  </div>

                  {topic.connections && topic.connections.length > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-semibold">Conecta con:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {topic.connections.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
