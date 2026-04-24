/**
 * Helpers para URLs de imagens do R2 (fotos de imóveis).
 * - toCdn: troca o domínio público do R2 (pub-*.r2.dev) pelo custom domain
 *   (img.independenceimoveis.com.br) — o mesmo objeto é servido nas duas URLs.
 * - getWatermarkedUrl: aponta para a versão em /wm/ (marca d'água gerada).
 */

const CDN_HOST = 'img.independenceimoveis.com.br';
const R2_PUBLIC_HOST_PATTERN = /https:\/\/pub-[a-z0-9]+\.r2\.dev/i;

export function toCdn(url: string): string {
  if (!url) return url;
  // Defesa: se uma URL no banco vier com `R2_PUBLIC_URL=` colado junto
  // (erro de env var no server), remove antes de processar.
  const cleaned = url.replace(/^[A-Z_][A-Z0-9_]*=/i, '');
  return cleaned.replace(R2_PUBLIC_HOST_PATTERN, `https://${CDN_HOST}`);
}

function isR2Url(url: string): boolean {
  return /r2\.dev/i.test(url) || url.includes(CDN_HOST);
}

export function getWatermarkedUrl(url: string): string {
  if (!url) return url;
  const cdn = toCdn(url);
  if (!isR2Url(cdn)) return cdn;

  const base = cdn.substring(0, cdn.lastIndexOf('/'));
  const filename = cdn.substring(cdn.lastIndexOf('/') + 1);
  // Já tem /wm/ — não duplica
  if (base.endsWith('/wm')) return cdn;
  // A rota /api/watermark-generate sempre produz WebP no /wm/,
  // independente do formato original (jpg/jpeg/png → webp).
  // Mantemos o nome mas normalizamos a extensão pra casar com o arquivo real.
  const wmFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  return `${base}/wm/${wmFilename}`;
}

/**
 * Converte array de imagens para versões watermarked (já no CDN custom).
 */
export function getWatermarkedImages(images: any[]): string[] {
  return images.map((img) => {
    const url = typeof img === 'string' ? img : img?.url || '';
    return getWatermarkedUrl(url);
  });
}
