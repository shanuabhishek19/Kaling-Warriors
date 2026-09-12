import { MediaImage } from "@/components/media-image";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/queries";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="glass hover-lift group overflow-hidden rounded-xl">
      <div className="relative aspect-4/5 overflow-hidden bg-secondary">
        <MediaImage
          src={player.photo_url}
          alt={player.name}
          fallback="avatar"
          className="size-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-card via-card/25 to-transparent" />
        {player.jersey_number !== null ? (
          <span className="display-title absolute right-3 top-2 text-5xl text-primary/70">
            {player.jersey_number}
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <Badge className="mb-2 font-heading uppercase tracking-wide">
            {player.role}
          </Badge>
          {player.additional_role !== "None" ? (
            <Badge
              variant="secondary"
              className="mb-2 ml-2 font-heading uppercase tracking-wide"
            >
              {player.additional_role}
            </Badge>
          ) : null}
          <h3 className="display-title text-2xl leading-tight">
            {player.name}
          </h3>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="uppercase tracking-widest text-muted-foreground">
              Batting
            </dt>
            <dd className="mt-0.5 text-sm">{player.batting_style ?? "—"}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-widest text-muted-foreground">
              Bowling
            </dt>
            <dd className="mt-0.5 text-sm">{player.bowling_style ?? "—"}</dd>
          </div>
        </dl>

        {player.bio ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {player.bio}
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
          {[
            { label: "Mat", value: player.matches },
            { label: "Runs", value: player.runs },
            { label: "Wkts", value: player.wickets },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="display-title text-lg text-primary">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
