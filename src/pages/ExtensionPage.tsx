import React, { useState, useEffect } from 'react';
import { useStore } from '../context/store';
import { ExtensionSyncService } from '../services/sync/extensionSync';
import {
  Puzzle,
  Sparkles,
  Terminal,
  Zap,
  Globe,
  Copy,
  Check,
  RefreshCw,
  FileJson,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const ExtensionPage: React.FC = () => {
  const { addJob, jobs } = useStore();
  const [copied, setCopied] = useState(false);
  const [isExtensionDetected, setIsExtensionDetected] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);

  const extensionPath = 'C:\\Users\\jorge\\OneDrive\\Documents\\GitHub\\jobtracker\\extension';

  useEffect(() => {
    // Check if extension injected the global flag
    if ((window as any).__JOBTRACKER_EXTENSION_INSTALLED__) {
      setIsExtensionDetected(true);
    }

    const onReady = () => setIsExtensionDetected(true);
    window.addEventListener('jobtracker:extension-ready', onReady);
    return () => window.removeEventListener('jobtracker:extension-ready', onReady);
  }, []);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(extensionPath);
    setCopied(true);
    toast.success('Ruta copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncNow = () => {
    ExtensionSyncService.requestExtensionSync();
    toast.info('Buscando vacantes guardadas en la extensión...', { duration: 3000 });
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      toast.error('Por favor pega el JSON de la vacante.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item.position || item.title || item.company) {
            addJob(item);
          }
        });
        toast.success(`✅ ${parsed.length} vacantes importadas correctamente.`);
      } else if (parsed.position || parsed.title || parsed.company) {
        addJob(parsed);
        toast.success(`✅ Vacante "${parsed.position || parsed.title}" importada.`);
      } else {
        toast.error('El formato JSON no contiene campos válidos de vacante.');
        return;
      }
      setJsonInput('');
      setShowJsonModal(false);
    } catch (e: any) {
      toast.error(`Error al procesar JSON: ${e.message}`);
    }
  };

  const handleTestCapture = () => {
    const testJob = {
      id: 'job_test_' + Date.now(),
      position: 'Senior React & AI Developer (Remote)',
      company: 'OmniRoute Cloud Inc.',
      location: 'Global / Remoto',
      workMode: 'Remoto' as const,
      salary: '$5,000 - $7,500 USD / mes',
      url: 'https://www.linkedin.com/jobs/view/test-jobtracker-remote',
      portal: 'LinkedIn',
      status: 'wishlist' as const,
      priority: 'high' as const,
      techStack: ['React', 'TypeScript', 'Node.js', 'OmniRoute AI', 'Tailwind CSS'],
      contactName: 'Sarah Jenkins (Lead Tech Recruiter)',
      contactEmail: 'talent@omniroute.ai',
      description: 'Estamos buscando un Senior Frontend & AI Engineer remoto para liderar la arquitectura de aplicaciones web impulsadas por modelos de lenguaje locales y en la nube. Requisitos: TypeScript, React, integración de LLMs y mentalidad orientada a producto.',
      requirements: '5+ años de experiencia, dominio de React y TypeScript, inglés B2+',
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      activities: [
        {
          id: 'act_' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'created' as const,
          description: 'Vacante de prueba simulada desde el Sync Hub.',
        },
      ],
    };

    addJob(testJob);
    toast.success('🎯 ¡Vacante de prueba recibida y sincronizada en el Tablero!');
  };

  const supportedPortals = [
    { name: 'LinkedIn Jobs', badge: '1-Click Directo', desc: 'Detección de puesto, empresa, stack, reclutador y enlace' },
    { name: 'Indeed', badge: '1-Click Directo', desc: 'Soporte para indeed.com, es.indeed.com, co.indeed.com, etc.' },
    { name: 'InfoJobs', badge: '1-Click Directo', desc: 'Extracción completa de ofertas en infojobs.net' },
    { name: 'CompuTrabajo', badge: '1-Click Directo', desc: 'Compatible con todos los dominios LATAM (.com, .com.co, .com.mx, .pe, etc.)' },
    { name: 'Get on Board', badge: '1-Click Directo', desc: 'Extracción de ofertas remotas y salarios en getonbrd.com' },
    { name: 'Glassdoor', badge: '1-Click Directo', desc: 'Captura de ofertas y compensaciones estimadas' },
    { name: 'Torre.ai', badge: '1-Click Directo', desc: 'Detección de habilidades y detalles de compensación' },
    { name: 'We Work Remotely', badge: '1-Click Directo', desc: 'Ofertas 100% remotas globales' },
    { name: 'Cualquier Web (Parser Genérico)', badge: 'Smart JSON-LD', desc: 'Extrae con IA y metadatos de cualquier portal de empleo del mundo' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-slate-900 p-6 rounded-3xl border border-blue-200/80 dark:border-blue-500/20 shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Puzzle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Extensión de Navegador JobTracker AI (1-Clic)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Captura cualquier oferta de empleo en LinkedIn, Indeed, InfoJobs, CompuTrabajo, Get on Board o cualquier portal con 1 solo clic y sincronízala automáticamente con esta plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncNow}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sincronizar con Extensión
          </button>

          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            Importar JSON
          </button>

          <button
            onClick={handleTestCapture}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Simular Captura
          </button>
        </div>
      </div>

      {/* Sync Status Diagnostic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Estado de Sincronización</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Canal Activo (Multi-Bridge)
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            En línea
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Vacantes en la App</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1">
              {jobs.length} ofertas registradas
            </div>
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20 font-semibold">
            LocalStorage + Zustand
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Detección de Extensión</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1">
              {isExtensionDetected ? 'Extensión Detectada' : 'Modo Universal Listo'}
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${isExtensionDetected ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            {isExtensionDetected ? 'Conectado' : 'Instalación Manual'}
          </span>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Pasos de Instalación en Chrome, Edge o Brave (Manifest V3)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center mb-3">
                1
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Abre Extensiones</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Ingresa en tu navegador a <code className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1 py-0.5 rounded">chrome://extensions/</code> o <code className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1 py-0.5 rounded">edge://extensions/</code> y activa el <b>Modo de Desarrollador</b> (arriba a la derecha).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center mb-3">
                2
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Cargar Descomprimida</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Haz clic en el botón <b>"Cargar descomprimida" (Load unpacked)</b> y selecciona la carpeta de la extensión en tu disco local.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center mb-3">
                3
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">¡Listo para usar!</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Navega a LinkedIn o cualquier portal. Verás el botón flotante y el ícono de JobTracker para guardar con 1 clic.
              </p>
            </div>
          </div>
        </div>

        {/* Path Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-blue-200 dark:border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Ruta Local de la Extensión</div>
              <div className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate">{extensionPath}</div>
            </div>
          </div>

          <button
            onClick={handleCopyPath}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-500/30 shrink-0 cursor-pointer transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiada' : 'Copiar Ruta'}
          </button>
        </div>
      </div>

      {/* Supported Portals */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Portales con Extracción Especializada Soportados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {supportedPortals.map((p) => (
            <div key={p.name} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  {p.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for manual JSON paste */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Pegar / Importar Vacante en JSON
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pega aquí el JSON generado por el botón "Copiar JSON" de la extensión si deseas importarlo de forma inmediata.
            </p>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{\n  "position": "Frontend Developer",\n  "company": "Tech Corp",\n  "salary": "$4,000 USD",\n  "location": "Remoto"\n}'
              className="w-full h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportJson}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
              >
                Importar al Tablero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
