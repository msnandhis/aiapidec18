import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { submitApiKit } from '../services/api';

interface SubmitApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitApiModal({ isOpen, onClose }: SubmitApiModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    toolName: '',
    description: '',
    apiLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await submitApiKit(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        toolName: '',
        description: '',
        apiLink: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit API');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form after animation
      setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-xl bg-gray-800 p-6 text-left shadow-xl transition-all">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-300"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-100">Submit Your API</h3>
            <p className="mt-2 text-gray-400">
              Share your API with our community. We'll review and add it to our directory.
              Have questions? <Link to="/contact" className="text-blue-400 hover:text-blue-300" onClick={handleClose}>Contact us</Link>.
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Submission Received!</h3>
              <p className="text-gray-300">We'll review your submission and get back to you soon.</p>
              <button
                onClick={handleClose}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 
                         transition-colors duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="toolName" className="block text-sm font-medium text-gray-300 mb-1">
                  API/Tool Name
                </label>
                <input
                  id="toolName"
                  type="text"
                  required
                  value={formData.toolName}
                  onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="apiLink" className="block text-sm font-medium text-gray-300 mb-1">
                  API/Documentation Link
                </label>
                <input
                  id="apiLink"
                  type="url"
                  required
                  value={formData.apiLink}
                  onChange={(e) => setFormData({ ...formData, apiLink: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg
                           text-sm font-medium text-white bg-blue-600 hover:bg-blue-500
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    'Submit API'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
