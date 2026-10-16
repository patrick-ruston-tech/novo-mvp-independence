import type { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, ClipboardList, Handshake } from 'lucide-react';

/**
 * Avaliação gratuita de imóvel — calculadora de um parceiro (Nivu) em
 * iframe. Pedido de out/2026: página própria, CTA "Avaliar Imóvel Grátis",
 * item no menu e URL /avaliar-imovel-gratis.
 *
 * O snippet do parceiro fixa 900×650px; aqui a largura é fluida (até 900px)
 * para não estourar a tela no celular, e a altura cresce no mobile, onde o
 * formulário da calculadora quebra em mais linhas.
 */

const CALCULADORA_URL = 'https://pricing-app.nivu.com.br/3055a87e-6196-4875-9a1f-8b89fd7673d6';

export const metadata: Metadata = {
  title: 'Avaliar Imóvel Grátis',
  description:
    'Descubra quanto vale o seu imóvel em São José dos Campos e região. Avaliação gratuita e online, em poucos minutos.',
  alternates: { canonical: '/avaliar-imovel-gratis' },
  openGraph: {
    title: 'Avaliar Imóvel Grátis',
    description: 'Descubra quanto vale o seu imóvel. Avaliação gratuita e online, em poucos minutos.',
    url: '/avaliar-imovel-gratis',
  },
};

const PASSOS = [
  { icon: ClipboardList, titulo: 'Informe os dados', texto: 'Endereço, tipo, metragem e características do imóvel.' },
  { icon: Calculator, titulo: 'Receba a estimativa', texto: 'A calculadora compara com imóveis da região e mostra uma faixa de valor.' },
  { icon: Handshake, titulo: 'Fale com a Independence', texto: 'Quer vender ou alugar? Nossa equipe faz a avaliação completa e anuncia para você.' },
];

export default function AvaliarImovelGratisPage() {
  return (
    <main className="w-full">
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-red bg-red-50 px-3 py-1 rounded-full">
          Gratuito e online
        </span>
        <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-gray-900 leading-tight mt-4">
          Avaliar Imóvel Grátis
        </h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mt-4">
          Descubra em poucos minutos quanto vale o seu imóvel em São José dos Campos e região.
        </p>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="calculadora flex justify-center">
          <iframe
            src={CALCULADORA_URL}
            title="Calculadora de avaliação de imóvel"
            className="w-full max-w-[900px] h-[900px] sm:h-[750px] md:h-[650px] rounded-2xl border border-gray-100 bg-white"
          >
            Seu navegador não suporta iframes.
          </iframe>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          A estimativa é automática e serve como referência. A avaliação definitiva é feita pela nossa equipe.
        </p>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 text-center">Como funciona</h2>
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          {PASSOS.map(({ icon: Icon, titulo, texto }, i) => (
            <div key={titulo} className="bg-gray-50 rounded-2xl p-6 text-left">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-400 mt-4">Passo {i + 1}</p>
              <h3 className="font-heading font-bold text-lg text-gray-900 mt-1">{titulo}</h3>
              <p className="text-sm text-gray-600 mt-2">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white">Quer vender ou alugar seu imóvel?</h2>
          <p className="text-gray-300 mt-3 max-w-xl mx-auto">
            Anuncie com a Independence: avaliação completa, fotos e divulgação nos principais portais.
          </p>
          <Link
            href="/anunciar"
            className="inline-block mt-6 bg-brand-red hover:bg-brand-dark-red text-white font-semibold px-8 py-3.5 rounded-lg transition-colors"
          >
            Anunciar meu imóvel
          </Link>
        </div>
      </section>
    </main>
  );
}
