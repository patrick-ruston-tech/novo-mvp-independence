'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryGrid({ images }: { images: string[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const sideImages = images.slice(1, 5);
  const remaining = images.length - 5;

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
        {/* Main large image */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => setLightboxIdx(0)}
        >
          <Image src={mainImage} alt="Foto 1" fill className="object-cover group-hover:brightness-95 transition-all" sizes="50vw" />
        </div>

        {/* Side images */}
        {sideImages.map((img, idx) => (
          <div
            key={idx}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => setLightboxIdx(idx + 1)}
          >
            <Image src={img} alt={`Foto ${idx + 2}`} fill className="object-cover group-hover:brightness-95 transition-all" sizes="25vw" />
            {/* Overlay on last if more photos */}
            {idx === sideImages.length - 1 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xl">+{remaining} fotos</span>
              </div>
            )}
          </div>
        ))}

        {/* Fill empty slots if less than 5 images */}
        {sideImages.length < 4 && Array.from({ length: 4 - sideImages.length }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-100"></div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-white/80 text-sm">{lightboxIdx + 1} / {images.length}</span>
            <button onClick={() => setLightboxIdx(null)} className="p-2 hover:bg-white/10 rounded-full text-white" aria-label="Fechar galeria">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4 sm:px-16">
            <button
              onClick={() => setLightboxIdx((lightboxIdx - 1 + images.length) % images.length)}
              className="absolute left-2 sm:left-4 p-3 hover:bg-white/10 rounded-full text-white/70 hover:text-white z-10"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-8 h-8" aria-hidden="true" />
            </button>
            <div className="w-full max-w-5xl h-[70vh] relative">
              <Image src={images[lightboxIdx]} alt="" fill className="object-contain" sizes="100vw" />
            </div>
            <button
              onClick={() => setLightboxIdx((lightboxIdx + 1) % images.length)}
              className="absolute right-2 sm:right-4 p-3 hover:bg-white/10 rounded-full text-white/70 hover:text-white z-10"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-8 h-8" aria-hidden="true" />
            </button>
          </div>
          <div className="px-4 py-3">
            <div className="flex gap-1.5 overflow-x-auto justify-center pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIdx(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                    idx === lightboxIdx ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                  aria-label={`Ir para foto ${idx + 1}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
