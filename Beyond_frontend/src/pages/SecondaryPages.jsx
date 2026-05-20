import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import ArticleCard from '../components/ArticleCard';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Share2, MessageCircle, Heart, MoreHorizontal, Link as LinkIcon, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import './About.css';
import './Notes.css';

export const About = () => (
    <div className="about-page container fade-in">
        <div className="about-header">
            <div className="about-image-wrapper">
                <img src="/assets/vivesh.jpeg" alt="Vivesh Kumar Singh" className="about-image" />
            </div>
            <div className="about-title-box">
                <h1 className="about-title">About Me</h1>
                <p className="about-tagline">AI Researcher & Engineer | IIIT Lucknow</p>
            </div>
        </div>

        <div className="about-content">
            <p>
                I’m <strong>Vivesh Kumar Singh</strong>, an AI researcher and engineer with a strong foundation in mathematics and a deep interest in understanding what actually happens inside modern AI systems.
            </p>

            <p>
                I’m currently an <strong>AI Research Scientist Intern at TCS</strong>, working on large language model problem statements in collaboration with <strong>Intel</strong>. This blog is an extension of that work and the way I think about AI—grounded in real LLM problems, system behavior, and practical research questions rather than abstractions alone.
            </p>

            <p>
                I’m also pursuing a <strong>Master’s degree in Artificial Intelligence & Machine Learning at IIIT Lucknow</strong>, after completing my Bachelor’s degree in Mathematics. This academic background naturally pushed me toward asking why models behave the way they do, not just how to use them.
            </p>

            <p>
                Previously, I worked as an <strong>AI Engineer Intern at INAI World Private Limited</strong>, where I gained hands-on experience building and deploying applied AI systems.
            </p>

            <p>
                This blog, <strong>BeyondEmbeddings</strong>, is where I document that journey.
            </p>

            <div className="about-focus-section">
                <h3>Here, I focus on the nuts and bolts of AI:</h3>
                <ul>
                    <li>How large language models reason</li>
                    <li>How RAG systems fail and succeed</li>
                    <li>What happens inside attention, embeddings, inference, and evaluation</li>
                    <li>And how research ideas translate (or don’t) into real systems</li>
                </ul>
            </div>

            <p>
                Rather than surface-level tutorials, my goal is to share deep, honest insights—including experiments, mistakes, and open questions—so readers can build intuition about what’s happening beneath the abstractions.
            </p>

            <p>
                If you’re interested in going beyond APIs and understanding what’s actually inside AI, you’re in the right place.
            </p>
        </div>
    </div>
);

const ContentSection = ({ title, type, description }) => {
    const { content } = useContent();
    const items = content[type] || [];

    return (
        <div className="container fade-in" style={{ padding: '4rem 0' }}>
            <h1 className="substack-page-title">{title}</h1>
            <p className="text-muted" style={{ fontSize: '1.15rem', marginBottom: '3rem', maxWidth: '700px' }}>
                {description}
            </p>

            {items.length === 0 ? (
                <div className="empty-state">
                    <p className="text-muted">No {title.toLowerCase()} published yet. Coming soon.</p>
                </div>
            ) : (
                <div className="publications-list">
                    {items.map(item => (
                        <ArticleCard key={item.id} post={{ ...item, category: title.slice(0, -1) }} variant="list" />
                    ))}
                </div>
            )}
        </div>
    );
};

