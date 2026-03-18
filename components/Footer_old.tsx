import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-gray-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Institucional */}
          <div>
            <h3 className="font-heading font-bold text-black mb-4">Institucional</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Sobre a Independence
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Trabalhe conosco
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Seja um parceiro
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-heading font-bold text-black mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-500">
                Av. Cassiano Ricardo, 319 - Sala 1201<br />
                Jardim Aquarius, São José dos Campos - SP
              </li>
              <li>
                <a href="tel:+551239000000" className="text-sm text-gray-500 hover:text-black transition-colors">
                  (12) 3900-0000
                </a>
              </li>
              <li>
                <a href="mailto:contato@independenceimoveis.com.br" className="text-sm text-gray-500 hover:text-black transition-colors">
                  contato@independenceimoveis.com.br
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-bold text-black mb-4">Legal</h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-500">
                CRECI: 12345-J
              </li>
              <li className="text-sm text-gray-500">
                CNPJ: 00.000.000/0001-00
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Independence Negócios Imobiliários — São José dos Campos, SP
          </p>
        </div>
      </div>
    </footer>
  );
}
