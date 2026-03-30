import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, CV, JobStatus } from '@/types';
import type { AIProvider } from '@/services/qwen';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
}

interface AppState {
  jobs: Job[];
  cvs: CV[];
  activeCvId: string | null;
  aiConfig: AIConfig;
  
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  
  addCV: (cv: CV) => void;
  updateCV: (id: string, updates: Partial<CV>) => void;
  deleteCV: (id: string) => void;
  setActiveCv: (id: string | null) => void;
  
  setAIConfig: (config: Partial<AIConfig>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      jobs: [],
      cvs: [],
      activeCvId: null,
      aiConfig: {
        provider: 'openrouter',
        apiKey: '',
        baseUrl: '',
      },

      addJob: (job) =>
        set((state) => ({ jobs: [...state.jobs, job] })),

      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updates, lastUpdate: new Date().toISOString() } : job
          ),
        })),

      deleteJob: (id) =>
        set((state) => ({ jobs: state.jobs.filter((job) => job.id !== id) })),

      updateJobStatus: (id, status) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, status, lastUpdate: new Date().toISOString() } : job
          ),
        })),

      addCV: (cv) =>
        set((state) => ({ cvs: [...state.cvs, cv] })),

      updateCV: (id, updates) =>
        set((state) => ({
          cvs: state.cvs.map((cv) =>
            cv.id === id ? { ...cv, ...updates, updatedAt: new Date().toISOString() } : cv
          ),
        })),

      deleteCV: (id) =>
        set((state) => ({ cvs: state.cvs.filter((cv) => cv.id !== id) })),

      setActiveCv: (id) =>
        set({ activeCvId: id }),

      setAIConfig: (config) =>
        set((state) => ({ aiConfig: { ...state.aiConfig, ...config } })),
    }),
    {
      name: 'job-tracker-storage',
    }
  )
);
