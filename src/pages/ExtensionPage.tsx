import React, { useState } from 'react';
import { useStore } from '../context/store';
import {
  Puzzle,
  Sparkles,
  Terminal,
  Zap,
  Globe,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const ExtensionPage: React.FC = () => {
  const { addJob } = useStore();
  const [copied, setCopied] = useState(false);

  const extensionPath = 'C:\\Users\\jorge\\OneDrive\\Documents\\GitHub\\jobtracker\\extension';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(extensionPath);
    setCopied(true);
    toast.success('Ruta copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-blue-500/20 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2.5">
            <Puzzle className="w-6 h-6 text-blue-400" />
            Extensión de Navegador JobTracker AI (1-Clic)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Captura cualquier oferta de empleo en LinkedIn, Indeed, InfoJobs, CompuTrabajo, Get on Board o cualquier portal con 1 solo clic y sincronízala automáticamente con esta plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestCapture}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            Simular Captura de Vacante
          </button>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Cómo Instalar la Extensión en Chrome, Edge o Brave (30 Segundos)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-200">Abre Extensiones</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              En tu navegador abre la URL: <br />
              <code className="text-blue-400 font-mono text-[10px]">chrome://extensions/</code> o <code className="text-blue-400 font-mono text-[10px]">edge://extensions/</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-200">Modo Desarrollador</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Activa el interruptor <span className="text-slate-200 font-semibold">"Modo desarrollador"</span> en la esquina superior derecha.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-200">Cargar Descomprimida</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Haz clic en el botón <span className="text-slate-200 font-semibold">"Cargar descomprimida" (Load unpacked)</span>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h4 className="text-xs font-bold text-slate-200">Seleccionar Carpeta</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Selecciona la carpeta <code className="text-blue-400 font-mono text-[10px]">extension</code> dentro de este proyecto.
            </p>
          </div>
        </div>

        {/* Copy Path Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <Terminal className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ruta Local de la Extensión
              </span>
              <code className="text-xs text-slate-200 font-mono truncate block">
                {extensionPath}
              </code>
            </div>
          </div>

          <button
            onClick={handleCopyPath}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            Copiar Ruta
          </button>
        </div>
      </div>

      {/* Portales Soportados */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          Portales de Empleo con Soporte Nativo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {supportedPortals.map((p, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{p.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {p.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
