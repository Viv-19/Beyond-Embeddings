import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useUserAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Blogs', path: '/blogs' },
        { name: 'Chat', path: '/notes' },
        { name: 'Experiments', path: '/experiments' },
        { name: 'Papers', path: '/papers' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav className="navbar">
            <div className="nav-container container">
                {/* Links on the Left */}
                <ul className="nav-links">
                    {navItems.map(item => (
                        <li key={item.path}>
                            <NavLink to={item.path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Right side: Auth and Logo */}
                <div className="nav-right">
                    <div className="auth-nav-area">
                        {user ? (
                            <div className="user-nav-status">
                                <span className="user-name">Hi, {user.username}</span>
                                <button onClick={logout} className="nav-auth-btn logout">Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="nav-auth-btn sign-in">Sign In</Link>
                        )}
                    </div>

                    {/* Logo at the RIGHT-MOST */}
                    <Link to="/" className="nav-logo-link">
                        <img src="/assets/logo.png" alt="BeyondEmbeddings" className="nav-logo-img" />
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
