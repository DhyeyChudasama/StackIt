import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AskQuestionPage from './pages/AskQuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AIChatPage from './pages/AIChatPage';
import ProfilePage from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const { user, isLoading } = useAuth();

  // Removed localStorage initialization - now using MongoDB backend

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    if (id) {
      setSelectedQuestionId(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'ask':
        return <AskQuestionPage onNavigate={handleNavigate} />;
      case 'question':
        return <QuestionDetailPage questionId={selectedQuestionId} onNavigate={handleNavigate} />;
      case 'ai-chat':
        return <AIChatPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'questions':
        return <HomePage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;