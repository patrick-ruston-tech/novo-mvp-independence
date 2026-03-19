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

export default function SearchBlock({ neighborhoods, stats }: SearchBlockProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'comprar' | 'alugar'>('comprar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredBairros = searchQuery.length > 0
    ? neighborhoods.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toUpperCase().match(/^[A-Z]{2}\d+/) // busca por código tipo AP1234
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
    // Check if searching by property code
    const codeMatch = searchQuery.toUpperCase().match(/^[A-Z]{2}\d+/);
    if (codeMatch) {
      router.push(`/${mode}?codigo=${searchQuery.toUpperCase()}`);
      return;
    }

    const selectedBairro = neighborhoods.find(
      (b) => b.name.toLowerCase() === searchQuery.toLowerCase()
    );

    if (selectedBairro) {
      router.push(`/${mode}/${selectedBairro.slug}`);
    } else {
      router.push(`/${mode}`);
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
            onClick={() => setMode('comprar')}
            className={`flex-1 py-2.5 text-sm rounded-lg transition-all ${
              mode === 'comprar'
                ? 'bg-black text-white font-semibold shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-black'
            }`}
          >
            Comprar
          </button>
          <button
            onClick={() => setMode('alugar')}
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
            <Search className="absolute left-4 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Digite o bairro ou Código. ex: Urbanova, Satélite..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
            />
            <Search className="absolute right-4 text-gray-400 w-4 h-4 pointer-events-none" />
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
        <div className="flex gap-2 mt-3">
          {['Tipo', 'Preço', 'Quartos', 'Bairros'].map((filter) => (
            <button
              key={filter}
              className="flex-1 flex items-center justify-center gap-1 border border-gray-200 rounded-lg py-2 text-xs text-gray-600 hover:border-gray-300 transition-colors"
            >
              {filter} <ChevronDown className="w-3 h-3" />
            </button>
          ))}
        </div>

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
