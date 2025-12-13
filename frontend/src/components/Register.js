import React, { useState } from 'react';
import axios from 'axios';

function Register({ apiUrl, onRegister, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        rollNumber: '',
        password: '',
        confirmPassword: '',
        name: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/auth/register`, {
                rollNumber: formData.rollNumber,
                password: formData.password,
                name: formData.name,
                phoneNumber: formData.phoneNumber
            });

            if (response.data.success) {
                alert('✅ Registration successful! Please login.');
                onSwitchToLogin();
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
        }}>
            <div className="login-card" style={{
                borderRadius: '20px',
                padding: '3rem',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <h2>
                    📝 Create Account
                </h2>
                <p>
                    Join the Lost & Found system
                </p>

                {error && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        color: '#c00'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '1rem'}}>
                        <label>
                            Roll Number *
                        </label>
                        <input
                            type="text"
                            value={formData.rollNumber}
                            onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                            required
                            placeholder="e.g., 2021CS001"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                        <label>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="Enter your full name"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                        <label>
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            required
                            placeholder="10-digit phone number"
                            pattern="[0-9]{10}"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                        <label>
                            Password *
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            placeholder="Minimum 6 characters"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{marginBottom: '1.5rem'}}>
                        <label>
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                            placeholder="Re-enter password"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? '⏳ Creating Account...' : '✨ Register'}
                    </button>
                </form>

                <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
                    <p style={{color: '#666', fontSize: '0.9rem'}}>
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#667eea',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontWeight: 'bold'
                            }}
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
