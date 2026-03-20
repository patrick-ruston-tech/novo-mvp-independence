import { getProperties, getNeighborhoods } from '@/lib/queries';
import PropertyCard from '@/components/PropertyCard';
import SidebarFilters from '@/components/SidebarFilters';
import Pagination from '@/components/Pagination';
import { PropertyFilters as PropertyFiltersType } from '@/types/property';

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
  const comodidades = resolvedParams.comodidades as string | undefined;

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
    comodidades,
  };

  const [propertiesResponse, neighborhoods] = await Promise.all([
    getProperties(filters),
    getNeighborhoods(),
  ]);

  const { data: properties, total, total_pages } = propertiesResponse;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex gap-8">

        {/* Sidebar */}
        <SidebarFilters transactionType="rent" neighborhoods={neighborhoods} />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header + Sort */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-black">
                Imóveis para alugar
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {total} resultados encontrados {city ? `em ${city}` : 'em São José dos Campos e região'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm flex-shrink-0">
              <span className="text-gray-500 hidden sm:inline">Ordenar por:</span>
              <select
                defaultValue={sort_by}
                className="text-sm text-black font-medium bg-transparent outline-none cursor-pointer border border-gray-200 rounded-lg px-3 py-2"
              >
                <option value="newest">Mais recentes</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="area_desc">Maior área</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500">Nenhum imóvel encontrado com os filtros atuais.</p>
              <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros para ver mais resultados.</p>
            </div>
          )}

          {/* Paginação */}
          <Pagination
            currentPage={page}
            totalPages={total_pages}
            basePath="/alugar"
          />
        </div>
      </div>
    </div>
  );
}
