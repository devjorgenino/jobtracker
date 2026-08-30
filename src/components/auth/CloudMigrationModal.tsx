import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/store';
import { CloudMigrationService, type LocalDataSummary } from '../../services/supabase/cloudMigrationService';
import { Cloud, Check, Loader2, FileText, Sparkles, Briefcase, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface CloudMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: LocalDataSummary;
}

export const CloudMigrationModal: React.FC<CloudMigrationModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const { user } = useAuth();
  const state = useStore();
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  if (!isOpen || !user || !summary.hasLocalData) return null;

  const handleMigrate = async () => {
    setLoading(true);
    setProgressMsg('Iniciando migración segura a Supabase...');
    try {
      const result = await CloudMigrationService.migrateLocalDataToCloud(
        user.id,
        {
          jobs: state.jobs,
          masterCV: state.masterCV,
          tailoredCvs: state.tailoredCvs,
          strategies: state.strategies,
        },
        (msg) => setProgressMsg(msg)
      );

      toast.success('¡Datos locales sincronizados con éxito!', {
        description: `Se respaldaron ${result.jobsMigrated} vacantes y ${result.cvsMigrated} CVs en tu cuenta de Supabase.`,
      });
      onClose();
    } catch (err: any) {
      console.error('[CloudMigrationModal] Migration error:', err);
      toast.error('Error durante la sincronización a la nube', {
        description: err?.message || 'Verifica tu conexión y permisos en Supabase.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    CloudMigrationService.markMigrationCompleted(user.id);
    toast.info('Modo de datos conservado localmente en este navegador.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sincroniza tus datos locales a la Nube
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Detectamos información almacenada previamente en este navegador. ¿Deseas respaldarla de forma segura en tu cuenta de PostgreSQL?
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Elementos listos para sincronizar
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
              <Briefcase className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {summary.jobsCount} vacantes
                </div>
                <div className="text-xs text-slate-400">Postulaciones y notas</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
              <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {summary.hasMasterCv ? '1 Master CV' : '0 Master CV'}
                </div>
                <div className="text-xs text-slate-400">Perfil profesional</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {summary.tailoredCvCount} CVs adaptados
                </div>
                <div className="text-xs text-slate-400">Personalizados con IA</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {summary.strategyCount} tácticas
                </div>
                <div className="text-xs text-slate-400">Estrategias y outreach</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>
            Tus datos se almacenan cifrados con Row Level Security (RLS). Solo tú puedes leer y modificar tu información.
          </span>
        </div>

        {/* Progress feedback */}
        {loading && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="truncate">{progressMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleMigrate}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Sincronizar a la Nube (Recomendado)</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={loading}
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    </div>
  );
};
