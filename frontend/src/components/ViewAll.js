import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import ImageModal from './ImageModal';

const PAGE_SIZE = 9;

function ViewAll({ apiUrl, baseUrl, user }) {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, itemId: null, itemKey: null });
    const [resultModal, setResultModal] = useState({ isOpen: false, message: '', type: 'success' });

    useEffect(() => {
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    const loadItems = async () => {
        setLoading(true);
        try {
            let url;
            if (filter === 'lost')  url = `${apiUrl}/items/lost`;
            else if (filter === 'found') url = `${apiUrl}/items/found`;
            else url = `${apiUrl}/items/all`;

            const response = await axios.get(url);
            if (response.data.success) {
                setItems(response.data.items || []);
            }
        } catch (err) {
            console.error('Error loading items:', err);
        } finally {
            setLoading(false);
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
                setItems(prev => prev.filter(i => i.id !== itemKey));
                setResultModal({ isOpen: true, message: 'Item marked as reunited! Great job.', type: 'success' });
            } else {
                setResultModal({ isOpen: true, message: response.data.message || 'Could not resolve item.', type: 'error' });
            }
        } catch (err) {
            setResultModal({ isOpen: true, message: 'Server error. Please try again.', type: 'error' });
        }
    };

    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div>
            <div className="view-all-header">
                <h1>All Items</h1>
                <div className="filter-tabs">
                    {['all', 'lost', 'found'].map(f => (
                        <button
                            key={f}
                            className={`filter-tab${filter === f ? ' active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All Items' : f === 'lost' ? 'Lost' : 'Found'}
                        </button>
                    ))}
                </div>
            </div>

            {!loading && (
                <p className="results-meta">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                    {totalPages > 1 && ` — page ${page} of ${totalPages}`}
                </p>
            )}

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : pageItems.length === 0 ? (
                <div className="empty-state">
                    <p>No {filter !== 'all' ? filter : ''} items found.</p>
                </div>
            ) : (
                <div className="items-grid">
                    {pageItems.map(item => (
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
                                    <span className={`item-badge ${item.is_found ? 'found' : 'lost'}`}>
                                        {item.is_found ? 'Found' : 'Lost'}
                                    </span>
                                    <span className="item-badge">{item.item_type}</span>
                                </div>
                                <p className="card-description">{item.description}</p>
                                <p className="card-meta">📍 {item.location || 'Location not specified'}</p>
                                <p className="card-meta">👤 {item.reporter_name} &nbsp;|&nbsp; 📞 {item.phone_number}</p>
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
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            className={`page-btn${page === p ? ' active' : ''}`}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        className="page-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next →
                    </button>
                </div>
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

export default ViewAll;
