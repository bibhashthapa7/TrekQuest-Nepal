import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import Auth from './components/Auth';
import AdminProfile from './components/AdminProfile';
import UserProfile from './components/UserProfile';
import Treks from './components/Treks';
import Recommend from './components/Recommend';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminProfile />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/treks" element={<Treks />} />
                <Route path="/recommend" element={<Recommend />} />
            </Routes>
        </Router>
    );
}

export default App;
