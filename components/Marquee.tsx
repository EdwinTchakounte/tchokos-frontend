const ITEMS = [
  "Nike",
  "New Balance",
  "Vans",
  "Made in Cameroun",
  "Livraison Douala",
  "MTN MoMo",
  "Orange Money",
  "Prix grossiste",
  "Nouveautés chaque semaine",
];

export function Marquee() {
  // On duplique la liste pour une boucle continue (translateX -50%)
  const items = [...ITEMS, ...ITEMS];
  return (
    <div className="border-y border-slate-100 bg-white py-4 overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
        {items.map((label, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="font-display text-lg font-bold uppercase tracking-tight text-ink/80">
              {label}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
