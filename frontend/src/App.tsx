import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { UserList } from './components/UserList';
import { ModelInteraction } from './components/ModelInteraction';
import { listAllUsers } from './utils/api';

interface NavigationProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
  availableUsers: string[];
}

function Navigation({ currentUserId, onUserChange, availableUsers }: NavigationProps) {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const linkClass = (path: string) => `
    px-4 py-2 rounded-lg font-medium transition-colors
    ${isActive(path) 
      ? 'bg-blue-600 text-white' 
      : 'text-gray-700 hover:bg-gray-100'
    }
  `;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Token Usage Tracker</h1>
              <p className="text-xs text-gray-500">Real-time monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/" className={linkClass('/')}>
              Dashboard
            </Link>
            <Link to="/users" className={linkClass('/users')}>
              Users
            </Link>
            <Link to="/interact" className={linkClass('/interact')}>
              Model Interaction
            </Link>
          </div>

          <div className="relative">
            {availableUsers.length > 0 ? (
              <>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{currentUserId}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase">Select User</p>
                    </div>
                    {availableUsers.map((userId) => (
                      <button
                        key={userId}
                        onClick={() => {
                          onUserChange(userId);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          userId === currentUserId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${userId === currentUserId ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                          {userId}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium text-yellow-800">No Users</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [currentUserId, setCurrentUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);

  // Fetch available users on mount
  const fetchUsers = async () => {
    try {
      const data = await listAllUsers();
      const userIds = data.users.map((user: any) => user.userId);
      setAvailableUsers(userIds);
      
      // Set the first user as default if not already set
      if (userIds.length > 0 && !currentUserId) {
        setCurrentUserId(userIds[0]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    // Fetch users only on initial mount
    fetchUsers();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          currentUserId={currentUserId} 
          onUserChange={setCurrentUserId}
          availableUsers={availableUsers}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/users" element={<UserList onUserListChange={fetchUsers} />} />
            {currentUserId ? (
              <>
                <Route path="/" element={<Dashboard userId={currentUserId} />} />
                <Route path="/interact" element={<ModelInteraction userId={currentUserId} />} />
              </>
            ) : (
              <Route path="*" element={
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">No Users Available</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Please create a user first by navigating to the <strong>Users</strong> page.</p>
                      </div>
                      <div className="mt-4">
                        <Link 
                          to="/users" 
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Go to Users Page
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              } />
            )}
          </Routes>
        </main>

        <footer className="border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Token Usage Tracker • Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
