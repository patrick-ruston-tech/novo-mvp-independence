import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, Work_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700', '800'],
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://independenceimoveis.com.br'),
  title: {
    default: 'Independence Negócios Imobiliários | Imóveis em São José dos Campos',
    template: '%s | Independence Imóveis',
  },
  description: 'Encontre casas, apartamentos e terrenos à venda e para alugar em São José dos Campos e região. Lançamentos, oportunidades exclusivas e atendimento personalizado.',
  keywords: ['imóveis', 'São José dos Campos', 'casas', 'apartamentos', 'terrenos', 'alugar', 'comprar', 'lançamentos', 'imobiliária'],
  authors: [{ name: 'Independence Negócios Imobiliários' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Independence Negócios Imobiliários',
    title: 'Independence Negócios Imobiliários | Imóveis em São José dos Campos',
    description: 'Encontre casas, apartamentos e terrenos à venda e para alugar em São José dos Campos e região.',
    images: [{ url: '/hero/hero-1.jpg', width: 1920, height: 800, alt: 'Independence Imóveis' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Independence Negócios Imobiliários',
    description: 'Imóveis em São José dos Campos e região.',
    images: ['/hero/hero-1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${plusJakartaSans.variable} ${workSans.variable}`}>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'Independence Negócios Imobiliários',
              url: 'https://independenceimoveis.com.br',
              logo: 'https://independenceimoveis.com.br/logo.svg',
              description: 'Imobiliária em São José dos Campos especializada em venda e locação de imóveis residenciais e comerciais.',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Av. Cassiano Ricardo, 601',
                addressLocality: 'São José dos Campos',
                addressRegion: 'SP',
                postalCode: '12246-870',
                addressCountry: 'BR',
              },
              telephone: '+55-12-3203-6500',
              areaServed: {
                '@type': 'City',
                name: 'São José dos Campos',
              },
              sameAs: [
                'https://www.instagram.com/independenceimoveis/',
              ],
            }).replace(/<\/script/gi, '<\\/script'),
          }}
        />
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}

