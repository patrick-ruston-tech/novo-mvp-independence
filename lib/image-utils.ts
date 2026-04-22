/**
 * Converte URL de imagem original para versão com watermark.
 * properties/AP1234_INDEP/foto.webp → properties/AP1234_INDEP/wm/foto.webp
 */
export function getWatermarkedUrl(url: string): string {
  if (!url || !url.includes('r2.dev')) return url;

  const base = url.substring(0, url.lastIndexOf('/'));
  const filename = url.substring(url.lastIndexOf('/') + 1);
  return `${base}/wm/${filename}`;
}

/**
 * Converte array de imagens para versões watermarked.
 */
export function getWatermarkedImages(images: any[]): string[] {
  return images.map(img => {
    const url = typeof img === 'string' ? img : img?.url || '';
    return getWatermarkedUrl(url);
  });
}
