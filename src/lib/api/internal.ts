import { supabase } from "@/integrations/supabase/client";

export interface ProductivityMetric {
  id: string;
  daily_score: number;
  weekly_score: number;
  streak: number;
  commit_count: number;
  focus_minutes: number;
  calculated_at: string;
}

export interface FocusSession {
  id: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
  label: string | null;
}

export interface AiInsight {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  intelligence_score: number | null;
  generated_at: string;
}

export async function fetchProductivityMetrics(limit = 7): Promise<ProductivityMetric[]> {
  const { data, error } = await supabase
    .from("productivity_metrics")
    .select("*")
    .order("calculated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ProductivityMetric[];
}

export async function fetchFocusSessions(limit = 10): Promise<FocusSession[]> {
  const { data, error } = await supabase
    .from("focus_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as FocusSession[];
}

export async function startFocusSession(label?: string): Promise<FocusSession> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({
      user_id: user.id,
      started_at: new Date().toISOString(),
      label: label || null,
      duration_minutes: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FocusSession;
}

export async function endFocusSession(sessionId: string): Promise<FocusSession> {
  const now = new Date();
  const { data: session } = await supabase
    .from("focus_sessions")
    .select("started_at")
    .eq("id", sessionId)
    .single();

  const durationMinutes = session
    ? Math.round((now.getTime() - new Date(session.started_at).getTime()) / 60000)
    : 0;

  const { data, error } = await supabase
    .from("focus_sessions")
    .update({
      ended_at: now.toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq("id", sessionId)
    .select()
    .single();
  if (error) throw error;
  return data as FocusSession;
}

export async function fetchAiInsights(limit = 10): Promise<AiInsight[]> {
  const { data, error } = await supabase
    .from("ai_insights")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as AiInsight[];
}

export async function generateInsights(): Promise<AiInsight[]> {
  const { data, error } = await supabase.functions.invoke("generate-insights");
  if (error) throw error;
  return data;
}

export async function fetchSecurityEvents(limit = 20) {
  const { data, error } = await supabase
    .from("security_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchSyncLogs(accountId?: string, limit = 20) {
  let query = supabase
    .from("github_sync_logs")
    .select("*")
    .order("synced_at", { ascending: false })
    .limit(limit);
  if (accountId) query = query.eq("github_account_id", accountId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
