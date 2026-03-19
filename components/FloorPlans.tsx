'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface FloorPlan {
  name: string;
  area: string;
  bedrooms?: string;
  description?: string;
  specs?: string[];
  image?: string;
}

export default function FloorPlans({ plans }: { plans: FloorPlan[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!plans || plans.length === 0) return null;

  const active = plans[activeIdx];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left: Tabs */}
      <div className="md:w-1/3 space-y-3">
        {plans.map((plan, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-full text-left p-5 rounded-xl transition-all border ${
              idx === activeIdx
                ? 'bg-[#EC5B13] text-white border-[#EC5B13]'
                : 'bg-white text-black border-gray-200 hover:border-[#EC5B13]/30 hover:bg-[#EC5B13]/5'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${idx === activeIdx ? 'text-white/70' : 'text-gray-400'}`}>
              {plan.bedrooms ? `${plan.bedrooms} Dorm` : 'Planta'}
            </div>
            <div className="text-lg font-heading font-bold tracking-tight">
              {plan.name} | {plan.area}
            </div>
          </button>
        ))}
      </div>

      {/* Right: Details */}
      <div className="md:w-2/3 bg-white rounded-2xl p-6 md:p-10 border border-gray-100">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image placeholder or actual image */}
          <div>
            {active.image ? (
              <img src={active.image} alt={active.name} className="w-full rounded-xl" />
            ) : (
              <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <div className="text-center">
                  <div className="text-4xl font-heading font-bold text-gray-200 mb-2">{active.area}</div>
                  <div className="text-xs text-gray-300 uppercase tracking-wider">Planta ilustrativa</div>
                  <p className="text-xs text-gray-400 mt-3">Planta disponível sob consulta</p>
                </div>
              </div>
            )}
            {active.description && (
              <p className="text-sm text-gray-500 mt-4">{active.description}</p>
            )}
          </div>

          {/* Specs */}
          <div>
            <h3 className="text-xl font-heading font-bold text-black mb-6">Especificações</h3>
            {active.specs && active.specs.length > 0 && (
              <ul className="space-y-4">
                {active.specs.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#EC5B13] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{spec}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-3xl font-heading font-bold text-[#EC5B13]">{active.area}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Área privativa</div>
            </div>
            {active.image ? (
              <a
                href={active.image}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[#EC5B13] hover:underline font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Baixar planta em PDF
              </a>
            ) : (
              <button
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400 font-medium cursor-default"
                title="PDF disponível em breve"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Planta em PDF (em breve)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
