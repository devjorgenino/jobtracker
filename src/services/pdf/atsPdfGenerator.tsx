/**
 * ATS-Compliant PDF Document & Generator Engine — BILINGUAL (ES / EN)
 * Replicates the exact linear layout of Jorge Niño's Product Engineer CV.
 * NO tables — pure single-column, section-by-section flow for maximum ATS compatibility.
 * All section headings, labels and PDF metadata switch automatically based on `lang`.
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { TailoredCV, MasterCV } from '../../types/cv';
import { t, type Lang } from '../../i18n';
import { CVTranslationService } from '../cv/cvTranslationService';

/* ─────────────────────────── Styles ─────────────────────────── */
const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1f2937',
    lineHeight: 1.4,
  },

  /* ── Header ── */
  header: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 14,
  },
  roleTitle: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 8.5,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  headerDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563eb',
    marginTop: 10,
  },

  /* ── Sections ── */
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    borderBottomWidth: 0.8,
    borderBottomColor: '#9ca3af',
    paddingBottom: 2,
    marginBottom: 6,
  },

  /* ── Summary ── */
  summaryText: {
    fontSize: 8.8,
    color: '#374151',
    lineHeight: 1.45,
    textAlign: 'justify' as const,
  },

  /* ── Skills (inline paragraph, NOT table) ── */
  skillsParagraph: {
    fontSize: 8.8,
    color: '#374151',
    lineHeight: 1.5,
  },
  skillCategoryLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },

  /* ── Experience ── */
  experienceBlock: {
    marginBottom: 7,
  },
  expHeaderRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 2,
  },
  expRoleCompany: {
    fontSize: 9.2,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    flex: 1,
    paddingRight: 8,
  },
  expDate: {
    fontSize: 8.5,
    fontStyle: 'italic' as const,
    color: '#4b5563',
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  bulletList: {
    paddingLeft: 4,
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    marginBottom: 2,
    alignItems: 'flex-start' as const,
  },
  bulletSymbol: {
    width: 8,
    fontSize: 9,
    color: '#374151',
  },
  bulletText: {
    flex: 1,
    fontSize: 8.6,
    color: '#374151',
    lineHeight: 1.35,
  },
  expSkillsLine: {
    fontSize: 8.2,
    color: '#4b5563',
    fontStyle: 'italic' as const,
    marginTop: 2,
    paddingLeft: 4,
  },

  /* ── Education ── */
  eduBlock: {
    marginBottom: 4,
  },
  eduRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  eduMain: {
    flex: 1,
    fontSize: 9,
    color: '#111827',
    paddingRight: 8,
  },
  eduInstitution: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  eduDegree: {
    color: '#374151',
  },
  eduDate: {
    fontSize: 8.5,
    fontStyle: 'italic' as const,
    color: '#4b5563',
    flexShrink: 0,
    textAlign: 'right' as const,
  },
  eduDescription: {
    fontSize: 8.2,
    color: '#6b7280',
    fontStyle: 'italic' as const,
    marginTop: 1,
    paddingLeft: 4,
  },

  /* ── Certifications ── */
  certLine: {
    fontSize: 8.6,
    color: '#374151',
    marginBottom: 2,
  },

  /* ── Languages ── */
  languagesLine: {
    fontSize: 8.8,
    color: '#374151',
  },
});

