import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function decryptToken(encrypted: string): string {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback";
  const decoded = atob(encrypted);
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user } } = await userClient.auth.getUser();

    let body: any = {};
    try { body = await req.json(); } catch {}
    const { account_id } = body;

    // Determine which accounts to sync
    let accounts: any[] = [];
    if (account_id) {
      const { data } = await adminClient
        .from("github_accounts")
        .select("*")
        .eq("id", account_id);
      accounts = data || [];
    } else if (user) {
      const { data } = await adminClient
        .from("github_accounts")
        .select("*")
        .eq("user_id", user.id);
      accounts = data || [];
    } else {
      // Cron mode: sync all accounts that haven't synced in 6 hours
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const { data } = await adminClient
        .from("github_accounts")
        .select("*")
        .or(`last_sync_at.is.null,last_sync_at.lt.${sixHoursAgo}`)
        .limit(20);
      accounts = data || [];
    }

    const results: any[] = [];

    for (const account of accounts) {
      const syncLogId = crypto.randomUUID();
      try {
        const token = decryptToken(account.encrypted_token);
        const ghHeaders = {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "SecondBrainOS",
        };

        // Verify token is still valid
        const userRes = await fetch("https://api.github.com/user", { headers: ghHeaders });
        if (!userRes.ok) {
          throw new Error(`Token expired or invalid (${userRes.status})`);
        }

        // Get tracked repos for this account
        const { data: trackedRepos } = await adminClient
          .from("tracked_repos")
          .select("id, repo_owner, repo_name")
          .eq("user_id", account.user_id);

        let totalNewCommits = 0;

        for (const repo of (trackedRepos || [])) {
          // Fetch recent commits
          const commitsRes = await fetch(
            `https://api.github.com/repos/${repo.repo_owner}/${repo.repo_name}/commits?per_page=30`,
            { headers: ghHeaders }
          );

          if (!commitsRes.ok) continue;
          const commits = await commitsRes.json();
          if (!Array.isArray(commits)) continue;

          // Get existing commit SHAs to avoid duplicates
          const { data: existingShas } = await adminClient
            .from("repo_commits")
            .select("commit_sha")
            .eq("tracked_repo_id", repo.id)
            .limit(100);

          const existingSet = new Set((existingShas || []).map((r: any) => r.commit_sha));

          const newCommits = commits
            .filter((c: any) => !existingSet.has(c.sha))
            .map((c: any) => ({
              tracked_repo_id: repo.id,
              user_id: account.user_id,
              github_account_id: account.id,
              commit_sha: c.sha,
              message: c.commit?.message?.split("\n")[0] || "",
              author: c.commit?.author?.name || c.author?.login || "",
              committed_at: c.commit?.author?.date || new Date().toISOString(),
            }));

          if (newCommits.length > 0) {
            await adminClient.from("repo_commits").insert(newCommits);
            totalNewCommits += newCommits.length;
          }

          // Update repo stats
          const { count: totalCommitCount } = await adminClient
            .from("repo_commits")
            .select("id", { count: "exact", head: true })
            .eq("tracked_repo_id", repo.id);

          // Fetch repo info for stars
          const repoInfoRes = await fetch(
            `https://api.github.com/repos/${repo.repo_owner}/${repo.repo_name}`,
            { headers: ghHeaders }
          );
          const repoInfo = repoInfoRes.ok ? await repoInfoRes.json() : {};

          // Fetch open PRs count
          const prsRes = await fetch(
            `https://api.github.com/repos/${repo.repo_owner}/${repo.repo_name}/pulls?state=open&per_page=1`,
            { headers: ghHeaders }
          );
          const openPrs = prsRes.ok ? parseInt(prsRes.headers.get("x-total-count") || "0") || 0 : 0;

          // Upsert stats
          const { data: existingStat } = await adminClient
            .from("repo_stats")
            .select("id")
            .eq("tracked_repo_id", repo.id)
            .maybeSingle();

          const statData = {
            tracked_repo_id: repo.id,
            user_id: account.user_id,
            github_account_id: account.id,
            total_commits: totalCommitCount || 0,
            stars: repoInfo.stargazers_count || 0,
            open_prs: openPrs,
            active_branches: repoInfo.default_branch ? 1 : 0,
            last_commit_at: commits[0]?.commit?.author?.date || null,
            synced_at: new Date().toISOString(),
          };

          if (existingStat) {
            await adminClient.from("repo_stats").update(statData).eq("id", existingStat.id);
          } else {
            await adminClient.from("repo_stats").insert(statData);
          }
        }

        // Update account last_sync_at
        await adminClient
          .from("github_accounts")
          .update({ last_sync_at: new Date().toISOString() })
          .eq("id", account.id);

        // Log successful sync
        await adminClient.from("github_sync_logs").insert({
          id: syncLogId,
          github_account_id: account.id,
          user_id: account.user_id,
          status: "success",
          commits_synced: totalNewCommits,
          duration_ms: Date.now() - startTime,
        });

        results.push({ account_id: account.id, username: account.username, status: "success", commits_synced: totalNewCommits });
      } catch (err) {
        await adminClient.from("github_sync_logs").insert({
          id: syncLogId,
          github_account_id: account.id,
          user_id: account.user_id,
          status: "error",
          error_message: err.message,
          duration_ms: Date.now() - startTime,
        });
        results.push({ account_id: account.id, username: account.username, status: "error", error: err.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GitHub sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
