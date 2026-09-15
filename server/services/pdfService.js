const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
/**
 * Reads a PDF file from the given path and extracts its text content.
 * @param {string} filePath - The path to the uploaded PDF file.
 * @returns {Promise<string>} - The extracted text from the PDF.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Read the PDF file into a buffer
    const absolutePath = path.isAbsolute(filePath)
  ? filePath
  : path.join(__dirname, '..', filePath);

const dataBuffer = fs.readFileSync(absolutePath);
    
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
