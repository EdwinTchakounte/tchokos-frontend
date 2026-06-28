import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, BADGE_LABELS, BADGE_STYLES } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { Stars } from "./Stars";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-brand-200"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image ? (
          <>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition duration-500 group-hover:scale-105 ${
                product.hover_image ? "group-hover:opacity-0" : ""
              }`}
            />
            {product.hover_image && (
              <Image
                src={product.hover_image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-300">
            Pas d&apos;image
          </div>
        )}

        {/* Dégradé bas pour la profondeur */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent" />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${BADGE_STYLES[product.badge] ?? "bg-ink text-white"}`}>
              {BADGE_LABELS[product.badge]}
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              −{product.discount_percent}%
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

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-brand-600">
            {product.brand || product.category_name}
          </p>
          {product.rating_count > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-slate-400">
              <Stars value={product.rating_avg} />
            </span>
          )}
        </div>

        <h3 className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:text-brand-700 sm:text-sm">
          {product.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="font-display text-[15px] font-extrabold text-ink sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-[11px] text-slate-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
