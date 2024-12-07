import React from 'react';
import { Resource } from '../types';

export interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 
                 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-100">{resource.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{resource.category}</p>
        </div>
        {resource.logo && (
          <img
            src={resource.logo}
            alt={`${resource.name} logo`}
            className="w-12 h-12 object-contain rounded-lg"
          />
        )}
      </div>
      {resource.description && (
        <p className="mt-4 text-gray-300 text-sm line-clamp-3">{resource.description}</p>
      )}
      {resource.url && (
        <div className="mt-4">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Website →
          </a>
        </div>
      )}
    </div>
  );
}
