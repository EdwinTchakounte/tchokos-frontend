"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pager } from "@/components/admin/Pager";
import { IconNote, IconWhatsApp, IconMail, IconX, IconCheck } from "@/components/admin/icons";
import { formatPrice } from "@/lib/format";
import {
  getOrders,
  getSalesStats,
  getOrderDetail,
  updateOrderStatus,
  contactCustomer,
  type AdminOrderRow,
  type AdminOrderDetail,
  type SalesStats,
} from "@/lib/admin-orders";

const ORDER_STATUS_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-600",
  contacted: "bg-sky-100 text-sky-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  paid: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const PAY_STYLES: Record<string, string> = {
  valide: "bg-green-100 text-green-700",
  en_attente: "bg-amber-100 text-amber-700",
  rejete: "bg-red-100 text-red-600",
};

const PAGE_SIZE = 25;

function PayBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-slate-300">—</span>;
  const label = status === "valide" ? "Payé" : status === "en_attente" ? "En attente" : "Rejeté";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PAY_STYLES[status] ?? "bg-slate-100 text-slate-500"}`}>
      {label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminOrderRow[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        getOrders({ q: q || undefined, status: statusF || undefined, limit: PAGE_SIZE, offset }),
        getSalesStats(),
      ]);
      setRows(ordersRes.results);
      setCount(ordersRes.count);
      setStats(statsRes);
    } catch (err) {
      if (err instanceof Error && (err.message === "unauthorized" || err.message === "forbidden")) {
        router.replace("/connexion?next=/admin/commandes");
      }
    } finally {
      setLoading(false);
    }
  }, [q, statusF, offset, router]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Commandes & ventes</h1>
        <p className="text-sm text-slate-500">Suivez les commandes, les paiements et le chiffre d’affaires encaissé.</p>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard label="CA encaissé" value={`${formatPrice(stats.revenue_collected)}`} tone="green" />
          <StatCard label="Commandes" value={String(stats.total_orders)} tone="brand" />
          <StatCard label="Payées" value={String(stats.paid_orders)} tone="green" />
          <StatCard label="Paiements en attente" value={String(stats.payments_en_attente)} tone="amber" />
          <StatCard label="Panier moyen" value={formatPrice(stats.avg_basket)} />
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOffset(0); }}
          placeholder="Rechercher (réf, nom, téléphone)…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <select
          value={statusF}
          onChange={(e) => { setStatusF(e.target.value); setOffset(0); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="new">Nouvelle</option>
          <option value="contacted">Client contacté</option>
          <option value="confirmed">Confirmée</option>
          <option value="paid">Payée</option>
          <option value="delivered">Livrée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        <div className="hidden grid-cols-[130px_1fr_110px_120px_110px_120px] gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Référence</span><span>Client</span><span>Total</span><span>Paiement</span><span>Statut</span>
          <span className="text-right">Action</span>
        </div>
        {loading && <p className="px-4 py-14 text-center text-sm text-slate-400">Chargement…</p>}
        {!loading && rows.map((o) => (
          <div key={o.id} onClick={() => setOpenId(o.id)} className="grid cursor-pointer grid-cols-2 items-center gap-2 border-t border-slate-100 px-4 py-3.5 transition first:border-t-0 hover:bg-slate-50/70 md:grid-cols-[130px_1fr_110px_120px_110px_120px]">
            <span className="font-mono text-xs font-semibold text-ink">{o.reference}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{o.customer_name}</p>
              <p className="text-xs text-slate-400">{o.phone} · {o.channel_display}</p>
            </div>
            <span className="text-sm font-semibold text-ink">{formatPrice(o.grand_total)}</span>
            <span><PayBadge status={o.payment_status} /></span>
            <span className={`justify-self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_STYLES[o.status] ?? "bg-slate-100"}`}>
              {o.status_display}
            </span>
            <div className="col-span-2 flex justify-end md:col-span-1">
              <button
                onClick={() => setOpenId(o.id)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Détail
              </button>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <p className="px-4 py-14 text-center text-sm text-slate-400">Aucune commande.</p>
        )}
      </div>

      <Pager
        offset={offset}
        pageSize={PAGE_SIZE}
        shown={rows.length}
        count={count}
        onPrev={() => setOffset((o) => Math.max(o - PAGE_SIZE, 0))}
        onNext={() => setOffset((o) => o + PAGE_SIZE)}
      />

      {openId != null && (
        <OrderDrawer id={openId} onClose={() => setOpenId(null)} onSaved={load} />
      )}
    </>
  );
}

function StatCard({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "green" | "amber" | "brand" }) {
  const tones: Record<string, string> = {
    slate: "text-ink", green: "text-cmr-green", amber: "text-amber-600", brand: "text-brand-600",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:shadow-md">
      <p className={`font-display text-xl font-extrabold sm:text-2xl ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function OrderDrawer({ id, onClose, onSaved }: { id: number; onClose: () => void; onSaved: () => void }) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [statusVal, setStatusVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getOrderDetail(id).then((o) => {
      setOrder(o);
      setStatusVal(o.status);
    }).catch(() => setNotice("Chargement impossible."));
  }, [id]);

  async function saveStatus() {
    if (!order || statusVal === order.status) return;
    setBusy(true);
    try {
      const updated = await updateOrderStatus(order.id, { status: statusVal });
      setOrder(updated);
      setNotice("Statut mis à jour.");
      onSaved();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  async function sendContact() {
    if (!order || !msg.trim()) return;
    setBusy(true);
    try {
      const r = await contactCustomer(order.id, { message: msg });
      setNotice(`Email envoyé à ${r.sent_to}.`);
      setMsg("");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">
            {order ? order.reference : "…"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><IconX className="h-4 w-4" /></button>
        </div>

        {!order ? (
          <p className="mt-8 text-center text-sm text-slate-400">Chargement…</p>
        ) : (
          <div className="mt-4 space-y-5 text-sm">
            <section>
              <p className="font-semibold text-ink">{order.customer_name}</p>
              <p className="text-slate-500">{order.phone}{order.email ? ` · ${order.email}` : ""}</p>
              {(order.city || order.address) && (
                <p className="text-slate-500">{[order.city, order.address].filter(Boolean).join(" · ")}</p>
              )}
              {order.note && <p className="mt-1 flex items-start gap-1.5 rounded-lg bg-slate-50 p-2 text-xs text-slate-500"><IconNote className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {order.note}</p>}
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Articles</p>
              <ul className="space-y-1.5">
                {order.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-slate-600">
                      {it.quantity} × {it.product_name}{it.size ? ` (${it.size})` : ""}
                    </span>
                    <span className="font-medium text-ink">{formatPrice(it.line_total)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
                <Row label="Sous-total" value={formatPrice(order.total)} />
                <Row label="Livraison" value={formatPrice(order.delivery_fee)} />
                <div className="flex justify-between font-semibold text-ink">
                  <span>Total</span><span>{formatPrice(order.grand_total)}</span>
                </div>
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Paiements</p>
              {order.payments.length === 0 ? (
                <p className="text-slate-400">Aucun paiement enregistré.</p>
              ) : (
                <ul className="space-y-1.5">
                  {order.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
                      <div>
                        <p className="font-medium text-ink">{formatPrice(p.montant)}</p>
                        <p className="text-[11px] text-slate-400">{p.provider_code || p.source} · {p.reference_externe || "—"}</p>
                      </div>
                      <PayBadge status={p.statut} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {order.delivery && (
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Livraison</p>
                <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Statut</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink">{order.delivery.status_display}</span>
                  </div>
                  {order.delivery.zone && (
                    <div className="flex justify-between"><span className="text-slate-500">Zone</span><span className="font-medium text-ink">{order.delivery.zone}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-slate-500">Livreur</span><span className="font-medium text-ink">{order.delivery.courier || "Non assigné"}</span></div>
                  {order.delivery.code_sent && <p className="flex items-center gap-1 text-[11px] text-cmr-green"><IconCheck className="h-3.5 w-3.5 shrink-0" /> Code de livraison envoyé au client</p>}
                </div>
              </section>
            )}

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Statut de la commande</p>
              <div className="flex gap-2">
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  {order.status_choices.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <button
                  onClick={saveStatus}
                  disabled={busy || statusVal === order.status}
                  className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white disabled:opacity-30"
                >
                  Enregistrer
                </button>
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Contacter le client</p>
              {order.whatsapp_link && (
                <a
                  href={order.whatsapp_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cmr-green px-3 py-2 text-sm font-semibold text-white hover:bg-cmr-green-dark"
                >
                  <IconWhatsApp className="h-4 w-4" /> Écrire sur WhatsApp
                </a>
              )}
              {order.email ? (
                <>
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    rows={3}
                    placeholder="Message email au client…"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    onClick={sendContact}
                    disabled={busy || !msg.trim()}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <IconMail className="h-4 w-4" /> Envoyer l’email
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400">Pas d’email au dossier — utilisez WhatsApp.</p>
              )}
            </section>

            {notice && <p className="text-center text-xs font-medium text-brand-600">{notice}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-500">
      <span>{label}</span><span className="text-ink">{value}</span>
    </div>
  );
}
