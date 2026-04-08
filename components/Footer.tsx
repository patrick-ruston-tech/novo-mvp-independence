import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, MessageCircle, Mail, Instagram, Facebook, Youtube, Linkedin, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A2B3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Marca + Redes Sociais */}
          <div>
            <div className="mb-4">
              <Image src="/logo.svg" alt="Independence Negócios Imobiliários" width={180} height={60} className="h-12 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Referência em negociações imobiliárias em São José dos Campos e região. Segurança e transparência em cada contrato.
            </p>
            <div className="flex gap-2 flex-wrap">
              <a href="https://www.facebook.com/independenceimoveis" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/independenceimoveis/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </a>
              <a href="https://www.youtube.com/@independenceimoveis-sjc" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </a>
              <a href="https://www.linkedin.com/company/imoveisindependence/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </a>
              <a href="https://www.tiktok.com/@independence.imoveis" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.78a8.18 8.18 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.21z" />
                </svg>
              </a>
              <a href="https://br.pinterest.com/independenceimoveissjc/_pins/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.38.04-3.41.22-.93 1.4-5.93 1.4-5.93s-.36-.71-.36-1.77c0-1.66.96-2.9 2.16-2.9 1.02 0 1.51.77 1.51 1.68 0 1.03-.65 2.56-.99 3.98-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.76-2.24 3.76-5.49 0-2.87-2.06-4.87-5-4.87-3.41 0-5.41 2.56-5.41 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.41.16-1.55-.72-2.52-2.98-2.52-4.8 0-3.91 2.84-7.5 8.18-7.5 4.3 0 7.63 3.06 7.63 7.14 0 4.27-2.69 7.7-6.43 7.7-1.26 0-2.43-.65-2.84-1.42l-.77 2.93c-.28 1.08-1.04 2.44-1.55 3.26A12 12 0 1 0 12 0z" />
                </svg>
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
                <Link href="/lancamentos" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Lançamentos
                </Link>
              </li>
              <li>
                <Link href="/anunciar" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Anunciar meu Imóvel
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contato</h3>
            <div className="space-y-3">
              <a href="tel:+551232036500" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-brand-red flex-shrink-0" aria-hidden="true" /> (12) 3203-6500
              </a>
              <a href="https://wa.me/5512991968810" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 text-brand-red flex-shrink-0" aria-hidden="true" /> (12) 99196-8810 (WhatsApp)
              </a>
              <a href="mailto:contato@independenceimoveis.com.br" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-brand-red flex-shrink-0" aria-hidden="true" /> contato@independenceimoveis.com.br
              </a>
            </div>

            <div className="mt-6">
              <h4 className="text-white font-semibold text-sm mb-3">Endereço</h4>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-gray-400 leading-relaxed">
                  Avenida Andrômeda, 433<br />
                  Sobreloja 101 - Jardim Satélite<br />
                  São José dos Campos/SP<br />
                  CEP 12230-000
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Fique por dentro</h3>
            <p className="text-sm text-gray-400 mb-4">
              Receba novidades e oportunidades exclusivas por e-mail.
            </p>
            <form className="flex gap-2" action="#">
              <label htmlFor="newsletter-email" className="sr-only">Seu e-mail</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Digite seu e-mail…"
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
              />
              <button type="submit" aria-label="Inscrever no newsletter" className="bg-brand-red hover:bg-brand-dark-red text-white px-3 py-2.5 rounded-lg transition-colors flex-shrink-0">
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Independence Negócios Imobiliários. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>CRECI 19592-J-SP.</span>
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
