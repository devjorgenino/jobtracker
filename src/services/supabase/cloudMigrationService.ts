import { JobRepository } from './jobRepository';
import { CvRepository } from './cvRepository';
import { StrategyRepository } from './strategyRepository';
import type { Job } from '../../types/job';
import type { MasterCV, TailoredCV } from '../../types/cv';
import type { JobStrategy } from '../../types/strategy';

export interface LocalDataSummary {
  hasLocalData: boolean;
  jobsCount: number;
  hasMasterCv: boolean;
  tailoredCvCount: number;
  strategyCount: number;
}

export class CloudMigrationService {
  /**
   * Key used in localStorage to track if the current user already migrated their local data.
   */
  private static getMigrationKey(userId: string): string {
    return `jobtracker_cloud_migrated_${userId}`;
  }

  /**
   * Checks if user has already performed the initial migration.
   */
  public static isMigrationCompleted(userId: string): boolean {
    return localStorage.getItem(this.getMigrationKey(userId)) === 'true';
  }

  /**
   * Marks migration as completed for this user.
   */
  public static markMigrationCompleted(userId: string): void {
    localStorage.setItem(this.getMigrationKey(userId), 'true');
  }

  /**
   * Analyzes local Zustand store data to determine if there are items worth uploading.
   */
  public static checkPendingLocalData(
    userId: string,
    localState: {
      jobs: Job[];
      masterCV: MasterCV;
      tailoredCvs: Record<string, TailoredCV>;
      strategies: Record<string, JobStrategy>;
    }
  ): LocalDataSummary {
    if (this.isMigrationCompleted(userId)) {
      return {
        hasLocalData: false,
        jobsCount: 0,
        hasMasterCv: false,
        tailoredCvCount: 0,
        strategyCount: 0,
      };
    }

    const jobsCount = localState.jobs.length;
    const hasMasterCv = Boolean(
      localState.masterCV &&
        (localState.masterCV.workExperience?.length > 0 ||
          localState.masterCV.personalInfo?.name ||
          localState.masterCV.skillCategories?.length > 0)
    );
    const tailoredCvCount = Object.keys(localState.tailoredCvs || {}).length;
    const strategyCount = Object.keys(localState.strategies || {}).length;

    const hasLocalData = jobsCount > 0 || hasMasterCv || tailoredCvCount > 0 || strategyCount > 0;

    return {
      hasLocalData,
      jobsCount,
      hasMasterCv,
      tailoredCvCount,
      strategyCount,
    };
  }

  /**
   * Migrates local Zustand store entities to Supabase PostgreSQL without duplicates.
   */
  public static async migrateLocalDataToCloud(
    userId: string,
    localState: {
      jobs: Job[];
      masterCV: MasterCV;
      tailoredCvs: Record<string, TailoredCV>;
      strategies: Record<string, JobStrategy>;
    },
    onProgress?: (status: string, current: number, total: number) => void
  ): Promise<{ jobsMigrated: number; cvsMigrated: number; strategiesMigrated: number }> {
    const totalSteps =
      localState.jobs.length +
      (localState.masterCV ? 1 : 0) +
      Object.keys(localState.tailoredCvs).length +
      Object.keys(localState.strategies).length;

    let processed = 0;

    // 1. Migrate Jobs
    if (localState.jobs.length > 0) {
      onProgress?.('Sincronizando vacantes a PostgreSQL...', processed, totalSteps);
      await JobRepository.upsertBatch(localState.jobs, userId);
      processed += localState.jobs.length;
    }

    // 2. Migrate Master CV
    if (localState.masterCV) {
      onProgress?.('Sincronizando Master CV...', processed, totalSteps);
      await CvRepository.upsertMasterCV(localState.masterCV, userId);
      processed += 1;
    }

    // 3. Migrate Tailored CVs
    const tailoredList = Object.values(localState.tailoredCvs);
    for (const cv of tailoredList) {
      onProgress?.(`Sincronizando CV adaptado: ${cv.jobTitle}...`, processed, totalSteps);
      await CvRepository.upsertTailoredCV(cv, userId);
      processed += 1;
    }

    // 4. Migrate Strategies
    const strategyList = Object.values(localState.strategies);
    for (const strat of strategyList) {
      onProgress?.('Sincronizando estrategias de postulación...', processed, totalSteps);
      await StrategyRepository.upsert(strat, userId);
      processed += 1;
    }

    // Mark as completed in local storage
    this.markMigrationCompleted(userId);

    return {
      jobsMigrated: localState.jobs.length,
      cvsMigrated: (localState.masterCV ? 1 : 0) + tailoredList.length,
      strategiesMigrated: strategyList.length,
    };
  }
}
