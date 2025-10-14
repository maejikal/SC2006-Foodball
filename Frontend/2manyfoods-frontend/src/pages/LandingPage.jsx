import React from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom'
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="page">
      <Navbar />
      <section className="hero">
        <div className="heroText">
          <h1>having trouble deciding what to eat?</h1>
          <p>
            choosing what to eat shouldn't be stressful. 2manyfoods helps you discover, compare, and decide on meals quickly, whether you're eating alone or with a group. one of the key features is foodball (magic 8Ball but for food!)—your group food recommendation engine.
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
          instead of endless "i don't know, you choose," <br /> foodball balances preferences, budgets, and hunger levels to suggest a fair option for the whole group.
        </p>
        <h3>how it works</h3>
        <ol>
          <li>create a group – add friends via username or invite link</li>
          <li>set your preferences</li>
          <li>drop a pin – search nearby eateries</li>
          <li>get recommendations – best options suggestions, balancing everyone's inputs</li>
          <li>vote & finalize - group members can quickly vote, making decisions seamless</li>
        </ol>
      </section>

      <section className="features">
        <div className="featuresContent">
          <p>
            while foodball helps groups decide, 2manyfoods goes further:
          </p>
          <ul>
            <li>personalized recommendations for solo diners</li>
            <li>smart filters for health, price, and cuisine type</li>
            <li>mobile-friendly design for on-the-go food discovery</li>
            <li>keeps food consumption history so foodball can be even more personalised</li>
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
        <div className="footerButtons">
          <Button text="sign up" onClick={() => navigate("/signup")} />
          <Button text="login" variant="light" onClick={() => navigate("/login")} />
        </div>
      </footer>
    </div>
  );
}