import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalDocuments: 0, totalQuestions: 0, recentDocument: 'None' });
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, redirect to login page
      navigate('/login');
      return;
    }

    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="home-container"><div className="title">Loading...</div></div>;

  return (
    <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className="title" style={{ fontSize: '2.5rem' }}>Dashboard</h2>
        <p className="subtitle">Welcome back, {user.name}!</p>
        
        <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
          <h3>Your Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        {/* Dashboard Statistics */}
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--primary-color)' }}>
            <h4 style={{ margin: 0, opacity: 0.8 }}>Documents</h4>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>
              {loadingStats ? '-' : stats.totalDocuments}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--primary-color)' }}>
            <h4 style={{ margin: 0, opacity: 0.8 }}>Questions Asked</h4>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>
              {loadingStats ? '-' : stats.totalQuestions}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--primary-color)' }}>
            <h4 style={{ margin: 0, opacity: 0.8 }}>Recent Document</h4>
            <p style={{ fontSize: '1.1rem', margin: '0.5rem 0 0 0', fontWeight: 'bold', wordBreak: 'break-all' }}>
              {loadingStats ? 'Loading...' : stats.recentDocument}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/documents')} className="get-started-btn">
            Manage Documents
          </button>
          <button onClick={() => navigate('/chat')} className="get-started-btn" style={{ background: '#3b82f6' }}>
            Chat with AI
          </button>
          <button onClick={handleLogout} className="get-started-btn" style={{ background: '#ef4444' }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
