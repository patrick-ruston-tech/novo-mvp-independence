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
// MAIN MIDDLEWARE
// ──────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
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

  // 4) Redirect de slugs legados em inglês via query (?tipo=apartment)
  const tipo = url.searchParams.get('tipo');
  if (tipo && Object.prototype.hasOwnProperty.call(LEGACY_TYPE_REDIRECTS, tipo)) {
    const target = url.clone();
    target.searchParams.set('tipo', LEGACY_TYPE_REDIRECTS[tipo]);
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
