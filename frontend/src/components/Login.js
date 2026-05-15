import React, { useState } from 'react';
import axios from 'axios';

function Login({ apiUrl, onLogin, onSwitchToRegister }) {
    const [formData, setFormData] = useState({ rollNumber: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.rollNumber.trim() || !formData.password.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/auth/login`, formData);
            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onLogin(response.data.user);
            } else {
                setError(response.data.message || 'Login failed.');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Invalid roll number or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <span className="auth-logo-text">L&F</span>
                </div>
                <h1 className="auth-heading">Welcome back</h1>
                <p className="auth-sub">Sign in to manage your lost &amp; found reports</p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Roll Number</label>
                        <input
                            type="text"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleChange}
                            placeholder="e.g. 22CS001"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider">Don't have an account?</div>
                <button className="auth-switch-btn" onClick={onSwitchToRegister}>
                    Create an account
                </button>
            </div>
        </div>
    );
}

export default Login;
