import React, { useState } from 'react';
import API from '../services/api';

const Auth = () => {
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
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            
            {user && (
                <div style={{ background: '#e8f5e8', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
                    <h3>Welcome, {user.first_name}!</h3>
                    <p>Email: {user.email}</p>
                    <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>
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

            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username (must be unique)"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email (must be unique)"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                            />
                        </div>
                    </>
                )}
                
                {isLogin && (
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                        />
                    </div>
                )}
                
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                    />
                </div>
                
                <button 
                    type="submit" 
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        background: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        marginBottom: '10px'
                    }}
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
                style={{ 
                    width: '100%', 
                    padding: '8px', 
                    background: 'transparent', 
                    color: '#007bff', 
                    border: '1px solid #007bff', 
                    borderRadius: '5px'
                }}
            >
                {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
        </div>
    );
};

export default Auth;