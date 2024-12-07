import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  Tags, 
  Users, 
  LogOut,
  FileUp,
  MessageSquare
} from 'lucide-react';
import { MainLayout } from '../../shared/layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/resources', icon: Library, label: 'Resources' },
    { path: '/admin/categories', icon: Tags, label: 'Categories' },
    { path: '/admin/submissions', icon: FileUp, label: 'API Submissions', badge: '2' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages', badge: '3' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <MainLayout>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="h-full flex flex-col">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-200">Admin Panel</h2>
              <p className="text-sm text-gray-400">Manage your resources</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map(({ path, icon: Icon, label, badge }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive(path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                  `}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                  {badge && (
                    <span className={`
                      ml-auto px-2 py-0.5 text-xs rounded-full font-medium
                      ${isActive(path)
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-600 text-white'}
                    `}>
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-3 px-4 py-2 mb-4 rounded-lg bg-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-200">{user?.name}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 w-full rounded-lg
                         text-gray-400 hover:text-white hover:bg-gray-700
                         transition-all duration-200"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-900 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}

export default AdminLayout;
