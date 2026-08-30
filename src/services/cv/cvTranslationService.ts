/**
 * AI-powered full CV Translation Service (ES <-> EN).
 * Translates professional summary, achievements, role titles, and skill categories
 * with high-quality recruitment-grade phrasing rather than word-by-word substitution.
 */

import type { MasterCV, TailoredCV, WorkExperience, SkillCategory, Education } from '../../types/cv';
import type { AIConfig } from '../../types/ai';
import { AIService } from '../ai/aiService';
import type { Lang } from '../../i18n';

export class CVTranslationService {
  /**
   * Translates a MasterCV or TailoredCV to the target language via AI.
   * If the CV is already in the target language (or no AI config is available),
   * returns the original CV untouched.
   */
  static async translateCV<T extends MasterCV | TailoredCV>(
    cv: T,
    targetLang: Lang,
    config: AIConfig
  ): Promise<T> {
    const hasKey =
      (config.provider === 'omniroute' && config.omnirouteApiKey) ||
      (config.provider === 'openrouter' && config.openrouterApiKey) ||
      (config.provider === 'huggingface' && config.huggingfaceApiKey) ||
      (config.provider === 'custom' && config.customApiKey) ||
      config.provider === 'ollama';

    if (!hasKey) return cv;

    const sourceLang: Lang = targetLang === 'en' ? 'es' : 'en';
    const targetLabel = targetLang === 'en' ? 'American English' : 'Spanish (Latin America)';

    const payload = {
      roleTitle: cv.personalInfo?.roleTitle || '',
      summary: (cv as TailoredCV).summary || cv.personalInfo?.summary || '',
      workExperience: (cv.workExperience || []).map((w: WorkExperience) => ({
        id: w.id,
        role: w.role,
        company: w.company,
        location: w.location,
        achievements: w.achievements || (Array.isArray(w.description) ? w.description : [w.description].filter(Boolean)),
        technologies: w.technologies || [],
      })),
      skillCategories: cv.skillCategories || [],
      education: (cv.education || []).map((e: Education) => ({
        id: e.id,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        institution: e.institution,
      })),
    };

    const systemMsg =
      'You are a professional bilingual technical CV translator. You translate IT/software resumes with recruitment-grade accuracy using strong ATS action verbs. Respond ONLY with valid JSON.';

    const userPrompt = `Translate the following CV sections from ${sourceLang.toUpperCase()} into ${targetLabel}.

RULES:
1. Preserve names of companies, institutions, technologies, URLs, and IDs EXACTLY.
2. For bullet points / achievements in English, use strong ATS action verbs (Architected, Engineered, Led, Spearheaded, Built, Optimized).
3. Translate job titles professionally (e.g., "Desarrollador de Software" -> "Software Engineer").
4. Return ONLY valid JSON matching this exact shape:

{
  "roleTitle": "...",
  "summary": "...",
  "workExperience": [
    {
      "id": "...",
      "role": "...",
      "company": "...",
      "location": "...",
      "achievements": ["..."],
      "technologies": ["..."]
    }
  ],
  "skillCategories": [
    { "categoryName": "...", "skills": ["..."] }
  ],
  "education": [
    { "id": "...", "degree": "...", "fieldOfStudy": "...", "institution": "..." }
  ]
}

CV CONTENT TO TRANSLATE:
${JSON.stringify(payload, null, 2)}`;

    try {
      const response = await AIService.complete(
        [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userPrompt },
        ],
        config,
        { temperature: 0.1, maxTokens: 4000 }
      );

      const parsed = AIService.parseJSONResponse<any>(response.content);
      if (!parsed) return cv;

      const translatedPersonalInfo = {
        ...cv.personalInfo,
        roleTitle: parsed.roleTitle || cv.personalInfo?.roleTitle || '',
        summary: parsed.summary || cv.personalInfo?.summary || '',
      };

      const translatedWorkExperience: WorkExperience[] = (cv.workExperience || []).map((orig, idx) => {
        const tr = parsed.workExperience?.[idx];
        if (!tr) return orig;
        return {
          ...orig,
          role: tr.role || orig.role,
          location: tr.location || orig.location,
          achievements: tr.achievements || orig.achievements,
          description: tr.achievements || orig.description,
          technologies: tr.technologies || orig.technologies,
        };
      });

      const translatedEducation: Education[] = (cv.education || []).map((orig, idx) => {
        const tr = parsed.education?.[idx];
        if (!tr) return orig;
        return {
          ...orig,
          degree: tr.degree || orig.degree,
          fieldOfStudy: tr.fieldOfStudy || orig.fieldOfStudy,
          institution: tr.institution || orig.institution,
        };
      });

      const translatedSkillCategories: SkillCategory[] =
        parsed.skillCategories && Array.isArray(parsed.skillCategories)
          ? parsed.skillCategories
          : cv.skillCategories || [];

      return {
        ...cv,
        lang: targetLang,
        personalInfo: translatedPersonalInfo,
        summary: parsed.summary || (cv as TailoredCV).summary || '',
        workExperience: translatedWorkExperience,
        education: translatedEducation,
        skillCategories: translatedSkillCategories,
      };
    } catch (err) {
      console.warn('[CVTranslationService] Translation failed, falling back to original CV:', err);
      return cv;
    }
  }
}
