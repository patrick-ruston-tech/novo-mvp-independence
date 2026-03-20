'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Camera, Share2 } from 'lucide-react';

export default function LaunchGallery({ images }: { images: string[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const nextImage = () => setCurrentIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isFullscreen]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer" onClick={() => setIsFullscreen(true)}>
        {!loaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        )}
        <Image
          src={images[currentIdx]}
          alt="Foto do empreendimento"
          fill
          className={`object-cover transition-all duration-500 group-hover:brightness-95 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          sizes="100vw"
          priority
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              aria-label="Foto anterior"
              onClick={(e) => { e.stopPropagation(); prevImage(); setLoaded(false); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <button
              aria-label="Próxima foto"
              onClick={(e) => { e.stopPropagation(); nextImage(); setLoaded(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </>
        )}

        {/* Bottom right buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button
            aria-label="Ver todas as fotos"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
            className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Camera className="w-4 h-4" />
            {images.length}
          </button>
          <button
            aria-label="Compartilhar"
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); }}
            className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 left-4 text-white/80 text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full">
          {currentIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              aria-label={`Ver foto ${idx + 1}`}
              onClick={() => { setCurrentIdx(idx); setLoaded(false); }}
              className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all ${
                idx === currentIdx ? 'ring-2 ring-[#EC5B13] opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Image src={img} alt={`Foto ${idx + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-white/80 text-sm font-medium">{currentIdx + 1} / {images.length}</span>
            <button aria-label="Fechar galeria" onClick={() => setIsFullscreen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4 sm:px-16">
            <button aria-label="Foto anterior" onClick={prevImage} className="absolute left-2 sm:left-4 p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white z-10">
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <div className="w-full max-w-5xl h-[70vh] relative">
              <Image src={images[currentIdx]} alt={`Foto ${currentIdx + 1}`} fill className="object-contain" sizes="100vw" />
            </div>
            <button aria-label="Próxima foto" onClick={nextImage} className="absolute right-2 sm:right-4 p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white z-10">
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
          <div className="px-4 sm:px-8 py-3">
            <div className="flex gap-1.5 overflow-x-auto justify-center pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  aria-label={`Miniatura ${idx + 1}`}
                  onClick={() => setCurrentIdx(idx)}
                  className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden transition-all ${
                    idx === currentIdx ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <Image src={img} alt={`Miniatura ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
