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
import { Plus, Trash2, BookOpen, FileText, FlaskConical, ScrollText, Lock, LogOut, Code, FileDown, MessageCircle, Edit, Eye, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// ...existing imports remain unchanged

// In ReactMarkdown component add remarkPlugins={[remarkMath, remarkGfm]}
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Admin.css';

const Admin = () => {
    const { content, addEntry, updateEntry, deleteEntry } = useContent();

    // --- Authentication State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // --- CMS State ---
    const [activeTab, setActiveTab] = useState('blogs');
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // --- Form State for creating new posts ---
    const [formData, setFormData] = useState({
        title: '', subtitle: '', category: '', image: '', excerpt: '', readTime: '', slug: '',
        body: '', repoLink: '', pdfUrl: ''
    });

    // ========================================================================
    // On mount: Enforce manual login
    // ========================================================================
    // We do NOT auto-login the admin from storage on mount.
    // The admin must ALWAYS enter their email and password to log in.
    // ========================================================================

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
            const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
            const res = await fetch(`${API_BASE}/auth/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginForm.email,
                    password: loginForm.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Store the admin token separately in sessionStorage so it clears on tab/browser close
                sessionStorage.setItem('be_admin_token', data.data.token);
                setIsAuthenticated(true);
                setLoginError('');
                toast.success('Successfully logged in as Admin');
            } else {
                setLoginError(data.message || 'Invalid credentials.');
                toast.error(data.message || 'Invalid credentials');
            }
        } catch (error) {
            setLoginError('Server error. Is the backend running?');
            toast.error('Server error. Is the backend running?');
        }
    };

    // ========================================================================
    // handleLogout — Clears admin session
    // ========================================================================
    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('be_admin_token');
    };

    // ========================================================================
    // handleInputChange — Updates form state as the admin types
    // ========================================================================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

// Helper to convert standard Google Drive file share links to direct raw image CDN urls
const convertGoogleDriveLink = (url) => {
    if (!url || typeof url !== 'string') return url;
    const driveRegex = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=)([^/\s?#]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/u/0/d/${match[1]}`;
    }
    return url;
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
        
        // Convert Google Drive link to direct raw CDN image link
        const processedImage = convertGoogleDriveLink(formData.image);
        
        const postPayload = {
            ...formData,
            image: processedImage,
            id: formData.slug || Date.now().toString()
        };

        if (editingItem) {
            updateEntry(activeTab, editingItem.id, postPayload);
            setEditingItem(null);
        } else {
            addEntry(activeTab, postPayload);
        }
        setIsAdding(false);
        setFormData({ title: '', subtitle: '', category: '', image: '', excerpt: '', readTime: '', slug: '', body: '', repoLink: '', pdfUrl: '' });
    };

    const handleStartEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title || '',
            subtitle: item.subtitle || '',
            category: item.category || '',
            image: item.image || '',
            excerpt: item.excerpt || '',
            readTime: item.readTime || '',
            slug: item.slug || item.id || '',
            body: item.body || '',
            repoLink: item.repoLink || '',
            pdfUrl: item.pdfUrl || ''
        });
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingItem(null);
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
                                        <label className="flex-label">
                                            Thumbnail Image URL 
                                            <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="drive-link" title="Upload to Google Drive and paste the shareable link here">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14l8-12 8 12M12 2v20m-8-8h16"/></svg>
                                                Open Drive
                                            </a>
                                        </label>
                                        <input name="image" value={formData.image} onChange={handleInputChange} placeholder="Paste Google Drive shareable link here..." />
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
                                    <div className="flex-label">
                                        <label>Blog Content (Markdown)</label>
                                        <button 
                                            type="button" 
                                            className="preview-toggle-btn" 
                                            onClick={() => setShowPreview(!showPreview)}
                                        >
                                            {showPreview ? <><Edit2 size={14} /> Edit</> : <><Eye size={14} /> Preview</>}
                                        </button>
                                    </div>
                                    {showPreview ? (
                                        <div className="markdown-preview-container">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkMath, remarkGfm]} 
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {formData.body || '*No content yet...*'}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <textarea 
                                            name="body" 
                                            value={formData.body} 
                                            onChange={handleInputChange} 
                                            rows="15" 
                                            className="body-editor" 
                                            placeholder="Paste your markdown content here... (Standard Medium format works)" 
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label>Chat Message (Post as Admin)</label>
                                <textarea name="body" value={formData.body} onChange={handleInputChange} rows="5" required placeholder="What's on your mind?..." />
                            </div>
                        )}
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="submit-btn">{editingItem ? 'Save Changes' : `Publish ${activeTab.slice(0, -1)}`}</button>
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
                            <div className="item-actions">
                                <button className="edit-btn-inline" onClick={() => handleStartEdit(item)}>
                                    <Edit size={16} />
                                </button>
                                <button className="delete-btn" onClick={() => deleteEntry(activeTab, item.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Admin;
