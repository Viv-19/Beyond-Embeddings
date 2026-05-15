import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadContent, saveContent } from '../utils/storage';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(loadContent());

    useEffect(() => {
        saveContent(content);
    }, [content]);

    const addEntry = useCallback((type, entry) => {
        const newEntry = {
            ...entry,
            id: entry.id || Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }),
            views: 0,
            likes: 0,
            comments: []
        };

        setContent(prev => ({
            ...prev,
            [type]: [newEntry, ...(prev[type] || [])]
        }));
    }, []);

    const addComment = useCallback((type, postId, commentText, authorName) => {
        setContent(prev => ({
            ...prev,
            [type]: prev[type].map(item =>
                item.id === postId
                    ? {
                        ...item,
                        comments: [...(item.comments || []), {
                            id: Date.now().toString(),
                            text: commentText,
                            author: authorName || 'Guest',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        }]
                    }
                    : item
            )
        }));
    }, []);

    const deleteEntry = useCallback((type, id) => {
        setContent(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    }, []);

    const incrementMetric = useCallback((type, id, metric) => {
        setContent(prev => ({
            ...prev,
            [type]: prev[type].map(item =>
                item.id === id ? { ...item, [metric]: (item[metric] || 0) + 1 } : item
            )
        }));
    }, []);

    return (
        <ContentContext.Provider value={{ content, addEntry, addComment, deleteEntry, incrementMetric }}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => useContext(ContentContext);
