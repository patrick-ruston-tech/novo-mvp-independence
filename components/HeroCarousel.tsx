'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  '/hero/hero-1.jpg',
  '/hero/hero-2.jpg',
  '/hero/hero-3.jpg',
];

export default function HeroCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0">
      {heroImages.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIdx ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt="São José dos Campos"
            fill
            className="object-cover"
            priority={idx === 0}
            unoptimized
          />
        </div>
      ))}
      {/* Red gradient overlay - strong on left, fading to right */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-red/80 via-brand-red/40 to-transparent" />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
