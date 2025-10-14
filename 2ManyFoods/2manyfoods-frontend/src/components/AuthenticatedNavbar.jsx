import React from 'react';
import './AuthenticatedNavbar.css';

export default function AuthenticatedNavbar() {
  return (
    <nav className="auth-navbar">
      <div className="logo">2manyfoods</div>
      <ul className="nav-links">
        <li><a href="/dashboard">dashboard</a></li>
        <li><a href="/search">search</a></li>
        <li><a href="/groups">groups</a></li>
        <li><a href="/account">account</a></li>
      </ul>
    </nav>
  );
}
