import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Shield, Trash2, Edit2, Check, X } from 'lucide-react';
import { fetchUsers, updateUser, deleteUser } from '../../services/api';
import type { User as UserType } from '../../types';

type UserRole = 'admin' | 'super_admin';

interface EditingData {
  name: string;
  email: string;
  role: UserRole;
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingData>({
    name: '',
    email: '',
    role: 'admin'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setError(null);
      const response = await updateUser(id, editingData);
      if (response.success) {
        setUsers(prev => prev.map(user =>
          user.id === id ? response.data : user
        ));
        setEditingId(null);
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      setError("You can't delete your own account");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setError(null);
      const response = await deleteUser(id);
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const startEditing = (user: UserType) => {
    setEditingId(user.id);
    setEditingData({
      name: user.name,
      email: user.email,
      role: user.role
    });
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
        <h1 className="text-3xl font-bold text-gray-100">Users</h1>
        <p className="text-gray-400 mt-2">Manage admin users</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            {editingId === user.id ? (
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
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingData.email}
                      onChange={(e) => setEditingData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                               text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={editingData.role}
                    onChange={(e) => setEditingData(prev => ({ 
                      ...prev, 
                      role: e.target.value as UserRole
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                             text-gray-200 focus:outline-none focus:border-blue-500"
                    disabled={user.id === currentUser?.id}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdate(user.id)}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 
                             rounded-lg transition-colors duration-200"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-100">{user.name}</h3>
                    {user.role === 'super_admin' && (
                      <Shield className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </span>
                    <span className="text-sm text-gray-400">
                      Created: {new Date(user.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(user)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                    disabled={!currentUser || user.id === currentUser.id}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 
                             rounded-lg transition-colors duration-200"
                    disabled={!currentUser || user.id === currentUser.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
