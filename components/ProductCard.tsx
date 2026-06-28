import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, BADGE_LABELS, BADGE_STYLES } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group flex flex-col rounded-2xl bg-white ring-1 ring-slate-100 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:ring-brand-200 transition duration-200"
    >
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-300 text-sm">
            Pas d&apos;image
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                BADGE_STYLES[product.badge] ?? "bg-ink text-white"
              }`}
            >
              {BADGE_LABELS[product.badge]}
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              -{product.discount_percent}%
            </span>
          )}
        </div>

        {!product.in_stock && (
          <div className="absolute inset-0 grid place-items-center bg-white/60">
            <span className="rounded-full bg-ink/90 px-3 py-1 text-xs font-semibold text-white">
              Bientôt de retour
            </span>
          </div>
        )}

        {product.in_stock && (
          <div className="absolute bottom-2 right-2">
            <AddToCartButton product={product} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-600">
          {product.brand || product.category_name}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-ink group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="font-display text-base font-bold text-ink">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
