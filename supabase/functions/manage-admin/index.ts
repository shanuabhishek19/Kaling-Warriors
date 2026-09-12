import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const adminClient = createClient(supabaseUrl, serviceKey);
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Authentication required");
    const { data: actor } = await adminClient.auth.getUser(token);
    if (!actor.user) throw new Error("Authentication required");
    const { data: allowed } = await adminClient.rpc("is_admin_for_user", { _user_id: actor.user.id });
    if (!allowed) throw new Error("Administrator access required");
    const body = await request.json() as { action: string; user_id?: string; name?: string; email?: string; password?: string; status?: string };
    if (body.action === "create") {
      if (!body.email || !body.password || body.password.length < 12) throw new Error("Use an email and a password of at least 12 characters");
      const created = await adminClient.auth.admin.createUser({ email: body.email.trim().toLowerCase(), password: body.password, email_confirm: true, user_metadata: { full_name: body.name ?? "" } });
      if (created.error) throw created.error;
      const { error } = await adminClient.from("admin_accounts").insert({ user_id: created.data.user.id, email: body.email.trim().toLowerCase(), name: body.name ?? "", status: body.status === "disabled" ? "disabled" : "active" });
      if (error) { await adminClient.auth.admin.deleteUser(created.data.user.id); throw error; }
      const role = await adminClient.from("user_roles").insert({ user_id: created.data.user.id, role: "admin" });
      if (role.error) {
        await adminClient.from("admin_accounts").delete().eq("user_id", created.data.user.id);
        await adminClient.auth.admin.deleteUser(created.data.user.id);
        throw role.error;
      }
    } else if (body.action === "status" && body.user_id) {
      if (body.user_id === actor.user.id && body.status !== "active") throw new Error("You cannot disable your own active session");
      if (body.status !== "active" && body.status !== "disabled") throw new Error("Invalid account status");
      const { data: active } = await adminClient.from("admin_accounts").select("user_id").eq("status", "active");
      if (body.status !== "active" && (active?.length ?? 0) <= 1) throw new Error("The last active administrator cannot be disabled");
      const { error } = await adminClient.from("admin_accounts").update({ status: body.status }).eq("user_id", body.user_id); if (error) throw error;
    } else if (body.action === "delete" && body.user_id) {
      if (body.user_id === actor.user.id) throw new Error("You cannot delete your own administrator account");
      const { data: active } = await adminClient.from("admin_accounts").select("user_id").eq("status", "active");
      const target = await adminClient.from("admin_accounts").select("status").eq("user_id", body.user_id).single();
      if (target.data?.status === "active" && (active?.length ?? 0) <= 1) throw new Error("The last active administrator cannot be deleted");
      const removed = await adminClient.from("admin_accounts").delete().eq("user_id", body.user_id); if (removed.error) throw removed.error;
      const deleted = await adminClient.auth.admin.deleteUser(body.user_id); if (deleted.error) throw deleted.error;
    } else if (body.action === "reset" && body.user_id) {
      if (!body.password || body.password.length < 12) throw new Error("Use a password of at least 12 characters");
      const updated = await adminClient.auth.admin.updateUserById(body.user_id, { password: body.password }); if (updated.error) throw updated.error;
    } else throw new Error("Invalid administrator action");
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } }); }
});
