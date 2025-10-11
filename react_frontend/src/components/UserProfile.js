import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import backgroundImage from '../assets/images/background.png';
import './UserProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        first_name: '',
        last_name: ''
    });
    const [saveMessage, setSaveMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/auth');
                return;
            }

            const response = await fetch('http://localhost:8000/api/user/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('User profile data received:', userData);
                setUser(userData);
                setEditData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || ''
                });
            } else {
                setError('Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to fetch user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSaveMessage('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            first_name: user.first_name || '',
            last_name: user.last_name || ''
        });
        setSaveMessage('');
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/user/profile/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setIsEditing(false);
                setSaveMessage('Profile updated successfully!');
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                setSaveMessage('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setSaveMessage('Failed to update profile');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="user-profile-container">
                <div className="loading-message">Loading user profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div 
            className="user-profile-container"
            style={{ '--background-image': `url(${backgroundImage})` }}
        >
            {/* Navigation Bar */}
            <Navigation activePage="profile" />

            {/* User Header */}
            <div className="user-header">
                <div className="user-header-content">
                    <h1 className="user-title">User Profile</h1>
                    <p className="user-subtitle">Welcome back, {user?.first_name && user.first_name.trim() ? user.first_name : user?.username}</p>
                    <button className="user-logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="user-content">
                {/* Profile Information */}
                <div className="profile-info">
                    <div className="profile-header">
                        <h2>Profile Information</h2>
                        {!isEditing && (
                            <button className="edit-btn" onClick={handleEdit}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {saveMessage && (
                        <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
                            {saveMessage}
                        </div>
                    )}

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
                            <label>First Name:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="first_name"
                                    value={editData.first_name}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                <span>{user?.first_name && user.first_name.trim() ? user.first_name : 'Not set'}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <label>Last Name:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="last_name"
                                    value={editData.last_name}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                <span>{user?.last_name && user.last_name.trim() ? user.last_name : 'Not set'}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <label>Role:</label>
                            <span className="role-badge user">User</span>
                        </div>
                        <div className="profile-field">
                            <label>Account Status:</label>
                            <span className="status-badge active">Active</span>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="edit-actions">
                            <button className="save-btn" onClick={handleSave}>
                                Save Changes
                            </button>
                            <button className="cancel-btn" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* User Stats */}
                <div className="user-stats">
                    <h2>Your Activity</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🏔️</div>
                            <div className="stat-number">0</div>
                            <div className="stat-label">Treks Completed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">❤️</div>
                            <div className="stat-number">0</div>
                            <div className="stat-label">Favorite Treks</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📅</div>
                            <div className="stat-number">0</div>
                            <div className="stat-label">Days Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
