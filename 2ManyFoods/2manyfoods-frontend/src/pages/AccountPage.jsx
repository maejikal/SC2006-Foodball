import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import UserAvatar from '../components/UserAvatar';
import './AccountPage.css';

export default function AccountPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const settings = [
    { name: 'account & security', path: '/account/security' },
    { name: 'dietary preference', path: '/account/dietary' },
    { name: 'cuisine preference', path: '/account/cuisine' },
    { name: 'food history / foodprints', path: '/account/history' },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError('');

      try {
        
        //Api call

        setTimeout(() => {
          setUser({
            name: 'harry potter',
            email: 'harrypotter@gmail.com',
            avatar: '/assets/icons8-crab-50.png',
            username: 'harrypotter123'
          });
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Network error. Please try again.');
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="accountPage">
        <Navbar />
        <div className="accountContent">
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="accountPage">
        <Navbar />
        <div className="accountContent">
          <div 
            className="errorMessage" 
            style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="accountPage">
      <Navbar />
      <div className="accountContent">
        <UserAvatar src={user.avatar} alt={user.name} size={100} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <div className="settingsList">
          {settings.map((s) => (
            <div
              key={s.name}
              className="settingItem"
              onClick={() => navigate(s.path)}
            >
              <p>{s.name}</p>
              <span>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
