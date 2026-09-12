import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Send, Swords } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import { toISODate } from "@/lib/format";
import { BALL_TYPES, MATCH_FORMATS } from "@/lib/queries";

export const Route = createFileRoute("/challenge")({
  head: () => ({
    meta: [
      { title: "Challenge Us to a Match — Kalinga Warriors" },
      {
        name: "description",
        content:
          "Send a match challenge to Kalinga Warriors: pick your date, time, venue, format and ball type, and we will confirm by phone or email.",
      },
      { property: "og:title", content: "Challenge Kalinga Warriors" },
      {
        property: "og:description",
        content: "Request a friendly or tournament fixture against our team.",
      },
    ],
  }),
  component: ChallengePage,
});

const schema = z.object({
  team_name: z.string().trim().min(2, "Team name is required").max(80),
  contact_name: z.string().trim().min(2, "Contact name is required").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,20}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(160),
  preferred_date: z.string().min(1, "Pick a date"),
  preferred_time: z.string().min(1, "Pick a time"),
  venue: z.string().trim().min(2, "Venue is required").max(140),
  format: z.string(),
  ball_type: z.string(),
  message: z.string().trim().max(600).optional(),
});

const initial = {
  team_name: "",
  contact_name: "",
  phone: "",
  email: "",
  preferred_date: "",
  preferred_time: "09:00",
  venue: "Kalinga Warriors Ground",
  format: "T20",
  ball_type: "Hard Tennis Ball",
  message: "",
};

function ChallengePage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const { data: saved, error } = await supabase
        .from("challenges")
        .insert({
          ...values,
          message: values.message?.length ? values.message : null,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      const email = await supabase.functions.invoke("send-notification-email", {
        body: { kind: "challenge", record_id: saved?.id },
      });
      if (email.error) {
        console.error("Challenge notification failed", email.error);
        toast.warning(
          "Challenge saved. Email notification is temporarily unavailable.",
        );
      }
    },
    onSuccess: () => {
      setDone(true);
      setForm(initial);
      toast.success("Challenge sent! We'll get back to you soon.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function set<K extends keyof typeof initial>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    if (parsed.data.preferred_date < toISODate(new Date())) {
      setErrors({ preferred_date: "Pick today or a future date" });
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  if (done) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="display-title mt-6 text-4xl">Challenge received</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks for reaching out. Our team captain will review the request and
          contact you on the phone number you shared.
        </p>
        <Button
          className="mt-8 font-heading uppercase tracking-wide"
          onClick={() => setDone(false)}
        >
          Send another challenge
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Fixture request"
        title="Challenge Us"
        description="Tell us when and where you want to play. We reply within 24 hours."
      />

      <form
        onSubmit={onSubmit}
        className="glass mt-8 space-y-5 rounded-2xl p-6 sm:p-8"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Team name"
            error={errors["team_name"]}
            htmlFor="team_name"
          >
            <Input
              id="team_name"
              value={form.team_name}
              maxLength={80}
              onChange={(e) => set("team_name", e.target.value)}
            />
          </Field>
          <Field
            label="Contact person"
            error={errors["contact_name"]}
            htmlFor="contact_name"
          >
            <Input
              id="contact_name"
              value={form.contact_name}
              maxLength={80}
              onChange={(e) => set("contact_name", e.target.value)}
            />
          </Field>
          <Field label="Phone" error={errors["phone"]} htmlFor="phone">
            <Input
              id="phone"
              inputMode="tel"
              value={form.phone}
              maxLength={20}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Email" error={errors["email"]} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={form.email}
              maxLength={160}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field
            label="Preferred date"
            error={errors["preferred_date"]}
            htmlFor="preferred_date"
          >
            <Input
              id="preferred_date"
              type="date"
              min={toISODate(new Date())}
              value={form.preferred_date}
              onChange={(e) => set("preferred_date", e.target.value)}
            />
          </Field>
          <Field
            label="Preferred time"
            error={errors["preferred_time"]}
            htmlFor="preferred_time"
          >
            <Input
              id="preferred_time"
              type="time"
              value={form.preferred_time}
              onChange={(e) => set("preferred_time", e.target.value)}
            />
          </Field>
          <Field label="Format" htmlFor="format">
            <Select value={form.format} onValueChange={(v) => set("format", v)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATCH_FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Ball type" htmlFor="ball_type">
            <Select
              value={form.ball_type}
              onValueChange={(v) => set("ball_type", v)}
            >
              <SelectTrigger id="ball_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BALL_TYPES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Venue" error={errors["venue"]} htmlFor="venue">
          <Input
            id="venue"
            value={form.venue}
            maxLength={140}
            onChange={(e) => set("venue", e.target.value)}
          />
        </Field>

        <Field
          label="Message (optional)"
          error={errors["message"]}
          htmlFor="message"
        >
          <Textarea
            id="message"
            rows={4}
            maxLength={600}
            value={form.message}
            placeholder="Anything else we should know — overs, umpires, kit, timings…"
            onChange={(e) => set("message", e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="w-full font-heading uppercase tracking-wide sm:w-auto"
        >
          {mutation.isPending ? (
            "Sending…"
          ) : (
            <>
              <Send className="size-4" /> Send challenge
            </>
          )}
        </Button>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Swords className="size-3.5" /> Your contact details are visible only
          to club admins.
        </p>
      </form>
    </section>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={htmlFor}
        className="font-heading text-xs uppercase tracking-widest"
      >
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
