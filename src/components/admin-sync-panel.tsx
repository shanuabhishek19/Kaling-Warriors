import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AdminSyncPanel() {
  const [running, setRunning] = useState(false);
  async function startSync() {
    setRunning(true);
    const result = await supabase.functions.invoke("trigger-cricheroes-sync", {
      body: {},
    });
    setRunning(false);
    if (result.error) toast.error(result.error.message);
    else if (result.data?.error) toast.error(result.data.error);
    else toast.success(result.data?.message ?? "CricHeroes sync started");
  }
  return (
    <section>
      <div className="mb-7 border-b border-border pb-7">
        <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">
          Data operations
        </p>
        <h1 className="display-title mt-2 text-4xl">CricHeroes sync</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Refresh players, fixtures and team statistics from the connected
          CricHeroes profile.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">
          The sync runs in GitHub Actions and preserves administrator-managed
          player and club details.
        </p>
        <Button
          className="mt-5"
          onClick={() => void startSync()}
          disabled={running}
        >
          <RefreshCw className={running ? "size-4 animate-spin" : "size-4"} />{" "}
          {running ? "Starting sync..." : "Run sync now"}
        </Button>
      </div>
    </section>
  );
}
