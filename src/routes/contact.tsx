import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui-bits";
import { teamSettingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Kalinga Warriors" },
      {
        name: "description",
        content:
          "Call, email or WhatsApp Kalinga Warriors for match challenges, ground bookings and club enquiries in Bengaluru.",
      },
      { property: "og:title", content: "Contact Kalinga Warriors" },
      { property: "og:description", content: "Phone, email, WhatsApp and ground location." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: team } = useQuery(teamSettingsQuery);

  const socials = [
    { url: team?.instagram_url, label: "Instagram", icon: Instagram },
    { url: team?.facebook_url, label: "Facebook", icon: Facebook },
    { url: team?.youtube_url, label: "YouTube", icon: Youtube },
  ].filter((s) => Boolean(s.url));

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Get in touch"
        title="Contact Us"
        description="Match requests, ground bookings or joining the club — we're one message away."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass space-y-6 rounded-2xl p-6 sm:p-8">
          <ContactRow icon={Phone} label="Phone">
            <a href={`tel:${team?.phone ?? ""}`} className="hover:text-primary">
              {team?.phone}
            </a>
          </ContactRow>
          <ContactRow icon={Mail} label="Email">
            <a href={`mailto:${team?.email ?? ""}`} className="hover:text-primary">
              {team?.email}
            </a>
          </ContactRow>
          <ContactRow icon={MapPin} label="Ground address">
            {team?.address}
          </ContactRow>
          <ContactRow icon={MessageCircle} label="WhatsApp">
            <a
              href={`https://wa.me/${team?.whatsapp_number ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              Chat with us
            </a>
          </ContactRow>

          {socials.length ? (
            <div>
              <p className="font-heading text-xs uppercase tracking-widest text-primary">Follow</p>
              <div className="mt-3 flex gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url as string}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                  >
                    <social.icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button asChild className="font-heading uppercase tracking-wide">
              <Link to="/challenge">Challenge us</Link>
            </Button>
            <Button asChild variant="outline" className="font-heading uppercase tracking-wide">
              <Link to="/book-ground">Book the ground</Link>
            </Button>
          </div>
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          {team?.maps_url ? (
            <iframe
              title="Ground location map"
              src={team.maps_url}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full min-h-80 border-0"
            />
          ) : (
            <div className="flex size-full min-h-80 flex-col items-center justify-center gap-3 p-8 text-center">
              <MapPin className="size-8 text-primary" />
              <p className="font-heading text-lg uppercase tracking-wide">{team?.address}</p>
              <Button asChild variant="secondary">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(team?.address ?? "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 rounded-lg bg-primary/10 p-2.5 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm">{children}</p>
      </div>
    </div>
  );
}
