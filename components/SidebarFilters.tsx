'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X, Check, MapPin, Home, DollarSign, BedDouble, Bath, Car, Sparkles, Building2 } from 'lucide-react';
import { PROPERTY_TYPE_GROUPS, FEATURES_FOR_FILTER, findPropertyTypeBySlug } from '@/lib/property-vocabulary';

const CITIES = [
  { label: 'Todas as cidades', value: '' },
  { label: 'São José dos Campos', value: 'São José dos Campos' },
  { label: 'Jacareí', value: 'Jacareí' },
  { label: 'Caçapava', value: 'Caçapava' },
];

const BEDROOMS = ['1', '2', '3', '4+'];
const SUITES = ['1', '2', '3+'];
const GARAGES = ['1', '2', '3', '4+'];

interface SidebarFiltersProps {
  transactionType: 'sale' | 'rent';
  neighborhoods?: { name: string; slug: string; city: string; property_count: number }[];
  /** Slug do bairro atual (vindo da rota /comprar/[bairro] ou /alugar/[bairro]) */
  currentNeighborhoodSlug?: string;
}

export default function SidebarFilters({ transactionType, neighborhoods = [], currentNeighborhoodSlug }: SidebarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const baseRoute = transactionType === 'sale' ? '/comprar' : '/alugar';

  const [selectedCity, setSelectedCity] = useState(searchParams.get('cidade') || '');
  // Normaliza slug legado (?tipo=apartment) para canônico PT (?tipo=apartamento)
  const [selectedType, setSelectedType] = useState(() => {
    const raw = searchParams.get('tipo') || '';
    return findPropertyTypeBySlug(raw)?.slug ?? raw;
  });
  const [selectedBedrooms, setSelectedBedrooms] = useState(searchParams.get('quartos') || '');
  const [selectedSuites, setSelectedSuites] = useState(searchParams.get('suites') || '');
  const [selectedGarages, setSelectedGarages] = useState(searchParams.get('garagens') || '');
  const [priceMin, setPriceMin] = useState(Number(searchParams.get('preco_min')) || 0);
  const [priceMax, setPriceMax] = useState(Number(searchParams.get('preco_max')) || (transactionType === 'sale' ? 20000000 : 15000));
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('comodidades')?.split(',').filter(Boolean) || []
  );
  // Bairro armazenado como slug. Pré-seleciona da URL dinâmica /comprar/[bairro] ou do query ?bairro=
  const [selectedNeighborhoodSlug, setSelectedNeighborhoodSlug] = useState(
    currentNeighborhoodSlug || searchParams.get('bairro') || ''
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const maxPrice = transactionType === 'sale' ? 20000000 : 15000;
  const priceStep = transactionType === 'sale' ? 100000 : 500;

  function formatPriceBR(value: number): string {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}mil`;
    return `R$ ${value}`;
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (selectedCity) params.set('cidade', selectedCity);
    if (selectedType) params.set('tipo', selectedType);
    if (selectedBedrooms) params.set('quartos', selectedBedrooms);
    if (selectedSuites) params.set('suites', selectedSuites);
    if (selectedGarages) params.set('garagens', selectedGarages);
    if (priceMin > 0) params.set('preco_min', String(priceMin));
    if (priceMax < maxPrice) params.set('preco_max', String(priceMax));
    if (selectedAmenities.length > 0) params.set('comodidades', selectedAmenities.join(','));

    params.delete('pagina');
    // Quando há bairro selecionado, navega para a rota dinâmica /comprar/[slug] (ou /alugar/[slug]).
    // Senão, navega para a raiz /comprar ou /alugar.
    const targetPath = selectedNeighborhoodSlug
      ? `${baseRoute}/${selectedNeighborhoodSlug}`
      : baseRoute;
    const query = params.toString();
    router.push(`${targetPath}${query ? `?${query}` : ''}`);
    setMobileOpen(false);
  }

  function clearFilters() {
    setSelectedCity('');
    setSelectedType('');
    setSelectedBedrooms('');
    setSelectedSuites('');
    setSelectedGarages('');
    setPriceMin(0);
    setPriceMax(maxPrice);
    setSelectedAmenities([]);
    setSelectedNeighborhoodSlug('');
    router.push(baseRoute);
    setMobileOpen(false);
  }

  const hasFilters = selectedCity || selectedType || selectedBedrooms || selectedSuites || selectedGarages || priceMin > 0 || priceMax < maxPrice || selectedNeighborhoodSlug || selectedAmenities.length > 0;

  const togglePill = (value: string, current: string, setter: (v: string) => void) => {
    setter(current === value ? '' : value);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-black flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
          Filtros
        </h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-brand-red font-medium hover:underline">
            Limpar tudo
          </button>
        )}
      </div>

      {/* Localização */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Localização
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
        >
          {CITIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Bairro */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <Building2 className="w-3.5 h-3.5" aria-hidden="true" /> Bairro
        </label>
        <select
          value={selectedNeighborhoodSlug}
          onChange={(e) => setSelectedNeighborhoodSlug(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
        >
          <option value="">Todos os bairros</option>
          {neighborhoods
            .filter(b => !selectedCity || b.city === selectedCity)
            .sort((a, b) => b.property_count - a.property_count)
            .map(b => (
              <option key={b.slug} value={b.slug}>
                {b.name} ({b.property_count})
              </option>
            ))
          }
        </select>
      </div>

      {/* Tipo de imóvel — agrupado por categoria */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <Home className="w-3.5 h-3.5" aria-hidden="true" /> Tipo de Imóvel
        </label>
        <div className="space-y-3">
          {PROPERTY_TYPE_GROUPS.map(group => (
            <div key={group.id}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                {group.labelPt}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {group.types.map(tipo => (
                  <button
                    key={tipo.slug}
                    onClick={() => togglePill(tipo.slug, selectedType, setSelectedType)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-[background-color,color,border-color] ${
                      selectedType === tipo.slug
                        ? 'bg-brand-red text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {tipo.labelPt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <DollarSign className="w-3.5 h-3.5" /> Faixa de Preço
        </label>

        {/* Desktop: Sliders */}
        <div className="hidden lg:block space-y-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Mín: <strong className="text-black">{formatPriceBR(priceMin)}</strong></span>
            <span className="text-gray-500">Máx: <strong className="text-black">{formatPriceBR(priceMax)}</strong></span>
          </div>
          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={priceStep}
              value={priceMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val < priceMax) setPriceMin(val);
              }}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-red"
            />
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={priceStep}
              value={priceMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > priceMin) setPriceMax(val);
              }}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-red"
            />
          </div>
        </div>

        {/* Mobile: Price range pills */}
        <div className="lg:hidden">
          {transactionType === 'sale' ? (
            <div className="flex flex-col gap-2">
              {[
                { label: 'Até R$ 500mil', min: 0, max: 500000 },
                { label: 'R$ 500mil - 1M', min: 500000, max: 1000000 },
                { label: 'R$ 1M - 2M', min: 1000000, max: 2000000 },
                { label: 'R$ 2M - 5M', min: 2000000, max: 5000000 },
                { label: 'R$ 5M - 10M', min: 5000000, max: 10000000 },
                { label: 'Acima de R$ 10M', min: 10000000, max: maxPrice },
              ].map((range) => {
                const isActive = priceMin === range.min && priceMax === range.max;
                return (
                  <button
                    key={range.label}
                    onClick={() => {
                      if (isActive) {
                        setPriceMin(0);
                        setPriceMax(maxPrice);
                      } else {
                        setPriceMin(range.min);
                        setPriceMax(range.max);
                      }
                    }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive
                        ? 'bg-brand-red text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[
                { label: 'Até R$ 1.500', min: 0, max: 1500 },
                { label: 'R$ 1.500 - 3.000', min: 1500, max: 3000 },
                { label: 'R$ 3.000 - 5.000', min: 3000, max: 5000 },
                { label: 'R$ 5.000 - 8.000', min: 5000, max: 8000 },
                { label: 'Acima de R$ 8.000', min: 8000, max: maxPrice },
              ].map((range) => {
                const isActive = priceMin === range.min && priceMax === range.max;
                return (
                  <button
                    key={range.label}
                    onClick={() => {
                      if (isActive) {
                        setPriceMin(0);
                        setPriceMax(maxPrice);
                      } else {
                        setPriceMin(range.min);
                        setPriceMax(range.max);
                      }
                    }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive
                        ? 'bg-brand-red text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quartos */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <BedDouble className="w-3.5 h-3.5" aria-hidden="true" /> Quartos
        </label>
        <div className="flex gap-2">
          {BEDROOMS.map(q => (
            <button
              key={q}
              onClick={() => togglePill(q, selectedBedrooms, setSelectedBedrooms)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-[background-color,color,border-color] ${
                selectedBedrooms === q
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Suítes */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <Bath className="w-3.5 h-3.5" aria-hidden="true" /> Suítes
        </label>
        <div className="flex gap-2">
          {SUITES.map(s => (
            <button
              key={s}
              onClick={() => togglePill(s, selectedSuites, setSelectedSuites)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-[background-color,color,border-color] ${
                selectedSuites === s
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Vagas */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <Car className="w-3.5 h-3.5" aria-hidden="true" /> Vagas de Garagem
        </label>
        <div className="flex gap-2">
          {GARAGES.map(v => (
            <button
              key={v}
              onClick={() => togglePill(v, selectedGarages, setSelectedGarages)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-[background-color,color,border-color] ${
                selectedGarages === v
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Comodidades */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Comodidades
        </label>
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {FEATURES_FOR_FILTER.map(amenity => {
            const id = `amenity-${amenity.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <label key={amenity} htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id={id}
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-[background-color,border-color] ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-brand-red border-brand-red'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {selectedAmenities.includes(amenity) && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
                </div>
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full bg-brand-red hover:bg-brand-dark-red text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
      >
        Aplicar Filtros
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[280px] flex-shrink-0">
        <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 pb-4">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filter Button - top bar */}
      <div className="lg:hidden w-full mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full bg-white border border-gray-200 text-black font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          Filtros {hasFilters ? '· Filtros ativos' : ''}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto h-full w-[340px] max-w-[90vw] bg-white shadow-2xl overflow-y-auto overscroll-contain p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-bold text-black">Filtros</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar filtros" className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}
