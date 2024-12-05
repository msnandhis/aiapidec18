import React from 'react';
import { Resource } from '../types';
import { ResourceCard } from './ResourceCard';
import { CategoryHeader } from './CategoryHeader';

interface ResourceListProps {
  title: string;
  resources: Resource[];
  icon?: string;
}

export function ResourceList({ title, resources, icon }: ResourceListProps) {
  return (
    <div className="mb-8">
      <CategoryHeader title={title} count={resources.length} icon={icon} />
      <div className="bg-white rounded-lg border divide-y">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}