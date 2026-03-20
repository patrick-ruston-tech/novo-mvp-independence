# Auditoria Supabase/Postgres — Independence Imoveis

**Data:** 20/03/2026
**Projeto:** Independence Negocios Imobiliarios
**Stack:** Next.js 15 + Supabase (PostgREST) + RLS
**Referencia:** Supabase Postgres Best Practices (8 categorias, priorizadas por impacto)

---

## Resumo Executivo

O projeto segue boas praticas na maioria dos pontos: selecao de colunas parcial (`CARD_FIELDS`), cache com `unstable_cache` e `React.cache()`, queries paralelas com `Promise.all`, e uso de RPC para agregacoes complexas. Os principais gaps sao **indexes ausentes** (impacto critico em escala) e **`SELECT *` em queries de listagem** que poderiam ser otimizadas.

| Categoria | Status |
|-----------|--------|
| Query Performance (indexes) | Precisa atencao |
| Connection Management | OK (Supabase gerencia pooling) |
| Security & RLS | OK (anon key + RLS policies) |
| Schema Design | OK |
| Data Access Patterns | Pequenas melhorias |
| Monitoring | Recomendacoes |

---

## O que ja esta correto

| Pratica | Arquivo | Detalhes |
|---------|---------|----------|
| Selecao parcial de colunas | `lib/queries.ts` | `CARD_FIELDS` e `LAUNCH_CARD_FIELDS` evitam `SELECT *` em listagens |
| `Promise.all` para queries paralelas | `lib/queries.ts:369` | `getHomeStats` executa 3 counts simultaneos |
| `head: true` para count-only | `lib/queries.ts:370-372` | Nao retorna dados, so contagem |
| RPC para agregacao complexa | `lib/queries.ts:395` | `get_top_neighborhoods` — logica no banco, nao no app |
| `React.cache()` para dedup por request | `lib/queries.ts:151,278,429` | `getPropertyBySlug`, `getNeighborhoodBySlug`, `getLaunchBySlug` |
| `unstable_cache()` com TTL | `lib/queries.ts:175,256,366,467` | Cache cross-request para dados semi-estaticos |
| Sem N+1 queries | Todo o projeto | Nenhum loop de queries encontrado |
| Error handling consistente | Todo o projeto | Todos os blocos tem check de error com fallback |
| Mutations isoladas | `lib/queries.ts:305,330` | `createLead` e `createPropertySubmission` inserem de forma limpa |

---

## Issues Encontradas

### 1. [CRITICAL] Indexes ausentes nas colunas mais filtradas

**Impacto:** 100-1000x mais rapido em tabelas grandes. Sem indexes, toda query faz sequential scan (varredura completa da tabela).

**Evidencia:** As queries em `lib/queries.ts` filtram repetidamente por `status`, `transaction_type`, `neighborhood`, `featured`, `slug`, `is_discover`, `launch_id` — todas precisam de indexes.

**Queries afetadas:**

| Query | Colunas filtradas | Tipo de scan atual (provavel) |
|-------|-------------------|-------------------------------|
| `getProperties` | `status` + `transaction_type` + `neighborhood` + `price` + `bedrooms` | Seq Scan |
| `getFeaturedProperties` | `status` + `featured` | Seq Scan |
| `getPropertyBySlug` | `slug` + `status` | Seq Scan |
| `getSimilarProperties` | `status` + `neighborhood` + `transaction_type` | Seq Scan |
| `getDiscoverProperties` | `status` + `is_discover` | Seq Scan |
| `getLaunchProperties` | `launch_id` + `status` | Seq Scan |
| `getLaunchBySlug` | `slug` + `status` | Seq Scan |
| `getFeaturedLaunches` | `status` + `is_featured` | Seq Scan |

**SQL de correcao — executar no Supabase SQL Editor:**

