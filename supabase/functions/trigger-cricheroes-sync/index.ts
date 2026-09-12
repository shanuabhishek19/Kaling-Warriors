import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Authentication required");
    const database = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const user = await database.auth.getUser(token);
    if (!user.data.user) throw new Error("Authentication required");
    const allowed = await database.rpc("is_admin_for_user", { _user_id: user.data.user.id });
    if (allowed.error || !allowed.data) throw new Error("Administrator access required");

    const githubToken = Deno.env.get("GITHUB_SYNC_TOKEN");
    const repository = Deno.env.get("GITHUB_REPOSITORY") ?? "shanuabhishek19/Kaling-Warriors";
    if (!githubToken) throw new Error("GITHUB_SYNC_TOKEN is not configured");
    const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/cricheroes-sync.yml/dispatches`, {
      method: "POST",
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${githubToken}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main" }),
    });
    if (!response.ok) throw new Error(`GitHub workflow dispatch failed (${response.status})`);
    return new Response(JSON.stringify({ ok: true, message: "CricHeroes sync started. Check GitHub Actions for progress." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Sync could not be started" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
