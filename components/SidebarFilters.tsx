'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  SlidersHorizontal, X, Check, MapPin, Home, DollarSign, BedDouble,
  Sparkles, Search, ChevronDown, Loader2,
} from 'lucide-react';
import { PROPERTY_TYPE_GROUPS, FEATURES_FOR_FILTER } from '@/lib/property-vocabulary';
import {
  ListingSelection,
  parseListingSelection,
  rawFromSearchParams,
  buildListingHref,
  selectionQuery,
  countSelectionValues,
  formatIntBR,
} from '@/lib/listing-params';

const CITIES = [
  { label: 'Todas as cidades', value: '' },
  { label: 'São José dos Campos', value: 'São José dos Campos' },
  { label: 'Jacareí', value: 'Jacareí' },
  { label: 'Caçapava', value: 'Caçapava' },
];

// Presets de preço = atalhos que PREENCHEM os inputs Mín/Máx (não são um
// estado próprio). min/max null = extremidade aberta (sem limite).
const PRICE_PRESETS: Record<'sale' | 'rent', { label: string; min: number | null; max: number | null }[]> = {
  sale: [
    { label: 'Até 500 mil', min: null, max: 500_000 },
    { label: '500 mil – 1M', min: 500_000, max: 1_000_000 },
    { label: '1M – 2M', min: 1_000_000, max: 2_000_000 },
    { label: '2M – 5M', min: 2_000_000, max: 5_000_000 },
    { label: 'Acima de 5M', min: 5_000_000, max: null },
  ],
  rent: [
    { label: 'Até 1.500', min: null, max: 1_500 },
    { label: '1.500 – 3.000', min: 1_500, max: 3_000 },
    { label: '3.000 – 5.000', min: 3_000, max: 5_000 },
    { label: '5.000 – 8.000', min: 5_000, max: 8_000 },
    { label: 'Acima de 8.000', min: 8_000, max: null },
  ],
};

type SectionId = 'localizacao' | 'tipo' | 'preco' | 'quartos' | 'comodidades' | 'avancada';

interface NeighborhoodOption {
  name: string;
  slug: string;
  city: string;
  property_count: number;
  property_count_sale?: number;
  property_count_rent?: number;
}

interface SidebarFiltersProps {
  transactionType: 'sale' | 'rent';
  neighborhoods?: NeighborhoodOption[];
  condominiums?: { id: string; name: string; city: string | null; neighborhood: string | null; property_count: number }[];
  /** Zonas disponíveis (nome + contagem). Filtro por ?zona=<nome>. */
  zones?: { name: string; property_count: number }[];
  /** Slug do bairro atual (vindo da rota /comprar/[bairro] ou /alugar/[bairro]) */
  currentNeighborhoodSlug?: string;
}