```sql
-- =============================================
-- INDEXES PARA TABELA properties
-- =============================================

-- Composite: status + transaction_type (filtro mais usado em comprar/alugar)
CREATE INDEX IF NOT EXISTS idx_properties_status_transaction
  ON properties (status, transaction_type);

-- Partial: imoveis em destaque (featured = true somente entre ativos)
CREATE INDEX IF NOT EXISTS idx_properties_active_featured
  ON properties (featured)
  WHERE status = 'active';

-- Partial: imoveis descobrir (is_discover = true somente entre ativos)
CREATE INDEX IF NOT EXISTS idx_properties_active_discover
  ON properties (is_discover)
  WHERE status = 'active' AND is_discover = true;

-- Partial: busca por slug (sempre filtra status = active)
CREATE INDEX IF NOT EXISTS idx_properties_active_slug
  ON properties (slug)
  WHERE status = 'active';

-- Filtro por bairro (sempre com status = active)
CREATE INDEX IF NOT EXISTS idx_properties_active_neighborhood
  ON properties (neighborhood)
  WHERE status = 'active';

-- Filtro por launch_id (pagina de lancamento)
CREATE INDEX IF NOT EXISTS idx_properties_active_launch
  ON properties (launch_id)
  WHERE status = 'active';

-- Precos para ordenacao e filtro de range
CREATE INDEX IF NOT EXISTS idx_properties_active_price_sale
  ON properties (price_sale)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_properties_active_price_rent
  ON properties (price_rent)
  WHERE status = 'active';

-- GIN index para filtro de comodidades/features (operador @>)
CREATE INDEX IF NOT EXISTS idx_properties_features_gin
  ON properties USING GIN (features);

-- =============================================
-- INDEXES PARA TABELA launches
-- =============================================

-- Busca por slug (sempre filtra status = active)
CREATE INDEX IF NOT EXISTS idx_launches_active_slug
  ON launches (slug)
  WHERE status = 'active';

-- Listagem: status + is_featured + created_at (ordem da query getLaunches)
CREATE INDEX IF NOT EXISTS idx_launches_status_featured_created
  ON launches (status, is_featured DESC, created_at DESC);

-- =============================================
-- INDEXES PARA TABELA neighborhoods
-- =============================================

-- Busca por slug
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug
  ON neighborhoods (slug);

-- Ordenacao por property_count (listagem de bairros)
CREATE INDEX IF NOT EXISTS idx_neighborhoods_property_count
  ON neighborhoods (property_count DESC);

-- =============================================
-- INDEXES PARA TABELA leads
-- =============================================

-- Dedup de lead por telefone (usado em actions.ts)
CREATE INDEX IF NOT EXISTS idx_leads_phone
  ON leads (phone);

-- Busca por property_id (leads por imovel)
CREATE INDEX IF NOT EXISTS idx_leads_property_id
  ON leads (property_id)
  WHERE property_id IS NOT NULL;
```

**Prioridade:** 1 (executar imediatamente)

---

### 2. [MEDIUM-HIGH] Paginacao offset-based em `getProperties`

**Impacto:** Degradacao de performance em paginas profundas (pagina 50+).

**Evidencia:** `lib/queries.ts:125-127` usa `.range(from, to)` que traduz para `OFFSET/LIMIT`. O Postgres precisa escanear e descartar todas as rows ate o offset antes de retornar resultados.

**Exemplo de degradacao:**
- Pagina 1 (offset 0): escaneia 12 rows
- Pagina 50 (offset 588): escaneia 600 rows
- Pagina 500 (offset 5988): escaneia 6000 rows

**Recomendacao:**
Para o volume atual (< 5.000 imoveis), offset-based e aceitavel. Se o catalogo crescer para 10.000+, migrar para cursor-based pagination:

```typescript
// Cursor-based: passa o ultimo ID/created_at da pagina anterior
if (cursor) {
  query = query.lt('created_at', cursor).order('created_at', { ascending: false }).limit(per_page);
}
```

**Prioridade:** 3 (monitorar, agir se o catalogo crescer)

---

### 3. [MEDIUM] `SELECT *` em queries que nao precisam

**Impacto:** Transferencia de dados desnecessarios entre banco e aplicacao. Mais lento e mais memoria consumida.

**Queries afetadas:**

