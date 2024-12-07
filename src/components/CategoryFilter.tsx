import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import { Category } from '../types';

export interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-4">
        Failed to load categories. Please try again later.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                   ${!selectedCategory
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                     group relative
                     ${selectedCategory === category.id
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {category.label}
          {category.resource_count > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full
                          ${selectedCategory === category.id
                            ? 'bg-white text-blue-600'
                            : 'bg-blue-600 text-white'}`}>
              {category.resource_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
