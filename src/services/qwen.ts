/**
 * Qwen & Legacy AI Service Adapter
 * Maps legacy requests to the new unified AIService and OmniRoute engine.
 */

import { useStore } from '../context/store';
import type { AIConfig } from '../types/ai';
import { AIService } from './ai/aiService';

export interface QwenConfig {
  apiKey: string;
  baseUrl: string;
}

export type AIProvider = 'omniroute' | 'openrouter' | 'huggingface' | 'local';

export interface OptimizeCVRequest {
  cvContent: string;
  jobDescription: string;
}

export interface GenerateCoverLetterRequest {
  cvContent: string;
  jobDescription: string;
  companyName: string;
}

export interface GenerateMessageRequest {
  templateType: string;
  candidateName: string;
  recruiterName?: string;
  jobTitle?: string;
  companyName?: string;
  cvContent?: string;
  context?: string;
  language?: 'es' | 'en';
}

export interface AIResponse {
  content: string;
  error?: string;
}

export class QwenService {
  private config: AIConfig | null = null;

  constructor() {
    this.loadConfigFromStore();
  }

  loadConfigFromStore() {
    try {
      this.config = useStore.getState().aiConfig;
    } catch {
      // Fallback
    }
  }

  async optimizeCV(request: OptimizeCVRequest): Promise<AIResponse> {
    this.loadConfigFromStore();
    if (!this.config) return { content: '', error: 'Sin configuración de IA' };

    try {
      const response = await AIService.complete(
        [
          { role: 'system', content: 'Eres un experto en ATS y optimización de currículums.' },
          { role: 'user', content: `Optimiza este CV para la siguiente vacante:\n\nCV:\n${request.cvContent}\n\nVacante:\n${request.jobDescription}` },
        ],
        this.config
      );
      return { content: response.content };
    } catch (e: any) {
      return { content: '', error: e.message };
    }
  }

  async generateCoverLetter(request: GenerateCoverLetterRequest): Promise<AIResponse> {
    this.loadConfigFromStore();
    if (!this.config) return { content: '', error: 'Sin configuración de IA' };

    try {
      const response = await AIService.complete(
        [
          { role: 'system', content: 'Eres un redactor profesional de cartas de presentación.' },
          { role: 'user', content: `Genera una carta de presentación para ${request.companyName} basada en:\n\nCV:\n${request.cvContent}\n\nVacante:\n${request.jobDescription}` },
        ],
        this.config
      );
      return { content: response.content };
    } catch (e: any) {
      return { content: '', error: e.message };
    }
  }

  async generateMessage(request: GenerateMessageRequest): Promise<AIResponse> {
    this.loadConfigFromStore();
    if (!this.config) return { content: '', error: 'Sin configuración de IA' };

    try {
      const response = await AIService.complete(
        [
          { role: 'system', content: 'Eres un estratega de comunicaciones con reclutadores.' },
          { role: 'user', content: `Genera un mensaje de tipo "${request.templateType}" para el candidato "${request.candidateName}" dirigido a "${request.recruiterName || 'el equipo de selección'}" de la empresa "${request.companyName || 'la empresa'}" para el puesto "${request.jobTitle || 'la vacante'}".` },
        ],
        this.config
      );
      return { content: response.content };
    } catch (e: any) {
      return { content: '', error: e.message };
    }
  }
}

export const qwenService = new QwenService();
