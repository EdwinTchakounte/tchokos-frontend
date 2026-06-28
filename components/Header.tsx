"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category, SiteConfig } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { SearchBar } from "./SearchBar";

type Props = {
  config: SiteConfig | null;
  categories: Category[];
};

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Header({ config, categories }: Props) {
  const [open, setOpen] = useState(false);
  const { count, ready } = useCart();
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋, je souhaite des informations.")
    : null;

  return (
    <header className="relative z-30 border-b border-slate-100 bg-white">
      {/* Bandeau annonce */}
      <div className="bg-ink text-white text-xs sm:text-sm">
        <div className="container-tchokos flex items-center justify-center gap-2 py-1.5 text-center">
          <span>🚚 Livraison à Douala · Commande facile sur WhatsApp · Paiement Mobile Money</span>
        </div>
      </div>

      <div className="container-tchokos flex items-center gap-4 h-16">
        {/* Logo réel Tchokos */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Tchokos — accueil">
          <img src="/logo-tchokos.svg" alt="Tchokos" className="h-11 w-11" />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            Tchokos
          </span>
        </Link>

        {/* Nav desktop (regroupée) */}
        <nav className="ml-6 hidden shrink-0 items-center gap-5 text-sm font-medium text-ink-soft lg:flex">
          <Link href="/" className="transition hover:text-brand-600">Accueil</Link>
          <Link href="/boutique" className="transition hover:text-brand-600">Boutique</Link>

          {/* Menu déroulant Catégories */}
          {categories.length > 0 && (
            <div className="group relative">
              <button className="flex items-center gap-1 transition hover:text-brand-600">
                Catégories
                <svg className="h-4 w-4 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="invisible absolute left-1/2 top-full z-40 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="grid w-[36rem] grid-cols-2 gap-1 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categorie/${c.slug}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      {c.name}
                      <span className="text-xs text-slate-300">{c.product_count}</span>
                    </Link>
                  ))}
                  <Link href="/boutique" className="col-span-2 mt-1 rounded-lg bg-brand-50 px-3 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-100">
                    Voir toute la boutique →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Link href="/a-propos" className="transition hover:text-brand-600">À propos</Link>
          <Link href="/contact" className="transition hover:text-brand-600">Contact</Link>
        </nav>

        {/* Recherche (desktop) */}
        <SearchBar className="hidden md:block flex-1 mx-4 max-w-lg" />

        <div className="ml-auto flex items-center gap-2">
          {/* Panier */}
          <Link
            href="/panier"
            className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100"
            aria-label="Panier"
          >
            <CartIcon />
            {ready && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-cmr-green px-4 py-2 text-sm font-semibold text-white hover:bg-cmr-green-dark transition"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Commander
            </a>
          )}
          {/* Burger mobile */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden grid place-items-center h-10 w-10 rounded-lg hover:bg-slate-100"
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="sr-only">Ouvrir le menu</span>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Recherche (mobile) */}
      <div className="md:hidden border-t border-slate-100 px-4 py-2.5">
        <SearchBar onNavigate={() => setOpen(false)} />
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <nav className="container-tchokos py-3 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 font-medium border-b border-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <p className="pt-3 pb-1 text-xs uppercase tracking-wide text-slate-400">
              Catégories
            </p>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categorie/${c.slug}`}
                onClick={() => setOpen(false)}
                className="py-2 text-ink-soft"
              >
                {c.name}
              </Link>
            ))}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-cmr-green px-4 py-2.5 font-semibold text-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> Commander sur WhatsApp
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2l2.2 12.2a1.5 1.5 0 001.5 1.3h8.6a1.5 1.5 0 001.5-1.2L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.515zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
    </svg>
  );
}
