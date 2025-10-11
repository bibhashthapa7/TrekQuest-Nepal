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
    const [trekkingEditData, setTrekkingEditData] = useState({
        phone_number: '',
        date_of_birth: '',
        bio: '',
        trekking_experience: 'beginner',
        fitness_level: 'moderate'
    });
    const [isEditingTrekking, setIsEditingTrekking] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isSticky, setIsSticky] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        
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
                
                // Set trekking profile data
                if (userData.profile) {
                    setTrekkingEditData({
                        phone_number: userData.profile.phone_number || '',
                        date_of_birth: userData.profile.date_of_birth || '',
                        bio: userData.profile.bio || '',
                        trekking_experience: userData.profile.trekking_experience || 'beginner',
                        fitness_level: userData.profile.fitness_level || 'moderate'
                    });
                }
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

    const handleTrekkingEdit = () => {
        setIsEditingTrekking(true);
        setSaveMessage('');
    };

    const handleTrekkingCancel = () => {
        setIsEditingTrekking(false);
        setSaveMessage('');
        // Reset trekkingEditData to current profile data
        if (user?.profile) {
            setTrekkingEditData({
                phone_number: user.profile.phone_number || '',
                date_of_birth: user.profile.date_of_birth || '',
                bio: user.profile.bio || '',
                trekking_experience: user.profile.trekking_experience || 'beginner',
                fitness_level: user.profile.fitness_level || 'moderate'
            });
        }
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

    const handleTrekkingInputChange = (e) => {
        const { name, value } = e.target;
        setTrekkingEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTrekkingSave = async () => {
        setSaveMessage('');
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/auth');
                return;
            }

            const response = await fetch('http://localhost:8000/api/user/profile/update/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trekkingEditData),
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                // Update the user state with the new profile data
                setUser(prevUser => ({
                    ...prevUser,
                    profile: updatedProfile
                }));
                setIsEditingTrekking(false);
                setSaveMessage('Trekking profile updated successfully!');
            } else {
                const errorData = await response.json();
                setSaveMessage(`Failed to update trekking profile: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating trekking profile:', error);
            setSaveMessage('Failed to update trekking profile.');
        }
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

                const response = await fetch('http://localhost:8000/auth/users/me/', {
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
            <Navigation activePage="profile" isSticky={isSticky} />

            {/* User Header */}
            <div className="user-header">
                <div className="user-header-section">
                    <div className="user-header-content">
                        <h1 className="user-title">User Profile</h1>
                        <p className="user-subtitle">Welcome back, {user?.first_name && user.first_name.trim() ? user.first_name : user?.username}</p>
                        <button className="user-logout-btn" onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>
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
                        {/* Row 1: Username and Email */}
                        <div className="profile-row">
                            <div className="profile-field">
                                <label>Username:</label>
                                <span>{user?.username}</span>
                            </div>
                            <div className="profile-field">
                                <label>Email:</label>
                                <span>{user?.email}</span>
                            </div>
                        </div>
                        
                        {/* Row 2: First Name and Last Name */}
                        <div className="profile-row">
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

                {/* Trekking Profile Section */}
                <div className="trekking-profile">
                    <div className="trekking-profile-header">
                        <h2>Trekking Profile</h2>
                        {!isEditingTrekking && (
                            <button className="edit-btn" onClick={handleTrekkingEdit}>
                                Edit Trekking Profile
                            </button>
                        )}
                    </div>

                    {saveMessage && (
                        <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
                            {saveMessage}
                        </div>
                    )}

                    <div className="trekking-profile-details">
                        {/* Row 1: Phone Number and Date of Birth */}
                        <div className="profile-row">
                            <div className="profile-field">
                                <label>Phone Number:</label>
                                {isEditingTrekking ? (
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={trekkingEditData.phone_number}
                                        onChange={handleTrekkingInputChange}
                                        className="profile-input"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <span>{user?.profile?.phone_number || 'Not set'}</span>
                                )}
                            </div>
                            
                            <div className="profile-field">
                                <label>Date of Birth:</label>
                                {isEditingTrekking ? (
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={trekkingEditData.date_of_birth}
                                        onChange={handleTrekkingInputChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <span>{user?.profile?.date_of_birth || 'Not set'}</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Row 2: Trekking Experience and Fitness Level */}
                        <div className="profile-row">
                            <div className="profile-field">
                                <label>Trekking Experience:</label>
                                {isEditingTrekking ? (
                                    <select
                                        name="trekking_experience"
                                        value={trekkingEditData.trekking_experience}
                                        onChange={handleTrekkingInputChange}
                                        className="profile-input"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                ) : (
                                    <span className="experience-badge">
                                        {user?.profile?.trekking_experience ? 
                                            user.profile.trekking_experience.charAt(0).toUpperCase() + 
                                            user.profile.trekking_experience.slice(1) : 'Not set'}
                                    </span>
                                )}
                            </div>
                            
                            <div className="profile-field">
                                <label>Fitness Level:</label>
                                {isEditingTrekking ? (
                                    <select
                                        name="fitness_level"
                                        value={trekkingEditData.fitness_level}
                                        onChange={handleTrekkingInputChange}
                                        className="profile-input"
                                    >
                                        <option value="low">Low</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="high">High</option>
                                        <option value="very_high">Very High</option>
                                    </select>
                                ) : (
                                    <span className="fitness-badge">
                                        {user?.profile?.fitness_level ? 
                                            user.profile.fitness_level.charAt(0).toUpperCase() + 
                                            user.profile.fitness_level.slice(1).replace('_', ' ') : 'Not set'}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Row 3: Bio (full width) */}
                        <div className="profile-row bio-row">
                            <div className="profile-field bio-field">
                                <label>Bio:</label>
                                {isEditingTrekking ? (
                                    <textarea
                                        name="bio"
                                        value={trekkingEditData.bio}
                                        onChange={handleTrekkingInputChange}
                                        className="profile-textarea"
                                        placeholder="Tell us about your trekking interests and experience..."
                                        rows="4"
                                    />
                                ) : (
                                    <span className="bio-text">
                                        {user?.profile?.bio || 'No bio provided'}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {isEditingTrekking && (
                            <div className="edit-actions">
                                <button className="save-btn" onClick={handleTrekkingSave}>
                                    Save Changes
                                </button>
                                <button className="cancel-btn" onClick={handleTrekkingCancel}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
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

export default UserProfile;
