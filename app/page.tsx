import { Suspense } from 'react';
import { Metadata } from 'next';
import HeroCarousel from '@/components/HeroCarousel';
import SearchBlock from '@/components/SearchBlock';
import LaunchBannerCarousel from '@/components/LaunchBannerCarousel';
import PropertyCard from '@/components/PropertyCard';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getNeighborhoods, getFeaturedProperties, getHomeStats, getFeaturedLaunches, getDiscoverProperties, getTestimonials } from '@/lib/queries';
import TestimonialCarousel from '@/components/TestimonialCarousel';

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
  const launches = await getFeaturedLaunches(10);
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

async function TestimonialsSection() {
  const testimonials = await getTestimonials('home');
  if (testimonials.length === 0) return null;

  return (
    <section className="w-full py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <TestimonialCarousel
          testimonials={testimonials}
          googleReviewsUrl="https://www.google.com/search?q=independence+neg%C3%B3cios+imobili%C3%A1rios#lrd=0x94cc4a8e0d4269db:0x89cd9f4d513ac9ea,1,,,,"
        />
      </div>
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
      <Suspense>
        <TestimonialsSection />
      </Suspense>

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
