import { useState } from 'react';
import { Sparkles, Copy, Save, FileText, ChevronDown, ChevronUp, X, Download, Eye } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useAppStore } from '@/context/store';
import { useToast } from '@/components/common/Toast';
import { qwenService } from '@/services/qwen';
import { getOptimizedPdfBlob } from '@/services/pdfFromTemplate';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common';
import { ATSScore } from '@/components/common/ATSScore';
import { analyzeATS } from '@/utils/atsAnalyzer';
import type { ATSAnalysis } from '@/utils/atsAnalyzer';
import { cn } from '@/utils/cn';
import { CVPDF } from '@/components/cv/CVPDF';
import * as Dialog from '@radix-ui/react-dialog';

interface ParsedCV {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  experience: Array<{ company: string; position: string; date: string; description: string }>;
  education: Array<{ school: string; degree: string; date: string }>;
  skills: string[];
}

function parseCVContent(content: string): ParsedCV {
  const result: ParsedCV = {
    name: '', title: '', contact: [], summary: '', experience: [], education: [], skills: [],
  };
  if (!content?.trim()) return result;

  const lines = content.split('\n');
  let currentSection = '';
  let currentIndex = -1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();

    if (lower.startsWith('# ')) {
      result.name = trimmed.replace(/^#\s*/, '').trim();
      continue;
    }
    if (lower.startsWith('## ')) {
      currentSection = lower.replace(/^##\s*/, '');
      currentIndex = -1;
      continue;
    }
    if (lower.includes('email') || lower.includes('telefono') || lower.includes('linkedin') || lower.includes('github') || lower.includes('ubicacion') || lower.includes('www.')) {
      result.contact.push(trimmed);
      continue;
    }
    if (currentSection.includes('experiencia') || currentSection.includes('trabajo')) {
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-*]\s*/, '');
        const dateMatch = text.match(/(\d{4}.*\d{4}|\d{4}.*actual)/i);
        let date = '', cleanText = text;
        if (dateMatch) { date = dateMatch[0]; cleanText = text.replace(date, '').trim(); }
        if (cleanText.includes('|')) {
          const parts = cleanText.split('|').map(p => p.trim());
          result.experience.push({ company: parts[0] || '', position: parts[1] || '', date: date || parts[2] || '', description: '' });
        } else {
          result.experience.push({ company: cleanText, position: '', date, description: '' });
        }
        currentIndex = result.experience.length - 1;
      } else if (currentIndex >= 0 && trimmed.length > 10) {
        result.experience[currentIndex].description += trimmed + ' ';
      }
    }
    if (currentSection.includes('skill') || currentSection.includes('habilidad')) {
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const skill = trimmed.replace(/^[-*]\s*/, '').trim();
        if (skill && skill.length < 60) result.skills.push(skill);
      }
    }
    if (currentSection.includes('educ') || currentSection.includes('estudio')) {
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-*]\s*/, '');
        const dateMatch = text.match(/(\d{4}.*\d{4}|\d{4}.*actual)/i);
        let date = '', cleanText = text;
        if (dateMatch) { date = dateMatch[0]; cleanText = text.replace(date, '').trim(); }
        if (cleanText.includes('|')) {
          const parts = cleanText.split('|').map(p => p.trim());
          result.education.push({ school: parts[0] || '', degree: parts[1] || '', date: date || parts[2] || '' });
        } else {
          result.education.push({ school: cleanText, degree: '', date });
        }
      }
    }
    if (currentSection.includes('perfil') || currentSection.includes('summary')) {
      result.summary += trimmed + ' ';
    }
  }
  result.summary = result.summary.trim();
  return result;
}

