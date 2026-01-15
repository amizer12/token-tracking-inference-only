import { useState, useEffect } from 'react';
import { listAllUsers } from '../utils/api';
import { CreateUser } from './CreateUser';

interface UserData {
  userId: string;
  tokenLimit: number;
  tokenUsage: number;
  percentageUsed: number;
  lastUpdated: string;
}

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'usage' | 'limit' | 'percentage'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await listAllUsers();
      setUsers(data.users || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: 'usage' | 'limit' | 'percentage') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'usage':
        aVal = a.tokenUsage;
        bVal = b.tokenUsage;
        break;
      case 'limit':
        aVal = a.tokenLimit;
        bVal = b.tokenLimit;
        break;
      case 'percentage':
        aVal = a.percentageUsed;
        bVal = b.percentageUsed;
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Critical</span>;
    } else if (percentage >= 70) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Warning</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Healthy</span>;
    }
  };

  const SortIcon = ({ field }: { field: 'usage' | 'limit' | 'percentage' }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor all users and their token usage</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
        </div>
      </div>

      {/* Create User Form */}
      <CreateUser onUserCreated={fetchUsers} />

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('usage')}
              >
                <div className="flex items-center justify-end gap-1">
                  Token Usage
                  <SortIcon field="usage" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('limit')}
              >
                <div className="flex items-center justify-end gap-1">
                  Token Limit
                  <SortIcon field="limit" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center justify-end gap-1">
                  Usage %
                  <SortIcon field="percentage" />
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.userId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-mono text-gray-900">{user.tokenUsage.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-mono text-gray-700">{user.tokenLimit.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          user.percentageUsed >= 90 ? 'bg-red-500' :
                          user.percentageUsed >= 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(user.percentageUsed, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">{user.percentageUsed}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(user.percentageUsed)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-500 font-mono">
                    {new Date(user.lastUpdated).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400">
        Auto-refreshing every 10 seconds
      </div>
    </div>
  );
};
