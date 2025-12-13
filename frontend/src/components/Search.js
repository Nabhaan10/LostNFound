import React, { useState } from 'react';
import axios from 'axios';

function Search({ apiUrl, user }) {
    const [searchType, setSearchType] = useState('type');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [resolvingId, setResolvingId] = useState(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            alert('Please enter a search query');
            return;
        }
        
        setLoading(true);
        setSearched(true);
        
        try {
            let url = '';
            if (searchType === 'type') {
                url = `${apiUrl}/items/search/type/${encodeURIComponent(searchQuery)}`;
            } else {
                url = `${apiUrl}/items/search/description/${encodeURIComponent(searchQuery)}`;
            }
            
            const response = await axios.get(url);
            
            if (response.data.success) {
                setItems(response.data.items);
            }
        } catch (error) {
            console.error('Error searching items:', error);
            alert('Error searching items');
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
                handleSearch(); // Refresh search results
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
        <div className="search-container">
            <h2>🔍 Search Items</h2>
            
            <div className="search-box">
                <select
                    value={searchType}
                    onChange={(e) => {
                        setSearchType(e.target.value);
                        setSearched(false);
                        setItems([]);
                    }}
                >
                    <option value="type">Search by Item Type</option>
                    <option value="description">Search by Description</option>
                </select>
                
                {searchType === 'type' ? (
                    <select
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    >
                        <option value="">Select item type</option>
                        <option value="phone">📱 Phone</option>
                        <option value="wallet">👛 Wallet</option>
                        <option value="keys">🔑 Keys</option>
                        <option value="laptop">💻 Laptop</option>
                        <option value="bag">🎒 Bag</option>
                        <option value="watch">⌚ Watch</option>
                        <option value="jewelry">💍 Jewelry</option>
                        <option value="glasses">👓 Glasses</option>
                        <option value="bottle">🧃 Water Bottle</option>
                        <option value="books">📚 Books</option>
                        <option value="id-card">🪪 ID Card</option>
                        <option value="umbrella">☂️ Umbrella</option>
                        <option value="other">📦 Other</option>
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="Enter keyword (e.g., 'blue', 'iPhone', 'leather')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                )}
                
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? '⏳ Searching...' : '🔍 Search'}
                </button>
            </div>
            
            {loading && <div className="loading">🔄 Loading...</div>}
            
            {searched && !loading && items.length === 0 && (
                <div className="empty-state">
                    <h3>😔 No items found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            )}
            
            {items.length > 0 && (
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

export default Search;
