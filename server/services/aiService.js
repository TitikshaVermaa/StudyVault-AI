const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Sends the retrieved context and user question to Gemini to generate an answer.
 * 
 * @param {string} question - The user's question
 * @param {Array<Object>} relevantChunks - The top chunks retrieved from searchService
 * @returns {Promise<string>} - The AI generated answer
 */
const generateAnswer = async (question, relevantChunks) => {
  if (!ai) {
    throw new Error('Gemini API is not configured.');
  }

  if (!relevantChunks || relevantChunks.length === 0) {
    return "I couldn't find any relevant information in this document to answer your question.";
  }

  // Compile the chunks into a single context string
  const contextString = relevantChunks
    .map(chunk => `--- Chunk ${chunk.chunkNumber} ---\n${chunk.text}`)
    .join('\n\n');

  // Construct the strict RAG prompt
  const prompt = `
Context:
${contextString}

Question:
${question}

Answer only using the provided context. If the answer is not contained in the context, say "I don't have enough information from the document to answer that."
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error('AI Generation Error:', error.message);
    throw new Error('Failed to generate answer from Gemini API');
  }
};

module.exports = {
  generateAnswer
};
