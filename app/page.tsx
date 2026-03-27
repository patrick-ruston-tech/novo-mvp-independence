import { Suspense } from 'react';
import { Metadata } from 'next';
import HeroCarousel from '@/components/HeroCarousel';
import SearchBlock from '@/components/SearchBlock';
import LaunchBannerCarousel from '@/components/LaunchBannerCarousel';
import PropertyCard from '@/components/PropertyCard';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getNeighborhoods, getFeaturedProperties, getHomeStats, getFeaturedLaunches, getDiscoverProperties } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Independence Negócios Imobiliários | Imóveis em São José dos Campos',
  description: 'Encontre casas, apartamentos, terrenos e lançamentos à venda e para alugar em São José dos Campos e região. Mais de 24 anos de tradição no mercado imobiliário.',
  alternates: { canonical: 'https://independenceimoveis.com.br' },
};

export const revalidate = 60;

// ── Async section components for Suspense streaming ──

async function HeroSection() {
  const [neighborhoods, stats] = await Promise.all([
    getNeighborhoods('São José dos Campos'),
    getHomeStats(),
  ]);

  return (
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
  );
}

async function FeaturedSection() {
  const featured = await getFeaturedProperties(8);
  if (featured.length === 0) return null;

  const row1 = featured.slice(0, 4);
  const row2 = featured.slice(4, 8);

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-black mb-2">Imóveis em Destaque</h2>
          <p className="text-gray-500">As melhores oportunidades selecionadas para você em São José dos Campos.</p>
        </div>
        <Link href="/comprar" className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#EC5B13] hover:underline">
          Ver todos <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {row1.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {row2.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {row2.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <Link href="/comprar" className="md:hidden flex items-center justify-center gap-1 text-sm font-semibold text-[#EC5B13] hover:underline mt-8">
        Ver todos os imóveis <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

async function LaunchesSection() {
  const launches = await getFeaturedLaunches(3);
  if (launches.length === 0) return null;

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
      <LaunchBannerCarousel launches={launches} />
    </div>
  );
}

async function DiscoverSection() {
  const discover = await getDiscoverProperties();
  const discoverHome = discover.slice(0, 4);
  if (discoverHome.length === 0) return null;

  return (
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
          Ver todos <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {discoverHome.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <Link href="/descobrir" className="md:hidden flex items-center justify-center gap-1 text-sm font-semibold text-[#EC5B13] hover:underline mt-8">
        Ver oportunidades <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

// ── Skeleton fallbacks ──

function FeaturedSkeleton() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-5 w-96 bg-gray-100 rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl aspect-[4/3] animate-pulse" />
        ))}
      </div>
    </section>
  );
}

function LaunchesSkeleton() {
  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
      <div className="rounded-3xl min-h-[420px] bg-gray-100 animate-pulse" />
    </div>
  );
}

// ── Page ──

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">

      {/* Hero — critical, no skeleton needed (fast cached queries) */}
      <Suspense>
        <HeroSection />
      </Suspense>

      {/* Featured Properties */}
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedSection />
      </Suspense>

      {/* Launch Banners */}
      <Suspense fallback={<LaunchesSkeleton />}>
        <LaunchesSection />
      </Suspense>

      {/* Discover */}
      <Suspense fallback={<FeaturedSkeleton />}>
        <DiscoverSection />
      </Suspense>

      {/* ===== DEPOIMENTOS ===== */}
      <section className="w-full py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span className="text-sm font-semibold text-gray-500">4.9 ★ no Google</span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-black">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Marcos Oliveira',
                text: 'Excelente atendimento! A equipe da Independence nos ajudou a encontrar o apartamento perfeito no Aquarius. Processo transparente do início ao fim.',
              },
              {
                name: 'Fernanda Costa',
                text: 'Vendemos nossa casa em menos de 30 dias. O consultor foi extremamente profissional, fez uma avaliação justa e trouxe compradores qualificados.',
              },
              {
                name: 'Ricardo Santos',
                text: 'Comprei meu terreno no Parque da Floresta com a Independence. Atendimento diferenciado, me explicaram todas as condições e ajudaram com o financiamento.',
              },
            ].map((review) => (
              <div key={review.name} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div className="text-sm font-semibold text-black">{review.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <a
              href="https://www.google.com/maps/place/Independence+Negocios+Imobiliarios/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#EC5B13] hover:underline"
            >
              Ver todas as avaliações no Google →
            </a>
          </div>
        </div>
      </section>

      {/* Sobre Nós — static, no data fetching */}
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
                <Image src="/hero/hero-2.jpg" alt="Independence Imóveis" width={600} height={450} className="w-full h-full object-cover" />
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
