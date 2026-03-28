'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  stars: number;
  date_label?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  googleReviewsUrl?: string;
}

export default function TestimonialCarousel({ testimonials, googleReviewsUrl }: TestimonialCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const perView = isMobile ? 1 : 3;
  const maxIdx = Math.max(0, testimonials.length - perView);

  const next = useCallback(() => {
    setCurrentIdx(prev => Math.min(prev + 1, maxIdx));
  }, [maxIdx]);

  const prev = useCallback(() => {
    setCurrentIdx(prev => Math.max(prev - 1, 0));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (testimonials.length <= perView) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => prev >= maxIdx ? 0 : prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIdx, perView, testimonials.length]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#4285F4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="text-sm font-semibold text-gray-500">4.9 ★ no Google</span>
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-black">
            O que nossos clientes dizem
          </h2>
        </div>

        {/* Navigation arrows - desktop */}
        {testimonials.length > perView && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prev}
              disabled={currentIdx === 0}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              disabled={currentIdx >= maxIdx}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIdx * (100 / perView)}%)` }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / perView}%` }}
            >
              <div className="bg-gray-50 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-black">{t.name}</div>
                    {t.date_label && <div className="text-xs text-gray-400">{t.date_label}</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots - mobile */}
      {testimonials.length > perView && (
        <div className="flex justify-center gap-1.5 mt-6 md:hidden">
          {Array.from({ length: maxIdx + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIdx ? 'bg-brand-red w-5' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Google link */}
      {googleReviewsUrl && (
        <div className="text-center mt-6">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#EC5B13] hover:underline"
          >
            Ver todas as avaliações no Google →
          </a>
        </div>
      )}
    </div>
  );
}
