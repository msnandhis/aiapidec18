import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Upload, Check, X } from 'lucide-react';
import { 
  fetchResources, 
  fetchCategories, 
  createResource, 
  updateResource, 
  deleteResource,
  uploadFile 
} from '../../services/api';
import { Pagination } from '../../components/Pagination';
import type { Resource, Category } from '../../types';

interface EditingData {
  name: string;
  description: string;
  url: string;
  category_id: string;
  is_featured: boolean;
  logo?: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingData>({
    name: '',
    description: '',
    url: '',
    category_id: '',
    is_featured: false
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [resourcesResponse, categoriesResponse] = await Promise.all([
        fetchResources(undefined, currentPage),
        fetchCategories()
      ]);
      if (resourcesResponse.success && categoriesResponse.success) {
        setResources(resourcesResponse.data);
        setCategories(categoriesResponse.data);
        setTotalPages(resourcesResponse.pagination?.total_pages || 1);
      } else {
        throw new Error('Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setResources([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadLogo = async () => {
    if (!selectedFile) return undefined;

    try {
      const response = await uploadFile(selectedFile, 'logo');
      if (response.success) {
        return response.data.path;
      }
      throw new Error('Failed to upload logo');
    } catch (err) {
      throw new Error('Failed to upload logo');
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      let logoPath = undefined;
      
      if (selectedFile) {
        logoPath = await handleUploadLogo();
      }

      const response = await createResource({
        ...editingData,
        logo: logoPath
      });

      if (response.success) {
        setResources(prev => [...prev, response.data]);
        setIsAddingNew(false);
        resetForm();
        await loadData(); // Refresh to get updated list
      } else {
        throw new Error(response.message || 'Failed to create resource');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resource');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setError(null);
      let logoPath = editingData.logo;
      
      if (selectedFile) {
        logoPath = await handleUploadLogo();
      }

      const response = await updateResource(id, {
        ...editingData,
        logo: logoPath
      });

      if (response.success) {
        setResources(prev => prev.map(resource =>
          resource.id === id ? response.data : resource
        ));
        setEditingId(null);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to update resource');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      setError(null);
      const response = await deleteResource(id);
      if (response.success) {
        setResources(prev => prev.filter(resource => resource.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete resource');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource');
    }
  };

  const startEditing = (resource: Resource) => {
    setEditingId(resource.id);
    setEditingData({
      name: resource.name,
      description: resource.description || '',
      url: resource.url,
      category_id: resource.category_id,
      is_featured: resource.is_featured,
      logo: resource.logo
    });
  };

  const resetForm = () => {
    setEditingData({
      name: '',
      description: '',
      url: '',
      category_id: '',
      is_featured: false
    });
    setSelectedFile(null);
  };

  const ResourceForm = ({ onSubmit, submitLabel }: { onSubmit: () => void, submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={editingData.name}
            onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            URL
          </label>
          <input
            type="url"
            value={editingData.url}
            onChange={(e) => setEditingData(prev => ({ ...prev, url: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={editingData.description}
          onChange={(e) => setEditingData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                   text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            value={editingData.category_id}
            onChange={(e) => setEditingData(prev => ({ ...prev, category_id: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Logo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 
                       rounded-lg text-gray-300 hover:bg-gray-600 cursor-pointer"
            >
              <Upload size={16} />
              <span>{selectedFile ? selectedFile.name : 'Choose file'}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-gray-300">
          <input
            type="checkbox"
            checked={editingData.is_featured}
            onChange={(e) => setEditingData(prev => ({ ...prev, is_featured: e.target.checked }))}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          Featured
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            if (isAddingNew) setIsAddingNew(false);
            else setEditingId(null);
            resetForm();
          }}
          className="px-4 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                   rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                   rounded-lg transition-colors duration-200"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Resources</h1>
        <p className="text-gray-400 mt-2">Manage API resources</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Add New Resource */}
        {!isAddingNew && !editingId && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <Plus size={16} />
            <span>Add Resource</span>
          </button>
        )}

        {isAddingNew && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <ResourceForm onSubmit={handleCreate} submitLabel="Create Resource" />
          </div>
        )}

        {/* Resource List */}
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            {editingId === resource.id ? (
              <ResourceForm onSubmit={() => handleUpdate(resource.id)} submitLabel="Update Resource" />
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {resource.logo && (
                    <img
                      src={resource.logo}
                      alt={resource.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-700"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">
                      {resource.name}
                    </h3>
                    {resource.description && (
                      <p className="text-sm text-gray-400 mt-1">
                        {resource.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-sm text-blue-400">
                        {categories.find(c => c.id === resource.category_id)?.label}
                      </span>
                      {resource.is_featured && (
                        <span className="text-sm text-yellow-400">Featured</span>
                      )}
                      <span className="text-sm text-gray-400">
                        {resource.views} views
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => startEditing(resource)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {resources.length === 0 && !isAddingNew && (
          <div className="text-center py-12">
            <p className="text-gray-400">No resources found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
