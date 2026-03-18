'use client';

import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-50 rounded-2xl h-72 flex items-center justify-center border border-gray-100 animate-pulse">
      <span className="text-sm text-gray-400">Carregando mapa...</span>
    </div>
  ),
});

interface PropertyMapWrapperProps {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function PropertyMapWrapper({ latitude, longitude, address }: PropertyMapWrapperProps) {
  return <PropertyMap latitude={latitude} longitude={longitude} address={address} />;
}
