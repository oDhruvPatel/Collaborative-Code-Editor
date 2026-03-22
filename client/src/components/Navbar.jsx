import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './nav.css';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar-container">
      <nav className="nav-content">
        <Link to="/" className="logo-section">
          <span className="logo-icon">&lt;/&gt;</span>
          <span className="logo-text">CodeCast</span>
        </Link>

        {/* Action Buttons */}
        <div className="nav-actions">
          <Link
            to="/room"
            className={`nav-btn ${location.pathname === '/room' ? 'active' : ''}`}
          >
            Join Room
          </Link>
        </div>
      </nav>
    </header>
  );
}
