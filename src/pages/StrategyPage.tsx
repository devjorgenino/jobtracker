import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { StrategyService } from '../services/hr/strategyService';
import { Badge } from '../components/common/Badge';
import type { Lang } from '../i18n';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Linkedin,
  Mail,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export const StrategyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryJobId = searchParams.get('jobId');

  const {
    jobs,
    masterCV,
    tailoredCvs,
    strategies,
    setStrategy,
    toggleTacticalStep,
    aiConfig,
  } = useStore();

  const [selectedJobId, setSelectedJobId] = useState<string>(queryJobId || jobs[0]?.id || '');
  const [selectedLang, setSelectedLang] = useState<Lang>('es');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>('q_1');

  useEffect(() => {
    if (queryJobId) {
      setSelectedJobId(queryJobId);
    } else if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [queryJobId, jobs]);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || null;
  const currentStrategy = selectedJobId ? strategies[selectedJobId] : null;
  const currentTailoredCv = selectedJobId ? tailoredCvs[selectedJobId] : null;

  const handleGenerateStrategy = async () => {
    if (!activeJob) {
      toast.error('Selecciona una vacante para generar la estrategia.');
      return;
    }

    setIsGenerating(true);
    toast.info(`Diseñando estrategia de captación y redactando mensajes (${selectedLang.toUpperCase()})...`, { duration: 3000 });

    try {
      const cvToUse = currentTailoredCv || masterCV;
      const strategy = await StrategyService.generateStrategy(activeJob, cvToUse, aiConfig, selectedLang);
      setStrategy(activeJob.id, strategy);
      toast.success(`🎯 ¡Estrategia y mensajes (${selectedLang.toUpperCase()}) generados con éxito!`);
    } catch (e: any) {
      console.error(e);
      toast.error('Error al generar la estrategia con IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Mensaje copiado al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenLinkedInSearch = () => {
    if (!activeJob) return;
    const query = encodeURIComponent(`${activeJob.company} recruiter OR "talent acquisition" OR "engineering manager"`);
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${query}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-purple-500/20 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2.5">
            <Send className="w-6 h-6 text-purple-400" />
            Estrategia de Captación & Mensajes para Reclutadores
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Genera automáticamente los mensajes de contacto directo por LinkedIn, correos de postulación, seguimiento a 5-7 días y el plan táctico paso a paso para destacar entre los cientos de candidatos.
          </p>
        </div>

        {/* Job Selector & Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Vacante
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-100 focus:outline-none focus:border-purple-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.position}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="pt-4">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700/80 shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedLang('es')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLang === 'es'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Generar estrategia y mensajes en Español"
              >
                🇪🇸 ES
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLang === 'en'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Generate strategy & outreach messages in English"
              >
                🇺🇸 EN
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerateStrategy}
              disabled={isGenerating || !activeJob}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Diseñando ({selectedLang.toUpperCase()})...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {currentStrategy ? `Regenerar Estrategia (${selectedLang.toUpperCase()})` : `Generar Estrategia (${selectedLang.toUpperCase()})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Master CV Reference Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-sm">
            CV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                Estrategia e InMails basados en: <strong className="text-purple-400">{masterCV.personalInfo?.name || 'CV Maestro'}</strong>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {masterCV.personalInfo?.roleTitle || 'Perfil Profesional'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Personalizando mensajes con tus {masterCV.workExperience?.length || 0} roles previos y {masterCV.skillCategories?.reduce((acc, c) => acc + (c.skills?.length || 0), 0) || 0} habilidades verificadas.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/cv')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          Actualizar CV Maestro
        </button>
      </div>

      {currentStrategy && activeJob ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Outreach Messages (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Visión de la Empresa
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{currentStrategy.companyOverview}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Dolor Clave que Resuelves
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{currentStrategy.roleAnalysis}</p>
              </div>
            </div>

            {/* Outreach Messages Deck */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  Mensajes de Contacto Personalizados
                </h3>
                <button
                  onClick={handleOpenLinkedInSearch}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  Buscar Reclutadores en LinkedIn ↗
                </button>
              </div>

              {/* 1. LinkedIn Connection Request Note */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        Nota de Conexión en LinkedIn
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Límite estricto de 300 caracteres ({currentStrategy.outreachMessages.linkedinConnection.length}/300)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(currentStrategy.outreachMessages.linkedinConnection, 'li_conn')
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'li_conn' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copiar Nota
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed">
                  {currentStrategy.outreachMessages.linkedinConnection}
                </div>
              </div>

              {/* 2. Formal Cover Letter / Email */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        Email de Postulación / Cover Letter
                      </h4>
                      <p className="text-[10px] text-slate-400">Para enviar junto con tu CV adaptado</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(currentStrategy.outreachMessages.emailCoverLetter, 'email_cover')
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'email_cover' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copiar Email
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {currentStrategy.outreachMessages.emailCoverLetter}
                </div>
              </div>

              {/* 3. Follow Up Cadence */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        Email de Seguimiento / Follow-Up (5 a 7 días)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Aumenta tu tasa de respuesta en un 60%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(currentStrategy.outreachMessages.followUpEmail, 'follow_up')
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'follow_up' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copiar
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentStrategy.outreachMessages.followUpEmail}
                </div>
              </div>

              {/* 4. Post-Interview & Negotiation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Post-Entrevista (Thank you)</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          currentStrategy.outreachMessages.postInterviewThankYou,
                          'thank_you'
                        )
                      }
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      {copiedKey === 'thank_you' ? 'Copiado ✓' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3">
                    {currentStrategy.outreachMessages.postInterviewThankYou}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Negociación de Oferta</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          currentStrategy.outreachMessages.salaryNegotiation,
                          'negotiation'
                        )
                      }
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      {copiedKey === 'negotiation' ? 'Copiado ✓' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3">
                    {currentStrategy.outreachMessages.salaryNegotiation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Step-by-Step Tactical Plan & Interview Prep (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tactical Steps Checklist */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Plan Táctico Paso a Paso
                  </h3>
                  <p className="text-[10px] text-slate-400">Marca las tareas completadas</p>
                </div>
                <Badge variant="primary">
                  {currentStrategy.tacticalPlan.filter((s) => s.completed).length} /{' '}
                  {currentStrategy.tacticalPlan.length}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {currentStrategy.tacticalPlan.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleTacticalStep(activeJob.id, step.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      step.completed
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="mt-0.5">
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-semibold ${
                            step.completed ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {step.title}
                        </p>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {step.phaseTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Prep Questions */}
            {currentStrategy.interviewPrep && currentStrategy.interviewPrep.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  Preguntas de Entrevista para {activeJob.position}
                </h3>

                <div className="space-y-3">
                  {currentStrategy.interviewPrep.map((q) => {
                    const isExp = expandedQuestion === q.id;
                    return (
                      <div
                        key={q.id}
                        className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedQuestion(isExp ? null : q.id)}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-200 hover:text-blue-400 transition-colors"
                        >
                          <span>{q.question}</span>
                          {isExp ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExp && (
                          <div className="p-3.5 pt-0 border-t border-slate-800/80 text-xs space-y-2 text-slate-300">
                            <div>
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                                Guía de Respuesta
                              </span>
                              <p className="mt-0.5 text-slate-300 leading-relaxed">
                                {q.suggestedAnswerGuide}
                              </p>
                            </div>
                            {q.starStrategy && (
                              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200">
                                <span className="font-bold">Estructura STAR:</span> {q.starStrategy}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-24 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100">
              Genera tu estrategia de postulación con IA
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Selecciona una vacante y haz clic en "Generar Estrategia" para obtener los mensajes listos para copiar y pegar y el plan de acción táctico.
            </p>
          </div>
          <button
            onClick={handleGenerateStrategy}
            disabled={isGenerating || !activeJob}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Generar Estrategia Ahora
          </button>
        </div>
      )}
    </div>
  );
};
