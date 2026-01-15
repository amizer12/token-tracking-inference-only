import { useState, useEffect } from 'react';
import { listAllUsers, deleteUser } from '../utils/api';
import { CreateUser } from './CreateUser';

interface UserData {
  userId: string;
  tokenLimit: number;
  tokenUsage: number;
  percentageUsed: number;
  totalCost: number;
  lastUpdated: string;
}

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'usage' | 'limit' | 'percentage'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(`Are you sure you want to delete user "${userId}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await deleteUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setDeletingUserId(null);
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
                Total Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
                  <div className="text-sm font-semibold text-green-700">
                    ${(user.totalCost || 0).toFixed(4)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-500 font-mono">
                    {new Date(user.lastUpdated).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleDeleteUser(user.userId)}
                    disabled={deletingUserId === user.userId}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Delete user"
                  >
                    {deletingUserId === user.userId ? (
                      <>
                        <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-red-700" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
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
