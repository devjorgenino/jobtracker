-- ==============================================================================
-- JobTracker AI Suite - Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to initialize all tables and policies.

-- 1. Create Profiles Table (Sync with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  work_mode TEXT DEFAULT 'Remoto',
  salary TEXT,
  url TEXT,
  description TEXT,
  requirements TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  contact_name TEXT,
  contact_email TEXT,
  contact_profile TEXT,
  portal TEXT DEFAULT 'Directo',
  status TEXT DEFAULT 'wishlist',
  priority TEXT DEFAULT 'medium',
  match_score NUMERIC,
  notes TEXT,
  activities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_update TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id, user_id)
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Master CVs Table
CREATE TABLE IF NOT EXISTS public.master_cvs (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  personal_info JSONB DEFAULT '{}'::jsonb,
  professional_summary TEXT,
  work_experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  skill_categories JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id, user_id)
);

ALTER TABLE public.master_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own master cvs"
  ON public.master_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own master cvs"
  ON public.master_cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own master cvs"
  ON public.master_cvs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own master cvs"
  ON public.master_cvs FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Tailored CVs Table
CREATE TABLE IF NOT EXISTS public.tailored_cvs (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  master_cv_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  title TEXT NOT NULL,
  match_score NUMERIC DEFAULT 0,
  keywords_matched TEXT[] DEFAULT '{}',
  keywords_missing TEXT[] DEFAULT '{}',
  cv_data JSONB DEFAULT '{}'::jsonb,
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id, user_id)
);

ALTER TABLE public.tailored_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tailored cvs"
  ON public.tailored_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tailored cvs"
  ON public.tailored_cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tailored cvs"
  ON public.tailored_cvs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tailored cvs"
  ON public.tailored_cvs FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Strategies Table
CREATE TABLE IF NOT EXISTS public.strategies (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id TEXT NOT NULL,
  match_score NUMERIC DEFAULT 0,
  key_angles TEXT[] DEFAULT '{}',
  talking_points TEXT[] DEFAULT '{}',
  company_intel JSONB DEFAULT '{}'::jsonb,
  outreach_templates JSONB DEFAULT '[]'::jsonb,
  contacts JSONB DEFAULT '[]'::jsonb,
  interview_prep JSONB DEFAULT '{}'::jsonb,
  next_steps TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id, user_id)
);

ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategies"
  ON public.strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
  ON public.strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON public.strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON public.strategies FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_master_cvs_user_id ON public.master_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_tailored_cvs_job_id ON public.tailored_cvs(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_strategies_job_id ON public.strategies(user_id, job_id);
