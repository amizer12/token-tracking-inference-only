import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { UserList } from './components/UserList';
import { ModelInteraction } from './components/ModelInteraction';

function Navigation({ currentUserId }: { currentUserId: string }) {
  const location = useLocation();
  
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

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">{currentUserId}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [currentUserId, setCurrentUserId] = useState('demo-user');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentUserId={currentUserId} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard userId={currentUserId} />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/interact" element={<ModelInteraction userId={currentUserId} onUserChange={setCurrentUserId} />} />
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
