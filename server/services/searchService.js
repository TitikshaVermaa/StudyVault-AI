/**
 * Simple Cosine Similarity function to compare two vectors.
 * Formula: (A dot B) / (magnitude(A) * magnitude(B))
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Searches for the most relevant document chunks based on a query embedding.
 * 
 * @param {Array<Number>} queryEmbedding - The vector of the user's question
 * @param {Array<Object>} chunks - Array of chunk objects from MongoDB (must have .embedding)
 * @param {Number} topK - How many chunks to return
 * @returns {Array<Object>} - The top K most relevant chunks with their similarity score
 */
const findRelevantChunks = (queryEmbedding, chunks, topK = 3) => {
  if (!queryEmbedding || !chunks || chunks.length === 0) return [];

  // Calculate similarity for each chunk
  const scoredChunks = chunks
    .filter(chunk => chunk.embedding && chunk.embedding.length > 0) // only chunks that have embeddings
    .map(chunk => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        text: chunk.text,
        chunkNumber: chunk.chunkNumber,
        score: score
      };
    });

  // Sort chunks by highest score (descending)
  scoredChunks.sort((a, b) => b.score - a.score);

  // Return only the top K chunks
  return scoredChunks.slice(0, topK);
};

module.exports = {
  cosineSimilarity,
  findRelevantChunks
};
