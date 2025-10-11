import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import './Navigation.css';

const Navigation = ({ activePage = 'home', isSticky = false }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [currentActivePage, setCurrentActivePage] = useState(activePage);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('access_token');
        if (token) {
            API.get('user/profile/')
                .then((response) => setUser(response.data))
                .catch((error) => {
                    console.log('User not authenticated:', error);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                });
        }

        // Add click outside listener for dropdown
        const handleClickOutside = (event) => {
            if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileDropdown]);

    // Update current active page when prop changes
    useEffect(() => {
        setCurrentActivePage(activePage);
    }, [activePage]);

    const handleLoginClick = () => {
        // Store current page location for return navigation
        sessionStorage.setItem('returnUrl', window.location.pathname);
        navigate('/auth');
    };

    const handleProfileClick = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    const handleViewProfile = () => {
        if (user?.is_staff) {
            navigate('/admin');
        } else {
            navigate('/profile');
        }
        setShowProfileDropdown(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setShowProfileDropdown(false);
        // Optionally redirect to home or show a message
        if (activePage === 'admin') {
            navigate('/');
        }
    };

    const handleNavClick = (page) => {
        setCurrentActivePage(page);
        
        switch (page) {
            case 'home':
                navigate('/');
                break;
            case 'treks':
                // TODO: Navigate to treks page when implemented
                console.log('Treks page not implemented yet');
                break;
            case 'about':
                // TODO: Navigate to about page when implemented
                console.log('About page not implemented yet');
                break;
            default:
                break;
        }
    };

    return (
        <nav className={`main-nav ${isSticky ? 'sticky' : ''}`}>
            <div className="nav-links">
                <button 
                    className={`nav-link ${currentActivePage === 'home' ? 'active' : ''}`}
                    onClick={() => handleNavClick('home')}
                >
                    Home
                </button>
                <button 
                    className={`nav-link ${currentActivePage === 'treks' ? 'active' : ''}`}
                    onClick={() => handleNavClick('treks')}
                >
                    Treks
                </button>
                <button 
                    className={`nav-link ${currentActivePage === 'about' ? 'active' : ''}`}
                    onClick={() => handleNavClick('about')}
                >
                    About
                </button>
                {user ? (
                    <div className="profile-dropdown-container">
                        <button 
                            className={`profile-btn ${user.is_staff ? 'admin-profile' : ''} ${showProfileDropdown ? 'dropdown-open' : ''}`} 
                            onClick={handleProfileClick}
                        >
                            {user.is_staff ? 'Admin Profile' : 'Profile'}
                        </button>
                        {showProfileDropdown && activePage !== 'admin' && activePage !== 'profile' && (
                            <div className="profile-dropdown">
                                <button className="dropdown-item" onClick={handleViewProfile}>
                                    View Profile
                                </button>
                                <button className="dropdown-item" onClick={handleLogout}>
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button 
                        className={`nav-link login-btn ${currentActivePage === 'auth' ? 'active' : ''}`}
                        onClick={handleLoginClick}
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
