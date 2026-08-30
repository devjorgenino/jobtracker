import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Job, JobStatus } from '../../types/job';
import { useStore } from '../../context/store';
import { KanbanColumn } from './KanbanColumn';
import { JobDetailModal } from '../job/JobDetailModal';
import { Filter, X } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { jobs, filters, setFilters, transitionJobStatus } = useStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filter jobs by search, priority, workMode, portal
  const filteredJobs = jobs.filter((job) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchPos = job.position.toLowerCase().includes(q);
      const matchComp = job.company.toLowerCase().includes(q);
      const techList = Array.isArray(job.techStack) ? job.techStack : [];
      const matchStack = techList.some((t: string) => t.toLowerCase().includes(q));
      if (!matchPos && !matchComp && !matchStack) return false;
    }

    if (filters.priority !== 'all' && job.priority !== filters.priority) return false;
    if (filters.workMode !== 'all' && job.workMode !== filters.workMode) return false;
    if (filters.portal !== 'all' && job.portal !== filters.portal) return false;

    return true;
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const targetStatus = destination.droppableId as JobStatus;
    transitionJobStatus(draggableId, targetStatus);
  };

  const activeColumns: JobStatus[] = [
    'wishlist',
    'applied',
    'screening',
    'technical',
    'final_interview',
    'offer',
    'rejected',
  ];

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5 px-2">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Filtros:
          </span>

          {/* Modalidad Filter */}
          <select
            value={filters.workMode}
            onChange={(e) => setFilters({ workMode: e.target.value })}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas las Modalidades</option>
            <option value="Remoto">Solo Remoto 🌐</option>
            <option value="Híbrido">Híbrido 🏢</option>
            <option value="Presencial">Presencial 📍</option>
          </select>

          {/* Prioridad Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value as any })}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="urgent">Urgente 🔥</option>
            <option value="high">Alta ⭐</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          {(filters.search || filters.workMode !== 'all' || filters.priority !== 'all') && (
            <button
              onClick={() => setFilters({ search: '', workMode: 'all', priority: 'all' })}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Mostrando <span className="text-slate-100 font-bold">{filteredJobs.length}</span> de{' '}
          <span className="text-slate-100 font-bold">{jobs.length}</span> vacantes
        </div>
      </div>

      {/* Drag & Drop Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none">
          {activeColumns.map((status) => {
            const columnJobs = filteredJobs.filter((j) => j.status === status);
            return (
              <KanbanColumn
                key={status}
                status={status}
                jobs={columnJobs}
                onOpenDetails={(job) => setSelectedJob(job)}
              />
            );
          })}
        </div>
      </DragDropContext>

      {/* Job Details Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};
