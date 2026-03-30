import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { stripMarkdown } from '@/utils/stripMarkdown';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    lineHeight: 1.45,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#1e3a5f',
    padding: 32,
    paddingBottom: 28,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 22,
  },
  title: {
    fontSize: 12,
    color: '#e2e8f0',
    marginBottom: 14,
  },
  contactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  contactItem: {
    fontSize: 9,
    color: '#cbd5e1',
  },
  contactDot: {
    color: '#fbbf24',
    marginHorizontal: 5,
  },
  content: {
    padding: 26,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a5f',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  summaryText: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'justify',
    lineHeight: 1.65,
  },
  experienceItem: {
    marginBottom: 18,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  company: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  date: {
    fontSize: 9,
    color: '#4b5563',
    fontStyle: 'italic',
  },
  position: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 6,
    fontWeight: 'normal',
  },
  descriptionList: {
    marginTop: 6,
    paddingLeft: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingRight: 15,
  },
  bullet: {
    width: 12,
    fontSize: 9,
    color: '#1e3a5f',
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  school: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  degree: {
    fontSize: 10,
    color: '#374151',
    marginTop: 3,
  },
  educationDate: {
    fontSize: 9,
    color: '#4b5563',
    fontStyle: 'italic',
  },
  skillCategory: {
    marginBottom: 12,
  },
  skillCategoryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 6,
  },
  skillList: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.65,
  },
  trainingItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  trainingBullet: {
    width: 12,
    fontSize: 9,
    color: '#1e3a5f',
    fontWeight: 'bold',
  },
  trainingText: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

interface CVPDFProps {
  content: string;
}

interface Experience {
  company: string;
  position: string;
  date: string;
  description: string[];
  location: string;
}

interface ParsedCV {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  experience: Experience[];
  education: Array<{ school: string; degree: string; date: string; location: string }>;
  skills: string[];
  languages: string[];
  software: string[];
  additionalTraining: string[];
}

