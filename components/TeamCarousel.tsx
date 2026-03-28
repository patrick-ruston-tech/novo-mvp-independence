'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
}

export default function TeamCarousel({ members }: { members: TeamMember[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 640) setPerView(1);
      else if (window.innerWidth < 768) setPerView(2);
      else if (window.innerWidth < 1024) setPerView(3);
      else setPerView(4);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const maxIdx = Math.max(0, members.length - perView);

  const next = useCallback(() => {
    setCurrentIdx(prev => prev >= maxIdx ? 0 : prev + 1);
  }, [maxIdx]);

  const prev = useCallback(() => {
    setCurrentIdx(prev => prev <= 0 ? maxIdx : prev - 1);
  }, [maxIdx]);

  // Auto-rotate
  useEffect(() => {
    if (members.length <= perView) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next, perView, members.length]);

  if (!members || members.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-black">Nossa Equipe</h2>
          <p className="text-gray-500 mt-2">Consultores dedicados a encontrar o imóvel ideal para você.</p>
        </div>
        {members.length > perView && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
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
          {members.map((member) => (
            <div
              key={member.id}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / perView}%` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden group">
                <div className="aspect-square relative bg-gradient-to-br from-[#1A2B3C] to-[#2d4a63] overflow-hidden">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-heading font-bold text-white/20 group-hover:text-white/40 transition-colors">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h5 className="font-heading font-bold text-base text-black">{member.name}</h5>
                  <p className="text-gray-500 text-sm">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots - mobile */}
      {members.length > perView && (
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
    </div>
  );
}
