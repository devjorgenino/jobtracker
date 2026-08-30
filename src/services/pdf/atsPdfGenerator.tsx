/**
 * ATS-Compliant PDF Document & Generator Engine
 * Generates high-fidelity, ATS-parseable vector PDFs matching executive standards.
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import type { TailoredCV, MasterCV } from '../../types/cv';

// Register standard fonts
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
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica', // Clean standard ATS font
    fontSize: 9.5,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
    marginBottom: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  roleTitle: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    fontSize: 8.5,
    color: '#475569',
    gap: 8,
  },
  contactItem: {
    marginHorizontal: 3,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  summaryText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.35,
    textAlign: 'justify',
  },
  experienceBlock: {
    marginBottom: 8,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  expRole: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  expCompany: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  expDate: {
    fontSize: 8.5,
    color: '#64748b',
    fontStyle: 'italic',
  },
  expLocation: {
    fontSize: 8.5,
    color: '#64748b',
  },
  bulletList: {
    marginTop: 2,
    paddingLeft: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
    alignItems: 'flex-start',
  },
  bulletSymbol: {
    width: 10,
    fontSize: 9,
    color: '#2563eb',
  },
  bulletText: {
    flex: 1,
    fontSize: 8.8,
    color: '#334155',
    lineHeight: 1.3,
  },
  techRow: {
    marginTop: 2,
    fontSize: 8.2,
    color: '#475569',
    fontStyle: 'italic',
  },
  skillCategoryRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 8.8,
    lineHeight: 1.3,
  },
  skillCategoryName: {
    fontWeight: 'bold',
    color: '#0f172a',
    width: 130,
  },
  skillCategoryValues: {
    flex: 1,
    color: '#334155',
  },
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  eduDegree: {
    fontWeight: 'bold',
    fontSize: 9.2,
    color: '#0f172a',
  },
  eduSchool: {
    fontSize: 8.8,
    color: '#475569',
  },
  eduDate: {
    fontSize: 8.5,
    color: '#64748b',
  },
});

export const ATSResumeDocument: React.FC<{ cv: TailoredCV | MasterCV }> = ({ cv }) => {
  const p = cv.personalInfo || {
    name: 'Jorge Niño',
    roleTitle: 'Software Developer',
    email: 'contacto@ejemplo.com',
    phone: '+58 412 0000000',
    location: 'Remoto',
    summary: '',
  };

  const summary = (cv as TailoredCV).summary || p.summary || '';
  const workExperience = cv.workExperience || [];
  const skillCategories = cv.skillCategories || [];
  const education = cv.education || [];
  const projects = cv.projects || [];
  const certifications = cv.certifications || [];
  const languages = cv.languages || [];

  return (
    <Document title={`CV_${p.name.replace(/\s+/g, '_')}`} author={p.name} subject="ATS Optimized Resume">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.roleTitle}>{p.roleTitle || 'Software Developer'}</Text>
          <View style={styles.contactRow}>
            {p.location && <Text style={styles.contactItem}>📍 {p.location}</Text>}
            {p.email && <Text style={styles.contactItem}>✉ {p.email}</Text>}
            {p.phone && <Text style={styles.contactItem}>☎ {p.phone}</Text>}
            {p.linkedin && <Text style={styles.contactItem}>🔗 {p.linkedin}</Text>}
            {p.github && <Text style={styles.contactItem}>🐙 {p.github}</Text>}
            {p.portfolio && <Text style={styles.contactItem}>🌐 {p.portfolio}</Text>}
          </View>
        </View>

        {/* Professional Summary */}
        {summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Profesional</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {/* Work Experience */}
        {workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
            {workExperience.map((exp, idx) => (
              <View key={exp.id || idx} style={styles.experienceBlock}>
                <View style={styles.expHeader}>
                  <Text>
                    <Text style={styles.expRole}>{exp.role}</Text> — <Text style={styles.expCompany}>{exp.company}</Text>
                  </Text>
                  <Text style={styles.expDate}>
                    {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                  </Text>
                </View>
                {exp.location ? <Text style={styles.expLocation}>{exp.location}</Text> : null}

                {/* Achievements / STAR Bullets */}
                <View style={styles.bulletList}>
                  {(exp.achievements || exp.description || []).map((bullet, bIdx) => (
                    <View key={bIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletSymbol}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>

                {/* Technologies */}
                {exp.technologies && exp.technologies.length > 0 ? (
                  <Text style={styles.techRow}>
                    Tecnologías: {exp.technologies.join(', ')}
                  </Text>
                ) : null}
              </View>
            ))}
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

        {/* Featured Projects (if any) */}
        {projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proyectos Destacados</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 9.2, fontWeight: 'bold', color: '#0f172a' }}>
                  {proj.name} {proj.url ? `(${proj.url})` : ''}
                </Text>
                <Text style={{ fontSize: 8.8, color: '#334155' }}>{proj.description}</Text>
                {proj.technologies && proj.technologies.length > 0 ? (
                  <Text style={styles.techRow}>Tecnologías: {proj.technologies.join(', ')}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education & Certifications */}
        {education.length > 0 || certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación & Certificaciones</Text>
            {education.map((edu, idx) => (
              <View key={edu.id || idx} style={styles.eduRow}>
                <Text>
                  <Text style={styles.eduDegree}>{edu.degree}</Text> {edu.fieldOfStudy ? `en ${edu.fieldOfStudy}` : ''} — <Text style={styles.eduSchool}>{edu.institution}</Text>
                </Text>
                <Text style={styles.eduDate}>
                  {edu.startDate} - {edu.current ? 'Presente' : edu.endDate}
                </Text>
              </View>
            ))}
            {certifications.map((cert, idx) => (
              <View key={idx} style={styles.eduRow}>
                <Text style={{ fontSize: 8.8, color: '#334155' }}>
                  • <Text style={{ fontWeight: 'bold' }}>{cert.name}</Text> ({cert.issuer}) {cert.issueDate ? `- ${cert.issueDate}` : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {languages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <Text style={{ fontSize: 8.8, color: '#334155' }}>
              {languages.map(l => `${l.language} (${l.proficiency})`).join(' • ')}
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
    a.download = filename || `CV_${(cv.personalInfo?.name || 'Candidato').replace(/\s+/g, '_')}_ATS.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
