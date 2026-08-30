import React, { useState } from 'react';
import { useStore } from '../context/store';
import { ATSPDFService } from '../services/pdf/atsPdfGenerator';
import {
  FileText,
  User,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Download,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import type { WorkExperience, SkillCategory, Education } from '../types/cv';

export const CVPage: React.FC = () => {
  const { masterCV, updateMasterCV } = useStore();
  const [personal, setPersonal] = useState(masterCV.personalInfo);
  const [experiences, setExperiences] = useState<WorkExperience[]>(masterCV.workExperience || []);
  const [skillCats, setSkillCats] = useState<SkillCategory[]>(masterCV.skillCategories || []);
  const [education] = useState<Education[]>(masterCV.education || []);

  const handleSave = () => {
    updateMasterCV({
      personalInfo: personal,
      workExperience: experiences,
      skillCategories: skillCats,
      education,
    });
    toast.success('💾 CV Maestro guardado correctamente.');
  };

  const handleDownloadPDF = async () => {
    try {
      await ATSPDFService.downloadPDF(masterCV, `CV_Maestro_${personal.name.replace(/\s+/g, '_')}_ATS.pdf`);
      toast.success('Descargando CV Maestro en PDF ATS...');
    } catch (e) {
      toast.error('Error al generar PDF');
    }
  };

  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: 'exp_' + Date.now(),
      company: 'Nueva Empresa',
      role: 'Software Engineer',
      location: 'Remoto',
      startDate: '2023',
      endDate: 'Presente',
      current: true,
      achievements: ['Desarrollo y mantenimiento de aplicaciones web escalables.', 'Mejora de rendimiento en un 25%.'],
      technologies: ['React', 'TypeScript', 'Node.js'],
    };
    setExperiences([newExp, ...experiences]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-400" />
            Mi CV Maestro & Perfil Profesional
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Este es tu currículum base. Cada vez que optimices una vacante, el motor de IA tomará este contenido y lo adaptará con el diseño exacto y las palabras clave de la oferta.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* 1. Personal Information */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-indigo-400" />
          Información Personal & Contacto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={personal.name}
              onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Título Profesional</label>
            <input
              type="text"
              value={personal.roleTitle}
              onChange={(e) => setPersonal({ ...personal, roleTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={personal.email}
              onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / WhatsApp</label>
            <input
              type="text"
              value={personal.phone}
              onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ubicación / Modalidad</label>
            <input
              type="text"
              value={personal.location}
              onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={personal.linkedin || ''}
              onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub URL</label>
            <input
              type="text"
              value={personal.github || ''}
              onChange={(e) => setPersonal({ ...personal, github: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Portafolio / Web</label>
            <input
              type="text"
              value={personal.portfolio || ''}
              onChange={(e) => setPersonal({ ...personal, portfolio: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Resumen Profesional Maestro
          </label>
          <textarea
            rows={4}
            value={personal.summary}
            onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>
      </div>

      {/* 2. Work Experience */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            Experiencia Laboral
          </h3>
          <button
            onClick={handleAddExperience}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-semibold border border-blue-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Puesto
          </button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Cargo / Rol</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...experiences];
                        copy[idx].role = e.target.value;
                        setExperiences(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Empresa</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...experiences];
                        copy[idx].company = e.target.value;
                        setExperiences(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Periodo</label>
                    <input
                      type="text"
                      value={`${exp.startDate} - ${exp.endDate}`}
                      onChange={(e) => {
                        const copy = [...experiences];
                        copy[idx].startDate = e.target.value;
                        setExperiences(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Achievements textarea */}
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Responsabilidades & Logros Cuantificables (1 por línea)
                </label>
                <textarea
                  rows={3}
                  value={(exp.achievements || exp.description || []).join('\n')}
                  onChange={(e) => {
                    const copy = [...experiences];
                    copy[idx].achievements = e.target.value.split('\n').filter(Boolean);
                    setExperiences(copy);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 leading-relaxed font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Skill Categories */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Award className="w-4 h-4 text-purple-400" />
          Habilidades Técnicas Agrupadas
        </h3>

        <div className="space-y-3">
          {skillCats.map((cat, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Categoría</label>
                <input
                  type="text"
                  value={cat.categoryName}
                  onChange={(e) => {
                    const copy = [...skillCats];
                    copy[idx].categoryName = e.target.value;
                    setSkillCats(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1">
                  Habilidades (separadas por coma)
                </label>
                <input
                  type="text"
                  value={cat.skills.join(', ')}
                  onChange={(e) => {
                    const copy = [...skillCats];
                    copy[idx].skills = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    setSkillCats(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
