/**
 * Vocabulário canônico do domínio de imóveis.
 *
 * Fonte ÚNICA de verdade para mapear:
 *   - valores armazenados no banco (PT, herdado do CRM antigo)
 *   - slugs usados em URLs públicas (PT, p/ SEO)
 *   - labels exibidos na UI (PT)
 *   - aliases legados em inglês (compat reversa)
 *
 * Importe daqui em vez de hardcodar listas em componentes ou queries.
 */

// ============================================================
// CATEGORIA (enum Postgres: property_category)
// ============================================================

export const CATEGORIES = [
  { code: 'residential', labelPt: 'Residencial' },
  { code: 'commercial',  labelPt: 'Comercial'   },
] as const;

export type PropertyCategory = typeof CATEGORIES[number]['code'];

// ============================================================
// TRANSAÇÃO (enum Postgres: transaction_type)
// ============================================================

export const TRANSACTIONS = [
  { code: 'sale',      labelPt: 'Venda',           urlSegment: 'comprar', verbPt: 'à venda'                },
  { code: 'rent',      labelPt: 'Aluguel',         urlSegment: 'alugar',  verbPt: 'para alugar'            },
  { code: 'sale_rent', labelPt: 'Venda e Aluguel', urlSegment: null,      verbPt: 'à venda ou para alugar' },
] as const;

export type TransactionType = typeof TRANSACTIONS[number]['code'];

/**
 * Dado um filtro 'sale' ou 'rent', retorna os valores de transaction_type
 * que devem entrar no resultado. Imóveis com 'sale_rent' (venda OU aluguel)
 * aparecem em ambas as listagens.
 */
export function transactionMatchValues(filter: 'sale' | 'rent'): TransactionType[] {
  return filter === 'sale' ? ['sale', 'sale_rent'] : ['rent', 'sale_rent'];
}

// ============================================================
// STATUS (enum Postgres: property_status)
// ============================================================

export const STATUSES = [
  { code: 'active',           labelPt: 'Ativo',              isPublic: true  },
  { code: 'inactive',         labelPt: 'Inativo',            isPublic: false },
  { code: 'sold',             labelPt: 'Vendido',            isPublic: false },
  { code: 'rented',           labelPt: 'Alugado',            isPublic: false },
  { code: 'paused',           labelPt: 'Pausado',            isPublic: false },
  { code: 'reserved',         labelPt: 'Reservado',          isPublic: false },
  { code: 'negotiating',      labelPt: 'Em negociação',      isPublic: false },
  { code: 'pending_approval', labelPt: 'Pendente aprovação', isPublic: false },
  { code: 'rejected',         labelPt: 'Rejeitado',          isPublic: false },
] as const;

export type PropertyStatus = typeof STATUSES[number]['code'];

/** Status que aparecem no site público (apenas 'active'). */
export const PUBLIC_STATUSES: readonly PropertyStatus[] = STATUSES
  .filter(s => s.isPublic)
  .map(s => s.code);

// ============================================================
// TIPO DE IMÓVEL (text livre — 25 valores conhecidos no banco)
// ============================================================

export interface PropertyTypeEntry {
  /** Slug canônico em PT (URL e identificadores). */
  slug: string;
  /** Slug legado em EN, se houver (compat com URLs antigas). */
  legacySlug?: string;
  /** Label exibido na UI. */
  labelPt: string;
  /** Valor(es) reais armazenados na coluna properties.property_type. */
  dbValues: readonly string[];
  /** Categoria (residential | commercial) — pareia com properties.category. */
  category: PropertyCategory;
  /** Grupo para agrupamento visual no filtro. */
  group: 'residential' | 'land_rural' | 'commercial';
}

export const PROPERTY_TYPES: readonly PropertyTypeEntry[] = [
  // ---- Residenciais ----
  { slug: 'apartamento', legacySlug: 'apartment', labelPt: 'Apartamento', dbValues: ['Apartamento'],           category: 'residential', group: 'residential' },
  { slug: 'casa',        legacySlug: 'house',     labelPt: 'Casa',        dbValues: ['Casa'],                  category: 'residential', group: 'residential' },
  { slug: 'sobrado',                              labelPt: 'Sobrado',     dbValues: ['Sobrado'],               category: 'residential', group: 'residential' },
  { slug: 'cobertura',   legacySlug: 'penthouse', labelPt: 'Cobertura',   dbValues: ['Cobertura / Penthouse'], category: 'residential', group: 'residential' },
  { slug: 'kitnet',                               labelPt: 'Kitnet',      dbValues: ['Kitnet'],                category: 'residential', group: 'residential' },
  { slug: 'flat',                                 labelPt: 'Flat',        dbValues: ['Flat'],                  category: 'residential', group: 'residential' },
  { slug: 'studio',                               labelPt: 'Studio',      dbValues: ['Studio'],                category: 'residential', group: 'residential' },
  { slug: 'loft',                                 labelPt: 'Loft',        dbValues: ['Loft'],                  category: 'residential', group: 'residential' },
  { slug: 'village',                              labelPt: 'Village',     dbValues: ['Village'],               category: 'residential', group: 'residential' },
  { slug: 'lancamento',                           labelPt: 'Lançamento',  dbValues: ['Lançamento'],            category: 'residential', group: 'residential' },

  // ---- Terrenos & Rurais ----
  { slug: 'terreno', legacySlug: 'land', labelPt: 'Terreno', dbValues: ['Terreno'], category: 'residential', group: 'land_rural' },
  { slug: 'chacara', legacySlug: 'farm', labelPt: 'Chácara', dbValues: ['Chácara'], category: 'residential', group: 'land_rural' },
  { slug: 'sitio',                       labelPt: 'Sítio',   dbValues: ['Sítio'],   category: 'residential', group: 'land_rural' },
  { slug: 'fazenda',                     labelPt: 'Fazenda', dbValues: ['Fazenda'], category: 'residential', group: 'land_rural' },
  { slug: 'ilha',                        labelPt: 'Ilha',    dbValues: ['Ilha'],    category: 'residential', group: 'land_rural' },

  // ---- Comerciais ----
  // 'sala' agrupa Sala + Conjunto comercial + Andar corporativo (categorias do CRM antigo).
  { slug: 'sala',        legacySlug: 'office', labelPt: 'Sala Comercial', dbValues: ['Sala', 'Conjunto comercial', 'Andar corporativo'], category: 'commercial', group: 'commercial' },
  { slug: 'galpao',                            labelPt: 'Galpão',         dbValues: ['Galpão / Barracão'],                              category: 'commercial', group: 'commercial' },
  { slug: 'loja',                              labelPt: 'Loja',           dbValues: ['Loja'],                                           category: 'commercial', group: 'commercial' },
  { slug: 'ponto',                             labelPt: 'Ponto Comercial',dbValues: ['Ponto'],                                          category: 'commercial', group: 'commercial' },
  { slug: 'predio',                            labelPt: 'Prédio',         dbValues: ['Prédio'],                                         category: 'commercial', group: 'commercial' },
  { slug: 'hotel',                             labelPt: 'Hotel',          dbValues: ['Hotel'],                                          category: 'commercial', group: 'commercial' },
  { slug: 'pousada',                           labelPt: 'Pousada',        dbValues: ['Pousada'],                                        category: 'commercial', group: 'commercial' },
  { slug: 'box-garagem',                       labelPt: 'Box / Garagem',  dbValues: ['Box/Garagem'],                                    category: 'commercial', group: 'commercial' },
];

