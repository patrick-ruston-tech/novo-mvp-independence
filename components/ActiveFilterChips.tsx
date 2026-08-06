import Link from 'next/link';
import { X } from 'lucide-react';
import {
  ListingSelection,
  buildListingHref,
  priceChipLabel,
} from '@/lib/listing-params';
import { findPropertyTypeBySlug } from '@/lib/property-vocabulary';
import { getNeighborhoods, getCondominiums } from '@/lib/queries';

/**
 * Chips removíveis dos filtros APLICADOS (da URL), renderizados acima da
 * grade de resultados. Cada chip é um <Link> pra mesma listagem sem aquele
 * valor — zero JS no client, e o corretor confere o link antes de mandar.
 */

interface Chip {
  key: string;
  label: string;
  href: string;
}

export default async function ActiveFilterChips({
  sel,
  base,
}: {
  sel: ListingSelection;
  base: '/comprar' | '/alugar';
}) {
  const chips: Chip[] = [];
  const without = (patch: Partial<ListingSelection>) =>
    buildListingHref(base, { ...sel, ...patch });

  if (sel.codigo.trim()) {
    // Modo código: os demais filtros são ignorados pela query — mostrar só ele.
    chips.push({
      key: 'codigo',
      label: `Código: ${sel.codigo.trim().toUpperCase()}`,
      href: without({ codigo: '' }),
    });
  } else {
    if (sel.cidade) {
      chips.push({ key: 'cidade', label: sel.cidade, href: without({ cidade: '' }) });
    }
    if (sel.bairros.length > 0) {
      const all = await getNeighborhoods();
      for (const slug of sel.bairros) {
        chips.push({
          key: `bairro-${slug}`,
          label: all.find((n) => n.slug === slug)?.name ?? slug,
          href: without({ bairros: sel.bairros.filter((s) => s !== slug) }),
        });
      }
    }
    if (sel.zona) {
      chips.push({ key: 'zona', label: sel.zona, href: without({ zona: '' }) });
    }
    if (sel.condominio) {
      const condos = await getCondominiums();
      chips.push({
        key: 'condominio',
        label: condos.find((c) => c.id === sel.condominio)?.name ?? 'Condomínio',
        href: without({ condominio: '' }),
      });
    }
    for (const slug of sel.tipos) {
      chips.push({
        key: `tipo-${slug}`,
        label: findPropertyTypeBySlug(slug)?.labelPt ?? slug,
        href: without({ tipos: sel.tipos.filter((s) => s !== slug) }),
      });
    }
    if (sel.precoMin || sel.precoMax) {
      chips.push({
        key: 'preco',
        label: priceChipLabel(sel.precoMin, sel.precoMax),
        href: without({ precoMin: null, precoMax: null }),
      });
    }
    if (sel.quartos) {
      chips.push({ key: 'quartos', label: `${sel.quartos}+ quartos`, href: without({ quartos: null }) });
    }
    if (sel.suites) {
      chips.push({ key: 'suites', label: `${sel.suites}+ suítes`, href: without({ suites: null }) });
    }
    if (sel.garagens) {
      chips.push({ key: 'garagens', label: `${sel.garagens}+ vagas`, href: without({ garagens: null }) });
    }
    for (const amenity of sel.comodidades) {
      chips.push({
        key: `com-${amenity}`,
        label: amenity,
        href: without({ comodidades: sel.comodidades.filter((a) => a !== amenity) }),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((c) => (
        <Link
          key={c.key}
          href={c.href}
          aria-label={`Remover filtro ${c.label}`}
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full transition-colors"
        >
          {c.label}
          <X className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        </Link>
      ))}
      {chips.length >= 2 && (
        <Link href={base} className="text-xs text-brand-red font-medium hover:underline ml-1">
          Limpar tudo
        </Link>
      )}
    </div>
  );
}
