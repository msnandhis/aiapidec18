import React from 'react';
import * as Icons from 'lucide-react';
import { Resource } from '../../../types';

interface CategoryHeaderProps {
  title: string;
  count: number;
  icon?: string;
}

export function CategoryHeader({ title, count, icon }: CategoryHeaderProps) {
  const Icon = icon ? (Icons as any)[icon.charAt(0).toUpperCase() + icon.slice(1)] : null;

  const getCategoryGradient = (title: string) => {
    switch (title.toLowerCase()) {
      case 'front-end frameworks':
        return 'from-blue-500 to-indigo-500';
      case 'js map libraries':
        return 'from-green-500 to-emerald-500';
      case 'useful':
        return 'from-purple-500 to-pink-500';
      case 'wordpress top plugins':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="relative group animate-fadeIn">
      <div className="flex items-center gap-4 p-4 mb-6 rounded-xl bg-gray-800/50 backdrop-blur-sm
                    shadow-lg hover:shadow-xl transition-all duration-300
                    border border-gray-700 hover:border-gray-600">
        {/* Icon Container */}
        {Icon && (
          <div className={`
            w-12 h-12 flex items-center justify-center rounded-lg
            bg-gradient-to-br ${getCategoryGradient(title)}
            text-white transform group-hover:scale-110 transition-transform duration-300
            shadow-lg
          `}>
            <Icon size={24} className="animate-fadeIn" />
          </div>
        )}

        {/* Title and Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 flex-grow">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 
                       bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              bg-gradient-to-r ${getCategoryGradient(title)} text-white
              shadow-sm group-hover:shadow transition-shadow duration-300
            `}>
              {count} {count === 1 ? 'resource' : 'resources'}
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}
