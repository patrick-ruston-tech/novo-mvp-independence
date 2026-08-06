import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getProperties, getNeighborhoods, getCondominiums, getZones, selectionToPropertyFilters } from '@/lib/queries';
import { parseListingSelection, ListingSelection, RawSearchParams } from '@/lib/listing-params';
import PropertyCard from '@/components/PropertyCard';
import SidebarFilters from '@/components/SidebarFilters';
import ActiveFilterChips from '@/components/ActiveFilterChips';
import Pagination from '@/components/Pagination';
import SortSelect from '@/components/SortSelect';

export const metadata: Metadata = {
  title: 'Imóveis para Alugar em São José dos Campos',
  description: 'Encontre casas e apartamentos para alugar em São José dos Campos e região. Locação residencial e comercial com atendimento personalizado.',
  alternates: { canonical: 'https://independenceimoveis.com.br/alugar' },
};

export const revalidate = 60;

async function PropertyGrid({ sel, page }: { sel: ListingSelection; page: number }) {
  const filters = await selectionToPropertyFilters(sel, 'rent', page);
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
            {total} resultados encontrados {sel.cidade ? `em ${sel.cidade}` : 'em São José dos Campos e região'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm flex-shrink-0">
          <span className="text-gray-500 hidden sm:inline">Ordenar por:</span>
          <SortSelect defaultValue={sel.ordem} />
        </div>
      </div>

      <ActiveFilterChips sel={sel} base="/alugar" />

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
          <p className="text-sm text-gray-400 mt-1">Remova um dos filtros acima para ver mais resultados.</p>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={total_pages}
        basePath="/alugar"
      />
    </>
  );
}

async function SidebarWithData() {
  const [neighborhoods, condominiums, zones] = await Promise.all([
    getNeighborhoods(),
    getCondominiums(),
    getZones(),
  ]);
  return <SidebarFilters transactionType="rent" neighborhoods={neighborhoods} condominiums={condominiums} zones={zones} />;
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

function safePage(value: string | string[] | undefined): number {
  const num = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(num) || num < 1 || num > 10000) return 1;
  return Math.trunc(num);
}

export default async function AlugarPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedParams = await searchParams;
  const sel = parseListingSelection(resolvedParams);
  const page = safePage(resolvedParams.pagina);

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
            <PropertyGrid sel={sel} page={page} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
