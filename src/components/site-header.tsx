import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { TeamLogo } from "@/components/team-logo";
import { useSession } from "@/hooks/use-session";
import { teamSettingsQuery } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/team", label: "Team" },
  { to: "/players", label: "Players" },
  { to: "/schedule", label: "Schedule" },
  { to: "/results", label: "Results" },
  { to: "/challenge", label: "Challenge Us" },
  { to: "/book-ground", label: "Book Ground" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: team } = useQuery(teamSettingsQuery);
  const { user } = useSession();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <TeamLogo reference={team?.logo_url} alt="Kalinga Warriors" width={40} height={40} className="size-9 shrink-0" />
          <span className="display-title text-lg leading-none tracking-tight sm:text-xl">
            {team?.team_name ?? "Kalinga Warriors"}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-2.5 py-2 font-heading text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Button asChild size="sm" variant={user ? "secondary" : "ghost"} className="hidden sm:flex">
            <Link to={user ? "/admin" : "/auth"}>
              <ShieldCheck className="size-4" />
              {user ? "Dashboard" : "Admin"}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-card/95 px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2.5 font-heading text-base uppercase tracking-wide text-muted-foreground"
                activeProps={{ className: "bg-secondary text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/admin" : "/auth"}
              className="rounded-md px-3 py-2.5 font-heading text-base uppercase tracking-wide text-primary"
            >
              {user ? "Admin dashboard" : "Admin login"}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
