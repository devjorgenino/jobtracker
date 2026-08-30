/**
 * Unified AI Service Orchestrator
 * Connects seamlessly to OmniRoute, OpenRouter, Ollama Local, HuggingFace, and Custom OpenAI Endpoints.
 */

import axios from 'axios';
import type { AIConfig, ChatMessage, LLMResponse } from '../../types/ai';
import { OmniRouteProvider } from './omniroute';

export class AIService {
  /**
   * Execute chat completion based on current AIConfig
   */
  static async complete(
    messages: ChatMessage[],
    config: AIConfig,
    overrideOptions?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const temperature = overrideOptions?.temperature ?? config.temperature ?? 0.3;
    const maxTokens = overrideOptions?.maxTokens ?? config.maxTokens ?? 3500;

    switch (config.provider) {
      case 'omniroute':
        return await OmniRouteProvider.complete(messages, config, {
          temperature,
          maxTokens,
        });

      case 'openrouter':
        return await this.callOpenAICompatible({
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKey: config.openrouterApiKey || config.omnirouteApiKey,
          model: config.openrouterModel || config.omnirouteModel || 'qwen/qwen-2.5-72b-instruct:free',
          messages,
          temperature,
          maxTokens,
          providerName: 'openrouter',
          extraHeaders: {
            'HTTP-Referer': typeof window !== 'undefined' ? window.location?.origin || 'https://jobtracker.dev' : 'https://jobtracker.dev',
            'X-Title': 'JobTracker AI Suite',
          },
        });

      case 'ollama':
        return await this.callOpenAICompatible({
          baseUrl: (config.localOllamaUrl || 'http://localhost:11434/v1').replace(/\/+$/, ''),
          apiKey: 'ollama',
          model: config.localOllamaModel || 'qwen2.5:7b',
          messages,
          temperature,
          maxTokens,
          providerName: 'ollama',
        });

      case 'huggingface':
        return await this.callHuggingFace({
          apiKey: config.huggingfaceApiKey,
          model: config.huggingfaceModel || 'meta-llama/Llama-3.3-70B-Instruct',
          messages,
          temperature,
          maxTokens,
        });

      case 'custom':
        return await this.callOpenAICompatible({
          baseUrl: (config.customBaseUrl || 'http://localhost:8000/v1').replace(/\/+$/, ''),
          apiKey: config.customApiKey,
          model: config.customModel || 'default',
          messages,
          temperature,
          maxTokens,
          providerName: 'custom',
        });

      default:
        throw new Error(`Proveedor de IA desconocido: ${config.provider}`);
    }
  }

