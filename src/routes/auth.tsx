import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { TeamLogo } from "@/components/team-logo";
import { teamSettingsQuery } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect: string | undefined } => ({
    redirect:
      typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Sign In — Kalinga Warriors" },
      {
        name: "description",
        content: "Secure admin sign in for Kalinga Warriors management.",
      },
      { property: "og:title", content: "Admin Sign In — Kalinga Warriors" },
      { property: "og:description", content: "Secure club management access." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: team } = useQuery(teamSettingsQuery);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user)
        navigate({ to: safeRedirect(redirect ?? "/admin"), replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate, redirect]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const account = data.user
      ? await supabase
          .from("admin_accounts")
          .select("status")
          .eq("user_id", data.user.id)
          .maybeSingle()
      : null;
    if (account?.data?.status !== "active") {
      await supabase.auth.signOut();
      toast.error("This administrator account is disabled.");
      return;
    }
    toast.success("Welcome back");
    navigate({ to: safeRedirect(redirect ?? "/admin"), replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to site
        </Link>
        <div className="glass rounded-2xl p-7 sm:p-9">
          <TeamLogo
            reference={team?.logo_url}
            alt="Kalinga Warriors"
            width={64}
            height={64}
            className="size-16"
          />
          <p className="mt-6 font-heading text-xs uppercase tracking-[0.28em] text-primary">
            Club management
          </p>
          <h1 className="display-title mt-2 text-4xl">Admin sign in</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage fixtures, players, bookings and match requests.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-heading text-xs uppercase tracking-widest"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-heading text-xs uppercase tracking-widest"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full font-heading uppercase tracking-wide"
            >
              <ShieldCheck className="size-4" />{" "}
              {loading ? "Signing in…" : "Sign in securely"}
            </Button>
          </form>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Admin access is restricted to approved club accounts.
          </p>
        </div>
      </div>
    </main>
  );
}
