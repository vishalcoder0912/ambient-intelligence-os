
-- 1. Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add foreign key + soft delete to tracked_repos
ALTER TABLE public.tracked_repos
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

CREATE INDEX idx_tracked_repos_user_id ON public.tracked_repos(user_id);

CREATE TRIGGER update_tracked_repos_updated_at BEFORE UPDATE ON public.tracked_repos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Repo commits table
CREATE TABLE public.repo_commits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_repo_id uuid NOT NULL REFERENCES public.tracked_repos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  commit_sha text NOT NULL,
  message text NOT NULL,
  author text,
  committed_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tracked_repo_id, commit_sha)
);

CREATE INDEX idx_repo_commits_repo ON public.repo_commits(tracked_repo_id);
CREATE INDEX idx_repo_commits_user ON public.repo_commits(user_id);
CREATE INDEX idx_repo_commits_date ON public.repo_commits(committed_at DESC);

ALTER TABLE public.repo_commits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commits" ON public.repo_commits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commits" ON public.repo_commits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Repo stats table
CREATE TABLE public.repo_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_repo_id uuid NOT NULL REFERENCES public.tracked_repos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  total_commits integer NOT NULL DEFAULT 0,
  weekly_streak integer NOT NULL DEFAULT 0,
  activity_score numeric(5,2) NOT NULL DEFAULT 0,
  stars integer NOT NULL DEFAULT 0,
  open_prs integer NOT NULL DEFAULT 0,
  active_branches integer NOT NULL DEFAULT 0,
  last_commit_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tracked_repo_id)
);

CREATE INDEX idx_repo_stats_user ON public.repo_stats(user_id);

ALTER TABLE public.repo_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON public.repo_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.repo_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.repo_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_repo_stats_updated_at BEFORE UPDATE ON public.repo_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Activity logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. AI insights table
CREATE TABLE public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  intelligence_score numeric(5,2),
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_insights_user ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX idx_ai_insights_generated ON public.ai_insights(generated_at DESC);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.ai_insights FOR DELETE USING (auth.uid() = user_id);

-- 8. User roles (for admin/user RBAC)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
