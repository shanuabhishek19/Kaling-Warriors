import { useEffect, useState } from "react";

import { countdownParts } from "@/lib/format";

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetDate = new Date(target);
  const parts = now ? countdownParts(targetDate, now) : null;

  const cells = [
    { label: "Days", value: parts?.days },
    { label: "Hrs", value: parts?.hours },
    { label: "Min", value: parts?.minutes },
    { label: "Sec", value: parts?.seconds },
  ];

  if (parts?.done) {
    return (
      <p className="font-heading text-sm uppercase tracking-widest text-primary">Match day is here</p>
    );
  }

  return (
    <div className="flex gap-2" aria-label="Time until the next match">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="min-w-14 rounded-lg border border-border bg-background/70 px-2 py-2 text-center"
        >
          <p className="display-title text-2xl text-primary">
            {cell.value === undefined ? "--" : `${cell.value}`.padStart(2, "0")}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{cell.label}</p>
        </div>
      ))}
    </div>
  );
}
