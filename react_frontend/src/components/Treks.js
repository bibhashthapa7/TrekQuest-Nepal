import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import backgroundImage from '../assets/images/background.png';
import './Treks.css';

// Appends " days" if the value contains no letters (e.g. "14", "9-12"), leaves it alone otherwise
const formatDuration = (value) => {
    if (!value) return value;
    return /^[^a-zA-Z]+$/.test(value.trim()) ? `${value.trim()} days` : value;
};

// Prepends "$" if not already present
const formatCost = (value) => {
    if (!value) return value;
    const v = value.trim();
    return v.startsWith('$') ? v : `$${v}`;
};

// Appends " m" if no unit letters are present
const formatAltitude = (value) => {
    if (!value) return value;
    return /[a-zA-Z]/.test(value) ? value : `${value.trim()} m`;
};

// Appends " km" if no unit letters are present
const formatDistance = (value) => {
    if (!value) return value;
    return /[a-zA-Z]/.test(value) ? value : `${value.trim()} km`;
};

// Maps grade text to a CSS class for the badge
const gradeBadgeClass = (grade) => {
    if (!grade) return 'badge-grade-default';
    const g = grade.toLowerCase();
    if (g.includes('easy') || g.includes('beginner')) return 'badge-grade-easy';
    if (g.includes('moderate') || g.includes('medium')) return 'badge-grade-moderate';
    if (g.includes('hard') || g.includes('difficult') || g.includes('strenuous') || g.includes('challenging')) return 'badge-grade-hard';
    if (g.includes('extreme') || g.includes('very hard') || g.includes('expert')) return 'badge-grade-extreme';
    return 'badge-grade-default';
};

const TrekDrawer = ({ trek, onClose }) => {
    if (!trek) return null;

    const stats = [
        { label: 'Duration', value: formatDuration(trek.duration) },
        { label: 'Grade', value: trek.trip_grade },
        { label: 'Cost Range', value: formatCost(trek.cost_range) },
        { label: 'Max Altitude', value: formatAltitude(trek.max_altitude) },
        { label: 'Total Distance', value: formatDistance(trek.total_distance) },
        { label: 'Best Time', value: trek.best_travel_time },
    ];

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <div className="trek-drawer">
                <button className="drawer-close" onClick={onClose}>✕</button>

                {trek.featured_image ? (
                    <div className="drawer-image">
                        <img src={trek.featured_image} alt={trek.trek_name} />
                    </div>
                ) : (
                    <div className="drawer-image-placeholder">
                        <span>No image available</span>
                    </div>
                )}

                <div className="drawer-body">
                    <h2 className="drawer-title">{trek.trek_name}</h2>

                    {trek.location && (
                        <p className="drawer-location">📍 {trek.location}</p>
                    )}

                    <div className="drawer-stats">
                        {stats.map(({ label, value }) =>
                            value ? (
                                <div key={label} className="stat-item">
                                    <span className="stat-label">{label}</span>
                                    <span className="stat-value">{value}</span>
                                </div>
                            ) : null
                        )}
                    </div>

                    {trek.description && (
                        <div className="drawer-description">
                            <h4>About this Trek</h4>
                            <p>{trek.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const Treks = () => {
    const [treks, setTreks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const [selectedTrek, setSelectedTrek] = useState(null);

    useEffect(() => {
        fetchTreks();

        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsSticky(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close drawer on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedTrek(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
                            <div
                                key={trek.id}
                                className="trek-card"
                                onClick={() => setSelectedTrek(trek)}
                            >
                                {trek.featured_image && (
                                    <div className="trek-card-image">
                                        <img src={trek.featured_image} alt={trek.trek_name} />
                                    </div>
                                )}

                                <div className="trek-card-body">
                                    <h3 className="trek-name">{trek.trek_name}</h3>

                                    {trek.location && (
                                        <p className="trek-location">📍 {trek.location}</p>
                                    )}

                                    <div className="trek-badges">
                                        {trek.trip_grade && (
                                            <span className={`badge ${gradeBadgeClass(trek.trip_grade)}`}>{trek.trip_grade}</span>
                                        )}
                                        {trek.duration && (
                                            <span className="badge badge-duration">{formatDuration(trek.duration)}</span>
                                        )}
                                    </div>

                                    <div className="trek-card-stats">
                                        {trek.max_altitude && (
                                            <span className="card-stat">▲ {formatAltitude(trek.max_altitude)}</span>
                                        )}
                                        {trek.cost_range && (
                                            <span className="card-stat">💲 {trek.cost_range}</span>
                                        )}
                                    </div>

                                    <button className="view-details-btn">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TrekDrawer trek={selectedTrek} onClose={() => setSelectedTrek(null)} />
        </div>
    );
};

export default Treks;
