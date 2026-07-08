import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/api";
import { ContactForm } from "@/components/ContactForm";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Tchokos : WhatsApp, téléphone, adresse à Akwa, Douala.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const config = await getSiteConfig().catch(() => null);
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋")
    : null;
  const arrivages = config?.whatsapp_arrivages
    ? whatsappLink(config.whatsapp_arrivages, "Bonjour, je veux rejoindre le groupe des nouveaux arrivages Tchokos.")
    : null;
  const social = config?.social;

  return (
    <div className="container-tchokos py-8 sm:py-12">
      <header className="max-w-2xl">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          On vous répond vite
        </span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Contactez Tchokos
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
          Une question, une commande ou un partenariat ? Choisissez le canal qui
          vous arrange — on est à Akwa, Douala.
        </p>
      </header>

      {/* Canaux rapides */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {wa && (
          <ChannelCard
            href={wa}
            external
            tone="green"
            icon="💬"
            label="WhatsApp"
            value="Réponse rapide"
          />
        )}
        {arrivages && (
          <ChannelCard
            href={arrivages}
            external
            tone="amber"
            icon="🔔"
            label="Nouveaux arrivages"
            value="Rejoindre le groupe"
          />
        )}
        {config?.phone && (
          <ChannelCard
            href={`tel:${config.phone}`}
            tone="brand"
            icon="📞"
            label="Appeler"
            value={config.phone}
          />
        )}
        {config?.email && (
          <ChannelCard
            href={`mailto:${config.email}`}
            tone="ink"
            icon="✉️"
            label="Email"
            value={config.email}
          />
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Infos */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-bold text-ink">Notre boutique</h2>
            <div className="mt-3 flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50">📍</span>
              <p className="text-sm text-slate-500">{config?.address}</p>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50">🕘</span>
              <p className="text-sm text-slate-500">Lun – Sam · 8h – 19h</p>
            </div>
          </div>

          {social && (social.tiktok || social.facebook || social.instagram) && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <h2 className="font-display text-base font-bold text-ink">Suivez-nous</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {social.tiktok && <Social href={social.tiktok} label="TikTok" />}
                {social.facebook && <Social href={social.facebook} label="Facebook" />}
                {social.instagram && <Social href={social.instagram} label="Instagram" />}
              </div>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
          <h2 className="font-display text-base font-bold text-ink sm:text-lg">
            Écrivez-nous
          </h2>
          <p className="mb-4 text-sm text-slate-500">On vous recontacte rapidement.</p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ChannelCard({
  href,
  external,
  tone,
  icon,
  label,
  value,
}: {
  href: string;
  external?: boolean;
  tone: "green" | "brand" | "ink" | "amber";
  icon: string;
  label: string;
  value: string;
}) {
  const tones: Record<string, string> = {
    green: "from-cmr-green/10 to-cmr-green/5 ring-cmr-green/20",
    brand: "from-brand-100 to-brand-50 ring-brand-200",
    ink: "from-slate-100 to-slate-50 ring-slate-200",
    amber: "from-amber-100 to-amber-50 ring-amber-200",
  };
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 ring-1 transition hover:-translate-y-0.5 hover:shadow-card ${tones[tone]}`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="block truncate text-xs text-slate-500">{value}</span>
      </span>
    </a>
  );
}

function Social({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
    >
      {label}
    </a>
  );
}
