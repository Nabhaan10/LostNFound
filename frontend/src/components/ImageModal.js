import React from 'react';

function ImageModal({ imageUrl, itemType, onClose }) {
    if (!imageUrl) return null;

    return (
        <div 
            className="image-modal-overlay" 
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                cursor: 'pointer'
            }}
        >
            <div style={{
                position: 'relative',
                maxWidth: '70%',
                maxHeight: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '0',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 10000,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    ×
                </button>
                <img
                    src={imageUrl}
                    alt={itemType || 'Item image'}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                />
                <p style={{
                    color: 'white',
                    marginTop: '10px',
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    Click anywhere to close
                </p>
            </div>
        </div>
    );
}

export default ImageModal;
