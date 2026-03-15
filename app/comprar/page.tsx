import Link from 'next/link';
import { properties } from '@/data/properties';
import { bairros } from '@/data/bairros';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';

export default function ComprarPage() {
  const filteredProperties = properties.filter(p => p.finalidade === 'venda');

  // Contagem por bairro
  const bairroCounts = bairros.map(b => ({
    ...b,
    count: properties.filter(p => p.finalidade === 'venda' && p.bairro === b.slug).length
  })).filter(b => b.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-black">
          Imóveis à venda em São José dos Campos
        </h1>
        <p className="text-sm text-gray-400 mt-4">
          {filteredProperties.length} imóveis encontrados
        </p>
      </div>

      {/* Bairros Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {bairroCounts.map(bairro => (
          <Link 
            key={bairro.slug} 
            href={`/comprar/${bairro.slug}`}
            className="bg-brand-bg border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors group"
          >
            <h3 className="font-semibold text-black group-hover:text-brand-red transition-colors">{bairro.nome}</h3>
            <p className="text-xs text-gray-500 mt-1">{bairro.count} imóveis</p>
          </Link>
        ))}
      </div>

      {/* Filtros */}
      <PropertyFilters />

      {/* Grid */}
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
    </div>
  );
}
