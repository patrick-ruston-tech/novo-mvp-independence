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
import {
  propertyTypeDbValues,
  FEATURES_FOR_FILTER,
} from '@/lib/property-vocabulary';
import type { ListingSelection } from '@/lib/listing-params';

// ============================================================
// PROPERTY QUERIES
// ============================================================

// Campos retornados para cards (listagens) — evita carregar description/detail_url
const CARD_FIELDS = `
  id, slug, transaction_type, property_type,
  price_sale, price_rent, price_condo, rent_type,
  neighborhood, city, address,
  living_area, lot_area,
  bedrooms, bathrooms, suites, garages,
  images, featured, title,
  condominium:condominium_id (name)
`;

/**
 * Status que podem aparecer no site público.
 *
 * Regra (definida pela equipe Independence):
 *   - is_published=true é necessário (toggle "Mostrar no site")
 *   - status precisa ser ativo: anúncio aberto, reservado ou em negociação
 *
 * Imóveis vendidos, locados, inativos, recusados, em aprovação ou pausados
 * são escondidos mesmo se o toggle estiver ligado — caso comum: corretor
 * inativa imóvel mas esquece de desligar o toggle.
 */
const PUBLIC_STATUSES = ['active', 'reserved', 'negotiating'] as const;

/**
 * Lista imóveis com filtros e paginação.
 * Usado nas páginas /comprar e /alugar.
 */
/**
 * Aplica os filtros de listagem numa query de properties já iniciada
 * (com select/count definidos pelo caller). Compartilhado entre
 * getProperties (listagem) e getPropertiesCount (rota de contagem) para
 * as duas nunca divergirem.
 *
 * Regra do CÓDIGO: código identifica UM imóvel — quando presente, todos
 * os demais filtros são ignorados (antes só a transação era ignorada;
 * cidade/tipo/preço residuais geravam 0-resultado fantasma, ex.:
 * cidade=Jacareí + código de imóvel de SJC).
 */
function applyListingFilters(query: any, filters: PropertyFilters): any {
  const {
    transaction_type,
    neighborhood,
    neighborhoods,
    property_type,
    property_types,
    bedrooms_min,
    suites_min,
    price_min,
    price_max,
    garages_min,
    features,
    comodidades,
    city,
  } = filters;

  if (filters.codigo) {
    return query.ilike('external_id', `%${filters.codigo}%`);
  }

  // Filtro principal: tipo de transação.
  // sale_rent aparece tanto em comprar quanto em alugar.
  if (transaction_type === 'sale') {
    query = query.in('transaction_type', ['sale', 'sale_rent']);
  } else if (transaction_type === 'rent') {
    query = query.in('transaction_type', ['rent', 'sale_rent']);
  }

  // Bairro(s) — por NOME. `neighborhoods` (multi, vindo de ?bairros=) tem
  // precedência sobre o `neighborhood` single legado.
  const nbNames =
    neighborhoods && neighborhoods.length > 0
      ? neighborhoods
      : neighborhood
        ? [neighborhood]
        : [];
  if (nbNames.length === 1) {
    query = query.eq('neighborhood', nbNames[0]);
  } else if (nbNames.length > 1) {
    query = query.in('neighborhood', nbNames);
  }

  // Zona — properties.zone guarda o NOME da zona (string).
  if (filters.zone) {
    query = query.eq('zone', filters.zone);
  }

  // Tipo(s) de imóvel. Cada slug (PT canônico ou legado EN) resolve para
  // o(s) valor(es) armazenado(s) no banco via property-vocabulary; slug
  // desconhecido faz match direto na string (permite PT bruto, ex.:
  // "Apartamento"). Multi = união de todos os dbValues.
  const typeSlugs =
    property_types && property_types.length > 0
      ? property_types
      : property_type
        ? [String(property_type)]
        : [];
  if (typeSlugs.length > 0) {
    const dbValues = new Set<string>();
    for (const slug of typeSlugs) {
      const resolved = propertyTypeDbValues(slug);
      if (resolved.length > 0) {
        for (const v of resolved) dbValues.add(v);
      } else {
        dbValues.add(String(slug));
      }
    }
    const values = Array.from(dbValues);
    query = values.length === 1
      ? query.eq('property_type', values[0])
      : query.in('property_type', values);
  }

  if (bedrooms_min) {
    query = query.gte('bedrooms', bedrooms_min);
  }
  if (suites_min) {
    query = query.gte('suites', suites_min);
  }
  if (garages_min) {
    query = query.gte('garages', garages_min);
  }
  if (city) {
    query = query.eq('city', city);
  }
  if (filters.condominium_id) {
    query = query.eq('condominium_id', filters.condominium_id);
  }

  // Filtro de preço (usa price_sale ou price_rent conforme o tipo)
  const priceCol = transaction_type === 'rent' ? 'price_rent' : 'price_sale';
  if (price_min) {
    query = query.gte(priceCol, price_min);
  }
  if (price_max) {
    query = query.lte(priceCol, price_max);
  }

  // Filtro por features/comodidades (coluna features text[]).
  // Aceita duas fontes:
  //   - filters.features: array passado programaticamente
  //   - filters.comodidades: string CSV vinda da URL (?comodidades=A,B,C)
  // Whitelist contra a lista canônica do vocabulário para evitar injection.
  const requested = new Set<string>();
  if (features && features.length > 0) {
    for (const f of features) requested.add(f);
  }
  if (typeof comodidades === 'string' && comodidades) {
    for (const f of comodidades.split(',')) {
      const trimmed = f.trim();
      if (trimmed) requested.add(trimmed);
    }
  }
  const allowed: string[] = [];
  for (const f of requested) {
    if (FEATURES_FOR_FILTER.includes(f)) allowed.push(f);
  }
  // Postgres array @> (contains) com todos os valores: AND implícito.
  if (allowed.length > 0) {
    query = query.contains('features', allowed);
  }

  return query;
}