function CVPreview({ content }: { content: string }) {
  const cv = parseCVContent(content);
  const hasData = cv.name || cv.experience.length > 0 || cv.skills.length > 0;

  if (!hasData) {
    return <pre className="whitespace-pre-wrap text-sm bg-surface p-4 rounded-md overflow-auto font-mono">{content}</pre>;
  }

  return (
    <div className="bg-white p-4 rounded-md border border-border h-[450px] overflow-auto">
      <div className="border-b-2 border-primary/20 pb-3 mb-3">
        <h3 className="text-lg font-bold text-primary uppercase tracking-wide">{cv.name || 'Nombre'}</h3>
        {cv.title && <p className="text-sm text-accent font-medium">{cv.title}</p>}
        {cv.contact.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-text-muted">
            {cv.contact.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>
      {cv.summary && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Perfil</h4>
          <p className="text-sm text-text-muted">{cv.summary}</p>
        </div>
      )}
      {cv.experience.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-2 pb-1 border-b border-border">Experiencia</h4>
          {cv.experience.map((exp, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm text-primary">{exp.company}</span>
                <span className="text-xs text-text-muted italic">{exp.date}</span>
              </div>
              {exp.position && <p className="text-xs text-accent">{exp.position}</p>}
              {exp.description && <p className="text-xs text-text-muted mt-1">{exp.description.trim()}</p>}
            </div>
          ))}
        </div>
      )}
      {cv.education.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-2 pb-1 border-b border-border">Educación</h4>
          {cv.education.map((edu, i) => (
            <div key={i} className="mb-1 flex justify-between">
              <div>
                <span className="font-semibold text-sm text-primary">{edu.school}</span>
                {edu.degree && <p className="text-xs text-text-muted">{edu.degree}</p>}
              </div>
              <span className="text-xs text-text-muted italic">{edu.date}</span>
            </div>
          ))}
        </div>
      )}
      {cv.skills.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-2 pb-1 border-b border-border">Habilidades</h4>
          <div className="flex flex-wrap gap-1">
            {cv.skills.map((skill, i) => (
              <span key={i} className="text-xs bg-surface px-2 py-1 rounded text-text-muted">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OptimizedCVPreview({ content }: { content: string }) {
  if (!content) {
    return (
      <div
        className="bg-surface rounded-lg p-4 min-h-[280px] flex items-center justify-center"
        aria-live="polite"
      >
        <p className="text-text-muted text-sm">El CV optimizado aparecerá aquí</p>
      </div>
    );
  }

  return (
    <section
      className="bg-white rounded-lg border border-border min-h-[280px] max-h-[500px] overflow-auto"
      aria-label="Texto del CV optimizado"
    >
      <pre
        className="whitespace-pre-wrap text-sm p-4 font-mono text-primary leading-relaxed"
        style={{ fontFamily: 'ui-monospace, monospace' }}
      >
        {content}
      </pre>
    </section>
  );
}

export default function OptimizePage() {
  const { cvs, addCV, setActiveCv } = useAppStore();
  const { addToast } = useToast();
  
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const selectedCV = cvs.find(cv => cv.id === selectedCvId);
  
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedCV, setOptimizedCV] = useState('');
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCVSelector, setShowCVSelector] = useState(false);
  
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const generatePdfPreview = async () => {
    if (!optimizedCV) return;
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setShowPdfPreview(true);
    setLoadingPdf(true);
    try {
      // Primero intentar con la plantilla public/formato.pdf (si existe y es válida)
      const templateBlob = await getOptimizedPdfBlob(optimizedCV);
      const blob =
        templateBlob ?? (await pdf(<CVPDF content={optimizedCV} />).toBlob());
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      addToast('error', 'No se pudo generar la vista previa del PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  const downloadPdf = async () => {
    if (!optimizedCV) return;
    try {
      const templateBlob = await getOptimizedPdfBlob(optimizedCV);
      const blob =
        templateBlob ?? (await pdf(<CVPDF content={optimizedCV} />).toBlob());
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'CV-Optimizado.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleSelectCV = (cvId: string) => {
    setSelectedCvId(cvId);
    setActiveCv(cvId);
    setShowCVSelector(false);
  };

  const handleClearSelection = () => {
    setSelectedCvId(null);
    setActiveCv(null);
    setJobDescription('');
    setOptimizedCV('');
    setShowCVSelector(false);
    setAtsAnalysis(null);
  };

  const handleOptimize = async () => {
    if (!selectedCV?.content || !jobDescription) return;
    setIsLoading(true);
    setError(null);
    const result = await qwenService.optimizeCV({ cvContent: selectedCV.content, jobDescription });
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOptimizedCV(result.content);
      // Analyze ATS score
      const analysis = analyzeATS(result.content, jobDescription);
      setAtsAnalysis(analysis);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!optimizedCV) return;
    try {
      await navigator.clipboard.writeText(optimizedCV);
      addToast('success', 'CV copiado al portapapeles');
    } catch (err) {
      addToast('error', 'Error al copiar');
    }
  };

  const handleSaveCV = () => {
    if (!optimizedCV) return;
    const newCV = {
      id: crypto.randomUUID(),
      name: `${selectedCV?.name || 'CV'} - Optimizado`,
      content: optimizedCV,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addCV(newCV);
    addToast('success', 'CV guardado correctamente');
  };

  return (
    <div className="h-screen p-4 md:p-6 overflow-auto">
      <div className="h-full flex flex-col">
        <div className="mb-4 md:mb-6 flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-accent" />
            Optimizador de CV con IA
          </h1>
          <p className="text-sm md:text-base text-text-muted mt-1">Mejora tu CV para pasar los filtros ATS</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
          {/* Columna Izquierda */}
          <div className="space-y-4 md:space-y-6">
            {/* Selector de CV */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    CV a optimizar
                  </CardTitle>
                  <div className="flex gap-1">
                    {selectedCV && (
                      <Button variant="ghost" size="sm" onClick={handleClearSelection} className="text-xs text-error hover:text-error">
                        <X className="w-3 h-3" />
                        Limpiar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setShowCVSelector(!showCVSelector)} className="text-xs">
                      {showCVSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {selectedCV ? 'Cambiar' : 'Seleccionar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {showCVSelector ? (
                <CardContent className="pt-0 space-y-2">
                  {cvs.length > 0 ? (
                    cvs.map((cv) => (
                      <button
                        key={cv.id}
                        onClick={() => handleSelectCV(cv.id)}
                        className={cn(
                          'w-full p-2 rounded-lg border text-left transition-all text-sm',
                          selectedCvId === cv.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                        )}
                      >
                        <span className="font-medium">{cv.name}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-text-muted">No hay CVs cargados</p>
                  )}
                </CardContent>
              ) : selectedCV ? (
                <CardContent className="pt-0">
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                    <p className="font-medium text-sm">{selectedCV.name}</p>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="pt-0">
                  <p className="text-sm text-text-muted">Selecciona un CV para optimizar</p>
                </CardContent>
              )}
            </Card>

            {/* Tu CV */}
            {selectedCV && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Tu CV actual</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCV.originalFileUrl ? (
                    <iframe
                      src={selectedCV.originalFileUrl}
                      className="w-full h-[450px] rounded border"
                      title="Vista previa del CV"
                    />
                  ) : (
                    <CVPreview content={selectedCV.content} />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Descripción del puesto */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Descripción del puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Pega aquí la descripción de la oferta de empleo..."
                  className="w-full h-32 md:h-40 p-3 border border-border rounded-md resize-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-transparent text-sm"
                  aria-label="Descripción del puesto"
                />
              </CardContent>
              <CardFooter className="pt-3">
                <Button onClick={handleOptimize} disabled={isLoading || !selectedCV || !jobDescription} isLoading={isLoading} className="w-full">
                  <Sparkles className="w-4 h-4" />
                  Optimizar CV
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4 md:space-y-6">
            {error && (
              <Card className="border-error bg-error/5">
                <CardContent className="py-3 text-error text-sm">{error}</CardContent>
              </Card>
            )}

            {optimizedCV ? (
              <Card id="optimized-cv" className="border-accent/30 shadow-sm" aria-labelledby="optimized-cv-title">
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle id="optimized-cv-title" className="text-sm font-semibold">
                    CV optimizado
                  </CardTitle>
                  <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Acciones del CV optimizado">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generatePdfPreview}
                      isLoading={loadingPdf}
                      className="gap-1.5"
                      aria-label={loadingPdf ? 'Generando vista previa del PDF' : 'Ver vista previa del PDF'}
                      disabled={loadingPdf}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      Ver PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToClipboard}
                      className="gap-1.5"
                      aria-label="Copiar todo el texto del CV optimizado"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      Copiar todo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <OptimizedCVPreview content={optimizedCV} />
                  {atsAnalysis && <ATSScore analysis={atsAnalysis} />}
                </CardContent>
                <CardFooter className="pt-3 flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    onClick={handleSaveCV}
                    className="gap-2 w-full sm:w-auto"
                    aria-label="Guardar CV optimizado como nuevo CV en la lista"
                  >
                    <Save className="w-4 h-4 shrink-0" aria-hidden />
                    Guardar como nuevo CV
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-border/50">
                <CardContent className="py-12 text-center text-text-muted">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">El CV optimizado aparecerá aquí</p>
                  <p className="text-xs mt-1">Selecciona un CV y pega la descripción del puesto</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog.Root open={showPdfPreview} onOpenChange={setShowPdfPreview}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" aria-hidden />
            <Dialog.Content
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] z-50 flex flex-col focus:outline-none"
              aria-describedby="pdf-preview-description"
            >
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <Dialog.Title className="text-lg font-semibold text-primary" id="pdf-dialog-title">
                  Vista previa del CV optimizado
                </Dialog.Title>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" aria-label="Cerrar vista previa del PDF" className="rounded-full">
                    <X className="w-5 h-5" aria-hidden />
                  </Button>
                </Dialog.Close>
              </div>
              <div
                id="pdf-preview-description"
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
              >
                {loadingPdf && 'Generando vista previa del PDF.'}
                {!loadingPdf && pdfUrl && 'Vista previa del currículum optimizado cargada. Puedes descargar el PDF con el botón inferior.'}
                {!loadingPdf && !pdfUrl && 'No se pudo generar la vista previa. Intenta de nuevo o descarga el PDF directamente.'}
              </div>
              <section
                className="flex-1 min-h-0 flex flex-col bg-surface rounded-b-xl"
                aria-label="Contenido del PDF"
              >
                {loadingPdf ? (
                  <div className="flex-1 flex items-center justify-center p-8" aria-busy="true">
                    <div className="text-center max-w-xs">
                      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden />
                      <p className="text-sm font-medium text-primary">Generando vista previa</p>
                      <p className="text-xs text-text-muted mt-1">El PDF se abrirá en unos segundos</p>
                    </div>
                  </div>
                ) : pdfUrl ? (
                  <div className="flex-1 min-h-0 p-3 md:p-4">
                    <div className="w-full h-full min-h-[320px] rounded-lg border border-border bg-white shadow-sm overflow-hidden">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="Currículum vitae optimizado en PDF"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div>
                      <FileText className="w-12 h-12 mx-auto text-text-muted opacity-50 mb-3" aria-hidden />
                      <p className="text-sm font-medium text-primary">No se pudo generar la vista previa</p>
                      <p className="text-xs text-text-muted mt-1">Puedes intentar descargar el PDF directamente</p>
                    </div>
                  </div>
                )}
              </section>
              <div className="p-4 border-t border-border flex flex-wrap items-center justify-end gap-2 shrink-0">
                <Button
                  onClick={downloadPdf}
                  className="gap-2"
                  aria-label="Descargar CV optimizado en PDF"
                >
                  <Download className="w-4 h-4" aria-hidden />
                  Descargar PDF
                </Button>
                <Dialog.Close asChild>
                  <Button variant="outline" aria-label="Cerrar y volver al optimizador">
                    Cerrar
                  </Button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
