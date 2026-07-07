/**
 * Écran de chargement de route personnalisé Tchokos.
 *
 * Next.js l'utilise automatiquement comme fallback (Suspense) pendant que les
 * pages chargent leurs données côté serveur. Logo de marque animé + anneau de
 * progression aux couleurs Tchokos. (Le splash de LANCEMENT de la PWA installée,
 * lui, provient du manifest : background_color + icône.)
 */
export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-[#fbfaf9]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative grid h-24 w-24 place-items-center">
          {/* Anneau qui tourne */}
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
          {/* Logo qui pulse au centre */}
          <img
            src="/logo-tchokos.svg"
            alt="Tchokos"
            className="h-14 w-14 animate-pulse rounded-full"
          />
        </div>
        <p className="text-sm font-semibold tracking-wide text-ink-soft">
          Tchokos<span className="text-brand-600">…</span>
        </p>
      </div>
    </div>
  );
}
