'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X, Check, MapPin, Home, DollarSign, BedDouble, Bath, Car, Sparkles, Building2 } from 'lucide-react';

const CITIES = [
  { label: 'Todas as cidades', value: '' },
  { label: 'São José dos Campos', value: 'São José dos Campos' },
  { label: 'Jacareí', value: 'Jacareí' },
  { label: 'Caçapava', value: 'Caçapava' },
];

const TYPES = [
  { label: 'Apartamento', value: 'apartment' },
  { label: 'Casa', value: 'house' },
  { label: 'Sobrado', value: 'sobrado' },
  { label: 'Condomínio', value: 'condo' },
  { label: 'Terreno', value: 'land' },
  { label: 'Sala Comercial', value: 'office' },
];

const BEDROOMS = ['1', '2', '3', '4+'];
const SUITES = ['1', '2', '3+'];
const GARAGES = ['1', '2', '3', '4+'];

const AMENITIES = ['Piscina', 'Academia', 'Varanda Gourmet', 'Portaria 24h', 'Churrasqueira', 'Elevador'];

interface SidebarFiltersProps {
  transactionType: 'sale' | 'rent';
  neighborhoods?: { name: string; slug: string; city: string; property_count: number }[];
}

export default function SidebarFilters({ transactionType, neighborhoods = [] }: SidebarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCity, setSelectedCity] = useState(searchParams.get('cidade') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('tipo') || '');
  const [selectedBedrooms, setSelectedBedrooms] = useState(searchParams.get('quartos') || '');
  const [selectedSuites, setSelectedSuites] = useState(searchParams.get('suites') || '');
  const [selectedGarages, setSelectedGarages] = useState(searchParams.get('garagens') || '');
  const [priceMin, setPriceMin] = useState(Number(searchParams.get('preco_min')) || 0);
  const [priceMax, setPriceMax] = useState(Number(searchParams.get('preco_max')) || (transactionType === 'sale' ? 5000000 : 15000));
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(searchParams.get('bairro') || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  const maxPrice = transactionType === 'sale' ? 5000000 : 15000;
  const priceStep = transactionType === 'sale' ? 50000 : 500;

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
    if (selectedNeighborhood) params.set('bairro', selectedNeighborhood);

    params.delete('pagina');
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
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
    setSelectedNeighborhood('');
    router.push(pathname);
    setMobileOpen(false);
  }

  const hasFilters = selectedCity || selectedType || selectedBedrooms || selectedSuites || selectedGarages || priceMin > 0 || priceMax < maxPrice || selectedNeighborhood;

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
          <SlidersHorizontal className="w-5 h-5" />
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
          <MapPin className="w-3.5 h-3.5" /> Localização
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
          <Building2 className="w-3.5 h-3.5" /> Bairro
        </label>
        <select
          value={selectedNeighborhood}
          onChange={(e) => setSelectedNeighborhood(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
        >
          <option value="">Todos os bairros</option>
          {neighborhoods
            .filter(b => !selectedCity || b.city === selectedCity)
            .sort((a, b) => b.property_count - a.property_count)
            .map(b => (
              <option key={b.slug} value={b.name}>
                {b.name} ({b.property_count})
              </option>
            ))
          }
        </select>
      </div>

      {/* Tipo de imóvel */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <Home className="w-3.5 h-3.5" /> Tipo de Imóvel
        </label>
        <div className="flex flex-col gap-2">
          {TYPES.map(tipo => (
            <button
              key={tipo.value}
              onClick={() => togglePill(tipo.value, selectedType, setSelectedType)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedType === tipo.value
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <DollarSign className="w-3.5 h-3.5" /> Faixa de Preço
        </label>
        <div className="space-y-4">
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
      </div>

      {/* Quartos */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
          <BedDouble className="w-3.5 h-3.5" /> Quartos
        </label>
        <div className="flex gap-2">
          {BEDROOMS.map(q => (
            <button
              key={q}
              onClick={() => togglePill(q, selectedBedrooms, setSelectedBedrooms)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
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
          <Bath className="w-3.5 h-3.5" /> Suítes
        </label>
        <div className="flex gap-2">
          {SUITES.map(s => (
            <button
              key={s}
              onClick={() => togglePill(s, selectedSuites, setSelectedSuites)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
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
          <Car className="w-3.5 h-3.5" /> Vagas de Garagem
        </label>
        <div className="flex gap-2">
          {GARAGES.map(v => (
            <button
              key={v}
              onClick={() => togglePill(v, selectedGarages, setSelectedGarages)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
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
          <Sparkles className="w-3.5 h-3.5" /> Comodidades
        </label>
        <div className="space-y-2">
          {AMENITIES.map(amenity => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleAmenity(amenity)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-brand-red border-brand-red'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {selectedAmenities.includes(amenity) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
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

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="bg-brand-red text-white font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros {hasFilters ? '✓' : ''}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto h-full w-[340px] max-w-[90vw] bg-white shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-bold text-black">Filtros</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}
