"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  acceptDelivery,
  completeDelivery,
  fetchDeliveries,
  getSession,
  logout,
  type CourierDelivery,
} from "@/lib/courier";
import { formatPrice } from "@/lib/format";

export default function CourierDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const list = await fetchDeliveries();
      setDeliveries(list);
    } catch (err) {
      if (err instanceof Error && err.message === "unauthorized") {
        logout();
        router.replace("/livreur");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/livreur");
      return;
    }
    setName(s.courier.name);
    load();
  }, [router, load]);

  // Horloge pour le compte à rebours
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  function handleLogout() {
    logout();
    router.replace("/livreur");
  }

  const toAccept = deliveries.filter((d) => d.status === "assigned");
  const inProgress = deliveries.filter((d) => d.status === "accepted");
  const history = deliveries.filter((d) =>
    ["completed", "expired", "cancelled"].includes(d.status),
  );

  return (
    <div className="container-tchokos py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Espace livreur</p>
          <h1 className="font-display text-2xl font-extrabold text-ink">{name || "…"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Actualiser
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-slate-400">Chargement des courses…</p>
      ) : deliveries.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          Aucune course pour le moment. Revenez plus tard.
        </p>
      ) : (
        <div className="space-y-10">
          <Section title="À accepter" count={toAccept.length} accent="brand">
            {toAccept.map((d) => (
              <DeliveryCard key={d.id} d={d} now={now} onChange={load} mode="accept" />
            ))}
            {toAccept.length === 0 && <Empty>Aucune nouvelle course.</Empty>}
          </Section>

          <Section title="En cours" count={inProgress.length} accent="green">
            {inProgress.map((d) => (
              <DeliveryCard key={d.id} d={d} now={now} onChange={load} mode="complete" />
            ))}
            {inProgress.length === 0 && <Empty>Aucune course en cours.</Empty>}
          </Section>

          {history.length > 0 && (
            <Section title="Historique" count={history.length} accent="slate">
              {history.map((d) => (
                <DeliveryCard key={d.id} d={d} now={now} onChange={load} mode="history" />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent: "brand" | "green" | "slate";
  children: React.ReactNode;
}) {
  const dot =
    accent === "brand" ? "bg-brand-600" : accent === "green" ? "bg-cmr-green" : "bg-slate-400";
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {title}
        <span className="text-sm font-normal text-slate-400">({count})</span>
      </h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
      {children}
    </p>
  );
}

function countdown(deadlineIso: string | null, now: number): { label: string; danger: boolean } {
  if (!deadlineIso) return { label: "—", danger: false };
  const diff = Math.floor((new Date(deadlineIso).getTime() - now) / 1000);
  if (diff <= 0) return { label: "Délai dépassé", danger: true };
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return {
    label: h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, "0")}s`,
    danger: diff < 1800,
  };
}

function DeliveryCard({
  d,
  now,
  onChange,
  mode,
}: {
  d: CourierDelivery;
  now: number;
  onChange: () => void;
  mode: "accept" | "complete" | "history";
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cd = countdown(d.acceptance_deadline, now);

  async function handleAccept() {
    setBusy(true);
    setError(null);
    try {
      await acceptDelivery(d.id);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await completeDelivery(d.id, code.trim());
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Code invalide.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display font-bold text-ink">{d.order.reference}</p>
          <p className="text-sm text-slate-500">
            {d.order.customer_name} · {d.order.phone}
          </p>
        </div>
        {mode === "accept" && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              cd.danger ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"
            }`}
          >
            ⏱ {cd.label}
          </span>
        )}
        {mode === "history" && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {d.status_display}
          </span>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
        <p className="text-slate-600">
          📍 {d.zone?.name ?? "—"}
          {d.order.address ? ` · ${d.order.address}` : ""}
        </p>
        <ul className="mt-2 space-y-0.5 text-slate-600">
          {d.order.items.map((it, i) => (
            <li key={i}>
              {it.quantity} × {it.product_name}
              {it.size ? ` (taille ${it.size})` : ""}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-medium text-ink">
          <span>Total à encaisser</span>
          <span>{formatPrice(d.order.grand_total)}</span>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {mode === "accept" && (
        <button
          onClick={handleAccept}
          disabled={busy || cd.danger}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {busy ? "…" : "Accepter la course"}
        </button>
      )}

      {mode === "complete" && (
        <form onSubmit={handleComplete} className="mt-3 space-y-2">
          {d.code && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Code envoyé au client par SMS. <span className="opacity-70">(démo : {d.code})</span>
            </p>
          )}
          <p className="text-sm font-medium text-ink">
            Saisissez le code remis par le client :
          </p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="6 chiffres"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-center text-lg tracking-widest focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="shrink-0 rounded-lg bg-cmr-green px-4 font-semibold text-white hover:bg-cmr-green-dark disabled:opacity-60 transition"
            >
              Valider
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
