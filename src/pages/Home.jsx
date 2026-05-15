import React from 'react';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import { useContent } from '../context/ContentContext';
import './Home.css';

const Home = () => {
    const { content } = useContent();
    const allPosts = content.blogs || [];

    const featuredPost = allPosts[0];
    const remainingPosts = allPosts.slice(1);

    return (
        <div className="home-page fade-in">
            <Hero post={featuredPost} />

            <main className="container">
                <div className="section-header">
                    <h2 className="section-title">Latest Research</h2>
                </div>

                <div className="publications-list">
                    {remainingPosts.length > 0 ? (
                        remainingPosts.map(post => (
                            <ArticleCard key={post.id} post={{ ...post, category: 'Blog' }} variant="list" />
                        ))
                    ) : (
                        <p className="text-muted">No other posts published yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
