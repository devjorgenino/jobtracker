/**
 * AI-Powered Candidate Strategy & Recruiter Outreach Engine
 * Generates tailored outreach copy, tactical step-by-step application blueprints, and interview prep.
 */

import type { JobStrategy, TacticalStep, OutreachMessages, InterviewPrepQuestion } from '../../types/strategy';
import type { MasterCV, TailoredCV } from '../../types/cv';
import type { Job } from '../../types/job';
import type { AIConfig } from '../../types/ai';
import { AIService } from '../ai/aiService';

export class StrategyService {
  /**
   * Generates a complete recruitment strategy for a specific vacancy
   */
  static async generateStrategy(
    job: Job,
    cv: MasterCV | TailoredCV,
    config: AIConfig
  ): Promise<JobStrategy> {
    const candidateName = cv.personalInfo?.name || 'Jorge';
    const candidateRole = cv.personalInfo?.roleTitle || 'Software Developer';
    const recruiterName = job.contactName || 'Equipo de Selección';

    const prompt = `
Eres un Headhunter Ejecutivo y Career Coach Senior.
Diseña una estrategia de postulación y captación de alto impacto para conseguir este empleo.

--- VACANTE ---
Puesto: ${job.position}
Empresa: ${job.company}
Ubicación / Modalidad: ${job.location} (${job.workMode})
Portal de Origen: ${job.portal || 'Portal Web'}
Nombre Reclutador / Contacto: ${job.contactName || 'No especificado'}
Perfil Reclutador: ${job.contactProfile || 'No especificado'}
Salario: ${job.salary || 'No especificado'}

Descripción del puesto:
${job.description || job.requirements || 'No provista'}

--- PERFIL REAL DEL CANDIDATO (Basado en su CV Maestro) ---
Nombre: ${candidateName}
Rol Actual / Título: ${candidateRole}
Ubicación: ${cv.personalInfo?.location || 'Remoto'}
Habilidades Principales: ${cv.skillCategories?.map(c => `${c.categoryName}: ${c.skills.join(', ')}`).join(' | ') || 'No categorizadas'}
Resumen Profesional: ${cv.personalInfo?.summary || (cv as any).summary || ''}
Experiencia Laboral:
${JSON.stringify(cv.workExperience || [], null, 2)}
Educación:
${JSON.stringify(cv.education || [], null, 2)}
Proyectos Destacados:
${JSON.stringify(cv.projects || [], null, 2)}
${(cv as MasterCV).rawText ? `\nTexto Extraído del CV:\n${(cv as MasterCV).rawText?.slice(0, 5000)}` : ''}

--- REQUERIMIENTOS DE SALIDA ---
Genera un objeto JSON EXACTO con las siguientes secciones:

1. "companyOverview": Breve análisis estratégico de la empresa y su modelo de negocio (2-3 líneas).
2. "roleAnalysis": Qué busca realmente la empresa en este puesto y cuál es el dolor que el candidato debe resolver.
3. "keySellingPoints": 3 puntos clave diferenciadores del candidato para esta vacante.
4. "outreachMessages":
   - "linkedinConnection": Mensaje de solicitud de conexión en LinkedIn para ${recruiterName}. IMPORTANTE: DEBE TENER MENOS DE 280 CARACTERES para cumplir con el límite estricto de notas de LinkedIn.
   - "linkedinInMail": Mensaje completo de LinkedIn / InMail profesional de 3 párrafos cortos y persuasivos con llamada a la acción.
   - "emailCoverLetter": Carta de presentación / Email formal de postulación estructurado con gancho, valor probado y cierre proactivo.
   - "followUpEmail": Email de seguimiento para enviar 5 a 7 días después de postularse si no ha habido respuesta.
   - "postInterviewThankYou": Email de agradecimiento post-entrevista reforzando el interés y mencionando aportes clave.
   - "salaryNegotiation": Guion respetuoso y asertivo de negociación de oferta salarial.
5. "tacticalPlan": Lista de 5 a 7 pasos cronológicos organizados por fases (Fase 1 a 5), con título, descripción y acción concreta.
6. "interviewPrep": 3 preguntas probables de entrevista técnica y conductual para este rol específico, con su guía de respuesta STAR.

Responde ÚNICAMENTE con el JSON válido.
`;

    try {
      const response = await AIService.complete(
        [
          {
            role: 'system',
            content: 'Eres un Headhunter y Estratega de Carrera. Responde exclusivamente con formato JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        config,
        { temperature: 0.3, maxTokens: 4000 }
      );

      const parsed = AIService.parseJSONResponse<any>(response.content);

      const tacticalPlan: TacticalStep[] = (parsed.tacticalPlan || []).map((step: any, idx: number) => ({
        id: `step_${idx + 1}`,
        phase: step.phase || Math.min(5, Math.floor(idx / 2) + 1),
        phaseTitle: step.phaseTitle || `Fase ${step.phase || idx + 1}`,
        title: step.title || `Paso ${idx + 1}`,
        description: step.description || '',
        actionRequired: step.actionRequired || '',
        completed: false,
        dueDateOffsetDays: step.dueDateOffsetDays ?? (idx * 2),
      }));

      const interviewPrep: InterviewPrepQuestion[] = (parsed.interviewPrep || []).map((q: any, idx: number) => ({
        id: `q_${idx + 1}`,
        question: q.question || 'Pregunta de entrevista',
        category: q.category || 'technical',
        suggestedAnswerGuide: q.suggestedAnswerGuide || '',
        starStrategy: q.starStrategy || '',
      }));

      return {
        id: 'strategy_' + Date.now(),
        jobId: job.id,
        companyOverview: parsed.companyOverview || `Oportunidad en ${job.company} para el rol de ${job.position}.`,
        roleAnalysis: parsed.roleAnalysis || 'Búsqueda de profesional capacitado con impacto directo en el equipo.',
        keySellingPoints: parsed.keySellingPoints || ['Experiencia alineada', 'Stack tecnológico coincidente', 'Orientación a resultados'],
        outreachMessages: {
          linkedinConnection: (parsed.outreachMessages?.linkedinConnection || `Hola ${recruiterName}, vi la vacante de ${job.position} en ${job.company}. Mi perfil encaja fuertemente con el stack. ¡Me encantaría conectar!`).slice(0, 295),
          linkedinInMail: parsed.outreachMessages?.linkedinInMail || '',
          emailCoverLetter: parsed.outreachMessages?.emailCoverLetter || '',
          followUpEmail: parsed.outreachMessages?.followUpEmail || '',
          postInterviewThankYou: parsed.outreachMessages?.postInterviewThankYou || '',
          salaryNegotiation: parsed.outreachMessages?.salaryNegotiation || '',
        },
        tacticalPlan: tacticalPlan.length ? tacticalPlan : this.getDefaultTacticalPlan(job),
        interviewPrep: interviewPrep.length ? interviewPrep : this.getDefaultInterviewPrep(job),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (e: any) {
      console.warn('[StrategyService] AI generation error, using smart fallback strategy:', e);
      return this.generateFallbackStrategy(job, cv);
    }
  }

  /**
   * Smart fallback strategy in case AI is offline or encounters an error
   */
  private static generateFallbackStrategy(job: Job, cv: MasterCV | TailoredCV): JobStrategy {
    const rec = job.contactName || 'Equipo de Selección';
    const name = cv.personalInfo?.name || 'Candidato';
    const role = cv.personalInfo?.roleTitle || 'Desarrollador';

    const outreach: OutreachMessages = {
      linkedinConnection: `Hola ${rec}, vi la vacante de ${job.position} en ${job.company}. Mi experiencia en desarrollo y stack remoto se alinea con su visión. ¡Un saludo!`.slice(0, 290),
      linkedinInMail: `Hola ${rec},\n\nTe escribo con mucho entusiasmo respecto a la vacante de ${job.position} en ${job.company}.\n\nCuento con amplia experiencia en construcción de soluciones de software escalables y trabajo remoto. He revisado los desafíos del rol y considero que mi trayectoria puede sumar valor de inmediato a sus proyectos.\n\n¿Tendrías disponibilidad para una breve llamada de 10 minutos esta semana?\n\nSaludos cordiales,\n${name}`,
      emailCoverLetter: `Estimado/a ${rec},\n\nMe dirijo a usted para presentar mi postulación formal al cargo de ${job.position} en ${job.company}.\n\nHe seguido de cerca el crecimiento de ${job.company} y su apuesta por el talento y la tecnología. Mi perfil como ${role} combina experiencia práctica en arquitecturas modernas, metodologías ágiles y orientación a resultados cuantificables.\n\nAdjunto mi Curriculum Vitae adaptado a las especificaciones de la vacante. Quedo a su entera disposición para ampliar cualquier detalle en una entrevista.\n\nAtentamente,\n${name}\n${cv.personalInfo?.email || ''} | ${cv.personalInfo?.phone || ''}`,
      followUpEmail: `Estimado/a ${rec},\n\nEspero que se encuentre muy bien. Hace una semana presenté mi postulación para el puesto de ${job.position} en ${job.company}.\n\nQuería reiterar mi gran interés en formar parte de su equipo y consultar si disponen de alguna actualización sobre el proceso de selección. Sigo muy motivado/a con la oportunidad.\n\nMuchas gracias por su tiempo y consideración.\n\nSaludos cordiales,\n${name}`,
      postInterviewThankYou: `Estimado/a ${rec},\n\nMuchas gracias por el tiempo dedicado en la entrevista de hoy para la vacante de ${job.position}. Fue un gusto conversar y profundizar sobre los objetivos tecnológicos de ${job.company}.\n\nLa conversación reforzó mi entusiasmo por unirme al equipo y contribuir activamente a sus metas. Quedo a su disposición para los siguientes pasos.\n\nUn cordial saludo,\n${name}`,
      salaryNegotiation: `Estimado/a ${rec},\n\nMuchas gracias por la oferta para unirme a ${job.company} como ${job.position}. Estoy muy entusiasmado/a con el equipo y el proyecto.\n\nConsiderando las responsabilidades del rol y el mercado actual, me gustaría conversar sobre la posibilidad de ajustar la compensación base a [Rango deseado], para formalizar mi incorporación con total compromiso.\n\nQuedo atento/a para coordinar.\n\nSaludos,\n${name}`
    };

    return {
      id: 'strategy_' + Date.now(),
      jobId: job.id,
      companyOverview: `Empresa ${job.company} con enfoque en talento remoto y soluciones de vanguardia.`,
      roleAnalysis: `Posición de ${job.position} requiriendo habilidades técnicas sólidas y comunicación remota efectiva.`,
      keySellingPoints: ['Dominio del stack requerido', 'Experiencia remota comprobada', 'Capacidad de entrega autónoma y ágil'],
      outreachMessages: outreach,
      tacticalPlan: this.getDefaultTacticalPlan(job),
      interviewPrep: this.getDefaultInterviewPrep(job),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private static getDefaultTacticalPlan(job: Job): TacticalStep[] {
    return [
      {
        id: 'step_1',
        phase: 1,
        phaseTitle: 'Fase 1: Preparación & Customización',
        title: 'Optimizar CV y Analizar Palabras Clave',
        description: 'Generar el CV adaptado con el ATS Score en > 85% e identificar las 5 tecnologías más críticas.',
        actionRequired: 'Revisar y descargar el CV generado en formato ATS.',
        completed: false,
        dueDateOffsetDays: 0,
      },
      {
        id: 'step_2',
        phase: 2,
        phaseTitle: 'Fase 2: Postulación Formal',
        title: 'Enviar Postulación en el Portal',
        description: `Subir el CV adaptado y completar el formulario en ${job.portal || 'la web de la empresa'}.`,
        actionRequired: 'Postularse y cambiar el estado de la vacante a "Postulado (Applied)".',
        completed: false,
        dueDateOffsetDays: 0,
      },
      {
        id: 'step_3',
        phase: 3,
        phaseTitle: 'Fase 3: Networking y Contacto Directo',
        title: 'Enviar Mensaje de Conexión en LinkedIn al Reclutador',
        description: 'Copiar y enviar la nota personalizada de conexión en LinkedIn para destacar entre los demás candidatos.',
        actionRequired: 'Enviar invitación en LinkedIn con la nota generada.',
        completed: false,
        dueDateOffsetDays: 1,
      },
      {
        id: 'step_4',
        phase: 4,
        phaseTitle: 'Fase 4: Seguimiento (Follow-Up)',
        title: 'Enviar Email de Seguimiento a los 5-7 días',
        description: 'Reiterar interés profesional mediante el correo de seguimiento automatizado.',
        actionRequired: 'Enviar email de follow-up si no hay respuesta tras 5 días.',
        completed: false,
        dueDateOffsetDays: 5,
      },
      {
        id: 'step_5',
        phase: 5,
        phaseTitle: 'Fase 5: Entrevista & Negociación',
        title: 'Preparación Técnica y de Comportamiento (STAR)',
        description: 'Practicar las preguntas de entrevista sugeridas y preparar ejemplos concretos de proyectos previos.',
        actionRequired: 'Revisar preguntas de preparación técnica y STAR.',
        completed: false,
        dueDateOffsetDays: 7,
      },
    ];
  }

  private static getDefaultInterviewPrep(job: Job): InterviewPrepQuestion[] {
    return [
      {
        id: 'q_1',
        question: `¿Cómo aplicarías tu experiencia técnica para los desafíos del puesto de ${job.position}?`,
        category: 'technical',
        suggestedAnswerGuide: 'Destaca 2 proyectos relevantes, menciona las tecnologías del stack de la vacante y explica cómo resolviste problemas de escalabilidad o rendimiento.',
        starStrategy: 'Situación: Reto en proyecto anterior -> Tarea: Tu responsabilidad -> Acción: Arquitectura y código implementado -> Resultado: Métricas obtenidas.'
      },
      {
        id: 'q_2',
        question: '¿Cómo manejas la comunicación asíncrona y la autonomía en un entorno de trabajo 100% remoto?',
        category: 'behavioral',
        suggestedAnswerGuide: 'Explica tu disciplina de documentación, uso de herramientas ágiles (Jira, Slack, Notion) y proactividad para desbloquear tareas sin esperar supervisión constante.',
        starStrategy: 'Menciona un caso real donde coordinaste entregas a través de diferentes zonas horarias.'
      },
      {
        id: 'q_3',
        question: `¿Por qué estás interesado específicamente en unirte a ${job.company}?`,
        category: 'role_specific',
        suggestedAnswerGuide: 'Muestra que investigaste la empresa, sus productos o clientes, y alinea tu propósito profesional con el impacto que ellos generan.',
        starStrategy: 'Conecta un valor de la empresa con tu forma de trabajar.'
      }
    ];
  }
}
