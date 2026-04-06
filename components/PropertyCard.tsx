'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCard as PropertyCardType } from '@/types/property';
import { formatPrice, formatArea, getMainPrice, getDisplayTitle } from '@/lib/format';

export default function PropertyCard({ property, priceContext }: { property: PropertyCardType; priceContext?: 'sale' | 'rent' }) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ url: '/placeholder-property.jpg', is_primary: true }];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setImageLoaded(false);
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setImageLoaded(false);
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const { value: priceValue, label: priceLabel } = getMainPrice(property, priceContext);
  const displayTitle = property.title || getDisplayTitle(property);

  return (
    <Link href={`/imoveis/${property.slug}`} className="block group">
      <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200">

        {/* Imagem com skeleton shimmer */}
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">

          {/* Skeleton shimmer (visível enquanto a imagem carrega) */}
          {!imageLoaded && (
            <div className="absolute inset-0 z-[1]">
              <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
            </div>
          )}

          <Image
            src={images[currentImageIdx].url}
            alt={displayTitle}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-[opacity,transform] duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Tags */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {property.transaction_type.includes('rent') && (
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Locação
              </span>
            )}
            {property.featured && (
              <span className="bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Destaque
              </span>
            )}
            {!property.featured && property.transaction_type === 'sale' && (
              <span className="bg-white text-black border border-gray-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Venda
              </span>
            )}
          </div>

          {/* Controles de Carrossel (Hover) */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Imagem anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronLeft className="w-4 h-4 text-black" aria-hidden="true" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Próxima imagem"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronRight className="w-4 h-4 text-black" aria-hidden="true" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white scale-110' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-black font-heading">
              {formatPrice(priceValue)}
            </span>
            {priceLabel && (
              <span className="text-sm font-normal text-gray-400">{priceLabel}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mt-1 line-clamp-1">
            {displayTitle}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {property.neighborhood}, {property.city}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-500">
          {property.bedrooms > 0 && (
            <div><span className="font-semibold text-gray-700">{property.bedrooms}</span> quartos</div>
          )}
          {property.garages > 0 && (
            <div><span className="font-semibold text-gray-700">{property.garages}</span> vagas</div>
          )}
          {property.living_area && (
            <div><span className="font-semibold text-gray-700">{formatArea(property.living_area)}</span></div>
          )}
        </div>

      </article>
    </Link>
  );
}