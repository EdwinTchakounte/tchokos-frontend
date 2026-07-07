"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import {
  getSiteConfig,
  getDeliveryZones,
  postOrder,
  getPaymentStatus,
  devConfirmPayment,
} from "@/lib/api";
import { formatPrice, whatsappLink } from "@/lib/format";
import { DeliveryZonePicker } from "@/components/DeliveryZonePicker";
import type { SiteConfig, DeliveryZone } from "@/lib/types";

type PayState = {
  reference: string;
  status: "en_attente" | "valide" | "rejete";
  isStub: boolean;
  phone: string;
};

export default function CartPage() {
  const { items, ready, subtotal, count, setQuantity, removeItem, clear } = useCart();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zonesStatus, setZonesStatus] = useState<"loading" | "ready" | "error">("loading");
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pay, setPay] = useState<PayState | null>(null);

  function loadZones() {
    setZonesStatus("loading");
    getDeliveryZones()
      .then((z) => {
        setZones(z);
        setZonesStatus("ready");
      })
      .catch(() => {
        setZones([]);
        setZonesStatus("error");
      });
  }

  useEffect(() => {
    getSiteConfig().then(setConfig).catch(() => setConfig(null));
    loadZones();
  }, []);

  // Polling du statut de paiement Tara tant qu'on est « en attente ».
  useEffect(() => {
    if (!pay || pay.status !== "en_attente") return;
    const timer = setInterval(async () => {
      try {
        const s = await getPaymentStatus(pay.reference);
        if (s.statut !== "en_attente") {
          if (s.statut === "valide") clear();
          setPay((p) => (p ? { ...p, status: s.statut } : p));
        }
      } catch {
        /* on retente au prochain tick */
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [pay, clear]);

  const selectedZone = zones.find((z) => z.id === zoneId) ?? null;
  const deliveryFee = selectedZone ? Number(selectedZone.fee) : 0;
  const grandTotal = subtotal + deliveryFee;

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await postOrder({
        customer_name: form.name,
        phone: form.phone,
        note: form.note,
        zone_id: zoneId,
        items: items.map((it) => ({ product_id: it.id, quantity: it.quantity, size: it.size })),
      });
      // On ne vide le panier qu'une fois la redirection WhatsApp garantie,
      // pour ne pas le perdre si le lien est absent (on retombe alors sur le
      // repli ci-dessous avec le panier intact).
      if (res.whatsapp_link) {
        clear();
        window.location.href = res.whatsapp_link;
        return;
      }
      throw new Error("no link");
    } catch {
      if (config?.whatsapp_number) {
        const lines = items
          .map((it) => `• ${it.quantity} × ${it.name}${it.size ? ` (taille ${it.size})` : ""} — ${formatPrice(it.price * it.quantity)}`)
          .join("\n");
        const deliveryTxt = selectedZone
          ? `\nLivraison (${selectedZone.name}) : ${formatPrice(deliveryFee)}\nTotal à payer : ${formatPrice(grandTotal)}`
          : "";
        const msg =
          `Bonjour Tchokos 👋\nJe souhaite commander :\n${lines}\n\n` +
          `Sous-total : ${formatPrice(subtotal)}${deliveryTxt}\nNom : ${form.name}` +
          (selectedZone ? `\nZone : ${selectedZone.name}` : "");
        clear();
        window.location.href = whatsappLink(config.whatsapp_number, msg);
        return;
      }
      setError("Commande impossible pour le moment. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  // Paiement Mobile Money (Tara) DIRECT, sans livraison.
  async function handlePayNow() {
    setError(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Renseignez votre nom et téléphone pour payer.");
      return;
    }
    setLoading(true);
    try {
      const res = await postOrder({
        customer_name: form.name,
        phone: form.phone,
        note: form.note,
        with_delivery: false,
        items: items.map((it) => ({ product_id: it.id, quantity: it.quantity, size: it.size })),
      });
      // Wave (Sénégal/CI) renvoie une page hébergée → redirection. Au Cameroun
      // (MTN/Orange), Tara pousse un STK Push sur le téléphone : pas d'URL, on
      // suit le statut par polling.
      if (res.payment_url) {
        clear();
        window.location.href = res.payment_url;
        return;
      }
      // On garde le panier tant que le paiement n'est pas confirmé : en cas
      // d'échec/annulation, le client le retrouve intact pour réessayer.
      setPay({
        reference: res.reference,
        status: res.payment_status ?? "en_attente",
        isStub: res.payment_is_stub,
        phone: form.phone,
      });
    } catch {
      setError("Paiement indisponible pour le moment. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDevConfirm() {
    if (!pay) return;
    try {
      const s = await devConfirmPayment(pay.reference);
      if (s.statut === "valide") clear();
      setPay((p) => (p ? { ...p, status: s.statut } : p));
    } catch {
      setError("Simulation impossible.");
    }
  }

  if (!ready) {
    return <div className="container-tchokos py-20 text-center text-slate-400">Chargement…</div>;
  }

  // Tunnel de paiement Mobile Money en cours / terminé.
  if (pay) {
    return (
      <PaymentPanel
        pay={pay}
        onDevConfirm={handleDevConfirm}
        onRetry={() => {
          setPay(null);
          setError(null);
        }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-tchokos py-16 text-center sm:py-24">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-50 text-4xl">🛒</span>
        <h1 className="mt-5 font-display text-xl font-extrabold text-ink sm:text-2xl">
          Votre panier est vide
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Parcourez le catalogue et ajoutez vos chaussures et vêtements préférés.
        </p>
        <Link
          href="/boutique"
          className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Découvrir la boutique →
        </Link>
      </div>
    );
  }

  return (
    <div className="container-tchokos py-8 sm:py-10">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Mon panier</h1>
        <span className="text-sm text-slate-500">{count} article{count > 1 ? "s" : ""}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Lignes */}
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={`${it.id}-${it.size}`}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-card sm:gap-4"
            >
              <Link href={`/produit/${it.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                {it.image && <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/produit/${it.slug}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-brand-700">
                    {it.name}
                  </Link>
                  <button
                    onClick={() => removeItem(it.id, it.size)}
                    aria-label="Retirer"
                    className="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M9 7V5h6v2m-7 0l1 13h6l1-13" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {it.size && (
                  <span className="mt-1 inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                    Taille {it.size}
                  </span>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-full border border-slate-200">
                    <button onClick={() => setQuantity(it.id, it.size, it.quantity - 1)} className="grid h-8 w-8 place-items-center text-lg" aria-label="Diminuer">−</button>
                    <span className="w-7 text-center text-sm font-semibold">{it.quantity}</span>
                    <button onClick={() => setQuantity(it.id, it.size, it.quantity + 1)} className="grid h-8 w-8 place-items-center text-lg" aria-label="Augmenter">+</button>
                  </div>
                  <span className="font-display text-base font-bold text-ink">{formatPrice(it.price * it.quantity)}</span>
                </div>
              </div>
            </li>
          ))}

          <button onClick={clear} className="text-xs text-slate-400 hover:text-red-600">Vider le panier</button>
        </ul>

        {/* Récap + checkout */}
        <form
          onSubmit={handleCheckout}
          className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-28"
        >
          <h2 className="font-display text-lg font-bold text-ink">Finaliser la commande</h2>

          <div className="mt-4 space-y-2.5">
            <input required value={form.name} onChange={update("name")} placeholder="Votre nom *"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            <input required value={form.phone} onChange={update("phone")} placeholder="Téléphone *" inputMode="tel"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            <DeliveryZonePicker
              zones={zones}
              value={zoneId}
              onChange={setZoneId}
              status={zonesStatus}
              onRetry={loadZones}
            />
            <textarea value={form.note} onChange={update("note")} placeholder="Note / adresse précise (optionnel)" rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Sous-total</span>
              <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Livraison{selectedZone ? ` · ${selectedZone.name}` : ""}</span>
              <span className={selectedZone ? "font-medium text-ink" : "text-xs italic text-slate-400"}>
                {selectedZone ? formatPrice(deliveryFee) : "à sélectionner"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="font-semibold text-ink">Total à payer</span>
              <span className="font-display text-xl font-extrabold text-brand-700">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cmr-green px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-cmr-green-dark disabled:opacity-60">
            {loading ? "Préparation…" : "Commander sur WhatsApp"}
          </button>

          {/* Paiement direct Mobile Money (Tara), sans livraison */}
          <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-wide text-slate-300">
            <span className="h-px flex-1 bg-slate-100" /> ou <span className="h-px flex-1 bg-slate-100" />
          </div>
          <button type="button" onClick={handlePayNow} disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-600 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60">
            📱 Payer maintenant (Mobile Money)
          </button>
          <p className="mt-1.5 text-center text-[11px] text-slate-400">
            Paiement immédiat via Tara · sans livraison (retrait)
          </p>

          {/* Réassurance */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
            <Reassure icon="🛵" label="Livraison Douala" />
            <Reassure icon="📱" label="Mobile Money" />
            <Reassure icon="✅" label="Sans compte" />
          </div>
        </form>
      </div>
    </div>
  );
}

function Reassure({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] leading-tight text-slate-500">{label}</span>
    </div>
  );
}

/** Suivi du paiement Mobile Money : attente STK Push → payé / échec. */
function PaymentPanel({
  pay,
  onDevConfirm,
  onRetry,
}: {
  pay: PayState;
  onDevConfirm: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="container-tchokos py-12 sm:py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-card">
        {pay.status === "en_attente" && (
          <>
            <div className="relative mx-auto grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
              <span className="text-3xl">📱</span>
            </div>
            <h1 className="mt-5 font-display text-xl font-extrabold text-ink">
              Validez le paiement sur votre téléphone
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Un code de paiement Mobile Money (MTN MoMo / Orange Money) a été
              envoyé au <span className="font-semibold text-ink">{pay.phone}</span>.
              Saisissez votre code secret pour confirmer. Cette page se met à jour
              automatiquement.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Commande <span className="font-mono font-semibold">{pay.reference}</span>
            </p>
            {pay.isStub && (
              <div className="mt-5 rounded-xl bg-amber-50 p-4 text-left">
                <p className="text-xs font-semibold text-amber-700">
                  Mode démonstration — Tara n’est pas encore configuré (clés
                  API absentes).
                </p>
                <button
                  onClick={onDevConfirm}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Simuler la confirmation (dev)
                </button>
              </div>
            )}
          </>
        )}

        {pay.status === "valide" && (
          <>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100 text-4xl">
              ✅
            </span>
            <h1 className="mt-5 font-display text-xl font-extrabold text-ink">
              Paiement reçu — merci !
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Votre commande{" "}
              <span className="font-mono font-semibold">{pay.reference}</span> est
              confirmée et payée. Nous préparons votre colis.
            </p>
            <div className="mt-5 rounded-xl bg-brand-50 p-4 text-left text-sm text-ink-soft">
              <p className="font-semibold text-brand-700">Suivre votre commande</p>
              <p className="mt-1 text-xs">
                Créez votre espace client pour suivre votre colis et retrouver vos
                commandes à tout moment.
              </p>
              <Link
                href="/inscription"
                className="mt-3 inline-flex rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                Créer mon espace client →
              </Link>
            </div>
            <Link
              href="/boutique"
              className="mt-4 inline-flex text-sm font-medium text-slate-500 hover:text-brand-600"
            >
              Continuer mes achats
            </Link>
          </>
        )}

        {pay.status === "rejete" && (
          <>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-100 text-4xl">
              ❌
            </span>
            <h1 className="mt-5 font-display text-xl font-extrabold text-ink">
              Paiement non abouti
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Le paiement a été annulé ou a échoué. Aucun montant n’a été débité.
              Vous pouvez réessayer.
            </p>
            <button
              onClick={onRetry}
              className="mt-5 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
