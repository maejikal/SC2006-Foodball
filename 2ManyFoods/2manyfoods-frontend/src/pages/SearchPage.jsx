import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import './SearchPage.css';

const dummyRestaurants = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    name: 'Cheongsujeong Korean Kitchen',
    address: '1 Jurong West Central 2, #03-34',
    priceRange: '$10-20',
    priceLevel: 'medium',
    statusText: "You've never eaten here before!",
    visited: false
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    name: 'Jalan Bahar Japanese & Korean Cuisine',
    address: '9 Jurong West Ave 5, #01-09',
    priceRange: '<$10',
    priceLevel: 'low',
    statusText: "You've never eaten here before!",
    visited: false
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    name: 'JIN.JJA Chicken',
    address: '3 Gateway Dr, #02-05 Westgate',
    priceRange: '$10-20',
    priceLevel: 'medium',
    statusText: "You ate here 1 month ago!",
    visited: true
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    name: 'Yakiniku-GO',
    address: '1 Jurong West Central 2, #B1-55',
    priceRange: '$20-30',
    priceLevel: 'high',
    statusText: "You've never eaten here before!",
    visited: false
  },
];

export default function SearchPage() {
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    rank1: '',
    rank2: '',
    rank3: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Available cuisines for Meal (always displayed)
  const mealCuisines = ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'];

  // Load user's saved preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        //api call
        setTimeout(() => {
          const preferences = {
            rank1: 'italian',
            rank2: 'japanese',
            rank3: 'korean'
          };
          setUserPreferences(preferences);
          setSelectedCuisines([
            preferences.rank1,
            preferences.rank2,
            preferences.rank3
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, []);

  // Get dynamic ranking based on position in selectedCuisines array
  const getCuisineRank = (cuisine) => {
    const index = selectedCuisines.indexOf(cuisine.toLowerCase());
    if (index === -1) return null;
    return index + 1;
  };

  // Always maintain exactly 3 selections
  const toggleCuisine = (cuisine) => {
    const lowerCuisine = cuisine.toLowerCase();
    
    if (selectedCuisines.includes(lowerCuisine)) {
      // Don't allow unselecting if it would go below 3
      if (selectedCuisines.length <= 3) {
        return;
      }
    } else {
      // Always add as #1 and drop the last one if needed
      if (selectedCuisines.length >= 3) {
        // Already 3 selected - replace the oldest (#3)
        setSelectedCuisines([lowerCuisine, ...selectedCuisines.slice(0, 2)]);
      } else {
        // Less than 3 - just add to front
        setSelectedCuisines([lowerCuisine, ...selectedCuisines]);
      }
    }
  };

  const handleConfirmChoice = async () => {
    if (selectedCuisines.length !== 3) {
      alert('Please select exactly 3 cuisines');
      return;
    }

    const username = localStorage.getItem('username');
    
    if (!username) {
      alert('Please log in to save preferences');
      return;
    }

    setIsSaving(true);

    try {
      const requestBody = {
        username: username,
        preferences: {
          rank1: selectedCuisines[0],
          rank2: selectedCuisines[1],
          rank3: selectedCuisines[2]
        },
        budget: priceRange
      };

      const response = await fetch('http://localhost:8080/account/cuisine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      setUserPreferences({
        rank1: selectedCuisines[0],
        rank2: selectedCuisines[1],
        rank3: selectedCuisines[2]
      });

      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="searchPage">
        <Navbar />
        <div className="searchContent">
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            Loading your preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="searchPage">
      <Navbar />

      <div className="searchContent">
        <div className="searchTop">
          {/* Map Container */}
          <div className="mapContainer">
            <img 
              src="https://maps.googleapis.com/maps/api/staticmap?center=Singapore&zoom=12&size=600x400&key=YOUR_API_KEY" 
              alt="Map"
            />
          </div>

          {/* Filters Section */}
          <div className="filtersSection">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Meal Preferences</h3>

            {/* Cuisine Tags - Always visible */}
            <div className="cuisineTags">
              {mealCuisines.map((cuisine) => {
                const rank = getCuisineRank(cuisine);
                const isSelected = selectedCuisines.includes(cuisine.toLowerCase());
                
                return (
                  <button
                    key={cuisine}
                    className={`cuisineTag ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                    {rank && <span className="rankBadge">{rank}</span>}
                  </button>
                );
              })}
            </div>

            {/* Price Range Slider */}
            <div className="priceSliderSection">
              <h3>Price Range: ${priceRange}</h3>
              <input
                type="range"
                min="0"
                max="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="slider"
              />
              <div className="priceLabels">
                <span>0</span>
                <span>100+</span>
              </div>
            </div>

            {/* Confirm Button - Capitalized */}
            <button 
              className="confirmBtn"
              onClick={handleConfirmChoice}
              disabled={selectedCuisines.length !== 3 || isSaving}
            >
              {isSaving ? 'Saving...' : 'Confirm Choice'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="searchBarContainer">
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
              placeholder="Search for restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Restaurant List */}
        <div className="restaurantList">
          {dummyRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurantCard">
              <img 
                src={restaurant.image} 
                alt={restaurant.name}
                className="restaurantImage"
              />
              <div className="restaurantInfo">
                <h3>{restaurant.name}</h3>
                <p className="address">{restaurant.address}</p>
                <p className={`price ${restaurant.priceLevel}`}>
                  {restaurant.priceRange}
                </p>
                <p className={`status ${restaurant.visited ? 'visited' : ''}`}>
                  {restaurant.statusText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
