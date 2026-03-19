import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLaunchBySlug, getLaunchProperties } from '@/lib/queries';
import PropertyCard from '@/components/PropertyCard';
import ContactForm from '@/components/ContactForm';
import PropertyMapWrapper from '@/components/PropertyMapWrapper';
import { MapPin, Calendar, Building2, CheckCircle, ExternalLink } from 'lucide-react';

export const revalidate = 3600;

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

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const launch = await getLaunchBySlug(resolvedParams.slug);
  if (!launch) return { title: 'Lançamento não encontrado' };

  return {
    title: `${launch.name} | Lançamentos | Independence`,
    description: launch.description?.substring(0, 150) || `Conheça o ${launch.name} em ${launch.neighborhood}`,
  };
}

export default async function LaunchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const launch = await getLaunchBySlug(resolvedParams.slug);

  if (!launch) notFound();

  const properties = await getLaunchProperties(launch.id);
  const progress = getProgress(launch.start_date, launch.delivery_date_actual);
  const coverUrl = launch.cover_image || (launch.images && launch.images.length > 0 ? launch.images[0].url : null);

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt={launch.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A2B3C] to-[#2d4a63]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 max-w-[1400px] mx-auto">
          <span className="inline-block bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-3">
            {launch.construction_stage || 'Lançamento'}
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-2">
            {launch.name}
          </h1>
          <p className="text-white/70 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {launch.address || `${launch.neighborhood}, ${launch.city}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main */}
          <div className="lg:col-span-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {launch.price_from && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">A partir de</div>
                  <div className="text-lg font-heading font-bold text-[#EC5B13]">{formatPrice(launch.price_from)}</div>
                </div>
              )}
              {launch.total_units && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Unidades</div>
                  <div className="text-lg font-heading font-bold text-black">{launch.total_units}</div>
                </div>
              )}
              {launch.delivery_date && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Entrega</div>
                  <div className="text-lg font-heading font-bold text-black">{launch.delivery_date}</div>
                </div>
              )}
              {launch.builder && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Construtora</div>
                  <div className="text-lg font-heading font-bold text-black">{launch.builder}</div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="mb-10 bg-gray-50 rounded-xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-black">Andamento da obra</span>
                  <span className="text-sm font-bold text-[#EC5B13]">{progress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#EC5B13] to-[#F59E0B] rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Início: {launch.start_date ? new Date(launch.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '-'}</span>
                  <span>Entrega: {launch.delivery_date}</span>
                </div>
              </div>
            )}

            {/* Description */}
            {launch.description && (
              <div className="mb-10">
                <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                  Sobre o empreendimento
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{launch.description}</p>
              </div>
            )}

            {/* Features */}
            {launch.features && launch.features.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                  Infraestrutura e lazer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6">
                  {launch.features.map((feat: string) => (
                    <div key={feat} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#EC5B13] flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {(launch.latitude && launch.longitude) && (
              <div className="mb-10">
                <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                  Localização
                </h2>
                <PropertyMapWrapper
                  latitude={launch.latitude ?? 0}
                  longitude={launch.longitude ?? 0}
                  address={launch.address || `${launch.neighborhood}, ${launch.city}`}
                />
              </div>
            )}

            {/* Official website */}
            {launch.website && (
              <a
                href={launch.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#EC5B13] hover:underline mb-10"
              >
                <ExternalLink className="w-4 h-4" />
                Visitar site oficial do empreendimento
              </a>
            )}

            {/* Units */}
            {properties.length > 0 && (
              <div>
                <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                  Unidades disponíveis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="rounded-2xl overflow-hidden shadow-sm bg-brand-red p-6">
                <h2 className="font-heading font-bold text-xl text-white">Quer saber mais?</h2>
                <p className="text-sm text-white/80 mt-1 mb-5">Receba condições exclusivas de lançamento.</p>
                <ContactForm propertyId="" pageUrl={`/lancamentos/${launch.slug}`} variant="red" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
