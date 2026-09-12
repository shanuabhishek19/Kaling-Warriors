import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FilePlus2,
  ImagePlus,
  LogOut,
  Menu,
  Save,
  Settings2,
  ShieldCheck,
  Trophy,
  UserRoundPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaImage } from "@/components/media-image";
import { AdminPlayersPanel } from "@/components/admin-players-panel";
import { AdminManagementPanel } from "@/components/admin-management-panel";
type Panel =
  | "overview"
  | "requests"
  | "matches"
  | "players"
  | "ground"
  | "settings"
  | "admins";
import { StatusBadge, StatCard } from "@/components/ui-bits";
import { useIsAdmin, useSession } from "@/hooks/use-session";
import {
  bookingsQuery,
  challengesQuery,
  matchesQuery,
  notificationsQuery,
  ADDITIONAL_PLAYER_ROLES,
  BATTING_STYLES,
  BOWLING_STYLES,
  PLAYER_ROLES,
  playersQuery,
  slotsQuery,
  teamSettingsQuery,
  type Booking,
  type Challenge,
  type GroundSlot,
  type Match,
  type Player,
  type TeamSettings,
} from "@/lib/queries";
import { formatDate, formatTime, inr } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage, removeMedia, uploadMedia } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Kalinga Warriors" },
      {
        name: "description",
        content:
          "Manage Kalinga Warriors fixtures, squad, requests and ground operations.",
      },
      { property: "og:title", content: "Admin Dashboard — Kalinga Warriors" },
      {
        property: "og:description",
        content: "Secure club operations workspace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const panels: { id: Panel; label: string; icon: typeof Trophy }[] = [
  { id: "overview", label: "Overview", icon: Trophy },
  { id: "requests", label: "Requests", icon: CircleAlert },
  { id: "matches", label: "Matches", icon: CalendarDays },
  { id: "players", label: "Players", icon: Users },
  { id: "ground", label: "Ground slots", icon: Clock3 },
  { id: "settings", label: "Club settings", icon: Settings2 },
  { id: "admins", label: "Administrators", icon: ShieldCheck },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: sessionLoading } = useSession();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [panel, setPanel] = useState<Panel>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const matches = useQuery(matchesQuery);
  const players = useQuery(playersQuery);
  const bookings = useQuery(bookingsQuery);
  const challenges = useQuery(challengesQuery);
  const notifications = useQuery(notificationsQuery);
  const slots = useQuery(slotsQuery);
  const settings = useQuery(teamSettingsQuery);

  const pendingCount =
    (bookings.data ?? []).filter((item) => item.status === "pending").length +
    (challenges.data ?? []).filter((item) => item.status === "pending").length;
  const upcomingCount = (matches.data ?? []).filter(
    (item) => item.status === "upcoming",
  ).length;
  const completedCount = (matches.data ?? []).filter(
    (item) => item.status === "completed",
  ).length;

  const refresh = async (...keys: string[]) => {
    await Promise.all(
      keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    );
  };

  async function signOut() {
    setSigningOut(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setSigningOut(false);
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  if (sessionLoading || roleLoading) return <LoadingScreen />;
  if (!user) return null;
  if (!isAdmin)
    return (
      <AccessDenied email={user.email ?? "your account"} onSignOut={signOut} />
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-7">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-[0.28em] text-primary">
                Kalinga Warriors
              </p>
              <p className="display-title text-lg leading-none">Control room</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-medium">{user.email}</span>
              <span className="block text-xs text-muted-foreground">
                Administrator
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={signOut}
              disabled={signingOut}
            >
              <LogOut className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open dashboard menu"
              className="lg:hidden"
              onClick={() => setNavOpen((value) => !value)}
            >
              {navOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside
          className={`${navOpen ? "block" : "hidden"} absolute inset-x-0 top-16 z-40 border-b border-border bg-card p-3 lg:static lg:block lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-5`}
        >
          <p className="px-3 pb-2 pt-1 font-heading text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Workspace
          </p>
          <nav className="grid gap-1">
            {panels.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPanel(id);
                  setNavOpen(false);
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${panel === id ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"}`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
                {id === "requests" && pendingCount > 0 ? (
                  <span className="ml-auto rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
                    {pendingCount}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <div className="mt-8 border-t border-border pt-4">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-4" /> View public site
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-7 sm:px-7 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-7xl">
            {panel === "overview" ? (
              <Overview
                stats={{
                  pendingCount,
                  upcomingCount,
                  completedCount,
                  players: players.data?.length ?? 0,
                }}
                bookings={bookings.data ?? []}
                challenges={challenges.data ?? []}
                onOpenRequests={() => setPanel("requests")}
              />
            ) : null}
            {panel === "requests" ? (
              <Requests
                bookings={bookings.data ?? []}
                challenges={challenges.data ?? []}
                onRefresh={() =>
                  refresh("bookings", "challenges", "notifications")
                }
              />
            ) : null}
            {panel === "matches" ? (
              <MatchesPanel
                matches={matches.data ?? []}
                onRefresh={() => refresh("matches")}
              />
            ) : null}
            {panel === "players" ? (
              <AdminPlayersPanel
                players={players.data ?? []}
                onRefresh={() => refresh("players")}
              />
            ) : null}
            {panel === "ground" ? (
              <GroundPanel
                slots={slots.data ?? []}
                onRefresh={() => refresh("ground-slots")}
              />
            ) : null}
            {panel === "settings" ? (
              <SettingsPanel
                settings={settings.data ?? null}
                onRefresh={() => refresh("team-settings")}
              />
            ) : null}
            {panel === "admins" ? (
              <AdminManagementPanel currentUserId={user.id} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <ShieldCheck className="mx-auto size-8 animate-pulse text-primary" />
        <p className="mt-3 font-heading text-sm uppercase tracking-widest text-muted-foreground">
          Verifying access
        </p>
      </div>
    </div>
  );
}

function AccessDenied({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <XCircle className="mx-auto size-10 text-destructive" />
        <p className="mt-5 font-heading text-xs uppercase tracking-[0.25em] text-destructive">
          Access restricted
        </p>
        <h1 className="display-title mt-2 text-4xl">Not an admin account</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {email} is signed in, but it is not approved for club management.
        </p>
        <Button className="mt-7" variant="outline" onClick={onSignOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </main>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
        <h1 className="display-title mt-2 text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function Overview({
  stats,
  bookings,
  challenges,
  onOpenRequests,
}: {
  stats: {
    pendingCount: number;
    upcomingCount: number;
    completedCount: number;
    players: number;
  };
  bookings: Booking[];
  challenges: Challenge[];
  onOpenRequests: () => void;
}) {
  const activity = [
    ...bookings.map((item) => ({ ...item, requestType: "Ground booking" })),
    ...challenges.map((item) => ({ ...item, requestType: "Match challenge" })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);
  return (
    <>
      <PageIntro
        eyebrow="Operations overview"
        title="Good morning, captain."
        description="Keep the squad, fixtures and ground operations moving from one calm workspace."
        action={
          stats.pendingCount > 0 ? (
            <Button onClick={onOpenRequests}>
              <CircleAlert className="size-4" /> Review {stats.pendingCount}{" "}
              requests
            </Button>
          ) : null
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending requests"
          value={stats.pendingCount}
          icon={CircleAlert}
          hint="Needs your attention"
        />
        <StatCard
          label="Upcoming fixtures"
          value={stats.upcomingCount}
          icon={CalendarDays}
          hint="On the calendar"
        />
        <StatCard
          label="Results logged"
          value={stats.completedCount}
          icon={Trophy}
          hint="Completed matches"
        />
        <StatCard
          label="Squad members"
          value={stats.players}
          icon={Users}
          hint="Active profiles"
        />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg uppercase tracking-wide">
              Latest activity
            </h2>
            <Button variant="ghost" size="sm" onClick={onOpenRequests}>
              View requests <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-card/40">
            {activity.length ? (
              activity.map((item) => (
                <div
                  key={`${item.requestType}-${item.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.team_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.requestType} ·{" "}
                      {formatDate(item.created_at.slice(0, 10))}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No activity yet.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-primary">
            Captain’s note
          </p>
          <h2 className="mt-3 font-heading text-2xl uppercase">
            Protect the rhythm.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Keep pending requests moving and update the public schedule after
            every result. Clear, current information makes the club feel as
            professional as the team plays.
          </p>
        </section>
      </div>
    </>
  );
}

function Requests({
  bookings,
  challenges,
  onRefresh,
}: {
  bookings: Booking[];
  challenges: Challenge[];
  onRefresh: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"bookings" | "challenges">("bookings");
  const [working, setWorking] = useState<string | null>(null);
  async function updateRequest(
    table: "bookings" | "challenges",
    id: string,
    status: string,
  ) {
    setWorking(id);
    const { error } = await supabase
      .from(table)
      .update({ status })
      .eq("id", id);
    setWorking(null);
    if (error) toast.error(error.message);
    else {
      toast.success(`Request ${status}`);
      await onRefresh();
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="Incoming requests"
        title="Requests desk"
        description="Review ground bookings and match challenges, then keep every requester in the loop."
      />
      <div className="mb-5 flex gap-1 border-b border-border">
        <Button
          variant={tab === "bookings" ? "secondary" : "ghost"}
          onClick={() => setTab("bookings")}
        >
          Ground bookings{" "}
          <span className="ml-1 text-xs text-muted-foreground">
            {bookings.length}
          </span>
        </Button>
        <Button
          variant={tab === "challenges" ? "secondary" : "ghost"}
          onClick={() => setTab("challenges")}
        >
          Match challenges{" "}
          <span className="ml-1 text-xs text-muted-foreground">
            {challenges.length}
          </span>
        </Button>
      </div>
      <div className="grid gap-4">
        {tab === "bookings"
          ? bookings.map((item) => (
              <RequestRow
                key={item.id}
                title={item.team_name}
                meta={`${formatDate(item.booking_date)} · ${inr(item.price_inr)}`}
                detail={`${item.contact_name} · ${item.phone} · ${item.email}`}
                status={item.status}
                working={working === item.id}
                onAccept={() => updateRequest("bookings", item.id, "confirmed")}
                onReject={() => updateRequest("bookings", item.id, "rejected")}
              />
            ))
          : challenges.map((item) => (
              <RequestRow
                key={item.id}
                title={item.team_name}
                meta={`${formatDate(item.preferred_date)} · ${formatTime(item.preferred_time)}`}
                detail={`${item.contact_name} · ${item.phone} · ${item.venue}`}
                status={item.status}
                working={working === item.id}
                onAccept={() =>
                  updateRequest("challenges", item.id, "accepted")
                }
                onReject={() =>
                  updateRequest("challenges", item.id, "rejected")
                }
              />
            ))}
        {(tab === "bookings" ? bookings : challenges).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No {tab} found.
          </div>
        ) : null}
      </div>
    </>
  );
}

function RequestRow({
  title,
  meta,
  detail,
  status,
  working,
  onAccept,
  onReject,
}: {
  title: string;
  meta: string;
  detail: string;
  status: string;
  working: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-xl uppercase">{title}</h2>
          <p className="mt-1 text-sm text-primary">{meta}</p>
          <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      {status === "pending" ? (
        <div className="mt-5 flex gap-2 border-t border-border pt-4">
          <Button size="sm" onClick={onAccept} disabled={working}>
            <Check className="size-4" /> Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={working}
          >
            <X className="size-4" /> Reject
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function MatchesPanel({
  matches,
  onRefresh,
}: {
  matches: Match[];
  onRefresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Match | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      opponent: String(form.get("opponent") ?? "").trim(),
      match_date: String(form.get("match_date") ?? ""),
      match_time: String(form.get("match_time") ?? "09:00"),
      venue: String(form.get("venue") ?? "").trim(),
      format: String(form.get("format") ?? "T20"),
      ball_type: String(form.get("ball_type") ?? "Hard Tennis Ball"),
      status: String(form.get("status") ?? "upcoming"),
      our_score: String(form.get("our_score") ?? "").trim() || null,
      opponent_score: String(form.get("opponent_score") ?? "").trim() || null,
      result: String(form.get("result") ?? "").trim() || null,
      player_of_match: String(form.get("player_of_match") ?? "").trim() || null,
      summary: String(form.get("summary") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
    };
    if (!payload.opponent || !payload.match_date || !payload.venue) {
      toast.error("Opponent, date and venue are required.");
      return;
    }
    const result = editing
      ? await supabase.from("matches").update(payload).eq("id", editing.id)
      : await supabase.from("matches").insert(payload);
    if (result.error) toast.error(result.error.message);
    else {
      toast.success(editing ? "Match updated" : "Match added");
      setEditing(null);
      await onRefresh();
    }
  }
  async function remove(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this schedule? This action cannot be undone.",
      )
    )
      return;
    setWorking(id);
    const { error } = await supabase.from("matches").delete().eq("id", id);
    setWorking(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Schedule deleted");
      await onRefresh();
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="Fixture book"
        title="Matches"
        description="Build the public schedule and close the loop on every result."
        action={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                opponent: "",
                match_date: "",
                match_time: "09:00",
                venue: "",
                format: "T20",
                ball_type: "Hard Tennis Ball",
                status: "upcoming",
                our_score: null,
                opponent_score: null,
                result: null,
                player_of_match: null,
                summary: null,
                notes: null,
                created_at: "",
                updated_at: "",
              })
            }
          >
            <FilePlus2 className="size-4" /> Add match
          </Button>
        }
      />
      {editing ? (
        <MatchForm
          match={editing.id ? editing : null}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      ) : null}
      <div className="grid gap-3">
        {matches.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-xl uppercase">
                  Kalinga Warriors{" "}
                  <span className="text-muted-foreground">vs</span>{" "}
                  {item.opponent}
                </h2>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatDate(item.match_date)} · {formatTime(item.match_time)} ·{" "}
                {item.venue}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.result ?? item.notes ?? "No result notes yet"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(item)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => remove(item.id)}
                disabled={working === item.id}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {matches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No fixtures yet.
          </div>
        ) : null}
      </div>
    </>
  );
}

function MatchForm({
  match,
  onSubmit,
  onCancel,
}: {
  match: Match | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 grid gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:grid-cols-2"
    >
      <Field
        name="opponent"
        label="Opponent"
        placeholder="Riverside XI"
        defaultValue={match?.opponent}
      />
      <Field
        name="match_date"
        label="Date"
        type="date"
        defaultValue={match?.match_date}
      />
      <Field
        name="match_time"
        label="Start time"
        type="time"
        defaultValue={match?.match_time ?? "09:00"}
      />
      <Field
        name="venue"
        label="Venue"
        placeholder="SRF Ground, Sarjapur"
        defaultValue={match?.venue}
      />
      <Field
        name="format"
        label="Match type"
        defaultValue={match?.format ?? "T20"}
      />
      <Field
        name="status"
        label="Status"
        defaultValue={match?.status ?? "upcoming"}
      />
      <Field
        name="result"
        label="Result"
        placeholder="Win / Loss / Draw"
        defaultValue={match?.result ?? ""}
      />
      <Field
        name="our_score"
        label="Our score"
        defaultValue={match?.our_score ?? ""}
      />
      <Field
        name="opponent_score"
        label="Opponent score"
        defaultValue={match?.opponent_score ?? ""}
      />
      <Field
        name="player_of_match"
        label="Player of the match"
        defaultValue={match?.player_of_match ?? ""}
      />
      <div className="sm:col-span-2">
        <Label htmlFor="summary">Match summary</Label>
        <Textarea
          id="summary"
          name="summary"
          className="mt-2"
          defaultValue={match?.summary ?? ""}
          rows={3}
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          className="mt-2"
          defaultValue={match?.notes ?? ""}
          rows={3}
        />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">
          <Save className="size-4" /> {match ? "Save changes" : "Save match"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PlayersPanel({
  players,
  onRefresh,
}: {
  players: Player[];
  onRefresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) {
      toast.error("Player name is required.");
      return;
    }
    const { error } = await supabase.from("players").insert({
      name,
      role: String(form.get("role") ?? "Batsman"),
      jersey_number: Number(form.get("jersey_number")) || null,
      batting_style: String(form.get("batting_style") ?? "").trim() || null,
      bowling_style: String(form.get("bowling_style") ?? "").trim() || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Player added");
      setOpen(false);
      await onRefresh();
    }
  }
  async function remove(id: string) {
    setWorking(id);
    const { error } = await supabase.from("players").delete().eq("id", id);
    setWorking(null);
    if (error) toast.error(error.message);
    else await onRefresh();
  }
  return (
    <>
      <PageIntro
        eyebrow="Squad room"
        title="Players"
        description="Keep every player profile current for the public squad directory."
        action={
          <Button onClick={() => setOpen((value) => !value)}>
            <UserRoundPlus className="size-4" /> Add player
          </Button>
        }
      />
      {open ? (
        <form
          onSubmit={save}
          className="mb-6 grid gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:grid-cols-2"
        >
          <Field name="name" label="Full name" placeholder="Player name" />
          <Field name="jersey_number" label="Jersey number" type="number" />
          <Field name="role" label="Role" defaultValue={PLAYER_ROLES[2]} />
          <Field
            name="batting_style"
            label="Batting style"
            placeholder="Right hand"
          />
          <Field
            name="bowling_style"
            label="Bowling style"
            placeholder="Medium pace"
          />
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">
              <Save className="size-4" /> Save player
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="rounded-xl border border-border bg-card/50 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-xl uppercase">{player.name}</p>
                <p className="mt-1 text-sm text-primary">{player.role}</p>
              </div>
              <span className="font-heading text-2xl text-muted-foreground">
                #{player.jersey_number ?? "—"}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <div>
                <p className="font-heading text-lg">{player.matches}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Matches
                </p>
              </div>
              <div>
                <p className="font-heading text-lg">{player.runs}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Runs
                </p>
              </div>
              <div>
                <p className="font-heading text-lg">{player.wickets}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Wickets
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-4 text-destructive hover:text-destructive"
              onClick={() => remove(player.id)}
              disabled={working === player.id}
            >
              Remove player
            </Button>
          </div>
        ))}
        {players.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
            No squad profiles yet.
          </div>
        ) : null}
      </div>
    </>
  );
}

function GroundPanel({
  slots,
  onRefresh,
}: {
  slots: GroundSlot[];
  onRefresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GroundSlot | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "").trim();
    if (!label) {
      toast.error("Slot label is required.");
      return;
    }
    const payload = {
      label,
      start_time: String(form.get("start_time") ?? "09:00"),
      end_time: String(form.get("end_time") ?? "11:00"),
      weekday_price_inr: Number(form.get("weekday_price_inr")) || 0,
      weekend_price_inr: Number(form.get("weekend_price_inr")) || 0,
    };
    if (payload.end_time <= payload.start_time) {
      toast.error("End time must be after start time.");
      return;
    }
    const result = editing
      ? await supabase.from("ground_slots").update(payload).eq("id", editing.id)
      : await supabase
          .from("ground_slots")
          .insert({ ...payload, active: true, sort_order: slots.length });
    if (result.error) toast.error(result.error.message);
    else {
      toast.success(editing ? "Ground slot updated" : "Ground slot added");
      setOpen(false);
      setEditing(null);
      await onRefresh();
    }
  }
  async function toggle(id: string, active: boolean) {
    const { error } = await supabase
      .from("ground_slots")
      .update({ active: !active })
      .eq("id", id);
    if (error) toast.error(error.message);
    else await onRefresh();
  }
  async function remove(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to remove this ground slot? This action cannot be undone.",
      )
    )
      return;
    setWorking(id);
    const result = await supabase.from("ground_slots").delete().eq("id", id);
    setWorking(null);
    if (result.error)
      toast.error(
        "This slot cannot be removed because it has existing bookings. Close it instead.",
      );
    else await onRefresh();
  }
  return (
    <>
      <PageIntro
        eyebrow="Ground operations"
        title="Ground slots"
        description="Control bookable hours and INR pricing for weekday and weekend sessions."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen((value) => !value);
            }}
          >
            <FilePlus2 className="size-4" /> Add slot
          </Button>
        }
      />
      {open ? (
        <form
          onSubmit={save}
          className="mb-6 grid gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:grid-cols-2"
        >
          <Field
            name="label"
            label="Slot label"
            placeholder="Morning session"
            defaultValue={editing?.label}
          />
          <Field
            name="start_time"
            label="Starts"
            type="time"
            defaultValue={editing?.start_time ?? "09:00"}
          />
          <Field
            name="end_time"
            label="Ends"
            type="time"
            defaultValue={editing?.end_time ?? "11:00"}
          />
          <Field
            name="weekday_price_inr"
            label="Weekday price (₹)"
            type="number"
            defaultValue={editing?.weekday_price_inr ?? 0}
          />
          <Field
            name="weekend_price_inr"
            label="Weekend price (₹)"
            type="number"
            defaultValue={editing?.weekend_price_inr ?? 0}
          />
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">
              <Save className="size-4" /> Save slot
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      <div className="grid gap-3">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-xl uppercase">{slot.label}</h2>
                <StatusBadge status={slot.active ? "available" : "closed"} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatTime(slot.start_time)} – {formatTime(slot.end_time)} ·
                Weekday {inr(slot.weekday_price_inr)} · Weekend{" "}
                {inr(slot.weekend_price_inr)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(slot);
                  setOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggle(slot.id, slot.active)}
              >
                {slot.active ? "Close slot" : "Reopen slot"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={working === slot.id}
                onClick={() => remove(slot.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        {slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No ground slots yet.
          </div>
        ) : null}
      </div>
    </>
  );
}

function SettingsPanel({
  settings,
  onRefresh,
}: {
  settings: TeamSettings | null;
  onRefresh: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  if (!settings)
    return (
      <>
        <PageIntro
          eyebrow="Club identity"
          title="Settings"
          description="Create the first club settings record to power the public site."
        />
        <SettingsForm
          settings={null}
          saving={saving}
          setSaving={setSaving}
          onRefresh={onRefresh}
        />
      </>
    );
  return (
    <>
      <PageIntro
        eyebrow="Club identity"
        title="Settings"
        description="Update the public club identity, contact details and performance record."
      />
      <SettingsForm
        settings={settings}
        saving={saving}
        setSaving={setSaving}
        onRefresh={onRefresh}
      />
    </>
  );
}

function SettingsForm({
  settings,
  saving,
  setSaving,
  onRefresh,
}: {
  settings: TeamSettings | null;
  saving: boolean;
  setSaving: (value: boolean) => void;
  onRefresh: () => Promise<void>;
}) {
  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings?.logo_url ?? null,
  );
  const [removeLogo, setRemoveLogo] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const logoFile = form.get("logo") as File | null;
    let logoUrl = settings?.logo_url ?? null;
    if (removeLogo) logoUrl = null;
    if (logoFile?.size)
      logoUrl = await uploadMedia(await optimizeImage(logoFile), "team");
    const payload = {
      team_name: String(form.get("team_name") ?? "").trim(),
      tagline: String(form.get("tagline") ?? "").trim(),
      about: String(form.get("about") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      whatsapp_number: String(form.get("whatsapp_number") ?? "").trim(),
      matches_played: Number(form.get("matches_played")) || 0,
      wins: Number(form.get("wins")) || 0,
      losses: Number(form.get("losses")) || 0,
      logo_url: logoUrl,
    };
    const result = settings
      ? await supabase
          .from("team_settings")
          .update(payload)
          .eq("id", settings.id)
      : await supabase.from("team_settings").insert(payload);
    setSaving(false);
    if (result.error) toast.error(result.error.message);
    else {
      if (settings?.logo_url && settings.logo_url !== logoUrl)
        await removeMedia(settings.logo_url);
      toast.success("Club settings saved");
      await onRefresh();
    }
  }
  return (
    <form
      onSubmit={save}
      className="grid gap-5 rounded-xl border border-border bg-card/40 p-5 sm:grid-cols-2"
    >
      <Field
        name="team_name"
        label="Club name"
        defaultValue={settings?.team_name ?? "Kalinga Warriors"}
      />
      <Field
        name="tagline"
        label="Tagline"
        defaultValue={
          settings?.tagline ?? "Play hard. Play fair. Play together."
        }
      />
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="logo">Team logo / main image</Label>
        <div className="flex items-center gap-4">
          <MediaImage
            src={logoPreview}
            alt="Team logo preview"
            fallback="avatar"
            className="size-20 rounded-lg"
          />
          <Input
            id="logo"
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setLogoPreview(URL.createObjectURL(file));
                setRemoveLogo(false);
              }
            }}
          />
        </div>
        {settings?.logo_url ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={removeLogo}
              onChange={(event) => setRemoveLogo(event.target.checked)}
            />{" "}
            Remove current image
          </label>
        ) : null}
      </div>
      <Field name="phone" label="Phone" defaultValue={settings?.phone ?? ""} />
      <Field
        name="email"
        label="Email"
        type="email"
        defaultValue={settings?.email ?? ""}
      />
      <Field
        name="address"
        label="Address"
        defaultValue={settings?.address ?? ""}
      />
      <Field
        name="whatsapp_number"
        label="WhatsApp number"
        defaultValue={settings?.whatsapp_number ?? ""}
      />
      <div className="sm:col-span-2">
        <Label htmlFor="about">About</Label>
        <Textarea
          id="about"
          name="about"
          className="mt-2"
          defaultValue={settings?.about ?? ""}
          rows={4}
        />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:col-span-2">
        <Field
          name="matches_played"
          label="Matches"
          type="number"
          defaultValue={settings?.matches_played ?? 0}
        />
        <Field
          name="wins"
          label="Wins"
          type="number"
          defaultValue={settings?.wins ?? 0}
        />
        <Field
          name="losses"
          label="Losses"
          type="number"
          defaultValue={settings?.losses ?? 0}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving}>
          <Save className="size-4" />{" "}
          {saving ? "Saving…" : "Save club settings"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={
          name === "opponent" ||
          name === "match_date" ||
          name === "venue" ||
          name === "team_name"
        }
      />
    </div>
  );
}
