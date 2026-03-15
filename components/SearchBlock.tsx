'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import type { Neighborhood } from '@/types/property';

interface SearchBlockProps {
  neighborhoods: Neighborhood[];
}

export default function SearchBlock({ neighborhoods }: SearchBlockProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'comprar' | 'alugar'>('comprar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredBairros = searchQuery.length > 0
    ? neighborhoods.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase())
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
    const selectedBairro = neighborhoods.find(
      (b) => b.name.toLowerCase() === searchQuery.toLowerCase()
    );

    if (selectedBairro) {
      router.push(`/${mode}/${selectedBairro.slug}`);
    } else {
      router.push(`/${mode}`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header do SearchBlock */}
      <div className="text-center mb-8">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tighter font-heading text-black">IND</span>
            <div className="w-2.5 h-2.5 bg-brand-red"></div>
            <span className="text-base tracking-widest font-semibold text-black">INDEPENDENCE</span>
          </div>
          <span className="text-xs tracking-widest text-gray-400 mt-1 uppercase">Negócios Imobiliários</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-bold text-center leading-tight text-black">
          Encontre seu próximo lar em São José dos Campos e região
        </h1>
        <p className="text-base text-gray-500 text-center mt-2">
          Casas, apartamentos e terrenos em SJC, Jacareí e Caçapava
        </p>
      </div>

      {/* Caixa de Busca */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Toggle Comprar/Alugar */}
        <div className="flex bg-gray-50 rounded-xl p-1 mb-4">
          <button
            onClick={() => setMode('comprar')}
            className={`flex-1 py-3 text-sm rounded-lg transition-all ${mode === 'comprar'
              ? 'bg-black text-white font-semibold shadow-sm'
              : 'bg-transparent text-gray-500 hover:text-black'
              }`}
          >
            Comprar
          </button>
          <button
            onClick={() => setMode('alugar')}
            className={`flex-1 py-3 text-sm rounded-lg transition-all ${mode === 'alugar'
              ? 'bg-black text-white font-semibold shadow-sm'
              : 'bg-transparent text-gray-500 hover:text-black'
              }`}
          >
            Alugar
          </button>
        </div>

        {/* Input Bairro */}
        <div className="relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Digite o bairro, ex: Urbanova, Satélite..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full border border-gray-200 rounded-xl pl-12 pr-10 py-4 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
            />
            <ChevronDown className="absolute right-4 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Dropdown Bairros */}
          {isDropdownOpen && filteredBairros.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-2 max-h-60 overflow-auto z-50">
              {filteredBairros.map((bairro) => (
                <button
                  key={bairro.slug}
                  className="w-full text-left px-4 py-3 hover:bg-brand-bg text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                  onClick={() => {
                    setSearchQuery(bairro.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="font-medium text-black block">{bairro.name}</span>
                  <span className="text-xs text-gray-400 truncate block mt-0.5">{bairro.city} · {bairro.property_count} {bairro.property_count === 1 ? 'imóvel' : 'imóveis'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão Buscar */}
        <button
          onClick={handleSearch}
          className="w-full bg-brand-red hover:bg-brand-dark-red text-white font-semibold py-4 rounded-xl text-base transition-colors mt-4"
        >
          Buscar imóveis
        </button>
      </div>

      {/* Footer text */}
      <div className="text-xs text-gray-400 text-center mt-8 tracking-wide">
        24 anos de mercado · +3.000 imóveis negociados · São José dos Campos e região
      </div>
    </div>
  );
}
