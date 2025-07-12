import React, { useState } from 'react';
import { Bell, LogOut, User, MessageSquare, Plus, Home, Bot, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import NotificationDropdown from './NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { getUnreadNotificationsCount } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = user ? getUnreadNotificationsCount(user.id) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-3 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <div className="relative">
                  <HelpCircle className="w-8 h-8 text-indigo-600" />
                  <MessageSquare className="w-4 h-4 text-purple-600 absolute -bottom-1 -right-1" />
                </div>
                <span>StackIt</span>
              </button>
              
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => onNavigate('landing')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'landing'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-4 h-4 inline mr-1" />
                  Home
                </button>
                <button
                  onClick={() => onNavigate('questions')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'questions'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Questions
                </button>
                <button
                  onClick={() => onNavigate('tags')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'tags'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Tags
                </button>
                <button
                  onClick={() => onNavigate('ai-chat')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'ai-chat'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Bot className="w-4 h-4 inline mr-1" />
                  AI Assistant
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <button
                  onClick={() => onNavigate('ask')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </button>
              )}

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onNavigate('profile')}
                      className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg transition-all duration-200"
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{user.username}</span>
                    </button>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className={`${currentPage === 'landing' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;