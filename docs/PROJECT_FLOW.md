# StudyVault AI: Project Flow & Architecture

This document breaks down the major workflows of StudyVault AI for beginners and developers alike.

## 1. User Authentication Flow
1. **Signup:** A user submits their name, email, and password.
2. **Security:** The backend uses `bcrypt` to hash the password before securely saving it to MongoDB.
3. **Login:** When logging in, the server verifies the hashed password and issues a **JSON Web Token (JWT)**.
4. **Session:** The frontend stores this JWT in `localStorage` and attaches it as an `Authorization` header on all subsequent API requests. This ensures only logged-in users can access their private study documents.

## 2. Document Upload Flow
1. **Selection:** The user chooses a PDF file on the React frontend.
2. **Transfer:** The file is sent to the backend via a `multipart/form-data` POST request using `axios`.
3. **Storage:** The `multer` middleware safely saves the physical `.pdf` file to the `server/uploads` directory.
4. **Database:** The file's metadata (name, path, uploader's user ID) is saved in the MongoDB `Document` collection.

## 3. RAG Ingestion Pipeline (The "Brain")
Once the PDF is saved, a background process immediately begins extracting its intelligence:
1. **Text Extraction:** `pdf-parse` reads the PDF and extracts all its raw text.
2. **Chunking:** `chunkService.js` mathematically slices the massive text block into smaller, 1000-character overlapping chunks to preserve sentence meaning.
3. **Embeddings Generation:** The backend loops through these chunks, sending each one to the **Google Gemini API** (`text-embedding-004`). Gemini returns a mathematical vector (a list of numbers) representing the meaning of that chunk.
4. **Final Storage:** The chunks and their vector embeddings are attached to the Document object in MongoDB, fully preparing the file for AI conversations.

## 4. Question Answering Pipeline (Semantic Search)
1. **User Query:** The user selects a document and asks a question in the chat UI.
2. **Query Vectorization:** The backend instantly sends the question to Gemini to get its vector embedding.
3. **Cosine Similarity:** The `searchService.js` compares the question's vector against *every single chunk's* vector inside the document using a mathematical formula called Cosine Similarity.
4. **Context Assembly:** It takes the top 3 most relevant chunks and bundles them into a strict prompt.
5. **AI Generation:** The context and question are sent to the `gemini-2.5-flash` model. Because it is explicitly instructed to *only* use the provided context, the AI acts as a summarizer rather than a hallucinating chatbot.
6. **Delivery:** The final, accurate answer is saved to the chat history and displayed to the user!
