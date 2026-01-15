import { useState, useEffect } from 'react';
import { invokeModel, listAllUsers } from '../utils/api';
import { ModelResponse } from '../types';

interface ModelInteractionProps {
  userId: string;
  onUserChange?: (userId: string) => void;
}

export const ModelInteraction: React.FC<ModelInteractionProps> = ({ userId: initialUserId, onUserChange }) => {
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [availableUsers, setAvailableUsers] = useState<Array<{ userId: string; tokenLimit: number; tokenUsage: number }>>([]);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<ModelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await listAllUsers();
      setAvailableUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleUserChange = (newUserId: string) => {
    setSelectedUserId(newUserId);
    if (onUserChange) {
      onUserChange(newUserId);
    }
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await invokeModel(selectedUserId, prompt);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Failed to invoke model');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const selectedUser = availableUsers.find(u => u.userId === selectedUserId);
  const remainingTokens = selectedUser ? selectedUser.tokenLimit - selectedUser.tokenUsage : 0;

  return (
    <div className="space-y-6">
      {/* Header with User Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Model Interaction</h1>
            <p className="text-sm text-gray-500 mt-1">Submit prompts to Claude Sonnet 4.5 and track token usage</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Select User:</label>
            <select
              value={selectedUserId}
              onChange={(e) => handleUserChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {availableUsers.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.userId} ({(user.tokenLimit - user.tokenUsage).toLocaleString()} tokens left)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedUser && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Token Limit:</span>
                <span className="ml-2 font-semibold text-gray-900">{selectedUser.tokenLimit.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Used:</span>
                <span className="ml-2 font-semibold text-gray-900">{selectedUser.tokenUsage.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Remaining:</span>
                <span className={`ml-2 font-semibold ${remainingTokens < 1000 ? 'text-red-600' : remainingTokens < 10000 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {remainingTokens.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Your Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message to Claude Sonnet 4.5..."
          disabled={loading}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            Press Cmd/Ctrl + Enter to submit
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Processing...' : 'Submit Prompt'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-4">
          {/* Response Text */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900">Model Response</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{response.response}</p>
            </div>
          </div>

          {/* Token Usage Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Token Usage</h3>
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
                    Tokens Consumed (This Request)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {response.tokensConsumed.toLocaleString()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Remaining Tokens
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      response.remainingTokens < 1000 ? 'bg-red-100 text-red-800' :
                      response.remainingTokens < 10000 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {response.remainingTokens.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!response && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Tips</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Enter your prompt in the text area above</li>
            <li>Click "Submit Prompt" or press Cmd/Ctrl + Enter to send</li>
            <li>Token usage will be tracked and displayed after each request</li>
            <li>Your remaining token balance will update automatically</li>
          </ul>
        </div>
      )}
    </div>
  );
};
