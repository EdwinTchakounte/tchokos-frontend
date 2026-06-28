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

const IMG_MAIN =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80&auto=format&fit=crop";
const IMG_SUB =
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80&auto=format&fit=crop";
const IMG_THUMB =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&q=80&auto=format&fit=crop";

export function Hero({ config, title, subtitle, ctaLabel }: Props) {
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋, je veux commander.")
    : null;

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {/* Halos de couleur */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cmr-green/20 blur-3xl" />
      {/* Grille subtile */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="container-tchokos relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-20">
        {/* Texte */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur">
            🇨🇲 Akwa · Douala — le super grossiste mode
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
            {title ?? (
              <>
                La mode
                <br className="hidden sm:block" /> camerounaise,{" "}
                <span className="relative inline-block text-brand-500">
                  à prix grossiste
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
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

          <p className="mt-7 max-w-lg text-base text-slate-300 sm:text-lg">
            {subtitle ??
              "Chaussures, vêtements et accessoires tendance. Commandez en un clic sur WhatsApp, payez en Mobile Money, livré partout à Douala."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up-2">
            <Link
              href="/boutique"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
            >
              {ctaLabel ?? "Découvrir la boutique"}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
              >
                <WhatsAppIcon className="h-5 w-5 text-cmr-green" /> Commander
              </a>
            )}
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 animate-fade-up-3">
            <Stat value="450K+" label="abonnés TikTok" />
            <Stat value="1000+" label="modèles dispo" />
            <Stat value="100%" label="Mobile Money" />
          </div>
        </div>

        {/* Collage visuel */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5]">
            {/* Image principale */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <Image
                src={IMG_MAIN}
                alt="Mode et chaussures Tchokos"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
            </div>

            {/* Image secondaire (sneaker) */}
            <div className="animate-floaty absolute -bottom-6 -left-6 h-40 w-40 overflow-hidden rounded-2xl ring-4 ring-ink shadow-xl sm:h-48 sm:w-48">
              <Image src={IMG_SUB} alt="Sneakers" fill sizes="200px" className="object-cover" />
            </div>

            {/* Carte promo flottante */}
            <div className="animate-floaty-slow absolute -right-3 top-6 flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 text-ink shadow-xl sm:-right-6">
              <span className="relative h-11 w-11 overflow-hidden rounded-xl">
                <Image src={IMG_THUMB} alt="" fill sizes="44px" className="object-cover" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400 line-through">20 000</p>
                <p className="font-display text-sm font-extrabold text-brand-600">−25%</p>
              </div>
            </div>

            {/* Pastille note */}
            <div className="absolute -right-2 bottom-10 rounded-2xl bg-cmr-green px-4 py-2.5 text-white shadow-xl sm:right-4">
              <p className="font-display text-base font-extrabold leading-none">★ 4,9</p>
              <p className="mt-0.5 text-[11px] text-white/80">+850K fans</p>
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
      <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
