/**
 * AI-Powered CV Adaptation and ATS Keyword Optimization Service
 * Actúa como un experto en Recursos Humanos, Reclutamiento Técnico y Sistemas ATS.
 */

import type { MasterCV, TailoredCV, WorkExperience, SkillCategory } from '../../types/cv';
import type { Job } from '../../types/job';
import type { AIConfig } from '../../types/ai';
import { AIService } from '../ai/aiService';

export class CVTailorService {
  /**
   * Generates an ATS-Optimized, Tailored CV based on a Job Vacancy and a Master CV
   */
  static async generateTailoredCV(
    job: Job,
    masterCv: MasterCV,
    config: AIConfig
  ): Promise<TailoredCV> {
    return this.tailorCV(masterCv, job, config);
  }

  /**
   * Generates an ATS-Optimized, Tailored CV based on a Master CV and a Job Vacancy
   */
  static async tailorCV(
    masterCv: MasterCV,
    job: Job,
    config: AIConfig
  ): Promise<TailoredCV> {
    const prompt = `
Eres un Director de Recursos Humanos (HR Executive) y Reclutador Técnico Senior con 15 años de experiencia contratando en empresas tecnológicas líderes y optimizando perfiles para pasar cualquier sistema ATS (Taleo, Greenhouse, Lever, Workday).

OBJETIVO:
Tomando el CV Maestro del candidato y la vacante de empleo, genera una versión adaptada del CV (Tailored CV) que:
1. MAXIMICE la densidad de palabras clave (keywords) relevantes de la vacante de forma natural y contextual.
2. Formatee los puntos de experiencia usando la fórmula XYZ de Google / Método STAR: "Logré [X], medido por [Y], haciendo [Z]".
3. Conserve rigurosamente la veracidad de la experiencia original (no inventar puestos ni empresas), pero resaltando y reenfocando los logros y tecnologías más relevantes para este puesto específico.
4. Tenga una estructura 100% amigable para ATS: encabezados claros, categorización de habilidades, viñetas de alto impacto.

--- VACANTE DE EMPLEO ---
Puesto: ${job.position}
Empresa: ${job.company}
Ubicación / Modalidad: ${job.location} (${job.workMode})
Salario: ${job.salary || 'No especificado'}
Stack Técnico detectado: ${Array.isArray(job.techStack) ? job.techStack.join(', ') : (job.techStack || 'No especificado')}

Descripción / Requisitos de la Vacante:
${job.description || job.requirements || 'No provista'}

--- CV MAESTRO DEL CANDIDATO ---
Nombre: ${masterCv.personalInfo?.name || 'Candidato'}
Título Actual: ${masterCv.personalInfo?.roleTitle || ''}
Resumen Actual: ${masterCv.personalInfo?.summary || ''}
Experiencia Laboral:
${JSON.stringify(masterCv.workExperience || [], null, 2)}
Educación:
${JSON.stringify(masterCv.education || [], null, 2)}
Habilidades:
${JSON.stringify(masterCv.skillCategories || [], null, 2)}
Proyectos:
${JSON.stringify(masterCv.projects || [], null, 2)}
Certificaciones:
${JSON.stringify(masterCv.certifications || [], null, 2)}
Idiomas:
${JSON.stringify(masterCv.languages || [], null, 2)}
${masterCv.rawText ? `\n--- TEXTO ORIGINAL EXTRAÍDO DEL CV DEL CANDIDATO ---\n${masterCv.rawText.slice(0, 6000)}\n` : ''}

--- INSTRUCCIONES DE RESPUESTA ---
Debes responder ÚNICAMENTE con un objeto JSON válido (sin texto antes o después) con la siguiente estructura:

{
  "summary": "Resumen profesional de 3-4 líneas adaptado a la vacante y empresa, destacando años de experiencia, fortalezas clave y alineación con la misión.",
  "workExperience": [
    {
      "id": "exp_id",
      "company": "Nombre Empresa",
      "role": "Cargo (alineado si aplica)",
      "location": "Ubicación",
      "startDate": "Fecha Inicio",
      "endDate": "Fecha Fin",
      "current": true/false,
      "achievements": [
        "Viñeta 1 con métricas y keywords (Fórmula STAR/XYZ)",
        "Viñeta 2 con tecnologías relevantes"
      ],
      "technologies": ["Tech1", "Tech2", "Tech3"]
    }
  ],
  "skillCategories": [
    {
      "categoryName": "Lenguajes & Frameworks",
      "skills": ["Skill1", "Skill2"]
    }
  ],
  "targetKeywordsMatched": ["keyword1", "keyword2", "keyword3"],
  "targetKeywordsMissing": ["keyword_faltante1"],
  "atsScore": 92,
  "atsFeedback": "Breve explicación de por qué este CV pasa el filtro ATS."
}
`;

    try {
      const response = await AIService.complete(
        [
          {
            role: 'system',
            content: 'Eres un sistema de optimización de perfiles y ATS. Responde únicamente con JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        config,
        { temperature: 0.2, maxTokens: 4000 }
      );

      const parsed = AIService.parseJSONResponse<any>(response.content);

      // Reconstruct clean markdown representation
      const markdown = this.buildMarkdownCV(masterCv, parsed);

      const tailored: TailoredCV = {
        id: 'cv_tailored_' + Date.now(),
        jobId: job.id,
        masterCvId: masterCv.id,
        jobTitle: job.position,
        company: job.company,
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
        atsFeedback: parsed.atsFeedback || 'CV adaptado con éxito.',
        fullMarkdown: markdown,
        generatedAt: new Date().toISOString(),
      };

      return tailored;
    } catch (e: any) {
      console.warn('[CVTailorService] Error in AI completion, generating smart fallback CV:', e);
      return this.generateFallbackTailoredCV(masterCv, job);
    }
  }

  private static buildMarkdownCV(masterCv: MasterCV, parsed: any): string {
    const p = masterCv.personalInfo;
    const lines: string[] = [];

    lines.push(`# ${p?.name || 'Candidato'}`);
    lines.push(`**${p?.roleTitle || 'Software Developer'}** | ${p?.location || 'Remoto'} | ${p?.email || ''} | ${p?.phone || ''}`);
    if (p?.linkedin || p?.github || p?.portfolio) {
      lines.push(`${p?.linkedin ? `[LinkedIn](${p.linkedin}) ` : ''}${p?.github ? `| [GitHub](${p.github}) ` : ''}${p?.portfolio ? `| [Portfolio](${p.portfolio})` : ''}`);
    }
    lines.push('\n---\n');

    lines.push('## Resumen Profesional');
    lines.push(parsed.summary || p?.summary || '');
    lines.push('\n---\n');

    lines.push('## Experiencia Laboral');
    (parsed.workExperience || masterCv.workExperience || []).forEach((exp: WorkExperience) => {
      lines.push(`### ${exp.role} — **${exp.company}**`);
      lines.push(`*${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate} | ${exp.location || 'Remoto'}*`);
      (exp.achievements || exp.description || []).forEach((ach: string) => {
        lines.push(`- ${ach}`);
      });
      if (exp.technologies && exp.technologies.length > 0) {
        lines.push(`*Tecnologías:* \`${exp.technologies.join('`, `')}\``);
      }
      lines.push('');
    });

    lines.push('## Habilidades Técnicas');
    (parsed.skillCategories || masterCv.skillCategories || []).forEach((cat: SkillCategory) => {
      lines.push(`- **${cat.categoryName}:** ${cat.skills.join(', ')}`);
    });
    lines.push('');

    if (masterCv.education?.length) {
      lines.push('## Educación');
      masterCv.education.forEach((edu) => {
        lines.push(`- **${edu.degree}** ${edu.fieldOfStudy ? `en ${edu.fieldOfStudy}` : ''} — ${edu.institution} (*${edu.startDate} - ${edu.endDate}*)`);
      });
      lines.push('');
    }

    if (masterCv.languages?.length) {
      lines.push('## Idiomas');
      lines.push(masterCv.languages.map((l) => `${l.language} (${l.proficiency})`).join(' • '));
    }

    return lines.join('\n');
  }

  private static generateFallbackTailoredCV(masterCv: MasterCV, job: Job): TailoredCV {
    const summary = `Desarrollador de software con experiencia comprobada en arquitecturas modernas, orientado a entregar valor inmediato en ${job.company} para la posición de ${job.position}.`;

    const parsedFallback = {
      summary,
      workExperience: masterCv.workExperience,
      skillCategories: masterCv.skillCategories,
      atsScore: 85,
    };

    const markdown = this.buildMarkdownCV(masterCv, parsedFallback);

    return {
      id: 'cv_tailored_' + Date.now(),
      jobId: job.id,
      masterCvId: masterCv.id,
      jobTitle: job.position,
      company: job.company,
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
      atsFeedback: 'CV adaptado con plantilla base optimizada.',
      fullMarkdown: markdown,
      generatedAt: new Date().toISOString(),
    };
  }
}
