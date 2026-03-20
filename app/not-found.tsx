import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="font-heading font-extrabold text-7xl text-brand-red mb-4">404</h1>
      <h2 className="font-heading font-bold text-2xl text-black mb-2">Página não encontrada</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        A página que você procura não existe ou foi movida.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-brand-red hover:bg-brand-dark-red text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Voltar ao Início
        </Link>
        <Link
          href="/comprar"
          className="border border-gray-200 text-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
        >
          Ver Imóveis
        </Link>
      </div>
    </div>
  );
}
