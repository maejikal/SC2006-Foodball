import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './LeaderLocationPage.css';

export default function LeaderLocationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupName = location.state?.groupName || 'supper';
  const groupId = location.state?.groupId;
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const broadcastLocationSelection = (locationData) => {
    console.log('Broadcasting location selection:', locationData);
    // TODO: Implement WebSocket broadcast
  };

  const handleLocationClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectedLocation({ 
      x, 
      y, 
      name: searchQuery || 'Selected Location' 
    });
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      broadcastLocationSelection(selectedLocation);
      navigate('/foodball/in-progress', { 
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
        <h1>{groupName} is selecting location</h1>
        <p>Select the area where you want to find food</p>

        {/* Search Bar */}
        <form className="searchBarContainer" onSubmit={handleSearch}>
          <div className="searchBar">
            <svg 
              className="searchIcon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              type="text"
              placeholder="Search for a location (e.g. NTU, Jurong East)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clearBtn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="searchBtn">
            Search
          </button>
        </form>

        {/* Map Section */}
        <div className="mapSection">
          <div className="mapWrapper" onClick={handleLocationClick}>
            <div className="placeholderMap">
              Click on the map to select location
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
