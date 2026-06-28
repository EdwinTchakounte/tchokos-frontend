import Image from "next/image";
import Link from "next/link";
import type { SiteConfig } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./Header";

type Props = {
  config: SiteConfig | null;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80&auto=format&fit=crop";
const HERO_THUMB =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80&auto=format&fit=crop";

export function Hero({ config, title, subtitle, ctaLabel }: Props) {
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋, je veux commander.")
    : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="container-tchokos relative grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
        {/* Texte */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
            🔥 Nouveaux arrivages chaque semaine
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            {title ?? (
              <>
                La mode du Cameroun,
                <span className="relative whitespace-nowrap text-brand-600">
                  {" "}à prix grossiste
                </span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink-soft sm:text-lg">
            {subtitle ??
              "Chaussures, vêtements et accessoires tendance livrés à Douala. Commandez en un clic sur WhatsApp, payez en Mobile Money."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition"
            >
              {ctaLabel ?? "Découvrir la boutique"} →
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink ring-1 ring-slate-200 hover:ring-cmr-green hover:text-cmr-green transition"
              >
                <WhatsAppIcon className="h-5 w-5 text-cmr-green" /> Commander
              </a>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            <Stat value="450K+" label="abonnés TikTok" />
            <Stat value="9" label="catégories" />
            <Stat value="100%" label="Mobile Money" />
          </div>
        </div>

        {/* Visuel */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-ink/10 sm:aspect-square lg:aspect-[4/5]">
            <Image
              src={HERO_IMG}
              alt="Mode et chaussures Tchokos"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Carte flottante — promo produit */}
          <div className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 shadow-xl ring-1 ring-slate-100 sm:left-6">
            <span className="relative h-12 w-12 overflow-hidden rounded-xl">
              <Image src={HERO_THUMB} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <div>
              <p className="text-xs text-slate-400 line-through">20 000 FCFA</p>
              <p className="font-display text-sm font-bold text-ink">−25% aujourd&apos;hui</p>
            </div>
          </div>

          {/* Carte flottante — confiance */}
          <div className="absolute -bottom-4 right-2 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-100 sm:right-6">
            <p className="font-display text-lg font-bold text-ink">★ 4,9/5</p>
            <p className="text-xs text-slate-500">Communauté de fans</p>
          </div>

          {/* Pastille livraison */}
          <div className="absolute right-4 top-4 rounded-full bg-cmr-green px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            🚚 Livraison Douala
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
