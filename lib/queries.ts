import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import type {
  Property,
  PropertyCard,
  PropertyFilters,
  PaginatedResponse,
  Neighborhood,
  Lead,
  PropertySubmission,
} from '@/types/property';

// ============================================================
// PROPERTY QUERIES
// ============================================================

// Campos retornados para cards (listagens) — evita carregar description/detail_url
const CARD_FIELDS = `
  id, slug, transaction_type, property_type,
  price_sale, price_rent, price_condo,
  neighborhood, city, address,
  living_area, lot_area,
  bedrooms, bathrooms, suites, garages,
  images, featured, title
`;

/**
 * Lista imóveis com filtros e paginação.
 * Usado nas páginas /comprar e /alugar.
 */
export async function getProperties(
  filters: PropertyFilters
): Promise<PaginatedResponse<PropertyCard>> {
  const supabase = createServerClient();
  const {
    transaction_type,
    neighborhood,
    property_type,
    bedrooms_min,
    price_min,
    price_max,
    garages_min,
    features,
    comodidades,
    city,
    sort_by = 'newest',
    page = 1,
    per_page = 12,
  } = filters;

  // Query base: apenas imóveis ativos
  let query = supabase
    .from('properties')
    .select(CARD_FIELDS, { count: 'exact' })
    .eq('status', 'active');

  // Filtro principal: tipo de transação
  // sale_rent aparece tanto em comprar quanto em alugar
  if (transaction_type === 'sale') {
    query = query.in('transaction_type', ['sale', 'sale_rent']);
  } else if (transaction_type === 'rent') {
    query = query.in('transaction_type', ['rent', 'sale_rent']);
  }

  // Filtros opcionais
  if (neighborhood) {
    query = query.eq('neighborhood', neighborhood);
  }
  if (property_type) {
    query = query.eq('property_type', property_type);
  }
  if (bedrooms_min) {
    query = query.gte('bedrooms', bedrooms_min);
  }
  if (garages_min) {
    query = query.gte('garages', garages_min);
  }
  if (city) {
    query = query.eq('city', city);
  }

  // Filtro de preço (usa price_sale ou price_rent conforme o tipo)
  const priceCol =
    transaction_type === 'rent' ? 'price_rent' : 'price_sale';
  if (price_min) {
    query = query.gte(priceCol, price_min);
  }
  if (price_max) {
    query = query.lte(priceCol, price_max);
  }

  // Filtro por features (ex: Piscina, Churrasqueira)
  if (features && features.length > 0) {
    query = query.contains('features', features);
  }

  // Comodidades filter (via URL param string)
  const VALID_AMENITIES = ['Piscina', 'Churrasqueira', 'Armários Planejados', 'Varanda', 'Elevador', 'Área Gourmet', 'Aquecimento', 'Salão de Festas', 'Quadra Esportiva', 'Dependência de Empregada'];
  const comodidadesList = typeof comodidades === 'string'
    ? comodidades.split(',').filter((a: string) => VALID_AMENITIES.includes(a))
    : [];

  for (const amenity of comodidadesList) {
    query = query.contains('features', [amenity]);
  }

  // Ordenação
  switch (sort_by) {
    case 'price_asc':
      query = query.order(priceCol, { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order(priceCol, { ascending: false, nullsFirst: false });
      break;
    case 'area_desc':
      query = query.order('living_area', { ascending: false, nullsFirst: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Paginação
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('getProperties error:', error);
    return { data: [], total: 0, page, per_page, total_pages: 0 };
  }

  const total = count ?? 0;

  return {
    data: (data as PropertyCard[]) ?? [],
    total,
    page,
    per_page,
    total_pages: Math.ceil(total / per_page),
  };
}

/**
 * Busca imóvel completo pelo slug.
 * Usado na página /imoveis/[slug].
 */
export const getPropertyBySlug = cache(async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('getPropertyBySlug error:', error);
    return null;
  }

  return data as Property;
});

/**
 * Busca imóveis em destaque para a home.
 * Prioriza SUPER_PREMIUM > PREMIUM > STANDARD.
 */
export const getFeaturedProperties = unstable_cache(
  async (limit = 8) => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('properties')
      .select(CARD_FIELDS)
      .eq('status', 'active')
      .eq('featured', true)
      .limit(limit);

    if (error) {
      console.error('getFeaturedProperties error:', error);
      return [];
    }
    return data ?? [];
  },
  ['featured-properties'],
  { revalidate: 300 } // cache por 5 minutos
);

/**
 * Busca imóveis similares (mesmo bairro e tipo de transação).
 * Exclui o imóvel atual. Usado na página de detalhe.
 */
export async function getSimilarProperties(
  property: Property,
  limit = 4
): Promise<PropertyCard[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('properties')
    .select(CARD_FIELDS)
    .eq('status', 'active')
    .eq('neighborhood', property.neighborhood)
    .neq('id', property.id)
    .in(
      'transaction_type',
      property.transaction_type === 'sale'
        ? ['sale', 'sale_rent']
        : ['rent', 'sale_rent']
    )
    .limit(limit);

  if (error) {
    console.error('getSimilarProperties error:', error);
    return [];
  }

  return (data as PropertyCard[]) ?? [];
}

/**
 * Retorna todos os slugs de imóveis ativos.
 * Usado para generateStaticParams (SSG).
 */
export async function getAllPropertySlugs(): Promise<string[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('properties')
    .select('slug')
    .eq('status', 'active');

  if (error) {
    console.error('getAllPropertySlugs error:', error);
    return [];
  }

  return data?.map((p) => p.slug) ?? [];
}

// ============================================================
// NEIGHBORHOOD QUERIES
// ============================================================

/**
 * Lista todos os bairros com imóveis ativos.
 * Usado no combobox de busca da home e nos filtros.
 */
export async function getNeighborhoods(city?: string): Promise<Neighborhood[]> {
  const cached = unstable_cache(
    async () => {
      const supabase = createServerClient();
      let query = supabase.from('neighborhoods').select('id, name, slug, city, property_count').order('property_count', { ascending: false });
      if (city) query = query.eq('city', city);
      const { data, error } = await query;
      if (error) {
        console.error('getNeighborhoods error:', error);
        return [];
      }
      return data ?? [];
    },
    ['neighborhoods', city || 'all'],
    { revalidate: 600 }
  );
  return cached() as Promise<Neighborhood[]>;
}

/**
 * Busca bairro pelo slug.
 * Usado para texto SEO nas páginas de listagem por bairro.
 */
export const getNeighborhoodBySlug = cache(async function getNeighborhoodBySlug(
  slug: string
): Promise<Neighborhood | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('neighborhoods')
    .select('id, name, slug, city, property_count')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getNeighborhoodBySlug error:', error);
    return null;
  }

  return data as Neighborhood;
});

