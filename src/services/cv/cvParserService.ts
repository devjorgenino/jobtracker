/**
 * CV Parser & Text Extraction Service
 * Extracts raw text from PDF, TXT, Markdown, and JSON files, and parses it into a structured MasterCV object.
 * Supports both local intelligent heuristic regex extraction and AI-powered extraction via OmniRoute / AIService.
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { MasterCV, PersonalInfo, WorkExperience, Education, SkillCategory } from '../../types/cv';
import type { AIConfig } from '../../types/ai';
import { AIService } from '../ai/aiService';

// Configure PDF.js worker for browser execution
try {
  if (typeof window !== 'undefined' && pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '5.5.207'}/pdf.worker.min.mjs`;
  }
} catch (err) {
  console.warn('PDF.js worker setup fallback:', err);
}

export interface ExtractedCVData {
  rawText: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  parsedCV: Partial<MasterCV>;
}

export class CVParserService {
  /**
   * Extract text from a local File (PDF, TXT, MD, JSON)
   */
  static async extractTextFromFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (extension === 'pdf') {
      return this.extractTextFromPDF(file);
    }

    if (extension === 'json') {
      const text = await file.text();
      return text;
    }

    // Default for txt, md, etc.
    return file.text();
  }

  /**
   * Extract all text lines from a PDF file using pdfjs-dist
   */
  static async extractTextFromPDF(file: File): Promise<string> {
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
      
      let lastY: number | null = null;
      let pageText = '';

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }
      }

      fullText += `\n--- PÁGINA ${pageNum} ---\n` + pageText.trim() + '\n';
    }

    return fullText.trim();
  }

  /**
   * Heuristic Parser (Fast, Offline, Regex-based)
   * Extracts personal details, experience, education, and skills without calling an external API.
   */
  static parseHeuristic(rawText: string, fileName?: string): MasterCV {
    const cleanText = rawText.replace(/\r\n/g, '\n');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Personal Info Extraction
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
    const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
    const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9_-]+|https?:\/\/[a-zA-Z0-9.-]*linkedin\.com\/[^\s]+)/i;
    const githubRegex = /(github\.com\/[a-zA-Z0-9_-]+|https?:\/\/[a-zA-Z0-9.-]*github\.com\/[^\s]+)/i;

    const emailMatch = cleanText.match(emailRegex);
    const phoneMatch = cleanText.match(phoneRegex);
    const linkedinMatch = cleanText.match(linkedinRegex);
    const githubMatch = cleanText.match(githubRegex);

    // Candidate Name: usually the first non-empty header line
    let name = 'Mi Nombre';
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^---.*?---/, '').trim();
      if (firstLine.length > 2 && firstLine.length < 50 && !firstLine.includes('@')) {
        name = firstLine;
      }
    }

    // Role title: second line or heuristic
    let roleTitle = 'Desarrollador de Software';
    if (lines.length > 1) {
      const secondLine = lines[1].trim();
      if (secondLine.length > 3 && secondLine.length < 60 && !secondLine.includes('@') && !phoneRegex.test(secondLine)) {
        roleTitle = secondLine;
      }
    }

    const personalInfo: PersonalInfo = {
      name,
      roleTitle,
      email: emailMatch ? emailMatch[1] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: 'Disponible Remoto / Presencial',
      linkedin: linkedinMatch ? linkedinMatch[1] : '',
      github: githubMatch ? githubMatch[1] : '',
      portfolio: '',
      summary: this.extractSectionSummary(cleanText),
    };

    // 2. Extract Work Experiences
    const workExperience = this.extractWorkExperiences(cleanText);

    // 3. Extract Education
    const education = this.extractEducation(cleanText);

    // 4. Extract Skills
    const skillCategories = this.extractSkillCategories(cleanText);

    return {
      id: 'cv_uploaded_' + Date.now(),
      title: fileName ? `CV: ${fileName.replace(/\.[^/.]+$/, '')}` : `CV de ${name}`,
      personalInfo,
      workExperience: workExperience.length > 0 ? workExperience : [
        {
          id: 'exp_1',
          company: 'Empresa Principal',
          role: roleTitle,
          location: 'Remoto',
          startDate: '2022',
          endDate: 'Presente',
          current: true,
          achievements: ['Desarrollo e implementación de funcionalidades clave.'],
          technologies: ['TypeScript', 'React', 'Node.js'],
        }
      ],
      education: education.length > 0 ? education : [
        {
          id: 'edu_1',
          institution: 'Universidad / Instituto',
          degree: 'Licenciatura / Ingeniería en Computación / Sistemas',
          startDate: '2018',
          endDate: '2022',
          current: false,
        }
      ],
      skillCategories: skillCategories.length > 0 ? skillCategories : [
        {
          categoryName: 'Tecnologías Principales',
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git', 'SQL'],
        }
      ],
      rawText: cleanText,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * AI-Assisted Parsing via OmniRoute / LLM
   * Takes the raw CV text and returns a high-fidelity, fully normalized MasterCV object.
   */
  static async parseWithAI(rawText: string, config: AIConfig, fileName?: string): Promise<MasterCV> {
    const prompt = `
Eres un Analista Experto en Recursos Humanos y Reclutamiento Técnico.
Tu tarea es leer el texto extraído del currículum de un candidato y convertirlo en una estructura JSON exacta y completa.

--- TEXTO EXTRAÍDO DEL CV ---
${rawText}

--- REQUERIMIENTOS ESTRICTOS ---
1. Extrae todos los datos personales verídicos presentes en el texto (nombre, título, email, teléfono, ubicación, linkedin, github, portfolio, resumen).
2. Extrae todas las experiencias laborales preservando empresas, cargos, fechas, ubicación y desglosando las responsabilidades y logros en viñetas claras y concisas con sus tecnologías asociadas.
3. Extrae la educación completa (institución, título/grado, campo de estudio, fechas).
4. Clasifica todas las habilidades técnicas y blandas en categorías lógicas (ej: "Lenguajes & Frameworks", "Bases de Datos & Cloud", "Herramientas & DevOps", "Metodologías & Soft Skills").
5. Extrae proyectos personales o destacados si están en el texto.
6. Extrae certificaciones e idiomas si están presentes.
7. Conserva estrictamente la veracidad de la información sin inventar nada que no esté respaldado por el texto.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "personalInfo": {
    "name": "Nombre completo",
    "roleTitle": "Título profesional principal",
    "email": "correo@ejemplo.com",
    "phone": "+123456789",
    "location": "Ciudad, País / Remoto",
    "linkedin": "url o username",
    "github": "url o username",
    "portfolio": "url",
    "summary": "Resumen o extracto profesional de 2-4 líneas"
  },
  "workExperience": [
    {
      "id": "exp_1",
      "company": "Nombre de la empresa",
      "role": "Cargo desempeñado",
      "location": "Ubicación o Remoto",
      "startDate": "Mes/Año",
      "endDate": "Mes/Año o Presente",
      "current": true/false,
      "achievements": [
        "Logro o responsabilidad 1",
        "Logro o responsabilidad 2"
      ],
      "technologies": ["React", "TypeScript", "Node.js"]
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "Nombre universidad o institución",
      "degree": "Título obtenido",
      "fieldOfStudy": "Área de estudio",
      "startDate": "Año",
      "endDate": "Año",
      "current": false
    }
  ],
  "skillCategories": [
    {
      "categoryName": "Lenguajes & Frameworks",
      "skills": ["JavaScript", "TypeScript", "React", "Python"]
    }
  ],
  "projects": [
    {
      "id": "proj_1",
      "name": "Nombre del proyecto",
      "description": "Descripción del proyecto",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "certifications": [
    {
      "id": "cert_1",
      "name": "Nombre certificación",
      "issuer": "Emisor",
      "issueDate": "Año"
    }
  ],
  "languages": [
    {
      "id": "lang_1",
      "language": "Español",
      "proficiency": "Nativo"
    }
  ]
}
`;

    try {
      const response = await AIService.complete(
        [
          {
            role: 'system',
            content: 'Eres un sistema extractor y estructurador de currículums. Responde exclusivamente con JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        config,
        { temperature: 0.1, maxTokens: 4000 }
      );

      const parsed = AIService.parseJSONResponse<any>(response.content);

      return {
        id: 'cv_' + Date.now(),
        title: fileName ? `CV: ${fileName.replace(/\.[^/.]+$/, '')}` : `CV de ${parsed.personalInfo?.name || 'Candidato'}`,
        personalInfo: {
          name: parsed.personalInfo?.name || 'Mi Nombre',
          roleTitle: parsed.personalInfo?.roleTitle || 'Software Developer',
          email: parsed.personalInfo?.email || '',
          phone: parsed.personalInfo?.phone || '',
          location: parsed.personalInfo?.location || 'Remoto',
          linkedin: parsed.personalInfo?.linkedin || '',
          github: parsed.personalInfo?.github || '',
          portfolio: parsed.personalInfo?.portfolio || '',
          summary: parsed.personalInfo?.summary || '',
        },
        workExperience: Array.isArray(parsed.workExperience)
          ? parsed.workExperience.map((exp: any, i: number) => ({
              id: exp.id || `exp_${i + 1}`,
              company: exp.company || 'Empresa',
              role: exp.role || 'Rol',
              location: exp.location || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              current: Boolean(exp.current),
              achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
              technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
            }))
          : [],
        education: Array.isArray(parsed.education)
          ? parsed.education.map((edu: any, i: number) => ({
              id: edu.id || `edu_${i + 1}`,
              institution: edu.institution || '',
              degree: edu.degree || '',
              fieldOfStudy: edu.fieldOfStudy || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              current: Boolean(edu.current),
            }))
          : [],
        skillCategories: Array.isArray(parsed.skillCategories)
          ? parsed.skillCategories.map((sc: any) => ({
              categoryName: sc.categoryName || 'General',
              skills: Array.isArray(sc.skills) ? sc.skills : [],
            }))
          : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
        rawText,
        updatedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.warn('AI Parsing failed, falling back to heuristic:', e);
      return this.parseHeuristic(rawText, fileName);
    }
  }

  // --- Internal Helper Extractors ---

  private static extractSectionSummary(text: string): string {
    const summaryHeader = /(?:perfil|resumen|extracto|about me|summary|profile)[:\n]/i;
    const match = text.search(summaryHeader);
    if (match !== -1) {
      const sub = text.slice(match);
      const lines = sub.split('\n').slice(1, 6);
      return lines.join(' ').replace(/\s+/g, ' ').slice(0, 500).trim();
    }
    return '';
  }

  private static extractWorkExperiences(text: string): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    const expRegex = /(?:experiencia|experience|trayectoria laboral|historial laboral)/i;
    const match = text.search(expRegex);

    if (match !== -1) {
      const section = text.slice(match).split(/(?:educaci[oó]n|education|habilidades|skills)/i)[0];
      const paragraphs = section.split(/\n\s*\n/);

      paragraphs.slice(1, 5).forEach((p, idx) => {
        const pLines = p.split('\n').map(l => l.trim()).filter(Boolean);
        if (pLines.length >= 2) {
          experiences.push({
            id: `exp_h_${idx + 1}`,
            company: pLines[0],
            role: pLines[1] || 'Developer',
            startDate: '2021',
            endDate: 'Presente',
            current: true,
            achievements: pLines.slice(2).filter(l => l.length > 10),
            technologies: [],
          });
        }
      });
    }

    return experiences;
  }

  private static extractEducation(text: string): Education[] {
    const educations: Education[] = [];
    const eduRegex = /(?:educaci[oó]n|education|formaci[oó]n)/i;
    const match = text.search(eduRegex);

    if (match !== -1) {
      const section = text.slice(match).split(/(?:experiencia|experience|habilidades|skills|idiomas)/i)[0];
      const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 5);

      lines.slice(1, 4).forEach((line, idx) => {
        educations.push({
          id: `edu_h_${idx + 1}`,
          institution: line,
          degree: 'Grado / Título Profesional',
          startDate: '2017',
          endDate: '2021',
          current: false,
        });
      });
    }

    return educations;
  }

  private static extractSkillCategories(text: string): SkillCategory[] {
    const commonTechs = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'Vue.js', 'Angular',
      'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'CI/CD', 'Linux',
      'Tailwind CSS', 'HTML5', 'CSS3', 'Redux', 'Zustand', 'Jest', 'Cypress'
    ];

    const detectedTechs: string[] = [];
    const lowerText = text.toLowerCase();

    commonTechs.forEach(tech => {
      const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lowerText) && !detectedTechs.includes(tech)) {
        detectedTechs.push(tech);
      }
    });

    if (detectedTechs.length > 0) {
      return [
        {
          categoryName: 'Habilidades & Tecnologías Detectadas',
          skills: detectedTechs,
        }
      ];
    }

    return [];
  }
}
