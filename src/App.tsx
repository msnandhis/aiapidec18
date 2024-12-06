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
  const [systemStatus, setSystemStatus] = useState({ ok: false, message: 'Checking system status...' });

  useEffect(() => {
    loadResources();
  }, [activeCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading resources for category:', activeCategory);
      
      const data = await fetchResources(activeCategory === 'all' ? undefined : activeCategory);
      console.log('Received resources:', data);
      
      setResources(data);
      setSystemStatus({ ok: true, message: `System running OK - ${data.length} resources loaded` });
    } catch (err) {
      console.error('Error in loadResources:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resources');
      setSystemStatus({ ok: false, message: 'System error - Failed to load resources' });
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
          
          {/* System Status Indicator */}
          <div className={`fixed bottom-0 left-0 right-0 p-2 text-center text-sm ${
            systemStatus.ok ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <span className="inline-block mr-2">
              {systemStatus.ok ? '✓' : '⚠️'}
            </span>
            {systemStatus.message}
            {!systemStatus.ok && (
              <button
                onClick={loadResources}
                className="ml-4 px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
