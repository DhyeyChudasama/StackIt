import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Question, Answer, Notification, Vote, Comment } from '../types';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

interface AppContextType {
  questions: Question[];
  notifications: Notification[];
  votes: Vote[];
  comments: Comment[];
  socket: Socket | null;
  addQuestion: (question: Omit<Question, '_id' | 'createdAt' | 'updatedAt' | 'voteCount' | 'answers' | 'views' | 'likes' | 'likedBy' | 'upvotes' | 'downvotes' | 'isAnswered' | 'acceptedAnswer'>) => void;
  addAnswer: (answer: Omit<Answer, '_id' | 'createdAt' | 'updatedAt' | 'voteCount' | 'isAccepted' | 'acceptedAt' | 'acceptedBy' | 'upvotes' | 'downvotes' | 'likes' | 'likedBy'>) => void;
  addComment: (comment: Omit<Comment, '_id' | 'createdAt' | 'updatedAt'>) => void;
  voteOnQuestion: (questionId: string, userId: string, voteType: 'upvote' | 'downvote') => void;
  voteOnAnswer: (answerId: string, userId: string, voteType: 'upvote' | 'downvote') => void;
  likeQuestion: (questionId: string, userId: string) => void;
  likeAnswer: (answerId: string, userId: string) => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotificationsCount: (userId: string) => number;
  incrementQuestionViews: (questionId: string) => void;
  updateUserReputation: (userId: string, points: number) => void;
  refreshQuestions: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshComments: (questionId?: string, answerId?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join user room when user changes
  useEffect(() => {
    if (socket && user) {
      socket.emit('join-user', user._id);
    }
  }, [socket, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new questions
    socket.on('new-question', ({ question }: { question: Question }) => {
      setQuestions(prev => [question, ...prev]);
    });

    // Listen for new answers
    socket.on('new-answer', ({ questionId, answer }: { questionId: string; answer: Answer }) => {
      setQuestions(prev => prev.map(q => 
        q._id === questionId 
          ? { ...q, answers: [...q.answers, answer] }
          : q
      ));
    });

    // Listen for new comments
    socket.on('new-comment', ({ questionId, answerId, comment }: { questionId?: string; answerId?: string; comment: Comment }) => {
      setComments(prev => [comment, ...prev]);
    });

    // Listen for notifications
    socket.on('notification', ({ type, notification }: { type: string; notification: Notification }) => {
      if (type === 'new') {
        setNotifications(prev => [notification, ...prev]);
      }
    });

    return () => {
      socket.off('new-question');
      socket.off('new-answer');
      socket.off('new-comment');
      socket.off('notification');
    };
  }, [socket]);

  // Load initial data
  useEffect(() => {
    refreshQuestions();
    refreshNotifications();
  }, []);

  const refreshQuestions = async () => {
    try {
      const response = await apiService.getQuestions();
      setQuestions(response.questions || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
    }
  };

  const refreshNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  const refreshComments = async (questionId?: string, answerId?: string) => {
    try {
      const response = await apiService.getComments({ questionId, answerId });
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const addQuestion = async (questionData: Omit<Question, '_id' | 'createdAt' | 'updatedAt' | 'voteCount' | 'answers' | 'views' | 'likes' | 'likedBy' | 'upvotes' | 'downvotes' | 'isAnswered' | 'acceptedAnswer'>) => {
    try {
      const response = await apiService.createQuestion({
        title: questionData.title,
        content: questionData.content,
        tags: questionData.tags
      });
      
      if (response.question) {
        setQuestions(prev => [response.question, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error;
    }
  };

  const addAnswer = async (answerData: Omit<Answer, '_id' | 'createdAt' | 'updatedAt' | 'voteCount' | 'isAccepted' | 'acceptedAt' | 'acceptedBy' | 'upvotes' | 'downvotes' | 'likes' | 'likedBy'>) => {
    try {
      const response = await apiService.createAnswer({
        content: answerData.content,
        questionId: answerData.question,
        images: answerData.images,
        codeBlocks: answerData.codeBlocks,
        references: answerData.references
      });
      
      if (response.answer) {
        setQuestions(prev => prev.map(q => 
          q._id === answerData.question 
            ? { ...q, answers: [...q.answers, response.answer] }
            : q
        ));
      }
    } catch (error) {
      console.error('Failed to create answer:', error);
      throw error;
    }
  };

  const addComment = async (commentData: Omit<Comment, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createComment({
        content: commentData.content,
        questionId: commentData.targetType === 'question' ? commentData.targetId : undefined,
        answerId: commentData.targetType === 'answer' ? commentData.targetId : undefined
      });
      
      if (response.comment) {
        setComments(prev => [response.comment, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  };

  const voteOnQuestion = async (questionId: string, userId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await apiService.voteOnQuestion(questionId, voteType);
      await refreshQuestions();
    } catch (error) {
      console.error('Failed to vote on question:', error);
      throw error;
    }
  };

  const voteOnAnswer = async (answerId: string, userId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await apiService.voteOnAnswer(answerId, voteType);
      await refreshQuestions();
    } catch (error) {
      console.error('Failed to vote on answer:', error);
      throw error;
    }
  };

  const likeQuestion = async (questionId: string, userId: string) => {
    try {
      await apiService.likeQuestion(questionId);
      await refreshQuestions();
    } catch (error) {
      console.error('Failed to like question:', error);
      throw error;
    }
  };

  const likeAnswer = async (answerId: string, userId: string) => {
    try {
      await apiService.likeAnswer(answerId);
      await refreshQuestions();
    } catch (error) {
      console.error('Failed to like answer:', error);
      throw error;
    }
  };

  const acceptAnswer = async (questionId: string, answerId: string) => {
    try {
      await apiService.acceptAnswer(answerId);
      await refreshQuestions();
    } catch (error) {
      console.error('Failed to accept answer:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  const getUnreadNotificationsCount = (userId: string) => {
    return notifications.filter(n => n.recipient === userId && !n.isRead).length;
  };

  const incrementQuestionViews = async (questionId: string) => {
    // This is handled automatically by the backend when fetching a question
    // No need to implement here
  };

  const updateUserReputation = async (userId: string, points: number) => {
    // This would typically be handled by the backend
    // For now, we'll just log it
    console.log(`User ${userId} earned ${points} reputation points`);
  };

  return (
    <AppContext.Provider value={{
      questions,
      notifications,
      votes,
      comments,
      socket,
      addQuestion,
      addAnswer,
      addComment,
      voteOnQuestion,
      voteOnAnswer,
      likeQuestion,
      likeAnswer,
      acceptAnswer,
      markNotificationAsRead,
      getUnreadNotificationsCount,
      incrementQuestionViews,
      updateUserReputation,
      refreshQuestions,
      refreshNotifications,
      refreshComments,
    }}>
      {children}
    </AppContext.Provider>
  );
};