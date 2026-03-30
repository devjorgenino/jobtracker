export interface Job {
  id: string;
  company: string;
  position: string;
  url?: string;
  status: JobStatus;
  salary?: string;
  location?: string;
  notes?: string;
  appliedDate?: string;
  lastUpdate?: string;
  cvId?: string;
  createdAt?: string;
  contactName?: string;
  contactEmail?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  benefits?: string;
  techStack?: string;
  interviewDate?: string;
  responseDate?: string;
}

export type JobStatus = 
  | 'wishlist'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface CV {
  id: string;
  name: string;
  content: string;
  fileName?: string;
  originalFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  jobId: string;
  content: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  type: MessageType;
  title: string;
  content: string;
}

export type MessageType = 
  | 'linkedin_initial'
  | 'follow_up_application'
  | 'post_interview'
  | 'response_offer'
  | 'rejection_response'
  | 'email';

export interface KanbanColumn {
  id: JobStatus;
  title: string;
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'wishlist', title: 'Por Aplicar', color: '#64748B' },
  { id: 'applied', title: 'Aplicado', color: '#3B82F6' },
  { id: 'interview', title: 'Entrevista', color: '#F59E0B' },
  { id: 'offer', title: 'Oferta', color: '#10B981' },
  { id: 'rejected', title: 'Rechazado', color: '#EF4444' },
];
