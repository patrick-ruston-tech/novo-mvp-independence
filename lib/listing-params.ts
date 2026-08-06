/**
 * Estado de filtros das listagens públicas (/comprar e /alugar) e sua
 * (de)serialização de/para URL.
 *
 * FONTE ÚNICA do contrato de query params das listagens — usada pelo
 * SidebarFilters (client), pelas páginas (server), pelos chips de filtros
 * ativos e pela rota /api/imoveis/contagem. Mudou um param? Muda aqui.
 *
 * Contrato:
 *   cidade=<nome>                  single
 *   tipo=<slug>[,<slug>...]        multi CSV — slugs canônicos PT; legados EN
 *                                  (?tipo=apartment) são normalizados no parse
 *   bairros=<slug>[,<slug>...]     multi CSV. Com exatamente 1 bairro a
 *                                  navegação usa a rota SEO /comprar/[slug];
 *                                  com 2+ tudo vai pra query.
 *                                  ?bairro=<slug> (legado) é aceito como alias.
 *   quartos|suites|garagens=<n>    mínimo (gte no banco). Legado "4+" tolerado.
 *   preco_min|preco_max=<int>      reais; ausente = sem limite (sem sentinela)
 *   comodidades=<a,b,c>            multi CSV (AND — imóvel tem TODAS)
 *   zona=<nome>  condominio=<uuid>  codigo=<external_id>   single
 *   ordem=<sort>  pagina=<n>
 *
 * `codigo` é EXCLUSIVO: quando presente, os demais filtros são ignorados —
 * o código identifica um imóvel; qualquer outro filtro combinado só gera
 * resultado-zero fantasma (ex.: cidade=Jacareí + código de imóvel de SJC).
 */

import { findPropertyTypeBySlug, PROPERTY_TYPES } from '@/lib/property-vocabulary';

export type RawSearchParams = { [key: string]: string | string[] | undefined };

const VALID_SORT = ['newest', 'price_asc', 'price_desc', 'area_desc'] as const;
export type ListingSort = (typeof VALID_SORT)[number];

export interface ListingSelection {
  cidade: string;
  /** Slugs canônicos de tipo, na ordem do vocabulário (URL estável). */
  tipos: string[];
  /** Slugs de bairro (inclui o bairro vindo da rota /comprar/[bairro]). */
  bairros: string[];
  quartos: number | null;
  suites: number | null;
  garagens: number | null;
  precoMin: number | null;
  precoMax: number | null;
  comodidades: string[];
  zona: string;
  condominio: string;
  codigo: string;
  ordem: ListingSort;
}

export function emptySelection(): ListingSelection {
  return {
    cidade: '',
    tipos: [],
    bairros: [],
    quartos: null,
    suites: null,
    garagens: null,
    precoMin: null,
    precoMax: null,
    comodidades: [],
    zona: '',
    condominio: '',
    codigo: '',
    ordem: 'newest',
  };
}

// Posição de cada slug no vocabulário — serializa CSVs em ordem estável.
const TYPE_ORDER = new Map(PROPERTY_TYPES.map((t, i) => [t.slug, i]));

function first(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? '').trim();
}

