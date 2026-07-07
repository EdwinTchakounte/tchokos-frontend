"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="container-tchokos flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-card">
        <h1 className="font-display text-2xl font-extrabold text-ink">Mot de passe oublié</h1>
        {sent ? (
          <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé. Vérifiez votre boîte mail.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">
              Entrez votre email : nous vous enverrons un lien de réinitialisation.
            </p>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input type="email" required placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={input} />
              <button type="submit" disabled={busy}
                className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {busy ? "Envoi…" : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/connexion" className="font-semibold text-brand-600 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
