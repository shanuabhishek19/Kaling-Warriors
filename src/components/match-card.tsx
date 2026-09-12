import { CalendarDays, Clock, MapPin, Trophy } from "lucide-react";

import { StatusBadge } from "@/components/ui-bits";
import { formatDate, formatTime } from "@/lib/format";
import type { Match } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function MatchCard({
  match,
  onClick,
  className,
}: {
  match: Match;
  onClick?: () => void;
  className?: string;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "glass hover-lift w-full rounded-xl p-5 text-left",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">
            vs
          </p>
          <p className="display-title text-xl">{match.opponent}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={match.status} />
          {match.result ? <StatusBadge status={match.result} /> : null}
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-primary" />
          <dd>{formatDate(match.match_date)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" />
          <dd>
            {formatTime(match.match_time)} · {match.format}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" />
          <dd className="truncate">{match.venue}</dd>
        </div>
        {match.our_score || match.opponent_score ? (
          <div className="flex items-center gap-2">
            <Trophy className="size-4 shrink-0 text-primary" />
            <dd className="text-foreground">
              {match.our_score ?? "—"} vs {match.opponent_score ?? "—"}
            </dd>
          </div>
        ) : null}
      </dl>
    </Wrapper>
  );
}
