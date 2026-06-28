import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/api";
import { ContactForm } from "@/components/ContactForm";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Tchokos : WhatsApp, téléphone, adresse à Akwa, Douala.",
};

export default async function ContactPage() {
  const config = await getSiteConfig().catch(() => null);
  const wa = config?.whatsapp_number
    ? whatsappLink(config.whatsapp_number, "Bonjour Tchokos 👋")
    : null;

  return (
    <div className="container-tchokos py-12">
      <h1 className="font-display text-3xl font-extrabold text-ink">Contact</h1>
      <p className="mt-1 max-w-xl text-slate-500">
        Une question, une commande, un partenariat ? Écrivez-nous — on répond vite.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Coordonnées */}
        <div className="space-y-4">
          {config?.address && (
            <InfoRow icon="📍" title="Adresse">
              {config.address}
            </InfoRow>
          )}
          {config?.phone && (
            <InfoRow icon="📞" title="Téléphone">
              <a href={`tel:${config.phone}`} className="hover:text-brand-600">
                {config.phone}
              </a>
            </InfoRow>
          )}
          {config?.email && (
            <InfoRow icon="✉️" title="Email">
              <a href={`mailto:${config.email}`} className="hover:text-brand-600">
                {config.email}
              </a>
            </InfoRow>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-cmr-green px-5 py-3 font-semibold text-white hover:bg-cmr-green-dark transition"
            >
              Discuter sur WhatsApp
            </a>
          )}
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-slate-100 p-6 shadow-card">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-sm text-slate-500">{children}</p>
      </div>
    </div>
  );
}
