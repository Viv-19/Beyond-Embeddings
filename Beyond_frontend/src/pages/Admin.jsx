// ============================================================================
// Admin.jsx — Content Management System (CMS) Panel
// ============================================================================
//
// 🎓 LEARNING: This is the admin panel where you create and manage blog content.
//
// PREVIOUSLY (before restructuring):
//   - Admin credentials were HARDCODED in the frontend source code
//   - Anyone could view-source and see the username/password
//   - Authentication was a simple string comparison in the browser
//   - Content was stored in localStorage (lost on browser clear)
//
// NOW (after restructuring):
//   - Admin authenticates via the backend API (POST /api/auth/admin-login)
//   - Credentials are verified against bcrypt-hashed passwords in PostgreSQL
//   - A JWT token is returned and stored in localStorage
//   - Content is created via API calls and persisted in the database
//   - Even if someone inspects the frontend code, they can't log in
//     without valid credentials in the database
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { Plus, Trash2, BookOpen, FileText, FlaskConical, ScrollText, Lock, LogOut, Code, FileDown, MessageCircle } from 'lucide-react';
import './Admin.css';

const Admin = () => {
    const { content, addEntry, deleteEntry } = useContent();

    // --- Authentication State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // --- CMS State ---
    const [activeTab, setActiveTab] = useState('blogs');
    const [isAdding, setIsAdding] = useState(false);

    // --- Form State for creating new posts ---
    const [formData, setFormData] = useState({
        title: '', subtitle: '', category: '', image: '', excerpt: '', readTime: '', slug: '',
        body: '', repoLink: '', pdfUrl: ''
    });

    // ========================================================================
    // On mount: Check if admin is already authenticated
    // ========================================================================
    // 🎓 LEARNING: We check for an existing admin token in localStorage.
    // If found, we verify it's still valid by calling the /me endpoint.
    // This allows the admin to stay logged in across page refreshes.
    // ========================================================================
    useEffect(() => {
        const token = localStorage.getItem('be_admin_token');
        if (token) {
            // Verify the token is still valid
            fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Token invalid');
                })
                .then(data => {
                    // Only allow admin role
                    if (data.data.user.role === 'admin') {
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem('be_admin_token');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('be_admin_token');
                });
        }
    }, []);

    // ========================================================================
    // handleLogin — Authenticates admin via the backend API
    // ========================================================================
    // 🎓 LEARNING: We call POST /api/auth/admin-login instead of the regular
    // login endpoint. The backend checks BOTH the password AND the role.
    // Even if someone has a valid reader account, they can't access the CMS.
    // ========================================================================
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            const res = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginForm.email,
                    password: loginForm.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Store the admin token separately from the user token
                localStorage.setItem('be_admin_token', data.data.token);
                setIsAuthenticated(true);
                setLoginError('');
            } else {
                setLoginError(data.message || 'Invalid credentials.');
            }
        } catch (error) {
            setLoginError('Server error. Is the backend running?');
        }
    };

    // ========================================================================
    // handleLogout — Clears admin session
    // ========================================================================
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('be_admin_token');
    };

    // ========================================================================
    // handleInputChange — Updates form state as the admin types
    // ========================================================================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ========================================================================
    // handleSubmit — Creates a new post via the content context
    // ========================================================================
    // 🎓 LEARNING: The addEntry function in ContentContext handles the API call.
    // We just pass the type and data, and the context handles authentication
    // (sending the JWT token) and re-fetching the updated content.
    // ========================================================================
    const handleSubmit = (e) => {
        e.preventDefault();
        addEntry(activeTab, {
            ...formData,
            id: formData.slug || Date.now().toString()
        });
        setIsAdding(false);
        setFormData({ title: '', subtitle: '', category: '', image: '', excerpt: '', readTime: '', slug: '', body: '', repoLink: '', pdfUrl: '' });
    };

    // ========================================================================
    // RENDER: Login Screen (if not authenticated)
    // ========================================================================
    if (!isAuthenticated) {
        return (
            <div className="admin-login-page container fade-in">
                <div className="login-card">
                    <h1>Admin Access</h1>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                        </div>
                        {loginError && <p className="error-msg">{loginError}</p>}
                        <button type="submit" className="login-btn">Secure Login</button>
                    </form>
                </div>
            </div>
        );
    }

    // ========================================================================
    // RENDER: CMS Dashboard (if authenticated)
    // ========================================================================
    const tabs = [
        { id: 'blogs', name: 'Blogs', icon: <BookOpen size={18} /> },
        { id: 'notes', name: 'Chat', icon: <MessageCircle size={18} /> },
        { id: 'experiments', name: 'Experiments', icon: <FlaskConical size={18} /> },
        { id: 'papers', name: 'Papers', icon: <ScrollText size={18} /> }
    ];

    return (
        <div className="admin-page container fade-in">
            <header className="admin-header">
                <div className="admin-header-main">
                    <h1>CMS - {tabs.find(t => t.id === activeTab).name}</h1>
                    <button onClick={handleLogout} className="logout-btn"><LogOut size={18} /> Logout</button>
                </div>
            </header>

            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button key={tab.id} className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setIsAdding(false); }}>
                        {tab.icon} <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            <div className="admin-content">
                <div className="content-header">
                    <h2>Manage {tabs.find(t => t.id === activeTab).name}</h2>
                    <button className="add-btn" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> <span>Create New</span>
                    </button>
                </div>

                {isAdding && (
                    <form className="admin-form" onSubmit={handleSubmit}>
                        {activeTab !== 'notes' ? (
                            <>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input name="title" value={formData.title} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug / ID</label>
                                        <input name="slug" value={formData.slug} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Thumbnail Image URL</label>
                                        <input name="image" value={formData.image} onChange={handleInputChange} placeholder="/assets/..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Read Time</label>
                                        <input name="readTime" value={formData.readTime} onChange={handleInputChange} placeholder="5 min read" />
                                    </div>
                                    {activeTab === 'experiments' && (
                                        <div className="form-group">
                                            <label>Repo Link (e.g. GitHub)</label>
                                            <input name="repoLink" value={formData.repoLink} onChange={handleInputChange} placeholder="https://github.com/..." />
                                        </div>
                                    )}
                                    {activeTab === 'papers' && (
                                        <div className="form-group">
                                            <label>PDF Link / URL</label>
                                            <input name="pdfUrl" value={formData.pdfUrl} onChange={handleInputChange} placeholder="https://..." />
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Excerpt / Summary</label>
                                    <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows="2" />
                                </div>
                                <div className="form-group">
                                    <label>Blog Content (Markdown)</label>
                                    <textarea name="body" value={formData.body} onChange={handleInputChange} rows="15" className="body-editor" placeholder="Paste your markdown content here... (Standard Medium format works)" />
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label>Chat Message (Post as Admin)</label>
                                <textarea name="body" value={formData.body} onChange={handleInputChange} rows="5" required placeholder="What's on your mind?..." />
                            </div>
                        )}
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
                            <button type="submit" className="submit-btn">Publish {activeTab.slice(0, -1)}</button>
                        </div>
                    </form>
                )}

                <div className="content-list">
                    {content[activeTab].map(item => (
                        <div key={item.id} className="admin-item">
                            <div className="item-info">
                                <h3>{item.title || item.body?.slice(0, 50) + '...'}</h3>
                                <p className="text-small text-muted">{item.date}</p>
                            </div>
                            <button className="delete-btn" onClick={() => deleteEntry(activeTab, item.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Admin;
