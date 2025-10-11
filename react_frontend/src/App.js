import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrekList from './components/TrekList';
import Auth from './components/Auth';

function App() {
    return (
        <Router>
            <div style={{ padding: '20px' }}>
                <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>TrekQuest Nepal</h1>
                <Routes>
                    <Route path="/" element={<TrekList />} />
                    <Route path="/auth" element={<Auth />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
