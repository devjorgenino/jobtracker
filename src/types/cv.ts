/**
 * CV, Profile & Resume Entities
 */

export interface PersonalInfo {
  name: string;
  roleTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string[];
  achievements?: string[]; // Quantifiable STAR/XYZ bullet points
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface SkillCategory {
  categoryName: string; // e.g. "Lenguajes & Frameworks", "Bases de Datos & Cloud", "Herramientas & Metodologías"
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
  highlights?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'Nativo' | 'Bilingüe' | 'Avanzado C1/C2' | 'Intermedio B1/B2' | 'Básico A1/A2' | string;
}

export interface MasterCV {
  id: string;
  title: string;
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skillCategories: SkillCategory[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  rawText?: string;
  updatedAt: string;
}

export interface TailoredCV {
  id: string;
  jobId: string;
  masterCvId: string;
  jobTitle: string;
  company: string;
  personalInfo?: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education?: Education[];
  skillCategories?: SkillCategory[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  targetKeywordsMatched?: string[];
  targetKeywordsMissing?: string[];
  atsScore?: number;
  atsMatchScore?: number;
  atsFeedback?: string;
  fullMarkdown: string;
  generatedAt: string;
}
