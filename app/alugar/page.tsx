import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getProperties, getNeighborhoods, getZones } from '@/lib/queries';
import PropertyCard from '@/components/PropertyCard';
import SidebarFilters from '@/components/SidebarFilters';
import Pagination from '@/components/Pagination';
import { PropertyFilters as PropertyFiltersType } from '@/types/property';

export const metadata: Metadata = {
  title: 'Imóveis para Alugar em São José dos Campos',
  description: 'Encontre casas e apartamentos para alugar em São José dos Campos e região. Locação residencial e comercial com atendimento personalizado.',
  alternates: { canonical: 'https://independenceimoveis.com.br/alugar' },
};

export const revalidate = 60;

async function PropertyGrid({
  filters,
  city,
}: {
  filters: PropertyFiltersType;
  city?: string;
}) {
  const { data: properties, total, total_pages } = await getProperties(filters);

  // Se buscou por código e encontrou exatamente 1 resultado, redireciona
  if (filters.codigo && properties.length === 1) {
    redirect(`/imoveis/${properties[0].slug}`);
  }

  return (
    <>
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
            defaultValue={filters.sort_by}
            className="text-sm text-black font-medium bg-transparent outline-none cursor-pointer border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="newest">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="area_desc">Maior área</option>
          </select>
        </div>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map((property, idx) => (
            <div
              key={property.id}
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${(idx % 12) * 50}ms`, animationDuration: '500ms' }}
            >
              <PropertyCard property={property} priceContext="rent" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500">Nenhum imóvel encontrado com os filtros atuais.</p>
          <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros para ver mais resultados.</p>
        </div>
      )}

      <Pagination
        currentPage={filters.page!}
        totalPages={total_pages}
        basePath="/alugar"
      />
    </>
  );
}

async function SidebarWithData() {
  const [neighborhoods, zones] = await Promise.all([getNeighborhoods(), getZones()]);
  return <SidebarFilters transactionType="rent" neighborhoods={neighborhoods} zones={zones} />;
}

function GridSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl aspect-[4/3] animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default async function AlugarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const VALID_SORT = ['newest', 'price_asc', 'price_desc', 'area_desc'];
  function safePositiveInt(value: any, max = 100_000_000): number | undefined {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > max) return undefined;
    return num;
  }

  const page = safePositiveInt(resolvedParams.pagina, 10000) || 1;
  const sort_by = VALID_SORT.includes(resolvedParams.ordem as string)
    ? (resolvedParams.ordem as PropertyFiltersType['sort_by'])
    : 'newest';
  const property_type = resolvedParams.tipo as PropertyFiltersType['property_type'];
  const bedrooms_min = safePositiveInt(resolvedParams.quartos, 20);
  const price_min = safePositiveInt(resolvedParams.preco_min);
  const price_max = safePositiveInt(resolvedParams.preco_max);
  const garages_min = safePositiveInt(resolvedParams.garagens, 20);
  const city = resolvedParams.cidade as string | undefined;
  const comodidades = resolvedParams.comodidades as string | undefined;
  const zona = resolvedParams.zona as string | undefined;
  const codigo = resolvedParams.codigo as string | undefined;

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
    zona,
    codigo,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <Suspense>
          <SidebarWithData />
        </Suspense>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<GridSkeleton />}>
            <PropertyGrid filters={filters} city={city} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
