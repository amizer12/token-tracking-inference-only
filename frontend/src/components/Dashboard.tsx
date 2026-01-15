import React, { useState, useEffect } from 'react';
import { getUserUsage } from '../utils/api';
import { User } from '../types';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getUserUsage(userId);
      const remainingTokens = data.tokenLimit - data.tokenUsage;
      const percentageUsed = (data.tokenUsage / data.tokenLimit) * 100;
      
      setUser({
        ...data,
        remainingTokens: Math.max(0, remainingTokens),
        percentageUsed: Math.round(percentageUsed * 100) / 100
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-700">No user data available</p>
      </div>
    );
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 90) return 'Critical';
    if (percentage >= 70) return 'Warning';
    return 'Healthy';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Token Usage Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time monitoring for {user.userId}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${getStatusColor(user.percentageUsed)}`}></span>
            <span className="text-sm font-medium text-gray-700">{getStatusText(user.percentageUsed)}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Token Usage</div>
          <div className="text-3xl font-bold text-gray-900">{user.tokenUsage.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">of {user.tokenLimit.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Remaining</div>
          <div className="text-3xl font-bold text-gray-900">{user.remainingTokens.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">tokens available</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Cost</div>
          <div className="text-3xl font-bold text-green-700">${(user.totalCost || 0).toFixed(4)}</div>
          <div className="text-xs text-gray-500 mt-1">inference cost (USD)</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
          <div className={`text-3xl font-bold ${user.percentageUsed >= 90 ? 'text-red-600' : user.percentageUsed >= 70 ? 'text-yellow-600' : 'text-green-600'}`}>
            {getStatusText(user.percentageUsed)}
          </div>
          <div className="text-xs text-gray-500 mt-1">current state</div>
        </div>
      </div>

      {/* Usage Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Usage Progress</h2>
          <span className="text-sm text-gray-500">{user.percentageUsed}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getStatusColor(user.percentageUsed)}`}
            style={{ width: `${Math.min(user.percentageUsed, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0</span>
          <span>{user.tokenLimit.toLocaleString()} tokens</span>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Usage Details</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                User ID
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                {user.userId}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Token Limit
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                {user.tokenLimit.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Tokens Consumed
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                {user.tokenUsage.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Tokens Remaining
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                {user.remainingTokens.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Usage Percentage
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.percentageUsed >= 90 ? 'bg-red-100 text-red-800' :
                  user.percentageUsed >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.percentageUsed}%
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Inference Cost
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ${(user.totalCost || 0).toFixed(6)} USD
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Last Updated
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                {new Date(user.lastUpdated).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Alert */}
      {user.remainingTokens <= 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Token Limit Reached</h3>
              <p className="mt-1 text-sm text-red-700">
                You have consumed all allocated tokens. Please contact your administrator to increase your limit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-gray-400">
        Auto-refreshing every 5 seconds • Last update: {new Date(user.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
};
