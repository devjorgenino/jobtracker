export interface ATSAnalysis {
  score: number;
  scoreColor: string;
  grade: string;
  details: {
    keywordMatch: number;
    formatScore: number;
    contentScore: number;
    lengthScore: number;
  };
  tips: string[];
  missingKeywords: string[];
}

export function analyzeATS(cvContent: string, jobDescription: string): ATSAnalysis {
  const tips: string[] = [];
  const missingKeywords: string[] = [];
  let keywordMatch = 0;
  let formatScore = 100;
  let contentScore = 0;
  let lengthScore = 100;

  const cvLower = cvContent.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  const jobWords = jobLower
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3);
  
  const uniqueJobWords = [...new Set(jobWords)];
  const importantWords = uniqueJobWords.filter(
    (word) =>
      !['para', 'como', 'trabajo', 'empleo', 'puesto', 'buscamos', 'necesario', 'requerido', 'experiencia', 'habilidades', 'conocimientos', 'busca', 'equipo', 'empresa', 'año', 'años'].includes(word)
  );

  const matchedKeywords = importantWords.filter((word) => cvLower.includes(word));
  keywordMatch = Math.round((matchedKeywords.length / importantWords.length) * 100);

  const unmatchedKeywords = importantWords.filter((word) => !cvLower.includes(word));
  if (unmatchedKeywords.length > 0 && unmatchedKeywords.length <= 10) {
    missingKeywords.push(...unmatchedKeywords);
  } else if (unmatchedKeywords.length > 10) {
    missingKeywords.push(...unmatchedKeywords.slice(0, 10));
  }

  if (keywordMatch < 50) {
    tips.push('Añade más palabras clave de la descripción del puesto en tu CV');
  }
  if (keywordMatch < 70) {
    tips.push(`Considera incluir: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  if (!cvContent.includes('# ')) {
    formatScore -= 15;
    tips.push('Usa formato Markdown: # para tu nombre, ## para secciones');
  }

  const sectionCount = (cvContent.match(/^##\s+/gm) || []).length;
  if (sectionCount < 3) {
    formatScore -= 10;
    tips.push('Añade más secciones: Perfil, Experiencia, Educación, Competencias');
  }

  const bulletCount = (cvContent.match(/^[-*]\s+/gm) || []).length;
  if (bulletCount < 3) {
    formatScore -= 10;
    tips.push('Añade más bullet points en tu experiencia (mínimo 3-5 por trabajo)');
  }

  const hasContact = /email|@|telefono|phone|linkedin|ciudad|país/i.test(cvContent);
  const hasSummary = /perfil|summary|objetivo|profesional/i.test(cvContent);
  const hasExperience = /experiencia|trabajo|employment|laboral/i.test(cvContent);
  const hasEducation = /educaci|estudio|academic|formaci/i.test(cvContent);
  const hasSkills = /competencia|skill|habilidad|techn/i.test(cvContent);

  if (hasContact) contentScore += 20;
  else tips.push('Añade tu información de contacto (email, teléfono, LinkedIn)');

  if (hasSummary) contentScore += 20;
  else tips.push('Añade una sección de Perfil Profesional');

  if (hasExperience) contentScore += 25;
  else tips.push('Añade tu experiencia laboral');

  if (hasEducation) contentScore += 20;
  else tips.push('Añade tu formación académica');

  if (hasSkills) contentScore += 15;
  else tips.push('Añade una sección de Competencias/Habilidades');

  const numberCount = (cvContent.match(/\d+/g) || []).length;
  if (numberCount >= 2) {
    contentScore = Math.min(100, contentScore + 10);
  } else {
    tips.push('Cuantifica tus logros (ej: "aumenté ventas un 30%")');
  }

  const wordCount = cvContent.split(/\s+/).length;
  if (wordCount < 80) {
    lengthScore = 50;
    tips.push('Tu CV es muy corto. Añade más detalles a tu experiencia');
  } else if (wordCount < 150) {
    lengthScore = 75;
  } else if (wordCount > 2000) {
    lengthScore = 60;
    tips.push('Tu CV es muy largo. Considera resumirlo a 1-2 páginas');
  }

  let score = Math.round(
    keywordMatch * 0.30 +
    formatScore * 0.25 +
    contentScore * 0.30 +
    lengthScore * 0.15
  );

  let scoreColor = '#ef4444';
  let grade = 'F';

  if (score >= 90) {
    scoreColor = '#22c55e';
    grade = 'A';
  } else if (score >= 80) {
    scoreColor = '#84cc16';
    grade = 'B';
  } else if (score >= 70) {
    scoreColor = '#eab308';
    grade = 'C';
  } else if (score >= 60) {
    scoreColor = '#f97316';
    grade = 'D';
  }

  const finalTips = tips.slice(0, 5);

  return {
    score: Math.min(100, score),
    scoreColor,
    grade,
    details: {
      keywordMatch: Math.min(100, keywordMatch),
      formatScore,
      contentScore,
      lengthScore,
    },
    tips: finalTips,
    missingKeywords,
  };
}
