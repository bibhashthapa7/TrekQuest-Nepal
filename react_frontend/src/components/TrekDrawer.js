import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import './Treks.css';

// Fix Leaflet's broken default marker icons when bundled with webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Format helpers ────────────────────────────────────────────────────────────

export const formatDuration = (value) => {
    if (!value) return value;
    return /^[^a-zA-Z]+$/.test(value.trim()) ? `${value.trim()} days` : value;
};

export const formatCost = (value) => {
    if (!value) return value;
    const v = value.trim();
    return v.startsWith('$') ? v : `$${v}`;
};

export const formatAltitude = (value) => {
    if (!value) return value;
    return /[a-zA-Z]/.test(value) ? value : `${value.trim()} m`;
};

export const formatDistance = (value) => {
    if (!value) return value;
    return /[a-zA-Z]/.test(value) ? value : `${value.trim()} km`;
};

// ── Weather widget ────────────────────────────────────────────────────────────

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
    }, [trekId]);

    if (!lat || !lng) return (
        <div className="weather-unavailable"><span>🌡️</span><span>Weather data unavailable</span></div>
    );
    if (loading) return <div className="weather-loading">Loading weather…</div>;
    if (err || !weather) return (
        <div className="weather-unavailable"><span>⚠️</span><span>Could not load weather data</span></div>
    );

    const cw = weather.current_weather;
    const [cwLabel, cwEmoji] = WMO_CODES[cw.weathercode] || ['Unknown', '🌡️'];
    const daily = weather.daily;

    return (
        <div className="weather-widget">
            <h4 className="weather-title">Current Weather</h4>
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
                                <span className="forecast-rain">{rain > 0 ? `💧 ${rain.toFixed(1)}` : ''}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Map ───────────────────────────────────────────────────────────────────────

const TrekMap = ({ lat, lng, trekName, routeGeoJson }) => {
    if (!lat || !lng) return (
        <div className="map-unavailable"><span>🗺️</span><span>Map unavailable — no coordinates on file</span></div>
    );
    return (
        <div className="trek-map-wrapper">
            <MapContainer
                center={[lat, lng]}
                zoom={9}
                scrollWheelZoom={false}
                className="trek-map"
                key={`${lat}-${lng}`}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                />
                {routeGeoJson && (
                    <GeoJSON data={routeGeoJson} style={{ color: '#63b3ed', weight: 3, opacity: 0.85 }} />
                )}
                <Marker position={[lat, lng]}>
                    <Popup>{trekName}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

// ── TrekDrawer (exported) ─────────────────────────────────────────────────────

const TrekDrawer = ({ trek, onClose }) => {
    if (!trek) return null;

    const stats = [
        { label: 'Duration',       value: formatDuration(trek.duration) },
        { label: 'Grade',          value: trek.trip_grade },
        { label: 'Cost Range',     value: formatCost(trek.cost_range) },
        { label: 'Max Altitude',   value: formatAltitude(trek.max_altitude) },
        { label: 'Total Distance', value: formatDistance(trek.total_distance) },
        { label: 'Best Time',      value: trek.best_travel_time },
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

                    <div className="drawer-section">
                        <h4 className="drawer-section-label">Location</h4>
                        <TrekMap
                            lat={trek.coordinates_lat}
                            lng={trek.coordinates_lng}
                            trekName={trek.trek_name}
                            routeGeoJson={trek.route_geojson}
                        />
                    </div>

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

export default TrekDrawer;
