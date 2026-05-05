'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Next.js
const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PropertyMapProps {
  // Aceita number OU string porque o supabase-js retorna colunas `numeric`
  // do Postgres como string (preserva precisão decimal). Sem essa flexibi-
  // lidade no tipo, o callsite teria que parseFloat manualmente em todo
  // lugar — daqui resolve uma vez só.
  latitude: number | string | null | undefined;
  longitude: number | string | null | undefined;
  address?: string;
}

export default function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : (latitude ?? NaN);
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : (longitude ?? NaN);

  // Cobre os casos inválidos: null, undefined, NaN, e (0,0) — esse último
  // geralmente significa "não preenchido" no painel (fica num ponto no
  // Atlântico que não interessa pra ninguém).
  const invalid =
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    (lat === 0 && lng === 0);

  if (invalid) {
    return (
      <div className="bg-gray-50 rounded-2xl h-72 flex flex-col items-center justify-center border border-gray-100">
        <span className="text-sm text-gray-400">Localização não disponível</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 h-72">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icon}>
          {address && <Popup>{address}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}
