import Link from "next/link";
import type { Category, SiteConfig } from "@/lib/types";
import { FooterSection } from "./FooterSection";

type Props = {
  config: SiteConfig | null;
  categories: Category[];
};

export function Footer({ config, categories }: Props) {
  const social = config?.social;
  return (
    <footer className="mt-16 bg-ink text-slate-300">
      <div className="container-tchokos grid gap-x-10 gap-y-2 py-10 md:grid-cols-4 md:gap-y-10 md:py-12">
        {/* Marque */}
        <div className="pb-4 md:pb-0">
          <div className="flex items-center gap-2">
            <img src="/logo-tchokos.svg" alt="Tchokos" className="h-12 w-12" />
            <span className="font-display text-2xl font-extrabold text-white">Tchokos</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            {config?.tagline ?? "Chaussures & vêtements — la marque du Cameroun."}
          </p>
          <p className="mt-3 text-sm text-slate-400">{config?.address}</p>
          <div className="mt-4 flex gap-3 text-sm">
            {social?.tiktok && <a href={social.tiktok} className="hover:text-white" target="_blank" rel="noopener noreferrer">TikTok</a>}
            {social?.facebook && <a href={social.facebook} className="hover:text-white" target="_blank" rel="noopener noreferrer">Facebook</a>}
            {social?.instagram && <a href={social.instagram} className="hover:text-white" target="_blank" rel="noopener noreferrer">Instagram</a>}
          </div>
        </div>

        <FooterSection title="Boutique">
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/categorie/${c.slug}`} className="text-slate-400 hover:text-brand-400">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </FooterSection>

        <FooterSection title="Tchokos">
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/a-propos" className="hover:text-brand-400">À propos</Link></li>
            <li><Link href="/services" className="hover:text-brand-400">Nos services</Link></li>
            <li><Link href="/boutique" className="hover:text-brand-400">Tous les produits</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400">Contact</Link></li>
            <li><Link href="/vendeur" className="hover:text-brand-400">Espace vendeur</Link></li>
            <li><Link href="/livreur" className="hover:text-brand-400">Espace livreur</Link></li>
          </ul>
        </FooterSection>

        <FooterSection title="Contact">
          <ul className="space-y-2 text-sm text-slate-400">
            {config?.phone && <li>📞 {config.phone}</li>}
            {config?.email && (
              <li>
                <a href={`mailto:${config.email}`} className="hover:text-brand-400">
                  ✉️ {config.email}
                </a>
              </li>
            )}
          </ul>
        </FooterSection>
      </div>

      <div className="border-t border-white/10">
        <div className="container-tchokos flex flex-col justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {config?.site_name ?? "Tchokos"} Sarl — Douala, Cameroun.</p>
          <p>Paiement Mobile Money · Commande via WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}
