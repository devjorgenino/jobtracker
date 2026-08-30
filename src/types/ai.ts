/**
 * AI Provider & Execution Configuration
 * Loads configuration securely from Vite environment variables (.env)
 * with robust fallbacks and multi-provider support.
 */

export type AIProvider = 'omniroute' | 'openrouter' | 'ollama' | 'huggingface' | 'custom';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  contextLength?: string;
  isFree?: boolean;
  recommendedFor?: string;
}

export interface AIConfig {
  provider: AIProvider;

  // OmniRoute Settings (Primary for Free & Local / Remote Models)
  omnirouteApiKey: string;
  omnirouteBaseUrl: string;
  omnirouteModel: string;

  // OpenRouter Settings
  openrouterApiKey: string;
  openrouterModel: string;

  // Local Ollama / LM Studio Settings
  localOllamaUrl: string;
  localOllamaModel: string;

  // Hugging Face Settings
  huggingfaceApiKey: string;
  huggingfaceModel: string;

  // Custom OpenAI Compatible Endpoint
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;

  // Generation parameters
  temperature: number;
  maxTokens: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  modelUsed: string;
  providerUsed: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/**
 * Safely retrieve environment variables with fallbacks in Vite/browser environments
 */
const getEnv = (key: string, fallback = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const val = (import.meta.env as Record<string, string | undefined>)[key];
      if (val !== undefined && val !== '') return val;
    }
  } catch {
    // Ignore environment read errors in non-standard environments
  }
  return fallback;
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: (getEnv('VITE_AI_PROVIDER', 'omniroute') as AIProvider),
  omnirouteApiKey: getEnv('VITE_OMNIROUTE_API_KEY', getEnv('VITE_API_KEY', getEnv('VITE_OPENROUTER_API_KEY', ''))),
  omnirouteBaseUrl: getEnv('VITE_OMNIROUTE_BASE_URL', 'https://openrouter.ai/api/v1'),
  omnirouteModel: getEnv('VITE_OMNIROUTE_MODEL', 'qwen/qwen-2.5-72b-instruct:free').trim(),
  openrouterApiKey: getEnv('VITE_OPENROUTER_API_KEY', getEnv('VITE_API_KEY', getEnv('VITE_OMNIROUTE_API_KEY', ''))),
  openrouterModel: getEnv('VITE_OPENROUTER_MODEL', 'qwen/qwen-2.5-72b-instruct:free'),
  localOllamaUrl: getEnv('VITE_LOCAL_OLLAMA_URL', getEnv('VITE_LOCAL_URL', 'http://localhost:11434/v1')),
  localOllamaModel: getEnv('VITE_LOCAL_OLLAMA_MODEL', 'qwen2.5:7b'),
  huggingfaceApiKey: getEnv('VITE_HUGGINGFACE_API_KEY', ''),
  huggingfaceModel: getEnv('VITE_HUGGINGFACE_MODEL', 'meta-llama/Llama-3.3-70B-Instruct'),
  customBaseUrl: getEnv('VITE_CUSTOM_BASE_URL', 'http://localhost:8000/v1'),
  customApiKey: getEnv('VITE_CUSTOM_API_KEY', ''),
  customModel: getEnv('VITE_CUSTOM_MODEL', 'default'),
  temperature: parseFloat(getEnv('VITE_AI_TEMPERATURE', '0.3')) || 0.3,
  maxTokens: parseInt(getEnv('VITE_AI_MAX_TOKENS', '4000'), 10) || 4000,
};

export const OMNIROUTE_MODELS: AIModelOption[] = [
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B Instruct (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'Adaptación de CV, Traducción & Keywords ATS' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'Estrategia, Matching & Outreach' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'Generación Ultra Rápida' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'Razonamiento Profundo' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (High Speed)', provider: 'omniroute', isFree: false, recommendedFor: 'Automatización Completa' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'Respuestas Rápidas' },
  { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B (Local Inference)', provider: 'omniroute', isFree: true, recommendedFor: 'Inferencia 100% Offline (Ollama)' },
];

export const OPENROUTER_MODELS: AIModelOption[] = [
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', provider: 'openrouter', isFree: true },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', provider: 'openrouter', isFree: true },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', provider: 'openrouter', isFree: true },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'openrouter', isFree: true },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'openrouter', isFree: false },
];
