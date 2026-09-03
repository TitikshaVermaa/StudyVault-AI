const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/chat/ask
// @desc    Ask a question against a document
// @access  Private
router.post('/ask', authMiddleware, chatController.askQuestion);

// @route   GET /api/chat/history/:documentId
// @desc    Get chat history for a document
// @access  Private
router.get('/history/:documentId', authMiddleware, chatController.getChatHistory);

module.exports = router;
