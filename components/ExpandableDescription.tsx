'use client';

import { useState } from 'react';

export default function ExpandableDescription({ text }: { text: string }) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div>
      <h2 className="text-lg font-heading font-bold text-black mb-4">Sobre o imóvel</h2>
      <div className={`text-base text-gray-600 leading-relaxed ${!showFull ? 'line-clamp-3' : 'whitespace-pre-wrap'}`}>
        {text}
      </div>
      {!showFull && text && text.length > 150 && (
        <button 
          onClick={() => setShowFull(true)}
          className="text-sm text-brand-red font-medium cursor-pointer mt-2 hover:underline"
        >
          Ler mais
        </button>
      )}
    </div>
  );
}
