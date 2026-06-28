import { API_URL } from "./api";

export type VendorProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  badge: string;
  target: string;
  category_id: number;
  category_name: string;
  image: string | null;
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

export type VendorSession = {
  token: string;
  vendor: { id: number; name: string; shop_name: string };
};

const KEY = "tchokos_vendor_session";

export function getSession(): VendorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as VendorSession) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(KEY);
}

function authHeaders(): HeadersInit {
  const s = getSession();
  return s ? { Authorization: `Bearer ${s.token}` } : {};
}

export async function vendorLogin(phone: string): Promise<VendorSession> {
  const res = await fetch(`${API_URL}/api/vendor/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Connexion impossible.");
  }
  const session = (await res.json()) as VendorSession;
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export async function getDashboard(): Promise<VendorDashboard> {
  const res = await fetch(`${API_URL}/api/vendor/dashboard/`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("Erreur de chargement.");
  return res.json();
}

export type NewProduct = {
  name: string;
  category_id: number;
  price: number;
  stock_quantity: number;
  target: string;
  description?: string;
  image_url?: string;
};

export async function createProduct(p: NewProduct): Promise<VendorProduct> {
  const res = await fetch(`${API_URL}/api/vendor/products/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Création impossible.");
  return data as VendorProduct;
}

export async function updateProduct(
  id: number,
  patch: Partial<Pick<VendorProduct, "is_active">> & {
    price?: number;
    stock_quantity?: number;
  },
): Promise<VendorProduct> {
  const res = await fetch(`${API_URL}/api/vendor/products/${id}/`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Mise à jour impossible.");
  return data as VendorProduct;
}
