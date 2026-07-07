"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  acceptDelivery,
  completeDelivery,
  fetchDashboard,
  setAvailability,
  type CourierDelivery,
  type CourierDashboard,
} from "@/lib/courier";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";

export default function CourierDashboardPage() {
  const router = useRouter();
  const { ready, isCourier, logout } = useAuth();
  const [data, setData] = useState<CourierDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [available, setAvailable] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await fetchDashboard();
      setData(d);
      setAvailable(d.profile.is_available);
    } catch (err) {
      if (err instanceof Error && (err.message === "unauthorized" || err.message === "forbidden")) {
        router.replace("/connexion?next=/livreur/courses");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    if (!isCourier) {
      router.replace("/connexion?next=/livreur/courses");
      return;
    }
    load();
  }, [ready, isCourier, router, load]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function toggleAvailable() {
    const next = !available;
    setAvailable(next);
    await setAvailability(next).catch(() => setAvailable(!next));
  }

  async function handleLogout() {
    await logout();
    router.replace("/connexion");
  }

  if (!ready || loading) {
    return <div className="container-tchokos py-20 text-center text-slate-400">Chargement…</div>;
  }
  if (!data) return null;

  const { profile, stats, deliveries } = data;
  const toAccept = deliveries.filter((d) => d.status === "assigned");
  const inProgress = deliveries.filter((d) => d.status === "accepted");
  const history = deliveries.filter((d) => ["completed", "expired", "cancelled"].includes(d.status));

  return (
    <div className="container-tchokos py-8">
      {/* En-tête profil */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink p-5 text-white sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-2xl">🛵</span>
          <div>
            <p className="text-sm text-slate-300">Bonjour</p>
            <h1 className="font-display text-2xl font-extrabold">{profile.name}</h1>
            <p className="text-xs text-slate-400">{profile.vehicle} · {profile.zones.join(", ") || "Aucune zone"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAvailable}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              available ? "bg-cmr-green text-white" : "bg-white/10 text-slate-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${available ? "bg-white" : "bg-slate-400"}`} />
            {available ? "Disponible" : "Indisponible"}
          </button>
          <button onClick={handleLogout} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/20">
            Quitter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Gains (livrés)" value={`${formatPrice(stats.earnings)}`} tone="green" big />
        <Stat label="À accepter" value={stats.assigned} tone="brand" />
        <Stat label="En cours" value={stats.in_progress} />
        <Stat label="Livrées" value={stats.completed} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-ink">Mes courses</h2>
        <button onClick={load} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Actualiser
        </button>
      </div>

      {deliveries.length === 0 ? (
        <p className="py-16 text-center text-slate-400">Aucune course pour le moment.</p>
      ) : (
        <div className="mt-4 space-y-10">
          <Section title="À accepter" count={toAccept.length} accent="brand">
            {toAccept.map((d) => <DeliveryCard key={d.id} d={d} now={now} onChange={load} mode="accept" />)}
            {toAccept.length === 0 && <Empty>Aucune nouvelle course.</Empty>}
          </Section>
          <Section title="En cours" count={inProgress.length} accent="green">
            {inProgress.map((d) => <DeliveryCard key={d.id} d={d} now={now} onChange={load} mode="complete" />)}
            {inProgress.length === 0 && <Empty>Aucune course en cours.</Empty>}
          </Section>
          {history.length > 0 && (
            <Section title="Historique" count={history.length} accent="slate">
              {history.map((d) => <DeliveryCard key={d.id} d={d} now={now} onChange={load} mode="history" />)}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "slate", big }: { label: string; value: string | number; tone?: "slate" | "green" | "brand"; big?: boolean }) {
  const tones: Record<string, string> = { slate: "text-ink", green: "text-cmr-green", brand: "text-brand-600" };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <p className={`font-display font-extrabold ${tones[tone]} ${big ? "text-xl" : "text-2xl"}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Section({ title, count, accent, children }: { title: string; count: number; accent: "brand" | "green" | "slate"; children: React.ReactNode }) {
  const dot = accent === "brand" ? "bg-brand-600" : accent === "green" ? "bg-cmr-green" : "bg-slate-400";
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {title}
        <span className="text-sm font-normal text-slate-400">({count})</span>
      </h3>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">{children}</p>;
}

function countdown(deadlineIso: string | null, now: number): { label: string; danger: boolean } {
  if (!deadlineIso) return { label: "—", danger: false };
  const diff = Math.floor((new Date(deadlineIso).getTime() - now) / 1000);
  if (diff <= 0) return { label: "Délai dépassé", danger: true };
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return { label: h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, "0")}s`, danger: diff < 1800 };
}

function DeliveryCard({ d, now, onChange, mode }: { d: CourierDelivery; now: number; onChange: () => void; mode: "accept" | "complete" | "history" }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cd = countdown(d.acceptance_deadline, now);

  async function handleAccept() {
    setBusy(true); setError(null);
    try { await acceptDelivery(d.id); onChange(); }
    catch (e) { setError(e instanceof Error ? e.message : "Erreur."); }
    finally { setBusy(false); }
  }
  async function handleComplete(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    try { await completeDelivery(d.id, code.trim()); onChange(); }
    catch (e) { setError(e instanceof Error ? e.message : "Code invalide."); }
    finally { setBusy(false); }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display font-bold text-ink">{d.order.reference}</p>
          <p className="text-sm text-slate-500">{d.order.customer_name} · {d.order.phone}</p>
        </div>
        {mode === "accept" && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cd.danger ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"}`}>
            ⏱ {cd.label}
          </span>
        )}
        {mode === "history" && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{d.status_display}</span>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
        <p className="text-slate-600">📍 {d.zone?.name ?? "—"}{d.order.address ? ` · ${d.order.address}` : ""}</p>
        <ul className="mt-2 space-y-0.5 text-slate-600">
          {d.order.items.map((it, i) => (
            <li key={i}>{it.quantity} × {it.product_name}{it.size ? ` (taille ${it.size})` : ""}</li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-medium text-ink">
          <span>Total à encaisser</span>
          <span>{formatPrice(d.order.grand_total)}</span>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {mode === "accept" && (
        <button onClick={handleAccept} disabled={busy || cd.danger} className="mt-3 w-full rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? "…" : "Accepter la course"}
        </button>
      )}
      {mode === "complete" && (
        <form onSubmit={handleComplete} className="mt-3 space-y-2">
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
            Le code a été envoyé au client. Demandez-le lui à la réception du colis.
          </p>
          <p className="text-sm font-medium text-ink">Saisissez le code remis par le client :</p>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6 chiffres" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-center text-lg tracking-widest focus:border-brand-500 focus:outline-none" />
            <button type="submit" disabled={busy || code.length < 6} className="shrink-0 rounded-lg bg-cmr-green px-4 font-semibold text-white hover:bg-cmr-green-dark disabled:opacity-60">Valider</button>
          </div>
        </form>
      )}
    </div>
  );
}
