import React, { useState } from 'react';
import axios from 'axios';
import ImageModal from './ImageModal';

const ITEM_TYPES = ['Electronics', 'Wallet', 'Keys', 'Bag', 'Clothing', 'Books', 'ID/Card', 'Jewelry', 'Other'];

function ReportLost({ apiUrl, baseUrl, user, onSuccess }) {
    const [formData, setFormData] = useState({ itemType: '', description: '', location: '', name: user?.name || '', phone: user?.phoneNumber || '' });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [matches, setMatches] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalImage, setModalImage] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage('Image is too large. Maximum size is 5MB.');
                setMessageType('error');
                return;
            }
            setMessage('');
            setImage(file);
            const reader = new FileReader();
            reader.onload = ev => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage('Image is too large. Maximum size is 5MB.');
                setMessageType('error');
                return;
            }
            setMessage('');
            setImage(file);
            const reader = new FileReader();
            reader.onload = ev => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.itemType || !formData.description.trim() || !formData.name.trim() || !formData.phone.trim()) {
            setMessage('Please fill in all required fields.');
            setMessageType('error');
            return;
        }
        setLoading(true);
        setMessage('');
        if (!user?.id || user.id === 'undefined') {
            setMessage('Your session is invalid. Please log out and log in again.');
            setMessageType('error');
            setLoading(false);
            return;
        }
        try {
            const data = new FormData();
            data.append('itemType', formData.itemType);
            data.append('description', formData.description);
            data.append('location', formData.location);
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            data.append('userId', user.id);
            if (image) data.append('image', image);

            const response = await axios.post(`${apiUrl}/items/report-lost`, data);

            if (response.data.success) {
                setMessage('Lost item reported successfully!');
                setMessageType('success');
                setMatches(response.data.matches || []);
                setFormData({ itemType: '', description: '', location: '', name: user?.name || '', phone: user?.phoneNumber || '' });
                setImage(null);
                setImagePreview(null);
                if (onSuccess) onSuccess();
            } else {
                setMessage(response.data.message || 'Failed to submit report.');
                setMessageType('error');
            }
        } catch (err) {
            setMessage(err.response?.data?.error || err.response?.data?.message || 'Server error. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-wrapper">
            <div className="form-header">
                <h1>Report Lost Item</h1>
                <p>Fill in the details below and we'll look for potential matches.</p>
            </div>

            {message && <div className={`alert ${messageType}`}>{message}</div>}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Item Type</label>
                        <select name="itemType" value={formData.itemType} onChange={handleChange}>
                            <option value="">Select a type…</option>
                            {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe the item — colour, brand, distinguishing features…"
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Contact number"
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Seen Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Library 2nd floor, Canteen area"
                        />
                    </div>
                    <div className="form-group">
                        <label>Photo (optional)</label>
                        <div
                            className="file-drop-zone"
                            onDrop={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            onClick={() => document.getElementById('lost-image-input').click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="image-preview" />
                            ) : (
                                <span className="file-drop-label">
                                    📷 Drag & drop or <strong>click to upload</strong><br />
                                    <small>JPG, PNG, GIF, WEBP — max 5MB</small>
                                </span>
                            )}
                        </div>
                        <input
                            id="lost-image-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Submitting…' : 'Submit Report'}
                    </button>
                </form>
            </div>

            {matches.length > 0 && (
                <section className="matches-section">
                    <h2 className="section-title">Potential Matches Found 🎯</h2>
                    <p>These items were recently found on campus and may be yours:</p>
                    <div className="items-grid">
                        {matches.map(item => (
                            <div key={item.id} className="item-card">
                                {item.image_url ? (
                                    <div
                                        className="card-image"
                                        style={{ backgroundImage: `url(${baseUrl}${item.image_url})` }}
                                        onClick={() => setModalImage(`${baseUrl}${item.image_url}`)}
                                    />
                                ) : (
                                    <div className="card-no-image">No Photo</div>
                                )}
                                <div className="card-body">
                                    <div className="card-badge-row">
                                        <span className="item-badge found">Found</span>
                                        <span className="item-badge">{item.item_type}</span>
                                    </div>
                                    <p className="card-description">{item.description}</p>
                                    <p className="card-meta">📍 {item.location || 'Location not specified'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        </div>
    );
}

export default ReportLost;
