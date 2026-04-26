/**
 * Lógica de roleta de distribuição de leads.
 *
 * Cada lead recebe UMA tag de roleta baseada nas características do
 * imóvel vinculado. Workflows no GHL ouvem a tag e disparam a respectiva
 * roleta de atendimento.
 *
 * Critérios (primeiro que bater ganha — hierarquia):
 *   1. Lançamento — is_launch=true OU property_type='Lançamento'
 *   2. Locação pura — transaction_type='rent'
 *   3. Venda < R$ 500.000 (inclui sale_rent — prioriza venda por ticket)
 *   4. Venda >= R$ 500.000 OU sem preço definido (fallback premium)
 *
 * Retorna null quando não há imóvel vinculado — lead cai no fluxo default
 * do GHL sem tag de roleta.
 */

export const ROULETTE_TAGS = {
  LANCAMENTO: 'roleta-lancamento',
  LOCACAO: 'roleta-locacao',
  VENDA_ATE_500K: 'roleta-venda-ate-500k',
  VENDA_ACIMA_500K: 'roleta-venda-acima-500k',
} as const;

export type RouletteTag = (typeof ROULETTE_TAGS)[keyof typeof ROULETTE_TAGS];

const VENDA_THRESHOLD = 500_000;

export interface RouletteCriteria {
  is_launch?: boolean | null;
  property_type?: string | null;
  transaction_type?: string | null;
  price_sale?: number | string | null;
}

export function getRouletteTag(
  p: RouletteCriteria | null | undefined
): RouletteTag | null {
  if (!p) return null;

  // 1. Lançamento tem precedência absoluta (corretores especialistas)
  if (p.is_launch === true || p.property_type === 'Lançamento') {
    return ROULETTE_TAGS.LANCAMENTO;
  }

  // 2. Locação pura — sale_rent NÃO entra aqui (cai em venda)
  if (p.transaction_type === 'rent') {
    return ROULETTE_TAGS.LOCACAO;
  }

  // 3 e 4. Venda — inclui sale_rent (imóvel pra venda OU aluguel,
  // priorizamos venda por ter ticket maior; corretor decide depois)
  const price = Number(p.price_sale ?? 0);
  if (price > 0 && price < VENDA_THRESHOLD) {
    return ROULETTE_TAGS.VENDA_ATE_500K;
  }

  // Sem preço definido (sob consulta) OU preço >= 500k
  return ROULETTE_TAGS.VENDA_ACIMA_500K;
}
