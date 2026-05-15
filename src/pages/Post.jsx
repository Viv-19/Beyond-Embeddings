import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Code, FileDown } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { useContent } from '../context/ContentContext';
import './Post.css';

const Post = () => {
    const { id } = useParams();
    const { content: allContent, incrementMetric } = useContent();
    const [markdown, setMarkdown] = useState('');

    const post = useMemo(() => {
        const categories = ['blogs', 'notes', 'experiments', 'papers'];
        for (const type of categories) {
            const found = allContent[type].find(p => p.id === id);
            if (found) return { ...found, type };
        }
        return null;
    }, [id, allContent]);

    useEffect(() => {
        if (post) {
            incrementMetric(post.type, id, 'views');
        }
    }, [id, incrementMetric, post?.type]);

    useEffect(() => {
        if (post && post.body) {
            setMarkdown(post.body);
        } else if (id) {
            fetch(`/content/${id}.md`)
                .then(response => {
                    if (!response.ok) throw new Error('Not found');
                    return response.text();
                })
                .then(text => setMarkdown(text))
                .catch(err => {
                    console.error(err);
                    setMarkdown("# Content Not Found\nPlease check your research database or ensure the file exists in `public/content/`.");
                });
        }
    }, [id, post]);

    if (!post) {
        return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <h2>Publication not found.</h2>
            <Link to="/" style={{ color: 'var(--accent-primary)' }}>Return to home</Link>
        </div>;
    }

    return (
        <article className="post-page container fade-in">
            <header className="post-header">
                <Link to="/" className="back-link">← Back to publications</Link>
                <span className="post-category">{post.category || post.type}</span>

                <div className="post-title-area">
                    <h1 className="post-title">{post.title}</h1>

                    <div className="post-actions-row">
                        {post.repoLink && (
                            <a href={post.repoLink} target="_blank" rel="noopener noreferrer" className="action-link repo-link">
                                <Code size={18} />
                                <span>View Repository</span>
                            </a>
                        )}
                        {post.pdfUrl && (
                            <a href={post.pdfUrl} target="_blank" rel="noopener noreferrer" className="action-link pdf-link">
                                <FileDown size={18} />
                                <span>Download PDF</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="post-meta">
                    <span>{post.date}</span>
                    <span className="dot">•</span>
                    <span>{post.readTime}</span>
                    <span className="dot">•</span>
                    <span>👁 {post.views || 0} views</span>
                </div>
            </header>

            {post.image && (
                <div className="post-hero-image">
                    <img src={post.image} alt={post.title} />
                </div>
            )}

            <div className="post-content">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {markdown}
                </ReactMarkdown>
            </div>

            <footer className="post-footer">
                <div className="author-box">
                    <h3>Written by Vivesh Kumar Singh</h3>
                    <p>Research notes on the intersection of mechanistic interpretability and RAG systems.</p>
                </div>
            </footer>
        </article>
    );
};

export default Post;