export async function getProperties(
  filters: PropertyFilters
): Promise<PaginatedResponse<PropertyCard>> {
  const supabase = createServerClient();
  const {
    transaction_type,
    sort_by = 'newest',
    page = 1,
    per_page = 12,
  } = filters;

  // Query base: imóveis publicados (toggle "Mostrar no site" ligado).
  // Antes filtrávamos por status='active', mas isso excluía imóveis válidos
  // como reservados/em negociação que o corretor optou por manter visíveis,
  // e mantia visíveis imóveis com is_published=false (toggle desligado).
  // is_published é a fonte de verdade do que aparece no site.
  let query = supabase
    .from('properties')
    .select(CARD_FIELDS, { count: 'exact' })
    .eq('is_published', true).in('status', PUBLIC_STATUSES);

  query = applyListingFilters(query, filters);

  const priceCol = transaction_type === 'rent' ? 'price_rent' : 'price_sale';

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
 * Só a contagem de uma listagem (HEAD count, sem linhas). Usada pela rota
 * /api/imoveis/contagem que alimenta o botão "Ver N imóveis" da sidebar.
 * Retorna null em erro — o botão degrada pra "Aplicar filtros".
 */
export async function getPropertiesCount(
  filters: PropertyFilters
): Promise<number | null> {
  const supabase = createServerClient();
  let query = supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true).in('status', PUBLIC_STATUSES);
  query = applyListingFilters(query, filters);

  const { count, error } = await query;
  if (error) {
    console.error('getPropertiesCount error:', error);
    return null;
  }
  return count ?? 0;
}

/**
 * Converte a seleção canônica da URL (lib/listing-params) em PropertyFilters,
 * resolvendo slugs de bairro → nomes (properties.neighborhood guarda o nome).
 * Slug que não existe na tabela neighborhoods vira ele mesmo como "nome" —
 * resulta em 0 matches, igual ao comportamento antigo da rota /comprar/[bairro].
 */
