import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        className={`
          relative overflow-hidden rounded-xl
          transition-all duration-300 ease-in-out
          ${isFocused ? 'shadow-lg shadow-blue-500/20' : 'shadow-md'}
        `}
      >
        {/* Gradient border */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500
          opacity-${isFocused ? '100' : '0'} transition-opacity duration-300
        `} />

        {/* Glass background */}
        <div className="relative bg-gray-800/90 backdrop-blur-sm m-[1px] rounded-[11px]">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search resources..."
            className={`
              w-full px-4 py-3 pl-12 pr-12
              bg-transparent
              text-gray-200 placeholder-gray-500
              focus:outline-none
              transition-all duration-300
            `}
          />

          {/* Search icon with animation */}
          <Search 
            className={`
              absolute left-3 top-1/2 -translate-y-1/2
              h-5 w-5 
              transition-all duration-300
              ${isFocused ? 'text-blue-400' : 'text-gray-500'}
              ${value ? 'opacity-0' : 'opacity-100'}
            `}
          />

          {/* Clear button */}
          {value && (
            <button
              onClick={() => onChange('')}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2
                p-1 rounded-full
                text-gray-500 hover:text-gray-300
                hover:bg-gray-700
                transition-all duration-200
                focus:outline-none
              `}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search animation indicator */}
      <div className={`
        absolute bottom-0 left-1/2 -translate-x-1/2
        h-0.5 bg-gradient-to-r from-blue-500 to-purple-500
        transition-all duration-300 ease-out
        ${isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'}
      `} />
    </div>
  );
}
