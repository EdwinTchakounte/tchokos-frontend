import Link from "next/link";
import type { Category, SiteConfig } from "@/lib/types";

type Props = {
  config: SiteConfig | null;
  categories: Category[];
};

export function Footer({ config, categories }: Props) {
  const social = config?.social;
  return (
    <footer className="mt-16 bg-ink text-slate-300">
      <div className="container-tchokos grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-brand-600 text-white font-display font-extrabold">
              T
            </span>
            <span className="font-display text-xl font-extrabold text-white">
              {config?.site_name ?? "Tchokos"}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-400 max-w-xs">
            {config?.tagline ??
              "Chaussures & vêtements — la marque du Cameroun."}
          </p>
          <p className="mt-4 text-sm text-slate-400">{config?.address}</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Boutique</h4>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categorie/${c.slug}`} className="hover:text-brand-400">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Tchokos</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/a-propos" className="hover:text-brand-400">À propos</Link></li>
            <li><Link href="/boutique" className="hover:text-brand-400">Tous les produits</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            {config?.phone && <li>📞 {config.phone}</li>}
            {config?.email && (
              <li>
                <a href={`mailto:${config.email}`} className="hover:text-brand-400">
                  ✉️ {config.email}
                </a>
              </li>
            )}
          </ul>
          <div className="mt-4 flex gap-3 text-sm">
            {social?.tiktok && <a href={social.tiktok} className="hover:text-white" target="_blank" rel="noopener noreferrer">TikTok</a>}
            {social?.facebook && <a href={social.facebook} className="hover:text-white" target="_blank" rel="noopener noreferrer">Facebook</a>}
            {social?.instagram && <a href={social.instagram} className="hover:text-white" target="_blank" rel="noopener noreferrer">Instagram</a>}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-tchokos py-5 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} {config?.site_name ?? "Tchokos"} Sarl — Douala, Cameroun.</p>
          <p>Paiement Mobile Money · Commande via WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}
