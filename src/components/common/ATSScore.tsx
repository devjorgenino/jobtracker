import { AlertCircle, Lightbulb } from 'lucide-react';
import type { ATSAnalysis } from '@/utils/atsAnalyzer';

interface ATSScoreProps {
  analysis: ATSAnalysis | null;
}

export function ATSScore({ analysis }: ATSScoreProps) {
  if (!analysis) return null;

  const { score, scoreColor, grade, details, tips, missingKeywords } = analysis;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-border p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Análisis ATS</h3>
        <span 
          className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
          title="Esta puntuación es orientativa y puede variar entre diferentes sistemas ATS"
        >
          Orientativo
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={scoreColor}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>

        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: scoreColor }}
        >
          {grade}
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Palabras clave</span>
            <span className="font-medium">{details.keywordMatch}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Formato</span>
            <span className="font-medium">{details.formatScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contenido</span>
            <span className="font-medium">{details.contentScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Longitud</span>
            <span className="font-medium">{details.lengthScore}%</span>
          </div>
        </div>
      </div>

      {missingKeywords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-semibold text-gray-700">Palabras clave que faltan:</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {missingKeywords.slice(0, 8).map((keyword, index) => (
              <span 
                key={index} 
                className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {tips.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <h4 className="text-xs font-semibold text-gray-700">Sugerencias de mejora:</h4>
          </div>
          <ul className="space-y-1.5">
            {tips.map((tip, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">
          Nota: Esta puntuación es orientativa. Los sistemas ATS varían en sus algoritmos de evaluación.
        </p>
      </div>
    </div>
  );
}
