import { useAppStore, type AIConfig } from '@/context/store';

export interface QwenConfig {
  apiKey: string;
  baseUrl: string;
}

export type AIProvider = 'openrouter' | 'huggingface' | 'local';

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

const DEFAULT_CONFIGS: Record<AIProvider, { baseUrl: string; model: string }> = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'qwen/qwen-2.5-7b-instruct',
  },
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    model: 'Qwen/Qwen2.5-7B-Instruct',
  },
  local: {
    baseUrl: import.meta.env.VITE_LOCAL_URL || 'http://localhost:11434/api',
    model: 'qwen2.5:7b',
  },
};

class QwenService {
  private provider: AIProvider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'openrouter';
  private apiKey: string = import.meta.env.VITE_API_KEY || '';

  setConfig(config: QwenConfig, provider: AIProvider = 'openrouter') {
    this.apiKey = config.apiKey;
    this.provider = provider;
    
    useAppStore.getState().setAIConfig({
      provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    });
  }

  loadConfigFromStore() {
    const { aiConfig } = useAppStore.getState();
    
    if (aiConfig.apiKey) {
      this.apiKey = aiConfig.apiKey;
      this.provider = aiConfig.provider;
    } else if (import.meta.env.VITE_API_KEY) {
      this.apiKey = import.meta.env.VITE_API_KEY;
      this.provider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'openrouter';
      
      useAppStore.getState().setAIConfig({
        provider: this.provider,
        apiKey: this.apiKey,
        baseUrl: '',
      });
    }
  }

  getConfig(): AIConfig {
    const { aiConfig } = useAppStore.getState();
    return aiConfig;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private getHeaders(): HeadersInit {
    if (!this.isConfigured()) throw new Error('Qwen not configured');
    
    if (this.provider === 'local') {
      return { 'Content-Type': 'application/json' };
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': window.location.origin,
    };
  }

  private getEndpoint(): string {
    const base = DEFAULT_CONFIGS[this.provider].baseUrl;
    const model = DEFAULT_CONFIGS[this.provider].model;
    
    if (this.provider === 'local') {
      return `${base}/generate`;
    }
    
    if (this.provider === 'openrouter') {
      return `${base}/chat/completions`;
    }
    
    return `${base}/${model}`;
  }

  private buildPrompt(prompt: string): object {
    if (this.provider === 'local') {
      return { model: DEFAULT_CONFIGS.local.model, prompt, stream: false };
    }
    
    return {
      model: DEFAULT_CONFIGS[this.provider].model,
      messages: [{ role: 'user', content: prompt }],
    };
  }

  async call(prompt: string): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return { content: '', error: 'API no configurada. Por favor configura tu API key en el archivo .env' };
    }

    try {
      const response = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildPrompt(prompt)),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (this.provider === 'local') {
        return { content: data.response || '' };
      }
      