export async function selectionToPropertyFilters(
  sel: ListingSelection,
  transaction: 'sale' | 'rent',
  page = 1,
  per_page = 12
): Promise<PropertyFilters> {
  let neighborhoodNames: string[] | undefined;
  if (sel.bairros.length > 0 && !sel.codigo) {
    const all = await getNeighborhoods();
    neighborhoodNames = sel.bairros.map(
      (slug) => all.find((n) => n.slug === slug)?.name ?? slug
    );
  }

  return {
    transaction_type: transaction,
    page,
    per_page,
    sort_by: sel.ordem,
    property_types: sel.tipos.length > 0 ? sel.tipos : undefined,
    neighborhoods: neighborhoodNames,
    bedrooms_min: sel.quartos ?? undefined,
    suites_min: sel.suites ?? undefined,
    garages_min: sel.garagens ?? undefined,
    price_min: sel.precoMin ?? undefined,
    price_max: sel.precoMax ?? undefined,
    city: sel.cidade || undefined,
    comodidades: sel.comodidades.length > 0 ? sel.comodidades.join(',') : undefined,
    codigo: sel.codigo || undefined,
    condominium_id: sel.condominio || undefined,
    zone: sel.zona || undefined,
  };
}

/**
 * Extrai o código (external_id) do final de um slug de imóvel.
 * Todo slug termina no código: "...-jardim-satelite-...-ap5062" ou
 * "...-ap5062-indep" (legado). Reconstrói o external_id (uppercase, '-'→'_').
 * Retorna null se não encontrar um padrão de código no fim.
 */
export function extractCodeFromSlug(slug: string): string | null {
  const m = slug.match(/([a-z]{2,4}\d{3,}(?:-indep)?)$/i);
  if (!m) return null;
  return m[1].toUpperCase().replace(/-/g, '_');
}

const PROPERTY_SELECT = '*, condominium:condominium_id (id, name)';

/**
 * Busca imóvel completo pelo slug.
 * Usado na página /imoveis/[slug].
 *
 * Resolve em duas etapas:
 *   1) match exato pelo slug (caso normal);
 *   2) fallback pelo CÓDIGO embutido no fim do slug (URLs antigas ou de quando
 *      o slug ainda carregava preço/transação). A página compara
 *      property.slug com o slug pedido e dá 301 pro canônico quando difere —
 *      assim nenhuma URL antiga quebra (mesma estratégia do Zap/VivaReal).
 */
export const getPropertyBySlug = cache(async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('slug', slug)
    .eq('is_published', true).in('status', PUBLIC_STATUSES)
    .maybeSingle();

  if (data) return data as Property;

  // Fallback: resolve pelo código do final do slug (auto-cura URLs antigas)
  const code = extractCodeFromSlug(slug);
  if (!code) return null;

  const { data: byCode } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('external_id', code)
    .eq('is_published', true).in('status', PUBLIC_STATUSES)
    .maybeSingle();

  return (byCode as Property) || null;
});

/**
 * Monta o vetor de uma seção curada da home (Destaque / Descobrir).
 *
 * Curadoria (painel /imoveis/destaques): imóveis com `posCol` preenchido
 * ocupam seu slot na ordem exata. Slots vazios — ou cujo imóvel saiu do ar
 * (vendido/despublicado, filtrado pela query) — são preenchidos NA ORDEM DO
 * SLOT pelo pool (flag ligada sem posição, mais recentes primeiro). No fim
 * compacta: nunca renderiza buraco. Dia 1 sem curadoria = comportamento
 * antigo (só pool), então não precisa de seed.
 */
