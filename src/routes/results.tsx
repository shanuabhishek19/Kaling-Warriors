import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { MatchDialog } from "@/components/match-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeletons, EmptyState, SectionHeading, StatusBadge } from "@/components/ui-bits";
import { formatDate } from "@/lib/format";
import { matchesQuery, type Match } from "@/lib/queries";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Match Results — Kalinga Warriors" },
      {
        name: "description",
        content:
          "Full results archive for Kalinga Warriors: scores, opponents, venues, player of the match and match summaries.",
      },
      { property: "og:title", content: "Match Results — Kalinga Warriors" },
      { property: "og:description", content: "Every completed match with scores and summaries." },
    ],
  }),
  component: ResultsPage,
});

const FILTERS = ["All", "win", "loss", "draw"] as const;

function ResultsPage() {
  const { data: matches, isPending } = useQuery(matchesQuery);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Match | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (matches ?? [])
      .filter((m) => m.status === "completed")
      .filter((m) => filter === "All" || m.result === filter)
      .filter(
        (m) =>
          !term ||
          m.opponent.toLowerCase().includes(term) ||
          m.venue.toLowerCase().includes(term) ||
          (m.player_of_match ?? "").toLowerCase().includes(term),
      )
      .sort((a, b) => b.match_date.localeCompare(a.match_date));
  }, [matches, filter, search]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Archive"
        title="Match Results"
        description="Every completed fixture with scores, result and player of the match."
      />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opponent, venue or player"
            className="pl-9"
            aria-label="Search results"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "secondary"}
              className="font-heading uppercase tracking-wide"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {isPending ? (
          <CardSkeletons count={3} className="lg:grid-cols-1" />
        ) : rows.length ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="hidden grid-cols-[1.4fr_1fr_1.2fr_1fr_0.8fr_0.8fr] gap-3 bg-card/70 px-4 py-3 font-heading text-xs uppercase tracking-widest text-muted-foreground md:grid">
              <span>Opponent</span>
              <span>Date</span>
              <span>Venue</span>
              <span>Score</span>
              <span>Format</span>
              <span>Result</span>
            </div>
            <ul className="divide-y divide-border">
              {rows.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(m)}
                    className="grid w-full grid-cols-1 gap-1.5 px-4 py-4 text-left text-sm transition-colors hover:bg-card/60 md:grid-cols-[1.4fr_1fr_1.2fr_1fr_0.8fr_0.8fr] md:items-center md:gap-3"
                  >
                    <span className="font-heading text-base uppercase tracking-wide">
                      {m.opponent}
                    </span>
                    <span className="text-muted-foreground">{formatDate(m.match_date)}</span>
                    <span className="text-muted-foreground">{m.venue}</span>
                    <span>
                      {m.our_score ?? "—"} <span className="text-muted-foreground">vs</span>{" "}
                      {m.opponent_score ?? "—"}
                    </span>
                    <span className="text-muted-foreground">{m.format}</span>
                    <span>{m.result ? <StatusBadge status={m.result} /> : "—"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No results yet"
            description="Completed matches with scores will appear here."
          />
        )}
      </div>

      <MatchDialog match={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
