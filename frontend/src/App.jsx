import { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Assessment from './pages/Assessment.jsx';
import History from './pages/History.jsx';
import Guide from './pages/Guide.jsx';
import Admin from './pages/Admin.jsx';

// TEMPORAIRE — masque l'interface Admin (usage pédagogique/démo).
// Repasser à true pour restaurer la gestion utilisateurs + profil entreprise.
const SHOW_ADMIN = false;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('ros_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ros_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const token = localStorage.getItem('ros_token');
    const savedUser = localStorage.getItem('ros_user');
    if (token && savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('ros_token', token);
    localStorage.setItem('ros_user', JSON.stringify(userData));
    setUser(userData);
    setTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('ros_token');
    localStorage.removeItem('ros_user');
    setUser(null);
  };

  if (loading) return null;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-title">RoS</div>
          <div className="logo-sub">Return on Sovereignty v3.0</div>
          <span className="version-badge">5 DIM</span>
        </div>
        <nav className="nav">
          <div className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
            <span className="nav-icon">◉</span> Dashboard
          </div>
          <div className={`nav-item ${tab === 'assessment' ? 'active' : ''}`} onClick={() => setTab('assessment')}>
            <span className="nav-icon">⊞</span> Évaluation
          </div>
          <div className={`nav-item ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            <span className="nav-icon">◷</span> Historique
          </div>
          <div className={`nav-item ${tab === 'guide' ? 'active' : ''}`} onClick={() => setTab('guide')}>
            <span className="nav-icon">≡</span> Guide
          </div>
          {SHOW_ADMIN && user.role === 'admin' && (
            <div className={`nav-item ${tab === 'admin' ? 'active' : ''}`} onClick={() => setTab('admin')}>
              <span className="nav-icon">⚙</span> Admin
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title="Changer de thème">
            {theme === 'dark' ? '☀ Mode clair' : '☾ Mode sombre'}
          </button>
          <span>{user.username} · <span style={{ color: 'var(--blue)' }}>{user.role}</span></span>
          <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>

      <main className="main">
        {tab === 'dashboard'  && <Dashboard showToast={showToast} onEvaluate={() => setTab('assessment')} />}
        {tab === 'assessment' && <Assessment showToast={showToast} onSaved={() => setTab('history')} />}
        {tab === 'history'    && <History showToast={showToast} />}
        {tab === 'guide'      && <Guide />}
        {SHOW_ADMIN && tab === 'admin' && user.role === 'admin' && <Admin showToast={showToast} />}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
