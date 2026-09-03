import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Chat from './pages/Chat';
import './App.css';

// A simple Home component to display the welcome message
const Home = () => {
  return (
    <div className="home-container">
      <div className="glass-card">
        <h1 className="title">Welcome to StudyVault AI</h1>
        <p className="subtitle">Your intelligent companion for seamless learning.</p>
        <div>
          <Link to="/signup" className="get-started-btn" style={{ marginRight: '1rem', textDecoration: 'none' }}>Get Started</Link>
          <Link to="/login" className="get-started-btn" style={{ background: 'transparent', border: '1px solid var(--primary-color)', textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    // Router provides navigation capabilities for our app
    <Router>
      <div className="app-container">
        {/* Routes define what component renders at which path */}
        <Routes>
          {/* Default route displaying our Home component */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


