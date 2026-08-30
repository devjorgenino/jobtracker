/**
 * AI Provider & Execution Configuration
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

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'omniroute',
  omnirouteApiKey: '',
  omnirouteBaseUrl: 'https://api.omniroute.ai/v1',
  omnirouteModel: 'qwen/qwen-2.5-72b-instruct:free',
  openrouterApiKey: '',
  openrouterModel: 'meta-llama/llama-3.3-70b-instruct:free',
  localOllamaUrl: 'http://localhost:11434/v1',
  localOllamaModel: 'qwen2.5:7b',
  huggingfaceApiKey: '',
  huggingfaceModel: 'meta-llama/Llama-3.3-70B-Instruct',
  customBaseUrl: 'http://localhost:8000/v1',
  customApiKey: '',
  customModel: 'default',
  temperature: 0.3,
  maxTokens: 4000,
};

export const OMNIROUTE_MODELS: AIModelOption[] = [
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B Instruct (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'CV Adaptation & ATS Keywords' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'Outreach & Strategy' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (High Speed & Precision)', provider: 'omniroute', isFree: false, recommendedFor: 'Full Automation' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Advanced Reasoning)', provider: 'omniroute', isFree: false, recommendedFor: 'Complex Problem Solving' },
  { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B (Local Inference)', provider: 'omniroute', isFree: true, recommendedFor: '100% Offline PC Inference' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct (Free)', provider: 'omniroute', isFree: true, recommendedFor: 'Fast Generation' },
];

export const OPENROUTER_MODELS: AIModelOption[] = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', provider: 'openrouter', isFree: true },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', provider: 'openrouter', isFree: true },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', provider: 'openrouter', isFree: true },
];
