'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const CITIES = [
  { label: 'Todas', value: '' },
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
const GARAGES = ['1', '2', '3+'];

export default function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Estado local dos filtros (inicializa da URL)
  const [selectedCity, setSelectedCity] = useState(searchParams.get('cidade') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('tipo') || '');
  const [selectedBedrooms, setSelectedBedrooms] = useState(searchParams.get('quartos') || '');
  const [selectedGarages, setSelectedGarages] = useState(searchParams.get('garagens') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('preco_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('preco_max') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('ordem') || 'newest');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Aplica filtros na URL
  function applyFilters(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams();

    const values: Record<string, string> = {
      cidade: selectedCity,
      tipo: selectedType,
      quartos: selectedBedrooms,
      garagens: selectedGarages,
      preco_min: priceMin,
      preco_max: priceMax,
      ordem: selectedSort,
      ...overrides,
    };

    Object.entries(values).forEach(([key, val]) => {
      if (val && val !== 'newest') {
        params.set(key, val);
      }
    });

    // Remove pagina ao mudar filtro
    params.delete('pagina');

    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
    setActiveFilter(null);
  }

  function clearFilters() {
    setSelectedCity('');
    setSelectedType('');
    setSelectedBedrooms('');
    setSelectedGarages('');
    setPriceMin('');
    setPriceMax('');
    setSelectedSort('newest');
    router.push(pathname);
  }

  const hasFilters = selectedCity || selectedType || selectedBedrooms || selectedGarages || priceMin || priceMax;

  const toggleFilter = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap gap-3 items-center sticky top-20 z-30 shadow-sm" ref={filterRef}>

      {/* Cidade */}
      <div className="relative">
        <button
          onClick={() => toggleFilter('cidade')}
          className={`flex items-center gap-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors ${selectedCity ? 'border-black text-black font-medium' : 'border-gray-200 text-gray-700'
            }`}
        >
          {selectedCity || 'Cidade'} <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'cidade' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-2 min-w-[220px] z-40">
            {CITIES.map(city => (
              <button
                key={city.value}
                onClick={() => {
                  setSelectedCity(city.value);
                  applyFilters({ cidade: city.value });
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedCity === city.value ? 'bg-gray-100 font-medium text-black' : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tipo */}
      <div className="relative">
        <button
          onClick={() => toggleFilter('tipo')}
          className={`flex items-center gap-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors ${selectedType ? 'border-black text-black font-medium' : 'border-gray-200 text-gray-700'
            }`}
        >
          {TYPES.find(t => t.value === selectedType)?.label || 'Tipo'} <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'tipo' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-2 min-w-[200px] z-40">
            <button
              onClick={() => {
                setSelectedType('');
                applyFilters({ tipo: '' });
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!selectedType ? 'bg-gray-100 font-medium text-black' : 'hover:bg-gray-50 text-gray-700'
                }`}
            >
              Todos
            </button>
            {TYPES.map(tipo => (
              <button
                key={tipo.value}
                onClick={() => {
                  setSelectedType(tipo.value);
                  applyFilters({ tipo: tipo.value });
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedType === tipo.value ? 'bg-gray-100 font-medium text-black' : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quartos */}
      <div className="relative">
        <button
          onClick={() => toggleFilter('quartos')}
          className={`flex items-center gap-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors ${selectedBedrooms ? 'border-black text-black font-medium' : 'border-gray-200 text-gray-700'
            }`}
        >
          {selectedBedrooms ? `${selectedBedrooms} quartos` : 'Quartos'} <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'quartos' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[240px] z-40">
            <div className="flex gap-2">
              {BEDROOMS.map(q => (
                <button
                  key={q}
                  onClick={() => {
                    const val = q === selectedBedrooms ? '' : q;
                    setSelectedBedrooms(val);
                    applyFilters({ quartos: val });
                  }}
                  className={`flex-1 py-2 text-sm border rounded-lg transition-colors ${selectedBedrooms === q ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'
                    }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preço */}
      <div className="relative">
        <button
          onClick={() => toggleFilter('preco')}
          className={`flex items-center gap-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors ${priceMin || priceMax ? 'border-black text-black font-medium' : 'border-gray-200 text-gray-700'
            }`}
        >
          {priceMin || priceMax ? 'Preço ✓' : 'Preço'} <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'preco' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[280px] z-40">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mínimo"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Máximo"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <button
              onClick={() => applyFilters()}
              className="w-full mt-3 bg-black text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {/* Mais filtros */}
      <div className="relative">
        <button
          onClick={() => toggleFilter('mais')}
          className={`flex items-center gap-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors ${selectedGarages ? 'border-black text-black font-medium' : 'border-gray-200 text-gray-700'
            }`}
        >
          Mais filtros <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'mais' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-5 min-w-[320px] z-40">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Vagas</span>
                <div className="flex gap-2">
                  {GARAGES.map(v => (
                    <button
                      key={v}
                      onClick={() => {
                        const val = v === selectedGarages ? '' : v;
                        setSelectedGarages(val);
                      }}
                      className={`flex-1 py-1.5 text-sm border rounded-lg transition-colors ${selectedGarages === v ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'
                        }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => applyFilters()}
                className="w-full bg-black text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Limpar */}
      {hasFilters && (
        <button onClick={clearFilters} className="text-xs text-brand-red font-medium hover:underline ml-2">
          Limpar filtros
        </button>
      )}

      {/* Ordenação */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-gray-500 hidden sm:inline">Ordenar por:</span>
        <select
          value={selectedSort}
          onChange={(e) => {
            setSelectedSort(e.target.value);
            applyFilters({ ordem: e.target.value });
          }}
          className="text-sm text-black font-medium border-0 bg-transparent focus:ring-0 cursor-pointer outline-none"
        >
          <option value="newest">Mais recentes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="area_desc">Maior área</option>
        </select>
      </div>
    </div>
  );
}