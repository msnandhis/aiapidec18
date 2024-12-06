import { useState, useEffect } from 'react';
import { Resource } from './types';
import { fetchResources } from './services/api';
import { CategoryFilter } from './components/CategoryFilter';
import { CategoryHeader } from './components/CategoryHeader';
import { CategorySection } from './components/CategorySection';
import { SearchBar } from './components/SearchBar';
import './index.css';

function App() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadResources();
  }, [activeCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Loading resources for category:', activeCategory);
      
      const data = await fetchResources(activeCategory === 'all' ? undefined : activeCategory);
      console.log('Received resources:', data);
      
      setResources(data);
    } catch (err) {
      console.error('Error in loadResources:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(resources.map(r => r.category)));
  const resourcesByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredResources.filter(r => r.category === category);
    return acc;
  }, {} as Record<string, Resource[]>);

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'frontend':
        return 'Front-end frameworks';
      case 'maps':
        return 'JS Map Libraries';
      case 'useful':
        return 'Useful';
      case 'wordpress':
        return 'WordPress top plugins';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Resources</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="flex gap-4">
              <button 
                onClick={loadResources}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white rounded-lg p-6 shadow text-center">
              <p className="text-gray-600">
                {searchQuery
                  ? 'No resources found matching your search criteria.'
                  : 'No resources available for this category.'}
              </p>
              {(searchQuery || activeCategory !== 'all') && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            Object.entries(resourcesByCategory).map(([category, categoryResources]) => (
              categoryResources.length > 0 && (
                <div key={category}>
                  <CategoryHeader 
                    title={getCategoryLabel(category)}
                    count={categoryResources.length}
                  />
                  <CategorySection 
                    title={getCategoryLabel(category)}
                    resources={categoryResources}
                  />
                </div>
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
