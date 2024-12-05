import React from 'react';
import * as Icons from 'lucide-react';
import { Resource } from '../types';

interface CategoryHeaderProps {
  title: string;
  count: number;
  icon?: string;
}

export function CategoryHeader({ title, count, icon }: CategoryHeaderProps) {
  const Icon = icon ? (Icons as any)[icon.charAt(0).toUpperCase() + icon.slice(1)] : null;

  return (
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-600 text-white">
          <Icon size={24} />
        </div>
      )}
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-gray-500">({count})</span>
      </div>
    </div>
  );
}