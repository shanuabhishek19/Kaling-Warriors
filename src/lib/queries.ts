import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type Player = Tables["players"]["Row"];
export type Match = Tables["matches"]["Row"];
export type Challenge = Tables["challenges"]["Row"];
export type Booking = Tables["bookings"]["Row"];
export type GroundSlot = Tables["ground_slots"]["Row"];
export type GroundBlock = Tables["ground_blocks"]["Row"];
export type Ground = Tables["grounds"]["Row"];
export type TeamSettings = Tables["team_settings"]["Row"];
export type GalleryItem = Tables["gallery"]["Row"];
export type AppNotification = Tables["notifications"]["Row"];

export type SlotAvailability = {
  slot_id: string;
  label: string;
  start_time: string;
  end_time: string;
  price_inr: number;
  status: "available" | "booked" | "pending" | "closed";
};

export const PLAYER_ROLES = [
  "Batsman",
  "Bowler",
  "All-Rounder",
  "Wicketkeeper",
] as const;
export const ADDITIONAL_PLAYER_ROLES = [
  "None",
  "Captain",
  "Vice Captain",
] as const;
export const BATTING_STYLES = [
  "Right-Hand Batsman",
  "Left-Hand Batsman",
] as const;
export const BOWLING_STYLES = [
  "Right-Arm Fast",
  "Right-Arm Medium",
  "Right-Arm Medium Fast",
  "Left-Arm Fast",
  "Left-Arm Medium",
  "Left-Arm Medium Fast",
  "Right-Arm Off Break",
  "Right-Arm Leg Break",
  "Left-Arm Orthodox",
  "Left-Arm Chinaman",
  "None / Does Not Bowl",
] as const;

export const MATCH_FORMATS = ["T10", "T20", "T25", "T30", "Other"] as const;
export const BALL_TYPES = ["Tennis Ball", "Hard Tennis Ball"] as const;
export const GALLERY_CATEGORIES = [
  "Match",
  "Team",
  "Trophy",
  "Ground",
  "Training",
] as const;

function unwrap<T>(result: {
  data: T | null;
  error: { message: string } | null;
}): T {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as T;
}

export const teamSettingsQuery = queryOptions({
  queryKey: ["team-settings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("team_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as TeamSettings | null;
  },
  staleTime: 1000 * 60,
});

export const playersQuery = queryOptions({
  queryKey: ["players"],
  queryFn: async () =>
    unwrap<Player[]>(
      await supabase
        .from("players")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ),
});

export const matchesQuery = queryOptions({
  queryKey: ["matches"],
  queryFn: async () =>
    unwrap<Match[]>(
      await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true }),
    ),
});

export const groundQuery = queryOptions({
  queryKey: ["ground"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("grounds")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as Ground | null;
  },
});

export const slotsQuery = queryOptions({
  queryKey: ["ground-slots"],
  queryFn: async () =>
    unwrap<GroundSlot[]>(
      await supabase
        .from("ground_slots")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("start_time", { ascending: true }),
    ),
});

export const blocksQuery = queryOptions({
  queryKey: ["ground-blocks"],
  queryFn: async () =>
    unwrap<GroundBlock[]>(
      await supabase
        .from("ground_blocks")
        .select("*")
        .order("block_date", { ascending: true }),
    ),
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () =>
    unwrap<GalleryItem[]>(
      await supabase
        .from("gallery")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ),
});

export function availabilityQuery(date: string) {
  return queryOptions({
    queryKey: ["availability", date],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("ground_availability", {
        _date: date,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as SlotAvailability[];
    },
  });
}

/* ---------- admin-only ---------- */

export const challengesQuery = queryOptions({
  queryKey: ["challenges"],
  queryFn: async () =>
    unwrap<Challenge[]>(
      await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false }),
    ),
});

export const bookingsQuery = queryOptions({
  queryKey: ["bookings"],
  queryFn: async () =>
    unwrap<Booking[]>(
      await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: false })
        .order("created_at", { ascending: false }),
    ),
});

export const notificationsQuery = queryOptions({
  queryKey: ["notifications"],
  queryFn: async () =>
    unwrap<AppNotification[]>(
      await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ),
});

export async function notify(kind: string, title: string, body?: string) {
  // Notifications are stored in the database so email / SMS / WhatsApp
  // delivery can be layered on later without changing call sites.
  await supabase
    .from("notifications")
    .insert({ kind, title, body: body ?? null });
}
