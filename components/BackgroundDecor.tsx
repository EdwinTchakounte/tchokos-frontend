/**
 * Décor d'arrière-plan global : motif de carreaux (grille) + formes floutées
 * colorées. Calque fixe derrière tout le contenu.
 */
export function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#fbfaf9]">
      {/* Carreaux (grille fine) */}
      <div
        className="absolute inset-0 opacity-[0.6]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 100% 100% at 50% 0%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 100% at 50% 0%, #000 55%, transparent 100%)",
        }}
      />
      {/* Gros points décoratifs (motif secondaire) */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(rgba(249,115,22,0.10) 1.5px, transparent 1.6px)",
          backgroundSize: "26px 26px",
          backgroundPosition: "13px 13px",
          maskImage: "linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)",
        }}
      />
      {/* Formes floutées colorées */}
      <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand-300/25 blur-3xl" />
      <div className="absolute right-[-6rem] top-1/3 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="absolute bottom-24 left-1/4 h-80 w-80 rounded-full bg-cmr-green/12 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-brand-200/20 blur-3xl" />
    </div>
  );
}
