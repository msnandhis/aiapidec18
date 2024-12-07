import React, { useState, useEffect } from 'react';
import { fetchSubmissions, updateSubmissionStatus, deleteSubmission } from '../../services/api';
import { Check, X, Trash2, MessageCircle } from 'lucide-react';
import { ApiSubmission } from '../../types';

type Status = 'pending' | 'approved' | 'rejected';
type EditingNotes = { id: string; notes: string };

export default function Submissions() {
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingNotes, setEditingNotes] = useState<EditingNotes | null>(null);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetchSubmissions(
        selectedStatus === 'all' ? undefined : selectedStatus,
        currentPage
      );
      setSubmissions(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedStatus, currentPage]);

  const handleStatusChange = async (id: string, status: Status, notes?: string) => {
    try {
      await updateSubmissionStatus(id, status, notes);
      loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteSubmission(id);
        loadSubmissions();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete submission');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-100">API Submissions</h1>
        <p className="text-gray-400 mt-2">Review and manage submitted APIs</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2">
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
                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">{submission.toolName}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Submitted by {submission.name} ({submission.email})
                </p>
              </div>
              <div className="flex items-center gap-2">
                {submission.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(submission.id, 'approved')}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 
                               rounded-lg transition-colors duration-200"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(submission.id, 'rejected')}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                               rounded-lg transition-colors duration-200"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(submission.id)}
                  className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                           rounded-lg transition-colors duration-200"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="mt-4 text-gray-300">{submission.description}</p>
            
            <div className="mt-4">
              <a
                href={submission.apiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View API Documentation →
              </a>
            </div>

            {/* Admin Notes */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              {editingNotes?.id === submission.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingNotes.notes}
                    onChange={(e) => setEditingNotes({ 
                      id: editingNotes.id, 
                      notes: e.target.value 
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                             text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    rows={2}
                    placeholder="Add admin notes..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingNotes(null)}
                      className="px-3 py-1 text-gray-400 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(submission.id, submission.status, editingNotes.notes);
                        setEditingNotes(null);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {submission.adminNotes ? (
                      <p className="text-gray-400 text-sm">{submission.adminNotes}</p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No admin notes</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingNotes({ 
                      id: submission.id, 
                      notes: submission.adminNotes || '' 
                    })}
                    className="p-1 text-gray-400 hover:text-gray-300"
                    title="Edit Notes"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                       ${currentPage === page
                         ? 'bg-blue-600 text-white'
                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
