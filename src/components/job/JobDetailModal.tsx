import React, { useState } from 'react';
import type { Job, JobStatus } from '../../types/job';
import type { ATSAnalysisResult } from '../../types/ats';
import { useStore } from '../../context/store';
import { StatusService } from '../../services/hr/statusService';
import { ATSPDFService } from '../../services/pdf/atsPdfGenerator';
import { CVTranslationService } from '../../services/cv/cvTranslationService';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ATSScore } from '../common/ATSScore';
import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Sparkles,
  Send,
  FileText,
  Clock,
  Trash2,
  Copy,
  Check,
  Download,
  Linkedin,
  Mail,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cv' | 'strategy' | 'activity'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  const {
    transitionJobStatus,
    deleteJob,
    logJobActivity,
    tailoredCvs,
    strategies,
    toggleTacticalStep,
    aiConfig,
  } = useStore();

  const navigate = useNavigate();

  if (!job) return null;

  const tailoredCv = tailoredCvs[job.id];
  const strategy = strategies[job.id];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    transitionJobStatus(job.id, newStatus);
    toast.success(`Estado actualizado a ${StatusService.getStatusLabel(newStatus)}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    logJobActivity(job.id, newNote.trim(), 'note_added');
    setNewNote('');
    toast.success('Nota registrada en el historial');
  };

  const handleDownloadPDF = async (lang: 'es' | 'en' = 'es') => {
    if (!tailoredCv) {
      toast.error('Primero debes generar el CV adaptado para esta vacante.');
      return;
    }
    try {
      let cvToRender = tailoredCv;
      if (lang === 'en' && tailoredCv.lang !== 'en' && aiConfig) {
        toast.info('Traduciendo CV adaptado al inglés con IA...');
        cvToRender = await CVTranslationService.translateCV(tailoredCv, 'en', aiConfig);
      }
      const sanitizedCompany = job.company.replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedPos = job.position.replace(/[^a-zA-Z0-9_-]/g, '_');
      await ATSPDFService.downloadPDF(
        cvToRender,
        lang,
        `CV_${sanitizedCompany}_${sanitizedPos}_ATS_${lang.toUpperCase()}.pdf`
      );
      toast.success(`Descargando CV ATS en ${lang === 'es' ? 'Español' : 'Inglés'}...`);
    } catch (e) {
      toast.error('Error al generar PDF');
    }
  };

  const techStackList: string[] = Array.isArray(job.techStack)
    ? job.techStack
    : typeof job.techStack === 'string'
    ? (job.techStack as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">{job.position}</h2>
            <Badge variant="primary">{job.portal || 'Web'}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Building2 className="w-4 h-4 text-indigo-400" />
              {job.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {job.location} ({job.workMode})
            </span>
            {job.salary && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <DollarSign className="w-4 h-4" />
                {job.salary}
              </span>
            )}
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver en portal
              </a>
            )}
          </div>
        </div>

        {/* Status Selector & Delete */}
        <div className="flex items-center gap-3">
          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {StatusService.PIPELINE.map((p) => (
              <option key={p.status} value={p.status}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (confirm('¿Eliminar esta vacante de tu JobTracker?')) {
                deleteJob(job.id);
                onClose();
                toast.success('Vacante eliminada');
              }
            }}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            title="Eliminar vacante"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 mt-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Resumen & Requisitos
        </button>

        <button
          onClick={() => setActiveTab('cv')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'cv'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          CV Adaptado & ATS Score
          {tailoredCv && <Badge variant="success" size="sm">{tailoredCv.atsMatchScore ?? tailoredCv.atsScore ?? 90}%</Badge>}
        </button>

        <button
          onClick={() => setActiveTab('strategy')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'strategy'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          Estrategia & Outreach
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Historial & Notas ({job.activities?.length || 0})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Tech Stack & Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tech Stack */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Stack Tecnológico Detectado
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {techStackList.length > 0 ? (
                  techStackList.map((tech: string, idx: number) => (
                    <Badge key={idx} variant="primary" size="md">
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No se detectó stack explícito.</span>
                )}
              </div>
            </div>

            {/* Recruiter Contact */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Contacto / Reclutador
              </h4>
              <div className="text-xs space-y-1">
                <p className="text-slate-200 font-medium">
                  {job.contactName || 'No identificado en la publicación'}
                </p>
                {job.contactProfile && (
                  <a
                    href={job.contactProfile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    Ver perfil en LinkedIn
                  </a>
                )}
                {job.contactEmail && (
                  <p className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {job.contactEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Full Job Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Descripción de la Vacante
            </h4>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {job.description || 'Sin descripción provista.'}
            </div>
          </div>

          {/* Action to Optimize */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30">
            <div>
              <h5 className="text-sm font-bold text-slate-100">¿Listo para postularte?</h5>
              <p className="text-xs text-slate-400">
                Genera tu CV adaptado con palabras clave y obtén la estrategia de contacto.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate(`/optimize?jobId=${job.id}`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Optimizar CV con IA
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Tailored CV & ATS Score */}
      {activeTab === 'cv' && (
        <div className="space-y-6">
          {tailoredCv ? (
            <div className="space-y-6">
              {/* ATS Score Overview */}
              {typeof job.atsScore === 'object' && job.atsScore !== null ? (
                <ATSScore
                  score={job.atsScore as ATSAnalysisResult}
                  onOptimizeClick={() => {
                    onClose();
                    navigate(`/optimize?jobId=${job.id}`);
                  }}
                />
              ) : null}

              {/* Action Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">CV Adaptado para {job.company}</h4>
                  <p className="text-xs text-slate-400">
                    Generado el {new Date(tailoredCv.generatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopy(tailoredCv.fullMarkdown || '', 'cv_md')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                  >
                    {copiedKey === 'cv_md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Texto
                  </button>

                  <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 shadow-sm">
                    <button
                      onClick={() => handleDownloadPDF('es')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                      title="Descargar PDF en Español"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF (ES)
                    </button>
                    <button
                      onClick={() => handleDownloadPDF('en')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all ml-1"
                      title="Download PDF in English"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF (EN)
                    </button>
                  </div>
                </div>
              </div>

              {/* Markdown Preview */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {tailoredCv.fullMarkdown}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Aún no has generado el CV adaptado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  El motor de IA adaptará tu CV general con las palabras clave de {job.company} y el mejor formato ATS.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/optimize?jobId=${job.id}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Generar CV Adaptado Ahora
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Strategy & Outreach */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {strategy ? (
            <div className="space-y-6">
              {/* Company & Role Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Análisis Estratégico de la Empresa
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{strategy.companyOverview}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Dolor Principal que Resuelves
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{strategy.roleAnalysis}</p>
                </div>
              </div>

              {/* Outreach Messages */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mensajes Listos para Reclutadores (Copiar & Pegar)
                </h4>

                {/* 1. LinkedIn Connection Note */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Nota de Conexión en LinkedIn (&lt; 300 caracteres)
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(strategy.outreachMessages.linkedinConnection, 'msg_li_conn')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                    >
                      {copiedKey === 'msg_li_conn' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copiar
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {strategy.outreachMessages.linkedinConnection}
                  </p>
                </div>

                {/* 2. Formal Cover Letter / Email */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Email Formal de Postulación / Cover Letter
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(strategy.outreachMessages.emailCoverLetter, 'msg_email_cover')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                    >
                      {copiedKey === 'msg_email_cover' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copiar
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                    {strategy.outreachMessages.emailCoverLetter}
                  </p>
                </div>

                {/* 3. Follow Up Message */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Email de Seguimiento / Follow-Up (5-7 días)
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(strategy.outreachMessages.followUpEmail, 'msg_follow_up')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                    >
                      {copiedKey === 'msg_follow_up' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copiar
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                    {strategy.outreachMessages.followUpEmail}
                  </p>
                </div>
              </div>

              {/* Tactical Plan Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Plan Táctico Paso a Paso
                </h4>
                <div className="space-y-2">
                  {strategy.tacticalPlan.map((step) => (
                    <div
                      key={step.id}
                      onClick={() => toggleTacticalStep(job.id, step.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        step.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
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
                          <p className={`text-xs font-semibold ${step.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {step.title}
                          </p>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {step.phaseTitle}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Send className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Sin estrategia generada</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Genera la estrategia de postulación y los mensajes personalizados para conectar con los reclutadores de {job.company}.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/strategy?jobId=${job.id}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Generar Estrategia Ahora
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Activity & Notes */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="flex gap-3">
            <input
              type="text"
              placeholder="Escribe una nota rápida sobre este proceso (ej: Entrevista agendada para el jueves)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Guardar Nota
            </button>
          </form>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Historial de Actividad & Auditoría
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(job.activities || []).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200">{act.description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!job.activities || job.activities.length === 0) && (
                <p className="text-xs text-slate-500 py-4 text-center">Sin actividades registradas.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
