import type {
  Category,
  Product,
  ProductDetail,
  SiteConfig,
  Paginated,
  OrderResponse,
  DeliveryZone,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const REVALIDATE = 300; // 5 min — la vitrine n'a pas besoin de temps réel

async function getJSON<T>(path: string, revalidate = REVALIDATE): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} sur ${path}`);
  }
  return res.json() as Promise<T>;
}

/* ----------------------------- Server-side ----------------------------- */

export async function getSiteConfig(): Promise<SiteConfig> {
  return getJSON<SiteConfig>("/api/site-config/");
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  return getJSON<DeliveryZone[]>("/api/delivery-zones/");
}

export async function getCategories(): Promise<Category[]> {
  const data = await getJSON<Paginated<Category>>("/api/categories/");
  return data.results;
}

export type SortOption = "price_asc" | "price_desc" | "name" | "recent";

export type ProductFilters = {
  category?: string;
  target?: string;
  featured?: boolean;
  search?: string;
  inStock?: boolean;
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
};

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (filters.category) qs.set("category", filters.category);
  if (filters.target) qs.set("target", filters.target);
  if (filters.featured) qs.set("featured", "1");
  if (filters.inStock) qs.set("in_stock", "1");
  if (filters.onSale) qs.set("on_sale", "1");
  if (filters.search) qs.set("search", filters.search);
  if (filters.minPrice != null) qs.set("min_price", String(filters.minPrice));
  if (filters.maxPrice != null) qs.set("max_price", String(filters.maxPrice));
  if (filters.sort) qs.set("sort", filters.sort);
  const query = qs.toString();
  const data = await getJSON<Paginated<Product>>(
    `/api/products/${query ? `?${query}` : ""}`,
  );
  return data.results;
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await getJSON<ProductDetail>(`/api/products/${slug}/`);
  } catch {
    return null;
  }
}

/* ----------------------------- Client-side ----------------------------- */

export type OrderItemInput = {
  product_id: number;
  quantity: number;
  size?: string;
};

export type OrderPayload = {
  customer_name: string;
  phone: string;
  email: string;
  city?: string;
  address?: string;
  note?: string;
  zone_id?: number | null;
  items: OrderItemInput[];
  // false = paiement Tara direct, sans livraison
  with_delivery?: boolean;
};

export async function postOrder(payload: OrderPayload): Promise<OrderResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // Si un client est connecté, on joint son JWT pour rattacher la commande à son
  // compte (→ « Mes commandes »). Lecture directe du storage pour éviter un cycle
  // d'import avec ./auth (qui importe API_URL depuis ce module).
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("tchokos_auth");
      const access = raw ? (JSON.parse(raw).access as string | undefined) : undefined;
      if (access) headers.Authorization = `Bearer ${access}`;
    } catch {
      /* ignore */
    }
  }

  const res = await fetch(`${API_URL}/api/orders/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Impossible d'enregistrer la commande.");
  }
  return res.json() as Promise<OrderResponse>;
}

/** Statut d'un paiement Tara — polling côté vitrine (pas de cache). */
export async function getPaymentStatus(
  reference: string,
): Promise<import("./types").PaymentStatus> {
  const res = await fetch(
    `${API_URL}/api/payments/status/?ref=${encodeURIComponent(reference)}`,
    { cache: "no-store", headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error("payment status unavailable");
  return res.json();
}

/** DEV uniquement (DEBUG backend) — simule la confirmation Tara d'un paiement. */
export async function devConfirmPayment(
  reference: string,
): Promise<import("./types").PaymentStatus> {
  const res = await fetch(
    `${API_URL}/api/payments/dev/${encodeURIComponent(reference)}/confirm/`,
    { method: "POST", headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error("dev confirm failed");
  return res.json();
}

export type ContactPayload = {
  name: string;
  email?: string;
  phone?: string;
  message: string;
};

export async function postContact(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Échec de l'envoi du message.");
  }
}
