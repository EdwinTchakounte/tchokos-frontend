"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || undefined,
      });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="container-tchokos flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-card">
        <h1 className="font-display text-2xl font-extrabold text-ink">Créer un compte</h1>
        <p className="mt-1 text-sm text-slate-500">Suivez vos commandes et commandez plus vite.</p>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input required placeholder="Nom complet" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={input} />
          <input type="email" required placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
          <input type="tel" placeholder="Téléphone (optionnel)" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
          <input type="password" required placeholder="Mot de passe (8 caractères min.)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} />
          <button type="submit" disabled={busy}
            className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-brand-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
