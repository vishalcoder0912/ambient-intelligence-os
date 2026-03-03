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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Gather data for analysis
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [commitsRes, focusRes, accountsRes] = await Promise.all([
      adminClient.from("repo_commits").select("message, committed_at, author").eq("user_id", user.id).gte("committed_at", oneWeekAgo).order("committed_at", { ascending: false }).limit(100),
      adminClient.from("focus_sessions").select("duration_minutes, started_at, ended_at, label").eq("user_id", user.id).gte("started_at", oneWeekAgo).order("started_at", { ascending: false }),
      adminClient.from("github_accounts").select("username").eq("user_id", user.id),
    ]);

    const commits = commitsRes.data || [];
    const focusSessions = focusRes.data || [];
    const accounts = accountsRes.data || [];

    const totalCommits = commits.length;
    const totalFocusMinutes = focusSessions.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0);
    const avgDailyCommits = Math.round((totalCommits / 7) * 10) / 10;

    // Classify commits
    const features = commits.filter((c: any) => /^(feat|feature|add|implement|new)\b/i.test(c.message)).length;
    const bugfixes = commits.filter((c: any) => /^(fix|bug|patch|hotfix)\b/i.test(c.message)).length;
    const refactors = commits.filter((c: any) => /^(refactor|cleanup|clean)\b/i.test(c.message)).length;

    // Calculate hours distribution for peak hour detection
    const hourBuckets: Record<number, number> = {};
    commits.forEach((c: any) => {
      const hour = new Date(c.committed_at).getHours();
      hourBuckets[hour] = (hourBuckets[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];

    // Calculate cognitive load / intelligence score
    const productivityScore = Math.min(100, Math.round(
      (totalCommits * 2) + (totalFocusMinutes * 0.5) + (features * 5) - (bugfixes * 2)
    ));

    // Burnout detection
    const dailyCommitCounts: Record<string, number> = {};
    commits.forEach((c: any) => {
      const day = c.committed_at.split("T")[0];
      dailyCommitCounts[day] = (dailyCommitCounts[day] || 0) + 1;
    });
    const maxDailyCommits = Math.max(0, ...Object.values(dailyCommitCounts));
    const burnoutRisk = maxDailyCommits > 20 ? "high" : maxDailyCommits > 12 ? "moderate" : "low";

    // Build insights
    const insights: any[] = [];

    // Weekly productivity report
    insights.push({
      user_id: user.id,
      title: "Weekly Productivity Report",
      insight_type: "weekly_report",
      intelligence_score: productivityScore,
      content: `This week: ${totalCommits} commits across ${accounts.length} account(s). ${features} features, ${bugfixes} fixes, ${refactors} refactors. Average ${avgDailyCommits} commits/day. Total focus time: ${totalFocusMinutes} minutes.`,
      metadata: { totalCommits, features, bugfixes, refactors, totalFocusMinutes, avgDailyCommits },
    });

    // Peak performance insight
    if (peakHour) {
      insights.push({
        user_id: user.id,
        title: "Peak Performance Hours",
        insight_type: "peak_hours",
        intelligence_score: null,
        content: `Your most productive hour this week is ${peakHour[0]}:00 with ${peakHour[1]} commits. Schedule deep work during this window.`,
        metadata: { peakHour: parseInt(peakHour[0]), commitCount: peakHour[1], hourBuckets },
      });
    }

    // Burnout detection
    if (burnoutRisk !== "low") {
      insights.push({
        user_id: user.id,
        title: "Burnout Risk Detection",
        insight_type: "burnout_warning",
        intelligence_score: burnoutRisk === "high" ? 30 : 60,
        content: `${burnoutRisk === "high" ? "⚠️ High" : "⚡ Moderate"} burnout risk detected. Max ${maxDailyCommits} commits in a single day. Consider pacing your work.`,
        metadata: { burnoutRisk, maxDailyCommits },
      });
    }

    // Flow score
    const flowScore = focusSessions.filter((s: any) => s.duration_minutes >= 45).length;
    insights.push({
      user_id: user.id,
      title: "Flow State Analysis",
      insight_type: "flow_score",
      intelligence_score: Math.min(100, flowScore * 20),
      content: `${flowScore} deep focus sessions (45+ min) this week. ${flowScore >= 5 ? "Excellent flow maintenance!" : flowScore >= 3 ? "Good flow frequency." : "Try longer uninterrupted sessions for deeper work."}`,
      metadata: { flowScore, totalSessions: focusSessions.length },
    });

    // Store insights
    if (insights.length > 0) {
      await adminClient.from("ai_insights").insert(insights);
    }

    // Also store productivity metric
    await adminClient.from("productivity_metrics").insert({
      user_id: user.id,
      daily_score: avgDailyCommits * 10,
      weekly_score: productivityScore,
      streak: Object.keys(dailyCommitCounts).length,
      commit_count: totalCommits,
      focus_minutes: totalFocusMinutes,
      metadata: { burnoutRisk, flowScore },
    });

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate insights error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
