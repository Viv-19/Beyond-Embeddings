import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Linkedin, Github } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-left">
                    <p className="footer-name">Vivesh Kumar Singh</p>
                    <p className="copyright">© {currentYear} BeyondEmbeddings</p>
                </div>

                <div className="footer-right">
                    <div className="social-links">
                        <a href="mailto:viveshkrsingh19@gmail.com" title="Email">
                            <Mail size={18} />
                            <span>Gmail</span>
                        </a>
                        <a href="https://linkedin.com/in/vivesh-kumar-singh-a78048302" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <Linkedin size={18} />
                            <span>LinkedIn</span>
                        </a>
                        <a href="https://github.com/Viv-19" target="_blank" rel="noopener noreferrer" title="GitHub">
                            <Github size={18} />
                            <span>GitHub</span>
                        </a>
                    </div>
                    <div className="legal-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/admin" className="admin-link">Admin Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
