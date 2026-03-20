import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, MessageCircle, Instagram, Facebook, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A2B3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Marca */}
          <div>
            <div className="mb-4">
              <Image src="/logo.png" alt="Independence Negócios Imobiliários" width={140} height={48} className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Referência em negociações imobiliárias em São José dos Campos e região. Segurança e transparência em cada contrato.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/independenceimoveis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4 text-gray-300" />
              </a>
              <a
                href="https://www.facebook.com/independenceimoveis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4 text-gray-300" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/comprar" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Comprar Imóvel
                </Link>
              </li>
              <li>
                <Link href="/alugar" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Alugar Imóvel
                </Link>
              </li>
              <li>
                <Link href="/anunciar" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Anunciar meu Imóvel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  Av. Adhemar de Barros, 1234<br />
                  Vila Adyana, SJC - SP
                </span>
              </li>
              <li>
                <a href="tel:+551239410000" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-brand-red flex-shrink-0" />
                  (12) 3941-0000
                </a>
              </li>
              <li>
                <a href="https://wa.me/5512997810000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4 text-brand-red flex-shrink-0" />
                  (12) 99781-0000 (WhatsApp)
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Fique por dentro</h3>
            <p className="text-sm text-gray-400 mb-4">
              Receba novidades e oportunidades exclusivas por e-mail.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
              />
              <button className="bg-brand-red hover:bg-brand-dark-red text-white px-3 py-2.5 rounded-lg transition-colors flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Independence Imóveis. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>CRECI J-12345</span>
            <Link href="/termos-de-uso" className="hover:text-gray-300 transition-colors">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="hover:text-gray-300 transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

