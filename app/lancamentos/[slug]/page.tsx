import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getLaunchBySlug, getLaunchProperties, getFeaturedLaunches } from '@/lib/queries';
import ContactForm from '@/components/ContactForm';
import PropertyMapWrapper from '@/components/PropertyMapWrapper';
import LaunchMap from '@/components/LaunchMap';
import GalleryGrid from '@/components/GalleryGrid';
import FloorPlans from '@/components/FloorPlans';
import LaunchCard from '@/components/LaunchCard';
import { Building2, Building, DollarSign, Calendar, MapPin, CheckCircle, ExternalLink } from 'lucide-react';
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

  const imageUrl = launch.cover_image || '/hero/hero-1.jpg';
  const description = launch.description?.substring(0, 150) || `Conheça o ${launch.name}`;

  return {
    title: `${launch.name} | Lançamentos`,
    description,
    alternates: { canonical: `https://independenceimoveis.com.br/lancamentos/${resolvedParams.slug}` },
    openGraph: {
      title: launch.name,
      description,
      type: 'article',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function LaunchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const launch = await getLaunchBySlug(resolvedParams.slug);
  if (!launch) notFound();

  const [properties, otherLaunches] = await Promise.all([
    getLaunchProperties(launch.id),
    getFeaturedLaunches(3),
  ]);

  const progress = getProgress(launch.start_date, launch.delivery_date_actual);
  const allImages = (launch.images && launch.images.length > 0)
    ? launch.images.map((img: any) => typeof img === 'string' ? img : img.url)
    : (launch.cover_image ? [launch.cover_image] : []);

  const filteredLaunches = otherLaunches.filter((l: any) => l.slug !== launch.slug);

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://independenceimoveis.com.br' },
            { '@type': 'ListItem', position: 2, name: 'Lançamentos', item: 'https://independenceimoveis.com.br/lancamentos' },
            { '@type': 'ListItem', position: 3, name: launch.name },
          ],
        }).replace(/<\/script/gi, '<\\/script'),
      }}
    />
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

      {/* Header: Title + Price */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <span className="inline-block bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-3">
            {launch.construction_stage || 'Lançamento Exclusivo'}
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-black">
            {launch.name}
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#EC5B13]" />
            {launch.address || `${launch.neighborhood}, ${launch.city}`}
          </p>
        </div>
        {launch.price_from && (
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Valores de lançamento</div>
            <div className="text-2xl md:text-3xl font-heading font-bold text-[#EC5B13]">
              A partir de {formatPrice(launch.price_from)}
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      {allImages.length > 0 && (
        <div className="mb-12">
          <GalleryGrid images={allImages} />
        </div>
      )}

      {/* ===== FEATURES + FORM ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left: Features + About */}
        <div className="lg:col-span-7">

          {/* Features box */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {launch.total_units && (
                <div className="text-center">
                  <Building2 className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{launch.total_units}</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Unidades</div>
                </div>
              )}
              {launch.price_from && (
                <div className="text-center">
                  <DollarSign className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{formatPrice(launch.price_from)}</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">A partir de</div>
                </div>
              )}
              {launch.delivery_date && (
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{launch.delivery_date}</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Entrega</div>
                </div>
              )}
              {launch.builder && (
                <div className="text-center">
                  <Building className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{launch.builder}</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Construtora</div>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          {launch.description && (
            <div className="mb-8">
              <h2 className="text-xl font-heading font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                Sobre o Empreendimento
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{launch.description}</p>
            </div>
          )}
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="rounded-2xl overflow-hidden shadow-sm bg-brand-red p-6">
              <h2 className="font-heading font-bold text-xl text-white">Interessado?</h2>
              <p className="text-sm text-white/80 mt-1 mb-5">Preencha os dados e receba condições exclusivas de lançamento.</p>
              <ContactForm propertyId="" pageUrl={`/lancamentos/${launch.slug}`} variant="red" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOUR VIRTUAL / VIDEO ===== */}
      {launch.video_url && (() => {
        const isValidVideoUrl = (url: string): boolean => {
          const allowed = ['youtube.com', 'youtu.be', 'vimeo.com'];
          try {
            const parsed = new URL(url);
            return allowed.some(d => parsed.hostname.includes(d));
          } catch { return false; }
        };
        return isValidVideoUrl(launch.video_url);
      })() && (
        <div className="mb-12">
          <h2 className="text-xl font-heading font-bold text-black mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
            Tour Virtual
          </h2>
          <div className="aspect-video rounded-2xl overflow-hidden bg-black relative">
            <iframe
              src={launch.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          </div>
        </div>
      )}

      {/* ===== DIFERENCIAIS: Pills ===== */}
      {launch.features && launch.features.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-heading font-bold text-black mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
            Diferenciais do Projeto
          </h2>
          <div className="flex flex-wrap gap-2">
            {launch.features.map((feat: string) => (
              <span
                key={feat}
                className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#EC5B13] hover:text-[#EC5B13] transition-colors"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ===== PLANTAS ===== */}
      {launch.floor_plans && launch.floor_plans.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-heading font-bold text-black mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
            Plantas do Imóvel
          </h2>
          <FloorPlans plans={launch.floor_plans} />
        </div>
      )}

      {/* ===== ESTÁGIO DA OBRA ===== */}
      {progress > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-heading font-bold text-black mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
            Estágio da Obra
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-black">Progresso geral</span>
                <span className="text-sm font-bold text-[#EC5B13]">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EC5B13] to-[#F59E0B] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 pt-2">
              <span>Início: {launch.start_date ? new Date(launch.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '-'}</span>
              <span>Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
              <span>Entrega: {launch.delivery_date}</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOCALIZAÇÃO ===== */}
      <div className="mb-12">
        <h2 className="text-xl font-heading font-bold text-black mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
          Localização Privilegiada
        </h2>
        {launch.latitude && launch.longitude ? (
          <div className="rounded-2xl overflow-hidden">
            <PropertyMapWrapper
              latitude={launch.latitude ?? 0}
              longitude={launch.longitude ?? 0}
              address={launch.address || `${launch.neighborhood}, ${launch.city}`}
            />
          </div>
        ) : launch.neighborhood ? (
          <div className="rounded-2xl overflow-hidden h-[300px]">
            <LaunchMap
              neighborhood={launch.neighborhood}
              city={launch.city || 'São José dos Campos'}
              name={launch.name}
            />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl h-72 flex flex-col items-center justify-center border border-gray-100">
            <MapPin className="w-8 h-8 text-[#EC5B13] mb-2" />
            <span className="text-sm font-medium text-gray-600">{launch.neighborhood}, {launch.city}</span>
            <span className="text-xs text-gray-400 mt-1">Localização exata disponível sob consulta</span>
          </div>
        )}
      </div>

      {/* ===== OUTROS LANÇAMENTOS ===== */}
      {filteredLaunches.length > 0 && (
        <div className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-black">Outros Lançamentos</h2>
              <p className="text-sm text-gray-500 mt-1">Explore mais oportunidades exclusivas da Independence</p>
            </div>
            <Link href="/lancamentos" className="text-sm font-semibold text-[#EC5B13] hover:underline flex items-center gap-1">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredLaunches.map((l: any) => (
              <LaunchCard key={l.id} launch={l} />
            ))}
          </div>
        </div>
      )}

    </div>
    </>
  );
}
