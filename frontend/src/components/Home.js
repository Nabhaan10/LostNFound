import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ICON_MAP = {
    electronics: '📱', wallet: '👛', keys: '🔑', bag: '🎒',
    clothing: '👕', books: '📚', id: '🪪', jewelry: '💍', default: '📦',
};

function getItemIcon(type = '') {
    const t = type.toLowerCase();
    for (const key of Object.keys(ICON_MAP)) {
        if (t.includes(key)) return ICON_MAP[key];
    }
    return ICON_MAP.default;
}

function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Home({ stats, apiUrl, user, onNavigate }) {
    const [userStats, setUserStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [userItems, setUserItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadUserData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/user/stats/${user.id}`);
            if (response.data.success) {
                setUserStats(response.data.userStats || { total: 0, resolved: 0, pending: 0 });
                setUserItems(response.data.activeReports || []);
            }
        } catch (err) {
            console.error('Error loading user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const statBand = [
        { label: 'Total Items',       value: stats.total },
        { label: 'Pending',           value: stats.pending },
        { label: 'Resolved Today',    value: stats.resolvedToday },
        { label: 'Lost Reports',      value: stats.lost },
        { label: 'Found Reports',     value: stats.found },
    ];

    return (
        <div className="home">
            {/* Hero */}
            <section className="hero">
                <h1 className="hero-heading">
                    Your campus<br /><span>Lost &amp; Found</span>
                </h1>
                <p className="hero-sub">
                    Report missing items, browse found objects, and get reunited with what's yours.
                </p>
                <div className="hero-cta">
                    <button className="btn-hero primary" onClick={() => onNavigate('report-lost')}>Report Lost Item</button>
                    <button className="btn-hero ghost" onClick={() => onNavigate('all')}>Browse Found Items</button>
                </div>
            </section>

            {/* Stats Band */}
            <div className="stats-band">
                {statBand.map(s => (
                    <div key={s.label} className="stat-band-item">
                        <span className="stat-band-number">{s.value ?? 0}</span>
                        <span className="stat-band-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* User Stats */}
            <h2 className="section-title">Your Activity</h2>
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <span className="user-stat-number">{userStats.total}</span>
                    <span>Reports Submitted</span>
                </div>
                <div className="user-stat-card">
                    <span className="user-stat-number">{userStats.resolved}</span>
                    <span>Items Resolved</span>
                </div>
                <div className="user-stat-card">
                    <span className="user-stat-number">{userStats.pending}</span>
                    <span>Pending Reports</span>
                </div>
            </div>

            {/* Active Reports */}
            <section className="active-reports-section">
                <h2 className="section-title">Your Active Reports</h2>
                {loading ? (
                    <div className="loading"><div className="loading-spinner" /></div>
                ) : userItems.length === 0 ? (
                    <div className="no-reports">
                        <p>No active reports.</p>
                        <button className="btn-primary" onClick={() => onNavigate('report-lost')}>
                            Report a Lost Item
                        </button>
                    </div>
                ) : (
                    <div className="reports-table-container">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userItems.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="item-cell">
                                                <span className="item-icon">{getItemIcon(item.item_type)}</span>
                                                <span className="item-name">{item.description?.slice(0, 40) || 'No description'}</span>
                                            </div>
                                        </td>
                                        <td>{item.item_type}</td>
                                        <td>{formatDate(item.created_at)}</td>
                                        <td>
                                            <span className={`status-badge ${item.is_found ? 'reported' : 'pending'}`}>
                                                {item.is_found ? 'Found' : 'Lost'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
