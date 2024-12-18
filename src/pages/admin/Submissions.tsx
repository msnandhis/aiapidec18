import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { fetchSubmissions, updateSubmissionStatus, deleteSubmission, fetchCategories } from '../../services/api';
import { Pagination } from '../../components/Pagination';
import type { Submission, Category } from '../../types';

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadSubmissions();
    loadCategories();
  }, [currentPage, selectedStatus]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchSubmissions(
        selectedStatus === 'all' ? undefined : selectedStatus,
        currentPage
      );
      if (response.success) {
        setSubmissions(response.data);
        setTotalPages(response.pagination?.total_pages || 1);
      } else {
        throw new Error(response.message || 'Failed to load submissions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleStatusUpdate = async (
    id: string, 
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      setError(null);

      // Require category selection when approving
      if (status === 'approved' && !selectedCategories[id]) {
        setError('Please select a category before approving');
        return;
      }

      const response = await updateSubmissionStatus(
        id, 
        status, 
        notes,
        status === 'approved' ? selectedCategories[id] : undefined
      );

      if (response.success) {
        setSubmissions(prev => prev.map(submission =>
          submission.id === id ? { ...submission, status, admin_notes: notes } : submission
        ));
        setEditingNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[id];
          return newNotes;
        });
        setSelectedCategories(prev => {
          const newCategories = { ...prev };
          delete newCategories[id];
          return newCategories;
        });
      } else {
        throw new Error(response.message || 'Failed to update submission status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      setError(null);
      const response = await deleteSubmission(id);
      if (response.success) {
        setSubmissions(prev => prev.filter(submission => submission.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete submission');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-100">API Submissions</h1>
        <p className="text-gray-400 mt-2">Review and manage API submissions</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                     ${selectedStatus === status
                       ? 'bg-blue-600 text-white'
                       : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                     }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className={`bg-gray-800 rounded-xl p-6 border ${
              submission.status === 'pending'
                ? 'border-yellow-500/50'
                : submission.status === 'approved'
                ? 'border-green-500/50'
                : 'border-red-500/50'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-100">
                      {submission.tool_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      submission.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : submission.status === 'approved'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    by {submission.name} ({submission.email})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={submission.api_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-gray-300">{submission.description}</p>

              {submission.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategories[submission.id] || ''}
                      onChange={(e) => setSelectedCategories(prev => ({
                        ...prev,
                        [submission.id]: e.target.value
                      }))}
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
                      Admin Notes
                    </label>
                    <textarea
                      value={editingNotes[submission.id] || ''}
                      onChange={(e) => setEditingNotes(prev => ({
                        ...prev,
                        [submission.id]: e.target.value
                      }))}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                               text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Optional notes about this submission..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleStatusUpdate(
                        submission.id,
                        'rejected',
                        editingNotes[submission.id]
                      )}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 
                               hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                    >
                      <X size={16} />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(
                        submission.id,
                        'approved',
                        editingNotes[submission.id]
                      )}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 
                               hover:bg-green-500/20 rounded-lg transition-colors duration-200"
                    >
                      <Check size={16} />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              )}

              {submission.admin_notes && (
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-300">Admin Notes:</p>
                  <p className="text-sm text-gray-400 mt-1">{submission.admin_notes}</p>
                </div>
              )}

              <p className="text-sm text-gray-400">
                Submitted: {new Date(submission.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No submissions found</p>
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
