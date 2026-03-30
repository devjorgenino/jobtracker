import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, Check, Eye, X } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import type { CV } from '@/types';
import { useAppStore } from '@/context/store';
import { Button } from '@/components/common';
import { cn } from '@/utils/cn';
import { extractTextFromPDF } from '@/utils/pdf';
import { CVPDF } from './CVPDF';
import * as Dialog from '@radix-ui/react-dialog';

interface PDFPreviewDialogProps {
  previewCV: CV | null;
  onClose: () => void;
}

function PDFPreviewDialog({ previewCV, onClose }: PDFPreviewDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!previewCV) return;
    
    const generatePdf = async () => {
      try {
        setLoading(true);
        
        // If there's an original file URL, use it
        if (previewCV.originalFileUrl) {
          setPdfUrl(previewCV.originalFileUrl);
          setLoading(false);
          return;
        }
        
        // Otherwise generate from content
        const blob = await pdf(<CVPDF content={previewCV.content} />).toBlob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generatePdf();
  }, [previewCV?.id]);

  if (!previewCV) return null;

  return (
    <Dialog.Root open={!!previewCV} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold text-primary">
              {previewCV.name}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-text-muted">Generando vista previa...</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={`Vista previa de ${previewCV.name}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-muted">No se pudo generar la vista previa</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline">Cerrar</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.pdf'];

export function CVManager() {
  const { cvs, activeCvId, addCV, deleteCV, setActiveCv } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewCV, setPreviewCV] = useState<CV | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setError(null);
    
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError('Por favor sube un archivo válido (.txt, .md o .pdf)');
      return;
    }

    setIsProcessing(true);

    try {
      let content: string;
      
      if (extension === '.pdf') {
        content = await extractTextFromPDF(file);
      } else {
        content = await file.text();
      }
      
      if (!content.trim()) {
        setError('El archivo está vacío o no se pudo leer');
        return;
      }
      
      const cv: CV = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.(txt|md|pdf)$/, ''),
        content,
        fileName: file.name,
        originalFileUrl: extension === '.pdf' ? URL.createObjectURL(file) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addCV(cv);
      setActiveCv(cv.id);
    } catch (err) {
      setError('Error al leer el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDelete = (id: string) => {
    deleteCV(id);
    if (activeCvId === id) {
      setActiveCv(cvs.length > 1 ? cvs.find(c => c.id !== id)?.id || null : null);
    }
  };

  const hasCVs = cvs.length > 0;

  return (
    <div className="h-full p-4 md:p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-primary">Gestión de CV</h1>
        <p className="text-sm md:text-base text-text-muted mt-1">Sube tu CV desde un archivo</p>
      </div>

      {hasCVs ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Columna izquierda: Listado de CVs */}
          <div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Mis CVs ({cvs.length})</h2>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {cvs.map((cv) => (
                  <article
                    key={cv.id}
                    className={cn(
                      'group relative bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200',
                      'hover:shadow-md hover:border-accent/30',
                      activeCvId === cv.id 
                        ? 'border-accent shadow-md ring-2 ring-accent/20' 
                        : 'border-border'
                    )}
                    onClick={() => setActiveCv(cv.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveCv(cv.id)}
                    aria-pressed={activeCvId === cv.id}
                    aria-label={`Seleccionar ${cv.name}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          activeCvId === cv.id ? 'bg-accent text-white' : 'bg-surface text-text-muted'
                        )}>
                          {activeCvId === cv.id ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-primary truncate">{cv.name}</h3>
                          <p className="text-xs text-text-muted mt-0.5">
                            {new Date(cv.createdAt).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewCV(cv);
                          }}
                          aria-label={`Ver ${cv.name}`}
                          className="hover:bg-accent/10"
                        >
                          <Eye className="w-4 h-4 text-accent" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cv.id);
                          }}
                          aria-label={`Eliminar ${cv.name}`}
                          className="hover:bg-error/10"
                        >
                          <Trash2 className="w-4 h-4 text-error" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha: Subir CV */}
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors h-full flex flex-col justify-center',
                isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent',
                isProcessing && 'opacity-50 pointer-events-none'
              )}
            >
              <Upload className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 md:mb-4 text-text-muted" />
              <p className="text-sm md:text-base text-primary mb-2">
                Arrastra tu archivo aquí o{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded"
                  disabled={isProcessing}
                >
                  busca un archivo
                </button>
              </p>
              <p className="text-xs md:text-sm text-text-muted">Formatos: .txt, .md, .pdf</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Subir archivo de CV"
                disabled={isProcessing}
              />
            </div>

            {error && (
              <p className="mt-2 text-sm text-error" role="alert">{error}</p>
            )}

            {isProcessing && (
              <p className="mt-2 text-sm text-accent">Procesando PDF...</p>
            )}
          </div>
        </div>
      ) : (
        /* Cuando no hay CVs: 2 columnas centradas */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Columna izquierda: Listado vacío centrado */}
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-base font-medium text-primary">No hay CVs cargados</p>
            <p className="text-sm text-text-muted mt-1">Sube tu primer CV para comenzar</p>
          </div>

          {/* Columna derecha: Subir CV centrado */}
          <div className="flex flex-col items-center justify-center">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 w-full max-w-sm',
                isDragging ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border hover:border-accent/50 hover:bg-surface/50',
                isProcessing && 'opacity-50 pointer-events-none'
              )}
            >
              <div className="w-14 h-14 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-7 h-7 text-text-muted" />
              </div>
              <p className="text-base font-medium text-primary mb-2">
                Arrastra tu archivo aquí o{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded"
                  disabled={isProcessing}
                >
                  busca un archivo
                </button>
              </p>
              <p className="text-sm text-text-muted">Formatos: .txt, .md, .pdf</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Subir archivo de CV"
                disabled={isProcessing}
              />
            </div>

            {error && (
              <p className="mt-4 text-sm text-error" role="alert">{error}</p>
            )}

            {isProcessing && (
              <p className="mt-4 text-sm text-accent font-medium">Procesando PDF...</p>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PDFPreviewDialog previewCV={previewCV} onClose={() => setPreviewCV(null)} />
    </div>
  );
}
