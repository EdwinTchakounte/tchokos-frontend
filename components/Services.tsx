import { SectionHeading } from "./SectionHeading";

// Services réels de Tchokos (faits vérifiés via réseaux sociaux / boutique en ligne).
const SERVICES = [
  {
    icon: "👟",
    title: "Chaussures gros & détail",
    text: "Femmes, hommes, enfants : sneakers, talons, sandales, mocassins, bottes, scolaires (Nike, New Balance, Vans).",
  },
  {
    icon: "👕",
    title: "Vêtements & sport",
    text: "Robes, sportswear, lingerie, vêtements d'extérieur et maillots de bain.",
  },
  {
    icon: "👜",
    title: "Sacs & bagagerie",
    text: "Sacs à main, à dos, bandoulière, valises et housses (Chrisbella, Susen).",
  },
  {
    icon: "⌚",
    title: "Montres & bijoux",
    text: "Montres sport, connectées et de luxe, bijoux et créations personnalisées.",
  },
  {
    icon: "💬",
    title: "Commande WhatsApp",
    text: "Arrivages chaque jour, commande simple et rapide directement sur WhatsApp.",
  },
  {
    icon: "📱",
    title: "Paiement Mobile Money",
    text: "Réglez en toute confiance avec MTN MoMo et Orange Money.",
  },
  {
    icon: "🚚",
    title: "Livraison & expédition",
    text: "Livraison à Douala et expédition vers Yaoundé via Tchokos Service Express.",
  },
  {
    icon: "🔥",
    title: "Méga promotions",
    text: "Des promotions régulières et des prix grossiste imbattables toute l'année.",
  },
];

export function Services() {
  return (
    <section className="container-tchokos py-12 sm:py-16">
      <SectionHeading
        title="Nos services"
        subtitle="Tout ce que Tchokos vous propose, au même endroit"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl transition group-hover:scale-110">
              {s.icon}
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-ink sm:text-lg">
              {s.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
