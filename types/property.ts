// ============================================================
// Independence Imóveis — Database Types
// Matches Supabase schema exactly
// ============================================================

// ---- Enums ----

export type TransactionType = 'sale' | 'rent' | 'sale_rent';
export type PropertyStatus = 'active' | 'inactive' | 'sold' | 'rented';
export type PropertyCategory = 'residential' | 'commercial';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'sobrado'
  | 'condo'
  | 'land'
  | 'penthouse'
  | 'studio'
  | 'flat'
  | 'farm'
  | 'office'
  | 'commercial'
  | 'industrial'
  | 'commercial_building'
  | 'building'
  | 'garage';

// ---- Property Image ----

export interface PropertyImage {
  url: string;
  is_primary: boolean;
}

// ---- Main Property ----

export interface Property {
  id: string;
  external_id: string;
  slug: string;
  status: PropertyStatus;
  featured: boolean;
  publication_type: string;

  transaction_type: TransactionType;
  price_sale: number | null;
  price_rent: number | null;
  price_condo: number | null;
  price_iptu: number | null;

  category: PropertyCategory;
  property_type: PropertyType;

  title: string | null;
  description: string | null;

  city: string;
  state: string;
  neighborhood: string;
  address: string | null;
  street_number: string | null;
  complement: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;

  living_area: number | null;
  lot_area: number | null;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  garages: number;
  unit_floor: number | null;
  year_built: number | null;

  features: string[];
  images: PropertyImage[];
  video_url: string | null;
  detail_url: string | null;

  listed_at: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

// ---- Card (subset for listings) ----

export type PropertyCard = Pick<
  Property,
  | 'id'
  | 'slug'
  | 'transaction_type'
  | 'property_type'
  | 'price_sale'
  | 'price_rent'
  | 'price_condo'
  | 'neighborhood'
  | 'city'
  | 'address'
  | 'living_area'
  | 'lot_area'
  | 'bedrooms'
  | 'bathrooms'
  | 'suites'
  | 'garages'
  | 'images'
  | 'featured'
  | 'title'
>;

// ---- Neighborhood ----

export interface Neighborhood {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Contagem armazenada na tabela — pode estar desatualizada. Mantida para compatibilidade. */
  property_count: number;
  /** Ativos com transaction_type sale ou sale_rent — casa com o total de /comprar/[bairro]. */
  property_count_sale?: number;
  /** Ativos com transaction_type rent ou sale_rent — casa com o total de /alugar/[bairro]. */
  property_count_rent?: number;
}

// ---- Lead ----

export interface Lead {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  source?: string;
  property_id?: string;
  page_url?: string;
}

// ---- Property Submission (Anunciar) ----

export interface PropertySubmission {
  id?: string;
  owner_name: string;
  owner_email?: string;
  owner_phone: string;
  property_type?: string;
  transaction_type?: string;
  neighborhood?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  living_area?: number;
  price_estimate?: number;
  description?: string;
  images?: string[];
}

// ---- Filters (for listing pages) ----

export interface PropertyFilters {
  transaction_type: TransactionType;
  neighborhood?: string;
  property_type?: PropertyType;
  bedrooms_min?: number;
  price_min?: number;
  price_max?: number;
  garages_min?: number;
  features?: string[];
  city?: string;
  zona?: string;
  codigo?: string;
  comodidades?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'area_desc';
  page?: number;
  per_page?: number;
}

// ---- Paginated Response ----

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ---- Labels (for UI display) ----

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  sobrado: 'Sobrado',
  condo: 'Condomínio',
  land: 'Terreno',
  penthouse: 'Cobertura',
  studio: 'Studio',
  flat: 'Flat',
  farm: 'Chácara',
  office: 'Sala Comercial',
  commercial: 'Ponto Comercial',
  industrial: 'Galpão',
  commercial_building: 'Prédio Comercial',
  building: 'Prédio',
  garage: 'Garagem',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  sale: 'Venda',
  rent: 'Aluguel',
  sale_rent: 'Venda e Aluguel',
};
