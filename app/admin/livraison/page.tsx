"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/format";
import {
  getDeliveries,
  getCouriers,
  assignDelivery,
  getZones,
  createZone,
  updateZone,
  getSettlements,
  settleSettlement,
  type AdminDelivery,
  type AdminCourier,
  type AdminZone,
  type AdminSettlement,
  type SettlementSummary,
} from "@/lib/admin-delivery";

type Tab = "courses" | "zones" | "decaissements";

const DELIVERY_STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  assigned: "bg-amber-100 text-amber-700",
  accepted: "bg-sky-100 text-sky-700",
  completed: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminDeliveryPage() {
  const [tab, setTab] = useState<Tab>("courses");
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Livraison</h1>
        <p className="text-sm text-slate-500">Courses, tarifs par zone et décaissements des livreurs.</p>
      </div>

      <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        <TabBtn active={tab === "courses"} onClick={() => setTab("courses")}>🛵 Courses</TabBtn>
        <TabBtn active={tab === "zones"} onClick={() => setTab("zones")}>📍 Zones & tarifs</TabBtn>
        <TabBtn active={tab === "decaissements"} onClick={() => setTab("decaissements")}>💰 Décaissements</TabBtn>
      </div>

      {tab === "courses" && <CoursesTab />}
      {tab === "zones" && <ZonesTab />}
      {tab === "decaissements" && <SettlementsTab />}
    </AdminShell>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 transition ${active ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Courses ------------------------------ */

function CoursesTab() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminDelivery[]>([]);
  const [couriers, setCouriers] = useState<AdminCourier[]>([]);
  const [statusF, setStatusF] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([
        getDeliveries({ status: statusF || undefined }),
        getCouriers(),
      ]);
      setRows(d.results);
      setCouriers(c);
    } catch (err) {
      if (err instanceof Error && (err.message === "unauthorized" || err.message === "forbidden")) {
        router.replace("/connexion?next=/admin/livraison");
      }
    } finally {
      setLoading(false);
    }
  }, [statusF, router]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function assign(id: number, courierId: number) {
    try {
      await assignDelivery(id, courierId);
      load();
    } catch {
      /* silencieux — la ligne reste inchangée */
    }
  }

  return (
    <>
      <div className="mb-4">
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Toutes les courses</option>
          <option value="pending">À assigner</option>
          <option value="assigned">Assignées</option>
          <option value="accepted">Acceptées</option>
          <option value="completed">Livrées</option>
          <option value="expired">Expirées</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        <div className="hidden grid-cols-[130px_1fr_120px_130px_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Commande</span><span>Client</span><span>Zone</span><span>Statut</span><span>Livreur</span>
        </div>
        {loading && <p className="px-4 py-14 text-center text-sm text-slate-400">Chargement…</p>}
        {!loading && rows.map((d) => {
          const canAssign = d.status !== "completed" && d.status !== "cancelled";
          return (
            <div key={d.id} className="grid grid-cols-2 items-center gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 md:grid-cols-[130px_1fr_120px_130px_1fr]">
              <span className="font-mono text-xs font-semibold text-ink">{d.order_reference}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{d.customer_name}</p>
                <p className="text-xs text-slate-400">{d.phone}</p>
              </div>
              <span className="text-xs text-slate-500">{d.zone?.name ?? "—"}</span>
              <span className={`justify-self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${DELIVERY_STATUS_STYLES[d.status] ?? "bg-slate-100"}`}>
                {d.status_display}{d.is_overdue ? " ⚠️" : ""}
              </span>
              <div>
                {canAssign ? (
                  <select
                    value={d.courier?.id ?? ""}
                    onChange={(e) => e.target.value && assign(d.id, Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">{d.courier ? d.courier.name : "Assigner…"}</option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.is_available ? "" : " (indispo)"}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-slate-500">{d.courier?.name ?? "—"}</span>
                )}
              </div>
            </div>
          );
        })}
        {!loading && rows.length === 0 && (
          <p className="px-4 py-14 text-center text-sm text-slate-400">Aucune course.</p>
        )}
      </div>
    </>
  );
}

/* ------------------------------ Zones ------------------------------ */

function ZonesTab() {
  const [zones, setZones] = useState<AdminZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [nName, setNName] = useState("");
  const [nFee, setNFee] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setZones(await getZones());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addZone() {
    if (!nName.trim() || !nFee) return;
    setBusy(true);
    try {
      await createZone({ name: nName.trim(), fee: Number(nFee) });
      setNName(""); setNFee("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="text-xs font-semibold text-slate-400">Nouvelle zone</span>
          <input value={nName} onChange={(e) => setNName(e.target.value)} placeholder="Ex. Bonabéri"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </label>
        <label className="w-full sm:w-40">
          <span className="text-xs font-semibold text-slate-400">Tarif (FCFA)</span>
          <input value={nFee} onChange={(e) => setNFee(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="1500"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </label>
        <button onClick={addZone} disabled={busy || !nName.trim() || !nFee}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
          Ajouter
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        <div className="hidden grid-cols-[1fr_140px_120px_120px] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Zone</span><span>Tarif (FCFA)</span><span>Délai (min)</span><span>Active</span>
        </div>
        {loading && <p className="px-4 py-14 text-center text-sm text-slate-400">Chargement…</p>}
        {!loading && zones.map((z) => <ZoneRow key={z.id} zone={z} onSaved={load} />)}
      </div>
    </div>
  );
}

function ZoneRow({ zone, onSaved }: { zone: AdminZone; onSaved: () => void }) {
  const [fee, setFee] = useState(zone.fee);
  const [eta, setEta] = useState(String(zone.eta_minutes));
  const [busy, setBusy] = useState(false);

  useEffect(() => { setFee(zone.fee); setEta(String(zone.eta_minutes)); }, [zone.fee, zone.eta_minutes]);
  const dirty = fee !== zone.fee || eta !== String(zone.eta_minutes);

  async function save() {
    setBusy(true);
    try {
      await updateZone(zone.id, { fee: Number(fee), eta_minutes: Number(eta) });
      onSaved();
    } finally { setBusy(false); }
  }
  async function toggle() {
    setBusy(true);
    try {
      await updateZone(zone.id, { is_active: !zone.is_active });
      onSaved();
    } finally { setBusy(false); }
  }

  return (
    <div className="grid grid-cols-2 items-center gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 md:grid-cols-[1fr_140px_120px_120px]">
      <div>
        <p className="text-sm font-medium text-ink">{zone.name}</p>
        <p className="text-xs text-slate-400">{zone.city}</p>
      </div>
      <label className="flex items-center gap-1 md:block">
        <span className="text-xs text-slate-400 md:hidden">Tarif</span>
        <input value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none" />
      </label>
      <label className="flex items-center gap-1 md:block">
        <span className="text-xs text-slate-400 md:hidden">Délai</span>
        <input value={eta} onChange={(e) => setEta(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none" />
      </label>
      <div className="flex items-center gap-2">
        {dirty && (
          <button onClick={save} disabled={busy}
            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30">OK</button>
        )}
        <button onClick={toggle} disabled={busy}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${zone.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          {zone.is_active ? "● Active" : "○ Off"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Décaissements ------------------------------ */

function SettlementsTab() {
  const [rows, setRows] = useState<AdminSettlement[]>([]);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [statusF, setStatusF] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getSettlements({ status: statusF || undefined });
      setRows(d.results);
      setSummary(d.summary);
    } finally {
      setLoading(false);
    }
  }, [statusF]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function settle(id: number) {
    try {
      await settleSettlement(id);
      load();
    } catch {
      /* silencieux */
    }
  }

  return (
    <>
      {summary && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SumCard label="Les livreurs doivent à la plateforme" value={formatPrice(summary.owed_to_platform)} tone="amber" />
          <SumCard label="La plateforme doit aux livreurs" value={formatPrice(summary.owed_to_couriers)} tone="brand" />
          <SumCard label="Décaissements en attente" value={String(summary.pending_count)} tone="slate" />
        </div>
      )}

      <div className="mb-4">
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none">
          <option value="">Tous</option>
          <option value="pending">En attente</option>
          <option value="settled">Réglés</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        <div className="hidden grid-cols-[120px_1fr_140px_110px_120px] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Commande</span><span>Sens</span><span>Montant</span><span>Statut</span><span className="text-right">Action</span>
        </div>
        {loading && <p className="px-4 py-14 text-center text-sm text-slate-400">Chargement…</p>}
        {!loading && rows.map((s) => (
          <div key={s.id} className="grid grid-cols-2 items-center gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 md:grid-cols-[120px_1fr_140px_110px_120px]">
            <span className="font-mono text-xs font-semibold text-ink">{s.order_reference}</span>
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{s.direction_display}</p>
              <p className="text-xs text-slate-400">{s.courier} · {s.is_cod ? "cash livraison" : "payé en ligne"}</p>
            </div>
            <span className="font-display text-sm font-bold text-ink">{formatPrice(s.amount)}</span>
            <span className={`justify-self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.status === "settled" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {s.status_display}
            </span>
            <div className="col-span-2 flex justify-end md:col-span-1">
              {s.status === "pending" ? (
                <button onClick={() => settle(s.id)}
                  className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">
                  Marquer réglé
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  {s.settled_at ? new Date(s.settled_at).toLocaleDateString("fr-FR") : "✓"}
                </span>
              )}
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <p className="px-4 py-14 text-center text-sm text-slate-400">Aucun décaissement.</p>
        )}
      </div>
    </>
  );
}

function SumCard({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "amber" | "brand" }) {
  const tones: Record<string, string> = { slate: "text-ink", amber: "text-amber-600", brand: "text-brand-600" };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <p className={`font-display text-xl font-extrabold ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