// Busca tolerante a acento ("satelite" acha "Satélite")
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function SidebarFilters({
  transactionType,
  neighborhoods = [],
  condominiums = [],
  zones = [],
  currentNeighborhoodSlug,
}: SidebarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const baseRoute = transactionType === 'sale' ? '/comprar' : '/alugar';
  const searchKey = searchParams.toString();

  // ── Rascunho: estado canônico dos filtros, SEMPRE ressincronizado com a
  //    URL (Voltar do navegador, paginação e chips mudam a URL por fora).
  const applied = useMemo(
    () => parseListingSelection(rawFromSearchParams(searchParams), currentNeighborhoodSlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchKey, pathname, currentNeighborhoodSlug]
  );
  const [draft, setDraft] = useState<ListingSelection>(applied);
  useEffect(() => {
    setDraft(applied);
  }, [applied]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [bairroSearch, setBairroSearch] = useState('');
  const [showAllBairros, setShowAllBairros] = useState(false);
  const [bairroHint, setBairroHint] = useState('');
  const [priceHint, setPriceHint] = useState('');

  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>(() => ({
    localizacao: true,
    tipo: true,
    preco: true,
    quartos: true,
    // Fechadas por padrão, mas seção com seleção ativa nunca inicia fechada:
    comodidades: applied.comodidades.length > 0,
    avancada: !!(applied.zona || applied.condominio || applied.codigo.trim()),
  }));
  const toggleSection = (id: SectionId) =>
    setOpenSections((s) => ({ ...s, [id]: !s[id] }));

  const draftHref = buildListingHref(baseRoute, draft);
  const appliedHref = buildListingHref(baseRoute, applied);
  const isDirty = draftHref !== appliedHref;
  const draftCount = countSelectionValues(draft);
  const appliedCount = countSelectionValues(applied);
  const codigoMode = !!draft.codigo.trim();

  // ── Contagem prévia ("Ver N imóveis"): debounce 400ms, aborta a anterior,
  //    e em erro degrada silenciosamente pra "Aplicar filtros".
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!isDirty) {
      setCount(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const q = selectionQuery(draft);
        q.delete('ordem'); // ordenação não muda a contagem
        q.set('transacao', transactionType);
        const res = await fetch(`/api/imoveis/contagem?${q.toString()}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        setCount(typeof json.total === 'number' ? json.total : null);
      } catch {
        if (!ctrl.signal.aborted) setCount(null);
      }
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftHref, isDirty]);

  function applyFilters() {
    setMobileOpen(false);
    startTransition(() => {
      router.push(draftHref);
    });
  }

  function clearFilters() {
    setMobileOpen(false);
    startTransition(() => {
      router.push(baseRoute);
    });
  }

  function patch(p: Partial<ListingSelection>) {
    setDraft((d) => ({ ...d, ...p }));
    setPriceHint('');
    setBairroHint('');
  }

  // ── Localização ────────────────────────────────────────────────────────
  function handleCidade(cidade: string) {
    // Bairro de outra cidade não pode continuar selecionado
    const kept = cidade
      ? draft.bairros.filter((slug) => {
          const nb = neighborhoods.find((n) => n.slug === slug);
          return nb ? nb.city === cidade : true;
        })
      : draft.bairros;
    const removed = draft.bairros.length - kept.length;
    setBairroHint(
      removed > 0
        ? removed === 1
          ? '1 bairro foi removido por ser de outra cidade.'
          : `${removed} bairros foram removidos por serem de outra cidade.`
        : ''
    );
    setDraft((d) => ({ ...d, cidade, bairros: kept }));
  }

  function toggleBairro(slug: string) {
    setBairroHint('');
    setDraft((d) => ({
      ...d,
      bairros: d.bairros.includes(slug)
        ? d.bairros.filter((s) => s !== slug)
        : [...d.bairros, slug],
    }));
  }

  const transactionCount = (b: NeighborhoodOption) =>
    transactionType === 'sale'
      ? b.property_count_sale ?? b.property_count
      : b.property_count_rent ?? b.property_count;

  // Bairros com imóvel visível nesta transação, na cidade escolhida
  const bairroOptions = useMemo(
    () =>
      neighborhoods
        .filter((b) => transactionCount(b) > 0 && (!draft.cidade || b.city === draft.cidade))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [neighborhoods, draft.cidade, transactionType]
  );

  // Selecionados sempre visíveis no topo (mesmo se saíram da lista filtrada)
  const selectedBairros = draft.bairros.map((slug) => {
    const nb = neighborhoods.find((n) => n.slug === slug);
    return { slug, name: nb?.name ?? slug, count: nb ? transactionCount(nb) : null };
  });
  const unselectedBairros = useMemo(() => {
    const selected = new Set(draft.bairros);
    const term = normalize(bairroSearch.trim());
    return bairroOptions.filter(
      (b) => !selected.has(b.slug) && (!term || normalize(b.name).includes(term))
    );
  }, [bairroOptions, draft.bairros, bairroSearch]);
  const bairrosExpanded = showAllBairros || bairroSearch.trim().length > 0;
  const visibleBairros = bairrosExpanded ? unselectedBairros : unselectedBairros.slice(0, 8);
  const hiddenBairroCount = unselectedBairros.length - visibleBairros.length;

  // ── Tipo (multi) ───────────────────────────────────────────────────────
  function toggleTipo(slug: string) {
    setDraft((d) => ({
      ...d,
      tipos: d.tipos.includes(slug) ? d.tipos.filter((s) => s !== slug) : [...d.tipos, slug],
    }));
  }

  // ── Preço ──────────────────────────────────────────────────────────────
  function normalizePrices() {
    if (draft.precoMin !== null && draft.precoMax !== null && draft.precoMin > draft.precoMax) {
      setDraft((d) => ({ ...d, precoMin: d.precoMax, precoMax: d.precoMin }));
      setPriceHint('O mínimo era maior que o máximo — os valores foram invertidos.');
    }
  }
  const presets = PRICE_PRESETS[transactionType];

  // ── Badges por seção ───────────────────────────────────────────────────
  const badges: Record<SectionId, number> = {
    localizacao: (draft.cidade ? 1 : 0) + draft.bairros.length,
    tipo: draft.tipos.length,
    preco: draft.precoMin || draft.precoMax ? 1 : 0,
    quartos: (draft.quartos ? 1 : 0) + (draft.suites ? 1 : 0) + (draft.garagens ? 1 : 0),
    comodidades: draft.comodidades.length,
    avancada: (draft.zona ? 1 : 0) + (draft.condominio ? 1 : 0) + (codigoMode ? 1 : 0),
  };

  // ── Refs do drawer (a11y) ──────────────────────────────────────────────
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    };
  }, [mobileOpen]);

  // ── Sub-renderizadores (recebem prefixo pra não duplicar IDs entre a
  //    sidebar desktop e o drawer mobile, que montam o mesmo conteúdo) ────

  const pillClass = (active: boolean) =>
    `px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-[background-color,color,border-color] ${
      active
        ? 'bg-brand-red text-white'
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
    }`;

  function checkRow(opts: {
    id: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    sub?: string;
  }) {
    return (
      // `relative` no label: input sr-only sem ancestral posicionado ancora no
      // documento e o foco rola a página pro lugar errado.
      <label key={opts.id} htmlFor={opts.id} className="relative flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          id={opts.id}
          checked={opts.checked}
          onChange={opts.onChange}
          className="peer sr-only"
        />
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-[background-color,border-color] peer-focus-visible:ring-2 peer-focus-visible:ring-brand-red/40 peer-focus-visible:ring-offset-1 ${
            opts.checked ? 'bg-brand-red border-brand-red' : 'border-gray-300 group-hover:border-gray-400'
          }`}
        >
          {opts.checked && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
        </div>
        <span className="text-sm text-gray-700 min-w-0 truncate">
          {opts.label}
          {opts.sub ? <span className="text-gray-400"> {opts.sub}</span> : null}
        </span>
      </label>
    );
  }

  function minRow(
    prefix: string,
    label: string,
    options: number[],
    value: number | null,
    onSelect: (v: number | null) => void
  ) {
    return (
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
          {label}
        </div>
        <div className="flex gap-2" role="group" aria-label={`${label} (mínimo)`}>
          {options.map((n) => (
            <button
              key={`${prefix}-${label}-${n}`}
              type="button"
              aria-pressed={value === n}
              onClick={() => onSelect(value === n ? null : n)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-[background-color,color,border-color] ${
                value === n
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>
    );
  }

  function section(
    id: SectionId,
    title: string,
    Icon: typeof MapPin,
    children: React.ReactNode
  ) {
    const open = openSections[id];
    return (
      <div className="border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {title}
          </span>
          <span className="flex items-center gap-1.5">
            {badges[id] > 0 && (
              <span className="bg-brand-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {badges[id]}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </span>
        </button>
        {open && <div className="mt-3">{children}</div>}
      </div>
    );
  }

  function priceInput(opts: {
    id: string;
    label: string;
    value: number | null;
    placeholder: string;
    onChange: (v: number | null) => void;
  }) {
    return (
      <div className="flex-1 min-w-0">
        <label htmlFor={opts.id} className="block text-[11px] font-semibold text-gray-500 mb-1">
          {opts.label}
        </label>
        <input
          id={opts.id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={opts.value === null ? '' : `R$ ${formatIntBR(opts.value)}`}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
            setPriceHint('');
            opts.onChange(digits ? parseInt(digits, 10) : null);
          }}
          onBlur={normalizePrices}
          placeholder={opts.placeholder}
          aria-describedby={`${opts.id}-desc`}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none placeholder:text-gray-400"
        />
        <span id={`${opts.id}-desc`} className="sr-only">
          Valor em reais
        </span>
      </div>
    );
  }

  function renderSections(prefix: string) {
    return (
      <div className="space-y-4">
        {/* Filtros "normais" — atenuados quando a busca é por código */}
        <div className={`space-y-4 ${codigoMode ? 'opacity-50' : ''}`}>
          {section(
            'localizacao',
            'Localização',
            MapPin,
            <div className="space-y-4">
              <div>
                <label htmlFor={`${prefix}-cidade`} className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Cidade
                </label>
                <select
                  id={`${prefix}-cidade`}
                  value={draft.cidade}
                  onChange={(e) => handleCidade(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${prefix}-bairro-busca`} className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Bairros
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id={`${prefix}-bairro-busca`}
                    type="text"
                    value={bairroSearch}
                    onChange={(e) => setBairroSearch(e.target.value)}
                    placeholder="Buscar bairro..."
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {selectedBairros.map((b) =>
                    checkRow({
                      id: `${prefix}-bairro-${b.slug}`,
                      checked: true,
                      onChange: () => toggleBairro(b.slug),
                      label: b.name,
                      sub: b.count !== null ? `(${b.count})` : undefined,
                    })
                  )}
                  {visibleBairros.map((b) =>
                    checkRow({
                      id: `${prefix}-bairro-${b.slug}`,
                      checked: false,
                      onChange: () => toggleBairro(b.slug),
                      label: b.name,
                      sub: `(${transactionCount(b)})`,
                    })
                  )}
                  {visibleBairros.length === 0 && selectedBairros.length === 0 && (
                    <p className="text-xs text-gray-400">Nenhum bairro encontrado.</p>
                  )}
                </div>
                {hiddenBairroCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBairros(true)}
                    className="mt-2 text-xs text-brand-red font-medium hover:underline"
                  >
                    Ver todos os bairros ({unselectedBairros.length})
                  </button>
                )}
                {bairrosExpanded && !bairroSearch && unselectedBairros.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBairros(false)}
                    className="mt-2 text-xs text-gray-400 font-medium hover:underline"
                  >
                    Ver menos
                  </button>
                )}
                {bairroHint && <p className="mt-2 text-xs text-amber-600">{bairroHint}</p>}
              </div>
            </div>
          )}

          {section(
            'tipo',
            'Tipo de Imóvel',
            Home,
            <div className="space-y-3">
              {PROPERTY_TYPE_GROUPS.map((group) => (
                <div key={group.id}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    {group.labelPt}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.types.map((tipo) => {
                      const active = draft.tipos.includes(tipo.slug);
                      return (
                        <button
                          key={`${prefix}-${tipo.slug}`}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleTipo(tipo.slug)}
                          className={pillClass(active)}
                        >
                          <span className="flex items-center gap-1">
                            {active && <Check className="w-3 h-3 flex-shrink-0" aria-hidden="true" />}
                            {tipo.labelPt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-gray-400">Selecione quantos tipos quiser.</p>
            </div>
          )}

          {section(
            'preco',
            'Faixa de Preço',
            DollarSign,
            <div className="space-y-3">
              <div className="flex gap-2">
                {priceInput({
                  id: `${prefix}-preco-min`,
                  label: 'Mínimo',
                  value: draft.precoMin,
                  placeholder: 'R$ 0',
                  onChange: (v) => setDraft((d) => ({ ...d, precoMin: v })),
                })}
                {priceInput({
                  id: `${prefix}-preco-max`,
                  label: 'Máximo',
                  value: draft.precoMax,
                  placeholder: 'Sem limite',
                  onChange: (v) => setDraft((d) => ({ ...d, precoMax: v })),
                })}
              </div>
              {priceHint && <p className="text-xs text-amber-600">{priceHint}</p>}
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => {
                  const active = draft.precoMin === p.min && draft.precoMax === p.max;
                  return (
                    <button
                      key={`${prefix}-${p.label}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setPriceHint('');
                        setDraft((d) => ({
                          ...d,
                          precoMin: active ? null : p.min,
                          precoMax: active ? null : p.max,
                        }));
                      }}
                      className={pillClass(active)}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {section(
            'quartos',
            'Quartos e Vagas',
            BedDouble,
            <div className="space-y-4">
              {minRow(prefix, 'Quartos', [1, 2, 3, 4], draft.quartos, (v) => patch({ quartos: v }))}
              {minRow(prefix, 'Suítes', [1, 2, 3], draft.suites, (v) => patch({ suites: v }))}
              {minRow(prefix, 'Vagas de garagem', [1, 2, 3, 4], draft.garagens, (v) =>
                patch({ garagens: v })
              )}
            </div>
          )}

          {section(
            'comodidades',
            'Comodidades',
            Sparkles,
            <div>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {FEATURES_FOR_FILTER.map((amenity) =>
                  checkRow({
                    id: `${prefix}-amenity-${amenity.replace(/\s+/g, '-').toLowerCase()}`,
                    checked: draft.comodidades.includes(amenity),
                    onChange: () =>
                      setDraft((d) => ({
                        ...d,
                        comodidades: d.comodidades.includes(amenity)
                          ? d.comodidades.filter((a) => a !== amenity)
                          : [...d.comodidades, amenity],
                      })),
                    label: amenity,
                  })
                )}
              </div>
              <p className="mt-2 text-[11px] text-gray-400">
                Mostra imóveis com todas as comodidades selecionadas.
              </p>
            </div>
          )}
        </div>

        {section(
          'avancada',
          'Busca Avançada',
          Search,
          <div className="space-y-4">
            {zones.length > 0 && (
              <div className={codigoMode ? 'opacity-50' : ''}>
                <label htmlFor={`${prefix}-zona`} className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Zona
                </label>
                <select
                  id={`${prefix}-zona`}
                  value={draft.zona}
                  onChange={(e) => patch({ zona: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                >
                  <option value="">Todas as zonas</option>
                  {zones.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name} ({z.property_count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {condominiums.length > 0 && (
              <div className={codigoMode ? 'opacity-50' : ''}>
                <label htmlFor={`${prefix}-condominio`} className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Condomínio
                </label>
                <select
                  id={`${prefix}-condominio`}
                  value={draft.condominio}
                  onChange={(e) => patch({ condominio: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                >
                  <option value="">Todos os condomínios</option>
                  {condominiums
                    .filter((c) => !draft.cidade || c.city === draft.cidade)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.neighborhood ? ` · ${c.neighborhood}` : ''} ({c.property_count})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor={`${prefix}-codigo`} className="block text-[11px] font-semibold text-gray-500 mb-1">
                Código do imóvel
              </label>
              <input
                id={`${prefix}-codigo`}
                type="text"
                value={draft.codigo}
                onChange={(e) => setDraft((d) => ({ ...d, codigo: e.target.value }))}
                placeholder="Ex: AP1234"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none placeholder:text-gray-400"
              />
              <p className="mt-1.5 text-[11px] text-gray-400">
                {codigoMode
                  ? 'Buscando por código — os demais filtros serão ignorados.'
                  : 'O código identifica um imóvel específico e ignora os demais filtros.'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  function applyButton(extraClass: string) {
    let label: React.ReactNode;
    let disabled = false;
    if (isPending) {
      disabled = true;
      label = (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Aplicando…
        </span>
      );
    } else if (!isDirty) {
      disabled = true;
      label = draftCount > 0 ? 'Filtros aplicados' : 'Aplicar filtros';
    } else if (count === null) {
      label = 'Aplicar filtros';
    } else if (count === 0) {
      label = 'Nenhum imóvel encontrado';
    } else {
      label = `Ver ${count} ${count === 1 ? 'imóvel' : 'imóveis'}`;
    }
    return (
      <>
        <button
          type="button"
          onClick={applyFilters}
          disabled={disabled}
          className={`bg-brand-red hover:bg-brand-dark-red disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors ${extraClass}`}
        >
          {label}
        </button>
        <span className="sr-only" aria-live="polite">
          {isDirty && count !== null
            ? `${count} ${count === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`
            : ''}
        </span>
      </>
    );
  }

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-[280px] flex-shrink-0">
        <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-black flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
              Filtros
            </h2>
            {(draftCount > 0 || appliedCount > 0) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-brand-red font-medium hover:underline"
              >
                Limpar tudo
              </button>
            )}
          </div>
          {renderSections('d')}
          {/* Botão gruda no fim da área de scroll da sidebar */}
          <div className="sticky bottom-0 bg-white pt-3 pb-4">{applyButton('w-full')}</div>
        </div>
      </aside>

      {/* Botão mobile — barra no topo da listagem */}
      <div className="lg:hidden w-full mb-4">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full bg-white border border-gray-200 text-black font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          Filtros
          {appliedCount > 0 && (
            <span className="bg-brand-red text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
              {appliedCount}
            </span>
          )}
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div
            ref={drawerRef}
            className="relative ml-auto h-full w-[340px] max-w-[90vw] bg-white shadow-2xl flex flex-col"
          >
            {/* Header fixo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-heading font-bold text-black">
                Filtros{draftCount > 0 ? ` (${draftCount})` : ''}
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar filtros"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {/* Conteúdo rolável */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
              {renderSections('m')}
            </div>
            {/* Rodapé fixo: Limpar + Aplicar sempre visíveis */}
            <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Limpar
              </button>
              {applyButton('flex-1')}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
