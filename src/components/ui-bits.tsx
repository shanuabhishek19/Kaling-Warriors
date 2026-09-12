import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        children && "sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={cn(align === "center" && "items-center text-center")}>
        {eyebrow ? (
          <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="display-title mt-2 text-3xl sm:text-4xl">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="glass hover-lift rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        {Icon ? <Icon className="size-4 text-primary" /> : null}
      </div>
      <p className="display-title mt-3 text-3xl text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-info/15 text-info border-info/30",
  completed: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  confirmed: "bg-success/15 text-success border-success/30",
  accepted: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  reschedule_requested: "bg-accent/15 text-accent border-accent/30",
  available: "bg-success/15 text-success border-success/30",
  booked: "bg-destructive/15 text-destructive border-destructive/30",
  closed: "bg-muted text-muted-foreground border-border",
  win: "bg-success/15 text-success border-success/30",
  loss: "bg-destructive/15 text-destructive border-destructive/30",
  draw: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-heading uppercase tracking-wide",
        STATUS_STYLES[status] ?? "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
      {Icon ? <Icon className="mb-3 size-8 text-muted-foreground" /> : null}
      <p className="font-heading text-lg uppercase tracking-wide">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function CardSkeletons({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-44 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function Watermark() {
  return null;
}
