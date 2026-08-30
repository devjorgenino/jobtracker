import React from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { useStore } from '../context/store';
import { LayoutDashboard, TrendingUp, Award, Clock } from 'lucide-react';

export const KanbanPage: React.FC = () => {
  const { jobs } = useStore();

  const total = jobs.length;
  const applied = jobs.filter((j) => ['applied', 'screening', 'technical', 'final_interview'].includes(j.status)).length;
  const interviews = jobs.filter((j) => ['screening', 'technical', 'final_interview'].includes(j.status)).length;
  const offers = jobs.filter((j) => j.status === 'offer').length;

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="region" aria-label="Métricas del pipeline">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Total Vacantes</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0" aria-hidden="true">
              <LayoutDashboard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{total}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">Registradas en el pipeline</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">En Proceso Activo</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0" aria-hidden="true">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{applied}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">Postulaciones enviadas</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Entrevistas & Pruebas</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex-shrink-0" aria-hidden="true">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">{interviews}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">Fases técnicas / RRHH</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Ofertas Recibidas</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{offers}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">Propuestas finales</p>
        </div>
      </div>

      {/* Kanban Board Container */}
      <KanbanBoard />
    </div>
  );
};
