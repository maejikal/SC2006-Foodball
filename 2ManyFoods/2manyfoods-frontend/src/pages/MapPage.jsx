import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './MapPage.css';

export default function LeaderLocationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupName = location.state?.groupName || 'supper';
  const groupId = location.state?.groupId;
  const isIndividual = location.state?.isIndividual || false;
  const isGroupMode = !!groupId;
  
  // Default to NTU location
  const [selectedLocation] = useState({
    name: 'NTU',
    latLng: {
      lat: 1.3483,
      lng: 103.6831
    }
  });

  // Auto-navigate to search page with NTU location
  useEffect(() => {
    // Small delay to show the page briefly before navigating
    const timer = setTimeout(() => {
      navigate('/search', {
        state: {
          groupName,
          groupId,
          location: selectedLocation,
          isIndividual
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate, groupName, groupId, selectedLocation, isIndividual]);

  return (
    <div className="leaderLocationPage">
      <Navbar />
      
      <div className="leaderLocationContent">
        <h1>{isGroupMode && !isIndividual ? groupName : 'Find Food'}</h1>
        <p>Setting location to NTU...</p>

        <div className="mapSection">
          <div className="mapWrapper">
            <div className="placeholderMap">
              <p style={{ fontSize: '1.2rem' }}>📍 NTU</p>
              <p style={{ fontSize: '0.9rem', color: '#999' }}>
                Coordinates: 1.3483, 103.6831
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
