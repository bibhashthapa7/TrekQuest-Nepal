import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import TrekDrawer from './TrekDrawer';
import backgroundImage from '../assets/images/background.png';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
import './Recommend.css';

const CHIP_OPTIONS = {
    fitness: [
        { value: 'beginner',     label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'experienced',  label: 'Experienced' },
        { value: 'expert',       label: 'Expert' },
    ],
    duration: [
        { value: 'short (up to 7 days)',    label: 'Short  ≤ 7 days' },
        { value: 'medium (8–14 days)',       label: 'Medium  8–14 days' },
        { value: 'long (15+ days)',          label: 'Long  15+ days' },
    ],
    budget: [
        { value: 'budget (under $500)',      label: 'Budget  < $500' },
        { value: 'mid-range ($500–$1200)',   label: 'Mid-range  $500–$1200' },
        { value: 'premium (over $1200)',     label: 'Premium  $1200+' },
    ],
    interests: [
        { value: 'Scenic mountain views',   label: '🏔️  Scenic Views' },
        { value: 'High altitude challenge', label: '⛰️  High Altitude' },
        { value: 'Cultural immersion',      label: '🏛️  Cultural' },
        { value: 'Wildlife and nature',     label: '🌿  Wildlife' },
        { value: 'Off the beaten path',     label: '🧭  Off the Beaten Path' },
        { value: 'Lakes and glaciers',      label: '🏞️  Lakes & Glaciers' },
    ],
};

