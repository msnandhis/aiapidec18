import React, { useState, useEffect } from 'react';
import { fetchDashboardStats, type DashboardStats } from '../../services/api';
import { BarChart3, Users, MessageSquare, FileText, Eye, Star } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetchDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Failed to load dashboard stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-2">Overview of your API directory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Resources"
          value={stats.total_resources}
          icon={<FileText className="h-6 w-6 text-blue-400" />}
          change={`${stats.daily_resources[0]?.count || 0} today`}
        />
        <StatCard
          title="Total Categories"
          value={stats.total_categories}
          icon={<BarChart3 className="h-6 w-6 text-purple-400" />}
        />
        <StatCard
          title="Total Submissions"
          value={stats.total_submissions}
          icon={<Users className="h-6 w-6 text-green-400" />}
          change={`${stats.pending_submissions} pending`}
        />
        <StatCard
          title="Pending Submissions"
          value={stats.pending_submissions}
          icon={<Star className="h-6 w-6 text-yellow-400" />}
          change={stats.pending_submissions > 0 ? 'Needs attention' : 'All clear'}
          alert={stats.pending_submissions > 0}
        />
        <StatCard
          title="Unread Messages"
          value={stats.unread_messages}
          icon={<MessageSquare className="h-6 w-6 text-pink-400" />}
          change={stats.unread_messages > 0 ? 'Needs attention' : 'All clear'}
          alert={stats.unread_messages > 0}
        />
        <StatCard
          title="Total Messages"
          value={stats.total_messages}
          icon={<Eye className="h-6 w-6 text-indigo-400" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recent_activity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {activity.type === 'submission' && (
                    <FileText className="h-5 w-5 text-blue-400" />
                  )}
                  {activity.type === 'message' && (
                    <MessageSquare className="h-5 w-5 text-pink-400" />
                  )}
                  {activity.type === 'resource' && (
                    <Star className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div>
                  <p className="text-gray-200">{activity.title}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Category Distribution</h2>
          <div className="space-y-4">
            {stats.category_distribution.map((category) => (
              <div key={category.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{category.label}</span>
                  <span className="text-gray-400">{category.count} resources</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(category.count / stats.total_resources) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Submissions</h2>
          <div className="space-y-4">
            {stats.recent_submissions.map((submission) => (
              <div
                key={submission.id}
                className="p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <p className="text-gray-200">{submission.tool_name}</p>
                <p className="text-sm text-gray-400">by {submission.name}</p>
                <div className="mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      submission.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : submission.status === 'approved'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Messages</h2>
          <div className="space-y-4">
            {stats.recent_messages.map((message) => (
              <div
                key={message.id}
                className="p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <p className="text-gray-200">From {message.name}</p>
                <p className="text-sm text-gray-400 line-clamp-2">{message.message}</p>
                <div className="mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      message.status === 'unread'
                        ? 'bg-blue-500/10 text-blue-400'
                        : message.status === 'read'
                        ? 'bg-gray-500/10 text-gray-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}
                  >
                    {message.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Resources */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Resources</h2>
          <div className="space-y-4">
            {stats.recent_resources.map((resource) => (
              <div
                key={resource.id}
                className="p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <p className="text-gray-200">{resource.name}</p>
                <p className="text-sm text-gray-400">{resource.category_name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{resource.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: string;
  alert?: boolean;
}

function StatCard({ title, value, icon, change, alert }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400">{title}</p>
          <p className="text-3xl font-semibold text-gray-100 mt-2">{value}</p>
        </div>
        {icon}
      </div>
      {change && (
        <p
          className={`mt-2 text-sm ${
            alert ? 'text-yellow-400' : 'text-gray-400'
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}
