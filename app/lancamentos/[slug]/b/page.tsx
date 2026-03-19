import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLaunchBySlug, getLaunchProperties } from '@/lib/queries';
import ContactForm from '@/components/ContactForm';
import PropertyCard from '@/components/PropertyCard';
import PropertyMapWrapper from '@/components/PropertyMapWrapper';
import PropertyGallery from '@/components/PropertyGallery';
import FloorPlans from '@/components/FloorPlans';
import { CheckCircle, Building2, Calendar, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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
    description: launch.description?.substring(0, 150) || `Conheça o ${launch.name}`,
  };
}

export default async function LaunchDetailPageB({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const launch = await getLaunchBySlug(resolvedParams.slug);
  if (!launch) notFound();

  const properties = await getLaunchProperties(launch.id);
  const progress = getProgress(launch.start_date, launch.delivery_date_actual);
  const coverUrl = launch.cover_image || (launch.images && launch.images.length > 0 ? launch.images[0].url : null);

  return (
    <div className="w-full">

      {/* ===== HERO: 60/40 Split ===== */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex flex-col md:flex-row overflow-hidden">
        {/* Left: Cover Image */}
        <div className="md:w-3/5 w-full relative min-h-[400px] md:min-h-auto">
          {coverUrl ? (
            <Image src={coverUrl} alt={launch.name} fill className="object-cover" unoptimized priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B3C] to-[#2d4a63]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-red/50 to-transparent" />
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 max-w-xl text-white">
            <span className="inline-block px-4 py-1.5 bg-[#EC5B13] text-[10px] tracking-[0.15em] font-bold mb-4 uppercase rounded-lg">
              {launch.construction_stage || 'Lançamento'} | {launch.neighborhood}
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight leading-[0.95] mb-3">
              {launch.name}
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              {launch.description?.substring(0, 120)}...
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:w-2/5 w-full bg-gray-50 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-heading font-bold text-black mb-2">Acesso Exclusivo</h2>
            <p className="text-sm text-gray-500 mb-6">Preencha e receba condições especiais de lançamento.</p>
            <ContactForm propertyId="" pageUrl={`/lancamentos/${launch.slug}`} />
          </div>
        </div>
      </section>

      {/* ===== SOBRE O PROJETO: Image + Text ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Image */}
            <div className="md:col-span-7">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden rounded-2xl">
                {coverUrl ? (
                  <Image src={coverUrl} alt={launch.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
            {/* Text */}
            <div className="md:col-span-5 space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-black tracking-tight">Sobre o Projeto</h2>
              <div className="h-1 w-16 bg-[#EC5B13] rounded-full"></div>
              <p className="text-gray-600 leading-relaxed text-base">
                {launch.description}
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                {launch.price_from && (
                  <div>
                    <div className="text-2xl font-bold text-[#EC5B13]">{formatPrice(launch.price_from)}</div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">A partir de</div>
                  </div>
                )}
                {launch.total_units && (
                  <div>
                    <div className="text-2xl font-bold text-[#EC5B13]">{launch.total_units}</div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Unidades</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALERIA ===== */}
      {launch.images && launch.images.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-black tracking-tight mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#EC5B13] rounded-full"></span>
              Galeria de Experiência
            </h2>
            <PropertyGallery images={launch.images.map((img: any) => typeof img === 'string' ? img : img.url)} />
          </div>
        </section>
      )}

      {/* ===== DIFERENCIAIS: 4 Cards Grid ===== */}
      {launch.features && launch.features.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-black tracking-tight">
                  Diferenciais do Lançamento
                </h2>
                <p className="mt-2 text-gray-500">Infraestrutura completa projetada para qualidade de vida.</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#EC5B13] bg-[#EC5B13]/10 px-4 py-2 rounded-lg self-start md:self-auto">
                {launch.name}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {launch.features.slice(0, 8).map((feat: string) => (
                <div
                  key={feat}
                  className="bg-white rounded-2xl p-8 hover:bg-[#EC5B13]/5 transition-colors group border border-gray-100"
                >
                  <CheckCircle className="w-8 h-8 text-[#EC5B13] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base font-heading font-bold text-black mb-2">{feat}</h3>
                </div>
              ))}
            </div>
            {launch.features.length > 8 && (
              <p className="text-sm text-gray-400 mt-6 text-center">
                E mais {launch.features.length - 8} diferenciais inclusos no empreendimento.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ===== PLANTAS & DIFERENCIAIS ===== */}
      {launch.floor_plans && launch.floor_plans.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-black tracking-tight mb-10 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#EC5B13] rounded-full"></span>
              Plantas & Diferenciais
            </h2>
            <FloorPlans plans={launch.floor_plans} />
          </div>
        </section>
      )}

      {/* ===== PROGRESSO DA OBRA ===== */}
      {progress > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
              <h2 className="text-2xl font-heading font-bold text-black mb-6 text-center">Andamento da Obra</h2>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">
                  Início: {launch.start_date ? new Date(launch.start_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '-'}
                </span>
                <span className="text-2xl font-bold text-[#EC5B13]">{progress}%</span>
                <span className="text-sm text-gray-500">
                  Entrega: {launch.delivery_date}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EC5B13] to-[#F59E0B] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== LOCALIZAÇÃO ===== */}
      {(launch.latitude && launch.longitude) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-heading font-extrabold text-black tracking-tight mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#EC5B13] rounded-full"></span>
              Localização
            </h2>
            <div className="rounded-2xl overflow-hidden">
              <PropertyMapWrapper
                latitude={launch.latitude ?? 0}
                longitude={launch.longitude ?? 0}
                address={launch.address || `${launch.neighborhood}, ${launch.city}`}
              />
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-[#EC5B13]" />
              {launch.address || `${launch.neighborhood}, ${launch.city}`}
            </div>
          </div>
        </section>
      )}

      {/* ===== UNIDADES DISPONÍVEIS ===== */}
      {properties.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-heading font-extrabold text-black tracking-tight mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#EC5B13] rounded-full"></span>
              Unidades Disponíveis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SITE OFICIAL ===== */}
      {launch.website && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <a
              href={launch.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1A2B3C] hover:bg-[#152435] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-colors"
            >
              Visitar site oficial do empreendimento
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      )}

      {/* ===== CTA FINAL ===== */}
      <section className="py-16 bg-brand-red">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Interessado no {launch.name}?
          </h2>
          <p className="text-white/80 mb-8">
            Entre em contato e receba todas as informações sobre plantas, valores e condições especiais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/5512991968810?text=Olá, tenho interesse no ${launch.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-red font-semibold px-8 py-4 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Falar pelo WhatsApp
            </a>
            <a
              href="#"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Preencher formulário
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
