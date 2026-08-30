import React from 'react';
import type { Job, JobStatus } from '../../types/job';
import { StatusService } from '../../services/hr/statusService';
import { JobCard } from './JobCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: JobStatus;
  jobs: Job[];
  onOpenDetails: (job: Job) => void;
  onAddJobInColumn?: (status: JobStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  jobs,
  onOpenDetails,
  onAddJobInColumn,
}) => {
  const config = StatusService.getStatusConfig(status);

  return (
    <div className="flex flex-col w-80 min-w-[320px] bg-slate-100/80 dark:bg-slate-950/40 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 max-h-[calc(100vh-140px)] flex-shrink-0 shadow-sm transition-colors">
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between bg-white/60 dark:bg-slate-900/30 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${config.bgColor.replace('/10', '')}`} />
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{config.label}</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-xs">
            {jobs.length}
          </span>
        </div>

        {onAddJobInColumn && (
          <button
            onClick={() => onAddJobInColumn(status)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Agregar a esta columna"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Droppable Jobs Container */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-500/5' : ''
            }`}
          >
            {jobs.map((job, index) => (
              <Draggable key={job.id} draggableId={job.id} index={index}>
                {(providedDraggable, snapshotDraggable) => (
                  <div
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    className={`transition-shadow ${
                      snapshotDraggable.isDragging ? 'shadow-2xl ring-2 ring-blue-500 rounded-2xl' : ''
                    }`}
                  >
                    <JobCard job={job} onOpenDetails={onOpenDetails} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {jobs.length === 0 && (
              <div className="py-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-800/60 rounded-xl">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sin vacantes</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Arrastra o captura una vacante</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
