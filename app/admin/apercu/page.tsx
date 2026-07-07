"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/format";
import { getOverview, type Overview } from "@/lib/admin-overview";

// Ordre fixe des statuts de commande (aligné sur les badges du reste de l'admin).
const STATUS_ORDER = ["new", "contacted", "confirmed", "paid", "delivered", "cancelled"];
const STATUS_BAR: Record<string, string> = {
  new: "bg-slate-400",
  contacted: "bg-sky-400",
  confirmed: "bg-indigo-400",
  paid: "bg-green-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-400",
};

const DELIVERY_META: { key: keyof Overview["delivery"]; label: string; tone: string }[] = [
  { key: "pending", label: "À assigner", tone: "text-slate-500" },
  { key: "assigned", label: "En attente livreur", tone: "text-amber-600" },
  { key: "in_progress", label: "En cours", tone: "text-sky-600" },
  { key: "completed", label: "Livrées", tone: "text-cmr-green" },
  { key: "expired", label: "Expirées", tone: "text-red-500" },
];

function fmtDay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function StatCard({ label, value, tone = "slate", hint }: { label: string; value: string; tone?: string; hint?: string }) {
  const tones: Record<string, string> = {
    slate: "text-ink", green: "text-cmr-green", amber: "text-amber-600",
    brand: "text-brand-600", sky: "text-sky-600", red: "text-red-500",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <p className={`font-display text-lg font-extrabold sm:text-2xl ${tones[tone] ?? tones.slate}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

/** Graphe 30 jours — aire (CA) ou barres (commandes), avec survol. Un seul axe. */
function TrendChart({
  data, kind, colorClass, format,
}: {
  data: { date: string; value: number }[];
  kind: "area" | "bars";
  colorClass: string;
  format: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 180, padX = 10, padTop = 14, padBottom = 26;
  const innerW = W - padX * 2, innerH = H - padTop - padBottom;
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const x = (i: number) => padX + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => padTop + innerH * (1 - v / max);

  const linePts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const areaPath = `M ${padX},${padTop + innerH} L ${data.map((d, i) => `${x(i)},${y(d.value)}`).join(" L ")} L ${padX + innerW},${padTop + innerH} Z`;
  const barW = Math.max(2, (innerW / n) * 0.55);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="none" role="img">
        {/* baseline recessive */}
        <line x1={padX} y1={padTop + innerH} x2={padX + innerW} y2={padTop + innerH} className="stroke-slate-200" strokeWidth={1} />
        <g className={colorClass}>
          {kind === "area" && (
            <>
              <path d={areaPath} fill="currentColor" fillOpacity={0.12} />
              <polyline points={linePts} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </>
          )}
          {kind === "bars" && data.map((d, i) => (
            <rect key={i} x={x(i) - barW / 2} y={y(d.value)} width={barW}
              height={Math.max(0, padTop + innerH - y(d.value))} rx={2} fill="currentColor"
              fillOpacity={hover === null || hover === i ? 0.9 : 0.5} />
          ))}
          {hover !== null && (
            <circle cx={x(hover)} cy={y(data[hover].value)} r={4} fill="currentColor"
              className="stroke-white" strokeWidth={2} />
          )}
        </g>
        {/* zones de survol */}
        {data.map((_, i) => (
          <rect key={i} x={padX + (i - 0.5) * (innerW / (n - 1 || 1))} y={0}
            width={innerW / (n - 1 || 1)} height={H} fill="transparent"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover((h) => (h === i ? null : h))} />
        ))}
      </svg>
      {/* étiquettes d'axe : début / milieu / fin */}
      <div className="mt-1 flex justify-between px-1 text-[10px] text-slate-400">
        <span>{fmtDay(data[0].date)}</span>
        <span>{fmtDay(data[Math.floor(n / 2)].date)}</span>
        <span>{fmtDay(data[n - 1].date)}</span>
      </div>
      {/* tooltip */}
      {hover !== null && (
        <div className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-center text-[11px] font-medium text-white shadow-lg"
          style={{ left: `${(hover / (n - 1 || 1)) * 100}%` }}>
          <div className="opacity-70">{fmtDay(data[hover].date)}</div>
          <div className="font-bold">{format(data[hover].value)}</div>
        </div>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getOverview());
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur";
      if (msg === "unauthorized" || msg === "forbidden") { router.replace("/connexion?next=/admin/apercu"); return; }
      setError("Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const k = data?.kpis;
  const maxStatus = data ? Math.max(1, ...Object.values(data.orders_by_status)) : 1;

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink">Vue d&apos;ensemble</h1>
            <p className="text-sm text-slate-500">Activité, ventes et livraisons en un coup d&apos;œil.</p>
          </div>
          <button onClick={load} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
            Actualiser
          </button>
        </div>

        {loading && <p className="mt-10 text-center text-slate-400">Chargement…</p>}
        {error && <p className="mt-10 text-center text-red-500">{error}</p>}

        {k && !loading && (
          <div className="mt-6 space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="CA encaissé" value={`${formatPrice(Number(k.revenue_collected))}`} tone="green" />
              <StatCard label="Commandes" value={String(k.total_orders)} tone="brand" />
              <StatCard label="Payées" value={String(k.paid_orders)} tone="green" />
              <StatCard label="Livrées" value={String(k.delivered_orders)} tone="sky" />
              <StatCard label="Panier moyen" value={formatPrice(Number(k.avg_basket))} tone="slate" />
              <StatCard label="Paiements en attente" value={String(k.payments_en_attente)} tone="amber" />
            </div>

            {/* Évolution 30 jours — 2 graphes (jamais de double axe) */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                <p className="font-display text-sm font-bold text-ink">Chiffre d&apos;affaires · 30 j</p>
                <p className="mb-3 text-xs text-slate-400">Paiements validés par jour</p>
                <TrendChart kind="area" colorClass="text-cmr-green"
                  data={data.timeseries.map((d) => ({ date: d.date, value: d.revenue }))}
                  format={(v) => `${formatPrice(v)}`} />
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                <p className="font-display text-sm font-bold text-ink">Commandes · 30 j</p>
                <p className="mb-3 text-xs text-slate-400">Nombre de commandes par jour</p>
                <TrendChart kind="bars" colorClass="text-brand-500"
                  data={data.timeseries.map((d) => ({ date: d.date, value: d.orders }))}
                  format={(v) => `${v} commande${v > 1 ? "s" : ""}`} />
              </div>
            </div>

            {/* Répartition par statut */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <p className="font-display text-sm font-bold text-ink">Commandes par statut</p>
              <div className="mt-4 space-y-2.5">
                {STATUS_ORDER.map((s) => {
                  const val = data.orders_by_status[s] ?? 0;
                  const label = data.status_labels[s] ?? s;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs text-slate-500">{label}</span>
                      <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${STATUS_BAR[s]} transition-all`}
                          style={{ width: `${(val / maxStatus) * 100}%`, minWidth: val > 0 ? "1.5rem" : 0 }} />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm font-bold text-ink">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Livraisons */}
            <div>
              <p className="mb-3 font-display text-sm font-bold text-ink">Livraisons</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {DELIVERY_META.map((d) => (
                  <StatCard key={d.key} label={d.label} value={String(data.delivery[d.key])}
                    tone={d.tone.includes("cmr-green") ? "green" : d.tone.includes("amber") ? "amber" : d.tone.includes("sky") ? "sky" : d.tone.includes("red") ? "red" : "slate"} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
