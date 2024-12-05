import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={resource.logo}
            alt={`${resource.name} logo`}
            className="w-10 h-10 object-contain"
          />
          <h3 className="font-medium text-gray-900">{resource.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            title="View details"
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Info size={18} />
          </button>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}