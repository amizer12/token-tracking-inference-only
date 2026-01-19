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

interface UserListProps {
  onUserListChange?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ onUserListChange }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'usage' | 'limit' | 'percentage'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await listAllUsers();
      setUsers(data.users || []);
      setError(null);
      
      // Notify parent component that user list changed
      if (onUserListChange) {
        onUserListChange();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch users only on initial mount
    fetchUsers();
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
      await fetchUsers(); // This will trigger onUserListChange callback
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor all users and their token usage</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        <CreateUser onUserCreated={fetchUsers} />

        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
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
              <div className="text-3xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        <CreateUser onUserCreated={fetchUsers} />

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No Users Found</h3>
              <p className="mt-1 text-sm text-yellow-700">
                {error}. Create your first user using the form above.
              </p>
            </div>
          </div>
        </div>
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

      {/* API Code Snippet Modal */}
      {showApiModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">API Code Snippets - {selectedUser.userId}</h3>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Get User Usage */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Get User Usage</h4>
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto group">
                  <button
                    onClick={() => navigator.clipboard.writeText(`curl -X GET -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" -H "Content-Type: application/json" ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/users/${selectedUser.userId}`)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <pre className="text-sm text-green-400"><code>{`curl -X GET \\
  -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/users/${selectedUser.userId}`}</code></pre>
                </div>
              </div>

              {/* Update Token Limit */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Update Token Limit</h4>
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto group">
                  <button
                    onClick={() => navigator.clipboard.writeText(`curl -X PUT -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" -H "Content-Type: application/json" -d '{"newLimit": 200000}' ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/users/${selectedUser.userId}/limit`)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <pre className="text-sm text-green-400"><code>{`curl -X PUT \\
  -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"newLimit": 200000}' \\
  ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/users/${selectedUser.userId}/limit`}</code></pre>
                </div>
              </div>

              {/* Invoke Model */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Invoke Claude Sonnet 4.5</h4>
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto group">
                  <button
                    onClick={() => navigator.clipboard.writeText(`curl -X POST -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" -H "Content-Type: application/json" -d '{"prompt": "What is AWS Lambda?"}' ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/invoke/${selectedUser.userId}`)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <pre className="text-sm text-green-400"><code>{`curl -X POST \\
  -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "What is AWS Lambda?"}' \\
  ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/invoke/${selectedUser.userId}`}</code></pre>
                </div>
              </div>

              {/* Delete User */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h4>
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto group">
                  <button
                    onClick={() => navigator.clipboard.writeText(`curl -X DELETE -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" -H "Content-Type: application/json" ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/users/${selectedUser.userId}`)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <pre className="text-sm text-green-400"><code>{`curl -X DELETE \\
  -H "X-API-Key: ${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  ${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}/users/${selectedUser.userId}`}</code></pre>
                </div>
              </div>

              {/* JavaScript Example */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">JavaScript/TypeScript Example</h4>
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto group">
                  <button
                    onClick={() => navigator.clipboard.writeText(`const API_URL = '${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}';\nconst API_KEY = '${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}';\n\nconst response = await fetch(\`\${API_URL}/users/${selectedUser.userId}\`, {\n  method: 'GET',\n  headers: {\n    'X-API-Key': API_KEY,\n    'Content-Type': 'application/json'\n  }\n});\nconst data = await response.json();\nconsole.log(data);`)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <pre className="text-sm text-green-400"><code>{`const API_URL = '${import.meta.env.VITE_API_URL || 'YOUR_API_URL'}';
const API_KEY = '${import.meta.env.VITE_API_KEY || 'YOUR_API_KEY'}';

// Get user usage
const response = await fetch(\`\${API_URL}/users/${selectedUser.userId}\`, {
  method: 'GET',
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowApiModal(true);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    title="Click to view API code snippets"
                  >
                    {user.userId}
                  </button>
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
    </div>
  );
};
