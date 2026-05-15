import React from 'react';

function ConfirmModal({ isOpen, message, type = 'confirm', onConfirm, onCancel }) {
    if (!isOpen) return null;

    const iconMap = {
        confirm: '⚠️',
        success: '✅',
        error: '❌',
    };

    return (
        <div className="modal-overlay" onClick={type === 'confirm' ? undefined : onCancel}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-icon">{iconMap[type] || '💬'}</div>
                <p className="modal-message">{message}</p>

                <div className="modal-actions">
                    {type === 'confirm' ? (
                        <>
                            <button className="modal-btn cancel" onClick={onCancel}>Cancel</button>
                            <button className="modal-btn confirm" onClick={onConfirm}>Confirm</button>
                        </>
                    ) : (
                        <button className="modal-btn ok" onClick={onCancel}>OK</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
