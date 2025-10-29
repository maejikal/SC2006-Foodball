import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="logo">
        2manyfoods
      </Link>
      <ul className="navLinks">
        <li><Link to="/FaqPage">faq & contact</Link></li>
        <li><Link to="/login">login</Link></li>
      </ul>
    </nav>
  );
}