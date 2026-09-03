const Document = require('../models/Document');
const pdfService = require('../services/pdfService');
const chunkService = require('../services/chunkService');
const embeddingService = require('../services/embeddingService');
const path = require('path');

// @route   POST /api/documents/upload
// @desc    Upload a PDF document, extract text, chunk it, and generate embeddings
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    let extractedText = '';
    let chunks = [];
    let warningMessage = null;

    // 1. Extract text from the uploaded PDF
    try {
      extractedText = await pdfService.extractTextFromPDF(req.file.path);
      
      if (!extractedText || extractedText.length === 0) {
        warningMessage = 'Document uploaded successfully, but no readable text could be extracted.';
      }
    } catch (extractionError) {
      warningMessage = 'Document uploaded successfully, but text extraction failed.';
    }

    // 2. Generate chunks if text was successfully extracted
    if (extractedText) {
      try {
        chunks = chunkService.generateChunks(extractedText);
      } catch (chunkError) {
        console.error('Chunking Error:', chunkError.message);
        warningMessage = 'Document uploaded and text extracted, but chunking failed.';
        chunks = []; // Do not crash the server, just save empty chunks
      }
    }

    // 3. Generate Embeddings for each chunk sequentially
    if (chunks.length > 0) {
      try {
        for (let i = 0; i < chunks.length; i++) {
          const vector = await embeddingService.generateEmbedding(chunks[i].text);
          chunks[i].embedding = vector;
        }
      } catch (embeddingError) {
        console.error('Embedding Error:', embeddingError.message);
        warningMessage = 'Document uploaded and chunked, but generating embeddings failed.';
        // Keep chunks but leave embeddings empty or unassigned as per error handling rules
      }
    }

    // 4. Save document info, extracted text, and chunks (with embeddings) to MongoDB
    const newDocument = new Document({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: filePath,
      extractedText: extractedText,
      chunks: chunks
    });

    await newDocument.save();

    res.status(201).json({ 
      message: warningMessage || 'Document uploaded, text extracted, chunks and embeddings generated successfully', 
      document: newDocument 
    });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

// @route   GET /api/documents
// @desc    Get all documents for the logged in user
exports.getDocuments = async (req, res) => {
  try {
    // Find documents belonging only to this user
    const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Fetch Documents Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching documents' });
  }
};

const fs = require('fs');

// @route   DELETE /api/documents/:id
// @desc    Delete a document by ID
exports.deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;

    // 1. Find the document and verify ownership
    const document = await Document.findOne({ _id: documentId, userId: req.user.id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    // 2. Delete PDF file from uploads folder
    const fullPath = path.join(__dirname, '..', document.filePath);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (fsError) {
      console.warn('Could not delete file from filesystem:', fsError.message);
    }

    // 3. Delete MongoDB document
    await Document.deleteOne({ _id: documentId });

    // 4. Delete associated chat history to keep DB clean (Optional but good practice)
    const Chat = require('../models/Chat');
    await Chat.deleteMany({ documentId: documentId });

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error.message);
    res.status(500).json({ message: 'Server error deleting document' });
  }
};
