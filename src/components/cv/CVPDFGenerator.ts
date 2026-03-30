import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { stripMarkdown } from '@/utils/stripMarkdown';

interface ParsedCV {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  experience: Array<{ company: string; position: string; date: string; description: string[] }>;
  education: Array<{ school: string; degree: string; date: string }>;
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

  // Find name from first non-empty line or # heading
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.startsWith('# ')) {
      result.name = stripMarkdown(trimmed.replace(/^#\s*/, '').trim()).toUpperCase();
      continue;
    }
    
    // Check for title after name (next non-empty line that isn't a header)
    if (result.name && trimmed.length > 3 && !trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.startsWith('##')) {
      result.title = stripMarkdown(trimmed);
      break;
    } else if (trimmed.startsWith('# ')) {
      result.name = stripMarkdown(trimmed.replace(/^#\s*/, '').trim()).toUpperCase();
    }
  }

  // Reset to find name properly
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lowerLine = line.toLowerCase();

    // Detect sections
    if (lowerLine.startsWith('## ') || lowerLine.startsWith('### ')) {
      currentSection = line.replace(/^#{1,3}\s*/, '').toLowerCase();
      currentIndex = -1;
      
      // Check for subcategories in competencies
      if (currentSection.includes('competencia')) {
        currentSubcategory = '';
      }
      continue;
    }

    // Detect subcategory in competencies
    if (currentSection.includes('competencia') || currentSection.includes('skill') || currentSection.includes('habilidad')) {
      if (line.toLowerCase().includes('técnicas') || line.toLowerCase().includes('tecnicas')) {
        currentSubcategory = 'tecnicas';
        continue;
      } else if (line.toLowerCase().includes('idiomas')) {
        currentSubcategory = 'idiomas';
        continue;
      } else if (line.toLowerCase().includes('software') || line.toLowerCase().includes('herramientas')) {
        currentSubcategory = 'software';
        continue;
      }
    }

    // Contact info - line with @ or common patterns
    if (line.includes('@') || lowerLine.includes('telefono') || lowerLine.includes('phone') || 
        lowerLine.includes('linkedin') || lowerLine.includes('github') || 
        lowerLine.includes('ciudad') || lowerLine.includes('país') || lowerLine.includes('direccion') ||
        (line.includes('|') && (line.toLowerCase().includes('email') || line.toLowerCase().includes('tel') || line.toLowerCase().includes('linkedin')))) {
      // Split by pipe and add each part
      const parts = line.split('|').map(p => stripMarkdown(p.trim())).filter(p => p);
      if (parts.length > 1) {
        result.contact.push(...parts);
      } else {
        result.contact.push(stripMarkdown(line.trim()));
      }
      continue;
    }

    // Skip title if we already have it
    if (result.title && line === result.title) {
      continue;
    }

    // Experience section
    if (currentSection.includes('experiencia') || currentSection.includes('trabajo') || currentSection.includes('employment') || currentSection.includes('laboral')) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        let text = line.replace(/^[-*•]\s*/, '');
        
        // Handle "Empresa | Cargo | Fechas" format
        if (text.includes('|')) {
          const parts = text.split('|').map(p => stripMarkdown(p.trim()));
          result.experience.push({
            company: parts[0] || '',
            position: parts[1] || '',
            date: parts[2] || '',
            description: [],
          });
          currentIndex = result.experience.length - 1;
        } else {
          // Try to parse as "Company - Position" or just company
          const dateMatch = text.match(/(\d{4}.*\d{4}|\d{4}.*actual)/i);
          let date = '';
          let cleanText = text;
          
          if (dateMatch) {
            date = dateMatch[0];
            cleanText = text.replace(date, '').trim();
          }
          
          let company = cleanText;
          let position = '';
          
          const dashMatch = cleanText.match(/^(.+?)\s*[-–]\s*(.+)$/);
          if (dashMatch && dashMatch[1].length > 2) {
            company = dashMatch[1].trim();
            position = dashMatch[2].trim();
          }
          
          if (company.length > 2) {
            result.experience.push({
              company: stripMarkdown(company),
              position: stripMarkdown(position),
              date: stripMarkdown(date),
              description: [],
            });
            currentIndex = result.experience.length - 1;
          }
        }
      } else if (currentIndex >= 0 && line.length > 5) {
        // Add bullet point to current experience
        const bulletText = stripMarkdown(line.replace(/^[-*•\s]+/, '').trim());
        if (bulletText && !lowerLine.startsWith('##')) {
          result.experience[currentIndex].description.push(bulletText);
        }
      }
    }

    // Education section
    if (currentSection.includes('educ') || currentSection.includes('estudio') || currentSection.includes('academic')) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        let text = line.replace(/^[-*•]\s*/, '');
        
        if (text.includes('|')) {
          const parts = text.split('|').map(p => stripMarkdown(p.trim()));
          result.education.push({
            school: parts[0] || '',
            degree: parts[1] || '',
            date: parts[2] || '',
          });
        } else {
          const dateMatch = text.match(/(\d{4}.*\d{4}|\d{4}.*actual)/i);
          let date = '';
          let cleanText = text;
          
          if (dateMatch) {
            date = dateMatch[0];
            cleanText = text.replace(date, '').trim();
          }
          
          result.education.push({
            school: stripMarkdown(cleanText),
            degree: '',
            date: stripMarkdown(date),
          });
        }
      }
    }

    // Competencies/Skills - handle all subcategories
    if (currentSection.includes('competencia') || currentSection.includes('skill') || currentSection.includes('habilidad')) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const skillText = line.replace(/^[-*•]\s*/, '').trim();
        
        if (!skillText || skillText.length > 80) continue;
        
        // Determine which category
        const lower = skillText.toLowerCase();
        const isLanguage = lower.includes('inglés') || lower.includes('español') || lower.includes('francés') || 
                          lower.includes('portugués') || lower.includes('italiano') || lower.includes('alemán') ||
                          lower.includes('english') || lower.includes('spanish') || lower.includes('native') ||
                          lower.includes('bilingüe') || lower.includes('fluent');
        
        const isSoftware = lower.includes('excel') || lower.includes('word') || lower.includes('powerpoint') ||
                          lower.includes('python') || lower.includes('java') || lower.includes('sql') ||
                          lower.includes('javascript') || lower.includes('typescript') || lower.includes('react') ||
                          lower.includes('node') || lower.includes('docker') || lower.includes('git') ||
                          lower.includes('aws') || lower.includes('azure') || lower.includes('figma') ||
                          lower.includes('photoshop') || lower.includes('illustrator') || lower.includes('sap') ||
                          lower.includes('salesforce') || lower.includes('jira');
        
        const cleanSkill = stripMarkdown(skillText);
        if (!cleanSkill) continue;
        if (currentSubcategory === 'idiomas' || isLanguage) {
          if (!result.languages.includes(cleanSkill)) {
            result.languages.push(cleanSkill);
          }
        } else if (currentSubcategory === 'software' || isSoftware) {
          if (!result.software.includes(cleanSkill)) {
            result.software.push(cleanSkill);
          }
        } else if (currentSubcategory === 'tecnicas' || !currentSubcategory) {
          if (!result.skills.includes(cleanSkill)) {
            result.skills.push(cleanSkill);
          }
        }
      }
    }

    // Additional training
    if (currentSection.includes('adicional') || currentSection.includes('extra') || currentSection.includes('curso') || currentSection.includes('certific')) {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const trainingText = line.replace(/^[-*•]\s*/, '').trim();
        if (trainingText && trainingText.length < 150) {
          result.additionalTraining.push(stripMarkdown(trainingText));
        }
      }
    }

    // Summary/Perfil
    if (currentSection.includes('perfil') || currentSection.includes('summary') || currentSection.includes('objetivo') || currentSection.includes('profesional')) {
      if (!line.startsWith('-') && !line.startsWith('*') && !line.startsWith('•') && line.length > 10) {
        result.summary += stripMarkdown(line) + ' ';
      }
    }
  }

  result.summary = stripMarkdown(result.summary.trim());

  return result;
}

