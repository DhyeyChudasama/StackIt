import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';

interface LikeButtonProps {
  targetId: string;
  targetType: 'question' | 'answer';
  likes: number;
  likedBy: string[];
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ targetId, targetType, likes, likedBy = [], className = '' }) => {
  const { user } = useAuth();

  const isLiked = user ? likedBy.includes(user._id) : false;

  const handleLike = async () => {
    if (!user) return;
    try {
      if (targetType === 'question') {
        await apiService.likeQuestion(targetId);
      } else {
        await apiService.likeAnswer(targetId);
      }
      // Refresh the page or update the state
      window.location.reload();
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  if (!user) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <button
          disabled
          className="p-1 text-gray-400 cursor-not-allowed"
          title="Login to like"
        >
          <Heart className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-500">{likes}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={handleLike}
        className={`p-1 rounded-full transition-all duration-200 ${
          isLiked
            ? 'text-red-500 bg-red-50 hover:bg-red-100'
            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
        }`}
        title={isLiked ? 'Unlike' : 'Like'}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      </button>
      <span className={`text-sm font-medium ${likes > 0 ? 'text-red-500' : 'text-gray-500'}`}>
        {likes}
      </span>
    </div>
  );
};

export default LikeButton;