'use client';

import { useRouter } from 'next/navigation';

export default function BlogCategoryFilter({ categories, activeCategory }: { categories: string[]; activeCategory: string }) {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    if (category === 'Todos') {
      router.push('/blog');
    } else {
      router.push(`/blog?categoria=${category}`);
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-brand-red text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Ordenar por:</span>
        <select className="text-sm text-black font-medium bg-transparent outline-none cursor-pointer">
          <option>Mais recentes</option>
          <option>Mais lidos</option>
        </select>
      </div>
    </div>
  );
}
