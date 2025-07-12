import React, { useState, useEffect } from 'react';
import { Clock, Check, MessageSquare, Eye, Award, Image as ImageIcon, Code, Link } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import VoteButtons from '../components/VoteButtons';
import RichTextEditor from '../components/RichTextEditor';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import TagIcon from '../components/TagIcon';
import ImageUpload from '../components/ImageUpload';
import apiService from '../services/api';

interface QuestionDetailPageProps {
  questionId: string;
  onNavigate: (page: string) => void;
}

const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ questionId, onNavigate }) => {
  const { user } = useAuth();
  const { addAnswer, socket } = useApp();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [answerImages, setAnswerImages] = useState<Array<{ url: string; publicId: string; caption?: string }>>([]);
  const [answerCodeBlocks, setAnswerCodeBlocks] = useState<Array<{ language: string; code: string; description?: string }>>([]);
  const [answerReferences, setAnswerReferences] = useState<Array<{ title: string; url: string; description?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Fetch question and answers from API
  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        const [questionResponse, answersResponse] = await Promise.all([
          apiService.getQuestionById(questionId),
          apiService.getAnswersForQuestion(questionId)
        ]);
        
        setQuestion(questionResponse.question);
        setAnswers(answersResponse.answers || []);
      } catch (error) {
        console.error('Failed to fetch question data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestionData();
    }
  }, [questionId]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('new-answer', ({ questionId: newQuestionId, answer }: { questionId: string; answer: any }) => {
      if (newQuestionId === questionId) {
        setAnswers(prev => [answer, ...prev]);
      }
    });

    return () => {
      socket.off('new-answer');
    };
  }, [socket, questionId]);

  // Refresh function to update data
  const refreshData = async () => {
    try {
      const [questionResponse, answersResponse] = await Promise.all([
        apiService.getQuestionById(questionId),
        apiService.getAnswersForQuestion(questionId)
      ]);
      
      setQuestion(questionResponse.question);
      setAnswers(answersResponse.answers || []);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
        <button
          onClick={() => onNavigate('questions')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to questions
        </button>
      </div>
    );
  }

  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return (b.voteCount || 0) - (a.voteCount || 0);
  });

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onNavigate('login');
      return;
    }

    if (!answerContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addAnswer({
        content: answerContent,
        question: question._id,
        author: user,
        images: answerImages,
        codeBlocks: answerCodeBlocks,
        references: answerReferences
      });
      
      setAnswerContent('');
      setAnswerImages([]);
      setAnswerCodeBlocks([]);
      setAnswerReferences([]);
      setShowAdvancedOptions(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || user._id !== question.author._id) return;

    try {
      await apiService.acceptAnswer(answerId);
      await refreshData();
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const addCodeBlock = () => {
    setAnswerCodeBlocks(prev => [...prev, { language: 'javascript', code: '', description: '' }]);
  };

  const updateCodeBlock = (index: number, field: 'language' | 'code' | 'description', value: string) => {
    setAnswerCodeBlocks(prev => prev.map((block, i) => 
      i === index ? { ...block, [field]: value } : block
    ));
  };

  const removeCodeBlock = (index: number) => {
    setAnswerCodeBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const addReference = () => {
    setAnswerReferences(prev => [...prev, { title: '', url: '', description: '' }]);
  };

  const updateReference = (index: number, field: 'title' | 'url' | 'description', value: string) => {
    setAnswerReferences(prev => prev.map((ref, i) => 
      i === index ? { ...ref, [field]: value } : ref
    ));
  };

  const removeReference = (index: number) => {
    setAnswerReferences(prev => prev.filter((_, i) => i !== index));
  };

  const renderAnswerContent = (answer: any) => (
    <div className="space-y-4">
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: answer.content }}
      />
      
      {/* Images */}
      {answer.images && answer.images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Images</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {answer.images.map((image: any, index: number) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                {image.caption && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Blocks */}
      {answer.codeBlocks && answer.codeBlocks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Code Examples</h4>
          {answer.codeBlocks.map((block: any, index: number) => (
            <div key={index} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{block.language}</span>
                {block.description && (
                  <span className="text-xs text-gray-400">{block.description}</span>
                )}
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{block.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* References */}
      {answer.references && answer.references.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">References</h4>
          <div className="space-y-2">
            {answer.references.map((ref: any, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <a 
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {ref.title}
                </a>
                {ref.description && (
                  <p className="text-sm text-gray-600 mt-1">{ref.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex gap-4">
          <VoteButtons 
            targetId={question._id} 
            targetType="question" 
            votes={question.voteCount || 0}
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 pr-4">{question.title}</h1>
              {question.acceptedAnswer && (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex-shrink-0">
                  Solved
                </span>
              )}
            </div>
            
            <div 
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />
            
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm px-3 py-1 rounded-full"
                >
                  <TagIcon tag={tag} className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>asked {formatDistanceToNow(new Date(question.createdAt))}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} views</span>
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
                <span className="font-medium">{question.author.username}</span>
              </div>
            </div>
          </div>
        </div>
        
        <CommentSection targetId={question._id} targetType="question" />
      </div>

      {/* Answers Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {sortedAnswers.length} Answer{sortedAnswers.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {sortedAnswers.map(answer => (
          <div key={answer._id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex flex-col items-center space-y-2">
                <VoteButtons 
                  targetId={answer._id} 
                  targetType="answer" 
                  votes={answer.voteCount || 0}
                />
                
                {user && user._id === question.author._id && !question.acceptedAnswer && (
                  <button
                    onClick={() => handleAcceptAnswer(answer._id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Accept this answer"
                  >
                    <Check className="w-6 h-6" />
                  </button>
                )}
                
                {answer.isAccepted && (
                  <div className="p-2 text-green-600 bg-green-100 rounded">
                    <Check className="w-6 h-6" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                {renderAnswerContent(answer)}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>answered {formatDistanceToNow(new Date(answer.createdAt))}</span>
                    </div>
                    <LikeButton 
                      targetId={answer._id}
                      targetType="answer"
                      likes={answer.likes || 0}
                      likedBy={answer.likedBy || []}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm text-amber-600">
                      <Award className="w-4 h-4" />
                      <span>{answer.author.reputation || 0}</span>
                    </div>
                    <span className="font-medium">{answer.author.username}</span>
                  </div>
                </div>
                
                <CommentSection targetId={answer._id} targetType="answer" />
              </div>
            </div>
          </div>
        ))}

        {/* Answer Form */}
        {user && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                className="mb-4"
              />

              {/* Advanced Options Toggle */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <span>Advanced Options</span>
                  <span className={`transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="space-y-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  {/* Image Upload */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Images
                    </h4>
                    <ImageUpload
                      images={answerImages}
                      onImagesChange={setAnswerImages}
                      maxImages={5}
                    />
                  </div>

                  {/* Code Blocks */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      Code Examples
                    </h4>
                    <div className="space-y-3">
                      {answerCodeBlocks.map((block, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Language (e.g., javascript)"
                              value={block.language}
                              onChange={(e) => updateCodeBlock(index, 'language', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Description (optional)"
                              value={block.description}
                              onChange={(e) => updateCodeBlock(index, 'description', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                          <textarea
                            placeholder="Enter your code here..."
                            value={block.code}
                            onChange={(e) => updateCodeBlock(index, 'code', e.target.value)}
                            className="w-full h-32 px-2 py-1 text-sm border border-gray-300 rounded font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => removeCodeBlock(index)}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addCodeBlock}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add Code Block
                      </button>
                    </div>
                  </div>

                  {/* References */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Link className="w-4 h-4 mr-2" />
                      References
                    </h4>
                    <div className="space-y-3">
                      {answerReferences.map((ref, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <input
                            type="text"
                            placeholder="Title"
                            value={ref.title}
                            onChange={(e) => updateReference(index, 'title', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                          />
                          <input
                            type="url"
                            placeholder="URL"
                            value={ref.url}
                            onChange={(e) => updateReference(index, 'url', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                          />
                          <input
                            type="text"
                            placeholder="Description (optional)"
                            value={ref.description}
                            onChange={(e) => updateReference(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeReference(index)}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addReference}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add Reference
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !answerContent.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!user && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please sign in to answer this question.</p>
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;