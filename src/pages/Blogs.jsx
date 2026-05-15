import React from 'react';
import { useContent } from '../context/ContentContext';
import ArticleCard from '../components/ArticleCard';
import './Blogs.css';

const Blogs = () => {
    const { content } = useContent();
    const blogs = content.blogs || [];

    return (
        <div className="blogs-page container fade-in">
            <header className="blogs-header">
                <h1 className="page-title">Research Publications</h1>
            </header>

            <div className="blogs-vertical-list">
                {blogs.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-muted">No blog posts yet. Visit the Admin panel to start writing.</p>
                    </div>
                ) : (
                    blogs.map(post => (
                        <div key={post.id} className="blog-list-item">
                            <ArticleCard post={post} variant="list" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Blogs;
