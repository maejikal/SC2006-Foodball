import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // or module

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="logo">2manyfoods</div>
      <ul className="navLinks">
        <li><Link to="/foodball">foodball</Link></li>
        <li><Link to="/contact">contact</Link></li>
        <li><Link to="/faq">faq</Link></li>
        <li><Link to="/login">login</Link></li>
      </ul>
    </nav>
  );
}
