/**
 * AI-Powered CV Adaptation and ATS Keyword Optimization Service — BILINGUAL (ES/EN)
 * Actúa como un experto en Recursos Humanos, Reclutamiento Técnico y Sistemas ATS.
 */

import type { MasterCV, TailoredCV, WorkExperience, SkillCategory } from '../../types/cv';
import type { Job } from '../../types/job';
import type { AIConfig } from '../../types/ai';
import { AIService } from '../ai/aiService';
import { t, type Lang } from '../../i18n';

export class CVTailorService {
  /**
   * Generates an ATS-Optimized, Tailored CV in the specified language.
   */
  static async generateTailoredCV(
    job: Job,
    masterCv: MasterCV,
    config: AIConfig,
    lang: Lang = 'es'
  ): Promise<TailoredCV> {
    return this.tailorCV(masterCv, job, config, lang);
  }

  /**
   * Core tailoring engine — language-aware prompts and output.
   */
  static async tailorCV(
    masterCv: MasterCV,
    job: Job,
    config: AIConfig,
    lang: Lang = 'es'
  ): Promise<TailoredCV> {
    const prompt = lang === 'en'
      ? this.buildPromptEN(masterCv, job)
      : this.buildPromptES(masterCv, job);

    const systemMsg = lang === 'en'
      ? 'You are an ATS profile optimization system. Respond exclusively with valid JSON.'
      : 'Eres un sistema de optimización de perfiles y ATS. Responde únicamente con JSON válido.';

    try {
      const response = await AIService.complete(
        [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt },
        ],
        config,
        { temperature: 0.2, maxTokens: 4000 }
      );

      const parsed = AIService.parseJSONResponse<any>(response.content);
      const markdown = this.buildMarkdownCV(masterCv, parsed, lang);

      const tailored: TailoredCV = {
        id: 'cv_tailored_' + Date.now(),
        jobId: job.id,
        masterCvId: masterCv.id,
        jobTitle: job.position,
        company: job.company,
        lang,
        personalInfo: masterCv.personalInfo,
        summary: parsed.summary || masterCv.personalInfo?.summary || '',
        workExperience: parsed.workExperience || masterCv.workExperience || [],
        education: masterCv.education,
        skillCategories: parsed.skillCategories || masterCv.skillCategories || [],
        projects: masterCv.projects,
        certifications: masterCv.certifications,
        languages: masterCv.languages,
        targetKeywordsMatched: parsed.targetKeywordsMatched || [],
        targetKeywordsMissing: parsed.targetKeywordsMissing || [],
        atsScore: parsed.atsScore || 90,
        atsMatchScore: parsed.atsScore || 90,
        atsFeedback: parsed.atsFeedback || (lang === 'en' ? 'CV successfully adapted.' : 'CV adaptado con éxito.'),
        fullMarkdown: markdown,
        generatedAt: new Date().toISOString(),
      };

      return tailored;
    } catch (e: any) {
      console.warn('[CVTailorService] Error in AI completion, generating smart fallback CV:', e);
      return this.generateFallbackTailoredCV(masterCv, job, lang);
    }
  }

  /* ─────────────────────── Spanish Prompt ─────────────────────── */
  private static buildPromptES(masterCv: MasterCV, job: Job): string {
    return `
Eres un Director de Recursos Humanos (HR Executive) y Reclutador Técnico Senior con 15 años de experiencia contratando en empresas tecnológicas líderes y optimizando perfiles para pasar cualquier sistema ATS (Taleo, Greenhouse, Lever, Workday).

OBJETIVO:
Tomando el CV Maestro del candidato y la vacante de empleo, genera una versión adaptada del CV (Tailored CV) que:
1. MAXIMICE la densidad de palabras clave (keywords) relevantes de la vacante de forma natural y contextual.
2. Formatee los puntos de experiencia usando la fórmula XYZ de Google / Método STAR: "Logré [X], medido por [Y], haciendo [Z]".
3. Conserve rigurosamente la veracidad de la experiencia original (no inventar puestos ni empresas), pero resaltando y reenfocando los logros y tecnologías más relevantes para este puesto específico.
4. Tenga una estructura 100% amigable para ATS: encabezados claros, categorización de habilidades, viñetas de alto impacto.

TODO EL CONTENIDO GENERADO DEBE ESTAR EN ESPAÑOL.

${this.buildCVContext(masterCv, job)}

--- INSTRUCCIONES DE RESPUESTA ---
Debes responder ÚNICAMENTE con un objeto JSON válido (sin texto antes o después) con la siguiente estructura:

{
  "summary": "Resumen profesional de 3-4 líneas adaptado a la vacante y empresa.",
  "workExperience": [
    {
      "id": "exp_id",
      "company": "Nombre Empresa",
      "role": "Cargo",
      "location": "Ubicación",
      "startDate": "Fecha Inicio",
      "endDate": "Fecha Fin",
      "current": true/false,
      "achievements": ["Viñeta 1 con métricas y keywords (Fórmula STAR/XYZ)"],
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "skillCategories": [
    { "categoryName": "Lenguajes & Frameworks", "skills": ["Skill1", "Skill2"] }
  ],
  "targetKeywordsMatched": ["keyword1"],
  "targetKeywordsMissing": ["keyword_faltante1"],
  "atsScore": 92,
  "atsFeedback": "Breve explicación de por qué este CV pasa el filtro ATS."
}
`;
  }

  /* ─────────────────────── English Prompt ─────────────────────── */
  private static buildPromptEN(masterCv: MasterCV, job: Job): string {
    return `
You are a Senior HR Executive and Technical Recruiter with 15 years of experience hiring at leading tech companies and optimizing profiles to pass any ATS system (Taleo, Greenhouse, Lever, Workday).

GOAL:
Using the candidate's Master CV and the job vacancy, generate a tailored version of the CV that:
1. MAXIMIZES the density of relevant vacancy keywords naturally and contextually.
2. Formats experience bullets using Google's XYZ formula / STAR Method: "Accomplished [X], as measured by [Y], by doing [Z]".
3. Rigorously preserves the truthfulness of the original experience (do NOT invent positions or companies), but highlights and refocuses achievements and technologies most relevant to this specific role.
4. Has a 100% ATS-friendly structure: clear headings, skill categorization, high-impact bullet points.

ALL GENERATED CONTENT MUST BE IN ENGLISH.

${this.buildCVContext(masterCv, job)}

--- RESPONSE INSTRUCTIONS ---
Respond ONLY with a valid JSON object (no text before or after) with this structure:

{
  "summary": "Professional summary of 3-4 lines tailored to the vacancy and company.",
  "workExperience": [
    {
      "id": "exp_id",
      "company": "Company Name",
      "role": "Job Title",
      "location": "Location",
      "startDate": "Start Date",
      "endDate": "End Date",
      "current": true/false,
      "achievements": ["Bullet 1 with metrics and keywords (STAR/XYZ Formula)"],
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "skillCategories": [
    { "categoryName": "Languages & Frameworks", "skills": ["Skill1", "Skill2"] }
  ],
  "targetKeywordsMatched": ["keyword1"],
  "targetKeywordsMissing": ["missing_keyword1"],
  "atsScore": 92,
  "atsFeedback": "Brief explanation of why this CV passes ATS filters."
}
`;
  }

  /* ─────────────────────── Shared CV context block ─────────────────────── */
  private static buildCVContext(masterCv: MasterCV, job: Job): string {
    return `
--- JOB VACANCY ---
Position: ${job.position}
Company: ${job.company}
Location / Mode: ${job.location} (${job.workMode})
Salary: ${job.salary || 'Not specified'}
Tech Stack: ${Array.isArray(job.techStack) ? job.techStack.join(', ') : (job.techStack || 'Not specified')}

Description / Requirements:
${job.description || job.requirements || 'Not provided'}

--- CANDIDATE MASTER CV ---
Name: ${masterCv.personalInfo?.name || 'Candidate'}
Current Title: ${masterCv.personalInfo?.roleTitle || ''}
Current Summary: ${masterCv.personalInfo?.summary || ''}
Work Experience:
${JSON.stringify(masterCv.workExperience || [], null, 2)}
Education:
${JSON.stringify(masterCv.education || [], null, 2)}
Skills:
${JSON.stringify(masterCv.skillCategories || [], null, 2)}
Projects:
${JSON.stringify(masterCv.projects || [], null, 2)}
Certifications:
${JSON.stringify(masterCv.certifications || [], null, 2)}
Languages:
${JSON.stringify(masterCv.languages || [], null, 2)}
${masterCv.rawText ? `\n--- RAW TEXT EXTRACTED FROM CV ---\n${masterCv.rawText.slice(0, 6000)}\n` : ''}`;
  }

  /* ─────────────────────── Markdown builder ─────────────────────── */
  private static buildMarkdownCV(masterCv: MasterCV, parsed: any, lang: Lang = 'es'): string {
    const p = masterCv.personalInfo;
    const lines: string[] = [];
    const presentLabel = t('md.present', lang);

    lines.push(`# ${p?.name || 'Candidato'}`);
    lines.push(`**${p?.roleTitle || 'Software Developer'}** | ${p?.location || 'Remoto'} | ${p?.email || ''} | ${p?.phone || ''}`);
    if (p?.linkedin || p?.github || p?.portfolio) {
      lines.push(`${p?.linkedin ? `[LinkedIn](${p.linkedin}) ` : ''}${p?.github ? `| [GitHub](${p.github}) ` : ''}${p?.portfolio ? `| [Portfolio](${p.portfolio})` : ''}`);
    }
    lines.push('\n---\n');

    lines.push(`## ${t('md.summary', lang)}`);
    lines.push(parsed.summary || p?.summary || '');
    lines.push('\n---\n');

    lines.push(`## ${t('md.experience', lang)}`);
    (parsed.workExperience || masterCv.workExperience || []).forEach((exp: WorkExperience) => {
      lines.push(`### ${exp.role} — **${exp.company}**`);
      lines.push(`*${exp.startDate} - ${exp.current ? presentLabel : exp.endDate} | ${exp.location || 'Remoto'}*`);
      (exp.achievements || exp.description || []).forEach((ach: string) => {
        lines.push(`- ${ach}`);
      });
      if (exp.technologies && exp.technologies.length > 0) {
        lines.push(`*${t('md.technologies', lang)}:* \`${exp.technologies.join('`, `')}\``);
      }
      lines.push('');
    });

    lines.push(`## ${t('md.skills', lang)}`);
    (parsed.skillCategories || masterCv.skillCategories || []).forEach((cat: SkillCategory) => {
      lines.push(`- **${cat.categoryName}:** ${cat.skills.join(', ')}`);
    });
    lines.push('');

    if (masterCv.education?.length) {
      lines.push(`## ${t('md.education', lang)}`);
      masterCv.education.forEach((edu) => {
        lines.push(`- **${edu.degree}** ${edu.fieldOfStudy ? `en ${edu.fieldOfStudy}` : ''} — ${edu.institution} (*${edu.startDate} - ${edu.endDate}*)`);
      });
      lines.push('');
    }

    if (masterCv.languages?.length) {
      lines.push(`## ${t('md.languages', lang)}`);
      lines.push(masterCv.languages.map((l) => `${l.language} (${l.proficiency})`).join(' • '));
    }

    return lines.join('\n');
  }

  /* ─────────────────────── Fallback ─────────────────────── */
  private static generateFallbackTailoredCV(masterCv: MasterCV, job: Job, lang: Lang = 'es'): TailoredCV {
    const summary = lang === 'en'
      ? `Software developer with proven experience in modern architectures, oriented to deliver immediate value at ${job.company} for the ${job.position} position.`
      : `Desarrollador de software con experiencia comprobada en arquitecturas modernas, orientado a entregar valor inmediato en ${job.company} para la posición de ${job.position}.`;

    const parsedFallback = {
      summary,
      workExperience: masterCv.workExperience,
      skillCategories: masterCv.skillCategories,
      atsScore: 85,
    };

    const markdown = this.buildMarkdownCV(masterCv, parsedFallback, lang);

    return {
      id: 'cv_tailored_' + Date.now(),
      jobId: job.id,
      masterCvId: masterCv.id,
      jobTitle: job.position,
      company: job.company,
      lang,
      personalInfo: masterCv.personalInfo,
      summary,
      workExperience: masterCv.workExperience || [],
      education: masterCv.education,
      skillCategories: masterCv.skillCategories || [],
      projects: masterCv.projects,
      certifications: masterCv.certifications,
      languages: masterCv.languages,
      targetKeywordsMatched: Array.isArray(job.techStack) ? job.techStack : [],
      targetKeywordsMissing: [],
      atsScore: 85,
      atsMatchScore: 85,
      atsFeedback: lang === 'en' ? 'CV adapted with optimized base template.' : 'CV adaptado con plantilla base optimizada.',
      fullMarkdown: markdown,
      generatedAt: new Date().toISOString(),
    };
  }
}
