import { useState } from 'react';
import { MessageSquare, Copy, Check, Send, Globe, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { qwenService } from '@/services/qwen';
import type { MessageType } from '@/types';
import { useAppStore } from '@/context/store';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Input } from '@/components/common';
import { cn } from '@/utils/cn';

type Language = 'es' | 'en';

const MESSAGE_TEMPLATES: Array<{ type: MessageType; label: string; description: string }> = [
  { type: 'linkedin_initial', label: 'LinkedIn', description: 'Mensaje para LinkedIn' },
  { type: 'email', label: 'Email', description: 'Email formal de aplicación' },
  { type: 'follow_up_application', label: 'Seguimiento', description: 'Después de enviar CV' },
  { type: 'post_interview', label: 'Post-Entrevista', description: 'Agradecimiento' },
  { type: 'response_offer', label: 'Respuesta Oferta', description: 'Responder a oferta' },
  { type: 'rejection_response', label: 'Rechazo', description: 'Agradecer tras rechazo' },
];

const LANGUAGES: Array<{ id: Language; label: string; flag: string }> = [
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
];

export function AssistantPage() {
  const { cvs, activeCvId, setActiveCv } = useAppStore();
  const activeCV = cvs.find(cv => cv.id === activeCvId);

  const [selectedTemplate, setSelectedTemplate] = useState<MessageType>('linkedin_initial');
  const [language, setLanguage] = useState<Language>('es');
  const [candidateName, setCandidateName] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [context, setContext] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCVSelector, setShowCVSelector] = useState(false);

  const handleGenerate = async () => {
    if (!candidateName) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await qwenService.generateMessage({
      templateType: selectedTemplate,
      candidateName,
      recruiterName: recruiterName || undefined,
      jobTitle: jobTitle || undefined,
      companyName: companyName || undefined,
      cvContent: activeCV?.content,
      context: context || undefined,
      language,
    });
    setIsLoading(false);
    if (result.error) setError(result.error);
    else setGeneratedMessage(result.content);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full p-4 md:p-6 overflow-auto">
      <div>
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <MessageSquare className="w-5 md:w-6 h-5 md:h-6 text-accent" />
            Asistente de Comunicación
          </h1>
          <p className="text-sm md:text-base text-text-muted mt-1">Genera mensajes profesionales personalizados</p>
        </div>

        {/* Row 1: CV + Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV activo
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCVSelector(!showCVSelector)} className="text-xs">
                  {showCVSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Cambiar
                </Button>
              </div>
            </CardHeader>
            {showCVSelector ? (
              <CardContent className="pt-0 space-y-2">
                {cvs.length > 0 ? (
                  cvs.map((cv) => (
                    <button
                      key={cv.id}
                      onClick={() => { setActiveCv(cv.id); setShowCVSelector(false); }}
                      className={cn(
                        'w-full p-2 rounded-lg border text-left transition-all text-sm',
                        activeCvId === cv.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                      )}
                    >
                      <span className="font-medium">{cv.name}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">No hay CVs cargados</p>
                )}
              </CardContent>
            ) : (
              <CardContent className="pt-0">
                {activeCV ? (
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                    <p className="font-medium text-sm">{activeCV.name}</p>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Selecciona un CV</p>
                )}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Idioma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium',
                      language === lang.id ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/50 text-text-muted'
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Message Type + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Tipo de Mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {MESSAGE_TEMPLATES.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => setSelectedTemplate(template.type)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      selectedTemplate === template.type ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                    )}
                    aria-pressed={selectedTemplate === template.type}
                  >
                    <span className="font-medium text-sm block">{template.label}</span>
                    <span className="text-xs text-text-muted">{template.description}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Tu nombre" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Juan Pérez" />
                <Input label="Reclutador (opcional)" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} placeholder="María García" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Puesto" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Frontend Developer" />
                <Input label="Empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Tech Corp" />
              </div>
              <Input label="Contexto adicional (opcional)" value={context} onChange={(e) => setContext(e.target.value)} placeholder="Detalles adicionales..." />
            </CardContent>
            <CardFooter className="pt-3">
              <Button onClick={handleGenerate} isLoading={isLoading} disabled={!candidateName} className="w-full">
                <Send className="w-4 h-4" />
                Generar Mensaje
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Row 3: Generated Message */}
        <div>
          {error && (
            <Card className="border-error bg-error/5 mb-4">
              <CardContent className="py-3 text-error text-sm">{error}</CardContent>
            </Card>
          )}

          {generatedMessage ? (
            <Card className="border-accent/30">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Mensaje Generado</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md border border-border whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedMessage}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="py-12 text-center text-text-muted">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">El mensaje generado aparecerá aquí</p>
                <p className="text-xs mt-1">Completa el formulario y genera un mensaje</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssistantPage;
