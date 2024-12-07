import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Library, 
  Tags, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  Activity,
  FileUp,
  MessageSquare
} from 'lucide-react';
import type { DashboardStats, ActivityItem as ActivityItemType } from '../../types';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  linkTo,
  trendLabel
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  trend: number;
  linkTo: string;
  trendLabel?: string;
}) {
  return (
    <Link
      to={linkTo}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 
                 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-100">{value}</h3>
        </div>
        <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-blue-500/20 
                      transition-colors duration-300">
          <Icon className="w-6 h-6 text-gray-300 group-hover:text-blue-400" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}% {trendLabel || (trend >= 0 ? 'increase' : 'decrease')}
          </span>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 
                             transform group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </Link>
  );
}

function ActivityItem({ 
  type,
  action, 
  user,
  target,
  timestamp
}: ActivityItemType) {
  const getIcon = () => {
    switch (type) {
      case 'submission':
        return FileUp;
      case 'message':
        return MessageSquare;
      case 'resource':
        return Library;
      case 'user':
        return Users;
      default:
        return Activity;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="p-2 bg-gray-800 rounded-lg">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div className="flex-1">
        <p className="text-gray-300">
          <span className="text-blue-400">{user}</span> {action} <span className="font-medium">{target}</span>
        </p>
        <p className="text-sm text-gray-500">{timestamp}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  // Mock data - replace with API calls
  const stats: DashboardStats = {
    totalResources: 24,
    totalCategories: 4,
    totalUsers: 3,
    pendingSubmissions: 5,
    unreadMessages: 3,
    recentActivity: [
      {
        id: '1',
        type: 'submission',
        action: 'submitted new API',
        user: 'John Doe',
        target: 'AI Image Generator',
        timestamp: '2 minutes ago'
      },
      {
        id: '2',
        type: 'message',
        action: 'sent a message about',
        user: 'Jane Smith',
        target: 'API Integration',
        timestamp: '1 hour ago'
      },
      {
        id: '3',
        type: 'resource',
        action: 'approved',
        user: 'Admin',
        target: 'React Native',
        timestamp: '3 hours ago'
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-2">Overview of your resource directory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Resources"
          value={stats.totalResources}
          icon={Library}
          trend={12}
          linkTo="/admin/resources"
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={Tags}
          trend={0}
          linkTo="/admin/categories"
        />
        <StatCard
          title="Admin Users"
          value={stats.totalUsers}
          icon={Users}
          trend={50}
          linkTo="/admin/users"
        />
        <StatCard
          title="Pending Submissions"
          value={stats.pendingSubmissions}
          icon={FileUp}
          trend={stats.pendingSubmissions}
          linkTo="/admin/submissions"
          trendLabel="new"
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          icon={MessageSquare}
          trend={stats.unreadMessages}
          linkTo="/admin/messages"
          trendLabel="new"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
        <div className="divide-y divide-gray-700">
          {stats.recentActivity.map((activity) => (
            <ActivityItem key={activity.id} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
