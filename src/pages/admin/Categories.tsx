import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import type { Category } from '../../types';

interface EditingData {
  label: string;
  slug: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingData>({
    label: '',
    slug: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        throw new Error(response.message || 'Failed to load categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      if (!editingData.label.trim() || !editingData.slug.trim()) {
        throw new Error('Label and slug are required');
      }

      const response = await createCategory({
        label: editingData.label.trim(),
        slug: editingData.slug.trim()
      });

      if (response.success) {
        setCategories(prev => [...prev, response.data]);
        setIsAddingNew(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setError(null);
      if (!editingData.label.trim() || !editingData.slug.trim()) {
        throw new Error('Label and slug are required');
      }

      const response = await updateCategory(id, {
        label: editingData.label.trim(),
        slug: editingData.slug.trim()
      });

      if (response.success) {
        setCategories(prev => prev.map(category =>
          category.id === id ? response.data : category
        ));
        setEditingId(null);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to update category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect all resources in this category.')) {
      return;
    }

    try {
      setError(null);
      const response = await deleteCategory(id);
      if (response.success) {
        setCategories(prev => prev.filter(category => category.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingData({
      label: category.label,
      slug: category.slug
    });
  };

  const resetForm = () => {
    setEditingData({
      label: '',
      slug: ''
    });
  };

  const CategoryForm = ({ onSubmit, submitLabel }: { onSubmit: () => void, submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={editingData.label}
            onChange={(e) => setEditingData(prev => ({ ...prev, label: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            placeholder="e.g., Machine Learning"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={editingData.slug}
            onChange={(e) => setEditingData(prev => ({ ...prev, slug: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                     text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            placeholder="e.g., machine-learning"
          />
          <p className="mt-1 text-sm text-gray-400">
            Used in URLs, should be lowercase with hyphens
          </p>
        </div>
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
        <h1 className="text-3xl font-bold text-gray-100">Categories</h1>
        <p className="text-gray-400 mt-2">Manage API categories</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Add New Category */}
        {!isAddingNew && !editingId && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        )}

        {isAddingNew && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <CategoryForm onSubmit={handleCreate} submitLabel="Create Category" />
          </div>
        )}

        {/* Category List */}
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            {editingId === category.id ? (
              <CategoryForm onSubmit={() => handleUpdate(category.id)} submitLabel="Update Category" />
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">
                    {category.label}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Slug: {category.slug}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {category.total_resources} resources
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(category)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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

        {categories.length === 0 && !isAddingNew && (
          <div className="text-center py-12">
            <p className="text-gray-400">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
