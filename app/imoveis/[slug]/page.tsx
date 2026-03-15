'use client';

import { useState, use } from 'react';
import { properties } from '@/data/properties';
import { bairros } from '@/data/bairros';
import PropertyGallery from '@/components/PropertyGallery';
import { Check, MessageCircle } from 'lucide-react';

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const property = properties.find(p => p.slug === resolvedParams.slug);
  const [showFullDescription, setShowFullDescription] = useState(false);



  if (!property) {
    return <div className="p-20 text-center">Imóvel não encontrado.</div>;
  }

  const bairroInfo = bairros.find(b => b.slug === property.bairro);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Galeria */}
      <div className="mb-8">
        <PropertyGallery images={property.imagemCores} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Coluna Principal (60%) */}
        <div className="lg:col-span-7">
          {/* Tags */}
          <div className="flex gap-2 mb-4">
            {property.finalidade === 'locacao' && (
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Locação
              </span>
            )}
            {property.tags.map(tag => (
              <span 
                key={tag}
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  tag === 'novo' ? 'bg-black text-white' :
                  tag === 'destaque' ? 'bg-brand-red text-white' :
                  'bg-white text-black border border-gray-200'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-heading font-bold text-black leading-tight">
            {property.titulo}
          </h1>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-2">
            {property.endereco} — {property.bairroNome}
          </p>

          <div className="mt-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-heading font-bold text-black">
                {formatPrice(property.preco)}
              </span>
              {property.finalidade === 'locacao' && (
                <span className="text-base font-normal text-gray-400">por mês</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {property.condominio && <span>Condomínio {formatPrice(property.condominio)}</span>}
              {property.condominio && property.iptu && <span className="mx-2">·</span>}
              {property.iptu && <span>IPTU {formatPrice(property.iptu)}</span>}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Características */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.quartos}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Quartos</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.suites}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Suítes</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.banheiros}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Banheiros</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.vagas}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Vagas</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-heading font-bold text-black">{property.metragem}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">m²</div>
            </div>
            {property.andar && (
              <div className="text-center py-3">
                <div className="text-2xl font-heading font-bold text-black">{property.andar}º</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Andar</div>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Descrição */}
          <div>
            <h2 className="text-lg font-heading font-bold text-black mb-4">Sobre o imóvel</h2>
            <div className={`text-base text-gray-600 leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
              {property.descricao}
            </div>
            {!showFullDescription && (
              <button 
                onClick={() => setShowFullDescription(true)}
                className="text-sm text-brand-red font-medium cursor-pointer mt-2 hover:underline"
              >
                Ler mais
              </button>
            )}
          </div>

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Comodidades */}
          <div>
            <h2 className="text-lg font-heading font-bold text-black mb-4">Comodidades</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {property.caracteristicas.map(carac => (
                <div key={carac} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gray-600" />
                  </span>
                  {carac}
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-8"></div>

          {/* Localização */}
          <div>
            <h2 className="text-lg font-heading font-bold text-black mb-4">Localização</h2>
            <div className="bg-brand-bg rounded-xl h-64 flex items-center justify-center border border-gray-100">
              <span className="text-gray-400 text-sm font-medium">Mapa interativo — Google Maps</span>
            </div>
            {bairroInfo && (
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                <span className="font-semibold text-gray-700">{bairroInfo.nome}:</span> {bairroInfo.descricao}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar (40%) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading font-bold text-xl text-black">Tenho interesse neste imóvel</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">Preencha seus dados e entraremos em contato</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <input 
                  type="text" 
                  placeholder="Nome completo" 
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  placeholder="Telefone / WhatsApp" 
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Olá, gostaria de mais informações sobre este imóvel..." 
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all resize-none text-black"
                ></textarea>
              </div>
              
              <button className="w-full bg-brand-red hover:bg-brand-dark-red text-white font-semibold py-3.5 rounded-xl transition-colors mt-2">
                Enviar mensagem
              </button>
            </form>

            <div className="mt-4">
              <a 
                href="https://wa.me/551239000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Falar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div>
          <div className="text-lg font-heading font-bold text-black">{formatPrice(property.preco)}</div>
          {property.finalidade === 'locacao' && <div className="text-xs text-gray-400">por mês</div>}
        </div>
        <button 
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="bg-brand-red text-white rounded-xl px-6 py-3 font-semibold text-sm whitespace-nowrap"
        >
          Tenho interesse
        </button>
      </div>
    </div>
  );
}
