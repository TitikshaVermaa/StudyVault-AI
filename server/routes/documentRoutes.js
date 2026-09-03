const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// @route   POST /api/documents/upload
// @desc    Upload a PDF document
// @access  Private
// We chain authMiddleware (to verify user) and uploadMiddleware.single('pdf') (to handle the file)
router.post('/upload', authMiddleware, uploadMiddleware.single('pdf'), documentController.uploadDocument);

// @route   GET /api/documents
// @desc    Get all documents for user
// @access  Private
router.get('/', authMiddleware, documentController.getDocuments);

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', authMiddleware, documentController.deleteDocument);

module.exports = router;
