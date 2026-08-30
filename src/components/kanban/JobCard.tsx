import React from 'react';
import type { Job } from '../../types/job';
import { useStore } from '../../context/store';
import {
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: Job;
  onOpenDetails: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onOpenDetails }) => {
  const { tailoredCvs } = useStore();
  const navigate = useNavigate();

  const tailoredCv = tailoredCvs[job.id];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getWorkModeBadge = (mode: string) => {
    switch (mode) {
      case 'Remoto':
        return <Badge variant="success" size="sm">🌐 Remoto</Badge>;
      case 'Híbrido':
        return <Badge variant="warning" size="sm">🏢 Híbrido</Badge>;
      default:
        return <Badge variant="default" size="sm">📍 Presencial</Badge>;
    }
  };

  const techStackList: string[] = Array.isArray(job.techStack)
    ? job.techStack
    : typeof job.techStack === 'string'
    ? (job.techStack as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500/50 p-4 shadow-sm hover:shadow-md dark:shadow-md dark:hover:shadow-blue-500/5 transition-all space-y-3 cursor-pointer">
      {/* Card Header: Position & Priority */}
      <div className="flex items-start justify-between gap-2" onClick={() => onOpenDetails(job)}>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate" title={job.position}>
            {job.position}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-300" title={job.company}>{job.company}</span>
          </div>
        </div>

        {/* Priority Badge */}
        <Badge variant={getPriorityColor(job.priority)} size="sm">
          {job.priority === 'urgent' ? 'Urgente' : job.priority === 'high' ? 'Alta' : 'Normal'}
        </Badge>
      </div>

      {/* Meta Row: WorkMode, Location & Salary */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400" onClick={() => onOpenDetails(job)}>
        {getWorkModeBadge(job.workMode)}
        {job.location && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
            <MapPin className="w-3 h-3 text-slate-400" />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <DollarSign className="w-3 h-3" />
            {job.salary}
          </span>
        )}
      </div>

      {/* Tech Stack Preview Tags */}
      {techStackList.length > 0 && (
        <div className="flex flex-wrap gap-1" onClick={() => onOpenDetails(job)}>
          {techStackList.slice(0, 4).map((tech: string, idx: number) => (
            <span
              key={idx}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-mono"
            >
              {tech}
            </span>
          ))}
          {techStackList.length > 4 && (
            <span className="text-[9px] px-1 py-0.5 text-slate-400 dark:text-slate-500 font-mono">
              +{techStackList.length - 4}
            </span>
          )}
        </div>
      )}

      {/* AI Artifacts Status Indicators */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
        <div className="flex items-center gap-2">
          {tailoredCv ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              CV ATS {tailoredCv.atsMatchScore ?? tailoredCv.atsScore ?? 90}%
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sin CV adaptado
            </span>
          )}
        </div>

        {/* Portal Source */}
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
          {job.portal || 'Web'}
        </span>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/optimize?jobId=${job.id}`);
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-700 dark:text-blue-400 text-[10px] font-semibold border border-blue-200 dark:border-blue-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          Optimizar CV
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/strategy?jobId=${job.id}`);
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-600/10 dark:hover:bg-purple-600/20 text-purple-700 dark:text-purple-400 text-[10px] font-semibold border border-purple-200 dark:border-purple-500/20 transition-all cursor-pointer"
        >
          <Send className="w-3 h-3" />
          Estrategia
        </button>
      </div>
    </div>
  );
};
