import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPropertyBySlug, getSimilarProperties, getNeighborhoodBySlug } from '@/lib/queries';
import { formatPrice, getDisplayTitle } from '@/lib/format';
import PropertyGallery from '@/components/PropertyGallery';
import ContactForm from '@/components/ContactForm';
import ExpandableDescription from '@/components/ExpandableDescription';
import PropertyCard from '@/components/PropertyCard';
import { Bed, Bath, Car, Maximize, MapPin } from 'lucide-react';
import AmenitiesList from '@/components/AmenitiesList';
import PropertyMapWrapper from '@/components/PropertyMapWrapper';

export const revalidate = 3600;

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

  const imageUrl = mainImage || '/hero/hero-1.jpg';

  return {
    title: `${title} | Independence`,
    description,
    alternates: { canonical: `https://independenceimoveis.com.br/imoveis/${resolvedParams.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: imageUrl, width: 800, height: 600 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const property = await getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    notFound();
  }

  const similarProperties = await getSimilarProperties(property, 3);
  const title = getDisplayTitle(property);
  const mainPrice = property.transaction_type === 'sale' ? property.price_sale : property.price_rent;

  const images = property.images && property.images.length > 0
    ? property.images.map(img => img.url)
    : ['/placeholder-image-url.jpg'];

  const bairroInfo = await getNeighborhoodBySlug(property.neighborhood);

  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    condo: 'Condomínio',
    sobrado: 'Sobrado',
    land: 'Terreno',
    office: 'Sala Comercial',
    commercial: 'Comercial',
    flat: 'Flat',
    kitnet: 'Kitnet',
    farm: 'Chácara',
    penthouse: 'Cobertura',
    loft: 'Loft',
    studio: 'Studio',
  };

  const typeLabel = property.property_type
    ? (propertyTypeLabels[property.property_type] || property.property_type)
    : 'Imóveis';

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: property.title,
          url: `https://independenceimoveis.com.br/imoveis/${property.slug}`,
          datePosted: property.listed_at || property.created_at,
          dateModified: property.updated_at || property.created_at,
          image: property.images?.slice(0, 5).map((img: any) => typeof img === 'string' ? img : img.url) || [],
          broker: {
            '@type': 'RealEstateAgent',
            name: 'Independence Negócios Imobiliários',
            url: 'https://independenceimoveis.com.br',
            telephone: '+55-12-3203-6500',
          },
          about: {
            '@type': property.property_type === 'apartment' || property.property_type === 'condo' || property.property_type === 'penthouse' || property.property_type === 'studio'
              ? 'Apartment'
              : property.property_type === 'house' || property.property_type === 'sobrado'
              ? 'House'
              : property.property_type === 'land'
              ? 'Product'
              : 'Residence',
            name: property.title,
            description: property.description?.substring(0, 200),
            image: property.images?.[0]?.url || property.images?.[0],
            numberOfRooms: property.bedrooms || undefined,
            numberOfBathroomsTotal: property.bathrooms || undefined,
            floorSize: (property.living_area || property.lot_area) ? {
              '@type': 'QuantitativeValue',
              value: property.living_area || property.lot_area,
              unitCode: 'MTK',
            } : undefined,
            address: {
              '@type': 'PostalAddress',
              streetAddress: property.address || '',
              addressLocality: property.city,
              addressRegion: property.state || 'SP',
              addressCountry: 'BR',
            },
            ...(property.latitude && property.longitude ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: property.latitude,
                longitude: property.longitude,
              },
            } : {}),
          },
          offers: {
            '@type': 'Offer',
            price: property.price_sale || property.price_rent || 0,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
          },
        }),
      }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://independenceimoveis.com.br' },
            { '@type': 'ListItem', position: 2, name: property.transaction_type === 'rent' ? 'Alugar' : 'Comprar', item: `https://independenceimoveis.com.br/${property.transaction_type === 'rent' ? 'alugar' : 'comprar'}` },
            { '@type': 'ListItem', position: 3, name: property.neighborhood, item: `https://independenceimoveis.com.br/comprar/${property.neighborhood?.toLowerCase().replace(/\s+/g, '-')}` },
            { '@type': 'ListItem', position: 4, name: property.title?.substring(0, 60) },
          ],
        }),
      }}
    />
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0 w-full">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
        <Link href="/" className="hover:text-black transition-colors">Início</Link>
        <span>·</span>
        <Link href="/comprar" className="hover:text-black transition-colors">{typeLabel}</Link>
        <span>·</span>
        <span className="text-gray-600">{bairroInfo?.name || property.neighborhood}</span>
      </nav>

      {/* Galeria */}
      <div className="mb-8">
        <PropertyGallery images={images} tags={
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {property.featured && (
              <span className="bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[5px] flex items-center leading-none">
                Destaque
              </span>
            )}
            {property.transaction_type === 'rent' && (
              <span className="bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[5px] flex items-center leading-none">
                Locação
              </span>
            )}
            {property.property_type && (
              <span className="bg-white text-[#EC5B13] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[5px] flex items-center leading-none">
                {propertyTypeLabels[property.property_type] || property.property_type}
              </span>
            )}
          </div>
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Coluna Principal */}
        <div className="lg:col-span-8">

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-black leading-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-2">
            <MapPin className="w-3.5 h-3.5 text-[#EC5B13]" />
            {property.address ? `${property.address}, ` : ''}{bairroInfo?.name || property.neighborhood}, {property.city}
          </p>

          {/* Price */}
          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-heading font-bold text-[#EC5B13]">
                {mainPrice ? formatPrice(mainPrice) : 'Sob Consulta'}
              </span>
              {property.transaction_type === 'rent' && (
                <span className="text-base font-normal text-gray-400">por mês</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1.5">
              {property.price_condo && <span>Condomínio: {formatPrice(property.price_condo)}</span>}
              {property.price_condo && property.price_iptu && <span className="mx-2">·</span>}
              {property.price_iptu && <span>IPTU: {formatPrice(property.price_iptu)}</span>}
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-2xl p-6 mt-8 mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {property.living_area && property.living_area > 0 && (
                <div className="text-center">
                  <Maximize className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{property.living_area} m²</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Área Total</div>
                </div>
              )}
              {property.bedrooms > 0 && (
                <div className="text-center">
                  <Bed className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{property.bedrooms} Quartos</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">
                    {property.suites ? `Sendo ${property.suites} suíte${property.suites > 1 ? 's' : ''}` : 'Dormitórios'}
                  </div>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="text-center">
                  <Bath className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{property.bathrooms} Banheiros</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Completos</div>
                </div>
              )}
              {property.garages > 0 && (
                <div className="text-center">
                  <Car className="w-6 h-6 text-[#EC5B13] mx-auto mb-2" />
                  <div className="text-lg font-heading font-bold text-black">{property.garages} Vagas</div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Cobertas</div>
                </div>
              )}
            </div>
          </div>

          {/* Descrição */}
          {property.description && property.description.trim() !== '' && (
            <>
              <div>
                <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                  Sobre o imóvel
                </h2>
                <ExpandableDescription text={property.description} />
              </div>

              <div className="h-px bg-gray-100 my-8"></div>
            </>
          )}

          {/* Comodidades */}
          {property.features && property.features.length > 0 && (
            <div>
              <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                Comodidades
              </h2>
              <AmenitiesList features={property.features} />
            </div>
          )}

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Localização */}
          <div>
            <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
              Localização
            </h2>
            <PropertyMapWrapper
              latitude={property.latitude ?? 0}
              longitude={property.longitude ?? 0}
              address={`${property.address || ''}, ${property.neighborhood}, ${property.city}`}
            />
            {bairroInfo?.description && (
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                <span className="font-semibold text-gray-700">{bairroInfo.name}:</span> {bairroInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4" id="contato">
          <div className="sticky top-24">

            {/* Formulário vermelho */}
            <div className="rounded-2xl overflow-hidden shadow-sm bg-brand-red p-6">
              <h2 className="font-heading font-bold text-xl text-white">Interessado?</h2>
              <p className="text-sm text-white/80 mt-1 mb-5">Preencha os dados e um corretor entrará em contato em breve.</p>
              <ContactForm propertyId={property.id} pageUrl={`/imoveis/${property.slug}`} variant="red" />
            </div>

            {/* TODO: Banner carrossel de lançamentos */}
            {/* 
            <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100">
              <div className="aspect-[16/9] bg-gray-100 relative">
                Carrossel de lançamentos
              </div>
            </div>
            */}

          </div>
        </div>
      </div>
    </div>

    {/* Imóveis Similares */}
    {similarProperties.length > 0 && (
      <div className="mt-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-heading font-bold text-black mb-6">
            Imóveis similares no {bairroInfo?.name || property.neighborhood}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Mobile Sticky Bottom Bar */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div>
        <div className="text-lg font-heading font-bold text-brand-red">{mainPrice ? formatPrice(mainPrice) : 'Consulte'}</div>
        {property.transaction_type === 'rent' && <div className="text-xs text-gray-400">por mês</div>}
      </div>
      <a
        href="#contato"
        className="bg-brand-red hover:bg-brand-dark-red text-white rounded-xl px-6 py-3 font-semibold text-sm whitespace-nowrap transition-colors"
      >
        Quero mais informações
      </a>
    </div>
    </>
  );
}