function parseCVContent(content: string): ParsedCV {
  const result: ParsedCV = {
    name: '',
    title: '',
    contact: [],
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    software: [],
    additionalTraining: [],
  };

  if (!content || !content.trim()) {
    return result;
  }

  const lines = content.split('\n');
  let currentSection = '';
  let currentIndex = -1;
  let currentSubcategory = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('# ')) {
      result.name = stripMarkdown(line.replace(/^#\s*/, '').trim()).toUpperCase();
      continue;
    }

    if (lowerLine.startsWith('## ')) {
      currentSection = line.replace(/^##\s*/, '').toLowerCase();
      currentIndex = -1;
      currentSubcategory = '';
      continue;
    }

    if (lowerLine.startsWith('### ')) {
      const subcat = line.replace(/^###\s*/, '').toLowerCase();
      if (subcat.includes('técnica') || subcat.includes('tecnica') || subcat.includes('skill')) {
        currentSubcategory = 'skills';
      } else if (subcat.includes('idioma') || subcat.includes('language')) {
        currentSubcategory = 'languages';
      } else if (subcat.includes('software') || subcat.includes('herramienta')) {
        currentSubcategory = 'software';
      }
      continue;
    }

    if (line.includes('@') || lowerLine.includes('email') || lowerLine.includes('telefono') || 
        lowerLine.includes('phone') || lowerLine.includes('linkedin') || lowerLine.includes('github') || 
        lowerLine.includes('ubicacion') || lowerLine.includes('location') || lowerLine.includes('www.') || 
        lowerLine.includes('ciudad') || lowerLine.includes('país') || lowerLine.includes('direccion')) {
      const contactItem = stripMarkdown(line.trim());
      if (contactItem && !result.contact.includes(contactItem)) {
        result.contact.push(contactItem);
      }
      continue;
    }

    if (result.name && result.title === '' && !line.startsWith('-') && !line.startsWith('*') && 
        !line.startsWith('•') && !lowerLine.startsWith('##') && !lowerLine.startsWith('###') && 
        line.length > 3 && line.length < 80 && !lowerLine.includes('resumen') && !lowerLine.includes('perfil')) {
      result.title = stripMarkdown(line.trim());
      continue;
    }

    if (currentSection.includes('experiencia') || currentSection.includes('trabajo') || 
        currentSection.includes('employment') || currentSection.includes('laboral')) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const text = line.replace(/^[-*•]\s*/, '');
        
        const dateMatch = text.match(/(\b\d{4}\s*[–\-–]\s*\d{4}\b|\b\d{4}\s*[–\-–]\s*actual\b|\b\d{4}\s*[–\-–]\s*presente\b|\b\w+\s\d{4}\b)/i);
        let date = '';
        let cleanText = text;
        
        if (dateMatch) {
          date = dateMatch[0];
          cleanText = text.replace(date, '').trim();
        }
        
        let company = cleanText;
        let position = '';
        
        if (cleanText.includes('|')) {
          const parts = cleanText.split('|').map(p => stripMarkdown(p.trim()));
          company = parts[0] || '';
          position = parts[1] || '';
        } else {
          const dashMatch = cleanText.match(/^(.+?)\s*[-–]\s*(.+)$/);
          if (dashMatch && dashMatch[1].length > 2) {
            company = dashMatch[1].trim();
            position = dashMatch[2].trim();
          }
        }
        
        result.experience.push({
          company: stripMarkdown(company),
          position: stripMarkdown(position),
          date: stripMarkdown(date),
          description: [],
          location: '',
        });
        currentIndex = result.experience.length - 1;
      } else if (currentIndex >= 0 && line.length > 5) {
        const cleanLine = stripMarkdown(line.replace(/^[-*•\s]+/, '').trim());
        if (cleanLine && !lowerLine.startsWith('##') && !lowerLine.startsWith('###')) {
          result.experience[currentIndex].description.push(cleanLine);
        }
      }
    }

    if (currentSection.includes('skill') || currentSection.includes('habilidad') || 
        currentSection.includes('competencia')) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const skillText = line.replace(/^[-*•]\s*/, '').trim();
        if (skillText && skillText.length < 90) {
          const lower = skillText.toLowerCase();
          const cleanSkill = stripMarkdown(skillText);
          if (!cleanSkill) continue;
          if (currentSubcategory === 'languages' || lower.includes('inglés') || lower.includes('español') || 
              lower.includes('francés') || lower.includes('portugués') || lower.includes('italiano') || 
              lower.includes('alemán') || lower.includes('english') || lower.includes('native') || 
              lower.includes('bilingüe') || lower.includes('fluent')) {
            if (!result.languages.includes(cleanSkill)) {
              result.languages.push(cleanSkill);
            }
          } else if (currentSubcategory === 'software' || 
                     lower.includes('excel') || lower.includes('word') || lower.includes('powerpoint') ||
                     lower.includes('python') || lower.includes('java') || lower.includes('sql') ||
                     lower.includes('javascript') || lower.includes('typescript') || lower.includes('react') ||
                     lower.includes('node') || lower.includes('docker') || lower.includes('git') ||
                     lower.includes('aws') || lower.includes('azure') || lower.includes('figma')) {
            if (!result.software.includes(cleanSkill)) {
              result.software.push(cleanSkill);
            }
          } else if (!currentSubcategory || currentSubcategory === 'skills') {
            if (!result.skills.includes(cleanSkill)) {
              result.skills.push(cleanSkill);
            }
          }
        }
      }
    }

    if ((currentSection.includes('educ') || currentSection.includes('estudio') || 
        currentSection.includes('academic') || (currentSection.includes('formacion') && !currentSection.includes('adicional') && !currentSection.includes('complementaria')))) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const text = line.replace(/^[-*•]\s*/, '');
        const dateMatch = text.match(/(\b\d{4}\s*[–\-–]\s*\d{4}\b|\b\d{4}\s*[–\-–]\s*actual\b|\b\w+\s\d{4}\b)/i);
        let date = '';
        let cleanText = text;
        
        if (dateMatch) {
          date = dateMatch[0];
          cleanText = text.replace(date, '').trim();
        }
        
        if (cleanText.includes('|')) {
          const parts = cleanText.split('|').map(p => stripMarkdown(p.trim()));
          result.education.push({
            school: parts[0] || '',
            degree: parts[1] || '',
            date: stripMarkdown(date || parts[2] || ''),
            location: parts[3] || '',
          });
        } else {
          result.education.push({
            school: stripMarkdown(cleanText),
            degree: '',
            date: stripMarkdown(date),
            location: '',
          });
        }
      }
    }

    if (currentSection.includes('adicional') || currentSection.includes('extra') || 
        currentSection.includes('curso') || currentSection.includes('certific') ||
        currentSection.includes('complementaria')) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const trainingText = stripMarkdown(line.replace(/^[-*•]\s*/, '').trim());
        if (trainingText && trainingText.length < 150) {
          result.additionalTraining.push(trainingText);
        }
      }
    }

    if (currentSection.includes('perfil') || currentSection.includes('summary') || 
        currentSection.includes('objetivo') || currentSection.includes('profesional')) {
      if (!line.startsWith('-') && !line.startsWith('*') && !line.startsWith('•') && line.length > 10) {
        result.summary += stripMarkdown(line) + ' ';
      }
    }
  }

  result.summary = stripMarkdown(result.summary.trim());

  return result;
}

