import SearchBlock from '@/components/SearchBlock';
import HeroCarousel from '@/components/HeroCarousel';
import PropertyCard from '@/components/PropertyCard';
import { getNeighborhoods, getFeaturedProperties, getHomeStats } from '@/lib/queries';

export default async function Home() {
  const [neighborhoods, featured, stats] = await Promise.all([
    getNeighborhoods('São José dos Campos'),
    getFeaturedProperties(8),
    getHomeStats(),
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

      {/* Featured Properties Section - narrower */}
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

      {/* Descobrir / Oportunidades Banner */}
      <div className="px-4 sm:px-6 lg:px-[200px] pb-16 w-full">
        <section className="relative overflow-hidden rounded-3xl min-h-[400px] flex items-center">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="/hero/hero-2.jpg"
              alt="Oportunidades"
              className="w-full h-full object-cover"
            />
            {/* Blue gradient overlay matching footer color */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B3C]/90 via-[#1A2B3C]/70 to-[#1A2B3C]/30" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-12 max-w-2xl">
            <span className="inline-block bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
              Oportunidades Únicas
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight mb-4">
              Imóveis abaixo do<br />
              preço de mercado.
            </h2>
            <p className="text-white/70 text-base mb-4 max-w-md">
              Nossa curadoria selecionou propriedades com alto potencial de valorização ou preços reduzidos para fechamento rápido.
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-center gap-2 text-sm text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC5B13]"></span>
                Investimentos com retorno garantido
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC5B13]"></span>
                Documentação 100% regularizada
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC5B13]"></span>
                Assessoria para financiamento
              </li>
            </ul>
            <a
              href="/comprar"
              className="inline-block bg-white hover:bg-gray-100 text-black font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
            >
              Ver Oportunidades
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
