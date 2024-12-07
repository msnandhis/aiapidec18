import React, { useState } from 'react';
import { Trash2, Filter, Mail, Send } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  adminNotes?: string;
  createdAt: string;
}

function Messages() {
  const [selectedItem, setSelectedItem] = useState<Message | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Mock data - replace with API calls
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

  const filteredMessages = messages.filter(message => 
    statusFilter === 'all' || message.status === statusFilter
  );

  const handleStatusChange = async (id: string, newStatus: 'unread' | 'read' | 'replied') => {
    // TODO: Implement status change API call
    console.log('Change status:', id, newStatus);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      // TODO: Implement delete API call
      console.log('Delete message:', id);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedItem) return;
    // TODO: Implement save notes API call
    setIsEditingNotes(false);
  };

  const handleComposeEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Messages</h1>
        <p className="text-gray-400 mt-2">Manage contact form messages</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
        <Filter size={20} className="text-gray-400" />
        <div className="flex gap-2">
          {['all', 'unread', 'read', 'replied'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-700">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedItem(message);
                  if (message.status === 'unread') {
                    handleStatusChange(message.id, 'read');
                  }
                }}
                className={`p-4 cursor-pointer transition-colors duration-200 
                         ${selectedItem?.id === message.id ? 'bg-gray-700' : 'hover:bg-gray-750'}
                         ${message.status === 'unread' ? 'border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-gray-200 font-medium">{message.name}</h3>
                    <p className="text-sm text-gray-400">{message.email}</p>
                  </div>
                  <StatusBadge status={message.status} />
                </div>
                <p className="text-sm text-gray-400 truncate">{message.message}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Received on {new Date(message.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail View */}
        {selectedItem ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">{selectedItem.name}</h2>
                  <p className="text-gray-400">{selectedItem.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleComposeEmail(selectedItem.email)}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg 
                             transition-colors duration-200"
                  >
                    <Send size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg 
                             transition-colors duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  {['unread', 'read', 'replied'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedItem.id, status as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedItem.status === status
                          ? status === 'unread' ? 'bg-blue-600 text-white' :
                            status === 'replied' ? 'bg-green-600 text-white' :
                            'bg-gray-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Message
                </label>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-200 whitespace-pre-wrap">{selectedItem.message}</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-400">
                    Admin Notes
                  </label>
                  {!isEditingNotes && (
                    <button
                      onClick={() => {
                        setIsEditingNotes(true);
                        setAdminNotes(selectedItem.adminNotes || '');
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                               text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="px-3 py-1 text-gray-300 hover:text-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300">
                    {selectedItem.adminNotes || 'No notes added'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="text-center text-gray-400 py-12">
              <Mail size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a message to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
