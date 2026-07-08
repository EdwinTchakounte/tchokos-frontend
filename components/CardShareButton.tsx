"use client";

import { useState } from "react";

// Bouton de partage compact posé sur une carte produit (boutique).
// La carte est un <Link> : on stoppe la navigation (preventDefault +
// stopPropagation) pour partager au lieu d'ouvrir la fiche.
// Mobile → Web Share API natif (ouvre Facebook / WhatsApp / Messenger…),
// avec l'aperçu = la carte brandée (opengraph-image du produit).
// Desktop sans Web Share → on copie le lien (petit ✓ de confirmation).
export function CardShareButton({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/produit/${slug}`
        : `/produit/${slug}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, text: `${name} — ${price}`, url });
      } catch {
        /* annulé */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Partager ${name}`}
      title="Partager"
      className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-md ring-1 ring-slate-200/70 backdrop-blur transition-all hover:scale-105 hover:text-brand-600 hover:shadow-lg active:scale-95"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .17 1.03L8.83 8.6a3 3 0 1 0 0 6.8l6.34 3.57A3 3 0 1 0 18 16a3 3 0 0 0-1.83.63L9.83 13.1a3.02 3.02 0 0 0 0-2.2l6.34-3.53A3 3 0 0 0 18 8Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
