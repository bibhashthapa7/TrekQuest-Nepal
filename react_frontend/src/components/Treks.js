import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import backgroundImage from '../assets/images/background.png';
import './Treks.css';
import TrekDrawer, { formatDuration, formatCost, formatAltitude, formatDistance } from './TrekDrawer';

// Sort grades by logical difficulty order rather than alphabetically
const GRADE_ORDER = ['easy', 'easy-moderate', 'moderate', 'moderate-difficult', 'difficult', 'strenuous', 'challenging', 'extreme'];
const sortGrades = (grades) =>
    [...grades].sort((a, b) => {
        const ai = GRADE_ORDER.findIndex(g => a.toLowerCase().includes(g));
        const bi = GRADE_ORDER.findIndex(g => b.toLowerCase().includes(g));
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

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

const SingleSelectDropdown = ({ options, value, onChange, placeholder }) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div className="filter-dropdown-wrapper" ref={ref}>
            <button
                className={`filter-select filter-dropdown-btn${value ? ' filter-select-active' : ''}`}
                onClick={() => setOpen(o => !o)}
                type="button"
            >
                <span>{selectedLabel}</span>
                <span className={`dropdown-arrow${open ? ' open' : ''}`}>▾</span>
            </button>
            {open && (
                <div className="filter-dropdown-panel">
                    <label
                        className="dropdown-option dropdown-option-reset"
                        onClick={() => { onChange(''); setOpen(false); }}
                    >
                        <span className="dropdown-radio" />
                        <span>{placeholder}</span>
                    </label>
                    {options.map(opt => (
                        <label
                            key={opt.value}
                            className="dropdown-option"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                        >
                            <span className={`dropdown-radio${value === opt.value ? ' selected' : ''}`}>
                                {value === opt.value ? '●' : '○'}
                            </span>
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const LocationDropdown = ({ options, selected, onToggle }) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const label = selected.length === 0
        ? 'All Regions'
        : selected.length === 1
            ? selected[0]
            : `${selected.length} Regions`;

    return (
        <div className="filter-dropdown-wrapper" ref={ref}>
            <button
                className={`filter-select filter-dropdown-btn${selected.length > 0 ? ' filter-select-active' : ''}`}
                onClick={() => setOpen(o => !o)}
                type="button"
            >
                <span>{label}</span>
                <span className={`dropdown-arrow${open ? ' open' : ''}`}>▾</span>
            </button>
            {open && (
                <div className="filter-dropdown-panel">
                    {options.map(loc => (
                        <label key={loc} className="dropdown-option" onClick={() => onToggle(loc)}>
                            <span className={`dropdown-radio${selected.includes(loc) ? ' selected' : ''}`}>
                                {selected.includes(loc) ? '●' : '○'}
                            </span>
                            <span>{loc}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


// Predefined duration ranges: [label, duration_min, duration_max]
const DURATION_RANGES = [
    ['Short  (≤ 7 days)',    1,  7],
    ['Medium (8–14 days)',   8, 14],
    ['Long   (15–22 days)', 15, 22],
];

// Predefined distance ranges: [label, distance_min, distance_max]
const DISTANCE_RANGES = [
    ['Short  (< 70 km)',    0,   70],
    ['Medium (70–130 km)', 70,  130],
    ['Long   (130–200 km)', 130, 200],
    ['Very Long (200+ km)', 200, 9999],
];

const emptyFilters = {
    search: '',
    trip_grade: '',
    best_travel_time: '',
    locations: [],
    cost_min: '',
    cost_max: '',
    duration_range: '',   // encoded as "min,max"
    distance_range: '',   // encoded as "min,max"
};

const Treks = () => {
    const [treks, setTreks] = useState([]);
    const [gradeOptions, setGradeOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [travelTimeOptions, setTravelTimeOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const [selectedTrek, setSelectedTrek] = useState(null);
    // inputValues controls what's displayed in text inputs (updates instantly)
    const [inputValues, setInputValues] = useState(emptyFilters);
    // filters is what actually gets sent to the API
    const [filters, setFilters] = useState(emptyFilters);
    const debounceTimerRef = React.useRef(null);
    const location = useLocation();
    const autoOpenHandled = useRef(false);

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsSticky(scrollTop > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close drawer on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedTrek(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fetch unique grade and location options once on mount
    useEffect(() => {
        fetch('http://localhost:8000/api/treks/')
            .then(r => r.json())
            .then(data => {
                const grades = sortGrades([...new Set(data.map(t => t.trip_grade).filter(Boolean))]);
                const locs = [...new Set(data.map(t => t.location).filter(Boolean))].sort();
                const times = [...new Set(data.map(t => t.best_travel_time).filter(Boolean))].sort();
                setGradeOptions(grades);
                setLocationOptions(locs);
                setTravelTimeOptions(times);
            })
            .catch(() => {});
    }, []);

    // Auto-open drawer if navigated from Recommend page
    useEffect(() => {
        const trekName = location.state?.openTrekName;
        if (!trekName || autoOpenHandled.current || treks.length === 0) return;
        const match = treks.find(
            t => t.trek_name.toLowerCase() === trekName.toLowerCase()
        );
        if (match) {
            setSelectedTrek(match);
            autoOpenHandled.current = true;
        }
    }, [treks, location.state]);

    // Fetch treks whenever filters change
    useEffect(() => {
        fetchTreks(filters);
    }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

    const buildQueryString = (f) => {
        const params = new URLSearchParams();
        if (f.search) params.set('search', f.search);
        if (f.trip_grade) params.set('trip_grade', f.trip_grade);
        if (f.best_travel_time) params.set('best_travel_time', f.best_travel_time);
        if (f.locations.length > 0) params.set('location', f.locations.join(','));
        // Overlap logic: trek range overlaps budget if trek.cost_max >= user_min AND trek.cost_min <= user_max
        if (f.cost_min) params.set('cost_max_gte', f.cost_min);
        if (f.cost_max) params.set('cost_min_lte', f.cost_max);
        if (f.duration_range) {
            const [dMin, dMax] = f.duration_range.split(',');
            params.set('duration_min', dMin);
            params.set('duration_max', dMax);
        }
        if (f.distance_range) {
            const [distMin, distMax] = f.distance_range.split(',');
            if (Number(distMin) > 0) params.set('distance_min', distMin);
            if (Number(distMax) < 9999) params.set('distance_max', distMax);
        }
        return params.toString();
    };

    const fetchTreks = async (currentFilters) => {
        setLoading(true);
        try {
            const qs = buildQueryString(currentFilters);
            const response = await fetch(`http://localhost:8000/api/treks/${qs ? '?' + qs : ''}`);
            if (response.ok) {
                const data = await response.json();
                setTreks(data);
                setError(null);
            } else {
                setError('Failed to fetch treks');
            }
        } catch (err) {
            console.error('Error fetching treks:', err);
            setError('Failed to fetch treks');
        } finally {
            setLoading(false);
        }
    };

    // For dropdowns: update API filters immediately
    // For text inputs: update display instantly, debounce the API call
    const handleFilterChange = (key, value, debounced = false) => {
        if (debounced) {
            setInputValues(prev => ({ ...prev, [key]: value }));
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                setFilters(prev => ({ ...prev, [key]: value }));
            }, 350);
        } else {
            setInputValues(prev => ({ ...prev, [key]: value }));
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const toggleLocation = (loc) => {
        const next = filters.locations.includes(loc)
            ? filters.locations.filter(l => l !== loc)
            : [...filters.locations, loc];
        setInputValues(prev => ({ ...prev, locations: next }));
        setFilters(prev => ({ ...prev, locations: next }));
    };

    const clearFilters = () => {
        setInputValues(emptyFilters);
        setFilters(emptyFilters);
    };

    const activeFilterCount =
        (filters.search ? 1 : 0) +
        (filters.trip_grade ? 1 : 0) +
        (filters.best_travel_time ? 1 : 0) +
        filters.locations.length +
        (filters.cost_min ? 1 : 0) +
        (filters.cost_max ? 1 : 0) +
        (filters.duration_range ? 1 : 0) +
        (filters.distance_range ? 1 : 0);

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

                    {/* Filter bar */}
                    <div className="filter-bar">

                        {/* Row 1: search + clear */}
                        <div className="filter-search-row">
                            <input
                                className="filter-search"
                                type="text"
                                placeholder="Search by trek name or region..."
                                value={inputValues.search}
                                onChange={e => handleFilterChange('search', e.target.value, true)}
                            />
                            {activeFilterCount > 0 && (
                                <button className="filter-clear-btn" onClick={clearFilters}>
                                    Clear ({activeFilterCount})
                                </button>
                            )}
                        </div>

                        {/* Row 2: grade, month, region, budget range */}
                        <div className="filter-controls-row">
                            <SingleSelectDropdown
                                placeholder="All Grades"
                                value={inputValues.trip_grade}
                                options={gradeOptions.map(g => ({ value: g, label: g }))}
                                onChange={v => handleFilterChange('trip_grade', v)}
                            />

                            <SingleSelectDropdown
                                placeholder="Best Season"
                                value={inputValues.best_travel_time}
                                options={travelTimeOptions.map(t => ({ value: t, label: t }))}
                                onChange={v => handleFilterChange('best_travel_time', v)}
                            />

                            <SingleSelectDropdown
                                placeholder="All Durations"
                                value={inputValues.duration_range}
                                options={DURATION_RANGES.map(([label, min, max]) => ({ value: `${min},${max}`, label }))}
                                onChange={v => handleFilterChange('duration_range', v)}
                            />

                            <SingleSelectDropdown
                                placeholder="All Distances"
                                value={inputValues.distance_range}
                                options={DISTANCE_RANGES.map(([label, min, max]) => ({ value: `${min},${max}`, label }))}
                                onChange={v => handleFilterChange('distance_range', v)}
                            />

                            <LocationDropdown
                                options={locationOptions}
                                selected={filters.locations}
                                onToggle={toggleLocation}
                            />

                            <div className="filter-cost-range">
                                <span className="cost-range-label">Budget ($)</span>
                                <div className="cost-range-inputs">
                                    <input
                                        className="filter-cost-input"
                                        type="number"
                                        min="0"
                                        placeholder="Min"
                                        value={inputValues.cost_min}
                                        onChange={e => handleFilterChange('cost_min', e.target.value, true)}
                                    />
                                    <span className="cost-range-sep">—</span>
                                    <input
                                        className="filter-cost-input"
                                        type="number"
                                        min="0"
                                        placeholder="Max"
                                        value={inputValues.cost_max}
                                        onChange={e => handleFilterChange('cost_max', e.target.value, true)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <p className="treks-count">
                        {loading ? 'Loading...' : `${treks.length} trek${treks.length !== 1 ? 's' : ''} found`}
                    </p>

                    <div className="treks-grid">
                        {!loading && treks.length === 0 && (
                            <div className="treks-empty">
                                <p>No treks match your filters.</p>
                                <button className="filter-clear-btn" onClick={clearFilters}>Clear filters</button>
                            </div>
                        )}
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
