import React from 'react';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'frontend', label: 'Front-end frameworks' },
    { id: 'maps', label: 'JS Map Libraries' },
    { id: 'useful', label: 'Useful' },
    { id: 'wordpress', label: 'WordPress top plugins' }
  ];

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              relative px-4 py-2 rounded-lg font-medium transition-all duration-300
              transform hover:scale-105 hover:shadow-md whitespace-nowrap
              ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }
              before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r 
              before:from-blue-400 before:to-blue-600 before:opacity-0 
              before:transition-opacity before:duration-300
              hover:before:opacity-10
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
            `}
          >
            <span className="relative">
              {category.label}
            </span>
            {activeCategory === category.id && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 
                             bg-white rounded-full shadow-glow animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
