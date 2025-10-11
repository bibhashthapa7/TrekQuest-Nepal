import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Navigation from './Navigation';
import backgroundImage from '../assets/images/background.png';
import './MainPage.css';

const MainPage = () => {
    const navigate = useNavigate();
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        // Add scroll listener for sticky nav
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsSticky(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleStartJourney = () => {
        navigate('/treks');
    };

    return (
        <div 
            className="main-page-container"
            style={{ '--background-image': `url(${backgroundImage})` }}
        >
            {/* Header */}
            <header className="main-header">
                {/* Navigation Bar */}
                <Navigation activePage="home" isSticky={isSticky} />
                
                <div className="header-logo-section">
                    <div className="main-logo-section">
                        <Logo 
                            size="xlarge" 
                            background="none"
                            className="main-logo"
                        />
                    </div>
                    <button 
                        onClick={handleStartJourney}
                        className="start-journey-btn"
                    >
                        START YOUR JOURNEY
                    </button>
                </div>
            </header>

        </div>
    );
};

export default MainPage;
