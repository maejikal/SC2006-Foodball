import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthenticatedNavbar.css';

export default function AuthenticatedNavbar() {
  const navigate = useNavigate();

  const handleSearchClick = (e) => {
    e.preventDefault();
    const username = sessionStorage.getItem('username');
    if (!username) {
      alert('Please log in first');
      return;
    }
    navigate('/location', {
      state: {
        groupName: username,
        isIndividual: true
      }
    });
  };

  return (
    <nav className="auth-navbar">
      <Link to="/" className="logo">
        2manyfoods
      </Link>
      <ul className="nav-links">
        <li><a href="#" onClick={handleSearchClick}>search</a></li>
        <li><Link to="/groups">groups</Link></li>
        <li><Link to="/account">account</Link></li>
      </ul>
    </nav>
  );
}
