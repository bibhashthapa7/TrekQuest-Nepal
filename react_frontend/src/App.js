import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrekList from './components/TrekList';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TrekList />} />
            </Routes>
        </Router>
    );
}

export default App;
