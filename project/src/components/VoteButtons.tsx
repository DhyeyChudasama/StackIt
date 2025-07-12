import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

interface VoteButtonsProps {
  targetId: string;
  targetType: 'question' | 'answer';
  votes: number;
  className?: string;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ targetId, targetType, votes, className = '' }) => {
  const { user } = useAuth();
  const { voteOnQuestion, voteOnAnswer } = useApp();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) return;
    
    try {
      if (targetType === 'question') {
        await voteOnQuestion(targetId, user._id, voteType);
      } else {
        await voteOnAnswer(targetId, user._id, voteType);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (!user) {
    return (
      <div className={`flex flex-col items-center space-y-1 ${className}`}>
        <button
          disabled
          className="p-1 text-gray-400 cursor-not-allowed"
          title="Login to vote"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <span className="text-lg font-medium text-gray-600">{votes}</span>
        <button
          disabled
          className="p-1 text-gray-400 cursor-not-allowed"
          title="Login to vote"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-1 ${className}`}>
      <button
        onClick={() => handleVote('upvote')}
        className="p-1 rounded transition-colors text-gray-500 hover:text-green-600 hover:bg-green-50"
        title="Upvote"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
      <span className={`text-lg font-medium ${
        votes > 0 ? 'text-green-600' : votes < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {votes}
      </span>
      <button
        onClick={() => handleVote('downvote')}
        className="p-1 rounded transition-colors text-gray-500 hover:text-red-600 hover:bg-red-50"
        title="Downvote"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
};

export default VoteButtons;