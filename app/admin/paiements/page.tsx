"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/format";
import {
  getPayments,
  getSalesStats,
  type AdminPayment,
  type SalesStats,
} from "@/lib/admin-orders";

const PAY_STYLES: Record<string, string> = {
  valide: "bg-green-100 text-green-700",
  en_attente: "bg-amber-100 text-amber-700",
  rejete: "bg-red-100 text-red-600",
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminPayment[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statutF, setStatutF] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, statsRes] = await Promise.all([
        getPayments({ q: q || undefined, statut: statutF || undefined, limit: 100 }),
        getSalesStats(),
      ]);
      setRows(payRes.results);
      setStats(statsRes);
    } catch (err) {
      if (err instanceof Error && (err.message === "unauthorized" || err.message === "forbidden")) {
        router.replace("/connexion?next=/admin/paiements");
      }
    } finally {
      setLoading(false);
    }
  }, [q, statutF, router]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Paiements</h1>
        <p className="text-sm text-slate-500">Toutes les transactions Mobile Money (Tara), avec leur statut réel.</p>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="CA encaissé" value={formatPrice(stats.revenue_collected)} tone="green" />
          <StatCard label="Paiements validés" value={String(stats.payments_valides)} tone="green" />
          <StatCard label="En attente" value={String(stats.payments_en_attente)} tone="amber" />
          <StatCard label="Panier moyen" value={formatPrice(stats.avg_basket)} />
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (réf commande, réf Tara, téléphone)…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <select
          value={statutF}
          onChange={(e) => setStatutF(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="valide">Validé</option>
          <option value="en_attente">En attente</option>
          <option value="rejete">Rejeté</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        <div className="hidden grid-cols-[130px_1fr_110px_1fr_110px] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Commande</span><span>Client</span><span>Montant</span><span>Réf. Tara</span><span>Statut</span>
        </div>
        {loading && <p className="px-4 py-14 text-center text-sm text-slate-400">Chargement…</p>}
        {!loading && rows.map((p) => (
          <div key={p.id} className="grid grid-cols-2 items-center gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 md:grid-cols-[130px_1fr_110px_1fr_110px]">
            <span className="font-mono text-xs font-semibold text-ink">{p.order_reference}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{p.customer_name}</p>
              <p className="text-xs text-slate-400">
                {new Date(p.created_at).toLocaleString("fr-FR", {
                  day: "2-digit", month: "2-digit", year: "2-digit",
                  hour: "2-digit", minute: "2-digit",
                })} · {p.phone}
              </p>
            </div>
            <span className="text-sm font-semibold text-ink">{formatPrice(p.montant)}</span>
            <span className="truncate font-mono text-[11px] text-slate-400">{p.reference_externe || "—"}</span>
            <span className={`justify-self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${PAY_STYLES[p.statut] ?? "bg-slate-100"}`}>
              {p.statut_display}
            </span>
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <p className="px-4 py-14 text-center text-sm text-slate-400">Aucun paiement.</p>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "green" | "amber" }) {
  const tones: Record<string, string> = { slate: "text-ink", green: "text-cmr-green", amber: "text-amber-600" };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <p className={`font-display text-lg font-extrabold sm:text-xl ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
