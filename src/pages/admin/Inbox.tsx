import React, { useState } from 'react';
import { Mail, Send, Archive, Trash2, Check, X, ExternalLink } from 'lucide-react';

interface Submission {
  id: string;
  name: string;
  email: string;
  toolName: string;
  description: string;
  apiLink: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

function Inbox() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'messages'>('submissions');
  const [selectedItem, setSelectedItem] = useState<Submission | Message | null>(null);

  // Mock data - replace with API calls
  const submissions: Submission[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      toolName: 'AI Image Generator',
      description: 'A powerful AI image generation API',
      apiLink: 'https://api.example.com',
      status: 'pending',
      createdAt: '2024-01-01 10:00:00'
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'I have a question about integrating your API',
      status: 'unread',
      createdAt: '2024-01-01 11:00:00'
    }
  ];

  const handleApprove = async (id: string) => {
    // TODO: Implement approve submission logic
  };

  const handleReject = async (id: string) => {
    // TODO: Implement reject submission logic
  };

  const handleReply = async (id: string, reply: string) => {
    // TODO: Implement reply to message logic
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement delete logic
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Inbox</h1>
        <p className="text-gray-400 mt-2">Manage submissions and messages</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 font-medium transition-colors duration-200 ${
            activeTab === 'submissions'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          API Submissions
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 font-medium transition-colors duration-200 ${
            activeTab === 'messages'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Messages
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {activeTab === 'submissions' ? (
            <div className="divide-y divide-gray-700">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => setSelectedItem(submission)}
                  className={`p-4 cursor-pointer transition-colors duration-200 
                           ${selectedItem?.id === submission.id ? 'bg-gray-700' : 'hover:bg-gray-750'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-gray-200 font-medium">{submission.toolName}</h3>
                      <p className="text-sm text-gray-400">{submission.name}</p>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}
                    `}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{submission.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedItem(message)}
                  className={`p-4 cursor-pointer transition-colors duration-200 
                           ${selectedItem?.id === message.id ? 'bg-gray-700' : 'hover:bg-gray-750'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-gray-200 font-medium">{message.name}</h3>
                      <p className="text-sm text-gray-400">{message.email}</p>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${message.status === 'unread' ? 'bg-blue-100 text-blue-800' :
                        message.status === 'replied' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {message.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          {selectedItem ? (
            'toolName' in selectedItem ? (
              // Submission Detail
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100">{selectedItem.toolName}</h2>
                    <p className="text-gray-400">Submitted by {selectedItem.name}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedItem.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(selectedItem.id)}
                          className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg 
                                   transition-colors duration-200"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => handleReject(selectedItem.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg 
                                   transition-colors duration-200"
                        >
                          <X size={20} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg 
                               transition-colors duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Description
                    </label>
                    <p className="text-gray-200">{selectedItem.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      API Link
                    </label>
                    <a
                      href={selectedItem.apiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {selectedItem.apiLink}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Contact Email
                    </label>
                    <a
                      href={`mailto:${selectedItem.email}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {selectedItem.email}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              // Message Detail
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100">{selectedItem.name}</h2>
                    <p className="text-gray-400">{selectedItem.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg 
                               transition-colors duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Message
                    </label>
                    <p className="text-gray-200">{selectedItem.message}</p>
                  </div>
                  {selectedItem.status !== 'replied' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Reply
                      </label>
                      <textarea
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                                 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        rows={4}
                        placeholder="Type your reply..."
                      />
                      <button
                        onClick={() => handleReply(selectedItem.id, '')}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                                 hover:bg-blue-500 transition-colors duration-200
                                 flex items-center gap-2"
                      >
                        <Send size={16} />
                        Send Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="text-center text-gray-400 py-12">
              <Mail size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select an item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inbox;
