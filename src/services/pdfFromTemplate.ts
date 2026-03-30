/**
 * Genera un PDF optimizado usando la plantilla public/formato.pdf.
 * - Si la plantilla tiene campos de formulario (AcroForm), se rellenan con el contenido optimizado.
 * - Si no tiene formulario, se usa la primera página como fondo y se dibuja el contenido encima.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { parseCVContent } from '@/components/cv/CVPDFGenerator';

type ParsedCV = ReturnType<typeof parseCVContent>;

const TEMPLATE_URL = '/formato.pdf';

/** Mapeo de nombres de campo (parcial, minúsculas) a valor del CV */
function getValueForField(
  fieldName: string,
  cv: ParsedCV
): string | undefined {
  const name = fieldName.toLowerCase().replaceAll(/\s+/g, '_');
  // Por si el nombre viene como "Page1.Nombre" tomamos la última parte
  const lastPart = name.split('.').pop() ?? name;

  if (
    lastPart.includes('nombre') ||
    lastPart === 'name' ||
    lastPart === 'nombre_completo'
  ) {
    return cv.name || undefined;
  }
  if (
    lastPart.includes('titulo') ||
    lastPart === 'title' ||
    lastPart === 'cargo' ||
    lastPart === 'puesto'
  ) {
    return cv.title || undefined;
  }
  if (
    lastPart.includes('contacto') ||
    lastPart.includes('contact') ||
    lastPart === 'email' ||
    lastPart === 'datos_contacto' ||
    lastPart === 'telefono'
  ) {
    return cv.contact.length ? cv.contact.join(' | ') : undefined;
  }
  if (
    lastPart.includes('perfil') ||
    lastPart.includes('resumen') ||
    lastPart === 'summary' ||
    lastPart === 'profile' ||
    lastPart.includes('objetivo')
  ) {
    return cv.summary || undefined;
  }
  if (
    lastPart.includes('experiencia') ||
    lastPart === 'experience' ||
    lastPart === 'exp'
  ) {
    const parts = cv.experience.map((e) => {
      const header = [e.company, e.position, e.date].filter(Boolean).join(' - ');
      const descLines = (e.description ?? []).map((d) => '• ' + d).join('\n');
      return descLines ? header + '\n' + descLines : header;
    });
    return parts.join('\n\n').trim() || undefined;
  }
  if (
    lastPart.includes('educacion') ||
    lastPart === 'education' ||
    lastPart.includes('formacion_academica')
  ) {
    const parts = cv.education.map((e) => {
      const bits = [e.school, e.degree, e.date].filter(Boolean);
      return bits.join(' - ');
    });
    return parts.join('\n').trim() || undefined;
  }
  if (
    lastPart.includes('competencia') ||
    lastPart.includes('skill') ||
    lastPart === 'habilidades' ||
    lastPart === 'skills'
  ) {
    const all = [
      ...cv.skills,
      ...cv.languages,
      ...cv.software,
    ].filter(Boolean);
    return all.length ? all.join(', ') : undefined;
  }
  if (
    lastPart.includes('formacion_adicional') ||
    lastPart.includes('adicional') ||
    lastPart === 'training' ||
    lastPart === 'cursos'
  ) {
    return cv.additionalTraining?.length
      ? cv.additionalTraining.join('\n• ')
      : undefined;
  }
  return undefined;
}

/**
 * Intenta rellenar los campos del formulario del PDF con el CV parseado.
 * Devuelve true si se rellenó al menos un campo.
 */
function fillFormFields(pdfDoc: PDFDocument, cv: ParsedCV): boolean {
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    let filled = 0;

    for (const field of fields) {
      const fieldName = field.getName();
      try {
        const textField = form.getTextField(fieldName);
        const value = getValueForField(fieldName, cv);
        if (value !== undefined && value !== '') {
          textField.setText(value);
          filled++;
        }
      } catch {
        // No es un campo de texto, ignorar
      }
    }

    if (filled > 0) {
      form.flatten();
      return true;
    }
  } catch {
    // Sin formulario o error
  }
  return false;
}

/**
 * Dibuja el contenido del CV sobre la primera página del documento (plantilla como fondo).
 * Usa el mismo diseño que CVPDFGenerator para mantener coherencia.
 */
