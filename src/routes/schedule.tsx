import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { MatchCard } from "@/components/match-card";
import { MatchDialog } from "@/components/match-dialog";
import { Button } from "@/components/ui/button";
import { CardSkeletons, EmptyState, SectionHeading } from "@/components/ui-bits";
import { formatTime, toISODate } from "@/lib/format";
import { matchesQuery, type Match } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Match Schedule & Fixtures — Kalinga Warriors" },
      {
        name: "description",
        content:
          "Upcoming fixtures and past matches for Kalinga Warriors, shown in a monthly calendar and full list with venues and formats.",
      },
      { property: "og:title", content: "Match Schedule — Kalinga Warriors" },
      { property: "og:description", content: "Calendar and list of all club fixtures." },
    ],
  }),
  component: SchedulePage,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function SchedulePage() {
  const { data: matches, isPending } = useQuery(matchesQuery);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<Match | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of matches ?? []) {
      const list = map.get(m.match_date) ?? [];
      list.push(m);
      map.set(m.match_date, list);
    }
    return map;
  }, [matches]);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const todayISO = toISODate(new Date());
  const listed = (matches ?? [])
    .filter((m) => (tab === "upcoming" ? m.status !== "completed" : m.status === "completed"))
    .sort((a, b) =>
      tab === "upcoming"
        ? a.match_date.localeCompare(b.match_date)
        : b.match_date.localeCompare(a.match_date),
    );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Fixtures"
        title="Match Schedule"
        description="Browse the month view or scroll the full fixture list."
      />

      {/* CALENDAR */}
      <div className="glass mt-8 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="display-title text-2xl">
            {cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Next month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center font-heading text-[11px] uppercase tracking-widest text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1">
              {d.slice(0, 1)}
              <span className="hidden sm:inline">{d.slice(1)}</span>
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="min-h-16 rounded-md sm:min-h-24" />;
            const iso = toISODate(day);
            const dayMatches = byDate.get(iso) ?? [];
            return (
              <div
                key={iso}
                className={cn(
                  "min-h-16 rounded-md border border-border/60 bg-background/40 p-1.5 text-left sm:min-h-24",
                  iso === todayISO && "border-primary/70 bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    iso === todayISO && "font-semibold text-primary",
                  )}
                >
                  {day.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {dayMatches.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelected(m)}
                      className="block w-full truncate rounded bg-primary/15 px-1.5 py-1 text-left text-[10px] font-medium text-primary hover:bg-primary/25 sm:text-xs"
                      title={`${m.opponent} · ${formatTime(m.match_time)}`}
                    >
                      {m.opponent}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIST */}
      <div className="mt-12 flex gap-2">
        {(["upcoming", "past"] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={tab === option ? "default" : "secondary"}
            className="font-heading uppercase tracking-wide"
            onClick={() => setTab(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {isPending ? (
          <CardSkeletons />
        ) : listed.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listed.map((m) => (
              <MatchCard key={m.id} match={m} onClick={() => setSelected(m)} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={tab === "upcoming" ? "No upcoming fixtures" : "No past matches"}
          />
        )}
      </div>

      <MatchDialog match={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
