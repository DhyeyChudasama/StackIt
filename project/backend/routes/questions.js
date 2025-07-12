const express = require('express');
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
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
      case 'question_like':
        title = 'Question Liked';
        message = `${fromUser.username} liked your question`;
        break;
      case 'question_vote':
        title = 'Question Voted';
        message = `${fromUser.username} voted on your question`;
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

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }

    const questions = await Question.find(query)
      .populate('author', 'username reputation avatar')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username reputation avatar')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username reputation avatar'
        }
      });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Increment views
    question.views += 1;
    await question.save();

    res.json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get question' });
  }
});

// Create question
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const question = new Question({
      title,
      content,
      tags: tags || [],
      author: req.user._id
    });

    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation avatar');

    // Send real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new-question', {
        question: populatedQuestion
      });
    }

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, content, tags } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (content) updates.content = content;
    if (tags) updates.tags = tags;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username reputation avatar');

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Like/Unlike question
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const userId = req.user._id;
    const isLiked = question.likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      question.likedBy = question.likedBy.filter(id => id.toString() !== userId.toString());
      question.likes = Math.max(0, question.likes - 1);
    } else {
      // Like
      question.likedBy.push(userId);
      question.likes += 1;
    }

    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation avatar');

    // Create notification for question author if liking
    if (!isLiked && question.author.toString() !== req.user._id.toString()) {
      await createNotification(
        'question_like',
        question.author,
        req.user._id,
        question._id
      );
    }

    res.json({
      success: true,
      message: isLiked ? 'Question unliked' : 'Question liked',
      question: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like/unlike question' });
  }
});

module.exports = router; 