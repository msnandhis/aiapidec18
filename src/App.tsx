import React, { useState, useMemo } from 'react';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { CategorySection } from './components/CategorySection';
import {
  frontendResources,
  mapResources,
  usefulResources,
  wordpressResources,
  resources
} from './data/resources';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredResources = useMemo(() => {
    const filtered = resources.filter((resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeCategory === 'all') {
      return {
        frontend: filtered.filter((r) => r.category === 'frontend'),
        maps: filtered.filter((r) => r.category === 'maps'),
        useful: filtered.filter((r) => r.category === 'useful'),
        wordpress: filtered.filter((r) => r.category === 'wordpress')
      };
    }

    return {
      [activeCategory]: filtered.filter((r) => r.category === activeCategory)
    };
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <div className="grid grid-cols-1 gap-8">
          {(activeCategory === 'all' || activeCategory === 'frontend') && 
            filteredResources.frontend?.length > 0 && (
              <CategorySection
                title="Front-end frameworks"
                resources={filteredResources.frontend}
              />
            )}
          
          {(activeCategory === 'all' || activeCategory === 'maps') && 
            filteredResources.maps?.length > 0 && (
              <CategorySection
                title="JS Map Libraries"
                resources={filteredResources.maps}
              />
            )}
          
          {(activeCategory === 'all' || activeCategory === 'useful') && 
            filteredResources.useful?.length > 0 && (
              <CategorySection
                title="Useful"
                resources={filteredResources.useful}
              />
            )}
          
          {(activeCategory === 'all' || activeCategory === 'wordpress') && 
            filteredResources.wordpress?.length > 0 && (
              <CategorySection
                title="Wordpress top plugins"
                resources={filteredResources.wordpress}
              />
            )}
        </div>
      </div>
    </div>
  );
}

export default App;