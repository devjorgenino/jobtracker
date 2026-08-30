/**
 * AI-Powered Candidate Strategy & Recruiter Outreach Engine — BILINGUAL (ES / EN)
 * Generates tailored outreach copy, tactical step-by-step application blueprints, and interview prep.
 */

import type { JobStrategy, TacticalStep, OutreachMessages, InterviewPrepQuestion } from '../../types/strategy';
import type { MasterCV, TailoredCV } from '../../types/cv';
import type { Job } from '../../types/job';
import type { AIConfig } from '../../types/ai';
import { AIService } from '../ai/aiService';
import type { Lang } from '../../i18n';

export class StrategyService {
  /**
   * Generates a complete recruitment strategy for a specific vacancy in the chosen language.
   */
  static async generateStrategy(
    job: Job,
    cv: MasterCV | TailoredCV,
    config: AIConfig,
    lang: Lang = 'es'
  ): Promise<JobStrategy> {
    const candidateName = cv.personalInfo?.name || (lang === 'en' ? 'Candidate' : 'Jorge');
    const candidateRole = cv.personalInfo?.roleTitle || 'Software Developer';
    const recruiterName = job.contactName || (lang === 'en' ? 'Hiring Team' : 'Equipo de Selección');

    const prompt = lang === 'en'
      ? this.buildPromptEN(job, cv, candidateName, candidateRole, recruiterName)
      : this.buildPromptES(job, cv, candidateName, candidateRole, recruiterName);

    const systemMsg = lang === 'en'
      ? 'You are an Executive Headhunter and Career Strategist. Respond exclusively in valid JSON format.'
      : 'Eres un Headhunter y Estratega de Carrera. Responde exclusivamente con formato JSON válido.';

    try {
      const response = await AIService.complete(
        [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt },
        ],
        config,
        { temperature: 0.3, maxTokens: 4000 }
      );

      const parsed = AIService.parseJSONResponse<any>(response.content);

      const tacticalPlan: TacticalStep[] = (parsed.tacticalPlan || []).map((step: any, idx: number) => ({
        id: `step_${idx + 1}`,
        phase: step.phase || Math.min(5, Math.floor(idx / 2) + 1),
        phaseTitle: step.phaseTitle || (lang === 'en' ? `Phase ${step.phase || idx + 1}` : `Fase ${step.phase || idx + 1}`),
        title: step.title || (lang === 'en' ? `Step ${idx + 1}` : `Paso ${idx + 1}`),
        description: step.description || '',
        actionRequired: step.actionRequired || '',
        completed: false,
        dueDateOffsetDays: step.dueDateOffsetDays ?? (idx * 2),
      }));

      const interviewPrep: InterviewPrepQuestion[] = (parsed.interviewPrep || []).map((q: any, idx: number) => ({
        id: `q_${idx + 1}`,
        question: q.question || (lang === 'en' ? 'Interview question' : 'Pregunta de entrevista'),
        category: q.category || 'technical',
        suggestedAnswerGuide: q.suggestedAnswerGuide || '',
        starStrategy: q.starStrategy || '',
      }));

      const defaultConnection = lang === 'en'
        ? `Hi ${recruiterName}, I saw the ${job.position} opening at ${job.company}. My profile aligns strongly with your tech stack. Would love to connect!`
        : `Hola ${recruiterName}, vi la vacante de ${job.position} en ${job.company}. Mi perfil encaja fuertemente con el stack. ¡Me encantaría conectar!`;

      return {
        id: 'strategy_' + Date.now(),
        jobId: job.id,
        lang,
        companyOverview: parsed.companyOverview || (lang === 'en' ? `Opportunity at ${job.company} for the ${job.position} role.` : `Oportunidad en ${job.company} para el rol de ${job.position}.`),
        roleAnalysis: parsed.roleAnalysis || (lang === 'en' ? 'Seeking skilled professional with direct impact on team goals.' : 'Búsqueda de profesional capacitado con impacto directo en el equipo.'),
        keySellingPoints: parsed.keySellingPoints || (lang === 'en' ? ['Aligned experience', 'Matching tech stack', 'Results-oriented'] : ['Experiencia alineada', 'Stack tecnológico coincidente', 'Orientación a resultados']),
        outreachMessages: {
          linkedinConnection: (parsed.outreachMessages?.linkedinConnection || defaultConnection).slice(0, 295),
          linkedinInMail: parsed.outreachMessages?.linkedinInMail || '',
          emailCoverLetter: parsed.outreachMessages?.emailCoverLetter || '',
          followUpEmail: parsed.outreachMessages?.followUpEmail || '',
          postInterviewThankYou: parsed.outreachMessages?.postInterviewThankYou || '',
          salaryNegotiation: parsed.outreachMessages?.salaryNegotiation || '',
        },
        tacticalPlan: tacticalPlan.length ? tacticalPlan : this.getDefaultTacticalPlan(job, lang),
        interviewPrep: interviewPrep.length ? interviewPrep : this.getDefaultInterviewPrep(job, lang),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (e: any) {
      console.warn('[StrategyService] AI generation error, using smart fallback strategy:', e);
      return this.generateFallbackStrategy(job, cv, lang);
    }
  }

  /* ─────────────────────── Spanish Prompt ─────────────────────── */
  private static buildPromptES(job: Job, cv: MasterCV | TailoredCV, name: string, role: string, recruiter: string): string {
    return `
Eres un Headhunter Ejecutivo y Career Coach Senior.
Diseña una estrategia de postulación y captación de alto impacto para conseguir este empleo.
TODO EL CONTENIDO GENERADO DEBE ESTAR EN ESPAÑOL.

--- VACANTE ---
Puesto: ${job.position}
Empresa: ${job.company}
Ubicación / Modalidad: ${job.location} (${job.workMode})
Portal de Origen: ${job.portal || 'Portal Web'}
Nombre Reclutador / Contacto: ${recruiter}
Perfil Reclutador: ${job.contactProfile || 'No especificado'}
Salario: ${job.salary || 'No especificado'}

Descripción del puesto:
${job.description || job.requirements || 'No provista'}

--- PERFIL REAL DEL CANDIDATO (Basado en su CV Maestro) ---
Nombre: ${name}
Rol Actual / Título: ${role}
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
   - "linkedinConnection": Mensaje de solicitud de conexión en LinkedIn para ${recruiter}. MENOS DE 280 CARACTERES.
   - "linkedinInMail": Mensaje completo de LinkedIn / InMail profesional de 3 párrafos cortos y persuasivos con llamada a la acción.
   - "emailCoverLetter": Carta de presentación / Email formal de postulación estructurado con gancho, valor probado y cierre proactivo.
   - "followUpEmail": Email de seguimiento para enviar 5 a 7 días después de postularse si no ha habido respuesta.
   - "postInterviewThankYou": Email de agradecimiento post-entrevista reforzando el interés y mencionando aportes clave.
   - "salaryNegotiation": Guion respetuoso y asertivo de negociación de oferta salarial.
5. "tacticalPlan": Lista de 5 a 7 pasos cronológicos organizados por fases (Fase 1 a 5), con título, descripción y acción concreta.
6. "interviewPrep": 3 preguntas probables de entrevista técnica y conductual para este rol específico, con su guía de respuesta STAR.

Responde ÚNICAMENTE con el JSON válido.
`;
  }

  /* ─────────────────────── English Prompt ─────────────────────── */
  private static buildPromptEN(job: Job, cv: MasterCV | TailoredCV, name: string, role: string, recruiter: string): string {
    return `
You are an Executive Headhunter and Senior Career Coach.
Design a high-impact application and outreach strategy to land this job.
ALL GENERATED CONTENT MUST BE IN ENGLISH.

--- VACANCY ---
Position: ${job.position}
Company: ${job.company}
Location / Mode: ${job.location} (${job.workMode})
Source Portal: ${job.portal || 'Web Portal'}
Recruiter / Contact Name: ${recruiter}
Recruiter Profile: ${job.contactProfile || 'Not specified'}
Salary: ${job.salary || 'Not specified'}

Job Description:
${job.description || job.requirements || 'Not provided'}

--- CANDIDATE REAL PROFILE (Based on Master CV) ---
Name: ${name}
Current Role / Title: ${role}
Location: ${cv.personalInfo?.location || 'Remote'}
Main Skills: ${cv.skillCategories?.map(c => `${c.categoryName}: ${c.skills.join(', ')}`).join(' | ') || 'Not categorized'}
Professional Summary: ${cv.personalInfo?.summary || (cv as any).summary || ''}
Work Experience:
${JSON.stringify(cv.workExperience || [], null, 2)}
Education:
${JSON.stringify(cv.education || [], null, 2)}
Notable Projects:
${JSON.stringify(cv.projects || [], null, 2)}
${(cv as MasterCV).rawText ? `\nExtracted CV Text:\n${(cv as MasterCV).rawText?.slice(0, 5000)}` : ''}

--- OUTPUT REQUIREMENTS ---
Generate an EXACT JSON object with the following sections:

1. "companyOverview": Brief strategic analysis of the company and business model (2-3 lines).
2. "roleAnalysis": What the company is really looking for and the core pain point the candidate must solve.
3. "keySellingPoints": 3 key differentiating selling points of the candidate for this vacancy.
4. "outreachMessages":
   - "linkedinConnection": Connection request note for ${recruiter}. MUST BE UNDER 280 CHARACTERS.
   - "linkedinInMail": Full professional LinkedIn / InMail message (3 short, persuasive paragraphs with CTA).
   - "emailCoverLetter": Formal cover letter / application email with hook, proven value, and proactive close.
   - "followUpEmail": Follow-up email to send 5-7 days post-application if no response.
   - "postInterviewThankYou": Post-interview thank you email reinforcing interest and key value-adds.
   - "salaryNegotiation": Respectful and assertive salary negotiation script.
5. "tacticalPlan": 5 to 7 chronological steps organized across phases (Phase 1 to 5), with title, description, and concrete action.
6. "interviewPrep": 3 likely technical and behavioral interview questions for this specific role, with STAR answer guides.

Respond ONLY with valid JSON.
`;
  }

  /* ─────────────────────── Fallback ─────────────────────── */
  private static generateFallbackStrategy(job: Job, cv: MasterCV | TailoredCV, lang: Lang = 'es'): JobStrategy {
    const rec = job.contactName || (lang === 'en' ? 'Hiring Team' : 'Equipo de Selección');
    const name = cv.personalInfo?.name || (lang === 'en' ? 'Candidate' : 'Candidato');
    const role = cv.personalInfo?.roleTitle || (lang === 'en' ? 'Developer' : 'Desarrollador');

    const outreach: OutreachMessages = lang === 'en' ? {
      linkedinConnection: `Hi ${rec}, I came across the ${job.position} opening at ${job.company}. My background in full-stack dev and remote delivery strongly aligns with your goals. Best!`.slice(0, 290),
      linkedinInMail: `Hi ${rec},\n\nI am writing to express my strong enthusiasm for the ${job.position} role at ${job.company}.\n\nI bring extensive experience in scalable software architectures and high-velocity remote engineering. Having reviewed the key challenges of this role, I am confident I can make an immediate impact on your product roadmap.\n\nWould you be open to a brief 10-minute introductory call this week?\n\nBest regards,\n${name}`,
      emailCoverLetter: `Dear ${rec},\n\nI am writing to formally submit my application for the ${job.position} role at ${job.company}.\n\nI have followed ${job.company}'s work closely and admire your approach to engineering and product execution. As a ${role}, I blend hands-on proficiency across modern tech stacks with a results-oriented delivery focus.\n\nAttached is my tailored resume. I would welcome the opportunity to discuss how my skill set aligns with your roadmap.\n\nSincerely,\n${name}\n${cv.personalInfo?.email || ''} | ${cv.personalInfo?.phone || ''}`,
      followUpEmail: `Dear ${rec},\n\nI hope this message finds you well. I submitted my application for the ${job.position} position at ${job.company} last week.\n\nI wanted to follow up and reiterate my strong interest in the role. Please let me know if you need any additional details from my end.\n\nThank you for your time and consideration.\n\nBest regards,\n${name}`,
      postInterviewThankYou: `Dear ${rec},\n\nThank you for taking the time to speak with me today regarding the ${job.position} role. It was a pleasure learning more about ${job.company}'s upcoming milestones.\n\nOur conversation reinforced my enthusiasm for joining the team and contributing directly to these goals. Looking forward to the next steps.\n\nBest regards,\n${name}`,
      salaryNegotiation: `Dear ${rec},\n\nThank you very much for the offer to join ${job.company} as a ${job.position}. I am genuinely excited about the opportunity and the team.\n\nBased on the scope of responsibilities and market rates for this level, I would like to discuss whether we can adjust the base compensation to [Desired Range] to ensure full alignment.\n\nLooking forward to hearing your thoughts.\n\nBest regards,\n${name}`
    } : {
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
      lang,
      companyOverview: lang === 'en' ? `Company ${job.company} focused on modern solutions and top engineering talent.` : `Empresa ${job.company} con enfoque en talento remoto y soluciones de vanguardia.`,
      roleAnalysis: lang === 'en' ? `${job.position} role requiring strong technical ownership and effective remote communication.` : `Posición de ${job.position} requiriendo habilidades técnicas sólidas y comunicación remota efectiva.`,
      keySellingPoints: lang === 'en' ? ['Mastery of required tech stack', 'Proven remote execution', 'Autonomous delivery'] : ['Dominio del stack requerido', 'Experiencia remota comprobada', 'Capacidad de entrega autónoma y ágil'],
      outreachMessages: outreach,
      tacticalPlan: this.getDefaultTacticalPlan(job, lang),
      interviewPrep: this.getDefaultInterviewPrep(job, lang),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private static getDefaultTacticalPlan(job: Job, lang: Lang = 'es'): TacticalStep[] {
    if (lang === 'en') {
      return [
        {
          id: 'step_1',
          phase: 1,
          phaseTitle: 'Phase 1: Preparation & Customization',
          title: 'Optimize CV and Target Key Keywords',
          description: 'Generate tailored CV targeting ATS Score > 85% and pinpoint top 5 crucial requirements.',
          actionRequired: 'Review and download the generated ATS resume.',
          completed: false,
          dueDateOffsetDays: 0,
        },
        {
          id: 'step_2',
          phase: 2,
          phaseTitle: 'Phase 2: Formal Application',
          title: 'Submit Application on Job Portal',
          description: `Upload tailored resume and complete form on ${job.portal || 'company career site'}.`,
          actionRequired: 'Submit and transition vacancy state to "Applied".',
          completed: false,
          dueDateOffsetDays: 0,
        },
        {
          id: 'step_3',
          phase: 3,
          phaseTitle: 'Phase 3: Direct Outreach & Networking',
          title: 'Send LinkedIn Connection Request to Recruiter',
          description: 'Copy and send the personalized connection note to stand out from other applicants.',
          actionRequired: 'Send LinkedIn invite with the generated note.',
          completed: false,
          dueDateOffsetDays: 1,
        },
        {
          id: 'step_4',
          phase: 4,
          phaseTitle: 'Phase 4: Structured Follow-Up',
          title: 'Send Follow-up Email After 5-7 Days',
          description: 'Reiterate interest and value proposition via the automated follow-up draft.',
          actionRequired: 'Send follow-up email if no response after 5 days.',
          completed: false,
          dueDateOffsetDays: 5,
        },
        {
          id: 'step_5',
          phase: 5,
          phaseTitle: 'Phase 5: Interview & Negotiation',
          title: 'Technical and Behavioral (STAR) Interview Prep',
          description: 'Practice the tailored questions and refine concrete examples from past projects.',
          actionRequired: 'Review interview Q&A guides and STAR responses.',
          completed: false,
          dueDateOffsetDays: 7,
        },
      ];
    }

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

  private static getDefaultInterviewPrep(job: Job, lang: Lang = 'es'): InterviewPrepQuestion[] {
    if (lang === 'en') {
      return [
        {
          id: 'q_1',
          question: `How would you apply your technical expertise to the specific challenges of the ${job.position} role?`,
          category: 'technical',
          suggestedAnswerGuide: 'Highlight 2 relevant projects, reference technologies in their stack, and explain how you resolved scaling or performance challenges.',
          starStrategy: 'Situation: Past challenge -> Task: Your ownership -> Action: Architecture & code -> Result: Measured outcome.'
        },
        {
          id: 'q_2',
          question: 'How do you approach asynchronous communication and autonomy in a 100% remote environment?',
          category: 'behavioral',
          suggestedAnswerGuide: 'Explain documentation habits, agile tooling (Jira, Slack, Notion), and proactive unblocking without requiring constant oversight.',
          starStrategy: 'Cite a real example where you coordinated cross-timezone releases.'
        },
        {
          id: 'q_3',
          question: `Why are you specifically interested in joining ${job.company}?`,
          category: 'role_specific',
          suggestedAnswerGuide: 'Show research into their product/market, and align your career goals with the concrete impact they are creating.',
          starStrategy: 'Connect a specific company value with your personal work ethic.'
        }
      ];
    }

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
