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
    { name: 'Account & Security', path: '/account/security' },
    { name: 'Dietary Restrictions', path: '/account/dietary' },
    { name: 'Preferences', path: '/account/preferences' },
    { name: 'Food History / Foodprints', path: '/account/history' },
    { name: 'Logout', path: '/'},
  ];

  //load the user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError('');

      const username = localStorage.getItem('username');

      if (!username) {
        setError('Please log in to view your account');
        navigate('/login');
        return;
      }

      try {
        
        const response = await fetch(
          `http://localhost:8080/account/${username}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load account data');
        }

        setUser({
          name: data.username,
          email: data.email,
          avatar: data.profilePhoto || '/assets/icons8-crab-50.png', // Default avatar
          username: data.username
        });
        setIsLoading(false);

      } catch (error) {
        setError('Failed to load account. Please try again.');
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);
  

  // Show loading message
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
          {/*button to reload the page if loading data fails*/}
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
