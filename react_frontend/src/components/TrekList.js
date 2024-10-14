import React, { useEffect, useState } from 'react';
import API from '../services/api';

const TrekList = () => {
    const [treks, setTreks] = useState([]);

    useEffect(() => {
        API.get('treks/')
            .then((response) => setTreks(response.data))
            .catch((error) => console.log(error));
    }, []);

    return (
        <div>
            <h1>Available Treks</h1>
            <ul>
                {treks.map((trek) => (
                    <li key={trek.id}>{trek.name} - {trek.location}</li>
                ))}
            </ul>
        </div>
    );
};

export default TrekList;
