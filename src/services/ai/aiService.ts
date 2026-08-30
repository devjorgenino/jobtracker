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
        return await OmniRouteProvider.complete(messages, {
          apiKey: config.omnirouteApiKey,
          baseUrl: config.omnirouteBaseUrl,
          model: config.omnirouteModel,
          temperature,
          maxTokens,
        });

      case 'openrouter':
        return await this.callOpenAICompatible({
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKey: config.openrouterApiKey,
          model: config.openrouterModel || 'meta-llama/llama-3.3-70b-instruct:free',
          messages,
          temperature,
          maxTokens,
          providerName: 'openrouter',
          extraHeaders: {
            'HTTP-Referer': 'https://jobtracker.dev',
            'X-Title': 'JobTracker AI',
          },
        });

      case 'ollama':
        return await this.callOpenAICompatible({
          baseUrl: config.localOllamaUrl || 'http://localhost:11434/v1',
          apiKey: 'ollama',
          model: config.localOllamaModel || 'qwen2.5:7b',
          messages,
          temperature,
          maxTokens,
          providerName: 'ollama',
        });

      case 'huggingface':
        return await this.callHuggingFace(messages, config, temperature, maxTokens);

      case 'custom':
      default:
        return await this.callOpenAICompatible({
          baseUrl: config.customBaseUrl || 'http://localhost:8000/v1',
          apiKey: config.customApiKey || '',
          model: config.customModel || 'default',
          messages,
          temperature,
          maxTokens,
          providerName: 'custom',
        });
    }
  }

  /**
   * Generic OpenAI-compatible chat completion caller
   */
  private static async callOpenAICompatible(options: {
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
    providerName: string;
    extraHeaders?: Record<string, string>;
  }): Promise<LLMResponse> {
    const url = `${options.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.extraHeaders || {}),
    };

    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    const payload = {
      model: options.model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    };

    const response = await axios.post(url, payload, { headers, timeout: 60000 });
    const choice = response.data?.choices?.[0];
    const content = choice?.message?.content || choice?.text || '';

    return {
      content,
      modelUsed: options.model,
      providerUsed: options.providerName,
      promptTokens: response.data?.usage?.prompt_tokens,
      completionTokens: response.data?.usage?.completion_tokens,
      totalTokens: response.data?.usage?.total_tokens,
    };
  }

  /**
   * Hugging Face Inference API Caller
   */
  private static async callHuggingFace(
    messages: ChatMessage[],
    config: AIConfig,
    temperature: number,
    maxTokens: number
  ): Promise<LLMResponse> {
    const model = config.huggingfaceModel || 'meta-llama/Llama-3.3-70B-Instruct';
    const url = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.huggingfaceApiKey}`,
    };

    const response = await axios.post(
      url,
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      },
      { headers, timeout: 60000 }
    );

    return {
      content: response.data?.choices?.[0]?.message?.content || '',
      modelUsed: model,
      providerUsed: 'huggingface',
    };
  }

  /**
   * Real-time Connection & Latency Tester
   */
  static async testConnection(config: AIConfig): Promise<{ success: boolean; message: string; latency?: number; latencyMs?: number }> {
    const startTime = Date.now();
    try {
      const res = await this.complete(
        [{ role: 'user', content: 'Responde únicamente con la palabra "OK".' }],
        config,
        { maxTokens: 10, temperature: 0.1 }
      );
      const latencyMs = Date.now() - startTime;

      if (res.content.toLowerCase().includes('ok') || res.content.length > 0) {
        return {
          success: true,
          message: `Conexión establecida correctamente con ${res.providerUsed} (${res.modelUsed}).`,
          latency: latencyMs,
          latencyMs,
        };
      }
      return {
        success: false,
        message: 'El modelo no retornó una respuesta válida.',
        latency: latencyMs,
        latencyMs,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.response?.data?.error?.message || e.message || 'Error de conexión',
        latency: Date.now() - startTime,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Helper to parse and extract clean JSON from LLM markdown fences
   */
  static parseJSONResponse<T = any>(content: string): T {
    let clean = content.trim();

    // Strip markdown code fences ```json ... ``` or ``` ... ```
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    try {
      return JSON.parse(clean) as T;
    } catch (e) {
      // Try regex search for first { and last }
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const substr = clean.slice(firstBrace, lastBrace + 1);
        return JSON.parse(substr) as T;
      }
      throw new Error(`Failed to parse LLM JSON response: ${clean.slice(0, 100)}...`);
    }
  }
}
