import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Briefcase, MapPin, Mail, Calendar, Flag, Code, DollarSign, Eye, FileText } from 'lucide-react';
import { KANBAN_COLUMNS, type Job, type JobStatus } from '@/types';
import { useAppStore } from '@/context/store';
import { KanbanColumn } from './KanbanColumn';
import { Button, Input, CardContent, CardFooter } from '@/components/common';
import { cn } from '@/utils/cn';
import * as Dialog from '@radix-ui/react-dialog';

const LOCATION_OPTIONS = [
  'Remoto',
  'Bogotá, Colombia',
  'Medellín, Colombia',
  'Cali, Colombia',
  'Barranquilla, Colombia',
  'Buenos Aires, Argentina',
  'Ciudad de México, México',
  'Madrid, España',
  'Barcelona, España',
  'Santiago, Chile',
  'Lima, Perú',
  'Montevideo, Uruguay',
  'Asunción, Paraguay',
  'Caracas, Venezuela',
  'Quito, Ecuador',
  'Panamá, Panamá',
  'San José, Costa Rica',
  'Santo Domingo, Rep. Dominicana',
  'Otro',
];

export function KanbanBoard() {
  const { jobs, addJob, updateJobStatus, deleteJob, updateJob, cvs } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState({
    company: '',
    position: '',
    url: '',
    location: 'Remoto',
    salary: '',
    contactName: '',
    contactEmail: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    benefits: '',
    techStack: '',
    cvId: '' as string | undefined,
  });
  const [editJob, setEditJob] = useState({
    company: '',
    position: '',
    url: '',
    location: '',
    salary: '',
    notes: '',
    contactName: '',
    contactEmail: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    benefits: '',
    techStack: '',
    cvId: '' as string | undefined,
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === result.source.droppableId && destination.index === result.source.index) return;
    updateJobStatus(draggableId, destination.droppableId as JobStatus);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const job: Job = {
      id: crypto.randomUUID(),
      company: newJob.company,
      position: newJob.position,
      url: newJob.url || undefined,
      location: newJob.location || undefined,
      salary: newJob.salary || undefined,
      status: 'wishlist',
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      contactName: newJob.contactName || undefined,
      contactEmail: newJob.contactEmail || undefined,
      deadline: newJob.deadline || undefined,
      priority: newJob.priority,
      benefits: newJob.benefits || undefined,
      techStack: newJob.techStack || undefined,
      cvId: newJob.cvId || undefined,
    };

    addJob(job);
    setNewJob({ 
      company: '', position: '', url: '', location: 'Remoto', salary: '',
      contactName: '', contactEmail: '', deadline: '', priority: 'medium',
      benefits: '', techStack: '', cvId: undefined
    });
    setIsDialogOpen(false);
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setEditJob({
      company: job.company,
      position: job.position,
      url: job.url || '',
      location: job.location || '',
      salary: job.salary || '',
      notes: job.notes || '',
      contactName: job.contactName || '',
      contactEmail: job.contactEmail || '',
      deadline: job.deadline || '',
      priority: job.priority || 'medium',
      benefits: job.benefits || '',
      techStack: job.techStack || '',
      cvId: job.cvId || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (job: Job) => {
    setViewingJob(job);
    setIsViewDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    
    updateJob(editingJob.id, {
      company: editJob.company,
      position: editJob.position,
      url: editJob.url || undefined,
      location: editJob.location || undefined,
      salary: editJob.salary || undefined,
      notes: editJob.notes || undefined,
      contactName: editJob.contactName || undefined,
      contactEmail: editJob.contactEmail || undefined,
      deadline: editJob.deadline || undefined,
      priority: editJob.priority,
      benefits: editJob.benefits || undefined,
      techStack: editJob.techStack || undefined,
      cvId: editJob.cvId || undefined,
    });
    
    setIsEditDialogOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJob = (id: string) => {
    deleteJob(id);
  };

  const stats = {
    total: jobs.length,
    wishlist: jobs.filter(j => j.status === 'wishlist').length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
  };

  return (
    <div className="h-full p-4 md:p-6 overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary">Tablero de Candidaturas</h1>
          <p className="text-sm text-text-muted mt-1">Gestiona tus aplicaciones de empleo</p>
        </div>

        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Nueva Solicitud
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
              <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                Nueva Solicitud
              </Dialog.Title>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Empresa"
                      name="company"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      placeholder="Nombre de la empresa"
                      required
                    />
                    <Input
                      label="Puesto"
                      name="position"
                      value={newJob.position}
                      onChange={(e) => setNewJob({ ...newJob, position: e.target.value })}
                      placeholder="Título del puesto"
                      required
                    />
                  </div>
                  
                  <Input
                    label="URL de la oferta"
                    name="url"
                    type="url"
                    value={newJob.url}
                    onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                    placeholder="https://..."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Ubicación
                      </label>
                      <select
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring"
                      >
                        {LOCATION_OPTIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Salario pretendido"
                      name="salary"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      placeholder="Ej: $50,000 - $70,000"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Persona de contacto"
                      name="contactName"
                      value={newJob.contactName}
                      onChange={(e) => setNewJob({ ...newJob, contactName: e.target.value })}
                      placeholder="Nombre del reclutador"
                    />
                    <Input
                      label="Email de contacto"
                      name="contactEmail"
                      type="email"
                      value={newJob.contactEmail}
                      onChange={(e) => setNewJob({ ...newJob, contactEmail: e.target.value })}
                      placeholder="reclutador@empresa.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Fecha límite para aplicar"
                      name="deadline"
                      type="date"
                      value={newJob.deadline}
                      onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        Prioridad
                      </label>
                      <select
                        value={newJob.priority}
                        onChange={(e) => setNewJob({ ...newJob, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Tecnologías / Stack"
                    name="techStack"
                    value={newJob.techStack}
                    onChange={(e) => setNewJob({ ...newJob, techStack: e.target.value })}
                    placeholder="React, TypeScript, Node.js, etc."
                  />

                  {cvs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        CV Asociado
                      </label>
                      <select
                        value={newJob.cvId || ''}
                        onChange={(e) => setNewJob({ ...newJob, cvId: e.target.value || undefined })}
                        className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring"
                      >
                        <option value="">Sin CV asociado</option>
                        {cvs.map((cv) => (
                          <option key={cv.id} value={cv.id}>{cv.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Beneficios
                    </label>
                    <textarea
                      value={newJob.benefits}
                      onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                      placeholder="Seguro médico, días de vacaciones, remote, etc."
                      className="flex w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring min-h-[60px] resize-none"
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="mt-4 justify-end gap-2">
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </Dialog.Close>
                  <Button type="submit">Agregar</Button>
                </CardFooter>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className="bg-surface rounded-lg p-2 text-center">
            <p className="text-lg font-bold" style={{ color: col.color }}>{stats[col.id as keyof typeof stats]}</p>
            <p className="text-xs text-text-muted truncate">{col.title}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 h-full">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                jobs={jobs.filter((job) => job.status === column.id)}
                onDeleteJob={handleDeleteJob}
                onEditJob={handleEditClick}
                onViewJob={handleViewClick}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Edit Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
            <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent" />
              Editar Solicitud
            </Dialog.Title>
            
            <form onSubmit={handleEditSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Empresa"
                    name="company"
                    value={editJob.company}
                    onChange={(e) => setEditJob({ ...editJob, company: e.target.value })}
                    required
                  />
                  <Input
                    label="Puesto"
                    name="position"
                    value={editJob.position}
                    onChange={(e) => setEditJob({ ...editJob, position: e.target.value })}
                    required
                  />
                </div>
                
                <Input
                  label="URL de la oferta"
                  name="url"
                  type="url"
                  value={editJob.url}
                  onChange={(e) => setEditJob({ ...editJob, url: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Ubicación
                    </label>
                    <select
                      value={editJob.location}
                      onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring"
                    >
                      {LOCATION_OPTIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Salario"
                    name="salary"
                    value={editJob.salary}
                    onChange={(e) => setEditJob({ ...editJob, salary: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Persona de contacto"
                    name="contactName"
                    value={editJob.contactName}
                    onChange={(e) => setEditJob({ ...editJob, contactName: e.target.value })}
                  />
                  <Input
                    label="Email de contacto"
                    name="contactEmail"
                    type="email"
                    value={editJob.contactEmail}
                    onChange={(e) => setEditJob({ ...editJob, contactEmail: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Fecha límite para aplicar"
                    name="deadline"
                    type="date"
                    value={editJob.deadline}
                    onChange={(e) => setEditJob({ ...editJob, deadline: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                      <Flag className="w-4 h-4" />
                      Prioridad
                    </label>
                    <select
                      value={editJob.priority}
                      onChange={(e) => setEditJob({ ...editJob, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Tecnologías / Stack"
                  name="techStack"
                  value={editJob.techStack}
                  onChange={(e) => setEditJob({ ...editJob, techStack: e.target.value })}
                />

                {cvs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      CV Asociado
                    </label>
                    <select
                      value={editJob.cvId || ''}
                      onChange={(e) => setEditJob({ ...editJob, cvId: e.target.value || undefined })}
                      className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring"
                    >
                      <option value="">Sin CV asociado</option>
                      {cvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>{cv.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Beneficios
                  </label>
                  <textarea
                    value={editJob.benefits}
                    onChange={(e) => setEditJob({ ...editJob, benefits: e.target.value })}
                    placeholder="Seguro médico, días de vacaciones, remote, etc."
                    className="flex w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring min-h-[60px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">Notas</label>
                  <textarea
                    value={editJob.notes}
                    onChange={(e) => setEditJob({ ...editJob, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                    className="flex w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-ring min-h-[80px] resize-none"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="mt-4 justify-end gap-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </Dialog.Close>
                <Button type="submit">Guardar</Button>
              </CardFooter>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* View Dialog */}
      <Dialog.Root open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
            <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" />
              Detalles de la Solicitud
            </Dialog.Title>
            
            {viewingJob && (() => {
              const statusConfig = KANBAN_COLUMNS.find(c => c.id === viewingJob.status);
              
              return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide">Empresa</p>
                      <p className="font-medium">{viewingJob.company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide">Puesto</p>
                      <p className="font-medium">{viewingJob.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusConfig?.color }} />
                    <span className="text-sm font-medium" style={{ color: statusConfig?.color }}>
                      {statusConfig?.title || viewingJob.status}
                    </span>
                  </div>
                </div>

                {viewingJob.url && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide">URL de la oferta</p>
                    <a 
                      href={viewingJob.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline break-all"
                    >
                      {viewingJob.url}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingJob.location && (
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Ubicación
                      </p>
                      <p className="font-medium">{viewingJob.location}</p>
                    </div>
                  )}
                  {viewingJob.salary && (
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Salario
                      </p>
                      <p className="font-medium">{viewingJob.salary}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingJob.contactName && (
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Contacto
                      </p>
                      <p className="font-medium">{viewingJob.contactName}</p>
                    </div>
                  )}
                  {viewingJob.contactEmail && (
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide">Email</p>
                      <a href={`mailto:${viewingJob.contactEmail}`} className="text-accent hover:underline">
                        {viewingJob.contactEmail}
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingJob.deadline && (
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Fecha límite
                      </p>
                      <p className="font-medium">{new Date(viewingJob.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingJob.priority && (
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Prioridad
                      </p>
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded text-xs font-medium',
                        viewingJob.priority === 'high' && 'bg-error/10 text-error',
                        viewingJob.priority === 'medium' && 'bg-warning/10 text-warning',
                        viewingJob.priority === 'low' && 'bg-success/10 text-success'
                      )}>
                        {viewingJob.priority === 'high' ? 'Alta' : viewingJob.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  )}
                </div>

                {viewingJob.techStack && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                      <Code className="w-3 h-3" /> Tecnologías
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewingJob.techStack.split(',').map((tech, i) => (
                        <span key={i} className="text-xs bg-surface px-2 py-1 rounded">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingJob.cvId && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                      <FileText className="w-3 h-3" /> CV Asociado
                    </p>
                    <p className="font-medium text-accent mt-1">
                      {cvs.find(cv => cv.id === viewingJob.cvId)?.name || 'CV no encontrado'}
                    </p>
                  </div>
                )}

                {viewingJob.benefits && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Beneficios
                    </p>
                    <p className="text-sm mt-1">{viewingJob.benefits}</p>
                  </div>
                )}

                {viewingJob.notes && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide">Notas</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{viewingJob.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide">Fecha de creación</p>
                    <p className="text-sm">{viewingJob.createdAt ? new Date(viewingJob.createdAt).toLocaleString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide">Última actualización</p>
                    <p className="text-sm">{viewingJob.lastUpdate ? new Date(viewingJob.lastUpdate).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
              );
            })()}
            
            <CardFooter className="mt-6 justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">Cerrar</Button>
              </Dialog.Close>
            </CardFooter>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
