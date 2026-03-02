import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user } } = await supabaseClient.auth.getUser();

    // Get tracked repos for the user (if authenticated)
    let trackedRepos: { repo_owner: string; repo_name: string }[] = [];
    if (user) {
      const { data } = await supabaseClient
        .from("tracked_repos")
        .select("repo_owner, repo_name");
      trackedRepos = data || [];
    }

    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SecondBrainOS",
    };

    // Fetch authenticated GitHub user
    const userRes = await fetch("https://api.github.com/user", { headers: ghHeaders });
    if (!userRes.ok) throw new Error(`GitHub user fetch failed: ${userRes.status}`);
    const ghUser = await userRes.json();

    // If user has tracked repos, fetch activity for those specifically
    const allCommits: any[] = [];
    let todayCommits = 0;
    const branchSet = new Set<string>();
    const today = new Date().toISOString().split("T")[0];

    if (trackedRepos.length > 0) {
      // Fetch events for each tracked repo (up to 5 concurrent)
      const repoFetches = trackedRepos.slice(0, 10).map(async (repo) => {
        const eventsRes = await fetch(
          `https://api.github.com/repos/${repo.repo_owner}/${repo.repo_name}/events?per_page=30`,
          { headers: ghHeaders }
        );
        if (!eventsRes.ok) return [];
        return eventsRes.json();
      });

      const repoEvents = await Promise.all(repoFetches);

      for (const events of repoEvents) {
        if (!Array.isArray(events)) continue;

        const pushEvents = events.filter((e: any) => e.type === "PushEvent");
        for (const e of pushEvents) {
          for (const c of e.payload.commits || []) {
            allCommits.push({
              repo: e.repo.name.split("/").pop(),
              message: c.message.split("\n")[0],
              time: e.created_at,
              sha: c.sha?.substring(0, 7),
              author: c.author?.name || ghUser.login,
            });
          }
          if (e.created_at.startsWith(today)) {
            todayCommits += e.payload.commits?.length || 0;
          }
          branchSet.add(`${e.repo.name}/${e.payload.ref?.replace("refs/heads/", "")}`);
        }

        for (const e of events) {
          if (e.type === "CreateEvent" && e.payload.ref_type === "branch") {
            branchSet.add(`${e.repo.name}/${e.payload.ref}`);
          }
        }
      }
    } else {
      // Fallback: fetch user events
      const eventsRes = await fetch(
        `https://api.github.com/users/${ghUser.login}/events?per_page=30`,
        { headers: ghHeaders }
      );
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        const pushEvents = events.filter((e: any) => e.type === "PushEvent");

        for (const e of pushEvents) {
          for (const c of e.payload.commits || []) {
            allCommits.push({
              repo: e.repo.name.split("/").pop(),
              message: c.message.split("\n")[0],
              time: e.created_at,
              sha: c.sha?.substring(0, 7),
              author: c.author?.name || ghUser.login,
            });
          }
          if (e.created_at.startsWith(today)) {
            todayCommits += e.payload.commits?.length || 0;
          }
          branchSet.add(`${e.repo.name}/${e.payload.ref?.replace("refs/heads/", "")}`);
        }

        events.forEach((e: any) => {
          if (e.type === "CreateEvent" && e.payload.ref_type === "branch") {
            branchSet.add(`${e.repo.name}/${e.payload.ref}`);
          }
        });
      }
    }

    // Sort by time, limit to 10
    allCommits.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return new Response(
      JSON.stringify({
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        commits: allCommits.slice(0, 10),
        todayCommitCount: todayCommits,
        activeBranches: branchSet.size,
        trackedRepoCount: trackedRepos.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GitHub API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
