/**
 * ATS (Applicant Tracking System) Evaluation Types
 */

export interface ATSRuleCheck {
  id: string;
  category: 'format' | 'content' | 'keywords' | 'impact';
  rule: string;
  passed: boolean;
  score: number;
  tip: string;
}

export interface ATSAnalysisResult {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  keywordMatchScore: number;
  formatScore: number;
  experienceImpactScore: number;
  skillsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  ruleChecks: ATSRuleCheck[];
  actionVerbsFound: string[];
  actionVerbsSuggested: string[];
  strengths: string[];
  improvements: string[];
  recruiterSummary: string;
}