async function getCuratedSlots(
  flagCol: 'featured' | 'is_discover',
  posCol: 'featured_position' | 'discover_position',
  limit: number
): Promise<PropertyCard[]> {
  const supabase = createServerClient();
  const [pinnedRes, poolRes] = await Promise.all([
    supabase
      .from('properties')
      .select(`${CARD_FIELDS}, ${posCol}`)
      .eq('is_published', true).in('status', PUBLIC_STATUSES)
      .not(posCol, 'is', null)
      .order(posCol, { ascending: true }),
    supabase
      .from('properties')
      .select(CARD_FIELDS)
      .eq('is_published', true).in('status', PUBLIC_STATUSES)
      .eq(flagCol, true)
      .is(posCol, null)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  if (pinnedRes.error) console.error(`getCuratedSlots(${posCol}) pinned error:`, pinnedRes.error);
  if (poolRes.error) console.error(`getCuratedSlots(${posCol}) pool error:`, poolRes.error);

  const slots: (PropertyCard | null)[] = Array(limit).fill(null);
  for (const p of (pinnedRes.data as any[]) ?? []) {
    const idx = Number(p[posCol]) - 1;
    if (idx >= 0 && idx < limit && !slots[idx]) slots[idx] = p as PropertyCard;
  }
  const queue = [...(((poolRes.data as any[]) ?? []) as PropertyCard[])];
  for (let i = 0; i < limit && queue.length > 0; i++) {
    if (!slots[i]) slots[i] = queue.shift()!;
  }
  return slots.filter((p): p is PropertyCard => p !== null);
}

/**
 * Imóveis da seção "Imóveis em Destaque" da home (8 slots curados).
 */
export const getFeaturedProperties = unstable_cache(
  async (limit = 8) => getCuratedSlots('featured', 'featured_position', limit),
  ['featured-properties-slots'],
  { revalidate: 300 } // cache por 5 minutos
);

/**
 * Imóveis da faixa "Descobrir/Oportunidades" da home (4 slots curados).
 * A página /descobrir continua usando getDiscoverProperties (pool inteiro).
 */
export const getDiscoverHome = unstable_cache(
  async (limit = 4) => getCuratedSlots('is_discover', 'discover_position', limit),
  ['discover-home-slots'],
  { revalidate: 300 }
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
    .eq('is_published', true).in('status', PUBLIC_STATUSES)
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
    .eq('is_published', true).in('status', PUBLIC_STATUSES);

  if (error) {
    console.error('getAllPropertySlugs error:', error);
    return [];
  }

  return data?.map((p) => p.slug) ?? [];
}

// ============================================================
// NEIGHBORHOOD QUERIES
// ============================================================

// PROPERTY_TYPE_MAP removido — a lógica foi centralizada em
// lib/property-vocabulary.ts (use propertyTypeDbValues / findPropertyTypeBySlug).

/**
 * Lista todos os bairros com imóveis ativos.
 * Usado no combobox de busca da home e nos filtros.
 */
export async function getNeighborhoods(city?: string): Promise<Neighborhood[]> {
  const cached = unstable_cache(
    async () => {
      const supabase = createServerClient();

      // 1. Bairros cadastrados
      let nbQuery = supabase
        .from('neighborhoods')
        .select('id, name, slug, city, property_count');
      if (city) nbQuery = nbQuery.eq('city', city);
      const { data: neighborhoods, error } = await nbQuery;
      if (error || !neighborhoods) {
        console.error('getNeighborhoods error:', error);
        return [];
      }

      // 2. Contagem dinâmica a partir dos imóveis ativos (mesmo filtro usado
      //    nas páginas /comprar e /alugar). Paginamos porque Supabase REST
      //    retorna no máximo 1000 linhas.
      const allRows: Array<{ neighborhood: string | null; transaction_type: string | null }> = [];
      let offset = 0;
      while (true) {
        let q = supabase
          .from('properties')
          .select('neighborhood, transaction_type')
          .eq('is_published', true).in('status', PUBLIC_STATUSES)
          .range(offset, offset + 999);
        if (city) q = q.eq('city', city);
        const { data: pageRows } = await q;
        if (!pageRows || pageRows.length === 0) break;
        allRows.push(...(pageRows as any));
        if (pageRows.length < 1000) break;
        offset += 1000;
      }

      const saleCounts: Record<string, number> = {};
      const rentCounts: Record<string, number> = {};
      for (const r of allRows) {
        const nb = r.neighborhood;
        if (!nb) continue;
        const t = r.transaction_type;
        if (t === 'sale' || t === 'sale_rent') {
          saleCounts[nb] = (saleCounts[nb] || 0) + 1;
        }
        if (t === 'rent' || t === 'sale_rent') {
          rentCounts[nb] = (rentCounts[nb] || 0) + 1;
        }
      }

      // 3. Merge e ordena alfabeticamente (pt-BR — respeita acentos:
      //    Á aparece junto de A, não no final). Equipe pediu ordem
      //    alfabética nos selects de busca por bairro.
      const enriched = neighborhoods.map((n: any) => ({
        ...n,
        property_count_sale: saleCounts[n.name] || 0,
        property_count_rent: rentCounts[n.name] || 0,
      }));
      enriched.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      return enriched;
    },
    ['neighborhoods', city || 'all'],
    { revalidate: 600 }
  );
  return cached() as Promise<Neighborhood[]>;
}

/**
 * Lista condomínios com pelo menos 1 imóvel ativo. Retorna em ordem
 * alfabética. Usado nos componentes de busca (SearchBlock e SidebarFilters)
 * pra autocomplete.
 *
 * Nota: cobertura mínima — só nome, id, bairro e cidade. Pra detalhes de
 * um condomínio específico, query separada com select '*'.
 */
export interface CondominiumOption {
  id: string;
  name: string;
  city: string | null;
  neighborhood: string | null;
  property_count: number;
}

export async function getCondominiums(city?: string): Promise<CondominiumOption[]> {
  const cached = unstable_cache(
    async () => {
      const supabase = createServerClient();

      // 1. Busca condomínios paginado (Supabase REST trunca em 1000)
      const condos: any[] = [];
      let offset = 0;
      while (true) {
        let q = supabase
          .from('condominiums')
          .select('id, name, neighborhood, city')
          .order('name')
          .range(offset, offset + 999);
        if (city) q = q.eq('city', city);
        const { data, error } = await q;
        if (error) {
          console.error('getCondominiums error:', error);
          return [];
        }
        if (!data || data.length === 0) break;
        condos.push(...data);
        if (data.length < 1000) break;
        offset += 1000;
      }

      // 2. Conta imóveis ATIVOS por condomínio. Filtra fora condos sem
      //    imóveis publicados — não faz sentido aparecer no autocomplete.
      const counts: Record<string, number> = {};
      let propOffset = 0;
      while (true) {
        const { data: pageRows } = await supabase
          .from('properties')
          .select('condominium_id')
          .eq('is_published', true).in('status', PUBLIC_STATUSES)
          .not('condominium_id', 'is', null)
          .range(propOffset, propOffset + 999);
        if (!pageRows || pageRows.length === 0) break;
        for (const r of pageRows) {
          const cid = (r as any).condominium_id;
          if (cid) counts[cid] = (counts[cid] || 0) + 1;
        }
        if (pageRows.length < 1000) break;
        propOffset += 1000;
      }

      const enriched: CondominiumOption[] = condos
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          city: c.city,
          neighborhood: c.neighborhood,
          property_count: counts[c.id] || 0,
        }))
        .filter((c) => c.property_count > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      return enriched;
    },
    ['condominiums', city || 'all'],
    { revalidate: 600 }
  );
  return cached() as Promise<CondominiumOption[]>;
}

