/**
 * Extension Synchronization Service
 * Handles real-time events, BroadcastChannel, postMessage, and cross-tab communication with the Browser Extension.
 */

import type { Job } from '../../types/job';
import { toast } from 'sonner';

export type OnJobReceivedCallback = (job: Job, autoOptimize?: boolean) => void;
export type OnBatchJobsReceivedCallback = (jobs: Job[]) => void;

export class ExtensionSyncService {
  private static channels: BroadcastChannel[] = [];
  private static isInitialized = false;

  static initialize(
    onJobReceived: OnJobReceivedCallback,
    onBatchReceived?: OnBatchJobsReceivedCallback
  ) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Listen across all possible BroadcastChannel names
    const channelNames = ['jobtracker_sync', 'jobtracker_channel', 'jobtracker_extension_channel'];
    if (typeof BroadcastChannel !== 'undefined') {
      channelNames.forEach((name) => {
        try {
          const bc = new BroadcastChannel(name);
          bc.onmessage = (event) => {
            const data = event.data;
            if (!data) return;

            if (data.type === 'JOB_SAVED' || data.type === 'NEW_JOB') {
              const jobData = data.payload || data.job;
              if (jobData) {
                this.handleIncomingJob(jobData, onJobReceived, data.autoOptimize);
              }
            } else if (data.type === 'JOBTRACKER_EXTENSION_SYNC_ALL' && Array.isArray(data.payload)) {
              this.handleBatchJobs(data.payload, onBatchReceived, onJobReceived);
            }
          };
          this.channels.push(bc);
        } catch (e) {
          console.warn(`[ExtensionSync] Could not open BroadcastChannel ${name}:`, e);
        }
      });
    }

    // 2. Window PostMessage Listener (Catches messages injected by chrome.scripting.executeScript & content scripts)
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (
        data.type === 'JOBTRACKER_EXTENSION_JOB' ||
        data.type === 'JOBTRACKER_EXTENSION_SYNC' ||
        data.type === 'JOB_SAVED' ||
        data.type === 'NEW_JOB'
      ) {
        const payload = data.payload || data.job;
        if (payload && (payload.position || payload.title || payload.company)) {
          this.handleIncomingJob(payload, onJobReceived, data.autoOptimize);
        }
      } else if (data.type === 'JOBTRACKER_EXTENSION_SYNC_ALL' && Array.isArray(data.payload)) {
        this.handleBatchJobs(data.payload, onBatchReceived, onJobReceived);
      }
    });

    // 3. Custom DOM Events
    window.addEventListener('jobtracker:job', ((event: CustomEvent) => {
      if (event.detail) {
        this.handleIncomingJob(event.detail, onJobReceived);
      }
    }) as EventListener);

    window.addEventListener('jobtracker:sync', ((event: CustomEvent) => {
      if (Array.isArray(event.detail)) {
        this.handleBatchJobs(event.detail, onBatchReceived, onJobReceived);
      }
    }) as EventListener);

    // 4. Storage Event Listener (for cross-window localStorage triggers)
    window.addEventListener('storage', (event) => {
      if (event.key === 'jobtracker_new_job' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed && (parsed.position || parsed.company)) {
            this.handleIncomingJob(parsed, onJobReceived, parsed._autoOptimize);
            localStorage.removeItem('jobtracker_new_job');
          }
        } catch (e) {
          console.error('[ExtensionSync] Failed to parse job from localStorage:', e);
        }
      }
    });

    // 5. Expose global bridge functions for direct script injection
    (window as any).__JOBTRACKER_RECEIVE_JOB__ = (jobData: any, autoOptimize = false) => {
      this.handleIncomingJob(jobData, onJobReceived, autoOptimize);
    };

    (window as any).__JOBTRACKER_RECEIVE_ALL_JOBS__ = (jobsData: any[]) => {
      this.handleBatchJobs(jobsData, onBatchReceived, onJobReceived);
    };

    // 6. Automatically request sync from extension bridge
    this.requestExtensionSync();

    console.log('✅ [JobTracker] Extension Sync Service activo y escuchando eventos.');
  }

  /**
   * Send a ping / message to the extension content script asking for all saved jobs
   */
  static requestExtensionSync() {
    try {
      window.postMessage({ type: 'JOBTRACKER_REQUEST_EXTENSION_SYNC', source: 'jobtracker-app' }, '*');
    } catch (e) {
      console.warn('[ExtensionSync] Could not send sync request:', e);
    }
  }

  private static formatJob(data: any): Job {
    const techStack = Array.isArray(data.techStack)
      ? data.techStack
      : typeof data.techStack === 'string'
      ? data.techStack.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    return {
      id: data.id || 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      company: data.company || 'Empresa Desconocida',
      position: data.position || data.title || 'Puesto Sin Título',
      url: data.url || '',
      location: data.location || 'Remoto',
      workMode: data.workMode || 'Remoto',
      salary: data.salary || '',
      description: data.description || '',
      requirements: data.requirements || '',
      techStack,
      contactName: data.contactName || '',
      contactEmail: data.contactEmail || '',
      contactProfile: data.contactProfile || '',
      portal: data.portal || 'Extensión Navegador',
      status: data.status || 'wishlist',
      priority: data.priority || 'medium',
      createdAt: data.createdAt || new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      notes: data.notes || `Vacante capturada automáticamente desde ${data.portal || 'la Extensión'}.`,
      activities: data.activities || [
        {
          id: 'act_' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'created',
          description: `Vacante capturada automáticamente desde ${data.portal || 'la Extensión'}.`,
        },
      ],
    };
  }

  private static handleIncomingJob(data: any, callback: OnJobReceivedCallback, autoOptimize = false) {
    const job = this.formatJob(data);
    callback(job, autoOptimize);

    toast.success(`🎯 Vacante capturada: ${job.position} en ${job.company}`, {
      description: `Portal: ${job.portal} | Modalidad: ${job.workMode}`,
      duration: 5000,
    });
  }

  private static handleBatchJobs(
    items: any[],
    batchCallback?: OnBatchJobsReceivedCallback,
    singleCallback?: OnJobReceivedCallback
  ) {
    if (!Array.isArray(items) || items.length === 0) return;

    const formattedJobs = items.map((item) => this.formatJob(item));

    if (batchCallback) {
      batchCallback(formattedJobs);
    } else if (singleCallback) {
      formattedJobs.forEach((j) => singleCallback(j, false));
    }

    toast.info(`🔄 Sincronizadas ${formattedJobs.length} vacantes desde la extensión`, {
      duration: 4000,
    });
  }
}
