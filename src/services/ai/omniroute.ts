/**
 * OmniRoute AI Provider Client
 * Supports OpenAI-compatible endpoints, free cloud models, and local model inference.
 */

import axios from 'axios';
import type { ChatMessage, LLMResponse } from '../../types/ai';

export interface OmniRouteOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export class OmniRouteProvider {
  static readonly DEFAULT_BASE_URL = 'https://api.omniroute.ai/v1';
  static readonly DEFAULT_MODEL = 'qwen/qwen-2.5-72b-instruct:free';

  /**
   * Completes a chat conversation via OmniRoute API
   */
  static async complete(
    messages: ChatMessage[],
    options: OmniRouteOptions
  ): Promise<LLMResponse> {
    const baseUrl = (options.baseUrl || this.DEFAULT_BASE_URL).replace(/\/+$/, '');
    const model = options.model || this.DEFAULT_MODEL;
    const url = `${baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client': 'JobTracker-AI-Suite',
    };

    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    const payload = {
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 3500,
    };

    try {
      const response = await axios.post(url, payload, {
        headers,
        timeout: 90000, // 90 seconds timeout for larger generation
      });

      const choice = response.data?.choices?.[0];
      const content = choice?.message?.content || choice?.text || '';

      return {
        content,
        modelUsed: model,
        providerUsed: 'omniroute',
        promptTokens: response.data?.usage?.prompt_tokens,
        completionTokens: response.data?.usage?.completion_tokens,
        totalTokens: response.data?.usage?.total_tokens,
      };
    } catch (error: any) {
      const errMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Error de conexión con OmniRoute';

      throw new Error(`[OmniRoute Error]: ${errMsg}`);
    }
  }

  /**
   * Healthcheck & Ping
   */
  static async testConnection(options: OmniRouteOptions): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
  }> {
    const start = Date.now();
    try {
      const res = await this.complete(
        [{ role: 'user', content: 'Ping' }],
        { ...options, maxTokens: 5 }
      );
      const latencyMs = Date.now() - start;
      return {
        success: true,
        latencyMs,
        message: `OmniRoute conectado exitosamente con modelo ${res.modelUsed}`,
      };
    } catch (e: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: e.message || 'Fallo de conexión con OmniRoute',
      };
    }
  }
}
