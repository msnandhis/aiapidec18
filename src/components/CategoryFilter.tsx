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
    { id: 'wordpress', label: 'Wordpress top plugins' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'border hover:bg-gray-50'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}