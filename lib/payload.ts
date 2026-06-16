// Cliente do blog (Payload CMS) — substitui o antigo lib/sanity.ts.
// O site consome o blog via REST do Payload. As imagens vêm do mesmo bucket R2
// do site (público em r2.dev), sob o prefixo blog/ — então não precisamos
// proxiar pelo servidor do CMS nem liberar host novo no next.config.

// URL do CMS (só usada pra chamadas REST). Em dev o blog roda na 3001.
const BLOG_CMS_URL = (process.env.BLOG_CMS_URL || 'http://localhost:3001').replace(/\/+$/, '');

// Bucket R2 público (o mesmo do site). Uploads do blog ficam em blog/<arquivo>.
const R2_BLOG_PREFIX = 'https://pub-f0095dfa5cc64e4592f43de7553ef5e2.r2.dev/blog';

export interface BlogImage {
  url: string;    // tamanho original
  card?: string;  // 768x512 (gerado pelo Payload)
  hero?: string;  // 1600x900 (gerado pelo Payload)
  alt?: string;
}

/**
 * Converte um doc de mídia do Payload nas URLs públicas do R2.
 * Aceita o objeto populado (depth >= 1); se vier só o id, retorna null.
 */
export function mediaToImage(media: unknown): BlogImage | null {
  if (!media || typeof media !== 'object') return null;
  const m = media as Record<string, any>;
  if (!m.filename) return null;
  const fileUrl = (filename?: string) => (filename ? `${R2_BLOG_PREFIX}/${filename}` : undefined);
  return {
    url: fileUrl(m.filename)!,
    card: fileUrl(m.sizes?.card?.filename),
    hero: fileUrl(m.sizes?.hero?.filename),
    alt: m.alt || undefined,
  };
}

/** GET na REST do Payload. Revalida a cada `revalidate` segundos (ISR). */
export async function payloadFetch(path: string, revalidate = 300): Promise<any> {
  const res = await fetch(`${BLOG_CMS_URL}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`Payload respondeu ${res.status} em ${path}`);
  return res.json();
}

export { BLOG_CMS_URL };
