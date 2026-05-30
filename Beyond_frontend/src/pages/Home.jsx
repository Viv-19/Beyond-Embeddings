import React from 'react';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import SkeletonCard from '../components/SkeletonCard';
import { useContent } from '../context/ContentContext';
import './Home.css';

const Home = () => {
    const { content, isLoading } = useContent();
    const allPosts = content.blogs || [];

    const featuredPost = allPosts[0];
    const remainingPosts = allPosts.slice(1);

    return (
        <div className="home-page fade-in">
            {isLoading && allPosts.length === 0 ? (
                <SkeletonCard variant="hero" />
            ) : (
                <Hero post={featuredPost} />
            )}

            <main className="container">
                <div className="section-header">
                    <h2 className="section-title">Latest Research</h2>
                </div>

                <div className="publications-list">
                    {isLoading && remainingPosts.length === 0 ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : remainingPosts.length > 0 ? (
                        remainingPosts.map(post => (
                            <ArticleCard key={post.id} post={{ ...post, category: 'Blog' }} variant="list" />
                        ))
                    ) : (
                        <div className="empty-state">
                            <p className="text-muted">More research insights, evaluations, and logs coming soon.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
