"use client";

import { useState } from "react";

type Props = {
  /** Slug produit → URL stable du flyer PNG (/produit/[slug]/flyer). */
  slug: string;
  /** URL absolue de la fiche produit (celle dont l'aperçu = le flyer brandé). */
  url: string;
  name: string;
  /** Prix déjà formaté, ex. "12 500 FCFA". */
  price: string;
};

// Partage produit Tchokos.
// - « Partager le flyer » : télécharge le flyer PNG brandé et le partage en
//   FICHIER via l'API Web Share (status WhatsApp, groupe, post Facebook…).
//   Repli desktop : téléchargement de l'image.
// - Facebook / WhatsApp : partage du LIEN → la plateforme scrape le flyer
//   (opengraph-image) comme aperçu.
// - « Partager » : Web Share natif du lien, repli « copier le lien ».
export function ShareButton({ slug, url, name, price }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const text = `${name} — ${price}\n${url}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const flyerUrl = `/produit/${slug}/flyer`;
  const filename = `tchokos-${slug}.png`;

  async function shareFlyer() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(flyerUrl);
      if (!res.ok) throw new Error("gen");
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });
      const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({ files: [file], title: name, text });
        } catch {
          /* l'utilisateur a annulé — rien à faire */
        }
      } else {
        // Repli desktop : téléchargement de l'image.
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
        setNote("Flyer téléchargé ✓ — partagez-le sur WhatsApp/Facebook");
        setTimeout(() => setNote(null), 3000);
      }
    } catch {
      setNote("Génération impossible, réessayez dans un instant.");
      setTimeout(() => setNote(null), 3000);
    } finally {
      setBusy(false);
    }
  }

  async function shareLink() {
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible */
    }
  }

  const shareIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .17 1.03L8.83 8.6a3 3 0 1 0 0 6.8l6.34 3.57A3 3 0 1 0 18 16a3 3 0 0 0-1.83.63L9.83 13.1a3.02 3.02 0 0 0 0-2.2l6.34-3.53A3 3 0 0 0 18 8Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600/10 text-brand-600">
          {shareIcon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Partager ce produit</p>
          <p className="text-xs text-slate-400">Un flyer prêt à poster, avec le prix 🔥</p>
        </div>
      </div>

      {/* Action principale : le flyer brandé partagé en image */}
      <button
        type="button"
        onClick={shareFlyer}
        disabled={busy}
        className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
        aria-label="Partager le flyer du produit"
      >
        {busy ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Génération du flyer…
          </>
        ) : (
          <>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeLinejoin="round" />
              <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
              <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Partager le flyer
          </>
        )}
      </button>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={shareLink}
          className="inline-flex flex-1 min-w-[7rem] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow active:translate-y-0"
          aria-label="Partager le lien du produit"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : shareIcon}
          {copied ? "Lien copié ✓" : "Le lien"}
        </button>

        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 min-w-[7rem] items-center justify-center gap-2 rounded-xl bg-[#1877F2]/10 px-4 py-2.5 text-sm font-semibold text-[#1877F2] transition-all hover:-translate-y-0.5 hover:bg-[#1877F2] hover:text-white hover:shadow active:translate-y-0"
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
          className="inline-flex flex-1 min-w-[7rem] items-center justify-center gap-2 rounded-xl bg-cmr-green/10 px-4 py-2.5 text-sm font-semibold text-cmr-green transition-all hover:-translate-y-0.5 hover:bg-cmr-green hover:text-white hover:shadow active:translate-y-0"
          aria-label="Partager sur WhatsApp"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24Zm-2.87 4.4c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.01.74 1.99.84 2.13.1.14 1.44 2.32 3.58 3.16 1.78.7 2.14.56 2.53.53.39-.04 1.25-.51 1.43-1.01.18-.5.18-.92.13-1.01-.05-.09-.19-.14-.4-.24-.21-.11-1.25-.62-1.44-.69-.19-.07-.33-.1-.47.1-.14.21-.54.69-.66.83-.12.14-.24.16-.45.05-.21-.1-.9-.33-1.71-1.06-.63-.56-1.06-1.26-1.18-1.47-.12-.21-.01-.32.09-.43.09-.09.21-.24.32-.36.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.36-.05-.1-.46-1.14-.65-1.56-.17-.4-.34-.35-.47-.36l-.4-.01Z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {note && <p className="mt-2 text-xs font-medium text-brand-700">{note}</p>}
    </div>
  );
}
