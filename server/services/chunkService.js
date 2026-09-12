/**
 * Service to chunk text into smaller, overlapping segments.
 * This prepares the text for vector embeddings and RAG (Retrieval-Augmented Generation).
 */

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 200;

/**
 * Splits extracted text into chunks with a specified size and overlap.
 * 
 * @param {string} text - The raw text extracted from the PDF
 * @param {number} chunkSize - Maximum characters per chunk
 * @param {number} overlap - Number of characters to overlap with the previous chunk
 * @returns {Array} - Array of chunk objects { chunkNumber, text }
 */
const generateChunks = (text, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) => {
  if (!text || typeof text !== 'string') return [];

  // Remove unnecessary empty spaces and newlines for cleaner chunks
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length === 0) return [];

  const chunks = [];
  let startIndex = 0;
  let chunkNumber = 1;

  while (startIndex < cleanText.length) {
    // Determine the end index of the current chunk
    let endIndex = startIndex + chunkSize;
    
    // Extract the substring
    let chunkText = cleanText.substring(startIndex, endIndex);

    chunks.push({
      chunkNumber: chunkNumber++,
      text: chunkText
    });

    // Move start index forward, but step back by 'overlap' amount
    // If we've reached the end of the text, this will gracefully terminate the loop
    startIndex += (chunkSize - overlap);
  }

  return chunks;
};

module.exports = {
  generateChunks
};
