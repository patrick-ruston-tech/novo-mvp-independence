import { Metadata } from 'next';
import { getLaunches } from '@/lib/queries';
import LaunchCard from '@/components/LaunchCard';
import { Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lançamentos | Independence',
  description: 'Conheça os melhores lançamentos imobiliários em São José dos Campos. Empreendimentos na planta com condições especiais.',
};

export const revalidate = 3600;

export default async function LancamentosPage() {
  const launches = await getLaunches();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1 h-6 bg-[#EC5B13] rounded-full"></span>
          <span className="text-sm font-semibold text-[#EC5B13] uppercase tracking-wider">Lançamentos</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-black">
          Empreendimentos em São José dos Campos
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Conheça os melhores lançamentos da região. Condições especiais para compra na planta com acompanhamento completo da Independence.
        </p>
      </div>

      {/* Grid */}
      {launches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum lançamento disponível no momento.</p>
          <p className="text-sm text-gray-400 mt-1">Novos empreendimentos em breve!</p>
        </div>
      )}
    </div>
  );
}