async function drawContentOnFirstPage(
  pdfDoc: PDFDocument,
  page: ReturnType<PDFDocument['getPages']>[0],
  cv: ParsedCV
): Promise<void> {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const whiteColor = rgb(1, 1, 1);
  const lightGrayColor = rgb(0.886, 0.886, 0.886);
  const grayContactColor = rgb(0.627, 0.686, 0.753);
  const blackColor = rgb(0, 0, 0);
  const textColor = rgb(0.169, 0.169, 0.169);
  const grayColor = rgb(0.443, 0.502, 0.588);
  const yellowAccentColor = rgb(0.925, 0.788, 0.294);

  let yPos = height - 56;

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
  if (cv.contact.length > 0) {
    const contactText = cv.contact.join(' | ');
    const maxWidth = 535;
    if (helveticaFont.widthOfTextAtSize(contactText, 9) > maxWidth) {
      const parts = contactText.split(' | ');
      let currentLine = '';
      for (const word of parts) {
        const testLine = currentLine ? currentLine + ' | ' + word : word;
        if (
          helveticaFont.widthOfTextAtSize(testLine, 9) > maxWidth &&
          currentLine
        ) {
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

  const drawWrappedText = (
    text: string,
    x: number,
    startY: number,
    fontSize: number,
    lineHeight: number,
    maxWidth: number
  ): number => {
    const words = text.split(' ');
    let currentLine = '';
    let y = startY;
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (
        helveticaFont.widthOfTextAtSize(testLine, fontSize) > maxWidth &&
        currentLine
      ) {
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

  const drawSectionTitle = (title: string, y: number): number => {
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

  if (cv.summary) {
    yPos = drawSectionTitle('PERFIL PROFESIONAL', yPos);
    yPos = drawWrappedText(cv.summary, 30, yPos, 10, 14, 535);
    yPos -= 18;
  }
  if (cv.experience.length > 0) {
    yPos = drawSectionTitle('EXPERIENCIA LABORAL', yPos);
    for (const exp of cv.experience) {
      if (yPos < 100) break;
      page.drawText(exp.company, {
        x: 30,
        y: yPos,
        size: 11,
        font: helveticaBoldFont,
        color: blackColor,
      });
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
      for (const desc of exp.description ?? []) {
        if (yPos < 80) break;
        yPos = drawWrappedText('• ' + desc, 30, yPos, 9, 12, 530);
      }
      yPos -= 14;
    }
    yPos -= 10;
  }
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
  const allSkills = [...cv.skills, ...cv.languages, ...cv.software];
  if (allSkills.length > 0) {
    yPos = drawSectionTitle('COMPETENCIAS', yPos);
    const skillsText = allSkills.join(' • ');
    drawWrappedText(skillsText, 30, yPos, 9, 12, 535);
    yPos -= 16;
  }
  if (cv.additionalTraining?.length) {
    yPos = drawSectionTitle('FORMACIÓN ADICIONAL', yPos);
    for (const t of cv.additionalTraining) {
      yPos = drawWrappedText('• ' + t, 30, yPos, 9, 12, 530);
    }
  }
}

/**
 * Obtiene los bytes de la plantilla desde public/formato.pdf.
 * Lanza si la plantilla no está disponible (ej. 404).
 */
export async function fetchTemplateBytes(): Promise<ArrayBuffer> {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) {
    throw new Error(
      `Plantilla no encontrada: ${TEMPLATE_URL}. Asegúrate de tener formato.pdf en la carpeta public.`
    );
  }
  return res.arrayBuffer();
}

/**
 * Genera un PDF a partir de la plantilla y el contenido optimizado en markdown.
 * - Si la plantilla tiene campos de formulario, los rellena.
 * - Si no, dibuja el contenido sobre la primera página de la plantilla (mismo diseño).
 * @returns Bytes del PDF o null si la plantilla no está disponible o hay cualquier error
 */
export async function generatePdfFromTemplate(
  optimizedMarkdownContent: string
): Promise<Uint8Array | null> {
  try {
    const templateBytes = await fetchTemplateBytes();
    // Si el servidor devuelve HTML (ej. SPA fallback cuando no existe formato.pdf), load() lanzará
    const pdfDoc = await PDFDocument.load(templateBytes);
    const cv = parseCVContent(optimizedMarkdownContent);

    const formFilled = fillFormFields(pdfDoc, cv);

    if (!formFilled) {
      const pages = pdfDoc.getPages();
      if (pages.length > 0) {
        drawContentOnFirstPage(pdfDoc, pages[0], cv);
      }
    }

    return pdfDoc.save();
  } catch {
    return null;
  }
}

/**
 * Genera el Blob del PDF optimizado.
 * Usa la plantilla formato.pdf si existe y es válida; si no, devuelve null para que el caller use el fallback (react-pdf).
 * No lanza: ante cualquier error devuelve null.
 */
export async function getOptimizedPdfBlob(
  optimizedMarkdownContent: string
): Promise<Blob | null> {
  try {
    const bytes = await generatePdfFromTemplate(optimizedMarkdownContent);
    if (!bytes) return null;
    return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  } catch {
    return null;
  }
}
