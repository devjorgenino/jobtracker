import { Droppable } from '@hello-pangea/dnd';
import type { Job, JobStatus } from '@/types';
import { JobCard } from './JobCard';
import { cn } from '@/utils/cn';

interface KanbanColumnProps {
  id: JobStatus;
  title: string;
  color: string;
  jobs: Job[];
  onDeleteJob: (id: string) => void;
  onEditJob: (job: Job) => void;
  onViewJob: (job: Job) => void;
}

export function KanbanColumn({ id, title, color, jobs, onDeleteJob, onEditJob, onViewJob }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-64 md:w-72" role="region" aria-label={`Columna ${title}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
        <h2 className="font-semibold text-sm text-primary truncate">{title}</h2>
        <span className="ml-auto text-xs text-text-muted bg-white px-2 py-0.5 rounded-full" aria-label={`${jobs.length} solicitudes`}>
          {jobs.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'bg-surface rounded-lg p-2 md:p-3 min-h-[150px] md:min-h-[200px] transition-colors',
              snapshot.isDraggingOver && 'bg-accent/10 ring-2 ring-accent/20'
            )}
            role="list"
            aria-label={`${title}, ${jobs.length} solicitudes`}
          >
            {jobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                onDelete={onDeleteJob}
                onEdit={onEditJob}
                onView={onViewJob}
              />
            ))}
            {provided.placeholder}
            
            {jobs.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-center text-sm text-text-muted py-6 md:py-8" aria-live="polite">
                Sin solicitudes
              </p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
