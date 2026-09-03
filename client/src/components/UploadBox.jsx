import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UploadBox = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    setError('');
    setSuccessMsg('');
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file); // 'pdf' must match the multer single() field name

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      
      const token = localStorage.getItem('token');
      
      const res = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccessMsg(res.data.message); // Will show success or warning about extraction
      setFile(null); // Reset after successful upload
      // Reset the file input element visually
      document.getElementById('pdf-upload').value = '';
      
      if (onUploadSuccess) {
        onUploadSuccess(); // Trigger a refresh of the document list
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-box">
      <h3>Upload New Document</h3>
      {error && <div className="error-message" style={{ margin: '1rem 0' }}>{error}</div>}
      {successMsg && <div className="success-message" style={{ margin: '1rem 0', color: '#86efac', background: 'rgba(134, 239, 172, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(134, 239, 172, 0.2)' }}>{successMsg}</div>}
      <form onSubmit={handleUpload}>
        <div className="file-input-wrapper">
          <input 
            type="file" 
            id="pdf-upload" 
            accept="application/pdf" 
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
        
        {file && (
          <p className="selected-file">Selected: {file.name}</p>
        )}

        <button 
          type="submit" 
          className="get-started-btn w-100" 
          disabled={!file || loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Uploading & Processing...' : 'Upload PDF'}
        </button>
      </form>
    </div>
  );
};

export default UploadBox;
