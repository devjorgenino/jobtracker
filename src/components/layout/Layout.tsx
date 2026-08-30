import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Modal } from '../common/Modal';
import { useStore } from '../../context/store';
import { cn } from '../../utils/cn';
import { ExtensionSyncService } from '../../services/sync/extensionSync';
import type { Job, JobStatus, JobPriority, WorkMode } from '../../types/job';
import { Briefcase, Building2, MapPin, DollarSign, Globe, Tag, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CloudMigrationModal } from '../auth/CloudMigrationModal';
import { useAuth } from '../../context/AuthContext';
import { JobRepository } from '../../services/supabase/jobRepository';
import { useCloudSync } from '../../hooks/useCloudSync';

export const Layout: React.FC = () => {
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const addJob = useStore((state) => state.addJob);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const theme = useStore((state) => state.theme);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { migrationModalOpen, setMigrationModalOpen, localDataSummary } = useCloudSync();

  // Apply dark mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Form state for Manual Job Add
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    location: 'Remoto',
    workMode: 'Remoto' as WorkMode,
    salary: '',
    url: '',
    portal: 'Directo',
    status: 'wishlist' as JobStatus,
    priority: 'medium' as JobPriority,
    techStackText: '',
    contactName: '',
    contactEmail: '',
    description: '',
  });

  // Initialize Extension Sync Listener
  useEffect(() => {
    ExtensionSyncService.initialize(
      (incomingJob, autoOptimize) => {
        addJob(incomingJob);
        // If user is authenticated, sync directly to Supabase cloud
        if (user) {
          JobRepository.upsert(incomingJob, user.id).catch((err) => {
            console.error('[CloudSync] Error saving extension job to Supabase:', err);
          });
        }
        if (autoOptimize) {
          navigate(`/optimize?jobId=${incomingJob.id}`);
        }
      },
      (batchJobs) => {
        batchJobs.forEach((j) => {
          addJob(j);
          if (user) {
            JobRepository.upsert(j, user.id).catch((err) => {
              console.error('[CloudSync] Error saving batch extension job to Supabase:', err);
            });
          }
        });
      }
    );
  }, [addJob, navigate, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.position || !formData.company) {
      toast.error('Por favor ingresa al menos el Puesto y la Empresa.');
      return;
    }

    const techStack = formData.techStackText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newJob: Job = {
      id: 'job_' + Date.now(),
      position: formData.position,
      company: formData.company,
      location: formData.location,
      workMode: formData.workMode,
      salary: formData.salary,
      url: formData.url,
      portal: formData.portal,
      status: formData.status,
      priority: formData.priority,
      techStack,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      description: formData.description,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      activities: [
        {
          id: 'act_' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'created',
          description: 'Vacante creada manualmente.',
        },
      ],
    };

    addJob(newJob);
    toast.success(`Vacante "${newJob.position}" en ${newJob.company} agregada con éxito.`);
    setIsAddJobOpen(false);

    // Reset form
    setFormData({
      position: '',
      company: '',
      location: 'Remoto',
      workMode: 'Remoto',
      salary: '',
      url: '',
      portal: 'Directo',
      status: 'wishlist',
      priority: 'medium',
      techStackText: '',
      contactName: '',
      contactEmail: '',
      description: '',
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64',
          'pl-0' // on mobile sidebar is handled or collapsed
        )}
      >
        <Navbar onOpenAddJobModal={() => setIsAddJobOpen(true)} />

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Modal Nueva Vacante */}
      <Modal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        title="Agregar Nueva Vacante de Empleo"
        subtitle="Registra manualmente una oportunidad o impórtala en 1-clic con la extensión de navegador."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                Puesto / Cargo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Senior React Developer"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Empresa *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Acme Corp"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Modalidad</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value as WorkMode })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Presencial">Presencial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                Ubicación
              </label>
              <input
                type="text"
                placeholder="Ej: LATAM / Global / Remoto"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                Salario (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: $4,000 - $6,000 USD/mes"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                URL de la Oferta
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                Tecnologías (separadas por coma)
              </label>
              <input
                type="text"
                placeholder="React, TypeScript, Node.js, AWS..."
                value={formData.techStackText}
                onChange={(e) => setFormData({ ...formData, techStackText: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción Completa de la Vacante & Requisitos
            </label>
            <textarea
              rows={4}
              placeholder="Pega aquí la descripción completa de la vacante para que el motor de IA pueda optimizar el CV y generar la estrategia..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddJobOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Guardar Vacante
            </button>
          </div>
        </form>
      </Modal>

      {/* Zero-Data-Loss Cloud Migration Modal */}
      <CloudMigrationModal
        isOpen={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
        summary={localDataSummary}
      />
    </div>
  );
};
