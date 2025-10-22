import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './LeaderLocationPage.css';

export default function LeaderLocationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupName = location.state?.groupName || 'supper';
  const groupId = location.state?.groupId;

  const [selectedLocation, setSelectedLocation] = useState(null);

  // TODO: Replace with actual WebSocket connection
  const broadcastLocationSelection = (locationData) => {
    // This should send the location to all group members via WebSocket
    console.log('Broadcasting location selection:', locationData);
    
    // Mock WebSocket broadcast:
    // socket.emit('location-selected', { groupId, location: locationData });
  };

  const handleLocationClick = (e) => {
    // Get click coordinates on map (mock implementation)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectedLocation({ x, y, name: 'Selected Location' });
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      // Broadcast to all members
      broadcastLocationSelection(selectedLocation);
      
      // Navigate to InProgressPage
      navigate('/foodball/in-progress', {
        state: {
          groupName,
          groupId,
          location: selectedLocation
        }
      });
    }
  };

  return (
    <div className="leaderLocationPage">
      <Navbar />
      <div className="leaderLocationContent">
        <h1>choose location</h1>
        <p>Select the area where you want to find food</p>

        <div className="mapSection">
          <div className="mapWrapper" onClick={handleLocationClick}>
            {/* Replace with actual map component (Google Maps, Mapbox, etc.) */}
            <div className="placeholderMap">
              <p>Click on the map to select location</p>
              {selectedLocation && (
                <div 
                  className="locationMarker"
                  style={{
                    left: `${selectedLocation.x}px`,
                    top: `${selectedLocation.y}px`
                  }}
                />
              )}
            </div>
          </div>

          {selectedLocation && (
            <div className="locationInfo">
              <p>Location selected</p>
              <button className="confirmBtn" onClick={handleConfirmLocation}>
                confirm location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
