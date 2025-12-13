import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewAll({ apiUrl, user }) {
    const [filter, setFilter] = useState('all');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);

    useEffect(() => {
        loadItems();
    }, [filter]);

    const loadItems = async () => {
        setLoading(true);
        try {
            let url = '';
            if (filter === 'all') {
                url = `${apiUrl}/items/all`;
            } else if (filter === 'lost') {
                url = `${apiUrl}/items/lost`;
            } else {
                url = `${apiUrl}/items/found`;
            }
            
            const response = await axios.get(url);
            
            if (response.data.success) {
                setItems(response.data.items);
            }
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReunite = async (reportId) => {
        if (!window.confirm('Have you successfully reunited with this item? This will mark it as resolved.')) {
            return;
        }
        
        setResolvingId(reportId);
        try {
            const response = await axios.put(
                `${apiUrl}/items/resolve/${reportId}`,
                { userId: user.id }
            );
            
            if (response.data.success) {
                alert('✅ Item marked as reunited! Thank you for updating the system.');
                loadItems(); // Refresh the list
            }
        } catch (error) {
            console.error('Error resolving item:', error);
            if (error.response?.data?.error) {
                alert('❌ ' + error.response.data.error);
            } else {
                alert('❌ Error marking item as reunited');
            }
        } finally {
            setResolvingId(null);
        }
    };

    return (
        <div className="items-container">
            <h2>📋 All Items</h2>
            
            <div className="search-box" style={{justifyContent: 'center'}}>
                <button 
                    className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('all')}
                    style={{width: 'auto'}}
                >
                    📦 All Items
                </button>
                <button 
                    className={filter === 'lost' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('lost')}
                    style={{width: 'auto'}}
                >
                    😢 Lost Only
                </button>
                <button 
                    className={filter === 'found' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('found')}
                    style={{width: 'auto'}}
                >
                    ✨ Found Only
                </button>
            </div>
            
            {loading && <div className="loading">🔄 Loading...</div>}
            
            {!loading && items.length === 0 && (
                <div className="empty-state">
                    <h3>📭 No items found</h3>
                    <p>Be the first to report an item!</p>
                </div>
            )}
            
            {!loading && items.length > 0 && (
                <div className="items-grid">
                    {items.map(item => (
                        <div key={item.id} className={`item-card ${item.is_found ? 'found' : 'lost'}`}>
                            <div className={`item-badge ${item.is_found ? 'found' : 'lost'}`}>
                                {item.is_found ? 'FOUND' : 'LOST'}
                            </div>
                            <h3>{item.item_type}</h3>
                            <p><strong>Description:</strong> {item.description}</p>
                            <div className="item-contact">
                                <p><strong>{item.is_found ? 'Found by' : 'Lost by'}:</strong> {item.reporter_name}</p>
                                <p><strong>📞 Contact:</strong> {item.phone_number}</p>
                                <p><strong>Report ID:</strong> {item.report_id}</p>
                                <p><strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                                <p style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#666'}}>💡 Contact directly to reunite!</p>
                            </div>
                            <button 
                                className="btn-secondary"
                                onClick={() => handleReunite(item.report_id)}
                                disabled={resolvingId === item.report_id || item.user_id !== user.id}
                                style={{
                                    width: '100%', 
                                    marginTop: '1rem', 
                                    fontSize: '0.9rem', 
                                    padding: '0.75rem',
                                    opacity: item.user_id !== user.id ? 0.5 : 1,
                                    cursor: item.user_id !== user.id ? 'not-allowed' : 'pointer'
                                }}
                                title={item.user_id !== user.id ? 'You can only mark your own items as reunited' : ''}
                            >
                                {resolvingId === item.report_id ? '⏳ Marking...' : '✅ Mark as Reunited'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ViewAll;
