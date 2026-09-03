import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import UploadBox from '../components/UploadBox';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.get(`${API_URL}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Documents API Response:", res.data);
      setDocuments(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to fetch documents.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [navigate]);

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/documents/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setDocuments(documents.filter(doc => doc._id !== docId));
      setSuccess('Document deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete document.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDocumentUploaded = () => {
  fetchDocuments();
};

  return (
   <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className="title" style={{ fontSize: '2.5rem' }}>My Documents</h2>
        <p className="subtitle">Manage your study materials below.</p>
        
        <UploadBox onUploadSuccess={handleDocumentUploaded} />
        
        {success && <div className="success-message" style={{ color: '#10b981', marginTop: '1rem' }}>{success}</div>}
        
        <div className="documents-list-container" style={{ marginTop: '3rem' }}>
          <h3 style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Uploaded Files</h3>
          
          {loading ? (
            <p>Loading documents...</p>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : documents.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No documents uploaded yet. Upload a PDF to get started!</p>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc._id} className="document-card">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <p className="doc-name">{doc.fileName}</p>
                    <p className="doc-date">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <a 
                      href={`${API_URL}/${doc.filePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      View
                    </a>
                    <button 
                      onClick={() => handleDelete(doc._id)}
                      className="view-btn"
                      style={{ background: '#ef4444', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
