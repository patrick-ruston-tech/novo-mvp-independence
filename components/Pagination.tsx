'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) {
            params.delete('pagina');
        } else {
            params.set('pagina', String(page));
        }
        const query = params.toString();
        router.push(`${basePath}${query ? `?${query}` : ''}`);
    }

    // Gera array de páginas visíveis (max 5 ao redor da atual)
    function getVisiblePages(): (number | '...')[] {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | '...')[] = [1];

        if (currentPage > 3) {
            pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        pages.push(totalPages);
        return pages;
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            {/* Anterior */}
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Números */}
            {getVisiblePages().map((page, idx) =>
                page === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                ? 'bg-black text-white'
                                : 'border border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Próximo */}
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}