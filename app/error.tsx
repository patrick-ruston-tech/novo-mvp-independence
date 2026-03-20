'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="font-heading font-extrabold text-7xl text-brand-red mb-4">Ops!</h1>
      <h2 className="font-heading font-bold text-2xl text-black mb-2">Algo deu errado</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Ocorreu um erro inesperado. Tente novamente ou volte à página inicial.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="bg-brand-red hover:bg-brand-dark-red text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Tentar Novamente
        </button>
        <a
          href="/"
          className="border border-gray-200 text-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
        >
          Voltar ao Início
        </a>
      </div>
    </div>
  );
}
