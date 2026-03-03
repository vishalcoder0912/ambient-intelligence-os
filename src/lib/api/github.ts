import { supabase } from "@/integrations/supabase/client";

export interface GitHubAccountData {
  id: string;
  username: string;
  avatar_url: string | null;
  is_default: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export interface GitHubActivityData {
  username: string;
  avatarUrl: string;
  commits: GitHubCommit[];
  todayCommitCount: number;
  activeBranches: number;
  trackedRepoCount: number;
  stats?: {
    totalCommits: number;
    weeklyStreak: number;
    stars: number;
    openPrs: number;
  };
}

export interface GitHubCommit {
  repo: string;
  message: string;
  time: string;
  sha: string;
  author?: string;
  type?: "feature" | "bugfix" | "refactor" | "chore" | "other";
}

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("rate limit") || err?.status === 429;
      if (i === retries - 1 || !isRateLimit) throw err;
      const delay = BASE_DELAY * Math.pow(2, i) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function fetchGitHubActivity(accountId?: string): Promise<GitHubActivityData> {
  return withRetry(async () => {
    const { data, error } = await supabase.functions.invoke("github-activity", {
      body: accountId ? { account_id: accountId } : undefined,
    });
    if (error) throw error;
    return data as GitHubActivityData;
  });
}

export async function syncGitHubAccount(accountId: string): Promise<{ success: boolean; commits_synced: number }> {
  return withRetry(async () => {
    const { data, error } = await supabase.functions.invoke("github-sync", {
      body: { account_id: accountId },
    });
    if (error) throw error;
    return data;
  });
}

export async function addGitHubAccount(token: string): Promise<GitHubAccountData> {
  const { data, error } = await supabase.functions.invoke("github-account-manage", {
    body: { action: "add", token },
  });
  if (error) throw error;
  return data;
}

export async function removeGitHubAccount(accountId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("github-account-manage", {
    body: { action: "remove", account_id: accountId },
  });
  if (error) throw error;
}

export async function setDefaultGitHubAccount(accountId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("github-account-manage", {
    body: { action: "set_default", account_id: accountId },
  });
  if (error) throw error;
}

export function classifyCommitMessage(message: string): GitHubCommit["type"] {
  const lower = message.toLowerCase();
  if (/^(feat|feature|add|implement|new)\b/i.test(lower)) return "feature";
  if (/^(fix|bug|patch|hotfix|resolve)\b/i.test(lower)) return "bugfix";
  if (/^(refactor|cleanup|clean|reorganize|restructure)\b/i.test(lower)) return "refactor";
  if (/^(chore|ci|build|deps|docs|style|test)\b/i.test(lower)) return "chore";
  return "other";
}