export const Notes = () => {
    const { content, incrementMetric, addComment } = useContent();
    const { user } = useUserAuth();
    const navigate = useNavigate();
    const [showShareMenu, setShowShareMenu] = useState(null);
    const [activeCommentBox, setActiveCommentBox] = useState(null);
    const [activeReplyBox, setActiveReplyBox] = useState(null);
    const [comment, setComment] = useState('');
    const [replyText, setReplyText] = useState('');
    const items = content.notes || [];

    const handleCopyLink = (id) => {
        const url = `${window.location.origin}/post/${id}`;
        navigator.clipboard.writeText(url);
        setShowShareMenu(null);
    };

    const handlePostComment = (postId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!comment.trim()) return;
        addComment('notes', postId, comment, user.username);
        setComment('');
    };

    const handlePostReply = (postId, parentId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!replyText.trim()) return;
        addComment('notes', postId, replyText, user.username, parentId);
        setReplyText('');
        setActiveReplyBox(null);
    };

    const handleLike = (postId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        incrementMetric('notes', postId, 'likes');
    };

    const handleDislike = (postId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        incrementMetric('notes', postId, 'dislikes');
    };

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '600px' }}>
            <h1 className="page-title-elegant">Chat</h1>

            <div className="notes-feed">
                {items.length === 0 ? (
                    <div className="empty-feed">
                        <p className="text-muted">No research logs shared yet. Visit the Admin panel to start the conversation.</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="note-card-instagram">
                            <div className="note-header-instagram">
                                <div className="note-author-instagram">
                                    <img src="/assets/vivesh.jpeg" alt="Vivesh" className="note-avatar-substack" />
                                    <div className="note-author-info-substack">
                                        <div className="note-author-name-substack">
                                            Vivesh Kumar Singh <span className="verified-badge-red">✓</span>
                                        </div>
                                        <div className="note-date-substack">{item.date}</div>
                                    </div>
                                </div>
                                <button className="note-more-btn" onClick={() => setShowShareMenu(showShareMenu === item.id ? null : item.id)}>
                                    <MoreHorizontal size={20} />
                                </button>

                                {showShareMenu === item.id && (
                                    <div className="share-dropdown-instagram fade-in">
                                        <button onClick={() => handleCopyLink(item.id)}>
                                            <LinkIcon size={14} /> <span>Copy link</span>
                                        </button>
                                        <button>
                                            <Share2 size={14} /> <span>Share to X</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="note-body-instagram">
                                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                                    {item.body}
                                </ReactMarkdown>
                            </div>

                            <div className="note-footer-instagram">
                                <div className="note-actions-instagram">
                                    <div className="note-actions-substack">
                                        <button
                                            className={`substack-action-btn ${item.likes > 0 ? 'liked' : ''}`}
                                            onClick={() => handleLike(item.id)}
                                        >
                                            <ThumbsUp size={20} fill={item.likes > 0 ? "var(--accent-primary)" : "none"} />
                                            <span>{item.likes || 0}</span>
                                        </button>
                                        <button
                                            className={`substack-action-btn ${item.dislikes > 0 ? 'disliked' : ''}`}
                                            onClick={() => handleDislike(item.id)}
                                        >
                                            <ThumbsDown size={20} fill={item.dislikes > 0 ? "#ff4d4f" : "none"} />
                                            <span>{item.dislikes || 0}</span>
                                        </button>
                                        <button
                                            className="substack-action-btn"
                                            onClick={() => setActiveCommentBox(activeCommentBox === item.id ? null : item.id)}
                                        >
                                            <MessageCircle size={20} />
                                            <span>{item.comments ? item.comments.length : 0}</span>
                                        </button>
                                        <button className="substack-action-btn" onClick={() => handleCopyLink(item.id)}>
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="note-stats-instagram">
                                    <span className="likes-count">{item.likes || 0} likes</span>
                                    <span className="dot-separator">•</span>
                                    <span className="likes-count">{item.dislikes || 0} dislikes</span>
                                </div>

                                {/* Comments Display */}
                                {item.comments && item.comments.length > 0 && (
                                    <div className="comments-list-instagram">
                                        {item.comments.filter(c => !c.parent_id).map(c => {
                                            const replies = item.comments.filter(r => r.parent_id === c.id);
                                            return (
                                                <div key={c.id} className="comment-thread-container">
                                                    <div className="comment-item-instagram parent-comment">
                                                        <div className="comment-text-group">
                                                            <span className="comment-author">
                                                                {c.author || 'Researcher'}
                                                                {c.role === 'admin' && <span className="admin-badge-inline">Author</span>}:
                                                            </span>
                                                            <span className="comment-text">{c.text}</span>
                                                        </div>
                                                        
                                                        {/* Inline Reply Trigger for Admin */}
                                                        {user && user.role === 'admin' && (
                                                            <button 
                                                                className="reply-trigger-btn"
                                                                onClick={() => {
                                                                    setActiveReplyBox(activeReplyBox === c.id ? null : c.id);
                                                                    setReplyText('');
                                                                }}
                                                            >
                                                                Reply
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Indented Replies */}
                                                    {replies.length > 0 && (
                                                        <div className="replies-list-indented">
                                                            {replies.map(r => (
                                                                <div key={r.id} className="comment-item-instagram reply-comment">
                                                                    <span className="comment-author reply-author">
                                                                        {r.author || 'Researcher'}
                                                                        {r.role === 'admin' && <span className="admin-badge-inline">Author</span>}:
                                                                    </span>
                                                                    <span className="comment-text">{r.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Inline Reply Form for Admin */}
                                                    {activeReplyBox === c.id && (
                                                        <div className="reply-input-area fade-in">
                                                            <input
                                                                type="text"
                                                                placeholder="Write a reply..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && handlePostReply(item.id, c.id)}
                                                            />
                                                            <button
                                                                className="post-reply-btn"
                                                                disabled={!replyText.trim()}
                                                                onClick={() => handlePostReply(item.id, c.id)}
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeCommentBox === item.id && (
                                    <div className="comment-section-instagram fade-in">
                                        <div className="comment-input-area">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handlePostComment(item.id)}
                                            />
                                            <button
                                                className="post-comment-btn"
                                                disabled={!comment.trim()}
                                                onClick={() => handlePostComment(item.id)}
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const Experiments = () => (
    <ContentSection
        title="Experiments"
        type="experiments"
    />
);

export const Papers = () => (
    <ContentSection
        title="Papers"
        type="papers"
    />
);

export const Archive = () => {
    const { content } = useContent();
    const all = [...content.blogs, ...content.notes, ...content.experiments, ...content.papers]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="container fade-in" style={{ padding: '6rem 0' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '3rem' }}>Archive</h1>
            <div className="publications-list">
                {all.map(item => (
                    <ArticleCard key={item.id} post={item} variant="list" />
                ))}
            </div>
        </div>
    );
};

export const Privacy = () => (
    <div className="container fade-in" style={{ padding: '6rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Privacy Policy</h1>
        <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p>This is a personal research blog. I do not collect any personal data from visitors, nor do I use tracking cookies.</p>
            <p style={{ marginTop: '1rem' }}>Any information you share via email or LinkedIn is handled personally and professionally.</p>
        </div>
    </div>
);

export const Terms = () => (
    <div className="container fade-in" style={{ padding: '6rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Terms of Service</h1>
        <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p>All content on BeyondEmbeddings is the intellectual property of Vivesh Kumar Singh unless otherwise stated.</p>
            <p style={{ marginTop: '1rem' }}>Code snippets are provided for educational purposes. Feel free to use them in your own research with proper attribution.</p>
        </div>
    </div>
);
