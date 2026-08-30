/**
 * OmniRoute AI Provider Client
 * Supports OpenAI-compatible endpoints, OpenRouter free/paid models, Groq, and local inference (Ollama / LM Studio).
 */

import axios from 'axios';
import type { AIConfig, ChatMessage, LLMResponse } from '../../types/ai';

export class OmniRouteProvider {
  private static readonly DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
  private static readonly DEFAULT_MODEL = 'qwen/qwen-2.5-72b-instruct:free';

  /**
   * Resolve an effective base URL with fallback to OpenRouter cloud if legacy/unreachable host is given
   */
  private static resolveBaseUrl(rawBaseUrl?: string): string {
    if (!rawBaseUrl || rawBaseUrl.trim() === '' || rawBaseUrl.includes('api.omniroute.ai')) {
      return this.DEFAULT_BASE_URL;
    }
    return rawBaseUrl.replace(/\/+$/, '');
  }

  /**
   * Main completion method
   */
  static async complete(
    messages: ChatMessage[],
    options: Partial<AIConfig> = {},
    generationParams: { temperature?: number; maxTokens?: number } = {}
  ): Promise<LLMResponse> {
    const baseUrl = this.resolveBaseUrl(options.omnirouteBaseUrl);
    const model = (options.omnirouteModel || this.DEFAULT_MODEL).trim();
    const url = `${baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client': 'JobTracker-AI-Suite',
    };

    if (options.omnirouteApiKey) {
      headers['Authorization'] = `Bearer ${options.omnirouteApiKey.trim()}`;
    }

    // Include headers required / recommended by OpenRouter
    if (baseUrl.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location?.origin || 'https://jobtracker.dev' : 'https://jobtracker.dev';
      headers['X-Title'] = 'JobTracker AI Suite';
    }

    const payload = {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: generationParams.temperature ?? options.temperature ?? 0.3,
      max_tokens: generationParams.maxTokens ?? options.maxTokens ?? 3000,
    };

    try {
      const response = await axios.post(url, payload, {
        headers,
        timeout: 45000,
      });

      const choice = response.data?.choices?.[0];
      const content = choice?.message?.content || choice?.text || '';

      if (!content && !response.data?.error) {
        throw new Error('La respuesta del modelo llegó vacía.');
      }

      return {
        content: content.trim(),
        modelUsed: response.data?.model || model,
        providerUsed: 'omniroute',
        promptTokens: response.data?.usage?.prompt_tokens,
        completionTokens: response.data?.usage?.completion_tokens,
        totalTokens: response.data?.usage?.total_tokens,
      };
    } catch (error: any) {
      const status = error.response?.status;
      const apiMsg = error.response?.data?.error?.message || error.response?.data?.message;

      if (status === 401) {
        throw new Error(`[OmniRoute/OpenRouter 401] API Key inválida o no autorizada. Revisa tu clave en Ajustes o en el archivo .env.`);
      }
      if (status === 402 || status === 429) {
        throw new Error(`[OmniRoute/OpenRouter ${status}] Límite de cuota o peticiones alcanzado en ${model}. Si usas un modelo gratuito, espera unos segundos o cambia a otro modelo free.`);
      }
      if (status === 404) {
        throw new Error(`[OmniRoute 404] Endpoint no encontrado en ${url}. Asegúrate de que la URL base incluya /v1 al final.`);
      }
      if (!error.response && error.message) {
        throw new Error(`[Error de Conexión] No se pudo contactar a ${baseUrl}: ${error.message}. Si es un servidor local, asegúrate de que esté encendido. Si es nube, usa https://openrouter.ai/api/v1.`);
      }

      throw new Error(`[OmniRoute Error] ${apiMsg || error.message || 'Fallo desconocido al conectar con el modelo'}`);
    }
  }
}
