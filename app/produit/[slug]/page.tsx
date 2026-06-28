import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api";
import { formatPrice, BADGE_LABELS, BADGE_STYLES } from "@/lib/format";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";

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
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
            {product.name}
          </h1>

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
            <span className="font-display text-3xl font-extrabold text-ink">
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
        </div>
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
