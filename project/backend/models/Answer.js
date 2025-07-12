const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  codeBlocks: [{
    language: String,
    code: String,
    description: String
  }],
  references: [{
    title: String,
    url: String,
    description: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ voteCount: -1, createdAt: -1 });

// Virtual for vote count calculation
answerSchema.virtual('totalVotes').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Pre-save middleware to update vote count
answerSchema.pre('save', function(next) {
  this.voteCount = this.upvotes.length - this.downvotes.length;
  next();
});

// Method to check if user has voted
answerSchema.methods.hasUserVoted = function(userId) {
  if (this.upvotes.includes(userId)) return 'upvote';
  if (this.downvotes.includes(userId)) return 'downvote';
  return null;
};

// Method to check if user has liked
answerSchema.methods.hasUserLiked = function(userId) {
  return this.likedBy.includes(userId);
};

// Method to add vote
answerSchema.methods.addVote = function(userId, voteType) {
  // Remove existing votes
  this.upvotes = this.upvotes.filter(id => id.toString() !== userId.toString());
  this.downvotes = this.downvotes.filter(id => id.toString() !== userId.toString());
  
  // Add new vote
  if (voteType === 'upvote') {
    this.upvotes.push(userId);
  } else if (voteType === 'downvote') {
    this.downvotes.push(userId);
  }
  
  this.voteCount = this.upvotes.length - this.downvotes.length;
  return this.save();
};

// Method to toggle like
answerSchema.methods.toggleLike = function(userId) {
  const isLiked = this.likedBy.includes(userId);
  
  if (isLiked) {
    this.likedBy = this.likedBy.filter(id => id.toString() !== userId.toString());
    this.likes = Math.max(0, this.likes - 1);
  } else {
    this.likedBy.push(userId);
    this.likes += 1;
  }
  
  return this.save();
};

module.exports = mongoose.model('Answer', answerSchema); 