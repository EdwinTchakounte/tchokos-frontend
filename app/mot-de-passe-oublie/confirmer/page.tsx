"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { confirmPasswordReset } from "@/lib/auth";

function ConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidLink = !uid || !token;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    try {
      await confirmPasswordReset(uid, token, password);
      setDone(true);
      setTimeout(() => router.replace("/connexion"), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lien invalide ou expiré.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="container-tchokos flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-card">
        <h1 className="font-display text-2xl font-extrabold text-ink">Nouveau mot de passe</h1>

        {invalidLink ? (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Lien invalide. Refaites une demande de réinitialisation.
          </p>
        ) : done ? (
          <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            Mot de passe réinitialisé ✓ Redirection vers la connexion…
          </p>
        ) : (
          <>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input type="password" required placeholder="Nouveau mot de passe" value={password}
                onChange={(e) => setPassword(e.target.value)} className={input} />
              <input type="password" required placeholder="Confirmer le mot de passe" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className={input} />
              <button type="submit" disabled={busy}
                className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {busy ? "…" : "Réinitialiser"}
              </button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/connexion" className="font-semibold text-brand-600 hover:underline">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmResetPage() {
  return (
    <Suspense fallback={<div className="container-tchokos py-20 text-center text-slate-400">Chargement…</div>}>
      <ConfirmInner />
    </Suspense>
  );
}
