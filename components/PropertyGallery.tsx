'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PropertyGallery({ images }: { images: string[] }) {
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => setMainImageIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setMainImageIdx((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="space-y-4">
        {/* Imagem Principal */}
        <div className="aspect-video rounded-xl overflow-hidden relative group">
          <Image
            src={images[mainImageIdx]}
            alt="Foto Principal do Imóvel"
            fill
            className="object-cover transition-opacity duration-500"
            unoptimized
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-black text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors opacity-0 group-hover:opacity-100"
          >
            Ver todas ({images.length})
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImageIdx(idx)}
              className={`relative flex-shrink-0 aspect-square w-16 rounded-lg overflow-hidden transition-all ${idx === mainImageIdx ? 'ring-2 ring-black ring-offset-2' : 'opacity-70 hover:opacity-100'
                }`}
            >
              <Image src={img} alt={`Miniatura ${idx + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      </div>

      {/* Modal Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-6 text-white">
            <span className="text-sm font-medium">{mainImageIdx + 1} / {images.length}</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-grow flex items-center justify-center relative px-12">
            <button
              onClick={prevImage}
              className="absolute left-6 p-3 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div className="w-full max-w-5xl aspect-video relative rounded-xl overflow-hidden transition-colors duration-500">
              <Image
                src={images[mainImageIdx]}
                alt="Foto em Tela Cheia"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <button
              onClick={nextImage}
              className="absolute right-6 p-3 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
