/**
 * ATS (Applicant Tracking System) Evaluation & Scoring Service
 * Validates keyword density, formatting compliance, metric quantification, and action verbs.
 */

import type { ATSAnalysisResult, ATSRuleCheck } from '../../types/ats';
import type { MasterCV, TailoredCV } from '../../types/cv';
import type { Job } from '../../types/job';

const POWER_ACTION_VERBS = [
  'lideré', 'desarrollé', 'implementé', 'optimicé', 'reduje', 'arquitecté',
  'diseñé', 'coordiné', 'escalé', 'incrementé', 'automatizé', 'gestioné',
  'transformé', 'migré', 'construí', 'desplegué', 'supervisé', 'resolví',
  'led', 'developed', 'implemented', 'optimized', 'reduced', 'architected',
  'designed', 'scaled', 'increased', 'automated', 'engineered', 'deployed'
];

export class ATSService {
  /**
   * Analyze a CV (Master or Tailored) against a target job description
   */
  static analyze(cv: MasterCV | TailoredCV, job: Job): ATSAnalysisResult {
    const jobText = `${job.position} ${job.company} ${job.description} ${job.requirements || ''} ${Array.isArray(job.techStack) ? job.techStack.join(' ') : (job.techStack || '')}`.toLowerCase();
    
    // Extract words from CV
    const cvText = this.serializeCVToText(cv).toLowerCase();

    // 1. Keyword Extraction & Matching
    const targetKeywords = this.extractKeyTokens(jobText);
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    targetKeywords.forEach(kw => {
      if (cvText.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const keywordRatio = targetKeywords.length > 0 ? (matchedKeywords.length / targetKeywords.length) : 0.8;
    const keywordMatchScore = Math.min(100, Math.round(keywordRatio * 100));

    // 2. Action Verbs Evaluation
    const actionVerbsFound: string[] = [];
    POWER_ACTION_VERBS.forEach(verb => {
      if (cvText.includes(verb)) {
        actionVerbsFound.push(verb);
      }
    });

    // 3. Metric Quantification Check (numbers, percentages, metrics)
    const metricsRegex = /\d+[\.,]?\d*|\b\d+%\b|\$\d+/g;
    const metricsMatches = cvText.match(metricsRegex) || [];
    const hasSufficientMetrics = metricsMatches.length >= 3;

    // 4. Rule Checks
    const ruleChecks: ATSRuleCheck[] = [
      {
        id: 'contact_info',
        category: 'format',
        rule: 'Datos de Contacto Claros (Email, Teléfono, Ubicación)',
        passed: Boolean(cv.personalInfo?.email && (cv.personalInfo?.phone || cv.personalInfo?.location)),
        score: 10,
        tip: 'Los ATS necesitan identificar tu correo y ubicación para categorizarte.'
      },
      {
        id: 'standard_sections',
        category: 'format',
        rule: 'Encabezados Estándar Reconocibles por ATS',
        passed: Boolean(cv.workExperience?.length && cv.education?.length && cv.skillCategories?.length),
        score: 15,
        tip: 'Usa encabezados canónicos como Experiencia Laboral, Educación y Habilidades.'
      },
      {
        id: 'quantified_achievements',
        category: 'impact',
        rule: 'Logros Cuantificados con Métricas (%, $, Números)',
        passed: hasSufficientMetrics,
        score: 20,
        tip: 'Incluye números o porcentajes en tus viñetas (ej: "reduje tiempos en un 35%").'
      },
      {
        id: 'action_verbs_density',
        category: 'impact',
        rule: 'Uso de Verbos de Acción Fuertes',
        passed: actionVerbsFound.length >= 4,
        score: 15,
        tip: 'Inicia cada viñeta con verbos como Lideré, Implementé, Arquitecté, Optimizé.'
      },
      {
        id: 'keyword_coverage',
        category: 'keywords',
        rule: 'Densidad y Coincidencia de Palabras Clave (> 70%)',
        passed: keywordMatchScore >= 70,
        score: 25,
        tip: 'Alinea los términos técnicos exactos pedidos en la oferta de empleo.'
      },
      {
        id: 'skills_categorization',
        category: 'content',
        rule: 'Habilidades Técnicas Agrupadas por Categoría',
        passed: Boolean(cv.skillCategories && cv.skillCategories.length >= 2),
        score: 15,
        tip: 'Agrupa tus skills en categorías (Frontend, Backend, Cloud/DevOps).'
      }
    ];

    // Compute composite scores
    const formatScore = Math.round(
      ((ruleChecks.find(r => r.id === 'contact_info')?.passed ? 10 : 0) +
       (ruleChecks.find(r => r.id === 'standard_sections')?.passed ? 15 : 0)) / 25 * 100
    );

    const experienceImpactScore = Math.round(
      ((ruleChecks.find(r => r.id === 'quantified_achievements')?.passed ? 20 : 0) +
       (ruleChecks.find(r => r.id === 'action_verbs_density')?.passed ? 15 : 0)) / 35 * 100
    );

    const skillsScore = ruleChecks.find(r => r.id === 'skills_categorization')?.passed ? 95 : 60;

    // Weighted Overall Score
    const overallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          keywordMatchScore * 0.40 +
          experienceImpactScore * 0.25 +
          formatScore * 0.20 +
          skillsScore * 0.15
        )
      )
    );

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (overallScore >= 92) grade = 'A+';
    else if (overallScore >= 80) grade = 'A';
    else if (overallScore >= 68) grade = 'B';
    else if (overallScore >= 50) grade = 'C';

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (keywordMatchScore >= 75) strengths.push('Excelente coincidencia de palabras clave con la vacante.');
    else improvements.push(`Incorporar palabras clave clave faltantes: ${missingKeywords.slice(0, 5).join(', ')}.`);

    if (actionVerbsFound.length >= 4) strengths.push('Gran uso de verbos de acción orientados a resultados.');
    else improvements.push('Comenzar viñetas con verbos más contundentes (Lideré, Desarrollé, Optimizé).');

    if (hasSufficientMetrics) strengths.push('Presencia sólida de métricas cuantificables de impacto.');
    else improvements.push('Agregar métricas numéricas concretas (%, usuarios, tiempos reducidos) en la experiencia.');

    return {
      overallScore,
      grade,
      keywordMatchScore,
      formatScore,
      experienceImpactScore,
      skillsScore,
      matchedKeywords: matchedKeywords.slice(0, 15),
      missingKeywords: missingKeywords.slice(0, 10),
      ruleChecks,
      actionVerbsFound: Array.from(new Set(actionVerbsFound)).slice(0, 10),
      actionVerbsSuggested: POWER_ACTION_VERBS.slice(0, 8),
      strengths,
      improvements,
      recruiterSummary: `Este perfil alcanza un Score ATS de ${overallScore}/100 (Grado ${grade}). Con ${matchedKeywords.length} palabras clave coincidentes y formato estructurado, tiene alta probabilidad de superar el filtro automatizado.`
    };
  }

