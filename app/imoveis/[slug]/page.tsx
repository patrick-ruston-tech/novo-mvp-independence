import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPropertyBySlug, getSimilarProperties, getNeighborhoodBySlug, getFeaturedLaunches } from '@/lib/queries';
import { formatPrice, getDisplayTitle, rentSuffixLong } from '@/lib/format';
import PropertyGallery from '@/components/PropertyGallery';
import ContactForm from '@/components/ContactForm';
import ExpandableDescription from '@/components/ExpandableDescription';
import PropertyCard from '@/components/PropertyCard';
import { Bed, Bath, Car, Maximize, MapPin, Building2 } from 'lucide-react';
import AmenitiesList from '@/components/AmenitiesList';
import PropertyMapWrapper from '@/components/PropertyMapWrapper';
import LaunchMiniBanner from '@/components/LaunchMiniBanner';
import { getWatermarkedImages, toCdn } from '@/lib/image-utils';
import { publicAddressLabel, addressPrecision, schemaStreetAddress } from '@/lib/property-address';
import { propertyVideoEmbed } from '@/lib/property-video';

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

  const imageUrl = mainImage ? toCdn(mainImage) : '/hero/hero-1.jpg';

  return {
    title: `${title} | Independence`,
    description,
    alternates: { canonical: `https://independenceimoveis.com.br/imoveis/${property.slug || resolvedParams.slug}` },
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

  // Se o imóvel foi resolvido por um slug que não é o canônico (URL antiga,
  // ou de quando o slug carregava preço/transação), redireciona 301 pro slug
  // atual — preserva SEO e nunca deixa a URL defasada visível.
  if (property.slug && property.slug !== resolvedParams.slug) {
    permanentRedirect(`/imoveis/${property.slug}`);
  }

  const [similarProperties, launches] = await Promise.all([
    getSimilarProperties(property, 3),
    getFeaturedLaunches(5),
  ]);
  const title = getDisplayTitle(property);

  const images = property.images && property.images.length > 0
    ? getWatermarkedImages(property.images)
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
          image: property.images?.slice(0, 5).map((img: any) => toCdn(typeof img === 'string' ? img : img.url)) || [],
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
            image: toCdn(
              (property.images?.[0] && typeof property.images[0] === 'string'
                ? property.images[0]
                : property.images?.[0]?.url) || ''
            ),
            numberOfRooms: property.bedrooms || undefined,
            numberOfBathroomsTotal: property.bathrooms || undefined,
            floorSize: (property.living_area || property.lot_area) ? {
              '@type': 'QuantitativeValue',
              value: property.living_area || property.lot_area,
              unitCode: 'MTK',
            } : undefined,
            address: {
              '@type': 'PostalAddress',
              // Só publica logradouro quando o imóvel permite (sem número).
              streetAddress: schemaStreetAddress(property as any),
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
        }).replace(/<\/script/gi, '<\\/script'),
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
        }).replace(/<\/script/gi, '<\\/script'),
      }}
    />
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full">

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
          {property.external_id && (
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-gray-100 text-gray-500 text-xs font-mono px-2.5 py-1 rounded-lg">
                Cód: {property.external_id}
              </span>
            </div>
          )}
          {/* Endereço resumido — bairro + cidade. Não expomos rua/número/
              complemento publicamente pra não dar localização exata pra
              concorrência sem qualificação do lead. */}
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-2">
            <MapPin className="w-3.5 h-3.5 text-[#EC5B13]" />
            {bairroInfo?.name || property.neighborhood}, {property.city}
          </p>
          {/* Nome do condomínio — vem do JOIN em getPropertyBySlug.
              Supabase pode retornar objeto OU array dependendo de como
              infere a relação; cobre os dois. */}
          {(() => {
            const condo = (property as any).condominium;
            const condoName = Array.isArray(condo) ? condo[0]?.name : condo?.name;
            if (!condoName) return null;
            return (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-[#EC5B13]" />
                {condoName}
              </p>
            );
          })()}

          {/* Preços + pacote de locação.
              Antes mostrava só price_sale OR price_rent. Quando o imóvel
              é venda+locação ('sale_rent'), o site mostrava SÓ a locação
              porque o ternário caía no else — usuário interessado em
              compra não via o valor de venda. Agora cada transação
              disponível renderiza como bloco separado. */}
          {(() => {
            // supabase-js retorna numeric como string. parseFloat tolera os 2.
            const num = (v: unknown) => {
              const n = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : NaN);
              return Number.isFinite(n) ? n : 0;
            };
            // Coluna real no banco é iptu_value (price_iptu era nome errado).
            const iptu = num((property as any).iptu_value ?? (property as any).price_iptu);
            const condo = num(property.price_condo);
            const sale = num(property.price_sale);
            const rent = num(property.price_rent);
            const tx = property.transaction_type;
            const isSaleVisible = (tx === 'sale' || tx === 'sale_rent') && sale > 0;
            const isRentVisible = (tx === 'rent' || tx === 'sale_rent') && rent > 0;
            const showPacote = isRentVisible && (iptu > 0 || condo > 0);
            const pacote = rent + iptu + condo;

            // Se nem venda nem locação têm valor cadastrado, mostra "Sob Consulta"
            const isEmpty = !isSaleVisible && !isRentVisible;

            return (
              <div className="mt-5 space-y-3">
                {/* Bloco principal: preços de venda e/ou locação */}
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  {isSaleVisible && (
                    <div>
                      {/* Label só aparece quando tem AMBOS (pra distinguir) */}
                      {isRentVisible && (
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Venda
                        </div>
                      )}
                      <span className="text-3xl md:text-4xl font-heading font-bold text-[#EC5B13]">
                        {formatPrice(sale)}
                      </span>
                    </div>
                  )}
                  {isRentVisible && (
                    <div>
                      {isSaleVisible && (
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Locação
                        </div>
                      )}
                      <span className="text-3xl md:text-4xl font-heading font-bold text-[#EC5B13]">
                        {formatPrice(rent)}
                      </span>
                      <span className="text-base font-normal text-gray-400">{rentSuffixLong(property.rent_type)}</span>
                    </div>
                  )}
                  {isEmpty && (
                    <span className="text-3xl md:text-4xl font-heading font-bold text-[#EC5B13]">
                      Sob Consulta
                    </span>
                  )}
                </div>

                {/* Linha discreta com IPTU/Condomínio (sempre que houver) */}
                {(condo > 0 || iptu > 0) && (
                  <div className="text-xs text-gray-400">
                    {condo > 0 && <span>Condomínio: {formatPrice(condo)}</span>}
                    {condo > 0 && iptu > 0 && <span className="mx-2">·</span>}
                    {iptu > 0 && <span>IPTU: {formatPrice(iptu)}</span>}
                  </div>
                )}

                {/* Pacote de locação destacado — aluguel + IPTU + condomínio.
                    Só pra imóveis com locação visível e ao menos uma taxa
                    extra. Em sale_rent também aparece (deixa claro o custo
                    mensal pra quem vai alugar). */}
                {showPacote && (
                  <div className="inline-flex flex-col gap-1 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#EC5B13]">
                      Pacote total mensal
                    </div>
                    <div className="text-xl font-heading font-bold text-black">
                      {formatPrice(pacote)}
                      <span className="text-sm font-normal text-gray-400">/mês</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Aluguel {formatPrice(rent)}
                      {condo > 0 && <> + Cond. {formatPrice(condo)}</>}
                      {iptu > 0 && <> + IPTU {formatPrice(iptu)}</>}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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

          {/* Vídeo do imóvel. O campo do banco guarda TEXTO colado pela equipe
              (às vezes com duas URLs na mesma linha) e nunca o formato /embed/
              que o iframe exige, então o id é extraído — ver lib/property-video.
              Vídeo institucional repetido em dezenas de imóveis não entra aqui:
              não é vídeo daquele imóvel. */}
          {(() => {
            const embed = propertyVideoEmbed(property.video_url);
            if (!embed) return null;
            return (
              <>
                <div>
                  <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                    Vídeo do imóvel
                  </h2>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={embed}
                      title={`Vídeo do imóvel ${property.external_id ?? ''}`.trim()}
                      className="w-full h-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-8"></div>
              </>
            );
          })()}

          {/* Comodidades — consolida as 8 colunas amenities_* num único array.
              Antes o site tentava ler `property.features` (campo legado que
              já não é populado), então a seção nunca aparecia mesmo com
              comodidades cadastradas no painel. */}
          {(() => {
            const amenities: string[] = [
              ...((property as any).amenities_items || []),
              ...((property as any).amenities_characteristics || []),
              ...((property as any).amenities_leisure || []),
              ...((property as any).amenities_closets || []),
              ...((property as any).amenities_heating || []),
              ...((property as any).amenities_flooring || []),
              ...((property as any).amenities_condo_leisure || []),
              ...((property as any).amenities_condo_infra || []),
              // Fallback pro campo legado se ainda existir em algum imóvel
              ...(property.features || []),
            ];
            // Dedup pra evitar repetição se algum amenity caiu em 2 categorias
            const unique = Array.from(new Set(amenities));
            if (unique.length === 0) return null;
            return (
              <div>
                <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
                  Comodidades
                </h2>
                <AmenitiesList features={unique} />
              </div>
            );
          })()}

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Localização */}
          <div>
            <h2 className="text-lg font-heading font-bold text-black mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#EC5B13] rounded-full"></span>
              Localização
            </h2>
            {/* Endereço e precisão do mapa respeitam `hide_address`
                (lib/property-address): número NUNCA aparece; imóvel com
                "ocultar endereço" mostra só o bairro, e o mapa desenha área
                aproximada em vez de pin exato. */}
            <PropertyMapWrapper
              latitude={property.latitude ?? 0}
              longitude={property.longitude ?? 0}
              address={publicAddressLabel(property as any)}
              precision={addressPrecision(property as any)}
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

            {/* Mini Banner Lançamentos */}
            {launches && launches.length > 0 && (
              <div className="mt-4">
                <LaunchMiniBanner launches={launches} />
              </div>
            )}

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
      {(() => {
        // Em mobile a tela é apertada, então mostra só 1 preço. Pra imóveis
        // venda+locação, priorizamos VENDA (valor maior, mais relevante pra
        // captar atenção). O usuário vê o segundo no scroll up.
        const num = (v: unknown) => {
          const n = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : NaN);
          return Number.isFinite(n) ? n : 0;
        };
        const sale = num(property.price_sale);
        const rent = num(property.price_rent);
        const showSale = (property.transaction_type === 'sale' || property.transaction_type === 'sale_rent') && sale > 0;
        const showRent = property.transaction_type === 'rent' && rent > 0;
        return (
          <div>
            {showSale ? (
              <div className="text-lg font-heading font-bold text-brand-red">{formatPrice(sale)}</div>
            ) : showRent ? (
              <>
                <div className="text-lg font-heading font-bold text-brand-red">{formatPrice(rent)}</div>
                <div className="text-xs text-gray-400">{rentSuffixLong(property.rent_type)}</div>
              </>
            ) : (
              <div className="text-lg font-heading font-bold text-brand-red">Consulte</div>
            )}
          </div>
        );
      })()}
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
