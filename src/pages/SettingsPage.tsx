import { useState, useEffect } from 'react';
import { Settings, Key, Globe, Check } from 'lucide-react';
import { qwenService, type AIProvider } from '@/services/qwen';
import { useAppStore } from '@/context/store';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Input } from '@/components/common';
import { cn } from '@/utils/cn';

const PROVIDERS: Array<{ id: AIProvider; label: string; description: string }> = [
  { id: 'openrouter', label: 'OpenRouter', description: 'API pública con modelos Qwen' },
  { id: 'huggingface', label: 'Hugging Face', description: 'Inference API de Hugging Face' },
  { id: 'local', label: 'Servidor Local', description: 'Ollama u otro servidor local' },
];

export function SettingsPage() {
  const { aiConfig } = useAppStore();
  const [provider, setProvider] = useState<AIProvider>(aiConfig.provider || 'openrouter');
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(aiConfig.baseUrl || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    qwenService.loadConfigFromStore();
  }, []);

  useEffect(() => {
    setProvider(aiConfig.provider);
    setApiKey(aiConfig.apiKey || '');
    setBaseUrl(aiConfig.baseUrl || '');
  }, [aiConfig]);

  const handleSave = () => {
    qwenService.setConfig({ apiKey, baseUrl }, provider);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuración
          </h1>
          <p className="text-text-muted">Configura tu API de IA</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Proveedor de IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all',
                      provider === p.id
                        ? 'border-accent bg-blue-50'
                        : 'border-border hover:border-accent'
                    )}
                  >
                    <span className="font-medium block">{p.label}</span>
                    <span className="text-sm text-text-muted">{p.description}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Credenciales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="API Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'local' ? 'No requerido' : 'Tu API key'}
              />
              {provider === 'local' && (
                <Input
                  label="URL del servidor"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434/api"
                />
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                {saved ? <Check className="w-4 h-4" /> : null}
                {saved ? 'Guardado' : 'Guardar'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted space-y-2">
              <p>Esta aplicación usa modelos Qwen para:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Optimizar tu CV para pasar filtros ATS</li>
                <li>Generar cartas de presentación</li>
                <li>Crear mensajes profesionales para reclutadores</li>
              </ul>
              <p className="mt-4">
                Para usar las funciones de IA, necesitas una API key de OpenRouter o Hugging Face.
                También puedes usar un servidor local con Ollama.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
