import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, MessageSquare, Eye, TrendingUp, Award, RefreshCw, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';
import VoteButtons from '../components/VoteButtons';
import LikeButton from '../components/LikeButton';
import TagIcon from '../components/TagIcon';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

interface HomePageProps {
  onNavigate: (page: string, id?: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { questions, refreshQuestions } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('');
  const [deletingQuestion, setDeletingQuestion] = useState<string | null>(null);

  // Refresh questions when navigating back to this page
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshQuestions();
    } catch (error) {
      console.error('Failed to refresh questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!user) return;
    
    const question = questions.find(q => q._id === questionId);
    if (!question) return;
    
    const confirmMessage = `Are you sure you want to delete "${question.title}"?\n\nThis will permanently remove the question and all its answers. This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeletingQuestion(questionId);
      await apiService.deleteQuestion(questionId);
      
      // Refresh questions to get updated list
      await refreshQuestions();
      
      // Show success message
      console.log('Question deleted successfully');
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question. Please try again.');
    } finally {
      setDeletingQuestion(null);
    }
  };

  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)));

  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || q.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'votes':
          return (b.voteCount || 0) - (a.voteCount || 0);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        case 'answers':
          return (b.answerCount || 0) - (a.answerCount || 0);
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleQuestionClick = (questionId: string) => {
    onNavigate('question', questionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Sort questions by"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="votes">Most Votes</option>
            <option value="likes">Most Liked</option>
            <option value="answers">Most Answers</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
            title="Refresh questions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedTag ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tags
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                tag === selectedTag ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedTag 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Be the first to ask a question!'
                }
              </p>
            </div>
          ) : (
          filteredQuestions.map(question => (
            <div key={question._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex gap-4">
                <VoteButtons 
                  targetId={question._id} 
                  targetType="question" 
                  votes={question.voteCount || 0}
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 
                      onClick={() => handleQuestionClick(question._id)}
                      className="text-xl font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer line-clamp-2"
                    >
                      {question.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {question.acceptedAnswerId && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Solved
                        </span>
                      )}
                      {user && question.author._id === user._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question._id);
                          }}
                          disabled={deletingQuestion === question._id}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete question"
                        >
                          {deletingQuestion === question._id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {stripHtml(question.content)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm px-3 py-1 rounded-full cursor-pointer hover:from-indigo-200 hover:to-purple-200 transition-all duration-200"
                        onClick={() => setSelectedTag(tag)}
                      >
                        <TagIcon tag={tag} className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{question.answerCount || 0} answers</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{question.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>asked {formatDistanceToNow(new Date(question.createdAt))}</span>
                      </div>
                      <LikeButton 
                        targetId={question._id}
                        targetType="question"
                        likes={question.likes || 0}
                        likedBy={question.likedBy || []}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-amber-600">
                        <Award className="w-4 h-4" />
                        <span>{question.author.reputation || 0}</span>
                      </div>
                      <span className="font-medium text-gray-700">{question.author.username}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      )}
    </div>
  );
};

export default HomePage;