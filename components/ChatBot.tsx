"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Bonjour 👋 Je suis l'assistant Tchokos. Une question sur nos chaussures, la livraison ou le paiement ? Je vous aide !",
};

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "…" }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Oups, réessayez ou écrivez-nous sur WhatsApp 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Assistant Tchokos"
        className="chat-float fixed bottom-20 left-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 active:scale-90 md:bottom-5 md:left-5"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-6.4A8 8 0 1121 12z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>

      {/* Panneau */}
      <div
        className={`fixed bottom-36 left-4 z-40 flex w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 md:bottom-20 md:left-5 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center gap-3 bg-ink p-4 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-lg">🤖</span>
          <div>
            <p className="font-display text-sm font-bold">Assistant Tchokos</p>
            <p className="text-[11px] text-slate-300">Répond en quelques secondes</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3" style={{ minHeight: "16rem" }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <span
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "rounded-br-sm bg-brand-600 text-white"
                    : "rounded-bl-sm bg-slate-100 text-ink"
                }`}
              >
                {m.content}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <span className="rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-400">
                …
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Votre message…"
            className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
      </div>
    </>
  );
}
