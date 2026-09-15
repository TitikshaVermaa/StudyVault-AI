const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
/**
 * Reads a PDF from a buffer or file path and extracts its text content.
 * @param {Buffer|string} input - The PDF buffer or file path.
 * @returns {Promise<string>} - The extracted text from the PDF.
 */
const extractTextFromPDF = async (input) => {
  try {
    let dataBuffer;

    if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else if (typeof input === 'string') {
      const absolutePath = path.isAbsolute(input)
        ? input
        : path.join(__dirname, '..', input);
      dataBuffer = fs.readFileSync(absolutePath);
    } else {
      throw new Error('Invalid input: expected a Buffer or file path string');
    }

    // Parse the PDF buffer to extract text
    const data = await pdfParse(dataBuffer);
    
    // Return the extracted text, trimming whitespace
    return data.text ? data.text.trim() : '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

module.exports = {
  extractTextFromPDF
};
