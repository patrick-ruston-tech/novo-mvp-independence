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
  return url.replace(R2_PUBLIC_HOST_PATTERN, `https://${CDN_HOST}`);
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
  return `${base}/wm/${filename}`;
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
