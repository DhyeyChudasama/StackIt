const express = require('express');
const jwt = require('jsonwebtoken');
const Answer = require('../models/Answer');
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
      case 'new_answer':
        title = 'New Answer';
        message = `${fromUser.username} answered your question`;
        break;
      case 'answer_like':
        title = 'Answer Liked';
        message = `${fromUser.username} liked your answer`;
        break;
      case 'answer_vote':
        title = 'Answer Voted';
        message = `${fromUser.username} voted on your answer`;
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

// Get answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'voteCount' } = req.query;
    
    const answers = await Answer.find({ question: req.params.questionId })
      .populate('author', 'username reputation avatar')
      .sort({ [sort]: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Answer.countDocuments({ question: req.params.questionId });

    res.json({
      success: true,
      answers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get answers' });
  }
});

// Create answer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, questionId, images, codeBlocks, references } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user already answered this question
    const existingAnswer = await Answer.findOne({
      question: questionId,
      author: req.user._id
    });

    if (existingAnswer) {
      return res.status(400).json({ error: 'You have already answered this question' });
    }

    const answer = new Answer({
      content,
      author: req.user._id,
      question: questionId,
      images: images || [],
      codeBlocks: codeBlocks || [],
      references: references || []
    });

    await answer.save();

    // Populate author info
    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      await createNotification(
        'new_answer',
        question.author,
        req.user._id,
        questionId,
        answer._id
      );
    }

    // Send real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new-answer', {
        questionId,
        answer: populatedAnswer
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

// Update answer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { content, images, codeBlocks, references } = req.body;
    const updates = {};

    if (content) updates.content = content;
    if (images) updates.images = images;
    if (codeBlocks) updates.codeBlocks = codeBlocks;
    if (references) updates.references = references;

    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username reputation avatar');

    res.json({
      success: true,
      message: 'Answer updated successfully',
      answer: updatedAnswer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

// Delete answer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// Accept answer
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const question = await Question.findById(answer.question);

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only question author can accept answers' });
    }

    // Unaccept any previously accepted answers
    await Answer.updateMany(
      { question: answer.question, isAccepted: true },
      { isAccepted: false, acceptedAt: null, acceptedBy: null }
    );

    // Accept this answer
    answer.isAccepted = true;
    answer.acceptedAt = new Date();
    answer.acceptedBy = req.user._id;
    await answer.save();

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    // Create notification for answer author
    if (answer.author.toString() !== req.user._id.toString()) {
      await createNotification(
        'answer_accepted',
        answer.author,
        req.user._id,
        answer.question,
        answer._id
      );
    }

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept answer' });
  }
});

// Like/Unlike answer
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const isLiked = answer.hasUserLiked(req.user._id);
    await answer.toggleLike(req.user._id);

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    // Create notification for answer author if liking
    if (!isLiked && answer.author.toString() !== req.user._id.toString()) {
      await createNotification(
        'answer_like',
        answer.author,
        req.user._id,
        answer.question,
        answer._id
      );
    }

    res.json({
      success: true,
      message: isLiked ? 'Answer unliked' : 'Answer liked',
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like/unlike answer' });
  }
});

module.exports = router; 