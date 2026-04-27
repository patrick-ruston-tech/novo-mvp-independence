import type { PropertyCard, PropertyType, TransactionType } from '@/types/property';
import { PROPERTY_TYPE_LABELS } from '@/types/property';

/**
 * Formata preço em BRL: R$ 1.200.000
 */
export function formatPrice(value: number | null): string {
  if (!value) return '';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formata área: 250 m²
 */
export function formatArea(value: number | null): string {
  if (!value) return '';
  return `${Math.round(value)} m²`;
}

/**
 * Sufixo compacto pra preço de locação ('/mês', '/dia', '/ano', '/sem').
 * Default '/mês' quando rent_type é null/vazio — comportamento histórico,
 * maioria dos imóveis. Usado em cards de listagem.
 */
export function rentSuffix(rentType: string | null | undefined): string {
  switch (rentType) {
    case 'Diária':
    case 'Diaria':
      return '/dia';
    case 'Semanal':
      return '/sem';
    case 'Anual':
      return '/ano';
    case 'Mensal':
    default:
      return '/mês';
  }
}

/**
 * Sufixo verboso pra preço de locação ('por mês', 'por dia', 'por ano',
 * 'por semana'). Usado na página de detalhe onde tem espaço pra prosa.
 */
export function rentSuffixLong(rentType: string | null | undefined): string {
  switch (rentType) {
    case 'Diária':
    case 'Diaria':
      return 'por dia';
    case 'Semanal':
      return 'por semana';
    case 'Anual':
      return 'por ano';
    case 'Mensal':
    default:
      return 'por mês';
  }
}

/**
 * Retorna o preço principal do imóvel conforme o tipo de transação.
 * Label de locação respeita rent_type (Diária/Mensal/Anual) — antes era
 * hardcoded '/mês' e imóveis de temporada apareciam errados.
 */
export function getMainPrice(property: PropertyCard, context?: 'sale' | 'rent'): {
  value: number | null;
  label: string;
} {
  const rentLabel = rentSuffix(property.rent_type);

  // Se tem contexto (página de comprar ou alugar), prioriza o preço desse contexto
  if (context === 'rent' && property.price_rent) {
    return { value: property.price_rent, label: rentLabel };
  }
  if (context === 'sale' && property.price_sale) {
    return { value: property.price_sale, label: '' };
  }

  // Fallback: comportamento padrão
  if (property.transaction_type === 'rent' && property.price_rent) {
    return { value: property.price_rent, label: rentLabel };
  }
  if (property.transaction_type === 'sale_rent') {
    if (context === 'rent' && property.price_rent) {
      return { value: property.price_rent, label: rentLabel };
    }
    if (property.price_sale) {
      return { value: property.price_sale, label: '' };
    }
    if (property.price_rent) {
      return { value: property.price_rent, label: rentLabel };
    }
  }
  if (property.price_sale) {
    return { value: property.price_sale, label: '' };
  }
  if (property.price_rent) {
    return { value: property.price_rent, label: rentLabel };
  }
  return { value: null, label: '' };
}

/**
 * Label do tipo de imóvel em PT-BR.
 */
export function getPropertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type] || type;
}

/**
 * Gera o título display para um card (fallback se title estiver ruim).
 */
export function getDisplayTitle(property: PropertyCard): string {
  const typeLabel = getPropertyTypeLabel(property.property_type as PropertyType);
  const rooms = property.bedrooms > 0 ? `${property.bedrooms} quarto${property.bedrooms > 1 ? 's' : ''}` : '';
  const area = property.living_area ? `${Math.round(property.living_area)} m²` : '';

  const parts = [typeLabel];
  if (rooms) parts.push(rooms);
  if (area) parts.push(area);
  parts.push(property.neighborhood);

  return parts.join(' · ');
}

/**
 * Gera a URL do imóvel.
 */
export function getPropertyUrl(slug: string): string {
  return `/imoveis/${slug}`;
}

/**
 * Gera a URL de listagem por transação e bairro.
 */
export function getListingUrl(
  transaction: 'comprar' | 'alugar',
  neighborhoodSlug?: string
): string {
  if (neighborhoodSlug) {
    return `/${transaction}/${neighborhoodSlug}`;
  }
  return `/${transaction}`;
}

/**
 * Retorna a imagem principal do imóvel (primeira com is_primary, ou a primeira).
 */
export function getPrimaryImage(
  images: { url: string; is_primary: boolean }[]
): string {
  if (!images || images.length === 0) {
    return 'https://picsum.photos/800/600'; // fallback
  }
  const primary = images.find((img) => img.is_primary);
  return primary?.url || images[0].url;
}

/**
 * Gera slug a partir de texto (para URLs).
 */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
