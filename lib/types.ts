export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  product_count: number;
  order: number;
};

export type ProductImage = {
  id: number;
  image: string;
  alt: string;
  is_primary: boolean;
};

export type Badge = "" | "nouveau" | "promo" | "bestseller" | "made_in_cmr";
export type Target = "femme" | "homme" | "enfant" | "unisexe";

export type Review = {
  id: number;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: string;
  compare_at_price: string | null;
  discount_percent: number;
  badge: Badge;
  target: Target;
  in_stock: boolean;
  rating_avg: number;
  rating_count: number;
  category_slug: string;
  category_name: string;
  image: string | null;
  hover_image: string | null;
};

export type ProductDetail = Product & {
  description: string;
  sku: string;
  stock_quantity: number;
  sizes: string;
  sizes_list: string[];
  images: ProductImage[];
  reviews: Review[];
};

export type SiteConfig = {
  site_name: string;
  tagline: string;
  whatsapp_number: string;
  whatsapp_arrivages: string;
  phone: string;
  email: string;
  address: string;
  social: {
    tiktok: string;
    facebook: string;
    instagram: string;
  };
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type DeliveryZone = {
  id: number;
  name: string;
  city: string;
  fee: string;
  eta_minutes: number;
};

export type OrderResponse = {
  reference: string;
  total: string;
  delivery_fee: string;
  grand_total: string;
  whatsapp_link: string;
  payment_link: string;
  payment_is_stub: boolean;
  // Paiement Tara (canal sans livraison) : statut initial + URL hébergée (Wave).
  payment_status: "en_attente" | "valide" | "rejete" | null;
  payment_url: string | null;
  tracking_url?: string;
  tracking_token?: string;
};

export type PaymentStatus = {
  reference: string;
  montant: string;
  statut: "en_attente" | "valide" | "rejete";
  is_paid: boolean;
  motif_rejet: string;
};