/**
 * Lista zonas ativas pra popular o filtro de zona no site.
 * Retorna só zonas que têm ao menos 1 imóvel publicado (evita zona vazia
 * aparecendo no dropdown). Ordenado alfabético pt-BR.
 */
export interface ZoneOption {
  name: string;
  property_count: number;
}

export const getZones = unstable_cache(
  async (): Promise<ZoneOption[]> => {
    const supabase = createServerClient();
    // Conta imóveis publicados por zona (properties.zone = nome da zona),
    // paginando porque Supabase REST corta em 1000.
    const counts: Record<string, number> = {};
    let offset = 0;
    while (true) {
      const { data } = await supabase
        .from('properties')
        .select('zone')
        .eq('is_published', true).in('status', PUBLIC_STATUSES)
        .not('zone', 'is', null)
        .range(offset, offset + 999);
      if (!data || data.length === 0) break;
      for (const r of data) {
        const z = (r as any).zone;
        if (z) counts[z] = (counts[z] || 0) + 1;
      }
      if (data.length < 1000) break;
      offset += 1000;
    }
    return Object.entries(counts)
      .map(([name, property_count]) => ({ name, property_count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  },
  ['zones-with-count'],
  { revalidate: 600 }
);

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
): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = createServerClient();

  const { data, error } = await supabase.from('property_submissions').insert({
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
    images: submission.images || [],
  }).select('id').single();

  if (error) {
    console.error('createPropertySubmission error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
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
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true).in('status', PUBLIC_STATUSES).in('transaction_type', ['sale', 'sale_rent']),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true).in('status', PUBLIC_STATUSES).in('transaction_type', ['rent', 'sale_rent']),
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
    .eq('is_published', true).in('status', PUBLIC_STATUSES)
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
    .eq('is_published', true).in('status', PUBLIC_STATUSES)
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