// ============================================================
// LEAD / SUBMISSION MUTATIONS
// ============================================================

/**
 * Cria um novo lead (formulário de contato).
 * Chamado client-side via Server Action ou API Route.
 */
export async function createLead(lead: Lead): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  const { error } = await supabase.from('leads').insert({
    name: lead.name,
    email: lead.email || null,
    phone: lead.phone,
    message: lead.message || null,
    source: lead.source || 'website',
    property_id: lead.property_id || null,
    page_url: lead.page_url || null,
  });

  if (error) {
    console.error('createLead error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Cria uma submissão de imóvel (página Anunciar).
 * Chamado client-side via Server Action ou API Route.
 */
export async function createPropertySubmission(
  submission: PropertySubmission
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  const { error } = await supabase.from('property_submissions').insert({
    owner_name: submission.owner_name,
    owner_email: submission.owner_email || null,
    owner_phone: submission.owner_phone,
    property_type: submission.property_type || null,
    transaction_type: submission.transaction_type || null,
    neighborhood: submission.neighborhood || null,
    city: submission.city || 'São José dos Campos',
    bedrooms: submission.bedrooms || null,
    bathrooms: submission.bathrooms || null,
    garages: submission.garages || null,
    living_area: submission.living_area || null,
    price_estimate: submission.price_estimate || null,
    description: submission.description || null,
  });

  if (error) {
    console.error('createPropertySubmission error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// STATS (para contadores na home, SEO, etc.)
// ============================================================

/**
 * Retorna contagens rápidas para a home page.
 */
export const getHomeStats = unstable_cache(
  async () => {
    const supabase = createServerClient();
    const [saleRes, rentRes, neighRes] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active').in('transaction_type', ['sale', 'sale_rent']),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active').in('transaction_type', ['rent', 'sale_rent']),
      supabase.from('neighborhoods').select('*', { count: 'exact', head: true }),
    ]);
    return {
      total_sale: saleRes.count ?? 0,
      total_rent: rentRes.count ?? 0,
      total_neighborhoods: neighRes.count ?? 0,
    };
  },
  ['home-stats'],
  { revalidate: 600 } // cache por 10 minutos
);

/**
 * Top bairros com mais imóveis por tipo de transação.
 * Usado nos cards de atalho nas páginas de listagem.
 */
export async function getTopNeighborhoods(
  transactionType: 'sale' | 'rent',
  city?: string,
  limit = 4
): Promise<{ name: string; slug: string; city: string; count: number }[]> {
  const validTransactionTypes = ['sale', 'rent'] as const;
  if (!validTransactionTypes.includes(transactionType as any)) return [];

  const supabase = createServerClient();

  const { data, error } = await supabase.rpc('get_top_neighborhoods', {
    p_transaction_type: transactionType,
    p_city: city || null,
    p_limit: limit,
  });

  if (error) {
    console.error('getTopNeighborhoods error:', error);
    return [];
  }

  return (data as { name: string; slug: string; city: string; count: number }[]) ?? [];
}

// ============================================================
// LAUNCH QUERIES
// ============================================================

export async function getLaunches(): Promise<any[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('launches')
    .select('id, name, slug, neighborhood, city, description, price_from, price_to, delivery_date, construction_stage, total_units, cover_image, images, is_featured, status, start_date, delivery_date_actual')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getLaunches error:', error);
    return [];
  }
  return data ?? [];
}

export const getLaunchBySlug = cache(async function getLaunchBySlug(slug: string): Promise<any | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('launches')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('getLaunchBySlug error:', error);
    return null;
  }
  return data;
});

