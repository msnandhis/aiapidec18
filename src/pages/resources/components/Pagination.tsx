import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const renderPageButton = (page: number) => {
    const isActive = page === currentPage;
    return (
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`
          px-3 py-1 rounded-md text-sm font-medium transition-all duration-300
          ${isActive 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20' 
            : 'text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        `}
      >
        {page}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          p-1 rounded-md transition-all duration-300
          ${currentPage === 1 
            ? 'text-gray-600 cursor-not-allowed' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        `}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex gap-1">
        {totalPages <= 7 ? (
          // Show all pages if total is 7 or less
          pages.map(renderPageButton)
        ) : (
          // Show pagination with ellipsis for more than 7 pages
          <>
            {/* First page */}
            {renderPageButton(1)}

            {/* Ellipsis or number */}
            {currentPage > 3 && (
              <span className="px-2 text-gray-500 self-end">...</span>
            )}

            {/* Current page and surrounding */}
            {pages
              .filter(page => 
                page !== 1 && 
                page !== totalPages && 
                Math.abs(currentPage - page) <= 1
              )
              .map(renderPageButton)}

            {/* Ellipsis or number */}
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-500 self-end">...</span>
            )}

            {/* Last page */}
            {renderPageButton(totalPages)}
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          p-1 rounded-md transition-all duration-300
          ${currentPage === totalPages 
            ? 'text-gray-600 cursor-not-allowed' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        `}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
