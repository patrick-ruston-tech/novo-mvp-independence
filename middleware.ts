import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_TYPE_REDIRECTS } from '@/lib/property-vocabulary';

/**
 * Middleware do site público.
 *
 * Redirect 301 de slugs legados em inglês (?tipo=apartment) para canônicos
 * em PT (?tipo=apartamento) — preserva backlinks/SEO antigos enquanto a URL
 * canônica fica 100% em português.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const tipo = url.searchParams.get('tipo');

  if (tipo && Object.prototype.hasOwnProperty.call(LEGACY_TYPE_REDIRECTS, tipo)) {
    const target = url.clone();
    target.searchParams.set('tipo', LEGACY_TYPE_REDIRECTS[tipo]);
    return NextResponse.redirect(target, 301);
  }

  return NextResponse.next();
}

// Limita o middleware às rotas onde o filtro pode aparecer.
// Inclui /comprar, /alugar e suas rotas dinâmicas /[bairro].
export const config = {
  matcher: ['/comprar', '/comprar/:path*', '/alugar', '/alugar/:path*'],
};
