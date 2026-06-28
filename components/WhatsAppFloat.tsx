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
      className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-cmr-green px-4 py-3 text-white shadow-lg shadow-cmr-green/30 transition hover:bg-cmr-green-dark md:bottom-5 md:right-5"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline font-semibold text-sm">WhatsApp</span>
    </a>
  );
}
