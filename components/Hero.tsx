import Link from "next/link";
import type { SiteConfig } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./Header";
import { HeroMedia } from "./HeroMedia";

type Props = {
  config: SiteConfig | null;
  ctaLabel?: string;
};

export function Hero({ config, ctaLabel }: Props) {
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋, je veux commander.")
    : null;

  return (
    <section className="relative isolate flex min-h-[32rem] items-center overflow-hidden bg-ink text-white sm:min-h-[38rem] lg:min-h-[42rem]">
      {/* Vidéo réelle de la boutique Tchokos (desktop) / poster (mobile) */}
      <HeroMedia poster="/hero-poster.jpg" src="/hero.mp4" />
      {/* Voiles pour la lisibilité */}
      <div className="absolute inset-0 -z-10 bg-ink/70" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />

      <div className="container-tchokos w-full py-16 text-center sm:py-20">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-100 backdrop-blur animate-fade-up">
            🇨🇲 Akwa · Douala — « The Best, Made in Africa »
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl font-display text-[2rem] font-extrabold leading-[1.1] animate-fade-up sm:text-5xl lg:text-6xl">
            La mode camerounaise,
            <br />
            <span className="relative inline-block text-brand-500">
              à prix grossiste
              <svg
                className="absolute -bottom-1.5 left-0 w-full sm:-bottom-2"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M2 9C60 3 140 3 298 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-slate-200 animate-fade-up-2 sm:text-lg">
            Chaussures, vêtements et accessoires tendance. Commandez sur WhatsApp,
            payez en Mobile Money, livré partout à Douala.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 animate-fade-up-2 sm:flex-row">
            <Link
              href="/boutique"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 sm:w-auto"
            >
              {ctaLabel ?? "Découvrir la boutique"}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-7 py-3.5 font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20 sm:w-auto"
              >
                <WhatsAppIcon className="h-5 w-5 text-cmr-green" /> Commander
              </a>
            )}
          </div>

          <div className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-x-10 gap-y-4 animate-fade-up-3">
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
