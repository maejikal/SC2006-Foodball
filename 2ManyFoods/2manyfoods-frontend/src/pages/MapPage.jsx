import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './MapPage.css';

export default function LeaderLocationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupName = location.state?.groupName || 'supper';
  const groupId = location.state?.groupId;
  const isGroupMode = !!groupId; // Check if this is group or individual mode
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const broadcastLocationSelection = (locationData) => {
    console.log('Broadcasting location selection:', locationData);
    // TODO: Implement WebSocket broadcast for group mode
  };

  const handleLocationClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectedLocation({
      x,
      y,
      name: searchQuery || 'Selected Location',
      // TODO: Add actual lat/lng from map API
      lat: null,
      lng: null
    });
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      if (isGroupMode) {
        broadcastLocationSelection(selectedLocation);
      }
      
      // Navigate to SearchPage with location data
      navigate('/search', {
        state: {
          groupName,
          groupId,
          location: selectedLocation
        }
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement actual location search using Google Maps API or similar
    console.log('Searching for:', searchQuery);
    alert(`Searching for: ${searchQuery}\n(Search functionality will be implemented with Maps API)`);
  };

  return (
    <div className="leaderLocationPage">
      <Navbar />
      
      <div className="leaderLocationContent">
        <h1>{isGroupMode ? groupName : 'Find Food'}</h1>
        <p>Select the area where you want to find food</p>

        {/* Search Bar */}
        <div className="searchBarContainer">
          <div className="searchBar">
            <span className="searchIcon">🔍</span>
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            {searchQuery && (
              <button 
                className="clearBtn" 
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
          <button className="searchBtn" onClick={handleSearch}>
            search
          </button>
        </div>

        {/* Map Section */}
        <div className="mapSection">
          <div className="mapWrapper" onClick={handleLocationClick}>
            <div className="placeholderMap">
              Click on the map to select a location
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
              <p>Location selected: {selectedLocation.name}</p>
              <button 
                className="confirmBtn" 
                onClick={handleConfirmLocation}
              >
                confirm location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
