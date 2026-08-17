'use client';

import dynamic from 'next/dynamic';
import type { AddressPrecision } from '@/lib/property-address';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-50 rounded-2xl h-72 flex items-center justify-center border border-gray-100 animate-pulse">
      <span className="text-sm text-gray-400">Carregando mapa...</span>
    </div>
  ),
});

interface PropertyMapWrapperProps {
  // Aceita string também — supabase-js retorna numeric como string. Idem PropertyMap.
  latitude: number | string | null | undefined;
  longitude: number | string | null | undefined;
  address?: string;
  /** Precisão pública do endereço (lib/property-address). */
  precision?: AddressPrecision;
}

export default function PropertyMapWrapper({ latitude, longitude, address, precision }: PropertyMapWrapperProps) {
  return <PropertyMap latitude={latitude} longitude={longitude} address={address} precision={precision} />;
}
