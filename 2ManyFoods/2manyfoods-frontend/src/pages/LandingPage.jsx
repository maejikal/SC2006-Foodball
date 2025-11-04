import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuthenticatedNavbar from '../components/AuthenticatedNavbar';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in when component mounts
  useEffect(() => {
    const username = sessionStorage.getItem('username');
    setIsLoggedIn(!!username);
  }, []);
  
  return (
    <div className="page">
      {/* Show different navbar based on login status */}
      {isLoggedIn ? <AuthenticatedNavbar /> : <Navbar />}
      
      <section className="hero">
        <div className="heroText">
          <h1>Having trouble deciding what to eat?</h1>
          <p>
            Choosing what to eat shouldn't be stressful. 2manyfoods helps you discover, compare, and decide on meals quickly, whether you're eating alone or with a group. one of the key features is foodball (magic 8Ball but for food!)—your group food recommendation engine.
          </p>
        </div>
        <div className="foodIcons">
          <div className="foodIcon">🌮</div>
          <div className="foodIcon">🍟</div>
          <div className="foodIcon">🍖</div>
          <div className="foodIcon">🍕</div>
          <div className="foodIcon">🍰</div>
          <div className="foodIcon">🥩</div>
          <div className="foodIcon">🌯</div>
        </div>
      </section>

      <section className="foodball">
        <h2>Foodball</h2>
        <p>
          Instead of endless "i don't know, you choose," <br /> Foodball balances preferences, budgets, and hunger levels to suggest a fair option for the whole group.
        </p>
        <h3>How it works</h3>
        <ol>
          <li>Create a group – add friends via invite link</li>
          <li>Set your preferences</li>
          <li>Search nearby eateries</li>
          <li>Get recommendations – best options suggestions, balancing everyone's inputs</li>
          <li>Vote & finalize - group members can quickly vote, making decisions seamless</li>
        </ol>
      </section>

      <section className="features">
        <div className="featuresContent">
          <p>
            While foodball helps groups decide, 2manyfoods goes further:
          </p>
          <ul>
            <li>Personalized recommendations for solo diners</li>
            <li>Smart filters for health, price, and cuisine type</li>
            <li>Mobile-friendly design for on-the-go food discovery</li>
            <li>Keeps food consumption history so foodball can be even more personalised</li>
          </ul>
        </div>
        <div className="spinningWheel">
          <div className="wheel">
            <div className="wheelSegment" style={{background: '#ff6b9d'}}></div>
            <div className="wheelSegment" style={{background: '#c44dff'}}></div>
            <div className="wheelSegment" style={{background: '#4d7cff'}}></div>
            <div className="wheelSegment" style={{background: '#00d4ff'}}></div>
            <div className="wheelSegment" style={{background: '#00ff9d'}}></div>
            <div className="wheelSegment" style={{background: '#ffd93d'}}></div>
            <div className="wheelSegment" style={{background: '#ff8c42'}}></div>
            <div className="wheelSegment" style={{background: '#ff5757'}}></div>
            <div className="wheelCenter">
              <span>SPIN</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <h2>too many foods, one simple choice. get started now!</h2>
        {!isLoggedIn && (
          <div className="footerButtons">
            <Button text="sign up" variant="light" onClick={() => navigate("/signup")} />
            <Button text="login" variant="light" onClick={() => navigate("/login")} />
          </div>
        )}
      </footer>
    </div>
  );
}
