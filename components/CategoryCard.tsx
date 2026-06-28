import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categorie/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl shadow-card"
    >
      <div className="relative aspect-[4/5] bg-slate-100">
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="font-display text-base font-bold text-white leading-tight">
          {category.name}
        </h3>
        <p className="text-xs text-white/80">{category.product_count} articles</p>
      </div>
    </Link>
  );
}
