import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Chat = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Fetch documents for the dropdown
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get(`${API_URL}/api/documents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setDocuments(res.data);
        if (res.data.length > 0) {
          setSelectedDocId(res.data[0]._id); // Select first doc by default
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch documents.');
        }
      } finally {
        setFetchingDocs(false);
      }
    };

    fetchDocuments();
  }, [navigate]);

  // Fetch chat history when selected document changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedDocId) {
        setChatHistory([]);
        return;
      }
      try {
        setFetchingHistory(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get(`${API_URL}/api/chat/history/${selectedDocId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Backend returns latest first (descending). We need chronological for UI (ascending).
        const rawChats = Array.isArray(res.data) ? res.data : [];
        const historyData = [...rawChats].reverse().reduce((acc, chat) => {
          acc.push({ role: 'user', content: chat.question });
          acc.push({ role: 'ai', content: chat.answer });
          return acc;
        }, []);
        
        setChatHistory(historyData);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Failed to load previous conversations.');
      } finally {
        setFetchingHistory(false);
      }
    };
    
    fetchHistory();
  }, [selectedDocId, navigate]);

  // Scroll to bottom of chat when new message appears
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!selectedDocId) {
      setError('Please select a document first.');
      return;
    }

    const currentQuestion = question;
    setQuestion('');
    setError('');
    
    // Add user question to chat
    setChatHistory(prev => [...prev, { role: 'user', content: currentQuestion }]);
    setLoading(true);
    setLoadingText('Searching document...');

    try {
      const token = localStorage.getItem('token');
      
      // We simulate moving from searching to generating after a short delay for UX
      setTimeout(() => {
        if(loading) setLoadingText('Generating answer...');
      }, 1500);

      const res = await axios.post(`${API_URL}/api/chat/ask`, {
        documentId: selectedDocId,
        question: currentQuestion
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Add AI answer to chat
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: res.data.answer 
      }]);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error getting an answer.';
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: `Error: ${errorMsg}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div className="glass-card" style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', height: '85vh' }}>
        <h2 className="title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>StudyVault Assistant</h2>
        
        {/* Document Selector */}
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Select Document:</label>
          <select 
            value={selectedDocId} 
            onChange={(e) => setSelectedDocId(e.target.value)}
            disabled={fetchingDocs || documents.length === 0}
            style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--primary-color)' }}
          >
            {fetchingDocs ? (
              <option>Loading documents...</option>
            ) : documents.length === 0 ? (
              <option>No documents found</option>
            ) : (
              documents.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.fileName}</option>
              ))
            )}
          </select>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        {/* Chat History Area */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chatHistory.length === 0 ? (
            <div style={{ margin: 'auto', color: 'var(--text-secondary)' }}>
              Ask a question about the selected document to get started!
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                  padding: '1rem',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  textAlign: 'left',
                  border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                  {msg.role === 'user' ? 'You' : 'StudyVault AI'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            ))
          )}
          {fetchingHistory && (
            <div style={{ alignSelf: 'center', padding: '1rem', opacity: 0.7 }}>
              Loading previous conversations...
            </div>
          )}
          {loading && (
            <div style={{ alignSelf: 'flex-start', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', opacity: 0.7 }}>
              {loadingText || 'Thinking...'}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Ask a question about your document..." 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading || fetchingHistory || documents.length === 0}
            style={{ flex: 1, padding: '1rem', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
          />
          <button 
            type="submit" 
            className="get-started-btn"
            disabled={loading || fetchingHistory || !question.trim() || documents.length === 0}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
