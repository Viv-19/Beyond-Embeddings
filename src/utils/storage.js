const STORAGE_KEY = 'beyond_embeddings_content';

export const loadContent = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
        blogs: [],
        notes: [],
        experiments: [],
        papers: []
    };
};

export const saveContent = (content) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
};