function csv(v: string | string[] | undefined): string[] {
  const joined = Array.isArray(v) ? v.join(',') : v ?? '';
  return joined
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Inteiro positivo ou null (rejeita NaN, negativos e absurdos). */
function safeInt(v: string | string[] | undefined, max = 100_000_000): number | null {
  const s = first(v).replace(/[^\d]/g, ''); // tolera legado "4+" e "R$ 1.000"
  if (!s) return null;
  const n = parseInt(s, 10);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

/**
 * Normaliza uma lista de slugs de tipo (canônicos ou legados EN) para
 * slugs canônicos, sem duplicatas, na ordem do vocabulário.
 * Slug desconhecido é preservado (a query faz match direto na string).
 */
export function canonicalTypeSlugs(raw: string[]): string[] {
  const out: string[] = [];
  for (const r of raw) {
    const slug = findPropertyTypeBySlug(r)?.slug ?? r.toLowerCase();
    if (!out.includes(slug)) out.push(slug);
  }
  out.sort((a, b) => (TYPE_ORDER.get(a) ?? 999) - (TYPE_ORDER.get(b) ?? 999));
  return out;
}

/**
 * Lê os query params de uma listagem para o estado canônico.
 * `pathBairroSlug` é o bairro vindo da rota dinâmica /comprar/[bairro].
 */
export function parseListingSelection(
  sp: RawSearchParams,
  pathBairroSlug?: string
): ListingSelection {
  const bairros: string[] = [];
  for (const slug of [pathBairroSlug ?? '', ...csv(sp.bairros), ...csv(sp.bairro)]) {
    const clean = slug.trim().toLowerCase();
    if (clean && !bairros.includes(clean)) bairros.push(clean);
  }

  let precoMin = safeInt(sp.preco_min);
  let precoMax = safeInt(sp.preco_max);
  if (precoMin !== null && precoMax !== null && precoMin > precoMax) {
    [precoMin, precoMax] = [precoMax, precoMin];
  }

  const ordemRaw = first(sp.ordem);
  return {
    cidade: first(sp.cidade),
    tipos: canonicalTypeSlugs(csv(sp.tipo)),
    bairros,
    quartos: safeInt(sp.quartos, 20),
    suites: safeInt(sp.suites, 20),
    garagens: safeInt(sp.garagens, 20),
    precoMin,
    precoMax,
    comodidades: csv(sp.comodidades),
    zona: first(sp.zona),
    condominio: first(sp.condominio),
    codigo: first(sp.codigo),
    ordem: (VALID_SORT as readonly string[]).includes(ordemRaw)
      ? (ordemRaw as ListingSort)
      : 'newest',
  };
}

/** Converte os searchParams do client (URLSearchParams) pro formato de parse. */
export function rawFromSearchParams(sp: URLSearchParams): RawSearchParams {
  const raw: RawSearchParams = {};
  sp.forEach((value, key) => {
    const prev = raw[key];
    if (prev === undefined) raw[key] = value;
    else if (Array.isArray(prev)) prev.push(value);
    else raw[key] = [prev, value];
  });
  return raw;
}

/**
 * Serializa a seleção como query string, com TODOS os bairros no param
 * `bairros` (sem regra de path — quem decide path é buildListingHref).
 * Modo código: retorna só `codigo` (contrato de exclusividade).
 */
export function selectionQuery(sel: ListingSelection): URLSearchParams {
  const p = new URLSearchParams();
  if (sel.codigo.trim()) {
    p.set('codigo', sel.codigo.trim());
    return p;
  }
  if (sel.cidade) p.set('cidade', sel.cidade);
  if (sel.tipos.length) p.set('tipo', canonicalTypeSlugs(sel.tipos).join(','));
  if (sel.bairros.length) p.set('bairros', sel.bairros.join(','));
  if (sel.quartos) p.set('quartos', String(sel.quartos));
  if (sel.suites) p.set('suites', String(sel.suites));
  if (sel.garagens) p.set('garagens', String(sel.garagens));
  if (sel.precoMin) p.set('preco_min', String(sel.precoMin));
  if (sel.precoMax) p.set('preco_max', String(sel.precoMax));
  if (sel.comodidades.length) p.set('comodidades', sel.comodidades.join(','));
  if (sel.zona) p.set('zona', sel.zona);
  if (sel.condominio) p.set('condominio', sel.condominio);
  if (sel.ordem !== 'newest') p.set('ordem', sel.ordem);
  return p;
}

/**
 * Monta a URL de navegação de uma seleção, aplicando a regra SEO de bairro:
 *   0 bairros → /comprar        1 bairro → /comprar/[slug]        2+ → query
 * `pagina` nunca entra (aplicar filtros sempre volta pra página 1).
 */
export function buildListingHref(
  base: '/comprar' | '/alugar',
  sel: ListingSelection
): string {
  let path: string = base;
  let effective = sel;
  if (!sel.codigo.trim() && sel.bairros.length === 1) {
    path = `${base}/${sel.bairros[0]}`;
    effective = { ...sel, bairros: [] };
  }
  const q = selectionQuery(effective).toString();
  return q ? `${path}?${q}` : path;
}

/** Nº de valores de filtro ativos (badge dos botões e das seções). */
export function countSelectionValues(sel: ListingSelection): number {
  if (sel.codigo.trim()) return 1;
  return (
    sel.tipos.length +
    sel.bairros.length +
    sel.comodidades.length +
    (sel.cidade ? 1 : 0) +
    (sel.quartos ? 1 : 0) +
    (sel.suites ? 1 : 0) +
    (sel.garagens ? 1 : 0) +
    (sel.precoMin || sel.precoMax ? 1 : 0) +
    (sel.zona ? 1 : 0) +
    (sel.condominio ? 1 : 0)
  );
}

/** 1234567 → "1.234.567" (determinístico, sem depender de ICU). */
export function formatIntBR(n: number): string {
  return String(Math.trunc(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Rótulo do chip de preço: valores exatos, nunca abreviados. */
export function priceChipLabel(min: number | null, max: number | null): string {
  if (min && max) return `R$ ${formatIntBR(min)} – R$ ${formatIntBR(max)}`;
  if (min) return `A partir de R$ ${formatIntBR(min)}`;
  if (max) return `Até R$ ${formatIntBR(max)}`;
  return '';
}
