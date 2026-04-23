'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import Image from 'next/image';
import PropertyImage from './PropertyImage';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

export default function PropertyGallery({ images, tags }: { images: string[]; tags?: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const gridImages = images.slice(0, 5);
  const extraCount = images.length - 5;

  const nextImage = () => setCurrentIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);

  const openFullscreen = (idx: number) => {
    setCurrentIdx(idx);
    setIsFullscreen(true);
  };

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

  const handleImageLoad = (idx: number) => {
    setLoadedImages(prev => new Set(prev).add(idx));
  };

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">Sem fotos disponíveis</p>
      </div>
    );
  }

  // Mobile: single image with counter
  // Desktop: modular grid (1 large + 4 small)
  return (
    <>
      {/* ===== GRID MODULAR ===== */}
      <div>

        {/* Mobile: imagem única */}
        <div className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden">
          {!loadedImages.has(0) && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
          )}
          <PropertyImage
            src={images[0]}
            alt="Foto principal"
            fill
            className={`object-cover transition-opacity duration-300 ${loadedImages.has(0) ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => handleImageLoad(0)}
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          {tags}
          <button
            onClick={() => openFullscreen(0)}
            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-black text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5" />
            Ver {images.length} fotos
          </button>
        </div>

        {/* Desktop: grid modular */}
        <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[420px]">

          {/* Foto principal (2 colunas, 2 linhas) */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer group rounded-2xl overflow-hidden"
            onClick={() => openFullscreen(0)}
          >
            {!loadedImages.has(0) && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
            )}
            <PropertyImage
              src={images[0]}
              alt="Foto principal"
              fill
              className={`object-cover transition-all duration-300 group-hover:brightness-90 ${loadedImages.has(0) ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => handleImageLoad(0)}
              priority
            />
            {tags}
          </div>

          {/* 4 fotos menores */}
          {gridImages.slice(1).map((img, idx) => {
            const realIdx = idx + 1;
            const isLast = realIdx === gridImages.length - 1 && extraCount > 0;

            return (
              <div
                key={realIdx}
                className="relative cursor-pointer group rounded-2xl overflow-hidden"
                onClick={() => openFullscreen(realIdx)}
              >
                {!loadedImages.has(realIdx) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                )}
                <PropertyImage
                  src={img}
                  alt={`Foto ${realIdx + 1}`}
                  fill
                  className={`object-cover transition-all duration-300 group-hover:brightness-90 ${loadedImages.has(realIdx) ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(realIdx)}

                />
                {isLast && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-black/40 group-hover:backdrop-blur-md">
                    <span className="text-white text-sm font-semibold bg-white/20 border border-white/30 px-4 py-2 rounded-lg backdrop-blur-sm">+{extraCount} fotos</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Se tem menos de 5 fotos, preenche os espaços */}
          {gridImages.length < 5 &&
            Array.from({ length: 5 - gridImages.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-100" />
            ))
          }
        </div>
      </div>

      {/* ===== LIGHTBOX FULLSCREEN ===== */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <span className="text-white/80 text-sm font-medium">
              {currentIdx + 1} / {images.length}
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center relative px-4 sm:px-16">
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white z-10"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <div className="w-full max-w-5xl h-[70vh] relative flex items-center justify-center">
              <div className="relative w-full h-full">
                <PropertyImage
                  src={images[currentIdx]}
                  alt={`Foto ${currentIdx + 1}`}
                  fill
                  className="object-contain"

                />
              </div>
            </div>

            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white z-10"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="px-4 sm:px-8 py-3 sm:py-4">
            <div className="flex gap-1.5 overflow-x-auto justify-center pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden transition-all ${idx === currentIdx
                    ? 'ring-2 ring-white opacity-100'
                    : 'opacity-40 hover:opacity-70'
                    }`}
                >
                  <PropertyImage
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    fill
                    className="object-cover"

                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}