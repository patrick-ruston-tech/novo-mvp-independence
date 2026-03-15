import Link from 'next/link';
import { properties } from '@/data/properties';
import { bairros } from '@/data/bairros';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';

export default async function AlugarBairroPage({ params }: { params: Promise<{ bairro: string }> }) {
  const resolvedParams = await params;
  const bairroInfo = bairros.find(b => b.slug === resolvedParams.bairro);
  const filteredProperties = properties.filter(p => p.finalidade === 'locacao' && p.bairro === resolvedParams.bairro);


  if (!bairroInfo) {
    return <div className="p-20 text-center">Bairro não encontrado.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-2">
          <Link href="/alugar" className="hover:text-black transition-colors">Alugar</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-black">{bairroInfo.nome}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-black">
          Apartamentos e casas para alugar no {bairroInfo.nome}
        </h1>
        <p className="text-base text-gray-500 mt-2 max-w-2xl">
          {bairroInfo.descricao}
        </p>
        <p className="text-sm text-gray-400 mt-4">
          {filteredProperties.length} imóveis encontrados
        </p>
      </div>

      {/* Filtros */}
      <PropertyFilters />

      {/* Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredProperties.map((property, idx) => (
            <div 
              key={property.id} 
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms`, animationDuration: '500ms' }}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl mt-6 border border-gray-100">
          <p className="text-gray-500">Nenhum imóvel encontrado neste bairro com os filtros atuais.</p>
        </div>
      )}
    </div>
  );
}
