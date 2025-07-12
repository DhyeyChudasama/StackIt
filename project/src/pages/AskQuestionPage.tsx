import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import AIChat from '../components/AIChat';
import apiService from '../services/api';
import { testBackendConnection } from '../utils/testConnection';

interface AskQuestionPageProps {
  onNavigate: (page: string) => void;
}

const AskQuestionPage: React.FC<AskQuestionPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Test backend connection on component mount
  useEffect(() => {
    testBackendConnection();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 30) {
      newErrors.description = 'Description must be at least 30 characters long';
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onNavigate('login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.createQuestion({
        title: title.trim(),
        content: description,
        tags,
      });
      
      // Navigate to questions page after successful creation
      onNavigate('questions');
    } catch (error) {
      console.error('Error creating question:', error);
      setErrors({ submit: 'Failed to create question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to ask a question</h2>
        <button
          onClick={() => onNavigate('login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-600">
            Get help from the community by asking a clear, detailed question.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your programming question? Be specific."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Be specific and imagine you're asking a question to another person.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide details about your question. Include what you've tried and what you expect to happen."
              className={errors.description ? 'border-red-300' : ''}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Include all the information someone would need to answer your question.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add up to 5 tags to describe what your question is about"
              maxTags={5}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Add tags that describe the technologies, topics, or concepts in your question.
            </p>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onNavigate('questions')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting Question...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
      
      <div className="lg:col-span-1">
        <div className="sticky top-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
          <AIChat context={`Title: ${title}\nDescription: ${description}\nTags: ${tags.join(', ')}`} />
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;