      return { content: data.choices?.[0]?.message?.content || '' };
    } catch (error) {
      return { content: '', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async optimizeCV({ cvContent, jobDescription }: OptimizeCVRequest): Promise<AIResponse> {
    const prompt = `Eres un experto en optimización de CVs para pasar filtros ATS con puntuación 95%+ en palabras clave.

Tu tarea es MEJORAR el siguiente CV para la descripción del puesto, SIN OMITIR NI RECORTAR información.

INSTRUCCIONES CRÍTICAS PARA 95% EN PALABRAS CLAVE:
1. MANTÉN TODA la información del CV original
2. USA FORMATO ESTRICTO con # y ##
3. Usa GUIONES (-) para bullet points, NO pipes (|)
4. EXTRAE Y USA TODAS las palabras clave importantes de la descripción del puesto
5. Añade las keywords en: perfil, experiencia (en logros), competencias
6. Cuantifica logros con números
7. Incluye datos de contacto completos

PALABRAS CLAVE DEL PUESTO (debes incluirlas en el CV):
${jobDescription}

FORMATO OBLIGATORIO:
# NOMBRE COMPLETO
Título profesional
Email | Teléfono | Ciudad, País | LinkedIn

## PERFIL PROFESIONAL
(2-3 oraciones incluyendo palabras clave del puesto)

## EXPERIENCIA LABORAL
- Empresa - Cargo - Fecha
  - Logro con keyword del puesto 1
  - Logro medible 2
- Empresa Siguiente - Cargo - Fecha
  - Logro con keyword

## EDUCACIÓN
- Universidad - Título - Fecha

## COMPETENCIAS
- Técnicas: skill1, skill2, skill3 (usa keywords del puesto)
- Idiomas: idioma nivel
- Software: herramienta1, herramienta2

## FORMACIÓN ADICIONAL
- Curso o certificación

CV ORIGINAL:
${cvContent}

DEVUELVE EL CV OPTIMIZADO:`;

    return this.call(prompt);
  }

  async generateCoverLetter({ cvContent, jobDescription, companyName }: GenerateCoverLetterRequest): Promise<AIResponse> {
    const prompt = `Eres un experto escribiendo cartas de presentación profesionales.

Tu tarea es generar una carta de presentación personalizada.

INSTRUCCIONES:
1. Carta profesional, no más de 400 palabras
2. Dirígete a "Estimado equipo de reclutamiento"
3. Destaca 2-3 logros relevantes del CV que matcheen con el puesto
4. Muestra entusiasmo por la empresa y el puesto
5. Cierra con una llamada a la acción

CV DEL CANDIDATO:
${cvContent}

PUESTO:
${jobDescription}

EMPRESA:
${companyName}

DEVUELVE SOLO LA CARTA DE PRESENTACIÓN, sin comentarios adicionales:`;

    return this.call(prompt);
  }

  async generateMessage({ templateType, candidateName, recruiterName, jobTitle, companyName, cvContent, context, language = 'es' }: GenerateMessageRequest): Promise<AIResponse> {
    const templateLabels: Record<string, { es: string; en: string }> = {
      linkedin_initial: {
        es: 'Mensaje de primer contacto por LinkedIn',
        en: 'First contact message via LinkedIn',
      },
      email: {
        es: 'Email formal de aplicación a empleo',
        en: 'Formal job application email',
      },
      follow_up_application: {
        es: 'Mensaje de seguimiento después de enviar CV',
        en: 'Follow-up message after sending CV',
      },
      post_interview: {
        es: 'Mensaje de agradecimiento post-entrevista',
        en: 'Thank you message after interview',
      },
      response_offer: {
        es: 'Respuesta a una oferta de empleo',
        en: 'Response to a job offer',
      },
      rejection_response: {
        es: 'Mensaje de agradecimiento tras rechazo',
        en: 'Thank you message after rejection',
      },
    };

    const templateTypeLabel = templateLabels[templateType] || templateLabels.linkedin_initial;
    const recruiter = recruiterName ? `para ${recruiterName}` : 'al reclutador';
    
    const prompt = `Eres un asistente que escribe mensajes profesionales personalizados para procesos de búsqueda de empleo.

INSTRUCCIONES:
- Genera un mensaje basado en el tipo: ${templateTypeLabel[language]}
- El mensaje debe estar escrito DESDE la perspectiva DEL CANDIDATO enviando ${recruiter} de ${companyName || 'la empresa'}
- Máximo 150 palabras
- Tono profesional pero cercano
- El mensaje debe estar en ${language === 'es' ? 'español' : 'inglés'}

---

DATOS PROPORCIONADOS:
- Nombre del candidato: ${candidateName}
- Puesto al que aplica: ${jobTitle || 'No especificado'}
- Empresa: ${companyName || 'No especificada'}
- Reclutador: ${recruiterName || 'No especificado'}

---

INFORMACIÓN ADICIONAL DEL CV DEL CANDIDATO:
${cvContent || 'No hay CV disponible'}

${context ? `CONTEXTO ADICIONAL:\n${context}` : ''}

---

DEVUELVE SOLO EL MENSAJE, sin comentarios adicionales:`;

    return this.call(prompt);
  }
}

export const qwenService = new QwenService();
