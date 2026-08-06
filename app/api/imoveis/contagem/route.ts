import { NextRequest, NextResponse } from 'next/server';
import { getPropertiesCount, selectionToPropertyFilters } from '@/lib/queries';
import { parseListingSelection, rawFromSearchParams } from '@/lib/listing-params';

/**
 * GET /api/imoveis/contagem?transacao=sale&tipo=casa,sobrado&bairros=...
 *
 * Contagem prévia de resultados pro botão "Ver N imóveis" da sidebar de
 * filtros. Recebe os MESMOS query params das listagens (contrato em
 * lib/listing-params) + `transacao` (sale|rent). Responde { total }.
 * HEAD count no Supabase — nenhuma linha trafega.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const transacao = sp.get('transacao') === 'rent' ? 'rent' : 'sale';

  const sel = parseListingSelection(rawFromSearchParams(sp));
  const filters = await selectionToPropertyFilters(sel, transacao);
  const total = await getPropertiesCount(filters);

  if (total === null) {
    return NextResponse.json({ error: 'count_failed' }, { status: 500 });
  }
  return NextResponse.json(
    { total },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
  );
}
