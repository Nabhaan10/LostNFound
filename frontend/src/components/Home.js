import React from 'react';

function Home({ stats }) {
    return (
        <div className="home">
            <h2>Welcome to Lost & Found</h2>
            <p>Your trusted platform for reuniting lost items with their owners</p>
            
            <div className="stats">
                <div className="stat-card">
                    <h3>📦 Total Items</h3>
                    <p className="stat-number">{stats.total}</p>
                </div>
                <div className="stat-card">
                    <h3>⏳ Pending Items</h3>
                    <p className="stat-number">{stats.pending}</p>
                </div>
                <div className="stat-card">
                    <h3>✅ Resolved Today</h3>
                    <p className="stat-number">{stats.resolvedToday}</p>
                </div>
                <div className="stat-card">
                    <h3>😢 Lost Items</h3>
                    <p className="stat-number">{stats.lost}</p>
                </div>
                <div className="stat-card">
                    <h3>✨ Found Items</h3>
                    <p className="stat-number">{stats.found}</p>
                </div>
            </div>
        </div>
    );
}

export default Home;
