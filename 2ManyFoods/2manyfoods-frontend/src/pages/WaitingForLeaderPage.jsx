import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './WaitingForLeaderPage.css';

export default function WaitingForLeaderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupName = location.state?.groupName || 'supper';
  const groupId = location.state?.groupId;

  useEffect(() => {
    // TODO: Set up WebSocket listener for location selection
    // When leader selects location, all members should be redirected
    
    // Mock WebSocket listener:
    // socket.on('location-selected', (data) => {
    //   if (data.groupId === groupId) {
    //     navigate('/foodball/in-progress', {
    //       state: {
    //         groupName,
    //         groupId,
    //         location: data.location
    //       }
    //     });
    //   }
    // });

    // For testing: Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/foodball/in-progress', {
        state: { groupName, groupId }
      });
    }, 10000);

    return () => {
      clearTimeout(timer);
      // Clean up WebSocket listener
      // socket.off('location-selected');
    };
  }, [navigate, groupName, groupId]);

  return (
    <div className="waitingPage">
      <Navbar />
      <div className="waitingContent">
        <div className="spinningGlobe">
          <img 
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDU1Y2dyNzdxamt0dzR0bjA1OG92MGx0NjRrNWpnM3VpNWNkbHQ4eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VI2UC13hwWin1MIfmi/giphy.gif" 
            alt="Rotating Earth Globe"
            className="globeImage"
          />
        </div>
        <h1>Leader is choosing the location</h1>
        <p>Please wait while the group leader selects where to find food...</p>
      </div>
    </div>
  );
}