import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Home from './components/Home';
import ReportLost from './components/ReportLost';
import ReportFound from './components/ReportFound';
import Search from './components/Search';
import ViewAll from './components/ViewAll';
import Login from './components/Login';
import Register from './components/Register';

const API_URL = 'http://localhost:5000/api';

function App() {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(null);
    const [showAuthPage, setShowAuthPage] = useState('login'); // 'login' or 'register'
    const [darkMode, setDarkMode] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolvedToday: 0,
        lost: 0,
        found: 0
    });

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme) {
            setDarkMode(savedTheme === 'true');
        }
    }, []);

    useEffect(() => {
        // Apply dark mode class to body
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (user) {
            loadStats();
        }
    }, [view, user]);

    const loadStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
        setView('home');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setView('home');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Show login/register page if not authenticated
    if (!user) {
        if (showAuthPage === 'login') {
            return (
                <Login 
                    apiUrl={API_URL} 
                    onLogin={handleLogin}
                    onSwitchToRegister={() => setShowAuthPage('register')}
                />
            );
        } else {
            return (
                <Register 
                    apiUrl={API_URL}
                    onRegister={handleLogin}
                    onSwitchToLogin={() => setShowAuthPage('login')}
                />
            );
        }
    }

    return (
        <div className="app">
            <button
                onClick={handleLogout}
                style={{
                    position: 'fixed',
                    top: '10px',
                    left: '10px',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
            >
                🚪 Logout
            </button>
            <button
                onClick={toggleDarkMode}
                style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    padding: '0.5rem 1rem',
                    background: darkMode ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' : 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
            >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <header className="header">
                <div className="header-content">
                    <h1>🎓 College Lost & Found System</h1>
                    <p className="subtitle">Reuniting items with their owners</p>
                    <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        color: 'rgba(25, 22, 22, 0.9)'
                    }}>
                        👤 {user.name} ({user.rollNumber})
                    </div>
                </div>
                <nav className="nav">
                    <button 
                        className={view === 'home' ? 'active' : ''} 
                        onClick={() => setView('home')}
                    >
                        🏠 Home
                    </button>
                    <button 
                        className={view === 'report-lost' ? 'active' : ''} 
                        onClick={() => setView('report-lost')}
                    >
                        📢 Report Lost
                    </button>
                    <button 
                        className={view === 'report-found' ? 'active' : ''} 
                        onClick={() => setView('report-found')}
                    >
                        ✨ Report Found
                    </button>
                    <button 
                        className={view === 'search' ? 'active' : ''} 
                        onClick={() => setView('search')}
                    >
                        🔍 Search
                    </button>
                    <button 
                        className={view === 'all' ? 'active' : ''} 
                        onClick={() => setView('all')}
                    >
                        📋 View All
                    </button>
                </nav>
            </header>

            <main className="content">
                {view === 'home' && <Home stats={stats} />}
                {view === 'report-lost' && <ReportLost apiUrl={API_URL} user={user} onSuccess={() => loadStats()} />}
                {view === 'report-found' && <ReportFound apiUrl={API_URL} user={user} onSuccess={() => loadStats()} />}
                {view === 'search' && <Search apiUrl={API_URL} user={user} />}
                {view === 'all' && <ViewAll apiUrl={API_URL} user={user} />}
            </main>

            <footer className="footer">
                <p>© 2025 College Lost & Found System | Built with ❤️</p>
            </footer>
        </div>
    );
}

export default App;
