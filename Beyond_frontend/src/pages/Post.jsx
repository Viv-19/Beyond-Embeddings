import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Code, FileDown, ArrowLeft } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { useContent } from '../context/ContentContext';
import './Post.css';

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

// Custom Markdown Image Renderer Component
const CustomMarkdownImage = ({ src, alt, setLightbox, ...props }) => {
    const directSrc = convertGoogleDriveLink(src);
    const hasCaption = alt && alt.trim().length > 0;
    
    return (
        <span className="markdown-image-container">
            <img 
                src={directSrc} 
                alt={alt} 
                className="markdown-post-image"
                onClick={() => setLightbox({ src: directSrc, alt })}
                style={{ cursor: 'zoom-in' }}
                {...props} 
            />
            {hasCaption && (
                <span className="figure-caption">
                    {alt}
                </span>
            )}
        </span>
    );
};

const Post = () => {
    const { id } = useParams();
    const { content: allContent, incrementMetric } = useContent();
    const [markdown, setMarkdown] = useState('');
    const [lightbox, setLightbox] = useState(null);

    const post = useMemo(() => {
        const categories = ['blogs', 'notes', 'experiments', 'papers'];
        for (const type of categories) {
            const found = allContent[type].find(p => p.id === id);
            if (found) {
                return { 
                    ...found, 
                    type,
                    image: convertGoogleDriveLink(found.image) // Auto-convert Google Drive featured images
                };
            }
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
    }, [id, post?.body]);

    const markdownComponents = useMemo(() => ({
        img: ({ node, ...props }) => (
            <CustomMarkdownImage {...props} setLightbox={setLightbox} />
        )
    }), []);

    if (!post) {
        return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <h2>Publication not found.</h2>
            <Link to="/" style={{ color: 'var(--accent-primary)' }}>Return to home</Link>
        </div>;
    }

    return (
        <article className="post-page container fade-in">
            <Link to="/" className="back-link">
                <ArrowLeft size={16} />
                <span>Back to Research</span>
            </Link>

            <header className="post-header">
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
                </div>
            </header>

            {post.image && (
                <div className="post-hero-image">
                    <img src={post.image} alt={post.title} />
                </div>
            )}

            <div className="post-content">
                <ReactMarkdown 
                    components={markdownComponents} 
                    remarkPlugins={[remarkMath, remarkGfm]} 
                    rehypePlugins={[rehypeKatex]}
                >
                    {markdown}
                </ReactMarkdown>
            </div>

            <footer className="post-footer">
                <div className="author-box">
                    <h3>Written by Vivesh Kumar Singh</h3>
                    <p>Research notes on the intersection of mechanistic interpretability and RAG systems.</p>
                </div>
            </footer>

            {lightbox && (
                <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
                    <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close lightbox">&times;</button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={lightbox.src} alt={lightbox.alt} className="lightbox-image" />
                        {lightbox.alt && <p className="lightbox-caption">{lightbox.alt}</p>}
                    </div>
                </div>
            )}
        </article>
    );
};

export default Post;
