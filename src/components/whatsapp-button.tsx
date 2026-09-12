import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { teamSettingsQuery } from "@/lib/queries";

export function WhatsAppButton() {
  const { data: team } = useQuery(teamSettingsQuery);
  const number = team?.whatsapp_number;
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number.replace(/\D/g, "")}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
