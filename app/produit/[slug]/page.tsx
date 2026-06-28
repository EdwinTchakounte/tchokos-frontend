import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api";
import { formatPrice, BADGE_LABELS, BADGE_STYLES } from "@/lib/format";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductReviews } from "@/components/ProductReviews";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description:
      product.description?.slice(0, 160) ||
      `${product.name} — ${formatPrice(product.price)} chez Tchokos.`,
    openGraph: {
      title: product.name,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const related = (await getProducts({ category: product.category_slug }).catch(() => []))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container-tchokos py-8">
      <nav className="mb-6 text-sm text-slate-400">
        <a href="/" className="hover:text-brand-600">Accueil</a> /{" "}
        <a href={`/categorie/${product.category_slug}`} className="hover:text-brand-600">
          {product.category_name}
        </a>{" "}
        / <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
              {product.brand}
            </p>
          )}
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            {product.name}
          </h1>

          {product.rating_count > 0 && (
            <a href="#avis" className="mt-2 inline-flex items-center gap-2">
              <Stars value={product.rating_avg} />
              <span className="text-sm font-medium text-ink">
                {product.rating_avg.toFixed(1)}
              </span>
              <span className="text-sm text-slate-400">
                ({product.rating_count} avis)
              </span>
            </a>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {product.badge && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  BADGE_STYLES[product.badge] ?? "bg-ink text-white"
                }`}
              >
                {BADGE_LABELS[product.badge]}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.in_stock
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {product.in_stock ? "En stock" : "Rupture"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                  -{product.discount_percent}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-5 leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}

          <div className="mt-7 rounded-2xl border border-slate-100 p-5 shadow-card">
            <ProductPurchase product={product} />
          </div>

          {/* Réassurance */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Reassure icon="🛵" title="Livraison Douala" />
            <Reassure icon="📱" title="Mobile Money" />
            <Reassure icon="💬" title="Support WhatsApp" />
            <Reassure icon="✅" title="Produit vérifié" />
          </div>
        </div>
      </div>

      {/* Avis clients */}
      <div id="avis">
        <ProductReviews
          reviews={product.reviews}
          ratingAvg={product.rating_avg}
          ratingCount={product.rating_count}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Vous aimerez aussi" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

function Reassure({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 px-2 py-3 text-center">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium text-ink-soft">{title}</span>
    </div>
  );
}
