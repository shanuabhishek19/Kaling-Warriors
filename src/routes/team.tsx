import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Percent, ShieldCheck, Trophy, Users } from "lucide-react";

import heroImage from "@/assets/hero-ground.jpg";
import { TeamLogo } from "@/components/team-logo";
import { Button } from "@/components/ui/button";
import { SectionHeading, StatCard } from "@/components/ui-bits";
import { playersQuery, teamSettingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "About Our Team — Kalinga Warriors" },
      {
        name: "description",
        content:
          "The story, values and record of Kalinga Warriors — a local cricket team playing tennis-ball and hard-tennis-ball cricket.",
      },
      { property: "og:title", content: "About Kalinga Warriors" },
      { property: "og:description", content: "Our story, our values and our record." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { data: team } = useQuery(teamSettingsQuery);
  const { data: players } = useQuery(playersQuery);

  const played = team?.matches_played ?? 0;
  const wins = team?.wins ?? 0;
  const winPct = played > 0 ? Math.round((wins / played) * 100) : 0;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/80 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-heading text-xs uppercase tracking-[0.32em] text-primary">Our club</p>
          <h1 className="display-title mt-3 text-4xl sm:text-5xl">
            {team?.team_name ?? "Kalinga Warriors"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{team?.tagline}</p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
        <div className="glass relative overflow-hidden rounded-2xl p-8 sm:p-12">
          <img
            src={team?.logo_url ?? ""}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute -right-20 -top-24 size-[26rem] opacity-[0.06]"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <SectionHeading eyebrow="Who we are" title="Built on grit and community" />
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {team?.about}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="font-heading uppercase tracking-wide">
                  <Link to="/challenge">Challenge us</Link>
                </Button>
                <Button asChild variant="outline" className="font-heading uppercase tracking-wide">
                  <Link to="/players">View squad</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Squad" value={players?.length ?? 0} icon={Users} />
              <StatCard label="Matches" value={played} icon={ShieldCheck} />
              <StatCard label="Wins" value={wins} icon={Trophy} />
              <StatCard label="Win %" value={`${winPct}%`} icon={Percent} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="What we stand for" title="Club values" />
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Discipline",
              body: "Turn up on time, train with intent and respect every opponent we face.",
            },
            {
              title: "Fair play",
              body: "We play hard within the spirit of cricket — every single match, every format.",
            },
            {
              title: "Community",
              body: "Our ground is open to local teams, and our club is open to new players.",
            },
          ].map((value) => (
            <div key={value.title} className="glass hover-lift rounded-xl p-6">
              <h3 className="display-title text-2xl text-primary">{value.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