  private static serializeCVToText(cv: MasterCV | TailoredCV): string {
    const parts: string[] = [
      cv.personalInfo?.name || '',
      cv.personalInfo?.roleTitle || '',
      cv.personalInfo?.summary || '',
      (cv as any).summary || '',
    ];

    (cv.workExperience || []).forEach(exp => {
      parts.push(exp.role, exp.company, (exp.achievements || exp.description || []).join(' '), (exp.technologies || []).join(' '));
    });

    (cv.skillCategories || []).forEach(cat => {
      parts.push(cat.categoryName, (cat.skills || []).join(' '));
    });

    (cv.projects || []).forEach(p => {
      parts.push(p.name, p.description, (p.technologies || []).join(' '));
    });

    if ((cv as MasterCV).rawText) {
      parts.push((cv as MasterCV).rawText || '');
    }

    return parts.join(' ');
  }

  private static extractKeyTokens(text: string): string[] {
    const stopwords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'a', 'ante', 'con', 'en', 'para', 'por', 'que', 'se', 'su', 'sus', 'al', 'es', 'son', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'sea', 'sin', 'sobre', 'este', 'esta', 'estos', 'estas', 'the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we', 'will', 'home', 'can', 'us', 'about', 'if', 'page', 'my', 'has', 'search', 'free', 'but', 'our', 'one', 'other', 'do', 'no', 'information', 'time', 'they', 'site', 'he', 'up', 'may', 'what', 'which', 'their'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\sáéíóúñ#+\.]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w));

    const freq: Record<string, number> = {};
    words.forEach(w => {
      freq[w] = (freq[w] || 0) + 1;
    });

    return Object.keys(freq)
      .sort((a, b) => freq[b] - freq[a])
      .slice(0, 20);
  }
}
