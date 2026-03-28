'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import type { Neighborhood } from '@/types/property';

interface SearchBlockProps {
  neighborhoods: Neighborhood[];
  stats: {
    total_sale: number;
    total_rent: number;
    total_neighborhoods: number;
  };
}

function QuickFilters({ mode, tipo, setTipo, quartos, setQuartos, precoMax, setPrecoMax, bairro, setBairro, neighborhoods }: {
  mode: string;
  tipo: string; setTipo: (v: string) => void;
  quartos: string; setQuartos: (v: string) => void;
  precoMax: string; setPrecoMax: (v: string) => void;
  bairro: string; setBairro: (v: string) => void;
  neighborhoods: { name: string; slug: string }[];
}) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const TYPES = [
    { label: 'Apartamento', value: 'apartment' },
    { label: 'Casa', value: 'house' },
    { label: 'Sobrado', value: 'sobrado' },
    { label: 'Terreno', value: 'land' },
  ];

  const BEDROOMS = ['1', '2', '3', '4+'];

  const PRICES = mode === 'comprar'
    ? [
        { label: 'Até R$ 500mil', value: '500000' },
        { label: 'Até R$ 1M', value: '1000000' },
        { label: 'Até R$ 2M', value: '2000000' },
        { label: 'Até R$ 5M', value: '5000000' },
        { label: 'Até R$ 10M', value: '10000000' },
        { label: 'Até R$ 15M', value: '15000000' },
        { label: 'Acima de R$ 15M', value: '15000001' },
      ]
    : [
        { label: 'Até R$ 2.000', value: '2000' },
        { label: 'Até R$ 3.500', value: '3500' },
        { label: 'Até R$ 5.000', value: '5000' },
        { label: 'Até R$ 10.000', value: '10000' },
        { label: 'Acima de R$ 10.000', value: '10001' },
      ];

  return (
    <div className="flex gap-2 mt-3 relative" ref={filterRef}>
      {/* Tipo */}
      <div className="relative flex-1">
        <button
          onClick={() => setOpenFilter(openFilter === 'tipo' ? null : 'tipo')}
          aria-expanded={openFilter === 'tipo'}
          className={`w-full flex items-center justify-center gap-1 border rounded-lg py-2 text-xs transition-colors truncate whitespace-nowrap overflow-hidden ${
            tipo ? 'border-brand-red text-brand-red font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          {tipo ? TYPES.find(t => t.value === tipo)?.label?.substring(0, 8) : 'Tipo'} <ChevronDown className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        </button>
        {openFilter === 'tipo' && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-1.5 z-50 min-w-[180px]">
            <button onClick={() => { setTipo(''); setOpenFilter(null); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${!tipo ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
              Todos
            </button>
            {TYPES.map(t => (
              <button key={t.value} onClick={() => { setTipo(t.value); setOpenFilter(null); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${tipo === t.value ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preço */}
      <div className="relative flex-1">
        <button
          onClick={() => setOpenFilter(openFilter === 'preco' ? null : 'preco')}
          aria-expanded={openFilter === 'preco'}
          className={`w-full flex items-center justify-center gap-1 border rounded-lg py-2 text-xs transition-colors truncate whitespace-nowrap overflow-hidden ${
            precoMax ? 'border-brand-red text-brand-red font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          {precoMax ? PRICES.find(p => p.value === precoMax)?.label : 'Preço'} <ChevronDown className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        </button>
        {openFilter === 'preco' && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-1.5 z-50 min-w-[180px]">
            <button onClick={() => { setPrecoMax(''); setOpenFilter(null); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${!precoMax ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
              Qualquer
            </button>
            {PRICES.map(p => (
              <button key={p.value} onClick={() => { setPrecoMax(p.value); setOpenFilter(null); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${precoMax === p.value ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quartos */}
      <div className="relative flex-1">
        <button
          onClick={() => setOpenFilter(openFilter === 'quartos' ? null : 'quartos')}
          aria-expanded={openFilter === 'quartos'}
          className={`w-full flex items-center justify-center gap-1 border rounded-lg py-2 text-xs transition-colors truncate whitespace-nowrap overflow-hidden ${
            quartos ? 'border-brand-red text-brand-red font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          {quartos ? `${quartos}q` : 'Quartos'} <ChevronDown className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        </button>
        {openFilter === 'quartos' && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-3 z-50 min-w-[200px]">
            <div className="grid grid-cols-4 gap-2">
              {BEDROOMS.map(q => (
                <button key={q} onClick={() => { setQuartos(quartos === q ? '' : q); setOpenFilter(null); }} className={`py-2.5 text-sm font-medium rounded-lg text-center ${quartos === q ? 'bg-brand-red text-white' : 'hover:bg-gray-50 border border-gray-200'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bairros */}
      <div className="relative flex-1">
        <button
          onClick={() => setOpenFilter(openFilter === 'bairros' ? null : 'bairros')}
          aria-expanded={openFilter === 'bairros'}
          className={`w-full flex items-center justify-center gap-1 border rounded-lg py-2 text-xs transition-colors truncate whitespace-nowrap overflow-hidden ${
            bairro ? 'border-brand-red text-brand-red font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          {bairro ? bairro.substring(0, 10) : 'Bairros'} <ChevronDown className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        </button>
        {openFilter === 'bairros' && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-1.5 z-50 min-w-[200px] max-h-[200px] overflow-y-auto">
            <button onClick={() => { setBairro(''); setOpenFilter(null); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${!bairro ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
              Todos
            </button>
            {neighborhoods.slice(0, 15).map(b => (
              <button key={b.slug} onClick={() => { setBairro(b.name); setOpenFilter(null); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg truncate ${bairro === b.name ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
                {b.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchBlock({ neighborhoods, stats }: SearchBlockProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'comprar' | 'alugar'>('comprar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [filterTipo, setFilterTipo] = useState('');
  const [filterQuartos, setFilterQuartos] = useState('');
  const [filterPrecoMax, setFilterPrecoMax] = useState('');
  const [filterBairro, setFilterBairro] = useState('');

  const filteredBairros = searchQuery.length > 0
    ? neighborhoods.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toUpperCase().match(/^[A-Z]{2}\d+/)
      )
    : [...neighborhoods]
        .sort((a, b) => b.property_count - a.property_count)
        .slice(0, 10);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filterTipo) params.set('tipo', filterTipo);
    if (filterQuartos) params.set('quartos', filterQuartos);
    if (filterPrecoMax) {
      if (filterPrecoMax === '15000001') {
        params.set('preco_min', '15000000');
      } else if (filterPrecoMax === '10001') {
        params.set('preco_min', '10000');
      } else {
        params.set('preco_max', filterPrecoMax);
      }
    }

    const codeMatch = searchQuery.toUpperCase().match(/^[A-Z]{2}\d+/);
    if (codeMatch) {
      params.set('codigo', searchQuery.toUpperCase());
      router.push(`/${mode}?${params.toString()}`);
      return;
    }

    // Bairro selected via QuickFilter dropdown
    if (filterBairro) {
      const selectedNeighborhood = neighborhoods.find(
        (b) => b.name === filterBairro
      );
      if (selectedNeighborhood) {
        const query = params.toString();
        router.push(`/${mode}/${selectedNeighborhood.slug}${query ? `?${query}` : ''}`);
        return;
      }
    }

    const selectedBairro = neighborhoods.find(
      (b) => b.name.toLowerCase() === searchQuery.toLowerCase()
    );

    if (selectedBairro) {
      const query = params.toString();
      router.push(`/${mode}/${selectedBairro.slug}${query ? `?${query}` : ''}`);
    } else {
      const query = params.toString();
      router.push(`/${mode}${query ? `?${query}` : ''}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="w-full max-w-[500px]">
      {/* Search Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-heading font-bold text-black text-center mb-1">
          Encontre seu próximo lar em
        </h2>
        <h3 className="text-xl font-heading font-bold text-black text-center mb-5">
          São José dos Campos e região
        </h3>

        {/* Toggle Comprar/Alugar */}
        <div className="flex bg-gray-50 rounded-xl p-1 mb-4">
          <button
            onClick={() => { setMode('comprar'); setFilterPrecoMax(''); }}
            className={`flex-1 py-2.5 text-sm rounded-lg transition-all ${
              mode === 'comprar'
                ? 'bg-black text-white font-semibold shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-black'
            }`}
          >
            Comprar
          </button>
          <button
            onClick={() => { setMode('alugar'); setFilterPrecoMax(''); }}
            className={`flex-1 py-2.5 text-sm rounded-lg transition-all ${
              mode === 'alugar'
                ? 'bg-black text-white font-semibold shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-black'
            }`}
          >
            Alugar
          </button>
        </div>

        {/* Input Bairro / Código */}
        <div className="relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400 w-4 h-4" aria-hidden="true" />
            <input
              type="text"
              name="busca"
              aria-label="Buscar por bairro ou código"
              autoComplete="off"
              placeholder="Digite o bairro ou Código. ex: Urbanova, Satélite…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-colors text-black"
            />
            <Search className="absolute right-4 text-gray-400 w-4 h-4 pointer-events-none" aria-hidden="true" />
          </div>

          {/* Dropdown Bairros */}
          {isDropdownOpen && filteredBairros.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-2 max-h-60 overflow-auto z-50">
              {filteredBairros.map((bairro) => (
                <button
                  key={bairro.slug}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                  onClick={() => {
                    setSearchQuery(bairro.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="font-medium text-black block">{bairro.name}</span>
                  <span className="text-xs text-gray-400 truncate block mt-0.5">
                    {bairro.city} · {bairro.property_count} {bairro.property_count === 1 ? 'imóvel' : 'imóveis'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick filters */}
        <QuickFilters
          mode={mode}
          tipo={filterTipo} setTipo={setFilterTipo}
          quartos={filterQuartos} setQuartos={setFilterQuartos}
          precoMax={filterPrecoMax} setPrecoMax={setFilterPrecoMax}
          bairro={filterBairro} setBairro={setFilterBairro}
          neighborhoods={neighborhoods}
        />

        {/* Botão Buscar */}
        <button
          onClick={handleSearch}
          className="w-full bg-brand-red hover:bg-brand-dark-red text-white font-semibold py-3.5 rounded-xl text-sm transition-colors mt-4"
        >
          Buscar imóveis
        </button>
      </div>

      {/* Glass Stats Panel */}
      <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
        <div className="grid grid-cols-3 divide-x divide-white/20">
          <div className="text-center px-2">
            <div className="text-2xl font-bold font-heading text-white">{stats.total_sale.toLocaleString('pt-BR')}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium mt-0.5">Imóveis à Venda</div>
          </div>
          <div className="text-center px-2">
            <div className="text-2xl font-bold font-heading text-white">{stats.total_rent}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium mt-0.5">Para Alugar</div>
          </div>
          <div className="text-center px-2">
            <div className="text-2xl font-bold font-heading text-white">{stats.total_neighborhoods}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium mt-0.5">Bairros Atendidos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
