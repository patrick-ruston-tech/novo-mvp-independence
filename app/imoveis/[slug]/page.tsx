import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPropertyBySlug, getSimilarProperties, getNeighborhoodBySlug } from '@/lib/queries';
import { formatPrice, getDisplayTitle } from '@/lib/format';
import PropertyGallery from '@/components/PropertyGallery';
import ContactForm from '@/components/ContactForm';
import ExpandableDescription from '@/components/ExpandableDescription';
import PropertyCard from '@/components/PropertyCard';
import { Check } from 'lucide-react';
import { PropertyImage } from '@/types/property';

export const revalidate = 3600; // revalidate at most every hour

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const property = await getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    return { title: 'Imóvel não encontrado' };
  }

  const bairroInfo = await getNeighborhoodBySlug(property.neighborhood);
  
  const title = getDisplayTitle(property);
  const description = property.description
    ? property.description.substring(0, 150) + '...'
    : `Lindo imóvel em ${bairroInfo?.name || property.neighborhood} com ${property.bedrooms} quartos.`;
  
  const mainImage = property.images && property.images.length > 0
    ? property.images.find(img => img.is_primary)?.url || property.images[0].url
    : undefined;

  return {
    title: `${title} | Independence`,
    description,
    openGraph: {
      images: mainImage ? [mainImage] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const property = await getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    notFound();
  }

  const similarProperties = await getSimilarProperties(property, 4);
  const title = getDisplayTitle(property);
  const mainPrice = property.transaction_type === 'sale' ? property.price_sale : property.price_rent;

  // For property gallery
  const images = property.images && property.images.length > 0 
    ? property.images.map(img => img.url)
    : ['/placeholder-image-url.jpg']; // Falback image if needed

  const bairroInfo = await getNeighborhoodBySlug(property.neighborhood);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Galeria */}
      <div className="mb-8">
        <PropertyGallery images={images} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Coluna Principal (60%) */}
        <div className="lg:col-span-7">
          {/* Tags */}
          <div className="flex gap-2 mb-4">
            {property.transaction_type === 'rent' && (
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Locação
              </span>
            )}
            {property.featured && (
               <span className="bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Destaque
               </span>
            )}
            {property.property_type && (
               <span className="bg-white text-black border border-gray-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {property.property_type}
               </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-heading font-bold text-black leading-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-2">
            {property.address ? `${property.address} — ` : ''}{bairroInfo?.name || property.neighborhood}
          </p>

          <div className="mt-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-heading font-bold text-black">
                {mainPrice ? formatPrice(mainPrice) : 'Sob Consulta'}
              </span>
              {property.transaction_type === 'rent' && (
                <span className="text-base font-normal text-gray-400">por mês</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {property.price_condo && <span>Condomínio {formatPrice(property.price_condo)}</span>}
              {property.price_condo && property.price_iptu && <span className="mx-2">·</span>}
              {property.price_iptu && <span>IPTU {formatPrice(property.price_iptu)}</span>}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Características */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.bedrooms || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Quartos</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.suites || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Suítes</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.bathrooms || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Banheiros</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.garages || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Vagas</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.living_area || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">m²</div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Descrição */}
          <ExpandableDescription text={property.description || ''} />

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Comodidades */}
          {property.features && property.features.length > 0 && (
            <div>
              <h2 className="text-lg font-heading font-bold text-black mb-4">Comodidades</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {property.features.map((carac: string) => (
                  <div key={carac} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-gray-600" />
                    </span>
                    {carac}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Localização */}
          <div>
            <h2 className="text-lg font-heading font-bold text-black mb-4">Localização</h2>
            <div className="bg-brand-bg rounded-xl h-64 flex items-center justify-center border border-gray-100">
              <span className="text-gray-400 text-sm font-medium">Mapa interativo — Google Maps</span>
              {/* Future Integration with Google Maps using property.latitude/longitude */}
            </div>
            {bairroInfo?.description && (
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                <span className="font-semibold text-gray-700">{bairroInfo.name}:</span> {bairroInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar (40%) */}
        <div className="lg:col-span-5" id="contato">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading font-bold text-xl text-black">Tenho interesse neste imóvel</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">Preencha seus dados e entraremos em contato</p>
            
            <ContactForm propertyId={property.id} pageUrl={`/imoveis/${property.slug}`} />
          </div>
        </div>
      </div>

      {/* Imóveis Similares */}
      {similarProperties.length > 0 && (
        <div className="mt-16 pt-16 border-t border-gray-100">
          <h2 className="text-2xl font-heading font-bold text-black mb-6">Imóveis similares em {bairroInfo?.name || property.neighborhood}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div>
          <div className="text-lg font-heading font-bold text-black">{mainPrice ? formatPrice(mainPrice) : 'Consulte'}</div>
          {property.transaction_type === 'rent' && <div className="text-xs text-gray-400">por mês</div>}
        </div>
        <a 
          href="#contato"
          className="bg-brand-red text-white rounded-xl px-6 py-3 font-semibold text-sm whitespace-nowrap"
        >
          Tenho interesse
        </a>
      </div>
    </div>
  );
}
