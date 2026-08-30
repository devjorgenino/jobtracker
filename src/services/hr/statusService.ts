/**
 * Automated Job Status Pipeline & Activity Tracking Service
 */

import type { Job, JobStatus, JobActivity } from '../../types/job';

export class StatusService {
  /**
   * Status Pipeline Definitions with colors, labels, and automatic next suggestions
   */
  static readonly PIPELINE: {
    status: JobStatus;
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    suggestedNextAction?: string;
  }[] = [
    {
      status: 'wishlist',
      label: 'Deseada / Por Aplicar',
      description: 'Vacantes guardadas para revisar y optimizar CV.',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
      suggestedNextAction: 'Generar CV Adaptado y Estrategia',
    },
    {
      status: 'applied',
      label: 'Postulado',
      description: 'CV y formulario enviados en el portal de empleo.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      suggestedNextAction: 'Enviar nota de conexión por LinkedIn al reclutador',
    },
    {
      status: 'screening',
      label: 'Contacto Inicial / RRHH',
      description: 'Primer contacto con reclutador o llamada de filtro.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      suggestedNextAction: 'Preparar pitch personal y disponibilidad horaria',
    },
    {
      status: 'technical',
      label: 'Entrevista / Prueba Técnica',
      description: 'Evaluación de código, prueba práctica o entrevista técnica.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      suggestedNextAction: 'Revisar preguntas de preparación técnica y STAR',
    },
    {
      status: 'final_interview',
      label: 'Entrevista Final',
      description: 'Conversación con Hiring Manager, CTO o equipo directivo.',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      suggestedNextAction: 'Alinear expectativas de impacto y cultura de equipo',
    },
    {
      status: 'offer',
      label: '¡Oferta Recibida!',
      description: 'Propuesta laboral formal recibida.',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      suggestedNextAction: 'Revisar paquete de compensación y usar guion de negociación',
    },
    {
      status: 'rejected',
      label: 'Rechazada / No Continuó',
      description: 'Proceso cerrado por la empresa o desestimado.',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      suggestedNextAction: 'Agradecer el feedback y mantener contacto para futuras vacantes',
    },
    {
      status: 'archived',
      label: 'Archivada',
      description: 'Vacante guardada como referencia histórica.',
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-500/10',
      borderColor: 'border-zinc-500/30',
    },
  ];

  /**
   * Updates the status of a job and automatically logs the activity and sets follow-up dates
   */
  static transitionStatus(
    job: Job,
    newStatus: JobStatus,
    note?: string
  ): { updatedJob: Job; activity: JobActivity } {
    const now = new Date().toISOString();
    const oldStatusLabel = this.getStatusLabel(job.status);
    const newStatusLabel = this.getStatusLabel(newStatus);

    const activity: JobActivity = {
      id: 'act_' + Date.now(),
      timestamp: now,
      type: 'status_change',
      description: `Estado actualizado: de "${oldStatusLabel}" a "${newStatusLabel}".`,
      metadata: { oldStatus: job.status, newStatus, note },
    };

    let appliedAt = job.appliedAt;
    let followUpDate = job.followUpDate;

    // Automated timing triggers
    if (newStatus === 'applied' && !appliedAt) {
      appliedAt = now;
      // Set automatic follow-up reminder 5 days later
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + 5);
      followUpDate = followUp.toISOString();
    }

    const updatedJob: Job = {
      ...job,
      status: newStatus,
      lastUpdate: now,
      appliedAt,
      followUpDate,
      activities: [activity, ...(job.activities || [])],
    };

    return { updatedJob, activity };
  }

  static getStatusLabel(status: JobStatus): string {
    const found = this.PIPELINE.find(p => p.status === status);
    return found ? found.label : status;
  }

  static getStatusConfig(status: JobStatus) {
    return this.PIPELINE.find(p => p.status === status) || this.PIPELINE[0];
  }
}
