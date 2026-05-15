import React, { useState } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';

function Register({ apiUrl, onRegister, onSwitchToLogin }) {
    const [formData, setFormData] = useState({ name: '', rollNumber: '', phoneNumber: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.rollNumber.trim() || !formData.password.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/auth/register`, {
                name: formData.name,
                rollNumber: formData.rollNumber,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
            });
            if (response.data.success) {
                const newUser = {
                    id: response.data.userId,
                    name: formData.name,
                    rollNumber: formData.rollNumber,
                    phoneNumber: formData.phoneNumber,
                };
                setCreatedUser(newUser);
                setShowSuccess(true);
            } else {
                setError(response.data.message || 'Registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Roll number may already exist.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        if (createdUser) {
            localStorage.setItem('user', JSON.stringify(createdUser));
            onRegister(createdUser);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <span className="auth-logo-text">L&F</span>
                </div>
                <h1 className="auth-heading">Create account</h1>
                <p className="auth-sub">Join the campus lost &amp; found network</p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Roll Number</label>
                        <input
                            type="text"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleChange}
                            placeholder="e.g. 22CS001"
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Contact number"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 6 characters"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repeat your password"
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider">Already have an account?</div>
                <button className="auth-switch-btn" onClick={onSwitchToLogin}>
                    Sign in instead
                </button>
            </div>

            <ConfirmModal
                isOpen={showSuccess}
                type="success"
                message={`Account created successfully! Welcome, ${createdUser?.name || ''}.`}
                onCancel={handleSuccessClose}
            />
        </div>
    );
}

export default Register;
