import React, { useState } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import ImageModal from './ImageModal';

const ITEM_TYPES = ['Electronics', 'Wallet', 'Keys', 'Bag', 'Clothing', 'Books', 'ID/Card', 'Jewelry', 'Other'];

function Search({ apiUrl, baseUrl, user }) {
    const [searchType, setSearchType] = useState('type');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, itemId: null, itemKey: null });
    const [resultModal, setResultModal] = useState({ isOpen: false, message: '', type: 'success' });

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setResults([]);
        setSearched(false);
        try {
            let url;
            if (searchType === 'type') {
                url = `${apiUrl}/items/search/type/${encodeURIComponent(query)}`;
            } else {
                url = `${apiUrl}/items/search/description/${encodeURIComponent(query)}`;
            }
            const response = await axios.get(url);
            if (response.data.success) {
                setResults(response.data.items || []);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    const handleReunite = (item) => {
        setConfirmModal({ isOpen: true, itemId: item.report_id, itemKey: item.id });
    };

    const confirmReunite = async () => {
        const { itemId, itemKey } = confirmModal;
        setConfirmModal({ isOpen: false, itemId: null, itemKey: null });
        try {
            const response = await axios.put(`${apiUrl}/items/resolve/${itemId}`, { userId: user.id });
            if (response.data.success) {
                setResults(prev => prev.filter(i => i.id !== itemKey));
                setResultModal({ isOpen: true, message: 'Item marked as reunited! Great job.', type: 'success' });
            } else {
                setResultModal({ isOpen: true, message: response.data.message || 'Could not resolve item.', type: 'error' });
            }
        } catch (err) {
            setResultModal({ isOpen: true, message: 'Server error. Please try again.', type: 'error' });
        }
    };

    return (
        <div>
            <div className="search-page-header">
                <h1>Search Items</h1>
                <p>Search the database of reported lost and found items.</p>
            </div>

            <form className="filter-bar" onSubmit={handleSearch}>
                <select value={searchType} onChange={e => { setSearchType(e.target.value); setQuery(''); }}>
                    <option value="type">Search by Type</option>
                    <option value="description">Search by Description</option>
                </select>

                {searchType === 'type' ? (
                    <select value={query} onChange={e => setQuery(e.target.value)}>
                        <option value="">Select type…</option>
                        {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Keyword — e.g. black wallet, iPhone"
                    />
                )}

                <button type="submit" className="search-btn" disabled={loading || !query}>
                    {loading ? 'Searching…' : 'Search'}
                </button>
            </form>

            {loading && (
                <div className="loading"><div className="loading-spinner" /></div>
            )}

            {!loading && searched && results.length === 0 && (
                <div className="empty-state">
                    <p>No items found matching your search.</p>
                    <p>Try a different keyword or browse all items.</p>
                </div>
            )}

            {results.length > 0 && (
                <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        {results.length} result{results.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="items-grid">
                        {results.map(item => (
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
                                        <span className={`item-badge ${item.is_found ? 'found' : 'lost'}`}>{item.is_found ? 'Found' : 'Lost'}</span>
                                        <span className="item-badge">{item.item_type}</span>
                                    </div>
                                    <p className="card-description">{item.description}</p>
                                    <p className="card-meta">📍 {item.location || 'Location not specified'}</p>
                                    {String(item.user_id) === String(user.id) && (
                                        <div className="card-action">
                                            <button className="btn-secondary" onClick={() => handleReunite(item)}>
                                                Mark as Reunited
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                type="confirm"
                message="Mark this item as reunited? This will remove it from the active list."
                onConfirm={confirmReunite}
                onCancel={() => setConfirmModal({ isOpen: false, itemId: null, itemKey: null })}
            />
            <ConfirmModal
                isOpen={resultModal.isOpen}
                type={resultModal.type}
                message={resultModal.message}
                onCancel={() => setResultModal({ isOpen: false, message: '', type: 'success' })}
            />
            {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        </div>
    );
}

export default Search;
