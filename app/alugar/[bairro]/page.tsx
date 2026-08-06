import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getProperties, getNeighborhoodBySlug, getNeighborhoods, getCondominiums, getZones, selectionToPropertyFilters } from '@/lib/queries';
import { parseListingSelection, ListingSelection, RawSearchParams } from '@/lib/listing-params';
import PropertyCard from '@/components/PropertyCard';
import SidebarFilters from '@/components/SidebarFilters';
import ActiveFilterChips from '@/components/ActiveFilterChips';
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
  // Cidade dinâmica baseada no bairro (antes era hardcoded SJC).
  const city = neighborhood?.city || 'São José dos Campos';

  return {
    title: `Imóveis para Alugar em ${name}, ${city}`,
    description: `Encontre casas e apartamentos para alugar em ${name}. Locação residencial e comercial com atendimento personalizado Independence Imóveis.`,
    alternates: { canonical: `https://independenceimoveis.com.br/alugar/${resolvedParams.bairro}` },
    openGraph: {
      title: `Imóveis para Alugar em ${name} | Independence`,
      description: `Encontre imóveis para alugar em ${name}, ${city}.`,
      type: 'website',
    },
  };
}

export const revalidate = 300;

async function PropertyGrid({
  sel,
  page,
  bairroName,
  bairroSlug,
}: {
  sel: ListingSelection;
  page: number;
  bairroName: string;
  bairroSlug: string;
}) {
  const filters = await selectionToPropertyFilters(sel, 'rent', page);
  const { data: properties, total, total_pages } = await getProperties(filters);

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-sm text-gray-400 mb-2">
            <Link href="/alugar" className="hover:text-black transition-colors">Alugar</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-black">{bairroName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-black">
            Imóveis para alugar em {bairroName}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {total} imóveis encontrados
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
          <p className="text-gray-500">Nenhum imóvel encontrado neste bairro com os filtros atuais.</p>
          <p className="text-sm text-gray-400 mt-1">Remova um dos filtros acima para ver mais resultados.</p>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={total_pages}
        basePath={`/alugar/${bairroSlug}`}
      />
    </>
  );
}

async function SidebarWithData({ currentSlug }: { currentSlug: string }) {
  const [neighborhoods, condominiums, zones] = await Promise.all([
    getNeighborhoods(),
    getCondominiums(),
    getZones(),
  ]);
  return (
    <SidebarFilters
      transactionType="rent"
      neighborhoods={neighborhoods}
      condominiums={condominiums}
      zones={zones}
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

function safePage(value: string | string[] | undefined): number {
  const num = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(num) || num < 1 || num > 10000) return 1;
  return Math.trunc(num);
}

export default async function AlugarBairroPage({
  params,
  searchParams,
}: {
  params: Promise<{ bairro: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const bairroSlug = resolvedParams.bairro;
  const bairroInfo = await getNeighborhoodBySlug(bairroSlug);

  // O bairro da rota entra na seleção como qualquer outro — os chips e a
  // sidebar tratam todos por igual (remover o último bairro volta pra /alugar).
  const sel = parseListingSelection(resolvedSearch, bairroSlug);
  const page = safePage(resolvedSearch.pagina);

  if (!bairroInfo) {
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Bairro não encontrado.</h2>
        <Link href="/alugar" className="text-brand-red font-semibold hover:underline">
          Ver todos os imóveis para alugar
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
              { '@type': 'ListItem', position: 2, name: 'Alugar', item: 'https://independenceimoveis.com.br/alugar' },
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
              <PropertyGrid sel={sel} page={page} bairroName={bairroInfo.name} bairroSlug={bairroSlug} />
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
