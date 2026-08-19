/**
 * Vídeo do imóvel — extração de id e política de exibição.
 *
 * `properties.video_url` NÃO guarda uma URL. Medido em produção em
 * 19/ago/2026: 634 imóveis preenchidos e **zero** no formato `/embed/`, que é
 * o único que o iframe do YouTube aceita. O que existe é texto colado pela
 * equipe — inclusive linhas com duas URLs, do tipo
 * "Corretores Independence Canal YouTube: <canal> Institucional: <vídeo>".
 * Por isso extraímos o id em vez de confiar no conteúdo do campo.
 */

/** Cobre youtu.be/ID, watch?v=ID (em qualquer posição), /shorts/ID e /embed/ID. */
const YOUTUBE_ID = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/;

/**
 * Vídeos que aparecem em dezenas de imóveis — institucional da imobiliária e
 * afins, colados como padrão no cadastro. Não são vídeo DAQUELE imóvel:
 * o primeiro id sozinho está em 203 imóveis (150 visíveis no site).
 *
 * Isto é remendo de dado, não regra de negócio: quando o cadastro for
 * limpo, a lista esvazia e some.
 */
export const VIDEOS_GENERICOS = new Set([
  'e578hOJAv3Q', // institucional — 203 imóveis
  'VzOq-_Aw85k', // 40 imóveis
  'o1EqQ0837Zg', // 39 imóveis
  'y6LtMCjLoLM', // 13 imóveis
  'HPf-vzEqwmw', // 13 imóveis
  'UWIOh8AXreI', // 9 imóveis
]);

/** Id do YouTube contido em qualquer texto, ou null. */
export function youtubeIdFrom(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = YOUTUBE_ID.exec(raw);
  return m ? m[1] : null;
}

/** URL de embed sem cookie de rastreio (o site tem consentimento a respeitar). */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/**
 * URL de embed a exibir na página do imóvel, ou null quando não há vídeo
 * próprio — inclui o caso de o campo apontar só para o canal, e o caso de
 * vídeo genérico repetido em massa.
 */
export function propertyVideoEmbed(raw: string | null | undefined): string | null {
  const id = youtubeIdFrom(raw);
  if (!id) return null;
  if (VIDEOS_GENERICOS.has(id)) return null;
  return youtubeEmbedUrl(id);
}
