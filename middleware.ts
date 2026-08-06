import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_TYPE_REDIRECTS } from '@/lib/property-vocabulary';

/**
 * Middleware do site público.
 *
 * Responsabilidades:
 *
 *  1) Redirect 301 de slugs legados em inglês (?tipo=apartment) para canônicos
 *     em PT (?tipo=apartamento). Preserva backlinks/SEO antigos enquanto a URL
 *     canônica fica 100% em português.
 *
 *  2) Redirect 301 de URLs do Superlogica (CRM antigo) para o novo padrão.
 *     Quando trocamos de plataforma o domínio se manteve, mas o esquema de
 *     URL mudou. Sem esses redirects, o Google encontra link antigo, retorna
 *     404 e despromove a página — perdendo todo SEO acumulado.
 *
 *     Padrões cobertos:
 *       /imoveis/para-alugar/{tipo}/{bairro}--{cidade}-{uf}  → /alugar/{bairro}
 *       /imoveis/a-venda/{tipo}/{bairro}--{cidade}-{uf}      → /comprar/{bairro}
 *       /imoveis/para-alugar (sem bairro)                    → /alugar
 *       /imoveis/a-venda (sem bairro)                        → /comprar
 *       /imovel/{slug}      (singular legado)                → /imoveis/{slug}
 *       /imoveis-a-venda   (URL raiz alternativa)            → /comprar
 *       /imoveis-para-alugar                                 → /alugar
 *
 *     Quando o Search Console mostrar URLs antigas que ainda dão 404,
 *     adicionar o padrão aqui.
 */

// ──────────────────────────────────────────────────────────────
// Helper: extrai o slug do bairro de "{bairro}--{cidade}-{uf}".
// Tolerante a falta de "--" (retorna a string toda como bairro).
// ──────────────────────────────────────────────────────────────
function extractBairroSlug(segment: string): string | null {
  if (!segment) return null;
  const [bairro] = segment.split('--');
  if (!bairro || bairro === segment) {
    // Sem "--": pode ser que o segmento seja só "{cidade}-uf" (tipo
    // "sao-jose-dos-campos-sp"). Heurística simples: se termina com -sp
    // / -rj / etc. e tem 4+ palavras, é cidade — não bairro.
    const looksLikeCityUf = /-[a-z]{2}$/i.test(bairro) && bairro.split('-').length >= 4;
    if (looksLikeCityUf) return null;
  }
  return bairro || null;
}

// ──────────────────────────────────────────────────────────────
// Resolve o destino para URLs antigas do Superlogica /imoveis/...
// Retorna o pathname novo, ou null se a URL não for legado.
// ──────────────────────────────────────────────────────────────
function legacyImoveisRedirect(pathname: string): string | null {
  // /imoveis/{transacao}[/{tipo}[/{bairro--cidade-uf}]]
  const match = pathname.match(
    /^\/imoveis\/(para-alugar|a-venda|para-comprar|para-vender|venda|aluguel|locacao|locação)(?:\/(.+?))?\/?$/i
  );
  if (!match) return null;

  const transacao = match[1].toLowerCase();
  const isRent = ['para-alugar', 'aluguel', 'locacao', 'locação'].includes(transacao);
  const target = isRent ? '/alugar' : '/comprar';

  const rest = match[2];
  if (!rest) return target;

  // rest pode ser:
  //   "apartamento"
  //   "apartamento/floradas-de-sao-jose--sao-jose-dos-campos-sp"
  //   "apartamento/floradas-de-sao-jose"
  //   "apartamento--sao-jose-dos-campos-sp"  (tipo direto com cidade)
  const parts = rest.split('/').filter(Boolean);

  if (parts.length === 1) {
    // Só tipo, sem bairro — vai pra listagem geral.
    // Em alguns casos parts[0] já é o "bairro--cidade-uf" (sem o tipo).
    // Tentamos extrair: se tiver "--" interpretamos como bairro.
    if (parts[0].includes('--')) {
      const bairro = extractBairroSlug(parts[0]);
      if (bairro) return `${target}/${bairro}`;
    }
    return target;
  }

  // parts[1] = bairro--cidade-uf
  const bairro = extractBairroSlug(parts[1]);
  return bairro ? `${target}/${bairro}` : target;
}

// ──────────────────────────────────────────────────────────────
// Redirects de paths "raiz" alternativos do Superlogica.
// ──────────────────────────────────────────────────────────────
const ROOT_PATH_REDIRECTS: Record<string, string> = {
  '/imoveis-a-venda': '/comprar',
  '/imoveis-para-alugar': '/alugar',
  '/imoveis-aluguel': '/alugar',
  '/imoveis-venda': '/comprar',
};

