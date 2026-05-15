import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { Plus, Trash2, BookOpen, FileText, FlaskConical, ScrollText, Lock, LogOut, Code, FileDown, MessageCircle } from 'lucide-react';
import './Admin.css';

// SIMPLE AUTH CONFIG
const ADMIN_CREDENTIALS = {
    username: 'vivesh',
    password: 'researchblog2026'
};

const Admin = () => {
    const { content, addEntry, deleteEntry } = useContent();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    const [activeTab, setActiveTab] = useState('blogs');
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        title: '', subtitle: '', category: '', image: '', excerpt: '', readTime: '', slug: '',
        body: '', repoLink: '', pdfUrl: ''
    });

    useEffect(() => {
        const auth = sessionStorage.getItem('is_admin_authenticated');
        if (auth === 'true') setIsAuthenticated(true);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginForm.username === ADMIN_CREDENTIALS.username && loginForm.password === ADMIN_CREDENTIALS.password) {
            setIsAuthenticated(true);
            sessionStorage.setItem('is_admin_authenticated', 'true');
            setLoginError('');
        } else {
            setLoginError('Invalid credentials.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('is_admin_authenticated');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addEntry(activeTab, {
            ...formData,
            id: formData.slug || Date.now().toString()
        });
        setIsAdding(false);
        setFormData({ title: '', subtitle: '', category: '', image: '', excerpt: '', readTime: '', slug: '', body: '', repoLink: '', pdfUrl: '' });
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-page container fade-in">
                <div className="login-card">
                    <h1>Admin Access</h1>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} required />
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
                                <h3>{item.title || item.body.slice(0, 50) + '...'}</h3>
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
