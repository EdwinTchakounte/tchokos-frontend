// Client du CMS produits — espace ADMIN (auth JWT via lib/auth).
// (Le fichier garde son nom historique ; il n'y a plus d'espace « vendeur ».)
import { API_URL } from "./api";
import { authedFetch, getSession } from "./auth";

export type VendorImage = {
  id: number;
  url: string | null;
  is_primary: boolean;
  order: number;
  alt: string;
};

export type VendorProduct = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: string;
  compare_at_price: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  badge: string;
  target: string;
  sizes: string;
  category_id: number;
  category_name: string;
  image: string | null;
  image_url: string;
  images: VendorImage[];
};

export type VendorStats = {
  products: number;
  online: number;
  stock_units: number;
  low_stock: number;
  out_of_stock: number;
  orders: number;
};

export type VendorCategory = { id: number; name: string };

export type VendorDashboard = {
  vendor: { name: string; shop_name: string };
  stats: VendorStats;
  categories: VendorCategory[];
  products: VendorProduct[];
};

/** Rafraîchit la vitrine (ISR) après une modification — fire-and-forget. */
function revalidateStorefront() {
  fetch("/api/revalidate", { method: "POST" }).catch(() => {});
}

export async function getDashboard(): Promise<VendorDashboard> {
  const res = await authedFetch("/api/admin/dashboard/", { cache: "no-store" });
  if (res.status === 401) throw new Error("unauthorized");
  if (res.status === 403) throw new Error("forbidden");
  if (!res.ok) throw new Error("Erreur de chargement.");
  return res.json();
}

export type NewProduct = {
  name: string;
  category_id: number;
  price: number;
  stock_quantity: number;
  target: string;
  badge?: string;
  brand?: string;
  sizes?: string;
  compare_at_price?: number | "";
  description?: string;
  image_url?: string;
  is_featured?: boolean;
};

export async function createProduct(p: NewProduct): Promise<VendorProduct> {
  const res = await authedFetch("/api/admin/products/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Création impossible.");
  revalidateStorefront();
  return data as VendorProduct;
}

export type ProductPatch = {
  name?: string;
  category_id?: number;
  price?: number;
  compare_at_price?: number | "";
  stock_quantity?: number;
  target?: string;
  badge?: string;
  brand?: string;
  sizes?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
};

export async function updateProduct(id: number, patch: ProductPatch): Promise<VendorProduct> {
  const res = await authedFetch(`/api/admin/products/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Mise à jour impossible.");
  revalidateStorefront();
  return data as VendorProduct;
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await authedFetch(`/api/admin/products/${id}/`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Suppression impossible.");
  revalidateStorefront();
}

/** Téléverse une photo (fichier) OU enregistre une URL d'image. */
export async function uploadProductImage(
  productId: number,
  opts: { file?: File; image_url?: string },
): Promise<VendorImage> {
  let res: Response;
  if (opts.file) {
    const fd = new FormData();
    fd.append("image", opts.file);
    res = await authedFetch(`/api/admin/products/${productId}/images/`, {
      method: "POST",
      body: fd, // pas de Content-Type : le navigateur gère le boundary
    });
  } else {
    res = await authedFetch(`/api/admin/products/${productId}/images/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: opts.image_url || "" }),
    });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Ajout de la photo impossible.");
  revalidateStorefront();
  return data as VendorImage;
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  const res = await authedFetch(`/api/admin/products/${productId}/images/${imageId}/`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Suppression de la photo impossible.");
  revalidateStorefront();
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  const res = await authedFetch(`/api/admin/products/${productId}/images/${imageId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_primary: true }),
  });
  if (!res.ok) throw new Error("Impossible de définir la photo principale.");
  revalidateStorefront();
}

// Compat : certains composants vérifiaient une session ; on délègue à lib/auth.
export { getSession };
export const API = API_URL;
