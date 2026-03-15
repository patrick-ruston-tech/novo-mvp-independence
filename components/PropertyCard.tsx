'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '@/data/properties';

export default function PropertyCard({ property }: { property: Property }) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIdx((prev) => (prev + 1) % property.imagemCores.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIdx((prev) => (prev - 1 + property.imagemCores.length) % property.imagemCores.length);
  };

  return (
    <Link href={`/imoveis/${property.slug}`} className="block group">
      <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        
        {/* Imagem / Placeholder */}
        <div 
          className="aspect-[4/3] relative overflow-hidden transition-colors duration-500 flex items-center justify-center"
          style={{ backgroundColor: property.imagemCores[currentImageIdx] }}
        >
          {/* Ícone de casa sutil */}
          <svg className="w-12 h-12 text-black/10 absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>

          {/* Tags */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {property.finalidade === 'locacao' && (
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Locação
              </span>
            )}
            {property.tags.map(tag => (
              <span 
                key={tag}
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  tag === 'novo' ? 'bg-black text-white' :
                  tag === 'destaque' ? 'bg-brand-red text-white' :
                  'bg-white text-black border border-gray-200'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Controles de Carrossel (Hover) */}
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronRight className="w-4 h-4 text-black" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {property.imagemCores.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white scale-110' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-black font-heading">
              {formatPrice(property.preco)}
            </span>
            {property.finalidade === 'locacao' && (
              <span className="text-sm font-normal text-gray-400">/mês</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mt-1 line-clamp-1">
            {property.titulo}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {property.endereco}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-500">
          <div><span className="font-semibold text-gray-700">{property.quartos}</span> quartos</div>
          <div><span className="font-semibold text-gray-700">{property.vagas}</span> vagas</div>
          <div><span className="font-semibold text-gray-700">{property.metragem}</span> m²</div>
        </div>

      </article>
    </Link>
  );
}
