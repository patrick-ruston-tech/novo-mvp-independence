'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface Launch {
  name: string;
  slug: string;
  neighborhood?: string;
  city?: string;
  description?: string;
  price_from?: number;
  construction_stage?: string;
  total_units?: number;
  cover_image?: string;
  images?: { url: string }[];
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

export default function LaunchBannerCarousel({ launches }: { launches: Launch[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (launches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % launches.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [launches.length]);

  const next = () => setCurrent((prev) => (prev + 1) % launches.length);
  const prev = () => setCurrent((prev) => (prev - 1 + launches.length) % launches.length);

  const launch = launches[current];
  const coverUrl = launch.cover_image || (launch.images && launch.images.length > 0 ? launch.images[0].url : null);

  return (
    <section className="relative overflow-hidden rounded-3xl min-h-[420px] flex items-center">
      {/* Background */}
      <div className="absolute inset-0">
        {coverUrl ? (
          <img src={coverUrl} alt={launch.name} className="w-full h-full object-cover transition-opacity duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A2B3C] to-[#2d4a63]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B3C]/90 via-[#1A2B3C]/70 to-[#1A2B3C]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-12 max-w-2xl">
        <span className="inline-block bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-4">
          {launch.construction_stage || 'Lançamento'}
        </span>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight mb-3">
          {launch.name}
        </h2>
        {launch.neighborhood && (
          <p className="text-white/60 text-sm flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            {launch.neighborhood}, {launch.city}
          </p>
        )}
        <p className="text-white/70 text-base mb-2 max-w-md line-clamp-2">
          {launch.description?.substring(0, 150)}...
        </p>
        <div className="flex items-center gap-6 mb-6 mt-4">
          {launch.price_from && (
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wider">A partir de</div>
              <div className="text-xl font-heading font-bold text-white">{formatPrice(launch.price_from)}</div>
            </div>
          )}
          {launch.total_units && (
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Unidades</div>
              <div className="text-xl font-heading font-bold text-white">{launch.total_units}</div>
            </div>
          )}
        </div>
        <Link
          href={`/lancamentos/${launch.slug}`}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Conhecer empreendimento <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Navigation arrows */}
      {launches.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 right-8 flex gap-2 z-10">
            {launches.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
