'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 1 || loading
            ? 'bg-white/10 text-white/50 cursor-not-allowed'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        ← Previous
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number' || loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeof page !== 'number'
              ? 'bg-transparent text-white/50 cursor-default'
              : page === currentPage
              ? 'bg-[#EAFE07] text-[#07173F]'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentPage === totalPages || loading
            ? 'bg-white/10 text-white/50 cursor-not-allowed'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        Next →
      </button>
    </div>
  );
}
