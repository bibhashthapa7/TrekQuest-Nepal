import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import Auth from './components/Auth';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/auth" element={<Auth />} />
            </Routes>
        </Router>
    );
}

export default App;