// Índice para resolução rápida (slug canônico OU legacy)
const PROPERTY_TYPE_INDEX = new Map<string, PropertyTypeEntry>();
for (const t of PROPERTY_TYPES) {
  PROPERTY_TYPE_INDEX.set(t.slug, t);
  if (t.legacySlug) PROPERTY_TYPE_INDEX.set(t.legacySlug, t);
}

// Aliases legados extras que sempre apontaram para Apartamento no código antigo
PROPERTY_TYPE_INDEX.set('condo', PROPERTY_TYPE_INDEX.get('apartamento')!);

/**
 * Resolve um slug (PT canônico ou legado EN) para a entrada do vocabulário.
 * Aceita string vazia/undefined retornando undefined.
 */
export function findPropertyTypeBySlug(slug: string | undefined | null): PropertyTypeEntry | undefined {
  if (!slug) return undefined;
  return PROPERTY_TYPE_INDEX.get(String(slug).toLowerCase());
}

/**
 * Para um slug de tipo, retorna os valores reais do DB que devem fazer match.
 * Ex.: 'sala' → ['Sala', 'Conjunto comercial', 'Andar corporativo'].
 * Retorna [] se o slug é desconhecido (caller decide fallback).
 */
export function propertyTypeDbValues(slug: string | undefined | null): readonly string[] {
  return findPropertyTypeBySlug(slug)?.dbValues ?? [];
}

/**
 * Mapa de redirect 301 para middleware: slugs legados → slug canônico.
 * Só inclui entradas onde legacySlug !== slug.
 */
export const LEGACY_TYPE_REDIRECTS: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const t of PROPERTY_TYPES) {
    if (t.legacySlug && t.legacySlug !== t.slug) {
      map[t.legacySlug] = t.slug;
    }
  }
  // 'condo' historicamente era usado como sinônimo de apartamento
  map['condo'] = 'apartamento';
  return map;
})();

/** Grupos para renderização agrupada no filtro da UI. */
export const PROPERTY_TYPE_GROUPS = [
  { id: 'residential', labelPt: 'Residencial',       types: PROPERTY_TYPES.filter(t => t.group === 'residential') },
  { id: 'land_rural',  labelPt: 'Terrenos & Rurais', types: PROPERTY_TYPES.filter(t => t.group === 'land_rural')  },
  { id: 'commercial',  labelPt: 'Comercial',         types: PROPERTY_TYPES.filter(t => t.group === 'commercial')  },
] as const;

// ============================================================
// COMODIDADES / FEATURES (coluna properties.features text[])
// ============================================================

/**
 * Comodidades expostas no filtro do site público.
 * São as Top 19 do banco (excluindo "Garagem", já coberta pelo filtro de vagas).
 * Cobre ~95% das ocorrências de features cadastradas.
 *
 * Os valores aqui devem bater EXATAMENTE com o que está armazenado em features[]
 * (caso/acentuação preservados).
 */
export const FEATURES_FOR_FILTER: readonly string[] = [
  'Churrasqueira',
  'Cozinha',
  'Armários Planejados',
  'Varanda',
  'Piscina',
  'Elevador',
  'Aquecimento',
  'Dependência de Empregada',
  'Área Gourmet',
  'Salão de Festas',
  'Quadra Esportiva',
  'Playground',
  'Jardim',
  'Portaria 24h',
  'Aceita Pets',
  'Quintal',
  'Sala de Jogos',
  'Lavanderia',
  'Closet',
];

// ============================================================
// PUBLICAÇÃO (text livre — vinculado a xml_quotas)
// ============================================================

export const PUBLICATION_TYPES = [
  { code: 'STANDARD',      labelPt: 'Standard'     },
  { code: 'PREMIUM',       labelPt: 'Premium'      },
  { code: 'SUPER_PREMIUM', labelPt: 'Super Premium' },
  { code: 'PREMIERE_1',    labelPt: 'Premiere'     },
] as const;

export type PublicationType = typeof PUBLICATION_TYPES[number]['code'];
