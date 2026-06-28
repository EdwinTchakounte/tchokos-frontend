import Link from "next/link";
import type { SiteConfig } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./Header";
import { HeroMedia } from "./HeroMedia";

type Props = {
  config: SiteConfig | null;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

const POSTER =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80&auto=format&fit=crop";

export function Hero({ config, title, subtitle, ctaLabel }: Props) {
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋, je veux commander.")
    : null;

  return (
    <section className="relative isolate flex min-h-[34rem] items-center overflow-hidden bg-ink text-white sm:min-h-[40rem] lg:min-h-[44rem]">
      {/* Vidéo / poster en fond */}
      <HeroMedia poster={POSTER} src="/hero.mp4" />
      {/* Voiles pour la lisibilité */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-transparent to-ink/30" />

      <div className="container-tchokos w-full py-16 sm:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-100 backdrop-blur animate-fade-up">
            🇨🇲 Akwa · Douala — le super grossiste mode
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.04] animate-fade-up sm:text-6xl lg:text-7xl">
            {title ?? (
              <>
                La mode camerounaise,{" "}
                <span className="relative inline-block text-brand-500">
                  à prix grossiste
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full sm:-bottom-2"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9C60 3 140 3 298 7"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-lg text-base text-slate-200 animate-fade-up-2 sm:text-lg">
            {subtitle ??
              "Chaussures, vêtements et accessoires tendance. Commandez en un clic sur WhatsApp, payez en Mobile Money, livré partout à Douala."}
          </p>

          <div className="mt-8 flex flex-col gap-3 animate-fade-up-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/boutique"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
            >
              {ctaLabel ?? "Découvrir la boutique"}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-7 py-3.5 font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20"
              >
                <WhatsAppIcon className="h-5 w-5 text-cmr-green" /> Commander
              </a>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 animate-fade-up-3">
            <Stat value="450K+" label="abonnés TikTok" />
            <Stat value="1000+" label="modèles dispo" />
            <Stat value="100%" label="Mobile Money" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">{value}</p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}
