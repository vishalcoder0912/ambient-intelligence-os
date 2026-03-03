import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple XOR-based obfuscation (not true AES, but sufficient for server-side storage)
function encryptToken(token: string): string {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback";
  let result = "";
  for (let i = 0; i < token.length; i++) {
    result += String.fromCharCode(token.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

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

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    const { action, token, account_id } = await req.json();

    if (action === "add") {
      if (!token) throw new Error("Token required");

      // Validate token with GitHub
      const ghRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "SecondBrainOS" },
      });
      if (!ghRes.ok) throw new Error("Invalid GitHub token");
      const ghUser = await ghRes.json();

      // Check if account exists
      const { data: existing } = await adminClient
        .from("github_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("username", ghUser.login)
        .maybeSingle();

      if (existing) {
        // Update token
        await adminClient
          .from("github_accounts")
          .update({ encrypted_token: encryptToken(token), avatar_url: ghUser.avatar_url, updated_at: new Date().toISOString() })
          .eq("id", existing.id);

        // Log security event
        await adminClient.from("security_events").insert({
          user_id: user.id,
          event_type: "token_updated",
          entity_type: "github_account",
          entity_id: existing.id,
        });

        return new Response(JSON.stringify({ id: existing.id, username: ghUser.login, avatar_url: ghUser.avatar_url, is_default: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if this is the first account
      const { count } = await adminClient
        .from("github_accounts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const isFirst = (count ?? 0) === 0;

      const { data: newAccount, error } = await adminClient
        .from("github_accounts")
        .insert({
          user_id: user.id,
          username: ghUser.login,
          avatar_url: ghUser.avatar_url,
          encrypted_token: encryptToken(token),
          is_default: isFirst,
        })
        .select()
        .single();

      if (error) throw error;

      await adminClient.from("security_events").insert({
        user_id: user.id,
        event_type: "account_added",
        entity_type: "github_account",
        entity_id: newAccount.id,
      });

      return new Response(JSON.stringify({
        id: newAccount.id,
        username: newAccount.username,
        avatar_url: newAccount.avatar_url,
        is_default: newAccount.is_default,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove") {
      if (!account_id) throw new Error("account_id required");
      await adminClient.from("github_accounts").delete().eq("id", account_id).eq("user_id", user.id);

      await adminClient.from("security_events").insert({
        user_id: user.id,
        event_type: "account_removed",
        entity_type: "github_account",
        entity_id: account_id,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "set_default") {
      if (!account_id) throw new Error("account_id required");
      // Unset all defaults
      await adminClient.from("github_accounts").update({ is_default: false }).eq("user_id", user.id);
      // Set new default
      await adminClient.from("github_accounts").update({ is_default: true }).eq("id", account_id).eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("GitHub account manage error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
