import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/lib/api";

const ABOUT_HERO =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80&auto=format&fit=crop";
const ABOUT_SIDE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80&auto=format&fit=crop";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "L'histoire de Tchokos : une marque née de la résilience, au service de la mode camerounaise.",
};

export default async function AboutPage() {
  const config = await getSiteConfig().catch(() => null);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
        <Image
          src={ABOUT_HERO}
          alt="La mode au Cameroun"
          fill
          sizes="100vw"
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
        <div className="container-tchokos relative">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200">
            Notre histoire
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold sm:text-5xl">
            La mode camerounaise, accessible à tous.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-200">
            {config?.tagline ??
              "Tchokos est née à Douala d'une conviction simple : le style ne doit pas être un luxe."}
          </p>
        </div>
      </section>

      <section className="container-tchokos grid items-center gap-12 py-16 lg:grid-cols-2">
        <div className="space-y-4 text-ink-soft leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-ink">
            « C&apos;est difficile, mais c&apos;est possible. »
          </h2>
          <p>
            Partie d&apos;un simple étal à Akwa, Tchokos s&apos;est construite à
            la force du travail et d&apos;une communauté fidèle — plus de 450 000
            abonnés sur TikTok et 400 000 sur Facebook. Aujourd&apos;hui, c&apos;est
            l&apos;une des références de la chaussure et du vêtement au Cameroun.
          </p>
          <p>
            Notre mission : structurer cette énergie en une plateforme moderne qui
            relie vendeurs, acheteurs et livreurs, met en avant les produits
            locaux et crée de l&apos;emploi pour la jeunesse.
          </p>
          <blockquote className="border-l-4 border-brand-500 pl-4 italic text-ink">
            « Le feu peut détruire la hutte, mais jamais la volonté de
            reconstruire. »
          </blockquote>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-ink/10">
          <Image
            src={ABOUT_SIDE}
            alt="Chaussures et mode Tchokos"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="container-tchokos pb-16">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Value icon="🤝" title="Confiance" text="Le contact humain d'abord : WhatsApp, téléphone, proximité." />
          <Value icon="⚡" title="Rapidité" text="Un site léger qui charge vite, même en 3G." />
          <Value icon="🇨🇲" title="Local" text="Mettre en lumière les producteurs camerounais." />
          <Value icon="📈" title="Ambition" text="Grandir avec notre réseau de revendeurs." />
        </div>
      </section>

      <section className="container-tchokos pb-16">
        <div className="rounded-3xl bg-brand-50 px-6 py-10 text-center sm:px-12">
          <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Envie de rejoindre l&apos;aventure ?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-soft">
            Revendeur, livreur ou simple curieux : écrivez-nous.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}

function Value({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5 shadow-card">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}
