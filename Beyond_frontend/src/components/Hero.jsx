import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = ({ post }) => {
    if (!post) return null;

    return (
        <section className="hero fade-in">
            <div className="hero-content">
                <div className="hero-meta">
                    <span className="hero-category">Featured Post</span>
                    <span className="dot">•</span>
                    <span>{post.date}</span>
                </div>
                <Link to={`/post/${post.id}`}>
                    <h1 className="hero-title">{post.title}</h1>
                </Link>
                <p className="hero-excerpt">{post.excerpt}</p>
                <div className="hero-cta">
                    <Link to={`/post/${post.id}`} className="btn btn-primary">Read Article</Link>
                    <span className="read-time">{post.readTime}</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
