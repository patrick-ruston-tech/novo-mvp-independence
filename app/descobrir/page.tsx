import { Metadata } from 'next';
import { getDiscoverProperties } from '@/lib/queries';
import PropertyCard from '@/components/PropertyCard';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Oportunidades Exclusivas | Independence Imóveis',
  description: 'Imóveis selecionados pela curadoria Independence com alto potencial de valorização e preços especiais em São José dos Campos.',
  alternates: { canonical: 'https://independenceimoveis.com.br/descobrir' },
};

export const revalidate = 60;

export default async function DescobrirPage() {
  const properties = await getDiscoverProperties();

  return (
    <div className="w-full">

      {/* Hero Banner */}
      <div className="px-4 sm:px-6 lg:px-[200px] pt-8 w-full">
        <section className="relative overflow-hidden rounded-3xl min-h-[340px] flex items-center">
          {/* Background */}
          <div className="absolute inset-0">
            <img src="/hero/hero-1.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B3C]/90 via-[#1A2B3C]/75 to-[#1A2B3C]/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-12 max-w-2xl">
            <span className="inline-block bg-[#EC5B13] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-4">
              Oportunidades Exclusivas
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight mb-3">
              Imóveis selecionados<br />para você.
            </h1>
            <p className="text-white/70 text-base max-w-md mb-6">
              Nossa curadoria escolheu propriedades com alto potencial de valorização, preços especiais ou condições exclusivas de negociação.
            </p>
            <div className="flex gap-3">
              <Link
                href="/lancamentos"
                className="bg-white hover:bg-gray-100 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Ver Lançamentos
              </Link>
              <Link
                href="/comprar"
                className="border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                Todos os imóveis
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Properties Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#EC5B13]" />
              {properties.length} oportunidades disponíveis
            </h2>
            <p className="text-sm text-gray-500 mt-1">Seleção atualizada pela equipe Independence</p>
          </div>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma oportunidade disponível no momento.</p>
            <p className="text-sm text-gray-400 mt-1">Novas seleções em breve!</p>
            <Link href="/comprar" className="inline-block mt-6 text-sm font-semibold text-[#EC5B13] hover:underline">
              Ver todos os imóveis →
            </Link>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <div className="px-4 sm:px-6 lg:px-[200px] pb-12 w-full">
        <section className="relative overflow-hidden rounded-3xl bg-brand-red py-12 px-8 sm:px-12 lg:px-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white italic mb-2">
              Fique por dentro das novidades
            </h2>
            <p className="text-white/80 text-sm mb-6">
              Receba as melhores oportunidades e dicas exclusivas diretamente no seu e-mail.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 bg-white rounded-xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/20"
              />
              <button className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                Inscrever-se
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
