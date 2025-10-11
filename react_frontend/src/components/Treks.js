import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import backgroundImage from '../assets/images/background.png';
import './Treks.css';

const Treks = () => {
    const [treks, setTreks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        fetchTreks();
        
        // Add scroll listener for sticky nav
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsSticky(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchTreks = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/treks/');
            if (response.ok) {
                const data = await response.json();
                setTreks(data);
            } else {
                setError('Failed to fetch treks');
            }
        } catch (error) {
            console.error('Error fetching treks:', error);
            setError('Failed to fetch treks');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div 
                className="treks-container"
                style={{ '--background-image': `url(${backgroundImage})` }}
            >
                <Navigation activePage="treks" />
                <div className="treks-content">
                    <div className="loading-message">Loading treks...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div 
                className="treks-container"
                style={{ '--background-image': `url(${backgroundImage})` }}
            >
                <Navigation activePage="treks" />
                <div className="treks-content">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="treks-container"
            style={{ '--background-image': `url(${backgroundImage})` }}
        >
            <Navigation activePage="treks" isSticky={isSticky} />
            
            <div className="treks-content">
                <div className="treks-section">
                    <div className="treks-header">
                        <h1 className="treks-title">Available Treks</h1>
                        <p className="treks-subtitle">Discover amazing trekking adventures in Nepal</p>
                    </div>

                    <div className="treks-grid">
                        {treks.map((trek) => (
                            <div key={trek.id} className="trek-card">
                                <h3 className="trek-name">{trek.trek_name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Treks;
