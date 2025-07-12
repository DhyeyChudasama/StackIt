const express = require('express');
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
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

// Vote on question
router.post('/question/:questionId', authenticateToken, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const questionId = req.params.questionId;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const userId = req.user._id;
    const upvotes = question.votes.upvotes.map(v => v.user.toString());
    const downvotes = question.votes.downvotes.map(v => v.user.toString());

    let updated = false;

    if (voteType === 'upvote') {
      if (upvotes.includes(userId.toString())) {
        // Remove upvote
        question.votes.upvotes = question.votes.upvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      } else {
        // Add upvote and remove downvote if exists
        question.votes.upvotes.push({ user: userId });
        question.votes.downvotes = question.votes.downvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      }
      updated = true;
    } else if (voteType === 'downvote') {
      if (downvotes.includes(userId.toString())) {
        // Remove downvote
        question.votes.downvotes = question.votes.downvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      } else {
        // Add downvote and remove upvote if exists
        question.votes.downvotes.push({ user: userId });
        question.votes.upvotes = question.votes.upvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      }
      updated = true;
    }

    if (updated) {
      await question.save();
    }

    res.json({
      success: true,
      message: 'Vote updated successfully',
      question
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// Vote on answer
router.post('/answer/:answerId', authenticateToken, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const answerId = req.params.answerId;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const userId = req.user._id;
    const upvotes = answer.votes.upvotes.map(v => v.user.toString());
    const downvotes = answer.votes.downvotes.map(v => v.user.toString());

    let updated = false;

    if (voteType === 'upvote') {
      if (upvotes.includes(userId.toString())) {
        // Remove upvote
        answer.votes.upvotes = answer.votes.upvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      } else {
        // Add upvote and remove downvote if exists
        answer.votes.upvotes.push({ user: userId });
        answer.votes.downvotes = answer.votes.downvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      }
      updated = true;
    } else if (voteType === 'downvote') {
      if (downvotes.includes(userId.toString())) {
        // Remove downvote
        answer.votes.downvotes = answer.votes.downvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      } else {
        // Add downvote and remove upvote if exists
        answer.votes.downvotes.push({ user: userId });
        answer.votes.upvotes = answer.votes.upvotes.filter(
          v => v.user.toString() !== userId.toString()
        );
      }
      updated = true;
    }

    if (updated) {
      await answer.save();
    }

    res.json({
      success: true,
      message: 'Vote updated successfully',
      answer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

module.exports = router; 