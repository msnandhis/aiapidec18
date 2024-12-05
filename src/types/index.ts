export interface Resource {
  id: string;
  name: string;
  category: Category;
  logo: string;
  url?: string;
  description?: string;
  totalPages?: number;
  currentPage?: number;
}

export type Category = 'frontend' | 'maps' | 'useful' | 'wordpress';

export interface CategoryInfo {
  id: Category;
  label: string;
  totalItems: number;
}