export async function getLaunchProperties(launchId: string): Promise<any[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('properties')
    .select(CARD_FIELDS)
    .eq('launch_id', launchId)
    .eq('status', 'active')
    .order('price_sale', { ascending: true });

  if (error) {
    console.error('getLaunchProperties error:', error);
    return [];
  }
  return data ?? [];
}

const LAUNCH_CARD_FIELDS = `
  name, slug, neighborhood, city, description,
  price_from, construction_stage, total_units,
  cover_image, images
`;

export const getFeaturedLaunches = unstable_cache(
  async (limit = 4) => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('launches')
      .select(LAUNCH_CARD_FIELDS)
      .eq('status', 'active')
      .eq('is_featured', true)
      .limit(limit);
    if (error) {
      console.error('getFeaturedLaunches error:', error);
      return [];
    }
    return data ?? [];
  },
  ['featured-launches'],
  { revalidate: 300 }
);

/**
 * Busca imóveis marcados como "descobrir" (curadoria do admin)
 */
export async function getDiscoverProperties(): Promise<any[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('properties')
    .select(CARD_FIELDS)
    .eq('status', 'active')
    .eq('is_discover', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getDiscoverProperties error:', error);
    return [];
  }
  return data ?? [];
}

/**
 * Busca depoimentos para exibir no site
 */
export async function getTestimonials(location: 'home' | 'about' | 'all' = 'all'): Promise<any[]> {
  const supabase = createServerClient();
  let query = supabase
    .from('testimonials')
    .select('id, name, text, stars, date_label, show_on_home, show_on_about')
    .order('created_at', { ascending: false });

  if (location === 'home') query = query.eq('show_on_home', true);
  if (location === 'about') query = query.eq('show_on_about', true);

  const { data, error } = await query;
  if (error) {
    console.error('getTestimonials error:', error);
    return [];
  }
  return data ?? [];
}

/**
 * Busca membros da equipe ativos
 */
export async function getTeamMembers(): Promise<any[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, role, photo')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getTeamMembers error:', error);
    return [];
  }
  return data ?? [];
}