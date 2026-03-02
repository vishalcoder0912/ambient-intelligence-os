import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not configured");
    }

    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SecondBrainOS",
    };

    // Fetch authenticated user
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) throw new Error(`GitHub user fetch failed: ${userRes.status}`);
    const user = await userRes.json();

    // Fetch recent events (commits, PRs, etc.)
    const eventsRes = await fetch(
      `https://api.github.com/users/${user.login}/events?per_page=30`,
      { headers }
    );
    if (!eventsRes.ok) throw new Error(`GitHub events fetch failed: ${eventsRes.status}`);
    const events = await eventsRes.json();

    // Extract push events with commits
    const pushEvents = events.filter((e: any) => e.type === "PushEvent");
    const recentCommits = pushEvents
      .flatMap((e: any) =>
        (e.payload.commits || []).map((c: any) => ({
          repo: e.repo.name.split("/")[1],
          message: c.message.split("\n")[0],
          time: e.created_at,
          sha: c.sha?.substring(0, 7),
        }))
      )
      .slice(0, 10);

    // Count today's commits
    const today = new Date().toISOString().split("T")[0];
    const todayCommits = pushEvents
      .filter((e: any) => e.created_at.startsWith(today))
      .reduce((sum: number, e: any) => sum + (e.payload.commits?.length || 0), 0);

    // Count active branches from recent create/push events
    const branchSet = new Set<string>();
    events.forEach((e: any) => {
      if (e.type === "CreateEvent" && e.payload.ref_type === "branch") {
        branchSet.add(`${e.repo.name}/${e.payload.ref}`);
      }
      if (e.type === "PushEvent") {
        branchSet.add(`${e.repo.name}/${e.payload.ref?.replace("refs/heads/", "")}`);
      }
    });

    return new Response(
      JSON.stringify({
        username: user.login,
        avatarUrl: user.avatar_url,
        commits: recentCommits,
        todayCommitCount: todayCommits,
        activeBranches: branchSet.size,
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
