import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import backgroundImage from '../assets/images/background.png';
import './Treks.css';

// Sort grades by logical difficulty order rather than alphabetically
const GRADE_ORDER = ['easy', 'easy-moderate', 'moderate', 'moderate-difficult', 'difficult', 'strenuous', 'challenging', 'extreme'];
const sortGrades = (grades) =>
    [...grades].sort((a, b) => {
        const ai = GRADE_ORDER.findIndex(g => a.toLowerCase().includes(g));
        const bi = GRADE_ORDER.findIndex(g => b.toLowerCase().includes(g));
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

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

// WMO weather interpretation codes → label + emoji
const WMO_CODES = {
    0: ['Clear sky', '☀️'],
    1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
    45: ['Fog', '🌫️'], 48: ['Icy fog', '🌫️'],
    51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
    61: ['Slight rain', '🌧️'], 63: ['Moderate rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
    71: ['Slight snow', '🌨️'], 73: ['Moderate snow', '❄️'], 75: ['Heavy snow', '❄️'],
    77: ['Snow grains', '❄️'],
    80: ['Slight showers', '🌦️'], 81: ['Showers', '🌧️'], 82: ['Violent showers', '⛈️'],
    85: ['Snow showers', '🌨️'], 86: ['Heavy snow showers', '❄️'],
    95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm + hail', '⛈️'], 99: ['Thunderstorm + hail', '⛈️'],
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WeatherWidget = ({ lat, lng, trekId }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(false);

    useEffect(() => {
        if (!lat || !lng) { setLoading(false); return; }
        setLoading(true);
        setErr(false);
        setWeather(null);
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
            `&current_weather=true` +
            `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode` +
            `&timezone=auto&forecast_days=7`
        )
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => { setWeather(data); setLoading(false); })
            .catch(() => { setErr(true); setLoading(false); });
    }, [trekId]); // re-fetch when drawer opens a different trek

    if (!lat || !lng) {
        return (
            <div className="weather-unavailable">
                <span>🌡️</span>
                <span>Weather data unavailable — no coordinates on file</span>
            </div>
        );
    }

    if (loading) {
        return <div className="weather-loading">Loading weather…</div>;
    }

    if (err || !weather) {
        return (
            <div className="weather-unavailable">
                <span>⚠️</span>
                <span>Could not load weather data</span>
            </div>
        );
    }

    const cw = weather.current_weather;
    const [cwLabel, cwEmoji] = WMO_CODES[cw.weathercode] || ['Unknown', '🌡️'];
    const daily = weather.daily;

    return (
        <div className="weather-widget">
            <h4 className="weather-title">Current Weather</h4>

            {/* Current conditions */}
            <div className="weather-current">
                <span className="weather-emoji">{cwEmoji}</span>
                <div className="weather-current-info">
                    <span className="weather-temp">{Math.round(cw.temperature)}°C</span>
                    <span className="weather-condition">{cwLabel}</span>
                </div>
                <div className="weather-wind">
                    <span className="weather-wind-icon">💨</span>
                    <span>{Math.round(cw.windspeed)} km/h</span>
                </div>
            </div>

            {/* 7-day forecast */}
            <div className="weather-forecast">
                {daily.time.map((dateStr, i) => {
                    const [, emoji] = WMO_CODES[daily.weathercode[i]] || ['', '🌡️'];
                    const dayName = i === 0 ? 'Today' : DAY_NAMES[new Date(dateStr).getDay()];
                    const hi = Math.round(daily.temperature_2m_max[i]);
                    const lo = Math.round(daily.temperature_2m_min[i]);
                    const rain = daily.precipitation_sum[i];
                    return (
                        <div key={dateStr} className="forecast-day">
                            <div className="forecast-left">
                                <span className="forecast-name">{dayName}</span>
                                <span className="forecast-icon">{emoji}</span>
                            </div>
                            <div className="forecast-right">
                                <span className="forecast-hi">{hi}°</span>
                                <span className="forecast-lo">{lo}°</span>
                                <span className="forecast-rain">
                                    {rain > 0 ? `💧 ${rain.toFixed(1)}` : ''}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
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

                    <WeatherWidget
                        lat={trek.coordinates_lat}
                        lng={trek.coordinates_lng}
                        trekId={trek.id}
                    />
                </div>
            </div>
        </>
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
