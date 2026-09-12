import { StatusBadge } from "@/components/ui-bits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatLongDate, formatTime } from "@/lib/format";
import type { Match } from "@/lib/queries";

export function MatchDialog({
  match,
  onClose,
}: {
  match: Match | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(match)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {match ? (
          <>
            <DialogHeader>
              <DialogTitle className="display-title text-2xl">vs {match.opponent}</DialogTitle>
              <DialogDescription>
                {formatLongDate(match.match_date)} · {formatTime(match.match_time)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={match.status} />
              {match.result ? <StatusBadge status={match.result} /> : null}
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: "Venue", value: match.venue },
                { label: "Format", value: match.format },
                { label: "Ball", value: match.ball_type },
                { label: "Our score", value: match.our_score ?? "—" },
                { label: "Opponent score", value: match.opponent_score ?? "—" },
                { label: "Player of the match", value: match.player_of_match ?? "—" },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-border bg-card/50 p-3">
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1">{row.value}</dd>
                </div>
              ))}
            </dl>

            {match.summary ? (
              <div>
                <p className="font-heading text-xs uppercase tracking-widest text-primary">
                  Match summary
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{match.summary}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