/* ─────────────────────── ATS Resume Document ─────────────────────── */
export const ATSResumeDocument: React.FC<{ cv: TailoredCV | MasterCV; lang?: Lang }> = ({ cv, lang = 'es' }) => {
  // If target is English and input is in Spanish or generic, ensure full high-fidelity English translation
  const effectiveCV = lang === 'en' ? CVTranslationService.translateCVToEnglishSync(cv) : cv;

  const p = effectiveCV.personalInfo || {
    name: 'Jorge Niño',
    roleTitle: lang === 'en' ? 'Product Engineer | Full-Stack Developer | AI-Native Development (Cursor, Claude Code)' : 'Ingeniero de Producto | Desarrollador Full-Stack',
    email: 'jorgenino.dev@gmail.com',
    phone: '+58 412-350-6984',
    location: lang === 'en' ? 'Remote — Venezuela (LATAM)' : 'Remoto — Venezuela (LATAM)',
    summary: '',
  };

  const summary =
    (lang === 'en' ? ((effectiveCV as any)._enSummary || (effectiveCV as TailoredCV).summary || p.summary) : ((effectiveCV as TailoredCV).summary || p.summary)) ||
    '';
  const workExperience = effectiveCV.workExperience || [];
  const skillCategories = effectiveCV.skillCategories || [];
  const education = effectiveCV.education || [];
  const projects = effectiveCV.projects || [];
  const certifications = effectiveCV.certifications || [];
  const languages = effectiveCV.languages || [];

  // Build contact string separated by " | "
  const contactParts: string[] = [];
  if (p.phone) contactParts.push(p.phone);
  if (p.email) contactParts.push(p.email);
  if (p.linkedin) contactParts.push(p.linkedin.replace(/^https?:\/\/(?:www\.)?/, ''));
  if (p.portfolio) contactParts.push(p.portfolio.replace(/^https?:\/\/(?:www\.)?/, ''));
  if (p.github) contactParts.push(p.github.replace(/^https?:\/\/(?:www\.)?/, ''));
  if (p.location) contactParts.push(p.location);

  const presentLabel = t('cv.label.present', lang);
  const skillsLabel = t('cv.label.skills', lang);
  const techLabel = t('cv.label.technologies', lang);

  return (
    <Document
      title={`CV_${(p.name || 'Jorge_Nino').replace(/\s+/g, '_')}_${lang.toUpperCase()}`}
      author={p.name}
      subject={lang === 'en' ? 'ATS Resume' : 'CV ATS'}
    >
      <Page size="A4" style={styles.page}>

        {/* ═══════════ HEADER ═══════════ */}
        <View style={styles.header}>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.roleTitle}>
            {p.roleTitle || 'Product Engineer | Full-Stack Developer | AI-Native Development (Cursor, Claude Code)'}
          </Text>
          <Text style={styles.contactLine}>{contactParts.join('  |  ')}</Text>
          <View style={styles.headerDivider} />
        </View>

        {/* ═══════════ RESUMEN / PROFESSIONAL SUMMARY ═══════════ */}
        {summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cv.section.summary', lang)}</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {/* ═══════════ HABILIDADES / TECHNICAL SKILLS (inline paragraph) ═══════════ */}
        {skillCategories.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cv.section.skills', lang)}</Text>
            <Text style={styles.skillsParagraph}>
              {skillCategories.map((cat, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 ? '  ' : ''}
                  <Text style={styles.skillCategoryLabel}>{cat.categoryName}: </Text>
                  <Text>{cat.skills.join(', ')}</Text>
                </React.Fragment>
              ))}
            </Text>
          </View>
        ) : null}

        {/* ═══════════ EXPERIENCIA / PROFESSIONAL EXPERIENCE ═══════════ */}
        {workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cv.section.experience', lang)}</Text>
            {workExperience.map((exp, idx) => (
              <View key={exp.id || idx} style={styles.experienceBlock}>
                <View style={styles.expHeaderRow}>
                  <Text style={styles.expRoleCompany}>
                    {exp.role} — {exp.company}
                  </Text>
                  <Text style={styles.expDate}>
                    {exp.startDate} — {exp.current ? presentLabel : exp.endDate}
                  </Text>
                </View>

                <View style={styles.bulletList}>
                  {(exp.achievements || exp.description || []).map((bullet, bIdx) => (
                    <View key={bIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletSymbol}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>

                {exp.technologies && exp.technologies.length > 0 ? (
                  <Text style={styles.expSkillsLine}>
                    {skillsLabel}: {exp.technologies.join(' · ')}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ═══════════ EDUCACIÓN / EDUCATION ═══════════ */}
        {education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cv.section.education', lang)}</Text>
            {education.map((edu, idx) => (
              <View key={edu.id || idx} style={styles.eduBlock}>
                <View style={styles.eduRow}>
                  <Text style={styles.eduMain}>
                    <Text style={styles.eduInstitution}>{edu.institution}</Text>
                    {' — '}
                    <Text style={styles.eduDegree}>{edu.degree}</Text>
                  </Text>
                  <Text style={styles.eduDate}>
                    {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}{edu.current ? ` – ${presentLabel}` : ''}
                  </Text>
                </View>
                {edu.fieldOfStudy ? (
                  <Text style={styles.eduDescription}>{edu.fieldOfStudy}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ═══════════ PROYECTOS / NOTABLE PROJECTS ═══════════ */}
        {projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cv.section.projects', lang)}</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' }}>
                  {proj.name}{proj.url ? ` (${proj.url})` : ''}
                </Text>
                <Text style={{ fontSize: 8.6, color: '#374151', marginTop: 1 }}>{proj.description}</Text>
                {proj.technologies && proj.technologies.length > 0 ? (
                  <Text style={styles.expSkillsLine}>{techLabel}: {proj.technologies.join(' · ')}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ═══════════ CERTIFICACIONES / CERTIFICATIONS ═══════════ */}
        {certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cv.section.certifications', lang)}</Text>
            {certifications.map((cert, idx) => (
              <Text key={idx} style={styles.certLine}>
                • {cert.name} — {cert.issuer}{cert.issueDate ? ` · ${cert.issueDate}` : ''}
              </Text>
            ))}
          </View>
        ) : null}

        {/* ═══════════ IDIOMAS / LANGUAGES ═══════════ */}
        {languages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cv.section.languages', lang)}</Text>
            <Text style={styles.languagesLine}>
              {languages.map(l => `${l.language} (${l.proficiency})`).join('  ·  ')}
            </Text>
          </View>
        ) : null}

      </Page>
    </Document>
  );
};

/* ─────────────────────── Service Class ─────────────────────── */
export class ATSPDFService {
  /** Generates a Blob representing the PDF in the specified language */
  static async generatePDFBlob(cv: TailoredCV | MasterCV, lang: Lang = 'es'): Promise<Blob> {
    const effectiveCV = lang === 'en' ? CVTranslationService.translateCVToEnglishSync(cv) : cv;
    const doc = <ATSResumeDocument cv={effectiveCV} lang={lang} />;
    return await pdf(doc).toBlob();
  }

  /** Download the PDF directly in the browser */
  static async downloadPDF(cv: TailoredCV | MasterCV, lang: Lang = 'es', filename?: string): Promise<void> {
    const blob = await this.generatePDFBlob(cv, lang);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (cv.personalInfo?.name || 'Jorge_Nino').replace(/\s+/g, '_');
    a.download = filename || `CV_${safeName}_ATS_${lang.toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
