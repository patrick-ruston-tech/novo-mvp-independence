'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SortSelectProps {
  defaultValue?: string;
}

export default function SortSelect({ defaultValue = 'newest' }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'newest') {
      params.delete('ordem');
    } else {
      params.set('ordem', value);
    }
    params.delete('pagina');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm text-black font-medium bg-transparent outline-none cursor-pointer border border-gray-200 rounded-lg px-3 py-2"
    >
      <option value="newest">Mais recentes</option>
      <option value="price_asc">Menor preço</option>
      <option value="price_desc">Maior preço</option>
      <option value="area_desc">Maior área</option>
    </select>
  );
}
