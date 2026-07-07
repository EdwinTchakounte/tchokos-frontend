"use client";

import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./Header";

export function WhatsAppFloat({ number }: { number: string }) {
  const href = whatsappLink(
    number,
    "Bonjour Tchokos 👋, je vous écris depuis votre site.",
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      // Masqué sur mobile : la bottom-nav (Contact) + le header couvrent déjà
      // WhatsApp, et deux FAB empilés au-dessus de la nav recouvraient le contenu.
      // On ne le montre qu'à partir de md (desktop), où il tient dans un coin vide.
      className="wa-float fixed bottom-5 right-5 z-40 hidden md:inline-flex items-center gap-2 rounded-full bg-cmr-green px-4 py-3 text-white shadow-lg shadow-cmr-green/30 transition hover:bg-cmr-green-dark"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline font-semibold text-sm">WhatsApp</span>
    </a>
  );
}
