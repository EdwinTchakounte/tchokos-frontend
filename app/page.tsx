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

      {/* Bannière promo */}
      <section className="container-tchokos py-12">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-12 text-center text-white sm:px-12">
          <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Revendeur ? Achetez au prix grossiste.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Rejoignez le réseau Tchokos et approvisionnez votre boutique en
            chaussures et vêtements tendance, livrés à Douala.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50 transition"
          >
            Devenir revendeur
          </Link>
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
