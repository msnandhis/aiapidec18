import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Category } from '../../types';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    label: ''
  });

  // Fetch categories
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, formData.label);
      } else {
        // Create new category
        await createCategory({
          id: formData.id,
          label: formData.label
        });
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ id: '', label: '' });
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all resources in this category.')) {
      try {
        await deleteCategory(id);
        loadCategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Categories</h1>
          <p className="text-gray-400 mt-2">Manage resource categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ id: '', label: '' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 
                   transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 
                     hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">{category.label}</h3>
                <p className="text-sm text-gray-400">ID: {category.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({ id: category.id, label: category.label });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 
                           rounded-lg transition-colors duration-200"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                           rounded-lg transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-grow h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(category.resource_count / 20) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">
                {category.resource_count} {category.resource_count === 1 ? 'resource' : 'resources'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase() })}
                    placeholder="e.g., frontend"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                             text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and dashes allowed"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Only lowercase letters, numbers, and dashes allowed
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Frontend Frameworks"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 
                           transition-colors duration-200"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
