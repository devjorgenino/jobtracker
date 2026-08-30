import { supabase, isSupabaseConfigured } from './client';
import type { Job } from '../../types/job';

export interface DatabaseJobRow {
  id: string;
  user_id?: string;
  position: string;
  company: string;
  url?: string;
  location?: string;
  work_mode?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  tech_stack?: string[];
  portal?: string;
  contact_name?: string;
  contact_email?: string;
  contact_profile?: string;
  status: string;
  priority: string;
  applied_at?: string;
  follow_up_date?: string;
  interview_date?: string;
  notes?: string;
  activities?: any[];
  tailored_cv_id?: string;
  strategy_id?: string;
  ats_score?: any;
  created_at: string;
  last_update: string;
}

export class JobRepository {
  /**
   * Converts frontend Job entity to DB Row schema.
   */
  public static toDatabaseRow(job: Job, userId: string): DatabaseJobRow {
    return {
      id: job.id,
      user_id: userId,
      position: job.position,
      company: job.company,
      url: job.url || undefined,
      location: job.location || '',
      work_mode: job.workMode || 'Remoto',
      salary: job.salary || undefined,
      description: job.description || '',
      requirements: job.requirements || undefined,
      tech_stack: job.techStack || [],
      portal: job.portal || undefined,
      contact_name: job.contactName || job.recruiter?.name || undefined,
      contact_email: job.contactEmail || job.recruiter?.email || undefined,
      contact_profile: job.contactProfile || job.recruiter?.profileUrl || undefined,
      status: job.status,
      priority: job.priority,
      applied_at: job.appliedAt || undefined,
      follow_up_date: job.followUpDate || undefined,
      interview_date: job.interviewDate || undefined,
      notes: job.notes || undefined,
      activities: job.activities || [],
      tailored_cv_id: job.tailoredCvId || undefined,
      strategy_id: job.strategyId || undefined,
      ats_score: job.atsScore || undefined,
      created_at: job.createdAt || new Date().toISOString(),
      last_update: job.lastUpdate || new Date().toISOString(),
    };
  }

  /**
   * Converts DB Row schema to frontend Job entity.
   */
  public static fromDatabaseRow(row: DatabaseJobRow): Job {
    return {
      id: row.id,
      position: row.position,
      company: row.company,
      url: row.url,
      location: row.location || 'Remoto',
      workMode: (row.work_mode as any) || 'Remoto',
      salary: row.salary,
      description: row.description || '',
      requirements: row.requirements,
      techStack: row.tech_stack || [],
      portal: row.portal,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      contactProfile: row.contact_profile,
      recruiter: row.contact_name
        ? {
            name: row.contact_name,
            email: row.contact_email,
            profileUrl: row.contact_profile,
          }
        : undefined,
      status: row.status as any,
      priority: row.priority as any,
      createdAt: row.created_at,
      lastUpdate: row.last_update,
      appliedAt: row.applied_at,
      followUpDate: row.follow_up_date,
      interviewDate: row.interview_date,
      notes: row.notes,
      activities: row.activities || [],
      tailoredCvId: row.tailored_cv_id,
      strategyId: row.strategy_id,
      atsScore: row.ats_score,
    };
  }

  /**
   * Fetches all jobs for a specific user from Supabase.
   */
  public static async getAll(userId: string): Promise<Job[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[JobRepository] Error fetching jobs:', error);
      throw error;
    }

    return (data || []).map((row: any) => this.fromDatabaseRow(row as DatabaseJobRow));
  }

  /**
   * Inserts or updates a single job with optimistic fallback.
   */
  public static async upsert(job: Job, userId: string): Promise<Job> {
    if (!isSupabaseConfigured()) return job;

    const row = this.toDatabaseRow(job, userId);

    const { error } = await supabase
      .from('jobs')
      .upsert(row, { onConflict: 'id,user_id' });

    if (error) {
      console.error('[JobRepository] Error upserting job:', error);
      throw error;
    }

    return job;
  }

  /**
   * Batch upserts multiple jobs (used during initial migration).
   */
  public static async upsertBatch(jobs: Job[], userId: string): Promise<void> {
    if (!isSupabaseConfigured() || jobs.length === 0) return;

    const rows = jobs.map((job) => this.toDatabaseRow(job, userId));

    const { error } = await supabase
      .from('jobs')
      .upsert(rows, { onConflict: 'id,user_id' });

    if (error) {
      console.error('[JobRepository] Error batch upserting jobs:', error);
      throw error;
    }
  }

  /**
   * Deletes a job by ID for the current authenticated user.
   */
  public static async delete(id: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .match({ id, user_id: userId });

    if (error) {
      console.error('[JobRepository] Error deleting job:', error);
      throw error;
    }
  }
}
