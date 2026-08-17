/**
 * PRIVACIDADE DO ENDEREÇO PÚBLICO.
 *
 * Regra do cliente (17/ago/2026):
 *   - `hide_address = false` (mostrar): revela até a RUA — nunca o número.
 *   - `hide_address = true`  (ocultar): revela só o BAIRRO (+ cidade).
 *
 * O número do logradouro NUNCA vai pro site em nenhum dos dois casos, e a
 * precisão do mapa acompanha: raio de rua (~150m) ou de bairro (~600m), sem
 * pin exato — pin na coordenada da casa entrega o endereço mesmo com o
 * texto escondido.
 *
 * Header do imóvel e cards já mostravam apenas bairro + cidade; o vazamento
 * estava no mapa (popup com rua + número) e no JSON-LD (campo `address`
 * legado, que em parte da base guarda o logradouro).
 */

export type AddressPrecision = 'street' | 'neighborhood';

export interface AddressPrivacyInput {
  hide_address?: boolean | null;
  street?: string | null;
  street_number?: string | null;
  /** Campo legado: em parte da base guarda "Rua X" ou "Rua X, 123". */
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
}

/** Precisão pública permitida para o imóvel. */
export function addressPrecision(p: AddressPrivacyInput | null | undefined): AddressPrecision {
  return p?.hide_address ? 'neighborhood' : 'street';
}

/**
 * Remove número do logradouro de texto livre: "Rua X, 123" → "Rua X".
 * Só corta dígitos no FIM (nome com número no meio, como "Avenida 9 de
 * Julho", fica intacto). Em nome que termina em número ("Rua 25"), perder o
 * número é o lado seguro do erro.
 */
export function stripStreetNumber(s: string): string {
  return s
    .replace(/,?\s*n[o°.º]?\s*\d+.*$/i, '') // ", nº 123 apto 4"
    .replace(/,\s*\d+\s*$/, '')                  // ", 123"
    .replace(/\s+\d+\s*$/, '')                   // " 123"
    .replace(/[,\s]+$/, '')
    .trim();
}

/**
 * Endereço exibível publicamente, respeitando a flag.
 * Sempre sem número; com hide_address, sem rua também.
 */
export function publicAddressLabel(p: AddressPrivacyInput | null | undefined): string {
  if (!p) return '';
  const parts: string[] = [];
  if (addressPrecision(p) === 'street') {
    const logradouro = (p.street || p.address || '').trim();
    if (logradouro) parts.push(stripStreetNumber(logradouro));
  }
  if (p.neighborhood) parts.push(p.neighborhood);
  if (p.city) parts.push(p.city);
  return parts.filter(Boolean).join(', ');
}

/**
 * `streetAddress` do JSON-LD (schema.org). Undefined quando o endereço é
 * oculto — melhor omitir do que publicar rua no structured data do Google.
 */
export function schemaStreetAddress(p: AddressPrivacyInput | null | undefined): string | undefined {
  if (!p || addressPrecision(p) === 'neighborhood') return undefined;
  const logradouro = (p.street || p.address || '').trim();
  return logradouro ? stripStreetNumber(logradouro) : undefined;
}
