// ============================================================================
// ContentContext.jsx — Blog Content State Management
// ============================================================================
//
// 🎓 LEARNING: This context manages ALL content for the blog.
// It fetches data from the backend API and provides it to every component
// in the React tree via the `useContent()` hook.
//
// PREVIOUSLY (before restructuring):
//   - All content was stored in localStorage as a JSON blob
//   - Adding/deleting content only affected the current browser
//   - Content was lost if you cleared browser data
//   - No persistence across devices
//
// NOW (after restructuring):
//   - Content is stored in a PostgreSQL database via the backend API
//   - Changes persist permanently and are visible to all users
//   - The frontend fetches fresh data from the API
//   - Admin creates content via API → database → visible to everyone
//
// 🎓 LEARNING: State Management Pattern
// We load content on mount, then provide:
//   - content: The current state (blogs, notes, experiments, papers)
//   - addEntry: Create new content (calls POST /api/posts)
//   - deleteEntry: Remove content (calls DELETE /api/posts/:id)
//   - addComment: Post a comment (calls POST /api/comments)
//   - incrementMetric: Track views/likes (calls PATCH /api/posts/:id/:metric)
//   - refreshContent: Re-fetch from API (used after mutations)
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
    // --- State: Organized by content type ---
    // Each type maps to an array of post objects from the database
    const [content, setContent] = useState({
        blogs: [],
        notes: [],
        experiments: [],
        papers: []
    });

    // ========================================================================
    // fetchAllContent — Loads content from the backend API
    // ========================================================================
    // 🎓 LEARNING: We fetch ALL posts in one request and then split them
    // by type on the client side. This is simpler than making 4 separate
    // API calls (one per type). For a blog with <1000 posts, this is fine.
    // For a larger app, you'd paginate or fetch by type.
    // ========================================================================
    const fetchAllContent = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/posts`);
            const data = await res.json();

            if (res.ok && data.data) {
                // Split the flat array into type-specific arrays
                const organized = {
                    blogs: [],
                    notes: [],
                    experiments: [],
                    papers: []
                };

                data.data.forEach(post => {
                    // Map database fields to the format our components expect
                    const mapped = {
                        ...post,
                        id: post.slug || post.id,  // Use slug as ID for URL routing
                        _dbId: post.id,             // Keep the real DB id for API calls
                        date: new Date(post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        }),
                        readTime: post.readTime || '5 min read',
                        category: post.category || 'Blog',
                        views: post.views || 0,
                        likes: post.likes || 0,
                        comments: post.comments || [],
                        commentCount: post._count?.comments || 0
                    };

                    if (organized[post.type]) {
                        organized[post.type].push(mapped);
                    }
                });

                setContent(organized);
            }
        } catch (error) {
            console.error('Failed to fetch content:', error);
        }
    }, []);

    // Load content when the component mounts
    useEffect(() => {
        fetchAllContent();
    }, [fetchAllContent]);

    // ========================================================================
    // addEntry — Creates new content via the backend API
    // ========================================================================
    // @param {string} type — "blogs", "experiments", "papers", or "notes"
    // @param {object} entry — The post data (title, body, slug, etc.)
    //
    // 🎓 LEARNING: After creating a post, we call refreshContent() to
    // re-fetch from the database. This ensures the UI shows the exact data
    // that was saved (including server-generated fields like id, created_at).
    // This is called the "optimistic vs pessimistic update" decision:
    //   - Optimistic: Update UI immediately, then sync with server (faster UX)
    //   - Pessimistic: Wait for server confirmation, then update UI (safer)
    // We use pessimistic here because content creation is rare (admin-only)
    // and correctness is more important than speed.
    // ========================================================================
    const addEntry = useCallback(async (type, entry) => {
        try {
            // Get the admin JWT token from sessionStorage
            const token = localStorage.getItem('be_admin_token');

            const res = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type,
                    ...entry
                })
            });

            if (res.ok) {
                // Re-fetch all content to ensure UI matches the database
                await fetchAllContent();
            } else {
                const errData = await res.json();
                console.error('Failed to create post:', errData.message);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }, [fetchAllContent]);

    // ========================================================================
    // addComment — Posts a comment via the backend API
    // ========================================================================
    // @param {string} type — Content type (used for local state lookup)
    // @param {string} postId — The slug/ID of the post
    // @param {string} commentText — The comment content
    // @param {string} authorName — Unused now (derived from JWT on backend)
    //
    // 🎓 LEARNING: Notice that `authorName` is no longer used — the backend
    // determines who is commenting from the JWT token. This prevents users
    // from impersonating others by sending a fake author name.
    // ========================================================================
    const addComment = useCallback(async (type, postId, commentText, authorName) => {
        try {
            const token = localStorage.getItem('be_token');

            // We need the database ID, not the slug
            // Find the post in our local state to get its _dbId
            const post = content[type]?.find(p => p.id === postId);
            const dbId = post?._dbId || postId;

            const res = await fetch(`${API_BASE}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    postId: dbId,
                    text: commentText
                })
            });

            if (res.ok) {
                // Re-fetch to get the updated comment list
                await fetchAllContent();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    }, [content, fetchAllContent]);

    // ========================================================================
    // deleteEntry — Removes content via the backend API
    // ========================================================================
    // @param {string} type — Content type
    // @param {string} id — The slug/ID of the post to delete
    // ========================================================================
    const deleteEntry = useCallback(async (type, id) => {
        try {
            const token = localStorage.getItem('be_admin_token');

            // Find the database ID from the slug
            const post = content[type]?.find(p => p.id === id);
            const dbId = post?._dbId || id;

            const res = await fetch(`${API_BASE}/posts/${dbId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                await fetchAllContent();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }, [content, fetchAllContent]);

    // ========================================================================
    // incrementMetric — Increment views or likes via the backend API
    // ========================================================================
    // @param {string} type — Content type
    // @param {string} id — The slug/ID of the post
    // @param {string} metric — "views" or "likes"
    //
    // 🎓 LEARNING: For views, we update optimistically (show +1 immediately)
    // because waiting for the server would feel sluggish. For likes, we
    // also update optimistically and let the server be the source of truth.
    // ========================================================================
    const incrementMetric = useCallback(async (type, id, metric) => {
        // Optimistic update — show the change immediately in the UI
        setContent(prev => ({
            ...prev,
            [type]: prev[type].map(item =>
                item.id === id ? { ...item, [metric]: (item[metric] || 0) + 1 } : item
            )
        }));

        // Then sync with the server
        try {
            const post = content[type]?.find(p => p.id === id);
            const dbId = post?._dbId || id;

            await fetch(`${API_BASE}/posts/${dbId}/${metric}`, {
                method: 'PATCH'
            });
        } catch (error) {
            console.error(`Error incrementing ${metric}:`, error);
        }
    }, [content]);

    return (
        <ContentContext.Provider value={{ content, addEntry, addComment, deleteEntry, incrementMetric, refreshContent: fetchAllContent }}>
            {children}
        </ContentContext.Provider>
    );
};

// Custom hook for consuming the content context
// Usage: const { content, addEntry } = useContent();
export const useContent = () => useContext(ContentContext);
