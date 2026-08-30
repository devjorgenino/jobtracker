import React, { useState } from 'react';
import { useStore } from '../context/store';
import { AIService } from '../services/ai/aiService';
import type { AIProvider, AIModelOption } from '../types/ai';
import { OMNIROUTE_MODELS, OPENROUTER_MODELS } from '../types/ai';
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { aiConfig, setAIConfig, resetAIConfig, exportBackup, importBackup, clearAllData } = useStore();

  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number; latencyMs?: number } | null>(null);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await AIService.testConnection(aiConfig);
      setTestResult(res);
      if (res.success) {
        toast.success(`✅ Conexión exitosa con ${aiConfig.provider.toUpperCase()} (${res.latency ?? res.latencyMs}ms)`);
      } else {
        toast.error(`❌ Error de conexión: ${res.message}`);
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error inesperado' });
      toast.error('Fallo en la prueba de conexión');
    } finally {
      setIsTesting(false);
    }
  };

  const handleExport = () => {
    const json = exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JobTracker_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Copia de seguridad descargada.');
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const success = importBackup(importText);
    if (success) {
      toast.success('¡Datos restaurados con éxito!');
      setShowImportModal(false);
      setImportText('');
    } else {
      toast.error('Formato de copia de seguridad inválido.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <h2 className="text-xl font-black text-slate-100 flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-blue-400" />
          Configuración de OmniRoute & Modelos de IA
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Conecta JobTracker a OmniRoute para ejecutar modelos gratuitos en la nube o localmente en tu computadora con cero costos.
        </p>
      </div>

      {/* AI Provider Config */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Proveedor de IA Activo
            </h3>
            <p className="text-[11px] text-slate-400">Selecciona la plataforma de inferencia</p>
          </div>

          <select
            value={aiConfig.provider}
            onChange={(e) => setAIConfig({ provider: e.target.value as AIProvider })}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-blue-400 focus:outline-none focus:border-blue-500"
          >
            <option value="omniroute">OmniRoute (Gratuito / Local)</option>
            <option value="openrouter">OpenRouter API</option>
            <option value="ollama">Ollama Local (localhost:11434)</option>
            <option value="huggingface">Hugging Face Inference</option>
            <option value="custom">Endpoint Personalizado (OpenAI-compatible)</option>
          </select>
        </div>

        {/* OmniRoute Specific Settings */}
        {aiConfig.provider === 'omniroute' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  OmniRoute Base URL
                </label>
                <input
                  type="text"
                  value={aiConfig.omnirouteBaseUrl}
                  onChange={(e) => setAIConfig({ omnirouteBaseUrl: e.target.value })}
                  placeholder="https://api.omniroute.ai/v1"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Usa <code className="text-slate-400">https://api.omniroute.ai/v1</code> o tu endpoint local <code className="text-slate-400">http://localhost:8000/v1</code>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  OmniRoute API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={aiConfig.omnirouteApiKey}
                    onChange={(e) => setAIConfig({ omnirouteApiKey: e.target.value })}
                    placeholder="or_live_... o déjalo vacío si es servidor local"
                    className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Model Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Modelo Recomendado (Gratuitos & Destacados)
                </label>
                <select
                  value={aiConfig.omnirouteModel}
                  onChange={(e) => setAIConfig({ omnirouteModel: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                >
                  {OMNIROUTE_MODELS.map((m: AIModelOption) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isFree ? '🎁 (Gratuito)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ID de Modelo Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  value={aiConfig.omnirouteModel}
                  onChange={(e) => setAIConfig({ omnirouteModel: e.target.value })}
                  placeholder="qwen/qwen-2.5-72b-instruct:free"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ollama Local Settings */}
        {aiConfig.provider === 'ollama' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ollama Local URL</label>
                <input
                  type="text"
                  value={aiConfig.localOllamaUrl}
                  onChange={(e) => setAIConfig({ localOllamaUrl: e.target.value })}
                  placeholder="http://localhost:11434/v1"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Modelo en Ollama</label>
                <input
                  type="text"
                  value={aiConfig.localOllamaModel}
                  onChange={(e) => setAIConfig({ localOllamaModel: e.target.value })}
                  placeholder="qwen2.5:7b o llama3.2:latest"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* OpenRouter Settings */}
        {aiConfig.provider === 'openrouter' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OpenRouter API Key</label>
                <input
                  type="password"
                  value={aiConfig.openrouterApiKey}
                  onChange={(e) => setAIConfig({ openrouterApiKey: e.target.value })}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo OpenRouter</label>
                <select
                  value={aiConfig.openrouterModel}
                  onChange={(e) => setAIConfig({ openrouterModel: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                >
                  {OPENROUTER_MODELS.map((m: AIModelOption) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isFree ? '🎁 (Gratis)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Connection Tester */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Prueba de Inferencia en Tiempo Real</span>
              {testResult && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {testResult.success ? `Conectado (${testResult.latency ?? testResult.latencyMs}ms)` : 'Error'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verifica que el modelo responda correctamente y mida la latencia de respuesta.
            </p>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Probar Conexión
              </>
            )}
          </button>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          Gestión de Datos & Copias de Seguridad
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Exportar Backup JSON
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            Restaurar Backup JSON
          </button>

          <button
            onClick={() => {
              if (confirm('¿Estás seguro de restablecer la configuración de IA a valores por defecto?')) {
                resetAIConfig();
                toast.success('Configuración de IA restablecida.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            Restablecer Ajustes de IA
          </button>

          <button
            onClick={() => {
              if (confirm('⚠️ ¿Estás seguro de borrar todas las vacantes guardadas? Esta acción no se puede deshacer.')) {
                clearAllData();
                toast.success('Datos eliminados.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Borrar Todas las Vacantes
          </button>
        </div>
      </div>

      {/* Modal Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Restaurar Copia de Seguridad JSON</h3>
            <p className="text-xs text-slate-400">Pega el contenido del archivo JSON de respaldo:</p>
            <form onSubmit={handleImport} className="space-y-4">
              <textarea
                rows={8}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"version": "2.0.0", "jobs": [...] }'
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Restaurar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
