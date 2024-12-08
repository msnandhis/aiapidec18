import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import type { Category } from '../types';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                   ${!selectedCategory
                     ? 'bg-blue-600 text-white'
                     : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                   }`}
      >
        All Categories
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                     ${selectedCategory === category.id
                       ? 'bg-blue-600 text-white'
                       : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                     }`}
        >
          {category.label}
          {category.total_resources > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-700 rounded-full">
              {category.total_resources}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
