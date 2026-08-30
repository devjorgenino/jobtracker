import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/store';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Puzzle,
  Send,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sun,
  Moon,
  Bot,
  Database,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useStore();

  // Interactive Demo Mockup State
  const [activeTab, setActiveTab] = useState<'kanban' | 'ats' | 'strategy'>('kanban');
  const [copiedPitch, setCopiedPitch] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopyPitch = () => {
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300 relative overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-80 left-1/3 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* ────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR
      ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                JobTracker{' '}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  AI Suite
                </span>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Career Copilot & ATS</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Características
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Demo en Vivo
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Cómo Funciona
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Nube & Seguridad
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Auth Actions & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Ir al Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Registrarse Gratis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────
          2. HERO SECTION
      ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8 shadow-inner hover:bg-blue-500/15 transition-all">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>JobTracker AI v2.0 • Sincronización Supabase Cloud & Multi-Modelo IA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          El copiloto de IA para <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            conquistar tu próximo empleo tech
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Gestiona todas tus postulaciones en un tablero Kanban inteligente, adapta tu CV
          automáticamente para superar filtros ATS y genera mensajes de contacto hiper-personalizados
          en segundos.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Abrir mi Tablero Kanban</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Comenzar Ahora — Es Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white text-sm font-semibold border border-slate-800 hover:border-slate-700 transition-all"
              >
                <span>Iniciar Sesión</span>
              </Link>
            </>
          )}
        </div>

        {/* Micro Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            100% Gratuito y Open-Core
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Datos seguros con Supabase RLS
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Compatible con Ollama Local & Cloud AI
          </span>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          3. INTERACTIVE PRODUCT SHOWCASE / MOCKUP
      ──────────────────────────────────────────────────────────── */}
      <section id="demo" className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 z-10">
        <div className="rounded-3xl p-1 bg-gradient-to-b from-slate-800 via-slate-900/70 to-slate-950 shadow-2xl shadow-blue-500/10 border border-slate-800/80">
          <div className="rounded-[22px] bg-slate-950 overflow-hidden">
            {/* Mockup Window Top Bar */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                  jobtracker-ai.app/dashboard
                </span>
              </div>

              {/* Showcase Tab Selector */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === 'kanban'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Tablero Kanban</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ats')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === 'ats'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimizador ATS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('strategy')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === 'strategy'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Outreach & Pitch</span>
                </button>
              </div>
            </div>

            {/* Showcase Dynamic Content */}
            <div className="p-6 sm:p-8 min-h-[420px] flex items-center justify-center">
              {activeTab === 'kanban' && (
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Columna 1: Postuladas */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Postuladas (4)
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">$75k - $95k</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-sm hover:border-slate-700 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white">Senior Frontend React</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                            94% ATS
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Stripe • Remoto Global</p>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            React
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            TypeScript
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400">
                            $90,000/yr
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white">Fullstack TypeScript</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                            88% ATS
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Vercel • Remoto LATAM</p>
                      </div>
                    </div>
                  </div>

                  {/* Columna 2: Entrevista Técnica */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Entrevista Técnica (2)
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">$95k - $120k</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">Lead Frontend Architect</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 animate-pulse">
                          Próx. Jueves 15:00
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Linear • Remoto</p>
                      <p className="text-[10px] text-indigo-300 mt-2 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                        💡 Prep de Sistema Distribuido y React Server Components lista
                      </p>
                    </div>
                  </div>

                  {/* Columna 3: Oferta Recibida */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Ofertas (1)
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">$115k</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-500/40 shadow-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-300">🎉 Oferta Formal</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          Aceptada
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">Supabase • Staff Engineer</p>
                      <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Compensación:</span>
                        <span className="font-bold text-emerald-400 font-mono">$115,000 USD/yr</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ats' && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs text-slate-400">Diagnóstico de Compatibilidad</span>
                        <h4 className="text-sm font-bold text-white">Vacante: Senior React Engineer</h4>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400">
                        <span className="text-lg font-extrabold leading-none">94</span>
                        <span className="text-[9px] font-bold uppercase">/100</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Alineación de Palabras Clave</span>
                          <span className="text-emerald-400 font-bold">96%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Impacto Cuantificable (Métricas)</span>
                          <span className="text-blue-400 font-bold">90%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-[90%]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-xs text-slate-300 font-medium mb-2">
                        Palabras clave integradas automáticamente:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['React 19', 'Next.js App Router', 'Zustand', 'TypeScript', 'GraphQL', 'CI/CD'].map(
                          (tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                            >
                              ✓ {tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                      Generación Adaptada
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1 mb-3">
                      Extracto Profesional Optimizado
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono">
                      "Ingeniero de Software Senior especializado en React y ecosistemas TypeScript. Con
                      más de 5 años optimizando arquitecturas frontend de alto tráfico, logrando una
                      reducción del 42% en TTI (Time to Interactive) y liderando la migración a Next.js
                      con cobertura de pruebas del 92%."
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>✓ Formato ATS Clean Plain Text / PDF</span>
                      <span className="text-emerald-400 font-medium">Exportación Lista</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="w-full max-w-3xl p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          Mensaje de Conexión LinkedIn para Reclutador
                        </h4>
                        <p className="text-[11px] text-slate-400">Calibrado con el perfil de Stripe Tech Talent</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPitch}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all cursor-pointer"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-sans leading-relaxed">
                    "Hola Sarah, vi la búsqueda de Stripe para el rol de Senior Frontend. Cuento con 5+
                    años escalando interfaces con React y TypeScript, reduciendo tiempos de carga en un
                    40%. Me entusiasma el enfoque de Stripe en Developer Experience y me gustaría
                    conversar brevemente sobre cómo puedo aportar valor inmediato a su equipo. ¡Un saludo!"
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 block">Tono</span>
                      <span className="font-bold text-white">Directo & Profesional</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 block">Límite Caracteres</span>
                      <span className="font-bold text-emerald-400">284 / 300 (LinkedIn OK)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 block">Tasa Respuesta Est.</span>
                      <span className="font-bold text-blue-400">~68%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          4. STATS & SOCIAL PROOF BAR
      ──────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-y border-slate-800/80 bg-slate-950/60 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              3.8x
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
              Más invitaciones a entrevistas técnicas
            </p>
          </div>

          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              94%
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
              Compatibilidad ATS promedio alcanzada
            </p>
          </div>

          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              &lt; 30s
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
              Para adaptar tu CV a cualquier oferta
            </p>
          </div>

          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-300">
              100%
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
              Control y privacidad de tus datos
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          5. BENTO GRID FEATURES SECTION
      ──────────────────────────────────────────────────────────── */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Arquitectura de Alto Rendimiento
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Todo lo necesario para liderar tu búsqueda de empleo
          </p>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Diseñado para ingenieros y profesionales de software que buscan eficiencia, métricas claras
            y personalización de impacto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Kanban (2 Columns) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/15 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Tablero Kanban con Métricas Salariales & Seguimiento 360°
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Organiza cada proceso desde la postulación inicial hasta la oferta firmada. Visualiza
                rangos salariales acumulados, estados de entrevistas técnicas y añade notas de feedback
                en un clic.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-blue-400" />
                Drag & Drop fluido
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-blue-400" />
                Filtros por stacks & modalidad
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-blue-400" />
                Estadísticas de conversión
              </span>
            </div>
          </div>

          {/* Card 2: ATS Scanner (1 Column) */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Escáner ATS Inteligente</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Analiza las ofertas de trabajo frente a tu CV Maestro. Detecta palabras clave ausentes y
                genera adaptaciones con puntajes superiores al 90%.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Supera filtros automáticos de RRHH
            </div>
          </div>

          {/* Card 3: Chrome Extension (1 Column) */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-600/15 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Puzzle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Extensión Web (1-Clic)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Captura ofertas completas desde LinkedIn, Get on Board o portales de empleo directo con
                un solo clic sin copiar ni pegar manualmente.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
              Sincronización instantánea con tu tablero
            </div>
          </div>

          {/* Card 4: Supabase Cloud & RLS (2 Columns) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Sincronización en la Nube con Supabase + Row Level Security (RLS)
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Accede a tu información desde cualquier navegador. Con Row Level Security activado a
                nivel de base de datos PostgreSQL, nadie excepto tú puede acceder a tus vacantes, notas
                o currículum.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" />
                Cifrado y aislamiento por usuario
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Login con Google OAuth 2.0 PKCE
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Sincronización bidireccional en tiempo real
              </span>
            </div>
          </div>

          {/* Card 5: OmniRoute Multi-Provider AI (1.5 Column) */}
          <div className="md:col-span-1 p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-600/15 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">OmniRoute AI: Nube o Local</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Conecta tus propias claves de OpenAI, Claude, Gemini, DeepSeek o ejecuta Ollama de forma
                100% local en tu ordenador con cero coste de API.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-purple-400 font-medium">
              Tus claves API no salen de tu entorno
            </div>
          </div>

          {/* Card 6: Outreach & Pitch Generator (2 Columns) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-600/15 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Generador de Cartas de Presentación & Outreach Directo
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Crea mensajes de conexión para LinkedIn con el límite exacto de caracteres, correos de
                seguimiento y guías de preguntas técnicas para entrevistas en segundos.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-rose-400" />
                Mensajes calibrados por empresa
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-rose-400" />
                Guía de preguntas STAR para entrevistas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          6. HOW IT WORKS (3 SIMPLE STEPS)
      ──────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
            Flujo de Trabajo Simplificado
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">De la postulación a la oferta en 3 pasos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-md shadow-blue-500/30">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2">Captura la Vacante</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Usa la extensión o crea la vacante manualmente. El sistema extrae automáticamente salario,
              empresa, requerimientos y stack tecnológico.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-md shadow-indigo-500/30">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2">Optimiza con IA en 30s</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              El motor ATS ajusta tu perfil resaltando tus logros más relevantes para esa vacante
              específica y aumentando tu puntaje de coincidencia.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-md shadow-purple-500/30">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2">Supera la Entrevista</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Genera tu mensaje de contacto para reclutadores, repasa las posibles preguntas técnicas y
              avanza las fases en tu tablero Kanban.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          7. BEFORE vs AFTER COMPARISON TABLE
      ──────────────────────────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Comparativa
          </h2>
          <p className="text-3xl font-extrabold text-white">¿Por qué cambiar tu método de búsqueda?</p>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Sin JobTracker AI */}
            <div className="p-6 sm:p-8 bg-rose-950/10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-rose-400 font-bold text-sm uppercase tracking-wider">
                  ❌ Búsqueda Tradicional
                </span>
              </div>
              <ul className="space-y-4 text-xs text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Hojas de Excel desordenadas y enlaces rotos de ofertas.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Mismo CV genérico enviado a cientos de puestos (filtrado por ATS).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Horas redactando cartas de presentación repetitivas.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Falta de claridad sobre rangos salariales y fases de entrevista.</span>
                </li>
              </ul>
            </div>

            {/* Con JobTracker AI */}
            <div className="p-6 sm:p-8 bg-blue-950/20">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Con JobTracker AI Suite
                </span>
              </div>
              <ul className="space-y-4 text-xs text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Tablero Kanban unificado con sincronización en la nube multidispositivo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>CV adaptado en 30 segundos con más del 90% de coincidencia ATS.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pitch directo calibrado para conectar con reclutadores en LinkedIn.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Datos 100% privados protegidos por Row Level Security y modelos locales.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          8. SECURITY & PRIVACY SECTION
      ──────────────────────────────────────────────────────────── */}
      <section id="security" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/30 via-slate-900/90 to-indigo-950/30 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <ShieldCheck className="w-4 h-4" />
                Seguridad & Privacidad de Primer Nivel
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Tus datos laborales son tuyos y de nadie más.
              </h2>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                A diferencia de otras plataformas que comparten tus datos con terceros, JobTracker AI
                emplea políticas RLS en Supabase y te permite conectar tus propias APIs o ejecutar
                modelos en local con Ollama.
              </p>
              <div className="mt-6 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Políticas PostgreSQL Row Level Security estrictas por UID de usuario.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Exportación de copias de seguridad en formato JSON cuando desees.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Soporte BYOK (Bring Your Own Key) para OpenAI, Claude y Gemini.</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span>security_policy.sql</span>
                <span className="text-emerald-400 font-bold">RLS ACTIVE</span>
              </div>
              <p className="text-slate-500">// Row Level Security en PostgreSQL</p>
              <p className="text-blue-400">
                CREATE POLICY "Users can only access own jobs"
              </p>
              <p className="text-indigo-300 pl-4">ON public.jobs FOR ALL</p>
              <p className="text-purple-300 pl-4">
                USING (auth.uid() = user_id);
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                ✓ Cero fuga de información • ✓ Aislamiento total de perfiles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          9. FAQ ACCORDION
      ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Dudas Habituales
          </h2>
          <p className="text-3xl font-extrabold text-white">Preguntas Frecuentes</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: '¿JobTracker AI es realmente gratuito?',
              a: 'Sí, la plataforma es 100% gratuita. Puedes utilizarla conectando tus propias API keys (OpenAI, Claude, DeepSeek, Gemini) o utilizando modelos locales gratuitos con Ollama en tu propio ordenador sin pagar nada por tokens.',
            },
            {
              q: '¿Cómo funciona la sincronización con Supabase?',
              a: 'Al registrarte o iniciar sesión con correo o Google OAuth, tus vacantes, CV maestro y estrategias se sincronizan de forma segura con PostgreSQL en Supabase, permitiéndote acceder desde cualquier navegador y dispositivo.',
            },
            {
              q: '¿Puedo usarlo sin conexión o con IA 100% local?',
              a: 'Por supuesto. La aplicación almacena los datos de forma local con Zustand e IndexedDB y te permite seleccionar Ollama como proveedor de IA en Ajustes, funcionando completamente offline.',
            },
            {
              q: '¿Cómo instalo la extensión web de captura en 1 clic?',
              a: 'Ve a la sección "Extensión Web" en el menú lateral para descargar la carpeta de la extensión y sigue las instrucciones para cargarla descomprimida en Chrome, Edge o Brave en menos de 1 minuto.',
            },
            {
              q: '¿Cómo optimiza el CV para los filtros ATS?',
              a: 'La IA analiza la descripción completa del puesto, extrae las competencias requeridas, calcula una puntuación de coincidencia (0-100%) e integra los logros y palabras clave exactas en tu perfil sin inventar información.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/90 transition-colors"
              >
                <span className="text-sm font-bold text-white">{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          10. FINAL CALL TO ACTION (CTA)
      ──────────────────────────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-blue-900/40 via-indigo-950/60 to-slate-950 border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              ¿Listo para transformar tu búsqueda laboral y conseguir el trabajo que buscas?
            </h2>
            <p className="text-slate-300 text-sm mt-4 leading-relaxed">
              Únete a desarrolladores y profesionales tech que ya optimizan sus postulaciones con
              inteligencia artificial.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Ir a mi Tablero Kanban</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Crear Cuenta Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
                  >
                    <span>Acceder a mi Cuenta</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          11. FOOTER
      ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-300">JobTracker AI Suite</p>
              <p className="text-[11px]">Plataforma integral de postulación para desarrolladores</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">
              Características
            </a>
            <a href="#demo" className="hover:text-slate-300 transition-colors">
              Demo
            </a>
            <a href="#security" className="hover:text-slate-300 transition-colors">
              Seguridad
            </a>
            <a href="#faq" className="hover:text-slate-300 transition-colors">
              FAQ
            </a>
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              Login
            </Link>
            <Link to="/register" className="hover:text-slate-300 transition-colors">
              Registro
            </Link>
          </div>

          <div className="text-center md:text-right text-[11px]">
            <p>© {new Date().getFullYear()} JobTracker AI. Todos los derechos reservados.</p>
            <p className="text-slate-600 mt-1">Desarrollado con React, TypeScript, Tailwind & Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
