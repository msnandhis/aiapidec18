import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../shared/layouts/MainLayout';
import { CategorySection } from '../../components/CategorySection';
import { SearchBar } from '../../components/SearchBar';
import { CategoryFilter } from '../../components/CategoryFilter';
import { Pagination } from '../../components/Pagination';
import { Resource } from '../../types';
import { fetchResources, trackView } from '../../services/api';

export function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setResources(response.data);
      setTotalPages(response.pagination.total_pages);

      // Track category view if selected
      if (selectedCategory) {
        await trackView('category', selectedCategory);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load resources');
      console.error('Error loading resources:', error);
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
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter resources based on search query
  const filteredResources = searchQuery
    ? resources.filter(resource =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resources;

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 
                       bg-clip-text text-transparent mb-6">
            Discover API Kit Resources
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Directory of AI model APIs, curated by developers for developers. 
            Discover the right tools for your next project.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SearchBar onSearch={handleSearch} />
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <CategorySection
                resources={filteredResources}
                onResourceClick={async (resourceId) => {
                  await trackView('resource', resourceId);
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