function ContactInfo({ contact }: { contact: string[] }) {
  if (contact.length === 0) return null;
  
  return (
    <View style={styles.contactContainer}>
      {contact.map((item, index) => (
        <Text key={index} style={styles.contactItem}>
          {index > 0 && <Text style={styles.contactDot}>•</Text>}
          {item}
        </Text>
      ))}
    </View>
  );
}

function ExperienceItem({ exp }: { exp: Experience }) {
  const hasDescription = exp.description && exp.description.length > 0;
  
  return (
    <View style={styles.experienceItem}>
      <View style={styles.jobHeader}>
        <Text style={styles.company}>{exp.company}</Text>
        {exp.date && <Text style={styles.date}>{exp.date}</Text>}
      </View>
      {exp.position && <Text style={styles.position}>{exp.position}</Text>}
      {hasDescription && (
        <View style={styles.descriptionList}>
          {exp.description.map((desc, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{desc}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ExperienceSection({ experience }: { experience: Experience[] }) {
  if (experience.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experiencia Profesional</Text>
      {experience.map((exp, i) => (
        <ExperienceItem key={i} exp={exp} />
      ))}
    </View>
  );
}

function EducationSection({ education }: { education: ParsedCV['education'] }) {
  if (education.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Formación Académica</Text>
      {education.map((edu, i) => (
        <View key={i} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.school}>{edu.school}</Text>
              {edu.degree && <Text style={styles.degree}>{edu.degree}</Text>}
            </View>
            {edu.date && <Text style={styles.educationDate}>{edu.date}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

function SkillsSection({ 
  skills, 
  languages, 
  software 
}: { 
  skills: string[]; 
  languages: string[]; 
  software: string[] 
}) {
  if (skills.length === 0 && languages.length === 0 && software.length === 0) return null;

  const categories = [];
  
  if (skills.length > 0) {
    categories.push({ title: 'Técnicas', items: skills });
  }
  if (languages.length > 0) {
    categories.push({ title: 'Idiomas', items: languages });
  }
  if (software.length > 0) {
    categories.push({ title: 'Software y Herramientas', items: software });
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Competencias</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 25 }}>
        {categories.map((cat, idx) => (
          <View key={idx} style={{ width: '30%', minWidth: 130 }}>
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>{cat.title}</Text>
              <Text style={styles.skillList}>{cat.items.join(' • ')}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function TrainingSection({ training }: { training: string[] }) {
  if (training.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Formación Adicional</Text>
      {training.map((item, i) => (
        <View key={i} style={styles.trainingItem}>
          <Text style={styles.trainingBullet}>•</Text>
          <Text style={styles.trainingText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function CVPage({ 
  cv, 
  pageNumber 
}: { 
  cv: ParsedCV; 
  pageNumber?: number 
}) {
  const locationContact = cv.contact.filter(c => 
    c.toLowerCase().includes('ciudad') || c.toLowerCase().includes('país') || 
    c.toLowerCase().includes('ubicacion') || c.toLowerCase().includes('location')
  );

  const otherContact = cv.contact.filter(c => 
    !c.toLowerCase().includes('ciudad') && !c.toLowerCase().includes('país') && 
    !c.toLowerCase().includes('ubicacion') && !c.toLowerCase().includes('location')
  );

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <Text style={styles.name}>{cv.name || 'NOMBRE COMPLETO'}</Text>
        {cv.title && <Text style={styles.title}>{cv.title}</Text>}
        <ContactInfo contact={otherContact} />
        {locationContact.length > 0 && <ContactInfo contact={locationContact} />}
      </View>

      <View style={styles.content}>
        {cv.summary && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Perfil Profesional</Text>
            <Text style={styles.summaryText}>{cv.summary}</Text>
          </View>
        )}

        <ExperienceSection experience={cv.experience} />
        <EducationSection education={cv.education} />
        <SkillsSection skills={cv.skills} languages={cv.languages} software={cv.software} />
        <TrainingSection training={cv.additionalTraining} />
      </View>

      {pageNumber && (
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      )}
    </Page>
  );
}

export function CVPDF({ content }: CVPDFProps) {
  const cv = parseCVContent(content);

  const hasContent = cv.name || cv.experience.length > 0 || cv.education.length > 0 || 
                    cv.skills.length > 0 || cv.summary;

  const docTitle = cv.name ? `Currículum vitae - ${cv.name}` : 'Currículum vitae optimizado';

  if (!hasContent) {
    return (
      <Document title={docTitle} language="es" creator="JobTracker">
        <Page size="A4" style={styles.page}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay contenido disponible para generar el CV</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document title={docTitle} language="es" creator="JobTracker">
      <CVPage cv={cv} />
    </Document>
  );
}
