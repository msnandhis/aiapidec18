import React, { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Resource } from '../../../types';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCardClick = () => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4 
                 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-102 hover:border-blue-500/50
                 transform transition-all duration-300 ease-in-out cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center 
                        bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg 
                        group-hover:from-blue-900 group-hover:to-gray-800 
                        transition-all duration-300">
            <img
              src={resource.logo}
              alt={`${resource.name} logo`}
              className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h3 className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors duration-300">
            {resource.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/50
                         rounded-full transition-all duration-300"
            >
              <Info size={18} />
            </button>
            {/* Tooltip */}
            {showTooltip && resource.description && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
                <div className="bg-gray-800 text-gray-200 text-sm rounded-lg p-3 shadow-xl border border-gray-700">
                  {resource.description}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                                rotate-45 w-2 h-2 bg-gray-800 border-r border-b border-gray-700"></div>
                </div>
              </div>
            )}
          </div>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/50
                         rounded-full transition-all duration-300"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Progress indicator if available */}
      {resource.totalPages && resource.currentPage && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
              style={{ width: `${(resource.currentPage / resource.totalPages) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Page {resource.currentPage} of {resource.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
