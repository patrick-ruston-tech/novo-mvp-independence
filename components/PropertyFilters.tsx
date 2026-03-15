'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function PropertyFilters() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFilter = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap gap-3 items-center sticky top-20 z-30 shadow-sm" ref={filterRef}>
      
      {/* Tipo */}
      <div className="relative">
        <button 
          onClick={() => toggleFilter('tipo')}
          className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          Tipo <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'tipo' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[200px] z-40">
            <div className="space-y-2">
              {['Apartamento', 'Casa', 'Cobertura', 'Comercial', 'Terreno'].map(tipo => (
                <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                  <span className="text-sm text-gray-700">{tipo}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quartos */}
      <div className="relative">
        <button 
          onClick={() => toggleFilter('quartos')}
          className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          Quartos <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'quartos' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[240px] z-40">
            <div className="flex gap-2">
              {['1', '2', '3', '4+'].map(q => (
                <button key={q} className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:border-black transition-colors">
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
          className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          Preço <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'preco' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[280px] z-40">
            <div className="flex items-center gap-2">
              <input type="text" placeholder="De: R$" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none" />
              <span className="text-gray-400">-</span>
              <input type="text" placeholder="Até: R$" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* Mais filtros */}
      <div className="relative">
        <button 
          onClick={() => toggleFilter('mais')}
          className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          Mais filtros <ChevronDown className="w-4 h-4" />
        </button>
        {activeFilter === 'mais' && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-5 min-w-[320px] z-40">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Vagas</span>
                <div className="flex gap-2">
                  {['1', '2', '3+'].map(v => (
                    <button key={v} className="flex-1 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-black transition-colors">
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Metragem Mínima</span>
                <input type="number" placeholder="Ex: 80 m²" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Comodidades</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Piscina', 'Academia', 'Portaria 24h', 'Churrasqueira'].map(c => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm text-gray-700">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Limpar */}
      <button className="text-xs text-brand-red font-medium hover:underline ml-2">
        Limpar filtros
      </button>

      {/* Ordenação */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-gray-500">Ordenar por:</span>
        <select className="text-sm text-black font-medium border-0 bg-transparent focus:ring-0 cursor-pointer outline-none">
          <option>Mais recentes</option>
          <option>Menor preço</option>
          <option>Maior preço</option>
        </select>
      </div>

    </div>
  );
}
