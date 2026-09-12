import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { PlayerCard } from "@/components/player-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeletons, EmptyState, SectionHeading } from "@/components/ui-bits";
import { PLAYER_ROLES, playersQuery } from "@/lib/queries";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Our Players — Kalinga Warriors Squad" },
      {
        name: "description",
        content:
          "Meet the Kalinga Warriors squad: captains, batsmen, bowlers, all-rounders and wicketkeepers with roles, styles and stats.",
      },
      { property: "og:title", content: "Our Players — Kalinga Warriors" },
      { property: "og:description", content: "The full Kalinga Warriors squad list." },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const { data: players, isPending } = useQuery(playersQuery);
  const [role, setRole] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (players ?? []).filter((p) => {
      const matchesRole = role === "All" || p.role === role;
      const matchesTerm =
        !term ||
        p.name.toLowerCase().includes(term) ||
        `${p.jersey_number ?? ""}`.includes(term) ||
        p.role.toLowerCase().includes(term);
      return matchesRole && matchesTerm;
    });
  }, [players, role, search]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="The squad"
        title="Our Players"
        description="Every player in the club with their role, playing style and career numbers."
      />

      <div className="mt-8 flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, jersey or role"
            className="pl-9"
            aria-label="Search players"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...PLAYER_ROLES].map((option) => (
            <Button
              key={option}
              size="sm"
              variant={role === option ? "default" : "secondary"}
              className="font-heading uppercase tracking-wide"
              onClick={() => setRole(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {isPending ? (
          <CardSkeletons count={6} />
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No players match your filters"
            description="Try a different role or clear the search."
          />
        )}
      </div>
    </section>
  );
}