const ChipGroup = ({ label, options, selected, onToggle, single }) => (
    <div className="chip-group">
        <span className="chip-group-label">{label}</span>
        <div className="chip-row">
            {options.map(opt => {
                const active = single
                    ? selected === opt.value
                    : selected.includes(opt.value);
                return (
                    <button
                        key={opt.value}
                        className={`chip${active ? ' chip-active' : ''}`}
                        onClick={() => onToggle(opt.value)}
                        type="button"
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    </div>
);

const ResultCard = ({ rec, index, onView, loadingName }) => (
    <div className="result-card">
        <div className="result-rank">#{index + 1}</div>
        <div className="result-body">
            <h3 className="result-name">{rec.trek_name}</h3>
            <p className="result-reason">{rec.reason}</p>
            <div className="result-card-footer">
                <div className="result-stats">
                    {rec.grade    && <span className="result-stat">⚡ {rec.grade}</span>}
                    {rec.duration && <span className="result-stat">📅 {rec.duration}</span>}
                    {rec.cost     && <span className="result-stat">💲 {rec.cost}</span>}
                </div>
                <button
                    className="view-trek-btn"
                    onClick={() => onView(rec.trek_name)}
                    disabled={!!loadingName}
                >
                    {loadingName === rec.trek_name ? 'Loading…' : 'View Trek →'}
                </button>
            </div>
        </div>
    </div>
);

const Recommend = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [usageInfo, setUsageInfo] = useState(null);
    const [selectedTrek, setSelectedTrek] = useState(null);
    const [drawerLoadingName, setDrawerLoadingName] = useState(null);

    const [fitness,   setFitness]   = useState('');
    const [duration,  setDuration]  = useState('');
    const [budget,    setBudget]    = useState('');
    const [interests, setInterests] = useState([]);
    const [note,      setNote]      = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);

    const toggleInterest = (val) =>
        setInterests(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );

    const handleSingle = (setter) => (val) =>
        setter(prev => (prev === val ? '' : val));

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResults(null);

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${BASE_URL}/api/recommendations/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ fitness, duration, budget, interests, note }),
            });

            const data = await res.json();

            if (res.status === 429) {
                setError('daily_limit_reached');
                setUsageInfo({ used: data.used, limit: data.limit });
            } else if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.');
            } else {
                setResults(data.recommendations);
                setUsageInfo({ used: data.used, limit: data.limit, isAdmin: data.is_admin });
            }
        } catch {
            setError('Could not reach the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const hasAnyInput = fitness || duration || budget || interests.length > 0 || note.trim();

    const handleViewTrek = async (trekName) => {
        setDrawerLoadingName(trekName);
        try {
            const res = await fetch(
                `${BASE_URL}/api/treks/?search=${encodeURIComponent(trekName)}`
            );
            const data = await res.json();
            const match = data.find(
                t => t.trek_name.toLowerCase() === trekName.toLowerCase()
            );
            if (match) setSelectedTrek(match);
        } catch {
            // silently fail
        } finally {
            setDrawerLoadingName(null);
        }
    };

    return (
        <>
        <div
            className="recommend-container"
            style={{ '--background-image': `url(${backgroundImage})` }}
        >
            <Navigation activePage="recommend" />

            <div className="recommend-content">
                <div className="recommend-section">
                    <div className="recommend-header">
                        <h1 className="recommend-title">Find Your Perfect Trek</h1>
                        <p className="recommend-subtitle">
                            Tell us what you're looking for and we'll match you with the best treks in Nepal
                        </p>
                    </div>

                    {!isLoggedIn ? (
                        /* ── Logged-out gate ── */
                        <div className="recommend-gate">
                            <div className="gate-icon">🔒</div>
                            <h2 className="gate-title">Sign in to get personalised recommendations</h2>
                            <p className="gate-text">
                                Our AI advisor matches your fitness level, budget, and interests to
                                the perfect Nepal trek — but you need an account to use it.
                            </p>
                            <button
                                className="gate-login-btn"
                                onClick={() => {
                                    sessionStorage.setItem('returnUrl', '/recommend');
                                    navigate('/auth');
                                }}
                            >
                                Log in / Sign up
                            </button>
                        </div>
                    ) : results ? (
                        /* ── Results view ── */
                        <div className="results-wrapper">
                            <div className="results-header">
                                <h2 className="results-title">Your Recommended Treks</h2>
                                {usageInfo && !usageInfo.isAdmin && (
                                    <span className="usage-badge">
                                        {usageInfo.used}/{usageInfo.limit} recommendations used today
                                    </span>
                                )}
                            </div>
                            <div className="results-list">
                                {results.map((rec, i) => (
                                    <ResultCard key={i} rec={rec} index={i} onView={handleViewTrek} loadingName={drawerLoadingName} />
                                ))}
                            </div>
                            <button
                                className="try-again-btn"
                                onClick={() => { setResults(null); setError(null); }}
                            >
                                Try different preferences
                            </button>
                        </div>
                    ) : (
                        /* ── Preference form ── */
                        <div className="recommend-form">
                            <ChipGroup
                                label="Fitness / Experience Level"
                                options={CHIP_OPTIONS.fitness}
                                selected={fitness}
                                onToggle={handleSingle(setFitness)}
                                single
                            />
                            <ChipGroup
                                label="Trip Length"
                                options={CHIP_OPTIONS.duration}
                                selected={duration}
                                onToggle={handleSingle(setDuration)}
                                single
                            />
                            <ChipGroup
                                label="Budget"
                                options={CHIP_OPTIONS.budget}
                                selected={budget}
                                onToggle={handleSingle(setBudget)}
                                single
                            />
                            <ChipGroup
                                label="Interests  (select all that apply)"
                                options={CHIP_OPTIONS.interests}
                                selected={interests}
                                onToggle={toggleInterest}
                                single={false}
                            />

                            <div className="note-group">
                                <span className="chip-group-label">Anything else? (optional)</span>
                                <textarea
                                    className="note-input"
                                    placeholder="e.g. travelling in October, prefer teahouse style, first time in Nepal…"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {error && error !== 'daily_limit_reached' && (
                                <p className="recommend-error">{error}</p>
                            )}

                            {error === 'daily_limit_reached' && (
                                <p className="recommend-error">
                                    You've used all {usageInfo?.limit} recommendations for today. Come back tomorrow!
                                </p>
                            )}

                            {usageInfo && !error && !usageInfo.isAdmin && (
                                <p className="usage-hint">
                                    {usageInfo.limit - usageInfo.used} recommendation{usageInfo.limit - usageInfo.used !== 1 ? 's' : ''} remaining today
                                </p>
                            )}

                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={loading || !hasAnyInput}
                            >
                                {loading ? (
                                    <span className="submit-loading">
                                        <span className="spinner" />
                                        Finding your treks…
                                    </span>
                                ) : 'Find My Trek'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

            <TrekDrawer trek={selectedTrek} onClose={() => setSelectedTrek(null)} />
        </>
    );
};

export default Recommend;
