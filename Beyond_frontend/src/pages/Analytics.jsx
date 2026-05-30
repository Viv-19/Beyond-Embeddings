import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, FileText, ArrowLeft, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Analytics.css';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = sessionStorage.getItem('be_admin_token');
                
                if (!token) {
                    toast.error('Admin access required');
                    navigate('/admin');
                    return;
                }

                const res = await fetch(`${API_BASE}/analytics/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await res.json();

                if (res.ok) {
                    setStats(data.data);
                } else {
                    if (res.status === 401 || res.status === 403) {
                        sessionStorage.removeItem('be_admin_token');
                        toast.error('Session expired or access denied');
                        navigate('/admin');
                    }
                    setError(data.message || 'Failed to load analytics');
                }
            } catch (err) {
                console.error(err);
                setError('Network error. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate]);

    if (loading) {
        return (
            <div className="analytics-page container fade-in" style={{ textAlign: 'center', padding: '10rem 0' }}>
                <div className="skeleton-pulse" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--border-color)', margin: '0 auto 1rem' }}></div>
                <h2 className="text-muted">Loading Dashboard...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-page container fade-in" style={{ textAlign: 'center', padding: '10rem 0' }}>
                <h2 style={{ color: 'red' }}>Error</h2>
                <p>{error}</p>
                <Link to="/admin" className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Admin</Link>
            </div>
        );
    }

    if (!stats) return null;

    // Helper to calculate max height for chart bars
    const maxDailyVisits = Math.max(...Object.values(stats.dailyVisits), 1); // Avoid div by 0

    return (
        <div className="analytics-page container fade-in">
            <header className="analytics-header">
                <div>
                    <Link to="/admin" className="back-link" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
                        <ArrowLeft size={16} />
                        <span>Back to CMS</span>
                    </Link>
                    <h1>Analytics Dashboard</h1>
                </div>
            </header>

            {/* Top Stat Cards */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-title"><Eye size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }}/> Total Views</div>
                    <div className="stat-value">{stats.totalVisits.toLocaleString()}</div>
                    <div className="stat-trend">+{stats.visitsThisWeek.toLocaleString()} this week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title"><Users size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }}/> Registered Users</div>
                    <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                    <div className="stat-trend">+{stats.newUsersThisWeek.toLocaleString()} this week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title"><FileText size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }}/> Total Posts</div>
                    <div className="stat-value">{stats.totalPosts.toLocaleString()}</div>
                    <div className="stat-trend">{stats.totalComments.toLocaleString()} comments</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title"><BarChart3 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }}/> Views Today</div>
                    <div className="stat-value">{stats.visitsToday.toLocaleString()}</div>
                    <div className="stat-trend">Last 24 hours</div>
                </div>
            </div>

            {/* Visit Chart */}
            <div className="chart-section">
                <h2 className="chart-title">Traffic Overview (Last 14 Days)</h2>
                <div className="chart-container">
                    {Object.entries(stats.dailyVisits).map(([date, count]) => {
                        const heightPct = (count / maxDailyVisits) * 100;
                        const dateObj = new Date(date);
                        const displayDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                        
                        return (
                            <div key={date} className="chart-bar-wrapper">
                                <div className="chart-tooltip">{count} views<br/>{displayDate}</div>
                                <div 
                                    className="chart-bar" 
                                    style={{ height: `${Math.max(heightPct, 1)}%` }}
                                ></div>
                                <div className="chart-label">{displayDate}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lists Grid */}
            <div className="lists-grid">
                <div className="list-card">
                    <h2 className="chart-title">Top Performing Posts</h2>
                    <table className="top-posts-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Views</th>
                                <th>Likes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topPosts.length > 0 ? (
                                stats.topPosts.map(post => (
                                    <tr key={post.id}>
                                        <td>
                                            <Link to={`/post/${post.slug || post.id}`} target="_blank" style={{ fontWeight: 500 }}>
                                                {post.title || 'Untitled Post'}
                                            </Link>
                                        </td>
                                        <td><span className="badge">{post.type}</span></td>
                                        <td style={{ fontWeight: 600 }}>{post.views.toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{post.likes.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No posts available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="list-card">
                    <h2 className="chart-title">Content Breakdown</h2>
                    <div className="type-breakdown">
                        {['blogs', 'experiments', 'papers', 'notes'].map(type => (
                            <div key={type} className="type-row">
                                <span className="type-name">{type}</span>
                                <span className="type-count">{stats.postsByType[type] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
