import { Draggable } from '@hello-pangea/dnd';
import { MapPin, DollarSign, ExternalLink, Trash2, MoreVertical, Edit2, Eye, Flag } from 'lucide-react';
import type { Job } from '@/types';
import { Card } from '@/components/common';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface JobCardProps {
  job: Job;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (job: Job) => void;
  onView: (job: Job) => void;
}

const priorityColors = {
  high: 'bg-error/10 text-error',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-success/10 text-success',
};

export function JobCard({ job, index, onDelete, onEdit, onView }: JobCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn('mb-2 md:mb-3', snapshot.isDragging && 'opacity-50 scale-105 shadow-lg')}
          role="listitem"
          aria-label={`${job.position} en ${job.company}${job.priority ? `, prioridad ${job.priority}` : ''}`}
        >
          <Card className="p-3 md:p-4 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base text-primary truncate">{job.position}</h3>
                <p className="text-xs md:text-sm text-text-muted truncate">{job.company}</p>
              </div>
              
              <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="p-1 hover:bg-white rounded transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
                    aria-label="Opciones para {job.position}"
                    aria-haspopup="menu"
                  >
                    <MoreVertical className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  </button>
                </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="bg-white rounded-md shadow-lg border border-border p-1 min-w-[160px] z-50"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-primary rounded hover:bg-surface cursor-pointer outline-none focus:bg-surface focus:outline-none"
                      onClick={() => onView(job)}
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      Ver detalles
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-primary rounded hover:bg-surface cursor-pointer outline-none focus:bg-surface focus:outline-none"
                      onClick={() => onEdit(job)}
                    >
                      <Edit2 className="w-4 h-4" aria-hidden="true" />
                      Editar
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-1" />
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-error rounded hover:bg-error/5 cursor-pointer outline-none focus:bg-error/5 focus:outline-none"
                      onClick={() => onDelete(job.id)}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      Eliminar
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            <div className="mt-2 md:mt-3 flex flex-wrap gap-1 md:gap-2 text-xs text-text-muted">
              {job.location && (
                <span className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded" aria-label="Ubicación">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  <span className="truncate max-w-[100px]">{job.location}</span>
                </span>
              )}
              {job.salary && (
                <span className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded" aria-label="Salario">
                  <DollarSign className="w-3 h-3" aria-hidden="true" />
                  <span className="truncate max-w-[80px]">{job.salary}</span>
                </span>
              )}
              {job.priority && (
                <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded', priorityColors[job.priority])} aria-label="Prioridad">
                  <Flag className="w-3 h-3" aria-hidden="true" />
                  <span className="capitalize">{job.priority}</span>
                </span>
              )}
            </div>

            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 md:mt-3 flex items-center gap-1 text-xs text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded"
                aria-label="Ver oferta de empleo (se abre en nueva pestaña)"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                Ver oferta
              </a>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  );
}
