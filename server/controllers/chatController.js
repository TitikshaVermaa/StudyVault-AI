const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Document = require('../models/Document');
const embeddingService = require('../services/embeddingService');
const searchService = require('../services/searchService');
const aiService = require('../services/aiService');

// @route   POST /api/chat/ask
// @desc    Ask a question based on a document's content (RAG pipeline)
exports.askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ message: 'Document ID and question are required' });
    }

    // 1. Fetch the document and verify ownership
    const document = await Document.findOne({ _id: documentId, userId: req.user.id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    if (!document.chunks || document.chunks.length === 0) {
      return res.status(400).json({ message: 'This document has no extracted text or chunks to search.' });
    }

    // 2. Generate question embedding
    let questionEmbedding;
    try {
      questionEmbedding = await embeddingService.generateEmbedding(question);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to generate embedding for your question.' });
    }

    // 3. Perform similarity search to find top chunks
    const relevantChunks = searchService.findRelevantChunks(questionEmbedding, document.chunks, 3);

    // 4. Send context + question to Gemini
    let answer;
    try {
      answer = await aiService.generateAnswer(question, relevantChunks);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to generate an answer from the AI service.' });
    }

    // 5. Save chat history
    const newChat = new Chat({
      userId: req.user.id,
      documentId: documentId,
      question: question,
      answer: answer
    });
    await newChat.save();

    // 6. Return answer and sources (for transparency)
    res.status(200).json({
      answer: answer,
      sources: relevantChunks.map(c => ({ chunkNumber: c.chunkNumber, score: c.score }))
    });

  } catch (error) {
    console.error('Chat Error:', error.message);
    res.status(500).json({ message: 'Server error during question processing' });
  }
};

// @route   GET /api/chat/history/:documentId
// @desc    Fetch previous chats for a document
exports.getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(200).json([]);
    }

    // Only return chats belonging to logged-in user and for this specific document
    const chats = await Chat.find({ documentId, userId: req.user.id })
                            .sort({ createdAt: -1 });

    res.status(200).json(chats || []);
  } catch (error) {
    console.error('Chat History Error:', error);
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
};

