"use client";

// Pagination offset/limit partagée par les listes admin (Commandes, Paiements).
// Le backend renvoie { count, limit, offset, results } ; on navigue par pages.
export function Pager({
  offset,
  pageSize,
  shown,
  count,
  onPrev,
  onNext,
}: {
  offset: number;
  pageSize: number;
  shown: number; // nombre de lignes réellement affichées sur la page courante
  count: number; // total d'enregistrements (toutes pages)
  onPrev: () => void;
  onNext: () => void;
}) {
  if (count === 0) return null;
  const from = offset + 1;
  const to = offset + shown;
  const hasPrev = offset > 0;
  const hasNext = offset + pageSize < count;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs text-slate-500">
        {from}–{to} sur <span className="font-semibold text-slate-600">{count}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
