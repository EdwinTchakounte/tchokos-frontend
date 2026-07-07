"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  setPrimaryImage,
  updateProduct,
  uploadProductImage,
  type VendorCategory,
  type VendorImage,
  type VendorProduct,
} from "@/lib/vendor";

const TARGETS = [
  { value: "unisexe", label: "Unisexe" },
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "enfant", label: "Enfant" },
];

const BADGES = [
  { value: "", label: "Aucun" },
  { value: "nouveau", label: "Nouveau" },
  { value: "promo", label: "Promo" },
  { value: "bestseller", label: "Meilleure vente" },
  { value: "made_in_cmr", label: "Made in Cameroun" },
];

const input =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400";

type Props = {
  open: boolean;
  product: VendorProduct | null; // null => création
  categories: VendorCategory[];
  onClose: () => void;
  onSaved: () => void;
};

export function ProductDrawer({ open, product, categories, onClose, onSaved }: Props) {
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(blank(categories));
  const [images, setImages] = useState<VendorImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [pendingFileName, setPendingFileName] = useState("");

  // (Ré)initialise le formulaire à chaque ouverture / changement de produit
  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        category_id: product.category_id,
        target: product.target || "unisexe",
        badge: product.badge || "",
        brand: product.brand || "",
        price: product.price || "",
        compare_at_price: product.compare_at_price || "",
        stock_quantity: String(product.stock_quantity ?? ""),
        sizes: product.sizes || "",
        description: product.description || "",
        is_active: product.is_active,
        is_featured: product.is_featured,
      });
      setImages(product.images || []);
    } else {
      setForm(blank(categories));
      setImages([]);
    }
    setError(null);
    setUrlInput("");
    setPendingFileName("");
  }, [open, product, categories]);

  // Verrou de défilement + masque les boutons flottants (chat/WhatsApp)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.body.classList.toggle("drawer-open", open);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("drawer-open");
    };
  }, [open]);

  function set<K extends keyof ReturnType<typeof blank>>(k: K, v: (ReturnType<typeof blank>)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setError(null);
    if (!form.name.trim()) return setError("Le nom du produit est obligatoire.");
    if (!form.price) return setError("Le prix est obligatoire.");
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        category_id: Number(form.category_id),
        target: form.target,
        badge: form.badge,
        brand: form.brand,
        price: Number(form.price),
        compare_at_price: form.compare_at_price === "" ? ("" as const) : Number(form.compare_at_price),
        stock_quantity: Number(form.stock_quantity || 0),
        sizes: form.sizes,
        description: form.description,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };
      if (isEdit && product) {
        await updateProduct(product.id, payload);
      } else {
        const created = await createProduct({
          name: payload.name,
          category_id: payload.category_id,
          price: payload.price,
          stock_quantity: payload.stock_quantity,
          target: payload.target,
          badge: payload.badge,
          brand: payload.brand,
          sizes: payload.sizes,
          compare_at_price: payload.compare_at_price,
          description: payload.description,
          is_featured: payload.is_featured,
        });
        // Première photo éventuelle saisie pendant la création
        if (urlInput.trim()) await uploadProductImage(created.id, { image_url: urlInput.trim() });
        const f = fileRef.current?.files?.[0];
        if (f) await uploadProductImage(created.id, { file: f });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!product) return;
    if (!confirm(`Supprimer définitivement « ${product.name} » ?`)) return;
    setBusy(true);
    try {
      await deleteProduct(product.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setBusy(false);
    }
  }

  // --- Gestion des photos (mode édition : actions immédiates) ---
  async function addFile(file: File) {
    if (!product) return;
    setImgBusy(true);
    setError(null);
    try {
      const img = await uploadProductImage(product.id, { file });
      setImages((arr) => [...arr, img]);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Téléversement impossible.");
    } finally {
      setImgBusy(false);
    }
  }

  async function addUrl() {
    if (!product || !urlInput.trim()) return;
    setImgBusy(true);
    setError(null);
    try {
      const img = await uploadProductImage(product.id, { image_url: urlInput.trim() });
      setImages((arr) => [...arr, img]);
      setUrlInput("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ajout impossible.");
    } finally {
      setImgBusy(false);
    }
  }

  async function makePrimary(id: number) {
    if (!product) return;
    setImgBusy(true);
    try {
      await setPrimaryImage(product.id, id);
      setImages((arr) => arr.map((i) => ({ ...i, is_primary: i.id === id })));
      onSaved();
    } finally {
      setImgBusy(false);
    }
  }

  async function dropImage(id: number) {
    if (!product) return;
    setImgBusy(true);
    try {
      await deleteProductImage(product.id, id);
      setImages((arr) => {
        const left = arr.filter((i) => i.id !== id);
        if (!left.some((i) => i.is_primary) && left[0]) left[0] = { ...left[0], is_primary: true };
        return left;
      });
      onSaved();
    } finally {
      setImgBusy(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[60] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Panneau */}
      <aside
        className={`absolute right-0 top-0 flex h-dvh w-full flex-col bg-white shadow-2xl transition-transform duration-300 sm:max-w-xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {isEdit ? "Modifier le produit" : "Nouveau produit"}
            </p>
            <h2 className="font-display text-lg font-bold text-ink">
              {isEdit ? product!.name : "Ajouter un article"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-5 py-5">
          {/* Photos */}
          <section>
            <p className={labelCls}>Photos du produit</p>
            {isEdit ? (
              <>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {img.url && (
                        <Image src={img.url} alt={img.alt || ""} fill sizes="120px" className="object-cover" />
                      )}
                      {img.is_primary && (
                        <span className="absolute left-1 top-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Principale
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-ink/70 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                        {!img.is_primary && (
                          <button
                            onClick={() => makePrimary(img.id)}
                            disabled={imgBusy}
                            title="Définir comme principale"
                            className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-ink hover:bg-white"
                          >
                            ★
                          </button>
                        )}
                        <button
                          onClick={() => dropImage(img.id)}
                          disabled={imgBusy}
                          title="Supprimer"
                          className="ml-auto rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={imgBusy}
                    className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-400 hover:text-brand-600"
                  >
                    <span className="text-center text-[11px] font-medium leading-tight">
                      {imgBusy ? "…" : "+ Photo"}
                    </span>
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) addFile(f);
                    e.target.value = "";
                  }}
                />
                <div className="mt-2 flex gap-2">
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="…ou coller une URL d'image"
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={addUrl}
                    disabled={imgBusy || !urlInput.trim()}
                    className="shrink-0 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Ajouter
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">📷</span>
                  {pendingFileName || "Choisir une photo (optionnel)"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPendingFileName(e.target.files?.[0]?.name || "")}
                />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="…ou coller une URL d'image"
                  className={`${input} mt-2`}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Vous pourrez ajouter d'autres photos après la création.
                </p>
              </>
            )}
          </section>

          {/* Champs */}
          <section className="space-y-4">
            <div>
              <label className={labelCls}>Nom du produit *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={input} />
            </div>

            <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
              <div>
                <label className={labelCls}>Catégorie</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set("category_id", Number(e.target.value))}
                  className={input}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Cible</label>
                <select value={form.target} onChange={(e) => set("target", e.target.value)} className={input}>
                  {TARGETS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
              <div>
                <label className={labelCls}>Prix (FCFA) *</label>
                <input
                  value={form.price}
                  onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className={input}
                />
              </div>
              <div>
                <label className={labelCls}>Prix barré (promo)</label>
                <input
                  value={form.compare_at_price}
                  onChange={(e) => set("compare_at_price", e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="optionnel"
                  className={input}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
              <div>
                <label className={labelCls}>Stock</label>
                <input
                  value={form.stock_quantity}
                  onChange={(e) => set("stock_quantity", e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className={input}
                />
              </div>
              <div>
                <label className={labelCls}>Badge</label>
                <select value={form.badge} onChange={(e) => set("badge", e.target.value)} className={input}>
                  {BADGES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
              <div>
                <label className={labelCls}>Marque</label>
                <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={input} placeholder="ex: Nike" />
              </div>
              <div>
                <label className={labelCls}>Tailles</label>
                <input value={form.sizes} onChange={(e) => set("sizes", e.target.value)} className={input} placeholder="ex: 40, 41, 42" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className={`${input} resize-none`}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Toggle label="En ligne" checked={form.is_active} onChange={(v) => set("is_active", v)} />
              <Toggle label="Mis en avant" checked={form.is_featured} onChange={(v) => set("is_featured", v)} />
            </div>
          </section>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Pied : actions */}
        <footer className="flex items-center gap-2 border-t border-slate-100 px-5 py-4">
          {isEdit && (
            <button
              onClick={remove}
              disabled={busy}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Supprimer
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm font-medium text-ink"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-cmr-green" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

function blank(categories: VendorCategory[]) {
  return {
    name: "",
    category_id: categories[0]?.id ?? 0,
    target: "unisexe",
    badge: "",
    brand: "",
    price: "",
    compare_at_price: "" as string,
    stock_quantity: "",
    sizes: "",
    description: "",
    is_active: true,
    is_featured: false,
  };
}
