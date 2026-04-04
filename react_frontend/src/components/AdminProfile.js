import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
import backgroundImage from '../assets/images/background.png';
import './AdminProfile.css';

const AdminProfile = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTreks: 0,
        totalFavorites: 0,
        recentUsers: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchAdminStats();
        
        // Add scroll listener for sticky nav
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsSticky(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/auth');
                return;
            }

            const response = await fetch(`${BASE_URL}/api/user/profile/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                throw new Error('Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to load user profile');
        }
    };

    const fetchAdminStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/api/admin/stats/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const statsData = await response.json();
                setStats(statsData);
            } else {
                console.log('Admin stats not available');
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };


    const openDjangoAdmin = () => {
        window.open(`${BASE_URL}/admin/`, '_blank');
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const password = prompt('Please enter your password to confirm account deletion:');
            if (!password) {
                return;
            }

            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                const response = await fetch(`${BASE_URL}/auth/users/me/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        current_password: password
                    }),
                });

                if (response.ok) {
                    alert('Account deleted successfully');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/');
                } else {
                    const errorData = await response.json();
                    alert(`Failed to delete account: ${errorData.detail || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Failed to delete account. Please try again.');
            }
        }
    };


    if (loading) {
        return (
            <div className="admin-profile-container">
                <div className="loading-message">Loading admin profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div 
            className="admin-profile-container"
            style={{ '--background-image': `url(${backgroundImage})` }}
        >
            {/* Navigation Bar */}
            <Navigation activePage="admin" isSticky={isSticky} />

            {/* Admin Header */}
            <div className="admin-header">
                <div className="admin-header-section">
                    <div className="admin-header-content">
                        <h1 className="admin-title">Admin Dashboard</h1>
                        <p className="admin-subtitle">Welcome back, {user?.first_name || user?.username}</p>
                        <button className="admin-logout-btn" onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                {/* Quick Stats */}
                <div className="admin-stats-section">
                    <h2>Dashboard Statistics</h2>
                    <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>{stats.totalUsers}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🥾</div>
                        <div className="stat-info">
                            <h3>{stats.totalTreks}</h3>
                            <p>Total Treks</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">❤️</div>
                        <div className="stat-info">
                            <h3>{stats.totalFavorites}</h3>
                            <p>Total Favorites</p>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="admin-actions">
                    <h2>Admin Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary" onClick={openDjangoAdmin}>
                            <span className="btn-icon">⚙️</span>
                            Django Admin Panel
                        </button>
                    </div>
                </div>

                {/* User Profile Info */}
                <div className="profile-info">
                    <h2>Profile Information</h2>
                    <div className="profile-details">
                        <div className="profile-field">
                            <label>Username:</label>
                            <span>{user?.username}</span>
                        </div>
                        <div className="profile-field">
                            <label>Email:</label>
                            <span>{user?.email}</span>
                        </div>
                        <div className="profile-field">
                            <label>Full Name:</label>
                            <span>{user?.first_name} {user?.last_name}</span>
                        </div>
                        <div className="profile-field">
                            <label>Role:</label>
                            <span className="role-badge admin">Administrator</span>
                        </div>
                        <div className="profile-field">
                            <label>Account Status:</label>
                            <span className="status-badge active">Active</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                {stats.recentUsers.length > 0 && (
                    <div className="recent-activity">
                        <h2>Recent User Registrations</h2>
                        <div className="activity-list">
                            {stats.recentUsers.map((user, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">👤</div>
                                    <div className="activity-info">
                                        <p className="activity-user">{user.username}</p>
                                        <p className="activity-date">{new Date(user.date_joined).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Delete Account Section */}
                <div className="delete-account-section">
                    <h2>Account Management</h2>
                    <p className="delete-warning">
                        ⚠️ Deleting your account will permanently remove all your data and cannot be undone.
                    </p>
                    <button className="delete-account-btn" onClick={handleDeleteAccount}>
                        Delete Account
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminProfile;
