import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/global.css';
import headerLogo from '../assets/images/header-logo.jpg';

function Header({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className="main-header">
      <Link to="/" className="logo-link">
        <img
          src={headerLogo}
          alt="NearPet Logo"
          className="header-logo-img"
        />
      </Link>

      <div className="nav-links">
        <Link to="/gallery">Gallery</Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="admin-link">
            Admin
          </Link>
        )}
        {user ? (
          <>
            <span className="welcome-text">{user.name || user.username}</span>
            <button onClick={handleLogout} className="auth-btn logout" type="button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="auth-btn login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Header;
