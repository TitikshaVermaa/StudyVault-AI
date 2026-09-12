const { GoogleGenAI } = require("@google/genai");

let ai;

try {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
} catch (error) {
  console.error("Embedding Error:");
  console.error(error);

  throw new Error("Failed to generate embedding from Gemini API");
}
/**
 * Generates vector embeddings for a given text using the Gemini API.
 * 
 * @param {string} text - The chunk of text to embed
 * @returns {Promise<number[]>} - An array of numbers representing the embedding vector
 */
const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input for embedding');
  }
  
  if (!ai) {
    throw new Error('Gemini API is not configured. Missing GEMINI_API_KEY.');
  }

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });

    // The Gemini API returns an array of embeddings. 
    // Since we sent a single string, we grab the first embedding's values.
    return response.embeddings[0].values;
  } catch (error) {
  console.error("========== EMBEDDING ERROR ==========");
  console.error(error);
  console.error("=====================================");

  throw error;
}
};

module.exports = {
  generateEmbedding
};
