import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, LogOut, Upload, History, Home } from 'lucide-react';

const Header = () => {
  const { user, logout } = useUser();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IQ</span>
              </div>
              <span className="text-xl font-bold text-gray-900">InterviewIQ</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/upload"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/upload')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume</span>
              </Link>
              
              <Link
                to="/history"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/history')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
            </nav>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Please log in to continue
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
