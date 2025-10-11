import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Logo from './Logo';
import backgroundImage from '../assets/images/background.png';
import './MainPage.css';

const MainPage = () => {
    const navigate = useNavigate();
    const [treks, setTreks] = useState([]);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        // Load treks
        API.get('treks/')
            .then((response) => setTreks(response.data))
            .catch((error) => console.log(error));

        // Add scroll listener for sticky nav
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsSticky(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLoginClick = () => {
        // Store current page location for return navigation
        sessionStorage.setItem('returnUrl', window.location.pathname);
        navigate('/auth');
    };


    const handleStartJourney = () => {
        // Set sticky state immediately
        setIsSticky(true);
        
        // Scroll to the main content section
        const mainContent = document.querySelector('.main-content-wrapper');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div 
            className="main-page-container"
            style={{ '--background-image': `url(${backgroundImage})` }}
        >
            {/* Header */}
            <header className="main-header">
                {/* Navigation Bar */}
                <nav className={`main-nav ${isSticky ? 'sticky' : ''}`}>
                    <div className="nav-links">
                        <button className="nav-link active">Home</button>
                        <button className="nav-link">Treks</button>
                        <button className="nav-link" onClick={handleLoginClick}>Login / Register</button>
                    </div>
                </nav>
                
                <div className="header-logo-section">
                    <Logo 
                        size="xlarge" 
                        background="none"
                        className="main-logo"
                    />
                    <button 
                        onClick={handleStartJourney}
                        className="start-journey-btn"
                    >
                        START YOUR JOURNEY
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content-wrapper">
                {/* Main Content Area */}
                <main className="main-content">
                    <div className="content-card">
                        <h2 className="content-title">
                            🥾 Available Treks
                        </h2>
                        
                        {treks.length === 0 ? (
                            <p className="loading-message">
                                Loading amazing treks...
                            </p>
                        ) : (
                            <div className="trek-grid">
                                {treks.map((trek) => (
                                    <div key={trek.id} className="trek-card">
                                        <h3 className="trek-title">
                                            {trek.trek_name}
                                        </h3>
                                        <p className="trek-detail">
                                            <strong>Difficulty:</strong> {trek.trip_grade}
                                        </p>
                                        <p className="trek-detail">
                                            <strong>Duration:</strong> {trek.duration}
                                        </p>
                                        <p className="trek-detail">
                                            <strong>Max Altitude:</strong> {trek.max_altitude}
                                        </p>
                                        {trek.location && (
                                            <p className="trek-detail">
                                                <strong>Location:</strong> {trek.location}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainPage;
