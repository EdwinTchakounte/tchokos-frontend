"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyOrders, type MyOrder } from "@/lib/account";
import { formatPrice } from "@/lib/format";

export default function ComptePage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Garde d'accès : on attend la lecture de session, puis on redirige si non connecté.
  useEffect(() => {
    if (ready && !user) router.replace("/connexion?next=/compte");
  }, [ready, user, router]);

  // Chargement des commandes une fois connecté.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    getMyOrders()
      .then((d) => alive && setOrders(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Erreur."));
    return () => {
      alive = false;
    };
  }, [user]);

  if (!ready || !user) {
    return <div className="container-tchokos py-20 text-center text-slate-400">Chargement…</div>;
  }

  return (
    <div className="container-tchokos py-8">
      {/* En-tête compte */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl font-extrabold text-brand-600">
            {(user.full_name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold text-ink">
              {user.full_name || "Mon compte"}
            </h1>
            <p className="text-sm text-slate-500">
              {user.email}
              {user.phone ? ` · ${user.phone}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-slate-50"
        >
          Se déconnecter
        </button>
      </div>

      {/* Mes commandes */}
      <h2 className="mt-8 font-display text-2xl font-extrabold text-ink">Mes commandes</h2>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {orders === null && !error && (
        <div className="mt-4 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      )}

      {orders !== null && orders.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-slate-500">Vous n&apos;avez pas encore de commande.</p>
          <Link
            href="/boutique"
            className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            Découvrir la boutique
          </Link>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {orders?.map((o) => (
          <OrderCard key={o.reference} order={o} />
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Carte commande ----------------------- */

const ORDER_BADGE: Record<string, string> = {
  new: "bg-slate-100 text-slate-600",
  contacted: "bg-blue-100 text-blue-700",
  confirmed: "bg-amber-100 text-amber-700",
  paid: "bg-violet-100 text-violet-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

function OrderCard({ order }: { order: MyOrder }) {
  const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display font-extrabold text-ink">Commande {order.reference}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            ORDER_BADGE[order.status] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {order.status_display}
        </span>
      </div>

      {/* Articles */}
      <ul className="mt-3 divide-y divide-slate-50 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-center justify-between py-1.5">
            <span className="text-ink-soft">
              {it.quantity} × {it.product_name}
              {it.size ? <span className="text-slate-400"> · {it.size}</span> : null}
            </span>
            <span className="font-medium text-ink">{formatPrice(it.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-500">Total</span>
        <span className="font-display text-lg font-bold text-ink">
          {formatPrice(order.grand_total)}
        </span>
      </div>

      {/* Suivi colis Sendo */}
      <ParcelTracking order={order} />
    </div>
  );
}

/* ----------------------- Suivi colis (Sendo) ----------------------- */

const SENDO_STEPS = [
  { keys: ["created", "assigned"], label: "Préparé" },
  { keys: ["accepted", "picked_up"], label: "Pris en charge" },
  { keys: ["in_transit"], label: "En route" },
  { keys: ["delivered"], label: "Livré" },
];

function sendoStepIndex(status: string): number {
  const i = SENDO_STEPS.findIndex((s) => s.keys.includes(status));
  return i; // -1 si inconnu
}

function ParcelTracking({ order }: { order: MyOrder }) {
  if (!order.sendo_status && !order.tracking_url) return null;

  const problem = ["failed", "cancelled", "expired"].includes(order.sendo_status);
  const current = sendoStepIndex(order.sendo_status);

  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">🚚 Suivi du colis</p>
        {order.tracking_url && (
          <a
            href={order.tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Suivre en détail →
          </a>
        )}
      </div>

      {problem ? (
        <p className="mt-2 text-sm font-medium text-red-600">
          Livraison {order.sendo_status === "cancelled" ? "annulée" : "en échec"} — contactez-nous
          sur WhatsApp.
        </p>
      ) : current >= 0 ? (
        <div className="mt-3 flex items-center gap-1">
          {SENDO_STEPS.map((s, i) => (
            <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center">
                <span
                  className={`h-2 w-2 rounded-full ${i <= current ? "bg-brand-600" : "bg-slate-300"}`}
                />
                {i < SENDO_STEPS.length - 1 && (
                  <span className={`h-0.5 flex-1 ${i < current ? "bg-brand-600" : "bg-slate-200"}`} />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  i <= current ? "text-brand-700" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Colis enregistré, suivi bientôt disponible.</p>
      )}
    </div>
  );
}
