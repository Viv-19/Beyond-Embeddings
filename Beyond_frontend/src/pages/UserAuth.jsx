import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import './UserAuth.css';

const UserAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { login, register } = useUserAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate(-1); // Return to previous page (likely Chat)
            } else {
                setError('Invalid email or password.');
            }
        } else {
            const success = await register(formData.username, formData.email, formData.password);
            if (success) {
                navigate(-1);
            } else {
                setError('Email already exists or registration failed.');
            }
        }
    };

    return (
        <div className="auth-page container fade-in">
            <div className="auth-card">
                <h1>{isLogin ? 'Sign In' : 'Create Account'}</h1>
                <p className="auth-subtitle">Join the beyondEmbeddings research community</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit" className="auth-submit-btn">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-toggle">
                    {isLogin ? 'New to the blog?' : 'Already have an account?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserAuth;
