import React from 'react';
import { Resource } from '../types';
import { ResourceCard } from './ResourceCard';

export interface CategorySectionProps {
  resources: Resource[];
  onResourceClick: (resourceId: string) => Promise<void>;
}

export function CategorySection({ resources, onResourceClick }: CategorySectionProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No resources found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onClick={() => onResourceClick(resource.id)}
        />
      ))}
    </div>
  );
}
