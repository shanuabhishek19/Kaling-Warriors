import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { MediaImage } from "@/components/media-image";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState, SectionHeading, StatusBadge } from "@/components/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import { formatLongDate, formatTime, inr, toISODate } from "@/lib/format";
import {
  availabilityQuery,
  groundQuery,
  MATCH_FORMATS,
  slotsQuery,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book-ground")({
  head: () => ({
    meta: [
      { title: "Book Our Cricket Ground — Slots & INR Pricing" },
      {
        name: "description",
        content:
          "Check live slot availability and book the Kalinga Warriors cricket ground in Bengaluru. Weekday and weekend pricing in INR on a well-maintained turf ground.",
      },
      { property: "og:title", content: "Book Our Cricket Ground" },
      {
        property: "og:description",
        content: "Live slot availability and INR pricing for our turf ground.",
      },
    ],
  }),
  component: BookGroundPage,
});

const schema = z.object({
  team_name: z.string().trim().min(2, "Team name is required").max(80),
  contact_name: z.string().trim().min(2, "Contact name is required").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,20}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(160),
  players_count: z.coerce.number().int().min(2).max(40),
  format: z.string(),
  requirements: z.string().trim().max(600).optional(),
});

const initialForm = {
  team_name: "",
  contact_name: "",
  phone: "",
  email: "",
  players_count: "22",
  format: "T20",
  requirements: "",
};

