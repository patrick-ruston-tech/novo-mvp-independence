import SearchBlock from '@/components/SearchBlock';
import HeroCarousel from '@/components/HeroCarousel';
import PropertyCard from '@/components/PropertyCard';
import LaunchBannerCarousel from '@/components/LaunchBannerCarousel';
import { getNeighborhoods, getFeaturedProperties, getHomeStats, getFeaturedLaunches } from '@/lib/queries';

export default async function Home() {
  const [neighborhoods, featured, stats, launches] = await Promise.all([
    getNeighborhoods('São José dos Campos'),
    getFeaturedProperties(8),
    getHomeStats(),
    getFeaturedLaunches(3),
  ]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-[200px] pt-12 w-full">
        <section className="relative overflow-hidden min-h-[600px] md:min-h-[620px] flex items-center rounded-3xl">
          <HeroCarousel />
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12 flex flex-col lg:flex-row items-center lg:items-start gap-10">
            <div className="flex-1 text-center lg:text-left lg:pt-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                Bom mesmo<br />
                é viver em São José!
              </h1>
              <p className="text-lg md:text-xl text-white/80 mt-4 max-w-md mx-auto lg:mx-0">
                Oportunidades imperdíveis: lançamentos, compra e aluguel de imóveis!
              </p>
            </div>
            <div className="w-full lg:w-auto flex-shrink-0">
              <SearchBlock neighborhoods={neighborhoods} stats={stats} />
            </div>
          </div>
        </section>
      </div>

      {/* Featured Properties Section */}
      {featured.length > 0 && (
        <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-black mb-2">Imóveis em Destaque</h2>
            <p className="text-gray-500">As melhores oportunidades selecionadas para você em São José dos Campos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* Lançamentos Banner Carousel */}
      {launches.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-[200px] pb-16 w-full">
          <LaunchBannerCarousel launches={launches} />
        </div>
      )}
    </div>
  );
}
