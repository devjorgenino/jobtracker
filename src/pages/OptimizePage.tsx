import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { CVTailorService } from '../services/hr/cvTailorService';
import { ATSService } from '../services/hr/atsService';
import { ATSPDFService } from '../services/pdf/atsPdfGenerator';
import { ATSScore } from '../components/common/ATSScore';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Send,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Job } from '../types/job';

export const OptimizePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryJobId = searchParams.get('jobId');

  const {
    jobs,
    masterCV,
    tailoredCvs,
    setTailoredCV,
    updateJob,
    aiConfig,
  } = useStore();

  const [selectedJobId, setSelectedJobId] = useState<string>(queryJobId || jobs[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customJobText, setCustomJobText] = useState('');
  const [useCustomJob, setUseCustomJob] = useState(false);

  useEffect(() => {
    if (queryJobId) {
      setSelectedJobId(queryJobId);
    } else if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [queryJobId, jobs]);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || null;
  const currentTailoredCv = selectedJobId ? tailoredCvs[selectedJobId] : null;

  // Compute live ATS score for display
  const currentAtsScore = currentTailoredCv && activeJob
    ? ATSService.analyze(currentTailoredCv, activeJob)
    : activeJob
    ? ATSService.analyze(masterCV, activeJob)
    : null;

  const handleGenerateCV = async () => {
    let targetJob: Job;

    if (useCustomJob && customJobText.trim()) {
      targetJob = {
        id: 'job_custom_' + Date.now(),
        position: 'Vacante Personalizada',
        company: 'Empresa Objetivo',
        url: '',
        location: 'Remoto',
        workMode: 'Remoto',
        salary: '',
        description: customJobText,
        requirements: '',
        techStack: [],
        portal: 'Directo',
        status: 'wishlist',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      };
    } else if (activeJob) {
      targetJob = activeJob;
    } else {
      toast.error('Por favor selecciona una vacante o ingresa una descripción.');
      return;
    }

    setIsGenerating(true);
    toast.info('Analizando vacante e inyectando palabras clave...', { duration: 3000 });

    try {
      const tailored = await CVTailorService.generateTailoredCV(targetJob, masterCV, aiConfig);
      
      // Calculate ATS score
      const atsAnalysis = ATSService.analyze(tailored, targetJob);
      tailored.atsScore = atsAnalysis.overallScore;
      tailored.atsMatchScore = atsAnalysis.overallScore;
      tailored.targetKeywordsMatched = atsAnalysis.matchedKeywords;
      tailored.targetKeywordsMissing = atsAnalysis.missingKeywords;

      setTailoredCV(targetJob.id, tailored);

      if (activeJob) {
        updateJob(activeJob.id, {
          atsScore: atsAnalysis,
          tailoredCvId: tailored.id,
        });
      }

      toast.success(`🎉 ¡CV adaptado con éxito! ATS Score: ${atsAnalysis.overallScore}%`);
    } catch (e: any) {
      console.error(e);
      toast.error('Ocurrió un error al generar el CV. Revisa tu conexión y configuración de OmniRoute en Ajustes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPDF = async () => {
    const cvToDownload = currentTailoredCv || masterCV;
    try {
      const filename = activeJob
        ? `CV_${activeJob.company.replace(/\s+/g, '_')}_${activeJob.position.replace(/\s+/g, '_')}_ATS.pdf`
        : `CV_${(masterCV.personalInfo?.name || 'Candidato').replace(/\s+/g, '_')}_ATS.pdf`;

      await ATSPDFService.downloadPDF(cvToDownload, filename);
      toast.success('Descargando archivo PDF en formato ATS...');
    } catch (e) {
      toast.error('Error al generar PDF');
    }
  };

  const activeJobTechs: string[] = activeJob
    ? Array.isArray(activeJob.techStack)
      ? activeJob.techStack
      : typeof activeJob.techStack === 'string'
      ? (activeJob.techStack as string).split(',').map((s) => s.trim()).filter(Boolean)
      : []
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-blue-500/20 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-400" />
            Estudio de Optimización de CV & Filtros ATS
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Genera currículums hiper-adaptados a partir de tu CV maestro, maximizando la densidad de palabras clave y garantizando compatibilidad 100% con sistemas ATS (Taleo, Greenhouse, Lever, Workday).
          </p>
        </div>

        {/* Job Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="w-64">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Vacante a Optimizar
            </label>
            <select
              value={useCustomJob ? 'custom' : selectedJobId}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setUseCustomJob(true);
                } else {
                  setUseCustomJob(false);
                  setSelectedJobId(e.target.value);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.position}
                </option>
              ))}
              <option value="custom">✍️ Ingresar otra descripción...</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerateCV}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Optimizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {currentTailoredCv ? 'Regenerar CV' : 'Generar CV Adaptado'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Master CV Reference Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">
            CV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                Fuente Única de Verdad: <strong className="text-indigo-400">{masterCV.personalInfo?.name || 'CV Maestro'}</strong>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {masterCV.personalInfo?.roleTitle || 'Perfil Profesional'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {masterCV.workExperience?.length || 0} Experiencias laborales • {masterCV.skillCategories?.reduce((acc, c) => acc + (c.skills?.length || 0), 0) || 0} Habilidades registradas • {masterCV.education?.length || 0} Títulos
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/cv')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          Subir / Editar CV Maestro
        </button>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Details & Keywords Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Job Card */}
          {activeJob && !useCustomJob && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{activeJob.position}</h3>
                  <p className="text-xs text-indigo-400 font-semibold">{activeJob.company}</p>
                </div>
                <Badge variant="primary">{activeJob.workMode}</Badge>
              </div>

              {/* Tech Stack */}
              {activeJobTechs.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Stack Clave de la Vacante
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJobTechs.map((tech: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Preview */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Descripción & Requisitos
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {activeJob.description || 'Sin descripción detallada.'}
                </div>
              </div>
            </div>
          )}

          {/* Custom Job Input if selected */}
          {useCustomJob && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                Pega la Descripción de la Vacante
              </h3>
              <textarea
                rows={8}
                placeholder="Pega aquí el texto completo del empleo..."
                value={customJobText}
                onChange={(e) => setCustomJobText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* ATS Live Gauge Breakdown */}
          {currentAtsScore && (
            <ATSScore
              score={currentAtsScore}
              onOptimizeClick={handleGenerateCV}
            />
          )}
        </div>

        {/* Right Column: Tailored CV / Document Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {currentTailoredCv ? 'Currículum Optimizado para ATS' : 'Vista Previa del CV Maestro'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentTailoredCv
                      ? `Adaptado específicamente para ${activeJob?.company || 'la vacante'}`
                      : 'CV base listo para ser optimizado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(
                      currentTailoredCv?.fullMarkdown || masterCV.personalInfo?.summary || '',
                      'cv_text'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedKey === 'cv_text' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copiar Texto
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF ATS
                </button>
              </div>
            </div>

            {/* Document Content View */}
            {currentTailoredCv ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                {currentTailoredCv.fullMarkdown}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">
                    Aún no has generado el CV adaptado para esta vacante
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Haz clic en "Generar CV Adaptado" para que el motor de IA extraiga las palabras clave de la oferta y restructure tu experiencia bajo la fórmula STAR/XYZ.
                  </p>
                </div>
                <button
                  onClick={handleGenerateCV}
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Generar CV Adaptado Ahora
                </button>
              </div>
            )}

            {/* Quick Link to Strategy */}
            {activeJob && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-xs text-slate-300">
                  ¿Ya tienes el CV listo? Pasa a la fase de postulación y mensajes.
                </span>
                <button
                  onClick={() => navigate(`/strategy?jobId=${activeJob.id}`)}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ver Estrategia de Contacto →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
