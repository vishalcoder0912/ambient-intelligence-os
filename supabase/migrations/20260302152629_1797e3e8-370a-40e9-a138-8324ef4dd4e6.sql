
-- Create tracked_repos table
CREATE TABLE public.tracked_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, repo_owner, repo_name)
);

-- Enable RLS
ALTER TABLE public.tracked_repos ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only manage their own repos
CREATE POLICY "Users can view own tracked repos"
  ON public.tracked_repos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracked repos"
  ON public.tracked_repos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracked repos"
  ON public.tracked_repos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked repos"
  ON public.tracked_repos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
