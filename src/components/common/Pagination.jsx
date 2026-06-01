import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination component with page numbers, ellipsis, and prev/next buttons.
 *
 * @param {number} currentPage - Active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Called with the new page number
 */

/**
 * Build an array of page numbers/ellipsis markers to display.
 * Shows at most 5 page buttons around the current page.
 */
function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  // Always show first page
  pages.push(1);

  if (current > 3) {
    pages.push('...');
  }

  // Pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  // Always show last page
  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl text-gray-600 dark:text-gray-400
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors duration-150 cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-10 h-10 rounded-xl text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                page === currentPage
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl text-gray-600 dark:text-gray-400
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors duration-150 cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
