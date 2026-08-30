/**
 * ATS-Compliant PDF Document & Generator Engine
 * Generates high-fidelity, ATS-parseable vector PDFs matching Jorge Niño's executive Product Engineer design.
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import type { TailoredCV, MasterCV } from '../../types/cv';

// Register standard high-clarity fonts for PDF rendering
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1f2937',
    lineHeight: 1.35,
  },
  header: {
    borderBottomWidth: 1.2,
    borderBottomColor: '#2563eb',
    paddingBottom: 8,
    marginBottom: 10,
    alignItems: 'center',
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  roleTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    fontSize: 8.2,
    color: '#4b5563',
    lineHeight: 1.3,
  },
  contactDivider: {
    marginHorizontal: 4,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 9,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
    marginBottom: 5,
    letterSpacing: 0.4,
  },
  summaryText: {
    fontSize: 8.8,
    color: '#374151',
    lineHeight: 1.35,
    textAlign: 'justify',
  },
  experienceBlock: {
    marginBottom: 7,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1.5,
  },
  expRoleCompany: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  expCompanyAccent: {
    color: '#1e40af',
    fontWeight: 'bold',
  },
  expDate: {
    fontSize: 8.5,
    color: '#4b5563',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  expLocation: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  bulletList: {
    marginTop: 1,
    paddingLeft: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  bulletSymbol: {
    width: 9,
    fontSize: 9,
    color: '#1e40af',
  },
  bulletText: {
    flex: 1,
    fontSize: 8.6,
    color: '#374151',
    lineHeight: 1.3,
  },
  techRow: {
    marginTop: 2,
    fontSize: 8,
    color: '#4b5563',
    fontStyle: 'italic',
  },
  skillCategoryRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
    fontSize: 8.6,
    lineHeight: 1.3,
  },
  skillCategoryName: {
    fontWeight: 'bold',
    color: '#111827',
    width: 145,
  },
  skillCategoryValues: {
    flex: 1,
    color: '#374151',
  },
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  eduDegree: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#111827',
  },
  eduSchool: {
    fontSize: 8.8,
    color: '#374151',
  },
  eduDate: {
    fontSize: 8.5,
    color: '#4b5563',
    fontStyle: 'italic',
  },
  eduDescription: {
    fontSize: 8.2,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 3,
    paddingLeft: 4,
  },
});

export const ATSResumeDocument: React.FC<{ cv: TailoredCV | MasterCV }> = ({ cv }) => {
  const p = cv.personalInfo || {
    name: 'Jorge Niño',
    roleTitle: 'Product Engineer | Full-Stack Developer',
    email: 'jorgenino.dev@gmail.com',
    phone: '+58 412-350-6984',
    location: 'Remoto — Venezuela (LATAM)',
    summary: '',
  };

  const summary = (cv as TailoredCV).summary || p.summary || '';
  const workExperience = cv.workExperience || [];
  const skillCategories = cv.skillCategories || [];
  const education = cv.education || [];
  const projects = cv.projects || [];
  const certifications = cv.certifications || [];
  const languages = cv.languages || [];

  // Build clean contact items without emojis for ATS compliance
  const contactParts: string[] = [];
  if (p.phone) contactParts.push(p.phone);
  if (p.email) contactParts.push(p.email);
  if (p.linkedin) contactParts.push(p.linkedin.replace(/^https?:\/\/(?:www\.)?/, ''));
  if (p.portfolio) contactParts.push(p.portfolio.replace(/^https?:\/\/(?:www\.)?/, ''));
  if (p.github) contactParts.push(p.github.replace(/^https?:\/\/(?:www\.)?/, ''));
  if (p.location) contactParts.push(p.location);

  return (
    <Document title={`CV_${p.name.replace(/\s+/g, '_')}`} author={p.name} subject="Product Engineer ATS Resume">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.roleTitle}>{p.roleTitle || 'Product Engineer | Full-Stack Developer'}</Text>
          <View style={styles.contactRow}>
            {contactParts.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <Text style={styles.contactDivider}>|</Text>}
                <Text>{item}</Text>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Professional Summary */}
        {summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Profesional</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {/* Technical Skills */}
        {skillCategories.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades Técnicas</Text>
            {skillCategories.map((cat, idx) => (
              <View key={idx} style={styles.skillCategoryRow}>
                <Text style={styles.skillCategoryName}>{cat.categoryName}:</Text>
                <Text style={styles.skillCategoryValues}>{cat.skills.join(', ')}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Work Experience */}
        {workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia Profesional</Text>
            {workExperience.map((exp, idx) => (
              <View key={exp.id || idx} style={styles.experienceBlock}>
                <View style={styles.expHeader}>
                  <Text style={styles.expRoleCompany}>
                    {exp.role} — <Text style={styles.expCompanyAccent}>{exp.company}</Text>
                  </Text>
                  <Text style={styles.expDate}>
                    {exp.startDate} — {exp.current ? 'Presente' : exp.endDate}
                  </Text>
                </View>

                {/* Achievements / STAR Bullets */}
                <View style={styles.bulletList}>
                  {(exp.achievements || exp.description || []).map((bullet, bIdx) => (
                    <View key={bIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletSymbol}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>

                {/* Technologies / Skills Used */}
                {exp.technologies && exp.technologies.length > 0 ? (
                  <Text style={styles.techRow}>
                    Habilidades: {exp.technologies.join(' · ')}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education & Specialized Training */}
        {education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación</Text>
            {education.map((edu, idx) => (
              <View key={edu.id || idx} style={{ marginBottom: 3 }}>
                <View style={styles.eduRow}>
                  <Text>
                    <Text style={styles.eduDegree}>{edu.institution}</Text> — <Text style={styles.eduSchool}>{edu.degree}</Text>
                  </Text>
                  <Text style={styles.eduDate}>
                    {edu.startDate} – {edu.current ? 'Presente' : edu.endDate}
                  </Text>
                </View>
                {edu.fieldOfStudy ? (
                  <Text style={styles.eduDescription}>({edu.fieldOfStudy})</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Featured Projects (if tailored/added) */}
        {projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proyectos Destacados</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={{ marginBottom: 3 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#111827' }}>
                  {proj.name} {proj.url ? `(${proj.url})` : ''}
                </Text>
                <Text style={{ fontSize: 8.6, color: '#374151' }}>{proj.description}</Text>
                {proj.technologies && proj.technologies.length > 0 ? (
                  <Text style={styles.techRow}>Tecnologías: {proj.technologies.join(' · ')}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications (if any) */}
        {certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificaciones</Text>
            {certifications.map((cert, idx) => (
              <View key={idx} style={styles.eduRow}>
                <Text style={{ fontSize: 8.6, color: '#374151' }}>
                  • <Text style={{ fontWeight: 'bold' }}>{cert.name}</Text> ({cert.issuer}) {cert.issueDate ? `· ${cert.issueDate}` : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {languages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <Text style={{ fontSize: 8.6, color: '#374151' }}>
              {languages.map(l => `${l.language} (${l.proficiency})`).join(' · ')}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export class ATSPDFService {
  /**
   * Generates a Blob representing the PDF
   */
  static async generatePDFBlob(cv: TailoredCV | MasterCV): Promise<Blob> {
    const doc = <ATSResumeDocument cv={cv} />;
    return await pdf(doc).toBlob();
  }

  /**
   * Download the PDF directly in the browser
   */
  static async downloadPDF(cv: TailoredCV | MasterCV, filename?: string): Promise<void> {
    const blob = await this.generatePDFBlob(cv);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `CV_${(cv.personalInfo?.name || 'Jorge_Nino').replace(/\s+/g, '_')}_ATS.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
