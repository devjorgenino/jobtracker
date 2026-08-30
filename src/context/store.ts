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
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveJobId: (id: string | null) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;

  // Data Management
  exportBackup: () => string;
  importBackup: (jsonData: string) => boolean;
  clearAllData: () => void;
}

const DEFAULT_MASTER_CV: MasterCV = {
  id: 'master_cv_default',
  title: 'Jorge Niño — Product Engineer CV',
  personalInfo: {
    name: 'JORGE NIÑO',
    roleTitle: 'Product Engineer | Full-Stack Developer | AI-Native Development (Cursor, Claude Code)',
    email: 'jorgenino.dev@gmail.com',
    phone: '+58 412-350-6984',
    location: 'Remoto — Venezuela (LATAM)',
    linkedin: 'https://linkedin.com/in/jorgeninodev',
    github: 'https://github.com/jorge',
    portfolio: 'https://jorgenino-developer.vercel.app',
    summary: 'Ingeniero de software full-stack con 6+ años de experiencia construyendo productos de principio a fin para empresas SaaS de Estados Unidos, combinando ejecución técnica (Next.js, TypeScript, Node.js, Python, FastAPI, PostgreSQL, Supabase) con criterio de producto, buenas prácticas de ingeniería y comunicación directa con clientes para traducir requerimientos de negocio en soluciones técnicas escalables. Actualmente incorporo herramientas AI-Native (Cursor, Claude Code) en mi flujo de desarrollo diario como multiplicador de productividad, manteniendo control y revisión activa sobre el código generado. Diseñé e implementé la arquitectura que reemplazó una herramienta de terceros de $50,000+ anuales por una solución propia con integración de IA (Python, FastAPI, OpenAI API), reduciendo costos operativos en un 80%. Experiencia liderando equipos remotos, gestionando bases de datos, APIs e infraestructura, y desenvolviéndome con autonomía ante especificaciones abiertas o no del todo definidas.',
  },
  workExperience: [
    {
      id: 'exp_1',
      company: 'ServicePad',
      role: 'Frontend Team Lead',
      location: 'Remoto',
      startDate: 'Enero 2023',
      endDate: 'Julio 2025',
      current: false,
      achievements: [
        'Diseñé e implementé la arquitectura full-stack (Python, FastAPI, OpenAI API + n8n) que reemplazó una herramienta de terceros de más de $50,000 al año: -80% en costos operativos, -40% en errores manuales, -35% en tiempo de procesamiento.',
        'Actué como punto de contacto técnico con stakeholders de negocio, traduciendo requerimientos en soluciones robustas y presentando avances de forma clara y no técnica.',
        'Lidero un equipo de 4 ingenieros con autonomía sobre especificaciones abiertas: 150+ revisiones de código al año, pair programming semanal, 1:1s estructurados. Resultado: -45% errores en producción.',
        'Diseñé un Design System listo para microfrontends (80+ componentes, Storybook) y propuse interfaces funcionales sin depender de especificaciones de diseño cerradas: +30% en velocidad de entrega.',
        'Rediseñé la arquitectura de carga de la aplicación (code splitting, lazy loading): Core Web Vitals +60% (4.2s a 1.8s), bundle -55% (2.1MB a 950KB).',
        'Diseñé la arquitectura que sostiene 2,000+ usuarios simultáneos con 99.5% de disponibilidad; reduje deuda técnica 30% refactorizando 8 módulos legacy (principios SOLID) con testing y gestión de errores.',
        'Implementé CI/CD con GitHub Actions y Docker: tiempo de despliegue de 45 a 8 minutos, cero interrupciones (zero-downtime).',
      ],
      technologies: ['React.js', 'Next.js', 'TypeScript', 'Python', 'FastAPI', 'Node.js', 'React Query', 'Zustand', 'Material UI', 'Storybook', 'Jest', 'Cypress', 'Docker', 'AWS', 'Integración de IA'],
    },
    {
      id: 'exp_2',
      company: 'ServicePad',
      role: 'Frontend Developer',
      location: 'Remoto',
      startDate: 'Junio 2021',
      endDate: 'Diciembre 2022',
      current: false,
      achievements: [
        'Diseñé la arquitectura de una plataforma ERP B2B full-stack (SSR/SSG, PostgreSQL) que procesa 20,000+ transacciones mensuales.',
        'Integré pasarelas de pago (Stripe, Channel Payment) con validación en tiempo real: tasa de éxito 82% a 93%, abandono de carrito -10 puntos.',
        'Desarrollé una librería de 65 componentes reutilizables y accesibles (WCAG 2.1 AA): tiempo de desarrollo de funciones -37.5% (8 a 5 días).',
        'Optimicé 12 integraciones REST (React Query, paginación cursor-based, debounce): tiempos de respuesta de 2.5s a 800ms.',
      ],
      technologies: ['React.js', 'Next.js', 'Redux Toolkit', 'Redux Saga', 'TypeScript', 'PostgreSQL', 'CSS Modules', 'SASS', 'Material UI', 'Jest', 'React Testing Library', 'Webpack', 'Figma'],
    },
    {
      id: 'exp_3',
      company: 'geekHACK',
      role: 'Frontend Web Developer',
      location: 'Remoto',
      startDate: 'Septiembre 2018',
      endDate: 'Julio 2021',
      current: false,
      achievements: [
        'Entregué 7 aplicaciones web full-stack para 4 startups fintech y 2 plataformas e-commerce: 92% satisfacción del cliente, 4 contratos recurrentes, 0 incidentes críticos en producción.',
        'Diseñé la arquitectura de 3 dashboards financieros en tiempo real (GraphQL subscriptions, PostgreSQL): 500+ puntos de datos actualizados cada 3 segundos, <200ms de latencia.',
        'Mejoré el First Contentful Paint de 3.8s a 2.1s y el puntaje de Lighthouse de 62 a 85 (lazy loading, tree-shaking, optimización de assets).',
      ],
      technologies: ['React.js', 'Angular', 'Vue.js', 'PHP Laravel', 'TypeScript', 'PostgreSQL', 'Redux', 'Firebase', 'SASS', 'GraphQL'],
    },
    {
      id: 'exp_4',
      company: 'Seai Lab',
      role: 'Frontend React Programmer',
      location: 'Remoto',
      startDate: 'Mayo 2020',
      endDate: 'Octubre 2020',
      current: false,
      achievements: [
        'Construí 2 aplicaciones SaaS en sprints ágiles de 2 semanas (18 features en 9 ciclos), con equipo distribuido de 6 desarrolladores en 3 países.',
        'Aumenté la cobertura de pruebas automatizadas de 15% a 58% (60+ tests): errores críticos en producción de 8 a 3 por release.',
      ],
      technologies: ['React.js', 'Context API', 'Jest', 'React Testing Library', 'REST APIs', 'Git', 'Jira'],
    },
    {
      id: 'exp_5',
      company: 'Autónomo',
      role: 'Web Developer',
      location: 'Remoto',
      startDate: 'Mayo 2017',
      endDate: 'Septiembre 2018',
      current: false,
      achievements: [
        'Entregué 8 proyectos con 92% de satisfacción del cliente: 3 contratos recurrentes, 4 clientes por referido, interactuando directamente con clientes para levantar requerimientos.',
        'Mejoré los puntajes de Lighthouse de 45 a 78 y posicioné 5 sitios en la primera página de Google (SEO) en 4 meses.',
      ],
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'WordPress', 'MySQL', 'Bootstrap', 'SEO'],
    },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'Universidad de Oriente (VE)',
      degree: 'Licenciatura en Informática',
      fieldOfStudy: 'Ciencias de la Computación',
      startDate: '2014',
      endDate: '2019',
      current: false,
    },
    {
      id: 'edu_2',
      institution: 'BIG School',
      degree: 'Formación en Inteligencia Artificial aplicada al desarrollo profesional',
      fieldOfStudy: 'Introducción al Desarrollo con IA, IA Profesional, AI-Powered Development, uso de Cursor y Claude Code en flujos de desarrollo',
      startDate: 'Octubre 2025',
      endDate: 'Marzo 2026',
      current: false,
    },
  ],
  skillCategories: [
    {
      categoryName: 'Frontend',
      skills: ['React.js', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'Tailwind CSS', 'Material UI', 'Redux Toolkit', 'Zustand', 'React Query', 'Storybook'],
    },
    {
      categoryName: 'Backend & Infraestructura',
      skills: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Supabase', 'REST APIs', 'GraphQL', 'Autenticación', 'Row Level Security (RLS)', 'Docker', 'AWS', 'CI/CD', 'GitHub Actions'],
    },
    {
      categoryName: 'Herramientas AI-Native',
      skills: ['Cursor', 'Claude Code', 'GitHub Copilot', 'Integración con OpenAI API'],
    },
    {
      categoryName: 'Ingeniería & Producto',
      skills: ['System Design', 'Software Architecture', 'Team Leadership', 'Design Systems', 'Microfrontends', 'Performance Optimization', 'Testing (Jest, Cypress)', 'Vercel', 'Gestión de secretos', 'Caching'],
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AI-Native Software Development',
      issuer: 'BIG School',
      issueDate: '2026',
    },
  ],
  languages: [
    { id: 'lang_1', language: 'Español', proficiency: 'Nativo' },
    { id: 'lang_2', language: 'Inglés', proficiency: 'Profesional / Técnico (B2/C1)' },
  ],
  projects: [
    {
      id: 'proj_1',
      name: 'JobTracker AI Suite',
      description: 'Plataforma integral de gestión de postulaciones remotas, extensión de navegador y optimizador ATS en tiempo real.',
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
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),

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
      merge: (persistedState: any, currentState: AppState) => {
        const persisted = (persistedState as Partial<AppState>) || {};
        const persistedAi = persisted.aiConfig || ({} as Partial<AIConfig>);

        // Resolve baseUrl: if persisted is empty or points to legacy unreachable domain, use .env default
        const omnirouteBaseUrl =
          !persistedAi.omnirouteBaseUrl || persistedAi.omnirouteBaseUrl.includes('api.omniroute.ai')
            ? DEFAULT_AI_CONFIG.omnirouteBaseUrl
            : persistedAi.omnirouteBaseUrl;

        // Resolve model: if persisted is generic/invalid, use .env default
        const omnirouteModel =
          !persistedAi.omnirouteModel || persistedAi.omnirouteModel.trim() === 'free-models'
            ? DEFAULT_AI_CONFIG.omnirouteModel
            : persistedAi.omnirouteModel.trim();

        const mergedAiConfig: AIConfig = {
          ...DEFAULT_AI_CONFIG,
          ...persistedAi,
          omnirouteBaseUrl,
          omnirouteModel,
          omnirouteApiKey: persistedAi.omnirouteApiKey || DEFAULT_AI_CONFIG.omnirouteApiKey,
          openrouterApiKey: persistedAi.openrouterApiKey || DEFAULT_AI_CONFIG.openrouterApiKey,
          huggingfaceApiKey: persistedAi.huggingfaceApiKey || DEFAULT_AI_CONFIG.huggingfaceApiKey,
          customApiKey: persistedAi.customApiKey || DEFAULT_AI_CONFIG.customApiKey,
        };

        return {
          ...currentState,
          ...persisted,
          aiConfig: mergedAiConfig,
        };
      },
    }
  )
);
