import Link from 'next/link';
import { getProperties, getNeighborhoodBySlug } from '@/lib/queries';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import { PropertyFilters as PropertyFiltersType } from '@/types/property';
import Pagination from '@/components/Pagination';

export default async function ComprarBairroPage({
  params,
  searchParams,
}: {
  params: Promise<{ bairro: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const bairroSlug = resolvedParams.bairro;
  const bairroInfo = await getNeighborhoodBySlug(bairroSlug);

  const page = Number(resolvedSearch.pagina) || 1;
  const sort_by = (resolvedSearch.ordem as PropertyFiltersType['sort_by']) || 'newest';
  const property_type = resolvedSearch.tipo as PropertyFiltersType['property_type'];
  const bedrooms_min = Number(resolvedSearch.quartos) || undefined;
  const price_min = Number(resolvedSearch.preco_min) || undefined;
  const price_max = Number(resolvedSearch.preco_max) || undefined;
  const garages_min = Number(resolvedSearch.garagens) || undefined;

  const filters: PropertyFiltersType = {
    transaction_type: 'sale',
    neighborhood: bairroInfo ? bairroInfo.name : bairroSlug, // fallback if neighborhood missing in DB
    page,
    per_page: 12,
    sort_by,
    property_type,
    bedrooms_min,
    price_min,
    price_max,
    garages_min,
  };

  const { data: properties, total, total_pages } = await getProperties(filters);

  if (!bairroInfo) {
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Bairro não encontrado.</h2>
        <Link href="/comprar" className="text-brand-red font-semibold hover:underline">
          Ver todos os imóveis à venda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-2">
          <Link href="/comprar" className="hover:text-black transition-colors">Comprar</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-black">{bairroInfo.name}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-black">
          Imóveis à venda em {bairroInfo.name}
        </h1>
        {bairroInfo.description && (
          <p className="text-base text-gray-500 mt-2 max-w-2xl">
            {bairroInfo.description}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-4">
          {total} imóveis encontrados
        </p>
      </div>

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
          <p className="text-gray-500">Nenhum imóvel encontrado neste bairro com os filtros atuais.</p>
        </div>
      )}

      {/* Paginação */}
      <Pagination
        currentPage={page}
        totalPages={total_pages}
        basePath={`/comprar/${bairroSlug}`}
      />
    </div>
  );
}