async function generateCVPDF(content: string): Promise<Uint8Array> {
  const cv = parseCVContent(content);
  
  const pdfDoc = await PDFDocument.create();
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const { width, height } = page.getSize();
  
  // Colors
  const headerBgColor = rgb(0.102, 0.212, 0.365);
  const whiteColor = rgb(1, 1, 1);
  const lightGrayColor = rgb(0.886, 0.886, 0.886);
  const grayContactColor = rgb(0.627, 0.686, 0.753);
  const blackColor = rgb(0, 0, 0);
  const textColor = rgb(0.169, 0.169, 0.169);
  const grayColor = rgb(0.443, 0.502, 0.588);
  const yellowAccentColor = rgb(0.925, 0.788, 0.294);
  
  // Draw header background
  page.drawRectangle({
    x: 0,
    y: height - 150,
    width: width,
    height: 150,
    color: headerBgColor,
  });
  
  let yPos = height - 56;
  
  // Name
  if (cv.name) {
    page.drawText(cv.name.toUpperCase(), {
      x: 30,
      y: yPos,
      size: 22,
      font: helveticaBoldFont,
      color: whiteColor,
    });
    yPos -= 46;
  }
  
  // Title
  if (cv.title) {
    page.drawText(cv.title, {
      x: 30,
      y: yPos,
      size: 11,
      font: helveticaFont,
      color: lightGrayColor,
    });
    yPos -= 24;
  }
  
  // Contact info - collect all and join
  if (cv.contact.length > 0) {
    const contactText = cv.contact.join(' | ');
    
    // Split if too long
    const maxWidth = 535;
    if (helveticaFont.widthOfTextAtSize(contactText, 9) > maxWidth) {
      const words = contactText.split(' | ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' | ' + word : word;
        if (helveticaFont.widthOfTextAtSize(testLine, 9) > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: 30,
            y: yPos,
            size: 9,
            font: helveticaFont,
            color: grayContactColor,
          });
          yPos -= 13;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page.drawText(currentLine, {
          x: 30,
          y: yPos,
          size: 9,
          font: helveticaFont,
          color: grayContactColor,
        });
      }
    } else {
      page.drawText(contactText, {
        x: 30,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: grayContactColor,
      });
    }
  }
  
  yPos = height - 200;
  
  // Helper function to draw wrapped text
  const drawWrappedText = (text: string, x: number, startY: number, fontSize: number, lineHeight: number, maxWidth: number) => {
    const words = text.split(' ');
    let currentLine = '';
    let y = startY;
    
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (helveticaFont.widthOfTextAtSize(testLine, fontSize) > maxWidth && currentLine) {
        page.drawText(currentLine, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: textColor,
        });
        y -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, {
        x,
        y,
        size: fontSize,
        font: helveticaFont,
        color: textColor,
      });
      y -= lineHeight;
    }
    return y;
  };
  
  // Helper for section title
  const drawSectionTitle = (title: string, y: number) => {
    page.drawText(title, {
      x: 30,
      y,
      size: 12,
      font: helveticaBoldFont,
      color: blackColor,
    });
    page.drawRectangle({
      x: 30,
      y: y - 4,
      width: helveticaBoldFont.widthOfTextAtSize(title, 12) + 5,
      height: 2,
      color: yellowAccentColor,
    });
    return y - 24;
  };
  
  // PERFIL PROFESIONAL
  if (cv.summary) {
    yPos = drawSectionTitle('PERFIL PROFESIONAL', yPos);
    yPos = drawWrappedText(cv.summary, 30, yPos, 10, 14, 535);
    yPos -= 18;
  }
  
  // EXPERIENCIA LABORAL
  if (cv.experience.length > 0) {
    yPos = drawSectionTitle('EXPERIENCIA LABORAL', yPos);
    
    for (const exp of cv.experience) {
      // Check if we need a new page
      if (yPos < 100) {
        const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
        newPage.drawRectangle({
          x: 0,
          y: newPage.getSize().height - 50,
          width: newPage.getSize().width,
          height: 50,
          color: headerBgColor,
        });
        yPos = newPage.getSize().height - 70;
      }
      
      // Company
      page.drawText(exp.company, {
        x: 30,
        y: yPos,
        size: 11,
        font: helveticaBoldFont,
        color: blackColor,
      });
      
      // Date
      if (exp.date) {
        const dateWidth = helveticaFont.widthOfTextAtSize(exp.date, 9);
        page.drawText(exp.date, {
          x: width - 30 - dateWidth,
          y: yPos,
          size: 9,
          font: helveticaFont,
          color: grayColor,
        });
      }
      yPos -= 14;
      
      // Position
      if (exp.position) {
        page.drawText(exp.position, {
          x: 30,
          y: yPos,
          size: 10,
          font: helveticaFont,
          color: grayColor,
        });
        yPos -= 14;
      }
      
      // Description bullets
      for (const desc of exp.description) {
        if (yPos < 80) {
          const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
          newPage.drawRectangle({
            x: 0,
            y: newPage.getSize().height - 50,
            width: newPage.getSize().width,
            height: 50,
            color: headerBgColor,
          });
          yPos = newPage.getSize().height - 70;
        }
        
        yPos = drawWrappedText('• ' + desc, 30, yPos, 9, 12, 530);
      }
      
      yPos -= 14;
    }
    yPos -= 10;
  }
  
  // EDUCACIÓN
  if (cv.education.length > 0) {
    yPos = drawSectionTitle('EDUCACIÓN', yPos);
    
    for (const edu of cv.education) {
      page.drawText(edu.school, {
        x: 30,
        y: yPos,
        size: 11,
        font: helveticaBoldFont,
        color: blackColor,
      });
      
      if (edu.date) {
        const dateWidth = helveticaFont.widthOfTextAtSize(edu.date, 9);
        page.drawText(edu.date, {
          x: width - 30 - dateWidth,
          y: yPos,
          size: 9,
          font: helveticaFont,
          color: grayColor,
        });
      }
      yPos -= 14;
      
      if (edu.degree) {
        page.drawText(edu.degree, {
          x: 30,
          y: yPos,
          size: 10,
          font: helveticaFont,
          color: textColor,
        });
        yPos -= 14;
      }
      yPos -= 8;
    }
    yPos -= 8;
  }
  
  // COMPETENCIAS
  if (cv.skills.length > 0 || cv.languages.length > 0 || cv.software.length > 0) {
    yPos = drawSectionTitle('COMPETENCIAS', yPos);
    
    const col1X = 30;
    const col2X = 200;
    const col3X = 390;
    let col1Y = yPos;
    let col2Y = yPos;
    let col3Y = yPos;
    
    // Column 1: Técnicas
    if (cv.skills.length > 0) {
      page.drawText('Técnicas', {
        x: col1X,
        y: col1Y,
        size: 10,
        font: helveticaBoldFont,
        color: blackColor,
      });
      col1Y -= 14;
      
      const skillsText = cv.skills.join(' • ');
      col1Y = drawWrappedText(skillsText, col1X, col1Y, 9, 12, 160);
    }
    
    // Column 2: Idiomas
    if (cv.languages.length > 0) {
      page.drawText('Idiomas', {
        x: col2X,
        y: col2Y,
        size: 10,
        font: helveticaBoldFont,
        color: blackColor,
      });
      col2Y -= 14;
      
      const langsText = cv.languages.join(' • ');
      col2Y = drawWrappedText(langsText, col2X, col2Y, 9, 12, 180);
    }
    
    // Column 3: Software/Herramientas
    if (cv.software.length > 0) {
      page.drawText('Software/Herramientas', {
        x: col3X,
        y: col3Y,
        size: 10,
        font: helveticaBoldFont,
        color: blackColor,
      });
      col3Y -= 14;
      
      const softText = cv.software.join(' • ');
      col3Y = drawWrappedText(softText, col3X, col3Y, 9, 12, 175);
    }
    
    yPos = Math.min(col1Y, col2Y, col3Y) - 15;
  }
  
  // FORMACIÓN ADICIONAL
  if (cv.additionalTraining.length > 0) {
    yPos = drawSectionTitle('FORMACIÓN ADICIONAL', yPos);
    
    for (const training of cv.additionalTraining) {
      if (yPos < 80) {
        const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
        newPage.drawRectangle({
          x: 0,
          y: newPage.getSize().height - 50,
          width: newPage.getSize().width,
          height: 50,
          color: headerBgColor,
        });
        yPos = newPage.getSize().height - 70;
      }
      
      yPos = drawWrappedText('• ' + training, 30, yPos, 9, 12, 530);
    }
  }
  
  return pdfDoc.save();
}

export { generateCVPDF, parseCVContent };
