import React from 'react';
import { Resource } from '../types';

interface CategorySectionProps {
  resources: Resource[];
  onResourceClick?: (resourceId: string) => void;
}

export function CategorySection({ resources = [], onResourceClick }: CategorySectionProps) {
  // Ensure resources is always an array
  const resourceList = Array.isArray(resources) ? resources : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resourceList.map((resource) => (
        <div
          key={resource.id}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 
                   transition-colors duration-200 cursor-pointer"
          onClick={() => onResourceClick?.(resource.id)}
        >
          <div className="flex items-start gap-4">
            {resource.logo && (
              <img
                src={resource.logo}
                alt={resource.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-700"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-100 truncate">
                {resource.name}
              </h3>
              {resource.description && (
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                  {resource.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {resource.category_name && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium 
                                 bg-blue-500/10 text-blue-400 rounded-full">
                    {resource.category_name}
                  </span>
                )}
                {resource.is_featured && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium 
                                 bg-yellow-500/10 text-yellow-400 rounded-full">
                    Featured
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium 
                               bg-gray-700 text-gray-400 rounded-full">
                  {resource.views} views
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
