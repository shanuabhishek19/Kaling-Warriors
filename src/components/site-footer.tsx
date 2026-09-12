import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { TeamLogo } from "@/components/team-logo";
import { teamSettingsQuery } from "@/lib/queries";

export function SiteFooter() {
  const { data: team } = useQuery(teamSettingsQuery);

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border bg-card/40">
      <TeamLogo reference={team?.logo_url} alt="" width={320} height={320} className="pointer-events-none absolute -right-16 -top-20 size-80 opacity-[0.05]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <TeamLogo reference={team?.logo_url} alt="Kalinga Warriors" width={44} height={44} className="size-11" />
            <span className="display-title text-xl">{team?.team_name ?? "Kalinga Warriors"}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{team?.tagline}</p>
        </div>

        <div>
          <h3 className="font-heading text-sm uppercase tracking-widest text-primary">Explore</h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {[
              { to: "/players", label: "Players" },
              { to: "/schedule", label: "Schedule" },
              { to: "/results", label: "Results" },
              { to: "/challenge", label: "Challenge Us" },
              { to: "/book-ground", label: "Book Ground" },
              { to: "/gallery", label: "Gallery" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm uppercase tracking-widest text-primary">Reach us</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={`tel:${team?.phone ?? ""}`} className="hover:text-foreground">
                {team?.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${team?.email ?? ""}`} className="hover:text-foreground">
                {team?.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{team?.address}</span>
            </li>
          </ul>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            {team?.instagram_url ? (
              <a href={team.instagram_url} aria-label="Instagram" className="hover:text-primary">
                <Instagram className="size-5" />
              </a>
            ) : null}
            {team?.facebook_url ? (
              <a href={team.facebook_url} aria-label="Facebook" className="hover:text-primary">
                <Facebook className="size-5" />
              </a>
            ) : null}
            {team?.youtube_url ? (
              <a href={team.youtube_url} aria-label="YouTube" className="hover:text-primary">
                <Youtube className="size-5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="relative border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {team?.team_name ?? "Kalinga Warriors"}. All rights reserved.
      </div>
    </footer>
  );
}
