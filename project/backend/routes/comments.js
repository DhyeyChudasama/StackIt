const express = require('express');
const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to create notification
const createNotification = async (type, recipientId, fromUserId, relatedQuestion, relatedAnswer = null, relatedComment = null) => {
  try {
    const fromUser = await User.findById(fromUserId);
    let title, message;

    switch (type) {
      case 'new_comment':
        title = 'New Comment';
        message = `${fromUser.username} commented on your ${relatedAnswer ? 'answer' : 'question'}`;
        break;
      case 'comment_like':
        title = 'Comment Liked';
        message = `${fromUser.username} liked your comment`;
        break;
      default:
        title = 'Notification';
        message = 'You have a new notification';
    }

    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      fromUser: fromUserId,
      relatedQuestion,
      relatedAnswer,
      relatedComment
    });

    await notification.save();

    // Send real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${recipientId}`).emit('notification', {
        type: 'new',
        notification
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get comments
router.get('/', async (req, res) => {
  try {
    const { questionId, answerId, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (questionId) query.question = questionId;
    if (answerId) query.answer = answerId;

    const comments = await Comment.find(query)
      .populate('author', 'username reputation avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Create comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, questionId, answerId } = req.body;

    if (!questionId && !answerId) {
      return res.status(400).json({ error: 'Either questionId or answerId is required' });
    }

    let targetAuthor = null;
    let relatedQuestion = questionId;

    if (answerId) {
      const answer = await Answer.findById(answerId);
      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }
      targetAuthor = answer.author;
      relatedQuestion = answer.question;
    } else if (questionId) {
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      targetAuthor = question.author;
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      question: questionId,
      answer: answerId
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username reputation avatar');

    // Create notification for target author
    if (targetAuthor && targetAuthor.toString() !== req.user._id.toString()) {
      await createNotification(
        'new_comment',
        targetAuthor,
        req.user._id,
        relatedQuestion,
        answerId,
        comment._id
      );
    }

    // Send real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new-comment', {
        questionId: relatedQuestion,
        answerId,
        comment: populatedComment
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment: populatedComment
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { content } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true, runValidators: true }
    ).populate('author', 'username reputation avatar');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router; 