import React from 'react';
import { Resource } from '../../../types';
import { ResourceCard } from './ResourceCard';
import { Pagination } from './Pagination';

interface CategorySectionProps {
  title?: string;
  resources: Resource[];
}

export function CategorySection({ title, resources }: CategorySectionProps) {
  const hasMultiplePages = resources[0]?.totalPages && resources[0].totalPages > 1;

  return (
    <div className="mb-8 animate-fadeIn">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
          {hasMultiplePages && (
            <Pagination
              currentPage={resources[0].currentPage || 1}
              totalPages={resources[0].totalPages || 1}
              onPageChange={() => {}}
            />
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 
                    transform transition-all duration-300">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
