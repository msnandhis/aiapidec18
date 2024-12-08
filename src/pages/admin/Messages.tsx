import React, { useState, useEffect } from 'react';
import { Mail, Check, Trash2, Reply } from 'lucide-react';
import { fetchMessages, updateMessageStatus, deleteMessage } from '../../services/api';
import { Pagination } from '../../components/Pagination';
import type { Message } from '../../types';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unread' | 'read' | 'replied'>('all');

  useEffect(() => {
    loadMessages();
  }, [currentPage, selectedStatus]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchMessages(
        selectedStatus === 'all' ? undefined : selectedStatus,
        currentPage
      );
      if (response.success) {
        setMessages(response.data);
        setTotalPages(response.pagination?.total_pages || 1);
      } else {
        throw new Error(response.message || 'Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'read' | 'replied') => {
    try {
      setError(null);
      const response = await updateMessageStatus(id, status);
      if (response.success) {
        setMessages(prev => prev.map(message =>
          message.id === id ? { ...message, status } : message
        ));
      } else {
        throw new Error(response.message || 'Failed to update message status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setError(null);
      const response = await deleteMessage(id);
      if (response.success) {
        setMessages(prev => prev.filter(message => message.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
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
        <h1 className="text-3xl font-bold text-gray-100">Messages</h1>
        <p className="text-gray-400 mt-2">Manage contact form messages</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'unread', 'read', 'replied'] as const).map((status) => (
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`bg-gray-800 rounded-xl p-6 border ${
              message.status === 'unread'
                ? 'border-blue-500/50'
                : 'border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-100">
                    {message.name}
                  </h3>
                  {message.status === 'unread' && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{message.email}</p>
                <p className="mt-4 text-gray-300">{message.message}</p>
                {message.admin_notes && (
                  <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-300">Admin Notes:</p>
                    <p className="text-sm text-gray-400 mt-1">{message.admin_notes}</p>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-4">
                  Received: {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {message.status === 'unread' && (
                  <button
                    onClick={() => handleStatusUpdate(message.id, 'read')}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate(message.id, 'replied')}
                  className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                           rounded-lg transition-colors duration-200"
                  title="Mark as replied"
                >
                  <Reply size={16} />
                </button>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                           rounded-lg transition-colors duration-200"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No messages found</p>
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
