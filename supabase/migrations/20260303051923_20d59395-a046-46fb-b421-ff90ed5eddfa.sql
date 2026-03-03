
-- =============================================
-- SECTION 1: GitHub Accounts (multi-account)
-- =============================================
CREATE TABLE public.github_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username text NOT NULL,
  avatar_url text,
  encrypted_token text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, username)
);

ALTER TABLE public.github_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own github accounts" ON public.github_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own github accounts" ON public.github_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own github accounts" ON public.github_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own github accounts" ON public.github_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_github_accounts_updated_at BEFORE UPDATE ON public.github_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_github_accounts_user_id ON public.github_accounts(user_id);
CREATE INDEX idx_github_accounts_default ON public.github_accounts(user_id, is_default) WHERE is_default = true;

-- =============================================
-- SECTION 2: Productivity Metrics
-- =============================================
CREATE TABLE public.productivity_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  github_account_id uuid REFERENCES public.github_accounts(id) ON DELETE SET NULL,
  daily_score numeric NOT NULL DEFAULT 0,
  weekly_score numeric NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  commit_count integer NOT NULL DEFAULT 0,
  focus_minutes integer NOT NULL DEFAULT 0,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own metrics" ON public.productivity_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON public.productivity_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_productivity_metrics_user ON public.productivity_metrics(user_id, calculated_at DESC);

-- =============================================
-- SECTION 3: Focus Sessions
-- =============================================
CREATE TABLE public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_focus_sessions_user ON public.focus_sessions(user_id, started_at DESC);

-- =============================================
-- SECTION 4: GitHub Sync Logs
-- =============================================
CREATE TABLE public.github_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_account_id uuid NOT NULL REFERENCES public.github_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  commits_synced integer DEFAULT 0,
  duration_ms integer,
  synced_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.github_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sync logs" ON public.github_sync_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync logs" ON public.github_sync_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sync_logs_account ON public.github_sync_logs(github_account_id, synced_at DESC);
CREATE INDEX idx_sync_logs_user ON public.github_sync_logs(user_id);

-- =============================================
-- SECTION 5: Security Events (audit)
-- =============================================
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  entity_type text,
  entity_id text,
  ip_address text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own security events" ON public.security_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own security events" ON public.security_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_security_events_user ON public.security_events(user_id, created_at DESC);

-- =============================================
-- SECTION 6: Activity Vectors
-- =============================================
CREATE TABLE public.activity_vectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  weight numeric NOT NULL DEFAULT 1.0,
  metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_vectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vectors" ON public.activity_vectors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vectors" ON public.activity_vectors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_activity_vectors_user ON public.activity_vectors(user_id, recorded_at DESC);
CREATE INDEX idx_activity_vectors_source ON public.activity_vectors(source);

-- =============================================
-- Add github_account_id FK to existing tables
-- =============================================
ALTER TABLE public.repo_commits ADD COLUMN IF NOT EXISTS github_account_id uuid REFERENCES public.github_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.repo_stats ADD COLUMN IF NOT EXISTS github_account_id uuid REFERENCES public.github_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.tracked_repos ADD COLUMN IF NOT EXISTS github_account_id uuid REFERENCES public.github_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_repo_commits_account ON public.repo_commits(github_account_id);
CREATE INDEX IF NOT EXISTS idx_tracked_repos_account ON public.tracked_repos(github_account_id);
