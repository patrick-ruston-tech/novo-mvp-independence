import { NextResponse } from 'next/server';

/**
 * Health check simples — usado pra confirmar que o servidor Node está vivo.
 * Útil principalmente após o deploy na Hostinger (ou qualquer host) e
 * pra monitoramento externo (uptime checks).
 *
 * GET /api/healthz → 200 { ok: true, ts }
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      ts: new Date().toISOString(),
      env: process.env.NODE_ENV || 'unknown',
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
