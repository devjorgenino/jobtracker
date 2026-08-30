import { supabase, isSupabaseConfigured } from './client';
import type { MasterCV, TailoredCV } from '../../types/cv';

export class CvRepository {
  // ==========================================
  // MASTER CV METHODS
  // ==========================================

  public static async getMasterCVs(userId: string): Promise<MasterCV[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('master_cvs')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[CvRepository] Error fetching master CVs:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      personalInfo: row.personal_info || {},
      workExperience: row.work_experience || [],
      education: row.education || [],
      skillCategories: row.skill_categories || [],
      languages: row.languages || [],
      certifications: row.certifications || [],
      projects: row.projects || [],
      updatedAt: row.updated_at,
    }));
  }

  public static async upsertMasterCV(cv: MasterCV, userId: string): Promise<MasterCV> {
    if (!isSupabaseConfigured()) return cv;

    const row = {
      id: cv.id,
      user_id: userId,
      title: cv.title || 'CV Principal',
      personal_info: cv.personalInfo,
      work_experience: cv.workExperience,
      education: cv.education,
      skill_categories: cv.skillCategories,
      languages: cv.languages || [],
      certifications: cv.certifications || [],
      projects: cv.projects || [],
      updated_at: cv.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from('master_cvs')
      .upsert(row, { onConflict: 'id,user_id' });

    if (error) {
      console.error('[CvRepository] Error upserting master CV:', error);
      throw error;
    }

    return cv;
  }

  // ==========================================
  // TAILORED CV METHODS
  // ==========================================

  public static async getTailoredCVs(userId: string): Promise<TailoredCV[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('tailored_cvs')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[CvRepository] Error fetching tailored CVs:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      jobId: row.job_id,
      masterCvId: row.master_cv_id,
      jobTitle: row.title,
      company: row.company || '',
      targetKeywordsMatched: row.keywords_matched || [],
      targetKeywordsMissing: row.keywords_missing || [],
      atsMatchScore: row.match_score || 0,
      atsScore: row.match_score || 0,
      fullMarkdown: row.cover_letter || '',
      summary: row.cv_data?.summary || '',
      workExperience: row.cv_data?.workExperience || [],
      education: row.cv_data?.education || [],
      skillCategories: row.cv_data?.skillCategories || [],
      projects: row.cv_data?.projects || [],
      certifications: row.cv_data?.certifications || [],
      languages: row.cv_data?.languages || [],
      generatedAt: row.created_at,
    }));
  }

  public static async upsertTailoredCV(cv: TailoredCV, userId: string): Promise<TailoredCV> {
    if (!isSupabaseConfigured()) return cv;

    const row = {
      id: cv.id,
      user_id: userId,
      master_cv_id: cv.masterCvId || 'master_cv_default',
      job_id: cv.jobId,
      title: cv.jobTitle || 'Tailored CV',
      match_score: cv.atsScore || cv.atsMatchScore || 0,
      keywords_matched: cv.targetKeywordsMatched || [],
      keywords_missing: cv.targetKeywordsMissing || [],
      cv_data: {
        personalInfo: cv.personalInfo,
        summary: cv.summary,
        workExperience: cv.workExperience,
        education: cv.education,
        skillCategories: cv.skillCategories,
        projects: cv.projects,
        certifications: cv.certifications,
        languages: cv.languages,
      },
      cover_letter: cv.fullMarkdown || '',
      created_at: cv.generatedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('tailored_cvs')
      .upsert(row, { onConflict: 'id,user_id' });

    if (error) {
      console.error('[CvRepository] Error upserting tailored CV:', error);
      throw error;
    }

    return cv;
  }

  public static async deleteTailoredCV(id: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from('tailored_cvs')
      .delete()
      .match({ id, user_id: userId });

    if (error) {
      console.error('[CvRepository] Error deleting tailored CV:', error);
      throw error;
    }
  }
}
