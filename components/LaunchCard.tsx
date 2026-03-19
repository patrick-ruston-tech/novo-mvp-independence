import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Building2, ArrowRight } from 'lucide-react';

interface LaunchCardProps {
  launch: {
    name: string;
    slug: string;
    builder?: string;
    neighborhood?: string;
    city?: string;
    price_from?: number;
    price_to?: number;
    delivery_date?: string;
    construction_stage?: string;
    total_units?: number;
    cover_image?: string;
    images?: { url: string }[];
    start_date?: string;
    delivery_date_actual?: string;
  };
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

function getProgress(startDate?: string, deliveryDate?: string): number {
  if (!startDate || !deliveryDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(deliveryDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function LaunchCard({ launch }: LaunchCardProps) {
  const progress = getProgress(launch.start_date, launch.delivery_date_actual);
  const coverUrl = launch.cover_image || (launch.images && launch.images.length > 0 ? launch.images[0].url : null);

  return (
    <Link href={`/lancamentos/${launch.slug}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
        {/* Cover Image */}
        <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={launch.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A2B3C] to-[#2d4a63] flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white/30" />
            </div>
          )}
          {/* Stage badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
              {launch.construction_stage || 'Lançamento'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-heading font-bold text-black group-hover:text-[#EC5B13] transition-colors">
            {launch.name}
          </h3>

          {launch.builder && (
            <p className="text-xs text-gray-400 mt-0.5">por {launch.builder}</p>
          )}

          <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-[#EC5B13]" />
            {launch.neighborhood}, {launch.city}
          </div>

          {/* Price range */}
          {launch.price_from && (
            <div className="mt-3">
              <span className="text-xs text-gray-400">A partir de</span>
              <div className="text-xl font-heading font-bold text-[#EC5B13]">
                {formatPrice(launch.price_from)}
              </div>
            </div>
          )}

          {/* Info row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {launch.total_units && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {launch.total_units} unidades
              </span>
            )}
            {launch.delivery_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Entrega: {launch.delivery_date}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-gray-400 font-medium">Andamento da obra</span>
                <span className="text-[11px] font-bold text-[#EC5B13]">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EC5B13] to-[#F59E0B] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <span className="text-sm font-semibold text-black group-hover:text-[#EC5B13] transition-colors flex items-center gap-1">
              Conhecer empreendimento
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
