import type { Review } from "@/lib/types";
import { Stars } from "./Stars";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProductReviews({
  reviews,
  ratingAvg,
  ratingCount,
}: {
  reviews: Review[];
  ratingAvg: number;
  ratingCount: number;
}) {
  if (ratingCount === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-extrabold text-ink">Avis clients</h2>

      <div className="mt-5 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Résumé note */}
        <div className="rounded-2xl border border-slate-100 p-6 text-center shadow-card h-fit">
          <p className="font-display text-5xl font-extrabold text-ink">
            {ratingAvg.toFixed(1)}
          </p>
          <Stars value={ratingAvg} className="mt-2 justify-center" />
          <p className="mt-2 text-sm text-slate-500">
            {ratingCount} avis vérifié{ratingCount > 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste avis */}
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-slate-100 p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {initials(r.author_name)}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-ink">{r.author_name}</p>
                  <Stars value={r.rating} />
                </div>
              </div>
              {r.comment && <p className="mt-3 text-sm text-ink-soft">{r.comment}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