  /**
   * Test connection to configured AI Provider
   */
  static async testConnection(config: AIConfig): Promise<{
    success: boolean;
    message: string;
    latency?: number;
    latencyMs?: number;
    modelUsed?: string;
  }> {
    const startTime = Date.now();
    try {
      const res = await this.complete(
        [{ role: 'user', content: 'Responde únicamente con la palabra "OK".' }],
        config,
        { maxTokens: 10, temperature: 0.1 }
      );

      const latency = Date.now() - startTime;
      return {
        success: true,
        message: `Conexión exitosa con ${config.provider.toUpperCase()} (${latency}ms). Modelo: ${res.modelUsed}`,
        latency,
        latencyMs: latency,
        modelUsed: res.modelUsed,
      };
    } catch (e: any) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        message: e.message || 'Error desconocido al probar la conexión',
        latency,
        latencyMs: latency,
      };
    }
  }

  /**
   * Robust JSON extractor from LLM markdown responses
   */
  static parseJSONResponse<T = any>(content: string, fallback: T = null as unknown as T): T {
    if (!content || typeof content !== 'string') return fallback;

    try {
      // 1. Direct JSON parse
      return JSON.parse(content);
    } catch {
      // 2. Extract from markdown code blocks ```json ... ``` or ``` ... ```
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch {}
      }

      // 3. Extract between first { and last } or first [ and last ]
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(content.substring(firstBrace, lastBrace + 1));
        } catch {}
      }

      const firstBracket = content.indexOf('[');
      const lastBracket = content.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        try {
          return JSON.parse(content.substring(firstBracket, lastBracket + 1));
        } catch {}
      }
    }

    return fallback;
  }

  /**
   * Generic OpenAI-Compatible Chat Completion Caller
   */
  private static async callOpenAICompatible(opts: {
    baseUrl: string;
    apiKey?: string;
    model: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
    providerName: string;
    extraHeaders?: Record<string, string>;
  }): Promise<LLMResponse> {
    const url = `${opts.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(opts.extraHeaders || {}),
    };

    if (opts.apiKey) {
      headers['Authorization'] = `Bearer ${opts.apiKey.trim()}`;
    }

    try {
      const res = await axios.post(
        url,
        {
          model: opts.model.trim(),
          messages: opts.messages,
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
        },
        { headers, timeout: 45000 }
      );

      const choice = res.data?.choices?.[0];
      const content = choice?.message?.content || choice?.text || '';

      if (!content && !res.data?.error) {
        throw new Error('La respuesta del modelo llegó vacía.');
      }

      return {
        content: content.trim(),
        modelUsed: res.data?.model || opts.model,
        providerUsed: opts.providerName,
        promptTokens: res.data?.usage?.prompt_tokens,
        completionTokens: res.data?.usage?.completion_tokens,
        totalTokens: res.data?.usage?.total_tokens,
      };
    } catch (err: any) {
      const status = err.response?.status;
      const apiMsg = err.response?.data?.error?.message || err.response?.data?.message;

      if (status === 401) {
        throw new Error(`[${opts.providerName} 401] API Key inválida o no autorizada.`);
      }
      if (status === 402 || status === 429) {
        throw new Error(`[${opts.providerName} ${status}] Cuota excedida o límite de peticiones alcanzado.`);
      }
      if (status === 404) {
        throw new Error(`[${opts.providerName} 404] Ruta no encontrada en ${url}. Verifica que la URL base termine en /v1.`);
      }
      if (!err.response && err.message) {
        throw new Error(`[Error de Conexión] No se pudo contactar a ${opts.baseUrl} (${err.message}).`);
      }

      throw new Error(`[${opts.providerName} Error] ${apiMsg || err.message || 'Fallo de llamada'}`);
    }
  }

  /**
   * Hugging Face Inference API Caller
   */
  private static async callHuggingFace(opts: {
    apiKey?: string;
    model: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
  }): Promise<LLMResponse> {
    const url = `https://api-inference.huggingface.co/models/${opts.model}/v1/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (opts.apiKey) {
      headers['Authorization'] = `Bearer ${opts.apiKey.trim()}`;
    }

    try {
      const res = await axios.post(
        url,
        {
          model: opts.model,
          messages: opts.messages,
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
        },
        { headers, timeout: 60000 }
      );

      const content = res.data?.choices?.[0]?.message?.content || '';
      return {
        content: content.trim(),
        modelUsed: opts.model,
        providerUsed: 'huggingface',
        promptTokens: res.data?.usage?.prompt_tokens,
        completionTokens: res.data?.usage?.completion_tokens,
        totalTokens: res.data?.usage?.total_tokens,
      };
    } catch (err: any) {
      const status = err.response?.status;
      const apiMsg = err.response?.data?.error || err.response?.data?.message;

      if (status === 503) {
        throw new Error(`[HuggingFace 503] El modelo ${opts.model} está cargando en los servidores de Hugging Face. Inténtalo en 20 segundos.`);
      }
      if (status === 401) {
        throw new Error(`[HuggingFace 401] Token de Hugging Face inválido.`);
      }

      throw new Error(`[HuggingFace Error] ${apiMsg || err.message || 'Error en Hugging Face'}`);
    }
  }
}
