import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './WaitingForLeaderPage.css';

export default function WaitingForLeaderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupName = location.state?.groupName;
  const groupId = location.state?.groupId;
  const [dots, setDots] = useState('');

  // Animated dots for "waiting" effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll for session start
  useEffect(() => {
    const pollSessionStart = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/foodball/status/${groupName}`);
        const data = await response.json();
        
        if (data.status === 'ready' && data.location) {
          // Leader has selected location! Navigate to SearchPage
          navigate('/search', {
            state: {
              groupName,
              groupId,
              location: data.location,
              isIndividual: false
            }
          });
        }
      } catch (error) {
        console.error('Error polling session:', error);
      }
    };
    
    const interval = setInterval(pollSessionStart, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [groupId, groupName, navigate]);

  return (
    <div className="waitingPage">
      <Navbar />
      <div className="waitingContent">
        <h1>{groupName}</h1>
        <p className="waitingText">
          Waiting for leader to select location{dots}
        </p>
        <div className="loadingSpinner"></div>
      </div>
    </div>
  );
}
