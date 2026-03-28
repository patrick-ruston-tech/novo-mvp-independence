'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface Launch {
  name: string;
  slug: string;
  neighborhood?: string;
  city?: string;
  price_from?: number;
  construction_stage?: string;
  cover_image?: string;
  images?: any[];
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

export default function LaunchMiniBanner({ launches }: { launches: Launch[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (launches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % launches.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [launches.length]);

  if (!launches || launches.length === 0) return null;

  const launch = launches[current];
  const imageUrl = (launch.images && launch.images.length > 0
    ? (typeof launch.images[0] === 'string' ? launch.images[0] : launch.images[0].url)
    : null) || launch.cover_image;

  return (
    <div className="rounded-2xl overflow-hidden bg-[#1A2B3C] relative">
      {/* Image */}
      <div className="relative h-[180px]">
        {imageUrl ? (
          <Image src={imageUrl} alt={launch.name} fill className="object-cover" sizes="350px" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A2B3C] to-[#2d4a63]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B3C] via-[#1A2B3C]/40 to-transparent" />

        {/* Badge */}
        <span className="absolute top-3 left-3 bg-[#EC5B13] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
          {launch.construction_stage || 'Lançamento'}
        </span>

        {/* Arrows */}
        {launches.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((prev) => (prev - 1 + launches.length) % launches.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % launches.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-bold text-white text-sm leading-tight">{launch.name}</h3>
        {launch.neighborhood && (
          <p className="text-white/50 text-xs flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {launch.neighborhood}
          </p>
        )}
        {launch.price_from && (
          <div className="text-[#EC5B13] font-heading font-bold text-sm mt-2">
            A partir de {formatPrice(launch.price_from)}
          </div>
        )}
        <Link
          href={`/lancamentos/${launch.slug}`}
          className="block w-full text-center bg-white hover:bg-gray-100 text-[#1A2B3C] font-semibold py-2 rounded-xl text-xs mt-3 transition-colors"
        >
          Conhecer empreendimento
        </Link>

        {/* Dots */}
        {launches.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {launches.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === current ? 'bg-white w-4' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
