import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/lib/api";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Tous les services Tchokos : chaussures gros & détail, vêtements, sacs, montres & bijoux, commande WhatsApp, paiement Mobile Money, livraison à Douala et expédition Yaoundé.",
};

type Service = {
  icon: string;
  title: string;
  text: string;
  items: string[];
};

const SERVICES: Service[] = [
  {
    icon: "👟",
    title: "Chaussures gros & détail",
    text: "Le cœur de métier de Tchokos : un mur de chaussures pour toute la famille, à prix grossiste pour les revendeurs comme au détail.",
    items: [
      "Femme : escarpins, talons, sandales, ballerines",
      "Homme : sneakers, mocassins, derbies, bottes",
      "Enfant : baskets et chaussures scolaires",
      "Marques : Nike, New Balance, Vans",
    ],
  },
  {
    icon: "👕",
    title: "Vêtements & sport",
    text: "Du prêt-à-porter tendance et du sportswear pour hommes, femmes et enfants.",
    items: ["Robes & tenues", "Sportswear", "Lingerie", "Vêtements d'extérieur & maillots"],
  },
  {
    icon: "👜",
    title: "Sacs & bagagerie",
    text: "Sacs et valises pour le quotidien comme pour les voyages.",
    items: [
      "Sacs à main, à dos, bandoulière",
      "Valises cabine & soute",
      "Housses PC & sacs de voyage",
      "Marques : Chrisbella, Susen",
    ],
  },
  {
    icon: "⌚",
    title: "Montres & bijoux",
    text: "L'accessoire qui complète la tenue, du sport au plus élégant.",
    items: [
      "Montres sport, connectées, luxe, enfants",
      "Bagues, bracelets, colliers, boucles",
      "Bijoux personnalisés",
    ],
  },
  {
    icon: "🛏️",
    title: "Linge de maison",
    text: "Draps et textiles pour la maison, à prix accessibles.",
    items: ["Draps & parures", "Textiles maison"],
  },
  {
    icon: "💬",
    title: "Commande WhatsApp",
    text: "Des arrivages chaque jour, une commande simple et rapide directement sur WhatsApp.",
    items: ["Arrivages quotidiens", "Conseil personnalisé", "Sans création de compte"],
  },
  {
    icon: "📱",
    title: "Paiement Mobile Money",
    text: "Payez en toute confiance avec les moyens que tout le monde utilise.",
    items: ["MTN Mobile Money", "Orange Money"],
  },
  {
    icon: "🚚",
    title: "Livraison & Service Express",
    text: "On vous livre vite, et on expédie au-delà de Douala.",
    items: ["Livraison à Douala", "Expédition vers Yaoundé", "Tchokos Service Express"],
  },
];

export default async function ServicesPage() {
  const config = await getSiteConfig().catch(() => null);
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋, j'aimerais des informations sur vos services.")
    : null;

  return (
    <div>
      {/* En-tête */}
      <section className="relative overflow-hidden bg-ink py-14 text-white sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-72 w-72 rounded-full bg-cmr-green/20 blur-3xl" />
        <div className="container-tchokos relative text-center">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-200">
            Tchokos · « The Best, Made in Africa »
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-extrabold sm:text-5xl">
            Nos services
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
            Le super grossiste mode d&apos;Akwa : chaussures, vêtements et
            accessoires, commande facile et livraison rapide.
          </p>
        </div>
      </section>

      {/* Grille de services */}
      <section className="container-tchokos py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">
                {s.icon}
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink">{s.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.text}</p>
              <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm text-ink-soft">
                {s.items.map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <span className="mt-0.5 text-cmr-green">✓</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-tchokos pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-10 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            Une question, une commande ?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-white/90">
            Écrivez-nous sur WhatsApp ou parcourez la boutique — livraison à Douala
            et paiement Mobile Money.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/boutique"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50 sm:w-auto"
            >
              Voir la boutique →
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-cmr-green px-6 py-3 font-semibold text-white transition hover:bg-cmr-green-dark sm:w-auto"
              >
                Nous écrire sur WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
