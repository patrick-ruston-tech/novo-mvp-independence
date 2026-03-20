# Auditoria de Segurança — Independence Imóveis

**Data:** 2026-03-20
**Stack:** Next.js 15 + Supabase + GoHighLevel
**Escopo:** Codebase completo (frontend, queries, API, integrações)

---

## Resumo Executivo

| Severidade | Qtd | Status |
|------------|-----|--------|
| CRITICAL | 2 | Corrigir imediatamente |
| HIGH | 5 | Corrigir esta semana |
| MEDIUM | 3 | Corrigir este mês |
| LOW | 4 | Backlog |

---

## Findings CRITICAL

### 1. Chaves de API expostas no `.env.local`

**Arquivo:** `.env.local`
**Tipo:** Secrets Exposure
**Risco:** Qualquer pessoa com acesso ao repositório pode acessar Supabase e GHL.

**Chaves expostas:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GHL_API_KEY`
- `GHL_LOCATION_ID`
- `GHL_PIPELINE_ID`, `GHL_STAGE_ID`

**Correção:**
1. Revogar todas as chaves expostas imediatamente (Supabase Dashboard + GHL)
2. Gerar novas chaves
3. Confirmar que `.env.local` está no `.gitignore`
4. Remover do histórico do git: `git filter-branch` ou `bfg`
5. Usar secrets do CI/CD (Vercel Environment Variables)

---

### 2. Parâmetro RPC sem validação de enum

**Arquivo:** `lib/queries.ts:395-399`
**Tipo:** Input Validation
**Risco:** `transactionType` vem de searchParams sem validação. Pode causar queries inesperadas.

```typescript
// ANTES (vulnerável)
const { data } = await supabase.rpc('get_top_neighborhoods', {
  p_transaction_type: transactionType,
});

// DEPOIS (seguro)
const validTypes = ['sale', 'rent'] as const;
if (!validTypes.includes(transactionType as any)) return [];

const { data } = await supabase.rpc('get_top_neighborhoods', {
  p_transaction_type: transactionType,
});
```

---

## Findings HIGH

### 3. Parâmetro `sort_by` sem validação

**Arquivos:** `app/comprar/page.tsx:110`, `app/alugar/page.tsx:110`, `app/comprar/[bairro]/page.tsx:56`, `app/alugar/[bairro]/page.tsx:56`
**Tipo:** Input Validation

```typescript
// ANTES
const sort_by = (resolvedParams.ordem as PropertyFiltersType['sort_by']) || 'newest';

// DEPOIS
const validSortOptions = ['newest', 'price_asc', 'price_desc', 'area_desc'] as const;
const sort_by = validSortOptions.includes(resolvedParams.ordem as any)
  ? (resolvedParams.ordem as PropertyFiltersType['sort_by'])
  : 'newest';
```

---

### 4. Parâmetros numéricos sem validação de range

**Arquivos:** `app/comprar/page.tsx:109-115`, `app/alugar/page.tsx:109-115`
**Tipo:** Input Validation
**Risco:** Valores negativos ou absurdos podem causar comportamento inesperado.

```typescript
// Criar helper de validação
function sanitizePositiveNumber(value: any, max?: number): number | undefined {
  const num = Number(value);
  if (isNaN(num) || num < 0) return undefined;
  if (max && num > max) return undefined;
  return num;
}

const page = sanitizePositiveNumber(resolvedParams.pagina, 10000) || 1;
const bedrooms_min = sanitizePositiveNumber(resolvedParams.quartos, 20);
const price_min = sanitizePositiveNumber(resolvedParams.preco_min, 100_000_000);
const price_max = sanitizePositiveNumber(resolvedParams.preco_max, 100_000_000);
```

---

### 5. Parâmetro `comodidades` sem whitelist

**Arquivo:** `lib/queries.ts:98-105`
**Tipo:** Input Validation
**Risco:** Strings arbitrárias passadas ao `.contains()` do Supabase.

```typescript
// ANTES
const comodidadesList = comodidades.split(',').filter(Boolean);