| Query | Arquivo:Linha | Correcao |
|-------|---------------|----------|
| `getLaunches()` | `lib/queries.ts:417` | Criar `LAUNCH_LIST_FIELDS` |
| `getLaunchProperties()` | `lib/queries.ts:449` | Usar `CARD_FIELDS` |
| `getNeighborhoods()` | `lib/queries.ts:259` | Selecionar `id, name, slug, city, property_count` |
| `getNeighborhoodBySlug()` | `lib/queries.ts:285` | Selecionar apenas colunas usadas |

**Correcao sugerida:**

```typescript
// getNeighborhoods — trocar select('*') por:
.select('id, name, slug, city, property_count')

// getLaunches — criar e usar:
const LAUNCH_LIST_FIELDS = `
  id, name, slug, neighborhood, city, description,
  price_from, construction_stage, total_units,
  cover_image, images, is_featured, status
`;

// getLaunchProperties — trocar select('*') por:
.select(CARD_FIELDS)
```

**Prioridade:** 2

---

### 4. [LOW] GIN index para campo `features` (array)

**Impacto:** O filtro de comodidades usa `.contains('features', [amenity])` que traduz para o operador `@>` do Postgres. Sem GIN index, cada `@>` faz sequential scan.

**Evidencia:** `lib/queries.ts:93-105` — filtro de features e comodidades.

**Nota:** Ja incluido no SQL de indexes acima (`idx_properties_features_gin`).

**Prioridade:** 1 (incluido no bloco de indexes)

---

### 5. [LOW] `sitemap.ts` cria cliente Supabase diretamente

**Impacto:** Baixo. Mas o `sitemap.ts` instancia um `createClient` direto em vez de usar o `createServerClient` padrao do projeto.

**Evidencia:** `app/sitemap.ts` importa de `@supabase/supabase-js` diretamente.

**Recomendacao:** Trocar para usar `createServerClient` de `@/lib/supabase/server` por consistencia. Se precisar de `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS, criar um `createAdminClient` separado.

**Prioridade:** 4

---

## Recomendacoes de Monitoramento

### Verificar se os indexes estao sendo usados

Apos criar os indexes, execute no Supabase SQL Editor:

```sql
-- Ver indexes existentes na tabela properties
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'properties'
ORDER BY indexname;

-- Ver se queries estao usando os indexes (rodar apos trafico real)
SELECT
  schemaname, relname, indexrelname,
  idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE relname IN ('properties', 'launches', 'neighborhoods', 'leads')
ORDER BY idx_scan DESC;

-- Identificar indexes nao utilizados (apos 1+ semanas de trafico)
SELECT
  schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND relname IN ('properties', 'launches', 'neighborhoods', 'leads');
```

### Verificar queries lentas

```sql
-- Top 10 queries mais lentas (requer pg_stat_statements habilitado)
SELECT
  query,
  calls,
  mean_exec_time::numeric(10,2) AS avg_ms,
  total_exec_time::numeric(10,2) AS total_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Verificar tamanho das tabelas

```sql
SELECT
  relname AS table_name,
  n_live_tup AS row_count,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
WHERE relname IN ('properties', 'launches', 'neighborhoods', 'leads', 'property_submissions')
ORDER BY n_live_tup DESC;
```

---

## Plano de Acao (priorizado)

| # | Acao | Impacto | Esforco | Prioridade |
|---|------|---------|---------|------------|
| 1 | Executar SQL de indexes no Supabase | CRITICAL | 5 min | Imediato |
| 2 | Trocar `SELECT *` por campos especificos | MEDIUM | 15 min | Esta semana |
| 3 | Padronizar cliente Supabase no sitemap.ts | LOW | 5 min | Quando possivel |
| 4 | Avaliar cursor-based pagination | MEDIUM-HIGH | 1-2h | Quando catalogo > 10k |
| 5 | Configurar pg_stat_statements | LOW-MEDIUM | 10 min | Esta semana |
| 6 | Monitorar uso dos indexes apos 1 semana | LOW | 5 min | Proxima semana |

---

## Conclusao

O projeto esta bem estruturado do lado da aplicacao. A principal lacuna e a **ausencia de indexes no banco de dados**, que e o fator #1 de performance em Postgres. Executar o bloco SQL de indexes acima deve trazer melhoria imediata e significativa, especialmente conforme o catalogo de imoveis cresce.
