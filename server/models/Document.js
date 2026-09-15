const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: false,
    default: ''
  },
  extractedText: {
    type: String,
    default: ''
  },
  chunks: [
    {
      chunkNumber: Number,
      text: String,
      embedding: [Number]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
