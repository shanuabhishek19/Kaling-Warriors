import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const recipient = Deno.env.get("NOTIFICATION_EMAIL") ?? "Kalingawarriors2026@gmail.com";
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const database = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

function text(value: unknown) {
  return String(value ?? "").trim();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  if (!resendApiKey) return new Response(JSON.stringify({ skipped: true, reason: "RESEND_API_KEY is not configured" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (Number(request.headers.get("content-length") ?? 0) > 32_000) return new Response(JSON.stringify({ error: "Request too large" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const body = await request.json() as { kind?: string; record_id?: string };
  if (body.kind !== "booking" && body.kind !== "challenge") return new Response(JSON.stringify({ error: "Invalid notification type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!body.record_id || !/^[0-9a-f-]{36}$/i.test(body.record_id)) return new Response(JSON.stringify({ error: "Invalid request ID" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const kind = body.kind;
  const table = kind === "booking" ? "bookings" : "challenges";
  const record = await database.from(table).select("*").eq("id", body.record_id).maybeSingle();
  if (record.error || !record.data) return new Response(JSON.stringify({ error: "Request not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const data = record.data as Record<string, unknown>;
  if (data.email_notified_at) return new Response(JSON.stringify({ sent: false, duplicate: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const limited = await database.rpc("consume_notification_rate_limit", { _rate_key: `${kind}:${text(data.email).toLowerCase()}` });
  if (limited.error || !limited.data) return new Response(JSON.stringify({ error: "Notification rate limit reached" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const title = kind === "booking" ? `New Ground Booking Request - ${text(data.booking_date)} - ${text(data.team_name)}` : `New Cricket Match Challenge - ${text(data.team_name)}`;
  const labels = kind === "booking"
    ? ["Team / customer", "Contact person", "Phone", "Email", "Booking date", "Time slot", "Duration", "Players", "Format", "Requirements", "Price"]
    : ["Opposite team", "Contact person", "Phone", "Email", "Preferred date", "Preferred time", "Venue", "Format", "Ball type", "Message"];
  const keys = kind === "booking"
    ? ["team_name", "contact_name", "phone", "email", "booking_date", "slot", "duration_hours", "players_count", "format", "requirements", "price_inr"]
    : ["team_name", "contact_name", "phone", "email", "preferred_date", "preferred_time", "venue", "format", "ball_type", "message"];
  if (kind === "booking") {
    const slot = await database.from("ground_slots").select("label,start_time,end_time").eq("id", text(data.slot_id)).maybeSingle();
    data.slot = slot.data ? `${slot.data.label} (${slot.data.start_time}-${slot.data.end_time})` : "";
  }
  const html = `<h2>${escapeHtml(title)}</h2><table>${labels.map((label, index) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(text(data[keys[index]]))}</td></tr>`).join("")}</table>`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: Deno.env.get("EMAIL_FROM") ?? "Kalinga Warriors <onboarding@resend.dev>", to: [recipient], subject: title, html }) });
  if (!response.ok) return new Response(JSON.stringify({ error: await response.text() }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  await database.from(table).update({ email_notified_at: new Date().toISOString() }).eq("id", body.record_id);
  return new Response(JSON.stringify({ sent: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
