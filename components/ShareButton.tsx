"use client";

import { useState } from "react";

type Props = {
  /** URL absolue de la fiche produit (celle dont l'aperçu = la carte brandée). */
  url: string;
  name: string;
  /** Prix déjà formaté, ex. "12 500 FCFA". */
  price: string;
};

// Boutons de partage produit.
// - Facebook : sharer.php prend l'URL → Facebook récupère automatiquement la
//   carte brandée (opengraph-image.tsx) comme image de l'aperçu.
// - WhatsApp : wa.me avec nom + prix + lien (WhatsApp affiche aussi l'aperçu).
// - « Partager » : Web Share API natif sur mobile (ouvre FB/WA/Messenger…),
//   avec repli « copier le lien » sur desktop sans Web Share.
export function ShareButton({ url, name, price }: Props) {
  const [copied, setCopied] = useState(false);

  const text = `${name} — ${price}\n${url}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, text: `${name} — ${price}`, url });
      } catch {
        /* l'utilisateur a annulé — rien à faire */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-ink-soft">Partager :</span>

      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
        aria-label="Partager ce produit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .17 1.03L8.83 8.6a3 3 0 1 0 0 6.8l6.34 3.57A3 3 0 1 0 18 16a3 3 0 0 0-1.83.63L9.83 13.1a3.02 3.02 0 0 0 0-2.2l6.34-3.53A3 3 0 0 0 18 8Z"
            fill="currentColor"
          />
        </svg>
        {copied ? "Lien copié ✓" : "Partager"}
      </button>

      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        aria-label="Partager sur Facebook"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
        Facebook
      </a>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-cmr-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-cmr-green-dark"
        aria-label="Partager sur WhatsApp"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24Zm-2.87 4.4c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.01.74 1.99.84 2.13.1.14 1.44 2.32 3.58 3.16 1.78.7 2.14.56 2.53.53.39-.04 1.25-.51 1.43-1.01.18-.5.18-.92.13-1.01-.05-.09-.19-.14-.4-.24-.21-.11-1.25-.62-1.44-.69-.19-.07-.33-.1-.47.1-.14.21-.54.69-.66.83-.12.14-.24.16-.45.05-.21-.1-.9-.33-1.71-1.06-.63-.56-1.06-1.26-1.18-1.47-.12-.21-.01-.32.09-.43.09-.09.21-.24.32-.36.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.36-.05-.1-.46-1.14-.65-1.56-.17-.4-.34-.35-.47-.36l-.4-.01Z" />
        </svg>
        WhatsApp
      </a>
    </div>
  );
}
