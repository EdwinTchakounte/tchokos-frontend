"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src"> & {
  /** Peut être null/undefined (produit sans photo) → secours brandé. */
  src?: string | null;
};

// Image produit robuste : si l'URL est absente OU si le chargement échoue
// (hôte non autorisé, 404, hotlink bloqué…), on affiche un secours brandé
// au lieu d'un vide. À utiliser dans un parent `position: relative` (fill).
export function SafeImage({ src, alt, className, ...rest }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-brand-50 via-white to-slate-50">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-brand-300"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" strokeLinejoin="round" />
          <circle cx="8.5" cy="8.5" r="1.6" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-400">
          Tchokos
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
