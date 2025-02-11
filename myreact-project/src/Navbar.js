import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-brand">
                <Link className="navbar-logo">
                    Buy & Sell
                </Link>
            </div>
            <ul className="navbar-links">
                {[
                    { path: '/cart', label: 'My Cart' },
                    { path: '/deliver', label: 'Deliver Items' },
                    { path: '/profile', label: 'Profile' },
                    { path: '/upload', label: 'Upload Item' },
                    { path: '/search', label: 'Search Items' },
                    {path: '/history', label: 'History'},
                    {path: '/chat', label: 'Chat'}
                ].map((item, index) => (
                    <li 
                        key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        style={{ '--item-index': index }}
                    >
                        <Link to={item.path} className="nav-link">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;