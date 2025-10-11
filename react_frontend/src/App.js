import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import Auth from './components/Auth';
import AdminProfile from './components/AdminProfile';
import UserProfile from './components/UserProfile';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminProfile />} />
                <Route path="/profile" element={<UserProfile />} />
            </Routes>
        </Router>
    );
}

export default App;
