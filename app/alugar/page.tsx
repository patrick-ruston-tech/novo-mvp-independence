import Link from 'next/link';
import { getProperties, getNeighborhoods, getTopNeighborhoods } from '@/lib/queries';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import { PropertyFilters as PropertyFiltersType } from '@/types/property';
import Pagination from '@/components/Pagination';


export default async function AlugarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.pagina) || 1;
  const sort_by = (resolvedParams.ordem as PropertyFiltersType['sort_by']) || 'newest';
  const property_type = resolvedParams.tipo as PropertyFiltersType['property_type'];
  const bedrooms_min = Number(resolvedParams.quartos) || undefined;
  const price_min = Number(resolvedParams.preco_min) || undefined;
  const price_max = Number(resolvedParams.preco_max) || undefined;
  const garages_min = Number(resolvedParams.garagens) || undefined;
  const city = resolvedParams.cidade as string | undefined;

  const filters: PropertyFiltersType = {
    transaction_type: 'rent',
    page,
    per_page: 12,
    sort_by,
    property_type,
    bedrooms_min,
    price_min,
    price_max,
    garages_min,
    city,
  };

  const [propertiesResponse, neighborhoods, topNeighborhoods] = await Promise.all([
    getProperties(filters),
    getNeighborhoods(city),
    getTopNeighborhoods('rent', city, 4),
  ]);

  const { data: properties, total } = propertiesResponse;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-black">
          Imóveis para alugar em {city || 'São José dos Campos e região'}
        </h1>
        <p className="text-sm text-gray-400 mt-4">
          {total} imóveis encontrados
        </p>
      </div>

      {/* Bairros Cards */}
      {topNeighborhoods.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {topNeighborhoods.map(bairro => (
            <Link
              key={bairro.slug}
              href={`/alugar/${bairro.slug}`}
              className="bg-brand-bg border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors group"
            >
              <h3 className="font-semibold text-black group-hover:text-brand-red transition-colors">{bairro.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{bairro.count} imóveis</p>
            </Link>
          ))}
        </div>
      )}

      {/* Filtros */}
      <PropertyFilters />

      {/* Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {properties.map((property, idx) => (
            <div
              key={property.id}
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${(idx % 12) * 50}ms`, animationDuration: '500ms' }}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl mt-6 border border-gray-100">
          <p className="text-gray-500">Nenhum imóvel encontrado com os filtros atuais.</p>
        </div>
      )}

      {/* Paginação */}
      <Pagination
        currentPage={page}
        totalPages={propertiesResponse.total_pages}
        basePath="/alugar"
      />
    </div>
  );

}
