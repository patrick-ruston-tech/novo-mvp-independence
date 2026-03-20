import SearchBlock from '@/components/SearchBlock';
import HeroCarousel from '@/components/HeroCarousel';
import PropertyCard from '@/components/PropertyCard';
import LaunchBannerCarousel from '@/components/LaunchBannerCarousel';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getNeighborhoods, getFeaturedProperties, getHomeStats, getFeaturedLaunches, getDiscoverProperties } from '@/lib/queries';

export default async function Home() {
  const [neighborhoods, featured, stats, launches, discover] = await Promise.all([
    getNeighborhoods('São José dos Campos'),
    getFeaturedProperties(8),
    getHomeStats(),
    getFeaturedLaunches(3),
    getDiscoverProperties(),
  ]);

  // Split featured into 2 rows of 4
  const row1 = featured.slice(0, 4);
  const row2 = featured.slice(4, 8);

  // Discover: max 4 for home
  const discoverHome = discover.slice(0, 4);

  return (
    <div className="flex flex-col items-center w-full">

      {/* ===== HERO ===== */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 w-full">
        <section className="relative overflow-hidden min-h-[600px] md:min-h-[620px] flex items-center rounded-3xl">
          <HeroCarousel />
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12 flex flex-col lg:flex-row items-center lg:items-start gap-10">
            <div className="flex-1 text-center lg:text-left lg:pt-12">
              <Image src="/logo.png" alt="Independence" width={160} height={54} className="h-12 w-auto brightness-0 invert mb-6" />
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

      {/* ===== IMÓVEIS EM DESTAQUE (2 linhas) ===== */}
      {featured.length > 0 && (
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-black mb-2">Imóveis em Destaque</h2>
              <p className="text-gray-500">As melhores oportunidades selecionadas para você em São José dos Campos.</p>
            </div>
            <Link href="/comprar" className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#EC5B13] hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {row1.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Row 2 */}
          {row2.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {row2.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <Link href="/comprar" className="md:hidden flex items-center justify-center gap-1 text-sm font-semibold text-[#EC5B13] hover:underline mt-8">
            Ver todos os imóveis <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ===== BANNER LANÇAMENTOS (Carrossel) ===== */}
      {launches.length > 0 && (
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
          <LaunchBannerCarousel launches={launches} />
        </div>
      )}

      {/* ===== DESCOBRIR (1 linha) ===== */}
      {discoverHome.length > 0 && (
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-6 bg-[#EC5B13] rounded-full"></span>
                <span className="text-sm font-semibold text-[#EC5B13] uppercase tracking-wider">Oportunidades</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-black">Descobrir</h2>
              <p className="text-gray-500 mt-1">Imóveis selecionados pela nossa curadoria com condições especiais.</p>
            </div>
            <Link href="/descobrir" className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#EC5B13] hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discoverHome.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <Link href="/descobrir" className="md:hidden flex items-center justify-center gap-1 text-sm font-semibold text-[#EC5B13] hover:underline mt-8">
            Ver oportunidades <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ===== SOBRE NÓS (resumo curto) ===== */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-bold text-3xl text-black leading-tight mb-4">
                Tradição em Realizar Sonhos no <span className="text-brand-red italic">Vale do Paraíba</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                A Independence Imóveis nasceu em São José dos Campos com o propósito de transformar a experiência de compra e venda de imóveis. Atuamos como facilitadores, conectando pessoas aos seus lares ideais com transparência, ética e segurança jurídica.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Nossa equipe de consultores é especializada em cada região da cidade, garantindo que você tome a melhor decisão para sua família ou para seus negócios.
              </p>
              <div className="flex gap-8 mb-8">
                <div>
                  <div className="font-heading font-extrabold text-4xl text-brand-red">24+</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Anos de Mercado</div>
                </div>
                <div>
                  <div className="font-heading font-extrabold text-4xl text-brand-red">3k+</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Imóveis Negociados</div>
                </div>
                <div>
                  <div className="font-heading font-extrabold text-4xl text-brand-red">251</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Bairros Atendidos</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/sobre"
                  className="bg-brand-red hover:bg-brand-dark-red text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  Conheça Nossa Equipe
                </Link>
                <Link
                  href="/sobre"
                  className="border border-gray-200 text-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
                >
                  Nossa História
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img src="/hero/hero-2.jpg" alt="Independence Imóveis" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-lg">
                <div className="font-heading font-extrabold text-3xl text-brand-red">25+</div>
                <div className="text-xs text-gray-500 font-medium">Anos de História</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
