import React, { useEffect, useState } from 'react';
import API from '../services/api';
import './TrekList.css';

const TrekList = () => {
    const [treks, setTreks] = useState([]);

    useEffect(() => {
        API.get('treks/')
            .then((response) => setTreks(response.data))
            .catch((error) => console.log(error));
    }, []);

    return (
        <div className="trek-list-container">
            <h1 className="trek-list-title">Available Treks</h1>
            {treks.length === 0 ? (
                <p className="trek-loading">Loading amazing treks...</p>
            ) : (
                <ul className="trek-list">
                    {treks.map((trek) => (
                        <li key={trek.id} className="trek-item">
                            <div className="trek-name">{trek.trek_name}</div>
                            <div className="trek-grade">{trek.trip_grade}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TrekList;
