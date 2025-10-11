import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import backgroundImage from '../assets/images/background.png';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: ''
    });
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            API.get('user/profile/')
                .then((response) => {
                    setUser(response.data);
                    // If already logged in, redirect to home or return URL
                    const returnUrl = sessionStorage.getItem('returnUrl') || '/';
                    sessionStorage.removeItem('returnUrl');
                    navigate(returnUrl);
                })
                .catch((error) => {
                    console.log('User not authenticated:', error);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                });
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validate form data
        if (!isLogin) {
            if (!formData.username || !formData.first_name || !formData.last_name || !formData.email || !formData.password) {
                setMessage('Please fill in all required fields');
                return;
            }
        } else {
            if (!formData.username || !formData.password) {
                setMessage('Please fill in username and password');
                return;
            }
        }

        try {
            if (isLogin) {
                // Login
                const response = await fetch('http://localhost:8000/auth/jwt/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Login failed');
                }
                
                const data = await response.json();
                
                const { access, refresh } = data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                
                // Get user profile
                const userResponse = await API.get('user/profile/', {
                    headers: { Authorization: `Bearer ${access}` }
                });
                setUser(userResponse.data);
                setMessage('Login successful!');
                
                // Navigate back to the previous page or home
                const returnUrl = sessionStorage.getItem('returnUrl') || '/';
                sessionStorage.removeItem('returnUrl');
                navigate(returnUrl);
                
                if (onAuthSuccess) {
                    onAuthSuccess(userResponse.data);
                }
            } else {
                // Register
                console.log('Registration data being sent:', formData);
                
                const response = await fetch('http://localhost:8000/auth/users/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.log('Registration error:', errorData);
                    
                    // Handle specific validation errors
                    if (errorData.username && errorData.username.includes('already exists')) {
                        const suggestedUsername = `${formData.username}${Math.floor(Math.random() * 1000)}`;
                        throw new Error(`Username already exists. Try: ${suggestedUsername}`);
                    }
                    if (errorData.email && errorData.email.includes('already exists')) {
                        throw new Error('Email already exists. Please use a different email address.');
                    }
                    if (errorData.username) {
                        throw new Error(`Username error: ${errorData.username[0]}`);
                    }
                    if (errorData.email) {
                        throw new Error(`Email error: ${errorData.email[0]}`);
                    }
                    if (errorData.password) {
                        throw new Error(`Password error: ${errorData.password[0]}`);
                    }
                    
                    throw new Error(JSON.stringify(errorData) || 'Registration failed');
                }
                setMessage('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (error) {
            setMessage(error.message || error.response?.data?.detail || 'An error occurred');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setMessage('Logged out successfully!');
    };

    return (
        <div 
            className="auth-container"
            style={{ '--background-image': `url(${backgroundImage})` }}
        >
            {/* Navigation Bar */}
            <nav className="auth-nav">
                <div className="nav-links">
                    <button className="nav-link" onClick={() => navigate('/')}>Home</button>
                    <button className="nav-link">Treks</button>
                    <button className="nav-link active">Login / Register</button>
                </div>
            </nav>


            {/* Auth Form */}
            <div className="auth-form-container">
                <h2 className="auth-title">
                    {isLogin ? 'Welcome Back' : 'Join TrekQuest Nepal'}
                </h2>
            
            {user && (
                <div className="user-info">
                    <h3>Welcome, {user.first_name}!</h3>
                    <p>Email: {user.email}</p>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            )}

            {message && (
                <div style={{ 
                    background: message.includes('successful') ? '#d4edda' : '#f8d7da',
                    color: message.includes('successful') ? '#155724' : '#721c24',
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '5px'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                    <>
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username (must be unique)"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email (must be unique)"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </>
                )}
                
                {isLogin && (
                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                )}
                
                <div className="form-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="btn-submit"
                >
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>
            
            <button 
                onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({
                        username: '',
                        password: '',
                        first_name: '',
                        last_name: '',
                        email: ''
                    });
                    setMessage('');
                }}
                className="btn-toggle"
            >
                {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
            
            {message && (
                <div className={`auth-message ${message.includes('successful') ? 'message-success' : 'message-error'}`}>
                    {message}
                </div>
            )}
            </div>
        </div>
    );
};

export default Auth;