"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vendorLogin, getSession } from "@/lib/vendor";

export default function VendorLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getSession()) router.replace("/vendeur/tableau-de-bord");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await vendorLogin(phone.trim());
      router.replace("/vendeur/tableau-de-bord");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-tchokos flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink text-2xl text-white">
            🏪
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">
            Espace vendeur
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez votre catalogue, vos stocks et vos prix.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border border-slate-100 p-6 shadow-card"
        >
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Numéro de téléphone"
            inputMode="tel"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-ink-soft disabled:opacity-60 transition"
          >
            {loading ? "Connexion…" : "Accéder à ma boutique"}
          </button>
          <p className="text-center text-xs text-slate-400">
            Démo : <code className="rounded bg-slate-100 px-1">237657945694</code> (Tchokos) ·{" "}
            <code className="rounded bg-slate-100 px-1">237680000001</code> (Mode Awa)
          </p>
        </form>
      </div>
    </div>
  );
}
