import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Star } from 'lucide-react';
import { Resource } from '../../types';

interface ResourceFormData {
  name: string;
  category: string;
  logo: string;
  url?: string;
  description?: string;
  isFeatured: boolean;
}

function Resources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>({
    name: '',
    category: '',
    logo: '',
    url: '',
    description: '',
    isFeatured: false
  });

  // Mock data - replace with API calls
  const resources: (Resource & { isFeatured: boolean })[] = [
    {
      id: '1',
      name: 'React',
      category: 'frontend',
      logo: 'https://reactjs.org/logo.png',
      url: 'https://reactjs.org',
      description: 'A JavaScript library for building user interfaces',
      isFeatured: true
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create/update logic with featured flag
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      // TODO: Implement delete logic
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    // TODO: Implement toggle featured logic
    console.log('Toggle featured:', id, !currentValue);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Resources</h1>
          <p className="text-gray-400 mt-2">Manage your resource directory</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 
                   transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Resource
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search resources..."
          className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg
                   text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500
                   transition-colors duration-200"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
      </div>

      {/* Resources Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={resource.logo}
                      alt={resource.name}
                      className="h-8 w-8 rounded-lg"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-200">{resource.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                 bg-blue-100 text-blue-800">
                    {resource.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleFeatured(resource.id, resource.isFeatured)}
                    className={`p-1.5 rounded-full transition-colors duration-200 ${
                      resource.isFeatured
                        ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Star size={16} fill={resource.isFeatured ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {resource.url}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingResource(resource);
                      setFormData({
                        name: resource.name,
                        category: resource.category,
                        logo: resource.logo,
                        url: resource.url,
                        description: resource.description,
                        isFeatured: resource.isFeatured
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 mr-4"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                {editingResource ? 'Edit Resource' : 'Add Resource'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingResource(null);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="frontend">Frontend</option>
                  <option value="maps">Maps</option>
                  <option value="useful">Useful</option>
                  <option value="wordpress">WordPress</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500
                           bg-gray-700"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                  Featured Resource
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingResource(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 
                           transition-colors duration-200"
                >
                  {editingResource ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resources;
