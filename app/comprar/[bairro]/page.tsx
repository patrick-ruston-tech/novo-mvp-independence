import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getProperties, getNeighborhoodBySlug, getNeighborhoods } from '@/lib/queries';
import PropertyCard from '@/components/PropertyCard';
import SidebarFilters from '@/components/SidebarFilters';
import { PropertyFilters as PropertyFiltersType } from '@/types/property';
import Pagination from '@/components/Pagination';
import SortSelect from '@/components/SortSelect';

export async function generateStaticParams() {
  const { createServerClient } = await import('@/lib/supabase/server');
  const supabase = createServerClient();
  const { data } = await supabase
    .from('neighborhoods')
    .select('slug')
    .gt('property_count', 2);

  return (data ?? []).map((n) => ({ bairro: n.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ bairro: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const neighborhood = await getNeighborhoodBySlug(resolvedParams.bairro);
  const name = neighborhood?.name || resolvedParams.bairro.replace(/-/g, ' ');

  return {
    title: `Imóveis à Venda em ${name}, São José dos Campos`,
    description: `Encontre casas, apartamentos e terrenos à venda em ${name}. Fotos, preços e condições de financiamento. Atendimento personalizado Independence Imóveis.`,
    alternates: { canonical: `https://independenceimoveis.com.br/comprar/${resolvedParams.bairro}` },
    openGraph: {
      title: `Imóveis à Venda em ${name} | Independence`,
      description: `Encontre imóveis à venda em ${name}, São José dos Campos.`,
      type: 'website',
    },
  };
}

export const revalidate = 300;

async function PropertyGrid({
  filters,
  bairroName,
  bairroSlug,
}: {
  filters: PropertyFiltersType;
  bairroName: string;
  bairroSlug: string;
}) {
  const { data: properties, total, total_pages } = await getProperties(filters);

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-sm text-gray-400 mb-2">
            <Link href="/comprar" className="hover:text-black transition-colors">Comprar</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-black">{bairroName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-black">
            Imóveis à venda em {bairroName}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {total} imóveis encontrados
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm flex-shrink-0">
          <span className="text-gray-500 hidden sm:inline">Ordenar por:</span>
          <SortSelect defaultValue={filters.sort_by} />
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
              <PropertyCard property={property} priceContext="sale" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500">Nenhum imóvel encontrado neste bairro com os filtros atuais.</p>
          <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros para ver mais resultados.</p>
        </div>
      )}

      <Pagination
        currentPage={filters.page!}
        totalPages={total_pages}
        basePath={`/comprar/${bairroSlug}`}
      />
    </>
  );
}

async function SidebarWithData({ currentSlug }: { currentSlug: string }) {
  const neighborhoods = await getNeighborhoods();
  return (
    <SidebarFilters
      transactionType="sale"
      neighborhoods={neighborhoods}
      currentNeighborhoodSlug={currentSlug}
    />
  );
}

function GridSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded-lg animate-pulse mt-2" />
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

  const VALID_SORT = ['newest', 'price_asc', 'price_desc', 'area_desc'];
  function safePositiveInt(value: any, max = 100_000_000): number | undefined {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > max) return undefined;
    return num;
  }

  const page = safePositiveInt(resolvedSearch.pagina, 10000) || 1;
  const sort_by = VALID_SORT.includes(resolvedSearch.ordem as string)
    ? (resolvedSearch.ordem as PropertyFiltersType['sort_by'])
    : 'newest';
  const property_type = resolvedSearch.tipo as PropertyFiltersType['property_type'];
  const bedrooms_min = safePositiveInt(resolvedSearch.quartos, 20);
  const suites_min = safePositiveInt(resolvedSearch.suites, 20);
  const price_min = safePositiveInt(resolvedSearch.preco_min);
  const price_max = safePositiveInt(resolvedSearch.preco_max);
  const garages_min = safePositiveInt(resolvedSearch.garagens, 20);
  const comodidades = resolvedSearch.comodidades as string | undefined;

  const filters: PropertyFiltersType = {
    transaction_type: 'sale',
    neighborhood: bairroInfo ? bairroInfo.name : bairroSlug,
    page,
    per_page: 12,
    sort_by,
    property_type,
    bedrooms_min,
    suites_min,
    price_min,
    price_max,
    garages_min,
    comodidades,
  };

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://independenceimoveis.com.br' },
              { '@type': 'ListItem', position: 2, name: 'Comprar', item: 'https://independenceimoveis.com.br/comprar' },
              { '@type': 'ListItem', position: 3, name: bairroInfo.name },
            ],
          }),
        }}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <Suspense>
            <SidebarWithData currentSlug={bairroSlug} />
          </Suspense>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<GridSkeleton />}>
              <PropertyGrid filters={filters} bairroName={bairroInfo.name} bairroSlug={bairroSlug} />
            </Suspense>
            {bairroInfo.description && (
              <p className="text-base text-gray-500 mt-8 max-w-3xl">
                {bairroInfo.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
