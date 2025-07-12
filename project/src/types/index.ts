export interface User {
  _id: string;
  username: string;
  email: string;
  reputation: number;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  views: number;
  likes: number;
  likedBy: string[];
  upvotes: string[];
  downvotes: string[];
  voteCount: number;
  answers: Answer[];
  isAnswered: boolean;
  acceptedAnswer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  _id: string;
  content: string;
  author: User;
  question: string;
  isAccepted: boolean;
  acceptedAt?: string;
  acceptedBy?: User;
  upvotes: string[];
  downvotes: string[];
  voteCount: number;
  likes: number;
  likedBy: string[];
  images: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  codeBlocks: Array<{
    language: string;
    code: string;
    description?: string;
  }>;
  references: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  question?: string;
  answer?: string;
  targetId: string;
  targetType: 'question' | 'answer';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: 'question_vote' | 'answer_vote' | 'comment_vote' | 'new_answer' | 'new_comment' | 'answer_accepted' | 'bounty_awarded' | 'mention' | 'question_like' | 'answer_like' | 'comment_like';
  title: string;
  message: string;
  relatedQuestion?: string;
  relatedAnswer?: string;
  relatedComment?: string;
  fromUser?: User;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  _id: string;
  user: string;
  targetType: 'question' | 'answer' | 'comment';
  targetId: string;
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}