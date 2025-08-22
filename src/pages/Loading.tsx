import React from 'react';
import '../styles/styleLoading.css';
import logo from '../assets/engkid_logo-Photoroom.png';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="logo-container">
          <img src={logo} alt="EngKid Logo" className="loading-logo" />
          <div className="logo-glow"></div>
        </div>
        <div className="spinner-container">
          <div className="spinner"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">{message}</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
