import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import apiService from '../services/api';

interface CommentSectionProps {
  targetId: string;
  targetType: 'question' | 'answer';
  className?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ targetId, targetType, className = '' }) => {
  const { user } = useAuth();
  const { addComment, socket, refreshComments } = useApp();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comments for this target
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const params = targetType === 'question' 
          ? { questionId: targetId }
          : { answerId: targetId };
        
        const response = await apiService.getComments(params);
        setComments(response.comments || []);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (showComments) {
      fetchComments();
    }
  }, [targetId, targetType, showComments]);

  // Listen for real-time comment updates
  useEffect(() => {
    if (!socket) return;

    socket.on('new-comment', ({ questionId, answerId, comment }: { questionId?: string; answerId?: string; comment: any }) => {
      const isRelevantComment = 
        (targetType === 'question' && questionId === targetId) ||
        (targetType === 'answer' && answerId === targetId);
      
      if (isRelevantComment) {
        setComments(prev => [comment, ...prev]);
      }
    });

    return () => {
      socket.off('new-comment');
    };
  }, [socket, targetId, targetType]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const commentData = {
        content: newComment.trim(),
        questionId: targetType === 'question' ? targetId : undefined,
        answerId: targetType === 'answer' ? targetId : undefined,
      };

      await addComment({
        content: newComment.trim(),
        targetId,
        targetType,
        author: user,
      });
      
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`border-t border-gray-100 pt-3 ${className}`}>
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors mb-3"
      >
        <MessageCircle className="w-4 h-4" />
        <span>
          {comments.length === 0 
            ? 'Add comment' 
            : `${comments.length} comment${comments.length === 1 ? '' : 's'}`
          }
        </span>
      </button>

      {showComments && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : (
            <>
              {/* Existing Comments */}
              {comments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{comment.author?.username || 'Unknown User'}</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 italic">Please sign in to add comments.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;