import { supabase, isSupabaseConfigured } from './client';
import type { JobStrategy } from '../../types/strategy';

export class StrategyRepository {
  public static async getAll(userId: string): Promise<JobStrategy[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[StrategyRepository] Error fetching strategies:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      jobId: row.job_id,
      lang: row.lang || 'es',
      companyOverview: row.company_overview || '',
      roleAnalysis: row.role_analysis || '',
      keySellingPoints: row.key_selling_points || [],
      tacticalPlan: row.tactical_plan || [],
      outreachMessages: row.outreach_messages || {
        linkedinConnection: '',
        linkedinInMail: '',
        emailCoverLetter: '',
        followUpEmail: '',
        postInterviewThankYou: '',
        salaryNegotiation: '',
      },
      interviewPrep: row.interview_prep || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  public static async upsert(strategy: JobStrategy, userId: string): Promise<JobStrategy> {
    if (!isSupabaseConfigured()) return strategy;

    const row = {
      id: strategy.id,
      user_id: userId,
      job_id: strategy.jobId,
      lang: strategy.lang || 'es',
      company_overview: strategy.companyOverview || '',
      role_analysis: strategy.roleAnalysis || '',
      key_selling_points: strategy.keySellingPoints || [],
      tactical_plan: strategy.tacticalPlan || [],
      outreach_messages: strategy.outreachMessages || {},
      interview_prep: strategy.interviewPrep || [],
      created_at: strategy.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('strategies')
      .upsert(row, { onConflict: 'id,user_id' });

    if (error) {
      console.error('[StrategyRepository] Error upserting strategy:', error);
      throw error;
    }

    return strategy;
  }

  public static async delete(id: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from('strategies')
      .delete()
      .match({ id, user_id: userId });

    if (error) {
      console.error('[StrategyRepository] Error deleting strategy:', error);
      throw error;
    }
  }
}
