/**
 * Bilingual (ES / EN) translation system for the Job Tracker Suite.
 * Covers: CV section headings, PDF labels, strategy labels, outreach templates,
 * UI chrome, and AI-prompt language switches.
 *
 * Usage:
 *   import { t, Lang } from '../i18n';
 *   t('cv.sectionTitle.summary', 'es')  // → "Resumen Profesional"
 *   t('cv.sectionTitle.summary', 'en')  // → "Professional Summary"
 */

export type Lang = 'es' | 'en';

/* ──────────────────────── Translation dictionaries ──────────────────────── */

const dict: Record<string, Record<Lang, string>> = {
  /* ─── CV / PDF section titles ─── */
  'cv.section.summary':       { es: 'Resumen Profesional',       en: 'Professional Summary' },
  'cv.section.skills':        { es: 'Habilidades Técnicas',      en: 'Technical Skills' },
  'cv.section.experience':    { es: 'Experiencia Profesional',   en: 'Professional Experience' },
  'cv.section.education':     { es: 'Educación',                 en: 'Education' },
  'cv.section.projects':      { es: 'Proyectos Destacados',      en: 'Notable Projects' },
  'cv.section.certifications':{ es: 'Certificaciones',           en: 'Certifications' },
  'cv.section.languages':     { es: 'Idiomas',                   en: 'Languages' },

  /* ─── CV inline labels ─── */
  'cv.label.present':         { es: 'Presente',                  en: 'Present' },
  'cv.label.skills':          { es: 'Habilidades',               en: 'Skills' },
  'cv.label.technologies':    { es: 'Tecnologías',               en: 'Technologies' },

  /* ─── OptimizePage / CVPage UI ─── */
  'ui.downloadPdf':           { es: 'Descargar PDF',             en: 'Download PDF' },
  'ui.downloadPdfEs':         { es: 'Descargar PDF (Español)',    en: 'Download PDF (Spanish)' },
  'ui.downloadPdfEn':         { es: 'Descargar PDF (Inglés)',     en: 'Download PDF (English)' },
  'ui.generateCv':            { es: 'Generar CV Adaptado',       en: 'Generate Tailored CV' },
  'ui.generateCvEs':          { es: 'Generar CV (Español)',       en: 'Generate CV (Spanish)' },
  'ui.generateCvEn':          { es: 'Generar CV (Inglés)',        en: 'Generate CV (English)' },
  'ui.generateBoth':          { es: 'Generar ambos (ES/EN)',      en: 'Generate both (ES/EN)' },
  'ui.atsScore':              { es: 'Score ATS',                  en: 'ATS Score' },
  'ui.matchedKeywords':       { es: 'Palabras clave coincidentes',en: 'Matched Keywords' },
  'ui.missingKeywords':       { es: 'Palabras clave faltantes',  en: 'Missing Keywords' },
  'ui.atsFeedback':           { es: 'Retroalimentación ATS',     en: 'ATS Feedback' },
  'ui.preview':               { es: 'Vista previa',              en: 'Preview' },
  'ui.generating':            { es: 'Generando...',              en: 'Generating...' },

  /* ─── Strategy UI ─── */
  'strategy.title':           { es: 'Estrategia de Postulación', en: 'Application Strategy' },
  'strategy.generateEs':      { es: 'Generar Estrategia (Español)', en: 'Generate Strategy (Spanish)' },
  'strategy.generateEn':      { es: 'Generar Estrategia (Inglés)',  en: 'Generate Strategy (English)' },
  'strategy.generateBoth':    { es: 'Generar ambas (ES/EN)',        en: 'Generate both (ES/EN)' },
  'strategy.companyOverview': { es: 'Análisis de la Empresa',    en: 'Company Overview' },
  'strategy.roleAnalysis':    { es: 'Análisis del Rol',          en: 'Role Analysis' },
  'strategy.keyPoints':       { es: 'Puntos Diferenciadores',    en: 'Key Selling Points' },
  'strategy.tacticalPlan':    { es: 'Plan Táctico',              en: 'Tactical Plan' },
  'strategy.interviewPrep':   { es: 'Preparación Entrevista',    en: 'Interview Prep' },
  'strategy.outreach':        { es: 'Mensajes de Contacto',      en: 'Outreach Messages' },
  'strategy.phase':           { es: 'Fase',                      en: 'Phase' },

  /* ─── Outreach message labels ─── */
  'outreach.linkedinConnection': { es: 'Conexión LinkedIn',      en: 'LinkedIn Connection' },
  'outreach.linkedinInMail':     { es: 'InMail LinkedIn',        en: 'LinkedIn InMail' },
  'outreach.emailCoverLetter':   { es: 'Carta de Presentación',  en: 'Cover Letter Email' },
  'outreach.followUpEmail':      { es: 'Email de Seguimiento',   en: 'Follow-Up Email' },
  'outreach.postInterviewThankYou': { es: 'Agradecimiento Post-Entrevista', en: 'Post-Interview Thank You' },
  'outreach.salaryNegotiation':  { es: 'Negociación Salarial',   en: 'Salary Negotiation' },

  /* ─── CV Markdown builder ─── */
  'md.summary':               { es: 'Resumen Profesional',       en: 'Professional Summary' },
  'md.experience':            { es: 'Experiencia Laboral',       en: 'Work Experience' },
  'md.skills':                { es: 'Habilidades Técnicas',      en: 'Technical Skills' },
  'md.education':             { es: 'Educación',                 en: 'Education' },
  'md.languages':             { es: 'Idiomas',                   en: 'Languages' },
  'md.technologies':          { es: 'Tecnologías',               en: 'Technologies' },
  'md.present':               { es: 'Presente',                  en: 'Present' },
};

/* ──────────────────────── Public API ──────────────────────── */

/**
 * Retrieve a translated string.
 * Falls back to Spanish if the key doesn't exist.
 */
export function t(key: string, lang: Lang = 'es'): string {
  return dict[key]?.[lang] ?? dict[key]?.es ?? key;
}

/** All supported languages for UI dropdowns */
export const SUPPORTED_LANGS: { value: Lang; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

export default t;
