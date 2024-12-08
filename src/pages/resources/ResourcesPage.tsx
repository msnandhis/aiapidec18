import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../shared/layouts/MainLayout';
import { CategorySection } from '../../components/CategorySection';
import { SearchBar } from '../../components/SearchBar';
import { CategoryFilter } from '../../components/CategoryFilter';
import { Pagination } from '../../components/Pagination';
import { fetchResources, trackView } from '../../services/api';
import type { Resource } from '../../types';

export function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Get category from URL params
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    loadResources();
  }, [selectedCategory, currentPage]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await fetchResources(selectedCategory || undefined, currentPage);
      setResources(response.data || []);
      setTotalPages(response.pagination?.total_pages || 1);

      // Track category view if selected
      if (selectedCategory) {
        trackView('category', selectedCategory).catch(console.error);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: string | null) => {
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter resources based on search query
  const filteredResources = searchQuery
    ? resources.filter(resource =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    : resources;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-100 mb-4">
              AI API Kit Resources
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Directory of AI model APIs, curated by developers for developers. 
              Discover the right tools for your next project.
            </p>
          </div>

          <SearchBar onSearch={handleSearch} />
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <CategorySection
                resources={filteredResources}
                onResourceClick={async (resourceId) => {
                  try {
                    await trackView('resource', resourceId);
                  } catch (error) {
                    console.error('Failed to track view:', error);
                  }
                }}
              />

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
