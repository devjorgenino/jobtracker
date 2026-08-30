/**
 * Job Entity Types & Status Pipelines
 */

import type { ATSAnalysisResult } from './ats';

export type JobStatus =
  | 'wishlist'        // Por Aplicar / Guardada
  | 'applied'         // Postulado / CV Enviado
  | 'screening'       // Contacto Inicial / RRHH
  | 'technical'       // Prueba Técnica / Entrevista Técnica
  | 'final_interview' // Entrevista Final
  | 'offer'           // Oferta Recibida
  | 'rejected'        // Rechazado / No seleccionado
  | 'archived';       // Archivada

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkMode = 'Remoto' | 'Híbrido' | 'Presencial';

export interface RecruiterContact {
  name?: string;
  email?: string;
  phone?: string;
  profileUrl?: string;
  roleTitle?: string;
  notes?: string;
}

export interface JobActivity {
  id: string;
  timestamp: string;
  type:
    | 'created'
    | 'status_change'
    | 'cv_tailored'
    | 'outreach_generated'
    | 'outreach_sent'
    | 'interview_scheduled'
    | 'note_added'
    | 'followup_logged';
  description: string;
  previousStatus?: JobStatus;
  newStatus?: JobStatus;
  metadata?: Record<string, any>;
}

export interface Job {
  id: string;
  position: string;
  company: string;
  url?: string;
  location: string;
  workMode: WorkMode;
  salary?: string;
  description: string;
  requirements?: string;
  techStack?: string[];
  portal?: string; // LinkedIn, Indeed, InfoJobs, etc.
  
  // Recruiter / Poster
  contactName?: string;
  contactEmail?: string;
  contactProfile?: string;
  recruiter?: RecruiterContact;

  // Pipeline Tracking
  status: JobStatus;
  priority: JobPriority;
  createdAt: string;
  lastUpdate: string;
  appliedAt?: string;
  followUpDate?: string;
  interviewDate?: string;
  notes?: string;
  
  // Timeline & History
  activities?: JobActivity[];

  // Linked AI Artifacts
  tailoredCvId?: string;
  strategyId?: string;
  atsScore?: ATSAnalysisResult | number;
  matchScore?: number;
}
