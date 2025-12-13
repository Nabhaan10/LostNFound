import React, { useState } from 'react';
import axios from 'axios';

function ReportLost({ apiUrl, user, onSuccess }) {
    const [formData, setFormData] = useState({
        itemType: '',
        description: '',
        name: user?.name || '',
        phone: user?.phoneNumber || ''
    });
    const [message, setMessage] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        
        try {
            const response = await axios.post(`${apiUrl}/items/report-lost`, {
                ...formData,
                userId: user.id
            });
            
            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: `✅ ${response.data.message}!`
                });
                
                if (response.data.matches && response.data.matches.length > 0) {
                    setMatches(response.data.matches);
                } else {
                    setMatches([]);
                }
                
                // Reset form
                setFormData({
                    itemType: '',
                    description: '',
                    name: '',
                    phone: ''
                });
                
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: '❌ Error reporting item: ' + (error.response?.data?.error || error.message)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>📢 Report Lost Item</h2>
            
            {message && (
                <div className={`alert ${message.type}`}>
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Item Type *</label>
                    <select
                        value={formData.itemType}
                        onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                        required
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
                </div>
                
                <div className="form-group">
                    <label>Description *</label>
                    <textarea
                        placeholder="Describe the item in detail (color, brand, unique features, etc.)"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Your Name *</label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        placeholder="Enter your contact number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                    />
                </div>
                
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Submitting...' : '📢 Report Lost Item'}
                </button>
            </form>
            
            {matches.length > 0 && (
                <div className="matches-section">
                    <h3>🎯 Matching Found Items</h3>
                    <p style={{marginBottom: '1rem', color: '#666'}}>
                        We found {matches.length} similar item(s) that have been reported as found. Contact them directly!
                    </p>
                    <div className="items-grid">
                        {matches.map(item => (
                            <div key={item.id} className="item-card found">
                                <div className="item-badge found">FOUND</div>
                                <h3>{item.item_type}</h3>
                                <p><strong>Description:</strong> {item.description}</p>
                                <div className="item-contact">
                                    <p><strong>Found by:</strong> {item.reporter_name}</p>
                                    <p><strong>📞 Contact:</strong> {item.phone_number}</p>
                                    <p><strong>Report ID:</strong> {item.report_id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportLost;
