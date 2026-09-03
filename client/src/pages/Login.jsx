import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('All fields are required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      
      // Store JWT token in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setLoading(false);
      navigate('/dashboard'); // Redirect to protected dashboard
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="home-container">
      <div className="glass-card">
        <h2 className="title" style={{ fontSize: '2.5rem' }}>Welcome Back</h2>
        <p className="subtitle">Log in to your StudyVault AI account.</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email} 
              onChange={handleChange} 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              className="form-input"
            />
          </div>
          
          <button type="submit" className="get-started-btn w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-redirect">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
