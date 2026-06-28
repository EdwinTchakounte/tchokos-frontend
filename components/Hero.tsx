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

export function Hero({ config, title, subtitle, ctaLabel }: Props) {
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋, je veux commander.")
    : null;

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Décor */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-cmr-green/20 blur-3xl" />

      <div className="container-tchokos relative grid gap-8 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200">
            🇨🇲 Made in Cameroun · Douala
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
            {title ?? (
              <>
                La marque <span className="text-brand-500">chaussures</span> &{" "}
                <span className="text-brand-500">vêtements</span> du Cameroun
              </>
            )}
          </h1>
          <p className="mt-5 max-w-lg text-base sm:text-lg text-slate-300">
            {subtitle ??
              "Des milliers de modèles à prix grossiste. Commandez en un clic sur WhatsApp, payez en Mobile Money, livré près de chez vous."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition"
            >
              {ctaLabel ?? "Découvrir la boutique"}
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cmr-green px-6 py-3 font-semibold text-white hover:bg-cmr-green-dark transition"
              >
                <WhatsAppIcon className="h-5 w-5" /> Commander
              </a>
            )}
          </div>

          {/* Preuve sociale */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Stat value="450K+" label="abonnés TikTok" />
            <Stat value="400K+" label="abonnés Facebook" />
            <Stat value="100%" label="Mobile Money" />
          </div>
        </div>

        {/* Bloc visuel décoratif */}
        <div className="relative hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <Tile className="h-48 bg-brand-500/90" label="👟 Chaussures" />
              <Tile className="h-32 bg-white/10" label="🧥 Vêtements" />
            </div>
            <div className="space-y-4 pt-10">
              <Tile className="h-32 bg-cmr-green/80" label="👜 Accessoires" />
              <Tile className="h-48 bg-gold/90 text-ink" label="✨ Nouveautés" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-white">{value}</p>
      <p className="text-slate-400">{label}</p>
    </div>
  );
}

function Tile({ className, label }: { className: string; label: string }) {
  return (
    <div
      className={`grid place-items-center rounded-2xl font-display text-lg font-bold text-white shadow-lg ${className}`}
    >
      {label}
    </div>
  );
}
