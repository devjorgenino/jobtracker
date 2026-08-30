import React from 'react';
import type { ATSAnalysisResult } from '../../types/ats';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from './Badge';

interface ATSScoreProps {
  score: ATSAnalysisResult;
  compact?: boolean;
  onOptimizeClick?: () => void;
}

export const ATSScore: React.FC<ATSScoreProps> = ({
  score,
  compact = false,
  onOptimizeClick,
}) => {
  const { overallScore, grade, keywordMatchScore, formatScore, experienceImpactScore, skillsScore } = score;

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-400 stroke-emerald-500';
    if (val >= 75) return 'text-blue-400 stroke-blue-500';
    if (val >= 60) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const getBadgeVariant = (val: number): 'success' | 'primary' | 'warning' | 'danger' => {
    if (val >= 90) return 'success';
    if (val >= 75) return 'primary';
    if (val >= 60) return 'warning';
    return 'danger';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-slate-900 border border-slate-800">
          <span className={`text-base font-bold ${getScoreColor(overallScore).split(' ')[0]}`}>
            {overallScore}%
          </span>
          <span className="text-[9px] text-slate-400 font-semibold uppercase">{grade}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">Compatibilidad ATS</span>
            <Badge variant={getBadgeVariant(overallScore)} size="sm">
              Grado {grade}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {score.matchedKeywords.length} palabras clave coincidentes
          </p>
        </div>
      </div>
    );
  }

  // Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
      {/* Header with Gauge */}
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-5">
          {/* Circular SVG Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={getScoreColor(overallScore).split(' ')[1]}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${getScoreColor(overallScore).split(' ')[0]}`}>
                {overallScore}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ATS Score
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-slate-100">Evaluación de Filtro ATS</h4>
              <Badge variant={getBadgeVariant(overallScore)}>Grado {grade}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {score.recruiterSummary || 'Puntuación estimada de compatibilidad con filtros automatizados de reclutamiento (Taleo, Greenhouse, Lever, Workday).'}
            </p>
          </div>
        </div>

        {onOptimizeClick && (
          <button
            onClick={onOptimizeClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Optimizar con IA
          </button>
        )}
      </div>

      {/* Sub-scores Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Palabras Clave</div>
          <div className="text-lg font-bold text-slate-100 mt-1">{keywordMatchScore}%</div>
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${keywordMatchScore}%` }} />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Impacto y Métricas</div>
          <div className="text-lg font-bold text-slate-100 mt-1">{experienceImpactScore}%</div>
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${experienceImpactScore}%` }} />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Formato Estándar</div>
          <div className="text-lg font-bold text-slate-100 mt-1">{formatScore}%</div>
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${formatScore}%` }} />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Habilidades Agrupadas</div>
          <div className="text-lg font-bold text-slate-100 mt-1">{skillsScore}%</div>
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${skillsScore}%` }} />
          </div>
        </div>
      </div>

      {/* Keywords Breakdown */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          Análisis de Palabras Clave de la Vacante
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Matched Keywords */}
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Keywords Detectadas en tu CV ({score.matchedKeywords.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {score.matchedKeywords.map((kw, idx) => (
                <Badge key={idx} variant="success" size="sm">
                  {kw}
                </Badge>
              ))}
              {score.matchedKeywords.length === 0 && (
                <span className="text-xs text-slate-500">Ninguna keyword crítica detectada aún.</span>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <div className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Keywords Faltantes en la Oferta ({score.missingKeywords.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {score.missingKeywords.map((kw, idx) => (
                <Badge key={idx} variant="danger" size="sm">
                  + {kw}
                </Badge>
              ))}
              {score.missingKeywords.length === 0 && (
                <span className="text-xs text-slate-500">¡Todas las keywords clave están cubiertas!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Check Breakdown */}
      {score.ruleChecks && score.ruleChecks.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Reglas de Compatibilidad ATS
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {score.ruleChecks.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/30 border border-slate-800"
              >
                {rule.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-medium text-slate-200">{rule.rule}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{rule.tip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
