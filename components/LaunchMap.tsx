'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

interface LaunchMapProps {
  neighborhood: string;
  city: string;
  name: string;
  lat?: number;
  lng?: number;
}

export default function LaunchMap({ neighborhood, city, name, lat, lng }: LaunchMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(lat && lng ? [lat, lng] : null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!position) {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${neighborhood}, ${city}, SP, Brasil`)}&format=json&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0]) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, [neighborhood, city, position]);

  if (!loaded || !position) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Carregando mapa...</div>;
  }

  return (
    <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={position}
        radius={500}
        pathOptions={{
          color: '#EC5B13',
          fillColor: '#EC5B13',
          fillOpacity: 0.15,
          weight: 2,
        }}
      >
        <Popup>
          <div className="text-center">
            <strong className="text-sm">{name}</strong>
            <p className="text-xs text-gray-500">{neighborhood}, {city}</p>
          </div>
        </Popup>
      </Circle>
    </MapContainer>
  );
}
