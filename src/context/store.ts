/**
 * Central State Management with Zustand & LocalStorage Persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, JobStatus, JobPriority } from '../types/job';
import type { MasterCV, TailoredCV } from '../types/cv';
import type { JobStrategy, TacticalStep } from '../types/strategy';
import type { AIConfig } from '../types/ai';
import { DEFAULT_AI_CONFIG } from '../types/ai';
import { StatusService } from '../services/hr/statusService';

export interface AppState {
  jobs: Job[];
  masterCV: MasterCV;
  tailoredCvs: Record<string, TailoredCV>; // Keyed by jobId
  strategies: Record<string, JobStrategy>; // Keyed by jobId
  aiConfig: AIConfig;
  activeJobId: string | null;
  filters: {
    search: string;
    status: JobStatus | 'all';
    priority: JobPriority | 'all';
    workMode: string;
    portal: string;
  };

  // Job Actions
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  transitionJobStatus: (id: string, newStatus: JobStatus, note?: string) => void;
  logJobActivity: (id: string, description: string, type?: string) => void;

  // Master CV Actions
  setMasterCV: (cv: MasterCV) => void;
  updateMasterCV: (updates: Partial<MasterCV>) => void;

  // Tailored CV Actions
  setTailoredCV: (jobId: string, cv: TailoredCV) => void;
  deleteTailoredCV: (jobId: string) => void;

  // Strategy Actions
  setStrategy: (jobId: string, strategy: JobStrategy) => void;
  toggleTacticalStep: (jobId: string, stepId: string) => void;

  // AI Config Actions
  setAIConfig: (config: Partial<AIConfig>) => void;
  resetAIConfig: () => void;

  // UI / Filters Actions
  setActiveJobId: (id: string | null) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;

  // Data Management
  exportBackup: () => string;
  importBackup: (jsonData: string) => boolean;
  clearAllData: () => void;
}

const DEFAULT_MASTER_CV: MasterCV = {
  id: 'master_cv_default',
  title: 'CV General - Software Developer',
  personalInfo: {
    name: 'Jorge Niño',
    roleTitle: 'Senior Full Stack & AI Software Developer',
    email: 'jorge@ejemplo.com',
    phone: '+58 412 1234567',
    location: 'Venezuela (Disponible Remoto Global)',
    linkedin: 'https://linkedin.com/in/jorge-nino',
    github: 'https://github.com/jorge',
    portfolio: 'https://jorgenino.dev',
    summary: 'Ingeniero de Software y Desarrollador Full Stack con más de 5 años de experiencia construyendo aplicaciones web escalables, arquitecturas basadas en TypeScript, React, Node.js y soluciones de Inteligencia Artificial. Especialista en optimización de rendimiento, diseño modular y colaboración en equipos distribuidos y remotos.',
  },
  workExperience: [
    {
      id: 'exp_1',
      company: 'Tech Startup Global',
      role: 'Senior Full Stack Developer',
      location: 'Remoto',
      startDate: '2022',
      endDate: 'Presente',
      current: true,
      achievements: [
        'Lideré el diseño y desarrollo de aplicaciones web de alto rendimiento utilizando React, TypeScript, Tailwind CSS y Node.js.',
        'Optimizé tiempos de carga y procesamiento en un 40% mediante arquitecturas asíncronas y refactorización de código limpio.',
        'Implementé integraciones de APIs de Inteligencia Artificial y automatización de flujos de trabajo con cobertura de pruebas.',
        'Reduje la latencia de respuesta del backend en un 35% implementando caching distribuido.',
        'Escalé la plataforma para soportar más de 50,000 usuarios activos mensuales sin degradación de servicio.',
      ],
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AI APIs'],
    },
    {
      id: 'exp_2',
      company: 'Digital Solutions Inc.',
      role: 'Full Stack Developer',
      location: 'Remoto',
      startDate: '2020',
      endDate: '2022',
      current: false,
      achievements: [
        'Desarrollé plataformas web integrales, paneles de control y APIs RESTful seguras con arquitecturas modulares.',
        'Colaboré estrechamente con diseñadores UI/UX y gerentes de producto en sprints ágiles Scrum.',
        'Automatizé pipelines de integración continua (CI/CD) reduciendo el tiempo de despliegue en un 50%.',
      ],
      technologies: ['JavaScript', 'React', 'Express.js', 'MongoDB', 'Git', 'REST APIs'],
    },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'Universidad Tecnológica',
      degree: 'Ingeniería en Informática / Sistemas',
      fieldOfStudy: 'Ciencias de la Computación',
      startDate: '2016',
      endDate: '2021',
      current: false,
    },
  ],
  skillCategories: [
    {
      categoryName: 'Lenguajes & Frameworks',
      skills: ['TypeScript', 'JavaScript', 'React.js', 'Node.js', 'Next.js', 'Python', 'Tailwind CSS', 'HTML5/CSS3'],
    },
    {
      categoryName: 'Bases de Datos & Cloud',
      skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Git / GitHub CI/CD', 'REST / GraphQL APIs'],
    },
    {
      categoryName: 'IA & Metodologías',
      skills: ['LLM Integration (OmniRoute, OpenAI)', 'Prompt Engineering', 'Scrum / Agile', 'TDD', 'Clean Architecture'],
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'Full Stack Web Development Professional',
      issuer: 'Tech Institute',
      issueDate: '2022',
    },
  ],
  languages: [
    { id: 'lang_1', language: 'Español', proficiency: 'Nativo' },
    { id: 'lang_2', language: 'Inglés', proficiency: 'Avanzado C1/C2' },
  ],
  projects: [
    {
      id: 'proj_1',
      name: 'JobTracker AI Suite',
      description: 'Plataforma completa de gestión de postulaciones remotas con extensión de navegador y motor de optimización ATS.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'OmniRoute AI'],
      highlights: ['Captura en 1 clic desde LinkedIn e Indeed', 'Generación de CV ATS con > 90% score'],
    },
  ],
  updatedAt: new Date().toISOString(),
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      jobs: [],
      masterCV: DEFAULT_MASTER_CV,
      tailoredCvs: {},
      strategies: {},
      aiConfig: DEFAULT_AI_CONFIG,
      activeJobId: null,
      filters: {
        search: '',
        status: 'all',
        priority: 'all',
        workMode: 'all',
        portal: 'all',
      },

      addJob: (job: Job) => {
        set((state) => {
          // Check if job already exists (by ID or exact URL)
          const exists = state.jobs.some(
            (j) => j.id === job.id || (job.url && j.url === job.url)
          );
          if (exists) {
            return {
              jobs: state.jobs.map((j) =>
                j.id === job.id || (job.url && j.url === job.url) ? { ...j, ...job } : j
              ),
            };
          }
          return { jobs: [job, ...state.jobs] };
        });
      },

      updateJob: (id: string, updates: Partial<Job>) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  ...updates,
                  lastUpdate: new Date().toISOString(),
                }
              : job
          ),
        }));
      },

      deleteJob: (id: string) => {
        set((state) => {
          const { [id]: _, ...remainingCvs } = state.tailoredCvs;
          const { [id]: __, ...remainingStrategies } = state.strategies;
          return {
            jobs: state.jobs.filter((job) => job.id !== id),
            tailoredCvs: remainingCvs,
            strategies: remainingStrategies,
            activeJobId: state.activeJobId === id ? null : state.activeJobId,
          };
        });
      },

      transitionJobStatus: (id: string, newStatus: JobStatus, note?: string) => {
        const state = get();
        const job = state.jobs.find((j) => j.id === id);
        if (!job) return;

        const { updatedJob } = StatusService.transitionStatus(job, newStatus, note);
        set((prevState) => ({
          jobs: prevState.jobs.map((j) => (j.id === id ? updatedJob : j)),
        }));
      },

      logJobActivity: (id: string, description: string, type = 'note_added') => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id !== id) return job;
            const newAct = {
              id: 'act_' + Date.now(),
              timestamp: new Date().toISOString(),
              type: type as any,
              description,
            };
            return {
              ...job,
              lastUpdate: new Date().toISOString(),
              activities: [newAct, ...(job.activities || [])],
            };
          }),
        }));
      },

      setMasterCV: (cv: MasterCV) => {
        set({ masterCV: { ...cv, updatedAt: new Date().toISOString() } });
      },

      updateMasterCV: (updates: Partial<MasterCV>) => {
        set((state) => ({
          masterCV: {
            ...state.masterCV,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      setTailoredCV: (jobId: string, cv: TailoredCV) => {
        set((state) => ({
          tailoredCvs: {
            ...state.tailoredCvs,
            [jobId]: cv,
          },
          jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, tailoredCvId: cv.id } : j)),
        }));
      },

      deleteTailoredCV: (jobId: string) => {
        set((state) => {
          const { [jobId]: _, ...rest } = state.tailoredCvs;
          return {
            tailoredCvs: rest,
            jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, tailoredCvId: undefined } : j)),
          };
        });
      },

      setStrategy: (jobId: string, strategy: JobStrategy) => {
        set((state) => ({
          strategies: {
            ...state.strategies,
            [jobId]: strategy,
          },
          jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, strategyId: strategy.id } : j)),
        }));
      },

      toggleTacticalStep: (jobId: string, stepId: string) => {
        set((state) => {
          const strategy = state.strategies[jobId];
          if (!strategy) return state;

          const updatedPlan: TacticalStep[] = strategy.tacticalPlan.map((step) =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
          );

          return {
            strategies: {
              ...state.strategies,
              [jobId]: {
                ...strategy,
                tacticalPlan: updatedPlan,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      setAIConfig: (config: Partial<AIConfig>) => {
        set((state) => ({
          aiConfig: {
            ...state.aiConfig,
            ...config,
          },
        }));
      },

      resetAIConfig: () => {
        set({ aiConfig: DEFAULT_AI_CONFIG });
      },

      setActiveJobId: (id: string | null) => {
        set({ activeJobId: id });
      },

      setFilters: (filters: Partial<AppState['filters']>) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },

      exportBackup: () => {
        const state = get();
        const exportObj = {
          version: '2.0.0',
          exportedAt: new Date().toISOString(),
          jobs: state.jobs,
          masterCV: state.masterCV,
          tailoredCvs: state.tailoredCvs,
          strategies: state.strategies,
          aiConfig: state.aiConfig,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importBackup: (jsonData: string) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed && Array.isArray(parsed.jobs)) {
            set({
              jobs: parsed.jobs,
              masterCV: parsed.masterCV || get().masterCV,
              tailoredCvs: parsed.tailoredCvs || {},
              strategies: parsed.strategies || {},
              aiConfig: parsed.aiConfig || get().aiConfig,
            });
            return true;
          }
          return false;
        } catch (e) {
          console.error('[Store] Import backup failed:', e);
          return false;
        }
      },

      clearAllData: () => {
        set({
          jobs: [],
          tailoredCvs: {},
          strategies: {},
          activeJobId: null,
        });
      },
    }),
    {
      name: 'jobtracker-storage-v2',
    }
  )
);
