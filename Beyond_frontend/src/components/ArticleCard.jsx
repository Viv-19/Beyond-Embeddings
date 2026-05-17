import React from 'react';
import { Link } from 'react-router-dom';
import './ArticleCard.css';

const ArticleCard = ({ post, variant = 'grid' }) => {
    return (
        <div className={`article-card article-card-${variant}`}>
            {post.image && (
                <div className="article-card-image-wrapper">
                    <img src={post.image} alt={post.title} className="article-card-image" />
                </div>
            )}
            <div className="article-card-content">
                <div className="article-card-meta">
                    <span className="article-card-category">{post.category}</span>
                    <span className="dot">•</span>
                    <span>{post.date}</span>
                </div>
                <Link to={`/post/${post.id}`}>
                    <h3 className="article-card-title">{post.title}</h3>
                </Link>
                <p className="article-card-excerpt">{post.excerpt}</p>
                <div className="article-card-footer">
                    <span className="read-time">{post.readTime}</span>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
