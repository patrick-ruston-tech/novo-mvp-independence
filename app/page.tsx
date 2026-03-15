import SearchBlock from '@/components/SearchBlock';
import PropertyCard from '@/components/PropertyCard';
import { getNeighborhoods, getFeaturedProperties, getHomeStats } from '@/lib/queries';

export default async function Home() {
  const [neighborhoods, featured, stats] = await Promise.all([
    getNeighborhoods('São José dos Campos'),
    getFeaturedProperties(8),
    getHomeStats()
  ]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full flex items-center justify-center bg-brand-bg relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10 w-full px-4">
          <SearchBlock neighborhoods={neighborhoods} />
        </div>
      </section>

      {/* Stats Section (Top Stats, maybe?) Or bottom? Let's put stats after hero */}
      <section className="w-full bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-bold font-heading text-brand-red mb-1">{stats.total_sale}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Imóveis à Venda</div>
            </div>
            <div className="pt-6 md:pt-0">
              <div className="text-4xl font-bold font-heading text-brand-red mb-1">{stats.total_rent}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Para Alugar</div>
            </div>
            <div className="pt-6 md:pt-0">
              <div className="text-4xl font-bold font-heading text-brand-red mb-1">{stats.total_neighborhoods}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Bairros Atendidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      {featured.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-black mb-3">Imóveis em Destaque</h2>
            <p className="text-gray-500">As melhores oportunidades selecionadas para você em São José dos Campos.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
