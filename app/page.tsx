import Image from "next/image";
import Link from "next/link";
import { getSiteConfig, getCategories, getProducts } from "@/lib/api";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductGrid } from "@/components/ProductGrid";

export default async function HomePage() {
  const [config, categories, featured, promos] = await Promise.all([
    getSiteConfig().catch(() => null),
    getCategories().catch(() => []),
    getProducts({ featured: true }).catch(() => []),
    getProducts().catch(() => []),
  ]);

  const promoProducts = promos.filter((p) => p.discount_percent > 0).slice(0, 8);

  return (
    <>
      <Hero config={config} />

      {/* Bandeau confiance */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-tchokos grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
          <Trust icon="🚚" title="Livraison Douala" text="Rapide et fiable" />
          <Trust icon="💬" title="Commande WhatsApp" text="Simple, sans compte" />
          <Trust icon="📱" title="Mobile Money" text="MTN MoMo & Orange" />
          <Trust icon="🇨🇲" title="Made in Cameroun" text="Producteurs locaux" />
        </div>
      </section>

      {/* Catégories */}
      <section className="container-tchokos py-12 sm:py-16">
        <SectionHeading
          title="Nos catégories"
          subtitle="Trouvez votre style en un coup d'œil"
          href="/boutique"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Mis en avant */}
      {featured.length > 0 && (
        <section className="container-tchokos py-4 sm:py-8">
          <SectionHeading
            title="Coups de cœur"
            subtitle="Les modèles que tout le monde s'arrache"
            href="/boutique"
          />
          <ProductGrid products={featured.slice(0, 8)} />
        </section>
      )}

      {/* Comment ça marche */}
      <section className="container-tchokos py-12 sm:py-16">
        <SectionHeading
          title="Commander, c'est simple"
          subtitle="En 3 étapes, depuis votre téléphone"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Step n="1" icon="🛍️" title="Choisissez" text="Parcourez le catalogue et ajoutez vos articles au panier." />
          <Step n="2" icon="💬" title="Commandez sur WhatsApp" text="Validez votre panier : tout part pré-rempli sur WhatsApp." />
          <Step n="3" icon="🛵" title="Recevez à Douala" text="Un livreur vous l'apporte. Payez en Mobile Money ou à la livraison." />
        </div>
      </section>

      {/* Bannière revendeur (imagée) */}
      <section className="container-tchokos py-8 sm:py-12">
        <div className="grid overflow-hidden rounded-3xl bg-brand-600 text-white md:grid-cols-2">
          <div className="relative px-7 py-12 sm:px-12">
            <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <span className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Réseau de revendeurs
            </span>
            <h2 className="relative mt-4 font-display text-2xl font-extrabold sm:text-3xl lg:text-4xl">
              Revendeur ? Achetez au prix grossiste.
            </h2>
            <p className="relative mt-3 max-w-md text-white/90">
              Rejoignez le réseau Tchokos, ouvrez votre mini-boutique et
              approvisionnez-vous en mode tendance, livrée à Douala.
            </p>
            <Link
              href="/contact"
              className="relative mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Devenir revendeur →
            </Link>
          </div>
          <div className="relative min-h-56 md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80&auto=format&fit=crop"
              alt="Revendeurs Tchokos"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Promos */}
      {promoProducts.length > 0 && (
        <section className="container-tchokos py-4 sm:py-8 pb-16">
          <SectionHeading
            title="En promo 🔥"
            subtitle="Profitez-en avant la fin du stock"
            href="/boutique"
          />
          <ProductGrid products={promoProducts} />
        </section>
      )}
    </>
  );
}

function Trust({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lg">
      <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-brand-50 transition group-hover:text-brand-100">
        {n}
      </span>
      <div className="relative">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">
          {icon}
        </span>
        <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
