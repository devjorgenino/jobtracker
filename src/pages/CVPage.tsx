import React, { useState, useRef } from 'react';
import { useStore } from '../context/store';
import { CVParserService } from '../services/cv/cvParserService';
import { CVTranslationService } from '../services/cv/cvTranslationService';
import { ATSPDFService } from '../services/pdf/atsPdfGenerator';
import { ATSService } from '../services/hr/atsService';
import { Badge } from '../components/common/Badge';
import {
  Upload,
  FileText,
  Sparkles,
  Save,
  Download,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Wrench,
  User,
  FolderGit2,
  Award,
  Globe,
  RefreshCw,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type {
  MasterCV,
  WorkExperience,
  Education,
  SkillCategory,
  Project,
  Certification,
  Language,
} from '../types/cv';

export const CVPage: React.FC = () => {
  const { masterCV, setMasterCV, aiConfig } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<
    'upload' | 'personal' | 'experience' | 'skills' | 'education' | 'projects' | 'certifications' | 'raw'
  >('upload');

  const [isExtracting, setIsExtracting] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Form State initialized from store's masterCV
  const [cvForm, setCvForm] = useState<MasterCV>(masterCV);

  // Sync with store if masterCV updates externally
  React.useEffect(() => {
    setCvForm(masterCV);
  }, [masterCV]);

  // Real-time ATS baseline analysis of master CV
  const atsAnalysis = React.useMemo(() => {
    const dummyJob = {
      id: 'baseline',
      position: cvForm.personalInfo?.roleTitle || 'Software Engineer',
      company: 'Tech Industry',
      url: '',
      location: 'Remoto',
      workMode: 'Remoto' as const,
      salary: '',
      description: 'Experiencia con desarrollo de software, liderazgo de proyectos, arquitectura de sistemas, bases de datos y buenas prácticas.',
      requirements: '',
      techStack: cvForm.skillCategories?.flatMap((c) => c.skills) || [],
      portal: 'Directo',
      status: 'wishlist' as const,
      priority: 'medium' as const,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    };
    return ATSService.analyze(cvForm, dummyJob);
  }, [cvForm]);

  // --- Handlers ---

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsExtracting(true);
    setUploadedFileName(file.name);
    toast.info(`📄 Procesando archivo "${file.name}"...`, { duration: 3000 });

    try {
      const rawText = await CVParserService.extractTextFromFile(file);

      if (!rawText || rawText.trim().length < 20) {
        toast.error('No se pudo extraer texto suficiente del archivo.');
        setIsExtracting(false);
        return;
      }

      // 1. First extract with fast heuristic
      const parsedHeuristic = CVParserService.parseHeuristic(rawText, file.name);

      const updatedCV: MasterCV = {
        ...parsedHeuristic,
        rawText,
        updatedAt: new Date().toISOString(),
      };

      setCvForm(updatedCV);
      setMasterCV(updatedCV);

      toast.success(
        `✅ CV extraído con éxito (${rawText.length} caracteres). Puedes estructurarlo con IA o editarlo.`
      );
      setActiveTab('personal');
    } catch (err: any) {
      console.error('Extraction error:', err);
      toast.error('Error al extraer texto del archivo: ' + (err.message || 'Formato no soportado'));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAiStructure = async () => {
    const textToParse = cvForm.rawText || JSON.stringify(cvForm);
    if (!textToParse || textToParse.trim().length < 30) {
      toast.error('No hay texto de CV para analizar. Sube un archivo o escribe tu texto.');
      return;
    }

    setIsAiParsing(true);
    toast.info('🪄 Estructurando tu CV con IA (OmniRoute)...', { duration: 4000 });

    try {
      const parsedAi = await CVParserService.parseWithAI(
        textToParse,
        aiConfig,
        uploadedFileName || cvForm.title
      );

      const finalCV: MasterCV = {
        ...parsedAi,
        rawText: cvForm.rawText,
        updatedAt: new Date().toISOString(),
      };

      setCvForm(finalCV);
      setMasterCV(finalCV);
      toast.success('🎉 ¡CV estructurado y enriquecido con éxito por IA!');
      setActiveTab('personal');
    } catch (err: any) {
      console.error('AI parse error:', err);
      toast.error('Error al estructurar con IA. Verifica tu configuración en Ajustes.');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSaveCV = () => {
    const updated = {
      ...cvForm,
      updatedAt: new Date().toISOString(),
    };
    setMasterCV(updated);
    toast.success('💾 CV Maestro guardado correctamente en el sistema.');
  };

  const handleDownloadPDF = async (lang: 'es' | 'en' = 'es') => {
    setIsGeneratingPdf(true);
    toast.info(`Generando PDF ATS optimizado (${lang.toUpperCase()})...`);
    try {
      let cvToRender = cvForm;
      // If downloading in English and AI is configured, perform real translation
      if (lang === 'en' && aiConfig) {
        toast.info('Traduciendo contenido al inglés con IA...');
        cvToRender = await CVTranslationService.translateCV(cvForm, 'en', aiConfig);
      }
      const name = (cvToRender.personalInfo?.name || 'CV').replace(/\s+/g, '_');
      await ATSPDFService.downloadPDF(cvToRender, lang, `${name}_${lang.toUpperCase()}.pdf`);
      toast.success(`📥 PDF (${lang.toUpperCase()}) descargado exitosamente.`);
    } catch (e: any) {
      console.error('PDF error:', e);
      toast.error('Error al generar el PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- Helpers to update specific sections ---

  const updatePersonalInfo = (field: string, value: string) => {
    setCvForm((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: 'exp_' + Date.now(),
      company: 'Nueva Empresa',
      role: 'Cargo / Rol',
      location: 'Remoto',
      startDate: '2023',
      endDate: 'Presente',
      current: true,
      achievements: ['Logro 1 utilizando la fórmula STAR/XYZ'],
      technologies: ['TypeScript', 'React'],
    };
    setCvForm((prev) => ({
      ...prev,
      workExperience: [newExp, ...(prev.workExperience || [])],
    }));
  };

  const updateExperience = (id: string, updated: Partial<WorkExperience>) => {
    setCvForm((prev) => ({
      ...prev,
      workExperience: (prev.workExperience || []).map((exp) =>
        exp.id === id ? { ...exp, ...updated } : exp
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setCvForm((prev) => ({
      ...prev,
      workExperience: (prev.workExperience || []).filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: 'edu_' + Date.now(),
      institution: 'Universidad / Instituto',
      degree: 'Título o Certificado',
      startDate: '2019',
      endDate: '2023',
      current: false,
    };
    setCvForm((prev) => ({
      ...prev,
      education: [...(prev.education || []), newEdu],
    }));
  };

  const updateEducation = (id: string, updated: Partial<Education>) => {
    setCvForm((prev) => ({
      ...prev,
      education: (prev.education || []).map((edu) =>
        edu.id === id ? { ...edu, ...updated } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setCvForm((prev) => ({
      ...prev,
      education: (prev.education || []).filter((edu) => edu.id !== id),
    }));
  };

  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      categoryName: 'Nueva Categoría',
      skills: ['Habilidad 1', 'Habilidad 2'],
    };
    setCvForm((prev) => ({
      ...prev,
      skillCategories: [...(prev.skillCategories || []), newCat],
    }));
  };

  const updateSkillCategory = (idx: number, updated: SkillCategory) => {
    setCvForm((prev) => {
      const cats = [...(prev.skillCategories || [])];
      cats[idx] = updated;
      return { ...prev, skillCategories: cats };
    });
  };

  const removeSkillCategory = (idx: number) => {
    setCvForm((prev) => ({
      ...prev,
      skillCategories: (prev.skillCategories || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-blue-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-blue-400" />
              Gestión de CV Maestro
            </h2>
            <Badge variant="primary">Fuente de Verdad del Sistema</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Sube tu currículum en formato <strong>PDF, Word (DOCX) o Texto</strong>. El sistema extraerá toda tu trayectoria, proyectos y habilidades para generar CVs adaptados con IA para cada vacante y redactar estrategias de contacto personalizadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSaveCV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-950/50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>

          <div className="flex items-center bg-slate-850 p-0.5 rounded-xl border border-slate-700/80 shadow-sm">
            <button
              onClick={() => handleDownloadPDF('es')}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer border-r border-slate-700"
              title="Descargar PDF ATS en Español"
            >
              {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <Download className="w-3.5 h-3.5 text-blue-400" />}
              PDF (ES)
            </button>
            <button
              onClick={() => handleDownloadPDF('en')}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
              title="Download ATS PDF in English"
            >
              {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-emerald-400" />}
              PDF (EN)
            </button>
          </div>

          <Link
            to="/optimize"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Optimizar para Vacante
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* CV Status Summary Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Candidato Activo</div>
            <div className="text-sm font-black text-slate-200 truncate">
              {cvForm.personalInfo?.name || 'Sin Nombre'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {cvForm.personalInfo?.roleTitle || 'Sin Título'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Experiencias</div>
            <div className="text-sm font-black text-slate-200">
              {cvForm.workExperience?.length || 0} Puestos registrados
            </div>
            <div className="text-[11px] text-emerald-400">
              {cvForm.workExperience?.some((e) => e.current) ? '• Actualmente empleado' : '• Disponible'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Habilidades Totales</div>
            <div className="text-sm font-black text-slate-200">
              {cvForm.skillCategories?.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0) || 0} Habilidades
            </div>
            <div className="text-[11px] text-slate-400">
              {cvForm.skillCategories?.length || 0} Categorías
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score ATS Base</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-blue-400">{atsAnalysis.overallScore}%</span>
              <Badge variant={atsAnalysis.overallScore >= 80 ? 'success' : 'warning'}>
                Grado {atsAnalysis.grade}
              </Badge>
            </div>
            <div className="text-[10px] text-slate-500">Calidad estructural base</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400">
            ATS
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          Subir Archivo de CV
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <User className="w-4 h-4" />
          Datos Personales
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'experience'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Experiencia ({cvForm.workExperience?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'skills'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Habilidades ({cvForm.skillCategories?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'education'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Educación ({cvForm.education?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          Proyectos ({cvForm.projects?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'certifications'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Award className="w-4 h-4" />
          Certificaciones & Idiomas
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'raw'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Texto Extraído
        </button>
      </div>

      {/* TAB 1: UPLOAD & EXTRACTION */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all bg-slate-900/40 ${
              dragOver
                ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.txt,.md,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-100">
              Arrastra y suelta tu CV aquí, o haz clic para seleccionarlo
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              Soporta archivos <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong>, <strong>Texto Plano (.txt, .md)</strong> o <strong>JSON (.json)</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-xl shadow-blue-950/60 transition-all cursor-pointer"
              >
                {isExtracting ? 'Extrayendo texto del archivo...' : 'Seleccionar Archivo de mi Equipo'}
              </button>

              {cvForm.rawText && (
                <button
                  type="button"
                  onClick={handleAiStructure}
                  disabled={isAiParsing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-xl transition-all cursor-pointer"
                >
                  {isAiParsing ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-purple-200" />
                  )}
                  Estructurar y Refinar con IA (OmniRoute)
                </button>
              )}
            </div>

            {uploadedFileName && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Archivo cargado: <strong>{uploadedFileName}</strong>
              </div>
            )}
          </div>

          {/* Quick instructions & Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-200">Extracción Local Rápida</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                El texto de tu CV se procesa directamente en tu navegador. Tus datos personales no salen de tu equipo a servidores externos no autorizados.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-200">Estructuración STAR/XYZ</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                La IA normaliza tus viñetas de logros en la fórmula de Google (Logré [X], medido por [Y], haciendo [Z]) para maximizar el impacto en reclutadores.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-200">Integración en Toda la Suite</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Este CV Maestro alimenta el módulo de <strong>Optimización ATS (/optimize)</strong> y el generador de <strong>Estrategia & Mensajes (/strategy)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL INFO */}
      {activeTab === 'personal' && (
        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Información de Contacto & Perfil
            </h3>
            <span className="text-xs text-slate-500">Encabezado ATS obligatorio</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Nombre Completo</label>
              <input
                type="text"
                value={cvForm.personalInfo?.name || ''}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                placeholder="Ej. Jorge Niño"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Título Profesional Principal</label>
              <input
                type="text"
                value={cvForm.personalInfo?.roleTitle || ''}
                onChange={(e) => updatePersonalInfo('roleTitle', e.target.value)}
                placeholder="Ej. Senior Full Stack Developer | React & Node.js"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                value={cvForm.personalInfo?.email || ''}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={cvForm.personalInfo?.phone || ''}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="+58 412 1234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Ubicación / Disponibilidad</label>
              <input
                type="text"
                value={cvForm.personalInfo?.location || ''}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                placeholder="Caracas, Venezuela (Disponible Remoto)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Perfil de LinkedIn (URL o username)</label>
              <input
                type="text"
                value={cvForm.personalInfo?.linkedin || ''}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/jorge-nino"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Perfil de GitHub</label>
              <input
                type="text"
                value={cvForm.personalInfo?.github || ''}
                onChange={(e) => updatePersonalInfo('github', e.target.value)}
                placeholder="https://github.com/jorge"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Portafolio / Sitio Web</label>
              <input
                type="text"
                value={cvForm.personalInfo?.portfolio || ''}
                onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                placeholder="https://jorgenino.dev"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              Resumen Profesional (Executive Summary)
            </label>
            <textarea
              rows={4}
              value={cvForm.personalInfo?.summary || ''}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              placeholder="Desarrollador de software con más de 5 años de experiencia diseñando y escalando aplicaciones web..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* TAB 3: WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Historial de Experiencia Laboral
              </h3>
              <p className="text-xs text-slate-400">
                Puestos, empresas, logros cuantificados y tecnologías dominadas.
              </p>
            </div>
            <button
              onClick={addExperience}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Puesto
            </button>
          </div>

          {(cvForm.workExperience || []).map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">Puesto #{idx + 1}</span>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Cargo / Rol</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={exp.location || ''}
                    onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                    placeholder="Remoto / Ciudad"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Fecha Inicio</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                    placeholder="Ej. Ene 2022"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Fecha Fin</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    placeholder="Ej. Presente"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id={`current_${exp.id}`}
                    checked={Boolean(exp.current)}
                    onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor={`current_${exp.id}`} className="text-xs text-slate-300 cursor-pointer">
                    Trabajo Actual
                  </label>
                </div>
              </div>

              {/* Achievements / Bullets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Logros & Responsabilidades (Una viñeta por línea - Recomendado STAR/XYZ)
                </label>
                <textarea
                  rows={3}
                  value={(exp.achievements || exp.description || []).join('\n')}
                  onChange={(e) =>
                    updateExperience(exp.id, {
                      achievements: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  placeholder="• Lideré la migración a arquitectura de microservicios reduciendo la latencia en un 40%..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Tecnologías Utilizadas (Separadas por comas)
                </label>
                <input
                  type="text"
                  value={(exp.technologies || []).join(', ')}
                  onChange={(e) =>
                    updateExperience(exp.id, {
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                Categorías de Habilidades & Tecnologías
              </h3>
              <p className="text-xs text-slate-400">
                Organizadas en grupos reconocibles por motores ATS.
              </p>
            </div>
            <button
              onClick={addSkillCategory}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(cvForm.skillCategories || []).map((cat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={cat.categoryName}
                    onChange={(e) =>
                      updateSkillCategory(idx, { ...cat, categoryName: e.target.value })
                    }
                    className="font-bold text-xs text-blue-400 bg-transparent border-b border-slate-700 pb-1 focus:outline-none focus:border-blue-500 w-full"
                  />
                  <button
                    onClick={() => removeSkillCategory(idx)}
                    className="text-xs text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">
                    Habilidades (separadas por comas)
                  </label>
                  <textarea
                    rows={3}
                    value={(cat.skills || []).join(', ')}
                    onChange={(e) =>
                      updateSkillCategory(idx, {
                        ...cat,
                        skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(cat.skills || []).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                Educación y Títulos
              </h3>
            </div>
            <button
              onClick={addEducation}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Educación
            </button>
          </div>

          {(cvForm.education || []).map((edu, idx) => (
            <div
              key={edu.id || idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">Educación #{idx + 1}</span>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Institución / Universidad</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Título / Grado Obtenido</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Año Inicio</label>
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                    placeholder="2018"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Año Fin</label>
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                    placeholder="2022"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-400" />
              Proyectos Destacados
            </h3>
            <button
              onClick={() => {
                const newProj: Project = {
                  id: 'proj_' + Date.now(),
                  name: 'Nuevo Proyecto',
                  description: 'Descripción del proyecto',
                  technologies: ['TypeScript', 'React'],
                };
                setCvForm((prev) => ({
                  ...prev,
                  projects: [...(prev.projects || []), newProj],
                }));
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Proyecto
            </button>
          </div>

          {(cvForm.projects || []).map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => {
                    const newProjects = [...(cvForm.projects || [])];
                    newProjects[idx] = { ...proj, name: e.target.value };
                    setCvForm({ ...cvForm, projects: newProjects });
                  }}
                  className="font-bold text-xs text-slate-200 bg-transparent border-b border-slate-700 pb-1 focus:outline-none focus:border-blue-500 w-1/2"
                />
                <button
                  onClick={() => {
                    setCvForm({
                      ...cvForm,
                      projects: (cvForm.projects || []).filter((_, i) => i !== idx),
                    });
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => {
                    const newProjects = [...(cvForm.projects || [])];
                    newProjects[idx] = { ...proj, description: e.target.value };
                    setCvForm({ ...cvForm, projects: newProjects });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Tecnologías (separadas por comas)</label>
                <input
                  type="text"
                  value={(proj.technologies || []).join(', ')}
                  onChange={(e) => {
                    const newProjects = [...(cvForm.projects || [])];
                    newProjects[idx] = {
                      ...proj,
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    };
                    setCvForm({ ...cvForm, projects: newProjects });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: CERTIFICATIONS & LANGUAGES */}
      {activeTab === 'certifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Certificaciones
            </h3>
            {(cvForm.certifications || []).map((cert, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-200">{cert.name}</div>
                <div className="text-slate-400">{cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ''}</div>
              </div>
            ))}
            <button
              onClick={() => {
                const newCert: Certification = {
                  id: 'cert_' + Date.now(),
                  name: 'Certificación AWS / Google / Meta',
                  issuer: 'Institución Emisora',
                  issueDate: '2023',
                };
                setCvForm({
                  ...cvForm,
                  certifications: [...(cvForm.certifications || []), newCert],
                });
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              + Agregar Certificación
            </button>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Idiomas
            </h3>
            {(cvForm.languages || []).map((lang, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-200">{lang.language}</span>
                <span className="text-cyan-400 font-mono">{lang.proficiency}</span>
              </div>
            ))}
            <button
              onClick={() => {
                const newLang: Language = {
                  id: 'lang_' + Date.now(),
                  language: 'Inglés',
                  proficiency: 'B2 / C1 Profesional',
                };
                setCvForm({
                  ...cvForm,
                  languages: [...(cvForm.languages || []), newLang],
                });
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              + Agregar Idioma
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: RAW EXTRACTED TEXT */}
      {activeTab === 'raw' && (
        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-400" />
              Texto Crudo Extraído del Documento
            </h3>
            <span className="text-xs text-slate-400">
              {cvForm.rawText?.length || 0} caracteres
            </span>
          </div>

          <textarea
            rows={15}
            value={cvForm.rawText || ''}
            onChange={(e) => setCvForm({ ...cvForm, rawText: e.target.value })}
            placeholder="Pega aquí el texto completo de tu currículum..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 leading-relaxed"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={handleAiStructure}
              disabled={isAiParsing}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Estructurar este texto con IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