function BookGroundPage() {
  const today = toISODate(new Date());
  const [date, setDate] = useState(today);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const { data: ground } = useQuery(groundQuery);
  const { data: slots } = useQuery(slotsQuery);
  const { data: availability, isPending } = useQuery(availabilityQuery(date));

  const selectedSlot =
    (availability ?? []).find((s) => s.slot_id === slotId) ?? null;

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      if (!slotId) throw new Error("Pick a slot first");
      const { data: saved, error } = await supabase
        .from("bookings")
        .insert({
          team_name: values.team_name,
          contact_name: values.contact_name,
          phone: values.phone,
          email: values.email,
          players_count: values.players_count,
          format: values.format,
          requirements: values.requirements?.length
            ? values.requirements
            : null,
          booking_date: date,
          slot_id: slotId,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      const email = await supabase.functions.invoke("send-notification-email", {
        body: { kind: "booking", record_id: saved?.id },
      });
      if (email.error) {
        console.error("Booking notification failed", email.error);
        toast.warning(
          "Booking saved. Email notification is temporarily unavailable.",
        );
      }
    },
    onSuccess: () => {
      setDone(true);
      setForm(initialForm);
      setSlotId(null);
      toast.success("Booking request sent — we'll confirm shortly.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function set<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!slotId) {
      toast.error("Select an available slot first");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Ground booking"
        title="Book Our Ground"
        description="Pick a date, choose an open slot and send a request. Prices are locked when we confirm."
      />

      {/* GROUND INFO */}
      <div className="glass mt-8 grid gap-6 rounded-2xl p-6 lg:grid-cols-[1.1fr_1fr] sm:p-8">
        <div>
          <h2 className="display-title text-3xl">{ground?.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" /> {ground?.location}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {ground?.description}
          </p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-heading text-xs uppercase tracking-widest text-primary">
                Pitch
              </dt>
              <dd className="mt-1 text-sm">{ground?.pitch_type}</dd>
            </div>
            <div>
              <dt className="font-heading text-xs uppercase tracking-widest text-primary">
                Capacity
              </dt>
              <dd className="mt-1 text-sm">{ground?.capacity}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {(ground?.ball_types ?? []).map((item) => (
              <Badge key={item} variant="secondary" className="font-normal">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(ground?.photos ?? []).slice(0, 4).map((photo) => (
            <MediaImage
              key={photo}
              src={photo}
              alt={`${ground?.name ?? "Ground"} photo`}
              className="aspect-video w-full rounded-lg"
            />
          ))}
          {!ground?.photos?.length ? (
            <div className="sm:col-span-2">
              <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Ground photos coming soon
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* PRICING */}
      <div className="mt-12">
        <SectionHeading eyebrow="Rates" title="Slot Pricing" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(slots ?? [])
            .filter((slot) => slot.active)
            .map((slot) => (
              <div key={slot.id} className="glass rounded-xl p-5">
                <p className="font-heading text-sm uppercase tracking-widest text-primary">
                  {slot.label}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" /> {formatTime(slot.start_time)} –{" "}
                  {formatTime(slot.end_time)}
                </p>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Weekday</dt>
                    <dd>{inr(slot.weekday_price_inr)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Weekend</dt>
                    <dd>{inr(slot.weekend_price_inr)}</dd>
                  </div>
                  {slot.extra_charges_inr > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {slot.extra_charges_note ?? "Extras"}
                      </dt>
                      <dd>+{inr(slot.extra_charges_inr)}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ))}
        </div>
      </div>

      {/* AVAILABILITY + FORM */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <SectionHeading eyebrow="Step 1" title="Check Availability" />
          <div className="mt-5 max-w-xs space-y-2">
            <Label
              htmlFor="date"
              className="font-heading text-xs uppercase tracking-widest"
            >
              Booking date
            </Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value || today);
                setSlotId(null);
              }}
            />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {formatLongDate(date)}
          </p>

          <div className="mt-5 space-y-3">
            {isPending ? (
              <p className="text-sm text-muted-foreground">Checking slots…</p>
            ) : (availability ?? []).length ? (
              (availability ?? []).map((slot) => {
                const open = slot.status === "available";
                return (
                  <button
                    key={slot.slot_id}
                    type="button"
                    disabled={!open}
                    onClick={() => setSlotId(slot.slot_id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background/50 p-4 text-left transition-colors",
                      open && "hover:border-primary/70",
                      !open && "cursor-not-allowed opacity-60",
                      slotId === slot.slot_id && "border-primary bg-primary/10",
                    )}
                  >
                    <span>
                      <span className="font-heading text-sm uppercase tracking-wide">
                        {slot.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatTime(slot.start_time)} –{" "}
                        {formatTime(slot.end_time)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center text-sm font-medium">
                        <IndianRupee className="size-3.5" />
                        {slot.price_inr}
                      </span>
                      <StatusBadge status={slot.status} />
                    </span>
                  </button>
                );
              })
            ) : (
              <EmptyState
                icon={CalendarCheck}
                title="No slots configured for this date"
              />
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          {done ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto size-12 text-primary" />
              <h3 className="display-title mt-5 text-3xl">Request sent</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Your slot is held as pending until an admin confirms it. We'll
                call you on the number provided.
              </p>
              <Button
                className="mt-6 font-heading uppercase tracking-wide"
                onClick={() => setDone(false)}
              >
                Book another slot
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <SectionHeading eyebrow="Step 2" title="Your Details" />

              {selectedSlot ? (
                <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
                  <span>
                    <Sparkles className="mr-1.5 inline size-4 text-primary" />
                    {selectedSlot.label} · {formatLongDate(date)}
                  </span>
                  <span className="font-heading">
                    {inr(selectedSlot.price_inr)}
                  </span>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                  Select an available slot to continue.
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <BookField
                  label="Team name"
                  htmlFor="b_team"
                  error={errors["team_name"]}
                >
                  <Input
                    id="b_team"
                    value={form.team_name}
                    maxLength={80}
                    onChange={(e) => set("team_name", e.target.value)}
                  />
                </BookField>
                <BookField
                  label="Contact person"
                  htmlFor="b_contact"
                  error={errors["contact_name"]}
                >
                  <Input
                    id="b_contact"
                    value={form.contact_name}
                    maxLength={80}
                    onChange={(e) => set("contact_name", e.target.value)}
                  />
                </BookField>
                <BookField
                  label="Phone"
                  htmlFor="b_phone"
                  error={errors["phone"]}
                >
                  <Input
                    id="b_phone"
                    inputMode="tel"
                    value={form.phone}
                    maxLength={20}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </BookField>
                <BookField
                  label="Email"
                  htmlFor="b_email"
                  error={errors["email"]}
                >
                  <Input
                    id="b_email"
                    type="email"
                    value={form.email}
                    maxLength={160}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </BookField>
                <BookField
                  label="Players"
                  htmlFor="b_players"
                  error={errors["players_count"]}
                >
                  <Input
                    id="b_players"
                    type="number"
                    min={2}
                    max={40}
                    value={form.players_count}
                    onChange={(e) => set("players_count", e.target.value)}
                  />
                </BookField>
                <BookField label="Format" htmlFor="b_format">
                  <Select
                    value={form.format}
                    onValueChange={(v) => set("format", v)}
                  >
                    <SelectTrigger id="b_format">
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
                </BookField>
              </div>

              <BookField label="Requirements (optional)" htmlFor="b_req">
                <Textarea
                  id="b_req"
                  rows={3}
                  maxLength={600}
                  value={form.requirements}
                  placeholder="Umpires, extra kit, practice balls…"
                  onChange={(e) => set("requirements", e.target.value)}
                />
              </BookField>

              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending || !slotId}
                className="w-full font-heading uppercase tracking-wide"
              >
                {mutation.isPending ? "Sending…" : "Request booking"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function BookField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
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
