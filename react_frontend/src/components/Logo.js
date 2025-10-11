import React from 'react';
import logo from '../assets/images/logo.png';
import './Logo.css';

const Logo = ({ 
    variant = 'default', 
    size = 'medium', 
    className = '', 
    onClick = null,
    showText = true,
    background = 'none' // 'none', 'light', 'dark', 'accent'
}) => {
    const logoSrc = logo;
    
    const sizeClasses = {
        small: 'logo-small',
        medium: 'logo-medium',
        large: 'logo-large',
        xlarge: 'logo-xlarge'
    };

    const backgroundClasses = {
        none: '',
        light: 'logo-bg-light',
        dark: 'logo-bg-dark',
        accent: 'logo-bg-accent'
    };

    const logoClass = `logo ${sizeClasses[size]} ${backgroundClasses[background]} ${className}`.trim();

    return (
        <div 
            className={logoClass}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <img 
                src={logoSrc} 
                alt="TrekQuest Nepal" 
                className="logo-image"
            />
            <div className="logo-text">
                <span className="logo-main">TREKQUEST</span>
                <span className="logo-sub">NEPAL</span>
            </div>
        </div>
    );
};

export default Logo;
