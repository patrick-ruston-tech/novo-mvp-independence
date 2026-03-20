import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Heart, TrendingUp, Award, Rocket, Eye, Diamond } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Nós | Independence',
  description: 'Conheça a Independence Negócios Imobiliários. Mais de 24 anos transformando o mercado imobiliário de São José dos Campos.',
};

export default function SobrePage() {
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
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span className="text-sm font-semibold text-gray-500">4.9 ★ no Google</span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-black">
              O que nossos clientes dizem
            </h2>
            <p className="text-gray-500 mt-2">Avaliações reais de quem confiou na Independence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Marcos Oliveira',
                date: 'Há 2 meses',
                stars: 5,
                text: 'Excelente atendimento! A equipe da Independence nos ajudou a encontrar o apartamento perfeito no Aquarius. Processo transparente do início ao fim, com toda a assessoria jurídica necessária.',
              },
              {
                name: 'Fernanda Costa',
                date: 'Há 3 meses',
                stars: 5,
                text: 'Vendemos nossa casa em menos de 30 dias. O consultor foi extremamente profissional, fez uma avaliação justa e trouxe compradores qualificados. Recomendo demais!',
              },
              {
                name: 'Ricardo Santos',
                date: 'Há 1 mês',
                stars: 5,
                text: 'Comprei meu terreno no Parque da Floresta com a Independence. Atendimento diferenciado, me explicaram todas as condições de pagamento e me ajudaram com o financiamento.',
              },
              {
                name: 'Ana Paula Mendes',
                date: 'Há 4 meses',
                stars: 5,
                text: 'Aluguei um apartamento pelo site e fiquei impressionada com a rapidez. Em dois dias já tinha as chaves. Equipe muito atenciosa e organizada.',
              },
              {
                name: 'Carlos Eduardo',
                date: 'Há 2 meses',
                stars: 5,
                text: 'Já é a terceira vez que faço negócio com a Independence. Comprei dois apartamentos para investimento e agora uma casa. Confiança total na equipe.',
              },
              {
                name: 'Juliana Ferreira',
                date: 'Há 3 semanas',
                stars: 5,
                text: 'Precisava de uma sala comercial no centro e encontraram exatamente o que eu buscava. Profissionais que realmente entendem o mercado de São José dos Campos.',
              },
            ].map((review) => (
              <div key={review.name} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.stars }).map((_, i) => (
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
                  <div>
                    <div className="text-sm font-semibold text-black">{review.name}</div>
                    <div className="text-xs text-gray-400">{review.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/place/Independence+Negocios+Imobiliarios/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#EC5B13] hover:underline"
            >
              Ver todas as avaliações no Google →
            </a>
          </div>
        </div>
      </section>

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
