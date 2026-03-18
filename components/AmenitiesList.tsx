'use client';

import { useState } from 'react';
import { CheckCircle, ChevronDown } from 'lucide-react';

export default function AmenitiesList({ features }: { features: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? features : features.slice(0, 6);
  const hasMore = features.length > 6;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6">
        {visible.map((carac) => (
          <div key={carac} className="flex items-center gap-2.5 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-[#EC5B13] flex-shrink-0" />
            {carac}
          </div>
        ))}
      </div>
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-4 text-sm font-medium text-[#EC5B13] hover:underline flex items-center gap-1"
        >
          Ver todas as {features.length} comodidades
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
