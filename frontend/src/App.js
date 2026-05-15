import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Home from './components/Home';
import ReportLost from './components/ReportLost';
import ReportFound from './components/ReportFound';
import Search from './components/Search';
import ViewAll from './components/ViewAll';
import Login from './components/Login';
import Register from './components/Register';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api');
const BASE_URL = process.env.REACT_APP_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

function App() {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(null);
    const [showAuthPage, setShowAuthPage] = useState('login');
    const [stats, setStats] = useState({ total: 0, pending: 0, resolvedToday: 0, lost: 0, found: 0 });
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        if (user) loadStats();
    }, [view, user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            if (response.data.success) setStats(response.data.stats);
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

    const navigate = (page) => {
        setView(page);
        setMenuOpen(false);
    };

    const navItems = [
        { key: 'home',         label: 'Home' },
        { key: 'report-lost',  label: 'Report Lost' },
        { key: 'report-found', label: 'Report Found' },
        { key: 'search',       label: 'Search' },
        { key: 'all',          label: 'View All' },
    ];

    if (!user) {
        if (showAuthPage === 'login') {
            return <Login apiUrl={API_URL} onLogin={handleLogin} onSwitchToRegister={() => setShowAuthPage('register')} />;
        }
        return <Register apiUrl={API_URL} onRegister={handleLogin} onSwitchToLogin={() => setShowAuthPage('login')} />;
    }

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user.rollNumber?.slice(0, 2).toUpperCase() || 'U';

    return (
        <div className="app">
            {/* Navbar */}
            <nav className="navbar" ref={menuRef}>
                <div className="navbar-inner">
                    <button className="navbar-logo" onClick={() => navigate('home')}>
                        Lost<span>&</span>Found
                    </button>

                    <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                className={`nav-link${view === item.key ? ' active' : ''}`}
                                onClick={() => navigate(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="navbar-right">
                        <div className="navbar-user">
                            <div className="avatar">{initials}</div>
                            <span>{user.name}</span>
                        </div>
                        <button className="btn-logout" onClick={handleLogout}>
                            Sign out
                        </button>
                    </div>

                    <button
                        className="hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="page-content">
                {view === 'home'         && <Home stats={stats} apiUrl={API_URL} user={user} view={view} onNavigate={navigate} />}
                {view === 'report-lost'  && <ReportLost apiUrl={API_URL} baseUrl={BASE_URL} user={user} onSuccess={loadStats} />}
                {view === 'report-found' && <ReportFound apiUrl={API_URL} baseUrl={BASE_URL} user={user} onSuccess={loadStats} />}
                {view === 'search'       && <Search apiUrl={API_URL} baseUrl={BASE_URL} user={user} />}
                {view === 'all'          && <ViewAll apiUrl={API_URL} baseUrl={BASE_URL} user={user} />}
            </main>

            <footer className="footer">
                © 2025 Campus Lost &amp; Found System
            </footer>
        </div>
    );
}

export default App;
