/**
 * Application Strategy & Outreach Types
 */

export interface TacticalStep {
  id: string;
  phase: number;
  phaseTitle: string; // e.g. "Fase 1: Preparación e Investigación", "Fase 2: Postulación & Primer Contacto", etc.
  title: string;
  description: string;
  actionRequired: string;
  completed: boolean;
  completedAt?: string;
  dueDateOffsetDays: number; // e.g. 0, 1, 3, 5, 7 days
}

export interface OutreachMessages {
  linkedinConnection: string; // < 300 characters for LinkedIn connection note
  linkedinInMail: string;     // Full LinkedIn message / InMail
  emailCoverLetter: string;   // Formal cover letter / application email
  followUpEmail: string;      // 5-7 days post application follow-up
  postInterviewThankYou: string; // Gratitude & reinforcement after interview
  salaryNegotiation: string;  // Respectful negotiation message
}

export interface InterviewPrepQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'role_specific';
  suggestedAnswerGuide: string;
  starStrategy: string;
}

export interface JobStrategy {
  id: string;
  jobId: string;
  lang?: 'es' | 'en';
  companyOverview: string;
  roleAnalysis: string;
  keySellingPoints: string[];
  tacticalPlan: TacticalStep[];
  outreachMessages: OutreachMessages;
  interviewPrep: InterviewPrepQuestion[];
  createdAt: string;
  updatedAt: string;
}
