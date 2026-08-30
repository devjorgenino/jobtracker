/**
 * CV Parser & Text Extraction Service
 * Extracts raw text from PDF, TXT, Markdown, and JSON files, and parses it into a structured MasterCV object.
 * Supports intelligent spatial sorting for PDFs and heuristic + AI structuring.
 */

import * as pdfjsLib from 'pdfjs-dist';
import type {
  MasterCV,
  PersonalInfo,
  WorkExperience,
  Education,
  SkillCategory,
  Language,
} from '../../types/cv';
import type { AIConfig } from '../../types/ai';
import { AIService } from '../ai/aiService';

// Ensure PDF.js worker is configured
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set PDF workerSrc from unpkg, will fallback to inline worker if available.', e);
  }
}

export class CVParserService {
  /**
   * Main file extractor method for any supported format
   */
  static async extractTextFromFile(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      return this.extractTextFromPDF(file);
    } else if (fileName.endsWith('.json')) {
      return this.extractTextFromJSON(file);
    } else {
      return this.extractTextFromPlainText(file);
    }
  }

  /**
   * PDF Text Extractor with 2D spatial sorting (preserves line by line reading order)
   */
  static async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
        disableFontFace: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Extract positioned text items safely
        const rawItems = textContent.items as Array<Record<string, unknown>>;
        const items: Array<{ str: string; x: number; y: number }> = [];

        for (const item of rawItems) {
          if (typeof item.str === 'string' && Array.isArray(item.transform) && item.transform.length >= 6) {
            items.push({
              str: item.str,
              x: Number(item.transform[4]) || 0,
              y: Number(item.transform[5]) || 0,
            });
          }
        }

        // Group items on roughly the same horizontal line (within 3 points Y)
        items.sort((a, b) => {
          const yDiff = b.y - a.y;
          if (Math.abs(yDiff) > 3) {
            return yDiff;
          }
          return a.x - b.x;
        });

        let lastY: number | null = null;
        let pageText = '';

        for (const item of items) {
          if (!item.str.trim()) continue;
          if (lastY !== null && Math.abs(lastY - item.y) > 3) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.y;
        }

        fullText += pageText + '\n\n';
      }

      return fullText.trim();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Error in PDF text extraction:', err);
      throw new Error(`Error al leer el archivo PDF: ${msg}`);
    }
  }

  /**
   * Plain text & Markdown extractor
   */
  static async extractTextFromPlainText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo de texto.'));
      reader.readAsText(file);
    });
  }

  /**
   * JSON extractor
   */
  static async extractTextFromJSON(file: File): Promise<string> {
    const raw = await this.extractTextFromPlainText(file);
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  /**
   * Comprehensive Heuristic Parser that preserves all sections, roles, bullets, and skills
   */
  static parseHeuristic(rawText: string, fileName?: string): MasterCV {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const personalInfo = this.extractPersonalInfo(lines, rawText);
    const skillCategories = this.extractSkillCategories(lines);
    const workExperience = this.extractWorkExperiences(lines);
    const education = this.extractEducation(lines);
    const languages = this.extractLanguages(lines);

    // Clean up PDF-introduced spacing artifacts in personal info fields
    if (personalInfo.name) {
      personalInfo.name = personalInfo.name.replace(/\s+/g, ' ').trim();
    }
    if (personalInfo.roleTitle) {
      // Fix PDF-inserted spaces around hyphens and pipes: "Full - Stack" → "Full-Stack", "AI - Native" → "AI-Native"
      personalInfo.roleTitle = personalInfo.roleTitle
        .replace(/\s*-\s*/g, '-')
        .replace(/\s*\|\s*/g, ' | ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    if (personalInfo.phone) {
      // Normalize phone: "+58 412 - 350 - 6984" → "+58 412-350-6984"
      personalInfo.phone = personalInfo.phone
        .replace(/\s*-\s*/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return {
      id: `master_cv_${Date.now()}`,
      title: personalInfo.name ? `CV — ${personalInfo.name}` : (fileName || 'CV Maestro'),
      personalInfo,
      workExperience,
      education,
      skillCategories,
      projects: [],
      certifications: [],
      languages,
      rawText,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Extracts Personal Information, Contact Links and Location
   */
  private static extractPersonalInfo(lines: string[], rawText: string): PersonalInfo {
    const name = lines[0] || 'Jorge Niño';
    const roleTitle = lines[1] || 'Product Engineer | Full-Stack Developer';

    let email = '';
    let phone = '';
    let linkedin = '';
    let github = '';
    let portfolio = '';
    let location = '';
    let locationFound = false;

    // Determine where the header/contact block ends — stop at first section header
    const sectionHeaderRegex = /^(?:RESUMEN|PERFIL|HABILIDADES|EXPERIENCIA|EDUCACI[OÓ]N|FORMACI[OÓ]N|PROYECTOS|CERTIFICACIONES|IDIOMAS|SUMMARY|SKILLS|EXPERIENCE|EDUCATION|PROJECTS|LANGUAGES)\b/i;
    let headerEnd = Math.min(15, lines.length);
    for (let i = 0; i < headerEnd; i++) {
      if (sectionHeaderRegex.test(lines[i])) {
        headerEnd = i;
        break;
      }
    }

    // Search ONLY header lines for contact details (not summary/body text)
    for (let i = 0; i < headerEnd; i++) {
      const l = lines[i];

      const emailMatch = l.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !email) email = emailMatch[0];

      const phoneMatch = l.match(/(?:\+?\d{1,3}[\s-]*)?\(?\d{2,4}\)?[\s.-]*\d{3,4}[\s.-]*\d{3,5}/);
      if (phoneMatch && !phone) {
        phone = phoneMatch[0].replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
      }

      if (l.includes('linkedin.com')) {
        const match = l.match(/linkedin\.com\/in\/[\w-]+/);
        if (match) linkedin = 'https://' + match[0];
      }

      if (l.includes('github.com')) {
        const match = l.match(/github\.com\/[\w-]+/);
        if (match) github = 'https://' + match[0];
      }

      // Portfolio: match vercel.app/dev/io/me domains, but EXCLUDE email domains
      // and ensure we capture the full domain even with PDF-added spaces around hyphens
      if (l.includes('vercel.app') || l.includes('.dev') || l.includes('portfolio')) {
        // First try to match vercel.app domain specifically (highest priority)
        const vercelMatch = l.match(/(?:https?:\/\/)?[\w][\w.\s-]*\.vercel\.app/);
        if (vercelMatch && !portfolio) {
          // Clean up PDF-introduced spaces around hyphens in the domain
          const cleanDomain = vercelMatch[0].replace(/\s*-\s*/g, '-').replace(/\s+/g, '');
          portfolio = cleanDomain.startsWith('http') ? cleanDomain : 'https://' + cleanDomain;
        }

        // If no vercel.app match, try other TLDs but exclude email-derived domains
        if (!portfolio) {
          const otherMatch = l.match(/(?:https?:\/\/)?[\w.-]+\.(?:dev|io|me)(?:\/[\w-]*)?/);
          if (otherMatch) {
            const candidate = otherMatch[0];
            // Skip if this domain is the local part of an email (e.g. "jorgenino.dev" from "jorgenino.dev@gmail.com")
            const candidateEnd = (otherMatch.index || 0) + candidate.length;
            const charAfter = l[candidateEnd];
            if (charAfter === '@') {
              // This is part of an email address, skip it
            } else if (!candidate.includes('linkedin') && !candidate.includes('github')) {
              portfolio = candidate.startsWith('http') ? candidate : 'https://' + candidate;
            }
          }
        }
      }

      // Location: only set from header lines (not body text), and only set once
      if (!locationFound && (l.toLowerCase().includes('venezuela') || l.toLowerCase().includes('remoto') || l.toLowerCase().includes('latam'))) {
        const parts = l.split('|').map((p) => p.trim());
        const loc = parts.find((p) => p.toLowerCase().includes('venezuela') || p.toLowerCase().includes('remoto') || p.toLowerCase().includes('latam'));
        if (loc) {
          location = loc;
          locationFound = true;
          // Check if the next line continues the location (e.g. "(LATAM)" on its own line)
          if (i + 1 < headerEnd) {
            const nextLine = lines[i + 1].trim();
            if (/^\(.*\)$/.test(nextLine) && nextLine.length < 20) {
              location += ' ' + nextLine;
            }
          }
        }
      }
    }

    // Fallback location
    if (!location) location = 'Remoto — Venezuela (LATAM)';

    // Extract professional summary section
    const summary = this.extractSummary(lines, rawText);

    return {
      name,
      roleTitle,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      summary,
    };
  }

  /**
   * Extracts Professional Summary cleanly
   */
  private static extractSummary(lines: string[], _rawText: string): string {
    const sectionHeaders = this.getSectionIndices(lines);
    const summaryHeader = sectionHeaders.find((s) => s.key === 'summary');
    if (!summaryHeader) return '';

    const currentIdx = sectionHeaders.indexOf(summaryHeader);
    const nextHeader = sectionHeaders[currentIdx + 1];
    const start = summaryHeader.index + 1;
    const end = nextHeader ? nextHeader.index : Math.min(start + 8, lines.length);

    return lines.slice(start, end).join(' ').trim();
  }

  /**
   * Helper to locate main section boundaries
   */
  private static getSectionIndices(lines: string[]): Array<{ key: string; index: number; title: string }> {
    const patterns = [
      { key: 'summary', regex: /^(?:RESUMEN\s+PROFESIONAL|PERFIL\s+PROFESIONAL|ACERCA\s+DE|SUMMARY|PROFESSIONAL\s+SUMMARY|PROFILE)\s*$/i },
      { key: 'skills', regex: /^(?:HABILIDADES\s+T[EÉ]CNICAS|HABILIDADES|COMPETENCIAS|SKILLS|TECHNICAL\s+SKILLS)\s*$/i },
      { key: 'experience', regex: /^(?:EXPERIENCIA\s+PROFESIONAL|EXPERIENCIA\s+LABORAL|EXPERIENCIA|WORK\s+EXPERIENCE|EXPERIENCE)\s*$/i },
      { key: 'education', regex: /^(?:EDUCACI[OÓ]N|FORMACI[OÓ]N|ESTUDIOS|EDUCATION)\s*$/i },
      { key: 'projects', regex: /^(?:PROYECTOS|PROJECTS|PORTAFOLIO)\s*$/i },
      { key: 'certifications', regex: /^(?:CERTIFICACIONES|CERTIFICATES|CURSOS)\s*$/i },
      { key: 'languages', regex: /^(?:IDIOMAS|LANGUAGES)\s*$/i },
    ];

    const indices: Array<{ key: string; index: number; title: string }> = [];

    lines.forEach((line, idx) => {
      // Don't treat inline sub-tags like "Habilidades: React..." as a main section header
      if (line.includes(':') && line.length > 25) return;
      for (const p of patterns) {
        if (p.regex.test(line)) {
          indices.push({ key: p.key, index: idx, title: line });
          break;
        }
      }
    });

    return indices.sort((a, b) => a.index - b.index);
  }

  /**
   * Extracts Technical Skill Categories
   */
  private static extractSkillCategories(lines: string[]): SkillCategory[] {
    const sectionHeaders = this.getSectionIndices(lines);
    const skillsHeader = sectionHeaders.find((s) => s.key === 'skills');
    if (!skillsHeader) return [];

    const currentIdx = sectionHeaders.indexOf(skillsHeader);
    const nextHeader = sectionHeaders[currentIdx + 1];
    const start = skillsHeader.index + 1;
    const end = nextHeader ? nextHeader.index : lines.length;

    const skillLines = lines.slice(start, end);
    const categories: SkillCategory[] = [];
    let currentCategory: SkillCategory | null = null;

    for (const line of skillLines) {
      if (line.includes(':')) {
        const [catName, skillStr] = line.split(/:\s*/);
        const skills = (skillStr || '')
          .split(/[,·|•]\s*/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        currentCategory = { categoryName: catName.trim(), skills };
        categories.push(currentCategory);
      } else if (currentCategory) {
        const extraSkills = line
          .split(/[,·|•]\s*/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        currentCategory.skills.push(...extraSkills);
      }
    }

    return categories;
  }

  /**
   * Extracts all Work Experiences with bullet points and inline skills
   */
  private static extractWorkExperiences(lines: string[]): WorkExperience[] {
    const sectionHeaders = this.getSectionIndices(lines);
    const expHeader = sectionHeaders.find((s) => s.key === 'experience');
    if (!expHeader) return [];

    const currentIdx = sectionHeaders.indexOf(expHeader);
    const nextHeader = sectionHeaders[currentIdx + 1];
    const start = expHeader.index + 1;
    const end = nextHeader ? nextHeader.index : lines.length;

    const expLines = lines.slice(start, end);
    const experiences: WorkExperience[] = [];
    let currentExp: WorkExperience | null = null;

    const dateRegex = /(?:(?:Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+)?\d{4}\s*(?:—|-|–|\/)\s*(?:(?:Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+)?(?:\d{4}|Presente|Present|Actualidad)/i;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const dateMatch = line.match(dateRegex);

      if (dateMatch && (line.includes('—') || line.includes('|') || line.includes(' - ') || line.includes('–'))) {
        if (currentExp) experiences.push(currentExp);

        const datePart = dateMatch[0];
        const nonDatePart = line.replace(datePart, '').trim();

        let role = '';
        let company = '';
        const parts = nonDatePart.split(/\s*(?:—|–|\|)\s*/);
        if (parts.length >= 2) {
          role = parts[0].trim();
          company = parts[1].trim();
        } else {
          role = nonDatePart;
          company = 'Empresa';
        }

        const dateTokens = datePart.split(/\s*(?:—|-|–)\s*/);
        const startDate = dateTokens[0]?.trim() || '';
        const endDate = dateTokens[1]?.trim() || 'Presente';

        currentExp = {
          id: `exp_${experiences.length + 1}`,
          role,
          company,
          startDate,
          endDate,
          current: /presente|present|actual/i.test(endDate),
          achievements: [],
          technologies: [],
        };
        continue;
      }

      if (!currentExp) continue;

      if (/^(?:Habilidades|Tecnolog[ií]as|Tech stack|Stack):/i.test(line)) {
        const techStr = line.replace(/^(?:Habilidades|Tecnolog[ií]as|Tech stack|Stack):\s*/i, '');
        const techs = techStr
          .split(/[,·|•]\s*/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        currentExp.technologies = [...(currentExp.technologies || []), ...techs];
        continue;
      }

      if (line.startsWith('●') || line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const bullet = line.replace(/^[●•\-*]\s*/, '').trim();
        currentExp.achievements = [...(currentExp.achievements || []), bullet];
      } else if (currentExp.technologies && currentExp.technologies.length > 0 && (line.startsWith('·') || line.includes('·'))) {
        const extraTechs = line
          .split(/[,·|•]\s*/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        currentExp.technologies = [...(currentExp.technologies || []), ...extraTechs];
      } else {
        if (currentExp.achievements && currentExp.achievements.length > 0) {
          const lastIdx = currentExp.achievements.length - 1;
          currentExp.achievements[lastIdx] = currentExp.achievements[lastIdx] + ' ' + line;
        }
      }
    }

    if (currentExp) experiences.push(currentExp);
    return experiences;
  }

  /**
   * Extracts Education and Degrees
   */
  private static extractEducation(lines: string[]): Education[] {
    const sectionHeaders = this.getSectionIndices(lines);
    const eduHeader = sectionHeaders.find((s) => s.key === 'education');
    if (!eduHeader) return [];

    const currentIdx = sectionHeaders.indexOf(eduHeader);
    const nextHeader = sectionHeaders[currentIdx + 1];
    const start = eduHeader.index + 1;
    const end = nextHeader ? nextHeader.index : lines.length;

    const eduLines = lines.slice(start, end);
    const education: Education[] = [];

    for (const el of eduLines) {
      if (el.includes('—') || el.includes('·') || el.includes('|')) {
        const parts = el.split(/\s*(?:—|·|\|)\s*/);
        const institution = parts[0]?.trim() || '';
        let degree = parts[1]?.trim() || '';
        let rawDatePart = parts[2]?.trim() || '';

        let fieldOfStudy = '';
        if (rawDatePart.includes('(') || degree.includes('(')) {
          const descMatch = (rawDatePart + ' ' + degree).match(/\((.*?)\)/);
          if (descMatch) {
            fieldOfStudy = descMatch[1];
          }
        }

        rawDatePart = rawDatePart.replace(/\(.*?\)/g, '').trim();
        degree = degree.replace(/\(.*?\)/g, '').trim();

        let startDate = '';
        let endDate = '';
        if (rawDatePart) {
          const dTokens = rawDatePart.split(/\s*(?:–|-|—)\s*/);
          startDate = dTokens[0]?.trim() || '';
          endDate = dTokens[1]?.trim() || '';
        }

        education.push({
          id: `edu_${education.length + 1}`,
          institution,
          degree,
          fieldOfStudy,
          startDate,
          endDate,
          current: /presente|actual/i.test(endDate),
        });
      }
    }

    return education;
  }

  /**
   * Extracts Languages
   */
  private static extractLanguages(lines: string[]): Language[] {
    const sectionHeaders = this.getSectionIndices(lines);
    const langHeader = sectionHeaders.find((s) => s.key === 'languages');
    if (!langHeader) {
      return [
        { id: 'lang_1', language: 'Español', proficiency: 'Nativo' },
        { id: 'lang_2', language: 'Inglés', proficiency: 'Profesional / Técnico (B2/C1)' },
      ];
    }

    const currentIdx = sectionHeaders.indexOf(langHeader);
    const nextHeader = sectionHeaders[currentIdx + 1];
    const start = langHeader.index + 1;
    const end = nextHeader ? nextHeader.index : lines.length;

    const langLines = lines.slice(start, end);
    const languages: Language[] = [];

    for (const line of langLines) {
      if (line.includes(':') || line.includes('—') || line.includes('-')) {
        const [lang, prof] = line.split(/[:—\-]\s*/);
        if (lang) {
          languages.push({
            id: `lang_${languages.length + 1}`,
            language: lang.trim(),
            proficiency: (prof || 'Competencia profesional').trim(),
          });
        }
      }
    }

    return languages.length > 0
      ? languages
      : [
          { id: 'lang_1', language: 'Español', proficiency: 'Nativo' },
          { id: 'lang_2', language: 'Inglés', proficiency: 'Profesional / Técnico (B2/C1)' },
        ];
  }

  /**
   * Structured AI Parsing via OmniRoute / AIService
   */
  static async parseWithAI(
    rawText: string,
    aiConfig: AIConfig,
    fileName?: string
  ): Promise<MasterCV> {
    const systemPrompt = `Eres un experto extractor de currículums (CV/Resume) y especialista en optimización para sistemas ATS.
Tu objetivo es transformar el texto sin procesar de un currículum en un objeto JSON estructurado con fidelidad total y sin omitir ninguna sección, trabajo, métrica o habilidad.

Formato JSON esperado:
{
  "title": "Nombre del titular o Título del CV",
  "personalInfo": {
    "name": "Nombre completo",
    "roleTitle": "Titular profesional principal",
    "email": "email@example.com",
    "phone": "+58 ...",
    "location": "Ciudad, País o Remoto",
    "linkedin": "https://linkedin.com/in/...",
    "github": "https://github.com/...",
    "portfolio": "https://...",
    "summary": "Resumen profesional íntegro"
  },
  "workExperience": [
    {
      "id": "exp_1",
      "company": "Nombre de Empresa",
      "role": "Cargo o Posición",
      "location": "Ubicación o Remoto",
      "startDate": "Mes Año",
      "endDate": "Mes Año o Presente",
      "current": false,
      "achievements": [
        "Viñeta 1 con métricas cuantificables (STAR / Google XYZ)",
        "Viñeta 2"
      ],
      "technologies": ["React.js", "TypeScript", "Node.js"]
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "Universidad o Institución",
      "degree": "Título obtenido",
      "fieldOfStudy": "Especialidad o detalles",
      "startDate": "2014",
      "endDate": "2019",
      "current": false
    }
  ],
  "skillCategories": [
    {
      "categoryName": "Frontend",
      "skills": ["React.js", "Next.js", "TypeScript"]
    }
  ],
  "projects": [],
  "certifications": [],
  "languages": [
    { "id": "lang_1", "language": "Español", "proficiency": "Nativo" },
    { "id": "lang_2", "language": "Inglés", "proficiency": "Profesional / Técnico (B2/C1)" }
  ]
}

REGLAS CRÍTICAS:
1. Retorna ÚNICAMENTE el bloque JSON válido, sin delimitadores adicionales ni texto explicativo.
2. No inventes información; captura fielmente todos los datos presentes en el texto original.
3. Asegúrate de incluir TODOS los empleos, fechas exactas, viñetas de logros y stacks tecnológicos.`;

    const response = await AIService.complete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extrae de forma exhaustiva y estructurada el siguiente CV:\n\n${rawText}` },
      ],
      aiConfig,
      { temperature: 0.1 }
    );

    const content = response.content || '{}';
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedData = JSON.parse(jsonStr);

    return {
      id: `master_cv_${Date.now()}`,
      title: parsedData.title || (fileName ? `CV — ${fileName}` : `CV — ${parsedData.personalInfo?.name || 'Jorge Niño'}`),
      personalInfo: parsedData.personalInfo || {},
      workExperience: parsedData.workExperience || [],
      education: parsedData.education || [],
      skillCategories: parsedData.skillCategories || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      languages: parsedData.languages || [],
      rawText,
      updatedAt: new Date().toISOString(),
    };
  }
}
