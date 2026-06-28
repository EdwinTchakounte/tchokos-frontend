"use client";

import { useState } from "react";
import { postContact } from "@/lib/api";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await postContact(form);
      setSent(true);
    } catch {
      setError("Échec de l'envoi. Réessayez ou écrivez-nous sur WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 font-display text-lg font-bold text-ink">
          Message envoyé !
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Merci, l&apos;équipe Tchokos vous répond très vite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={form.name}
          onChange={update("name")}
          placeholder="Votre nom *"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          value={form.phone}
          onChange={update("phone")}
          placeholder="Téléphone"
          inputMode="tel"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <input
        type="email"
        value={form.email}
        onChange={update("email")}
        placeholder="Email"
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
      />
      <textarea
        required
        value={form.message}
        onChange={update("message")}
        placeholder="Votre message *"
        rows={5}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition"
      >
        {loading ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
