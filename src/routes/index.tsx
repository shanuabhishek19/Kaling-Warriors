import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Flame,
  Percent,
  Swords,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import heroImage from "@/assets/hero-ground.jpg";
import { TeamLogo } from "@/components/team-logo";
import { Countdown } from "@/components/countdown";
import { MatchCard } from "@/components/match-card";
import { MatchDialog } from "@/components/match-dialog";
import { Button } from "@/components/ui/button";
import { CardSkeletons, EmptyState, SectionHeading, StatCard } from "@/components/ui-bits";
import { formatLongDate, formatTime } from "@/lib/format";
import { matchesQuery, teamSettingsQuery, type Match } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kalinga Warriors — Fixtures, Squad & Ground Booking" },
      {
        name: "description",
        content:
          "Kalinga Warriors: view our squad and fixtures, challenge us to a match, or book our floodlit cricket ground in Bengaluru.",
      },
      { property: "og:title", content: "Kalinga Warriors" },
      {
        property: "og:description",
        content: "Challenge our team or book our floodlit cricket ground online.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: team } = useQuery(teamSettingsQuery);
  const { data: matches, isPending } = useQuery(matchesQuery);
  const [selected, setSelected] = useState<Match | null>(null);

  const upcoming = (matches ?? [])
    .filter((m) => m.status === "upcoming")
    .sort((a, b) => a.match_date.localeCompare(b.match_date));
  const nextMatch = upcoming[0];
  const recent = (matches ?? [])
    .filter((m) => m.status === "completed")
    .sort((a, b) => b.match_date.localeCompare(a.match_date))
    .slice(0, 3);

  const played = team?.matches_played ?? 0;
  const wins = team?.wins ?? 0;
  const winPct = played > 0 ? Math.round((wins / played) * 100) : 0;

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/85 to-background" />
        <TeamLogo reference={team?.logo_url} alt="" width={544} height={544} className="pointer-events-none absolute -right-24 top-8 hidden size-[34rem] opacity-[0.07] md:block" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 sm:px-6 sm:py-28">
          <TeamLogo reference={team?.logo_url} alt="Club logo" width={112} height={112} className="size-24 sm:size-28" />
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.35em] text-primary">
              Local cricket club · Est. 2024
            </p>
            <h1 className="display-title mt-3 max-w-3xl text-5xl sm:text-6xl lg:text-7xl">
              <span className="text-gradient">{team?.team_name ?? "Kalinga Warriors"}</span>
            </h1>
            <p className="mt-4 max-w-xl font-heading text-lg uppercase tracking-wide text-muted-foreground sm:text-xl">
              {team?.tagline}
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">{team?.about}</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="font-heading uppercase tracking-wide">
              <Link to="/challenge">
                <Swords className="size-4" /> Challenge Us
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-heading uppercase tracking-wide"
            >
              <Link to="/schedule">
                <CalendarDays className="size-4" /> View Schedule
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-heading uppercase tracking-wide"
            >
              <Link to="/book-ground">
                <CalendarCheck className="size-4" /> Book Ground
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Matches Played" value={played} icon={Flame} />
          <StatCard label="Wins" value={wins} icon={Trophy} />
          <StatCard label="Losses" value={team?.losses ?? 0} icon={XCircle} />
          <StatCard label="Win %" value={`${winPct}%`} icon={Percent} />
          <StatCard
            label="Upcoming"
            value={upcoming.length}
            icon={CalendarDays}
            hint="Scheduled matches"
          />
        </div>
      </section>

      {/* NEXT MATCH */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Next fixture" title="Next Match" />
        <div className="mt-6">
          {isPending ? (
            <CardSkeletons count={1} className="lg:grid-cols-1" />
          ) : nextMatch ? (
            <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
              <img
                src={team?.logo_url ?? ""}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="pointer-events-none absolute -bottom-16 -right-10 size-72 opacity-[0.06]"
              />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">
                    {nextMatch.format} · {nextMatch.ball_type}
                  </p>
                  <h3 className="display-title mt-2 text-3xl sm:text-4xl">
                    {team?.team_name ?? "We"} <span className="text-primary">vs</span>{" "}
                    {nextMatch.opponent}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formatLongDate(nextMatch.match_date)} · {formatTime(nextMatch.match_time)} ·{" "}
                    {nextMatch.venue}
                  </p>
                </div>
                <Countdown target={`${nextMatch.match_date}T${nextMatch.match_time}`} />
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No match scheduled yet"
              description="Fixtures appear here as soon as the club confirms them."
            >
              <Button asChild>
                <Link to="/challenge">Challenge us</Link>
              </Button>
            </EmptyState>
          )}
        </div>
      </section>

      {/* RECENT RESULTS */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Form guide" title="Recent Results">
          <Button asChild variant="ghost" className="font-heading uppercase tracking-wide">
            <Link to="/results">
              All results <ArrowRight className="size-4" />
            </Link>
          </Button>
        </SectionHeading>
        <div className="mt-6">
          {isPending ? (
            <CardSkeletons />
          ) : recent.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((match) => (
                <MatchCard key={match.id} match={match} onClick={() => setSelected(match)} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Trophy} title="No results recorded yet" />
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section className="relative mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="glass relative overflow-hidden rounded-2xl p-8 sm:p-12">
          <img
            src={team?.logo_url ?? ""}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute -left-16 -top-20 size-96 opacity-[0.06]"
          />
          <div className="relative max-w-2xl">
            <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">About us</p>
            <h2 className="display-title mt-2 text-3xl sm:text-4xl">More than a team</h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">{team?.about}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="font-heading uppercase tracking-wide">
                <Link to="/team">Our story</Link>
              </Button>
              <Button asChild variant="outline" className="font-heading uppercase tracking-wide">
                <Link to="/players">Meet the squad</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MatchDialog match={selected} onClose={() => setSelected(null)} />
    </>
  );
}
