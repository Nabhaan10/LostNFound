import React, { useState } from 'react';
import axios from 'axios';

function Login({ apiUrl, onLogin, onSwitchToRegister }) {
    const [formData, setFormData] = useState({
        rollNumber: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/auth/login`, {
                rollNumber: formData.rollNumber,
                password: formData.password
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onLogin(response.data.user);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed. Please try again.');
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
                    👋 Welcome Back
                </h2>
                <p>
                    Login to your account
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
                    <div style={{marginBottom: '1.5rem'}}>
                        <label>
                            Roll Number
                        </label>
                        <input
                            type="text"
                            value={formData.rollNumber}
                            onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                            required
                            placeholder="Enter your roll number"
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
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            placeholder="Enter your password"
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
                        {loading ? '⏳ Logging in...' : '🚀 Login'}
                    </button>
                </form>

                <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
                    <p style={{color: '#666', fontSize: '0.9rem'}}>
                        Don't have an account?{' '}
                            <button
                                onClick={onSwitchToRegister}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#667eea',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontWeight: 'bold'
                                }}
                            >
                                Register here
                            </button>
                        </p>
                    </div>
            </div>
        </div>
    );
}

export default Login;
