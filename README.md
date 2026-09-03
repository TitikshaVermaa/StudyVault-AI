# StudyVault AI

## Description
StudyVault AI is an intelligent, personal learning assistant designed to revolutionize how students interact with their study materials. Users can securely upload their study PDFs and then ask conversational questions about the content. The AI utilizes **Retrieval-Augmented Generation (RAG)** to scan the documents, extract contextually relevant information, and generate precise, hallucination-free answers based *strictly* on the uploaded materials.

## Features
- **Authentication**: Secure JWT-based user login and registration.
- **PDF Upload**: Effortlessly upload study materials with seamless error handling.
- **Text Extraction**: Automatically parses textual data from raw PDFs.
- **Text Chunking**: Intelligently splits long documents into overlapping segments to preserve sentence context.
- **Gemini Embeddings**: Converts text chunks into mathematical vectors for precise semantic mapping.
- **Semantic Search**: Uses mathematically robust Cosine Similarity to find the exact paragraphs that answer your questions.
- **RAG Question Answering**: Feeds isolated context to the Gemini AI to generate answers exclusively from your documents.
- **Chat History**: Seamlessly saves and restores your past conversations on a per-document basis.
- **Dashboard Analytics**: Tracks your personal application usage natively on a dynamic grid.

## Architecture

User
 |
React (Vite)
 |
Node / Express Backend
 |
MongoDB + Gemini API

**RAG Pipeline Flow:**
PDF -> Text Extraction -> Chunking -> Embeddings -> Similarity Search -> Gemini Response

## Tech Stack
**Frontend:**
- React (Hooks, React Router)
- Vite (Lightning-fast builds)
- Axios (API communication)
- Vanilla CSS (Glassmorphism design)

**Backend:**
- Node.js
- Express (RESTful APIs)
- Multer (File uploading)
- PDF-Parse (Text extraction)

**Database:**
- MongoDB (Mongoose ORM)

**AI Engine:**
- Google Gemini API (`text-embedding-004` & `gemini-2.5-flash`)
- Retrieval-Augmented Generation (RAG) Architecture

## Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/studyvault-ai.git
   cd studyvault-ai
   ```

2. **Environment Setup:**
   Create `.env` files based on the `.env.example` files provided in both `client` and `server` folders.

3. **Install Backend Dependencies & Run:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Install Frontend Dependencies & Run:**
   Open a new terminal window:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## API Overview

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate and receive JWT

### Documents
- `POST /api/documents/upload` - Upload and parse a new PDF (Requires JWT)
- `GET /api/documents` - Retrieve all user documents
- `DELETE /api/documents/:id` - Securely delete a document and its chat history

### Chat & AI
- `POST /api/chat/ask` - Perform a RAG semantic search and answer generation
- `GET /api/chat/history/:documentId` - Retrieve past conversation history for a file