// DEPOIS
const VALID_AMENITIES = ['Piscina', 'Churrasqueira', 'Armários Planejados', 'Varanda', 'Elevador', 'Área Gourmet'];
const comodidadesList = comodidades.split(',').filter(a => VALID_AMENITIES.includes(a));
```

---

### 6. Strings não sanitizadas enviadas ao GHL

**Arquivo:** `lib/ghl.ts:136-143`
**Tipo:** Injection
**Risco:** Dados de formulário concatenados e enviados ao GHL API sem limpeza.

```typescript
function sanitizeGHLString(str: string): string {
  return str.replace(/['"<>]/g, '').trim().slice(0, 255);
}
```

---

### 7. Falta proteção CSRF nos formulários

**Arquivos:** `components/ContactForm.tsx`, `app/anunciar/AnunciarClient.tsx`
**Tipo:** CSRF
**Risco:** Formulários sem CSRF token. Next.js Server Actions protegem automaticamente quando usados via `<form action={}>`, mas a implementação atual usa FormData manual.

**Correção:** Migrar para `<form action={serverAction}>` nativo do Next.js que inclui CSRF automaticamente.

---

## Findings MEDIUM

### 8. `dangerouslySetInnerHTML` com dados do banco

**Arquivos:** `app/imoveis/[slug]/page.tsx:98-156`, `app/lancamentos/[slug]/page.tsx:71-84`, `app/layout.tsx:54-81`
**Tipo:** XSS (baixo risco — mitigado por JSON.stringify)
**Risco:** Se dados do banco contêm `</script>`, pode quebrar o JSON-LD.

```typescript
// Sanitizar antes de serializar
function safeJsonLd(obj: Record<string, any>): string {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}
```

---

### 9. iframe sem validação de URL

**Arquivo:** `app/lancamentos/[slug]/page.tsx:189-194`
**Tipo:** SSRF
**Risco:** URL de vídeo vem do banco sem validação. Pode carregar qualquer site.

```typescript
function isValidVideoUrl(url: string): boolean {
  const allowed = ['youtube.com', 'youtu.be', 'vimeo.com'];
  try {
    const parsed = new URL(url);
    return allowed.some(d => parsed.hostname.includes(d));
  } catch { return false; }
}

// Adicionar sandbox no iframe
<iframe src={url} sandbox="allow-presentation allow-same-origin allow-scripts" />
```

---

### 10. Remote image patterns muito amplos

**Arquivo:** `next.config.ts:13-30`
**Tipo:** Configuration
**Risco:** `picsum.photos` é um serviço de placeholder e não deveria estar em produção.

**Correção:** Remover `picsum.photos`, restringir pathname do R2 para `/images/**`.

---

## Findings LOW

### 11. Sem rate limiting nos Server Actions

**Arquivo:** `lib/actions.ts`
**Tipo:** DoS
**Correção:** Implementar rate limit por IP (5 req/min) nos endpoints `submitLeadAction` e `submitPropertyAction`.

### 12. Sem security headers

**Arquivo:** `next.config.ts`
**Tipo:** Configuration
**Correção:** Adicionar `headers()` com CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

### 13. Error disclosure no GHL

**Arquivo:** `lib/ghl.ts:50-64`
**Tipo:** Information Disclosure
**Correção:** Não logar `errorText` do GHL em produção. Retornar mensagem genérica ao usuário.

### 14. Sem maxLength nos inputs de formulário

**Arquivos:** `components/ContactForm.tsx`, `app/anunciar/AnunciarClient.tsx`
**Tipo:** Input Validation
**Correção:** Adicionar `maxLength={100}` em nome, `maxLength={2000}` em mensagem.

---

## Plano de Ação

### Imediato (hoje)
- [ ] Revogar todas as chaves expostas (Supabase + GHL)
- [ ] Confirmar `.env.local` no `.gitignore`
- [ ] Limpar histórico do git com `bfg` ou `git filter-branch`

### Esta semana
- [ ] Validar `transactionType` com whitelist
- [ ] Validar `sort_by` com whitelist
- [ ] Validar parâmetros numéricos com range
- [ ] Validar `comodidades` com whitelist
- [ ] Sanitizar strings do GHL
- [ ] Migrar forms para `<form action={}>` nativo

### Este mês
- [ ] Sanitizar JSON-LD contra `</script>`
- [ ] Validar URLs de iframe
- [ ] Restringir remote image patterns
- [ ] Adicionar security headers no next.config.ts
- [ ] Implementar rate limiting
- [ ] Adicionar maxLength nos inputs
- [ ] Remover error disclosure do GHL

---

## Notas

- O Supabase JS client usa queries parametrizadas internamente, o que mitiga SQL injection direta.
- Next.js Server Actions têm proteção CSRF built-in quando usados via `<form action={}>`.
- O `.env.local` **não** é commitado por padrão se estiver no `.gitignore`. Verificar se foi commitado acidentalmente.
