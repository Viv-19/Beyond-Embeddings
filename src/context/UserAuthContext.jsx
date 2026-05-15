import React, { createContext, useContext, useState, useEffect } from 'react';

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('blog_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Simple mock logic: look for user in local storage
        const users = JSON.parse(localStorage.getItem('blog_registered_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('blog_user', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const register = (username, email, password) => {
        const users = JSON.parse(localStorage.getItem('blog_registered_users') || '[]');
        if (users.find(u => u.email === email)) return false;

        const newUser = { username, email, password };
        const newUsers = [...users, newUser];
        localStorage.setItem('blog_registered_users', JSON.stringify(newUsers));

        setUser(newUser);
        localStorage.setItem('blog_user', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('blog_user');
    };

    return (
        <UserAuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = () => useContext(UserAuthContext);
