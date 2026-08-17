'use client';

import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { AddressPrecision } from '@/lib/property-address';

interface PropertyMapProps {
  // Aceita number OU string porque o supabase-js retorna colunas `numeric`
  // do Postgres como string (preserva precisão decimal). Sem essa flexibi-
  // lidade no tipo, o callsite teria que parseFloat manualmente em todo
  // lugar — daqui resolve uma vez só.
  latitude: number | string | null | undefined;
  longitude: number | string | null | undefined;
  address?: string;
  /**
   * Precisão permitida (lib/property-address): 'street' desenha um raio de
   * quadra; 'neighborhood' (imóvel com "ocultar endereço") abre pro bairro.
   * Sempre ÁREA, nunca pin — pin na coordenada da casa entrega o endereço
   * exato mesmo com o texto escondido.
   */
  precision?: AddressPrecision;
}

const RAIO_METROS: Record<AddressPrecision, number> = {
  street: 150,
  neighborhood: 600,
};

const ZOOM: Record<AddressPrecision, number> = {
  street: 16,
  neighborhood: 14,
};

export default function PropertyMap({
  latitude,
  longitude,
  address,
  precision = 'street',
}: PropertyMapProps) {
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
    <div>
      <div className="rounded-2xl overflow-hidden border border-gray-100 h-72">
        <MapContainer
          center={[lat, lng]}
          zoom={ZOOM[precision]}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={[lat, lng]}
            radius={RAIO_METROS[precision]}
            pathOptions={{ color: '#EC5B13', weight: 2, fillColor: '#EC5B13', fillOpacity: 0.15 }}
          >
            {address && <Popup>{address}</Popup>}
          </Circle>
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {precision === 'neighborhood'
          ? 'Localização aproximada — mostramos apenas o bairro. Fale com um corretor para o endereço.'
          : 'Localização aproximada — mostramos a região da rua, sem o número.'}
      </p>
    </div>
  );
}