// ──────────────────────────────────────────────────────────────
// Redirect canônico de slug de imóvel.
// URLs antigas com PREÇO no slug (legado) → 301 pro slug atual (limpo).
// O permanentRedirect de página NÃO é honrado por este host (LiteSpeed, que
// também faz soft-404), então o 301 vai aqui no middleware, que funciona.
// Só dispara lookup quando o slug contém "por-r-" (marcador de preço, exclusivo
// de URLs antigas) — tráfego normal não faz nenhum fetch.
// ──────────────────────────────────────────────────────────────
async function canonicalSlugRedirect(pathname: string): Promise<string | null> {
  const m = pathname.match(/^\/imoveis\/([^/]+)\/?$/);
  if (!m) return null;
  const slug = m[1];
  if (!slug.includes('por-r-')) return null; // só slugs poluídos por preço
  const codeMatch = slug.match(/([a-z]{2,4}\d{3,}(?:-indep)?)$/i);
  if (!codeMatch) return null;
  const code = codeMatch[1].toUpperCase().replace(/-/g, '_');
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  try {
    const res = await fetch(
      `${base}/rest/v1/properties?external_id=eq.${encodeURIComponent(code)}&select=slug&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const canonical = rows?.[0]?.slug;
    if (canonical && canonical !== slug) return `/imoveis/${canonical}`;
  } catch {
    // falha de rede: não redireciona (a página ainda resolve pelo código)
  }
  return null;
}

// ──────────────────────────────────────────────────────────────
// MAIN MIDDLEWARE
// ──────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // 1) Redirects de path raiz fixos (mais rápido, não requer regex)
  if (ROOT_PATH_REDIRECTS[pathname]) {
    const target = url.clone();
    target.pathname = ROOT_PATH_REDIRECTS[pathname];
    return NextResponse.redirect(target, 301);
  }

  // 2) URLs legadas do Superlogica em /imoveis/{transacao}/...
  //    Importante: NÃO afeta /imoveis/{slug} de detalhe individual,
  //    porque o regex exige que o segmento após /imoveis/ seja
  //    literalmente "para-alugar", "a-venda" ou similar.
  const legacyDest = legacyImoveisRedirect(pathname);
  if (legacyDest) {
    const target = url.clone();
    target.pathname = legacyDest;
    return NextResponse.redirect(target, 301);
  }

  // 3) /imovel/{slug} (singular legado) → /imoveis/{slug} (plural canônico)
  if (pathname.startsWith('/imovel/')) {
    const target = url.clone();
    target.pathname = '/imoveis/' + pathname.slice('/imovel/'.length);
    return NextResponse.redirect(target, 301);
  }

  // 4) Redirect de slugs legados em inglês via query (?tipo=apartment).
  //    ?tipo= aceita CSV (?tipo=casa,sobrado) — mapeia item a item.
  const tipo = url.searchParams.get('tipo');
  if (tipo) {
    const parts = tipo.split(',');
    const mapped = parts.map((p) =>
      Object.prototype.hasOwnProperty.call(LEGACY_TYPE_REDIRECTS, p)
        ? LEGACY_TYPE_REDIRECTS[p]
        : p
    );
    if (mapped.some((m, i) => m !== parts[i])) {
      const target = url.clone();
      target.searchParams.set('tipo', mapped.join(','));
      return NextResponse.redirect(target, 301);
    }
  }

  // 5) Slug de imóvel com preço (legado) → 301 pro slug canônico atual.
  const canonicalDest = await canonicalSlugRedirect(pathname);
  if (canonicalDest) {
    const target = url.clone();
    target.pathname = canonicalDest;
    return NextResponse.redirect(target, 301);
  }

  return NextResponse.next();
}

// O matcher define quais rotas passam pelo middleware. Sem isso, ele rodaria
// em TUDO (inclusive _next/static, api, etc.) e teria custo desnecessário.
//
// Padrões cobertos:
//   /comprar, /alugar e suas rotas dinâmicas (filtro de query ?tipo)
//   /imoveis/* (URLs antigas do Superlogica E detalhe individual válido)
//   /imovel/* (singular legado)
//   /imoveis-a-venda, /imoveis-para-alugar (raiz alternativa)
export const config = {
  matcher: [
    '/comprar',
    '/comprar/:path*',
    '/alugar',
    '/alugar/:path*',
    '/imoveis/:path*',
    '/imovel/:path*',
    '/imoveis-a-venda',
    '/imoveis-para-alugar',
    '/imoveis-aluguel',
    '/imoveis-venda',
  ],
};
