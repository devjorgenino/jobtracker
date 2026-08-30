import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/store';
import { JobRepository } from '../services/supabase/jobRepository';
import { CvRepository } from '../services/supabase/cvRepository';
import { StrategyRepository } from '../services/supabase/strategyRepository';
import { CloudMigrationService, type LocalDataSummary } from '../services/supabase/cloudMigrationService';
import { isSupabaseConfigured } from '../services/supabase/client';
import { toast } from 'sonner';

export const useCloudSync = () => {
  const { user } = useAuth();
  const state = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [localDataSummary, setLocalDataSummary] = useState<LocalDataSummary>({
    hasLocalData: false,
    jobsCount: 0,
    hasMasterCv: false,
    tailoredCvCount: 0,
    strategyCount: 0,
  });

  const syncInitiatedRef = useRef<string | null>(null);

  /**
   * Syncs data from Supabase Cloud to Zustand Store.
   */
  const syncFromCloud = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) return;

    setIsSyncing(true);
    try {
      const [remoteJobs, remoteMasterCvs, remoteTailoredCvs, remoteStrategies] = await Promise.all([
        JobRepository.getAll(userId),
        CvRepository.getMasterCVs(userId),
        CvRepository.getTailoredCVs(userId),
        StrategyRepository.getAll(userId),
      ]);

      if (remoteJobs && remoteJobs.length > 0) {
        state.setJobs(remoteJobs);
      }

      if (remoteMasterCvs && remoteMasterCvs.length > 0) {
        state.setMasterCV(remoteMasterCvs[0]);
      }

      if (remoteTailoredCvs && remoteTailoredCvs.length > 0) {
        const tailoredMap = remoteTailoredCvs.reduce((acc, cv) => {
          acc[cv.jobId] = cv;
          return acc;
        }, {} as Record<string, typeof remoteTailoredCvs[0]>);
        state.setTailoredCvs(tailoredMap);
      }

      if (remoteStrategies && remoteStrategies.length > 0) {
        const strategyMap = remoteStrategies.reduce((acc, st) => {
          acc[st.jobId] = st;
          return acc;
        }, {} as Record<string, typeof remoteStrategies[0]>);
        state.setStrategies(strategyMap);
      }

      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('[useCloudSync] Error syncing from Supabase:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [state]);

  /**
   * Checks pending migration and synchronizes on user login.
   */
  useEffect(() => {
    if (!user) {
      syncInitiatedRef.current = null;
      return;
    }

    if (syncInitiatedRef.current === user.id) return;
    syncInitiatedRef.current = user.id;

    // Check if user has un-migrated local data
    const summary = CloudMigrationService.checkPendingLocalData(user.id, {
      jobs: state.jobs,
      masterCV: state.masterCV,
      tailoredCvs: state.tailoredCvs,
      strategies: state.strategies,
    });

    setLocalDataSummary(summary);

    if (summary.hasLocalData) {
      setMigrationModalOpen(true);
    } else {
      // If no migration needed, pull remote data directly
      syncFromCloud(user.id);
    }
  }, [user, state.jobs, state.masterCV, state.tailoredCvs, state.strategies, syncFromCloud]);

  /**
   * Triggers a manual sync.
   */
  const forceManualSync = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para sincronizar con la nube');
      return;
    }
    await syncFromCloud(user.id);
    toast.success('¡Sincronización en la nube completada con éxito!');
  };

  return {
    isSyncing,
    lastSyncedAt,
    migrationModalOpen,
    setMigrationModalOpen,
    localDataSummary,
    syncFromCloud,
    forceManualSync,
  };
};
