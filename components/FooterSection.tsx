"use client";

import { useState } from "react";

/**
 * Colonne de footer : repliable sur mobile (accordéon), toujours ouverte sur
 * desktop. Raccourcit le footer sur petits écrans.
 */
export function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-2 md:border-0 md:py-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-2 text-left md:pointer-events-none md:py-0"
      >
        <span className="font-semibold text-white">{title}</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform md:hidden ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`${open ? "block" : "hidden"} pb-2 md:mt-3 md:block md:pb-0`}>
        {children}
      </div>
    </div>
  );
}
