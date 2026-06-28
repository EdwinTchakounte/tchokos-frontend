"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getSession,
  getZones,
  registerCourier,
  requestOtp,
  verifyOtp,
  type CourierZone,
} from "@/lib/courier";

type Mode = "login" | "register";

export default function CourierAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  useEffect(() => {
    if (getSession()) router.replace("/livreur/courses");
  }, [router]);

  return (
    <div className="container-tchokos py-10">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card md:grid-cols-2">
        {/* Panneau marque */}
        <div className="relative hidden flex-col justify-between bg-ink p-8 text-white md:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="relative">
            <img src="/logo-tchokos.svg" alt="Tchokos" className="h-14 w-14" />
            <h2 className="mt-6 font-display text-3xl font-extrabold leading-tight">
              Devenez livreur Tchokos 🛵
            </h2>
            <p className="mt-3 text-slate-300">
              Recevez des courses dans vos quartiers, validez par code, suivez vos
              gains. Travaillez quand vous voulez.
            </p>
          </div>
          <ul className="relative mt-8 space-y-2 text-sm text-slate-300">
            <li>✅ Courses près de chez vous</li>
            <li>✅ Paiement à la livraison</li>
            <li>✅ Validation sécurisée par code</li>
          </ul>
        </div>

        {/* Formulaire */}
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full py-2 transition ${mode === "login" ? "bg-white text-ink shadow" : "text-slate-500"}`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full py-2 transition ${mode === "register" ? "bg-white text-ink shadow" : "text-slate-500"}`}
            >
              Inscription
            </button>
          </div>

          {mode === "login" ? <LoginForm /> : <RegisterForm onDone={() => setMode("login")} />}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await requestOtp(phone.trim());
      setDemo(res.demo_code);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), code.trim());
      router.replace("/livreur/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={verify} className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Code de vérification</h3>
          <p className="text-sm text-slate-500">
            Entrez le code à 6 chiffres envoyé au {phone}.
          </p>
        </div>
        {demo && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Démo (SMS simulé) : votre code est <b>{demo}</b>
          </p>
        )}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="• • • • • •"
          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-center text-2xl tracking-[0.4em] focus:border-brand-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Vérification…" : "Se connecter"}
        </button>
        <button
          type="button"
          onClick={() => { setStep("phone"); setCode(""); setError(null); }}
          className="w-full text-center text-sm text-slate-400 hover:text-slate-600"
        >
          ← Changer de numéro
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold text-ink">Connexion livreur</h3>
        <p className="text-sm text-slate-500">Recevez un code par SMS pour vous connecter.</p>
      </div>
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
        className="w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Envoi du code…" : "Recevoir mon code"}
      </button>
      <p className="text-center text-xs text-slate-400">
        Démo : <code className="rounded bg-slate-100 px-1">237670000003</code>
      </p>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [zones, setZones] = useState<CourierZone[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "Moto" });
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getZones().then(setZones).catch(() => setZones([]));
  }, []);

  function toggleZone(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerCourier({ ...form, zone_ids: selected });
      setDone(true);
      setTimeout(onDone, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
        <p className="text-3xl">🎉</p>
        <h3 className="mt-2 font-display text-lg font-bold text-ink">Compte créé !</h3>
        <p className="mt-1 text-sm text-slate-600">Connectez-vous avec votre numéro…</p>
      </div>
    );
  }

  const input = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";
  return (
    <form onSubmit={submit} className="space-y-3">
      <h3 className="font-display text-lg font-bold text-ink">Devenir livreur</h3>
      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom complet *" className={input} />
      <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone *" inputMode="tel" className={input} />
      <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className={input}>
        <option>Moto</option>
        <option>Tricycle</option>
        <option>Voiture</option>
        <option>À pied</option>
      </select>
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Zones couvertes</p>
        <div className="flex flex-wrap gap-2">
          {zones.map((z) => (
            <button
              type="button"
              key={z.id}
              onClick={() => toggleZone(z.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selected.includes(z.id) ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-soft hover:bg-slate-200"
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-ink-soft disabled:opacity-60">
        {loading ? "Création…" : "Créer mon compte livreur"}
      </button>
    </form>
  );
}
