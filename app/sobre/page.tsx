import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Heart, TrendingUp, Award, Rocket, Eye, Diamond } from 'lucide-react';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { getTestimonials } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Sobre Nós | Independence',
  description: 'Conheça a Independence Negócios Imobiliários. Mais de 24 anos transformando o mercado imobiliário de São José dos Campos.',
};

export default async function SobrePage() {
  const testimonials = await getTestimonials('about');
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
                Tradição em Realizar Sonhos no Vale do Paraíba
              </h1>
              <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
                Mais do que imóveis, conectamos pessoas aos lares que transformam suas vidas. Transparência, ética e segurança jurídica em cada negociação.
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
                A consultoria que seu <span className="text-brand-red italic">estilo de vida</span> merece.
              </h2>
              <div className="space-y-5 text-gray-600 text-base leading-relaxed">
                <p>
                  A Independence Imóveis nasceu em São José dos Campos com o propósito de transformar a experiência de compra e venda de imóveis. Atuamos como facilitadores, conectando pessoas aos seus lares ideais com transparência, ética e segurança jurídica.
                </p>
                <p>
                  Nossa equipe de consultores é especializada em cada região da cidade, garantindo que você tome a melhor decisão para sua família ou para seus negócios. São mais de 24 anos de mercado e milhares de famílias atendidas.
                </p>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-gray-100">
                <div>
                  <div className="font-heading font-extrabold text-5xl text-brand-red">24+</div>
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
                Conectar pessoas a lares que potencializem sua felicidade, através de uma consultoria especializada, transparente e humana.
              </p>
            </div>
            <div className="bg-white p-8 md:p-10 rounded-2xl group hover:bg-brand-red transition-colors duration-500">
              <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                <Eye className="w-6 h-6 text-brand-red group-hover:text-white transition-colors" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-black group-hover:text-white transition-colors">Visão</h3>
              <p className="text-gray-500 leading-relaxed group-hover:text-white/80 transition-colors">
                Ser a referência em consultoria imobiliária no Vale do Paraíba, reconhecida pela integridade, inovação e excelência no atendimento.
              </p>
            </div>
            <div className="bg-white p-8 md:p-10 rounded-2xl group hover:bg-brand-red transition-colors duration-500">
              <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                <Diamond className="w-6 h-6 text-brand-red group-hover:text-white transition-colors" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-black group-hover:text-white transition-colors">Valores</h3>
              <p className="text-gray-500 leading-relaxed group-hover:text-white/80 transition-colors">
                Transparência absoluta, ética em cada negociação, compromisso com o sucesso do cliente e segurança jurídica total.
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

      {/* ===== POR QUE NOS ESCOLHER ===== */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
            <div className="md:w-1/3">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-black leading-tight mb-4">Por que escolher a Independence?</h2>
              <p className="text-gray-500 text-base">Diferenciais que nos tornam o parceiro ideal para sua próxima conquista.</p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Award className="w-7 h-7 text-[#EC5B13]" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg mb-2 text-black">Curadoria Exclusiva</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Selecionamos propriedades com alto potencial de valorização e qualidade construtiva comprovada.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Heart className="w-7 h-7 text-[#EC5B13]" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg mb-2 text-black">Atendimento Humanizado</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Consultoria pautada na escuta ativa e na personalização total da sua jornada de compra.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="w-7 h-7 text-[#EC5B13]" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg mb-2 text-black">Segurança Jurídica</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Corpo jurídico especializado para garantir que cada transação seja impecável e segura.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-[#EC5B13]" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg mb-2 text-black">Inteligência de Mercado</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Análises em tempo real do mercado para orientar as melhores decisões de investimento imobiliário.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EQUIPE ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-black">Nossa Equipe</h2>
            <p className="text-gray-500 mt-2">Consultores dedicados a encontrar o imóvel ideal para você.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'André Santos', role: 'Diretor Geral', initials: 'AS' },
              { name: 'Mariana Costa', role: 'Diretora Comercial', initials: 'MC' },
              { name: 'Ricardo Almeida', role: 'Consultor Sênior', initials: 'RA' },
              { name: 'Beatriz Lima', role: 'Consultora de Locação', initials: 'BL' },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-2xl overflow-hidden group">
                <div className="aspect-square bg-gradient-to-br from-[#1A2B3C] to-[#2d4a63] flex items-center justify-center">
                  <span className="text-4xl font-heading font-bold text-white/30 group-hover:text-white/50 transition-colors">
                    {member.initials}
                  </span>
                </div>
                <div className="p-5">
                  <h5 className="font-heading font-bold text-base text-black">{member.name}</h5>
                  <p className="text-gray-500 text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 text-center mt-8 italic">
            Fotos da equipe serão adicionadas em breve.
          </p>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <section className="bg-brand-red rounded-3xl p-10 md:p-16 text-center">
          <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-white leading-tight mb-6">
            Pronto para conquistar<br />sua independência?
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Fale com um dos nossos consultores e descubra as melhores oportunidades em São José dos Campos e região.
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
