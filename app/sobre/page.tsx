import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Heart, TrendingUp, Award, Rocket, Eye, Diamond } from 'lucide-react';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import TeamCarousel from '@/components/TeamCarousel';
import { getTestimonials, getTeamMembers } from '@/lib/queries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Sobre Nós | Independence',
  description: 'Conheça a Independence Negócios Imobiliários. Mais de 25 anos transformando o mercado imobiliário de São José dos Campos.',
};

export default async function SobrePage() {
  const [testimonials, teamMembers] = await Promise.all([
    getTestimonials('about'),
    getTeamMembers(),
  ]);
  return (
    <div className="w-full">

      {/* ===== HERO ===== */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        <section className="relative h-[500px] md:h-[600px] w-full flex items-center overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image src="/hero/hero-1.jpg" alt="Independence Imóveis" fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 w-full">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider mb-6">
                Quem Somos
              </span>
              <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white leading-tight">
                Criamos conexões, revelamos oportunidades e construímos histórias.
              </h1>
              <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
                Na Independence, não vendemos apenas imóveis — acreditamos no poder da escuta, da empatia e do respeito como ferramentas para transformar vidas.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ===== NOSSA TRAJETÓRIA ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <Image src="/hero/hero-2.jpg" alt="Escritório Independence" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gray-50 rounded-2xl -z-10"></div>
            </div>
            {/* Text */}
            <div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-black leading-tight mb-8">
                Nascemos da confiança e crescemos com o propósito de <span className="text-brand-red italic">ir além</span>.
              </h2>
              <div className="space-y-5 text-gray-600 text-base leading-relaxed">
                <p>
                  Na Independence Negócios Imobiliários, criamos conexões, revelamos oportunidades e construímos histórias. Acreditamos no poder da escuta, da empatia e do respeito como ferramentas para transformar vidas de clientes, colaboradores e parceiros.
                </p>
                <p>
                  Somos do bem, porque escolhemos agir com o coração e com a consciência, transformando cada negócio em um legado humano. Cada atendimento é guiado pela empatia, pela ética e pelo desejo genuíno de fazer a diferença.
                </p>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-gray-100">
                <div>
                  <div className="font-heading font-extrabold text-5xl text-brand-red">25+</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Anos de Mercado</div>
                </div>
                <div>
                  <div className="font-heading font-extrabold text-5xl text-brand-red">3k+</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Imóveis Negociados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSÃO, VISÃO, VALORES ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-black">Fundamentos da Nossa Excelência</h2>
          <div className="h-1 w-16 bg-brand-red mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 md:p-10 rounded-2xl group hover:bg-brand-red transition-colors duration-500">
              <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                <Rocket className="w-6 h-6 text-brand-red group-hover:text-white transition-colors" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-black group-hover:text-white transition-colors">Missão</h3>
              <p className="text-gray-500 leading-relaxed group-hover:text-white/80 transition-colors">
                Conectar pessoas a imóveis com propósito, oferecendo um atendimento acolhedor, transparente e eficiente, promovendo bem-estar e evolução pessoal e coletiva.
              </p>
            </div>
            <div className="bg-white p-8 md:p-10 rounded-2xl group hover:bg-brand-red transition-colors duration-500">
              <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                <Eye className="w-6 h-6 text-brand-red group-hover:text-white transition-colors" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-black group-hover:text-white transition-colors">Visão</h3>
              <p className="text-gray-500 leading-relaxed group-hover:text-white/80 transition-colors">
                Ser referência no mercado imobiliário como uma empresa que vai além da venda e locação, deixando um legado humano e transformador para clientes, colaboradores, parceiros e sociedade.
              </p>
            </div>
            <div className="bg-white p-8 md:p-10 rounded-2xl group hover:bg-brand-red transition-colors duration-500">
              <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                <Diamond className="w-6 h-6 text-brand-red group-hover:text-white transition-colors" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-black group-hover:text-white transition-colors">Valores</h3>
              <p className="text-gray-500 leading-relaxed group-hover:text-white/80 transition-colors">
                Empatia, ética, autoconhecimento, respeito, dedicação, profissionalismo com propósito e acolhimento. Cultivamos um ambiente leve, humano e próximo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <TestimonialCarousel
              testimonials={testimonials}
              googleReviewsUrl="https://www.google.com/search?q=independence+neg%C3%B3cios+imobili%C3%A1rios#lrd=0x94cc4a8e0d4269db:0x89cd9f4d513ac9ea,1,,,,"
            />
          </div>
        </section>
      )}

      {/* ===== NOSSOS VALORES ===== */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-black leading-tight mb-4">Nossos Valores</h2>
            <p className="text-gray-500 max-w-2xl">Os pilares que guiam cada atendimento e decisão na Independence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Heart, title: 'Empatia', desc: 'Ouvimos com atenção e cuidamos com presença.' },
              { icon: Shield, title: 'Ética e Moral', desc: 'Decisões justas, responsáveis e coerentes com nossos princípios.' },
              { icon: TrendingUp, title: 'Autoconhecimento', desc: 'Crescimento pessoal como chave da evolução profissional.' },
              { icon: Award, title: 'Respeito', desc: 'Tratamos a todos com dignidade, consideração e justiça.' },
              { icon: Rocket, title: 'Dedicação', desc: 'Entregamos o nosso melhor, com constância e compromisso.' },
              { icon: Eye, title: 'Profissionalismo', desc: 'Excelência técnica com intenção positiva em cada ação.' },
              { icon: Diamond, title: 'Acolhimento', desc: 'Cultivamos um ambiente leve, humano e próximo.' },
            ].map((valor) => (
              <div key={valor.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-brand-red hover:text-white group transition-colors duration-300">
                <valor.icon className="w-6 h-6 text-[#EC5B13] mb-4 group-hover:text-white transition-colors" />
                <h4 className="font-heading font-bold text-base mb-2 text-black group-hover:text-white transition-colors">{valor.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-white/80 transition-colors">{valor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EQUIPE ===== */}
      {teamMembers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <TeamCarousel members={teamMembers} />
          </div>
        </section>
      )}

      {/* ===== CTA FINAL ===== */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <section className="bg-brand-red rounded-3xl p-10 md:p-16 text-center">
          <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-white leading-tight mb-6">
            Pronto para conquistar<br />sua independência?
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Na Independence, valorizamos as relações humanas tanto quanto os resultados. Fale com um consultor e descubra como podemos transformar seu próximo passo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/comprar"
              className="bg-white text-brand-red font-semibold px-8 py-4 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Ver Imóveis
            </Link>
            <a
              href="https://wa.me/5512991968810"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Falar com Consultor
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
