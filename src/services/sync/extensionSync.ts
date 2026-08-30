/**
 * Extension Synchronization Service
 * Handles real-time events, BroadcastChannel, and cross-tab communication with the Browser Extension.
 */

import type { Job } from '../../types/job';
import { toast } from 'sonner';

export type OnJobReceivedCallback = (job: Job, autoOptimize?: boolean) => void;

export class ExtensionSyncService {
  private static broadcastChannel: BroadcastChannel | null = null;
  private static isInitialized = false;

  static initialize(onJobReceived: OnJobReceivedCallback) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. BroadcastChannel Listener
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('jobtracker_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'JOB_SAVED' && event.data.payload) {
            this.handleIncomingJob(event.data.payload, onJobReceived, event.data.autoOptimize);
          }
        };
      } catch (e) {
        console.warn('[ExtensionSync] BroadcastChannel not supported:', e);
      }
    }

    // 2. Window PostMessage Listener
    window.addEventListener('message', (event) => {
      // Validate event source & type
      if (event.data?.type === 'JOBTRACKER_EXTENSION_JOB' && event.data.payload) {
        this.handleIncomingJob(event.data.payload, onJobReceived, event.data.autoOptimize);
      }
    });

    // 3. Storage Event Listener (for cross-window localStorage sync)
    window.addEventListener('storage', (event) => {
      if (event.key === 'jobtracker_new_job' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed && parsed.position && parsed.company) {
            this.handleIncomingJob(parsed, onJobReceived, parsed._autoOptimize);
            localStorage.removeItem('jobtracker_new_job');
          }
        } catch (e) {
          console.error('[ExtensionSync] Failed to parse job from localStorage:', e);
        }
      }
    });

    // Expose global bridge for direct extension scripting
    (window as any).__JOBTRACKER_RECEIVE_JOB__ = (jobData: any, autoOptimize = false) => {
      this.handleIncomingJob(jobData, onJobReceived, autoOptimize);
    };

    console.log('✅ [JobTracker] Extension Sync Service activo y escuchando eventos.');
  }

  private static handleIncomingJob(data: any, callback: OnJobReceivedCallback, autoOptimize = false) {
    const techStack = Array.isArray(data.techStack)
      ? data.techStack
      : typeof data.techStack === 'string'
      ? data.techStack.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const job: Job = {
      id: data.id || 'job_' + Date.now(),
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
      portal: data.portal || 'Portal Web',
      status: data.status || 'wishlist',
      priority: data.priority || 'medium',
      createdAt: data.createdAt || new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      activities: [
        {
          id: 'act_' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'created',
          description: `Vacante capturada automáticamente desde ${data.portal || 'la Extensión'}.`,
        },
      ],
    };

    callback(job, autoOptimize);

    toast.success(`🎯 Vacante capturada: ${job.position} en ${job.company}`, {
      description: `Portal: ${job.portal} | Modalidad: ${job.workMode}`,
      duration: 5000,
    });
  }

  /**
   * Ping to notify extension that Web App is open and active
   */
  static notifyReady() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'JOBTRACKER_WEBAPP_READY' });
    }
  }
}
